package applica.api.runner.operations;

import applica.api.domain.model.EntityWithCreationInfos;
import applica.framework.Entity;
import applica.framework.widgets.operations.BaseSaveOperation;
import applica.framework.widgets.operations.OperationException;
import com.fasterxml.jackson.databind.node.ObjectNode;

import static applica.api.services.impl.EntityServiceImpl.checkStringCode;

public class CustomBaseSaveOperation extends BaseSaveOperation {


    @Override
    protected void finishEntity(ObjectNode node, Entity entity) throws OperationException {
        super.finishEntity(node, entity);


        checkStringCode(entity);
    }

    @Override
    protected void beforeSave(ObjectNode data, Entity entity) throws OperationException {
        super.beforeSave(data, entity);
        boolean creation = entity.getId() == null;

        if (entity instanceof EntityWithCreationInfos) {
            if (!creation)
                ((EntityWithCreationInfos) entity).setLastEditInfos();
            else
                ((EntityWithCreationInfos) entity).setCreationInfos();
        }
    }
}
