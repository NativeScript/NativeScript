import { describe, it, expect, vi } from 'vitest';
import { buildInlineTemplateBlock, createProcessSfcCode, extractTemplateRender, processTemplateVariantMinimal } from './sfc-transforms.js';

describe('vue sfc transforms', () => {
	it('creates a processor that injects export helper', () => {
		const mockProcess = vi.fn<(code: string, isVitePreBundled: boolean) => string>().mockImplementation((code) => `processed::${code}`);

		const processSfcCode = createProcessSfcCode(mockProcess);
		const input = 'const answer = 42;';
		const result = processSfcCode(input);

		expect(mockProcess).toHaveBeenCalledWith(input, false);
		expect(result.startsWith('function _export_sfc')).toBe(true);
		expect(result).toContain('processed::const answer = 42;');
	});

	it('minimally strips template helpers', () => {
		const input = `
import { createHotContext as __vite__createHotContext } from "vite-runtime";import.meta.hot = __vite__createHotContext();
import { ref, reactive } from "vue";
const value = ref(1);
`;
		const result = processTemplateVariantMinimal(input);
		expect(result).not.toContain('createHotContext');
		expect(result).toContain('import { ref, reactive } from "/ns/rt";');
	});

	it('extracts render declaration and hoisted bindings', () => {
		const input = `
import { ref } from "vue";
const _hoisted_1 = { foo: 'bar' };
export function render(_ctx, _cache) {
  return _hoisted_1;
}
`;
		const result = extractTemplateRender(input);
		expect(result.ok).toBe(true);
		expect(result.helperBindings).toContain('_hoisted_1');
		expect(result.renderDecl).toContain('function __ns_render(');
		expect(result.renderDecl).not.toContain('export function render');
	});

	it('builds inline template block with render alias', () => {
		const input = `
import { ref } from "vue";
export const render = () => { return "ok"; };
export { render };
`;
		const output = buildInlineTemplateBlock(input);
		expect(output).toBeDefined();
		expect(output).not.toMatch(/^\s*import/m);
		expect(output).toContain('const __ns_render = () => { return "ok"; };');
		expect(output).not.toContain('export { render }');
	});
});
