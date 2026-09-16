import type { ViewBase } from '../view-base';
import { SuspendType } from '../view-base/suspend-type';

export type NativeUpdatesMode = 'sync';

export interface FlushNativeUpdatesOptions {
	/** Flush the node's descendants as well, each after its own host. */
	subtree?: boolean;
	/** Push to a native view that already exists even while the node is not loaded. */
	force?: boolean;
}

let depth = 0;

/** The nodes an open batch is holding, in the order they were first written to. */
const held = new Set<ViewBase>();

/**
 * Decides when native updates are committed. The only mode in this version is `'sync'`: every
 * write commits as it is made, except inside `batch()`/`begin()`…`end()`, which coalesces the
 * writes made to each node into one commit per node when the outermost batch closes.
 */
export const NativeUpdates = {
	/** Depth of the open batches; `0` means a write commits where it is made. @private */
	_depth: 0,

	get mode(): NativeUpdatesMode {
		return 'sync';
	},

	set mode(value: NativeUpdatesMode) {
		if (value !== 'sync') {
			throw new Error(`NativeUpdates.mode cannot be set to '${value}': 'sync' is the only mode this version implements.`);
		}
	},

	/** Runs `callback` with commits coalesced per node. Nestable; only the outermost one commits. */
	batch<T>(callback: () => T): T {
		NativeUpdates.begin();
		try {
			return callback();
		} finally {
			NativeUpdates.end();
		}
	},

	/** The unpaired form of `batch()`, for renderers that have their own begin/end hooks. */
	begin(): void {
		depth++;
		NativeUpdates._depth = depth;
	},

	end(): void {
		if (depth === 0) {
			throw new Error('NativeUpdates.end() called without a matching begin().');
		}

		depth--;
		NativeUpdates._depth = depth;

		if (depth !== 0 || held.size === 0) {
			return;
		}

		const nodes = Array.from(held);
		held.clear();

		for (let i = 0, length = nodes.length; i < length; i++) {
			nodes[i]._resumeNativeUpdates(SuspendType.Incremental);
		}
	},

	/**
	 * Commits now: the node and, unless told otherwise, its subtree. Without a node, commits every
	 * node the open batch is holding, leaving the batch open. Returns whether anything was pushed.
	 */
	flush(view?: ViewBase, options?: FlushNativeUpdatesOptions): boolean {
		if (view) {
			return view.flushNativeUpdates({ subtree: options?.subtree ?? true, force: options?.force });
		}

		let flushed = false;
		for (const node of held) {
			flushed = node.flushNativeUpdates(options) || flushed;
		}

		return flushed;
	},

	/**
	 * Holds the node for the open batch the first time it is written to.
	 * @private
	 */
	_hold(view: ViewBase): void {
		if (!held.has(view)) {
			held.add(view);
			view._suspendNativeUpdates(SuspendType.Incremental);
		}
	},
};
