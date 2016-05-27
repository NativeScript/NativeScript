declare var Symbol: any;

interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
    is(value1: any, value2: any): boolean;
    setPrototypeOf(o: any, proto: any): any;
}

declare var Object: ObjectConstructor;