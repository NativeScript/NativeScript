
/**
 * @since 2.0
 */
declare class NSObject implements NSObjectProtocol {

	static alloc(): NSObject;

	static automaticallyNotifiesObserversForKey(key: string): boolean;

	static cancelPreviousPerformRequestsWithTarget(aTarget: any): void;

	static cancelPreviousPerformRequestsWithTargetSelectorObject(aTarget: any, aSelector: string, anArgument: any | null): void;

	static class(): typeof NSObject;

	static classFallbacksForKeyedArchiver(): NSArray<string>;

	static classForKeyedUnarchiver(): typeof NSObject;

	static conformsToProtocol(protocol: any /* Protocol */): boolean;

	static copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	static debugDescription(): string;

	static description(): string;

	static hash(): number;

	static initialize(): void;

	static instanceMethodForSelector(aSelector: string): interop.FunctionReference<() => void>;

	static instanceMethodSignatureForSelector(aSelector: string): NSMethodSignature;

	static instancesRespondToSelector(aSelector: string): boolean;

	static isSubclassOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 2.0
	 */
	static keyPathsForValuesAffectingValueForKey(key: string): NSSet<string>;

	static load(): void;

	static mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	static new(): NSObject;

	/**
	 * @since 2.0
	 */
	static resolveClassMethod(sel: string): boolean;

	/**
	 * @since 2.0
	 */
	static resolveInstanceMethod(sel: string): boolean;

	static setVersion(aVersion: number): void;

	static superclass(): typeof NSObject;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	static useStoredAccessor(): boolean;

	static version(): number;

	/**
	 * @since 17.0
	 */
	accessibilityActivateBlock: () => boolean | null;

	/**
	 * @since 5.0
	 */
	accessibilityActivationPoint: CGPoint;

	/**
	 * @since 17.0
	 */
	accessibilityActivationPointBlock: () => CGPoint | null;

	/**
	 * @since 11.0
	 */
	accessibilityAttributedHint: NSAttributedString | null;

	/**
	 * @since 17.0
	 */
	accessibilityAttributedHintBlock: () => NSAttributedString | null | null;

	/**
	 * @since 11.0
	 */
	accessibilityAttributedLabel: NSAttributedString | null;

	/**
	 * @since 17.0
	 */
	accessibilityAttributedLabelBlock: () => NSAttributedString | null | null;

	/**
	 * @since 13.0
	 */
	accessibilityAttributedUserInputLabels: NSArray<NSAttributedString>;

	/**
	 * @since 17.0
	 */
	accessibilityAttributedUserInputLabelsBlock: () => NSArray<NSAttributedString> | null | null;

	/**
	 * @since 11.0
	 */
	accessibilityAttributedValue: NSAttributedString | null;

	/**
	 * @since 17.0
	 */
	accessibilityAttributedValueBlock: () => NSAttributedString | null | null;

	/**
	 * @since 11.0
	 */
	accessibilityContainerType: UIAccessibilityContainerType;

	/**
	 * @since 17.0
	 */
	accessibilityContainerTypeBlock: () => UIAccessibilityContainerType | null;

	/**
	 * @since 8.0
	 */
	accessibilityCustomActions: NSArray<UIAccessibilityCustomAction> | null;

	/**
	 * @since 17.0
	 */
	accessibilityCustomActionsBlock: () => NSArray<UIAccessibilityCustomAction> | null | null;

	/**
	 * @since 10.0
	 */
	accessibilityCustomRotors: NSArray<UIAccessibilityCustomRotor> | null;

	/**
	 * @since 17.0
	 */
	accessibilityCustomRotorsBlock: () => NSArray<UIAccessibilityCustomRotor> | null | null;

	/**
	 * @since 17.0
	 */
	accessibilityDecrementBlock: () => void | null;

	/**
	 * @since 17.0
	 */
	accessibilityDirectTouchOptions: UIAccessibilityDirectTouchOptions;

	/**
	 * @since 11.0
	 */
	accessibilityDragSourceDescriptors: NSArray<UIAccessibilityLocationDescriptor> | null;

	/**
	 * @since 11.0
	 */
	accessibilityDropPointDescriptors: NSArray<UIAccessibilityLocationDescriptor> | null;

	/**
	 * @since 8.0
	 */
	accessibilityElements: NSArray<any> | null;

	/**
	 * @since 17.0
	 */
	accessibilityElementsBlock: () => NSArray<any> | null | null;

