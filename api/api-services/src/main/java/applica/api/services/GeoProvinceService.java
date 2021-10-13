package applica.api.services;

import applica.api.domain.model.geo.GeoProvince;
import applica.framework.Query;
import applica.framework.Result;


public interface GeoProvinceService {

    GeoProvince getByCode(String code);

    void save(GeoProvince geoProvince);

}
