import type { ViewBase } from '../core/view-base';
import type { Style } from './style';
import { CssAnimationProperty, CssPendingSubstitution, CssProperty, ShorthandProperty, isCssVariable, _expandCssShorthand, _getCssShorthandLonghands, _getRegisteredStyleProperties, _getRegisteredStyleProperty, _onStylePropertyRegistered, _RegisteredStyleProperty } from '../core/properties';
import { unsetValue } from '../core/properties/property-shared';
import { applyInlineStyle } from './style-scope';
import { _serializeStyleValue } from './css-value-serializer';

type Longhand = CssProperty<any, any> | CssAnimationProperty<any, any>;

function isLonghand(property: _RegisteredStyleProperty): property is Longhand {
	return property instanceof CssProperty || property instanceof CssAnimationProperty;
}

/** Framework internals (`_fontInternal`, ...) are not css. */
function isPublic(property: _RegisteredStyleProperty): boolean {
	return !property.cssLocalName.startsWith('_');
}

function publicProperty(cssName: string): _RegisteredStyleProperty | undefined {
	const property = _getRegisteredStyleProperty(cssName);

	return property && isPublic(property) ? property : undefined;
}

function publicLonghand(cssName: string): Longhand | undefined {
	const property = publicProperty(cssName);

	return property && isLonghand(property) ? property : undefined;
}

function keptExpression(style: Style, cssName: string) {
	return style._localCssExpressions?.get(cssName);
}

/** A local value, or a kept var()/calc() expression whose substitution left none. */
function isDeclaredInline(style: Style, property: Longhand): boolean {
	return !!keptExpression(style, property.cssLocalName) || property._isLocalValueSet(style);
}

function inlineLonghands(style: Style): Longhand[] {
	const result: Longhand[] = [];
	for (const property of _getRegisteredStyleProperties()) {
		if (isLonghand(property) && isPublic(property) && isDeclaredInline(style, property)) {
			result.push(property);
		}
	}

	return result;
}

function computedLonghands(): Longhand[] {
	const result: Longhand[] = [];
	for (const property of _getRegisteredStyleProperties()) {
		if (isLonghand(property) && isPublic(property)) {
			result.push(property);
		}
	}

	return result;
}

function collapseBox(parts: string[]): string {
	const [top, right, bottom, left] = parts;
	if (right !== left) {
		return parts.join(' ');
	}
	if (top !== bottom) {
		return `${top} ${right} ${bottom}`;
	}

	return top === right ? top : `${top} ${right}`;
}

/**
 * Serialize longhand values as their shorthand, or `''` when the shorthand's
 * converter does not expand the result back to the same longhands.
 */
function composeShorthand(shorthand: ShorthandProperty<any, any>, longhands: readonly string[], values: unknown[]): string {
	const cssName = shorthand.cssLocalName;
	const parts: string[] = [];
	for (let i = 0; i < longhands.length; i++) {
		const part = _serializeStyleValue(<Longhand>_getRegisteredStyleProperty(longhands[i]), values[i]);
		if (!part) {
			return '';
		}
		parts.push(part);
	}

	const composed = shorthand.valueSerializer ? shorthand.valueSerializer(parts) : parts.length === 4 ? collapseBox(parts) : parts.join(' ');
	const expanded = _expandCssShorthand(cssName, composed);
	if (!expanded || expanded.length !== longhands.length) {
		return '';
	}
	for (let i = 0; i < expanded.length; i++) {
		const [longhand, value] = expanded[i];
		const index = longhands.indexOf(longhand);
		if (index === -1 || _serializeStyleValue(<Longhand>_getRegisteredStyleProperty(longhand), value) !== parts[index]) {
			return '';
		}
	}

	return composed;
}

function inlineLonghandValue(style: Style, property: Longhand): string {
	const expression = keptExpression(style, property.cssLocalName);
	if (expression) {
		// Longhands of a var() shorthand have no value until substituted.
		return typeof expression.specified === 'string' ? expression.specified : '';
	}

	return property._isLocalValueSet(style) ? _serializeStyleValue(property, property._getLocalValue(style)) : '';
}

