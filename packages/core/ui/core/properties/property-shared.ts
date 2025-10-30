// Shared property types, interfaces, and value helpers for properties and view-base modules.
// Only put platform-agnostic logic here.

/**
 * Value specifying that Property should be set to its initial value.
 */
export const unsetValue: any = new Object();

export interface PropertyOptions<T, U> {
	readonly name: string;
	readonly defaultValue?: U;
	readonly affectsLayout?: boolean;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
}

export interface CoerciblePropertyOptions<T, U> extends PropertyOptions<T, U> {
	readonly coerceValue: (t: T, u: U) => U;
}

export interface CssPropertyOptions<T, U> extends PropertyOptions<T, U> {
	readonly cssName: string;
}
// TODO: revisit this after circular dependency issues are resolved to see if types can be retained.
// export interface CssPropertyOptions<T extends Style, U> extends PropertyOptions<T, U> {
// 	readonly cssName: string;
// }

export interface ShorthandPropertyOptions<P> {
	readonly name: string;
	readonly cssName: string;
	readonly converter: (value: string | P) => [any, any][];
	readonly getter: (this: any) => string | P;
}
// TODO: revisit this after circular dependency issues are resolved to see if types can be retained.
// export interface ShorthandPropertyOptions<P> {
// 	readonly name: string;
// 	readonly cssName: string;
// 	readonly converter: (value: string | P) => [CssProperty<any, any> | CssAnimationProperty<any, any>, any][];
// 	readonly getter: (this: Style) => string | P;
// }

export interface CssAnimationPropertyOptions<T, U> {
	readonly name: string;
	readonly cssName?: string;
	readonly defaultValue?: U;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
}

export function isCssUnsetValue(value: any): boolean {
	return value === 'unset' || value === 'revert';
}

export function isResetValue(value: any): boolean {
	return value === unsetValue || value === 'initial' || value === 'inherit' || isCssUnsetValue(value);
}

export function isCssWideKeyword(value: any): boolean {
	return value === 'initial' || value === 'inherit' || isCssUnsetValue(value);
}
