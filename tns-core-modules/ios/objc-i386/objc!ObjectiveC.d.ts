
declare class NSObject implements NSObjectProtocol {

	static accessInstanceVariablesDirectly(): boolean;

	static alloc(): NSObject;

	static automaticallyNotifiesObserversForKey(key: string): boolean;

	static cancelPreviousPerformRequestsWithTarget(aTarget: any): void;

	static cancelPreviousPerformRequestsWithTargetSelectorObject(aTarget: any, aSelector: string, anArgument: any): void;

	static class(): typeof NSObject;

	static classFallbacksForKeyedArchiver(): NSArray<string>;

	static classForKeyedUnarchiver(): typeof NSObject;

	static conformsToProtocol(protocol: any /* Protocol */): boolean;

	static copyWithZone(zone: interop.Pointer): any;

	static debugDescription(): string;

	static description(): string;

	static hash(): number;

	static initialize(): void;

	static instanceMethodForSelector(aSelector: string): interop.FunctionReference<(p1: any, p2: string) => any>;

	static instanceMethodSignatureForSelector(aSelector: string): NSMethodSignature;

	static instancesRespondToSelector(aSelector: string): boolean;

	static isSubclassOfClass(aClass: typeof NSObject): boolean;

	static keyPathsForValuesAffectingValueForKey(key: string): NSSet<string>;

	static load(): void;

	static mutableCopyWithZone(zone: interop.Pointer): any;

	static new(): NSObject;

	static resolveClassMethod(sel: string): boolean;

	static resolveInstanceMethod(sel: string): boolean;

	static setVersion(aVersion: number): void;

	static superclass(): typeof NSObject;

	static version(): number;

	accessibilityActivationPoint: CGPoint;

	accessibilityCustomActions: NSArray<UIAccessibilityCustomAction>;

	accessibilityElements: NSArray<any>;

	accessibilityElementsHidden: boolean;

	accessibilityFrame: CGRect;

	accessibilityHint: string;

	accessibilityLabel: string;

	accessibilityLanguage: string;

	accessibilityNavigationStyle: UIAccessibilityNavigationStyle;

	accessibilityPath: UIBezierPath;

	accessibilityTraits: number;

	accessibilityValue: string;

	accessibilityViewIsModal: boolean;

	/* readonly */ autoContentAccessingProxy: any;

	/* readonly */ classForCoder: typeof NSObject;

	/* readonly */ classForKeyedArchiver: typeof NSObject;

	isAccessibilityElement: boolean;

	observationInfo: interop.Pointer;

	shouldGroupAccessibilityChildren: boolean;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */ zone: interop.Pointer; // inherited from NSObjectProtocol

	constructor();

	accessibilityActivate(): boolean;

	accessibilityAssistiveTechnologyFocusedIdentifiers(): NSSet<string>;

	accessibilityDecrement(): void;

	accessibilityElementAtIndex(index: number): any;

	accessibilityElementCount(): number;

	accessibilityElementDidBecomeFocused(): void;

	accessibilityElementDidLoseFocus(): void;

	accessibilityElementIsFocused(): boolean;

	accessibilityIncrement(): void;

	accessibilityPerformEscape(): boolean;

	accessibilityPerformMagicTap(): boolean;

	accessibilityScroll(direction: UIAccessibilityScrollDirection): boolean;

	actionForLayerForKey(layer: CALayer, event: string): CAAction;

	addObserverForKeyPathOptionsContext(observer: NSObject, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer): void;

	animationDidStart(anim: CAAnimation): void;

	animationDidStopFinished(anim: CAAnimation, flag: boolean): void;

	attemptRecoveryFromErrorOptionIndex(error: NSError, recoveryOptionIndex: number): boolean;

	attemptRecoveryFromErrorOptionIndexDelegateDidRecoverSelectorContextInfo(error: NSError, recoveryOptionIndex: number, delegate: any, didRecoverSelector: string, contextInfo: interop.Pointer): void;

	awakeAfterUsingCoder(aDecoder: NSCoder): any;

	awakeFromNib(): void;

	class(): typeof NSObject; // inherited from NSObjectProtocol

	conformsToProtocol(aProtocol: any /* Protocol */): boolean; // inherited from NSObjectProtocol

	copy(): any;

	dealloc(): void;

	dictionaryWithValuesForKeys(keys: NSArray<string>): NSDictionary<string, any>;

	didChangeValueForKey(key: string): void;