	/**
	 * @since 5.0
	 */
	accessibilityElementsHidden: boolean;

	/**
	 * @since 17.0
	 */
	accessibilityElementsHiddenBlock: () => boolean | null;

	/**
	 * @since 18.0
	 */
	accessibilityExpandedStatus: UIAccessibilityExpandedStatus;

	/**
	 * @since 18.0
	 */
	accessibilityExpandedStatusBlock: () => UIAccessibilityExpandedStatus | null;

	accessibilityFrame: CGRect;

	/**
	 * @since 17.0
	 */
	accessibilityFrameBlock: () => CGRect | null;

	/**
	 * @since 17.0
	 */
	accessibilityHeaderElementsBlock: () => NSArray<any> | null | null;

	accessibilityHint: string | null;

	/**
	 * @since 17.0
	 */
	accessibilityHintBlock: () => string | null | null;

	/**
	 * @since 17.0
	 */
	accessibilityIdentifierBlock: () => string | null | null;

	/**
	 * @since 17.0
	 */
	accessibilityIncrementBlock: () => void | null;

	accessibilityLabel: string | null;

	/**
	 * @since 17.0
	 */
	accessibilityLabelBlock: () => string | null | null;

	accessibilityLanguage: string | null;

	/**
	 * @since 17.0
	 */
	accessibilityLanguageBlock: () => string | null | null;

	/**
	 * @since 17.0
	 */
	accessibilityMagicTapBlock: () => boolean | null;

	/**
	 * @since 8.0
	 */
	accessibilityNavigationStyle: UIAccessibilityNavigationStyle;

	/**
	 * @since 17.0
	 */
	accessibilityNavigationStyleBlock: () => UIAccessibilityNavigationStyle | null;

	/**
	 * @since 18.0
	 */
	accessibilityNextTextNavigationElement: any | null;

	/**
	 * @since 18.0
	 */
	accessibilityNextTextNavigationElementBlock: () => any | null | null;

	/**
	 * @since 7.0
	 */
	accessibilityPath: UIBezierPath | null;

	/**
	 * @since 17.0
	 */
	accessibilityPathBlock: () => UIBezierPath | null | null;

	/**
	 * @since 17.0
	 */
	accessibilityPerformEscapeBlock: () => boolean | null;

	/**
	 * @since 18.0
	 */
	accessibilityPreviousTextNavigationElement: any | null;

	/**
	 * @since 18.0
	 */
	accessibilityPreviousTextNavigationElementBlock: () => any | null | null;

	/**
	 * @since 13.0
	 */
	accessibilityRespondsToUserInteraction: boolean;

	/**
	 * @since 17.0
	 */
	accessibilityRespondsToUserInteractionBlock: () => boolean | null;

	/**
	 * @since 17.0
	 */
	accessibilityShouldGroupAccessibilityChildrenBlock: () => boolean | null;

	/**
	 * @since 18.1
	 */
	accessibilityTextInputResponder: UITextInput | null;

	/**
	 * @since 18.1
	 */
	accessibilityTextInputResponderBlock: () => UITextInput | null | null;

	/**
	 * @since 13.0
	 */
	accessibilityTextualContext: string | null;

	/**
	 * @since 17.0
	 */
	accessibilityTextualContextBlock: () => string | null | null;

	accessibilityTraits: number;

	/**
	 * @since 17.0
	 */
	accessibilityTraitsBlock: () => number | null;

	/**
	 * @since 13.0
	 */
	accessibilityUserInputLabels: NSArray<string>;

	/**
	 * @since 17.0
	 */
	accessibilityUserInputLabelsBlock: () => NSArray<string> | null | null;

	accessibilityValue: string | null;

	/**
	 * @since 17.0
	 */
	accessibilityValueBlock: () => string | null | null;

	/**
	 * @since 5.0
	 */
	accessibilityViewIsModal: boolean;

	/**
	 * @since 17.0
	 */
	accessibilityViewIsModalBlock: () => boolean | null;

	/**
	 * @since 4.0
	 */
	readonly autoContentAccessingProxy: any;

	/**
	 * @since 17.0
	 */
	automationElements: NSArray<any> | null;

	/**
	 * @since 17.0
	 */
	automationElementsBlock: () => NSArray<any> | null | null;

	/**
	 * @since 18.0
	 */
	browserAccessibilityContainerType: BEAccessibilityContainerType;

	/**
	 * @since 18.0
	 */
	browserAccessibilityCurrentStatus: string | null;

