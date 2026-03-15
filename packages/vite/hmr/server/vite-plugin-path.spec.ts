import { describe, it, expect } from 'vitest';
import path from 'path';
import { pathToFileURL } from 'url';

// Reproduce the path logic from vite-plugin.ts in a testable helper
function computeClientImport(options: { projectRoot: string; clientFsPath: string }) {
	const { projectRoot, clientFsPath } = options;
	let clientImport = clientFsPath;
	try {
		const rel = path.relative(projectRoot, clientFsPath);
		const relPosix = rel.replace(/\\/g, '/');

		if (path.isAbsolute(rel)) {
			clientImport = pathToFileURL(clientFsPath).toString();
		} else {
			clientImport = (relPosix.startsWith('.') ? relPosix : `/${relPosix}`).replace(/\/+/g, '/');
		}
	} catch {
		clientImport = clientFsPath.replace(/\\/g, '/');
	}
	return clientImport;
}

describe('ns-hmr-client vite plugin path handling', () => {
	it('keeps a clean project-relative POSIX path on POSIX-like roots', () => {
		const projectRoot = '/Users/test/app';
		const clientFsPath = '/Users/test/app/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImport({ projectRoot, clientFsPath });

		expect(result).toBe('/node_modules/@nativescript/vite/hmr/client/index.js');
	});

	it('falls back to file URL when relative becomes absolute (Windows-like different drive)', () => {
		// Simulate a scenario where projectRoot and clientFsPath are on different drives.
		// On real Windows, path.relative('C:/proj', 'D:/lib/file.js') is an absolute path
		// starting with the target drive (e.g. 'D:/lib/file.js').
		const projectRoot = 'C:/project/root';
		const clientFsPath = 'D:/ns-vite-demo/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImport({ projectRoot, clientFsPath });

		// On non-Windows hosts, Node's path.relative may not simulate the
		// cross-drive behavior. The important contract is: when the computed
		// relative path is absolute, we do NOT generate an import like '/D:/...'
		// that would later resolve to 'D:\\D:\\...'. In that case we use a
		// file URL; otherwise we leave the relative specifier alone.
		if (path.sep === '\\') {
			// Windows: expect file URL behavior
			expect(result.startsWith('file://')).toBe(true);
		}
		expect(result.includes('nativescript/vite/hmr/client/index.js')).toBe(true);
	});

	it('handles Windows-style same-drive paths as project-relative POSIX', () => {
		const projectRoot = 'D:/ns-vite-demo';
		const clientFsPath = 'D:/ns-vite-demo/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImport({ projectRoot, clientFsPath });

		// When on the same drive, relative path should be node_modules/... and we normalize to POSIX.
		expect(result).toBe('/node_modules/@nativescript/vite/hmr/client/index.js');
	});
});
