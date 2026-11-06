/** The platforms NativeScript builds for. Single source of truth for the build pipeline. */
export type Platform = 'android' | 'ios' | 'visionos' | 'windows';

export const PLATFORMS: readonly Platform[] = ['android', 'ios', 'visionos', 'windows'];

/**
 * Regex alternation of every platform file suffix (`foo.<platform>.ts`). Use
 * this wherever a suffix is stripped or matched: a platform missing here makes
 * `foo.<platform>` and `foo` canonicalise differently, which splits one module
 * into two module records on device.
 */
export const PLATFORM_SUFFIX_ALT = 'ios|android|visionos|windows';

const PLATFORM_TAG_RE = new RegExp(`\\.(${PLATFORM_SUFFIX_ALT})(?=\\.)`, 'g');
const PLATFORM_TRAILING_SUFFIX_RE = new RegExp(`\\.(${PLATFORM_SUFFIX_ALT})$`);

export function isPlatform(value: unknown): value is Platform {
	return typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value);
}

/** iOS and visionOS share the Apple runtime (`__APPLE__`, `global.isIOS`). */
export function isApplePlatform(platform: string | undefined | null): boolean {
	return platform === 'ios' || platform === 'visionos';
}

/**
 * File suffixes loadable on `platform`, most specific first. Apple platforms
 * accept each other's files (iOS keeps `.visionos.` variants, visionOS falls
 * back to `.ios.`); Android and Windows only accept their own.
 */
export function platformSuffixes(platform: Platform): Platform[] {
	switch (platform) {
		case 'android':
			return ['android'];
		case 'ios':
			return ['ios', 'visionos'];
		case 'visionos':
			return ['visionos', 'ios'];
		case 'windows':
			return ['windows'];
		default:
			return [];
	}
}

/** Trailing platform suffix of an extensionless name (`index.ios` → `ios`), else null. */
export function platformSuffixOf(nameWithoutExt: string): Platform | null {
	const m = nameWithoutExt.match(PLATFORM_TRAILING_SUFFIX_RE);
	return (m?.[1] as Platform) || null;
}

/** True when `file` carries a `.<platform>.` tag that `platform` cannot load. */
export function isOtherPlatformTagged(file: string, platform: Platform): boolean {
	const own = platformSuffixes(platform);
	for (const m of file.matchAll(PLATFORM_TAG_RE)) {
		if (!own.includes(m[1] as Platform)) return true;
	}
	return false;
}

/**
 * Platform-first resolve extensions: each base is preceded by its platform
 * variants (`.android.ts`, `.ts`, …) so the platform file wins over the bare one.
 */
export function platformExtensions(platform: Platform, bases: readonly string[]): string[] {
	const suffixes = platformSuffixes(platform);
	const out: string[] = [];
	for (const base of bases) {
		for (const s of suffixes) out.push(`.${s}${base}`);
		out.push(base);
	}
	return out;
}

/** Platform CSS variant extension. Unknown platforms keep the historical iOS fallback. */
export function platformCssExt(platform: string | undefined | null): string {
	if (platform === 'android') return '.android.css';
	if (platform === 'windows') return '.windows.css';
	return '.ios.css';
}
