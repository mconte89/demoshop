import { isEmpty } from "underscore";

export function ext(path) {
    if (isEmpty(path)) {
        return "";
    }

    var index = path.lastIndexOf(".");
    if (index == -1) {
        return "";
    }

    return path.substring(index);
}

export function removeExt(path) {
    if (isEmpty(path)) {
        return path;
    }

    var index = path.lastIndexOf(".");
    if (index == -1) {
        return path;
    }

    return path.substring(0, index);
}