function inlineShorthandValue(style: Style, shorthand: ShorthandProperty<any, any>): string {
	const longhands = _getCssShorthandLonghands(shorthand.cssLocalName);
	if (!longhands?.length) {
		return '';
	}

	const pending = keptExpression(style, longhands[0])?.specified;
	if (pending instanceof CssPendingSubstitution) {
		const intact = pending.shorthand === shorthand.cssLocalName && longhands.every((longhand) => keptExpression(style, longhand)?.specified === pending);

		return intact ? pending.value : '';
	}

	const values: unknown[] = [];
	for (const longhand of longhands) {
		const property = publicLonghand(longhand);
		if (!property || keptExpression(style, longhand) || !property._isLocalValueSet(style)) {
			return '';
		}
		values.push(property._getLocalValue(style));
	}

	return composeShorthand(shorthand, longhands, values);
}

function computedValue(style: Style, property: _RegisteredStyleProperty): unknown {
	return style[property.name];
}

function computedShorthandValue(style: Style, shorthand: ShorthandProperty<any, any>): string {
	const longhands = _getCssShorthandLonghands(shorthand.cssLocalName);
	if (!longhands?.length) {
		return '';
	}

	return composeShorthand(
		shorthand,
		longhands,
		longhands.map((longhand) => computedValue(style, _getRegisteredStyleProperty(longhand))),
	);
}

function inlineValue(view: ViewBase, cssName: string): string {
	const style = view.style;
	if (isCssVariable(cssName)) {
		return style._getUnscopedCssVariables().get(cssName) ?? '';
	}

	const property = publicProperty(cssName);
	if (!property) {
		return '';
	}

	return isLonghand(property) ? inlineLonghandValue(style, property) : inlineShorthandValue(style, property);
}

/** Values reading a css-variable update on the next cascade pass. */
function inlineCssVariablesChanged(view: ViewBase): void {
	view._onCssStateChange();
}

function setInlineValue(view: ViewBase, cssName: string, value: unknown): void {
	if (isCssVariable(cssName)) {
		view.style.setUnscopedCssVariable(cssName, `${value}`);
		inlineCssVariablesChanged(view);

		return;
	}

	if (publicProperty(cssName)) {
		view.style[cssName] = value;
	}
}

/** Whether anything was removed. */
function removeInlineValue(view: ViewBase, cssName: string): boolean {
	const style = view.style;
	if (isCssVariable(cssName)) {
		if (!style._getUnscopedCssVariables().has(cssName)) {
			return false;
		}
		style.removeUnscopedCssVariable(cssName);
		inlineCssVariablesChanged(view);

		return true;
	}

	const property = publicProperty(cssName);
	if (!property) {
		return false;
	}

	const longhands = isLonghand(property) ? [cssName] : _getCssShorthandLonghands(cssName) || [];
	const declared = longhands.some((longhand) => {
		const longhandProperty = publicLonghand(longhand);

		return longhandProperty && isDeclaredInline(style, longhandProperty);
	});
	if (declared) {
		style[cssName] = unsetValue;
	}

	return declared;
}

function replaceInlineStyle(view: ViewBase, cssText: string): void {
	applyInlineStyle(
		view,
		cssText,
		inlineLonghands(view.style).map((property) => property.cssLocalName),
	);
}

function inlineCssText(view: ViewBase): string {
	const style = view.style;
	const declarations: string[] = [];
	style._getUnscopedCssVariables().forEach((value, name) => declarations.push(`${name}: ${value};`));

	// Longhands overriding a var() shorthand were written after it.
	const longhandDeclarations: string[] = [];
	let pendingShorthands: Set<CssPendingSubstitution>;
	for (const property of inlineLonghands(style)) {
		const specified = keptExpression(style, property.cssLocalName)?.specified;
		if (specified instanceof CssPendingSubstitution) {
			if (!pendingShorthands) {
				pendingShorthands = new Set();
			}
			if (!pendingShorthands.has(specified)) {
				pendingShorthands.add(specified);
				declarations.push(`${specified.shorthand}: ${specified.value};`);
			}
			continue;
		}

		const value = inlineLonghandValue(style, property);
		if (value) {
			longhandDeclarations.push(`${property.cssLocalName}: ${value};`);
		}
	}

	return declarations.concat(longhandDeclarations).join(' ');
}

