package applica.api.services;


import applica.api.domain.model.geo.GeoCity;
import applica.framework.Query;
import applica.framework.Result;

public interface GeoCityService {

    GeoCity getByPostalCode(String cap);

    void save(GeoCity geoCity);

    Result<GeoCity> filterByQuery(Query query);
}
