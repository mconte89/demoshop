package applica.api.domain.model.csv.csvRowValidator;


import applica.api.domain.model.csv.RowValidator;
import org.springframework.util.StringUtils;

import java.util.Hashtable;

public class GeoCityRowValidator extends RowValidator {
    public static final String NAME = "name";
    public static final String POSTAL_CODE = "postalCode";
    public static final String PROVINCE_CODE = "provinceCode";
    public static final String ISTAT_CODE = "istatCode";

    @Override
    public void validateRow(Hashtable<String, String> row) {

        if (!StringUtils.hasLength(row.get(NAME))) {
            this.error = "Nome obbligatorio";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(POSTAL_CODE))){
            this.error = "CAP obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(PROVINCE_CODE))){
            this.error = "Provincia obbligatoria";
            this.valid = false;
        }
        if (!StringUtils.hasLength(row.get(ISTAT_CODE))){
            this.error = "ISTAT obbligatoria";
            this.valid = false;
        }
    }
}
