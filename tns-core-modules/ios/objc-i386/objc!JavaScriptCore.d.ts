
declare function JSCheckScriptSyntax(ctx: interop.Pointer, script: interop.Pointer, sourceURL: interop.Pointer, startingLineNumber: number, exception: interop.Reference<interop.Pointer>): boolean;

declare function JSClassCreate(definition: interop.Reference<JSClassDefinition>): interop.Pointer;

interface JSClassDefinition {
	version: number;
	attributes: number;
	className: string;
	parentClass: interop.Pointer;
	staticValues: interop.Reference<JSStaticValue>;
	staticFunctions: interop.Reference<JSStaticFunction>;
	initialize: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>;
	finalize: interop.FunctionReference<(p1: interop.Pointer) => void>;
	hasProperty: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => boolean>;
	getProperty: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: interop.Reference<interop.Pointer>) => interop.Pointer>;
	setProperty: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: interop.Pointer, p5: interop.Reference<interop.Pointer>) => boolean>;
	deleteProperty: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: interop.Reference<interop.Pointer>) => boolean>;
	getPropertyNames: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => void>;
	callAsFunction: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: number, p5: interop.Reference<interop.Pointer>, p6: interop.Reference<interop.Pointer>) => interop.Pointer>;
	callAsConstructor: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: interop.Reference<interop.Pointer>, p5: interop.Reference<interop.Pointer>) => interop.Pointer>;
	hasInstance: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: interop.Reference<interop.Pointer>) => boolean>;
	convertToType: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: JSType, p4: interop.Reference<interop.Pointer>) => interop.Pointer>;
}
declare var JSClassDefinition: interop.StructType<JSClassDefinition>;

declare function JSClassRelease(jsClass: interop.Pointer): void;

declare function JSClassRetain(jsClass: interop.Pointer): interop.Pointer;

declare class JSContext extends NSObject {

	static alloc(): JSContext; // inherited from NSObject

	static contextWithJSGlobalContextRef(jsGlobalContextRef: interop.Pointer): JSContext;

	static currentArguments(): NSArray<any>;

	static currentCallee(): JSValue;

	static currentContext(): JSContext;

	static currentThis(): JSValue;

	static new(): JSContext; // inherited from NSObject

	/* readonly */ JSGlobalContextRef: interop.Pointer;

	exception: JSValue;

	exceptionHandler: (p1: JSContext, p2: JSValue) => void;

	/* readonly */ globalObject: JSValue;

	name: string;

	/* readonly */ virtualMachine: JSVirtualMachine;

	constructor(); // inherited from NSObject

	constructor(o: { virtualMachine: JSVirtualMachine; });

	evaluateScript(script: string): JSValue;

	evaluateScriptWithSourceURL(script: string, sourceURL: NSURL): JSValue;

	objectForKeyedSubscript(key: any): JSValue;

	self(): JSContext; // inherited from NSObjectProtocol

	setObjectForKeyedSubscript(object: any, key: NSObject): void;
}

declare function JSContextGetGlobalContext(ctx: interop.Pointer): interop.Pointer;

declare function JSContextGetGlobalObject(ctx: interop.Pointer): interop.Pointer;

declare function JSContextGetGroup(ctx: interop.Pointer): interop.Pointer;

declare function JSContextGroupCreate(): interop.Pointer;

declare function JSContextGroupRelease(group: interop.Pointer): void;

declare function JSContextGroupRetain(group: interop.Pointer): interop.Pointer;

declare function JSEvaluateScript(ctx: interop.Pointer, script: interop.Pointer, thisObject: interop.Pointer, sourceURL: interop.Pointer, startingLineNumber: number, exception: interop.Reference<interop.Pointer>): interop.Pointer;

interface JSExport {
}
declare var JSExport: {

	prototype: JSExport;
};

declare function JSGarbageCollect(ctx: interop.Pointer): void;

declare function JSGlobalContextCopyName(ctx: interop.Pointer): interop.Pointer;

declare function JSGlobalContextCreate(globalObjectClass: interop.Pointer): interop.Pointer;

declare function JSGlobalContextCreateInGroup(group: interop.Pointer, globalObjectClass: interop.Pointer): interop.Pointer;

declare function JSGlobalContextRelease(ctx: interop.Pointer): void;

declare function JSGlobalContextRetain(ctx: interop.Pointer): interop.Pointer;

