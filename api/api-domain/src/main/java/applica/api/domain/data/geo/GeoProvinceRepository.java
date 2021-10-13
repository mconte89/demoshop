package applica.api.domain.data.geo;


import applica.api.domain.model.geo.GeoProvince;
import applica.framework.Repository;

public interface GeoProvinceRepository extends Repository<GeoProvince> {

    GeoProvince getByCode(String code);

}
