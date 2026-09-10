/**
 * The order a commit applies invalidations in. Phase 0 carries the phase but does not order by
 * it yet: nothing in core declares an invalidation, so every batch is properties then aggregates.
 */
export enum InvalidationPhase {
	Style,
	Structure,
	Mount,
	Props,
	Content,
	Layout,
	Paint,
}

export interface InvalidationOptions {
	readonly phase?: InvalidationPhase;
	/** The handler needs a laid out size, so a commit may have to defer it until there is one. */
	readonly needsBounds?: boolean;
}

/**
 * A named dirty flag several properties can share, so that one native rebuild serves all of them.
 * A node handles it with `[invalidation.apply](batch)`, mirroring `[property.setNative](value)`.
 */
export class Invalidation {
	public readonly name: string;
	public readonly apply: symbol;
	public readonly phase: InvalidationPhase;
	public readonly needsBounds: boolean;

	constructor(name: string, options?: InvalidationOptions) {
		this.name = name;
		this.apply = Symbol(`${name}:applyInvalidation`);
		this.phase = options?.phase ?? InvalidationPhase.Props;
		this.needsBounds = options?.needsBounds ?? false;
	}

	public toString(): string {
		return `Invalidation(${this.name})`;
	}
}
