package applica.api.data.mongodb;

import applica.framework.Query;
import applica.framework.Sort;
import applica.framework.data.mongodb.MongoRepository;
import applica.api.domain.data.UsersRepository;
import applica.api.domain.model.auth.User;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 28/10/13
 * Time: 17:22
 */
@Repository
public class UsersMongoRepository extends MongoRepository<User> implements UsersRepository {

    @Override
    public Class<User> getEntityType() {
        return User.class;
    }

    @Override
    public List<Sort> getDefaultSorts() {
        return Arrays.asList(new Sort("mail", false));
    }

    @Override
    public Query keywordQuery(Query initialQuery) {
        return initialQuery.builder()
                .disjunction()
                    .like("name", initialQuery.getKeyword())
                    .like("mail", initialQuery.getKeyword())
                    .finish();
    }
}
