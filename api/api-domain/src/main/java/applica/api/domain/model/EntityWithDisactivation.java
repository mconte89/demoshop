package applica.api.domain.model;

public interface EntityWithDisactivation {

    boolean isActive();
    void setActive(boolean active);
}
