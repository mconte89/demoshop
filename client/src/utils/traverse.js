import _ from "underscore";

function ownerObject(object, propertyPath) {
    if (propertyPath === null || propertyPath === undefined) {
        return null;
    }
    var path = propertyPath.split(".");
    if (path.length == 1) {
        return object;
    } else if (path.length > 1) {
        let owner = object[path[0]];
        if (!owner) {
            owner = {};
            object[path[0]] = owner;
        }
        path = path.slice(1);
        
        return ownerObject(owner, path.join("."));
    } else {
        throw new Error("Owner property not found: " + propertyPath);
    }
}

function set(object, property, value) {
    if (property === null || property === undefined) {
        return;
    }
    const owner = ownerObject(object, property);
    const prop = _.last(property.split("."));
    owner[prop] = value;
}

function get(object, property) {
    if (property === null || property === undefined) {
        return null;
    }
    const owner = ownerObject(object, property);
    const prop = _.last(property.split("."));
    return owner[prop];
}

class Traverser {
    constructor(object) {
        this.object = object;
    }

    set(path, value) {
        set(this.object, path, value);
    }

    get(path, value) {
        return get(this.object, path);
    }
}

export default function traverse(object) {
    return new Traverser(object);
}