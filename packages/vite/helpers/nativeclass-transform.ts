import ts from 'typescript';
import nativeClassTransformer from '../transformers/NativeClass/index.js';
import { getCliFlags } from './cli-flags.js';

/**
 * Apply the NativeClass transformer to a source string. Returns null if no change performed.
 */
export function transformNativeClassSource(code: string, fileName: string) {
	// Avoid transforming platform-specific sources for the non-target platform.
	// Example: don't run Android-specific transforms on iOS builds and vice versa.
	try {
		const flags = getCliFlags();
		const platform: 'android' | 'ios' | 'visionos' | undefined = flags.android ? 'android' : 'ios';
		if (fileName.includes('.android.') && platform !== 'android') return null;
		if ((fileName.includes('.ios.') || fileName.includes('.visionos.')) && platform === 'android') return null;
	} catch (e) {
		// If cli flags cannot be read for any reason, fall back to original behavior.
	}

	if (!code.includes('@NativeClass')) return null;
	try {
		const result = ts.transpileModule(code, {
			fileName,
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				// Keep classes as ES2015 to avoid calling ES class super as a function
				// This prevents "Class constructor X cannot be invoked without 'new'"
				target: ts.ScriptTarget.ES2015,
				sourceMap: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				noEmitHelpers: true,
			},
			transformers: { before: [nativeClassTransformer as unknown as ts.TransformerFactory<ts.SourceFile>] },
		});
		// If the transformer didn't actually remove @NativeClass (edge case) return null to allow fallback
		if (result.outputText.includes('@NativeClass')) {
			return null;
		}
		return {
			code: result.outputText,
			map: result.sourceMapText ? JSON.parse(result.sourceMapText) : null,
		};
	} catch (e) {
		return null;
	}
}
