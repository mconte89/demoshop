package applica.api.runner.test;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.Test;

import java.util.function.Consumer;

public class MongoTest {

    @Test
    public void testMongo(){
        var connectionString = "mongodb+srv://api:appl1ca__@mongo-cluster-50r4q.gcp.mongodb.net/test?retryWrites=true&w=majority";
        MongoClient mongoClient = MongoClients.create("mongodb+srv://api:appl1ca__@mongo-cluster-50r4q.gcp.mongodb.net/test?retryWrites=true&w=majority");
        MongoDatabase database = mongoClient.getDatabase("test");
        var collection = database.getCollection("doc");


        collection.find().forEach((Consumer<Document>) document -> System.out.println(document.get("name")));

        mongoClient.close();
    }

}
