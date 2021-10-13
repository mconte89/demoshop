package applica.api.domain.model.geo;


import applica.framework.annotations.ManyToOne;

/**
 * Created by antoniolovicario on 28/09/15.
 */
public class GeoRegion extends GeoEntity {

    private String description;
    private String code;

    @ManyToOne
    private GeoNation nation;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public GeoNation getNation() {
        return nation;
    }

    public void setNation(GeoNation nation) {
        this.nation = nation;
    }

    public String toString() {
        return String.format("%s", description);
    }
}
