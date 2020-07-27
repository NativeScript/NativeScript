import { LayoutBase } from '../layout-base';
import { View, CSSType } from '../../core/view';
import { CssProperty, ShorthandProperty, makeParser, makeValidator, unsetValue } from '../../core/properties';
import { Style } from '../../styling/style';

export type Basis = 'auto' | number;

export const ORDER_DEFAULT = 1;
export const FLEX_GROW_DEFAULT = 0.0;
export const FLEX_SHRINK_DEFAULT = 1.0;

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export namespace FlexDirection {
	export const ROW: 'row' = 'row';
	export const ROW_REVERSE: 'row-reverse' = 'row-reverse';
	export const COLUMN: 'column' = 'column';
	export const COLUMN_REVERSE: 'column-reverse' = 'column-reverse';

	export const isValid = makeValidator<FlexDirection>(ROW, ROW_REVERSE, COLUMN, COLUMN_REVERSE);
	export const parse = makeParser<FlexDirection>(isValid);
}

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export namespace FlexWrap {
	export const NOWRAP: 'nowrap' = 'nowrap';
	export const WRAP: 'wrap' = 'wrap';
	export const WRAP_REVERSE: 'wrap-reverse' = 'wrap-reverse';

	export const isValid = makeValidator<FlexWrap>(NOWRAP, WRAP, WRAP_REVERSE);
	export const parse = makeParser<FlexWrap>(isValid);
}

export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
export namespace JustifyContent {
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const SPACE_BETWEEN: 'space-between' = 'space-between';
	export const SPACE_AROUND: 'space-around' = 'space-around';

	export const isValid = makeValidator<JustifyContent>(FLEX_START, FLEX_END, CENTER, SPACE_BETWEEN, SPACE_AROUND);
	export const parse = makeParser<JustifyContent>(isValid);
}

export type FlexBasisPercent = number;
export namespace FlexBasisPercent {
	export const DEFAULT: number = -1;
}

export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export namespace AlignItems {
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const BASELINE: 'baseline' = 'baseline';
	export const STRETCH: 'stretch' = 'stretch';

	export const isValid = makeValidator<AlignItems>(FLEX_START, FLEX_END, CENTER, BASELINE, STRETCH);
	export const parse = makeParser<AlignItems>(isValid);
}

export type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
export namespace AlignContent {
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const SPACE_BETWEEN: 'space-between' = 'space-between';
	export const SPACE_AROUND: 'space-around' = 'space-around';
	export const STRETCH: 'stretch' = 'stretch';

	export const isValid = makeValidator<AlignContent>(FLEX_START, FLEX_END, CENTER, SPACE_BETWEEN, SPACE_AROUND, STRETCH);
	export const parse = makeParser<AlignContent>(isValid);
}

export type Order = number;
export namespace Order {
	export function isValid(value): boolean {
		return isFinite(parseInt(value));
	}
	export const parse = parseInt;
}

export type FlexGrow = number;
export namespace FlexGrow {
	export function isValid(value: any): boolean {
		const parsed = parseInt(value);

		return isFinite(parsed) && value >= 0;
	}
	export const parse = parseFloat;
}

export type FlexShrink = number;
export namespace FlexShrink {
	export function isValid(value: any): boolean {
		const parsed = parseInt(value);

		return isFinite(parsed) && value >= 0;
	}
	export const parse = parseFloat;
}

export type FlexWrapBefore = boolean;
export namespace FlexWrapBefore {
	export function isValid(value) {
		if (typeof value === 'boolean') {
			return true;
		}
		if (typeof value === 'string') {
			const str = value.trim().toLowerCase();

			return str === 'true' || str === 'false';
		}

		return false;
	}
	export function parse(value: string): FlexWrapBefore {
		return value && value.toString().trim().toLowerCase() === 'true';
	}
}

export type AlignSelf = 'auto' | AlignItems;
export namespace AlignSelf {
	export const AUTO: 'auto' = 'auto';
	export const FLEX_START: 'flex-start' = 'flex-start';
	export const FLEX_END: 'flex-end' = 'flex-end';
	export const CENTER: 'center' = 'center';
	export const BASELINE: 'baseline' = 'baseline';
	export const STRETCH: 'stretch' = 'stretch';

	export const isValid = makeValidator<AlignSelf>(AUTO, FLEX_START, FLEX_END, CENTER, BASELINE, STRETCH);
	export const parse = makeParser<AlignSelf>(isValid);
}

function validateArgs(element: View): View {
	if (!element) {
		throw new Error('element cannot be null or undefinied.');
	}

	return element;
}

/**
 * A common base class for all cross platform flexbox layout implementations.
 */
