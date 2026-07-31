import { describe, expect, it } from 'vitest';

import { assertNeverNsMessage, type AngularUpdateMessage, type ClientToServerMessage, type CssUpdatesMessage, type HmrDeltaMessage, type HmrFullGraphMessage, type HmrPendingMessage, type HmrResyncRequestMessage, type HmrSfcRegistryRequestMessage, type ModuleResponseMessage, type ServerToClientMessage, type TsModuleRegistryMessage, type VueSfcRegistryMessage, type VueSfcRegistryUpdateMessage } from './protocol.js';

// One representative payload per message type. Each literal is `satisfies`-checked
// against its specific interface, so any drift between protocol.ts and the shape a
// real emit site produces fails `tsc` at build time — these samples are the
// human-readable contract the server emitters are typed against.
const serverToClientSamples: ServerToClientMessage[] = [
	{ type: 'ns:angular-update', origin: 'http://localhost:5173', path: '/src/app.ts', version: 3, timestamp: 1, evictPaths: ['http://localhost:5173/ns/m/src/app.ts'], importerEntry: '/src/main.ts' } satisfies AngularUpdateMessage,
	{ type: 'ns:css-updates', origin: 'http://localhost:5173', updates: [{ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: 1 }] } satisfies CssUpdatesMessage,
	{ type: 'ns:hmr-delta', baseVersion: 2, newVersion: 3, changed: [{ id: '/src/app.ts', deps: [], hash: 'abc' }], removed: [] } satisfies HmrDeltaMessage,
	{ type: 'ns:hmr-full-graph', version: 3, modules: [{ id: '/src/app.ts', deps: [], hash: 'abc' }] } satisfies HmrFullGraphMessage,
	{ type: 'ns:hmr-pending', origin: 'http://localhost:5173', path: '/src/app.ts', kind: 'ts', timestamp: 1 } satisfies HmrPendingMessage,
	{ type: 'ns:module-response', requestId: 7 } satisfies ModuleResponseMessage,
	{ type: 'ns:ts-module-registry', modules: ['/src/app.ts'], ts: 1 } satisfies TsModuleRegistryMessage,
	{ type: 'ns:vue-sfc-registry', entries: [{ path: '/src/App.vue', fileName: 'sfc-abc.mjs', hmrId: 'abc', code: '' }], ts: 1 } satisfies VueSfcRegistryMessage,
	{ type: 'ns:vue-sfc-registry-update', path: '/src/App.vue', fileName: 'sfc-abc.mjs', ts: 1, version: 3 } satisfies VueSfcRegistryUpdateMessage,
];

const clientToServerSamples: ClientToServerMessage[] = [{ type: 'ns:hmr-resync-request' } satisfies HmrResyncRequestMessage, { type: 'ns:hmr-sfc-registry-request' } satisfies HmrSfcRegistryRequestMessage];

/**
 * Exhaustive dispatch over the server→client union. The `default` branch only
 * type-checks when every member is handled above (TypeScript narrows `msg` to
 * `never` there). Add a tenth server→client message without a `case` and this
 * fails to compile — that compile error is the point of the union.
 */
function describeServerMessage(msg: ServerToClientMessage): string {
	switch (msg.type) {
		case 'ns:angular-update':
			return msg.path;
		case 'ns:css-updates':
			return `${msg.updates.length} css`;
		case 'ns:hmr-delta':
			return `delta ${msg.baseVersion}->${msg.newVersion}`;
		case 'ns:hmr-full-graph':
			return `graph@${msg.version}`;
		case 'ns:hmr-pending':
			return `pending ${msg.kind}`;
		case 'ns:module-response':
			return `module#${msg.requestId}`;
		case 'ns:ts-module-registry':
			return `${msg.modules.length} ts modules`;
		case 'ns:vue-sfc-registry':
			return `${msg.entries.length} sfc`;
		case 'ns:vue-sfc-registry-update':
			return msg.path;
		default:
			return assertNeverNsMessage(msg);
	}
}

describe('ns:* HMR protocol', () => {
	it('declares a representative payload for all 11 message types with distinct ns: discriminants', () => {
		const types = [...serverToClientSamples, ...clientToServerSamples].map((m) => m.type);
		expect(types).toHaveLength(11);
		expect(new Set(types).size).toBe(11);
		expect(types.every((t) => t.startsWith('ns:'))).toBe(true);
	});

	it('dispatches every server→client message through an exhaustive switch without hitting the assertNever guard', () => {
		for (const sample of serverToClientSamples) {
			expect(typeof describeServerMessage(sample)).toBe('string');
		}
	});

	it('assertNeverNsMessage throws and embeds the offending payload', () => {
		const rogue = { type: 'ns:not-a-real-message' };
		expect(() => assertNeverNsMessage(rogue as never)).toThrowError(/ns:not-a-real-message/);
	});
});
