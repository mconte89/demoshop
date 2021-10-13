import React from "react";
import {discriminated} from "./ajex"
import _ from "underscore";

function connectInternal(setState, component, stores, localState) {
    let singleStore = !_.isArray(stores)

    if (!_.isArray(stores)) {
        stores = [stores]
    }

    let originals = {
        componentDidMount: component.componentDidMount,
        componentWillUnmount: component.componentWillUnmount
    }

    if (singleStore) {
        component.state = singleStore.state || localState
    }

    component.componentDidMount = function() {
        let mergedState = {}

        _.each(stores, store => {
            store.subscribe(component, state => setState(component, state))
            
            mergedState = _.assign(mergedState, store.state)
        })

        if (_.isFunction(originals.componentDidMount)) {
            originals.componentDidMount.call(component)
        }

        setState(component, mergedState)
    }

    component.componentWillUnmount = function() {
        _.each(stores, store => {
            store.unsubscribe(component)
        })

        if (_.isFunction(originals.componentWillUnmount)) {
            originals.componentWillUnmount.call(component)
        }
    }
}

function _connect(component, stores, localState = {}) {
    if (_.isFunction(component) && stores === undefined) {
        return _connectPropsOf(component);
    }
    return connectInternal((component, state) => component.setState(state), component, stores, localState)
}

export function connectDiscriminated(discriminator, component, stores, localState = {}) {
    return connectInternal((component, state) => component.setState(discriminated(state, discriminator)), component, stores, localState)
}

function _connectPropsOf(component) {
    return {
        to: function(storeOrStores, stateMapper, actionMapper) {
            let stores = [];
            if (_.isArray(storeOrStores)) {
                stores = storeOrStores;
            } else {
                stores.push(storeOrStores);
            }

            const actions = actionMapper ? actionMapper() : {};

            return class ConnectedComponent extends React.Component {

                constructor(props) {
                    super(props);
            
                    var mergedState = {};
                    stores.forEach(store => {
                        mergedState = {...mergedState, ...store.state};
                    })

                    this.state = mergedState;

                    stores.forEach(store => store.subscribe(this, (state) => {
                        this.setState(state);
                    }));
                }
            
                componentDidMount() {
                    if (_.isFunction(actions.onInit)) {
                        actions.onInit(this.props, this.state);
                    }
                }
            
                componentWillUnmount() {
                    stores.forEach(store => store.unsubscribe(this));

                    if (_.isFunction(actions.onDestroy)) {
                        actions.onDestroy(this.props, this.state);
                    }
                }
            
                render() {
                    const Component = component;
                    const props = _.assign(stateMapper(this.state), this.props);
                    const actions = actionMapper ? actionMapper() : {};
            
                    return <Component {...props} {...actions} />
                }
            
            }
        }
    }
}

export const connect = _connect;
export const connectPropsOf = _connectPropsOf;