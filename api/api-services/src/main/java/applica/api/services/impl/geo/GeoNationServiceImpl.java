package applica.api.services.impl.geo;

import applica.api.domain.data.geo.GeoNationRepository;
import applica.api.domain.model.geo.GeoNation;
import applica.api.services.GeoNationService;
import applica.framework.Query;
import applica.framework.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GeoNationServiceImpl implements GeoNationService {

    @Autowired
    private GeoNationRepository geoNationMongoRepository;

    @Override
    public GeoNation getByCode(String code) {
        return geoNationMongoRepository.getByCode(code);
    }

    @Override
    public void save(GeoNation geoNation) {
        geoNationMongoRepository.save(geoNation);
    }

    @Override
    public Result<GeoNation> filterByQuery(Query query) {
        return geoNationMongoRepository.find(query);
    }
}
