import { platformCheck } from './platform-check';

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

// These don't exist on Linux. Stub them to warn in dev.
export const ad = platformCheck('Utils.ad');
export const android = platformCheck('Utils.android');
export const ios = platformCheck('Utils.ios');
export const iOSNativeHelper = platformCheck('Utils.iOSNativeHelper');
