import type { ViteDevServer } from 'vite';

export interface RegisterTxnHandlerOptions {
	resolveTxnIds(version: number, fallbackChangedIds: string[]): string[];
}

function setJavascriptResponseHeaders(res: any): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

export function buildTxnModuleCode(version: number, ids: string[]): string {
	const lines: string[] = [];
	lines.push(`// [txn] version=${version} count=${ids.length}`);
	for (const id of ids) {
		const isVue = /\.vue$/i.test(id);
		const safeId = id.startsWith('/') ? id : `/${id}`;
		const importPath = isVue ? `/ns/asm/${version}?path=${encodeURIComponent(safeId)}` : `/ns/m${safeId}`;
		lines.push(`await import(${JSON.stringify(importPath)});`);
	}
	lines.push('export default true;');
	return lines.join('\n');
}

export function registerTxnHandler(server: ViteDevServer, options: RegisterTxnHandlerOptions): void {
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			const pathname = urlObj.pathname || '';
			if (!pathname.startsWith('/ns/txn')) return next();

			const versionSegment = pathname.replace('/ns/txn', '').replace(/^\//, '');
			const version = Number(versionSegment || urlObj.searchParams.get('v') || 0);
			const fallbackChangedIds = (urlObj.searchParams.get('ids') || '')
				.split(',')
				.map((value) => value.trim())
				.filter(Boolean);
			const ids = options.resolveTxnIds(version, fallbackChangedIds);
			const code = buildTxnModuleCode(version, ids);

			setJavascriptResponseHeaders(res);
			res.statusCode = 200;
			res.end(code);
			return;
		} catch {
			return next();
		}
	});
}
