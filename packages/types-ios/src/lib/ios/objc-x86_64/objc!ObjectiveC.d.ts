
declare class NSObject implements NSObjectProtocol {

	static alloc(): NSObject;

	static automaticallyNotifiesObserversForKey(key: string): boolean;

	static cancelPreviousPerformRequestsWithTarget(aTarget: any): void;

	static cancelPreviousPerformRequestsWithTargetSelectorObject(aTarget: any, aSelector: string, anArgument: any): void;

	static class(): typeof NSObject;

	static classFallbacksForKeyedArchiver(): NSArray<string>;

	static classForKeyedUnarchiver(): typeof NSObject;

	static conformsToProtocol(protocol: any /* Protocol */): boolean;

	static copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	static debugDescription(): string;

	static description(): string;

	static hash(): number;

	static initialize(): void;

	static instanceMethodForSelector(aSelector: string): interop.FunctionReference<() => void>;

	static instanceMethodSignatureForSelector(aSelector: string): NSMethodSignature;

	static instancesRespondToSelector(aSelector: string): boolean;

	static isSubclassOfClass(aClass: typeof NSObject): boolean;

	static keyPathsForValuesAffectingValueForKey(key: string): NSSet<string>;

	static load(): void;

	static mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	static new(): NSObject;

	static resolveClassMethod(sel: string): boolean;

	static resolveInstanceMethod(sel: string): boolean;

	static setVersion(aVersion: number): void;

	static superclass(): typeof NSObject;

	static version(): number;

	accessibilityActivationPoint: CGPoint;

	accessibilityAttributedHint: NSAttributedString;

	accessibilityAttributedLabel: NSAttributedString;

	accessibilityAttributedUserInputLabels: NSArray<NSAttributedString>;

	accessibilityAttributedValue: NSAttributedString;

	accessibilityContainerType: UIAccessibilityContainerType;

	accessibilityCustomActions: NSArray<UIAccessibilityCustomAction>;

	accessibilityCustomRotors: NSArray<UIAccessibilityCustomRotor>;

	accessibilityDragSourceDescriptors: NSArray<UIAccessibilityLocationDescriptor>;

	accessibilityDropPointDescriptors: NSArray<UIAccessibilityLocationDescriptor>;

	accessibilityElements: NSArray<any>;

	accessibilityElementsHidden: boolean;

	accessibilityFrame: CGRect;

	accessibilityHint: string;

	accessibilityLabel: string;

	accessibilityLanguage: string;

	accessibilityNavigationStyle: UIAccessibilityNavigationStyle;

	accessibilityPath: UIBezierPath;

	accessibilityRespondsToUserInteraction: boolean;

	accessibilityTextualContext: string;

	accessibilityTraits: number;

	accessibilityUserInputLabels: NSArray<string>;

	accessibilityValue: string;

	accessibilityViewIsModal: boolean;

	readonly autoContentAccessingProxy: any;

	readonly classForCoder: typeof NSObject;

	readonly classForKeyedArchiver: typeof NSObject;

	isAccessibilityElement: boolean;

	observationInfo: interop.Pointer | interop.Reference<any>;

	shouldGroupAccessibilityChildren: boolean;

	static readonly accessInstanceVariablesDirectly: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

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

	addObserverForKeyPathOptionsContext(observer: NSObject, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer | interop.Reference<any>): void;

	attemptRecoveryFromErrorOptionIndex(error: NSError, recoveryOptionIndex: number): boolean;

