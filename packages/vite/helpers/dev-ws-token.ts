import { createHash } from 'crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

/**
 * Where `vite serve` publishes its WebSocket token for the HMR build of the
 * same project and port (the CLI runs one server per platform). Outside the
 * project, so the dev server never serves it.
 */
export function devWsTokenFile(root: string, port: number, base: string = tmpdir()): string {
	const key = createHash('sha1')
		.update(`${path.resolve(root)}:${port}`)
		.digest('hex')
		.slice(0, 16);
	return path.join(base, 'nativescript-vite', key, 'dev-ws-token');
}

export function readDevWsToken(file: string): string | undefined {
	try {
		return readFileSync(file, 'utf8').trim() || undefined;
	} catch {
		return undefined;
	}
}

/** Writes `token` atomically, unless the file already holds it. */
export function publishDevWsToken(file: string, token: string): void {
	if (readDevWsToken(file) === token) return;
	mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temp = `${file}.${process.pid}.tmp`;
	writeFileSync(temp, token, { mode: 0o600 });
	renameSync(temp, file);
}

export interface BundleTokenOptions {
	file: string;
	/** True when the CLI started this build together with `vite serve`. */
	underCli: boolean;
	/** Resolves true once the dev server listens, false when it gave up. */
	waitForServer: () => Promise<boolean>;
	warn: (message: string) => void;
}

/**
 * The token `bundle.mjs` carries for the dev server's action routes. Under the
 * CLI the server starts with this build and publishes its token before it
 * listens, so the file is read only after that: before, it may hold the
 * previous session's token.
 */
export async function devWsTokenForBundle(options: BundleTokenOptions): Promise<string> {
	if (options.underCli && !(await options.waitForServer())) {
		options.warn(`[NativeScript] the dev server isn't listening; bundle.mjs may carry an earlier session's token, and the app's restart requests will then be refused.`);
	}
	const token = readDevWsToken(options.file);
	if (!token) options.warn(`[NativeScript] no dev server token at ${options.file}; the app's restart requests will be refused until this build restarts after the dev server.`);
	return token ?? '';
}
