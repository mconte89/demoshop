package applica.api.domain.model;

import applica.api.domain.model.auth.Role;

/**
 * Created by antoniolovicario on 18/10/17.
 */
public class Entities {


    // inserire i nomi di tutte le entità
    public static final String USER = "user";
    public static final String ROLE = "role";
    public static final String REVISION = "revision";
    public static final String TEMP_ATTACHMENT_ENTITY = "tempAttachmentEntity";
    public static final String GEO_CITY = "geoCity";
    public static final String GEO_PROVINCE = "geoProvince";
    public static final String MAIL_LOG = "mailLog";


    public static String [] getPermittedEntitiesByRole(String permission) {

        String [] permittedEntities;

        switch (permission) {

            case Role.ADMIN:
                permittedEntities = getAll();
                break;
            default:
                permittedEntities = new String[0];

        }

        return permittedEntities;

    }

    public static String[] getAll() {
        return new String[]{USER, ROLE, REVISION, GEO_CITY, GEO_PROVINCE};
    }
}
