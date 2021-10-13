package applica.api.domain.data.geo;


import applica.api.domain.model.geo.GeoNation;
import applica.framework.Repository;

public interface GeoNationRepository extends Repository<GeoNation> {

    GeoNation getByCode(String code);

}
