const config = require("../framework/config")

import * as _ from "underscore"
import * as utils from "./utils"

function get(url, data) {
    url = config.get("service.url") + url

    return utils.get(url, data)
}

function post(url, data) {
    url = config.get("service.url") + url

    return utils.post(url, data)
}

function postJson(url, data) {
    url = config.get("service.url") + url

    return utils.postJson(url, data)
}

function put(url, data) {
    url = config.get("service.url") + url

    return utils.put(url, data)
}

function delete_(url, data) {
    url = config.get("service.url") + url

    return utils.delete_(url, data)
}

function uploadBase64(url, base64) {
    url = config.get("service.url") + url

    return utils.post(url, base64, {"Content-Type": "text/plain"});
}

function multipart(url, data) {
    url = config.get("service.url") + url
    
    const options = {
        headers: utils.addToken({
            'Content-Type': 'multipart/form-data'
        }),
        method: 'POST'
    };
    
    options.body = new FormData();
    for (let key in data) {
        options.body.append(key, data[key]);
    }
    
    return fetch(url, options).then(response => response.json());
}

const Api = {
    get,
    post,
    put,
    postJson,
    "delete": delete_,
    uploadBase64,
    multipart
}

export default Api;