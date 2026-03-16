import ts from 'typescript';
import nativeClassTransformer from '../../src/transformers/NativeClass';

function transform(input: string): string {
	return ts.transpileModule(input, {
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2022,
			experimentalDecorators: true,
			emitDecoratorMetadata: false,
			useDefineForClassFields: false,
		},
		transformers: {
			before: [nativeClassTransformer as ts.TransformerFactory<ts.SourceFile>],
		},
	}).outputText;
}

function countClassDeclarations(sourceText: string): number {
	const sourceFile = ts.createSourceFile(
		'/transformed.js',
		sourceText,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.JS,
	);

	let count = 0;
	const walk = (node: ts.Node) => {
		if (ts.isClassDeclaration(node)) {
			count++;
		}
		ts.forEachChild(node, walk);
	};

	walk(sourceFile);
	return count;
}

describe('NativeClass transformer', () => {
	describe('top-level classes', () => {
		it('downlevels @NativeClass (no parentheses) to ES5 IIFE', () => {
			const output = transform(`
@NativeClass
class Foo extends NSObject {}
`);

			expect(output).toContain('var Foo =');
			expect(output).toContain('__extends(Foo, _super)');
			expect(output).toContain('function (_super)');
			expect(output).not.toContain('@NativeClass');
			expect(countClassDeclarations(output)).toBe(0);
		});

		it('downlevels @NativeClass() (with parentheses) to ES5 IIFE', () => {
			const output = transform(`
@NativeClass()
class Foo extends NSObject {}
`);

			expect(output).toContain('var Foo =');
			expect(output).toContain('__extends(Foo, _super)');
			expect(output).toContain('function (_super)');
			expect(output).not.toContain('@NativeClass');
			expect(countClassDeclarations(output)).toBe(0);
		});

		it('downlevels exported @NativeClass() class and preserves export', () => {
			const output = transform(`
@NativeClass()
export class Bar extends NSObject {}
`);

			expect(output).toContain('var Bar =');
			expect(output).toContain('__extends(Bar, _super)');
			expect(output).toContain('export { Bar }');
			expect(output).not.toContain('@NativeClass');
			expect(countClassDeclarations(output)).toBe(0);
		});

		it('preserves prototype methods on the downleveled class', () => {
			const output = transform(`
@NativeClass()
class Baz extends UIView {
  doWork() { return 1; }
}
`);

			expect(output).toContain('var Baz =');
			expect(output).toContain('__extends(Baz, _super)');
			expect(output).toContain('Baz.prototype.doWork = function ()');
			expect(output).not.toContain('@NativeClass');
		});

		it('downlevels multiple @NativeClass() classes in the same file', () => {
			const output = transform(`
@NativeClass()
class A extends NSObject {}
@NativeClass()
class B extends NSObject {}
`);

			expect(output).toContain('var A =');
			expect(output).toContain('__extends(A, _super)');
			expect(output).toContain('var B =');
			expect(output).toContain('__extends(B, _super)');
			expect(output).not.toContain('@NativeClass');
			expect(countClassDeclarations(output)).toBe(0);
		});

		it('does NOT downlevel classes without @NativeClass', () => {
			const output = transform(`
class Plain extends Base {
  method() {}
}
`);

			expect(output).toContain('class Plain extends Base');
			expect(output).not.toContain('var Plain =');
			expect(output).not.toContain('__extends');
			expect(countClassDeclarations(output)).toBe(1);
		});

		it('downlevels only the @NativeClass class when mixed with a plain class', () => {
			const output = transform(`
class Regular {}
@NativeClass()
class Native extends NSObject {}
`);

			expect(output).toContain('class Regular');
			expect(output).toContain('var Native =');
			expect(output).toContain('__extends(Native, _super)');
			// Regular class stays as modern class declaration
			expect(countClassDeclarations(output)).toBe(1);
		});
	});

	describe('strip-loader marker', () => {
		it('downlevels a class preceded by the /*__NativeClass__*/ marker', () => {
			const output = transform(`
/*__NativeClass__*/
class Marked extends NSObject {}
`);

			expect(output).toContain('var Marked =');
			expect(output).toContain('__extends(Marked, _super)');
			expect(output).not.toContain('/*__NativeClass__*/');
			expect(countClassDeclarations(output)).toBe(0);
		});
	});

	describe('import cleanup', () => {
		it('removes NativeClass from a named import while keeping other imports', () => {
			const output = transform(`
import { NativeClass, Observable } from '@nativescript/core';
class Foo {}
`);

			expect(output).toContain("from '@nativescript/core'");
			expect(output).toContain('Observable');
			expect(output).not.toContain('NativeClass');
		});

		it('removes the entire import statement when NativeClass is the only import', () => {
			const output = transform(`
import { NativeClass } from '@nativescript/core';
@NativeClass()
class X extends NSObject {}
`);

			expect(output).not.toContain('NativeClass');
			expect(output).toContain('var X =');
			expect(output).toContain('__extends(X, _super)');
		});
	});

	describe('nested scopes', () => {
		it('downlevels @NativeClass() class declared inside a function body', () => {
			const output = transform(`
function test() {
  @NativeClass()
  class Test extends UIView {}
}
`);

			expect(output).toContain('function test()');
			expect(output).toContain('var Test =');
			expect(output).toContain('__extends(Test, _super)');
			expect(output).toContain('function (_super)');
			expect(output).not.toContain('@NativeClass');
			expect(countClassDeclarations(output)).toBe(0);
		});

		it('downlevels @NativeClass() class declared inside an arrow function body', () => {
			const output = transform(`
const test2 = () => {
  @NativeClass()
  class Test extends UIView {}
};
`);

			expect(output).toContain('const test2 = () =>');
			expect(output).toContain('var Test =');
			expect(output).toContain('__extends(Test, _super)');
			expect(output).toContain('function (_super)');
			expect(output).not.toContain('@NativeClass');
			expect(countClassDeclarations(output)).toBe(0);
		});
	});
});
