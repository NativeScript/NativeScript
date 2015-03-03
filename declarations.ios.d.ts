/* tslint:disable:no-unused-variable */

/**
 * Provides API for working with native C types, pointers, pointer arithmetic and memory.
 */
declare module interop {
    /**
     * A type that wraps a pointer and allows read/write operations on its value.
     */
    interface Reference<T> {
        value: T;
    }

    /**
     * A Reference constructor.
     */
    var Reference: {

        /**
         * Creates a new reference around a value.
         * The native representation of the type will be determined the first time the Reference is used
         * in operation involving marshalling.
         * @param value The JavaScript value used to initialize the reference.
         */
        new <T>(value?: T): Reference<T>;

        /**
         * Creates a reference from to the pointer with a given type.
         * @param type The type to interpret the pointer
         */
        new <T>(type: Type<T>, data: Pointer): Reference<T>;

        /**
         * Creates a new reference around a value.
         * @param type The type to interpret the value
         */
        new <T>(type: Type<T>, value: any): Reference<T>;

        /**
         * Gets the value using pointer arithmetic.
         */
        [index: number]: any;

        /**
         * Dereferences the pointer.
         */
        value: any;
    };

    /**
     * A type that is used to represent a void*.
     */
    interface Pointer {
        /**
         * Creates a new pointer with the given offset.
         * @param offset The offset in bytes.
         */
        new (offset: number);

        /**
         * Creates a new pointer by adding an offset to the current pointer.
         * @param offset The offset in bytes.
         */
        add(offset: number): Pointer;

        /**
         * Creates a new pointer by removing an offset from the current pointer.
         * @param offset The offset in bytes.
         */
        subtract(offset: number): Pointer;

        /**
         * Converts the value of this instance to a number.
         */
        toNumber(): number;
    }

    interface Type<T> {
        (ptr: Pointer): T;
    }

    var types: {
        "void": Type<void>;
        bool: Type<boolean>;
        int8: Type<number>;
        uint8: Type<number>;
        int16: Type<number>;
        uint16: Type<number>;
        int32: Type<number>;
        uint32: Type<number>;
        int64: Type<number>;
        uint64: Type<number>;
        float: Type<number>;
        double: Type<number>;
        //UTF8CString: Type<Reference<types.int8>>;
        unichar: Type<string>;
        id: Type<NSObject>;
        protocol: Type<Object>;
        "class": Type<NSObject>;
        selector: Type<string>;
    }
}

declare function __collect(): void;