@CSSType('FlexboxLayout')
export abstract class FlexboxLayoutBase extends LayoutBase {
	get flexDirection(): FlexDirection {
		return this.style.flexDirection;
	}
	set flexDirection(value: FlexDirection) {
		this.style.flexDirection = value;
	}

	get flexWrap(): FlexWrap {
		return this.style.flexWrap;
	}
	set flexWrap(value: FlexWrap) {
		this.style.flexWrap = value;
	}

	get justifyContent(): JustifyContent {
		return this.style.justifyContent;
	}
	set justifyContent(value: JustifyContent) {
		this.style.justifyContent = value;
	}

	get alignItems(): AlignItems {
		return this.style.alignItems;
	}
	set alignItems(value: AlignItems) {
		this.style.alignItems = value;
	}

	get alignContent(): AlignContent {
		return this.style.alignContent;
	}
	set alignContent(value: AlignContent) {
		this.style.alignContent = value;
	}

	public static setOrder(view: View, order: number) {
		validateArgs(view).style.order = order;
	}
	public static getOrder(view: View): number {
		return validateArgs(view).style.order;
	}

	public static setFlexGrow(view: View, grow: number) {
		validateArgs(view).style.flexGrow = grow;
	}
	public static getFlexGrow(view: View) {
		return validateArgs(view).style.flexGrow;
	}

	public static setFlexShrink(view: View, shrink: number) {
		validateArgs(view).style.flexShrink = shrink;
	}
	public static getFlexShrink(view: View): number {
		return validateArgs(view).style.flexShrink;
	}

	public static setAlignSelf(view: View, align: AlignSelf) {
		validateArgs(view).style.alignSelf = align;
	}
	public static getAlignSelf(view: View): AlignSelf {
		return validateArgs(view).style.alignSelf;
	}

	public static setFlexWrapBefore(view: View, wrap: boolean) {
		validateArgs(view).style.flexWrapBefore = wrap;
	}
	public static getFlexWrapBefore(view: View): boolean {
		return validateArgs(view).style.flexWrapBefore;
	}
}

FlexboxLayoutBase.prototype.recycleNativeView = 'auto';

export const flexDirectionProperty = new CssProperty<Style, FlexDirection>({
	name: 'flexDirection',
	cssName: 'flex-direction',
	defaultValue: FlexDirection.ROW,
	affectsLayout: global.isIOS,
	valueConverter: FlexDirection.parse,
});
flexDirectionProperty.register(Style);

export const flexWrapProperty = new CssProperty<Style, FlexWrap>({
	name: 'flexWrap',
	cssName: 'flex-wrap',
	defaultValue: 'nowrap',
	affectsLayout: global.isIOS,
	valueConverter: FlexWrap.parse,
});
flexWrapProperty.register(Style);

export const justifyContentProperty = new CssProperty<Style, JustifyContent>({
	name: 'justifyContent',
	cssName: 'justify-content',
	defaultValue: JustifyContent.FLEX_START,
	affectsLayout: global.isIOS,
	valueConverter: JustifyContent.parse,
});
justifyContentProperty.register(Style);

export const alignItemsProperty = new CssProperty<Style, AlignItems>({
	name: 'alignItems',
	cssName: 'align-items',
	defaultValue: AlignItems.STRETCH,
	affectsLayout: global.isIOS,
	valueConverter: AlignItems.parse,
});
alignItemsProperty.register(Style);

export const alignContentProperty = new CssProperty<Style, AlignContent>({
	name: 'alignContent',
	cssName: 'align-content',
	defaultValue: AlignContent.STRETCH,
	affectsLayout: global.isIOS,
	valueConverter: AlignContent.parse,
});
alignContentProperty.register(Style);

export const orderProperty = new CssProperty<Style, Order>({
	name: 'order',
	cssName: 'order',
	defaultValue: ORDER_DEFAULT,
	valueConverter: Order.parse,
});
orderProperty.register(Style);
Object.defineProperty(View.prototype, 'order', {
	get(this: View): Order {
		return this.style.order;
	},
	set(this: View, value: Order) {
		this.style.order = value;
	},
	enumerable: true,
	configurable: true,
});

export const flexGrowProperty = new CssProperty<Style, FlexGrow>({
	name: 'flexGrow',
	cssName: 'flex-grow',
	defaultValue: FLEX_GROW_DEFAULT,
	valueConverter: FlexGrow.parse,
});
flexGrowProperty.register(Style);
Object.defineProperty(View.prototype, 'flexGrow', {
	get(this: View): FlexGrow {
		return this.style.flexGrow;
	},
	set(this: View, value: FlexGrow) {
		this.style.flexGrow = value;
	},
	enumerable: true,
	configurable: true,
});