	didChangeValueForKeyWithSetMutationUsingObjects(key: string, mutationKind: NSKeyValueSetMutationKind, objects: NSSet<any>): void;

	didChangeValuesAtIndexesForKey(changeKind: NSKeyValueChange, indexes: NSIndexSet, key: string): void;

	displayLayer(layer: CALayer): void;

	doesNotRecognizeSelector(aSelector: string): void;

	drawLayerInContext(layer: CALayer, ctx: any): void;

	fileManagerShouldProceedAfterError(fm: NSFileManager, errorInfo: NSDictionary<any, any>): boolean;

	fileManagerWillProcessPath(fm: NSFileManager, path: string): void;

	finalize(): void;

	forwardInvocation(anInvocation: NSInvocation): void;

	forwardingTargetForSelector(aSelector: string): any;

	indexOfAccessibilityElement(element: any): number;

	isEqual(object: any): boolean; // inherited from NSObjectProtocol

	isKindOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	isMemberOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	layoutSublayersOfLayer(layer: CALayer): void;

	methodForSelector(aSelector: string): interop.FunctionReference<(p1: any, p2: string) => any>;

	methodSignatureForSelector(aSelector: string): NSMethodSignature;

	mutableArrayValueForKey(key: string): NSMutableArray<any>;

	mutableArrayValueForKeyPath(keyPath: string): NSMutableArray<any>;

	mutableCopy(): any;

	mutableOrderedSetValueForKey(key: string): NSMutableOrderedSet<any>;

	mutableOrderedSetValueForKeyPath(keyPath: string): NSMutableOrderedSet<any>;

	mutableSetValueForKey(key: string): NSMutableSet<any>;

	mutableSetValueForKeyPath(keyPath: string): NSMutableSet<any>;

	observeValueForKeyPathOfObjectChangeContext(keyPath: string, object: any, change: NSDictionary<string, any>, context: interop.Pointer): void;

	performSelector(aSelector: string): any; // inherited from NSObjectProtocol

	performSelectorInBackgroundWithObject(aSelector: string, arg: any): void;

	performSelectorOnMainThreadWithObjectWaitUntilDone(aSelector: string, arg: any, wait: boolean): void;

	performSelectorOnMainThreadWithObjectWaitUntilDoneModes(aSelector: string, arg: any, wait: boolean, array: NSArray<string>): void;

	performSelectorOnThreadWithObjectWaitUntilDone(aSelector: string, thr: NSThread, arg: any, wait: boolean): void;

	performSelectorOnThreadWithObjectWaitUntilDoneModes(aSelector: string, thr: NSThread, arg: any, wait: boolean, array: NSArray<string>): void;

	performSelectorWithObject(aSelector: string, object: any): any; // inherited from NSObjectProtocol

	performSelectorWithObjectAfterDelay(aSelector: string, anArgument: any, delay: number): void;

	performSelectorWithObjectAfterDelayInModes(aSelector: string, anArgument: any, delay: number, modes: NSArray<string>): void;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any; // inherited from NSObjectProtocol

	prepareForInterfaceBuilder(): void;

	provideImageDataBytesPerRowOriginSizeUserInfo(data: interop.Pointer, rowbytes: number, x: number, y: number, width: number, height: number, info: any): void;

	removeObserverForKeyPath(observer: NSObject, keyPath: string): void;

	removeObserverForKeyPathContext(observer: NSObject, keyPath: string, context: interop.Pointer): void;

	replacementObjectForCoder(aCoder: NSCoder): any;

	replacementObjectForKeyedArchiver(archiver: NSKeyedArchiver): any;

	respondsToSelector(aSelector: string): boolean; // inherited from NSObjectProtocol

	retainCount(): number; // inherited from NSObjectProtocol

	self(): NSObject; // inherited from NSObjectProtocol

	setNilValueForKey(key: string): void;

	setValueForKey(value: any, key: string): void;

	setValueForKeyPath(value: any, keyPath: string): void;

	setValueForUndefinedKey(value: any, key: string): void;

	setValuesForKeysWithDictionary(keyedValues: NSDictionary<string, any>): void;

	validateValueForKeyError(ioValue: interop.Reference<any>, inKey: string): boolean;

	validateValueForKeyPathError(ioValue: interop.Reference<any>, inKeyPath: string): boolean;

	valueForKey(key: string): any;

	valueForKeyPath(keyPath: string): any;

	valueForUndefinedKey(key: string): any;

	willChangeValueForKey(key: string): void;

