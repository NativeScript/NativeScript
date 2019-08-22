// Required by TypeScript compiler
import "../ts-helpers";

import "../register-module-helpers";

// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (let key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
};

global.zonedCallback = function (callback: Function): Function {
    if ((<any>global).zone) {
        // Zone v0.5.* style callback wrapping
        return (<any>global).zone.bind(callback);
    }
    if ((<any>global).Zone) {
        // Zone v0.6.* style callback wrapping
        return (<any>global).Zone.current.wrap(callback);
    } else {
        return callback;
    }
};

(<any>global).System = {	
    import(path) {	
        return new Promise((resolve, reject) => {	
            try {	
                resolve(global.require(path));	
            } catch (e) {	
                reject(e);	
            }	
        });	
    }	
};
