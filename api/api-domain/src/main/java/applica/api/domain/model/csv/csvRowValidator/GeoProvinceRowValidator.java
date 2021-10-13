package applica.api.domain.model.csv.csvRowValidator;


import applica.api.domain.model.csv.RowValidator;
import org.springframework.util.StringUtils;

import java.util.Hashtable;

public class GeoProvinceRowValidator extends RowValidator {

    public static final String CODE = "code";
    public static final String NAME = "name";
    public static final String REGION = "region";
    public static final String NATION_CODE = "nationCode";

    @Override
    public void validateRow(Hashtable<String, String> row) {

        if (!StringUtils.hasLength(row.get(NAME))) {
            this.error = "Nome obbligatorio";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(CODE))){
            this.error = "Codice obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(REGION))){
            this.error = "Regione obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(NATION_CODE))){
            this.error = "Codice nazione obbligatorio";
            this.valid = false;
        }
    }
}
