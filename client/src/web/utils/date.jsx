import moment from "moment";

function formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format)
}


exports.formatDate = formatDate

