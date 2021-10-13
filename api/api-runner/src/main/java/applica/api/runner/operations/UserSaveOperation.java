package applica.api.runner.operations;

import applica.api.domain.model.auth.User;
import applica.api.facade.AccountFacade;
import applica.framework.Entity;
import applica.framework.Repo;
import applica.framework.security.authorization.AuthorizationException;
import applica.framework.widgets.operations.OperationException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;


@Component
public class UserSaveOperation extends CustomBaseSaveOperation {

    @Autowired
    private AccountFacade accountFacade;

    @Override
    public Class<? extends Entity> getEntityType() {
        return User.class;
    }

    @Override
    protected void finishEntity(ObjectNode node, Entity entity) throws OperationException {
        super.finishEntity(node, entity);
        map().dataUrlToImage(node, entity, "_image", "image", "images/users");
    }

    @Override
    protected void beforeSave(ObjectNode data, Entity entity) throws OperationException {
        super.beforeSave(data, entity);
        String passwordToSave = null;
        if (entity.getId() != null) {
            //Previene la modifica password direttamente dal form: è necessario richiamare l'apposita funzione di reset (se si è admin)
            User previous = Repo.of(User.class).get(((User) entity).getSid()).get();
            passwordToSave = previous.getPassword();
        }
        ((User) entity).setPassword(passwordToSave);
        ((User) entity).setMail(((User) entity).getMail().toLowerCase());
    }

    @Override
    protected void afterSave(ObjectNode node, Entity entity) throws OperationException {
        super.afterSave(node, entity);
        // Ottengo tutte le info necessarie ad aggiornare/creare un utente
        User user = (User) entity;
        if (user.getFirstLogin() == null) {
            user.setRegistrationDate(new Date());
            user.setFirstLogin(true);
            try {
                accountFacade.generateAndSendUserOneTimePassword(user);
            } catch (AuthorizationException e) {
                e.printStackTrace();
            }
        }
    }
}
