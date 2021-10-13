package applica.api.runner.validation;


import applica.api.domain.model.auth.PasswordChange;
import applica.api.domain.model.auth.User;
import applica.api.services.AccountService;
import applica.framework.Entity;
import applica.framework.library.validation.ValidationResult;
import applica.framework.security.Security;
import applica.framework.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by antoniolovicario on 05/10/15.
 */
@Component
public class PasswordChangeValidator extends PasswordResetValidator {

    @Override
    public void validate(Entity entity, ValidationResult validationResult) {
        super.validate(entity, validationResult);
        PasswordChange passwordChange = (PasswordChange) entity;

        if (!StringUtils.hasLength(passwordChange.getCurrentPassword()))
            validationResult.reject("currentPassword", "validation.field.required");
        else if (!isNotCurrentPassword(passwordChange.getUser(), passwordChange.getCurrentPassword()))
            validationResult.reject("currentPassword", "validation.currentPassword.notValid");

    }

    @Override
    public Class getEntityType() {
        return PasswordChange.class;
    }

}


