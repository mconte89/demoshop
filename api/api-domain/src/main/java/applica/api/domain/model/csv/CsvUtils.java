package applica.api.domain.model.csv;

import java.io.File;
import java.io.IOException;
import java.util.Hashtable;
import java.util.List;

public class CsvUtils {
    public static File generateCsvFile(String fileName, List<Hashtable<String, String>> data, List<String> headers) throws Exception {
        CsvExporter exp = new CsvExporter();
        try {
            File temp = File.createTempFile(fileName,".csv");
            String filePath = temp.getAbsolutePath();
            //creo il path del file da esportare
            exp.generateCsvFile(filePath, data, headers, ";");

            //a questo punto posso leggere il file csv generato e verificare che non ha errori
            CsvReader reader = new CsvReader(filePath, ";");
            CsvInfo info = reader.readFile();

            if(info.getError() != null){
                throw new Exception(info.getError());
            }

            return new File(filePath);

        } catch (IOException e) {
            e.printStackTrace();
            throw new Exception("Errore nell'esportazione del csv: " + e.getMessage());
        }
    }
}
