import { Font as FontBase, parseFontFamily, genericFontFamilies, FontWeight, FontVariationSettings } from './font-common';
import type { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';

export * from './font-common';


export const fontFamilyCache = new Map<string, Microsoft.UI.Xaml.Media.FontFamily | null>();

// Maps lowercase font family name → ms-appx:///fonts/<file>#<face> URI for app-packaged fonts.
const _fontNameToUri = new Map<string, string>();
let _fontsScanDone = false;

// Scans the app package's app/fonts/ directory once (blocking via .done()) and populates
// _fontNameToUri so bare family names like "FontAwesome" resolve to their ms-appx URI.
// NativeScript Windows packages bundle app assets under <InstallRoot>/app/, so fonts live at
// <InstallRoot>/app/fonts/ → accessible as ms-appx:///app/fonts/<file>.
function ensureFontsScan(): void {
    if (_fontsScanDone) return;
    _fontsScanDone = true;
    try {
        (Windows.ApplicationModel.Package.Current.InstalledLocation.GetFolderAsync('app') as any).done((appFolder: any) => {
            if (!appFolder) return;
            (appFolder.GetFolderAsync('fonts') as any).done((fontsFolder: any) => {
                if (!fontsFolder) return;
                (fontsFolder.GetFilesAsync() as any).done((files: any) => {
                    if (!files) return;
                    const count: number = files.Size ?? 0;
                    for (let i = 0; i < count; i++) {
                        const file = files.GetAt(i);
                        const name: string = file.Name;
                        if (/\.(ttf|otf|woff|woff2)$/i.test(name)) {
                            const faceName = name.replace(/\.[^.]+$/, '');
                            _fontNameToUri.set(faceName.toLowerCase(), `ms-appx:///app/fonts/${name}#${faceName}`);
                        }
                    }
                });
            });
        });
    } catch (_e) {}
}

function sanitizeFontFamily(raw: string): string {
    if (!raw) return '';
    let f = String(raw).trim();
    if ((f.startsWith('"') && f.endsWith('"')) || (f.startsWith("'") && f.endsWith("'"))) {
        f = f.substring(1, f.length - 1);
    }
    const commaIdx = f.indexOf(',');
    if (commaIdx >= 0) f = f.substring(0, commaIdx).trim();
    // Map NativeScript tilde path (~/) to Windows app directory (ms-appx:///app/).
    // ~/fonts/Foo.ttf#Foo → app/fonts/Foo.ttf#Foo → handled as ms-appx path below.
    if (f.startsWith('~/')) {
        f = 'app/' + f.substring(2);
    }
    // Strip common URI scheme prefixes (e.g. font://, sys://)
    f = f.replace(/^[a-zA-Z]+:\/\//, '');
    return f;
}

function createFontFamilyCandidate(candidate: string): Microsoft.UI.Xaml.Media.FontFamily | null {
    if (!candidate) return null;
    try {
        if (fontFamilyCache.has(candidate)) {
            return fontFamilyCache.get(candidate) ?? null;
        }

        const ff = new Microsoft.UI.Xaml.Media.FontFamily(candidate);
        fontFamilyCache.set(candidate, ff);
        return ff;
    } catch (err) {
        fontFamilyCache.set(candidate, null);
        return null;
    }
}

export function getFontFamilyCached(family: string): Microsoft.UI.Xaml.Media.FontFamily | null {
    ensureFontsScan();
    const candidate = sanitizeFontFamily(String(family || ''));
    if (!candidate) return null;

    // Resolve bare name to app-packaged font URI before cache lookup.
    let uri = candidate;
    if (!candidate.includes('#') && !candidate.includes('/') && !candidate.includes('\\')) {
        uri = _fontNameToUri.get(candidate.toLowerCase()) ?? candidate;
    } else if (!candidate.includes('#') && (candidate.includes('/') || candidate.includes('\\'))) {
        uri = candidate.startsWith('ms-appx') ? candidate
            : 'ms-appx:///' + candidate.replace(/^\/+/, '');
    }

    if (fontFamilyCache.has(uri)) {
        return fontFamilyCache.get(uri) ?? null;
    }

    return createFontFamilyCandidate(uri);
}

export function applyFontFamilyTo(target: any, fontFamilyValue: string): void {
    if (!target || !fontFamilyValue) return;
    ensureFontsScan();

    const candidate = sanitizeFontFamily(String(fontFamilyValue || ''));
    if (!candidate) return;

    let uri: string;
    if (candidate.includes('#')) {
        // Already has face name (full URI or path#face) — normalise to ms-appx if it's a bare path.
        uri = candidate.startsWith('ms-appx') ? candidate
            : 'ms-appx:///' + candidate.replace(/^\/+/, '');
    } else if (candidate.includes('/') || candidate.includes('\\')) {
        // Path without face name — try ms-appx prefix.
        uri = candidate.startsWith('ms-appx') ? candidate
            : 'ms-appx:///' + candidate.replace(/^\/+/, '');
    } else {
        // Bare font family name. Check the scanned app font map first so "FontAwesome" resolves
        // to "ms-appx:///fonts/FontAwesome.ttf#FontAwesome"; fall back to system font name.
        uri = _fontNameToUri.get(candidate.toLowerCase()) ?? candidate;
    }

    const ff = createFontFamilyCandidate(uri);
    if (ff) {
        try {
            target.FontFamily = ff;
        } catch (_e) {}
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
