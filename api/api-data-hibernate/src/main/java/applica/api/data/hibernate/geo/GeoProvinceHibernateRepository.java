package applica.api.data.hibernate.geo;

import applica.api.domain.data.geo.GeoProvinceRepository;
import applica.api.domain.model.Filters;
import applica.api.domain.model.geo.GeoProvince;
import applica.framework.Query;
import applica.framework.data.hibernate.HibernateRepository;
import org.springframework.stereotype.Repository;

@Repository
public class GeoProvinceHibernateRepository extends HibernateRepository<GeoProvince> implements GeoProvinceRepository {

    @Override
    public Class<GeoProvince> getEntityType() {
        return GeoProvince.class;
    }

    @Override
    public GeoProvince getByCode(String code) {
        try {
            return (GeoProvince) this
                    .find(Query.build().eq(Filters.CODE, code))
                    .findFirst()
                    .orElse(null);
        } catch(Throwable t) {
            t.printStackTrace();
        }

        return null;
    }

    @Override
    public Query keywordQuery(Query query) {
        return query.builder().like(Filters.DESCRIPTION, query.getKeyword());
    }
}
