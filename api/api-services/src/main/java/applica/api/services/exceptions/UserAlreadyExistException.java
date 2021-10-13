package applica.api.services.exceptions;

public class UserAlreadyExistException extends Exception {

    private final String mail;

    public UserAlreadyExistException(String mail) {
        this.mail = mail;
    }

    public String getMail() {
        return mail;
    }
}
