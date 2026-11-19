import { randomBytes } from 'crypto';
import { linkSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

/** Where a project keeps its dev server WebSocket token. */
export function devWsTokenFile(root: string): string {
	return path.join(root, 'node_modules', '.ns-vite', 'dev-ws-token');
}

function readToken(file: string): string | undefined {
	try {
		return readFileSync(file, 'utf8').trim() || undefined;
	} catch {
		return undefined;
	}
}

/**
 * The dev server's `webSocketToken`, shared by `vite serve` and the HMR build
 * that bakes it into `bundle.mjs`: the CLI starts them as separate processes in
 * parallel. Created once per project, so `bundle.mjs` stays stable across sessions.
 */
export function readOrCreateDevWsToken(root: string): string {
	const file = devWsTokenFile(root);
	const existing = readToken(file);
	if (existing) return existing;
	mkdirSync(path.dirname(file), { recursive: true });
	// Linking a complete temp file creates the token atomically: the other
	// process never reads a partial one, and the first link wins.
	const temp = `${file}.${process.pid}.tmp`;
	writeFileSync(temp, randomBytes(18).toString('base64url'));
	try {
		linkSync(temp, file);
	} catch (error: any) {
		if (error?.code !== 'EEXIST') throw error;
	} finally {
		unlinkSync(temp);
	}
	const token = readToken(file);
	if (!token) throw new Error(`[NativeScript] cannot read the dev server token at ${file}`);
	return token;
}
