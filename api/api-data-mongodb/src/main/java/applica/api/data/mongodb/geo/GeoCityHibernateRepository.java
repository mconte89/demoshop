package applica.api.data.mongodb.geo;

import applica.api.domain.data.geo.GeoCityRepository;
import applica.api.domain.model.Filters;
import applica.api.domain.model.geo.GeoCity;
import applica.framework.Query;
import applica.framework.data.mongodb.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public class GeoCityHibernateRepository extends MongoRepository<GeoCity> implements GeoCityRepository {


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
