import type { TransformResult } from 'vite';
import * as path from 'path';

import { filterExistingNodeModulesTransformCandidates, getBlockedDeviceNodeModulesReason, resolveCandidateFilePath, stripDecoratedServePrefixes, tryReadRawExplicitJavaScriptModule } from './websocket-module-specifiers.js';

export interface NsMRequestContext {
	requestUrl: string;
	spec: string;
	forcedVer: string | null;
	bootTaggedRequest: boolean;
	serverRoot: string;
	candidates: string[];
	transformCandidates: string[];
}

export type NsMRequestContextResult = { kind: 'next' } | { kind: 'response'; statusCode: number; code: string } | { kind: 'context'; value: NsMRequestContext };

export interface ResolveNsMTransformedModuleOptions {
	context: NsMRequestContext;
	transformRequest: (url: string, timeoutMs?: number) => Promise<TransformResult | null>;
	resolveId: (id: string) => Promise<string | null>;
	loadVirtualId: (id: string) => Promise<string | { code?: string } | TransformResult | null>;
	timeoutMs?: number;
}

export interface NsMResolvedTransform {
	transformed: TransformResult | null;
	resolvedCandidate: string | null;
}

function normalizeAbsoluteFilesystemSpec(spec: string, serverRoot: string): string {
	const toPosix = (value: string) => value.replace(/\\/g, '/');
	const rootPosix = toPosix(serverRoot);
	const specPosix = toPosix(spec);
	const isAbsoluteFilesystemPath = /^\//.test(specPosix) || /^[A-Za-z]:\//.test(spec);
	if (!isAbsoluteFilesystemPath) {
		return spec;
	}

	let relative = specPosix.startsWith(rootPosix) ? specPosix.slice(rootPosix.length) : path.posix.relative(rootPosix, specPosix);
	if (relative.startsWith('..')) {
		return spec;
	}
	if (!relative.startsWith('/')) {
		relative = `/${relative}`;
	}
	return relative;
}

