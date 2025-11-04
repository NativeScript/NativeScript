import type { Compiler } from 'webpack';
import { sources } from 'webpack';

export interface FixSourceMapUrlPluginOptions {
	outputPath: string;
}

/**
 * Ensures sourceMappingURL points to the actual file:// location on device/emulator.
 * Handles Webpack 5 asset sources (string/Buffer/Source objects).
 */
export default class FixSourceMapUrlPlugin {
	constructor(private readonly options: FixSourceMapUrlPluginOptions) {}

	apply(compiler: Compiler) {
		const wp: any = (compiler as any).webpack;
		const hasProcessAssets =
			!!wp?.Compilation?.PROCESS_ASSETS_STAGE_DEV_TOOLING &&
			!!(compiler as any).hooks?.thisCompilation;

		const leadingCharacter = process.platform === 'win32' ? '/' : '';

		const toStringContent = (content: any): string => {
			if (typeof content === 'string') return content;
			if (Buffer.isBuffer(content)) return content.toString('utf-8');
			if (content && typeof content.source === 'function') {
				const inner = content.source();
				if (typeof inner === 'string') return inner;
				if (Buffer.isBuffer(inner)) return inner.toString('utf-8');
				try {
					return String(inner);
				} catch {
					return '';
				}
			}
			try {
				return String(content);
			} catch {
				return '';
			}
		};

		const processFile = (filename: string, compilation: any) => {
			if (!(filename.endsWith('.mjs') || filename.endsWith('.js'))) return;

			// Support both legacy compilation.assets and v5 Asset API
			let rawSource: any;
			if (typeof (compilation as any).getAsset === 'function') {
				const assetObj = (compilation as any).getAsset(filename);
				if (assetObj && assetObj.source) {
					rawSource = (assetObj.source as any).source
						? (assetObj.source as any).source()
						: (assetObj.source as any)();
				}
			}
			if (
				rawSource === undefined &&
				(compilation as any).assets &&
				(compilation as any).assets[filename]
			) {
				const asset = (compilation as any).assets[filename];
				rawSource = typeof asset.source === 'function' ? asset.source() : asset;
			}

			let source = toStringContent(rawSource);
			// Replace sourceMappingURL to use file:// protocol pointing to actual location
			source = source.replace(
				/\/\/\# sourceMappingURL=(.+\.map)/g,
				`//# sourceMappingURL=file://${leadingCharacter}${this.options.outputPath}/$1`,
			);

			// Prefer Webpack 5 updateAsset with RawSource when available
			const RawSourceCtor =
				wp?.sources?.RawSource || (sources as any)?.RawSource;
			if (
				typeof (compilation as any).updateAsset === 'function' &&
				RawSourceCtor
			) {
				(compilation as any).updateAsset(filename, new RawSourceCtor(source));
			} else {
				(compilation as any).assets[filename] = {
					source: () => source,
					size: () => source.length,
				};
			}
		};

		if (hasProcessAssets) {
			compiler.hooks.thisCompilation.tap(
				'FixSourceMapUrlPlugin',
				(compilation: any) => {
					// IMPORTANT:
					// Run AFTER SourceMapDevToolPlugin has emitted external map assets.
					// If we run at DEV_TOOLING and replace sources, we may drop mapping info
					// before Webpack has a chance to write .map files. SUMMARIZE happens later.
					const stage =
						wp.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE ||
						// Fallback to DEV_TOOLING if summarize is unavailable
						wp.Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING;
					compilation.hooks.processAssets.tap(
						{ name: 'FixSourceMapUrlPlugin', stage },
						(assets: Record<string, any>) => {
							Object.keys(assets).forEach((filename) =>
								processFile(filename, compilation),
							);
						},
					);
				},
			);
		} else {
			// Fallback for older setups: use emit (may log deprecation in newer webpack)
			compiler.hooks.emit.tap('FixSourceMapUrlPlugin', (compilation: any) => {
				Object.keys((compilation as any).assets).forEach((filename) =>
					processFile(filename, compilation),
				);
			});
		}
	}
}
