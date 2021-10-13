package applica.api.services.exceptions;

/**
 * Created by bimbobruno on 15/11/2016.
 */
public class UserLoginMaxAttemptsException extends Exception {
    public UserLoginMaxAttemptsException(String message) {
        super(message);
    }
}
