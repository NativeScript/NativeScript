interface Symbol {
    toString(): string;
    valueOf(): Object;
}

interface SymbolConstructor {
    prototype: Symbol;
    (description?: string | number): symbol;
}

declare var Symbol: SymbolConstructor;

interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
    is(value1: any, value2: any): boolean;
    setPrototypeOf(o: any, proto: any): any;
    getOwnPropertySymbols(o: any): symbol[];
}

declare var Object: ObjectConstructor;