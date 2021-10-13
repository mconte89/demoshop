package applica.api.domain.model;

public class UserChangePasswordAttempt extends UserAttempt {

    public UserChangePasswordAttempt(String mail) {
        this.setMail(mail);
    }

    public UserChangePasswordAttempt() {
    }
}
