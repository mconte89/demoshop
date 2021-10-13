package applica.api.domain.model;

import applica.framework.AEntity;
import applica.framework.Query;
import applica.framework.security.NumericCodedEntity;
import applica.framework.widgets.annotations.Validation;

/**
 * Created by antoniolovicario on 18/10/17.
 */

public abstract class AIntegerCodedEntity extends AEntity implements NumericCodedEntity {

    @Validation(required = true, unique = true, greaterThanZero = true)
    private long code;

    @Override
    public long getCode() {
        return code;
    }

    @Override
    public void setCode(long code) {
        this.code = code;
    }

    @Override
    public String toString() {
        return String.format("%s - %s", getCode(), getDescription());
    }

    protected abstract String getDescription();

    public String getFullDescription() {
        return toString();
    }


    @Override
    public Query generateQueryForCodeProgressive() {
        return null;
    }
}