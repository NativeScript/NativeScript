import { describe, expect, it, vi } from 'vitest';
import type { Update } from 'vite';
import { HMRClient, HMRContext, Queue, createHMRHandler, type ImportUpdatedModule } from './hmr-client.js';

const silentLogger = () => ({ error: vi.fn(), debug: vi.fn() });

function createClient(importUpdatedModule: ImportUpdatedModule = async () => ({})) {
	const sent: unknown[] = [];
	const logger = silentLogger();
	const client = new HMRClient(logger, { send: async (payload) => void sent.push(payload) }, importUpdatedModule);
	return { client, sent, logger };
}

function jsUpdate(path: string, acceptedPath = path, extra: Partial<Update> = {}): Update {
	return { type: 'js-update', path, acceptedPath, timestamp: 100, ...extra };
}

const deferred = <T = void>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => (resolve = r));
	return { promise, resolve };
};

describe('Queue / createHMRHandler', () => {
	it('runs one payload at a time, in arrival order', async () => {
		const log: string[] = [];
		const gate = deferred();
		const handle = createHMRHandler(async (name: string) => {
			log.push(`start ${name}`);
			if (name === 'a') await gate.promise;
			log.push(`end ${name}`);
		});
		const a = handle('a');
		const b = handle('b');
		await Promise.resolve();
		expect(log).toEqual(['start a']);
		gate.resolve();
		await Promise.all([a, b]);
		expect(log).toEqual(['start a', 'end a', 'start b', 'end b']);
	});

	it('keeps draining after a handler rejects', async () => {
		const queue = new Queue();
		const failed = queue.enqueue(async () => {
			throw new Error('boom');
		});
		const next = queue.enqueue(async () => 'ok');
		await expect(failed).rejects.toThrow('boom');
		await expect(next).resolves.toBe('ok');
	});
});

describe('HMRClient.notifyListeners', () => {
	it('awaits every listener and survives a rejecting one', async () => {
		const { client } = createClient();
		const hot = new HMRContext(client, '/src/a.ts');
		const gate = deferred();
		let slowDone = false;
		hot.on('vite:beforeUpdate', async () => {
			await gate.promise;
			slowDone = true;
		});
		hot.on('vite:beforeUpdate', async () => {
			throw new Error('listener failed');
		});
		const notified = client.notifyListeners('vite:beforeUpdate', {});
		await Promise.resolve();
		expect(slowDone).toBe(false);
		gate.resolve();
		await notified;
		expect(slowDone).toBe(true);
	});
});

describe('HMRContext', () => {
	it('re-creating a context resets accept callbacks and prunes the previous on() listeners, keeping data', async () => {
		const { client } = createClient();
		const first = new HMRContext(client, '/src/a.ts');
		first.data.count = 1;
		const stale = vi.fn();
		first.on('custom:event', stale);
		first.accept(() => {});

		const second = new HMRContext(client, '/src/a.ts');
		const fresh = vi.fn();
		second.on('custom:event', fresh);
		await client.notifyListeners('custom:event', 1);

		expect(stale).not.toHaveBeenCalled();
		expect(fresh).toHaveBeenCalledWith(1);
		expect(client.hotModulesMap.get('/src/a.ts')?.callbacks).toEqual([]);
		expect(second.data).toEqual({ count: 1 });
	});

	it('keys contexts by the exact owner path', () => {
		const { client } = createClient();
		new HMRContext(client, '/src/a.ts?vue&type=style').data.x = 1;
		expect(new HMRContext(client, '/src/a.ts').data).toEqual({});
	});

	it('off() removes a listener', async () => {
		const { client } = createClient();
		const hot = new HMRContext(client, '/src/a.ts');
		const cb = vi.fn();
		hot.on('e', cb);
		hot.off('e', cb);
		await client.notifyListeners('e', 1);
		expect(cb).not.toHaveBeenCalled();
		expect(client.customListenersMap.has('e')).toBe(false);
	});

	it('send() puts a custom payload on the transport', () => {
		const { client, sent } = createClient();
		new HMRContext(client, '/src/a.ts').send('my:event', { n: 1 });
		expect(sent).toEqual([{ type: 'custom', event: 'my:event', data: { n: 1 } }]);
	});

	it('send() before the transport is attached logs instead of throwing', async () => {
		const logger = silentLogger();
		const client = new HMRClient(logger);
		new HMRContext(client, '/src/a.ts').send('my:event');
		await new Promise((r) => setTimeout(r, 0));
		expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ name: 'SendBeforeConnectError' }));
	});

	it('invalidate() notifies vite:invalidate locally and sends it to the server with firstInvalidatedBy', async () => {
		const { client, sent } = createClient();
		const hot = new HMRContext(client, '/src/a.ts');
		const local = vi.fn();
		hot.on('vite:invalidate', local);
		hot.invalidate('stale export');
		const expected = { path: '/src/a.ts', message: 'stale export', firstInvalidatedBy: '/src/a.ts' };
		expect(local).toHaveBeenCalledWith(expected);
		expect(sent).toEqual([{ type: 'custom', event: 'vite:invalidate', data: expected }]);
	});

	it('invalidate() inside an accept callback carries the update’s firstInvalidatedBy', async () => {
		const { client, sent } = createClient();
		const hot = new HMRContext(client, '/src/a.ts');
		hot.accept(() => hot.invalidate());
		await client.queueUpdate(jsUpdate('/src/a.ts', '/src/a.ts', { firstInvalidatedBy: '/src/root.ts' }));
		expect(sent).toEqual([{ type: 'custom', event: 'vite:invalidate', data: { path: '/src/a.ts', message: undefined, firstInvalidatedBy: '/src/root.ts' } }]);
		expect(client.currentFirstInvalidatedBy).toBeUndefined();
	});
});

