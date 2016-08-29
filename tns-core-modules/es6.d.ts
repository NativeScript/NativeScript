interface Symbol {
    toString(): string;
    valueOf(): Object;
}

interface SymbolConstructor {
    prototype: Symbol;
    (description?: string | number): symbol;
    iterator: symbol;
}

declare var Symbol: SymbolConstructor;
