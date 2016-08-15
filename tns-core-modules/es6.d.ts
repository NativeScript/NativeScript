interface Symbol {
    /** Returns a string representation of an object. */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Object;
}

interface SymbolConstructor {
    /** 
      * A reference to the prototype. 
      */
    prototype: Symbol;

    /**
      * Returns a new unique Symbol value.
      * @param  description Description of the new Symbol object.
      */
    (description?: string | number): symbol;
}

declare var Symbol: SymbolConstructor;

interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
    is(value1: any, value2: any): boolean;
    setPrototypeOf(o: any, proto: any): any;
    /**
     * Returns an array of all symbol properties found directly on object o.
     * @param o Object to retrieve the symbols from.
     */
    getOwnPropertySymbols(o: any): symbol[];
}

declare var Object: ObjectConstructor;