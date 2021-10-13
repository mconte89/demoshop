package applica.api.domain.utils;

import applica.api.domain.model.Filters;
import applica.framework.widgets.annotations.Materialization;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.*;

public class ClassUtils  extends applica.framework.widgets.utils.ClassUtils {
    public interface ClassUtilsRunnable {
        void perform(Class component);
    }

    public static List<String> getKeys(ObjectNode node, boolean onlyWithValue) {
        List<String> fields = new ArrayList<>();

        if (node != null) {
            node.fields().forEachRemaining(f -> {
                if (!onlyWithValue || f.getValue() != null)
                    fields.add(f.getKey());
            });

        }

        return fields;
    }

    public static Object generateClassInstance(Class clazz) {
        try {
            return clazz.getConstructor().newInstance();
        } catch (Exception e) {
            return null;
        }
    }

    public static void performForAllSubclassesInModel(Class father, ClassUtilsRunnable runnable) {

        getAllSubclasses(father).forEach(c -> runnable.perform(c));
    }

    public static List<Class> getAllSubclasses(Class father) {
        ClassPathScanningCandidateComponentProvider provider = new ClassPathScanningCandidateComponentProvider(false);
        provider.addIncludeFilter(new AssignableTypeFilter(father));

        Set<BeanDefinition> components = provider.findCandidateComponents(Filters.class.getPackage().getName());


        List<Class> classes = new ArrayList<>();
        components.forEach(c -> {
            try {
                classes.add(Class.forName(c.getBeanClassName()));
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        });

        return classes;
    }

    public static Object duplicate(Object entity) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            String serialized = mapper.writeValueAsString(entity);
            return mapper.readValue(serialized, entity.getClass());
        } catch (Exception e) {
            return null;
        }
    }

    public static ObjectNode createEmptyObjectNode() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false);
        mapper.configure(DeserializationFeature.FAIL_ON_INVALID_SUBTYPE, false);
        mapper.configure(DeserializationFeature.FAIL_ON_MISSING_EXTERNAL_TYPE_ID_PROPERTY, false);
        mapper.configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, false);
        mapper.configure(DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES, false);
        mapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
        mapper.configure(DeserializationFeature.FAIL_ON_NUMBERS_FOR_ENUMS, false);
        mapper.configure(DeserializationFeature.FAIL_ON_READING_DUP_TREE_KEY, false);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(DeserializationFeature.FAIL_ON_UNRESOLVED_OBJECT_IDS, false);
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        return mapper.valueToTree(new Object());
    }

    public static Object invokeMethodOfEmptyClassInstance(Class objectClass, String method, Object... params) {
        try {

            Object entity = objectClass.getConstructor().newInstance();
            for (Method declaredMethod : objectClass.getMethods()) {
                if (declaredMethod.getName().equals(method)) {
                    Object r = declaredMethod.invoke(entity, params);
                    if (r != null)
                        return r;
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();

        }
        return null;
    }

    public static Object invokeMethodOnObject(Object entity, String method, Object... params) {
        try {

            for (Method declaredMethod : entity.getClass().getMethods()) {
                if (declaredMethod.getName().equals(method)) {
                    Object r = declaredMethod.invoke(entity, params);
                    if (r != null)
                        return r;
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();

        }
        return null;
    }


    public static Field getField(Class clazz, String fieldName) {
        return (Field) ClassUtils.getAllFields(clazz).stream().filter(f -> Objects.equals(((Field) f).getName(), fieldName)).findFirst().orElse(null);
    }
}
