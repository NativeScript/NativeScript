import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { Connect, HotUpdateOptions, Plugin } from 'vite';
import type * as TS from 'typescript';
import { getPackageJson } from '../../../../helpers/project.js';
import { getProjectAppPath, getProjectAppRelativePath } from '../../../../helpers/utils.js';
import { resolveBootstrapRootComponent } from './angular-root-component.js';
import { ANGULAR_INVALIDATE_EVENT, applyComponentUpdateRules, ComponentUpdateLedger, hasOnlyHmrMetadataChanges, isComponentUpdatePayload, NG_COMPONENT_NO_UPDATE_MODULE, normalizeWsSendArgs, parseNgComponentRequest, toPosixPath, type FullReloadPayload, type RootComponentFile } from './hmr-payload-rules.js';

const COMPONENT_DECORATOR_RE = /@Component\b/;

export interface HotChannelLike {
	send(...args: any[]): void;
	on(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Component files whose class on the device is older than the source: a `.ts`
 * save changed more than HMR metadata and no full reload has gone out since.
 * Kept as state rather than per save because Analog buffers its
 * `angular:component-update` and flushes it after the hot-update hooks settle.
 */
export class StaleComponentClasses {
	private readonly files = new Set<string>();

	add(file: string): void {
		this.files.add(file);
	}

	has(file: string): boolean {
		return this.files.has(file);
	}

	delete(file: string): void {
		this.files.delete(file);
	}

	clear(): void {
		this.files.clear();
	}
}

export interface AngularHmrRulesState {
	idBases: readonly string[];
	getRoot(): RootComponentFile | null;
	stale: StaleComponentClasses;
	sentUpdates: ComponentUpdateLedger;
	warn?(message: string): void;
}

const installedChannels = new WeakSet<object>();

/**
 * Patches `send` on the channel itself: Vite hands hooks wrapper server
 * objects, but `server.ws` and the client environment's `hot` share one
 * channel. Returns false when this channel is already patched.
 */
export function installAngularHmrRules(channel: HotChannelLike, state: AngularHmrRulesState): boolean {
	if (installedChannels.has(channel)) return false;
	installedChannels.add(channel);

	const originalSend = channel.send.bind(channel);
	channel.send = (...args: any[]) => {
		const payload = normalizeWsSendArgs(args);
		const result = applyComponentUpdateRules(payload, { idBases: state.idBases, root: state.getRoot(), hasClassChange: (file) => state.stale.has(file) });
		// The device skips `.html`-path reloads (no HTML page), so only a page reload refreshes every class.
		if (isPageReload(result.payload)) state.stale.clear();
		if (isComponentUpdatePayload(result.payload)) state.sentUpdates.record(result.payload.data);
		if (result.payload === payload) return originalSend(...args);
		return originalSend(result.payload);
	};

	// Angular core sends this when `ɵɵreplaceMetadata` throws on the device.
	channel.on(ANGULAR_INVALIDATE_EVENT, (data?: { message?: unknown }) => {
		const reason = typeof data?.message === 'string' ? `: ${data.message}` : '';
		state.warn?.(`[ns-angular] in-place component update failed${reason}; reloading`);
		channel.send({ type: 'full-reload', path: '*' } satisfies FullReloadPayload);
	});
	return true;
}

/**
 * Answers `/@ng/component` metadata fetches that don't echo a sent
 * `angular:component-update` with a no-op module, so neither Analog's
 * middleware nor the `/ns/v` fall-through serves a real payload
 * (see {@link ComponentUpdateLedger}).
 */
export function createNgComponentGate(sentUpdates: ComponentUpdateLedger): Connect.NextHandleFunction {
	return (req, res, next) => {
		const request = parseNgComponentRequest(req.url);
		if (!request || sentUpdates.isLive(request)) return next();
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/javascript');
		res.setHeader('Cache-Control', 'no-cache');
		res.end(NG_COMPONENT_NO_UPDATE_MODULE);
	};
}

function isPageReload(payload: unknown): boolean {
	const p = payload as { type?: unknown; path?: unknown } | null;
	return !!p && p.type === 'full-reload' && !(typeof p.path === 'string' && p.path.endsWith('.html'));
}

/** Bootstrap component of the app entry (`package.json` `main`), as an absolute file. */
export function resolveRootComponentFile(projectRoot: string): RootComponentFile | null {
	const pkg = getPackageJson() as { main?: string } | undefined;
	const entryFile = path.resolve(projectRoot, pkg?.main || getProjectAppRelativePath('app.ts'));
	const entrySource = fs.readFileSync(entryFile, 'utf-8');
	const root = resolveBootstrapRootComponent({
		entrySource,
		entryRel: '/' + toPosixPath(path.relative(projectRoot, entryFile)),
		appRootRel: '/' + getProjectAppPath(),
	});
	if (!root) return null;
	return { file: toPosixPath(path.join(projectRoot, root.moduleRel)), className: root.className };
}

function loadProjectTypeScript(projectRoot: string): typeof TS | null {
	for (const from of [path.join(projectRoot, 'package.json'), import.meta.url]) {
		try {
			return createRequire(from)('typescript') as typeof TS;
		} catch {}
	}
	return null;
}

function toAppTsFile(id: string): string | null {
	const file = toPosixPath(id.split('?', 1)[0]);
	if (!file.endsWith('.ts') || file.endsWith('.d.ts')) return null;
	if (file.includes('/node_modules/')) return null;
	return file;
}

export interface AngularHmrPayloadRulesOptions {
	/** The `workspaceRoot` given to Analog. */
	workspaceRoot: string;
	projectRoot?: string;
	resolveRoot?: () => RootComponentFile | null;
	loadTypeScript?: () => typeof TS | null;
}

/**
 * NativeScript rules on top of Analog's in-place component HMR:
 * - a `.ts` save that changes more than `template`/`templateUrl`/`styles`/
 *   `styleUrl`/`styleUrls` turns its `angular:component-update` into a full
 *   reload (Angular CLI parity: `ɵɵreplaceMetadata` never applies class changes);
 * - any update of the bootstrap component becomes a full reload;
 * - `angular:invalidate` from the device triggers a full reload.
 *
 * A `.ts` save is classified in a `pre` `hotUpdate` hook, which Vite runs
 * before Analog's `handleHotUpdate`.
 */
export function angularHmrPayloadRulesPlugins(options: AngularHmrPayloadRulesOptions): Plugin[] {
	const projectRoot = options.projectRoot ?? process.cwd();
	const idBases = Array.from(new Set([process.cwd(), options.workspaceRoot].filter(Boolean)));
	const snapshots = new Map<string, string>();
	const stale = new StaleComponentClasses();
	const sentUpdates = new ComponentUpdateLedger();

	let root: RootComponentFile | null | undefined;
	const getRoot = (): RootComponentFile | null => {
		if (root === undefined) {
			try {
				root = (options.resolveRoot ?? (() => resolveRootComponentFile(projectRoot)))();
			} catch {
				root = null;
			}
		}
		return root;
	};

	let ts: typeof TS | null | undefined;
	const getTypeScript = (): typeof TS | null => {
		if (ts === undefined) ts = (options.loadTypeScript ?? (() => loadProjectTypeScript(projectRoot)))();
		return ts;
	};

	const rememberSnapshot = (file: string, source: string) => {
		if (COMPONENT_DECORATOR_RE.test(source)) snapshots.set(file, source);
		else snapshots.delete(file);
	};

	return [
		{
			name: 'ns-angular-hmr-rules',
			apply: 'serve',
			enforce: 'pre',
			configureServer(server) {
				installAngularHmrRules(server.ws, { idBases, getRoot, stale, sentUpdates, warn: (message) => server.config.logger.warn(message) });
				// `enforce: 'pre'` registers this ahead of Analog's middleware and the thin route.
				server.middlewares.use(createNgComponentGate(sentUpdates));
			},
			// First sight only: later versions are recorded by the hot update
			// that compares them, so a re-transform racing a save can't mask it.
			transform(_code, id) {
				const file = toAppTsFile(id);
				if (!file || snapshots.has(file)) return null;
				try {
					rememberSnapshot(file, fs.readFileSync(file, 'utf-8'));
				} catch {}
				return null;
			},
			hotUpdate: {
				order: 'pre',
				async handler(ctx: HotUpdateOptions) {
					if (this.environment.name !== 'client') return;
					const file = toAppTsFile(ctx.file);
					if (!file) return;
					if (ctx.type === 'delete') {
						snapshots.delete(file);
						stale.delete(file);
						return;
					}
					if (ctx.type !== 'update') return;
					const next = await ctx.read();
					if (!hasOnlyHmrMetadataChanges(getTypeScript(), snapshots.get(file), next, file)) stale.add(file);
					rememberSnapshot(file, next);
				},
			},
		},
	];
}
