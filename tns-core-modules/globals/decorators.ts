if (typeof global.__decorate !== "function") {
    global.__decorate = function (decorators, target, key, desc) {
        var c = arguments.length;
        var r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;

        if (typeof global.Reflect === "object" && typeof global.Reflect.decorate === "function") {
            r = global.Reflect.decorate(decorators, target, key, desc);
        }
        else {
            for (var i = decorators.length - 1; i >= 0; i--) {
                if (d = decorators[i]) {
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                }
            }
        }
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
}

if (typeof global.__metadata !== "function") {
    global.__metadata = function (k, v) {
        if (typeof global.Reflect === "object" && typeof global.Reflect.metadata === "function") {
            return global.Reflect.metadata(k, v);
        }
    };
}

if (typeof global.__param !== "function") {
    global.__param = (global && global.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
}