import { parse as vueParse, compileTemplate as vueCompileTemplate, compileScript as vueCompileScript } from '@vue/compiler-sfc';
import { NS_NATIVE_TAGS } from '../../../server/compiler.js';

export function makeNativeScriptIsCustomElement(bindingMetadata?: Record<string, unknown>): (tag: string) => boolean {
	const isSetupBinding = (tag: string) => !!(bindingMetadata && Object.prototype.hasOwnProperty.call(bindingMetadata, tag));

	return (tag: string): boolean => {
		if (isSetupBinding(tag)) {
			return false;
		}
		if (NS_NATIVE_TAGS.has(tag)) {
			return true;
		}
		if (/^[A-Z][A-Za-z0-9]*/.test(tag)) {
			return true;
		}
		return false;
	};
}

export const vueSfcCompiler = {
	parse: vueParse,
	compileTemplate: vueCompileTemplate,
	compileScript: vueCompileScript,
};

export const parseSfc = vueParse;
export const compileSfcTemplate = vueCompileTemplate;
export const compileSfcScript = vueCompileScript;

export type { SFCDescriptor, SFCParseOptions, SFCScriptCompileOptions, SFCTemplateCompileOptions } from '@vue/compiler-sfc';
