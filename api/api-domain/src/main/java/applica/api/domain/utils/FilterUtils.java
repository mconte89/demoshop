package applica.api.domain.utils;

import applica.framework.Disjunction;
import applica.framework.Filter;
import applica.framework.Query;
import applica.framework.library.utils.DateUtils;

import java.util.Calendar;
import java.util.Date;

public class FilterUtils {

    public static void parseBooleanFilter(String property, Query query) {
        if (query.hasFilter(property)) {
            query.getFilters().stream()
                    .filter(filter -> filter.getProperty().equals(property))
                    .findFirst()
                    .ifPresent(filter -> filter.setValue(filter.getValue().equals("true")));
        }
    }

    public static void addBooleanFilter(String property, Query query) {
        Filter f = null;
        if (query.getFilterValue(property).equals("true")){
            f = new Filter(property, true, query.getFilterType(property));
        } else {
            f = createBooleanFalseOrNotExistingFilter(property);
        }
        query.getFilters().removeIf(fi -> fi.getProperty().equals(property));
        query.getFilters().add(f);
    }

    public static Filter createBooleanFalseOrNotExistingFilter(String property) {
        Disjunction disjunction = new Disjunction();
        disjunction.getChildren().add(new Filter(property, false));
        disjunction.getChildren().add(new Filter(property, false, Filter.EXISTS));
        return disjunction;
    }

    public static void parseDateFilter(String property, Query query) {
        if (query.hasFilter(property)) {
            query.getFilters().stream()
                    .filter(filter -> filter.getProperty().equals(property))
                    .findFirst()
                    .ifPresent(filter -> {
                        Calendar calendar = DateUtils.getCalendarInstance(new Date(Long.parseLong(query.getFilterValue(property).toString())));
                        filter.setValue(calendar.getTime());
                    });
        }

    }
}
