package applica.api.data.mongodb.constraints;

import applica.api.domain.model.Filters;
import applica.api.domain.model.auth.Role;
import applica.framework.Query;
import applica.framework.data.mongodb.constraints.UniqueConstraint;
import org.springframework.stereotype.Component;

/**
 * Applica (www.applicamobile.com)
 * User: bimbobruno
 * Date: 03/11/14
 * Time: 18:18
 */
@Component
public class RoleNameUniqueConstraint extends UniqueConstraint<Role> {

    @Override
    public Class<Role> getType() {
        return Role.class;
    }

    @Override
    public String getProperty() {
        return "role";
    }

    @Override
    protected Query getOptimizedQuery(Role entity) {
        return Query.build().eq(Filters.ROLE_NAME, entity.getRole());
    }
}
