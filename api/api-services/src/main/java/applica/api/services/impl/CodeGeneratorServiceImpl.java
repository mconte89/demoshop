package applica.api.services.impl;

import applica.api.domain.model.Filters;
import applica.api.domain.model.StringifiedCodedEntity;
import applica.api.services.StringifiedCodedEntityService;
import applica.framework.Entity;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.Sort;
import applica.framework.security.CodeGeneratorService;
import applica.framework.security.NumericCodedEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CodeGeneratorServiceImpl implements CodeGeneratorService {

    @Autowired
    private StringifiedCodedEntityService stringifiedCodedEntityService;

    @Override
    public long getFirstAvailableCode(Class<? extends NumericCodedEntity> aClass) {
        return getFirstAvailableCode(aClass, null);
    }

    @Override
    public long getFirstAvailableCode(Class<? extends NumericCodedEntity> codeEntity, Query query) {

        if (query == null)
            query = Query.build();

        query.setPage(1);
        query.setRowsPerPage(1);
        query.getSorts().add(new Sort(Filters.CODE, true));

        Entity lastCode = Repo.of(codeEntity).find(
                query).findFirst().orElse(null);
        if (lastCode == null)
            return 1;
        else
            return ((NumericCodedEntity) lastCode).getCode() + 1;
    }

    //TODO: astrarre e mettere insieme ste robe?
    public void generateAndSetCodeForCreation(StringifiedCodedEntity entity) {

        stringifiedCodedEntityService.generateAndSetCodeForCreation(entity);

    }
}
