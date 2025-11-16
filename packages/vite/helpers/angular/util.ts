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
