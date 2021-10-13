package applica.api.domain.model;

import applica.framework.AEntity;
import applica.framework.library.utils.DateUtils;

import java.util.Date;

public abstract class UserAttempt extends AEntity {
    private static final int MAX_ALLOWED_ATTEMPTS = 10;
    public static final int WAITING_TIME_IN_MINUTES= 2;
    public static final int WAITING_TIME_IN_SECONDS= 2 * 60;

    private String mail;
    private int attempts;
    private Date lastModified;

    public UserAttempt(String mail) {
        this.mail = mail;
    }

    public UserAttempt() {
    }


    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public Date getLastModified() {
        return lastModified;
    }

    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }

    public void incrementAttemps() {
        if (attempts > MAX_ALLOWED_ATTEMPTS)
            attempts = attempts - MAX_ALLOWED_ATTEMPTS;
        this.attempts++;
    }

    public void resetAttempts() {
        this.attempts = 0;
    }

    public boolean isLocked() {
        return attempts > MAX_ALLOWED_ATTEMPTS && !hasToReset();
    }

    public boolean hasToReset() {
        return lastModified != null && new Date().compareTo(DateUtils.addMinutesToDate(lastModified, WAITING_TIME_IN_MINUTES)) > 0;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }
}
