import { Font as FontBase, parseFontFamily, genericFontFamilies, FontWeight, FontVariationSettings, FONTS_BASE_PATH } from './font-common';
import type { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';

export * from './font-common';

export class Font extends FontBase {
	static default = new Font(undefined, undefined);

	public withFontFamily(family: string): Font {
		return new Font(family, this.fontSize, this.fontStyle, this.fontWeight, 1, this.fontVariationSettings);
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

	public getAndroidTypeface(): any {
		return null;
	}

	public getUIFont(_defaultFont: any): any {
		return null;
	}
}
