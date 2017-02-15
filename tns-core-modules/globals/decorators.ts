if (typeof (<any>global).__decorate !== "function") {
    (<any>global).__decorate = function (decorators, target, key, desc) {
        var c = arguments.length;
        var r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;

        if (typeof (<any>global).Reflect === "object" && typeof (<any>global).Reflect.decorate === "function") {
            r = (<any>global).Reflect.decorate(decorators, target, key, desc);
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

if (typeof (<any>global).__metadata !== "function") {
    (<any>global).__metadata = function (k, v) {
        if (typeof (<any>global).Reflect === "object" && typeof (<any>global).Reflect.metadata === "function") {
            return (<any>global).Reflect.metadata(k, v);
        }
    };
}

if (typeof (<any>global).__param !== "function") {
    (<any>global).__param = (global && (<any>global).__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
}
