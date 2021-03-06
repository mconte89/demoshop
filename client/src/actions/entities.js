/** Entities **/
"use strict"

import * as aj from "../aj/index";
import {createAsyncAction} from "../utils/ajex";
import * as SessionApi from "../api/session";
import * as responses from "../api/responses";
import {alert, hideLoader, showLoader, toast} from "../plugins";
import M from "../strings";
import * as GridsApi from "../api/grids";
import * as EntitiesApi from "../api/entities";
import * as ValuesApi from "../api/values";
import _ from "underscore";
import {getUserProfileImage} from "./ui"


import {
    CHECK_REVISION_ENABLE_STATUS,
    DELETE_ENTITIES,
    FREE_ENTITIES,
    FREE_LOOKUP,
    FREE_SELECT,
    FREE_SETTINGS_VALUES,
    GET_ENTITY,
    GET_GRID,
    GET_LOOKUP_RESULT,
    GET_LOOKUP_VALUES, GET_QUERY,
    GET_SELECT_ENTITIES,
    GET_SELECT_VALUES,
    LOAD_ENTITIES,
    NEW_ENTITY,
    SAVE_ENTITY,
    SET_MULTIVALUE_SETTINGS, UPDATE_FORM_DATA,
    UPDATE_MULTIVALUE_SETTINGS, UPDATE_QUERY
} from "./types";

export const getGrid = createAsyncAction(GET_GRID, data => {
    if (_.isEmpty(data.id)) {
        alert(M("problemOccoured"), M("pleaseSpecifyId"))
        return
    }

    aj.dispatch({
        type: GET_GRID
    })

    showLoader()
    GridsApi.getGrid(data.id)
        .then(response => {
            hideLoader()

            getGrid.complete({grid: JSON.parse(response.value)})
        })
        .catch(e => {
            hideLoader()
            alert(M("ooops"), responses.msg(e), "error")

            getGrid.fail()
        })
})


let queries = {}

