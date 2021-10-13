package applica.api.runner.operations;

import applica.framework.Entity;
import applica.framework.security.Security;
import applica.framework.security.utils.PermissionUtils;
import applica.framework.widgets.operations.BaseGetOperation;
import applica.framework.widgets.operations.OperationException;
import com.fasterxml.jackson.databind.node.ObjectNode;

public abstract class CustomBaseGetOperation extends BaseGetOperation  {
    @Override
    protected void finishNode(Entity entity, ObjectNode node) throws OperationException {
        super.finishNode(entity, node);

        node.put("_canSave", PermissionUtils.isPermitted(Security.withMe().getLoggedUser(), "entity", "save", new Object[]{this.getEntityType(), entity}));
    }

}
