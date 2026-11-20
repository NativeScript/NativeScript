/**
 * Blanks out line and block comments with spaces, leaving string and template
 * literals untouched. Newlines and offsets are preserved, so regex match indexes
 * still point into the original source.
 * @param src JavaScript or TypeScript source.
 * @returns The source with every comment character replaced by a space.
 */
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