export const loadEntities = createAsyncAction(LOAD_ENTITIES, data => {
    if (_.isEmpty(data.entity)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    showLoader()
    aj.dispatch({
        type: LOAD_ENTITIES,
        discriminator: data.discriminator
    })

    let query = !_.isEmpty(data.query) ? data.query : null
    queries[data.entity] = query

    EntitiesApi.load(data.entity, query)
        .then(response => {
            hideLoader()
            loadEntities.complete({result: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            hideLoader()
            alert(M("ooops"), responses.msg(e), "error")

            loadEntities.fail({discriminator: data.discriminator})
        })
})

export const deleteEntities = createAsyncAction(DELETE_ENTITIES, data => {
    if (_.isEmpty(data.entity)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.ids)) {
        alert(M("problemOccoured"), M("pleaseSpecifyId"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    return new Promise((resolve, reject) => {
        showLoader()
        aj.dispatch({
            type: DELETE_ENTITIES,
            discriminator: data.discriminator
        })
    
        EntitiesApi.delete_(data.entity, data.ids)
            .then(() => {
                hideLoader()
                deleteEntities.complete({discriminator: data.discriminator})
    
                if (_.has(queries, data.entity)) {
                    loadEntities({discriminator: data.discriminator, entity: data.entity, query: queries[data.entity]})
                }

                resolve();
            })
            .catch(e => {
                hideLoader()
                alert(M("ooops"), responses.msg(e), "error")
    
                deleteEntities.fail({discriminator: data.discriminator})

                reject();
            })
    });
    
})

export const saveEntity = createAsyncAction(SAVE_ENTITY, data => {
    if (_.isEmpty(data.entity)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.data)) {
        alert(M("problemOccoured"), M("pleaseSpecifyData"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    return new Promise((resolve, reject) => {
        showLoader()
        aj.dispatch({
            type: SAVE_ENTITY,
            discriminator: data.discriminator
        })

        EntitiesApi.save(data.entity, data.data)
            .then(response => {
                hideLoader()
                toast(M("saveComplete"))

                saveEntity.complete({discriminator: data.discriminator, data: data.data})

                if (data.reload) {
                    getEntity({discriminator: data.discriminator, entity: data.entity, id: response.value.id})
                }

                if (data.entity == "user") {
                    if (SessionApi.getLoggedUser() != null && SessionApi.getLoggedUser().id == data.data.id) {
                        getUserProfileImage()
                    }
                }

                resolve(data.data.id);
            })
            .catch(r => {
                hideLoader()

                if (r.responseCode === responses.ERROR_VALIDATION) {
                    saveEntity.fail({discriminator: data.discriminator, data: data.data, validationError: true, validationResult: r.result})
                } else {
                    alert(M("ooops"), responses.msg(r.responseCode), "error")

                    saveEntity.fail({discriminator: data.discriminator, data: data.data, validationError: false, validationResult: null})
                }

                reject();
            })
        });
});

export const newEntity = aj.createAction(NEW_ENTITY, data => {
    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    aj.dispatch({
        type: NEW_ENTITY,
        discriminator: data.discriminator
    })
})


export const getEntity = createAsyncAction(GET_ENTITY, data => {
    if (_.isEmpty(data.entity)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.id)) {
        alert(M("problemOccoured"), M("pleaseSpecifyId"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    showLoader()
    aj.dispatch({
        type: GET_ENTITY,
        discriminator: data.discriminator
    })

    EntitiesApi.get(data.entity, data.id, data.params)
        .then(response => {
            hideLoader()
            getEntity.complete({data: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            hideLoader()
            alert(M("ooops"), responses.msg(e), "error")

            getEntity.fail({discriminator: data.discriminator})
        })
})

export const freeEntities = aj.createAction(FREE_ENTITIES, data => {
    aj.dispatch({
        type: FREE_ENTITIES,
        discriminator: data.discriminator
    })
})


/**
 * LOOKUP ACTIONS
 */

export const getLookupResult = createAsyncAction(GET_LOOKUP_RESULT, data => {
    if (_.isEmpty(data.entity)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    aj.dispatch({
        type: GET_LOOKUP_RESULT,
        discriminator: data.discriminator
    })

    EntitiesApi.load(data.entity, !_.isEmpty(data.query) ? data.query : null)
        .then(response => {
            getLookupResult.complete({result: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            alert(M("ooops"), responses.msg(e), "error")

            getLookupResult.fail({discriminator: data.discriminator})
        })
})

export const getLookupValues = createAsyncAction(GET_LOOKUP_VALUES, data => {
    if (_.isEmpty(data.collection)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    aj.dispatch({
        type: GET_LOOKUP_VALUES,
        discriminator: data.discriminator
    })

    ValuesApi.load(data.collection, data.keyword, {page: data.page, rowsPerPage: data.rowsPerPage})

        .then(response => {
            getLookupValues.complete({values: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            alert(M("ooops"), responses.msg(e), "error")

            getLookupValues.fail({discriminator: data.discriminator})
        })
})

export const freeLookup = aj.createAction(FREE_LOOKUP, data => {
    aj.dispatch({
        type: FREE_LOOKUP,
        discriminator: data.discriminator
    })
})


/**
 * SELECT ACTIONS
 */

export const getSelectEntities = createAsyncAction(GET_SELECT_ENTITIES, data => {
    if (_.isEmpty(data.entity)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    aj.dispatch({
        type: GET_SELECT_ENTITIES,
        discriminator: data.discriminator
    })

    ValuesApi.loadEntities(data.entity, data.query)
        .then(response => {
            getSelectEntities.complete({entities: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            alert(M("ooops"), responses.msg(e), "error")

            getSelectEntities.fail({discriminator: data.discriminator})
        })
})

export const getSelectValues = createAsyncAction(GET_SELECT_VALUES, data => {
    if (_.isEmpty(data.collection)) {
        alert(M("problemOccoured"), M("pleaseSpecifyEntity"))
        return
    }

    if (_.isEmpty(data.discriminator)) {
        throw new Error("Discriminator is required")
    }

    aj.dispatch({
        type: GET_SELECT_VALUES,
        discriminator: data.discriminator
    })

    ValuesApi.load(data.collection, data.keyword)
        .then(response => {
            getSelectValues.complete({values: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            alert(M("ooops"), responses.msg(e), "error")

            getSelectValues.fail({discriminator: data.discriminator})
        })
})

export const freeSelect = aj.createAction(FREE_SELECT, data => {
    aj.dispatch({
        type: FREE_SELECT,
        discriminator: data.discriminator
    })
})


export const setMultivalueSettings = aj.createAction(SET_MULTIVALUE_SETTINGS, data => {

    aj.dispatch({
        type: SET_MULTIVALUE_SETTINGS,
        items: data.items,
        discriminator: data.discriminator
    })
})

export const updateMultivalueSettings = aj.createAction(UPDATE_MULTIVALUE_SETTINGS, data => {

    aj.dispatch({
        type: UPDATE_MULTIVALUE_SETTINGS,
        itemType: data.itemType,
        enabled: data.enabled,
        discriminator: data.discriminator
    })
})

export const freeSettingValues = aj.createAction(FREE_SETTINGS_VALUES, data => {
    aj.dispatch({
        type: FREE_SETTINGS_VALUES,
        discriminator: data.discriminator
    })
})


export const checkRevisionEnableStatus =  createAsyncAction(CHECK_REVISION_ENABLE_STATUS, data => {

    aj.dispatch({
        type: CHECK_REVISION_ENABLE_STATUS,
        discriminator: data.discriminator
    })

    EntitiesApi.checkRevisionEnableStatus(data.entity)
        .then(response => {
            checkRevisionEnableStatus.complete({revisionEnabled: response.value, discriminator: data.discriminator})
        })
        .catch(e => {
            checkRevisionEnableStatus.fail({discriminator: data.discriminator})
        })
});


export const updateFormData = aj.createAction(UPDATE_FORM_DATA, data => {
    aj.dispatch({
        type: UPDATE_FORM_DATA,
        discriminator: data.discriminator,
        data: data.data
    })
})


export const updateQuery = createAsyncAction(UPDATE_QUERY, data => {
    aj.dispatch({
        type: UPDATE_QUERY,
        query: data.query,
        params: data.params,
        discriminator: data.discriminator

    })
})


export const getQuery = createAsyncAction(GET_QUERY, data => {

    aj.dispatch({
        type: GET_QUERY,
        discriminator: data.discriminator

    })
})