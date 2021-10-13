import moment from "moment";
import 'moment/locale/it'  // without this line it didn't work


export const DATE_FORMAT_DATEPICKER = "DD/MM/YYYY"
export const DATE_FORMAT_FULL_WITH_HOURS = "DD MMM YYYY, HH:mm"
export const DATE_FORMAT_FULL = "DD MMM YYYY"

export function momentInstance() {
    return moment;
}

export function formatDate(date, format= DATE_FORMAT_DATEPICKER) {
    try {
        return momentInstance()(date).format(format);
    } catch (e) {
        return date;
    }
}


//date.valueOf() ->timestamp con moment

export function getDateFromString(date, format = DATE_FORMAT_DATEPICKER) {
    return momentInstance()(date, format);
}



export function addDaysToDate(date, days = 0) {
    try {
        return momentInstance()(date).add( days, 'days').toDate()
    } catch (e) {
        return date;
    }
}

export function addMonthsToDate(date, months = 0) {
   try {
       return momentInstance()(date).add(months, 'months').toDate()
   } catch (e) {
       return date;
   }
}