	attemptRecoveryFromErrorOptionIndexDelegateDidRecoverSelectorContextInfo(error: NSError, recoveryOptionIndex: number, delegate: any, didRecoverSelector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

	awakeAfterUsingCoder(coder: NSCoder): any;

	awakeFromNib(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copy(): any;

	dealloc(): void;

	dictionaryWithValuesForKeys(keys: NSArray<string> | string[]): NSDictionary<string, any>;

	didChangeValueForKey(key: string): void;

	didChangeValueForKeyWithSetMutationUsingObjects(key: string, mutationKind: NSKeyValueSetMutationKind, objects: NSSet<any>): void;

	didChangeValuesAtIndexesForKey(changeKind: NSKeyValueChange, indexes: NSIndexSet, key: string): void;

	doesNotRecognizeSelector(aSelector: string): void;

	fileManagerShouldProceedAfterError(fm: NSFileManager, errorInfo: NSDictionary<any, any>): boolean;

	fileManagerWillProcessPath(fm: NSFileManager, path: string): void;

	finalize(): void;

	forwardInvocation(anInvocation: NSInvocation): void;

	forwardingTargetForSelector(aSelector: string): any;

	indexOfAccessibilityElement(element: any): number;

	init(): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	methodForSelector(aSelector: string): interop.FunctionReference<() => void>;

	methodSignatureForSelector(aSelector: string): NSMethodSignature;

	mutableArrayValueForKey(key: string): NSMutableArray<any>;

	mutableArrayValueForKeyPath(keyPath: string): NSMutableArray<any>;

	mutableCopy(): any;

	mutableOrderedSetValueForKey(key: string): NSMutableOrderedSet<any>;

	mutableOrderedSetValueForKeyPath(keyPath: string): NSMutableOrderedSet<any>;

	mutableSetValueForKey(key: string): NSMutableSet<any>;

	mutableSetValueForKeyPath(keyPath: string): NSMutableSet<any>;

	observeValueForKeyPathOfObjectChangeContext(keyPath: string, object: any, change: NSDictionary<string, any>, context: interop.Pointer | interop.Reference<any>): void;

	performSelector(aSelector: string): any;

	performSelectorInBackgroundWithObject(aSelector: string, arg: any): void;

	performSelectorOnMainThreadWithObjectWaitUntilDone(aSelector: string, arg: any, wait: boolean): void;

	performSelectorOnMainThreadWithObjectWaitUntilDoneModes(aSelector: string, arg: any, wait: boolean, array: NSArray<string> | string[]): void;

	performSelectorOnThreadWithObjectWaitUntilDone(aSelector: string, thr: NSThread, arg: any, wait: boolean): void;

	performSelectorOnThreadWithObjectWaitUntilDoneModes(aSelector: string, thr: NSThread, arg: any, wait: boolean, array: NSArray<string> | string[]): void;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectAfterDelay(aSelector: string, anArgument: any, delay: number): void;

	performSelectorWithObjectAfterDelayInModes(aSelector: string, anArgument: any, delay: number, modes: NSArray<string> | string[]): void;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepareForInterfaceBuilder(): void;

	provideImageDataBytesPerRowOriginSizeUserInfo(data: interop.Pointer | interop.Reference<any>, rowbytes: number, x: number, y: number, width: number, height: number, info: any): void;

	removeObserverForKeyPath(observer: NSObject, keyPath: string): void;

	removeObserverForKeyPathContext(observer: NSObject, keyPath: string, context: interop.Pointer | interop.Reference<any>): void;

	replacementObjectForCoder(coder: NSCoder): any;

	replacementObjectForKeyedArchiver(archiver: NSKeyedArchiver): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setNilValueForKey(key: string): void;

	setValueForKey(value: any, key: string): void;

	setValueForKeyPath(value: any, keyPath: string): void;

	setValueForUndefinedKey(value: any, key: string): void;

	setValuesForKeysWithDictionary(keyedValues: NSDictionary<string, any>): void;

	validateValueForKeyError(ioValue: interop.Pointer | interop.Reference<any>, inKey: string): boolean;

	validateValueForKeyPathError(ioValue: interop.Pointer | interop.Reference<any>, inKeyPath: string): boolean;

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

declare const OBJC_CLEAR_RESIDENT_STACK: number;

declare const OBJC_COLLECT_IF_NEEDED: number;

declare const OBJC_EXHAUSTIVE_COLLECTION: number;

declare const OBJC_FULL_COLLECTION: number;

declare const OBJC_GENERATIONAL_COLLECTION: number;

declare const OBJC_RATIO_COLLECTION: number;

declare const OBJC_SYNC_NOT_OWNING_THREAD_ERROR: number;

declare const OBJC_SYNC_SUCCESS: number;

declare const OBJC_WAIT_UNTIL_DONE: number;

declare class Protocol extends NSObject {

	static alloc(): Protocol; // inherited from NSObject

	static new(): Protocol; // inherited from NSObject
}

declare function _objc_flush_caches(cls: typeof NSObject): void;

declare function _objc_msgForward(): void;

declare function _objc_msgForward_stret(): void;

declare function _objc_realizeClassFromSwift(cls: typeof NSObject, previously: interop.Pointer | interop.Reference<any>): typeof NSObject;

declare function class_addIvar(cls: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>, size: number, alignment: number, types: string | interop.Pointer | interop.Reference<any>): boolean;

declare function class_addMethod(cls: typeof NSObject, name: string, imp: interop.FunctionReference<() => void>, types: string | interop.Pointer | interop.Reference<any>): boolean;

declare function class_addProperty(cls: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>, attributes: interop.Pointer | interop.Reference<objc_property_attribute_t>, attributeCount: number): boolean;

declare function class_addProtocol(cls: typeof NSObject, protocol: any /* Protocol */): boolean;

declare function class_conformsToProtocol(cls: typeof NSObject, protocol: any /* Protocol */): boolean;

declare function class_copyIvarList(cls: typeof NSObject, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function class_copyMethodList(cls: typeof NSObject, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function class_copyPropertyList(cls: typeof NSObject, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function class_copyProtocolList(cls: typeof NSObject, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any /* Protocol */>;

declare function class_createInstance(cls: typeof NSObject, extraBytes: number): any;

declare function class_createInstanceFunction(cls: typeof NSObject, extraBytes: number): any;

declare function class_getClassMethod(cls: typeof NSObject, name: string): interop.Pointer | interop.Reference<any>;

declare function class_getClassVariable(cls: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function class_getImageName(cls: typeof NSObject): string;

declare function class_getInstanceMethod(cls: typeof NSObject, name: string): interop.Pointer | interop.Reference<any>;

declare function class_getInstanceSize(cls: typeof NSObject): number;

declare function class_getInstanceVariable(cls: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function class_getIvarLayout(cls: typeof NSObject): string;

declare function class_getMethodImplementation(cls: typeof NSObject, name: string): interop.FunctionReference<() => void>;

declare function class_getMethodImplementation_stret(cls: typeof NSObject, name: string): interop.FunctionReference<() => void>;

declare function class_getName(cls: typeof NSObject): string;

declare function class_getProperty(cls: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function class_getSuperclass(cls: typeof NSObject): typeof NSObject;

declare function class_getVersion(cls: typeof NSObject): number;

declare function class_getWeakIvarLayout(cls: typeof NSObject): string;

declare function class_isMetaClass(cls: typeof NSObject): boolean;

declare function class_lookupMethod(cls: typeof NSObject, sel: string): interop.FunctionReference<() => void>;

declare function class_replaceMethod(cls: typeof NSObject, name: string, imp: interop.FunctionReference<() => void>, types: string | interop.Pointer | interop.Reference<any>): interop.FunctionReference<() => void>;

declare function class_replaceProperty(cls: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>, attributes: interop.Pointer | interop.Reference<objc_property_attribute_t>, attributeCount: number): void;

declare function class_respondsToMethod(cls: typeof NSObject, sel: string): boolean;

declare function class_respondsToSelector(cls: typeof NSObject, sel: string): boolean;

declare function class_setIvarLayout(cls: typeof NSObject, layout: string | interop.Pointer | interop.Reference<any>): void;

declare function class_setSuperclass(cls: typeof NSObject, newSuper: typeof NSObject): typeof NSObject;

declare function class_setVersion(cls: typeof NSObject, version: number): void;

declare function class_setWeakIvarLayout(cls: typeof NSObject, layout: string | interop.Pointer | interop.Reference<any>): void;

declare function imp_getBlock(anImp: interop.FunctionReference<() => void>): any;

declare function imp_implementationWithBlock(block: any): interop.FunctionReference<() => void>;

declare function imp_removeBlock(anImp: interop.FunctionReference<() => void>): boolean;

declare function ivar_getName(v: interop.Pointer | interop.Reference<any>): string;

declare function ivar_getOffset(v: interop.Pointer | interop.Reference<any>): number;

declare function ivar_getTypeEncoding(v: interop.Pointer | interop.Reference<any>): string;

declare function method_copyArgumentType(m: interop.Pointer | interop.Reference<any>, index: number): string;

declare function method_copyReturnType(m: interop.Pointer | interop.Reference<any>): string;

declare function method_exchangeImplementations(m1: interop.Pointer | interop.Reference<any>, m2: interop.Pointer | interop.Reference<any>): void;

declare function method_getArgumentType(m: interop.Pointer | interop.Reference<any>, index: number, dst: string | interop.Pointer | interop.Reference<any>, dst_len: number): void;

declare function method_getDescription(m: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<objc_method_description>;

declare function method_getImplementation(m: interop.Pointer | interop.Reference<any>): interop.FunctionReference<() => void>;

declare function method_getName(m: interop.Pointer | interop.Reference<any>): string;

declare function method_getNumberOfArguments(m: interop.Pointer | interop.Reference<any>): number;

declare function method_getReturnType(m: interop.Pointer | interop.Reference<any>, dst: string | interop.Pointer | interop.Reference<any>, dst_len: number): void;

declare function method_getTypeEncoding(m: interop.Pointer | interop.Reference<any>): string;

declare function method_invoke(): void;

declare function method_invoke_stret(): void;

declare function method_setImplementation(m: interop.Pointer | interop.Reference<any>, imp: interop.FunctionReference<() => void>): interop.FunctionReference<() => void>;

declare const enum objc_AssociationPolicy {

	OBJC_ASSOCIATION_ASSIGN = 0,

	OBJC_ASSOCIATION_RETAIN_NONATOMIC = 1,

	OBJC_ASSOCIATION_COPY_NONATOMIC = 3,

	OBJC_ASSOCIATION_RETAIN = 769,

	OBJC_ASSOCIATION_COPY = 771
}

declare function objc_addLoadImageFunc(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_header>) => void>): void;

declare function objc_allocateClassPair(superclass: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>, extraBytes: number): typeof NSObject;

declare function objc_allocateProtocol(name: string | interop.Pointer | interop.Reference<any>): any /* Protocol */;

declare function objc_begin_catch(exc_buf: interop.Pointer | interop.Reference<any>): any;

declare function objc_constructInstance(cls: typeof NSObject, bytes: interop.Pointer | interop.Reference<any>): any;

declare function objc_copyClassList(outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<typeof NSObject>;

declare function objc_copyClassNamesForImage(image: string | interop.Pointer | interop.Reference<any>, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<string>;

declare function objc_copyImageNames(outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<string>;

declare function objc_copyProtocolList(outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any /* Protocol */>;

declare function objc_destructInstance(obj: any): interop.Pointer | interop.Reference<any>;

declare function objc_disposeClassPair(cls: typeof NSObject): void;

declare function objc_duplicateClass(original: typeof NSObject, name: string | interop.Pointer | interop.Reference<any>, extraBytes: number): typeof NSObject;

declare function objc_end_catch(): void;

declare function objc_enumerationMutation(obj: any): void;

declare function objc_exception_rethrow(): void;

declare function objc_exception_throw(exception: any): void;

declare function objc_getAssociatedObject(object: any, key: interop.Pointer | interop.Reference<any>): any;

declare function objc_getClass(name: string | interop.Pointer | interop.Reference<any>): any;

declare function objc_getClassList(buffer: interop.Pointer | interop.Reference<typeof NSObject>, bufferCount: number): number;

declare function objc_getFutureClass(name: string | interop.Pointer | interop.Reference<any>): typeof NSObject;

declare function objc_getMetaClass(name: string | interop.Pointer | interop.Reference<any>): any;

declare function objc_getProtocol(name: string | interop.Pointer | interop.Reference<any>): any /* Protocol */;

declare function objc_getRequiredClass(name: string | interop.Pointer | interop.Reference<any>): typeof NSObject;

declare function objc_loadWeak(location: interop.Pointer | interop.Reference<any>): any;

declare function objc_lookUpClass(name: string | interop.Pointer | interop.Reference<any>): typeof NSObject;

interface objc_method_description {
	name: string;
	types: string;
}
declare var objc_method_description: interop.StructType<objc_method_description>;

declare function objc_msgSend(): void;

declare function objc_msgSendSuper(): void;

declare function objc_msgSendSuper_stret(): void;

declare function objc_msgSend_fp2ret(): void;

declare function objc_msgSend_fpret(): void;

declare function objc_msgSend_stret(): void;

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

declare function objc_setAssociatedObject(object: any, key: interop.Pointer | interop.Reference<any>, value: any, policy: objc_AssociationPolicy): void;

declare function objc_setEnumerationMutationHandler(handler: interop.FunctionReference<(p1: any) => void>): void;

declare function objc_setExceptionMatcher(fn: interop.FunctionReference<(p1: typeof NSObject, p2: any) => number>): interop.FunctionReference<(p1: typeof NSObject, p2: any) => number>;

declare function objc_setExceptionPreprocessor(fn: interop.FunctionReference<(p1: any) => any>): interop.FunctionReference<(p1: any) => any>;

declare function objc_setForwardHandler(fwd: interop.Pointer | interop.Reference<any>, fwd_stret: interop.Pointer | interop.Reference<any>): void;

declare function objc_setHook_getClass(newValue: interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<typeof NSObject>) => boolean>, outOldValue: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: string, p2: interop.Pointer | interop.Reference<typeof NSObject>) => boolean>>): void;

declare function objc_setHook_getImageName(newValue: interop.FunctionReference<(p1: typeof NSObject, p2: interop.Pointer | interop.Reference<string>) => boolean>, outOldValue: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: typeof NSObject, p2: interop.Pointer | interop.Reference<string>) => boolean>>): void;

declare function objc_setHook_setAssociatedObject(newValue: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>, p3: any, p4: objc_AssociationPolicy) => void>, outOldValue: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>, p3: any, p4: objc_AssociationPolicy) => void>>): void;

declare function objc_setUncaughtExceptionHandler(fn: interop.FunctionReference<(p1: any) => void>): interop.FunctionReference<(p1: any) => void>;

declare function objc_storeWeak(location: interop.Pointer | interop.Reference<any>, obj: any): any;

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

declare function object_getIndexedIvars(obj: any): interop.Pointer | interop.Reference<any>;

declare function object_getInstanceVariable(obj: any, name: string | interop.Pointer | interop.Reference<any>, outValue: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): interop.Pointer | interop.Reference<any>;

declare function object_getIvar(obj: any, ivar: interop.Pointer | interop.Reference<any>): any;

declare function object_isClass(obj: any): boolean;

declare function object_setClass(obj: any, cls: typeof NSObject): typeof NSObject;

declare function object_setInstanceVariable(obj: any, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function object_setInstanceVariableWithStrongDefault(obj: any, name: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function object_setIvar(obj: any, ivar: interop.Pointer | interop.Reference<any>, value: any): void;

declare function object_setIvarWithStrongDefault(obj: any, ivar: interop.Pointer | interop.Reference<any>, value: any): void;

declare function property_copyAttributeList(property: interop.Pointer | interop.Reference<any>, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<objc_property_attribute_t>;

declare function property_copyAttributeValue(property: interop.Pointer | interop.Reference<any>, attributeName: string | interop.Pointer | interop.Reference<any>): string;

declare function property_getAttributes(property: interop.Pointer | interop.Reference<any>): string;

declare function property_getName(property: interop.Pointer | interop.Reference<any>): string;

declare function protocol_addMethodDescription(proto: any /* Protocol */, name: string, types: string | interop.Pointer | interop.Reference<any>, isRequiredMethod: boolean, isInstanceMethod: boolean): void;

declare function protocol_addProperty(proto: any /* Protocol */, name: string | interop.Pointer | interop.Reference<any>, attributes: interop.Pointer | interop.Reference<objc_property_attribute_t>, attributeCount: number, isRequiredProperty: boolean, isInstanceProperty: boolean): void;

declare function protocol_addProtocol(proto: any /* Protocol */, addition: any /* Protocol */): void;

declare function protocol_conformsToProtocol(proto: any /* Protocol */, other: any /* Protocol */): boolean;

declare function protocol_copyMethodDescriptionList(proto: any /* Protocol */, isRequiredMethod: boolean, isInstanceMethod: boolean, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<objc_method_description>;

declare function protocol_copyPropertyList(proto: any /* Protocol */, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function protocol_copyPropertyList2(proto: any /* Protocol */, outCount: interop.Pointer | interop.Reference<number>, isRequiredProperty: boolean, isInstanceProperty: boolean): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>;

declare function protocol_copyProtocolList(proto: any /* Protocol */, outCount: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any /* Protocol */>;

declare function protocol_getMethodDescription(proto: any /* Protocol */, aSel: string, isRequiredMethod: boolean, isInstanceMethod: boolean): objc_method_description;

declare function protocol_getName(proto: any /* Protocol */): string;

declare function protocol_getProperty(proto: any /* Protocol */, name: string | interop.Pointer | interop.Reference<any>, isRequiredProperty: boolean, isInstanceProperty: boolean): interop.Pointer | interop.Reference<any>;

declare function protocol_isEqual(proto: any /* Protocol */, other: any /* Protocol */): boolean;

declare function sel_getName(sel: string): string;

declare function sel_getNameFunction(sel: string): string;

declare function sel_getUid(str: string | interop.Pointer | interop.Reference<any>): string;

declare function sel_isEqual(lhs: string, rhs: string): boolean;

declare function sel_isMapped(sel: string): boolean;

declare function sel_registerName(str: string | interop.Pointer | interop.Reference<any>): string;

declare function sel_registerNameFunction(str: string | interop.Pointer | interop.Reference<any>): string;
