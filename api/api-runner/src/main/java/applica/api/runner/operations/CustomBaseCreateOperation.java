package applica.api.runner.operations;

import applica.api.domain.model.EntityWithDisactivation;
import applica.framework.widgets.operations.BaseCreateOperation;
import applica.framework.widgets.operations.OperationException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Map;

public class CustomBaseCreateOperation extends BaseCreateOperation {

    @Override
    public ObjectNode create(Map<String, Object> params) throws OperationException {
        ObjectNode objectNode = super.create(params);



        if (EntityWithDisactivation.class.isAssignableFrom(getEntityType())) {
            objectNode.put("active", true);
        }

        return objectNode;
    }
}
