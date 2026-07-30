import * as babelGenerator from '@babel/generator';

export function genCode(node: any, opts?: any): { code: string } {
	const anyGen: any = babelGenerator as any;
	const candidates = [anyGen?.default?.default, anyGen?.default, anyGen?.generate, anyGen];
	for (const cand of candidates) {
		if (typeof cand === 'function') {
			try {
				return cand(node, opts || {});
			} catch {
				/* try next */
			}
		}
	}
	throw new Error('babel-generator unavailable');
}
