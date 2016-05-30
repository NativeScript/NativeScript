/* tslint:disable:no-unused-variable */

/**
 * Provides API for working with native C types, pointers, pointer arithmetic and memory.
 */
declare module interop {

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

    var Pointer;

    /**
     * A pointer that will free the memory it points to automatically when garbage collected.
     */
    interface AdoptedPointer extends Pointer {
    }

    /**
     * Makes the pointer adopted.
     * After a call to adopt the pointer will hold its memory.
     * @param ptr The pointer to adopt.
     */
    function adopt(ptr: Pointer): AdoptedPointer;

    /**
     * Allocates memory.
     * @param size The size in bytes.
     */
    function alloc(size: number): AdoptedPointer;

    /**
     * Releases the memory of a pointer.
     * The pointer should not be adopted.
     * @param ptr A pointer to the memory to free.
     */
    function free(ptr: Pointer): void;

    /**
     * Returns the size of the provided type.
     * @param type A class constructor (of Objective-C interface), an instance (wrapper of Objective-C interface), struct constructor, struct instance, reference, protocol, function (for c function), fundamental types.
     */
    function sizeof(type: any): number;

    /**
     * From a JavaScript object gets a pointer to the backing native object.
     * @param instance A class constructor (of Objective-C interface), an instance (wrapper of Objective-C interface), struct instance, reference, protocol, function (for c function) or block.
     */
    function handleof(instance: any): Pointer;

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
    }

    interface FunctionReference<T> {
        (...params);
    }

    /**
     * Creates a function reference that can be marshalled as a native function pointer.
     * The JavaScript reference must be held alive as long as the native code needs the function.
     */
    var FunctionReference: {
        new <T>(func: T): FunctionReference<T>;
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

        UTF8CString: Type<Reference<number>>;
        unichar: Type<string>;

        id: Type<any>;
        protocol: Type<any>;
        "class": Type<any>;
        selector: Type<string>;
    }

    /**
     * A type for JavaScript constructors for C structs.
     */
    interface StructType<T> extends Type<T> {

        /**
         * Create a new instance of the struct.
         */
        new (): T;

        /**
         * Create a new instance of the struct and initialize it from the fields of the provided object.
         * @param obj Initializer.
         */
        new (obj: T): T;

        /**
         * Create a new struct by copying the memory from the provided pointer.
         */
        new (obj: Pointer): T;

        /**
         * Checks two structs for equality.
         */
        equals(left: T, right: T): boolean;
    }
}

declare function __collect(): void;