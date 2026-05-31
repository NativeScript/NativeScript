import type { ServerResponse } from 'node:http';

/**
 * Response headers for device-served ESM module endpoints: permissive CORS plus
 * aggressive no-store caching so the device never reuses a stale module across
 * HMR cycles.
 */
export function setDeviceModuleHeaders(res: ServerResponse): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}