declare function JSGlobalContextSetName(ctx: interop.Pointer, name: interop.Pointer): void;

declare class JSManagedValue extends NSObject {

	static alloc(): JSManagedValue; // inherited from NSObject

	static managedValueWithValue(value: JSValue): JSManagedValue;

	static managedValueWithValueAndOwner(value: JSValue, owner: any): JSManagedValue;

	static new(): JSManagedValue; // inherited from NSObject

	/* readonly */ value: JSValue;

	constructor(); // inherited from NSObject

	constructor(o: { value: JSValue; });

	self(): JSManagedValue; // inherited from NSObjectProtocol
}

declare function JSObjectCallAsConstructor(ctx: interop.Pointer, object: interop.Pointer, argumentCount: number, _arguments: interop.Reference<interop.Pointer>, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectCallAsFunction(ctx: interop.Pointer, object: interop.Pointer, thisObject: interop.Pointer, argumentCount: number, _arguments: interop.Reference<interop.Pointer>, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectCopyPropertyNames(ctx: interop.Pointer, object: interop.Pointer): interop.Pointer;

declare function JSObjectDeleteProperty(ctx: interop.Pointer, object: interop.Pointer, propertyName: interop.Pointer, exception: interop.Reference<interop.Pointer>): boolean;

declare function JSObjectGetPrivate(object: interop.Pointer): interop.Pointer;

declare function JSObjectGetProperty(ctx: interop.Pointer, object: interop.Pointer, propertyName: interop.Pointer, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectGetPropertyAtIndex(ctx: interop.Pointer, object: interop.Pointer, propertyIndex: number, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectGetPrototype(ctx: interop.Pointer, object: interop.Pointer): interop.Pointer;

declare function JSObjectHasProperty(ctx: interop.Pointer, object: interop.Pointer, propertyName: interop.Pointer): boolean;

declare function JSObjectIsConstructor(ctx: interop.Pointer, object: interop.Pointer): boolean;

declare function JSObjectIsFunction(ctx: interop.Pointer, object: interop.Pointer): boolean;

declare function JSObjectMake(ctx: interop.Pointer, jsClass: interop.Pointer, data: interop.Pointer): interop.Pointer;

declare function JSObjectMakeArray(ctx: interop.Pointer, argumentCount: number, _arguments: interop.Reference<interop.Pointer>, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectMakeConstructor(ctx: interop.Pointer, jsClass: interop.Pointer, callAsConstructor: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: number, p4: interop.Reference<interop.Pointer>, p5: interop.Reference<interop.Pointer>) => interop.Pointer>): interop.Pointer;

declare function JSObjectMakeDate(ctx: interop.Pointer, argumentCount: number, _arguments: interop.Reference<interop.Pointer>, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectMakeError(ctx: interop.Pointer, argumentCount: number, _arguments: interop.Reference<interop.Pointer>, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectMakeFunction(ctx: interop.Pointer, name: interop.Pointer, parameterCount: number, parameterNames: interop.Reference<interop.Pointer>, body: interop.Pointer, sourceURL: interop.Pointer, startingLineNumber: number, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectMakeFunctionWithCallback(ctx: interop.Pointer, name: interop.Pointer, callAsFunction: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: number, p5: interop.Reference<interop.Pointer>, p6: interop.Reference<interop.Pointer>) => interop.Pointer>): interop.Pointer;

declare function JSObjectMakeRegExp(ctx: interop.Pointer, argumentCount: number, _arguments: interop.Reference<interop.Pointer>, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSObjectSetPrivate(object: interop.Pointer, data: interop.Pointer): boolean;

declare function JSObjectSetProperty(ctx: interop.Pointer, object: interop.Pointer, propertyName: interop.Pointer, value: interop.Pointer, attributes: number, exception: interop.Reference<interop.Pointer>): void;

declare function JSObjectSetPropertyAtIndex(ctx: interop.Pointer, object: interop.Pointer, propertyIndex: number, value: interop.Pointer, exception: interop.Reference<interop.Pointer>): void;

declare function JSObjectSetPrototype(ctx: interop.Pointer, object: interop.Pointer, value: interop.Pointer): void;

declare var JSPropertyDescriptorConfigurableKey: string;

declare var JSPropertyDescriptorEnumerableKey: string;

declare var JSPropertyDescriptorGetKey: string;

declare var JSPropertyDescriptorSetKey: string;

declare var JSPropertyDescriptorValueKey: string;

declare var JSPropertyDescriptorWritableKey: string;

declare function JSPropertyNameAccumulatorAddName(accumulator: interop.Pointer, propertyName: interop.Pointer): void;

declare function JSPropertyNameArrayGetCount(array: interop.Pointer): number;

declare function JSPropertyNameArrayGetNameAtIndex(array: interop.Pointer, index: number): interop.Pointer;

declare function JSPropertyNameArrayRelease(array: interop.Pointer): void;

declare function JSPropertyNameArrayRetain(array: interop.Pointer): interop.Pointer;

interface JSStaticFunction {
	name: string;
	callAsFunction: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: number, p5: interop.Reference<interop.Pointer>, p6: interop.Reference<interop.Pointer>) => interop.Pointer>;
	attributes: number;
}
declare var JSStaticFunction: interop.StructType<JSStaticFunction>;

interface JSStaticValue {
	name: string;
	getProperty: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: interop.Reference<interop.Pointer>) => interop.Pointer>;
	setProperty: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer, p4: interop.Pointer, p5: interop.Reference<interop.Pointer>) => boolean>;
	attributes: number;
}
declare var JSStaticValue: interop.StructType<JSStaticValue>;

declare function JSStringCopyCFString(alloc: any, string: interop.Pointer): string;

declare function JSStringCreateWithCFString(string: string): interop.Pointer;

declare function JSStringCreateWithCharacters(chars: interop.Reference<number>, numChars: number): interop.Pointer;

declare function JSStringCreateWithUTF8CString(string: string): interop.Pointer;

declare function JSStringGetCharactersPtr(string: interop.Pointer): interop.Reference<number>;

declare function JSStringGetLength(string: interop.Pointer): number;

declare function JSStringGetMaximumUTF8CStringSize(string: interop.Pointer): number;

declare function JSStringGetUTF8CString(string: interop.Pointer, buffer: string, bufferSize: number): number;

declare function JSStringIsEqual(a: interop.Pointer, b: interop.Pointer): boolean;

declare function JSStringIsEqualToUTF8CString(a: interop.Pointer, b: string): boolean;

declare function JSStringRelease(string: interop.Pointer): void;

declare function JSStringRetain(string: interop.Pointer): interop.Pointer;

declare const enum JSType {

	kJSTypeUndefined = 0,

	kJSTypeNull = 1,

	kJSTypeBoolean = 2,

	kJSTypeNumber = 3,

	kJSTypeString = 4,

	kJSTypeObject = 5
}

declare class JSValue extends NSObject {

	static alloc(): JSValue; // inherited from NSObject

	static new(): JSValue; // inherited from NSObject

	static valueWithBoolInContext(value: boolean, context: JSContext): JSValue;

	static valueWithDoubleInContext(value: number, context: JSContext): JSValue;

	static valueWithInt32InContext(value: number, context: JSContext): JSValue;

	static valueWithJSValueRefInContext(value: interop.Pointer, context: JSContext): JSValue;

	static valueWithNewArrayInContext(context: JSContext): JSValue;

	static valueWithNewErrorFromMessageInContext(message: string, context: JSContext): JSValue;

	static valueWithNewObjectInContext(context: JSContext): JSValue;

	static valueWithNewRegularExpressionFromPatternFlagsInContext(pattern: string, flags: string, context: JSContext): JSValue;

	static valueWithNullInContext(context: JSContext): JSValue;

	static valueWithObjectInContext(value: any, context: JSContext): JSValue;

	static valueWithPointInContext(point: CGPoint, context: JSContext): JSValue;

	static valueWithRangeInContext(range: NSRange, context: JSContext): JSValue;

	static valueWithRectInContext(rect: CGRect, context: JSContext): JSValue;

	static valueWithSizeInContext(size: CGSize, context: JSContext): JSValue;

	static valueWithUInt32InContext(value: number, context: JSContext): JSValue;

	static valueWithUndefinedInContext(context: JSContext): JSValue;

	/* readonly */ JSValueRef: interop.Pointer;

	/* readonly */ context: JSContext;

	/* readonly */ isArray: boolean;

	/* readonly */ isBoolean: boolean;

	/* readonly */ isDate: boolean;

	/* readonly */ isNull: boolean;

	/* readonly */ isNumber: boolean;

	/* readonly */ isObject: boolean;

	/* readonly */ isString: boolean;

	/* readonly */ isUndefined: boolean;
	[index: number]: JSValue;

	constructor(); // inherited from NSObject

	callWithArguments(_arguments: NSArray<any>): JSValue;

	constructWithArguments(_arguments: NSArray<any>): JSValue;

	definePropertyDescriptor(property: string, descriptor: any): void;

	deleteProperty(property: string): boolean;

	hasProperty(property: string): boolean;

	invokeMethodWithArguments(method: string, _arguments: NSArray<any>): JSValue;

	isEqualToObject(value: any): boolean;

	isEqualWithTypeCoercionToObject(value: any): boolean;

	isInstanceOf(value: any): boolean;

	objectAtIndexedSubscript(index: number): JSValue;

	objectForKeyedSubscript(key: any): JSValue;

	self(): JSValue; // inherited from NSObjectProtocol

	setObjectAtIndexedSubscript(object: any, index: number): void;

	setObjectForKeyedSubscript(object: any, key: NSObject): void;

	setValueAtIndex(value: any, index: number): void;

	setValueForProperty(value: any, property: string): void;

	toArray(): NSArray<any>;

	toBool(): boolean;

	toDate(): Date;

	toDictionary(): NSDictionary<any, any>;

	toDouble(): number;

	toInt32(): number;

	toNumber(): number;

	toObject(): any;

	toObjectOfClass(expectedClass: typeof NSObject): any;

	toPoint(): CGPoint;

	toRange(): NSRange;

	toRect(): CGRect;

	toSize(): CGSize;

	toString(): string;

	toUInt32(): number;

	valueAtIndex(index: number): JSValue;

	valueForProperty(property: string): JSValue;
}

declare function JSValueCreateJSONString(ctx: interop.Pointer, value: interop.Pointer, indent: number, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSValueGetType(ctx: interop.Pointer, p2: interop.Pointer): JSType;

declare function JSValueIsArray(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsBoolean(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsDate(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsEqual(ctx: interop.Pointer, a: interop.Pointer, b: interop.Pointer, exception: interop.Reference<interop.Pointer>): boolean;

declare function JSValueIsInstanceOfConstructor(ctx: interop.Pointer, value: interop.Pointer, constructor: interop.Pointer, exception: interop.Reference<interop.Pointer>): boolean;

declare function JSValueIsNull(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsNumber(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsObject(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsObjectOfClass(ctx: interop.Pointer, value: interop.Pointer, jsClass: interop.Pointer): boolean;

declare function JSValueIsStrictEqual(ctx: interop.Pointer, a: interop.Pointer, b: interop.Pointer): boolean;

declare function JSValueIsString(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueIsUndefined(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueMakeBoolean(ctx: interop.Pointer, boolean: boolean): interop.Pointer;

declare function JSValueMakeFromJSONString(ctx: interop.Pointer, string: interop.Pointer): interop.Pointer;

declare function JSValueMakeNull(ctx: interop.Pointer): interop.Pointer;

declare function JSValueMakeNumber(ctx: interop.Pointer, number: number): interop.Pointer;

declare function JSValueMakeString(ctx: interop.Pointer, string: interop.Pointer): interop.Pointer;

declare function JSValueMakeUndefined(ctx: interop.Pointer): interop.Pointer;

declare function JSValueProtect(ctx: interop.Pointer, value: interop.Pointer): void;

declare function JSValueToBoolean(ctx: interop.Pointer, value: interop.Pointer): boolean;

declare function JSValueToNumber(ctx: interop.Pointer, value: interop.Pointer, exception: interop.Reference<interop.Pointer>): number;

declare function JSValueToObject(ctx: interop.Pointer, value: interop.Pointer, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSValueToStringCopy(ctx: interop.Pointer, value: interop.Pointer, exception: interop.Reference<interop.Pointer>): interop.Pointer;

declare function JSValueUnprotect(ctx: interop.Pointer, value: interop.Pointer): void;

declare class JSVirtualMachine extends NSObject {

	static alloc(): JSVirtualMachine; // inherited from NSObject

	static new(): JSVirtualMachine; // inherited from NSObject

	constructor(); // inherited from NSObject

	addManagedReferenceWithOwner(object: any, owner: any): void;

	removeManagedReferenceWithOwner(object: any, owner: any): void;

	self(): JSVirtualMachine; // inherited from NSObjectProtocol
}

declare var kJSClassDefinitionEmpty: JSClassDefinition;
