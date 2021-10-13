package applica.api.runner.validation;


import applica.api.domain.model.auth.PasswordChange;
import applica.api.domain.model.auth.PasswordReset;
import applica.api.domain.model.auth.User;
import applica.api.services.AccountService;
import applica.framework.Entity;
import applica.framework.library.validation.ValidationResult;
import applica.framework.security.Security;
import applica.framework.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by antoniolovicario on 05/10/15.
 */
@Component
public class PasswordResetValidator implements applica.framework.library.validation.Validator  {

    public static final String PATTERN = "(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\\S+$).{8,20}";

    @Override
    public void validate(Entity entity, ValidationResult validationResult) {
        PasswordReset passwordChange = (PasswordReset) entity;

        if (!StringUtils.hasLength(passwordChange.getPassword())) {
            validationResult.reject("password", "validation.field.required");
        } else {

            if (!isValid(passwordChange.getPassword())) {
                validationResult.reject("password", "validation.password.pattern");
            }

            if (passwordChange.getUser().getPassword().equals(SecurityUtils.encryptAndGetPassword(passwordChange.getPassword()))) {
                validationResult.reject("password", "validation.password.different");
            }
        }
        if (!StringUtils.hasLength(passwordChange.getPasswordConfirm())) {
            validationResult.reject("passwordConfirm", "validation.field.required");
        }
        if (!passwordChange.getPassword().equals(passwordChange.getPasswordConfirm())) {
            validationResult.reject("passwordConfirm", "validation.user.password_confirm");
        }
    }

    public boolean isNotCurrentPassword(User user, String currentPassword) {
        try {
            Security.manualLogin(user.getUsername(), currentPassword);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isValid(String password) {
        Pattern p = Pattern.compile(PATTERN);
        Matcher m = p.matcher(password);
        return m.matches();
    }

    @Override
    public Class getEntityType() {
        return PasswordReset.class;
    }
}


