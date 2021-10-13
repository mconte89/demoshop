package applica.api.domain.model.csv;

/**
 * Applica
 * User: Alberto Montemurro
 * Date: 10/17/14
 * Time: 4:54 PM
 * To change this template use File | Settings | File Templates.
 */
public class NoHeaderException extends Exception {

    public NoHeaderException() {
        super("Nessuna riga di intestazione trovata");
    }

}