	/**
	 * @since 18.0
	 */
	browserAccessibilityHasDOMFocus: boolean;

	/**
	 * @since 18.0
	 */
	browserAccessibilityIsRequired: boolean;

	/**
	 * @since 18.0
	 */
	browserAccessibilityPressedState: BEAccessibilityPressedState;

	/**
	 * @since 18.0
	 */
	browserAccessibilityRoleDescription: string | null;

	/**
	 * @since 18.0
	 */
	browserAccessibilitySortDirection: string | null;

	readonly classForCoder: typeof NSObject;

	readonly classForKeyedArchiver: typeof NSObject | null;

	isAccessibilityElement: boolean;

	/**
	 * @since 17.0
	 */
	isAccessibilityElementBlock: () => boolean | null;

	observationInfo: interop.Pointer | interop.Reference<any> | null;

	/**
	 * @since 6.0
	 */
	shouldGroupAccessibilityChildren: boolean;

	static readonly accessInstanceVariablesDirectly: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor();

	/**
	 * @since 7.0
	 */
	accessibilityActivate(): boolean;

	/**
	 * @since 9.0
	 */
	accessibilityAssistiveTechnologyFocusedIdentifiers(): NSSet<string> | null;

	/**
	 * @since 4.0
	 */
	accessibilityDecrement(): void;

	accessibilityElementAtIndex(index: number): any | null;

	accessibilityElementCount(): number;

	/**
	 * @since 4.0
	 */
	accessibilityElementDidBecomeFocused(): void;

	/**
	 * @since 4.0
	 */
	accessibilityElementDidLoseFocus(): void;

	/**
	 * @since 4.0
	 */
	accessibilityElementIsFocused(): boolean;

	/**
	 * @since 18.0
	 */
	accessibilityHitTestWithEvent(point: CGPoint, event: _UIEvent | null): any | null;

	/**
	 * @since 4.0
	 */
	accessibilityIncrement(): void;

	/**
	 * @since 18.2
	 */
	accessibilityLineEndPositionFromCurrentSelection(): number;

	/**
	 * @since 18.2
	 */
	accessibilityLineRangeForPosition(position: number): NSRange;

	/**
	 * @since 18.2
	 */
	accessibilityLineStartPositionFromCurrentSelection(): number;

	/**
	 * @since 5.0
	 */
	accessibilityPerformEscape(): boolean;

	/**
	 * @since 6.0
	 */
	accessibilityPerformMagicTap(): boolean;

	/**
	 * @since 4.2
	 */
	accessibilityScroll(direction: UIAccessibilityScrollDirection): boolean;

	/**
	 * @since 17.0
	 */
	accessibilityZoomInAtPoint(point: CGPoint): boolean;

	/**
	 * @since 17.0
	 */
	accessibilityZoomOutAtPoint(point: CGPoint): boolean;

