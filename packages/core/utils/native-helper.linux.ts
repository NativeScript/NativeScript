export function dataSerialize(data: any): any {
	return data;
}

export function dataDeserialize(data: any): any {
	return data;
}

export function isRealDevice(): boolean {
	return true;
}

export function getWindow<T>(): T {
	return undefined;
}

export const linux = {};

// These don't exist on Linux: throw on access in dev.
// (Local instead of ./platform-check: webpack 5.112 drops that import from this module.)
function unavailable(name: string): any {
	return __DEV__
		? new Proxy(
				{},
				{
					get(_, prop) {
						throw new Error(`Trying to access "${name}.${String(prop)}" on Linux. Check the platform first (__LINUX__).`);
					},
				},
			)
		: undefined;
}

export const ad = unavailable('Utils.ad');
export const android = unavailable('Utils.android');
export const ios = unavailable('Utils.ios');
export const iOSNativeHelper = unavailable('Utils.iOSNativeHelper');
