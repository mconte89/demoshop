package applica.api.domain.validation.users;

import applica.api.domain.model.auth.User;
import applica.framework.library.mail.MailUtils;
import applica.framework.Entity;
import applica.framework.library.validation.ValidationResult;
import applica.framework.library.validation.Validator;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 05/11/13
 * Time: 18:26
 */
@Component
public class UserValidator implements Validator {

    @Override
    public void validate(Entity entity, ValidationResult validationResult) {
        User user = ((User) entity);

        if(!StringUtils.hasLength(user.getName())) { validationResult.reject("name", "validation.user.name"); }
        if(!MailUtils.isValid(user.getMail())) { validationResult.reject("name", "validation.user.mail"); }
    }

    @Override
    public Class getEntityType() {
        return User.class;
    }

}
