import { parse as babelParse } from '@babel/parser';
import type { File, Statement, ImportDeclaration } from '@babel/types';
import { genCode } from './babel.js';

export interface AstProcessResult {
	imports: string[];
	body: string;
	diagnostics: string[];
}

export function astExtractImportsAndStripTypes(source: string): AstProcessResult {
	const diagnostics: string[] = [];
	let ast: File | null = null;
	try {
		ast = babelParse(source, {
			sourceType: 'module',
			plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties', 'classPrivateProperties', 'classPrivateMethods'],
		}) as unknown as File;
	} catch (e) {
		diagnostics.push('[ast] parse failed: ' + (e as any)?.message);
		return { imports: [], body: source, diagnostics };
	}

	const importDecls: ImportDeclaration[] = [];
	const other: Statement[] = [];
	for (const stmt of ast.program.body as Statement[]) {
		if ((stmt as any).type === 'ImportDeclaration') importDecls.push(stmt as any);
		else other.push(stmt);
	}

	for (const imp of importDecls) {
		if ((imp as any).importKind === 'type') {
			const idx = importDecls.indexOf(imp);
			if (idx >= 0) importDecls.splice(idx, 1);
			continue;
		}
		if ((imp as any).specifiers) {
			(imp as any).specifiers = (imp as any).specifiers.filter((s: any) => s.importKind !== 'type');
		}
	}

	const fileNoImports: File = {
		...ast,
		program: { ...ast.program, body: other },
	} as any;

	let bodyCode = '';
	try {
		bodyCode = genCode(fileNoImports, { comments: true }).code;
	} catch (e) {
		diagnostics.push('[ast] generate body failed: ' + (e as any)?.message);
		bodyCode = source;
	}

	if (/(\(|,|=)\s*[A-Za-z_$][\w$]*\s*:\s*(?:boolean|string|number|any|unknown|void|null|undefined)/.test(bodyCode)) {
		bodyCode = bodyCode.replace(/(\(|,|=)\s*([A-Za-z_$][\w$]*)\s*:\s*(boolean|string|number|any|unknown|void|null|undefined)/g, '$1 $2');
		diagnostics.push('[ast-fallback] stripped residual param annotations');
	}

	const beforeVarStrip = bodyCode;
	bodyCode = bodyCode.replace(/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*:\s*([^=;]+?)(=)/g, (_m, decl, name, _type, eq) => `${decl} ${name} ${eq}`);
	if (bodyCode !== beforeVarStrip) {
		diagnostics.push('[ast-fallback] stripped variable type annotations');
	}

	const importsCode = importDecls
		.map((d) => {
			try {
				return genCode(d, { comments: false }).code;
			} catch {
				return '';
			}
		})
		.filter(Boolean);

	const beforeDefaults = (source.match(/\bdefault\s*:/g) || []).length;
	const afterDefaults = (bodyCode.match(/\bdefault\s*:/g) || []).length;
	if (afterDefaults < beforeDefaults) diagnostics.push(`[ast][warn] default property count dropped ${beforeDefaults} -> ${afterDefaults}`);

	return { imports: importsCode, body: bodyCode, diagnostics };
}
