package applica.api.runner.operations;

import applica.framework.Entity;
import applica.framework.widgets.factory.DefaultOperationsFactory;
import applica.framework.widgets.operations.*;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import java.util.Objects;

/**
 * Created by bimbobruno on 19/12/2016.
 */
public class CustomOperationsFactory extends DefaultOperationsFactory {

    @Autowired
    private ApplicationContext applicationContext;

    @Override
    public GetOperation createGet(Class<? extends Entity> entityType) {
        GetOperation getOperation = null;

        try {
            getOperation = applicationContext.getBeansOfType(GetOperation.class).values().stream()
                    .filter(r -> !(r instanceof CustomDefaultGetOperation))
                    .filter(r -> Objects.equals(r.getEntityType(), entityType))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchBeanDefinitionException("form processor " + entityType.getName()));
        } catch (NoSuchBeanDefinitionException e) {
            OperationDefinitions def = null;
            if (getDefaultOperations().containsKey(entityType)) {
                def = getDefaultOperations().get(entityType);
                if (def.get != null) {
                    return def.get;
                }
            }

            if (def == null) {
                def = generateNewOperationDefinitionsInstance();
                getDefaultOperations().put(entityType, def);
            }

            getOperation = applicationContext.getBean(CustomDefaultGetOperation.class);
            ((CustomDefaultGetOperation) getOperation).setEntityType(entityType);
            def.get = getOperation;
        }

        return getOperation;
    }

    @Override
    public FindOperation createFind(Class<? extends Entity> entityType) {
        FindOperation find = null;

        try {
            find = applicationContext.getBeansOfType(FindOperation.class).values().stream()
                    .filter(r -> !(r instanceof CustomDefaultFindOperation))
                    .filter(r -> Objects.equals(r.getEntityType(), entityType))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchBeanDefinitionException("form processor " + entityType.getName()));
        } catch (NoSuchBeanDefinitionException e) {
            OperationDefinitions def = null;
            if (getDefaultOperations().containsKey(entityType)) {
                def = getDefaultOperations().get(entityType);
                if (def.find != null) {
                    return def.find;
                }
            }

            if (def == null) {
                def = generateNewOperationDefinitionsInstance();
                getDefaultOperations().put(entityType, def);
            }

            find = applicationContext.getBean(CustomDefaultFindOperation.class);
            ((CustomDefaultFindOperation) find).setEntityType(entityType);
            def.find = find;
        }

        return find;
    }


    @Override
    public CreateOperation createCreate(Class<? extends Entity> entityType) {
        CreateOperation createOperation = null;

        try {
            createOperation = applicationContext.getBeansOfType(CreateOperation.class).values().stream()
                    .filter(r -> !(r instanceof CustomDefaultCreateOperation))
                    .filter(r ->Objects.equals(r.getEntityType(), entityType))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchBeanDefinitionException("form processor " + entityType.getName()));
        } catch (NoSuchBeanDefinitionException e) {
            OperationDefinitions def = null;
            if (getDefaultOperations().containsKey(entityType)) {
                def = getDefaultOperations().get(entityType);
                if (def.create != null) {
                    return def.create;
                }
            }

            if (def == null) {
                def = new OperationDefinitions();
                getDefaultOperations().put(entityType, def);
            }

            createOperation = applicationContext.getBean(CustomDefaultCreateOperation.class);
            ((CustomDefaultCreateOperation) createOperation).setEntityType(entityType);
            def.create = createOperation;
        }

        return createOperation;
    }

    @Override
    public DeleteOperation createDelete(Class<? extends Entity> entityType) {
        DeleteOperation deleteOperation = null;

        try {
            deleteOperation = applicationContext.getBeansOfType(DeleteOperation.class).values().stream()
                    .filter(r -> !(r instanceof CustomDefaultDeleteOperation))
                    .filter(r ->Objects.equals(r.getEntityType(), entityType))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchBeanDefinitionException("form processor " + entityType.getName()));
        } catch (NoSuchBeanDefinitionException e) {
            OperationDefinitions def = null;
            if (getDefaultOperations().containsKey(entityType)) {
                def = getDefaultOperations().get(entityType);
                if (def.delete != null) {
                    return def.delete;
                }
            }

            if (def == null) {
                def = new OperationDefinitions();
                getDefaultOperations().put(entityType, def);
            }

            deleteOperation = applicationContext.getBean(CustomDefaultDeleteOperation.class);
            ((CustomDefaultDeleteOperation) deleteOperation).setEntityType(entityType);
            def.delete = deleteOperation;
        }

        return deleteOperation;
    }


    @Override
    public SaveOperation createSave(Class<? extends Entity> entityType) {
        SaveOperation saveOperation = null;

        try {
            saveOperation = applicationContext.getBeansOfType(SaveOperation.class).values().stream()
                    .filter(r -> !(r instanceof CustomDefaultSaveOperation))
                    .filter(r ->Objects.equals(r.getEntityType(), entityType))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchBeanDefinitionException("form processor " + entityType.getName()));
        } catch (NoSuchBeanDefinitionException e) {
            OperationDefinitions def = null;
            if (getDefaultOperations().containsKey(entityType)) {
                def = getDefaultOperations().get(entityType);
                if (def.save != null) {
                    return def.save;
                }
            }

            if (def == null) {
                def = new OperationDefinitions();
                getDefaultOperations().put(entityType, def);
            }

            saveOperation = applicationContext.getBean(CustomDefaultSaveOperation.class);
            ((CustomDefaultSaveOperation) saveOperation).setEntityType(entityType);
            def.save = saveOperation;
        }

        return saveOperation;
    }
    
    
}
