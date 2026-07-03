import type { WebSocket, WebSocketServer } from 'ws';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import type { HmrDeltaMessage, HmrFullGraphMessage } from '../shared/protocol.js';
import { matchesRuntimeGraphModuleId } from './runtime-graph-filter.js';
import { classifyGraphUpsert, shouldBroadcastGraphUpsertDelta, shouldBumpGraphVersion } from './websocket-graph-upsert.js';
import { getProjectAppVirtualPath } from '../../helpers/utils.js';

const APP_VIRTUAL_WITH_SLASH = `${getProjectAppVirtualPath()}/`;

export interface GraphModule {
	id: string;
	deps: string[];
	hash: string;
}

export interface UpsertOptions {
	emitDeltaOnInsert?: boolean;
	broadcastDelta?: boolean;
	bumpVersion?: boolean;
}

// Dependencies the graph needs from the owning HMR plugin. `getWss`/`getPluginRoot`
// are accessors (not values) because the WebSocket server and plugin root are
// established lazily during `configureServer`, after the graph is constructed.
export interface HmrModuleGraphDeps {
	verbose: boolean;
	strategy: FrameworkServerStrategy;
	getWss: () => WebSocketServer | null;
	getPluginRoot: () => string | undefined;
}

// The HMR module graph: spec -> { deps, hash } plus a monotonically increasing
// version that sequences graph broadcasts and transactional HMR batches.
// Owns delta/full-graph broadcasts to connected clients and the per-version
// txn batch ordering. The version never appears in served module URLs —
// module identity is the canonical URL (see CLAUDE.md invariant 4).
//
// version starts at 1 and stays stable during cold boot (bulk warm-ups pass
// bumpVersion:false); it only advances on live edits, so the graph filling in
// lazily never churns the version.
export class HmrModuleGraph {
	readonly modules = new Map<string, GraphModule>();
	// Transactional HMR batches: version -> ordered list of changed ids for that version.
	private readonly txnBatches = new Map<number, string[]>();
	private _version = 1;

	constructor(private readonly deps: HmrModuleGraphDeps) {}

	get version(): number {
		return this._version;
	}

	get size(): number {
		return this.modules.size;
	}

	get(id: string): GraphModule | undefined {
		return this.modules.get(id);
	}

	getTxnBatch(version: number): string[] {
		return this.txnBatches.get(version) || [];
	}

	computeHash(content: string): string {
		let h = 0;
		for (let i = 0; i < content.length; i++) {
			h = (h * 31 + content.charCodeAt(i)) | 0;
		}
		return ('00000000' + (h >>> 0).toString(16)).slice(-8);
	}

