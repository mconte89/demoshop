/**
 * AJ Framework main module. Contains functions to create hybrid applications using flux framework
 * @module aj
 */

const _ = require("underscore")
const Observable = require("./events").Observable;

var __stores = {};
var __actions = {};
var __plugins = {};

class Store extends Observable {
    constructor(type, reducer) {
        super();

        this.type = type;
        this.reducer = reducer;
        this.subscriptions = [];
    }

    init(options) {}

    subscribe(owner, subscription) {
        this.subscriptions.push({owner, subscription});
    }

    unsubscribe(owner) {
        this.subscriptions = _.filter(this.subscriptions, s => s.owner != owner);
    }

    trigger(state) {
        let newState = state || this.state;

        _.each(this.subscriptions, s => {
            s.subscription(newState);
        });
    }

    dispatch(action) {
        if (_.isFunction(this.reducer)) {
            var newState = this.reducer(this.state, action);
            if (newState) {
                this.state = newState;

                this.trigger()
            }
        } else {
            logger.w("Cannot dispatch action:", this.type + "." + action);
        }
    }
}

/**
 * @function createStore
 * @description Creates a new singleton instance of store
 * @param {string} type - Name of store to create
 * @param {function} reducer - Store reducer
 * @returns {store} - The newly created store
 */
export function createStore(type, reducer) {
    if (_.has(__stores, type)) {
        throw "Cannot create store " + type + ". Only one instance of store is allowed";
    }

    var store = new Store(type, reducer);
    __stores[type] = store;

    logger.i("Store created:", type);

    return store;
}

/**
 * @function createAction
 * @Description Creates a new action for the application
 * @param {string} type - Type of action to create
 * @param {function} action - Action to execute
 * @returns {function} The newly created action
 */
export function createAction(type, fn) {
    if (type == undefined) {
        throw new Error("Action type is undefined")
    }

    if (_.has(__actions, type)) {
        throw "Cannot create action " + type + ". Already created";
    }

    var act = __actions[type] = (data) => {
        if (DEBUG) {
            logger.i("Running action", type);
            logger.i(data);
        }
        return fn(data);
    };

    logger.i("Action created:", type);

    return act;
}

/**
 * @function dispatch
 * @description Dispatch action to stores, usually called by actions
 * @param {object} data - Data to pass to stores
 */
export function dispatch(action) {
    if (DEBUG) {
        logger.i("Dispatching action", action.type);
        logger.i(action);
    }

    _.each(__stores, (store) => {
        try {
            store.dispatch(action);
        } catch (e) {
            if (e && e.stack) { logger.e(e.stack); }
            logger.e(e);
        }
    });
}

/**
 * @function run
 * @description Run specified action. This is not the common method to call actions, but it's necessary for managing actions from
 * devices. On JS side, call actions directly
 * @param {type} type - Type of action to call
 * @param {data} type - Data to pass to action
 */
export function run(action, data) {
    if (_.has(__actions, action)) {
        __actions[action](data);
    } else {
        logger.w("Cannot find action: " + action);
    }
}

export function registerPlugin(pluginName, pluginClass) {
    if (pluginName == undefined) {
        throw new Error("Plugin pluginName is undefined")
    }

    if (_.has(__plugins, pluginName)) {
        throw "Cannot register plugin " + pluginName + ". Already registered";
    }

    __plugins[pluginName] = pluginClass;

    logger.i("Plugin registered:", pluginName);
}

/**
 * @function exec
 * @description Exec a plugin method
 * @param {string} plugin - The plugin
 * @param {method} method - The plugin method to call
 * @param {data} data - Data to pass to plugin
 * @param {callback} callback - Callback called when plugin method is complete
 * @returns {Promise} - A promise of plugin call result
 */
export function exec(plugin, method, data) {
    logger.i("Executing plugin", plugin + "." + method)

    //executes a class method with data, simply
    var Plugin = __plugins[plugin];
    if (!_.isObject(Plugin)) {
        throw new Error("Plugin " + plugin + " not registered");
    }

    var fn = Plugin[method];

    if (!_.isFunction(fn)) {
        throw new Error("Plugin method " + plugin + "." + method +  " not found");
    }

    return new Promise((resolve, reject) => {
        fn(data, function(error, value) {
            if (error) {
                reject(value)
            } else {
                resolve(value)
            }
        })
    })
}