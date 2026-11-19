/**
 * Turns a Vite `error` payload, or an error thrown while the new app
 * evaluated, into the text of the overlay's `failed` stage. Pure.
 */
import type { ErrorPayload } from 'vite';

/** Device route prefix of Vite URLs (`hmr/server/thin/thin-mode.ts`). */
const THIN_PREFIX = '/ns/v';

const MAX_MESSAGE_LINES = 6;
const MAX_CODE_LINES = 12;

// CSI and OSC sequences; Vite strips most, but plugin messages may keep colors.
const ANSI_RE = /[\u001b\u009b](?:\[[0-?]*[ -/]*[@-~]|\][^\u0007\u001b]*(?:\u0007|\u001b\\))/g;

export interface ErrorOverlayText {
	detail: string;
	code?: string;
}

export function stripAnsi(text: string): string {
	return text.replace(ANSI_RE, '');
}

function clampLines(text: string, max: number): string {
	const lines = text.replace(/\s+$/, '').split('\n');
	return lines.length > max ? [...lines.slice(0, max), '…'].join('\n') : lines.join('\n');
}

function toPosix(path: string): string {
	return path.replace(/\\/g, '/');
}

/** `file`, root-relative when it is under `root`, plus `:line:column` when known. */
export function formatErrorLocation(err: Pick<ErrorPayload['err'], 'id' | 'loc'>, root: string | undefined): string | undefined {
	const file = err.loc?.file || err.id;
	if (!file) return undefined;
	let shown = toPosix(file);
	const rootPosix = root ? toPosix(root).replace(/\/+$/, '') : '';
	if (rootPosix && shown.startsWith(`${rootPosix}/`)) shown = shown.slice(rootPosix.length + 1);
	const line = err.loc?.line;
	if (typeof line !== 'number') return shown;
	const column = err.loc?.column;
	return typeof column === 'number' ? `${shown}:${line}:${column}` : `${shown}:${line}`;
}

/** The overlay text for Vite's `error` payload: location, message, then the code frame. */
export function describeServerError(err: ErrorPayload['err'], root: string | undefined): ErrorOverlayText {
	const location = formatErrorLocation(err, root);
	const message = clampLines(stripAnsi(String(err.message ?? '')).trim(), MAX_MESSAGE_LINES);
	const frame = typeof err.frame === 'string' ? stripAnsi(err.frame).replace(/^\n+|\s+$/g, '') : '';
	return {
		detail: [location, message].filter(Boolean).join('\n'),
		...(frame ? { code: clampLines(frame, MAX_CODE_LINES) } : {}),
	};
}

/**
 * The overlay text for an error thrown on the device: the message, then the
 * stack frames with device module URLs shortened to their Vite URL.
 */
export function describeRuntimeError(err: unknown, origin: string): ErrorOverlayText {
	const message = clampLines(stripAnsi(String((err as any)?.message ?? err)).trim(), MAX_MESSAGE_LINES);
	const stack = typeof (err as any)?.stack === 'string' ? stripAnsi((err as any).stack) : '';
	const frames = stack
		.split('\n')
		.filter((line) => /^\s*at\s/.test(line))
		.map((line) => line.trim().split(`${origin}${THIN_PREFIX}`).join(''));
	return {
		detail: message,
		...(frames.length ? { code: clampLines(frames.join('\n'), MAX_CODE_LINES) } : {}),
	};
}

/**
 * Device module URLs (`<origin>/ns/v/…`) in `stack`, without the
 * `:line:column` suffix, in order of first appearance.
 */
export function deviceModuleUrlsInStack(stack: unknown, origin: string): string[] {
	if (typeof stack !== 'string' || !stack) return [];
	const prefix = `${origin}${THIN_PREFIX}/`;
	const found = new Set<string>();
	for (let at = stack.indexOf(prefix); at >= 0; at = stack.indexOf(prefix, at + prefix.length)) {
		const end = stack.slice(at).search(/[\s()'"<>]/);
		const url = (end < 0 ? stack.slice(at) : stack.slice(at, at + end)).replace(/(?::\d+){1,2}$/, '');
		found.add(url);
	}
	return [...found];
}
