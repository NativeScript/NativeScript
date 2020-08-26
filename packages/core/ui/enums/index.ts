// imported for definition purposes only
import * as animationModule from '../../ui/animation';

export type KeyboardType = 'datetime' | 'phone' | 'number' | 'url' | 'email' | 'integer';
export module KeyboardType {
	export const datetime = 'datetime';
	export const phone = 'phone';
	export const number = 'number';
	export const url = 'url';
	export const email = 'email';
	export const integer = 'integer';
}

export module ReturnKeyType {
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

export module TextDecoration {
	export const none = 'none';
	export const underline = 'underline';
	export const lineThrough = 'line-through';
}

export module TextTransform {
	export const none = 'none';
	export const capitalize = 'capitalize';
	export const uppercase = 'uppercase';
	export const lowercase = 'lowercase';
}

export module WhiteSpace {
	export const normal = 'normal';
	export const nowrap = 'nowrap';
}

export module Orientation {
	export const horizontal = 'horizontal';
	export const vertical = 'vertical';
}

export module DeviceOrientation {
	export const portrait = 'portrait';
	export const landscape = 'landscape';
	export const unknown = 'unknown';
}

export module HorizontalAlignment {
	export const left = 'left';
	export const center = 'center';
	export const right = 'right';
	export const stretch = 'stretch';
}

export module VerticalAlignment {
	export const top = 'top';
	export const middle = 'middle';
	export const bottom = 'bottom';
	export const stretch = 'stretch';
}

export module Stretch {
	export const none: string = 'none';
	export const aspectFill: string = 'aspectFill';
	export const aspectFit: string = 'aspectFit';
	export const fill: string = 'fill';
}

export module Visibility {
	export const visible: string = 'visible';
	export const collapse: string = 'collapse';
	export const collapsed: string = 'collapsed';
	export const hidden: string = 'hidden';
}

export module FontAttributes {
	export const Normal = 0;
	export const Bold = 1;
	export const Italic = 1 << 1;
}

export module DeviceType {
	export const Phone: string = 'Phone';
	export const Tablet: string = 'Tablet';
}

export module UpdateTextTrigger {
	export const focusLost: string = 'focusLost';
	export const textChanged: string = 'textChanged';
}

export module Accuracy {
	export const any: number = 300;
	export const high: number = 3;
}

export module Dock {
	export const left: string = 'left';
	export const top: string = 'top';
	export const right: string = 'right';
	export const bottom: string = 'bottom';
}

export module AutocapitalizationType {
	export const none: string = 'none';
	export const words: string = 'words';
	export const sentences: string = 'sentences';
	export const allCharacters: string = 'allcharacters';
}

export module NavigationBarVisibility {
	export const auto: string = 'auto';
	export const never: string = 'never';
	export const always: string = 'always';
}

export module AndroidActionBarIconVisibility {
	export const auto: string = 'auto';
	export const never: string = 'never';
	export const always: string = 'always';
}

export module AndroidActionItemPosition {
	export const actionBar: string = 'actionBar';
	export const actionBarIfRoom: string = 'actionBarIfRoom';
	export const popup: string = 'popup';
}

export module IOSActionItemPosition {
	export const left: string = 'left';
	export const right: string = 'right';
}

export module ImageFormat {
	export const png: string = 'png';
	export const jpeg: string = 'jpeg';
	export const jpg: string = 'jpg';
}

export module FontStyle {
	export const normal: string = 'normal';
	export const italic: string = 'italic';
}

export module FontWeight {
	export const thin: string = '100';
	export const extraLight: string = '200';
	export const light: string = '300';
	export const normal: string = 'normal'; // 400
	export const medium: string = '500';
	export const semiBold: string = '600';
	export const bold: string = 'bold'; // 700
	export const extraBold: string = '800';
	export const black: string = '900';
}

export module BackgroundRepeat {
	export const repeat: string = 'repeat';
	export const repeatX: string = 'repeat-x';
	export const repeatY: string = 'repeat-y';
	export const noRepeat: string = 'no-repeat';
}

let animation: typeof animationModule;

export module AnimationCurve {
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

export module StatusBarStyle {
	export const light = 'light';
	export const dark = 'dark';
}

export module SystemAppearance {
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
