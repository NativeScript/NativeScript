/**
 * A lightweight extension of Array that calls listeners just before any
 * mutations. This allows you to lazily take a clone of an array (i.e. use the
 * array as-is until such time as it mutates). In other worse, "copy on write".
 *
 * This could equally be implemented by adding pre-mutation events into
 * ObservableArray, but the whole point is to be as lightweight as possible as
 * its entire purpose is to be used for performance-sensitive tasks.
 */
export class MutationSensitiveArray<T> extends Array<T> {
	beforeMutation: (() => void) | null = null;

	pop(): T | undefined {
		this.beforeMutation?.();
		return super.pop();
	}
	push(...items: T[]): number {
		this.beforeMutation?.();
		return super.push(...items);
	}
	reverse(): T[] {
		this.beforeMutation?.();
		return super.reverse();
	}
	shift(): T | undefined {
		this.beforeMutation?.();
		return super.shift();
	}
	sort(compareFn?: (a: T, b: T) => number): this {
		this.beforeMutation?.();
		return super.sort(compareFn);
	}
	splice(start: number, deleteCount: number, ...rest: T[]): T[] {
		this.beforeMutation?.();
		return super.splice(start, deleteCount, ...rest);
	}
	unshift(...items: T[]): number {
		this.beforeMutation?.();
		return super.unshift(...items);
	}
	fill(value: T, start?: number, end?: number): this {
		this.beforeMutation?.();
		return super.fill(value, start, end);
	}
	copyWithin(target: number, start: number, end?: number): this {
		this.beforeMutation?.();
		return super.copyWithin(target, start, end);
	}
}
