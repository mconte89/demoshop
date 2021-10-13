package applica.api.runner.operations;

import applica.api.domain.data.RolesRepository;
import applica.api.domain.model.auth.Role;
import applica.api.services.responses.ResponseCode;
import applica.framework.Entity;
import applica.framework.library.SimpleItem;
import applica.framework.library.responses.Response;
import applica.framework.widgets.operations.OperationException;
import applica.framework.widgets.serialization.DefaultEntitySerializer;
import applica.framework.widgets.serialization.EntitySerializer;
import applica.framework.widgets.serialization.SerializationException;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by bimbobruno on 24/01/2017.
 */

@Component
public class RoleGetOperation extends CustomBaseGetOperation {

    @Autowired
    private RolesRepository rolesRepository;

    @Override
    public ObjectNode get(Object id) throws OperationException {
        try {
            Role role = rolesRepository.get(id).orElseThrow(() -> new OperationException(ResponseCode.ERROR_ROLE_NOT_FOUND));

            EntitySerializer entitySerializer = new DefaultEntitySerializer(getEntityType());
            ObjectNode node = entitySerializer.serialize(role);
            ArrayNode permissions = node.putArray("_permissions");
            for (String permission : role.getPermissions()) {
                permissions.addPOJO(new SimpleItem(permission, permission));
            }

            return node;
        } catch (SerializationException e) {
            throw new OperationException(Response.ERROR_SERIALIZATION);
        }
    }

    @Override
    public Class<? extends Entity> getEntityType() {
        return Role.class;
    }

}
