export type NsHmrUpdatePayload = {
	type: 'full-graph' | 'delta';
	version: number;
	changedIds: string[];
	// Raw message payload from the HMR WebSocket
	raw: any;
};

export type NsHmrUpdateHandler = (payload: NsHmrUpdatePayload) => void;

type NsHmrGlobalState = {
	__NS_HMR_ON_UPDATE__?: unknown;
	__NS_HMR_ON_UPDATE_DISPATCHER__?: NsHmrUpdateHandler;
	__NS_HMR_ON_UPDATE_REGISTRY__?: Map<string, NsHmrUpdateHandler>;
	__NS_HMR_ON_UPDATE_BASE__?: unknown;
};

function getNsHmrGlobal(): NsHmrGlobalState {
	return globalThis as any;
}

function ensureDispatcherInstalled(): {
	registry: Map<string, NsHmrUpdateHandler>;
	dispatcher: NsHmrUpdateHandler;
	base: unknown;
} {
	const g = getNsHmrGlobal();
	if (!g.__NS_HMR_ON_UPDATE_REGISTRY__) g.__NS_HMR_ON_UPDATE_REGISTRY__ = new Map();
	const registry = g.__NS_HMR_ON_UPDATE_REGISTRY__;

	if (!g.__NS_HMR_ON_UPDATE_DISPATCHER__) {
		const base = g.__NS_HMR_ON_UPDATE__;
		// If something already owns the hook and it's not our dispatcher, preserve it.
		g.__NS_HMR_ON_UPDATE_BASE__ = base;
		g.__NS_HMR_ON_UPDATE_DISPATCHER__ = (payload: NsHmrUpdatePayload) => {
			// Call registered handlers first (app-level consumers).
			try {
				for (const handler of registry.values()) {
					try {
						handler(payload);
					} catch {}
				}
			} catch {}
			// Then call any preserved base hook.
			try {
				const b = (getNsHmrGlobal() as any).__NS_HMR_ON_UPDATE_BASE__;
				if (typeof b === 'function') (b as NsHmrUpdateHandler)(payload);
			} catch {}
		};
		g.__NS_HMR_ON_UPDATE__ = g.__NS_HMR_ON_UPDATE_DISPATCHER__;
	}

	return {
		registry,
		dispatcher: g.__NS_HMR_ON_UPDATE_DISPATCHER__!,
		base: g.__NS_HMR_ON_UPDATE_BASE__,
	};
}

/**
 * Register a callback that will be invoked after each HMR batch
 * (full graph or delta) is applied on device.
 *
 * It is safe to call multiple times with the same `id`; the handler
 * will be replaced instead of stacking duplicates across module reloads.
 */

export function onHmrUpdate(handler: NsHmrUpdateHandler, id: string): void {
	if (typeof handler !== 'function') return;
	if (typeof id !== 'string' || !id) return;
	try {
		const { registry } = ensureDispatcherInstalled();
		registry.set(id, handler);
	} catch {}
}

/** Remove a previously registered handler (use the same `id` you registered with). */
export function offHmrUpdate(id: string): void {
	if (typeof id !== 'string' || !id) return;
	try {
		const g = getNsHmrGlobal();
		g.__NS_HMR_ON_UPDATE_REGISTRY__?.delete(id);
	} catch {}
}
