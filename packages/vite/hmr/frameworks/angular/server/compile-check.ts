import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const COMPONENT_DECORATOR_RE = /@Component\s*\(/;
const SCRIPT_RE = /\.[cm]?tsx?$/;
const TEMPLATE_URL_RE = /templateUrl\s*:\s*(['"`])([^'"`]+)\1/;
const INLINE_TEMPLATE_RE = /\btemplate\s*:\s*`([\s\S]*?)`/;

export interface TemplateProblem {
	message: string;
	file: string;
	line?: number;
	column?: number;
}

/**
 * Angular's template parser, from the app's own `@angular/compiler`. Template
 * errors aren't diagnostics Analog reports by default (`disableTypeChecking`
 * keeps only syntactic ones), so this is how their text is recovered.
 */
async function findTemplateProblem(componentFile: string, source: string): Promise<TemplateProblem | undefined> {
	let template: string | undefined;
	let templateFile = componentFile;
	const url = TEMPLATE_URL_RE.exec(source)?.[2];
	if (url) {
		templateFile = path.resolve(path.dirname(componentFile), url);
		template = await fs.readFile(templateFile, 'utf8').catch(() => undefined);
	} else {
		template = INLINE_TEMPLATE_RE.exec(source)?.[1];
	}
	if (template === undefined) return undefined;
	try {
		const entry = createRequire(componentFile).resolve('@angular/compiler');
		const { parseTemplate } = (await import(pathToFileURL(entry).href)) as { parseTemplate(template: string, url: string, options?: object): { errors?: Array<{ msg: string; span?: { start?: { line: number; col: number } } }> | null } };
		const error = parseTemplate(template, templateFile, {}).errors?.[0];
		if (!error) return undefined;
		const start = error.span?.start;
		// An inline template's positions are relative to the template literal, not the file.
		return { message: error.msg, file: templateFile, ...(start && url ? { line: start.line + 1, column: start.col + 1 } : {}) };
	} catch {
		return undefined;
	}
}

/**
 * Rejects the output of a component Angular failed to compile. Its compiler
 * then emits the plain, uncompiled `@Component` decorator instead of the
 * component definition, which would fail when the device evaluates it.
 */
export async function verifyAngularComponentOutput(module: { id: string; code: string }, readSource: (file: string) => Promise<string> = (file) => fs.readFile(file, 'utf8')): Promise<Error | undefined> {
	const file = module.id.split('?', 1)[0];
	if (!SCRIPT_RE.test(file) || file.includes('/node_modules/')) return undefined;
	if (module.code.includes('ɵcmp') || module.code.includes('ɵɵdefineComponent')) return undefined;
	const source = await readSource(file).catch(() => '');
	if (!COMPONENT_DECORATOR_RE.test(source)) return undefined;

	const problem = await findTemplateProblem(file, source);
	const where = problem?.line ? `${problem.file}:${problem.line}:${problem.column}` : (problem?.file ?? file);
	const message = problem ? `Angular could not compile the component in ${path.basename(file)}: ${problem.message} (${where})` : `Angular could not compile the component in ${path.basename(file)}; check its template and decorator metadata`;
	return Object.assign(new Error(message), {
		id: problem?.file ?? file,
		plugin: 'nativescript:angular-compile-check',
		...(problem?.line ? { loc: { file: problem.file, line: problem.line, column: problem.column } } : {}),
	});
}
