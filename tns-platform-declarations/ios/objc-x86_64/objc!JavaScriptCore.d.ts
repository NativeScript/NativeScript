
declare function JSCheckScriptSyntax(ctx: interop.Pointer | interop.Reference<any>, script: interop.Pointer | interop.Reference<any>, sourceURL: interop.Pointer | interop.Reference<any>, startingLineNumber: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function JSClassCreate(definition: interop.Pointer | interop.Reference<JSClassDefinition>): interop.Pointer | interop.Reference<any>;

interface JSClassDefinition {
	version: number;
	attributes: number;
	className: string;
	parentClass: interop.Pointer | interop.Reference<any>;
	staticValues: interop.Pointer | interop.Reference<JSStaticValue>;
	staticFunctions: interop.Pointer | interop.Reference<JSStaticFunction>;
	initialize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	finalize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	hasProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => boolean>;
	getProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>;
	setProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => boolean>;
	deleteProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => boolean>;
	getPropertyNames: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => void>;
	callAsFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any>>, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>;
	callAsConstructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Reference<interop.Pointer | interop.Reference<any>>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>;
	hasInstance: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => boolean>;
	convertToType: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: JSType, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>;
}
declare var JSClassDefinition: interop.StructType<JSClassDefinition>;

declare function JSClassRelease(jsClass: interop.Pointer | interop.Reference<any>): void;

declare function JSClassRetain(jsClass: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare class JSContext extends NSObject {

	static alloc(): JSContext; // inherited from NSObject

	static contextWithJSGlobalContextRef(jsGlobalContextRef: interop.Pointer | interop.Reference<any>): JSContext;

	static currentArguments(): NSArray<any>;

	static currentCallee(): JSValue;

	static currentContext(): JSContext;

	static currentThis(): JSValue;

	static new(): JSContext; // inherited from NSObject

	readonly JSGlobalContextRef: interop.Pointer | interop.Reference<any>;

	exception: JSValue;

	exceptionHandler: (p1: JSContext, p2: JSValue) => void;

	readonly globalObject: JSValue;

	name: string;

	readonly virtualMachine: JSVirtualMachine;

	constructor(o: { virtualMachine: JSVirtualMachine; });

	evaluateScript(script: string): JSValue;

	evaluateScriptWithSourceURL(script: string, sourceURL: NSURL): JSValue;

	initWithVirtualMachine(virtualMachine: JSVirtualMachine): this;

	objectForKeyedSubscript(key: any): JSValue;

	setObjectForKeyedSubscript(object: any, key: NSObject): void;
}

declare function JSContextGetGlobalContext(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSContextGetGlobalObject(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSContextGetGroup(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSContextGroupCreate(): interop.Pointer | interop.Reference<any>;

declare function JSContextGroupRelease(group: interop.Pointer | interop.Reference<any>): void;

declare function JSContextGroupRetain(group: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSEvaluateScript(ctx: interop.Pointer | interop.Reference<any>, script: interop.Pointer | interop.Reference<any>, thisObject: interop.Pointer | interop.Reference<any>, sourceURL: interop.Pointer | interop.Reference<any>, startingLineNumber: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

interface JSExport {
}
declare var JSExport: {

	prototype: JSExport;
};

declare function JSGarbageCollect(ctx: interop.Pointer | interop.Reference<any>): void;

declare function JSGlobalContextCopyName(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSGlobalContextCreate(globalObjectClass: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSGlobalContextCreateInGroup(group: interop.Pointer | interop.Reference<any>, globalObjectClass: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSGlobalContextRelease(ctx: interop.Pointer | interop.Reference<any>): void;

declare function JSGlobalContextRetain(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSGlobalContextSetName(ctx: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<any>): void;

declare class JSManagedValue extends NSObject {

	static alloc(): JSManagedValue; // inherited from NSObject

	static managedValueWithValue(value: JSValue): JSManagedValue;

	static managedValueWithValueAndOwner(value: JSValue, owner: any): JSManagedValue;

	static new(): JSManagedValue; // inherited from NSObject

	readonly value: JSValue;

	constructor(o: { value: JSValue; });

	initWithValue(value: JSValue): this;
}

declare function JSObjectCallAsConstructor(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectCallAsFunction(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, thisObject: interop.Pointer | interop.Reference<any>, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectCopyPropertyNames(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSObjectDeleteProperty(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyName: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function JSObjectDeletePropertyForKey(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyKey: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function JSObjectGetArrayBufferByteLength(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function JSObjectGetArrayBufferBytesPtr(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetPrivate(object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetProperty(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyName: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetPropertyAtIndex(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyIndex: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetPropertyForKey(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyKey: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetPrototype(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetTypedArrayBuffer(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetTypedArrayByteLength(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function JSObjectGetTypedArrayByteOffset(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function JSObjectGetTypedArrayBytesPtr(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectGetTypedArrayLength(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function JSObjectHasProperty(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyName: interop.Pointer | interop.Reference<any>): boolean;

declare function JSObjectHasPropertyForKey(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyKey: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function JSObjectIsConstructor(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>): boolean;

declare function JSObjectIsFunction(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>): boolean;

declare function JSObjectMake(ctx: interop.Pointer | interop.Reference<any>, jsClass: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeArray(ctx: interop.Pointer | interop.Reference<any>, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeArrayBufferWithBytesNoCopy(ctx: interop.Pointer | interop.Reference<any>, bytes: interop.Pointer | interop.Reference<any>, byteLength: number, bytesDeallocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, deallocatorContext: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeConstructor(ctx: interop.Pointer | interop.Reference<any>, jsClass: interop.Pointer | interop.Reference<any>, callAsConstructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Reference<interop.Pointer | interop.Reference<any>>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeDate(ctx: interop.Pointer | interop.Reference<any>, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeDeferredPromise(ctx: interop.Pointer | interop.Reference<any>, resolve: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, reject: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeError(ctx: interop.Pointer | interop.Reference<any>, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeFunction(ctx: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<any>, parameterCount: number, parameterNames: interop.Reference<interop.Pointer | interop.Reference<any>>, body: interop.Pointer | interop.Reference<any>, sourceURL: interop.Pointer | interop.Reference<any>, startingLineNumber: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeFunctionWithCallback(ctx: interop.Pointer | interop.Reference<any>, name: interop.Pointer | interop.Reference<any>, callAsFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any>>, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeRegExp(ctx: interop.Pointer | interop.Reference<any>, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any>>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeTypedArray(ctx: interop.Pointer | interop.Reference<any>, arrayType: JSTypedArrayType, length: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeTypedArrayWithArrayBuffer(ctx: interop.Pointer | interop.Reference<any>, arrayType: JSTypedArrayType, buffer: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeTypedArrayWithArrayBufferAndOffset(ctx: interop.Pointer | interop.Reference<any>, arrayType: JSTypedArrayType, buffer: interop.Pointer | interop.Reference<any>, byteOffset: number, length: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectMakeTypedArrayWithBytesNoCopy(ctx: interop.Pointer | interop.Reference<any>, arrayType: JSTypedArrayType, bytes: interop.Pointer | interop.Reference<any>, byteLength: number, bytesDeallocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, deallocatorContext: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSObjectSetPrivate(object: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): boolean;

declare function JSObjectSetProperty(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyName: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, attributes: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function JSObjectSetPropertyAtIndex(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyIndex: number, value: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function JSObjectSetPropertyForKey(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, propertyKey: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, attributes: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function JSObjectSetPrototype(ctx: interop.Pointer | interop.Reference<any>, object: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare var JSPropertyDescriptorConfigurableKey: string;

declare var JSPropertyDescriptorEnumerableKey: string;

declare var JSPropertyDescriptorGetKey: string;

declare var JSPropertyDescriptorSetKey: string;

declare var JSPropertyDescriptorValueKey: string;

declare var JSPropertyDescriptorWritableKey: string;

declare function JSPropertyNameAccumulatorAddName(accumulator: interop.Pointer | interop.Reference<any>, propertyName: interop.Pointer | interop.Reference<any>): void;

declare function JSPropertyNameArrayGetCount(array: interop.Pointer | interop.Reference<any>): number;

declare function JSPropertyNameArrayGetNameAtIndex(array: interop.Pointer | interop.Reference<any>, index: number): interop.Pointer | interop.Reference<any>;

declare function JSPropertyNameArrayRelease(array: interop.Pointer | interop.Reference<any>): void;

declare function JSPropertyNameArrayRetain(array: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

interface JSStaticFunction {
	name: string;
	callAsFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any>>, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>;
	attributes: number;
}
declare var JSStaticFunction: interop.StructType<JSStaticFunction>;

interface JSStaticValue {
	name: string;
	getProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => interop.Pointer | interop.Reference<any>>;
	setProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => boolean>;
	attributes: number;
}
declare var JSStaticValue: interop.StructType<JSStaticValue>;

declare function JSStringCopyCFString(alloc: any, string: interop.Pointer | interop.Reference<any>): string;

declare function JSStringCreateWithCFString(string: string): interop.Pointer | interop.Reference<any>;

declare function JSStringCreateWithCharacters(chars: interop.Pointer | interop.Reference<number>, numChars: number): interop.Pointer | interop.Reference<any>;

declare function JSStringCreateWithUTF8CString(string: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSStringGetCharactersPtr(string: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<number>;

declare function JSStringGetLength(string: interop.Pointer | interop.Reference<any>): number;

declare function JSStringGetMaximumUTF8CStringSize(string: interop.Pointer | interop.Reference<any>): number;

declare function JSStringGetUTF8CString(string: interop.Pointer | interop.Reference<any>, buffer: string | interop.Pointer | interop.Reference<any>, bufferSize: number): number;

declare function JSStringIsEqual(a: interop.Pointer | interop.Reference<any>, b: interop.Pointer | interop.Reference<any>): boolean;

declare function JSStringIsEqualToUTF8CString(a: interop.Pointer | interop.Reference<any>, b: string | interop.Pointer | interop.Reference<any>): boolean;

declare function JSStringRelease(string: interop.Pointer | interop.Reference<any>): void;

declare function JSStringRetain(string: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum JSType {

	kJSTypeUndefined = 0,

	kJSTypeNull = 1,

	kJSTypeBoolean = 2,

	kJSTypeNumber = 3,

	kJSTypeString = 4,

	kJSTypeObject = 5,

	kJSTypeSymbol = 6
}

declare const enum JSTypedArrayType {

	kJSTypedArrayTypeInt8Array = 0,

	kJSTypedArrayTypeInt16Array = 1,

	kJSTypedArrayTypeInt32Array = 2,

	kJSTypedArrayTypeUint8Array = 3,

	kJSTypedArrayTypeUint8ClampedArray = 4,

	kJSTypedArrayTypeUint16Array = 5,

	kJSTypedArrayTypeUint32Array = 6,

	kJSTypedArrayTypeFloat32Array = 7,

	kJSTypedArrayTypeFloat64Array = 8,

	kJSTypedArrayTypeArrayBuffer = 9,

	kJSTypedArrayTypeNone = 10
}

declare class JSValue extends NSObject {

	static alloc(): JSValue; // inherited from NSObject

	static new(): JSValue; // inherited from NSObject

	static valueWithBoolInContext(value: boolean, context: JSContext): JSValue;

	static valueWithDoubleInContext(value: number, context: JSContext): JSValue;

	static valueWithInt32InContext(value: number, context: JSContext): JSValue;

	static valueWithJSValueRefInContext(value: interop.Pointer | interop.Reference<any>, context: JSContext): JSValue;

	static valueWithNewArrayInContext(context: JSContext): JSValue;

	static valueWithNewErrorFromMessageInContext(message: string, context: JSContext): JSValue;

	static valueWithNewObjectInContext(context: JSContext): JSValue;

	static valueWithNewPromiseInContextFromExecutor(context: JSContext, callback: (p1: JSValue, p2: JSValue) => void): JSValue;

	static valueWithNewPromiseRejectedWithReasonInContext(reason: any, context: JSContext): JSValue;

	static valueWithNewPromiseResolvedWithResultInContext(result: any, context: JSContext): JSValue;

	static valueWithNewRegularExpressionFromPatternFlagsInContext(pattern: string, flags: string, context: JSContext): JSValue;

	static valueWithNewSymbolFromDescriptionInContext(description: string, context: JSContext): JSValue;

	static valueWithNullInContext(context: JSContext): JSValue;

	static valueWithObjectInContext(value: any, context: JSContext): JSValue;

	static valueWithPointInContext(point: CGPoint, context: JSContext): JSValue;

	static valueWithRangeInContext(range: NSRange, context: JSContext): JSValue;

	static valueWithRectInContext(rect: CGRect, context: JSContext): JSValue;

	static valueWithSizeInContext(size: CGSize, context: JSContext): JSValue;

	static valueWithUInt32InContext(value: number, context: JSContext): JSValue;

	static valueWithUndefinedInContext(context: JSContext): JSValue;

	readonly JSValueRef: interop.Pointer | interop.Reference<any>;

	readonly context: JSContext;

	readonly isArray: boolean;

	readonly isBoolean: boolean;

	readonly isDate: boolean;

	readonly isNull: boolean;

	readonly isNumber: boolean;

	readonly isObject: boolean;

	readonly isString: boolean;

	readonly isSymbol: boolean;

	readonly isUndefined: boolean;
	[index: number]: JSValue;

	callWithArguments(_arguments: NSArray<any> | any[]): JSValue;

	constructWithArguments(_arguments: NSArray<any> | any[]): JSValue;

	definePropertyDescriptor(property: string, descriptor: any): void;

	deleteProperty(property: string): boolean;

	hasProperty(property: string): boolean;

	invokeMethodWithArguments(method: string, _arguments: NSArray<any> | any[]): JSValue;

	isEqualToObject(value: any): boolean;

	isEqualWithTypeCoercionToObject(value: any): boolean;

	isInstanceOf(value: any): boolean;

	objectAtIndexedSubscript(index: number): JSValue;

	objectForKeyedSubscript(key: any): JSValue;

	setObjectAtIndexedSubscript(object: any, index: number): void;

	setObjectForKeyedSubscript(object: any, key: any): void;

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

declare function JSValueCreateJSONString(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, indent: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSValueGetType(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): JSType;

declare function JSValueGetTypedArrayType(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): JSTypedArrayType;

declare function JSValueIsArray(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsBoolean(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsDate(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsEqual(ctx: interop.Pointer | interop.Reference<any>, a: interop.Pointer | interop.Reference<any>, b: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function JSValueIsInstanceOfConstructor(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, constructor: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function JSValueIsNull(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsNumber(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsObject(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsObjectOfClass(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, jsClass: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsStrictEqual(ctx: interop.Pointer | interop.Reference<any>, a: interop.Pointer | interop.Reference<any>, b: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsString(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsSymbol(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueIsUndefined(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueMakeBoolean(ctx: interop.Pointer | interop.Reference<any>, boolean: boolean): interop.Pointer | interop.Reference<any>;

declare function JSValueMakeFromJSONString(ctx: interop.Pointer | interop.Reference<any>, string: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSValueMakeNull(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSValueMakeNumber(ctx: interop.Pointer | interop.Reference<any>, number: number): interop.Pointer | interop.Reference<any>;

declare function JSValueMakeString(ctx: interop.Pointer | interop.Reference<any>, string: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSValueMakeSymbol(ctx: interop.Pointer | interop.Reference<any>, description: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSValueMakeUndefined(ctx: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function JSValueProtect(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function JSValueToBoolean(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function JSValueToNumber(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function JSValueToObject(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSValueToStringCopy(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function JSValueUnprotect(ctx: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare class JSVirtualMachine extends NSObject {

	static alloc(): JSVirtualMachine; // inherited from NSObject

	static new(): JSVirtualMachine; // inherited from NSObject

	addManagedReferenceWithOwner(object: any, owner: any): void;

	removeManagedReferenceWithOwner(object: any, owner: any): void;
}

declare const kJSClassAttributeNoAutomaticPrototype: number;

declare const kJSClassAttributeNone: number;

declare var kJSClassDefinitionEmpty: JSClassDefinition;

declare const kJSPropertyAttributeDontDelete: number;

declare const kJSPropertyAttributeDontEnum: number;

declare const kJSPropertyAttributeNone: number;

declare const kJSPropertyAttributeReadOnly: number;
