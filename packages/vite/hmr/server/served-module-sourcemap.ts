import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { decode, encode, type SourceMapMappings, type SourceMapSegment } from '@jridgewell/sourcemap-codec';

export interface InputSourceMap {
	version: number | string;
	mappings: string;
	sources: Array<string | null>;
	sourcesContent?: Array<string | null>;
	names?: string[];
	sourceRoot?: string;
	ignoreList?: number[];
}

export interface ServedSourceMap {
	version: 3;
	file: string;
	sources: Array<string | null>;
	sourcesContent?: Array<string | null>;
	names: string[];
	mappings: string;
	ignoreList?: number[];
}

/** Beyond this many differing lines the alignment is too expensive and too unreliable to be useful. */
const MAX_LINE_EDITS = 1000;

const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const SOURCE_MAPPING_URL_RE = /^\s*\/\/[#@]\s*sourceMappingURL=/m;

/**
 * Carries Vite's transform map for a module onto the body the `/ns/m` route
 * actually serves. The serve pipeline is a long chain of string passes
 * (prepended guards, import rewrites, hoisting) that cannot each maintain a
 * map, but they leave the body of the module line-for-line intact. So the
 * served text is aligned to Vite's output by a line diff:
 *
 * - lines identical up to indentation reuse Vite's segments, shifted by the
 *   indentation change (the AST normalizer re-prints with retainLines, which
 *   keeps lines but not indentation);
 * - a changed hunk with as many lines on both sides is an in-place rewrite, so
 *   each line maps to the start of its counterpart;
 * - every other served line (injected preamble, hoisted imports) is unmapped.
 *
 * Sources are emitted as absolute file:// URLs because the device loads the
 * module from an http URL that does not mirror the project layout.
 */
export function buildServedModuleSourceMap(transformedCode: string, servedCode: string, map: InputSourceMap | null | undefined, moduleFile: string): ServedSourceMap | null {
	if (!map || typeof map.mappings !== 'string' || !map.mappings || !Array.isArray(map.sources)) return null;

	let decoded: SourceMapMappings;
	try {
		decoded = decode(map.mappings);
	} catch {
		return null;
	}

	const before = transformedCode.split('\n');
	const after = servedCode.split('\n');
	const alignment = alignLines(
		before.map((line) => line.trim()),
		after.map((line) => line.trim()),
	);
	if (!alignment) return null;

	const mappings: SourceMapMappings = alignment.map((match, servedLine) => {
		if (!match) return [];
		const segments = decoded[match.line];
		if (!segments?.length) return [];
		if (match.sameText) {
			const shift = indentOf(after[servedLine]) - indentOf(before[match.line]);
			return shift === 0 ? segments : segments.map(([column, ...rest]) => [Math.max(0, column + shift), ...rest] as SourceMapSegment);
		}
		const first = segments.find((segment) => segment.length > 1);
		return first ? [[0, ...first.slice(1)] as SourceMapSegment] : [];
	});
	if (!mappings.some((line) => line.length)) return null;

	const moduleDir = path.dirname(moduleFile);
	return {
		version: 3,
		file: path.basename(moduleFile),
		sources: map.sources.map((source) => (source == null ? null : toSourceUrl(source, moduleDir, map.sourceRoot))),
		...(map.sourcesContent ? { sourcesContent: map.sourcesContent } : {}),
		names: map.names ?? [],
		mappings: encode(mappings),
		...(map.ignoreList?.length ? { ignoreList: map.ignoreList } : {}),
	};
}

/** Returns `code` with `map` appended as an inline sourceMappingURL, leaving code that already names a map untouched. */
export function appendInlineSourceMap(code: string, map: ServedSourceMap | null): string {
	if (!map || SOURCE_MAPPING_URL_RE.test(code)) return code;
	const base64 = Buffer.from(JSON.stringify(map), 'utf8').toString('base64');
	return `${code}${code.endsWith('\n') ? '' : '\n'}//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}\n`;
}

function toSourceUrl(source: string, moduleDir: string, sourceRoot: string | undefined): string {
	if (URL_SCHEME_RE.test(source) && !/^[a-z]:[\\/]/i.test(source)) return source;
	const root = sourceRoot && !URL_SCHEME_RE.test(sourceRoot) ? path.resolve(moduleDir, sourceRoot) : moduleDir;
	return pathToFileURL(path.resolve(root, source)).href;
}

function indentOf(line: string): number {
	return line.length - line.trimStart().length;
}

interface LineMatch {
	line: number;
	sameText: boolean;
}

/**
 * For each line of `after`, the line of `before` it corresponds to (Myers
 * shortest edit script), or null when it was inserted. Returns null when the
 * texts differ by more than MAX_LINE_EDITS lines.
 */
function alignLines(before: string[], after: string[]): Array<LineMatch | null> | null {
	const n = before.length;
	const m = after.length;
	const max = Math.min(n + m, MAX_LINE_EDITS);
	const offset = max + 1;
	const v = new Int32Array(2 * max + 3);
	const trace: Int32Array[] = [];

	let found = false;
	for (let d = 0; d <= max && !found; d++) {
		trace.push(v.slice());
		for (let k = -d; k <= d; k += 2) {
			let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
			let y = x - k;
			while (x < n && y < m && before[x] === after[y]) {
				x++;
				y++;
			}
			v[offset + k] = x;
			if (x >= n && y >= m) {
				found = true;
				break;
			}
		}
	}
	if (!found) return null;

	// Walk the trace backwards collecting matched pairs and the edit hunks between them.
	const result: Array<LineMatch | null> = new Array(m).fill(null);
	let x = n;
	let y = m;
	let hunkBeforeEnd = n;
	let hunkAfterEnd = m;
	const closeHunk = () => {
		const removed = hunkBeforeEnd - x;
		const inserted = hunkAfterEnd - y;
		if (removed > 0 && removed === inserted) {
			for (let i = 0; i < inserted; i++) result[y + i] = { line: x + i, sameText: false };
		}
	};

	for (let d = trace.length - 1; d >= 0; d--) {
		const vd = trace[d];
		const k = x - y;
		const prevK = k === -d || (k !== d && vd[offset + k - 1] < vd[offset + k + 1]) ? k + 1 : k - 1;
		const prevX = d === 0 ? 0 : vd[offset + prevK];
		const prevY = prevX - prevK;
		const snakeX = d === 0 ? 0 : prevK === k + 1 ? prevX : prevX + 1;
		const snakeY = snakeX - k;
		if (x > snakeX) {
			closeHunk();
			while (x > snakeX) {
				x--;
				y--;
				result[y] = { line: x, sameText: true };
			}
			hunkBeforeEnd = x;
			hunkAfterEnd = y;
		}
		if (d > 0) {
			x = prevX;
			y = prevY;
		}
	}
	closeHunk();
	return result;
}
