package applica.api.services;

import applica.api.domain.model.auth.PasswordRecoveryCode;
import applica.api.domain.model.auth.User;
import applica.api.services.exceptions.*;
import applica.framework.library.validation.ValidationException;
import applica.framework.library.base64.URLData;

import java.io.IOException;

/**
 * Created by bimbobruno on 15/11/2016.
 */
public interface AccountService {

    /**
     * Register a new account. Registered account is inactive and a confirmation mail is sent
     * @param name
     * @param mail
     * @param password
     */
    void register(String name, String mail, String password) throws MailAlreadyExistsException, MailNotValidException, PasswordNotValidException, ValidationException;

    /**
     * Confirm a previously registered account
     * @param activationCode
     */
    void confirm(String activationCode) throws MailNotFoundException;

    /**
     * Removes user from system, included related entities
     * @param id
     */
    void delete(Object id) throws UserNotFoundException;

    /**
     * Recover user account by sending a new password to specified mail address, if exists
     * @param mail
     */
    void recover(String mail) throws MailNotFoundException;

    /**
     * Gets user profile image (the user image in top left of web application)
     * @param userId
     * @return
     */
    URLData getProfileImage(Object userId, String size) throws UserNotFoundException, IOException;

    boolean needToChangePassword(applica.framework.security.User user);

    void changePassword(User user, String currentPassword, String password, String passwordConfirm, boolean force) throws ValidationException;

    void changePassword(User user, String currentPassword, String password, String passwordConfirm) throws ValidationException;

    void deactivateInactiveUsers();

    boolean hasPasswordSetBefore(Object userId, String encryptedPassword, Integer changesToConsider);

    boolean isCurrentPassword(String password);

    PasswordRecoveryCode getPasswordRecoverForUser(String userId);

    PasswordRecoveryCode getPasswordRecoveryCode(String code);

    void deletePasswordRecoveryCode(PasswordRecoveryCode code);

    void savePasswordRecoveryCode(PasswordRecoveryCode passwordRecoveryCode);

    void sendConfirmationCode(String mail);

    void validateRecoveryCode(String mail, String code, boolean deleteRecord, boolean propagateError) throws MailNotFoundException, CodeNotValidException;

    void resetPassword(String mail, String code, String password, String passwordConfirm) throws MailNotFoundException, ValidationException, CodeNotValidException;

    String generateOneTimePassword();
}
