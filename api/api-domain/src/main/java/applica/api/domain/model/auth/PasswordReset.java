package applica.api.domain.model.auth;

import applica.framework.AEntity;
import org.springframework.util.StringUtils;

/**
 * Created by antoniolovicario on 06/11/17.
 */
public class PasswordReset extends AEntity {

    private User user;
    private String password;
    private String passwordConfirm;

    public PasswordReset() {}

    public PasswordReset(User user, String password, String passwordConfirm) {
        this.user = user;
        this.password = password;
        this.passwordConfirm = passwordConfirm;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPasswordConfirm() {
        return passwordConfirm;
    }

    public void setPasswordConfirm(String passwordConfirm) {
        this.passwordConfirm = passwordConfirm;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public static PasswordReset generatePasswordRequest(User user, String currentPassword, String password, String passwordConfirm) {
        if (!StringUtils.hasLength(currentPassword)) {
            return new PasswordReset(user, password, passwordConfirm);
        } else
            return new PasswordChange(user, currentPassword,  password, passwordConfirm);
    }
}
