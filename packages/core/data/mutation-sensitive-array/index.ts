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
	private readonly listeners: (() => void)[] = [];

	once(listener: () => void): void {
		const wrapper = () => {
			listener();
			this.removeListener(wrapper);
		};
		this.addListener(wrapper);
	}

	addListener(listener: () => void): void {
		if (!this.listeners.includes(listener)) {
			this.listeners.push(listener);
		}
	}

	removeListener(listener: () => void): void {
		const index = this.listeners.indexOf(listener);
		if (index > -1) {
			this.listeners.splice(index, 1);
		}
	}

	private invalidate(): void {
		for (const listener of this.listeners) {
			listener();
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
