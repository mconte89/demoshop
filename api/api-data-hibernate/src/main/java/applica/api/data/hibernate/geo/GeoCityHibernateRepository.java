package applica.api.data.hibernate.geo;

import applica.api.domain.data.geo.GeoCityRepository;
import applica.api.domain.model.Filters;
import applica.api.domain.model.geo.GeoCity;
import applica.framework.Disjunction;
import applica.framework.Filter;
import applica.framework.Query;
import applica.framework.data.hibernate.HibernateRepository;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
public class GeoCityHibernateRepository extends HibernateRepository<GeoCity> implements GeoCityRepository {


    @Override
    public Class<GeoCity> getEntityType() {
        return GeoCity.class;
    }

    @Override
    public GeoCity getByPostalCode(String cap) {
        try {
            return (GeoCity) this
                    .find(Query.build().eq(Filters.CAP, cap))
                    .findFirst()
                    .orElse(null);
        } catch(Throwable t) {
            t.printStackTrace();
        }

        return null;
    }
}
