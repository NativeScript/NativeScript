import path from 'path';
import type * as TS from 'typescript';

export const ANGULAR_COMPONENT_UPDATE_EVENT = 'angular:component-update';
export const ANGULAR_INVALIDATE_EVENT = 'angular:invalidate';

/** `@Component` properties whose edits Angular can apply in place via `ɵɵreplaceMetadata`. */
export const HMR_METADATA_FIELDS: ReadonlySet<string> = new Set(['template', 'templateUrl', 'styles', 'styleUrl', 'styleUrls']);

export interface FullReloadPayload {
	type: 'full-reload';
	path: '*';
	triggeredBy?: string;
}

export interface CustomPayload {
	type: 'custom';
	event: string;
	data?: unknown;
}

export function toPosixPath(filePath: string): string {
	return filePath.replace(/\\/g, '/');
}

/**
 * Normalizes both `ws.send` call shapes (`send(payload)` and
 * `send(event, data)`) into a payload object.
 */
export function normalizeWsSendArgs(args: readonly unknown[]): unknown {
	if (typeof args[0] === 'string') {
		return { type: 'custom', event: args[0], data: args[1] } satisfies CustomPayload;
	}
	return args[0];
}

export function isComponentUpdatePayload(payload: unknown): payload is CustomPayload {
	return !!payload && typeof payload === 'object' && (payload as CustomPayload).type === 'custom' && (payload as CustomPayload).event === ANGULAR_COMPONENT_UPDATE_EVENT;
}

export function isFullReloadPayload(payload: unknown): payload is FullReloadPayload {
	return !!payload && typeof payload === 'object' && (payload as FullReloadPayload).type === 'full-reload';
}

/**
 * Splits Analog's `encodeURIComponent('<relative path>@<ClassName>')` id.
 * Splits on the last `@` because scoped paths may contain `@`.
 */
export function decodeComponentUpdateId(id: unknown): { relativePath: string; className: string } | null {
	if (typeof id !== 'string' || !id) return null;
	let decoded = id;
	try {
		decoded = decodeURIComponent(id);
	} catch {}
	const at = decoded.lastIndexOf('@');
	const relativePath = at >= 0 ? decoded.slice(0, at) : decoded;
	const className = at >= 0 ? decoded.slice(at + 1) : '';
	if (!relativePath) return null;
	return { relativePath, className };
}

/**
 * Absolute POSIX candidates for the component file an update id names.
 * Stock Analog builds the id against `process.cwd()`; a build that uses its
 * `workspaceRoot` option instead must match too, so every base is tried.
 */
export function componentUpdateIdToFiles(id: unknown, bases: readonly string[]): string[] {
	const decoded = decodeComponentUpdateId(id);
	if (!decoded) return [];
	const files = new Set<string>();
	for (const base of bases) {
		if (!base) continue;
		files.add(toPosixPath(path.resolve(base, decoded.relativePath)));
	}
	return Array.from(files);
}

function stripSourceExtension(file: string): string {
	return toPosixPath(file).replace(/\.(?:tsx?|mts|html?|css|scss|sass|less)$/i, '');
}

export interface RootComponentFile {
	/** Absolute POSIX path, extension optional. */
	file: string;
	className: string;
}

/** Matches by file first; the class name covers id bases that resolve elsewhere. */
export function isRootComponentUpdate(root: RootComponentFile | null | undefined, id: unknown, bases: readonly string[]): boolean {
	if (!root) return false;
	const decoded = decodeComponentUpdateId(id);
	if (!decoded) return false;
	const rootKey = stripSourceExtension(root.file);
	if (componentUpdateIdToFiles(id, bases).some((file) => stripSourceExtension(file) === rootKey)) return true;
	return !!decoded.className && decoded.className === root.className;
}

function propertyNameText(ts: typeof TS, name: TS.PropertyName): string | null {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
	return null;
}

function isComponentDecoratorCallee(ts: typeof TS, expression: TS.Expression): boolean {
	if (ts.isIdentifier(expression)) return expression.text === 'Component';
	if (ts.isPropertyAccessExpression(expression)) return expression.name.text === 'Component';
	return false;
}

/**
 * Source text with every `@Component({...})` object literal reduced to its
 * non-HMR properties, so two versions compare equal exactly when nothing
 * outside the in-place-updatable metadata changed.
 */