export function createNsMRequestContext(requestUrl: string, serverRoot: string, appVirtualWithSlash: string): NsMRequestContextResult {
	try {
		const urlObj = new URL(requestUrl || '', 'http://localhost');
		if (!urlObj.pathname.startsWith('/ns/m')) {
			return { kind: 'next' };
		}

		let spec = urlObj.searchParams.get('path') || '';
		let forcedVer = urlObj.searchParams.get('v');
		let bootTaggedRequest = false;

		if (!spec) {
			const base = '/ns/m';
			const rest = urlObj.pathname.slice(base.length);
			if (rest && rest !== '/') {
				spec = rest;
			}
		}

		if (spec === '/__invalid_at__.mjs' || spec === '__invalid_at__.mjs') {
			return {
				kind: 'response',
				statusCode: 200,
				code: "// invalid '@' import stub\nexport {}\n",
			};
		}

		if (!spec) {
			return {
				kind: 'response',
				statusCode: 200,
				code: 'export {}\n',
			};
		}

		spec = spec.replace(/[?#].*$/, '');
		const decorated = stripDecoratedServePrefixes(spec);
		spec = decorated.cleanedSpec;
		bootTaggedRequest = decorated.bootTaggedRequest;
		forcedVer ||= decorated.forcedVer;

		spec = normalizeAbsoluteFilesystemSpec(spec, serverRoot);
		if (spec.startsWith('@/')) {
			spec = appVirtualWithSlash + spec.slice(2);
		}
		if (spec.startsWith('./')) {
			spec = spec.slice(1);
		}

		const blockedNodeModulesReason = getBlockedDeviceNodeModulesReason(spec);
		if (blockedNodeModulesReason) {
			return {
				kind: 'response',
				statusCode: 404,
				code: `// [ns:m] blocked device import\nthrow new Error(${JSON.stringify(`[ns/m] ${blockedNodeModulesReason}`)});\nexport {};\n`,
			};
		}

		if (!spec.startsWith('/')) {
			spec = `/${spec}`;
		}

		const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
		const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
		const candidates = [...(hasExt ? [spec] : []), `${baseNoExt}.ts`, `${baseNoExt}.js`, `${baseNoExt}.tsx`, `${baseNoExt}.jsx`, `${baseNoExt}.mjs`, `${baseNoExt}.mts`, `${baseNoExt}.cts`, `${baseNoExt}.vue`, `${baseNoExt}/index.ts`, `${baseNoExt}/index.js`, `${baseNoExt}/index.tsx`, `${baseNoExt}/index.jsx`, `${baseNoExt}/index.mjs`];
		const transformCandidates = filterExistingNodeModulesTransformCandidates(spec, candidates, serverRoot);

		return {
			kind: 'context',
			value: {
				requestUrl,
				spec,
				forcedVer,
				bootTaggedRequest,
				serverRoot,
				candidates,
				transformCandidates,
			},
		};
	} catch {
		return { kind: 'next' };
	}
}

async function tryTransformRequest(transformRequest: ResolveNsMTransformedModuleOptions['transformRequest'], url: string, timeoutMs: number): Promise<TransformResult | null> {
	try {
		return await transformRequest(url, timeoutMs);
	} catch {
		return null;
	}
}

function getLoadedCode(loadResult: string | { code?: string } | TransformResult | null): string | null {
	if (!loadResult) {
		return null;
	}
	if (typeof loadResult === 'string') {
		return loadResult;
	}
	return typeof loadResult.code === 'string' ? loadResult.code : null;
}

export async function resolveNsMTransformedModule(options: ResolveNsMTransformedModuleOptions): Promise<NsMResolvedTransform> {
	const { context, transformRequest, resolveId, loadVirtualId, timeoutMs = 120000 } = options;
	const { spec, serverRoot, transformCandidates } = context;
	let transformed: TransformResult | null = null;
	let resolvedCandidate: string | null = null;

	if (spec.startsWith('/@id/')) {
		transformed = await tryTransformRequest(transformRequest, spec, timeoutMs);
		if (transformed?.code) {
			return { transformed, resolvedCandidate };
		}

		try {
			const rawId = spec.slice('/@id/'.length).replace(/__x00__/g, '\0');
			const loadedCode = getLoadedCode(await loadVirtualId(rawId));
			if (loadedCode) {
				return {
					transformed: { code: loadedCode } as TransformResult,
					resolvedCandidate: rawId,
				};
			}
		} catch {}
	}

	const rawExplicitModule = tryReadRawExplicitJavaScriptModule(spec, serverRoot);
	if (rawExplicitModule) {
		return {
			transformed: { code: rawExplicitModule.code } as TransformResult,
			resolvedCandidate: rawExplicitModule.resolvedId,
		};
	}

	for (const candidate of transformCandidates) {
		transformed = await tryTransformRequest(transformRequest, candidate, timeoutMs);
		if (transformed?.code) {
			resolvedCandidate = candidate;
			return { transformed, resolvedCandidate };
		}
	}

	const resolvedId = await resolveId(spec);
	if (resolvedId) {
		transformed = await tryTransformRequest(transformRequest, resolvedId, timeoutMs);
		if (transformed?.code) {
			return { transformed, resolvedCandidate: resolvedId };
		}
	}

	if (spec.includes('/node_modules/')) {
		const nodeModulesIndex = spec.lastIndexOf('/node_modules/');
		const bareSpecifier = spec.slice(nodeModulesIndex + '/node_modules/'.length);
		if (bareSpecifier && !bareSpecifier.startsWith('.')) {
			const resolvedBareId = await resolveId(bareSpecifier);
			if (resolvedBareId) {
				transformed = await tryTransformRequest(transformRequest, resolvedBareId, timeoutMs);
				if (transformed?.code) {
					return { transformed, resolvedCandidate: resolvedBareId };
				}
			}
		}
	}

	const absolutePosixPath = `${serverRoot.replace(/\\/g, '/').replace(/\/$/, '')}${spec.startsWith('/') ? '' : '/'}${spec}`;
	const fsId = `/@fs${absolutePosixPath}`;
	if (resolveCandidateFilePath(fsId, serverRoot)) {
		transformed = await tryTransformRequest(transformRequest, fsId, timeoutMs);
		if (transformed?.code) {
			return { transformed, resolvedCandidate: fsId };
		}
	}

	for (const candidate of transformCandidates) {
		const importHintCandidate = `${candidate}${candidate.includes('?') ? '&' : '?'}import`;
		transformed = await tryTransformRequest(transformRequest, importHintCandidate, timeoutMs);
		if (transformed?.code) {
			resolvedCandidate = importHintCandidate;
			return { transformed, resolvedCandidate };
		}
	}

	return {
		transformed: null,
		resolvedCandidate,
	};
}
