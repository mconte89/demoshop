package applica.api.domain.model.csv;

import java.util.Hashtable;

/**
 * Applica
 * User: Alberto Montemurro
 * Date: 10/17/14
 * Time: 5:56 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class RowValidator {

    public boolean isValid() {
        return valid;
    }

    protected boolean valid = true;

    public String getError() {
        return error;
    }

    protected String error;


    public abstract void validateRow(Hashtable<String, String> row);



}
