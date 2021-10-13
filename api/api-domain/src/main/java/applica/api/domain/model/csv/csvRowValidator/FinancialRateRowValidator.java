package applica.api.domain.model.csv.csvRowValidator;

import applica.api.domain.model.csv.RowValidator;
import org.springframework.util.StringUtils;

import java.util.Hashtable;

public class FinancialRateRowValidator extends RowValidator {

    public static final String AMOUNT = "amount";
    public static final String TWELVE = "12";
    public static final String TWENTY_FOUR = "24";
    public static final String THIRTY_SIX = "36";
    public static final String FORTY_EIGHT = "48";
    public static final String SIXTY = "60";

    @Override
    public void validateRow(Hashtable<String, String> row) {

        if (!StringUtils.hasLength(row.get(AMOUNT))) {
            this.error = "Importo obbligatorio";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(TWELVE))){
            this.error = "12 obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(TWENTY_FOUR))){
            this.error = "24 obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(THIRTY_SIX))){
            this.error = "36 obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(FORTY_EIGHT))){
            this.error = "48 obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(SIXTY))){
            this.error = "60 obbligatoria";
            this.valid = false;
        }


    }
}
