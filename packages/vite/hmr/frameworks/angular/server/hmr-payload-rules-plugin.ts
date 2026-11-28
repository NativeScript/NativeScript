import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { Connect, DevEnvironment, EnvironmentModuleGraph, EnvironmentModuleNode, HotUpdateOptions, Plugin } from 'vite';
import type * as TS from 'typescript';
import { getPackageJson } from '../../../../helpers/project.js';
import { getProjectAppPath, getProjectAppRelativePath } from '../../../../helpers/utils.js';
import { resolveBootstrapRootComponent } from './angular-root-component.js';
import { resolveProjectMainEntryPath } from '../../../server/vite-plugin.js';
import { viteUrlForFile } from '../../../server/vite-url.js';
import { ANGULAR_INVALIDATE_EVENT, applyComponentUpdateRules, ComponentUpdateLedger, componentResourceFiles, hasOnlyHmrMetadataChanges, isComponentUpdatePayload, NG_COMPONENT_NO_UPDATE_MODULE, normalizeWsSendArgs, parseNgComponentRequest, toPosixPath, type FullReloadPayload, type RootComponentFile } from './hmr-payload-rules.js';

const COMPONENT_DECORATOR_RE = /@Component\b/;
const COMPONENT_RESOURCE_RE = /\.(?:html?|css|scss|sass|less)$/;

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
	/** Vite URL of the app entry, the soft-reboot boundary. */
	entryUrl?: string;
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
		// The entry update re-evaluates every edited class; Analog flushes its
		// component updates before Vite's update, so they were judged already.
		if (isPageReload(payload) || isEntryUpdate(payload, state.entryUrl)) state.stale.clear();
		if (result.payload === null) return;
		if (isComponentUpdatePayload(result.payload)) state.sentUpdates.record(result.payload.data);
		return originalSend(...args);
	};

	// Angular core sends this when `ɵɵreplaceMetadata` throws on the device.
	channel.on(ANGULAR_INVALIDATE_EVENT, (data?: { message?: unknown }) => {
		const reason = typeof data?.message === 'string' ? `: ${data.message}` : '';
		state.warn?.(`[ns-angular] in-place component update failed${reason}; restarting the app`);
		channel.send({ type: 'full-reload', path: '*' } satisfies FullReloadPayload);
	});
	return true;
}

/**
 * Answers `/@ng/component` metadata fetches that don't echo a sent
 * `angular:component-update` with a no-op module, so Analog's middleware
 * never serves a real payload for them (see {@link ComponentUpdateLedger}).
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

function isEntryUpdate(payload: unknown, entryUrl: string | undefined): boolean {
	const p = payload as { type?: unknown; updates?: Array<{ type?: string; path?: string }> } | null;
	return !!entryUrl && !!p && p.type === 'update' && !!p.updates?.some((u) => u.type === 'js-update' && u.path === entryUrl);
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

function listTsFiles(dir: string, recursive: boolean, out: string[] = []): string[] {
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (recursive && entry.name !== 'node_modules' && !entry.name.startsWith('.')) listTsFiles(full, true, out);
			continue;
		}
		const file = entry.isFile() ? toAppTsFile(full) : null;
		if (file) out.push(file);
	}
	return out;
}

/**
 * Component `.ts` files whose `@Component` names `resourceFile` as its
 * template or a stylesheet, searched under `appDir` and beside the resource.
 */
export function findResourceOwners(ts: typeof TS, resourceFile: string, appDir: string): string[] {
	const target = toPosixPath(path.resolve(resourceFile));
	const base = path.posix.basename(target);
	const candidates = new Set([...listTsFiles(appDir, true), ...listTsFiles(path.dirname(target), false)]);
	const owners: string[] = [];
	for (const file of candidates) {
		try {
			const source = fs.readFileSync(file, 'utf-8');
			if (source.includes(base) && COMPONENT_DECORATOR_RE.test(source) && componentResourceFiles(ts, source, file).includes(target)) owners.push(file);
		} catch {}
	}
	return owners;
}

// Analog's `addWatchFile` edges; unanalyzed nodes stop Vite's propagation there.
async function linkResourceToOwners(graph: Pick<EnvironmentModuleGraph, 'ensureEntryFromUrl'>, root: string, resourceFile: string, owners: readonly string[]): Promise<EnvironmentModuleNode> {
	const resource = await graph.ensureEntryFromUrl(viteUrlForFile(resourceFile, root), false);
	for (const owner of owners) {
		const node = await graph.ensureEntryFromUrl(viteUrlForFile(owner, root), false);
		node.importedModules.add(resource);
		resource.importers.add(node);
	}
	return resource;
}

