package applica.api.domain.model.csv;

/**
 * Applica
 * User: Alberto Montemurro
 * Date: 10/17/14
 * Time: 6:05 PM
 * To change this template use File | Settings | File Templates.
 */
public class FieldsNumberException extends Exception {

    public FieldsNumberException() {
        super("Il numero dei campi di una riga non è uguale al numero dei campi dell'intestazione");
    }

}
