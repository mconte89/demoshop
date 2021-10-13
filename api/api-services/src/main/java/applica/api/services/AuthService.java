package applica.api.services;

import applica.api.services.exceptions.BadCredentialsException;
import applica.api.services.exceptions.UserLoginMaxAttemptsException;
import applica.framework.security.token.TokenFormatException;
import applica.framework.security.token.TokenGenerationException;

/**
 * Created by bimbobruno on 15/11/2016.
 */
public interface AuthService {
    /**
     * Executes a login into system and return auth token for rest clients
     * @param mail
     * @param password
     * @return Auth token
     */
    String token(String mail, String password) throws IllegalArgumentException, BadCredentialsException, TokenGenerationException, UserLoginMaxAttemptsException;

    /**
     * Returns a fresh token for current logged user
     * @param currentToken
     * @return
     */
    String freshToken(String currentToken) throws IllegalArgumentException, TokenFormatException, TokenGenerationException, BadCredentialsException, UserLoginMaxAttemptsException;
}
