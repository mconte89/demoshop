package applica.api.data.mongodb;

import applica.api.domain.model.auth.UserDetails;
import applica.api.domain.data.UsersRepository;
import applica.api.domain.model.Filters;
import applica.framework.Query;
import applica.framework.security.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import static applica.api.domain.model.Filters.USER_MAIL;
import static applica.framework.builders.QueryExpressions.eq;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 2/26/13
 * Time: 6:18 PM
 */
@Repository
public class UserDetailsMongoRepository implements UserDetailsRepository {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public org.springframework.security.core.userdetails.UserDetails getByMail(String mail) {
        try {
            return usersRepository.find(eq(USER_MAIL, mail))
                    .findFirst()
                    .map(UserDetails::new)
                    .orElse(null);
        } catch(Throwable t) {
            t.printStackTrace();
        }

        return null;
    }
}