	addObserverForKeyPathOptionsContext(observer: NSObject, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

	attemptRecoveryFromErrorOptionIndex(error: NSError, recoveryOptionIndex: number): boolean;

	attemptRecoveryFromErrorOptionIndexDelegateDidRecoverSelectorContextInfo(error: NSError, recoveryOptionIndex: number, delegate: any | null, didRecoverSelector: string | null, contextInfo: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

	awakeAfterUsingCoder(coder: NSCoder): any | null;

	awakeFromNib(): void;

	/**
	 * @since 18.0
	 */
	browserAccessibilityAttributedValueInRange(range: NSRange): NSAttributedString;

	/**
	 * @since 18.0
	 */
	browserAccessibilityDeleteTextAtCursor(numberOfCharacters: number): void;

	/**
	 * @since 18.0
	 */
	browserAccessibilityInsertTextAtCursor(text: string): void;

	/**
	 * @since 18.0
	 */
	browserAccessibilitySelectedTextRange(): NSRange;

	/**
	 * @since 18.0
	 */
	browserAccessibilitySetSelectedTextRange(range: NSRange): void;

	/**
	 * @since 18.0
	 */
	browserAccessibilityValueInRange(range: NSRange): string;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copy(): any;

	dealloc(): void;

	dictionaryWithValuesForKeys(keys: NSArray<string> | string[]): NSDictionary<string, any>;

	didChangeValueForKey(key: string): void;

	didChangeValueForKeyWithSetMutationUsingObjects(key: string, mutationKind: NSKeyValueSetMutationKind, objects: NSSet<any>): void;

	didChangeValuesAtIndexesForKey(changeKind: NSKeyValueChange, indexes: NSIndexSet, key: string): void;

	doesNotRecognizeSelector(aSelector: string): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	fileManagerShouldProceedAfterError(fm: NSFileManager, errorInfo: NSDictionary<any, any>): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	fileManagerWillProcessPath(fm: NSFileManager, path: string): void;

	finalize(): void;

	forwardInvocation(anInvocation: NSInvocation): void;

	/**
	 * @since 2.0
	 */
	forwardingTargetForSelector(aSelector: string): any;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	handleQueryWithUnboundKey(key: string): any | null;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	handleTakeValueForUnboundKey(value: any | null, key: string): void;

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

	/**
	 * @since 5.0
	 */
	mutableOrderedSetValueForKey(key: string): NSMutableOrderedSet<any>;

	/**
	 * @since 5.0
	 */
	mutableOrderedSetValueForKeyPath(keyPath: string): NSMutableOrderedSet<any>;

	mutableSetValueForKey(key: string): NSMutableSet<any>;

	mutableSetValueForKeyPath(keyPath: string): NSMutableSet<any>;

	observeValueForKeyPathOfObjectChangeContext(keyPath: string | null, object: any | null, change: NSDictionary<string, any> | null, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

	performSelector(aSelector: string): any;

	/**
	 * @since 2.0
	 */
	performSelectorInBackgroundWithObject(aSelector: string, arg: any | null): void;

	performSelectorOnMainThreadWithObjectWaitUntilDone(aSelector: string, arg: any | null, wait: boolean): void;

	performSelectorOnMainThreadWithObjectWaitUntilDoneModes(aSelector: string, arg: any | null, wait: boolean, array: NSArray<string> | string[] | null): void;

	/**
	 * @since 2.0
	 */
	performSelectorOnThreadWithObjectWaitUntilDone(aSelector: string, thr: NSThread, arg: any | null, wait: boolean): void;

	/**
	 * @since 2.0
	 */
	performSelectorOnThreadWithObjectWaitUntilDoneModes(aSelector: string, thr: NSThread, arg: any | null, wait: boolean, array: NSArray<string> | string[] | null): void;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectAfterDelay(aSelector: string, anArgument: any | null, delay: number): void;

	performSelectorWithObjectAfterDelayInModes(aSelector: string, anArgument: any | null, delay: number, modes: NSArray<string> | string[]): void;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 8.0
	 */
	prepareForInterfaceBuilder(): void;

	provideImageDataBytesPerRowOriginSizeUserInfo(data: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, rowbytes: number, originx: number, originy: number, width: number, height: number, info: any | null): void;

	/**
	 * @since 19.0
	 */
	provideImageToMTLTextureCommandBufferOriginxOriginyWidthHeightUserInfo(texture: MTLTexture, commandBuffer: MTLCommandBuffer, originx: number, originy: number, width: number, height: number, info: any | null): void;

	removeObserverForKeyPath(observer: NSObject, keyPath: string): void;

	/**
	 * @since 5.0
	 */
	removeObserverForKeyPathContext(observer: NSObject, keyPath: string, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;

	replacementObjectForCoder(coder: NSCoder): any | null;

	replacementObjectForKeyedArchiver(archiver: NSKeyedArchiver): any | null;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setNilValueForKey(key: string): void;

	/**
	 * @since 18.0
	 */
	setSharedObservers(sharedObservers: NSKeyValueSharedObserversSnapshot | null): void;

	setValueForKey(value: any | null, key: string): void;

	setValueForKeyPath(value: any | null, keyPath: string): void;

	setValueForUndefinedKey(value: any | null, key: string): void;

	setValuesForKeysWithDictionary(keyedValues: NSDictionary<string, any>): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	storedValueForKey(key: string): any | null;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	takeStoredValueForKey(value: any | null, key: string): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	takeValueForKey(value: any | null, key: string): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	takeValueForKeyPath(value: any | null, keyPath: string): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	takeValuesFromDictionary(properties: NSDictionary<any, any>): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	unableToSetNilForKey(key: string): void;

	validateValueForKeyError(ioValue: interop.Pointer | interop.Reference<any | null> | ArrayBufferLike | ArrayBufferView, inKey: string, error?: interop.Reference<NSError>): boolean;

	validateValueForKeyPathError(ioValue: interop.Pointer | interop.Reference<any | null> | ArrayBufferLike | ArrayBufferView, inKeyPath: string, error?: interop.Reference<NSError>): boolean;

	valueForKey(key: string): any | null;

	valueForKeyPath(keyPath: string): any | null;

	valueForUndefinedKey(key: string): any | null;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	valuesForKeys(keys: NSArray<any> | any[]): NSDictionary<any, any>;

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

/**
 * @deprecated 2.0
 */
declare function _objc_flush_caches(cls: typeof NSObject | null): void;

/**
 * @since 2.0
 */
declare function _objc_msgForward(): void;

/**
 * @since 3.0
 */
declare function _objc_msgForward_stret(): void;

/**
 * @since 12.2
 */
declare function _objc_realizeClassFromSwift(cls: typeof NSObject | null, previously: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): typeof NSObject | null;

/**
 * @since 2.0
 */
declare function class_addIvar(cls: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, size: number, alignment: number, types: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null): boolean;

/**
 * @since 2.0
 */
declare function class_addMethod(cls: typeof NSObject | null, name: string, imp: interop.FunctionReference<() => void>, types: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null): boolean;

/**
 * @since 4.3
 */
declare function class_addProperty(cls: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attributes: interop.Pointer | interop.Reference<objc_property_attribute_t> | ArrayBufferLike | ArrayBufferView | null, attributeCount: number): boolean;

/**
 * @since 2.0
 */
declare function class_addProtocol(cls: typeof NSObject | null, protocol: any /* Protocol */): boolean;

/**
 * @since 2.0
 */
declare function class_conformsToProtocol(cls: typeof NSObject | null, protocol: any /* Protocol */ | null): boolean;

/**
 * @since 2.0
 */
declare function class_copyIvarList(cls: typeof NSObject | null, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 2.0
 */
declare function class_copyMethodList(cls: typeof NSObject | null, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 2.0
 */
declare function class_copyPropertyList(cls: typeof NSObject | null, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 2.0
 */
declare function class_copyProtocolList(cls: typeof NSObject | null, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any /* Protocol */> | null;

/**
 * @since 2.0
 */
declare function class_createInstance(cls: typeof NSObject | null, extraBytes: number): any | null;

/**
 * @since 2.0
 */
declare function class_createInstanceFunction(cls: typeof NSObject | null, extraBytes: number): any | null;

/**
 * @since 2.0
 */
declare function class_getClassMethod(cls: typeof NSObject | null, name: string): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function class_getClassVariable(cls: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function class_getImageName(cls: typeof NSObject | null): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function class_getInstanceMethod(cls: typeof NSObject | null, name: string): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function class_getInstanceSize(cls: typeof NSObject | null): number;

/**
 * @since 2.0
 */
declare function class_getInstanceVariable(cls: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function class_getIvarLayout(cls: typeof NSObject | null): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function class_getMethodImplementation(cls: typeof NSObject | null, name: string): interop.FunctionReference<() => void> | null;

/**
 * @since 2.0
 */
declare function class_getMethodImplementation_stret(cls: typeof NSObject | null, name: string): interop.FunctionReference<() => void> | null;

/**
 * @since 2.0
 */
declare function class_getName(cls: typeof NSObject | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function class_getProperty(cls: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function class_getSuperclass(cls: typeof NSObject | null): typeof NSObject | null;

/**
 * @since 2.0
 */
declare function class_getVersion(cls: typeof NSObject | null): number;

/**
 * @since 2.0
 */
declare function class_getWeakIvarLayout(cls: typeof NSObject | null): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function class_isMetaClass(cls: typeof NSObject | null): boolean;

/**
 * @deprecated 2.0
 */
declare function class_lookupMethod(cls: typeof NSObject | null, sel: string): interop.FunctionReference<() => void> | null;

/**
 * @since 2.0
 */
declare function class_replaceMethod(cls: typeof NSObject | null, name: string, imp: interop.FunctionReference<() => void>, types: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null): interop.FunctionReference<() => void> | null;

/**
 * @since 4.3
 */
declare function class_replaceProperty(cls: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attributes: interop.Pointer | interop.Reference<objc_property_attribute_t> | ArrayBufferLike | ArrayBufferView | null, attributeCount: number): void;

/**
 * @deprecated 2.0
 */
declare function class_respondsToMethod(cls: typeof NSObject | null, sel: string): boolean;

/**
 * @since 2.0
 */
declare function class_respondsToSelector(cls: typeof NSObject | null, sel: string): boolean;

/**
 * @since 2.0
 */
declare function class_setIvarLayout(cls: typeof NSObject | null, layout: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null): void;

/**
 * @deprecated 2.0
 */
declare function class_setSuperclass(cls: typeof NSObject, newSuper: typeof NSObject): typeof NSObject;

/**
 * @since 2.0
 */
declare function class_setVersion(cls: typeof NSObject | null, version: number): void;

/**
 * @since 2.0
 */
declare function class_setWeakIvarLayout(cls: typeof NSObject | null, layout: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null): void;

/**
 * @since 4.3
 */
declare function imp_getBlock(anImp: interop.FunctionReference<() => void>): any | null;

/**
 * @since 4.3
 */
declare function imp_implementationWithBlock(block: any): interop.FunctionReference<() => void>;

/**
 * @since 4.3
 */
declare function imp_removeBlock(anImp: interop.FunctionReference<() => void>): boolean;

/**
 * @since 2.0
 */
declare function ivar_getName(v: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function ivar_getOffset(v: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function ivar_getTypeEncoding(v: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function method_copyArgumentType(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, index: number): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function method_copyReturnType(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function method_exchangeImplementations(m1: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, m2: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 2.0
 */
declare function method_getArgumentType(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, index: number, dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, dst_len: number): void;

/**
 * @since 2.0
 */
declare function method_getDescription(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<objc_method_description> | null;

/**
 * @since 2.0
 */
declare function method_getImplementation(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.FunctionReference<() => void>;

/**
 * @since 2.0
 */
declare function method_getName(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): string;

/**
 * @since 2.0
 */
declare function method_getNumberOfArguments(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): number;

/**
 * @since 2.0
 */
declare function method_getReturnType(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, dst: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, dst_len: number): void;

/**
 * @since 2.0
 */
declare function method_getTypeEncoding(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function method_invoke(): void;

/**
 * @since 2.0
 */
declare function method_invoke_stret(): void;

/**
 * @since 2.0
 */
declare function method_setImplementation(m: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, imp: interop.FunctionReference<() => void>): interop.FunctionReference<() => void>;

declare const enum objc_AssociationPolicy {

	OBJC_ASSOCIATION_ASSIGN = 0,

	OBJC_ASSOCIATION_RETAIN_NONATOMIC = 1,

	OBJC_ASSOCIATION_COPY_NONATOMIC = 3,

	OBJC_ASSOCIATION_RETAIN = 769,

	OBJC_ASSOCIATION_COPY = 771
}

/**
 * @since 13.0
 */
declare function objc_addLoadImageFunc(func: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<mach_header> | null) => void>): void;

/**
 * @since 2.0
 */
declare function objc_allocateClassPair(superclass: typeof NSObject | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extraBytes: number): typeof NSObject | null;

/**
 * @since 4.3
 */
declare function objc_allocateProtocol(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any /* Protocol */ | null;

/**
 * @since 2.0
 */
declare function objc_begin_catch(exc_buf: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): any;

/**
 * @since 3.0
 */
declare function objc_constructInstance(cls: typeof NSObject | null, bytes: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any | null;

/**
 * @since 3.1
 */
declare function objc_copyClassList(outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<typeof NSObject> | null;

/**
 * @since 2.0
 */
declare function objc_copyClassNamesForImage(image: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 2.0
 */
declare function objc_copyImageNames(outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 2.0
 */
declare function objc_copyProtocolList(outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any /* Protocol */> | null;

/**
 * @since 3.0
 */
declare function objc_destructInstance(obj: any | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function objc_disposeClassPair(cls: typeof NSObject): void;

/**
 * @since 2.0
 */
declare function objc_duplicateClass(original: typeof NSObject, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, extraBytes: number): typeof NSObject;

/**
 * @since 2.0
 */
declare function objc_end_catch(): void;

/**
 * @since 16.0
 */
declare function objc_enumerateClasses(image: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, namePrefix: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, conformingTo: any /* Protocol */ | null, subclassing: typeof NSObject | null, block: (p1: typeof NSObject, p2: interop.Pointer | interop.Reference<boolean> | null) => void): void;

/**
 * @since 2.0
 */
declare function objc_enumerationMutation(obj: any): void;

/**
 * @since 2.0
 */
declare function objc_exception_rethrow(): void;

/**
 * @since 2.0
 */
declare function objc_exception_throw(exception: any): void;

/**
 * @since 3.1
 */
declare function objc_getAssociatedObject(object: any, key: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): any | null;

/**
 * @since 2.0
 */
declare function objc_getClass(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

/**
 * @since 2.0
 */
declare function objc_getClassList(buffer: interop.Pointer | interop.Reference<typeof NSObject> | ArrayBufferLike | ArrayBufferView | null, bufferCount: number): number;

/**
 * @since 2.0
 */
declare function objc_getFutureClass(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): typeof NSObject;

/**
 * @since 2.0
 */
declare function objc_getMetaClass(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

/**
 * @since 2.0
 */
declare function objc_getProtocol(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any /* Protocol */ | null;

/**
 * @since 2.0
 */
declare function objc_getRequiredClass(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): typeof NSObject;

/**
 * @since 5.0
 */
declare function objc_loadWeak(location: interop.Pointer | interop.Reference<any | null> | ArrayBufferLike | ArrayBufferView): any | null;

/**
 * @since 2.0
 */
declare function objc_lookUpClass(name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): typeof NSObject | null;

interface objc_method_description {
	name: string | null;
	types: interop.Pointer | interop.Reference<any> | null | null;
}
declare var objc_method_description: interop.StructType<objc_method_description>;

/**
 * @since 2.0
 */
declare function objc_msgSend(): void;

/**
 * @since 2.0
 */
declare function objc_msgSendSuper(): void;

/**
 * @since 2.0
 */
declare function objc_msgSendSuper_stret(): void;

/**
 * @since 2.0
 */
declare function objc_msgSend_fp2ret(): void;

/**
 * @since 2.0
 */
declare function objc_msgSend_fpret(): void;

/**
 * @since 2.0
 */
declare function objc_msgSend_stret(): void;

interface objc_object {
	isa: typeof NSObject;
}
declare var objc_object: interop.StructType<objc_object>;

interface objc_property_attribute_t {
	name: interop.Pointer | interop.Reference<any> | null;
	value: interop.Pointer | interop.Reference<any> | null;
}
declare var objc_property_attribute_t: interop.StructType<objc_property_attribute_t>;

/**
 * @since 2.0
 */
declare function objc_registerClassPair(cls: typeof NSObject): void;

/**
 * @since 4.3
 */
declare function objc_registerProtocol(proto: any /* Protocol */): void;

/**
 * @since 3.1
 */
declare function objc_removeAssociatedObjects(object: any): void;

/**
 * @since 3.1
 */
declare function objc_setAssociatedObject(object: any, key: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: any | null, policy: objc_AssociationPolicy): void;

/**
 * @since 2.0
 */
declare function objc_setEnumerationMutationHandler(handler: interop.FunctionReference<(p1: any) => void> | null): void;

/**
 * @since 2.0
 */
declare function objc_setExceptionMatcher(fn: interop.FunctionReference<(p1: typeof NSObject, p2: any) => number>): interop.FunctionReference<(p1: typeof NSObject, p2: any) => number>;

/**
 * @since 2.0
 */
declare function objc_setExceptionPreprocessor(fn: interop.FunctionReference<(p1: any) => any>): interop.FunctionReference<(p1: any) => any>;

/**
 * @since 2.0
 */
declare function objc_setForwardHandler(fwd: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, fwd_stret: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 12.2
 */
declare function objc_setHook_getClass(newValue: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<typeof NSObject | null> | null) => boolean>, outOldValue: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any> | null, p2: interop.Pointer | interop.Reference<typeof NSObject | null> | null) => boolean> | null> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 12.0
 */
declare function objc_setHook_getImageName(newValue: interop.FunctionReference<(p1: typeof NSObject, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null | null> | null) => boolean>, outOldValue: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: typeof NSObject, p2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null | null> | null) => boolean> | null> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 14.0
 */
declare function objc_setHook_lazyClassNamer(newValue: interop.FunctionReference<(p1: typeof NSObject) => interop.Pointer | interop.Reference<any> | null | null>, oldOutValue: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: typeof NSObject) => interop.Pointer | interop.Reference<any> | null | null>> | ArrayBufferLike | ArrayBufferView): void;

/**
 * @since 2.0
 */
declare function objc_setUncaughtExceptionHandler(fn: interop.FunctionReference<(p1: any) => void>): interop.FunctionReference<(p1: any) => void>;

/**
 * @since 5.0
 */
declare function objc_storeWeak(location: interop.Pointer | interop.Reference<any | null> | ArrayBufferLike | ArrayBufferView, obj: any | null): any | null;

interface objc_super {
	receiver: any;
	super_class: typeof NSObject;
}
declare var objc_super: interop.StructType<objc_super>;

/**
 * @since 2.0
 */
declare function objc_sync_enter(obj: any): number;

/**
 * @since 2.0
 */
declare function objc_sync_exit(obj: any): number;

/**
 * @since 6.0
 */
declare function objc_terminate(): void;

/**
 * @since 2.0
 */
declare function object_copy(obj: any | null, size: number): any | null;

/**
 * @since 2.0
 */
declare function object_dispose(obj: any | null): any | null;

/**
 * @since 2.0
 */
declare function object_getClass(obj: any | null): typeof NSObject | null;

/**
 * @since 2.0
 */
declare function object_getClassName(obj: any | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function object_getIndexedIvars(obj: any | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function object_getInstanceVariable(obj: any | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, outValue: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function object_getIvar(obj: any | null, ivar: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): any | null;

/**
 * @since 8.0
 */
declare function object_isClass(obj: any | null): boolean;

/**
 * @since 2.0
 */
declare function object_setClass(obj: any | null, cls: typeof NSObject): typeof NSObject | null;

/**
 * @since 2.0
 */
declare function object_setInstanceVariable(obj: any | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 10.0
 */
declare function object_setInstanceVariableWithStrongDefault(obj: any | null, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, value: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function object_setIvar(obj: any | null, ivar: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: any | null): void;

/**
 * @since 10.0
 */
declare function object_setIvarWithStrongDefault(obj: any | null, ivar: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, value: any | null): void;

/**
 * @since 4.3
 */
declare function property_copyAttributeList(property: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<objc_property_attribute_t> | null;

/**
 * @since 4.3
 */
declare function property_copyAttributeValue(property: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView, attributeName: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function property_getAttributes(property: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null | null;

/**
 * @since 2.0
 */
declare function property_getName(property: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 4.3
 */
declare function protocol_addMethodDescription(proto: any /* Protocol */, name: string, types: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null | null, isRequiredMethod: boolean, isInstanceMethod: boolean): void;

/**
 * @since 4.3
 */
declare function protocol_addProperty(proto: any /* Protocol */, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, attributes: interop.Pointer | interop.Reference<objc_property_attribute_t> | ArrayBufferLike | ArrayBufferView | null, attributeCount: number, isRequiredProperty: boolean, isInstanceProperty: boolean): void;

/**
 * @since 4.3
 */
declare function protocol_addProtocol(proto: any /* Protocol */, addition: any /* Protocol */): void;

/**
 * @since 2.0
 */
declare function protocol_conformsToProtocol(proto: any /* Protocol */ | null, other: any /* Protocol */ | null): boolean;

/**
 * @since 2.0
 */
declare function protocol_copyMethodDescriptionList(proto: any /* Protocol */, isRequiredMethod: boolean, isInstanceMethod: boolean, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<objc_method_description> | null;

/**
 * @since 2.0
 */
declare function protocol_copyPropertyList(proto: any /* Protocol */, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 10.0
 */
declare function protocol_copyPropertyList2(proto: any /* Protocol */, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, isRequiredProperty: boolean, isInstanceProperty: boolean): interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any> | null> | null;

/**
 * @since 2.0
 */
declare function protocol_copyProtocolList(proto: any /* Protocol */, outCount: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null): interop.Pointer | interop.Reference<any /* Protocol */> | null;

/**
 * @since 2.0
 */
declare function protocol_getMethodDescription(proto: any /* Protocol */, aSel: string, isRequiredMethod: boolean, isInstanceMethod: boolean): objc_method_description;

/**
 * @since 2.0
 */
declare function protocol_getName(proto: any /* Protocol */): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function protocol_getProperty(proto: any /* Protocol */, name: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, isRequiredProperty: boolean, isInstanceProperty: boolean): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function protocol_isEqual(proto: any /* Protocol */ | null, other: any /* Protocol */ | null): boolean;

/**
 * @since 2.0
 */
declare function sel_getName(sel: string): interop.Pointer | interop.Reference<any> | null;

/**
 * @since 2.0
 */
declare function sel_getUid(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string;

/**
 * @since 2.0
 */
declare function sel_isEqual(lhs: string, rhs: string): boolean;

/**
 * @since 2.0
 */
declare function sel_isMapped(sel: string): boolean;

/**
 * @since 2.0
 */
declare function sel_registerName(str: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): string;
