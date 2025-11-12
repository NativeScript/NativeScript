import ts from 'typescript';
import stripLoader from '../../src/loaders/native-class-strip-loader';
import downlevelLoader from '../../src/loaders/native-class-downlevel-loader';

function createStripContext(onDone: (code: string) => void) {
	return {
		resourcePath: '/app/src/page-transition.android.ts',
		callback(err: Error | null, source?: string) {
			if (err) throw err;
			onDone(source || '');
		},
	} as any;
}

function createDownlevelContext(
	onDone: (code: string, warnings: Error[]) => void,
) {
	const warnings: Error[] = [];
	return {
		resourcePath: '/app/src/page-transition.android.ts',
		emitWarning: (err: Error) => warnings.push(err),
		callback(err: Error | null, source?: string) {
			if (err) throw err;
			onDone(source || '', warnings);
		},
	} as any;
}

describe('native-class strip + downlevel loaders', () => {
	it('downlevels Android-style constructor returning global.__native(this) without leaking top-level return', (done) => {
		const INPUT_TS = `
@NativeClass
export class FooImpl extends NSObject {
	constructor() {
		super();
		return global.__native(this);
	}
}
`;

		stripLoader.call(
			createStripContext((stripped) => {
				downlevelLoader.call(
					createDownlevelContext((output, warnings) => {
						// Ensure decoractor is stripped
						expect(output).not.toContain('@NativeClass');
						expect(output).not.toContain('/*__NativeClass__*/');
						// Should include ES5 constructs
						expect(
							/Object\.defineProperty\(|function\s*\(/.test(output),
						).toBeTruthy();
						// Parse output and ensure no top-level return leaked
						const sf = ts.createSourceFile(
							'/check.js',
							output,
							ts.ScriptTarget.ES2017,
							true,
							ts.ScriptKind.JS,
						);
						const hasTopLevelReturn = sf.statements.some(
							(s) => s.kind === ts.SyntaxKind.ReturnStatement,
						);
						expect(hasTopLevelReturn).toBe(false);
						done();
					}),
					stripped,
				);
			}),
			INPUT_TS,
		);
	});
});
