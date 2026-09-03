import type { ViewBase } from '../view-base';
import type { CssAnimationProperty, CssProperty, Property } from '../properties';
import type { Invalidation } from './invalidation';

/** A change to a node's child list. Phase 0 never records one. */
export interface ChildMutation {
	readonly kind: 'insert' | 'remove' | 'move';
	readonly child: ViewBase;
	readonly index: number;
}

export type NativeUpdateProperty = Property<any, any> | CssProperty<any, any> | CssAnimationProperty<any, any>;

/** What a commit applies: a property, through its `[setNative]`, or an aggregate invalidation. */
export type NativeUpdateEntry = NativeUpdateProperty | Invalidation;

export type NativeUpdateApplier = (batch: NativeUpdateBatch, entry: NativeUpdateEntry) => void;

const NO_CHILDREN: readonly ChildMutation[] = Object.freeze([]);

/**
 * Everything that is dirty on one node at commit time, in the order the commit will apply it.
 * Handed to `ViewBase.commitNativeUpdates`, which may reorder, pre-empt or drop entries.
 */
export class NativeUpdateBatch {
	/** Every value the node carries is dirty: it is being applied to a native view for the first time. */
	public readonly isMount: boolean;
	public readonly children: readonly ChildMutation[] = NO_CHILDREN;

	private readonly _entries: NativeUpdateEntry[];
	private readonly _handled: boolean[];
	private readonly _apply: NativeUpdateApplier;
	private readonly _previous: Map<NativeUpdateProperty, unknown> | undefined;
	private _index: Map<NativeUpdateEntry, number> | undefined;

	constructor(
		public readonly node: ViewBase,
		isMount: boolean,
		entries: NativeUpdateEntry[],
		previous: Map<NativeUpdateProperty, unknown> | undefined,
		apply: NativeUpdateApplier,
	) {
		this.isMount = isMount;
		this._entries = entries;
		this._handled = new Array(entries.length).fill(false);
		this._previous = previous;
		this._apply = apply;
	}

	/** Everything this commit applies, in commit order; `has()` tells whether an entry is still pending. */
	public get entries(): ReadonlyArray<NativeUpdateEntry> {
		return this._entries;
	}

	/** Whether the entry is still waiting to be applied by this commit. */
	public has(entry: NativeUpdateEntry): boolean {
		const index = this.indexOf(entry);

		return index >= 0 && !this._handled[index];
	}

	/** The value the property held at the last commit; `undefined` on a mount. */
	public previous<T>(property: NativeUpdateProperty): T | undefined {
		return this._previous?.get(property) as T | undefined;
	}

	/** Runs the entry's handler now. An entry that is not pending, or already handled, is a no-op. */
	public apply(entry: NativeUpdateEntry): void {
		const index = this.indexOf(entry);
		if (index < 0 || this._handled[index]) {
			return;
		}

		this._handled[index] = true;
		this._apply(this, this._entries[index]);
	}

	/** Marks the entry handled without touching the native view. */
	public skip(entry: NativeUpdateEntry): void {
		const index = this.indexOf(entry);
		if (index >= 0) {
			this._handled[index] = true;
		}
	}

	/**
	 * Applies everything still pending, in commit order.
	 * @private
	 */
	public _applyRemaining(): void {
		const entries = this._entries;
		const handled = this._handled;

		for (let i = 0, length = entries.length; i < length; i++) {
			// A handler may apply later entries itself, so the flag is re-read on every step.
			if (!handled[i]) {
				handled[i] = true;
				this._apply(this, entries[i]);
			}
		}
	}

	private indexOf(entry: NativeUpdateEntry): number {
		let index = this._index;
		if (!index) {
			index = this._index = new Map<NativeUpdateEntry, number>();
			const entries = this._entries;
			for (let i = 0, length = entries.length; i < length; i++) {
				index.set(entries[i], i);
			}
		}

		const found = index.get(entry);

		return found === undefined ? -1 : found;
	}
}
