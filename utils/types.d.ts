declare module "utils/types" {
    /**
     * A function that checks if something is a valid string.
     * @param value The value which will be checked.
     * Returns true if value is a string.
     */
    export function isString(value: any): boolean;

    /**
     * A function that checks if something is a valid number.
     * @param value The value which will be checked.
     * Returns true if value is a number.
     */
    export function isNumber(value: any): boolean;

    /**
     * A function that checks if something is a function.
     * @param value The value which will be checked.
     * Returns true if value is a function.
     */
    export function isFunction(value: any): boolean;
    
    /**
     * A function that checks if something is "undefined".
     * @param value The value which will be checked.
     * Returns true if value is "undefined".
     */
    export function isUndefined(value: any): boolean;

    /**
     * A function that checks if something is defined (not null and not undefined).
     * @param value The value which will be checked.
     * Returns true if value is defined.
     */
    export function isDefined(value: any): boolean;

    /**
     * A function that checks if something is a valid function.
     * @param value The value which will be checked.
     * Throws exception if passed value is not a valid function.
     */
    export function verifyCallback(value: any): void;

    /**
     * A function that gets the class name of an object.
     * @param object The object which class will be get.
     * Returns a string with the name of the class.
     */
    export function getClass(object): string;

    /**
     * A function that gets the entire class hierarchy of an object.
     * @param object The object which class hierarchy will be get.
     * Return an array of strings with the name of all classes.
     */
    export function getBaseClasses(object): Array<string>;
}