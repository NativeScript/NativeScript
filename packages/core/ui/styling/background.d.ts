import { Color } from '../../color';
import { View } from '../core/view';
import { BackgroundRepeat } from '../../css/parser';
import { LinearGradient } from '../styling/linear-gradient';

export enum CacheMode {
	none,
	memory,
	diskAndMemory,
}

export declare class Background {
	public static default: Background;
	public color: Color;
	public image: string | LinearGradient;
	public repeat: BackgroundRepeat;
	public position: string;
	public size: string;
	public borderTopColor: Color;
	public borderRightColor: Color;
	public borderBottomColor: Color;
	public borderLeftColor: Color;
	public borderTopWidth: number;
	public borderRightWidth: number;
	public borderBottomWidth: number;
	public borderLeftWidth: number;
	public borderTopLeftRadius: number;
	public borderTopRightRadius: number;
	public borderBottomRightRadius: number;
	public borderBottomLeftRadius: number;
	public clipPath: string;

	public withColor(value: Color): Background;
	public withImage(value: string | LinearGradient): Background;
	public withRepeat(value: BackgroundRepeat): Background;
	public withPosition(value: string): Background;
	public withSize(value: string): Background;
	public withBorderTopColor(value: Color): Background;
	public withBorderRightColor(value: Color): Background;
	public withBorderBottomColor(value: Color): Background;
	public withBorderLeftColor(value: Color): Background;
	public withBorderTopWidth(value: number): Background;
	public withBorderRightWidth(value: number): Background;
	public withBorderBottomWidth(value: number): Background;
	public withBorderLeftWidth(value: number): Background;
	public withBorderTopLeftRadius(value: number): Background;
	public withBorderTopRightRadius(value: number): Background;
	public withBorderBottomRightRadius(value: number): Background;
	public withBorderBottomLeftRadius(value: number): Background;
	public withClipPath(value: string): Background;

	public isEmpty(): boolean;

	public static equals(value1: Background, value2: Background): boolean;

	public hasBorderColor(): boolean;
	public hasBorderWidth(): boolean;
	public hasBorderRadius(): boolean;
	public hasUniformBorderColor(): boolean;
	public hasUniformBorderWidth(): boolean;
	public hasUniformBorderRadius(): boolean;
	public hasUniformBorder(): boolean;
	public getUniformBorderColor(): Color;
	public getUniformBorderWidth(): number;
	public getUniformBorderRadius(): number;
}

export module ios {
	export function createBackgroundUIColor(view: View, callback: (uiColor: any /* UIColor */) => void, flip?: boolean): void;
}

export module ad {
	export function onBackgroundOrBorderPropertyChanged(v: View);
}
