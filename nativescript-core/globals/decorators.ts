export function Deprecated(target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`${key.toString()} is deprecated`);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    } else {
        console.log(`${(target && (<any>target).name || target)} is deprecated`);

        return target;
    }
}

global.Deprecated = Deprecated;

export function Experimental(target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`${key.toString()} is experimental`);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    } else {
        console.log(`${(target && (<any>target).name || target)} is experimental`);

        return target;
    }
}

global.Experimental = Experimental;