	normalizeGraphId(raw: string): string {
		if (!raw) return raw;
		let id = raw.split('?')[0].replace(/\\/g, '/');
		id = id.replace(/^file:\/\//, '');
		const pluginRoot = this.deps.getPluginRoot();
		if (pluginRoot) {
			const rootNorm = pluginRoot.replace(/\\/g, '/');
			if (id.startsWith(rootNorm)) {
				id = id.slice(rootNorm.length);
			}
		}
		if (!id.startsWith('/')) id = '/' + id;
		// Collapse nested app root indicators when present (defensive)
		const idx = id.indexOf(APP_VIRTUAL_WITH_SLASH);
		if (idx !== -1) id = id.slice(idx);
		return id;
	}

	// Dependency-closed, topologically sorted list of modules for a set of
	// changed ids. Only includes application modules we can serve (under the
	// app virtual root and known framework/.ts/.js entries already in the graph).
	computeTxnOrderForChanged(changedIds: string[]): string[] {
		const { strategy } = this.deps;
		const includeAppModule = (id: string) => matchesRuntimeGraphModuleId(id, APP_VIRTUAL_WITH_SLASH, /\.(ts|js|mjs|tsx|jsx)$/i);
		const includeExt = (id: string) => strategy.matchesFile(id) || includeAppModule(id);
		const isApp = (id: string) => id.startsWith(APP_VIRTUAL_WITH_SLASH);
		const roots = changedIds.map((id) => this.normalizeGraphId(id)).filter((id) => this.modules.has(id) && (isApp(id) || strategy.matchesFile(id)) && includeExt(id));
		const toVisit = new Set<string>();
		const stack: string[] = [...roots];
		while (stack.length) {
			const id = stack.pop()!;
			if (toVisit.has(id)) continue;
			toVisit.add(id);
			const m = this.modules.get(id);
			if (m) {
				for (const d of m.deps) {
					if (!this.modules.has(d)) continue;
					if ((isApp(d) || strategy.matchesFile(d)) && includeExt(d) && !toVisit.has(d)) {
						stack.push(d);
					}
				}
			}
		}
		// Topological order: deps first (post-order DFS)
		const ordered: string[] = [];
		const temp = new Set<string>();
		const perm = new Set<string>();
		const visit = (id: string) => {
			if (perm.has(id)) return;
			if (temp.has(id)) {
				perm.add(id);
				return;
			} // cycle: bail out
			temp.add(id);
			const m = this.modules.get(id);
			if (m) {
				for (const d of m.deps) {
					if (toVisit.has(d)) visit(d);
				}
			}
			temp.delete(id);
			perm.add(id);
			ordered.push(id);
		};
		for (const id of toVisit) visit(id);
		return ordered;
	}

	private fullGraphPayload(): HmrFullGraphMessage {
		return {
			type: 'ns:hmr-full-graph',
			version: this._version,
			modules: Array.from(this.modules.values()).map((m) => ({
				id: m.id,
				deps: m.deps,
				hash: m.hash,
			})),
		};
	}

	emitFullGraph(ws: WebSocket): void {
		try {
			if (this.deps.verbose) {
				try {
					const payload = this.fullGraphPayload();
					console.log('[hmr-ws][graph] emitFullGraph version', payload.version, 'modules=', payload.modules.length);
					if (payload.modules.length) {
						console.log(
							'[hmr-ws][graph] sample module ids',
							payload.modules.slice(0, 5).map((m) => m.id),
						);
					}
				} catch {}
			}
			ws.send(JSON.stringify(this.fullGraphPayload()));
		} catch {}
	}

	emitDelta(changed: GraphModule[], removed: string[]): void {
		const wss = this.deps.getWss();
		if (!wss) return;
		// Record this version's txn batch order
		try {
			const changedIds = changed.map((m) => m.id);
			if (changedIds.length) {
				const ordered = this.computeTxnOrderForChanged(changedIds);
				this.txnBatches.set(this._version, ordered);
				// Keep only the last ~20 versions
				if (this.txnBatches.size > 20) {
					const drop = Array.from(this.txnBatches.keys())
						.sort((a, b) => a - b)
						.slice(0, this.txnBatches.size - 20);
					for (const k of drop) this.txnBatches.delete(k);
				}
			}
		} catch {}
		const payload: HmrDeltaMessage = {
			type: 'ns:hmr-delta',
			baseVersion: this._version - 1,
			newVersion: this._version,
			changed: changed.map((m) => ({ id: m.id, deps: m.deps, hash: m.hash })),
			removed,
		};
		const json = JSON.stringify(payload);
		wss.clients.forEach((c) => {
			try {
				c.send(json);
			} catch {}
		});
	}

	upsert(rawId: string, code: string, deps: string[], options?: UpsertOptions): GraphModule | undefined {
		const id = this.normalizeGraphId(rawId);
		const normDeps = deps
			.map((d) => this.normalizeGraphId(d))
			.filter(Boolean)
			.slice()
			.sort();
		const hash = this.computeHash(code);
		const existing = this.modules.get(id);
		const classification = classifyGraphUpsert(existing, hash, normDeps);
		if (classification === 'unchanged') return existing;
		// Version bumps are only meaningful for live edits — serve-time graph
		// warm-ups and the initial bulk walk should leave the version stable.
		const bumpVersion = shouldBumpGraphVersion(classification, options?.bumpVersion !== false);
		if (bumpVersion) {
			this._version++;
		}
		const gm: GraphModule = { id, deps: normDeps, hash };
		this.modules.set(id, gm);
		if (this.deps.verbose) {
			console.log('[hmr-ws][graph] upsert', { id, deps: normDeps, hash, graphVersion: this._version, classification, bumpVersion });
			console.log('[hmr-ws][graph] size', this.modules.size);
		}
		if (shouldBroadcastGraphUpsertDelta(classification, options?.emitDeltaOnInsert === true, options?.broadcastDelta !== false)) {
			this.emitDelta([gm], []);
		}
		return gm;
	}

	remove(id: string): void {
		if (!this.modules.has(id)) return;
		this.modules.delete(id);
		this._version++;
		this.emitDelta([], [id]);
	}
}
