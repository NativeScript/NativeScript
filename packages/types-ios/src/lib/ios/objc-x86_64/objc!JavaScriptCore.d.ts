
/**
 * @since 18.0
 */
declare function JSBigIntCreateWithDouble(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 18.0
 */
declare function JSBigIntCreateWithInt64(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, integer: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 18.0
 */
declare function JSBigIntCreateWithString(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 18.0
 */
declare function JSBigIntCreateWithUInt64(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, integer: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSCheckScriptSyntax(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, script: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceURL: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, startingLineNumber: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSClassCreate(definition: interop.Pointer | interop.Reference<JSClassDefinition> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

interface JSClassDefinition {
	version: number;
	attributes: number;
	className: interop.Pointer | interop.Reference<any> | null;
	parentClass: interop.Pointer | interop.Reference<any> | null;
	staticValues: interop.Pointer | interop.Reference<JSStaticValue> | null;
	staticFunctions: interop.Pointer | interop.Reference<JSStaticFunction> | null;
	initialize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>;
	finalize: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null) => void>;
	hasProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => boolean>;
	getProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>;
	setProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => boolean>;
	deleteProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => boolean>;
	getPropertyNames: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null) => void>;
	callAsFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any> | null>, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>;
	callAsConstructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Reference<interop.Pointer | interop.Reference<any> | null>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>;
	hasInstance: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => boolean>;
	convertToType: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: JSType, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>;
}
declare var JSClassDefinition: interop.StructType<JSClassDefinition>;

declare function JSClassRelease(jsClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSClassRetain(jsClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare class JSContext extends NSObject {

	static alloc(): JSContext; // inherited from NSObject

	static contextWithJSGlobalContextRef(jsGlobalContextRef: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): JSContext;

	static currentArguments(): NSArray<any>;

	/**
	 * @since 8.0
	 */
	static currentCallee(): JSValue;

	static currentContext(): JSContext;

	static currentThis(): JSValue;

	static new(): JSContext; // inherited from NSObject

	readonly JSGlobalContextRef: interop.Pointer | interop.Reference<any> | null;

	exception: JSValue;

	exceptionHandler: (p1: JSContext, p2: JSValue) => void;

	readonly globalObject: JSValue;

	/**
	 * @since 16.4
	 */
	inspectable: boolean;

	/**
	 * @since 8.0
	 */
	name: string;

	readonly virtualMachine: JSVirtualMachine;

	constructor(o: { virtualMachine: JSVirtualMachine; });

	evaluateScript(script: string): JSValue;

	/**
	 * @since 8.0
	 */
	evaluateScriptWithSourceURL(script: string, sourceURL: NSURL): JSValue;

	initWithVirtualMachine(virtualMachine: JSVirtualMachine): this;

	objectForKeyedSubscript(key: any): JSValue;

	setObjectForKeyedSubscript(object: any, key: NSObject): void;
}

/**
 * @since 7.0
 */
declare function JSContextGetGlobalContext(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSContextGetGlobalObject(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSContextGetGroup(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSContextGroupCreate(): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSContextGroupRelease(group: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 7.0
 */
declare function JSContextGroupRetain(group: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSEvaluateScript(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, script: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, thisObject: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceURL: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, startingLineNumber: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

interface JSExport {
}
declare var JSExport: {

	prototype: JSExport;
};

declare function JSGarbageCollect(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 8.0
 */
declare function JSGlobalContextCopyName(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSGlobalContextCreate(globalObjectClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSGlobalContextCreateInGroup(group: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, globalObjectClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 16.4
 */
declare function JSGlobalContextIsInspectable(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSGlobalContextRelease(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSGlobalContextRetain(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 16.4
 */
declare function JSGlobalContextSetInspectable(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, inspectable: boolean): void;

/**
 * @since 8.0
 */
declare function JSGlobalContextSetName(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, name: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 7.0
 */
declare class JSManagedValue extends NSObject {

	static alloc(): JSManagedValue; // inherited from NSObject

	static managedValueWithValue(value: JSValue): JSManagedValue;

	/**
	 * @since 8.0
	 */
	static managedValueWithValueAndOwner(value: JSValue, owner: any): JSManagedValue;

	static new(): JSManagedValue; // inherited from NSObject

	readonly value: JSValue;

	constructor(o: { value: JSValue; });

	initWithValue(value: JSValue): this;
}

declare function JSObjectCallAsConstructor(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any> | null>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectCallAsFunction(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, thisObject: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any> | null>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectCopyPropertyNames(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectDeleteProperty(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 13.0
 */
declare function JSObjectDeletePropertyForKey(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyKey: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 10.0
 */
declare function JSObjectGetArrayBufferByteLength(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function JSObjectGetArrayBufferBytesPtr(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectGetPrivate(object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectGetProperty(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectGetPropertyAtIndex(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyIndex: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 13.0
 */
declare function JSObjectGetPropertyForKey(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyKey: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectGetPrototype(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectGetTypedArrayBuffer(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectGetTypedArrayByteLength(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function JSObjectGetTypedArrayByteOffset(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 10.0
 */
declare function JSObjectGetTypedArrayBytesPtr(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectGetTypedArrayLength(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSObjectHasProperty(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 13.0
 */
declare function JSObjectHasPropertyForKey(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyKey: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSObjectIsConstructor(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSObjectIsFunction(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSObjectMake(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, jsClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSObjectMakeArray(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any> | null>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectMakeArrayBufferWithBytesNoCopy(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, bytes: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, byteLength: number, bytesDeallocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>, deallocatorContext: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectMakeConstructor(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, jsClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, callAsConstructor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: number, p4: interop.Reference<interop.Pointer | interop.Reference<any> | null>, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSObjectMakeDate(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any> | null>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 13.0
 */
declare function JSObjectMakeDeferredPromise(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, resolve: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, reject: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSObjectMakeError(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any> | null>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectMakeFunction(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, name: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, parameterCount: number, parameterNames: interop.Reference<interop.Pointer | interop.Reference<any> | null>, body: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, sourceURL: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, startingLineNumber: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectMakeFunctionWithCallback(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, name: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, callAsFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any> | null>, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSObjectMakeRegExp(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, argumentCount: number, _arguments: interop.Reference<interop.Pointer | interop.Reference<any> | null>, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectMakeTypedArray(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, arrayType: JSTypedArrayType, length: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectMakeTypedArrayWithArrayBuffer(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, arrayType: JSTypedArrayType, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectMakeTypedArrayWithArrayBufferAndOffset(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, arrayType: JSTypedArrayType, buffer: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, byteOffset: number, length: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function JSObjectMakeTypedArrayWithBytesNoCopy(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, arrayType: JSTypedArrayType, bytes: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, byteLength: number, bytesDeallocator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null) => void>, deallocatorContext: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSObjectSetPrivate(object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSObjectSetProperty(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attributes: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSObjectSetPropertyAtIndex(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyIndex: number, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 13.0
 */
declare function JSObjectSetPropertyForKey(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyKey: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attributes: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSObjectSetPrototype(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, object: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare var JSPropertyDescriptorConfigurableKey: string;

declare var JSPropertyDescriptorEnumerableKey: string;

declare var JSPropertyDescriptorGetKey: string;

declare var JSPropertyDescriptorSetKey: string;

declare var JSPropertyDescriptorValueKey: string;

declare var JSPropertyDescriptorWritableKey: string;

declare function JSPropertyNameAccumulatorAddName(accumulator: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, propertyName: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSPropertyNameArrayGetCount(array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSPropertyNameArrayGetNameAtIndex(array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, index: number): interop.Pointer | interop.Reference<any> | null;

declare function JSPropertyNameArrayRelease(array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSPropertyNameArrayRetain(array: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 18.0
 */
declare const enum JSRelationCondition {

	kJSRelationConditionUndefined = 0,

	kJSRelationConditionEqual = 1,

	kJSRelationConditionGreaterThan = 2,

	kJSRelationConditionLessThan = 3
}

interface JSStaticFunction {
	name: interop.Pointer | interop.Reference<any> | null;
	callAsFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: number, p5: interop.Reference<interop.Pointer | interop.Reference<any> | null>, p6: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>;
	attributes: number;
}
declare var JSStaticFunction: interop.StructType<JSStaticFunction>;

interface JSStaticValue {
	name: interop.Pointer | interop.Reference<any> | null;
	getProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => interop.Pointer | interop.Reference<any> | null>;
	setProperty: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<any> | null, p3: interop.Pointer | interop.Reference<any> | null, p4: interop.Pointer | interop.Reference<any> | null, p5: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null) => boolean>;
	attributes: number;
}
declare var JSStaticValue: interop.StructType<JSStaticValue>;

declare function JSStringCopyCFString(alloc: any, string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string;

declare function JSStringCreateWithCFString(string: string): interop.Pointer | interop.Reference<any> | null;

declare function JSStringCreateWithCharacters(chars: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, numChars: number): interop.Pointer | interop.Reference<any> | null;

declare function JSStringCreateWithUTF8CString(string: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSStringGetCharactersPtr(string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<number> | null;

declare function JSStringGetLength(string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSStringGetMaximumUTF8CStringSize(string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSStringGetUTF8CString(string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, buffer: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, bufferSize: number): number;

declare function JSStringIsEqual(a: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSStringIsEqualToUTF8CString(a: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, b: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSStringRelease(string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSStringRetain(string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare const enum JSType {

	kJSTypeUndefined = 0,

	kJSTypeNull = 1,

	kJSTypeBoolean = 2,

	kJSTypeNumber = 3,

	kJSTypeString = 4,

	kJSTypeObject = 5,

	kJSTypeSymbol = 6,

	kJSTypeBigInt = 7
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

	kJSTypedArrayTypeNone = 10,

	kJSTypedArrayTypeBigInt64Array = 11,

	kJSTypedArrayTypeBigUint64Array = 12
}

/**
 * @since 7.0
 */
declare class JSValue extends NSObject {

	static alloc(): JSValue; // inherited from NSObject

	static new(): JSValue; // inherited from NSObject

	static valueWithBoolInContext(value: boolean, context: JSContext): JSValue;

	static valueWithDoubleInContext(value: number, context: JSContext): JSValue;

	static valueWithInt32InContext(value: number, context: JSContext): JSValue;

	static valueWithJSValueRefInContext(value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, context: JSContext): JSValue;

	static valueWithNewArrayInContext(context: JSContext): JSValue;

	/**
	 * @since 18.0
	 */
	static valueWithNewBigIntFromDoubleInContext(value: number, context: JSContext): JSValue | null;

	/**
	 * @since 18.0
	 */
	static valueWithNewBigIntFromInt64InContext(int64: number, context: JSContext): JSValue | null;

	/**
	 * @since 18.0
	 */
	static valueWithNewBigIntFromStringInContext(string: string, context: JSContext): JSValue | null;

	/**
	 * @since 18.0
	 */
	static valueWithNewBigIntFromUInt64InContext(uint64: number, context: JSContext): JSValue | null;

	static valueWithNewErrorFromMessageInContext(message: string, context: JSContext): JSValue;

	static valueWithNewObjectInContext(context: JSContext): JSValue;

	/**
	 * @since 13.0
	 */
	static valueWithNewPromiseInContextFromExecutor(context: JSContext, callback: (p1: JSValue, p2: JSValue) => void): JSValue;

	/**
	 * @since 13.0
	 */
	static valueWithNewPromiseRejectedWithReasonInContext(reason: any, context: JSContext): JSValue;

	/**
	 * @since 13.0
	 */
	static valueWithNewPromiseResolvedWithResultInContext(result: any, context: JSContext): JSValue;

	static valueWithNewRegularExpressionFromPatternFlagsInContext(pattern: string, flags: string, context: JSContext): JSValue;

	/**
	 * @since 13.0
	 */
	static valueWithNewSymbolFromDescriptionInContext(description: string, context: JSContext): JSValue;

	static valueWithNullInContext(context: JSContext): JSValue;

	static valueWithObjectInContext(value: any, context: JSContext): JSValue;

	static valueWithPointInContext(point: CGPoint, context: JSContext): JSValue;

	static valueWithRangeInContext(range: NSRange, context: JSContext): JSValue;

	static valueWithRectInContext(rect: CGRect, context: JSContext): JSValue;

	static valueWithSizeInContext(size: CGSize, context: JSContext): JSValue;

	static valueWithUInt32InContext(value: number, context: JSContext): JSValue;

	static valueWithUndefinedInContext(context: JSContext): JSValue;

	readonly JSValueRef: interop.Pointer | interop.Reference<any> | null;

	readonly context: JSContext;

	/**
	 * @since 9.0
	 */
	readonly isArray: boolean;

	/**
	 * @since 18.0
	 */
	readonly isBigInt: boolean;

	readonly isBoolean: boolean;

	/**
	 * @since 9.0
	 */
	readonly isDate: boolean;

	readonly isNull: boolean;

	readonly isNumber: boolean;

	readonly isObject: boolean;

	readonly isString: boolean;

	/**
	 * @since 13.0
	 */
	readonly isSymbol: boolean;

	readonly isUndefined: boolean;
	[index: number]: JSValue;

	callWithArguments(_arguments: NSArray<any> | any[]): JSValue;

	/**
	 * @since 18.0
	 */
	compareDouble(other: number): JSRelationCondition;

	/**
	 * @since 18.0
	 */
	compareInt64(other: number): JSRelationCondition;

	/**
	 * @since 18.0
	 */
	compareJSValue(other: JSValue): JSRelationCondition;

	/**
	 * @since 18.0
	 */
	compareUInt64(other: number): JSRelationCondition;

	constructWithArguments(_arguments: NSArray<any> | any[]): JSValue;

	definePropertyDescriptor(property: any, descriptor: any): void;

	deleteProperty(property: any): boolean;

	hasProperty(property: any): boolean;

	invokeMethodWithArguments(method: string, _arguments: NSArray<any> | any[]): JSValue;

	isEqualToObject(value: any): boolean;

	isEqualWithTypeCoercionToObject(value: any): boolean;

	isInstanceOf(value: any): boolean;

	objectAtIndexedSubscript(index: number): JSValue;

	objectForKeyedSubscript(key: any): JSValue;

	setObjectAtIndexedSubscript(object: any, index: number): void;

	setObjectForKeyedSubscript(object: any, key: any): void;

	setValueAtIndex(value: any, index: number): void;

	setValueForProperty(value: any, property: any): void;

	toArray(): NSArray<any>;

	toBool(): boolean;

	toDate(): Date;

	toDictionary(): NSDictionary<any, any>;

	toDouble(): number;

	toInt32(): number;

	/**
	 * @since 18.0
	 */
	toInt64(): number;

	toNumber(): number;

	toObject(): any;

	toObjectOfClass(expectedClass: typeof NSObject): any;

	toPoint(): CGPoint;

	toRange(): NSRange;

	toRect(): CGRect;

	toSize(): CGSize;

	toString(): string;

	toUInt32(): number;

	/**
	 * @since 18.0
	 */
	toUInt64(): number;

	valueAtIndex(index: number): JSValue;

	valueForProperty(property: any): JSValue;
}

/**
 * @since 18.0
 */
declare function JSValueCompare(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, left: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, right: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): JSRelationCondition;

/**
 * @since 18.0
 */
declare function JSValueCompareDouble(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, left: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, right: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): JSRelationCondition;

/**
 * @since 18.0
 */
declare function JSValueCompareInt64(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, left: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, right: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): JSRelationCondition;

/**
 * @since 18.0
 */
declare function JSValueCompareUInt64(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, left: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, right: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): JSRelationCondition;

/**
 * @since 7.0
 */
declare function JSValueCreateJSONString(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, indent: number, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSValueGetType(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): JSType;

/**
 * @since 10.0
 */
declare function JSValueGetTypedArrayType(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): JSTypedArrayType;

/**
 * @since 9.0
 */
declare function JSValueIsArray(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 18.0
 */
declare function JSValueIsBigInt(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): boolean;

declare function JSValueIsBoolean(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 9.0
 */
declare function JSValueIsDate(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsEqual(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, a: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsInstanceOfConstructor(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, constructor: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsNull(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsNumber(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsObject(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsObjectOfClass(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, jsClass: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsStrictEqual(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, a: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, b: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsString(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 13.0
 */
declare function JSValueIsSymbol(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueIsUndefined(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

declare function JSValueMakeBoolean(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, boolean: boolean): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 7.0
 */
declare function JSValueMakeFromJSONString(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSValueMakeNull(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSValueMakeNumber(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, number: number): interop.Pointer | interop.Reference<any> | null;

declare function JSValueMakeString(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, string: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 13.0
 */
declare function JSValueMakeSymbol(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, description: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSValueMakeUndefined(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSValueProtect(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

declare function JSValueToBoolean(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): boolean;

/**
 * @since 18.0
 */
declare function JSValueToInt32(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 18.0
 */
declare function JSValueToInt64(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSValueToNumber(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSValueToObject(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

declare function JSValueToStringCopy(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 18.0
 */
declare function JSValueToUInt32(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

/**
 * @since 18.0
 */
declare function JSValueToUInt64(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, exception: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): number;

declare function JSValueUnprotect(ctx: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

/**
 * @since 7.0
 */
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