describe('HMRClient.queueUpdate (fetchUpdate)', () => {
	it('is a no-op when the module has no hot entry', async () => {
		const importer = vi.fn();
		const { client } = createClient(importer);
		await client.queueUpdate(jsUpdate('/src/unknown.ts'));
		expect(importer).not.toHaveBeenCalled();
	});

	it('self-accept: awaits dispose with data, imports, then calls the callback with the fresh module', async () => {
		const order: string[] = [];
		const fresh = { value: 2 };
		const { client } = createClient(async () => {
			order.push('import');
			return fresh;
		});
		const hot = new HMRContext(client, '/src/a.ts');
		hot.dispose(async (data) => {
			await Promise.resolve();
			data.saved = 'state';
			order.push('dispose');
		});
		const accepted = vi.fn(() => order.push('accept'));
		hot.accept(accepted);

		await client.queueUpdate(jsUpdate('/src/a.ts'));

		expect(order).toEqual(['dispose', 'import', 'accept']);
		expect(accepted).toHaveBeenCalledWith(fresh);
		expect(hot.data).toEqual({ saved: 'state' });
	});

	it('dep-accept: only callbacks whose deps include the accepted path run, with the deps-positional array', async () => {
		const fresh = { dep: true };
		const { client } = createClient(async () => fresh);
		const owner = new HMRContext(client, '/src/parent.ts');
		const both = vi.fn();
		const other = vi.fn();
		owner.accept(['/src/x.ts', '/src/child.ts'], both);
		owner.accept(['/src/x.ts'], other);

		await client.queueUpdate(jsUpdate('/src/parent.ts', '/src/child.ts'));

		expect(both).toHaveBeenCalledWith([undefined, fresh]);
		expect(other).not.toHaveBeenCalled();
	});

	it('runs the callbacks of one batch in the order the server sent them', async () => {
		const slow = deferred<Record<string, unknown>>();
		const { client } = createClient(async (update) => (update.acceptedPath === '/src/a.ts' ? slow.promise : {}));
		const order: string[] = [];
		new HMRContext(client, '/src/a.ts').accept(() => order.push('a'));
		new HMRContext(client, '/src/b.ts').accept(() => order.push('b'));

		const a = client.queueUpdate(jsUpdate('/src/a.ts'));
		const b = client.queueUpdate(jsUpdate('/src/b.ts'));
		await b;
		setTimeout(() => slow.resolve({}), 0);
		await a;
		expect(order).toEqual(['a', 'b']);
	});

	it('logs a failed import and still calls accept with undefined', async () => {
		const { client, logger } = createClient(async () => {
			throw new Error('SyntaxError');
		});
		const accepted = vi.fn();
		new HMRContext(client, '/src/a.ts').accept(accepted);
		await client.queueUpdate(jsUpdate('/src/a.ts'));
		expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to reload /src/a.ts'));
		expect(accepted).toHaveBeenCalledWith(undefined);
	});
});

