package applica.api.services.impl;

import applica.api.domain.model.Filters;
import applica.api.domain.model.StringifiedCodedEntity;
import applica.api.services.StringifiedCodedEntityService;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.Sort;
import org.springframework.stereotype.Service;

@Service
public class StringifiedCodedEntityServiceImpl implements StringifiedCodedEntityService {

    @Override
    public void generateAndSetCodeForCreation(StringifiedCodedEntity entity) {
        if (entity.getId() != null)
            return;
        long progressive = getFirstAvailableProgressive(entity.getClass(), entity.generateQueryForCodeProgressive());
        try {
            entity.setProgressive(progressive);
            entity.generateCodeForCreation();
        } catch (Exception e) {

        }
    }

    private long getFirstAvailableProgressive(Class<? extends StringifiedCodedEntity> clazz, Query query) {

        if (query == null)
            query = Query.build();

        query.setPage(1);
        query.setRowsPerPage(1);
        query.getSorts().add(new Sort(Filters.PROGRESSIVE, true));

        StringifiedCodedEntity lastCode = Repo.of(clazz).find(query).findFirst().orElse(null);
        //è possibile avere entità con il progressivo < 0 (es: quelle sincronizzate dai cataloghi in super admin)
        if (lastCode == null || lastCode.getProgressive() < 0)
            return 1;
        else
            return lastCode.getProgressive() + 1;
    }
}
