package applica.api.services.authorizations;

import applica.api.domain.model.Entities;
import applica.api.domain.model.Filters;
import applica.framework.Entity;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.security.Security;
import applica.framework.security.User;
import applica.framework.security.annotations.AuthorizationContext;
import applica.framework.security.annotations.Permission;
import applica.framework.security.authorization.AuthorizationException;
import applica.framework.security.authorization.Permissions;
import applica.framework.security.utils.PermissionUtils;
import applica.framework.widgets.acl.CrudPermission;
import applica.framework.widgets.acl.CrudSecurityConfigurer;
import applica.framework.widgets.entities.EntitiesRegistry;
import applica.framework.widgets.entities.EntityUtils;
import org.springframework.stereotype.Component;

import java.util.Map;

import static applica.api.services.authorizations.AuthorizationContexts.CUSTOM_ENTITY_PREFIX;


/**
 * Created by antoniolovicario on 05/11/15.
 */
@Component
@AuthorizationContext(AuthorizationContexts.ENTITY)
public class EntitiesAuthorizationContext {

    @Permission(CrudPermission.SAVE)
    public void canSeeAssociations(User user, Class<? extends Entity> entityClass, Entity entity) throws AuthorizationException {
        String entityName = EntityUtils.getEntityIdAnnotation(entityClass);
        if (Security.with(user).isPermitted(CrudSecurityConfigurer.instance().getExpression(entityName, CrudPermission.SAVE))) {
            if (checkCustomPermissions(user, entityName, entity, CrudPermission.SAVE))
                return;
        }
        throw new AuthorizationException("Permesso negato!");
    }

    @Permission(CrudPermission.EDIT)
    public void edit(User user, Class<? extends Entity> entityClass, Entity entity) throws AuthorizationException {
        String entityName = EntityUtils.getEntityIdAnnotation(entityClass);
        if (Security.with(user).isPermitted(CrudSecurityConfigurer.instance().getExpression(entityName, CrudPermission.EDIT))) {
            if (checkCustomPermissions(user, entityName, entity, CrudPermission.EDIT))
                return;
        }
        throw new AuthorizationException("Permesso negato!");
    }

    private boolean checkCustomPermissions(User user, String entityName, Entity entity, String crudPermission, Object ... params) {
        if (Permissions.instance().isRegistered(String.format("%s:%s", entityName, crudPermission))) {
            return  PermissionUtils.isPermitted(user, CUSTOM_ENTITY_PREFIX + entityName, crudPermission, entity);
        }


        if (crudPermission.equals(CrudPermission.LIST)) {
            Query query = (Query) params[0];
            if (entityName.equals(Entities.REVISION)) {
                String relatedEntity = query.getFilterValue(Filters.ENTITY).toString();
                if (Permissions.instance().isRegistered(String.format("%s:%s", CUSTOM_ENTITY_PREFIX + relatedEntity, AuthorizationContexts.MANAGE)))
                    return  PermissionUtils.isPermitted(user, CUSTOM_ENTITY_PREFIX + relatedEntity, AuthorizationContexts.MANAGE, Repo.of(EntitiesRegistry.instance().get(relatedEntity).get().getType()).get(query.getFilterValue(Filters.ENTITY_ID).toString()).orElse(null));
            }
        }

        return true;
    }

    @Permission(CrudPermission.DELETE)
    public void canDoMaquillage(User user, Class<? extends Entity> entityClass, Entity entity) throws AuthorizationException {
        String entityName = EntityUtils.getEntityIdAnnotation(entityClass);
        if (Security.with(user).isPermitted(CrudSecurityConfigurer.instance().getExpression(entityName, CrudPermission.DELETE))) {
            if (entity == null || checkCustomPermissions(user, entityName, entity, CrudPermission.DELETE))
                return;
        }

        throw new AuthorizationException("Permesso negato!");
    }

    @Permission(CrudPermission.NEW)
    public void canCreateMaquillage(User user, Class<? extends Entity> entityClass, Map<String, Object> params) throws AuthorizationException {
        String entityName = EntityUtils.getEntityIdAnnotation(entityClass);
        if (Security.with(user).isPermitted(CrudSecurityConfigurer.instance().getExpression(entityName, CrudPermission.NEW)))
            if (checkCustomPermissions(user, entityName, null, CrudPermission.NEW))
                return;

        throw new AuthorizationException("Permesso negato!");
    }


    @Permission(CrudPermission.LIST)
    public void list(User user, Class<? extends Entity> entityClass, Query query) throws AuthorizationException {
        String entityName = EntityUtils.getEntityIdAnnotation(entityClass);
        if (Security.with(user).isPermitted(CrudSecurityConfigurer.instance().getExpression(entityName, CrudPermission.LIST)))
            if (checkCustomPermissions(user, entityName, null, CrudPermission.LIST, query))
                return;

        throw new AuthorizationException("Permesso negato!");
    }
}
