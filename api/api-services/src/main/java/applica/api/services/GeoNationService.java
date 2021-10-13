package applica.api.services;

import applica.api.domain.model.geo.GeoNation;
import applica.framework.Query;
import applica.framework.Result;

public interface GeoNationService {

    GeoNation getByCode(String code);

    void save(GeoNation geoNation);

    Result<GeoNation> filterByQuery(Query query);
}