describe('HMRClient.prunePaths', () => {
	it('runs dispose then prune with data, then deletes the data', async () => {
		const { client } = createClient();
		const hot = new HMRContext(client, '/src/a.ts');
		const order: string[] = [];
		hot.dispose((data) => {
			data.disposed = true;
			order.push('dispose');
		});
		hot.prune((data) => order.push(`prune:${data.disposed}`));

		await client.prunePaths(['/src/a.ts']);

		expect(order).toEqual(['dispose', 'prune:true']);
		expect(client.dataMap.has('/src/a.ts')).toBe(false);
		expect(new HMRContext(client, '/src/a.ts').data).toEqual({});
	});
});

describe('HMRClient.dropContexts', () => {
	it('forgets callbacks and listeners of the given paths but keeps their data', async () => {
		const { client } = createClient();
		const dropped = new HMRContext(client, '/src/a.ts');
		dropped.data.kept = 1;
		const droppedListener = vi.fn();
		dropped.on('e', droppedListener);
		dropped.accept(() => {});
		dropped.dispose(() => {});
		dropped.prune(() => {});
		const survivor = new HMRContext(client, '/node_modules/lib/index.js');
		const survivorListener = vi.fn();
		survivor.on('e', survivorListener);

		client.dropContexts(['/src/a.ts']);
		await client.notifyListeners('e', 1);

		expect(droppedListener).not.toHaveBeenCalled();
		expect(survivorListener).toHaveBeenCalledWith(1);
		expect(client.hotModulesMap.has('/src/a.ts')).toBe(false);
		expect(client.disposeMap.has('/src/a.ts')).toBe(false);
		expect(client.pruneMap.has('/src/a.ts')).toBe(false);
		expect(client.ownerPaths()).toEqual(['/node_modules/lib/index.js']);
		expect(client.dataMap.get('/src/a.ts')).toEqual({ kept: 1 });
	});
});

describe('hot.decline()', () => {
	it('is tracked per owner path until the module is re-evaluated', () => {
		const { client } = createClient();
		new HMRContext(client, '/src/a.ts').decline();
		new HMRContext(client, '/src/b.ts');

		expect(client.isDeclined('/src/a.ts')).toBe(true);
		expect(client.isDeclined('/src/b.ts')).toBe(false);
		expect(client.declinedOwnerPaths()).toEqual(['/src/a.ts']);

		new HMRContext(client, '/src/a.ts');
		expect(client.isDeclined('/src/a.ts')).toBe(false);
	});

	it('is forgotten by dropContexts and prunePaths', async () => {
		const { client } = createClient();
		new HMRContext(client, '/src/a.ts').decline();
		new HMRContext(client, '/src/b.ts').decline();

		client.dropContexts(['/src/a.ts']);
		await client.prunePaths(['/src/b.ts']);

		expect(client.declinedOwnerPaths()).toEqual([]);
	});
});

describe('HMRClient.notifyListenersSettled', () => {
	it('reports rejecting and synchronously throwing listeners without skipping the others', async () => {
		const { client } = createClient();
		const hot = new HMRContext(client, '/src/a.ts');
		const ran = vi.fn();
		hot.on('e', () => {
			throw new Error('sync');
		});
		hot.on('e', async () => {
			throw new Error('async');
		});
		hot.on('e', ran);

		const results = await client.notifyListenersSettled('e', 1);

		expect(results.map((r) => (r.status === 'rejected' ? (r.reason as Error).message : r.status))).toEqual(['sync', 'async', 'fulfilled']);
		expect(ran).toHaveBeenCalledWith(1);
	});
});

describe('HMRClient.disposePaths', () => {
	it('runs every dispose callback and returns the ones that failed', async () => {
		const { client } = createClient();
		const ran = vi.fn();
		new HMRContext(client, '/src/a.ts').dispose(() => {
			throw new Error('dispose a');
		});
		new HMRContext(client, '/src/b.ts').dispose(ran);

		const failures = await client.disposePaths(['/src/a.ts', '/src/b.ts']);

		expect(failures.map(({ path, reason }) => [path, (reason as Error).message])).toEqual([['/src/a.ts', 'dispose a']]);
		expect(ran).toHaveBeenCalled();
	});
});
