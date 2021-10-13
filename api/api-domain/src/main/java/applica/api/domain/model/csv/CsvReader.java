package applica.api.domain.model.csv;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Applica
 * User: Alberto Montemurro
 * Date: 10/17/14
 * Time: 4:14 PM
 * To change this template use File | Settings | File Templates.
 */
public class CsvReader {

    String csvFile;
    String separator;
    RowValidator validator;


    public CsvReader(String file, String separator){
        this.csvFile = file;
        this.separator = separator;

    }

    public CsvReader(String file, String separator, RowValidator validator){
        this.csvFile = file;
        this.separator = separator;
        this.validator = validator;
    }

    public CsvInfo readFile() {

        //per prima cosa verifico l'esistenza del file da parserizzare
        File fileToParse = new File(csvFile);
        if (!fileToParse.exists()){
            return getCsvInfoError("Il file csv non esiste");
        }

        //verifico il file sia un file csv
        String ext = FilenameUtils.getExtension(csvFile);
        if (!ext.toLowerCase().equals("csv")){
            return getCsvInfoError("Il file indicato non è un file csv");
        }

        //definisco il risultato
        CsvInfo result = new CsvInfo();

        BufferedReader br = null;
        String line = "";
        int rowNumber = 0;

        try {

            //creo il reader del file
            br =  new BufferedReader(new InputStreamReader(new FileInputStream(csvFile),"ISO-8859-1"));
            //creo la lista delle righe
            List<RowData> data = new ArrayList<RowData>();


            while ((line = br.readLine()) != null) {

                // use comma as separator
                String[] headers = line.split(separator, -1);

                if (rowNumber == 0){ //si tratta dell'intestazione
                    result.setHeaderFields(getFields(headers));
                    result.setFieldsNumber(result.getHeaderFields().size());
                }else{

                    //qui devo recuperare l'array che contiene i dati

                    //se trovo una riga vuota o con qualche spazio la lascio perdere
                    String trimmedLine = line.trim();

                    if (!StringUtils.isEmpty(trimmedLine)){
                        String[] rowdata =  line.split(separator, -1);
                        //come presupposto devo verificare che il numero degli elementi del rowdata
                        //sia identico a quello degli headers
                        if (rowdata.length != result.getFieldsNumber())
                            throw new FieldsNumberException();

                        //adesso posso creare una hashtable con i valori della riga
                        int dataNumber = 0;
                        RowData row = new RowData();

                        for (String propName : result.getHeaderFields()) {
                            //tolgo eventuali apici
                            row.getData().put(propName, rowdata[dataNumber].replace("\"",""));
                            dataNumber++;
                        }

                        //recuperata la riga e la valido
                        row.validateRow(validator);
                        data.add(row);
                    }


                }


                //incremento il numero di riga parserizzata
                rowNumber++;



            }

            //imposto il numero di rghe
            result.setImportedTableRows(data);
            result.setRecordNumber(data.size());
            result.setSourceFile(this.csvFile);


            //verifico il numero di righe che non hanno passato la validazione
            int rowErrors = 0;
            int index = 1;// è il riferimento alla riga di cui si sta valutando l'esito della validazione
            for (RowData rowData : data) {
                if (!rowData.isValid()){
                    rowErrors++;
                    result.getNonValidatedRowIndexes().add(index);
                }
                index++;
            }

            result.setRowValidationErrors(rowErrors);

        } catch (FileNotFoundException e) {

            return getCsvInfoError(e);

        } catch (IOException e) {

            return getCsvInfoError(String.format("Eccezione nella lettura del file alla riga %s: %s", rowNumber , e.getMessage()));

        } catch (NoHeaderException e) {

            return getCsvInfoError(e);

        } catch (FieldsNumberException e) {

            return getCsvInfoError(String.format("Eccezione nella lettura del file alla riga %s: %s", rowNumber, e.getMessage()));

        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }



        return result;

    }

    private List<String> getFields(String[] row) throws NoHeaderException {
        List<String> headers = new ArrayList<String>();

        for (String s : row) {
            //rimuovo oltre al carattere speciale apice
            headers.add(s.replace("\"",""));
        }

        if (headers.size() == 0)
            throw new NoHeaderException();

        return headers;
    }

    private CsvInfo getCsvInfoError(String error) {

        CsvInfo info = new CsvInfo();
        info.setError(error);
        return info;
    }


    private CsvInfo getCsvInfoError(Exception error) {

        CsvInfo info = new CsvInfo();
        info.setError(error.getMessage());
        return info;
    }



}
