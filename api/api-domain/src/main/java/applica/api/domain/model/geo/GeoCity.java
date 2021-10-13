package applica.api.domain.model.geo;

import applica.api.domain.model.Entities;
import applica.framework.annotations.ManyToOne;
import applica.framework.widgets.annotations.Search;
import applica.framework.widgets.entities.EntityId;

/**
 * Created by federicomalvasi on 15/05/15.
 */

@EntityId(Entities.GEO_CITY)
public class GeoCity extends GeoEntity {

    @Search(includeInKeyword = true)
    private String description;

    @Search(includeInKeyword = true)
    private String cap;


    @ManyToOne
    private GeoProvince province;

    private String provinceToString;

    private String istatCode;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCap() {
        return cap;
    }

    public void setCap(String cap) {
        this.cap = cap;
    }

    public GeoProvince getProvince() {
        return province;
    }

    public void setProvince(GeoProvince province) {
        this.provinceToString = province != null? province.toString(): null;
        this.province = province;
    }

    public String toString() {
        return String.format("%s (%s)", description, cap);
    }


    public String getIstatCode() {
        return istatCode;
    }

    public void setIstatCode(String istatCode) {
        this.istatCode = istatCode;
    }

    public String getFullDescription() {
        return String.format("%s - %s", toString(), province.toString());
    }

    public void setProvinceToString(String provinceToString) {
        this.provinceToString = provinceToString;
    }

    public String getProvinceToString() {
        return provinceToString;
    }
}
