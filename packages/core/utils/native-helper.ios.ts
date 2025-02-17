import * as iOSUtils from './ios';
import { platformCheck } from './platform-check';
import { getClass, isNullOrUndefined, numberHasDecimals, numberIs64Bit } from './types';

export function dataDeserialize(nativeData?: any) {
	if (isNullOrUndefined(nativeData)) {
		// some native values will already be js null values
		// calling types.getClass below on null/undefined will cause crash
		return null;
	} else {
		switch (getClass(nativeData)) {
			case 'NSNull':
				return null;
			case 'NSMutableDictionary':
			case 'NSDictionary': {
				const obj = {};
				const length = nativeData.count;
				const keysArray = nativeData.allKeys as NSArray<any>;
				for (let i = 0; i < length; i++) {
					const nativeKey = keysArray.objectAtIndex(i);
					obj[nativeKey] = dataDeserialize(nativeData.objectForKey(nativeKey));
				}
				return obj;
			}
			case 'NSMutableArray':
			case 'NSArray': {
				const array = [];
				const len = nativeData.count;
				for (let i = 0; i < len; i++) {
					array[i] = dataDeserialize(nativeData.objectAtIndex(i));
				}
				return array;
			}
			default:
				return nativeData;
		}
	}
}

export function dataSerialize(data: any, wrapPrimitives: boolean = false) {
	switch (typeof data) {
		case 'string':
		case 'boolean': {
			return data;
		}
		case 'number': {
			const hasDecimals = numberHasDecimals(data);
			if (numberIs64Bit(data)) {
				if (hasDecimals) {
					return NSNumber.alloc().initWithDouble(data);
				} else {
					return NSNumber.alloc().initWithLongLong(data);
				}
			} else {
				if (hasDecimals) {
					return NSNumber.alloc().initWithFloat(data);
				} else {
					return data;
				}
			}
		}

		case 'object': {
			if (data instanceof Date) {
				return NSDate.dateWithTimeIntervalSince1970(data.getTime() / 1000);
			}

			if (!data) {
				return null;
			}

			if (Array.isArray(data)) {
				return NSArray.arrayWithArray(data.map((el) => dataSerialize(el, wrapPrimitives)).filter((el) => el !== null));
			}

			const node = Object.fromEntries(
				Object.entries(data)
					.map(([key, value]) => [key, dataSerialize(value, wrapPrimitives)])
					.filter(([, value]) => value !== null),
			);

			// cast to any avoids signature overload on tsc build
			return NSDictionary.dictionaryWithDictionary(node as any);
		}

		default:
			return null;
	}
}

// these don't exist on iOS. Stub them to empty functions.
export const ad = platformCheck('Utils.ad');
export const android = platformCheck('Utils.android');

export import ios = iOSUtils;

/**
 * @deprecated Use `Utils.ios` instead.
 */
export import iOSNativeHelper = iOSUtils;
