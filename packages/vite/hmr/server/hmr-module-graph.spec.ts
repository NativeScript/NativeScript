import { describe, expect, it } from 'vitest';

import { HmrModuleGraph } from './hmr-module-graph.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';

// Minimal strategy stub: the graph only consults `matchesFile` (to decide which
// changed ids participate in transactional ordering).
const tsStrategy = {
	matchesFile: (id: string) => /\.(ts|tsx|js|mjs|jsx)$/i.test(id),
} as unknown as FrameworkServerStrategy;

function makeGraph(pluginRoot?: string) {
	const sent: string[] = [];
	const client = { send: (m: string) => sent.push(m) };
	let wss: any = { clients: new Set([client]) };
	const mg = new HmrModuleGraph({
		verbose: false,
		strategy: tsStrategy,
		getWss: () => wss,
		getPluginRoot: () => pluginRoot,
	});
	return {
		mg,
		sent,
		client,
		setWss: (w: any) => {
			wss = w;
		},
	};
}

describe('HmrModuleGraph version + lookup', () => {
	it('starts at version 1 and reports an empty graph', () => {
		const { mg } = makeGraph();
		expect(mg.version).toBe(1);
		expect(mg.size).toBe(0);
		expect(mg.get('/src/app.ts')).toBeUndefined();
	});

	it('serve-time upserts (bumpVersion:false) populate the graph without advancing the version', () => {
		const { mg } = makeGraph();
		mg.upsert('/src/app.ts', 'export const a = 1', [], { bumpVersion: false });
		expect(mg.size).toBe(1);
		expect(mg.version).toBe(1);
		expect(mg.get('/src/app.ts')).toMatchObject({ id: '/src/app.ts', deps: [] });
	});

	it('live-edit upserts advance the version (insert then change)', () => {
		const { mg } = makeGraph();
		mg.upsert('/src/app.ts', 'v1', []); // inserted -> bumps by default
		expect(mg.version).toBe(2);
		mg.upsert('/src/app.ts', 'v2', []); // changed -> bumps
		expect(mg.version).toBe(3);
	});

	it('returns the existing module and leaves the version untouched when nothing changed', () => {
		const { mg } = makeGraph();
		const first = mg.upsert('/src/app.ts', 'same', ['/src/dep.ts'], { bumpVersion: false });
		const again = mg.upsert('/src/app.ts', 'same', ['/src/dep.ts'], { bumpVersion: false });
		expect(again).toBe(first);
		expect(mg.version).toBe(1);
	});
});

describe('HmrModuleGraph.computeHash', () => {
	it('is deterministic and returns an 8-char hex digest', () => {
		const { mg } = makeGraph();
		expect(mg.computeHash('hello world')).toBe(mg.computeHash('hello world'));
		expect(mg.computeHash('hello world')).toMatch(/^[0-9a-f]{8}$/);
		expect(mg.computeHash('a')).not.toBe(mg.computeHash('b'));
	});
});

describe('HmrModuleGraph.normalizeGraphId', () => {
	it('strips query strings, file:// and back-slashes, and ensures a leading slash', () => {
		const { mg } = makeGraph();
		expect(mg.normalizeGraphId('/src/app.ts?v=2')).toBe('/src/app.ts');
		expect(mg.normalizeGraphId('file:///src/app.ts')).toBe('/src/app.ts');
		expect(mg.normalizeGraphId('src/app.ts')).toBe('/src/app.ts');
		expect(mg.normalizeGraphId('src\\app.ts')).toBe('/src/app.ts');
	});

	it('strips the plugin root prefix when present', () => {
		const { mg } = makeGraph('/Users/me/proj');
		expect(mg.normalizeGraphId('/Users/me/proj/src/app.ts')).toBe('/src/app.ts');
	});
});

describe('HmrModuleGraph.computeTxnOrderForChanged', () => {
	it('orders dependencies before dependents (post-order)', () => {
		const { mg } = makeGraph();
		mg.upsert('/src/a.ts', 'a', ['/src/b.ts'], { bumpVersion: false });
		mg.upsert('/src/b.ts', 'b', [], { bumpVersion: false });
		const order = mg.computeTxnOrderForChanged(['/src/a.ts']);
		expect(order).toEqual(['/src/b.ts', '/src/a.ts']);
	});

	it('ignores changed ids that are not present in the graph', () => {
		const { mg } = makeGraph();
		expect(mg.computeTxnOrderForChanged(['/src/missing.ts'])).toEqual([]);
	});
});

describe('HmrModuleGraph delta + full-graph broadcasts', () => {
	it('broadcasts a delta payload and records the transactional batch order', () => {
		const { mg, sent } = makeGraph();
		// emitDeltaOnInsert routes the insert through emitDelta after the module
		// lands in the graph, so the txn batch can resolve the changed id.
		mg.upsert('/src/a.ts', 'a', [], { emitDeltaOnInsert: true });
		expect(sent).toHaveLength(1);
		const payload = JSON.parse(sent[0]);
		expect(payload.type).toBe('ns:hmr-delta');
		expect(payload.changed.map((m: any) => m.id)).toEqual(['/src/a.ts']);
		expect(mg.getTxnBatch(payload.newVersion)).toEqual(['/src/a.ts']);
	});

	it('emits a full-graph snapshot of every known module', () => {
		const { mg, client, sent } = makeGraph();
		mg.upsert('/src/a.ts', 'a', [], { bumpVersion: false });
		mg.upsert('/src/b.ts', 'b', [], { bumpVersion: false });
		mg.emitFullGraph(client as any);
		const payload = JSON.parse(sent[sent.length - 1]);
		expect(payload.type).toBe('ns:hmr-full-graph');
		expect(payload.modules.map((m: any) => m.id).sort()).toEqual(['/src/a.ts', '/src/b.ts']);
	});

	it('is a no-op when no WebSocket server is connected', () => {
		const { mg, sent, setWss } = makeGraph();
		setWss(null);
		expect(() => mg.emitDelta([{ id: '/src/a.ts', deps: [], hash: 'h' }], [])).not.toThrow();
		expect(sent).toHaveLength(0);
	});

	it('removes a module, advances the version and broadcasts the removal', () => {
		const { mg, sent } = makeGraph();
		mg.upsert('/src/a.ts', 'a', [], { bumpVersion: false });
		const versionBefore = mg.version;
		mg.remove('/src/a.ts');
		expect(mg.get('/src/a.ts')).toBeUndefined();
		expect(mg.version).toBe(versionBefore + 1);
		const payload = JSON.parse(sent[sent.length - 1]);
		expect(payload.removed).toEqual(['/src/a.ts']);
	});
});
