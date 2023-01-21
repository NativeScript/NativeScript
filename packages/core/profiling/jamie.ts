class Profiler {
	private map: Record<string, number> = {};

	profile<T>(key: string, action: () => T) {
		const start = global.isIOS ? (global as any).performance.now() : __time();
		const returnValue = action();
		const stop = global.isIOS ? (global as any).performance.now() : __time();
		const period = stop - start;

		this.map[key] = (this.map[key] || 0) + period;

		// console.log(`[PROFILE] ${key}: ${stop - start} ms`);
		return returnValue;
	}

	flush() {
		const map = this.map;
		this.map = {};
		return map;
	}

	get(key: string) {
		return this.map[key];
	}

	report(map: Record<string, number> = this.map) {
		return Object.entries(map).sort(([, valueA], [, valueB]) => {
			return sortDescending(valueA, valueB);
		});
	}
}

function sortDescending(a: number, b: number): 1 | 0 | -1 {
	return a < b ? 1 : a > b ? -1 : 0;
}

export const jamieProfiler = new Profiler();
