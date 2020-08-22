export function isString(value: any): boolean {
	return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any): boolean {
	return typeof value === 'number' || value instanceof Number;
}

export function isBoolean(value: any): boolean {
	return typeof value === 'boolean' || value instanceof Boolean;
}

export function isFunction(value: any): boolean {
	if (!value) {
		return false;
	}

	return typeof value === 'function';
}

export function isObject(value: any): boolean {
	if (!value) {
		return false;
	}

	return typeof value === 'object';
}

export function isUndefined(value: any): boolean {
	return typeof value === 'undefined';
}

export function isDefined(value: any): boolean {
	return typeof value !== 'undefined';
}

export function isNullOrUndefined(value: any): boolean {
	return typeof value === 'undefined' || value === null;
}

export function verifyCallback(value: any) {
	if (value && !isFunction(value)) {
		throw new TypeError('Callback must be a valid function.');
	}
}

const classInfosMap = new Map<Function, ClassInfo>();

// ES3-5 type classes are "function blah()", new ES6+ classes can be "class blah"
const funcNameRegex = /(?:function|class)\s+(\w+).*/;
export function getClass(object: Object): string {
	return getClassInfo(object).name;
}

export function getClassInfo(object: Object): ClassInfo {
	const constructor = object.constructor;

	let result = classInfosMap.get(constructor);
	if (!result) {
		result = new ClassInfo(constructor);
		classInfosMap.set(constructor, result);
	}

	return result;
}

export function getBaseClasses(object): Array<string> {
	const result = [];
	let info = getClassInfo(object);
	while (info) {
		result.push(info.name);
		info = info.baseClassInfo;
	}

	return result;
}

export class ClassInfo {
	private _typeConstructor: Function;
	private _name: string;
	private _baseClassInfo: ClassInfo;

	constructor(typeConstructor: Function) {
		this._typeConstructor = typeConstructor;
	}

	get name(): string {
		if (!this._name) {
			if (this._typeConstructor.name) {
				this._name = this._typeConstructor.name;
			} else {
				const results = funcNameRegex.exec(this._typeConstructor.toString());
				this._name = results && results.length > 1 ? results[1] : '';
			}
		}

		return this._name;
	}

	get baseClassInfo(): ClassInfo {
		if (isUndefined(this._baseClassInfo)) {
			this._baseClassInfo = ClassInfo._getBase(this);

			// While extending some classes for platform specific versions results in duplicate class types in hierarchy.
			if (this._baseClassInfo && this._baseClassInfo.name === this.name) {
				this._baseClassInfo = ClassInfo._getBase(this._baseClassInfo);
			}
		}

		return this._baseClassInfo;
	}

	private static _getBase(info: ClassInfo): ClassInfo {
		let result = null;
		const constructorProto = info._typeConstructor.prototype;
		if (constructorProto.__proto__) {
			result = getClassInfo(constructorProto.__proto__);
		}

		return result;
	}
}

export function toUIString(obj): string {
	return isNullOrUndefined(obj) ? '' : obj + '';
}
