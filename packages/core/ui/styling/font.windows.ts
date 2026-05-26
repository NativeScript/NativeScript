import { Font as FontBase, parseFontFamily, genericFontFamilies, FontWeight, FontVariationSettings, FONTS_BASE_PATH } from './font-common';
import type { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';

export * from './font-common';


export const fontFamilyCache = new Map<string, Windows.UI.Xaml.Media.FontFamily | null>();

function sanitizeFontFamily(raw: string): string {
    if (!raw) return '';
    let f = String(raw).trim();
    if ((f.startsWith('"') && f.endsWith('"')) || (f.startsWith("'") && f.endsWith("'"))) {
        f = f.substring(1, f.length - 1);
    }
    const commaIdx = f.indexOf(',');
    if (commaIdx >= 0) f = f.substring(0, commaIdx).trim();
    // Strip common scheme prefixes (e.g. font://, sys://)
    f = f.replace(/^[a-zA-Z]+:\/\//, '');
    return f;
}

function createFontFamilyCandidate(candidate: string): Windows.UI.Xaml.Media.FontFamily | null {
    if (!candidate) return null;
    try {
        if (fontFamilyCache.has(candidate)) {
            return fontFamilyCache.get(candidate) ?? null;
        }

        const ff = new Windows.UI.Xaml.Media.FontFamily(candidate);
        try { console.log(`[Font] Created FontFamily "${candidate}" -> source="${ff.Source}"`); } catch (_e) {}
        fontFamilyCache.set(candidate, ff);
        return ff;
    } catch (err) {
        console.log(`[Font] FontFamily creation failed for "${candidate}":`, err);
        fontFamilyCache.set(candidate, null);
        return null;
    }
}

export function getFontFamilyCached(family: string): Windows.UI.Xaml.Media.FontFamily | null {
    const candidate = sanitizeFontFamily(String(family || ''));
    if (!candidate) return null;

    if (fontFamilyCache.has(candidate)) {
        return fontFamilyCache.get(candidate) ?? null;
    }

    const created = createFontFamilyCandidate(candidate);
    if (created) return created;

    // If looks like a relative path, try ms-appx:/// fallback
    if (!candidate.includes('#') && (candidate.includes('/') || candidate.includes('\\'))) {
        const appx = 'ms-appx:///' + candidate.replace(/^\/+/, '');
        const created2 = createFontFamilyCandidate(appx);
        if (created2) return created2;
    }

    return null;
}

export function applyFontFamilyTo(target: any, fontFamilyValue: string): void {
    if (!target || !fontFamilyValue) return;

    const candidate = sanitizeFontFamily(String(fontFamilyValue || ''));
    if (!candidate) return;

    const candidates = [candidate];
    if (!candidate.includes('#') && (candidate.includes('/') || candidate.includes('\\'))) {
        candidates.push('ms-appx:///' + candidate.replace(/^\/+/, ''));
    }

    for (const c of candidates) {
        const ff = createFontFamilyCandidate(c);
        if (ff) {
            try {
                target.FontFamily = ff;
            } catch (_e) {
                // ignore if target does not accept FontFamily assignment
            }
            return;
        }
    }
}

export function clearFontFamilyCache(): void {
    fontFamilyCache.clear();
}

export class Font extends FontBase {
    static default = new Font('', 0);

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

    getWindowsFontDescriptor(defaultFont: any): any {
        const families = parseFontFamily(this.fontFamily);
        const fontSize = this.fontSize ? this.fontSize * (this.fontScale ?? 1) : (defaultFont?.pointSize ?? 0);

        return {
            fontFamily: families,
            fontFamilyNative: getFontFamilyCached(this.fontFamily),
            fontSize,
            fontWeight: this.fontWeight ?? FontWeight.NORMAL,
            fontVariationSettings: this.fontVariationSettings ?? undefined,
            isBold: this.isBold,
            isItalic: this.isItalic,
        } as any;
    }

    applyWindowsFont(target: any) {
        applyFontFamilyTo(target, this.fontFamily);
    }

    public getUIFont(defaultFont: any): any {
        return undefined;
    }
}
