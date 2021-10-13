//package applica.api.services.authorizations.entities;
//
//
//import applica.api.domain.model.EntityList;
//import applica.api.domain.model.auth.CustomPermissions;
//import applica.api.services.authorizations.AuthorizationContexts;
//import applica.framework.security.Security;
//import applica.framework.security.User;
//import applica.framework.security.annotations.AuthorizationContext;
//import applica.framework.security.annotations.Permission;
//import applica.framework.security.authorization.AuthorizationException;
//import com.cerpero.domain.model.CustomPermissions;
//import com.cerpero.domain.model.EntityList;
//import com.cerpero.services.authorizations.AuthorizationContexts;
//import org.springframework.stereotype.Component;
//
//import static applica.api.services.authorizations.AuthorizationContexts.CUSTOM_ENTITY_PREFIX;
//import static applica.framework.security.authorization.BaseAuthorizationService.SUPERUSER_PERMISSION;
//import static com.cerpero.services.authorizations.AuthorizationContexts.CUSTOM_ENTITY_PREFIX;
//
///**
// * Created by antoniolovicario on 23/05/17.
// */
//@Component
//@AuthorizationContext(CUSTOM_ENTITY_PREFIX + EntityList.USER)
//public class UserAuthorizationContext {
//
//    @Permission(AuthorizationContexts.MANAGE)
//    public void canEditOrganization (User user, User userToEdit) throws AuthorizationException {
//
//        if (Security.with(user).isPermitted(SUPERUSER_PERMISSION)) {
//            return;
//        }
//
//
//        if (userToEdit != null) {
//            //Se sono amministratore di organizzazione posso gestire un utente solo se......
//            if (Security.with(user).isPermitted(CustomPermissions.CUSTOMER_ADMIN)) {
//
//
//            }
//
//        }
//
//        throw new AuthorizationException();
//
//    }
//}
