package applica.api.data.mongodb.constraints;

import applica.api.domain.model.auth.Role;
import applica.api.domain.model.Filters;
import applica.api.domain.model.auth.User;
import applica.framework.Query;
import applica.framework.data.mongodb.constraints.ForeignKeyConstraint;
import org.springframework.stereotype.Component;

/**
 * Applica (www.applicamobile.com)
 * User: bimbobruno
 * Date: 03/11/14
 * Time: 17:10
 */
@Component
public class RoleUsersConstraint extends ForeignKeyConstraint<Role, User> {

    @Override
    public Class<Role> getPrimaryType() {
        return Role.class;
    }

    @Override
    public Class<User> getForeignType() {
        return User.class;
    }

    @Override
    public String getForeignProperty() {
        return "roles";
    }

    @Override
    protected Query getOptimizedQuery(Role primaryEntity) {
        return Query.build().eq(Filters.USER_ROLES_ID, primaryEntity.getId());
    }
}
