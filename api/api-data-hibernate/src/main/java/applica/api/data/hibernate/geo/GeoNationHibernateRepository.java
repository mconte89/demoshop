package applica.api.data.hibernate.geo;

import applica.api.domain.data.geo.GeoNationRepository;
import applica.api.domain.model.Filters;
import applica.api.domain.model.geo.GeoNation;
import applica.framework.Query;
import applica.framework.data.hibernate.HibernateRepository;
import org.springframework.stereotype.Repository;

@Repository
public class GeoNationHibernateRepository extends HibernateRepository<GeoNation> implements GeoNationRepository {

    @Override
    public Class<GeoNation> getEntityType() {
        return GeoNation.class;
    }

    @Override
    public GeoNation getByCode(String code) {
        try {
            return (GeoNation) this
                    .find(Query.build().eq(Filters.CODE, code))
                    .findFirst()
                    .orElse(null);
        } catch(Throwable t) {
            t.printStackTrace();
        }

        return null;
    }
}
