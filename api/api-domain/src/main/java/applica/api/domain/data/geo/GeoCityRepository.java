package applica.api.domain.data.geo;

import applica.api.domain.model.geo.GeoCity;
import applica.framework.Repository;

public interface GeoCityRepository extends Repository<GeoCity> {

    GeoCity getByPostalCode(String cap);

}
