import { Trace } from '../../trace';

/**
 * Resolves an environment variable to a css value, or null to fall back.
 */
export type CssEnvironmentValueProvider = (indices: readonly number[], view?: unknown) => string | null;

interface CssEnvironmentVariable {
	dimensions: number;
	provider: CssEnvironmentValueProvider;
}

// Invalid at computed-value time; the cascade maps it onto unsetValue.
const IACVT = 'unset';

const ENV_FUNCTION = 'env(';
const NO_INDICES: readonly number[] = [];
const MAX_SUBSTITUTIONS = 64;

const CUSTOM_IDENT_RE = /^-{0,2}[a-zA-Z_][\w-]*$/;
const INTEGER_RE = /^[0-9]+$/;

const registry = new Map<string, CssEnvironmentVariable>();

/**
 * Publishes an environment variable to css `env()`.
 * @param name Matched case-sensitively.
 * @param dimensions How many indices the variable takes; 0 for a scalar.
 * @param provider Called on every substitution, so values are never stale.
 */
export function registerCssEnvironmentVariable(name: string, dimensions: number, provider: CssEnvironmentValueProvider): void {
	registry.set(name, { dimensions, provider });
}

export function unregisterCssEnvironmentVariable(name: string): void {
	registry.delete(name);
}

export function isCssEnvExpression(value: string): boolean {
	return value.includes(ENV_FUNCTION);
}

function resolveEnvironmentVariable(name: string, indices: readonly number[], view: unknown): string | null {
	const variable = registry.get(name);
	if (!variable || variable.dimensions !== indices.length) {
		return null;
	}

	try {
		return variable.provider(indices, view) ?? null;
	} catch (e) {
		Trace.write(`Failed to resolve css environment variable [${name}]. ${e}`, Trace.categories.Style, Trace.messageType.error);

		return null;
	}
}

// EOF closes open constructs in css, so an unbalanced value ends at its length.
function findClosingParen(value: string, open: number): number {
	let depth = 0;

	for (let i = open, length = value.length; i < length; i++) {
		const code = value.charCodeAt(i);
		if (code === 40 /* ( */) {
			depth++;
		} else if (code === 41 /* ) */) {
			depth--;
			if (depth === 0) {
				return i;
			}
		}
	}

	return value.length;
}

function indexOfTopLevelComma(value: string): number {
	let depth = 0;

	for (let i = 0, length = value.length; i < length; i++) {
		const code = value.charCodeAt(i);
		if (code === 40 /* ( */) {
			depth++;
		} else if (code === 41 /* ) */) {
			if (depth > 0) {
				depth--;
			}
		} else if (depth === 0 && code === 44 /* , */) {
			return i;
		}
	}

	return -1;
}

function parseEnvironmentArguments(head: string): { name: string; indices: readonly number[] } | null {
	const parts = head.trim().split(/\s+/);
	const name = parts[0];
	if (!name || !CUSTOM_IDENT_RE.test(name)) {
		return null;
	}

	if (parts.length === 1) {
		return { name, indices: NO_INDICES };
	}

	const indices: number[] = [];
	for (let i = 1; i < parts.length; i++) {
		if (!INTEGER_RE.test(parts[i])) {
			return null;
		}

		indices.push(parseInt(parts[i], 10));
	}

	return { name, indices };
}

/**
 * Substitutes every `env()` in the value, or returns `unset` when the declaration is
 * invalid at computed-value time.
 */
export function _evaluateCssEnvExpression(value: string, view?: unknown): string {
	if (typeof value !== 'string' || !isCssEnvExpression(value)) {
		return value;
	}

	let output = value;
	// A provider returning text with `env(` would otherwise never settle.
	let remaining = MAX_SUBSTITUTIONS;

	// The last `env(` is innermost, so its body holds no other.
	for (let open = output.lastIndexOf(ENV_FUNCTION); open !== -1; open = output.lastIndexOf(ENV_FUNCTION)) {
		if (remaining-- === 0) {
			Trace.write(`Too many css env() substitutions in [${value}].`, Trace.categories.Style, Trace.messageType.error);

			return IACVT;
		}

		const close = findClosingParen(output, open + ENV_FUNCTION.length - 1);
		const args = output.substring(open + ENV_FUNCTION.length, close);
		const commaIndex = indexOfTopLevelComma(args);
		const parsed = parseEnvironmentArguments(commaIndex === -1 ? args : args.substring(0, commaIndex));

		if (!parsed) {
			return IACVT;
		}

		// A resolved name discards its fallback unread.
		let substitution = resolveEnvironmentVariable(parsed.name, parsed.indices, view);
		if (substitution === null) {
			if (commaIndex === -1) {
				return IACVT;
			}

			substitution = args.substring(commaIndex + 1).trim();
		}

		output = `${output.substring(0, open)}${substitution}${output.substring(close + 1)}`;
	}

	return output;
}

/**
 * Something holding a value resolved from `env()`, to resolve again on a change.
 */
export interface CssEnvironmentDependent {
	_reevaluateCssEnvironment(): void;
}

// Weakly held, so a dependent dropped without untracking is not kept alive.
const dependents = new Set<WeakRef<CssEnvironmentDependent>>();
const dependentRefs = new WeakMap<CssEnvironmentDependent, WeakRef<CssEnvironmentDependent>>();

export function _trackCssEnvironmentDependent(dependent: CssEnvironmentDependent): void {
	let ref = dependentRefs.get(dependent);
	if (!ref) {
		ref = new WeakRef(dependent);
		dependentRefs.set(dependent, ref);
	}

	dependents.add(ref);
}

export function _untrackCssEnvironmentDependent(dependent: CssEnvironmentDependent): void {
	const ref = dependentRefs.get(dependent);
	if (ref) {
		dependents.delete(ref);
	}
}

/**
 * Re-evaluates every value resolved from `env()`. Called by whoever published the
 * variable that changed.
 */
export function notifyCssEnvironmentChanged(): void {
	if (dependents.size === 0) {
		return;
	}

	// A dependent may track or untrack while re-evaluating.
	for (const ref of Array.from(dependents)) {
		const dependent = ref.get();
		if (!dependent) {
			dependents.delete(ref);
			continue;
		}

		try {
			dependent._reevaluateCssEnvironment();
		} catch (e) {
			Trace.write(`Failed to re-evaluate a css env() dependent. ${e}`, Trace.categories.Style, Trace.messageType.error);
		}
	}
}

let notificationScheduled = false;

/**
 * Coalesces into one notifyCssEnvironmentChanged, for changes made while a style is
 * being applied, where re-evaluating synchronously would re-enter it.
 */
export function _scheduleCssEnvironmentChanged(): void {
	if (notificationScheduled || dependents.size === 0) {
		return;
	}

	notificationScheduled = true;
	queueMicrotask(() => {
		notificationScheduled = false;
		notifyCssEnvironmentChanged();
	});
}