export function stripHmrMetadata(ts: typeof TS, source: string, fileName = 'component.ts'): string {
	const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const edits: { start: number; end: number; text: string }[] = [];

	const visit = (node: TS.Node): void => {
		if (ts.isDecorator(node) && ts.isClassDeclaration(node.parent)) {
			const call = node.expression;
			if (ts.isCallExpression(call) && isComponentDecoratorCallee(ts, call.expression) && call.arguments.length === 1 && ts.isObjectLiteralExpression(call.arguments[0])) {
				const literal = call.arguments[0];
				const kept = literal.properties.filter((property) => {
					if (!ts.isPropertyAssignment(property)) return true;
					const name = propertyNameText(ts, property.name);
					return !name || !HMR_METADATA_FIELDS.has(name);
				});
				edits.push({ start: literal.getStart(sourceFile), end: literal.end, text: `{${kept.map((property) => property.getText(sourceFile)).join(',')}}` });
				return;
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);

	let result = source;
	for (const edit of edits.sort((a, b) => b.start - a.start)) {
		result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
	}
	return result;
}

/**
 * True when the only differences between `previous` and `next` are inside
 * `@Component` HMR metadata. Without TypeScript or a previous version the
 * answer is `false`: an in-place update would silently drop class changes.
 */
export function hasOnlyHmrMetadataChanges(ts: typeof TS | null | undefined, previous: string | undefined, next: string, fileName?: string): boolean {
	if (!ts || previous === undefined) return false;
	if (previous === next) return true;
	try {
		return stripHmrMetadata(ts, previous, fileName) === stripHmrMetadata(ts, next, fileName);
	} catch {
		return false;
	}
}

export interface ComponentUpdateRuleContext {
	/** Id bases Analog may have used (see `componentUpdateIdToFiles`). */
	idBases: readonly string[];
	root: RootComponentFile | null;
	/** True when a `.ts` save of `file` changed more than HMR metadata since the device last fully reloaded. */
	hasClassChange(file: string): boolean;
}

export interface ComponentUpdateRuleResult {
	payload: unknown;
}

/**
 * Turns an `angular:component-update` that can't be applied in place into a
 * full reload: the root component hosts `page-router-outlet`, which does not
 * survive `ɵɵreplaceMetadata`, and a class change is never applied by it.
 * Every other payload passes through unchanged.
 */
export function applyComponentUpdateRules(payload: unknown, context: ComponentUpdateRuleContext): ComponentUpdateRuleResult {
	if (!isComponentUpdatePayload(payload)) return { payload };
	const id = (payload.data as { id?: unknown } | undefined)?.id;
	const files = componentUpdateIdToFiles(id, context.idBases);
	const classChanged = files.find((file) => context.hasClassChange(file));
	if (classChanged) {
		return { payload: { type: 'full-reload', path: '*', triggeredBy: classChanged } satisfies FullReloadPayload };
	}
	if (isRootComponentUpdate(context.root, id, context.idBases)) {
		return { payload: { type: 'full-reload', path: '*', triggeredBy: files[0] } satisfies FullReloadPayload };
	}
	return { payload };
}

/**
 * Answer for a `/@ng/component` fetch that must not replace metadata: Angular's
 * `<Class>_HmrLoad` runs `m.default && ɵɵreplaceMetadata(...)`, so a module
 * without a default is a no-op. The iOS HTTP loader rejects an empty body.
 */
export const NG_COMPONENT_NO_UPDATE_MODULE = 'export default undefined;\n';

function decodeOnce(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/** `c` and `t` of an Angular metadata fetch (`…/@ng/component?c=<id>&t=<ts>`), or null for any other URL. */
export function parseNgComponentRequest(url: string | undefined): { id: string; timestamp: string } | null {
	if (!url) return null;
	let parsed: URL;
	try {
		parsed = new URL(url, 'http://localhost');
	} catch {
		return null;
	}
	if (!parsed.pathname.endsWith('/@ng/component')) return null;
	return { id: decodeOnce(parsed.searchParams.get('c') ?? ''), timestamp: parsed.searchParams.get('t') ?? '' };
}

/**
 * The latest `angular:component-update` timestamp sent per component id.
 * Every compiled component fetches `/@ng/component?c=<id>&t=<now>` when its
 * module evaluates, and Analog answers with a real update payload whenever
 * that module was invalidated at any point in the server's lifetime. Replacing
 * metadata at boot recreates views for nothing, and for the root component it
 * tears down `page-router-outlet`. Only a fetch that echoes a sent update's
 * exact `(id, timestamp)` may reach Analog.
 */
export class ComponentUpdateLedger {
	private readonly latest = new Map<string, string>();

	record(data: unknown): void {
		const { id, timestamp } = (data ?? {}) as { id?: unknown; timestamp?: unknown };
		if (typeof id !== 'string' || !id || (typeof timestamp !== 'number' && typeof timestamp !== 'string')) return;
		this.latest.set(decodeOnce(id), String(timestamp));
	}

	isLive(request: { id: string; timestamp: string }): boolean {
		return !!request.id && !!request.timestamp && this.latest.get(request.id) === request.timestamp;
	}
}
