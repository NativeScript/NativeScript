import { platformCheck } from './platform-check';

export function dataSerialize(data: any): any {
	return data;
}


function tryDeserializeJsonValue(value: any): any {
	if (value === null || value === undefined) return value;

	//@ts-ignore
	const JsonValueType = Windows.Data.Json.JsonValueType;

	try {
		switch (value.ValueType) {
			case JsonValueType.Null:
				return null;
			case JsonValueType.Boolean:
				return value.GetBoolean();
			case JsonValueType.Number:
				return value.GetNumber();
			case JsonValueType.String:
				return value.GetString();
			case JsonValueType.Array:
				return dataDeserialize(value.GetArray());
			case JsonValueType.Object:
				return dataDeserialize(value.GetObject());
			default:
				return value;
		}
	} catch {
		try {
			return JSON.parse(value.Stringify());
		} catch {
			return value;
		}
	}
}

export function dataDeserialize(data: any): any {
	if (data === null || typeof data !== 'object') {
		return data;
	}


	if (data instanceof Windows.Data.Json.JsonObject) {
		const obj: Record<string, any> = {};
		const iterator = data.First();
		try {
			while (iterator.HasCurrent) {
				const current = iterator.Current;

				obj[current.Key] = tryDeserializeJsonValue(current.Value)
				iterator.MoveNext();
			}
		} catch { }
		return obj;
	}

	if (data instanceof Windows.Data.Json.JsonArray) {
		const result: any[] = [];
		for (let i = 0; i < data.Size; i++) {
			result.push(tryDeserializeJsonValue(data.GetObjectAt(i) ?? data.GetAt(i)));
		}
		return result;
	}

	//@ts-ignore
	if (data instanceof Windows.Data.Json.JsonValue) {
		return tryDeserializeJsonValue(data);
	}



	if (
		//@ts-ignore
		data instanceof Windows.Foundation.Collections.IVector ||
		//@ts-ignore
		data instanceof Windows.Foundation.Collections.IVectorView
	) {
		const result = [];

		for (let i = 0; i < data.Size; i++) {
			result.push(dataDeserialize(data.GetAt(i)));
		}

		return result;
	}


	if (
		//@ts-ignore
		data instanceof Windows.Foundation.Collections.IMap ||
		//@ts-ignore
		data instanceof Windows.Foundation.Collections.IMapView
	) {
		const obj: Record<any, any> = {};

		const iterator = data.First();

		while (iterator.HasCurrent) {
			const current = iterator.Current;

			obj[current.Key] = dataDeserialize(current.Value);

			iterator.MoveNext();
		}

		return obj;
	}
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
