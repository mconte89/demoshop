package applica.api.services.impl;

import applica.api.domain.model.Filters;
import applica.api.domain.model.UserChangePasswordAttempt;
import applica.api.domain.model.UserLoginAttempt;
import applica.api.domain.model.auth.Role;
import applica.api.domain.model.auth.User;
import applica.api.services.UserService;
import applica.framework.*;
import applica.framework.security.Security;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Override
    public Result<User> getUserByPermission(List<String> permissions, Query query) {

        if (query == null)
            query = Query.build();

        List<Role> roles = Repo.of(Role.class).find(Query.build().in("permissions", permissions)).getRows();
        if (roles.size() > 0) {
            query.getFilters().add(new Filter(Filters.USER_ROLES_ID,roles.stream().map(AEntity::getSid).collect(Collectors.toList()), Filter.IN));
            return Repo.of(User.class).find(query);
        }
        return null;
    }

    @Override
    public List<User> findUsers(Query query) {
        return Repo.of(User.class).find(query).getRows();
    }

    @Override
    public User getUser(Long userId) {
        return Repo.of(User.class).get(userId).orElse(null);
    }

    @Override
    public List<User> getUserByIds(List<Long> userIds) {
        return Repo.of(User.class).find(Query.build().in(Filters.REPOSITORY_ID, userIds)).getRows();
    }

    @Override
    public List<User> getUserByMails(List<String> mails) {
        return Repo.of(User.class).find(Query.build().in(Filters.USER_MAIL, mails)).getRows();
    }

    @Override
    public User getUserThatCanBeLoggedId(String userId) {
        return ((User) Security.withMe().getLoggedUser()).getSid().equals(userId) ? (User) Security.withMe().getLoggedUser() : Repo.of(User.class).get(userId).orElse(null);

    }

    @Override
    public void updateLoginFailAttempts(UserLoginAttempt attempt) {
        attempt.incrementAttemps();
        attempt.setLastModified(new Date());
        Repo.of(UserLoginAttempt.class).save(attempt);
    }

    @Override
    public void resetLoginFailAttempts(UserLoginAttempt attempt) {
        attempt.resetAttempts();
        Repo.of(UserLoginAttempt.class).save(attempt);
    }

    @Override
    public UserLoginAttempt getUserLoginAttempts(String mail) {
        return Repo.of(UserLoginAttempt.class).find(Query.build().eq(Filters.USER_MAIL, mail)).findFirst().orElse(new UserLoginAttempt(mail));
    }

    @Override
    public void updatePasswordChangeFailAttempts(UserChangePasswordAttempt attempt) {
        attempt.incrementAttemps();
        attempt.setLastModified(new Date());
        Repo.of(UserChangePasswordAttempt.class).save(attempt);
    }

    @Override
    public void resetPasswordChangeFailAttempts(UserChangePasswordAttempt attempt) {
        attempt.resetAttempts();
        Repo.of(UserChangePasswordAttempt.class).save(attempt);
    }

    @Override
    public UserChangePasswordAttempt getUserPasswordChangeAttempts(String mail) {
        return Repo.of(UserChangePasswordAttempt.class).find(Query.build().eq(Filters.USER_MAIL, mail)).findFirst().orElse(new UserChangePasswordAttempt(mail));
    }
}
