package applica.api.services;

import applica.api.domain.model.UserChangePasswordAttempt;
import applica.api.domain.model.UserLoginAttempt;
import applica.api.domain.model.auth.User;
import applica.framework.Query;
import applica.framework.Result;

import java.util.List;

public interface UserService {

    Result<User> getUserByPermission(List<String> permissions, Query query);

    List<User> findUsers(Query query);

    User getUser(Long userId);

    List<User> getUserByIds(List<Long> userIds);

    List<User> getUserByMails(List<String> mails);

    User getUserThatCanBeLoggedId(String userId);

    void updateLoginFailAttempts(UserLoginAttempt attempt);

    void resetLoginFailAttempts(UserLoginAttempt attempt);

    UserLoginAttempt getUserLoginAttempts(String mail);

    void updatePasswordChangeFailAttempts(UserChangePasswordAttempt attempt);

    void resetPasswordChangeFailAttempts(UserChangePasswordAttempt attempt);

    UserChangePasswordAttempt getUserPasswordChangeAttempts(String mail);
}
