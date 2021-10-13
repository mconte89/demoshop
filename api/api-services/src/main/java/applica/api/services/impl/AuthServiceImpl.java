package applica.api.services.impl;

import applica.api.domain.data.UsersRepository;
import applica.api.domain.model.UserLoginAttempt;
import applica.api.domain.model.auth.User;
import applica.api.domain.utils.CustomDateUtils;
import applica.api.domain.utils.CustomLocalizationUtils;
import applica.api.services.AuthService;
import applica.api.services.UserService;
import applica.api.services.exceptions.BadCredentialsException;
import applica.api.services.exceptions.UserLoginMaxAttemptsException;
import applica.framework.security.Security;
import applica.framework.security.token.*;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

import static applica.api.domain.model.UserAttempt.WAITING_TIME_IN_SECONDS;

/**
 * Created by bimbobruno on 15/11/2016.
 */
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private UserService userService;

    @Override
    public String token(String mail, String password) throws IllegalArgumentException, BadCredentialsException, TokenGenerationException, UserLoginMaxAttemptsException {
        if (StringUtils.isEmpty(mail) || StringUtils.isEmpty(password)) {
            throw new IllegalArgumentException();
        }

        mail = mail.trim();

        if (mail.contains(",")) {
            mail = mail.split(",")[0].trim();
        }

        UserLoginAttempt attempt = userService.getUserLoginAttempts(mail);
        if (attempt.isLocked())
            throw new UserLoginMaxAttemptsException(CustomLocalizationUtils.getInstance().getMessage("error.maxLoginAttempts", String.valueOf(Math.abs(WAITING_TIME_IN_SECONDS - CustomDateUtils.getDifferenceInSeconds(attempt.getLastModified(), new Date())))));

        try {
            Security.manualLogin(mail.toLowerCase().trim(), password);
            userService.resetLoginFailAttempts(attempt);
        } catch (Exception e) {
            userService.updateLoginFailAttempts(attempt);
            throw new BadCredentialsException();
        }

        AuthTokenGenerator generator = new DefaultAuthTokenGenerator();

        User loggedUser = ((User) Security.withMe().getLoggedUser());

        if (!loggedUser.isActive()) {
            userService.updateLoginFailAttempts(attempt);
            throw new BadCredentialsException();
        }


        //Password has MD5 encoding and is stored into DB as MD5 but token must be generated with a clear password
        //to perform futures password checks so...
        String md5Password = loggedUser.getPassword();
        //set clear password to logged user to generate correct token
        loggedUser.setPassword(password);
        //generate token
        String token = generator.generateTokenWithDuration(loggedUser, generateTokenDurationForUser());
        //reset md5 password to logged user
        loggedUser.setPassword(md5Password);
        //update last login date
        loggedUser.setLastLogin(new Date());

        usersRepository.save(loggedUser);
        return token;
    }

    @Override
    public String freshToken(String currentToken) throws IllegalArgumentException, TokenFormatException, TokenGenerationException, BadCredentialsException, UserLoginMaxAttemptsException {
        if (StringUtils.isEmpty(currentToken)) {
            throw new IllegalArgumentException();
        }

        AuthTokenDataExtractor extractor = new DefaultAuthTokenDataExtractor();
        String username = extractor.getUsername(currentToken);
        String password = extractor.getPassword(currentToken);

        return token(username, password);
    }

    //TODO: esteso ad un mese
    private static final int TOKEN_MINUTE_DURATION = 30 * 1000;
    private long generateTokenDurationForUser() {
        //Durata: 30 minuti
        //return 60 * TOKEN_MINUTE_DURATION;
        return TokenExpirationTime.DURATION_IN_SECONDS;
    }
}
