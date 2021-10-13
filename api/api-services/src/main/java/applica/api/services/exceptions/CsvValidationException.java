package applica.api.services.exceptions;

public class CsvValidationException extends Exception {
    public CsvValidationException(String error) {
        super(error);
    }
}
