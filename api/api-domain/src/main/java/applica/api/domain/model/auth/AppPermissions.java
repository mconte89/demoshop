package applica.api.domain.model.auth;


import applica.api.domain.model.auth.Role;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static applica.framework.security.authorization.BaseAuthorizationService.SUPERUSER_PERMISSION;

public class AppPermissions {
    public static final String ADMIN = SUPERUSER_PERMISSION;
    public static final String CAN_USE_WEBAPP = "usage:webapp";
    public static final String CAN_USE_MOBILE = "usage:mobileapp";
    public static final String RESET_USER_PASSWORD = "password:reset";


    public static List<String> getPermissionsByRole(String role) {
        switch (role) {
            case Role.ADMIN:
                return getAll();
        }
        return new ArrayList<>();
    }

    public static List<String> getAll(){
        return Arrays.asList(ADMIN, CAN_USE_WEBAPP, CAN_USE_MOBILE, RESET_USER_PASSWORD);
    }
}


