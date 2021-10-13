package applica.api.domain.model.csv;
import java.util.Hashtable;

/**
 * Applica
 * User: Alberto Montemurro
 * Date: 10/17/14
 * Time: 5:54 PM
 * To change this template use File | Settings | File Templates.
 */
public class RowData {

    private Hashtable<String, String> data = new Hashtable();
    private String rowValidationError ="";

    public boolean isValid() {
        return valid;
    }

    private boolean valid = true;


    public String getRowValidationError() {
        return rowValidationError;
    }


    void validateRow(RowValidator validator){

        if (validator == null)
            return;

        validator.validateRow(data);

        rowValidationError = validator.getError();
        valid = validator.isValid();

    }


    public Hashtable<String, String> getData() {
        return data;
    }

    public void setData(Hashtable<String, String> data) {
        this.data = data;
    }





}
