/**
 * Various framework wide css utilities
 */
export namespace CSSUtils {
	/**
	 * String value "ns-" used for CSS system class prefix.
	 */
	export const CLASS_PREFIX: string;

	/**
	 * Gets CSS system class for modal root view.
	 */
	export const MODAL_ROOT_VIEW_CSS_CLASS;

	/**
	 * Gets CSS system classes for root view.
	 */
	export const ROOT_VIEW_CSS_CLASS;

	/**
	 * Gets a list of the current system classes.
	 * Intended for internal use only
	 */
	export function getSystemCssClasses(): string[];

	/**
	 * Pushes to the list of the current system classes.
	 * Intended for internal use only
	 */
	export function pushToSystemCssClasses(value: string): number;

	/**
	 * Removes value from the list of current system classes
	 * Intended for internal use only
	 * @param value
	 */
	export function removeSystemCssClass(value: string): string;

	/**
	 * Same as MODAL_ROOT_VIEW_CSS_CLASS
	 */
	export function getModalRootViewCssClass(): string;

	/**
	 * Gets CSS system classes for root view. Same as ROOT_VIEW_CSS_CLASS + _getCssClasses
	 * Intended for internal use only
	 * @deprecated Use ROOT_VIEW_CSS_CLASS or getCssClasses() instead
	 */
	export function getRootViewCssClasses(): string[];

	/**
	 * Appends new CSS class to the system classes and returns the new length of the array.
	 * Intended for internal use only
	 * @deprecated Use pushToCssClasses() instead
	 * @param value New CSS system class.
	 */
	export function pushToRootViewCssClasses(value: string): number;

	/**
	 * Removes CSS class from the system classes and returns it.
	 * Intended for internal use only
	 * @deprecated Use removeCssClass() instead
	 * @param value
	 */
	export function removeFromRootViewCssClasses(value: string): string;
}
