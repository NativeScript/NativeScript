export function containsRealNgDeclare(src: string): boolean {
	let inStr = false,
		strCh = '',
		esc = false,
		inBlk = false,
		inLine = false;

	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		const next = src[i + 1];

		if (inLine) {
			if (ch === '\n') inLine = false;
			continue;
		}
		if (inBlk) {
			if (ch === '*' && next === '/') {
				inBlk = false;
				i++;
			}
			continue;
		}
		if (inStr) {
			if (esc) {
				esc = false;
				continue;
			}
			if (ch === '\\') {
				esc = true;
				continue;
			}
			if (ch === strCh) {
				inStr = false;
				strCh = '';
			}
			continue;
		}
		if (ch === '/' && next === '/') {
			inLine = true;
			i++;
			continue;
		}
		if (ch === '/' && next === '*') {
			inBlk = true;
			i++;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === '`') {
			inStr = true;
			strCh = ch;
			continue;
		}
		if (ch === 'ɵ' && next === 'ɵ' && src.startsWith('ɵɵngDeclare', i)) {
			let j = i + 'ɵɵngDeclare'.length;
			while (j < src.length) {
				const cj = src.charCodeAt(j);
				if ((cj >= 65 && cj <= 90) || (cj >= 97 && cj <= 122) || (cj >= 48 && cj <= 57) || cj === 95 || cj === 36) {
					j++;
				} else {
					break;
				}
			}
			while (j < src.length && /\s/.test(src[j])) j++;
			if (src[j] === '(') return true;
		}
	}

	return false;
}

// Returns the input source with `//` line comments and `/* */` block comments
// blanked out (replaced with spaces, preserving original line/column offsets).
// String and template literal contents are left untouched. The original
// character count is preserved so that downstream callers using regex `index`
// values still align with the original source.
//
// Why blank out instead of strip: callers like `extractComponentAssetPaths`
// run regexes against this output but consume captured paths as-is. Keeping
// the offsets stable means we don't need to remap any indexes — and any
// future caller that reports positions back to the user (e.g. a diagnostic
// pointing at a `styleUrl` value) gets the right line/column for free.
//
// Why this matters: in current Rolldown-Vite, `addWatchFile(path)` ALSO
// records the file as an `_addedImports` entry on the load/transform plugin
// context. The `vite:import-analysis` plugin then attempts to resolve every
// added import; a non-existent file (e.g. a path scraped from a commented-
// out `styleUrls` line) produces a `Failed to resolve import "..." from
// "...". Does the file exist?` pre-transform error. Stripping comments
// before scanning keeps us from registering phantom asset deps.
export function stripJsComments(src: string): string {
	if (!src) return src;
	const len = src.length;
	let out = '';
	let inStr = false,
		strCh = '',
		esc = false,
		inBlk = false,
		inLine = false;

	for (let i = 0; i < len; i++) {
		const ch = src[i];
		const next = i + 1 < len ? src[i + 1] : '';

		if (inLine) {
			if (ch === '\n') {
				inLine = false;
				out += ch;
			} else {
				out += ' ';
			}
			continue;
		}
		if (inBlk) {
			if (ch === '*' && next === '/') {
				inBlk = false;
				out += '  ';
				i++;
				continue;
			}
			out += ch === '\n' ? '\n' : ' ';
			continue;
		}
		if (inStr) {
			if (esc) {
				esc = false;
				out += ch;
				continue;
			}
			if (ch === '\\') {
				esc = true;
				out += ch;
				continue;
			}
			if (ch === strCh) {
				inStr = false;
				strCh = '';
			}
			out += ch;
			continue;
		}
		if (ch === '/' && next === '/') {
			inLine = true;
			out += '  ';
			i++;
			continue;
		}
		if (ch === '/' && next === '*') {
			inBlk = true;
			out += '  ';
			i++;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === '`') {
			inStr = true;
			strCh = ch;
			out += ch;
			continue;
		}
		out += ch;
	}

	return out;
}
