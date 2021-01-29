import { Color } from 'color';
import { Length } from 'ui/styling/style-properties';

export type WhiteSpace = 'initial' | 'normal' | 'nowrap';
export type TextAlignment = 'initial' | 'left' | 'center' | 'right';
export type TextTransform = 'initial' | 'none' | 'capitalize' | 'uppercase' | 'lowercase';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'underline line-through';
export type TextShadow = {
	offsetX: Length;
	offsetY: Length;
	blurRadius: Length;
	color: Color;
};
