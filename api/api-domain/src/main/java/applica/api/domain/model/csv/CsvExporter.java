package applica.api.domain.model.csv;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Hashtable;
import java.util.List;

public class CsvExporter {
    private String crl = "\n";

    public  void generateCsvFile(String sFileName, List<Hashtable<String, String>> data, List<String> headers, String delimiter) throws IOException {

        FileWriter writer = new FileWriter(sFileName);

        //scrivo l'intestazione
        writeHeaders(headers, delimiter, writer);


        for (Hashtable<String, String> row : data) {
            writeRow(row, delimiter, writer, headers);
        }

        writer.flush();
        writer.close();

    }

    private void writeRow(Hashtable<String, String> row, String delimiter, FileWriter writer, List<String> headers) throws IOException {

        int rowPosition = 0;
        for (String header : headers) {
            rowPosition++;

            String data = row.get(header);
            if (data != null)
                writer.append(data.replace(delimiter, "").replace(crl, ""));//rimuovo dal dato che devo scrivere un eventuale carattere uguale al delimitatore

            //se è l'ultima intestazione vado a capo
            if (rowPosition == headers.size())
                writer.append(crl);
            else
                writer.append(delimiter);

        }

    }

    private void writeHeaders(List<String> headers, String delimiter, FileWriter writer) throws IOException {
        int headerPosition = 0;
        for (String header : headers) {
            headerPosition++;
            writer.append(header.replace(delimiter, "").replace(crl, ""));//rimuovo dal dato che devo scrivere un eventuale carattere uguale al delimitatore

            //se è l'ultima intestazione vado a capo
            if (headerPosition == headers.size())
                writer.append(crl);
            else
                writer.append(delimiter);

        }
    }
}
