"use strict"

import * as aj from "../aj/index";
import {completed, failed} from "../utils/ajex";
import * as actions from "../actions/types";
import _ from "underscore";
import {SESSION} from "./types";

const defaultState = function() {
    return {
        isLoggedIn: false,
        user: null,
        error: false,
        resumeComplete: false,
        firstLogin: false,
    };
}

export const SessionStore = aj.createStore(SESSION, (state = defaultState(), action) => {

    switch (action.type) {
        case actions.RESET_PASSWORD_CHANGE:
            return _.assign(state, defaultState());

        case actions.LOGIN:
            return _.assign(state, { isLoggedIn: false });

        case completed(actions.LOGIN):
            return _.assign(state, { isLoggedIn: true, user: action.user, error: false });

        case failed(actions.LOGIN):
            return _.assign(state, { isLoggedIn: false, error: true });

        case actions.RESUME_SESSION:
            return _.assign(state, { isLoggedIn: false, resumeComplete: false });

        case completed(actions.RESUME_SESSION):
            return _.assign(state, { isLoggedIn: true, user: action.user, error: false, resumeComplete: true });

        case failed(actions.RESUME_SESSION):
            return _.assign(state, { isLoggedIn: false, error: true, resumeComplete: true });

        case actions.LOGOUT:
            return _.assign(state, {isLoggedIn: false, user: null, error: false, resumeComplete: false})

        case actions.CHANGE_PASSWORD:
            return _.assign(state, {action: actions.CHANGE_PASSWORD,  error:null });

        case completed(actions.CHANGE_PASSWORD):
            return _.assign(state, {action: actions.CHANGE_PASSWORD, firstLogin: action.firstLogin, user: action.user, error: false });
            
        case failed(actions.CHANGE_PASSWORD):
            return _.assign(state, {action: actions.CHANGE_PASSWORD, error:true });
    }

});

SessionStore.defaultState = defaultState;

export default SessionStore;