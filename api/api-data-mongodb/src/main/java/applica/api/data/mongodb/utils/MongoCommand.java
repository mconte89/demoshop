package applica.api.data.mongodb.utils;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.CommandResult;
import com.mongodb.DB;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

/**
 * Created by flavio on 10/02/17.
 */
public class MongoCommand {

    private DB db;
    private String js;

    public MongoCommand(DB db, String js) {
        this.db = db;
        this.js = js;
    }

    public MongoCommand(DB db) {
        this.db = db;
    }

    public void load(String id) {
        this.js = null;

        InputStream in = getClass().getResourceAsStream(String.format("/mongo/commands/%s.js", id));
        if (in != null) {
            try {
                this.js = IOUtils.toString(in, "UTF-8");
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                IOUtils.closeQuietly(in);
            }
        }

        if (this.js == null) {
            throw new RuntimeException("Cannot load mongo command script: " + id);
        }
    }

    public CommandResult execute(Object... args) {
        Objects.requireNonNull(this.js, "js not loaded");
        return this.db.command(BasicDBObjectBuilder.start()
                .add("$eval", this.js)
                .add("args", args)
                .add("nolock", true)
                .get());
    }

    public String getJs() {
        return js;
    }

    public void setJs(String js) {
        this.js = js;
    }
}
