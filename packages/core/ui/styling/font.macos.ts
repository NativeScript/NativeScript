import { Font as FontBase, FontStyle, FontVariationSettings, FontWeight, parseFont } from './font-common';
import { FontStyleType, FontVariationSettingsType, FontWeightType } from './font-interfaces';

export { FontStyle, FontVariationSettings, FontWeight, parseFont };

export class Font extends FontBase {
	static default = new Font(undefined, undefined);

	constructor(family: string, size: number, style?: FontStyleType, weight?: FontWeightType, scale?: number, variationSettings?: Array<FontVariationSettingsType>) {
		super(family, size, style, weight, scale, variationSettings);
	}

	public withFontFamily(family: string): Font {
		return new Font(family, this.fontSize, this.fontStyle, this.fontWeight, this.fontScale, this.fontVariationSettings);
	}

	public withFontStyle(style: FontStyleType): Font {
		return new Font(this.fontFamily, this.fontSize, style, this.fontWeight, this.fontScale, this.fontVariationSettings);
	}

	public withFontWeight(weight: FontWeightType): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight, this.fontScale, this.fontVariationSettings);
	}

	public withFontSize(size: number): Font {
		return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight, this.fontScale, this.fontVariationSettings);
	}

	public withFontScale(scale: number): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, scale, this.fontVariationSettings);
	}

	public withFontVariationSettings(variationSettings: Array<FontVariationSettingsType> | null): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, this.fontScale, variationSettings);
	}

	getUIFont(defaultFont: any): any {
		return defaultFont;
	}

	getAndroidTypeface(): any {
		return undefined;
	}
}

export namespace ios {
	export function registerFont(_fontFile: string) {}
}
