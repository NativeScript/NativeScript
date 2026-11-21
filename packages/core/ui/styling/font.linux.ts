import { Font as FontBase, parseFontFamily, genericFontFamilies, FontWeight } from './font-common';
import type { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';

export * from './font-common';

// CSS generic families map to fontconfig aliases
const GENERIC: Record<string, string> = {
	[genericFontFamilies.serif]: 'serif',
	[genericFontFamilies.sansSerif]: 'sans-serif',
	[genericFontFamilies.monospace]: 'monospace',
	[genericFontFamilies.system]: 'system-ui',
};

function cssFamily(value: string): string {
	return parseFontFamily(value)
		.map((family) => GENERIC[family] ?? `"${family.replace(/"/g, '')}"`)
		.join(',');
}

export class Font extends FontBase {
	static default = new Font(undefined, undefined);

	constructor(family: string, size: number, style?: FontStyleType, weight?: FontWeightType, scale?: number, variationSettings?: Array<FontVariationSettingsType>) {
		super(family, size, style, weight, scale, variationSettings ?? undefined);
	}

	public withFontFamily(family: string): Font {
		return new Font(family, this.fontSize, this.fontStyle, this.fontWeight, 1, this.fontVariationSettings ?? undefined);
	}

	public withFontStyle(style: FontStyleType): Font {
		return new Font(this.fontFamily, this.fontSize, style, this.fontWeight, this.fontScale, this.fontVariationSettings ?? undefined);
	}

	public withFontWeight(weight: FontWeightType): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight, this.fontScale, this.fontVariationSettings ?? undefined);
	}

	public withFontSize(size: number): Font {
		return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight, this.fontScale, this.fontVariationSettings ?? undefined);
	}

	public withFontScale(scale: number): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, scale, this.fontVariationSettings ?? undefined);
	}

	public withFontVariationSettings(variationSettings?: Array<FontVariationSettingsType>): Font {
		return new Font(this.fontFamily, this.fontSize, this.fontStyle, this.fontWeight, this.fontScale, variationSettings ?? undefined);
	}

	public getAndroidTypeface(): any {
		return undefined;
	}

	public getUIFont(_defaultFont: any): any {
		return undefined;
	}

	/** CSS declarations for GTK. */
	get linuxCss(): string {
		let css = '';
		if (this.fontFamily) {
			css += `font-family:${cssFamily(this.fontFamily)};`;
		}
		if (this.fontSize) {
			css += `font-size:${this.fontSize * (this.fontScale ?? 1)}px;`;
		}
		if (this.fontWeight && this.fontWeight !== FontWeight.NORMAL) {
			css += `font-weight:${this.fontWeight === FontWeight.BOLD ? 700 : this.fontWeight};`;
		}
		if (this.isItalic) {
			css += 'font-style:italic;';
		}
		if (this.fontVariationSettings?.length) {
			css += `font-variation-settings:${this.fontVariationSettings.map((v) => `"${v.axis}" ${v.value}`).join(',')};`;
		}
		return css;
	}
}

export namespace linux {}
