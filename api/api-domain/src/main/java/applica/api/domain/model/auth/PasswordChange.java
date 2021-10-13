package applica.api.domain.model.auth;

import applica.framework.AEntity;

/**
 * Created by antoniolovicario on 06/11/17.
 */
public class PasswordChange extends PasswordReset {


    //Password IN CHIARO corrente
    private String currentPassword;

    public PasswordChange() {}

    public PasswordChange(User user, String currentPassword, String password, String passwordConfirm) {
        super(user, password, passwordConfirm);
        this.currentPassword = currentPassword;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}
