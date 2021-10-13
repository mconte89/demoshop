package applica.api.runner.configuration;

import applica.framework.CrudStrategy;
import applica.framework.DefaultRepository;
import applica.framework.data.mongodb.*;
import applica.framework.data.mongodb.constraints.ConstraintsChecker;
import applica.framework.data.mongodb.constraints.SimpleConstraintsChecker;
import applica.framework.revision.RevisionTrackingCrudStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

/**
 * Created by bimbobruno on 14/11/2016.
 */
@Configuration
public class MongoConfiguration {

    @Bean
    public MongoHelper mongoHelper() {
        return new MongoHelper();
    }

    @Bean
    public MongoMapper mongoMapper() {
        return new MongoMapper();
    }

    @Bean
    public CrudStrategy mongoCrudStrategy() {
        return new MongoCrudStrategy();
    }

    @Bean
    public ConstraintsChecker constraintsChecker() {
        return new SimpleConstraintsChecker();
    }

    @Bean(name = "default-repository")
    @Scope("prototype")
    public DefaultRepository defaultRepository() {
        return new DefaultMongoRepository();
    }

    //Start Revision beans
    @Bean
    public RevisionTrackingCrudStrategy crudStrategy() {
        RevisionTrackingCrudStrategy strategy = new RevisionTrackingCrudStrategy();
        strategy.setParent(mongoCrudStrategy());
        return strategy;
    }

}
