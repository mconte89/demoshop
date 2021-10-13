import { assertNotEmpty } from "./assert";
import path from "./path";
import { decode, encode } from "./base64";

class StorageManager {
    constructor() {
        if (__storageManager == undefined) {
            throw "__storageManager undefined";
        }
    }

    /*
    Read text files and return a promise with the result as string
     */
    readText(path) {
        return new Promise((resolve, reject) => {
            try {
                assertNotEmpty(path, "path is not defined");

                logger.i("Reading text file", path);

                __storageManager.readText(path, (error, value) => {
                    if (error) {
                        logger.e(value);
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            } catch (e) {
                logger.e(e);
                reject(e);
            }
        });
    }

    /*
     Read binary files and return a promise with the result as byte array (transfer with native using base64)
     */
    read(path) {
        throw new Error("Not implemented");
    }

    /*
     Write text files and return a promise with the result of operation
     */
    writeText(path, content) {
        return new Promise((resolve, reject) => {
            try {
                assertNotEmpty(path, "path is not defined");

                logger.i("Writing text file", path);

                __storageManager.writeText(path, content, (error, value) => {
                    if (error) {
                        logger.e(value);
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            } catch (e) {
                logger.e(e);
                reject(e);
            }
        });
    }

    /*
     Write binary files and return a promise with the result of operation
     */
    write(path, bytes) {
        throw new Error("Not implemented");
    }

    /*
     Delete a file and return a promise with the result of operation
     */
    delete(path) {
        return new Promise((resolve, reject) => {
            try {
                assertNotEmpty(path, "path is not defined");

                logger.i("Deleting file", path);

                __storageManager.delete(path, (error, value) => {
                    if (error) {
                        logger.e(value);
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            } catch (e) {
                logger.e(e);
                reject(e);
            }
        });
    }

    /*
     Check file existence and return a promise with the result of operation
     */
    exists(path) {
        return new Promise((resolve, reject) => {
            try {
                assertNotEmpty(path, "path is not defined");

                logger.i("Checking file existence", path);

                __storageManager.exists(path, (error, value) => {
                    if (error) {
                        logger.e(value);
                        reject(value)
                    } else {
                        resolve(value)
                    }
                })
            } catch (e) {
                logger.e(e);
                reject(e);
            }
        });
    }

}

var instance = new StorageManager();

/**
 * Reads text of file in specified path
 * @param path
 * @returns A promise with text result
 */
export function readText(path) {
    return instance.readText(path);
}

/**
 * Reads binary file from specified path.
 * @param path
 * @returns A promise of result
 */
export function read(path) {
    return instance.read(path);
}

/**
 * Writes text contents in specified file
 * @param path
 * @param content
 * @returns A promise of result
 */
export function writeText(path, content) {
    return instance.writeText(path, content);
}

/**
 * Writes bytes contents in speified file
 * @param path
 * @param bytes
 * @returns A promise of result
 */
export function write(path, bytes) {
    return instance.write(path, bytes);
}

/**
 * Deletes specified file from device storage
 * @param path
 * @returns A promise of result
 */
const _delete = function (path) {
    return instance.delete(path);
};
export { _delete as delete };

/**
 * Check if specified file exists in device storage
 * @param path
 * @returns A promise of result
 */
export function exists(path) {
    return instance.exists(path);
}
