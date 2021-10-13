"use strict"


import * as config from "../framework/config";
import {format, optional} from "./lang";
import {addToken} from "../api/utils";
import {ALERT_WARNING, hideLoader, showLoader} from "../plugins";
import * as _ from "underscore";
import M from "../strings";



export function navigateToHref(href) {
    location.href = href;
    scrollOnTop()
}

export function scrollOnTop() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
}

export function collectionUnion() {
    var args = Array.prototype.slice.call(arguments);
    var it = args.pop();

    return _.uniq(_.flatten(args, true), it);
}

export function downloadFile(path, filename, options) {

    if (!options)
        options = {};

    let url = config.get("attachment.download") + "?path=" + path + "&filename=" + optional(filename, "");
    //window.open(url)


    if (!options.callback) {
        options.callback = (base64String, filename, mimetype) => {
            //Utilizza il plugin theme/vendors/download/download.js
            download(base64String, filename, mimetype);
        }
    }

    getFileFromUrl(url, options.callback, options.showLoader);
}

export function downloadFileFromUrl(url) {
    showLoader();
    $.ajax({
        url: url,
        method: "GET",
        headers: addToken({}),
        dataType: "text",
        //accept: accept == null ? undefined : accept,
        //contentType: contentType == null ? undefined : contentType,
        success: function(response) {

            let rsp = JSON.parse(response);

            //Utilizza il plugin theme/vendors/download/download.js
            download(rsp.base64String, rsp.filename, rsp.mimeType);
            hideLoader()
        },
        error: function(xhr, err) {
            hideLoader()
        }
    })

}



export function performAndComplete(options = {}) {
    let title = optional(options.title, M("confirm"))
    let text =  optional(options.text, M("confirm"))
    let showCancelButton = optional(options.showCancelButton, true)
    let type = options.type || ALERT_WARNING
    let confirmCallback = options.confirmCallback
    let cancelCallback = options.cancelCallback

    swal({title: title, text: text, showCancelButton: showCancelButton , type: type})
        .then(res => {
            if (res.value) {
               if (_.isFunction(confirmCallback))
                   confirmCallback()
            } else {
                if (_.isFunction(cancelCallback))
                    cancelCallback()
            }
        })

}



function getFileFromUrl(url, callback, showLoader) {
    if (showLoader)
        showLoader();
    let headers = addToken({});
    $.ajax({
        url: url,
        method: "GET",
        headers: addToken({}),
        dataType: "text",
        beforeSend: request => {
            if (_.isObject(headers)) {
                _.keys(headers).forEach(k => {
                    logger.i("Adding header:", k + "=" + headers[k])
                    request.setRequestHeader(k, headers[k])
                })
            }
        },

        //accept: accept == null ? undefined : accept,
        //contentType: contentType == null ? undefined : contentType,
        success: function(response) {

            let rsp = JSON.parse(response);
            callback(rsp.base64String, rsp.filename, rsp.mimeType)
            if (showLoader)
                hideLoader();
        },
        error: function(xhr, err) {
            if (showLoader)
                hideLoader();
        }

    })

}


