import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { transformNativeClassSource } from '../helpers/nativeclass-transform.js';
import nativeClassTransformer from '../transformers/NativeClass/index.js';

const SAMPLE_TS = `

@NativeClass()
export class TimerTargetImpl extends NSObject {
  static initWithCallback(callback: Function, id: number, shouldRepeat: boolean) {
    return new TimerTargetImpl();
  }
  tick(timer: any) {}
}
`;

const NO_DECORATOR_TS = `
export class Foo { bar() {} }
`;

describe('NativeClass transformer helper', () => {
	it('removes @NativeClass and emits ES5 for decorated classes', () => {
		const res = transformNativeClassSource(SAMPLE_TS, '/app/src/sample.ts');
		expect(res).toBeTruthy();
		const code = res!.code;
		// Should not contain the decorator marker anymore
		expect(code).not.toContain('@NativeClass');
		expect(code).not.toContain('NativeClass');
		// Should compile class to ES5 pattern (function IIFE or defineProperty)
		expect(/Object\.defineProperty\(|function\s*\(/.test(code)).toBeTruthy();
	});

	it('does not change code without @NativeClass', () => {
		const result = ts.transpileModule(NO_DECORATOR_TS, {
			fileName: '/app/src/none.ts',
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				target: ts.ScriptTarget.ESNext,
			},
			transformers: { before: [nativeClassTransformer as unknown as ts.TransformerFactory<ts.SourceFile>] },
		});
		expect(result.outputText).toContain('class Foo');
	});

	it('returns null for sources without @NativeClass', () => {
		const res = transformNativeClassSource(NO_DECORATOR_TS, '/app/src/none.ts');
		expect(res).toBeNull();
	});
});
