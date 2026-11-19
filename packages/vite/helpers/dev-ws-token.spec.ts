import { mkdtempSync, rmSync, statSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { devWsTokenFile, devWsTokenForBundle, publishDevWsToken, readDevWsToken } from './dev-ws-token.js';

const dirs: string[] = [];
const newDir = () => {
	const dir = mkdtempSync(path.join(tmpdir(), 'ns-ws-token-'));
	dirs.push(dir);
	return dir;
};

afterEach(() => {
	for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('devWsTokenFile', () => {
	it('keys the file by project and port, outside the project', () => {
		const base = newDir();
		const file = devWsTokenFile('/work/app', 5173, base);
		expect(file.startsWith(path.join(base, 'nativescript-vite'))).toBe(true);
		expect(devWsTokenFile('/work/app/', 5173, base)).toBe(file);
		expect(devWsTokenFile('/work/other', 5173, base)).not.toBe(file);
		expect(devWsTokenFile('/work/app', 5174, base)).not.toBe(file);
	});
});

describe('publishDevWsToken', () => {
	it('replaces the token, readable by the owner only, and leaves an unchanged one untouched', () => {
		const file = devWsTokenFile('/work/app', 5173, newDir());
		publishDevWsToken(file, 'first');
		expect(readDevWsToken(file)).toBe('first');
		expect(statSync(file).mode & 0o777).toBe(0o600);
		const mtime = statSync(file).mtimeMs;
		publishDevWsToken(file, 'first');
		expect(statSync(file).mtimeMs).toBe(mtime);
		publishDevWsToken(file, 'second');
		expect(readDevWsToken(file)).toBe('second');
	});
});

describe('devWsTokenForBundle', () => {
	it('under the CLI, reads the token only once the dev server listens', async () => {
		const file = devWsTokenFile('/work/app', 5173, newDir());
		publishDevWsToken(file, 'previous-session');
		const warn = vi.fn();
		const token = devWsTokenForBundle({ file, underCli: true, warn, waitForServer: async () => (publishDevWsToken(file, 'this-session'), true) });
		expect(await token).toBe('this-session');
		expect(warn).not.toHaveBeenCalled();
	});

	it('without the CLI reads what is there, and warns when there is nothing', async () => {
		const file = devWsTokenFile('/work/app', 5173, newDir());
		const waitForServer = vi.fn(async () => true);
		const warn = vi.fn();
		expect(await devWsTokenForBundle({ file, underCli: false, waitForServer, warn })).toBe('');
		expect(warn).toHaveBeenCalledOnce();
		publishDevWsToken(file, 'served');
		expect(await devWsTokenForBundle({ file, underCli: false, waitForServer, warn })).toBe('served');
		expect(waitForServer).not.toHaveBeenCalled();
	});

	it('warns when the dev server never listened', async () => {
		const file = devWsTokenFile('/work/app', 5173, newDir());
		publishDevWsToken(file, 'previous-session');
		const warn = vi.fn();
		expect(await devWsTokenForBundle({ file, underCli: true, waitForServer: async () => false, warn })).toBe('previous-session');
		expect(warn).toHaveBeenCalledOnce();
	});
});
