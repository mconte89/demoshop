package applica.api.domain.model;

public class UserLoginAttempt extends UserAttempt {

    public UserLoginAttempt(String mail) {
        this.setMail(mail);
    }

    public UserLoginAttempt() {
    }
}