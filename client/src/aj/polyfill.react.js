import _ from "underscore";
import fetch from "node-fetch";
import AsyncStorage from '@react-native-community/async-storage';

(function(exports) {

    exports.DEBUG = true;

    exports.LOG_LEVEL_INFO = 3;
    exports.LOG_LEVEL_WARNING = 2;
    exports.LOG_LEVEL_ERROR = 1;
    exports.LOG_LEVEL_DISABLED = 0;

    exports.LOG_LEVEL = LOG_LEVEL_INFO;

    /**
     * async method utility
     */

    const async = exports.async = (fn) => setTimeout(fn, 0);

    /**
     * path utils
     */

    const path = exports.path = {
        separator: "/",

        normalize: function(path, endingSeparator) {
            if (!_.isString(path)) {
                throw new Error("path is not a string");
            }

            var tree = path.split("/");
            var normalizedTree = [];
            _.each(tree, function(node) {
                if (node == "..") {
                    normalizedTree = _.initial(normalizedTree);
                } else if (node != ".") {
                    normalizedTree.push(node);
                }
            });

            var normalizedPath = normalizedTree.join(this.separator);
            if (endingSeparator) {
                if (!normalizedPath.endsWith(this.separator)) {
                    normalizedPath = normalizedPath + this.separator;
                }
            } else {
                if (normalizedPath.endsWith(this.separator)) {
                    if (path.size > 2) {
                        normalizedPath = normalizedPath.substring(0, normalizedPath.length - 2);
                    }
                }
            }

            return normalizedPath;
        },

        name: function(path, includeExtension) {
            if (!_.isString(path)) {
                throw new Error("path is not a string");
            }

            var name = null;
            var index = path.lastIndexOf(this.separator);

            if (index == -1) {
                name = path;
            } else {
                name = path.substring(index + 1);
            }

            if (!includeExtension) {
                index = name.lastIndexOf(".");
                if (index != -1) {
                    if (name.length > 2) {
                        name = name.substring(0, index);
                    }
                }
            }

            return name;
        },

        removeExtension: function(path) {
            if (!_.isString(path)) {
                throw new Error("path is not a string");
            }

            var index = path.lastIndexOf(".");
            if (index != -1) {
                if (path.length > 2) {
                    path = path.substring(0, index);
                }
            }

            return path;
        },

        join: function(p1, p2) {
            if (!_.isString(p1)) {
                throw new Error("p1 is not a string");
            }

            if (!_.isString(p2)) {
                throw new Error("p2 is not a string");
            }

            if (_.isEmpty(p1)) {
                return p2;
            }

            if (_.isEmpty(p2)) {
                return p1;
            }

            if (p1.endsWith(this.separator)) {
                if (p1.length > 2) {
                    p1 = p1.substr(0, p1.length - 2);
                }
            }

            if (p2.startsWith(this.separator)) {
                if (p2.length > 2) {
                    p2 = p2.substr(1);
                }
            }

            return p1 + this.separator + p2;
        },

        base: function(path) {
            if (!_.isString(path)) {
                throw new Error("path is not a string");
            }

            var index = path.lastIndexOf(this.separator);
            if (index != -1) {
                if (path.length > 2) {
                    path = path.substring(0, index);
                    return path;
                }
            }

            return "";
        }
    };

    /**
     * Logger
     */

    const logger = exports.logger = {
        i: function(msg) {
            if (LOG_LEVEL >= LOG_LEVEL_INFO) {
                if (arguments.length == 1) {
                    console.log(msg);
                } else {
                    console.log(Array.prototype.join.call(arguments, " "));
                }
            }
        },

        e: function(msg) {
            if (LOG_LEVEL >= LOG_LEVEL_ERROR) {
                if (arguments.length == 1) {
                    console.log(msg);
                } else {
                    console.log(Array.prototype.join.call(arguments, " "));
                }
            }
        },

        w: function(msg) {
            if (LOG_LEVEL >= LOG_LEVEL_WARNING) {
                if (arguments.length == 1) {
                    console.log(msg);
                } else {
                    console.log(Array.prototype.join.call(arguments, " "));
                }
            }
        }
    };

    /**
     * Device
     */

    exports.device = {
        getName: function() {
            return "react"
        },

        getHeight: function() {
            throw new Error("Not implemented");
        },

        getWidth: function() {
            throw new Error("Not implemented");
        },

        getScale: function() {
            throw new Error("Not implemented");
        }
    };

    /**
     * Platform
     */

    exports.platform = {
        engine: "native",
        device: "browser"
    };

    /***
     * Buffers manager
     */

    exports.__buffersManager = {
        create: function(base64, cb) {
            throw new Error("Not implemented");
        },

        get: function(id, cb) {
            throw new Error("Not implemented");
        },

        destroy: function(id, cb) {
            throw new Error("Not implemented");
        }
    };

    /**
     * AJ Web Runtime (deprecated)
     */

    exports.__trigger = function(store, state) {
        //nothing, already done in js
    };

    exports.__exec = function(plugin, method, data, callback) {
        throw new Error("Plugins are deprecated");
    };

    /**
     * Http
     */

    global.__httpClient = {
        request: function(url, method, data, headers, accept, contentType, rawResponse, cb) {
            return fetch(
                url, 
                {
                    method: method,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                        ...headers,
                    },
                    body: data,
                }
            )
            .then(r => cb(false, rawResponse ? r.blob() : r.text()))
            .catch(e => cb(true, e))            
        }
    };

    /**
     * Assets
     */

    global.__assetsManager = {
        load: function(path, cb) {
            $.ajax({
                url: url,
                method: "GET",
                success: function(response) {
                    cb(false, response);
                },
                error: function(xhr, err) {
                    cb(true, err);
                }
            })
        },

        exists: function(path, cb) {
            cb(false, true);
        }
    };

    /**
     * Storage
     */

    (function() {

        function checkSupport() {
            if (!AsyncStorage) {
                throw new Error("No support for storage manager");
            }
        }

        global.__storageManager = {
            readText: async function(path, cb) {                
                try {
                    checkSupport();

                    var item = await AsyncStorage.getItem(path);
                    cb(false, item);
                } catch (e) {
                    cb(true, e);
                }
            },

            writeText: async function(path, content, cb) {
                try {
                    checkSupport();

                    await AsyncStorage.setItem(path, content);
                    cb(false);
                } catch (e) {
                    cb(true, e);
                }
            },

            delete: async function(path, cb) {
                try {
                    checkSupport();

                    await localStorage.setItem(path, null);
                    cb(false);
                } catch (e) {
                    cb(true, e);
                }
            },

            exists: async function(path, cb) {
                try {
                    checkSupport();

                    var exists = await AsyncStorage.getItem(path)
                    cb(false, exists != null);
                } catch (e) {
                    cb(true, e);
                }
            }
        };


    })();

})(window || global);

