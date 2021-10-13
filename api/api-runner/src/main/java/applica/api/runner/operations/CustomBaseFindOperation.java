package applica.api.runner.operations;

import applica.api.domain.model.EntityWithCreationInfos;
import applica.api.domain.model.Filters;
import applica.api.domain.model.StringifiedCodedEntity;
import applica.api.services.impl.EntityServiceImpl;
import applica.framework.*;
import applica.framework.security.EntityService;
import applica.framework.security.NumericCodedEntity;
import applica.framework.widgets.operations.BaseFindOperation;
import applica.framework.widgets.operations.OperationException;
import org.springframework.beans.factory.annotation.Autowired;

import java.lang.reflect.Field;
import java.util.List;

public class CustomBaseFindOperation extends BaseFindOperation {


    @Autowired
    private EntityService entityService;

    @Override
    public Query generateQuery(Query query, List<Field> fieldList) {
        Query q = super.generateQuery(query, fieldList);


        if (isEnabledDefaultSort()) {
            if (NumericCodedEntity.class.isAssignableFrom(getEntityType())) {
                if (q.getSorts().size() == 0)
                    q.getSorts().add(new Sort(Filters.CODE, true));
            }

            if (StringifiedCodedEntity.class.isAssignableFrom(getEntityType())) {
                if (q.getSorts().size() == 0)
                    q.getSorts().add(new Sort(Filters.PROGRESSIVE, true));
            }
        }

        return q;
    }

    @Override
    public Result<? extends Entity> fetch(Query query) throws OperationException {
        Result result =  super.fetch(query);

        if (EntityWithCreationInfos.class.isAssignableFrom(getEntityType()))
            ((EntityServiceImpl) entityService).materializePropertyFromId(result.getRows(), "lastEditUserId", "lastEditUser");
        return result;
    }

    public boolean isEnabledDefaultSort() {
        return true;
    }

    @Override
    public void manageKeywordDisjunction(Query q, Disjunction disjunction) {
        super.manageKeywordDisjunction(q, disjunction);
    }
}