export interface AngularHmrPayloadRulesOptions {
	/** The `workspaceRoot` given to Analog. */
	workspaceRoot: string;
	projectRoot?: string;
	resolveRoot?: () => RootComponentFile | null;
	loadTypeScript?: () => typeof TS | null;
	/** Searched for the components of an edited template or stylesheet; defaults to the project's app directory. */
	appDir?: string;
}

/**
 * NativeScript rules on top of Analog's in-place component HMR:
 * - a `.ts` save that changes more than `template`/`templateUrl`/`styles`/
 *   `styleUrl`/`styleUrls`, and any edit of the bootstrap component, reboot the
 *   app through the entry boundary (`hmr/server/entry-boundary.ts`):
 *   `ɵɵreplaceMetadata` never applies class changes, and the root hosts
 *   `page-router-outlet`, which doesn't survive it. Their
 *   `angular:component-update` is dropped and Analog's self-accept marking is
 *   undone, so Vite propagates the edit to the entry;
 * - `angular:invalidate` from the device restarts the app;
 * - a template or stylesheet of a component Vite hasn't transformed yet is
 *   linked to that component in the module graph, so Analog recompiles it.
 *
 * A `.ts` save is classified in a `pre` `hotUpdate` hook, which Vite runs
 * before Analog's `handleHotUpdate`; the marking is undone in a `post` one.
 */
export function angularHmrPayloadRulesPlugins(options: AngularHmrPayloadRulesOptions): Plugin[] {
	const projectRoot = options.projectRoot ?? process.cwd();
	const idBases = Array.from(new Set([process.cwd(), options.workspaceRoot].filter(Boolean)));
	const snapshots = new Map<string, string>();
	const stale = new StaleComponentClasses();
	const sentUpdates = new ComponentUpdateLedger();
	// Analog marks the modules of a component it updates in place as
	// self-accepting, on the graph nodes themselves, which stops Vite's
	// propagation at the component.
	const selfAcceptingBefore = new WeakMap<object, Array<[{ isSelfAccepting?: boolean }, boolean | undefined]>>();
	let entryUrl: string | undefined;

	const isRootComponentEdit = (file: string, modules: readonly EnvironmentModuleNode[]): boolean => {
		const rootFile = getRoot()?.file;
		if (!rootFile) return false;
		const owner = (candidate: string | null | undefined) => !!candidate && toPosixPath(candidate).replace(/\.[^./]+$/, '') === rootFile;
		return owner(file) || modules.some((mod) => [...mod.importers].some((importer) => owner(importer.file)));
	};

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

	// Analog recompiles for a resource edit only via its graph importers.
	const linkUntransformedOwners = async (environment: DevEnvironment, file: string): Promise<EnvironmentModuleNode | null> => {
		if (!COMPONENT_RESOURCE_RE.test(file) || file.includes('/node_modules/')) return null;
		const ts = getTypeScript();
		if (!ts) return null;
		const owners = findResourceOwners(ts, file, options.appDir ?? path.resolve(projectRoot, getProjectAppPath()));
		if (!owners.length) return null;
		return linkResourceToOwners(environment.moduleGraph, environment.config.root, file, owners);
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
			configResolved(config) {
				entryUrl = resolveProjectMainEntryPath(config.root);
			},
			configureServer(server) {
				installAngularHmrRules(server.ws, { idBases, getRoot, stale, sentUpdates, entryUrl, warn: (message) => server.config.logger.warn(message) });
				// `enforce: 'pre'` registers this ahead of Analog's middleware.
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
					const linked = ctx.type === 'update' && !ctx.modules.length ? await linkUntransformedOwners(this.environment, ctx.file) : null;
					const modules = linked ? [linked] : ctx.modules;
					selfAcceptingBefore.set(
						ctx,
						modules.map((mod) => [mod, mod.isSelfAccepting]),
					);
					if (linked) return modules;
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
		{
			name: 'ns-angular-hmr-rules-post',
			apply: 'serve',
			hotUpdate: {
				order: 'post',
				handler(ctx: HotUpdateOptions) {
					if (this.environment.name !== 'client') return;
					const before = selfAcceptingBefore.get(ctx);
					selfAcceptingBefore.delete(ctx);
					if (!before) return;
					const tsFile = toAppTsFile(ctx.file);
					if (!(tsFile && stale.has(tsFile)) && !isRootComponentEdit(toPosixPath(ctx.file), ctx.modules)) return;
					for (const [mod, value] of before) mod.isSelfAccepting = value;
				},
			},
		},
	];
}