	willChangeValueForKeyWithSetMutationUsingObjects(key: string, mutationKind: NSKeyValueSetMutationKind, objects: NSSet<any>): void;

	willChangeValuesAtIndexesForKey(changeKind: NSKeyValueChange, indexes: NSIndexSet, key: string): void;
}

interface NSObjectProtocol {

	debugDescription?: string;

	description: string;

	hash: number;

	isProxy: boolean;

	superclass: typeof NSObject;

	zone: interop.Pointer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): NSObjectProtocol;
}
declare var NSObjectProtocol: {

	prototype: NSObjectProtocol;
};

declare class Protocol extends NSObject {

	static alloc(): Protocol; // inherited from NSObject

	static new(): Protocol; // inherited from NSObject

	constructor(); // inherited from NSObject

	self(): Protocol; // inherited from NSObjectProtocol
}

declare function _objc_flush_caches(cls: typeof NSObject): void;

declare function class_addIvar(cls: typeof NSObject, name: string, size: number, alignment: number, types: string): boolean;

declare function class_addMethod(cls: typeof NSObject, name: string, imp: interop.FunctionReference<(p1: any, p2: string) => any>, types: string): boolean;

declare function class_addProperty(cls: typeof NSObject, name: string, attributes: interop.Reference<objc_property_attribute_t>, attributeCount: number): boolean;

declare function class_addProtocol(cls: typeof NSObject, protocol: any /* Protocol */): boolean;

declare function class_conformsToProtocol(cls: typeof NSObject, protocol: any /* Protocol */): boolean;

declare function class_copyIvarList(cls: typeof NSObject, outCount: interop.Reference<number>): interop.Reference<interop.Pointer>;

declare function class_copyMethodList(cls: typeof NSObject, outCount: interop.Reference<number>): interop.Reference<interop.Pointer>;

declare function class_copyPropertyList(cls: typeof NSObject, outCount: interop.Reference<number>): interop.Reference<interop.Pointer>;

declare function class_copyProtocolList(cls: typeof NSObject, outCount: interop.Reference<number>): interop.Reference<any /* Protocol */>;

declare function class_createInstance(cls: typeof NSObject, extraBytes: number): any;

declare function class_createInstanceFunction(cls: typeof NSObject, extraBytes: number): any;

declare function class_getClassMethod(cls: typeof NSObject, name: string): interop.Pointer;

declare function class_getClassVariable(cls: typeof NSObject, name: string): interop.Pointer;

declare function class_getImageName(cls: typeof NSObject): string;

declare function class_getInstanceMethod(cls: typeof NSObject, name: string): interop.Pointer;

declare function class_getInstanceSize(cls: typeof NSObject): number;

declare function class_getInstanceVariable(cls: typeof NSObject, name: string): interop.Pointer;

declare function class_getIvarLayout(cls: typeof NSObject): string;

declare function class_getMethodImplementation(cls: typeof NSObject, name: string): interop.FunctionReference<(p1: any, p2: string) => any>;

declare function class_getMethodImplementation_stret(cls: typeof NSObject, name: string): interop.FunctionReference<(p1: any, p2: string) => any>;

declare function class_getName(cls: typeof NSObject): string;

declare function class_getProperty(cls: typeof NSObject, name: string): interop.Pointer;

declare function class_getSuperclass(cls: typeof NSObject): typeof NSObject;

declare function class_getVersion(cls: typeof NSObject): number;

declare function class_getWeakIvarLayout(cls: typeof NSObject): string;

declare function class_isMetaClass(cls: typeof NSObject): boolean;

declare function class_lookupMethod(cls: typeof NSObject, sel: string): interop.FunctionReference<(p1: any, p2: string) => any>;

declare function class_replaceMethod(cls: typeof NSObject, name: string, imp: interop.FunctionReference<(p1: any, p2: string) => any>, types: string): interop.FunctionReference<(p1: any, p2: string) => any>;

declare function class_replaceProperty(cls: typeof NSObject, name: string, attributes: interop.Reference<objc_property_attribute_t>, attributeCount: number): void;

declare function class_respondsToMethod(cls: typeof NSObject, sel: string): boolean;

declare function class_respondsToSelector(cls: typeof NSObject, sel: string): boolean;

declare function class_setIvarLayout(cls: typeof NSObject, layout: string): void;

declare function class_setSuperclass(cls: typeof NSObject, newSuper: typeof NSObject): typeof NSObject;

declare function class_setVersion(cls: typeof NSObject, version: number): void;

