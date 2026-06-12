import { Font as FontBase, parseFontFamily, genericFontFamilies, FontWeight, FontVariationSettings } from './font-common';
import type { FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';

export * from './font-common';


export const fontFamilyCache = new Map<string, Microsoft.UI.Xaml.Media.FontFamily | null>();

// Maps lowercase font family name / filename stem → ms-appx:///app/fonts/<file>#<face> URI.
// `score` resolves conflicts when several files share a family (e.g. Muli-*.ttf all expose
// family "Muli"): exact stem==family match > "regular" styles > anything else.
const _fontNameToUri = new Map<string, { uri: string; score: number }>();
let _scanStarted = false;
let _scanCompleted = false;
const _onScanReady: Array<() => void> = [];

function _completeScan(): void {
    if (_scanCompleted) return;
    _scanCompleted = true;
    const cbs = _onScanReady.splice(0);
    for (const cb of cbs) cb();
}

function _registerFont(key: string, uri: string, score: number): void {
    const k = key.toLowerCase();
    const existing = _fontNameToUri.get(k);
    if (!existing || score > existing.score) {
        _fontNameToUri.set(k, { uri, score });
    }
}

// Scans the app package's app/fonts/ directory once, synchronously, via the C++ FontHelper
// (DirectWrite font-set enumeration). XAML FontFamily URIs need the font's REAL family name
// after '#' (Muli-Regular.ttf must be referenced as ...Muli-Regular.ttf#Muli), so each font
// registers three lookup keys:
//   filename stem      → uri#win32Family  (matches Android's filename-based lookup)
//   win32 family       → uri#win32Family  (e.g. "Muli Black")
//   typographic family → uri#typoFamily   (e.g. "Muli" — groups all weights)
function ensureFontsScan(): void {
    if (_scanStarted) return;
    _scanStarted = true;
    try {
        const root = Windows.ApplicationModel.Package.Current.InstalledLocation.Path;
        const listing = NativeScript.Widgets.FontHelper.ScanFontsDirectory(root + '\\app\\fonts');
        const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
        for (const line of String(listing || '').split('\n')) {
            if (!line) continue;
            const [fileName, win32Family, typoFamily] = line.split('|');
            if (!fileName) continue;
            const stem = fileName.replace(/\.[^.]+$/, '');
            const baseUri = `ms-appx:///app/fonts/${fileName}`;
            const legacy = win32Family || typoFamily || stem;
            // Exact stem↔family match (Pacifico.ttf#Pacifico) outranks "regular" styles
            // (Muli-Regular.ttf for family "Muli"), which outrank Bold/Italic variants.
            // Scored per KEY: Muli-Black.ttf scores 3 for "Muli Black" but only 1 for "Muli",
            // so the plain "Muli" key ends up at Muli-Regular.ttf, not the Black variant.
            const scoreFor = (key: string) => (norm(stem) === norm(key) ? 3 : (/regular/i.test(stem) ? 2 : 1));
            _registerFont(stem, `${baseUri}#${legacy}`, 3); // stem key is unique per file
            _registerFont(legacy, `${baseUri}#${legacy}`, scoreFor(legacy));
            if (typoFamily && norm(typoFamily) !== norm(legacy)) {
                _registerFont(typoFamily, `${baseUri}#${typoFamily}`, scoreFor(typoFamily));
            }
        }
    } catch (_e) {}
    _completeScan();
}

export namespace windows {
    export function triggerFontScan(): void {
        ensureFontsScan();
    }
    export function whenFontScanReady(callback: () => void): void {
        if (_scanCompleted) {
            callback();
        } else {
            _onScanReady.push(callback);
        }
    }
}


// CSS generic families → Windows system fonts.
const _genericFamilyMap = new Map<string, string>([
    [genericFontFamilies.sansSerif, 'Segoe UI'],
    [genericFontFamilies.serif, 'Times New Roman'],
    [genericFontFamilies.monospace, 'Consolas'],
    [genericFontFamilies.system, 'Segoe UI'],
    ['system-ui', 'Segoe UI'],
]);

// Resolves one CSS font-family token to a XAML-usable source: app-font URI, system font name,
// or ms-appx path. Returns null for empty tokens.
function _resolveFamilyToken(raw: string): string | null {
    let f = String(raw || '').trim();
    if ((f.startsWith('"') && f.endsWith('"')) || (f.startsWith("'") && f.endsWith("'"))) {
        f = f.substring(1, f.length - 1).trim();
    }
    if (!f) return null;

    // NativeScript tilde path: ~/fonts/Foo.ttf#Foo → app/fonts/Foo.ttf#Foo.
    if (f.startsWith('~/')) {
        f = 'app/' + f.substring(2);
    }
    // Strip non-ms-appx URI scheme prefixes (e.g. font://, sys://).
    if (!/^ms-appx/i.test(f)) {
        f = f.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
    }

    if (f.includes('/') || f.includes('\\')) {
        // Path (with or without #face) — normalise to ms-appx.
        return /^ms-appx/i.test(f) ? f : 'ms-appx:///' + f.replace(/^\/+/, '');
    }

    const generic = _genericFamilyMap.get(f.toLowerCase());
    if (generic) return generic;

    // Bare family name: app-packaged font URI when scanned, else system font name.
    return _fontNameToUri.get(f.toLowerCase())?.uri ?? f;
}

// Builds the XAML FontFamily source string for a CSS font-family list. XAML FontFamily natively
// supports comma-separated fallbacks ("ms-appx:///app/fonts/Muli.ttf#Muli, Segoe UI"), so all
// resolvable candidates are kept in order.
function _resolveFamilySource(fontFamilyValue: string): string {
    const tokens = parseFontFamily(String(fontFamilyValue || ''));
    const resolved: string[] = [];
    for (const token of tokens) {
        const source = _resolveFamilyToken(token);
        if (source && !resolved.includes(source)) {
            resolved.push(source);
        }
    }
    return resolved.join(', ');
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
    windows.triggerFontScan();
    const source = _resolveFamilySource(family);
    if (!source) return null;
    return createFontFamilyCandidate(source);
}

export function applyFontFamilyTo(target: any, fontFamilyValue: string): void {
    if (!target || !fontFamilyValue) return;
    const ff = getFontFamilyCached(fontFamilyValue);
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
