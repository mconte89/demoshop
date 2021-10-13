package applica.api.services.impl;

import applica.api.domain.model.Filters;
import applica.api.domain.model.StringifiedCodedEntity;
import applica.api.domain.utils.ClassUtils;
import applica.api.services.utils.RepositoryUtils;
import applica.framework.*;
import applica.framework.library.options.OptionsManager;
import applica.framework.security.CodeGeneratorService;
import applica.framework.security.EntityService;
import applica.framework.widgets.annotations.Materialization;
import applica.framework.widgets.factory.OperationsFactory;
import org.apache.commons.beanutils.PropertyUtils;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static applica.api.domain.utils.ClassUtils.getField;


@Service
public class EntityServiceImpl implements EntityService {

    @Autowired
    private OptionsManager optionsManager;

    @Autowired
    private OperationsFactory operationsFactory;

    @Override
    public boolean isUnique(Class<? extends Entity> entityClass, String fieldName, Object fieldValue, Entity entity) {
        return isUnique(entityClass, fieldName, fieldValue, entity, null);
    }

    @Override
    public boolean isUnique(Class<? extends Entity> entityClass, String fieldName, Object fieldValue, Entity entity, Query query) {
        Object propertyValue = fieldValue != null ? fieldValue : getPropertyWrapper(entity, fieldName);
        if (propertyValue == null || !StringUtils.hasLength(propertyValue.toString()))
            return true;
        if (query == null) {
            query = Query.build();
        }

        query.getFilters().add(new Filter(fieldName, propertyValue, Filter.EQ));

        Entity duplicated = Repo.of(entityClass).find(query).findFirst().orElse(null);
        return duplicated == null || Objects.equals(duplicated.getId(), entity.getId());
    }


    private Object getPropertyWrapper(Object bean, String property) {
        try {
            return PropertyUtils.getProperty(bean, property);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void setPropertyWrapper(Object bean, String property, Object value) {
        try {
            PropertyUtils.setProperty(bean, property, value);
        } catch (Exception e) {

        }
    }
    @Override
    public void materializePropertyFromId(List<? extends Entity> rows, String idProperty) {

        if (rows != null && rows.size() > 0) {
            try {
                Field field = getField(rows.get(0).getClass(), idProperty);
                String entityProperty = field.getAnnotation(Materialization.class).entityField();
                materializePropertyFromId(rows, idProperty, entityProperty);
            } catch (Exception e) {
                e.printStackTrace();
            }

        }
    }

    public void materializePropertyFromId(List<? extends Entity> rows, String idProperty, String entityProperty) {
        try {
            if (rows.size() == 0)
                return;
            Field idPropertyField = getField(rows.get(0).getClass(), idProperty); //Field della property contenente l'id
            Field propertyField =  getField(rows.get(0).getClass(), entityProperty);  //Field della property che conterrà l'entità "materializzata"

            rows.stream().filter(i -> getFieldMaterializationEntityType(idPropertyField, propertyField , i) != null).collect(Collectors.groupingBy(i -> getFieldMaterializationEntityType(idPropertyField, propertyField , i))).forEach((entityClass, list) -> {
                List<ObjectId> objectIds = rows.stream()
                        .filter(d -> getPropertyWrapper(d, idProperty) != null)
                        .map(d -> {
                                    List<Object> ids = new ArrayList<>();
                                    Class propertyClass = getPropertyType(d, idProperty);
                                    if (List.class.isAssignableFrom(propertyClass)) {
                                        ids.addAll(((List) getPropertyWrapper(d, idProperty)));
                                    } else
                                        ids.add(getPropertyWrapper(d, idProperty));

                                    return ids.stream().filter(id -> ObjectId.isValid(id.toString())).map(id -> new ObjectId(id.toString())).collect(Collectors.toList());
                                }

                        )
                        .flatMap(Collection::stream)
                        .distinct().collect(Collectors.toList());

                List types = Repo.of(entityClass)
                        .find(
                                Query.build()
                                        .in(Filters.REPOSITORY_ID, objectIds))
                        .getRows();
                list.forEach(d -> setPropertyWrapper(d, entityProperty, getPropertyValue(types, d, idProperty)));
            });
        } catch (Exception e) {
            e.printStackTrace();

        }
    }

    public static Class getFieldMaterializationEntityType(Field idPropertyField, Field entityPropertyField, Entity entity) {
        if (idPropertyField.getAnnotation(Materialization.class) != null && StringUtils.hasLength(idPropertyField.getAnnotation(Materialization.class).generateEntityClass())) {
            return (Class) ClassUtils.invokeMethodOnObject(entity, idPropertyField.getAnnotation(Materialization.class).generateEntityClass());
        }
        if (List.class.isAssignableFrom(entityPropertyField.getType())) {
            ParameterizedType integerListType = (ParameterizedType) entityPropertyField.getGenericType();
            return (Class) integerListType.getActualTypeArguments()[0];
        } else
            return entityPropertyField.getType();

    }

    private Object getPropertyValue(List types, Entity d, String idProperty) {
        try {
            Class propertyClass = getPropertyType(d, idProperty);
            if (List.class.isAssignableFrom(propertyClass)) {
                List property = (List) getPropertyWrapper(d, idProperty);
                return types.stream().filter(t -> property != null && property.contains(((Entity) t).getId())).collect(Collectors.toList());

            } else
                return types.stream().filter(t -> Objects.equals(((Entity) t).getId(), getPropertyWrapper(d, idProperty))).findFirst().orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;

    }

    public List<? extends Entity> getEntitiesFromIds(Class<? extends Entity> entityClass, List<String> ids) {
        if (ids == null || ids.size() == 0)
            return new ArrayList<>();
        return Repo.of(entityClass).find(Query.build().in(Filters.REPOSITORY_ID, RepositoryUtils.getRepositoryIdFromIds(ids))).getRows();
    }

    private Class getPropertyType(Object bean, String property) {
        try {
            return PropertyUtils.getPropertyType(bean, property);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    public static void checkStringCode(Entity entity) {
        if (entity instanceof StringifiedCodedEntity && !StringUtils.hasLength(((StringifiedCodedEntity) entity).getCode())) {
            ((CodeGeneratorServiceImpl) ApplicationContextProvider.provide().getBean(CodeGeneratorService.class)).generateAndSetCodeForCreation(((StringifiedCodedEntity) entity));
        }
    }
}
