package applica.api.domain.model.csv;

import java.util.ArrayList;
import java.util.List;

/**
 * Applica
 * User: Alberto Montemurro
 * Date: 10/17/14
 * Time: 3:56 PM
 * To change this template use File | Settings | File Templates.
 */
public class CsvInfo {

    //restituisce la lista di righe del file cvs
    //p.s. ogni riga è rappresentata da una hash table do la chiave è il rispettivo campo di intestazione
    private List<RowData> importedTableRows;

    //restituisce il numero dei record trovati
    private int recordNumber;

    //restituisce il numero di campi trovati
    private int fieldsNumber;

    //restituisce la lista ordinata dei campi di intestazione del file
    private List<String> headerFields;

    //restituisce il percorso del file sorgente
    private String sourceFile;

    //restituisce l'errore del parsing del file
    private String error;

    //indica se ci sono errori di validazione nelle righe e quanti sono
    private int rowValidationErrors;

    //indica gli indici delle righe che non hanno passato la validazione
    private List<Integer> nonValidatedRowIndexes = new ArrayList();



    void setRowValidationErrors(int rowValidationErrors) {
        this.rowValidationErrors = rowValidationErrors;
    }


    void setError(String error) {
        this.error = error;
    }

    void setSourceFile(String sourceFile) {
        this.sourceFile = sourceFile;
    }

    void setHeaderFields(List<String> headerFields) {
        this.headerFields = headerFields;
    }

    void setFieldsNumber(int fieldsNumber) {
        this.fieldsNumber = fieldsNumber;
    }

    void setRecordNumber(int recordNumber) {
        this.recordNumber = recordNumber;
    }

    void setImportedTableRows(List<RowData> importedTableRows) {
        this.importedTableRows = importedTableRows;
    }


    public List<Integer> getNonValidatedRowIndexes() {
        return nonValidatedRowIndexes;
    }

    public String getError() {
        return error;
    }

    public String getSourceFile() {
        return sourceFile;
    }

    public List<String> getHeaderFields() {
        return headerFields;
    }

    public int getFieldsNumber() {
        return fieldsNumber;
    }

    public int getRecordNumber() {
        return recordNumber;
    }

    public List<RowData> getImportedTableRows() {
        return importedTableRows;
    }

    public int getRowValidationErrors() {
        return rowValidationErrors;
    }


}
