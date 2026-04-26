type ModuleProvenanceSnapshot = {
	key: string;
	kind: string;
	specifier?: string;
	url?: string;
	via?: string;
	parent?: string;
	count: number;
	lastSeen: number;
	history: Array<{
		kind: string;
		specifier?: string;
		url?: string;
		via?: string;
		parent?: string;
		ts: number;
	}>;
};

const STORE_KEY = '__NS_MODULE_PROVENANCE__';
const RECORDER_KEY = '__NS_RECORD_MODULE_PROVENANCE__';
const GETTER_KEY = '__NS_GET_MODULE_PROVENANCE__';

function setGlobal(key: string, value: unknown) {
	const g: any = globalThis as any;
	try {
		Object.defineProperty(g, key, { value, configurable: true, writable: true });
	} catch {
		try {
			g[key] = value;
		} catch {}
	}
}

export function installModuleProvenanceRecorder(verbose?: boolean) {
	const g: any = globalThis as any;
	const store: Map<string, ModuleProvenanceSnapshot> = g[STORE_KEY] instanceof Map ? g[STORE_KEY] : new Map();
	setGlobal(STORE_KEY, store);

	if (typeof g[RECORDER_KEY] !== 'function') {
		const record = (key: string, details: Partial<ModuleProvenanceSnapshot> = {}) => {
			const normalizedKey = String(key || details.specifier || details.url || 'unknown');
			const previous = store.get(normalizedKey);
			const timestamp = Date.now();
			const event = {
				kind: String(details.kind || previous?.kind || 'unknown'),
				specifier: details.specifier,
				url: details.url,
				via: details.via,
				parent: details.parent,
				ts: timestamp,
			};
			const history = Array.isArray(previous?.history) ? previous.history.slice(-9) : [];
			history.push(event);

			const next: ModuleProvenanceSnapshot = {
				key: normalizedKey,
				kind: event.kind,
				specifier: details.specifier ?? previous?.specifier,
				url: details.url ?? previous?.url,
				via: details.via ?? previous?.via,
				parent: details.parent ?? previous?.parent,
				count: (previous?.count || 0) + 1,
				lastSeen: timestamp,
				history,
			};

			store.set(normalizedKey, next);
			return next;
		};

		setGlobal(RECORDER_KEY, record);
	}

	if (typeof g[GETTER_KEY] !== 'function') {
		setGlobal(GETTER_KEY, (key?: string) => {
			if (key) {
				return store.get(String(key));
			}
			return Array.from(store.values());
		});
	}

	if (verbose) {
		console.info('[ns-entry] module provenance recorder installed');
	}
}
