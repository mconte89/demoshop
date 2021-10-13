package applica.api.domain.model.geo;


import applica.framework.widgets.entities.EntityId;

/**
 * Created by antoniolovicario on 21/09/15.
 */

@EntityId("nation")
public class GeoNation extends GeoEntity {
    private String description;
    private String code;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



    @Override
    public String toString() {
        return String.format("%s (%s)", description, code);
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
