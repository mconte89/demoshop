import { isEmpty } from "underscore";

export function assertTrue(test, msg){
    if (!test) {
        throw "Assertion failure: " + msg || "";
    }
}

export function assertEquals(first, second, msg){
    if (first != second) {
        throw "Assertion failure: " + msg || "";
    }
}

export function assertNotNull(obj, msg){
    if (obj == undefined || obj == null) {
        throw "Assertion failure: " + msg || "";
    }
}

export function assertNotEmpty(obj, msg){
    if (isEmpty(obj)) {
        throw "Assertion failure: " + msg || "";
    }
}
