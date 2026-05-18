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

export const windows = {};

// These don't exist on Windows — stub them to warn in dev.
export const ad = platformCheck('Utils.ad');
export const android = platformCheck('Utils.android');
export const ios = platformCheck('Utils.ios');
export const iOSNativeHelper = platformCheck('Utils.iOSNativeHelper');