function readOnlyError(what: string): Error {
	return new Error(`${what} is read-only.`);
}

function camelCase(cssName: string): string {
	return cssName.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * The css properties as camel-case string members of a style declaration, named
 * from their css names (`margin-top` is `marginTop`, `horizontal-align` is `horizontalAlign`).
 * Properties registered by plugins are available at runtime; declare them by augmenting this interface.
 */
export interface CssStyleDeclarationProperties {
	minWidth: string;
	minHeight: string;
	width: string;
	height: string;
	maxWidth: string;
	maxHeight: string;
	margin: string;
	marginLeft: string;
	marginRight: string;
	marginTop: string;
	marginBottom: string;
	padding: string;
	paddingLeft: string;
	paddingRight: string;
	paddingTop: string;
	paddingBottom: string;
	gap: string;
	rowGap: string;
	columnGap: string;
	horizontalAlign: string;
	verticalAlign: string;
	rotate: string;
	rotatex: string;
	rotatey: string;
	perspective: string;
	scaleX: string;
	scaleY: string;
	translateX: string;
	translateY: string;
	transform: string;
	background: string;
	backgroundImage: string;
	backgroundColor: string;
	backgroundRepeat: string;
	backgroundSize: string;
	backgroundPosition: string;
	borderColor: string;
	borderTopColor: string;
	borderRightColor: string;
	borderBottomColor: string;
	borderLeftColor: string;
	borderWidth: string;
	borderTopWidth: string;
	borderRightWidth: string;
	borderBottomWidth: string;
	borderLeftWidth: string;
	borderRadius: string;
	borderTopLeftRadius: string;
	borderTopRightRadius: string;
	borderBottomRightRadius: string;
	borderBottomLeftRadius: string;
	cornerShape: string;
	boxShadow: string;
	clipPath: string;
	direction: string;
	zIndex: string;
	opacity: string;
	color: string;
	fontFamily: string;
	fontSize: string;
	fontStyle: string;
	fontWeight: string;
	font: string;
	fontVariationSettings: string;
	visibility: string;
	androidElevation: string;
	androidDynamicElevationOffset: string;
	a11yEnabled: string;
	iosA11yAdjustsFontSize: string;
	iosA11yMinFontScale: string;
	iosA11yMaxFontScale: string;
	a11yHidden: string;
	a11yRole: string;
	a11yState: string;
	a11yLiveRegion: string;
	a11yLang: string;
	a11yMediaSession: string;
	a11yStep: string;
	statusBarStyle: string;
	textAlign: string;
	textTransform: string;
	textShadow: string;
	textStroke: string;
	whiteSpace: string;
	textOverflow: string;
	textDecoration: string;
	letterSpacing: string;
	lineHeight: string;
	maxLines: string;
	androidContentInset: string;
	androidContentInsetLeft: string;
	androidContentInsetRight: string;
	flexDirection: string;
	flexWrap: string;
	justifyContent: string;
	alignItems: string;
	alignContent: string;
	order: string;
	flexGrow: string;
	flexShrink: string;
	flexWrapBefore: string;
	alignSelf: string;
	flexFlow: string;
	flex: string;
	placeholderColor: string;
	tintColor: string;
	separatorColor: string;
	androidStatusBarBackground: string;
	selectedBackgroundColor: string;
	selectedTextColor: string;
	tabTextFontSize: string;
	tabTextColor: string;
	iconFontFamily: string;
	tabBackgroundColor: string;
	selectedTabTextColor: string;
	androidSelectedTabHighlightColor: string;
}

/**
 * A view's inline style as css strings, like the web's `element.style`.
 * It reads and writes the view's local values: everything set from code, view
 * properties, XML attributes or inline style strings.
 */
export class InlineStyleDeclaration implements Iterable<string> {
	private readonly _view: ViewBase;

	constructor(view: ViewBase) {
		this._view = view;
	}

	/**
	 * Every inline declaration as `name: value;` pairs. Assigning replaces all local
	 * values of the view, not only those set by a previous inline string.
	 */
	get cssText(): string {
		return inlineCssText(this._view);
	}

	set cssText(value: string) {
		replaceInlineStyle(this._view, value ?? '');
	}

	/** The number of longhands declared inline. */
	get length(): number {
		return inlineLonghands(this._view.style).length;
	}

	/**
	 * The css name of the longhand declared inline at the index, or `''`.
	 * @param index The index.
	 * @returns The css name.
	 */
	item(index: number): string {
		return inlineLonghands(this._view.style)[index]?.cssLocalName ?? '';
	}

	/**
	 * The inline value as specified: the expression for var()/calc() values, otherwise the
	 * local value serialized. A shorthand reads its expression or its composed longhands.
	 * @param property The css name, e.g. `margin-top` or `--accent`.
	 * @returns The value, or `''` when the property has no inline value.
	 */
	getPropertyValue(property: string): string {
		return inlineValue(this._view, property);
	}

	/**
	 * Always `''`: inline declarations carry no priority.
	 * @param property The css name.
	 */
	getPropertyPriority(property: string): string {
		return '';
	}

	/**
	 * Write an inline (local) value. Invalid values throw, as for `view.style`.
	 * @param property The css name.
	 * @param value The css value; `''`, `null` or `undefined` remove the declaration.
	 */
	setProperty(property: string, value: string | null | undefined): void {
		if (value == null || value === '') {
			this.removeProperty(property);
		} else {
			setInlineValue(this._view, property, `${value}`);
		}
	}

	/**
	 * Remove an inline declaration, falling back to the stylesheet or default value.
	 * @param property The css name.
	 * @returns The inline value before removal.
	 */
	removeProperty(property: string): string {
		const previous = inlineValue(this._view, property);
		removeInlineValue(this._view, property);

		return previous;
	}

	[Symbol.iterator](): Iterator<string> {
		return inlineLonghands(this._view.style)
			.map((property) => property.cssLocalName)
			[Symbol.iterator]();
	}
}
export interface InlineStyleDeclaration extends CssStyleDeclarationProperties {}

/**
 * A view's computed style as canonical css strings, like the web's `getComputedStyle()`.
 * It is live and read-only: writes throw.
 */
export class ComputedStyleDeclaration implements Iterable<string> {
	private readonly _view: ViewBase;

	constructor(view: ViewBase) {
		this._view = view;
	}

	/** Always `''`, like the web's computed declarations. */
	get cssText(): string {
		return '';
	}

	set cssText(value: string) {
		throw readOnlyError('ComputedStyleDeclaration.cssText');
	}

	/** The number of longhands. */
	get length(): number {
		return computedLonghands().length;
	}

	/**
	 * The css name of the longhand at the index, or `''`.
	 * @param index The index.
	 * @returns The css name.
	 */
	item(index: number): string {
		return computedLonghands()[index]?.cssLocalName ?? '';
	}

	/**
	 * The computed value serialized to canonical css (colors as `rgb()`/`rgba()`).
	 * @param property The css name, e.g. `margin-top` or `--accent`.
	 * @returns The value, or `''` when it has none.
	 */
	getPropertyValue(property: string): string {
		const style = this._view.style;
		if (isCssVariable(property)) {
			return style.getCssVariable(property) ?? '';
		}

		const registered = publicProperty(property);
		if (!registered) {
			return '';
		}

		return isLonghand(registered) ? _serializeStyleValue(registered, computedValue(style, registered)) : computedShorthandValue(style, registered);
	}

	/**
	 * Always `''`.
	 * @param property The css name.
	 */
	getPropertyPriority(property: string): string {
		return '';
	}

	/** Throws: computed values are read-only. */
	setProperty(property: string, value: string | null | undefined): void {
		throw readOnlyError(`ComputedStyleDeclaration (${property})`);
	}

	/** Throws: computed values are read-only. */
	removeProperty(property: string): string {
		throw readOnlyError(`ComputedStyleDeclaration (${property})`);
	}

	[Symbol.iterator](): Iterator<string> {
		return computedLonghands()
			.map((property) => property.cssLocalName)
			[Symbol.iterator]();
	}
}
export interface ComputedStyleDeclaration extends Readonly<CssStyleDeclarationProperties> {}

/**
 * The typed local values of a view, by css name, like the web's `element.attributeStyleMap`.
 * Values are what `view.style` holds (`Color`, lengths, numbers, ...); custom properties and
 * shorthands read as css strings.
 */
export class InlineStylePropertyMap implements Iterable<[string, unknown]> {
	private readonly _view: ViewBase;

	constructor(view: ViewBase) {
		this._view = view;
	}

	/** The number of entries. */
	get size(): number {
		return this.entries().length;
	}

	/**
	 * The typed local value: a written object comes back as the same instance, though a
	 * write equal to the current value may keep the current one.
	 * @param property The css name.
	 * @returns The value, or `undefined` when the property has no local value.
	 */
	get(property: string): unknown {
		const style = this._view.style;
		if (isCssVariable(property)) {
			return style._getUnscopedCssVariables().get(property);
		}

		const registered = publicProperty(property);
		if (!registered) {
			return undefined;
		}
		if (!isLonghand(registered)) {
			return inlineShorthandValue(style, registered) || undefined;
		}

		return registered._isLocalValueSet(style) ? registered._getLocalValue(style) : undefined;
	}

	/**
	 * Whether the property has a local value.
	 * @param property The css name.
	 */
	has(property: string): boolean {
		return this.get(property) !== undefined;
	}

	/**
	 * Write a local value, as `view.style` does. Throws a `TypeError` for an unknown property.
	 * @param property The css name.
	 * @param value A css string or a typed value.
	 */
	set(property: string, value: unknown): void {
		if (!isCssVariable(property) && !publicProperty(property)) {
			throw new TypeError(`Unknown css property: ${property}`);
		}
		setInlineValue(this._view, property, value);
	}

	/**
	 * Remove the local value.
	 * @param property The css name.
	 * @returns Whether there was one.
	 */
	delete(property: string): boolean {
		return removeInlineValue(this._view, property);
	}

	/** Remove every local value, as assigning `''` to `inlineStyle.cssText` does. */
	clear(): void {
		replaceInlineStyle(this._view, '');
	}

	/** The css names and typed values of the local values. */
	entries(): [string, unknown][] {
		const style = this._view.style;
		const result: [string, unknown][] = [];
		style._getUnscopedCssVariables().forEach((value, name) => result.push([name, value]));
		for (const property of inlineLonghands(style)) {
			if (property._isLocalValueSet(style)) {
				result.push([property.cssLocalName, property._getLocalValue(style)]);
			}
		}

		return result;
	}

	keys(): string[] {
		return this.entries().map(([name]) => name);
	}

	values(): unknown[] {
		return this.entries().map(([, value]) => value);
	}

	forEach(callback: (value: unknown, property: string, map: InlineStylePropertyMap) => void): void {
		for (const [name, value] of this.entries()) {
			callback(value, name, this);
		}
	}

	[Symbol.iterator](): Iterator<[string, unknown]> {
		return this.entries()[Symbol.iterator]();
	}
}

/**
 * The typed computed values of a view, by css name, like the web's `element.computedStyleMap()`.
 * Values are what `view.style` returns. It is live and read-only.
 */
export class ComputedStylePropertyMap implements Iterable<[string, unknown]> {
	private readonly _view: ViewBase;

	constructor(view: ViewBase) {
		this._view = view;
	}

	/** The number of longhands. */
	get size(): number {
		return computedLonghands().length;
	}

	/**
	 * The computed value.
	 * @param property The css name.
	 * @returns The value, or `undefined` for an unknown property or undefined variable.
	 */
	get(property: string): unknown {
		const style = this._view.style;
		if (isCssVariable(property)) {
			return style.getCssVariable(property) ?? undefined;
		}

		const registered = publicProperty(property);

		return registered ? computedValue(style, registered) : undefined;
	}

	/**
	 * Whether the property is known: a registered property or a defined variable.
	 * @param property The css name.
	 */
	has(property: string): boolean {
		return isCssVariable(property) ? this._view.style.getCssVariable(property) != null : !!publicProperty(property);
	}

	/** The css names and computed values of every longhand. */
	entries(): [string, unknown][] {
		const style = this._view.style;

		return computedLonghands().map((property) => [property.cssLocalName, computedValue(style, property)]);
	}

	keys(): string[] {
		return computedLonghands().map((property) => property.cssLocalName);
	}

	values(): unknown[] {
		return this.entries().map(([, value]) => value);
	}

	forEach(callback: (value: unknown, property: string, map: ComputedStylePropertyMap) => void): void {
		for (const [name, value] of this.entries()) {
			callback(value, name, this);
		}
	}

	[Symbol.iterator](): Iterator<[string, unknown]> {
		return this.entries()[Symbol.iterator]();
	}
}

_onStylePropertyRegistered((property) => {
	if (!isPublic(property)) {
		return;
	}

	const cssName = property.cssLocalName;
	const name = camelCase(cssName);
	if (!(name in InlineStyleDeclaration.prototype)) {
		Object.defineProperty(InlineStyleDeclaration.prototype, name, {
			configurable: true,
			enumerable: false,
			get(this: InlineStyleDeclaration) {
				return this.getPropertyValue(cssName);
			},
			set(this: InlineStyleDeclaration, value: string) {
				this.setProperty(cssName, value);
			},
		});
	}
	if (!(name in ComputedStyleDeclaration.prototype)) {
		Object.defineProperty(ComputedStyleDeclaration.prototype, name, {
			configurable: true,
			enumerable: false,
			get(this: ComputedStyleDeclaration) {
				return this.getPropertyValue(cssName);
			},
			set() {
				throw readOnlyError(`ComputedStyleDeclaration.${name}`);
			},
		});
	}
});

const inlineStyles = new WeakMap<ViewBase, InlineStyleDeclaration>();
const attributeStyleMaps = new WeakMap<ViewBase, InlineStylePropertyMap>();
const computedStyleMaps = new WeakMap<ViewBase, ComputedStylePropertyMap>();
const computedStyles = new WeakMap<ViewBase, ComputedStyleDeclaration>();

function cached<T>(map: WeakMap<ViewBase, T>, view: ViewBase, create: (view: ViewBase) => T): T {
	let value = map.get(view);
	if (!value) {
		value = create(view);
		map.set(view, value);
	}

	return value;
}

export function _getInlineStyle(view: ViewBase): InlineStyleDeclaration {
	return cached(inlineStyles, view, (v) => new InlineStyleDeclaration(v));
}

export function _getAttributeStyleMap(view: ViewBase): InlineStylePropertyMap {
	return cached(attributeStyleMaps, view, (v) => new InlineStylePropertyMap(v));
}

export function _getComputedStyleMap(view: ViewBase): ComputedStylePropertyMap {
	return cached(computedStyleMaps, view, (v) => new ComputedStylePropertyMap(v));
}

/**
 * The live, read-only computed style of a view as canonical css strings, like the web's
 * `window.getComputedStyle()`. Writes to it throw.
 * @param view The view.
 * @returns The same declaration object for every call on the view.
 */
export function getComputedStyle(view: ViewBase): ComputedStyleDeclaration {
	return cached(computedStyles, view, (v) => new ComputedStyleDeclaration(v));
}
