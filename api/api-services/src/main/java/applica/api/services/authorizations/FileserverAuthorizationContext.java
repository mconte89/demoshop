package applica.api.services.authorizations;

import applica.framework.Entity;
import applica.framework.security.User;
import applica.framework.security.annotations.AuthorizationContext;
import applica.framework.security.annotations.Permission;
import applica.framework.security.authorization.AuthorizationException;
import org.springframework.stereotype.Component;

import static applica.api.services.authorizations.AuthorizationContexts.FILESERVER;
import static applica.api.services.authorizations.AuthorizationContexts.VIEW;


/**
 * Created by antoniolovicario on 23/05/17.
 */
@Component
@AuthorizationContext(FILESERVER)
public class FileserverAuthorizationContext {


    @Permission(VIEW)
    public void canCreate(User user, String entityName, Entity entity) throws AuthorizationException {

        //COURSE
        //MEETING
        //COURSE CONTENT
        //QUIZ
        boolean authorized = true;

//        switch (entityName) {
//            case EntityList.COURSE:
//                authorized = PermissionUtils.isPermitted(user, AuthorizationContexts.COURSE, VIEW, entity.getId());
//                break;
//            case EntityList.MEETING:
//                authorized = PermissionUtils.isPermitted(user, AuthorizationContexts.MEETING, VIEW, entity);
//                break;
//            case EntityList.USER_ATTACHMENT:
//                authorized = PermissionUtils.isPermitted(user, AuthorizationContexts.ATTACHMENT, VIEW, entity);
//                break;
//            case EntityList.NOTE:
//                authorized = PermissionUtils.isPermitted(user, AuthorizationContexts.NOTE, VIEW, entity);
//                break;
//            case EntityList.QUESTION_OPTION:
//            case EntityList.QUESTION_SHORT_ANSWER:
//            case EntityList.QUESTION_SIMPLE_MULTIPLE_CHOICE:
//            case EntityList.QUESTION_SINGLE_CHOICE:
//                Question question = (Question) entity;
//                Questionnaire q = questionnaireService.getQuestionnaire(question.getQuestionnaireId(), false);
//                authorized = PermissionUtils.isPermitted(user, AuthorizationContexts.ASSIGNMENT, VIEW, q);
//                break;
//        }

        if (!authorized)
            throw new AuthorizationException();
    }


}
