package applica.api.domain.model.csv.csvRowValidator;

import applica.api.domain.model.csv.RowValidator;
import org.springframework.util.StringUtils;

import java.util.Hashtable;

public class GeoNationRowValidator extends RowValidator {

    public static final String CODE = "code";
    public static final String DESCRIPTION = "description";

    @Override
    public void validateRow(Hashtable<String, String> row) {

        if (!StringUtils.hasLength(row.get(DESCRIPTION))) {
            this.error = "Nome obbligatorio";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(CODE))){
            this.error = "Codice obbligatoria";
            this.valid = false;
        }
    }
}
