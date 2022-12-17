/**
 * A lightweight extension of Array that calls listeners just before any
 * mutations. This allows you to lazily take a clone of an array (i.e. use the
 * array as-is until such time as it mutates).
 *
 * This could equally be implemented by adding pre-mutation events into
 * ObservableArray, but the whole point is to be as lightweight as possible as
 * its entire purpose is to be used for performance-sensitive tasks.
 */
export class MutationSensitiveArray<T> extends Array<T> {
	onMutation: (() => void) | null = null;

	private invalidate(): void {
		if (this.onMutation) {
			this.onMutation();
		}
	}

	// Override each mutating Array method so that it invalidates our snapshot.

	pop(): T | undefined {
		this.invalidate();
		return super.pop();
	}
	push(...items: T[]): number {
		this.invalidate();
		return super.push(...items);
	}
	reverse(): T[] {
		this.invalidate();
		return super.reverse();
	}
	shift(): T | undefined {
		this.invalidate();
		return super.shift();
	}
	sort(compareFn?: (a: T, b: T) => number): this {
		this.invalidate();
		return super.sort(compareFn);
	}
	splice(start: number, deleteCount: number, ...rest: T[]): T[] {
		this.invalidate();
		return super.splice(start, deleteCount, ...rest);
	}
	unshift(...items: T[]): number {
		this.invalidate();
		return super.unshift(...items);
	}
	fill(value: T, start?: number, end?: number): this {
		this.invalidate();
		return super.fill(value, start, end);
	}
	copyWithin(target: number, start: number, end?: number): this {
		this.invalidate();
		return super.copyWithin(target, start, end);
	}
}
