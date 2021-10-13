import {EventEmitter} from "events";

const instance = new EventEmitter()

export function addObserver(evt, handler) {
    logger.i("Added observer for event:", evt)
    instance.addListener(evt, handler)
    return handler
}

export function removeObserver(evt, handler) {
    logger.i("Removed observer for event:", evt)
    instance.removeListener(evt, handler)
}

export function invoke(evt, data = null) {
    logger.i("Invoking observers for event:", evt)
    instance.emit(evt, data)
}

export function emit(evt, data = null) {
    logger.i("Invoking observers for event:", evt)
    instance.emit(evt, data)
}