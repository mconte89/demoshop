package applica.api.data.hibernate;

import applica.api.domain.model.Filters;
import applica.api.domain.model.auth.UserDetails;
import applica.api.domain.data.UsersRepository;
import applica.framework.Query;
import applica.framework.security.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 2/26/13
 * Time: 6:18 PM
 */
@Repository
public class UserDetailsHibernateRepository implements UserDetailsRepository {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public org.springframework.security.core.userdetails.UserDetails getByMail(String mail) {
        try {
            return usersRepository
                    .find(Query.build().eq(Filters.USER_MAIL, mail))
                    .findFirst()
                    .map(u -> new UserDetails(u))
                    .orElse(null);
        } catch(Throwable t) {
            t.printStackTrace();
        }

        return null;
    }
}