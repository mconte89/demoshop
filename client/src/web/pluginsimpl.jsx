import _ from "underscore";
import * as aj from "../aj";

exports.Alert = {
    alert(data, callback) {
        let {title, message, type} = data;
        let _callback = (v) => { if (_.isFunction(callback)) {  callback(v) } }
        swal({title, text: message, type}).then((res) => _callback(res.value))
    },

    confirm(data, callback) {
        let {title, message} = data;
        let _callback = (v) => { if (_.isFunction(callback)) {  callback(v) } }
        swal({title, text: message, showCancelButton: true}).then((res) => _callback(false)).catch(() => _callback(true));
    }
}

let loaderCount = 0;
let unobtrusiveLoaderCount = 0;

exports.Loader = {
    show(data, callback) {
        loaderCount++
        $(".global-loader").stop().fadeIn(125);
    },

    hide(data, callback) {
        loaderCount--
        if (loaderCount <= 0) {
            $(".global-loader").stop().fadeOut(125);
            loaderCount = 0
        }
    },

    showUnobtrusive(data, callback) {
        unobtrusiveLoaderCount++
        $(".unobtrusive-loader").show()
        $(".hide-on-unobtrusive-loading").hide();
    },

    hideUnobtrusive(data, callback) {
        unobtrusiveLoaderCount--;
        if (unobtrusiveLoaderCount <= 0) {
            $(".unobtrusive-loader").hide()
            $(".hide-on-unobtrusive-loading").show();
        }
    }
}

exports.Toast = {
    show(data, callback) {
        $.notify({
            message: data.message,
        },{
            // settings
            element: 'body',
            position: null,
            type: "inverse",
            allow_dismiss: true,
            newest_on_top: false,
            showProgressbar: false,
            placement: {
                from: "bottom",
                align: "center"
            },
            offset: {
                x: 20,
                y: 85
            },
            spacing: 10,
            z_index: 1031,
            delay: 2500,
            timer: 1000,
            url_target: '_blank',
            mouse_over: false,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            onShow: null,
            onShown: null,
            onClose: null,
            onClosed: null,
            icon_type: 'class',
            // template: '<div data-notify="container" class="col-11 col-sm-3 alert alert-{0}" role="alert">' +
            // '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            // '<span data-notify="icon"></span> ' +
            // '<span data-notify="title">{1}</span> ' +
            // '<span data-notify="message">{2}</span>' +
            // '<div class="progress" data-notify="progressbar">' +
            // '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            // '</div>' +
            // '<a href="{3}" target="{4}" data-notify="url"></a>' +
            // '</div>'
            template: '<div data-growl="container" class="col-11 col-sm-2 alert alert-{0}" role="alert">' +
                '<button type="button" class="close" data-growl="dismiss">' +
                '<span aria-hidden="true">&times;</span>' +
                '<span class="sr-only">Close</span>' +
                '</button>' +
                '<span data-growl="icon"></span>' +
                '<span data-growl="message">{2}</span>' +
                '<a href="#" data-growl="url"></a>' +
                '</div>'
        });
    }
}

exports.register = function() {
    aj.registerPlugin("Alert", exports.Alert);
    aj.registerPlugin("Toast", exports.Toast);
    aj.registerPlugin("Loader", exports.Loader);
}