declare function class_setWeakIvarLayout(cls: typeof NSObject, layout: string): void;

declare function imp_getBlock(anImp: interop.FunctionReference<(p1: any, p2: string) => any>): any;

declare function imp_implementationWithBlock(block: any): interop.FunctionReference<(p1: any, p2: string) => any>;

declare function imp_removeBlock(anImp: interop.FunctionReference<(p1: any, p2: string) => any>): boolean;

declare function ivar_getName(v: interop.Pointer): string;

declare function ivar_getOffset(v: interop.Pointer): number;

declare function ivar_getTypeEncoding(v: interop.Pointer): string;

declare function method_copyArgumentType(m: interop.Pointer, index: number): string;

declare function method_copyReturnType(m: interop.Pointer): string;

declare function method_exchangeImplementations(m1: interop.Pointer, m2: interop.Pointer): void;

declare function method_getArgumentType(m: interop.Pointer, index: number, dst: string, dst_len: number): void;

declare function method_getDescription(m: interop.Pointer): interop.Reference<objc_method_description>;

declare function method_getImplementation(m: interop.Pointer): interop.FunctionReference<(p1: any, p2: string) => any>;

declare function method_getName(m: interop.Pointer): string;

declare function method_getNumberOfArguments(m: interop.Pointer): number;

declare function method_getReturnType(m: interop.Pointer, dst: string, dst_len: number): void;

declare function method_getTypeEncoding(m: interop.Pointer): string;

declare function method_setImplementation(m: interop.Pointer, imp: interop.FunctionReference<(p1: any, p2: string) => any>): interop.FunctionReference<(p1: any, p2: string) => any>;

declare const enum objc_AssociationPolicy {

	OBJC_ASSOCIATION_ASSIGN = 0,

	OBJC_ASSOCIATION_RETAIN_NONATOMIC = 1,

	OBJC_ASSOCIATION_COPY_NONATOMIC = 3,

	OBJC_ASSOCIATION_RETAIN = 769,

	OBJC_ASSOCIATION_COPY = 771
}

declare function objc_allocateClassPair(superclass: typeof NSObject, name: string, extraBytes: number): typeof NSObject;

declare function objc_allocateProtocol(name: string): any /* Protocol */;

declare function objc_begin_catch(exc_buf: interop.Pointer): any;

declare function objc_constructInstance(cls: typeof NSObject, bytes: interop.Pointer): any;

declare function objc_copyClassList(outCount: interop.Reference<number>): interop.Reference<typeof NSObject>;

declare function objc_copyClassNamesForImage(image: string, outCount: interop.Reference<number>): interop.Reference<string>;

declare function objc_copyImageNames(outCount: interop.Reference<number>): interop.Reference<string>;

declare function objc_copyProtocolList(outCount: interop.Reference<number>): interop.Reference<any /* Protocol */>;

declare function objc_destructInstance(obj: any): interop.Pointer;

declare function objc_disposeClassPair(cls: typeof NSObject): void;

declare function objc_duplicateClass(original: typeof NSObject, name: string, extraBytes: number): typeof NSObject;

declare function objc_end_catch(): void;

declare function objc_enumerationMutation(obj: any): void;

declare function objc_exception_rethrow(): void;

declare function objc_exception_throw(exception: any): void;

declare function objc_getAssociatedObject(object: any, key: interop.Pointer): any;

declare function objc_getClass(name: string): any;

declare function objc_getClassList(buffer: interop.Reference<typeof NSObject>, bufferCount: number): number;

declare function objc_getFutureClass(name: string): typeof NSObject;

declare function objc_getMetaClass(name: string): any;

declare function objc_getProtocol(name: string): any /* Protocol */;

declare function objc_getRequiredClass(name: string): typeof NSObject;

declare function objc_loadWeak(location: interop.Reference<any>): any;

declare function objc_lookUpClass(name: string): typeof NSObject;

interface objc_method_description {
	name: string;
	types: string;
}
declare var objc_method_description: interop.StructType<objc_method_description>;

interface objc_object {
	isa: typeof NSObject;
}
declare var objc_object: interop.StructType<objc_object>;

interface objc_property_attribute_t {
	name: string;
	value: string;
}
declare var objc_property_attribute_t: interop.StructType<objc_property_attribute_t>;

declare function objc_registerClassPair(cls: typeof NSObject): void;

declare function objc_registerProtocol(proto: any /* Protocol */): void;

declare function objc_removeAssociatedObjects(object: any): void;

