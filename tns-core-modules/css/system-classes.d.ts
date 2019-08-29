/**
 * @module "system-classes"
 */ /** */

/**
 * String value "ns-" used for CSS system class prefix.
 */
export const CLASS_PREFIX: string;

/**
 * Gets CSS system class for modal root view.
 */
export function getModalRootViewCssClass(): string;

/**
 * Gets CSS system classes for root view.
 */
export function getRootViewCssClasses(): string[];

/**
 * * Appends new CSS class to the system classes and returns the new length of the array.
 * @param value New CSS system class.
 */
export function pushToRootViewCssClasses(value: string): number;

/**
 * Removes CSS class from the system classes and returns it.
 * @param value
 */
export function removeFromRootViewCssClasses(value: string): string;
