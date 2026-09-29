export const BUNDLE_CSS_AST_SENTINEL = '__NS_BUNDLE_CSS_AST__';

// The release minifier runs before generateBundle and may print the sentinel
// as a template literal.
const SENTINEL_RE = new RegExp(`(['"\`])${BUNDLE_CSS_AST_SENTINEL}\\1`);

function isCssAsset(file: any): boolean {
	return !!file && file.type === 'asset' && typeof file.fileName === 'string' && file.fileName.endsWith('.css');
}

/**
 * The bundle's CSS assets in the order the modules import them: a chunk's
 * static imports first, then its own CSS, then its dynamic imports. Bundle
 * order would put the entry's CSS ahead of `vendor.css`, letting node_modules
 * rules win equal-specificity ties against the app's overrides.
 */
export function collectBundleCssAssets(bundle: Record<string, any>): any[] {
	const cssByName = new Map<string, any>();
	for (const file of Object.values(bundle)) {
		if (isCssAsset(file)) cssByName.set(file.fileName, file);
	}
	const ordered = new Set<any>();
	const visited = new Set<string>();
	const visit = (fileName: string) => {
		const chunk = bundle[fileName];
		if (!chunk || chunk.type !== 'chunk' || visited.has(fileName)) return;
		visited.add(fileName);
		for (const dep of chunk.imports || []) visit(dep);
		for (const css of chunk.viteMetadata?.importedCss || []) {
			const asset = cssByName.get(css);
			if (asset) ordered.add(asset);
		}
		for (const dep of chunk.dynamicImports || []) visit(dep);
	};
	for (const file of Object.values(bundle)) {
		if (file && file.type === 'chunk' && file.isEntry) visit(file.fileName);
	}
	for (const asset of cssByName.values()) ordered.add(asset);
	return [...ordered];
}

/**
 * Replaces the bundle-CSS sentinel with the AST of every CSS asset and drops
 * those assets, which have no other consumer on device. The assets are kept
 * when no chunk carries the sentinel.
 */
export function inlineBundleCss(bundle: Record<string, any>, cssToAstJson: (cssText: string) => string): { assetCount: number; bytes: number; replaced: boolean } {
	const cssAssets = collectBundleCssAssets(bundle);
	let cssText = '';
	for (const asset of cssAssets) {
		const src = asset.source;
		cssText += (typeof src === 'string' ? src : new TextDecoder().decode(src as Uint8Array)) + '\n';
	}
	let replaced = false;
	for (const file of Object.values(bundle)) {
		if (file && file.type === 'chunk' && typeof file.code === 'string' && SENTINEL_RE.test(file.code)) {
			const astJson = cssToAstJson(cssText);
			file.code = file.code.replace(SENTINEL_RE, () => astJson);
			replaced = true;
			break;
		}
	}
	if (replaced) {
		for (const asset of cssAssets) delete bundle[asset.fileName];
	}
	return { assetCount: cssAssets.length, bytes: cssText.length, replaced };
}
