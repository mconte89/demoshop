package applica.api.data.mongodb;

import applica.framework.data.mongodb.MongoHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements InitializingBean {

    private Log logger = LogFactory.getLog(getClass());

    private final MongoHelper mongoHelper;

    @Autowired
    public DatabaseInitializer(MongoHelper mongoHelper) {
        this.mongoHelper = mongoHelper;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        //var db = mongoHelper.getDatabase("default");

        //db.getCollection("collection").createIndex(Indexes.ascending("fieldName"));
        //logger.info(String.format("Created db index at %s.%s", index.getV1(), index.getV2()));
    }
}
