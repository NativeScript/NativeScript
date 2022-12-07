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
 * A function that checks if something is a valid boolean.
 * @param value The value which will be checked.
 * Returns true if value is a boolean.
 */
export function isBoolean(value: any): boolean;

/**
 * A function that checks if something is a function.
 * @param value The value which will be checked.
 * Returns true if value is a function.
 */
export function isFunction(value: any): boolean;

/**
 * A function that checks if something is an object.
 * @param value The value which will be checked.
 * Returns true if value is an object.
 */
export function isObject(value: any): boolean;

/**
 * A function that checks if something is "undefined".
 * @param value The value which will be checked.
 * Returns true if value is "undefined".
 */
export function isUndefined(value: any): boolean;

/**
 * A function that checks if something is defined (not undefined).
 * @param value The value which will be checked.
 * Returns true if value is defined.
 */
export function isDefined(value: any): boolean;

/**
 * A function that checks if something is not defined (null or undefined).
 * @param value The value which will be checked.
 * Returns true if value is null or undefined.
 */
export function isNullOrUndefined(value: any): boolean;

/**
 * A function that checks if something is a valid function.
 * @param value The value which will be checked.
 * Throws exception if passed value is not a valid function.
 */
export function verifyCallback(value: any): void;

/**
 * Checks if the number has decimals
 * @param value Number to check
 */
export function numberHasDecimals(value: number): boolean;

/**
 * Checks if the number is 64 bit
 * @param value Number to check
 */
export function numberIs64Bit(value: number): boolean;

/**
 * A function that gets the class name of an object.
 * @param object The object.
 * Returns a string with the name of the class.
 */
export function getClass(object): string;

/**
 * A function that gets the entire class hierarchy of an object.
 * @param object The object.
 * Returns an array of strings with the name of all base classes.
 */
export function getBaseClasses(object): Array<string>;

/**
 * A function that gets the ClassInfo for an object.
 * @param object The object.
 * Returns a ClassInfo for the object.
 */
export function getClassInfo(object: Object): ClassInfo;

/**
 * A Class holding information about a class
 */
export class ClassInfo {
	/**
	 * Gets the name of the class.
	 */
	name: string;

	/**
	 * Gets the ClassInfo for the base class of the current info.
	 */
	baseClassInfo: ClassInfo;
}

/**
 * Returns a string representation of an object to be shown in UI.
 * @param object The object.
 */
export function toUIString(object): string;
