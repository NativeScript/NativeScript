// imported for definition purposes only
import * as animationModule from '../../ui/animation';

export type KeyboardType = 'datetime' | 'phone' | 'number' | 'url' | 'email' | 'integer';
export namespace KeyboardType {
	export const datetime = 'datetime';
	export const phone = 'phone';
	export const number = 'number';
	export const url = 'url';
	export const email = 'email';
	export const integer = 'integer';
}

export namespace ReturnKeyType {
	export const done = 'done';
	export const next = 'next';
	export const go = 'go';
	export const search = 'search';
	export const send = 'send';
}

export class TextAlignment {
	static left = 'left';
	static center = 'center';
	static right = 'right';
}

export namespace TextDecoration {
	export const none = 'none';
	export const underline = 'underline';
	export const lineThrough = 'line-through';
}

export namespace TextTransform {
	export const none = 'none';
	export const capitalize = 'capitalize';
	export const uppercase = 'uppercase';
	export const lowercase = 'lowercase';
}

export namespace WhiteSpace {
	export const normal = 'normal';
	export const nowrap = 'nowrap';
}

export namespace Orientation {
	export const horizontal = 'horizontal';
	export const vertical = 'vertical';
}

export namespace DeviceOrientation {
	export const portrait = 'portrait';
	export const landscape = 'landscape';
	export const unknown = 'unknown';
}

export namespace HorizontalAlignment {
	export const left = 'left';
	export const center = 'center';
	export const right = 'right';
	export const stretch = 'stretch';
}

export namespace VerticalAlignment {
	export const top = 'top';
	export const middle = 'middle';
	export const bottom = 'bottom';
	export const stretch = 'stretch';
}

export namespace Stretch {
	export const none = 'none';
	export const aspectFill = 'aspectFill';
	export const aspectFit = 'aspectFit';
	export const fill = 'fill';
}

export namespace Visibility {
	export const visible = 'visible';
	export const collapse = 'collapse';
	export const collapsed = 'collapsed';
	export const hidden = 'hidden';
}

export namespace FontAttributes {
	export const Normal = 0;
	export const Bold = 1;
	export const Italic = 1 << 1;
}

export namespace DeviceType {
	export const Phone = 'Phone';
	export const Tablet = 'Tablet';
}

export namespace UpdateTextTrigger {
	export const focusLost = 'focusLost';
	export const textChanged = 'textChanged';
}

export namespace Accuracy {
	export const any = 300;
	export const high = 3;
}

export namespace Dock {
	export const left = 'left';
	export const top = 'top';
	export const right = 'right';
	export const bottom = 'bottom';
}

export namespace AutocapitalizationType {
	export const none = 'none';
	export const words = 'words';
	export const sentences = 'sentences';
	export const allCharacters = 'allcharacters';
}

export namespace NavigationBarVisibility {
	export const auto = 'auto';
	export const never = 'never';
	export const always = 'always';
}

export namespace AndroidActionBarIconVisibility {
	export const auto = 'auto';
	export const never = 'never';
	export const always = 'always';
}

export namespace AndroidActionItemPosition {
	export const actionBar = 'actionBar';
	export const actionBarIfRoom = 'actionBarIfRoom';
	export const popup = 'popup';
}

export namespace IOSActionItemPosition {
	export const left = 'left';
	export const right = 'right';
}

export namespace ImageFormat {
	export const png = 'png';
	export const jpeg = 'jpeg';
	export const jpg = 'jpg';
}

export namespace FontStyle {
	export const normal = 'normal';
	export const italic = 'italic';
}

export namespace FontWeight {
	export const thin = '100';
	export const extraLight = '200';
	export const light = '300';
	export const normal = 'normal'; // 400
	export const medium = '500';
	export const semiBold = '600';
	export const bold = 'bold'; // 700
	export const extraBold = '800';
	export const black = '900';
}

export namespace BackgroundRepeat {
	export const repeat = 'repeat';
	export const repeatX = 'repeat-x';
	export const repeatY = 'repeat-y';
	export const noRepeat = 'no-repeat';
}

let animation: typeof animationModule;

export namespace AnimationCurve {
	export const ease = 'ease';
	export const easeIn = 'easeIn';
	export const easeOut = 'easeOut';
	export const easeInOut = 'easeInOut';
	export const linear = 'linear';
	export const spring = 'spring';
	export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Object {
		animation = animation || require('../animation');

		return new animation.CubicBezierAnimationCurve(x1, y1, x2, y2);
	}
}

export namespace StatusBarStyle {
	export const light = 'light';
	export const dark = 'dark';
}

export namespace SystemAppearance {
	export const light = 'light';
	export const dark = 'dark';
}

export const Enums = {
	Accuracy,
	AndroidActionBarIconVisibility,
	AndroidActionItemPosition,
	AnimationCurve,
	AutocapitalizationType,
	BackgroundRepeat,
	DeviceOrientation,
	DeviceType,
	Dock,
	FontAttributes,
	FontStyle,
	FontWeight,
	HorizontalAlignment,
	IOSActionItemPosition,
	ImageFormat,
	KeyboardType,
	NavigationBarVisibility,
	Orientation,
	ReturnKeyType,
	StatusBarStyle,
	Stretch,
	SystemAppearance,
	TextAlignment,
	TextDecoration,
	TextTransform,
	UpdateTextTrigger,
	VerticalAlignment,
	Visibility,
	WhiteSpace,
};