export const flexShrinkProperty = new CssProperty<Style, FlexShrink>({
	name: 'flexShrink',
	cssName: 'flex-shrink',
	defaultValue: FLEX_SHRINK_DEFAULT,
	valueConverter: FlexShrink.parse,
});
flexShrinkProperty.register(Style);
Object.defineProperty(View.prototype, 'flexShrink', {
	get(this: View): FlexShrink {
		return this.style.flexShrink;
	},
	set(this: View, value: FlexShrink) {
		this.style.flexShrink = value;
	},
	enumerable: true,
	configurable: true,
});

export const flexWrapBeforeProperty = new CssProperty<Style, FlexWrapBefore>({
	name: 'flexWrapBefore',
	cssName: 'flex-wrap-before',
	defaultValue: false,
	valueConverter: FlexWrapBefore.parse,
});
flexWrapBeforeProperty.register(Style);
Object.defineProperty(View.prototype, 'flexWrapBefore', {
	get(this: View): FlexWrapBefore {
		return this.style.flexWrapBefore;
	},
	set(this: View, value: FlexWrapBefore) {
		this.style.flexWrapBefore = value;
	},
	enumerable: true,
	configurable: true,
});

export const alignSelfProperty = new CssProperty<Style, AlignSelf>({
	name: 'alignSelf',
	cssName: 'align-self',
	defaultValue: AlignSelf.AUTO,
	valueConverter: AlignSelf.parse,
});
alignSelfProperty.register(Style);
Object.defineProperty(View.prototype, 'alignSelf', {
	get(this: View): AlignSelf {
		return this.style.alignSelf;
	},
	set(this: View, value: AlignSelf) {
		this.style.alignSelf = value;
	},
	enumerable: true,
	configurable: true,
});

// flex-flow: <flex-direction> || <flex-wrap>
const flexFlowProperty = new ShorthandProperty<Style, string>({
	name: 'flexFlow',
	cssName: 'flex-flow',
	getter: function (this: Style) {
		return `${this.flexDirection} ${this.flexWrap}`;
	},
	converter: function (value: string) {
		const properties: [CssProperty<any, any>, any][] = [];
		if (value === unsetValue) {
			properties.push([flexDirectionProperty, value]);
			properties.push([flexWrapProperty, value]);
		} else {
			const trimmed = value && value.trim();
			if (trimmed) {
				const values = trimmed.split(/\s+/);
				if (values.length >= 1 && FlexDirection.isValid(values[0])) {
					properties.push([flexDirectionProperty, FlexDirection.parse(values[0])]);
				}
				if (value.length >= 2 && FlexWrap.isValid(values[1])) {
					properties.push([flexWrapProperty, FlexWrap.parse(values[1])]);
				}
			}
		}

		return properties;
	},
});
flexFlowProperty.register(Style);

// flex: inital | auto | none | <flex-grow> <flex-shrink> || <flex-basis>
const flexProperty = new ShorthandProperty<Style, string>({
	name: 'flex',
	cssName: 'flex',
	getter: function (this: Style) {
		return `${this.flexGrow} ${this.flexShrink}`;
	},
	converter: function (value: string) {
		const properties: [CssProperty<any, any>, any][] = [];
		if (value === unsetValue) {
			properties.push([flexGrowProperty, value]);
			properties.push([flexShrinkProperty, value]);
		} else {
			const trimmed = value && value.trim();
			if (trimmed) {
				const values = trimmed.split(/\s+/);
				if (values.length === 1) {
					switch (values[0]) {
						case 'inital':
							properties.push([flexGrowProperty, 0]);
							properties.push([flexShrinkProperty, 1]);
							// properties.push([flexBasisProperty, FlexBasis.AUTO])
							break;
						case 'auto':
							properties.push([flexGrowProperty, 1]);
							properties.push([flexShrinkProperty, 1]);
							// properties.push([flexBasisProperty, FlexBasis.AUTO])
							break;
						case 'none':
							properties.push([flexGrowProperty, 0]);
							properties.push([flexShrinkProperty, 0]);
							// properties.push([flexBasisProperty, FlexBasis.AUTO])
							break;
						default:
							if (FlexGrow.isValid(values[0])) {
								properties.push([flexGrowProperty, FlexGrow.parse(values[0])]);
								properties.push([flexShrinkProperty, 1]);
								// properties.push([flexBasisProperty, 0])
							}
					}
				}
				if (values.length >= 2) {
					if (FlexGrow.isValid(values[0]) && FlexShrink.isValid(values[1])) {
						properties.push([flexGrowProperty, FlexGrow.parse(values[0])]);
						properties.push([flexShrinkProperty, FlexShrink.parse(values[1])]);
					}
				}
				// if (value.length >= 3) {
				//     properties.push({ property: flexBasisProperty, value: FlexBasis.parse(values[2])})
				// }
			}
		}

		return properties;
	},
});
flexProperty.register(Style);