declare function objc_setAssociatedObject(object: any, key: interop.Pointer, value: any, policy: objc_AssociationPolicy): void;

declare function objc_setEnumerationMutationHandler(handler: interop.FunctionReference<(p1: any) => void>): void;

declare function objc_setExceptionMatcher(fn: interop.FunctionReference<(p1: typeof NSObject, p2: any) => number>): interop.FunctionReference<(p1: typeof NSObject, p2: any) => number>;

declare function objc_setExceptionPreprocessor(fn: interop.FunctionReference<(p1: any) => any>): interop.FunctionReference<(p1: any) => any>;

declare function objc_setForwardHandler(fwd: interop.Pointer, fwd_stret: interop.Pointer): void;

declare function objc_setUncaughtExceptionHandler(fn: interop.FunctionReference<(p1: any) => void>): interop.FunctionReference<(p1: any) => void>;

declare function objc_storeWeak(location: interop.Reference<any>, obj: any): any;

interface objc_super {
	receiver: any;
	super_class: typeof NSObject;
}
declare var objc_super: interop.StructType<objc_super>;

declare function objc_sync_enter(obj: any): number;

declare function objc_sync_exit(obj: any): number;

declare function objc_terminate(): void;

declare function object_copy(obj: any, size: number): any;

declare function object_dispose(obj: any): any;

declare function object_getClass(obj: any): typeof NSObject;

declare function object_getClassName(obj: any): string;

declare function object_getClassNameFunction(obj: any): string;

declare function object_getIndexedIvars(obj: any): interop.Pointer;

declare function object_getIndexedIvarsFunction(obj: any): interop.Pointer;

declare function object_getInstanceVariable(obj: any, name: string, outValue: interop.Reference<interop.Pointer>): interop.Pointer;

declare function object_getIvar(obj: any, ivar: interop.Pointer): any;

declare function object_isClass(obj: any): boolean;

declare function object_setClass(obj: any, cls: typeof NSObject): typeof NSObject;

declare function object_setInstanceVariable(obj: any, name: string, value: interop.Pointer): interop.Pointer;

declare function object_setIvar(obj: any, ivar: interop.Pointer, value: any): void;

declare function property_copyAttributeList(property: interop.Pointer, outCount: interop.Reference<number>): interop.Reference<objc_property_attribute_t>;

declare function property_copyAttributeValue(property: interop.Pointer, attributeName: string): string;

declare function property_getAttributes(property: interop.Pointer): string;

declare function property_getName(property: interop.Pointer): string;

declare function protocol_addMethodDescription(proto: any /* Protocol */, name: string, types: string, isRequiredMethod: boolean, isInstanceMethod: boolean): void;

declare function protocol_addProperty(proto: any /* Protocol */, name: string, attributes: interop.Reference<objc_property_attribute_t>, attributeCount: number, isRequiredProperty: boolean, isInstanceProperty: boolean): void;

declare function protocol_addProtocol(proto: any /* Protocol */, addition: any /* Protocol */): void;

declare function protocol_conformsToProtocol(proto: any /* Protocol */, other: any /* Protocol */): boolean;

declare function protocol_copyMethodDescriptionList(p: any /* Protocol */, isRequiredMethod: boolean, isInstanceMethod: boolean, outCount: interop.Reference<number>): interop.Reference<objc_method_description>;

declare function protocol_copyPropertyList(proto: any /* Protocol */, outCount: interop.Reference<number>): interop.Reference<interop.Pointer>;

declare function protocol_copyProtocolList(proto: any /* Protocol */, outCount: interop.Reference<number>): interop.Reference<any /* Protocol */>;

declare function protocol_getMethodDescription(p: any /* Protocol */, aSel: string, isRequiredMethod: boolean, isInstanceMethod: boolean): objc_method_description;

declare function protocol_getName(p: any /* Protocol */): string;

declare function protocol_getProperty(proto: any /* Protocol */, name: string, isRequiredProperty: boolean, isInstanceProperty: boolean): interop.Pointer;

declare function protocol_isEqual(proto: any /* Protocol */, other: any /* Protocol */): boolean;

declare function sel_getName(sel: string): string;

declare function sel_getNameFunction(sel: string): string;

declare function sel_getUid(str: string): string;

declare function sel_getUidFunction(str: string): string;

declare function sel_isEqual(lhs: string, rhs: string): boolean;

declare function sel_isMapped(sel: string): boolean;

declare function sel_registerName(str: string): string;

declare function sel_registerNameFunction(str: string): string;
