package applica.api.runner.operations;

import applica.api.domain.model.auth.User;
import applica.framework.Entity;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

/**
 * Created by bimbobruno on 24/01/2017.
 */

@Component
public class UserGetOperation extends CustomBaseGetOperation {

    @Override
    protected void finishNode(Entity entity, ObjectNode node) {
        map().imageToDataUrl(entity, node, "image", "_image", "150x*");
        node.put("password", "");
    }

    @Override
    public Class<? extends Entity> getEntityType() {
        return User.class;
    }


}
