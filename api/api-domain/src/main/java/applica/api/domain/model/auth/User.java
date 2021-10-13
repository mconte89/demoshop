package applica.api.domain.model.auth;

import applica.api.domain.model.AIntegerCodedEntity;
import applica.api.domain.model.Entities;
import applica.framework.AEntity;
import applica.framework.annotations.ManyToMany;
import applica.framework.revisions.AvoidRevision;
import applica.framework.security.NumericCodedEntity;
import applica.framework.widgets.entities.EntityId;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.util.StringUtils;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 6/12/2016
 * Time: 17:08
 */

@EntityId(value = Entities.USER, allowRevision = true, automaticCodeGeneration = true)
public class User extends AIntegerCodedEntity implements applica.framework.security.User {

    private String name;
    private String lastname;
    private String mail;
    private String password;
    private boolean active;
    private Boolean firstLogin;
    private Date registrationDate;
    private String activationCode;
    private String image;

    @AvoidRevision
    private Date lastLogin;
    private Date currentPasswordSetDate;

    @ManyToMany
    private List<Role> roles;
    private Date activationDate;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    @JsonIgnoreProperties
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Date getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(Date registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Date getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }

    public String getLastname() {
        return lastname;
    }

    public Boolean getFirstLogin() {
        return firstLogin;
    }

    public void setFirstLogin(Boolean firstLogin) {
        this.firstLogin = firstLogin;
    }

    public Date getCurrentPasswordSetDate() {
        return currentPasswordSetDate;
    }

    public void setCurrentPasswordSetDate(Date currentPasswordSetDate) {
        this.currentPasswordSetDate = currentPasswordSetDate;
    }

    public String getFullName() {
        return String.format("%s %s", lastname, name);
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getInitials() {
        if (StringUtils.hasLength(getMail())) {
            return getMail().substring(0, 1);
        }

        return "@";
    }

    @Override
    public String getUsername() {
        return getMail();
    }


    public boolean isNeedToChangePassword() {
        Calendar threeMonthAgo = Calendar.getInstance();
        threeMonthAgo.add(Calendar.MONTH, -3);
        return currentPasswordSetDate == null || currentPasswordSetDate.before(threeMonthAgo.getTime());
    }

    public boolean hasRole(String role){
        for (Role r: getRoles()) {
            if (Objects.equals(r.getRole(), role))
                return true;
        }
        return false;
    }

    public String getRoleDescription() {
        return String.join(", ", roles.stream().map(Role::getLocalizedRole).collect(Collectors.joining()));
    }

    @Override
    protected String getDescription() {
        return getFullName();
    }

    public void setActivationDate(Date activationDate) {
        this.activationDate = activationDate;
    }

    public Date getActivationDate() {
        return activationDate;
    }
}
