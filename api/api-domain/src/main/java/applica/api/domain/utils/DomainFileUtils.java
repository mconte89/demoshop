package applica.api.domain.utils;

import applica.framework.Entity;
import applica.framework.widgets.entities.EntitiesRegistry;
import applica.framework.widgets.mapping.Attachment;
import org.apache.commons.beanutils.PropertyUtils;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;

public class DomainFileUtils {

    private static String generateRandomSuffix(Entity entity, String field) {
        try {
            String path =  getAttachmentProperty(entity, field);
            String[] s = path.split("/");
            return s[s.length - 1].split("\\.")[0].replace("_", "");
        } catch (Exception e) {
            return String.valueOf(new Date().getTime());
        }
    }

    public static String generateFilePathForEntity(Entity entity, String field) {
        return generateFilePathForEntity(entity, field, false);
    }

    public static String generateFilePathForEntity(Entity entity, String field, boolean forceAlsoIfFieldDoesntExist) {
        try {
            if (forceAlsoIfFieldDoesntExist || PropertyUtils.getProperty(entity, field) != null)
                return String.format("%s_%s_%s_%s", EntitiesRegistry.instance().get(entity.getClass()).get().getId(), entity.getId(), field, generateRandomSuffix(entity, field));
        } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String getAttachmentProperty(Entity entity, String field) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        Object obj = getFieldPath(entity, field);
        if (obj != null) {
            if (Attachment.class.isAssignableFrom(obj.getClass()) )
                return ((Attachment) obj).getPath();
            else if (obj instanceof String)
                return obj.toString();
        }
        return null;
    }

    public static Object getFieldPath(Entity entity, String field) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        return PropertyUtils.getProperty(entity, field);
    }


}
