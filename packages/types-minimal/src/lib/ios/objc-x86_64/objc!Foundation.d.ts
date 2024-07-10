
declare const NSASCIIStringEncoding: number;

/**
 * @since 7.0
 */
declare const enum NSActivityOptions {

	IdleDisplaySleepDisabled = 1099511627776,

	IdleSystemSleepDisabled = 1048576,

	SuddenTerminationDisabled = 16384,

	AutomaticTerminationDisabled = 32768,

	AnimationTrackingEnabled = 35184372088832,

	TrackingEnabled = 70368744177664,

	UserInitiated = 16777215,

	UserInitiatedAllowingIdleSystemSleep = 15728639,

	Background = 255,

	LatencyCritical = 1095216660480,

	UserInteractive = 1095233437695
}

declare function NSAllHashTableObjects(table: NSHashTable<any>): NSArray<any>;

declare function NSAllMapTableKeys(table: NSMapTable<any, any>): NSArray<any>;

declare function NSAllMapTableValues(table: NSMapTable<any, any>): NSArray<any>;

declare function NSAllocateMemoryPages(bytes: number): interop.Pointer | interop.Reference<any>;

declare function NSAllocateObject(aClass: typeof NSObject, extraBytes: number, zone: interop.Pointer | interop.Reference<any>): any;

/**
 * @since 15.0
 */
declare var NSAlternateDescriptionAttributeName: string;

declare var NSArgumentDomain: string;

declare class NSArray<ObjectType> extends NSObject implements CKRecordValue, NSCopying, NSFastEnumeration, NSMutableCopying, NSSecureCoding {

	static alloc<ObjectType>(): NSArray<ObjectType>; // inherited from NSObject

	static array<ObjectType>(): NSArray<ObjectType>;

	static arrayWithArray<ObjectType>(array: NSArray<any> | any[]): NSArray<ObjectType>;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	static arrayWithContentsOfFile<ObjectType>(path: string): NSArray<any>;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	static arrayWithContentsOfURL<ObjectType>(url: NSURL): NSArray<any>;

	/**
	 * @since 11.0
	 */
	static arrayWithContentsOfURLError<ObjectType>(url: NSURL): NSArray<any>;

	static arrayWithObject<ObjectType>(anObject: any): NSArray<ObjectType>;

	static arrayWithObjects<ObjectType>(firstObj: any): NSArray<ObjectType>;

	static arrayWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSArray<ObjectType>;

	static new<ObjectType>(): NSArray<ObjectType>; // inherited from NSObject

	readonly count: number;

	/**
	 * @since 4.0
	 */
	readonly firstObject: any;

	readonly lastObject: any;

	readonly sortedArrayHint: NSData;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[index: number]: any;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { array: NSArray<any> | any[]; });

	constructor(o: { array: NSArray<any> | any[]; copyItems: boolean; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	constructor(o: { contentsOfFile: string; });

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	constructor(o: { contentsOfURL: NSURL; });

	/**
	 * @since 11.0
	 */
	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { objects: any; });

	constructor(o: { objects: interop.Reference<any>; count: number; });

	addObserverToObjectsAtIndexesForKeyPathOptionsContext(observer: NSObject, indexes: NSIndexSet, keyPath: string, options: NSKeyValueObservingOptions, context: interop.Pointer | interop.Reference<any>): void;

	arrayByAddingObject(anObject: any): NSArray<any>;

	arrayByAddingObjectsFromArray(otherArray: NSArray<any> | any[]): NSArray<any>;

	arrayByApplyingDifference(difference: NSOrderedCollectionDifference<any>): NSArray<any>;

	class(): typeof NSObject;

	componentsJoinedByString(separator: string): string;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	containsObject(anObject: any): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	descriptionWithLocale(locale: any): string;

	descriptionWithLocaleIndent(locale: any, level: number): string;

	differenceFromArray(other: NSArray<any> | any[]): NSOrderedCollectionDifference<any>;

	differenceFromArrayWithOptions(other: NSArray<any> | any[], options: NSOrderedCollectionDifferenceCalculationOptions): NSOrderedCollectionDifference<any>;

	differenceFromArrayWithOptionsUsingEquivalenceTest(other: NSArray<any> | any[], options: NSOrderedCollectionDifferenceCalculationOptions, block: (p1: any, p2: any) => boolean): NSOrderedCollectionDifference<any>;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateObjectsAtIndexesOptionsUsingBlock(s: NSIndexSet, opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateObjectsUsingBlock(block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateObjectsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	filteredArrayUsingPredicate(predicate: NSPredicate): NSArray<any>;

	firstObjectCommonWithArray(otherArray: NSArray<any> | any[]): any;

	/**
	 * @since 2.0
	 * @deprecated 11.0
	 */
	getObjects(objects: interop.Reference<any>): void;

	getObjectsRange(objects: interop.Reference<any>, range: NSRange): void;

	indexOfObject(anObject: any): number;

	/**
	 * @since 4.0
	 */
	indexOfObjectAtIndexesOptionsPassingTest(s: NSIndexSet, opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	indexOfObjectIdenticalTo(anObject: any): number;

	indexOfObjectIdenticalToInRange(anObject: any, range: NSRange): number;

	indexOfObjectInRange(anObject: any, range: NSRange): number;

	/**
	 * @since 4.0
	 */
	indexOfObjectInSortedRangeOptionsUsingComparator(obj: any, r: NSRange, opts: NSBinarySearchingOptions, cmp: (p1: any, p2: any) => NSComparisonResult): number;

	/**
	 * @since 4.0
	 */
	indexOfObjectPassingTest(predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	/**
	 * @since 4.0
	 */
	indexOfObjectWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	/**
	 * @since 4.0
	 */
	indexesOfObjectsAtIndexesOptionsPassingTest(s: NSIndexSet, opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	/**
	 * @since 4.0
	 */
	indexesOfObjectsPassingTest(predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	/**
	 * @since 4.0
	 */
	indexesOfObjectsWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	initWithArray(array: NSArray<any> | any[]): this;

	initWithArrayCopyItems(array: NSArray<any> | any[], flag: boolean): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	initWithContentsOfFile(path: string): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	initWithContentsOfURL(url: NSURL): this;

	/**
	 * @since 11.0
	 */
	initWithContentsOfURLError(url: NSURL): this;

	initWithObjects(firstObj: any): this;

	initWithObjectsCount(objects: interop.Reference<any>, cnt: number): this;

	isEqual(object: any): boolean;

	isEqualToArray(otherArray: NSArray<any> | any[]): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	makeObjectsPerformSelector(aSelector: string): void;

	makeObjectsPerformSelectorWithObject(aSelector: string, argument: any): void;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	objectAtIndex(index: number): any;

	/**
	 * @since 6.0
	 */
	objectAtIndexedSubscript(idx: number): any;

	objectEnumerator(): NSEnumerator<any>;

	objectsAtIndexes(indexes: NSIndexSet): NSArray<any>;

	pathsMatchingExtensions(filterTypes: NSArray<string> | string[]): NSArray<string>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeObserverFromObjectsAtIndexesForKeyPath(observer: NSObject, indexes: NSIndexSet, keyPath: string): void;

	/**
	 * @since 5.0
	 */
	removeObserverFromObjectsAtIndexesForKeyPathContext(observer: NSObject, indexes: NSIndexSet, keyPath: string, context: interop.Pointer | interop.Reference<any>): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	reverseObjectEnumerator(): NSEnumerator<any>;

	self(): this;

	shuffledArray(): NSArray<any>;

	shuffledArrayWithRandomSource(randomSource: GKRandomSource): NSArray<any>;

	/**
	 * @since 4.0
	 */
	sortedArrayUsingComparator(cmptr: (p1: any, p2: any) => NSComparisonResult): NSArray<any>;

	sortedArrayUsingDescriptors(sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]): NSArray<any>;

	sortedArrayUsingFunctionContext(comparator: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => number>, context: interop.Pointer | interop.Reference<any>): NSArray<any>;

	sortedArrayUsingFunctionContextHint(comparator: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => number>, context: interop.Pointer | interop.Reference<any>, hint: NSData): NSArray<any>;

	sortedArrayUsingSelector(comparator: string): NSArray<any>;

	/**
	 * @since 4.0
	 */
	sortedArrayWithOptionsUsingComparator(opts: NSSortOptions, cmptr: (p1: any, p2: any) => NSComparisonResult): NSArray<any>;

	subarrayWithRange(range: NSRange): NSArray<any>;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	writeToFileAtomically(path: string, useAuxiliaryFile: boolean): boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	writeToURLAtomically(url: NSURL, atomically: boolean): boolean;

	/**
	 * @since 11.0
	 */
	writeToURLError(url: NSURL): boolean;
}

declare class NSAssertionHandler extends NSObject {

	static alloc(): NSAssertionHandler; // inherited from NSObject

	static new(): NSAssertionHandler; // inherited from NSObject

	static readonly currentHandler: NSAssertionHandler;
}

/**
 * @since 4.0
 */
declare var NSAssertionHandlerKey: string;

/**
 * @since 3.2
 */
declare class NSAttributedString extends NSObject implements NSCopying, NSItemProviderReading, NSItemProviderWriting, NSMutableCopying, NSSecureCoding {

	static alloc(): NSAttributedString; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static attributedStringWithAdaptiveImageGlyphAttributes(adaptiveImageGlyph: NSAdaptiveImageGlyph, attributes: NSDictionary<string, any>): NSAttributedString;

	/**
	 * @since 7.0
	 */
	static attributedStringWithAttachment(attachment: NSTextAttachment): NSAttributedString;

	/**
	 * @since 18.0
	 */
	static attributedStringWithAttachmentAttributes(attachment: NSTextAttachment, attributes: NSDictionary<string, any>): NSAttributedString;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	/**
	 * @since 13.0
	 */
	static loadFromHTMLWithDataOptionsCompletionHandler(data: NSData, options: NSDictionary<string, any>, completionHandler: (p1: NSAttributedString, p2: NSDictionary<string, any>, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	static loadFromHTMLWithFileURLOptionsCompletionHandler(fileURL: NSURL, options: NSDictionary<string, any>, completionHandler: (p1: NSAttributedString, p2: NSDictionary<string, any>, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	static loadFromHTMLWithRequestOptionsCompletionHandler(request: NSURLRequest, options: NSDictionary<string, any>, completionHandler: (p1: NSAttributedString, p2: NSDictionary<string, any>, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	static loadFromHTMLWithStringOptionsCompletionHandler(string: string, options: NSDictionary<string, any>, completionHandler: (p1: NSAttributedString, p2: NSDictionary<string, any>, p3: NSError) => void): void;

	static new(): NSAttributedString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSAttributedString;

	readonly length: number;

	readonly string: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { attributedString: NSAttributedString; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 15.0
	 */
	constructor(o: { contentsOfMarkdownFileAtURL: NSURL; options: NSAttributedStringMarkdownParsingOptions; baseURL: NSURL; });

	/**
	 * @since 7.0
	 */
	constructor(o: { data: NSData; options: NSDictionary<string, any>; documentAttributes: interop.Pointer | interop.Reference<NSDictionary<string, any>>; });

	/**
	 * @since 7.0
	 * @deprecated 9.0
	 */
	constructor(o: { fileURL: NSURL; options: NSDictionary<any, any>; documentAttributes: interop.Pointer | interop.Reference<NSDictionary<any, any>>; });

	/**
	 * @since 15.0
	 */
	constructor(o: { markdown: NSData; options: NSAttributedStringMarkdownParsingOptions; baseURL: NSURL; });

	/**
	 * @since 15.0
	 */
	constructor(o: { markdownString: string; options: NSAttributedStringMarkdownParsingOptions; baseURL: NSURL; });

	constructor(o: { string: string; });

	constructor(o: { string: string; attributes: NSDictionary<string, any>; });

	/**
	 * @since 9.0
	 */
	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; documentAttributes: interop.Pointer | interop.Reference<NSDictionary<string, any>>; });

	attributeAtIndexEffectiveRange(attrName: string, location: number, range: interop.Pointer | interop.Reference<NSRange>): any;

	attributeAtIndexLongestEffectiveRangeInRange(attrName: string, location: number, range: interop.Pointer | interop.Reference<NSRange>, rangeLimit: NSRange): any;

	/**
	 * @since 15.0
	 */
	attributedStringByInflectingString(): NSAttributedString;

	attributedSubstringFromRange(range: NSRange): NSAttributedString;

	attributesAtIndexEffectiveRange(location: number, range: interop.Pointer | interop.Reference<NSRange>): NSDictionary<string, any>;

	attributesAtIndexLongestEffectiveRangeInRange(location: number, range: interop.Pointer | interop.Reference<NSRange>, rangeLimit: NSRange): NSDictionary<string, any>;

	/**
	 * @since 6.0
	 */
	boundingRectWithSizeOptionsContext(size: CGSize, options: NSStringDrawingOptions, context: NSStringDrawingContext): CGRect;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	containsAttachmentsInRange(range: NSRange): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 7.0
	 */
	dataFromRangeDocumentAttributesError(range: NSRange, dict: NSDictionary<string, any>): NSData;

	/**
	 * @since 6.0
	 */
	drawAtPoint(point: CGPoint): void;

	/**
	 * @since 6.0
	 */
	drawInRect(rect: CGRect): void;

	/**
	 * @since 6.0
	 */
	drawWithRectOptionsContext(rect: CGRect, options: NSStringDrawingOptions, context: NSStringDrawingContext): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateAttributeInRangeOptionsUsingBlock(attrName: string, enumerationRange: NSRange, opts: NSAttributedStringEnumerationOptions, block: (p1: any, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateAttributesInRangeOptionsUsingBlock(enumerationRange: NSRange, opts: NSAttributedStringEnumerationOptions, block: (p1: NSDictionary<string, any>, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 7.0
	 */
	fileWrapperFromRangeDocumentAttributesError(range: NSRange, dict: NSDictionary<string, any>): NSFileWrapper;

	initWithAttributedString(attrStr: NSAttributedString): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 15.0
	 */
	initWithContentsOfMarkdownFileAtURLOptionsBaseURLError(markdownFile: NSURL, options: NSAttributedStringMarkdownParsingOptions, baseURL: NSURL): this;

	/**
	 * @since 7.0
	 */
	initWithDataOptionsDocumentAttributesError(data: NSData, options: NSDictionary<string, any>, dict: interop.Pointer | interop.Reference<NSDictionary<string, any>>): this;

	/**
	 * @since 7.0
	 * @deprecated 9.0
	 */
	initWithFileURLOptionsDocumentAttributesError(url: NSURL, options: NSDictionary<any, any>, dict: interop.Pointer | interop.Reference<NSDictionary<any, any>>): this;

	/**
	 * @since 15.0
	 */
	initWithMarkdownOptionsBaseURLError(markdown: NSData, options: NSAttributedStringMarkdownParsingOptions, baseURL: NSURL): this;

	/**
	 * @since 15.0
	 */
	initWithMarkdownStringOptionsBaseURLError(markdownString: string, options: NSAttributedStringMarkdownParsingOptions, baseURL: NSURL): this;

	initWithString(str: string): this;

	initWithStringAttributes(str: string, attrs: NSDictionary<string, any>): this;

	/**
	 * @since 9.0
	 */
	initWithURLOptionsDocumentAttributesError(url: NSURL, options: NSDictionary<string, any>, dict: interop.Pointer | interop.Reference<NSDictionary<string, any>>): this;

	isEqual(object: any): boolean;

	isEqualToAttributedString(other: NSAttributedString): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 18.0
	 */
	prefersRTFDInRange(range: NSRange): boolean;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 6.0
	 */
	size(): CGSize;
}

declare const enum NSAttributedStringEnumerationOptions {

	Reverse = 2,

	LongestEffectiveRangeNotRequired = 1048576
}

declare const enum NSAttributedStringFormattingOptions {

	InsertArgumentAttributesWithoutMerging = 1,

	ApplyReplacementIndexAttribute = 2
}

/**
 * @since 15.0
 */
declare const enum NSAttributedStringMarkdownInterpretedSyntax {

	Full = 0,

	InlineOnly = 1,

	InlineOnlyPreservingWhitespace = 2
}

/**
 * @since 15.0
 */
declare const enum NSAttributedStringMarkdownParsingFailurePolicy {

	ReturnError = 0,

	ReturnPartiallyParsedIfPossible = 1
}

/**
 * @since 15.0
 */
declare class NSAttributedStringMarkdownParsingOptions extends NSObject implements NSCopying {

	static alloc(): NSAttributedStringMarkdownParsingOptions; // inherited from NSObject

	static new(): NSAttributedStringMarkdownParsingOptions; // inherited from NSObject

	allowsExtendedAttributes: boolean;

	/**
	 * @since 16.0
	 */
	appliesSourcePositionAttributes: boolean;

	failurePolicy: NSAttributedStringMarkdownParsingFailurePolicy;

	interpretedSyntax: NSAttributedStringMarkdownInterpretedSyntax;

	languageCode: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare class NSAttributedStringMarkdownSourcePosition extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSAttributedStringMarkdownSourcePosition; // inherited from NSObject

	static new(): NSAttributedStringMarkdownSourcePosition; // inherited from NSObject

	readonly endColumn: number;

	readonly endLine: number;

	readonly startColumn: number;

	readonly startLine: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { startLine: number; startColumn: number; endLine: number; endColumn: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStartLineStartColumnEndLineEndColumn(startLine: number, startColumn: number, endLine: number, endColumn: number): this;

	rangeInString(string: string): NSRange;
}

declare class NSAutoreleasePool extends NSObject {

	static addObject(anObject: any): void;

	static alloc(): NSAutoreleasePool; // inherited from NSObject

	static new(): NSAutoreleasePool; // inherited from NSObject

	addObject(anObject: any): void;

	drain(): void;
}

declare var NSAverageKeyValueOperator: string;

declare const enum NSBinarySearchingOptions {

	FirstEqual = 256,

	LastEqual = 512,

	InsertionIndex = 1024
}

/**
 * @since 4.0
 */
declare class NSBlockOperation extends NSOperation {

	static alloc(): NSBlockOperation; // inherited from NSObject

	static blockOperationWithBlock(block: () => void): NSBlockOperation;

	static new(): NSBlockOperation; // inherited from NSObject

	readonly executionBlocks: NSArray<() => void>;

	addExecutionBlock(block: () => void): void;
}

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSBuddhistCalendar: string;

declare class NSBundle extends NSObject {

	/**
	 * @since 4.0
	 */
	static URLForResourceWithExtensionSubdirectoryInBundleWithURL(name: string, ext: string, subpath: string, bundleURL: NSURL): NSURL;

	/**
	 * @since 4.0
	 */
	static URLsForResourcesWithExtensionSubdirectoryInBundleWithURL(ext: string, subpath: string, bundleURL: NSURL): NSArray<NSURL>;

	static alloc(): NSBundle; // inherited from NSObject

	static bundleForClass(aClass: typeof NSObject): NSBundle;

	static bundleWithIdentifier(identifier: string): NSBundle;

	static bundleWithPath(path: string): NSBundle;

	/**
	 * @since 4.0
	 */
	static bundleWithURL(url: NSURL): NSBundle;

	static new(): NSBundle; // inherited from NSObject

	static pathForResourceOfTypeInDirectory(name: string, ext: string, bundlePath: string): string;

	static pathsForResourcesOfTypeInDirectory(ext: string, bundlePath: string): NSArray<string>;

	static preferredLocalizationsFromArray(localizationsArray: NSArray<string> | string[]): NSArray<string>;

	static preferredLocalizationsFromArrayForPreferences(localizationsArray: NSArray<string> | string[], preferencesArray: NSArray<string> | string[]): NSArray<string>;

	/**
	 * @since 7.0
	 */
	readonly appStoreReceiptURL: NSURL;

	readonly builtInPlugInsPath: string;

	/**
	 * @since 4.0
	 */
	readonly builtInPlugInsURL: NSURL;

	readonly bundleIdentifier: string;

	readonly bundlePath: string;

	/**
	 * @since 4.0
	 */
	readonly bundleURL: NSURL;

	readonly developmentLocalization: string;

	/**
	 * @since 2.0
	 */
	readonly executableArchitectures: NSArray<number>;

	readonly executablePath: string;

	/**
	 * @since 4.0
	 */
	readonly executableURL: NSURL;

	readonly infoDictionary: NSDictionary<string, any>;

	readonly loaded: boolean;

	readonly localizations: NSArray<string>;

	readonly localizedInfoDictionary: NSDictionary<string, any>;

	readonly preferredLocalizations: NSArray<string>;

	readonly principalClass: typeof NSObject;

	readonly privateFrameworksPath: string;

	/**
	 * @since 4.0
	 */
	readonly privateFrameworksURL: NSURL;

	readonly resourcePath: string;

	/**
	 * @since 4.0
	 */
	readonly resourceURL: NSURL;

	readonly sharedFrameworksPath: string;

	/**
	 * @since 4.0
	 */
	readonly sharedFrameworksURL: NSURL;

	readonly sharedSupportPath: string;

	/**
	 * @since 4.0
	 */
	readonly sharedSupportURL: NSURL;

	static readonly allBundles: NSArray<NSBundle>;

	static readonly allFrameworks: NSArray<NSBundle>;

	static readonly mainBundle: NSBundle;

	constructor(o: { path: string; });

	/**
	 * @since 4.0
	 */
	constructor(o: { URL: NSURL; });

	/**
	 * @since 4.0
	 */
	URLForAuxiliaryExecutable(executableName: string): NSURL;

	/**
	 * @since 4.0
	 */
	URLForResourceWithExtension(name: string, ext: string): NSURL;

	/**
	 * @since 4.0
	 */
	URLForResourceWithExtensionSubdirectory(name: string, ext: string, subpath: string): NSURL;

	/**
	 * @since 4.0
	 */
	URLForResourceWithExtensionSubdirectoryLocalization(name: string, ext: string, subpath: string, localizationName: string): NSURL;

	/**
	 * @since 4.0
	 */
	URLsForResourcesWithExtensionSubdirectory(ext: string, subpath: string): NSArray<NSURL>;

	/**
	 * @since 4.0
	 */
	URLsForResourcesWithExtensionSubdirectoryLocalization(ext: string, subpath: string, localizationName: string): NSArray<NSURL>;

	classNamed(className: string): typeof NSObject;

	initWithPath(path: string): this;

	/**
	 * @since 4.0
	 */
	initWithURL(url: NSURL): this;

	load(): boolean;

	/**
	 * @since 2.0
	 */
	loadAndReturnError(): boolean;

	loadNibNamedOwnerOptions(name: string, owner: any, options: NSDictionary<string, any>): NSArray<any>;

	/**
	 * @since 15.0
	 */
	localizedAttributedStringForKeyValueTable(key: string, value: string, tableName: string): NSAttributedString;

	localizedStringForKeyValueTable(key: string, value: string, tableName: string): string;

	objectForInfoDictionaryKey(key: string): any;

	pathForAuxiliaryExecutable(executableName: string): string;

	pathForResourceOfType(name: string, ext: string): string;

	pathForResourceOfTypeInDirectory(name: string, ext: string, subpath: string): string;

	pathForResourceOfTypeInDirectoryForLocalization(name: string, ext: string, subpath: string, localizationName: string): string;

	pathsForResourcesOfTypeInDirectory(ext: string, subpath: string): NSArray<string>;

	pathsForResourcesOfTypeInDirectoryForLocalization(ext: string, subpath: string, localizationName: string): NSArray<string>;

	/**
	 * @since 2.0
	 */
	preflightAndReturnError(): boolean;

	/**
	 * @since 9.0
	 */
	preservationPriorityForTag(tag: string): number;

	/**
	 * @since 9.0
	 */
	setPreservationPriorityForTags(priority: number, tags: NSSet<string>): void;

	unload(): boolean;
}

declare var NSBundleDidLoadNotification: string;

declare const NSBundleErrorMaximum: number;

declare const NSBundleErrorMinimum: number;

declare const NSBundleExecutableArchitectureARM64: number;

declare const NSBundleExecutableArchitectureI386: number;

declare const NSBundleExecutableArchitecturePPC: number;

declare const NSBundleExecutableArchitecturePPC64: number;

declare const NSBundleExecutableArchitectureX86_64: number;

declare const NSBundleOnDemandResourceExceededMaximumSizeError: number;

declare const NSBundleOnDemandResourceInvalidTagError: number;

declare const NSBundleOnDemandResourceOutOfSpaceError: number;

/**
 * @since 9.0
 */
declare class NSBundleResourceRequest extends NSObject implements NSProgressReporting {

	static alloc(): NSBundleResourceRequest; // inherited from NSObject

	static new(): NSBundleResourceRequest; // inherited from NSObject

	readonly bundle: NSBundle;

	loadingPriority: number;

	readonly tags: NSSet<string>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { tags: NSSet<string>; });

	constructor(o: { tags: NSSet<string>; bundle: NSBundle; });

	beginAccessingResourcesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	class(): typeof NSObject;

	conditionallyBeginAccessingResourcesWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	endAccessingResources(): void;

	initWithTags(tags: NSSet<string>): this;

	initWithTagsBundle(tags: NSSet<string>, bundle: NSBundle): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 9.0
 */
declare var NSBundleResourceRequestLoadingPriorityUrgent: number;

/**
 * @since 9.0
 */
declare var NSBundleResourceRequestLowDiskSpaceNotification: string;

/**
 * @since 6.0
 */
declare class NSByteCountFormatter extends NSFormatter {

	static alloc(): NSByteCountFormatter; // inherited from NSObject

	static new(): NSByteCountFormatter; // inherited from NSObject

	static stringFromByteCountCountStyle(byteCount: number, countStyle: NSByteCountFormatterCountStyle): string;

	/**
	 * @since 13.0
	 */
	static stringFromMeasurementCountStyle(measurement: NSMeasurement<NSUnitInformationStorage>, countStyle: NSByteCountFormatterCountStyle): string;

	adaptive: boolean;

	allowedUnits: NSByteCountFormatterUnits;

	allowsNonnumericFormatting: boolean;

	countStyle: NSByteCountFormatterCountStyle;

	/**
	 * @since 8.0
	 */
	formattingContext: NSFormattingContext;

	includesActualByteCount: boolean;

	includesCount: boolean;

	includesUnit: boolean;

	zeroPadsFractionDigits: boolean;

	stringFromByteCount(byteCount: number): string;

	/**
	 * @since 13.0
	 */
	stringFromMeasurement(measurement: NSMeasurement<NSUnitInformationStorage>): string;
}

declare const enum NSByteCountFormatterCountStyle {

	File = 0,

	Memory = 1,

	Decimal = 2,

	Binary = 3
}

declare const enum NSByteCountFormatterUnits {

	UseDefault = 0,

	UseBytes = 1,

	UseKB = 2,

	UseMB = 4,

	UseGB = 8,

	UseTB = 16,

	UsePB = 32,

	UseEB = 64,

	UseZB = 128,

	UseYBOrHigher = 65280,

	UseAll = 65535
}

/**
 * @since 4.0
 */
declare class NSCache<KeyType, ObjectType> extends NSObject {

	static alloc<KeyType, ObjectType>(): NSCache<KeyType, ObjectType>; // inherited from NSObject

	static new<KeyType, ObjectType>(): NSCache<KeyType, ObjectType>; // inherited from NSObject

	countLimit: number;

	delegate: NSCacheDelegate;

	evictsObjectsWithDiscardedContent: boolean;

	name: string;

	totalCostLimit: number;

	objectForKey(key: any): any;

	removeAllObjects(): void;

	removeObjectForKey(key: any): void;

	setObjectForKey(obj: any, key: any): void;

	setObjectForKeyCost(obj: any, key: any, g: number): void;
}

interface NSCacheDelegate extends NSObjectProtocol {

	cacheWillEvictObject?(cache: NSCache<any, any>, obj: any): void;
}
declare var NSCacheDelegate: {

	prototype: NSCacheDelegate;
};

/**
 * @since 2.0
 */
declare class NSCachedURLResponse extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSCachedURLResponse; // inherited from NSObject

	static new(): NSCachedURLResponse; // inherited from NSObject

	readonly data: NSData;

	readonly response: NSURLResponse;

	readonly storagePolicy: NSURLCacheStoragePolicy;

	readonly userInfo: NSDictionary<any, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { response: NSURLResponse; data: NSData; });

	constructor(o: { response: NSURLResponse; data: NSData; userInfo: NSDictionary<any, any>; storagePolicy: NSURLCacheStoragePolicy; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithResponseData(response: NSURLResponse, data: NSData): this;

	initWithResponseDataUserInfoStoragePolicy(response: NSURLResponse, data: NSData, userInfo: NSDictionary<any, any>, storagePolicy: NSURLCacheStoragePolicy): this;
}

declare const enum NSCalculationError {

	NoError = 0,

	LossOfPrecision = 1,

	Underflow = 2,

	Overflow = 3,

	DivideByZero = 4
}

declare class NSCalendar extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSCalendar; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static calendarWithIdentifier(calendarIdentifierConstant: string): NSCalendar;

	static new(): NSCalendar; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	readonly AMSymbol: string;

	/**
	 * @since 5.0
	 */
	readonly PMSymbol: string;

	readonly calendarIdentifier: string;

	/**
	 * @since 5.0
	 */
	readonly eraSymbols: NSArray<string>;

	firstWeekday: number;

	locale: NSLocale;

	/**
	 * @since 5.0
	 */
	readonly longEraSymbols: NSArray<string>;

	minimumDaysInFirstWeek: number;

	/**
	 * @since 5.0
	 */
	readonly monthSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly quarterSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly shortMonthSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly shortQuarterSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly shortStandaloneMonthSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly shortStandaloneQuarterSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly shortStandaloneWeekdaySymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly shortWeekdaySymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly standaloneMonthSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly standaloneQuarterSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly standaloneWeekdaySymbols: NSArray<string>;

	timeZone: NSTimeZone;

	/**
	 * @since 5.0
	 */
	readonly veryShortMonthSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly veryShortStandaloneMonthSymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly veryShortStandaloneWeekdaySymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly veryShortWeekdaySymbols: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly weekdaySymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	static readonly autoupdatingCurrentCalendar: NSCalendar;

	static readonly currentCalendar: NSCalendar;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { calendarIdentifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 8.0
	 */
	compareDateToDateToUnitGranularity(date1: Date, date2: Date, unit: NSCalendarUnit): NSComparisonResult;

	/**
	 * @since 8.0
	 */
	componentFromDate(unit: NSCalendarUnit, date: Date): number;

	componentsFromDate(unitFlags: NSCalendarUnit, date: Date): NSDateComponents;

	/**
	 * @since 8.0
	 */
	componentsFromDateComponentsToDateComponentsOptions(unitFlags: NSCalendarUnit, startingDateComp: NSDateComponents, resultDateComp: NSDateComponents, options: NSCalendarOptions): NSDateComponents;

	componentsFromDateToDateOptions(unitFlags: NSCalendarUnit, startingDate: Date, resultDate: Date, opts: NSCalendarOptions): NSDateComponents;

	/**
	 * @since 8.0
	 */
	componentsInTimeZoneFromDate(timezone: NSTimeZone, date: Date): NSDateComponents;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dateByAddingComponentsToDateOptions(comps: NSDateComponents, date: Date, opts: NSCalendarOptions): Date;

	/**
	 * @since 8.0
	 */
	dateByAddingUnitValueToDateOptions(unit: NSCalendarUnit, value: number, date: Date, options: NSCalendarOptions): Date;

	/**
	 * @since 8.0
	 */
	dateBySettingHourMinuteSecondOfDateOptions(h: number, m: number, s: number, date: Date, opts: NSCalendarOptions): Date;

	/**
	 * @since 8.0
	 */
	dateBySettingUnitValueOfDateOptions(unit: NSCalendarUnit, v: number, date: Date, opts: NSCalendarOptions): Date;

	dateFromComponents(comps: NSDateComponents): Date;

	/**
	 * @since 8.0
	 */
	dateMatchesComponents(date: Date, components: NSDateComponents): boolean;

	/**
	 * @since 8.0
	 */
	dateWithEraYearForWeekOfYearWeekOfYearWeekdayHourMinuteSecondNanosecond(eraValue: number, yearValue: number, weekValue: number, weekdayValue: number, hourValue: number, minuteValue: number, secondValue: number, nanosecondValue: number): Date;

	/**
	 * @since 8.0
	 */
	dateWithEraYearMonthDayHourMinuteSecondNanosecond(eraValue: number, yearValue: number, monthValue: number, dayValue: number, hourValue: number, minuteValue: number, secondValue: number, nanosecondValue: number): Date;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 8.0
	 */
	enumerateDatesStartingAfterDateMatchingComponentsOptionsUsingBlock(start: Date, comps: NSDateComponents, opts: NSCalendarOptions, block: (p1: Date, p2: boolean, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 8.0
	 */
	getEraYearForWeekOfYearWeekOfYearWeekdayFromDate(eraValuePointer: interop.Pointer | interop.Reference<number>, yearValuePointer: interop.Pointer | interop.Reference<number>, weekValuePointer: interop.Pointer | interop.Reference<number>, weekdayValuePointer: interop.Pointer | interop.Reference<number>, date: Date): void;

	/**
	 * @since 8.0
	 */
	getEraYearMonthDayFromDate(eraValuePointer: interop.Pointer | interop.Reference<number>, yearValuePointer: interop.Pointer | interop.Reference<number>, monthValuePointer: interop.Pointer | interop.Reference<number>, dayValuePointer: interop.Pointer | interop.Reference<number>, date: Date): void;

	/**
	 * @since 8.0
	 */
	getHourMinuteSecondNanosecondFromDate(hourValuePointer: interop.Pointer | interop.Reference<number>, minuteValuePointer: interop.Pointer | interop.Reference<number>, secondValuePointer: interop.Pointer | interop.Reference<number>, nanosecondValuePointer: interop.Pointer | interop.Reference<number>, date: Date): void;

	initWithCalendarIdentifier(ident: string): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 */
	isDateEqualToDateToUnitGranularity(date1: Date, date2: Date, unit: NSCalendarUnit): boolean;

	/**
	 * @since 8.0
	 */
	isDateInSameDayAsDate(date1: Date, date2: Date): boolean;

	/**
	 * @since 8.0
	 */
	isDateInToday(date: Date): boolean;

	/**
	 * @since 8.0
	 */
	isDateInTomorrow(date: Date): boolean;

	/**
	 * @since 8.0
	 */
	isDateInWeekend(date: Date): boolean;

	/**
	 * @since 8.0
	 */
	isDateInYesterday(date: Date): boolean;

	maximumRangeOfUnit(unit: NSCalendarUnit): NSRange;

	minimumRangeOfUnit(unit: NSCalendarUnit): NSRange;

	/**
	 * @since 8.0
	 */
	nextDateAfterDateMatchingComponentsOptions(date: Date, comps: NSDateComponents, options: NSCalendarOptions): Date;

	/**
	 * @since 8.0
	 */
	nextDateAfterDateMatchingHourMinuteSecondOptions(date: Date, hourValue: number, minuteValue: number, secondValue: number, options: NSCalendarOptions): Date;

	/**
	 * @since 8.0
	 */
	nextDateAfterDateMatchingUnitValueOptions(date: Date, unit: NSCalendarUnit, value: number, options: NSCalendarOptions): Date;

	/**
	 * @since 8.0
	 */
	nextWeekendStartDateIntervalOptionsAfterDate(datep: interop.Pointer | interop.Reference<Date>, tip: interop.Pointer | interop.Reference<number>, options: NSCalendarOptions, date: Date): boolean;

	ordinalityOfUnitInUnitForDate(smaller: NSCalendarUnit, larger: NSCalendarUnit, date: Date): number;

	rangeOfUnitInUnitForDate(smaller: NSCalendarUnit, larger: NSCalendarUnit, date: Date): NSRange;

	/**
	 * @since 2.0
	 */
	rangeOfUnitStartDateIntervalForDate(unit: NSCalendarUnit, datep: interop.Pointer | interop.Reference<Date>, tip: interop.Pointer | interop.Reference<number>, date: Date): boolean;

	/**
	 * @since 8.0
	 */
	rangeOfWeekendStartDateIntervalContainingDate(datep: interop.Pointer | interop.Reference<Date>, tip: interop.Pointer | interop.Reference<number>, date: Date): boolean;

	/**
	 * @since 8.0
	 */
	startOfDayForDate(date: Date): Date;
}

/**
 * @since 8.0
 */
declare var NSCalendarDayChangedNotification: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierBuddhist: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierChinese: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierCoptic: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierEthiopicAmeteAlem: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierEthiopicAmeteMihret: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierGregorian: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierHebrew: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierISO8601: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierIndian: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierIslamic: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierIslamicCivil: string;

/**
 * @since 8.0
 */
declare var NSCalendarIdentifierIslamicTabular: string;

/**
 * @since 8.0
 */
declare var NSCalendarIdentifierIslamicUmmAlQura: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierJapanese: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierPersian: string;

/**
 * @since 4.0
 */
declare var NSCalendarIdentifierRepublicOfChina: string;

declare const enum NSCalendarOptions {

	WrapComponents = 1,

	MatchStrictly = 2,

	SearchBackwards = 4,

	MatchPreviousTimePreservingSmallerUnits = 256,

	MatchNextTimePreservingSmallerUnits = 512,

	MatchNextTime = 1024,

	MatchFirst = 4096,

	MatchLast = 8192
}

declare const enum NSCalendarUnit {

	CalendarUnitEra = 2,

	CalendarUnitYear = 4,

	CalendarUnitMonth = 8,

	CalendarUnitDay = 16,

	CalendarUnitHour = 32,

	CalendarUnitMinute = 64,

	CalendarUnitSecond = 128,

	CalendarUnitWeekday = 512,

	CalendarUnitWeekdayOrdinal = 1024,

	CalendarUnitQuarter = 2048,

	CalendarUnitWeekOfMonth = 4096,

	CalendarUnitWeekOfYear = 8192,

	CalendarUnitYearForWeekOfYear = 16384,

	CalendarUnitNanosecond = 32768,

	CalendarUnitDayOfYear = 65536,

	CalendarUnitCalendar = 1048576,

	CalendarUnitTimeZone = 2097152,

	EraCalendarUnit = 2,

	YearCalendarUnit = 4,

	MonthCalendarUnit = 8,

	DayCalendarUnit = 16,

	HourCalendarUnit = 32,

	MinuteCalendarUnit = 64,

	SecondCalendarUnit = 128,

	WeekCalendarUnit = 256,

	WeekdayCalendarUnit = 512,

	WeekdayOrdinalCalendarUnit = 1024,

	QuarterCalendarUnit = 2048,

	WeekOfMonthCalendarUnit = 4096,

	WeekOfYearCalendarUnit = 8192,

	YearForWeekOfYearCalendarUnit = 16384,

	CalendarCalendarUnit = 1048576,

	TimeZoneCalendarUnit = 2097152
}

declare var NSCharacterConversionException: string;

declare class NSCharacterSet extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSCharacterSet; // inherited from NSObject

	static characterSetWithBitmapRepresentation(data: NSData): NSCharacterSet;

	static characterSetWithCharactersInString(aString: string): NSCharacterSet;

	static characterSetWithContentsOfFile(fName: string): NSCharacterSet;

	static characterSetWithRange(aRange: NSRange): NSCharacterSet;

	static new(): NSCharacterSet; // inherited from NSObject

	readonly bitmapRepresentation: NSData;

	readonly invertedSet: NSCharacterSet;

	/**
	 * @since 7.0
	 */
	static readonly URLFragmentAllowedCharacterSet: NSCharacterSet;

	/**
	 * @since 7.0
	 */
	static readonly URLHostAllowedCharacterSet: NSCharacterSet;

	/**
	 * @since 7.0
	 */
	static readonly URLPasswordAllowedCharacterSet: NSCharacterSet;

	/**
	 * @since 7.0
	 */
	static readonly URLPathAllowedCharacterSet: NSCharacterSet;

	/**
	 * @since 7.0
	 */
	static readonly URLQueryAllowedCharacterSet: NSCharacterSet;

	/**
	 * @since 7.0
	 */
	static readonly URLUserAllowedCharacterSet: NSCharacterSet;

	static readonly alphanumericCharacterSet: NSCharacterSet;

	static readonly capitalizedLetterCharacterSet: NSCharacterSet;

	static readonly controlCharacterSet: NSCharacterSet;

	static readonly decimalDigitCharacterSet: NSCharacterSet;

	static readonly decomposableCharacterSet: NSCharacterSet;

	static readonly illegalCharacterSet: NSCharacterSet;

	static readonly letterCharacterSet: NSCharacterSet;

	static readonly lowercaseLetterCharacterSet: NSCharacterSet;

	/**
	 * @since 2.0
	 */
	static readonly newlineCharacterSet: NSCharacterSet;

	static readonly nonBaseCharacterSet: NSCharacterSet;

	static readonly punctuationCharacterSet: NSCharacterSet;

	static readonly symbolCharacterSet: NSCharacterSet;

	static readonly uppercaseLetterCharacterSet: NSCharacterSet;

	static readonly whitespaceAndNewlineCharacterSet: NSCharacterSet;

	static readonly whitespaceCharacterSet: NSCharacterSet;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	characterIsMember(aCharacter: string): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	hasMemberInPlane(thePlane: number): boolean;

	initWithCoder(coder: NSCoder): this;

	isSupersetOfSet(theOtherSet: NSCharacterSet): boolean;

	longCharacterIsMember(theLongChar: number): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSChineseCalendar: string;

declare function NSClassFromString(aClassName: string): typeof NSObject;

declare const NSCloudSharingConflictError: number;

declare const NSCloudSharingErrorMaximum: number;

declare const NSCloudSharingErrorMinimum: number;

declare const NSCloudSharingNetworkFailureError: number;

declare const NSCloudSharingNoPermissionError: number;

declare const NSCloudSharingOtherError: number;

declare const NSCloudSharingQuotaExceededError: number;

declare const NSCloudSharingTooManyParticipantsError: number;

declare var NSCocoaErrorDomain: string;

declare class NSCoder extends NSObject {

	static alloc(): NSCoder; // inherited from NSObject

	static new(): NSCoder; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly allowedClasses: NSSet<typeof NSObject>;

	readonly allowsKeyedCoding: boolean;

	/**
	 * @since 9.0
	 */
	readonly decodingFailurePolicy: NSDecodingFailurePolicy;

	/**
	 * @since 9.0
	 */
	readonly error: NSError;

	/**
	 * @since 6.0
	 */
	readonly requiresSecureCoding: boolean;

	readonly systemVersion: number;

	containsValueForKey(key: string): boolean;

	decodeArrayOfObjCTypeCountAt(itemType: string | interop.Pointer | interop.Reference<any>, count: number, array: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 14.0
	 */
	decodeArrayOfObjectsOfClassForKey(cls: typeof NSObject, key: string): NSArray<any>;

	/**
	 * @since 14.0
	 */
	decodeArrayOfObjectsOfClassesForKey(classes: NSSet<typeof NSObject>, key: string): NSArray<any>;

	decodeBoolForKey(key: string): boolean;

	decodeBytesForKeyReturnedLength(key: string, lengthp: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

	decodeBytesWithReturnedLength(lengthp: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

	decodeCGAffineTransformForKey(key: string): CGAffineTransform;

	decodeCGPointForKey(key: string): CGPoint;

	decodeCGRectForKey(key: string): CGRect;

	decodeCGSizeForKey(key: string): CGSize;

	decodeCGVectorForKey(key: string): CGVector;

	/**
	 * @since 4.0
	 */
	decodeCMTimeForKey(key: string): CMTime;

	/**
	 * @since 4.0
	 */
	decodeCMTimeMappingForKey(key: string): CMTimeMapping;

	/**
	 * @since 4.0
	 */
	decodeCMTimeRangeForKey(key: string): CMTimeRange;

	decodeDataObject(): NSData;

	/**
	 * @since 14.0
	 */
	decodeDictionaryWithKeysOfClassObjectsOfClassForKey(keyCls: typeof NSObject, objectCls: typeof NSObject, key: string): NSDictionary<any, any>;

	/**
	 * @since 14.0
	 */
	decodeDictionaryWithKeysOfClassesObjectsOfClassesForKey(keyClasses: NSSet<typeof NSObject>, objectClasses: NSSet<typeof NSObject>, key: string): NSDictionary<any, any>;

	/**
	 * @since 11.0
	 */
	decodeDirectionalEdgeInsetsForKey(key: string): NSDirectionalEdgeInsets;

	decodeDoubleForKey(key: string): number;

	decodeFloatForKey(key: string): number;

	decodeInt32ForKey(key: string): number;

	decodeInt64ForKey(key: string): number;

	decodeIntForKey(key: string): number;

	/**
	 * @since 2.0
	 */
	decodeIntegerForKey(key: string): number;

	decodeObject(): any;

	decodeObjectForKey(key: string): any;

	/**
	 * @since 6.0
	 */
	decodeObjectOfClassForKey(aClass: typeof NSObject, key: string): any;

	/**
	 * @since 6.0
	 */
	decodeObjectOfClassesForKey(classes: NSSet<typeof NSObject>, key: string): any;

	/**
	 * @since 6.0
	 */
	decodePropertyListForKey(key: string): any;

	/**
	 * @since 9.0
	 */
	decodeTopLevelObjectAndReturnError(): any;

	/**
	 * @since 9.0
	 */
	decodeTopLevelObjectForKeyError(key: string): any;

	/**
	 * @since 9.0
	 */
	decodeTopLevelObjectOfClassForKeyError(aClass: typeof NSObject, key: string): any;

	/**
	 * @since 9.0
	 */
	decodeTopLevelObjectOfClassesForKeyError(classes: NSSet<typeof NSObject>, key: string): any;

	decodeUIEdgeInsetsForKey(key: string): UIEdgeInsets;

	/**
	 * @since 5.0
	 */
	decodeUIOffsetForKey(key: string): UIOffset;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	decodeValueOfObjCTypeAt(type: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 11.0
	 */
	decodeValueOfObjCTypeAtSize(type: string | interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>, size: number): void;

	encodeArrayOfObjCTypeCountAt(type: string | interop.Pointer | interop.Reference<any>, count: number, array: interop.Pointer | interop.Reference<any>): void;

	encodeBoolForKey(value: boolean, key: string): void;

	encodeBycopyObject(anObject: any): void;

	encodeByrefObject(anObject: any): void;

	encodeBytesLength(byteaddr: interop.Pointer | interop.Reference<any>, length: number): void;

	encodeBytesLengthForKey(bytes: string | interop.Pointer | interop.Reference<any>, length: number, key: string): void;

	encodeCGAffineTransformForKey(transform: CGAffineTransform, key: string): void;

	encodeCGPointForKey(point: CGPoint, key: string): void;

	encodeCGRectForKey(rect: CGRect, key: string): void;

	encodeCGSizeForKey(size: CGSize, key: string): void;

	encodeCGVectorForKey(vector: CGVector, key: string): void;

	/**
	 * @since 4.0
	 */
	encodeCMTimeForKey(time: CMTime, key: string): void;

	/**
	 * @since 4.0
	 */
	encodeCMTimeMappingForKey(timeMapping: CMTimeMapping, key: string): void;

	/**
	 * @since 4.0
	 */
	encodeCMTimeRangeForKey(timeRange: CMTimeRange, key: string): void;

	encodeConditionalObject(object: any): void;

	encodeConditionalObjectForKey(object: any, key: string): void;

	encodeDataObject(data: NSData): void;

	/**
	 * @since 11.0
	 */
	encodeDirectionalEdgeInsetsForKey(insets: NSDirectionalEdgeInsets, key: string): void;

	encodeDoubleForKey(value: number, key: string): void;

	encodeFloatForKey(value: number, key: string): void;

	encodeInt32ForKey(value: number, key: string): void;

	encodeInt64ForKey(value: number, key: string): void;

	encodeIntForKey(value: number, key: string): void;

	/**
	 * @since 2.0
	 */
	encodeIntegerForKey(value: number, key: string): void;

	encodeObject(object: any): void;

	encodeObjectForKey(object: any, key: string): void;

	encodeRootObject(rootObject: any): void;

	encodeUIEdgeInsetsForKey(insets: UIEdgeInsets, key: string): void;

	/**
	 * @since 5.0
	 */
	encodeUIOffsetForKey(offset: UIOffset, key: string): void;

	encodeValueOfObjCTypeAt(type: string | interop.Pointer | interop.Reference<any>, addr: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 9.0
	 */
	failWithError(error: NSError): void;

	objectZone(): interop.Pointer | interop.Reference<any>;

	setObjectZone(zone: interop.Pointer | interop.Reference<any>): void;

	versionForClassName(className: string): number;
}

declare const NSCoderErrorMaximum: number;

declare const NSCoderErrorMinimum: number;

declare const NSCoderInvalidValueError: number;

declare const NSCoderReadCorruptError: number;

declare const NSCoderValueNotFoundError: number;

interface NSCoding {

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder?(coder: NSCoder): NSCoding;
}
declare var NSCoding: {

	prototype: NSCoding;
};

/**
 * @since 13.0
 */
declare const enum NSCollectionChangeType {

	Insert = 0,

	Remove = 1
}

declare function NSCompareHashTables(table1: NSHashTable<any>, table2: NSHashTable<any>): boolean;

declare function NSCompareMapTables(table1: NSMapTable<any, any>, table2: NSMapTable<any, any>): boolean;

/**
 * @since 3.0
 */
declare class NSComparisonPredicate extends NSPredicate {

	static alloc(): NSComparisonPredicate; // inherited from NSObject

	static new(): NSComparisonPredicate; // inherited from NSObject

	static predicateWithLeftExpressionRightExpressionCustomSelector(lhs: NSExpression, rhs: NSExpression, selector: string): NSComparisonPredicate;

	static predicateWithLeftExpressionRightExpressionModifierTypeOptions(lhs: NSExpression, rhs: NSExpression, modifier: NSComparisonPredicateModifier, type: NSPredicateOperatorType, options: NSComparisonPredicateOptions): NSComparisonPredicate;

	readonly comparisonPredicateModifier: NSComparisonPredicateModifier;

	readonly customSelector: string;

	readonly leftExpression: NSExpression;

	readonly options: NSComparisonPredicateOptions;

	readonly predicateOperatorType: NSPredicateOperatorType;

	readonly rightExpression: NSExpression;

	constructor(o: { leftExpression: NSExpression; rightExpression: NSExpression; customSelector: string; });

	constructor(o: { leftExpression: NSExpression; rightExpression: NSExpression; modifier: NSComparisonPredicateModifier; type: NSPredicateOperatorType; options: NSComparisonPredicateOptions; });

	initWithLeftExpressionRightExpressionCustomSelector(lhs: NSExpression, rhs: NSExpression, selector: string): this;

	initWithLeftExpressionRightExpressionModifierTypeOptions(lhs: NSExpression, rhs: NSExpression, modifier: NSComparisonPredicateModifier, type: NSPredicateOperatorType, options: NSComparisonPredicateOptions): this;
}

declare const enum NSComparisonPredicateModifier {

	DirectPredicateModifier = 0,

	AllPredicateModifier = 1,

	AnyPredicateModifier = 2
}

declare const enum NSComparisonPredicateOptions {

	CaseInsensitivePredicateOption = 1,

	DiacriticInsensitivePredicateOption = 2,

	NormalizedPredicateOption = 4
}

declare const enum NSComparisonResult {

	OrderedAscending = -1,

	OrderedSame = 0,

	OrderedDescending = 1
}

/**
 * @since 3.0
 */
declare class NSCompoundPredicate extends NSPredicate {

	static alloc(): NSCompoundPredicate; // inherited from NSObject

	static andPredicateWithSubpredicates(subpredicates: NSArray<NSPredicate> | NSPredicate[]): NSCompoundPredicate;

	static new(): NSCompoundPredicate; // inherited from NSObject

	static notPredicateWithSubpredicate(predicate: NSPredicate): NSCompoundPredicate;

	static orPredicateWithSubpredicates(subpredicates: NSArray<NSPredicate> | NSPredicate[]): NSCompoundPredicate;

	readonly compoundPredicateType: NSCompoundPredicateType;

	readonly subpredicates: NSArray<any>;

	constructor(o: { type: NSCompoundPredicateType; subpredicates: NSArray<NSPredicate> | NSPredicate[]; });

	initWithTypeSubpredicates(type: NSCompoundPredicateType, subpredicates: NSArray<NSPredicate> | NSPredicate[]): this;
}

declare const enum NSCompoundPredicateType {

	NotPredicateType = 0,

	AndPredicateType = 1,

	OrPredicateType = 2
}

declare const NSCompressionErrorMaximum: number;

declare const NSCompressionErrorMinimum: number;

declare const NSCompressionFailedError: number;

/**
 * @since 2.0
 */
declare class NSCondition extends NSObject implements NSLocking {

	static alloc(): NSCondition; // inherited from NSObject

	static new(): NSCondition; // inherited from NSObject

	/**
	 * @since 2.0
	 */
	name: string;

	broadcast(): void;

	lock(): void;

	signal(): void;

	unlock(): void;

	wait(): void;

	waitUntilDate(limit: Date): boolean;
}

declare class NSConditionLock extends NSObject implements NSLocking {

	static alloc(): NSConditionLock; // inherited from NSObject

	static new(): NSConditionLock; // inherited from NSObject

	readonly condition: number;

	/**
	 * @since 2.0
	 */
	name: string;

	constructor(o: { condition: number; });

	initWithCondition(condition: number): this;

	lock(): void;

	lockBeforeDate(limit: Date): boolean;

	lockWhenCondition(condition: number): void;

	lockWhenConditionBeforeDate(condition: number, limit: Date): boolean;

	tryLock(): boolean;

	tryLockWhenCondition(condition: number): boolean;

	unlock(): void;

	unlockWithCondition(condition: number): void;
}

declare class NSConstantString extends NSSimpleCString {

	static alloc(): NSConstantString; // inherited from NSObject

	static new(): NSConstantString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSConstantString; // inherited from NSItemProviderReading

	static string(): NSConstantString; // inherited from NSString

	static stringWithCStringEncoding(cString: string | interop.Pointer | interop.Reference<any>, enc: number): NSConstantString; // inherited from NSString

	static stringWithCharactersLength(characters: interop.Pointer | interop.Reference<string>, length: number): NSConstantString; // inherited from NSString

	static stringWithContentsOfFileEncodingError(path: string, enc: number): NSConstantString; // inherited from NSString

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number>): NSConstantString; // inherited from NSString

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number): NSConstantString; // inherited from NSString

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number>): NSConstantString; // inherited from NSString

	static stringWithString(string: string): NSConstantString; // inherited from NSString

	static stringWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>): NSConstantString; // inherited from NSString
}

declare function NSCopyHashTableWithZone(table: NSHashTable<any>, zone: interop.Pointer | interop.Reference<any>): NSHashTable<any>;

declare function NSCopyMapTableWithZone(table: NSMapTable<any, any>, zone: interop.Pointer | interop.Reference<any>): NSMapTable<any, any>;

declare function NSCopyMemoryPages(source: interop.Pointer | interop.Reference<any>, dest: interop.Pointer | interop.Reference<any>, bytes: number): void;

/**
 * @since 2.0
 * @deprecated 6.0
 */
declare function NSCopyObject(object: any, extraBytes: number, zone: interop.Pointer | interop.Reference<any>): any;

interface NSCopying {

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}
declare var NSCopying: {

	prototype: NSCopying;
};

declare function NSCountHashTable(table: NSHashTable<any>): number;

declare var NSCountKeyValueOperator: string;

declare function NSCountMapTable(table: NSMapTable<any, any>): number;

declare class NSCountedSet<ObjectType> extends NSMutableSet<any> {

	static alloc<ObjectType>(): NSCountedSet<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSCountedSet<ObjectType>; // inherited from NSObject

	static set<ObjectType>(): NSCountedSet<ObjectType>; // inherited from NSSet

	static setWithArray<ObjectType>(array: NSArray<any> | any[]): NSCountedSet<ObjectType>; // inherited from NSSet

	static setWithCapacity<ObjectType>(numItems: number): NSCountedSet<ObjectType>; // inherited from NSMutableSet

	static setWithObject<ObjectType>(object: any): NSCountedSet<ObjectType>; // inherited from NSSet

	static setWithObjects<ObjectType>(firstObj: any): NSCountedSet<ObjectType>; // inherited from NSSet

	static setWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSCountedSet<ObjectType>; // inherited from NSSet

	static setWithSet<ObjectType>(set: NSSet<any>): NSCountedSet<ObjectType>; // inherited from NSSet

	countForObject(object: any): number;
}

declare function NSCreateHashTable(callBacks: NSHashTableCallBacks, capacity: number): NSHashTable<any>;

declare function NSCreateHashTableWithZone(callBacks: NSHashTableCallBacks, capacity: number, zone: interop.Pointer | interop.Reference<any>): NSHashTable<any>;

declare function NSCreateMapTable(keyCallBacks: NSMapTableKeyCallBacks, valueCallBacks: NSMapTableValueCallBacks, capacity: number): NSMapTable<any, any>;

declare function NSCreateMapTableWithZone(keyCallBacks: NSMapTableKeyCallBacks, valueCallBacks: NSMapTableValueCallBacks, capacity: number, zone: interop.Pointer | interop.Reference<any>): NSMapTable<any, any>;

declare function NSCreateZone(startSize: number, granularity: number, canFree: boolean): interop.Pointer | interop.Reference<any>;

/**
 * @since 2.0
 */
declare var NSCurrentLocaleDidChangeNotification: string;

declare class NSData extends NSObject implements CKRecordValue, NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSData; // inherited from NSObject

	static data(): NSData;

	static dataWithBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): NSData;

	static dataWithBytesNoCopyLength(bytes: interop.Pointer | interop.Reference<any>, length: number): NSData;

	static dataWithBytesNoCopyLengthFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, length: number, b: boolean): NSData;

	static dataWithContentsOfFile(path: string): NSData;

	static dataWithContentsOfFileCompletion(path: string, callback: (p1: NSData) => void): void;

	static dataWithContentsOfFileOptionsError(path: string, readOptionsMask: NSDataReadingOptions): NSData;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	static dataWithContentsOfMappedFile(path: string): any;

	static dataWithContentsOfURL(url: NSURL): NSData;

	static dataWithContentsOfURLOptionsError(url: NSURL, readOptionsMask: NSDataReadingOptions): NSData;

	static dataWithData(data: NSData): NSData;

	static new(): NSData; // inherited from NSObject

	readonly bytes: interop.Pointer | interop.Reference<any>;

	readonly length: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 7.0
	 */
	constructor(o: { base64EncodedData: NSData; options: NSDataBase64DecodingOptions; });

	/**
	 * @since 7.0
	 */
	constructor(o: { base64EncodedString: string; options: NSDataBase64DecodingOptions; });

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	constructor(o: { base64Encoding: string; });

	constructor(o: { bytes: interop.Pointer | interop.Reference<any>; length: number; });

	constructor(o: { bytesNoCopy: interop.Pointer | interop.Reference<any>; length: number; });

	/**
	 * @since 7.0
	 */
	constructor(o: { bytesNoCopy: interop.Pointer | interop.Reference<any>; length: number; deallocator: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void; });

	constructor(o: { bytesNoCopy: interop.Pointer | interop.Reference<any>; length: number; freeWhenDone: boolean; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfFile: string; });

	constructor(o: { contentsOfFile: string; options: NSDataReadingOptions; });

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	constructor(o: { contentsOfMappedFile: string; });

	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { contentsOfURL: NSURL; options: NSDataReadingOptions; });

	constructor(o: { data: NSData; });

	/**
	 * @since 7.0
	 */
	base64EncodedDataWithOptions(options: NSDataBase64EncodingOptions): NSData;

	/**
	 * @since 7.0
	 */
	base64EncodedStringWithOptions(options: NSDataBase64EncodingOptions): string;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	base64Encoding(): string;

	class(): typeof NSObject;

	/**
	 * @since 13.0
	 */
	compressedDataUsingAlgorithmError(algorithm: NSDataCompressionAlgorithm): this;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 13.0
	 */
	decompressedDataUsingAlgorithmError(algorithm: NSDataCompressionAlgorithm): this;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 7.0
	 */
	enumerateByteRangesUsingBlock(block: (p1: interop.Pointer | interop.Reference<any>, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	getBytes(buffer: interop.Pointer | interop.Reference<any>): void;

	getBytesLength(buffer: interop.Pointer | interop.Reference<any>, length: number): void;

	getBytesRange(buffer: interop.Pointer | interop.Reference<any>, range: NSRange): void;

	/**
	 * @since 7.0
	 */
	initWithBase64EncodedDataOptions(base64Data: NSData, options: NSDataBase64DecodingOptions): this;

	/**
	 * @since 7.0
	 */
	initWithBase64EncodedStringOptions(base64String: string, options: NSDataBase64DecodingOptions): this;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	initWithBase64Encoding(base64String: string): this;

	initWithBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): this;

	initWithBytesNoCopyLength(bytes: interop.Pointer | interop.Reference<any>, length: number): this;

	/**
	 * @since 7.0
	 */
	initWithBytesNoCopyLengthDeallocator(bytes: interop.Pointer | interop.Reference<any>, length: number, deallocator: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): this;

	initWithBytesNoCopyLengthFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, length: number, b: boolean): this;

	initWithCoder(coder: NSCoder): this;

	initWithContentsOfFile(path: string): this;

	initWithContentsOfFileOptionsError(path: string, readOptionsMask: NSDataReadingOptions): this;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	initWithContentsOfMappedFile(path: string): this;

	initWithContentsOfURL(url: NSURL): this;

	initWithContentsOfURLOptionsError(url: NSURL, readOptionsMask: NSDataReadingOptions): this;

	initWithData(data: NSData): this;

	isEqual(object: any): boolean;

	isEqualToData(other: NSData): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 4.0
	 */
	rangeOfDataOptionsRange(dataToFind: NSData, mask: NSDataSearchOptions, searchRange: NSRange): NSRange;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	subdataWithRange(range: NSRange): NSData;

	writeToFileAtomically(path: string, useAuxiliaryFile: boolean): boolean;

	writeToFileAtomicallyCompletion(path: string, atomically: boolean, callback: () => void): void;

	writeToFileOptionsError(path: string, writeOptionsMask: NSDataWritingOptions): boolean;

	writeToURLAtomically(url: NSURL, atomically: boolean): boolean;

	writeToURLOptionsError(url: NSURL, writeOptionsMask: NSDataWritingOptions): boolean;
}

/**
 * @since 7.0
 */
declare const enum NSDataBase64DecodingOptions {

	IgnoreUnknownCharacters = 1
}

/**
 * @since 7.0
 */
declare const enum NSDataBase64EncodingOptions {

	Encoding64CharacterLineLength = 1,

	Encoding76CharacterLineLength = 2,

	EncodingEndLineWithCarriageReturn = 16,

	EncodingEndLineWithLineFeed = 32
}

/**
 * @since 13.0
 */
declare const enum NSDataCompressionAlgorithm {

	LZFSE = 0,

	LZ4 = 1,

	LZMA = 2,

	Zlib = 3
}

/**
 * @since 4.0
 */
declare class NSDataDetector extends NSRegularExpression {

	static alloc(): NSDataDetector; // inherited from NSObject

	static dataDetectorWithTypesError(checkingTypes: number): NSDataDetector;

	static new(): NSDataDetector; // inherited from NSObject

	readonly checkingTypes: number;

	constructor(o: { types: number; });

	initWithTypesError(checkingTypes: number): this;
}

declare const enum NSDataReadingOptions {

	DataReadingMappedIfSafe = 1,

	DataReadingUncached = 2,

	DataReadingMappedAlways = 8,

	DataReadingMapped = 1,

	MappedRead = 1,

	UncachedRead = 2
}

/**
 * @since 4.0
 */
declare const enum NSDataSearchOptions {

	Backwards = 1,

	Anchored = 2
}

declare const enum NSDataWritingOptions {

	DataWritingAtomic = 1,

	DataWritingWithoutOverwriting = 2,

	DataWritingFileProtectionNone = 268435456,

	DataWritingFileProtectionComplete = 536870912,

	DataWritingFileProtectionCompleteUnlessOpen = 805306368,

	DataWritingFileProtectionCompleteUntilFirstUserAuthentication = 1073741824,

	DataWritingFileProtectionCompleteWhenUserInactive = 1342177280,

	DataWritingFileProtectionMask = 4026531840,

	AtomicWrite = 1
}

declare class NSDate extends NSObject implements CKRecordValue, NSCopying, NSSecureCoding {

	static alloc(): NSDate; // inherited from NSObject

	static date(): NSDate;

	static dateWithSRAbsoluteTime(time: number): NSDate;

	static dateWithTimeIntervalSince1970(secs: number): NSDate;

	static dateWithTimeIntervalSinceDate(secsToBeAdded: number, date: Date): NSDate;

	static dateWithTimeIntervalSinceNow(secs: number): NSDate;

	static dateWithTimeIntervalSinceReferenceDate(ti: number): NSDate;

	static new(): NSDate; // inherited from NSObject

	readonly srAbsoluteTime: number;

	readonly timeIntervalSince1970: number;

	readonly timeIntervalSinceNow: number;

	readonly timeIntervalSinceReferenceDate: number;

	static readonly distantFuture: Date;

	static readonly distantPast: Date;

	/**
	 * @since 13.0
	 */
	static readonly now: Date;

	static readonly timeIntervalSinceReferenceDate: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { SRAbsoluteTime: number; });

	constructor(o: { timeIntervalSince1970: number; });

	constructor(o: { timeInterval: number; sinceDate: Date; });

	constructor(o: { timeIntervalSinceNow: number; });

	constructor(o: { timeIntervalSinceReferenceDate: number; });

	/**
	 * @since 2.0
	 * @deprecated 4.0
	 */
	addTimeInterval(seconds: number): any;

	class(): typeof NSObject;

	compare(other: Date): NSComparisonResult;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 2.0
	 */
	dateByAddingTimeInterval(ti: number): this;

	descriptionWithLocale(locale: any): string;

	earlierDate(anotherDate: Date): Date;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSRAbsoluteTime(time: number): this;

	initWithTimeIntervalSince1970(secs: number): this;

	initWithTimeIntervalSinceDate(secsToBeAdded: number, date: Date): this;

	initWithTimeIntervalSinceNow(secs: number): this;

	initWithTimeIntervalSinceReferenceDate(ti: number): this;

	isEqual(object: any): boolean;

	isEqualToDate(otherDate: Date): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	laterDate(anotherDate: Date): Date;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	timeIntervalSinceDate(anotherDate: Date): number;
}

declare const NSDateComponentUndefined: number;

declare class NSDateComponents extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSDateComponents; // inherited from NSObject

	static new(): NSDateComponents; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	calendar: NSCalendar;

	/**
	 * @since 4.0
	 */
	readonly date: Date;

	day: number;

	/**
	 * @since 18.0
	 */
	dayOfYear: number;

	era: number;

	hour: number;

	/**
	 * @since 6.0
	 */
	leapMonth: boolean;

	minute: number;

	month: number;

	/**
	 * @since 5.0
	 */
	nanosecond: number;

	/**
	 * @since 4.0
	 */
	quarter: number;

	second: number;

	/**
	 * @since 4.0
	 */
	timeZone: NSTimeZone;

	/**
	 * @since 8.0
	 */
	readonly validDate: boolean;

	/**
	 * @since 5.0
	 */
	weekOfMonth: number;

	/**
	 * @since 5.0
	 */
	weekOfYear: number;

	weekday: number;

	weekdayOrdinal: number;

	year: number;

	/**
	 * @since 5.0
	 */
	yearForWeekOfYear: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 */
	isValidDateInCalendar(calendar: NSCalendar): boolean;

	/**
	 * @since 8.0
	 */
	setValueForComponent(value: number, unit: NSCalendarUnit): void;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	setWeek(v: number): void;

	/**
	 * @since 8.0
	 */
	valueForComponent(unit: NSCalendarUnit): number;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	week(): number;
}

/**
 * @since 8.0
 */
declare class NSDateComponentsFormatter extends NSFormatter {

	static alloc(): NSDateComponentsFormatter; // inherited from NSObject

	static localizedStringFromDateComponentsUnitsStyle(components: NSDateComponents, unitsStyle: NSDateComponentsFormatterUnitsStyle): string;

	static new(): NSDateComponentsFormatter; // inherited from NSObject

	allowedUnits: NSCalendarUnit;

	allowsFractionalUnits: boolean;

	calendar: NSCalendar;

	collapsesLargestUnit: boolean;

	formattingContext: NSFormattingContext;

	includesApproximationPhrase: boolean;

	includesTimeRemainingPhrase: boolean;

	maximumUnitCount: number;

	/**
	 * @since 11.0
	 */
	referenceDate: Date;

	unitsStyle: NSDateComponentsFormatterUnitsStyle;

	zeroFormattingBehavior: NSDateComponentsFormatterZeroFormattingBehavior;

	stringFromDateComponents(components: NSDateComponents): string;

	stringFromDateToDate(startDate: Date, endDate: Date): string;

	stringFromTimeInterval(ti: number): string;
}

declare const enum NSDateComponentsFormatterUnitsStyle {

	Positional = 0,

	Abbreviated = 1,

	Short = 2,

	Full = 3,

	SpellOut = 4,

	Brief = 5
}

declare const enum NSDateComponentsFormatterZeroFormattingBehavior {

	None = 0,

	Default = 1,

	DropLeading = 2,

	DropMiddle = 4,

	DropTrailing = 8,

	DropAll = 14,

	Pad = 65536
}

declare class NSDateFormatter extends NSFormatter {

	static alloc(): NSDateFormatter; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static dateFormatFromTemplateOptionsLocale(tmplate: string, opts: number, locale: NSLocale): string;

	/**
	 * @since 4.0
	 */
	static localizedStringFromDateDateStyleTimeStyle(date: Date, dstyle: NSDateFormatterStyle, tstyle: NSDateFormatterStyle): string;

	static new(): NSDateFormatter; // inherited from NSObject

	AMSymbol: string;

	PMSymbol: string;

	calendar: NSCalendar;

	dateFormat: string;

	dateStyle: NSDateFormatterStyle;

	defaultDate: Date;

	/**
	 * @since 4.0
	 */
	doesRelativeDateFormatting: boolean;

	eraSymbols: NSArray<string>;

	formatterBehavior: NSDateFormatterBehavior;

	/**
	 * @since 8.0
	 */
	formattingContext: NSFormattingContext;

	generatesCalendarDates: boolean;

	/**
	 * @since 2.0
	 */
	gregorianStartDate: Date;

	lenient: boolean;

	locale: NSLocale;

	/**
	 * @since 2.0
	 */
	longEraSymbols: NSArray<string>;

	monthSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	quarterSymbols: NSArray<string>;

	shortMonthSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	shortQuarterSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	shortStandaloneMonthSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	shortStandaloneQuarterSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	shortStandaloneWeekdaySymbols: NSArray<string>;

	shortWeekdaySymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	standaloneMonthSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	standaloneQuarterSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	standaloneWeekdaySymbols: NSArray<string>;

	timeStyle: NSDateFormatterStyle;

	timeZone: NSTimeZone;

	twoDigitStartDate: Date;

	/**
	 * @since 2.0
	 */
	veryShortMonthSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	veryShortStandaloneMonthSymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	veryShortStandaloneWeekdaySymbols: NSArray<string>;

	/**
	 * @since 2.0
	 */
	veryShortWeekdaySymbols: NSArray<string>;

	weekdaySymbols: NSArray<string>;

	static defaultFormatterBehavior: NSDateFormatterBehavior;

	dateFromString(string: string): Date;

	getObjectValueForStringRangeError(obj: interop.Pointer | interop.Reference<any>, string: string, rangep: interop.Pointer | interop.Reference<NSRange>): boolean;

	/**
	 * @since 8.0
	 */
	setLocalizedDateFormatFromTemplate(dateFormatTemplate: string): void;

	stringFromDate(date: Date): string;
}

declare const enum NSDateFormatterBehavior {

	BehaviorDefault = 0,

	Behavior10_4 = 1040
}

declare const enum NSDateFormatterStyle {

	NoStyle = 0,

	ShortStyle = 1,

	MediumStyle = 2,

	LongStyle = 3,

	FullStyle = 4
}

/**
 * @since 10.0
 */
declare class NSDateInterval extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSDateInterval; // inherited from NSObject

	static new(): NSDateInterval; // inherited from NSObject

	readonly duration: number;

	readonly endDate: Date;

	readonly startDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { startDate: Date; duration: number; });

	constructor(o: { startDate: Date; endDate: Date; });

	compare(dateInterval: NSDateInterval): NSComparisonResult;

	containsDate(date: Date): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStartDateDuration(startDate: Date, duration: number): this;

	initWithStartDateEndDate(startDate: Date, endDate: Date): this;

	intersectionWithDateInterval(dateInterval: NSDateInterval): NSDateInterval;

	intersectsDateInterval(dateInterval: NSDateInterval): boolean;

	isEqualToDateInterval(dateInterval: NSDateInterval): boolean;
}

/**
 * @since 8.0
 */
declare class NSDateIntervalFormatter extends NSFormatter {

	static alloc(): NSDateIntervalFormatter; // inherited from NSObject

	static new(): NSDateIntervalFormatter; // inherited from NSObject

	calendar: NSCalendar;

	dateStyle: NSDateIntervalFormatterStyle;

	dateTemplate: string;

	locale: NSLocale;

	timeStyle: NSDateIntervalFormatterStyle;

	timeZone: NSTimeZone;

	/**
	 * @since 10.0
	 */
	stringFromDateInterval(dateInterval: NSDateInterval): string;

	stringFromDateToDate(fromDate: Date, toDate: Date): string;
}

/**
 * @since 8.0
 */
declare const enum NSDateIntervalFormatterStyle {

	NoStyle = 0,

	ShortStyle = 1,

	MediumStyle = 2,

	LongStyle = 3,

	FullStyle = 4
}

declare function NSDeallocateMemoryPages(ptr: interop.Pointer | interop.Reference<any>, bytes: number): void;

declare function NSDeallocateObject(object: any): void;

/**
 * @since 2.0
 */
declare var NSDebugDescriptionErrorKey: string;

interface NSDecimal {
	_exponent: number;
	_length: number;
	_isNegative: number;
	_isCompact: number;
	_reserved: number;
	_mantissa: interop.Reference<number>;
}
declare var NSDecimal: interop.StructType<NSDecimal>;

declare function NSDecimalAdd(result: interop.Pointer | interop.Reference<NSDecimal>, leftOperand: interop.Pointer | interop.Reference<NSDecimal>, rightOperand: interop.Pointer | interop.Reference<NSDecimal>, roundingMode: NSRoundingMode): NSCalculationError;

declare function NSDecimalCompact(number: interop.Pointer | interop.Reference<NSDecimal>): void;

declare function NSDecimalCompare(leftOperand: interop.Pointer | interop.Reference<NSDecimal>, rightOperand: interop.Pointer | interop.Reference<NSDecimal>): NSComparisonResult;

declare function NSDecimalCopy(destination: interop.Pointer | interop.Reference<NSDecimal>, source: interop.Pointer | interop.Reference<NSDecimal>): void;

declare function NSDecimalDivide(result: interop.Pointer | interop.Reference<NSDecimal>, leftOperand: interop.Pointer | interop.Reference<NSDecimal>, rightOperand: interop.Pointer | interop.Reference<NSDecimal>, roundingMode: NSRoundingMode): NSCalculationError;

declare function NSDecimalMultiply(result: interop.Pointer | interop.Reference<NSDecimal>, leftOperand: interop.Pointer | interop.Reference<NSDecimal>, rightOperand: interop.Pointer | interop.Reference<NSDecimal>, roundingMode: NSRoundingMode): NSCalculationError;

declare function NSDecimalMultiplyByPowerOf10(result: interop.Pointer | interop.Reference<NSDecimal>, number: interop.Pointer | interop.Reference<NSDecimal>, power: number, roundingMode: NSRoundingMode): NSCalculationError;

declare function NSDecimalNormalize(number1: interop.Pointer | interop.Reference<NSDecimal>, number2: interop.Pointer | interop.Reference<NSDecimal>, roundingMode: NSRoundingMode): NSCalculationError;

declare class NSDecimalNumber extends NSNumber {

	static alloc(): NSDecimalNumber; // inherited from NSObject

	static decimalNumberWithDecimal(dcm: NSDecimal): NSDecimalNumber;

	static decimalNumberWithMantissaExponentIsNegative(mantissa: number, exponent: number, flag: boolean): NSDecimalNumber;

	static decimalNumberWithString(numberValue: string): NSDecimalNumber;

	static decimalNumberWithStringLocale(numberValue: string, locale: any): NSDecimalNumber;

	static new(): NSDecimalNumber; // inherited from NSObject

	/**
	 * @since 17.4
	 */
	static valueWithGCPoint2(point: GCPoint2): NSDecimalNumber; // inherited from NSValue

	static defaultBehavior: NSDecimalNumberBehaviors;

	static readonly maximumDecimalNumber: NSDecimalNumber;

	static readonly minimumDecimalNumber: NSDecimalNumber;

	static readonly notANumber: NSDecimalNumber;

	static readonly one: NSDecimalNumber;

	static readonly zero: NSDecimalNumber;

	constructor(o: { decimal: NSDecimal; });

	constructor(o: { mantissa: number; exponent: number; isNegative: boolean; });

	constructor(o: { string: string; });

	constructor(o: { string: string; locale: any; });

	decimalNumberByAdding(decimalNumber: NSDecimalNumber): NSDecimalNumber;

	decimalNumberByAddingWithBehavior(decimalNumber: NSDecimalNumber, behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	decimalNumberByDividingBy(decimalNumber: NSDecimalNumber): NSDecimalNumber;

	decimalNumberByDividingByWithBehavior(decimalNumber: NSDecimalNumber, behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	decimalNumberByMultiplyingBy(decimalNumber: NSDecimalNumber): NSDecimalNumber;

	decimalNumberByMultiplyingByPowerOf10(power: number): NSDecimalNumber;

	decimalNumberByMultiplyingByPowerOf10WithBehavior(power: number, behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	decimalNumberByMultiplyingByWithBehavior(decimalNumber: NSDecimalNumber, behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	decimalNumberByRaisingToPower(power: number): NSDecimalNumber;

	decimalNumberByRaisingToPowerWithBehavior(power: number, behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	decimalNumberByRoundingAccordingToBehavior(behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	decimalNumberBySubtracting(decimalNumber: NSDecimalNumber): NSDecimalNumber;

	decimalNumberBySubtractingWithBehavior(decimalNumber: NSDecimalNumber, behavior: NSDecimalNumberBehaviors): NSDecimalNumber;

	initWithDecimal(dcm: NSDecimal): this;

	initWithMantissaExponentIsNegative(mantissa: number, exponent: number, flag: boolean): this;

	initWithString(numberValue: string): this;

	initWithStringLocale(numberValue: string, locale: any): this;
}

interface NSDecimalNumberBehaviors {

	exceptionDuringOperationErrorLeftOperandRightOperand(operation: string, error: NSCalculationError, leftOperand: NSDecimalNumber, rightOperand: NSDecimalNumber): NSDecimalNumber;

	roundingMode(): NSRoundingMode;

	scale(): number;
}
declare var NSDecimalNumberBehaviors: {

	prototype: NSDecimalNumberBehaviors;
};

declare var NSDecimalNumberDivideByZeroException: string;

declare var NSDecimalNumberExactnessException: string;

declare class NSDecimalNumberHandler extends NSObject implements NSCoding, NSDecimalNumberBehaviors {

	static alloc(): NSDecimalNumberHandler; // inherited from NSObject

	static decimalNumberHandlerWithRoundingModeScaleRaiseOnExactnessRaiseOnOverflowRaiseOnUnderflowRaiseOnDivideByZero(roundingMode: NSRoundingMode, scale: number, exact: boolean, overflow: boolean, underflow: boolean, divideByZero: boolean): NSDecimalNumberHandler;

	static new(): NSDecimalNumberHandler; // inherited from NSObject

	static readonly defaultDecimalNumberHandler: NSDecimalNumberHandler;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { roundingMode: NSRoundingMode; scale: number; raiseOnExactness: boolean; raiseOnOverflow: boolean; raiseOnUnderflow: boolean; raiseOnDivideByZero: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	exceptionDuringOperationErrorLeftOperandRightOperand(operation: string, error: NSCalculationError, leftOperand: NSDecimalNumber, rightOperand: NSDecimalNumber): NSDecimalNumber;

	initWithCoder(coder: NSCoder): this;

	initWithRoundingModeScaleRaiseOnExactnessRaiseOnOverflowRaiseOnUnderflowRaiseOnDivideByZero(roundingMode: NSRoundingMode, scale: number, exact: boolean, overflow: boolean, underflow: boolean, divideByZero: boolean): this;

	roundingMode(): NSRoundingMode;

	scale(): number;
}

declare var NSDecimalNumberOverflowException: string;

declare var NSDecimalNumberUnderflowException: string;

declare function NSDecimalPower(result: interop.Pointer | interop.Reference<NSDecimal>, number: interop.Pointer | interop.Reference<NSDecimal>, power: number, roundingMode: NSRoundingMode): NSCalculationError;

declare function NSDecimalRound(result: interop.Pointer | interop.Reference<NSDecimal>, number: interop.Pointer | interop.Reference<NSDecimal>, scale: number, roundingMode: NSRoundingMode): void;

declare function NSDecimalString(dcm: interop.Pointer | interop.Reference<NSDecimal>, locale: any): string;

declare function NSDecimalSubtract(result: interop.Pointer | interop.Reference<NSDecimal>, leftOperand: interop.Pointer | interop.Reference<NSDecimal>, rightOperand: interop.Pointer | interop.Reference<NSDecimal>, roundingMode: NSRoundingMode): NSCalculationError;

/**
 * @since 9.0
 */
declare const enum NSDecodingFailurePolicy {

	RaiseException = 0,

	SetErrorAndReturn = 1
}

declare const NSDecompressionFailedError: number;

declare function NSDecrementExtraRefCountWasZero(object: any): boolean;

declare function NSDefaultMallocZone(): interop.Pointer | interop.Reference<any>;

declare var NSDefaultRunLoopMode: string;

declare var NSDestinationInvalidException: string;

declare class NSDictionary<KeyType, ObjectType> extends NSObject implements NSCopying, NSFastEnumeration, NSFastEnumeration, NSFetchRequestResult, NSMutableCopying, NSSecureCoding {

	static alloc<KeyType, ObjectType>(): NSDictionary<KeyType, ObjectType>; // inherited from NSObject

	static dictionary<KeyType, ObjectType>(): NSDictionary<KeyType, ObjectType>;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	static dictionaryWithContentsOfFile<KeyType, ObjectType>(path: string): NSDictionary<any, any>;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	static dictionaryWithContentsOfURL<KeyType, ObjectType>(url: NSURL): NSDictionary<any, any>;

	/**
	 * @since 11.0
	 */
	static dictionaryWithContentsOfURLError<KeyType, ObjectType>(url: NSURL): NSDictionary<string, any>;

	static dictionaryWithDictionary<KeyType, ObjectType>(dict: NSDictionary<any, any>): NSDictionary<KeyType, ObjectType>;

	static dictionaryWithObjectForKey<KeyType, ObjectType>(object: any, key: any): NSDictionary<KeyType, ObjectType>;

	static dictionaryWithObjectsAndKeys<KeyType, ObjectType>(firstObject: any): NSDictionary<KeyType, ObjectType>;

	static dictionaryWithObjectsForKeys<KeyType, ObjectType>(objects: NSArray<any> | any[], keys: NSArray<any> | any[]): NSDictionary<KeyType, ObjectType>;

	static dictionaryWithObjectsForKeysCount<KeyType, ObjectType>(objects: interop.Reference<any>, keys: interop.Reference<any>, cnt: number): NSDictionary<KeyType, ObjectType>;

	static new<KeyType, ObjectType>(): NSDictionary<KeyType, ObjectType>; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static sharedKeySetForKeys(keys: NSArray<any> | any[]): any;

	readonly allKeys: NSArray<any>;

	readonly allValues: NSArray<any>;

	readonly count: number;

	readonly descriptionInStringsFileFormat: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	constructor(o: { contentsOfFile: string; });

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	constructor(o: { contentsOfURL: NSURL; });

	/**
	 * @since 11.0
	 */
	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { dictionary: NSDictionary<any, any>; });

	constructor(o: { dictionary: NSDictionary<any, any>; copyItems: boolean; });

	constructor(o: { objectsAndKeys: any; });

	constructor(o: { objects: NSArray<any> | any[]; forKeys: NSArray<any> | any[]; });

	constructor(o: { objects: interop.Reference<any>; forKeys: interop.Reference<any>; count: number; });

	allKeysForObject(anObject: any): NSArray<any>;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	descriptionWithLocale(locale: any): string;

	descriptionWithLocaleIndent(locale: any, level: number): string;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateKeysAndObjectsUsingBlock(block: (p1: any, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateKeysAndObjectsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: any, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	fileCreationDate(): Date;

	fileExtensionHidden(): boolean;

	fileGroupOwnerAccountID(): number;

	fileGroupOwnerAccountName(): string;

	fileHFSCreatorCode(): number;

	fileHFSTypeCode(): number;

	fileIsAppendOnly(): boolean;

	fileIsImmutable(): boolean;

	fileModificationDate(): Date;

	fileOwnerAccountID(): number;

	fileOwnerAccountName(): string;

	filePosixPermissions(): number;

	fileSize(): number;

	fileSystemFileNumber(): number;

	fileSystemNumber(): number;

	fileType(): string;

	/**
	 * @since 2.0
	 * @deprecated 11.0
	 */
	getObjectsAndKeys(objects: interop.Reference<any>, keys: interop.Reference<any>): void;

	/**
	 * @since 5.0
	 */
	getObjectsAndKeysCount(objects: interop.Reference<any>, keys: interop.Reference<any>, count: number): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	initWithContentsOfFile(path: string): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	initWithContentsOfURL(url: NSURL): this;

	/**
	 * @since 11.0
	 */
	initWithContentsOfURLError(url: NSURL): this;

	initWithDictionary(otherDictionary: NSDictionary<any, any>): this;

	initWithDictionaryCopyItems(otherDictionary: NSDictionary<any, any>, flag: boolean): this;

	initWithObjectsAndKeys(firstObject: any): this;

	initWithObjectsForKeys(objects: NSArray<any> | any[], keys: NSArray<any> | any[]): this;

	initWithObjectsForKeysCount(objects: interop.Reference<any>, keys: interop.Reference<any>, cnt: number): this;

	isEqual(object: any): boolean;

	isEqualToDictionary(otherDictionary: NSDictionary<any, any>): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	keyEnumerator(): NSEnumerator<any>;

	/**
	 * @since 4.0
	 */
	keysOfEntriesPassingTest(predicate: (p1: any, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSSet<any>;

	/**
	 * @since 4.0
	 */
	keysOfEntriesWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: any, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSSet<any>;

	/**
	 * @since 4.0
	 */
	keysSortedByValueUsingComparator(cmptr: (p1: any, p2: any) => NSComparisonResult): NSArray<any>;

	keysSortedByValueUsingSelector(comparator: string): NSArray<any>;

	/**
	 * @since 4.0
	 */
	keysSortedByValueWithOptionsUsingComparator(opts: NSSortOptions, cmptr: (p1: any, p2: any) => NSComparisonResult): NSArray<any>;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	objectEnumerator(): NSEnumerator<any>;

	objectForKey(aKey: any): any;

	/**
	 * @since 6.0
	 */
	objectForKeyedSubscript(key: any): any;

	objectsForKeysNotFoundMarker(keys: NSArray<any> | any[], marker: any): NSArray<any>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	writeToFileAtomically(path: string, useAuxiliaryFile: boolean): boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	writeToURLAtomically(url: NSURL, atomically: boolean): boolean;

	/**
	 * @since 11.0
	 */
	writeToURLError(url: NSURL): boolean;
}

declare var NSDidBecomeSingleThreadedNotification: string;

/**
 * @since 10.0
 */
declare class NSDimension extends NSUnit implements NSSecureCoding {

	static alloc(): NSDimension; // inherited from NSObject

	static baseUnit(): NSDimension;

	static new(): NSDimension; // inherited from NSObject

	readonly converter: NSUnitConverter;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { symbol: string; converter: NSUnitConverter; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSymbolConverter(symbol: string, converter: NSUnitConverter): this;
}

/**
 * @since 4.0
 */
declare const enum NSDirectoryEnumerationOptions {

	SkipsSubdirectoryDescendants = 1,

	SkipsPackageDescendants = 2,

	SkipsHiddenFiles = 4,

	IncludesDirectoriesPostOrder = 8,

	ProducesRelativePathURLs = 16
}

declare class NSDirectoryEnumerator<ObjectType> extends NSEnumerator<any> {

	static alloc<ObjectType>(): NSDirectoryEnumerator<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSDirectoryEnumerator<ObjectType>; // inherited from NSObject

	readonly directoryAttributes: NSDictionary<string, any>;

	readonly fileAttributes: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	readonly isEnumeratingDirectoryPostOrder: boolean;

	/**
	 * @since 4.0
	 */
	readonly level: number;

	/**
	 * @since 4.0
	 */
	skipDescendants(): void;

	skipDescendents(): void;
}

interface NSDiscardableContent {

	beginContentAccess(): boolean;

	discardContentIfPossible(): void;

	endContentAccess(): void;

	isContentDiscarded(): boolean;
}
declare var NSDiscardableContent: {

	prototype: NSDiscardableContent;
};

declare var NSDistinctUnionOfArraysKeyValueOperator: string;

declare var NSDistinctUnionOfObjectsKeyValueOperator: string;

declare var NSDistinctUnionOfSetsKeyValueOperator: string;

declare function NSEndHashTableEnumeration(enumerator: interop.Pointer | interop.Reference<NSHashEnumerator>): void;

declare function NSEndMapTableEnumeration(enumerator: interop.Pointer | interop.Reference<NSMapEnumerator>): void;

/**
 * @since 8.0
 */
declare class NSEnergyFormatter extends NSFormatter {

	static alloc(): NSEnergyFormatter; // inherited from NSObject

	static new(): NSEnergyFormatter; // inherited from NSObject

	forFoodEnergyUse: boolean;

	numberFormatter: NSNumberFormatter;

	unitStyle: NSFormattingUnitStyle;

	stringFromJoules(numberInJoules: number): string;

	stringFromValueUnit(value: number, unit: NSEnergyFormatterUnit): string;

	unitStringFromJoulesUsedUnit(numberInJoules: number, unitp: interop.Pointer | interop.Reference<NSEnergyFormatterUnit>): string;

	unitStringFromValueUnit(value: number, unit: NSEnergyFormatterUnit): string;
}

/**
 * @since 8.0
 */
declare const enum NSEnergyFormatterUnit {

	Joule = 11,

	Kilojoule = 14,

	Calorie = 1793,

	Kilocalorie = 1794
}

declare function NSEnumerateHashTable(table: NSHashTable<any>): NSHashEnumerator;

declare function NSEnumerateMapTable(table: NSMapTable<any, any>): NSMapEnumerator;

declare const enum NSEnumerationOptions {

	Concurrent = 1,

	Reverse = 2
}

declare class NSEnumerator<ObjectType> extends NSObject implements NSFastEnumeration {

	static alloc<ObjectType>(): NSEnumerator<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSEnumerator<ObjectType>; // inherited from NSObject

	readonly allObjects: NSArray<any>;
	[Symbol.iterator](): Iterator<any>;

	nextObject(): any;
}

declare class NSError extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSError; // inherited from NSObject

	static errorWithDomainCodeUserInfo(domain: string, code: number, dict: NSDictionary<string, any>): NSError;

	/**
	 * @since 11.0
	 */
	static fileProviderErrorForCollisionWithItem(existingItem: NSFileProviderItem): NSError;

	/**
	 * @since 11.0
	 */
	static fileProviderErrorForNonExistentItemWithIdentifier(itemIdentifier: string): NSError;

	/**
	 * @since 16.0
	 */
	static fileProviderErrorForRejectedDeletionOfItem(updatedVersion: NSFileProviderItem): NSError;

	static new(): NSError; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static setUserInfoValueProviderForDomainProvider(errorDomain: string, provider: (p1: NSError, p2: string) => any): void;

	/**
	 * @since 9.0
	 */
	static userInfoValueProviderForDomain(errorDomain: string): (p1: NSError, p2: string) => any;

	readonly code: number;

	readonly domain: string;

	readonly helpAnchor: string;

	readonly localizedDescription: string;

	readonly localizedFailureReason: string;

	readonly localizedRecoveryOptions: NSArray<string>;

	readonly localizedRecoverySuggestion: string;

	readonly recoveryAttempter: any;

	/**
	 * @since 14.5
	 */
	readonly underlyingErrors: NSArray<NSError>;

	readonly userInfo: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { domain: string; code: number; userInfo: NSDictionary<string, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDomainCodeUserInfo(domain: string, code: number, dict: NSDictionary<string, any>): this;
}

/**
 * @since 2.0
 * @deprecated 4.0
 */
declare var NSErrorFailingURLStringKey: string;

declare class NSException extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSException; // inherited from NSObject

	static exceptionWithNameReasonUserInfo(name: string, reason: string, userInfo: NSDictionary<any, any>): NSException;

	static new(): NSException; // inherited from NSObject

	/**
	 * @since 2.0
	 */
	readonly callStackReturnAddresses: NSArray<number>;

	/**
	 * @since 4.0
	 */
	readonly callStackSymbols: NSArray<string>;

	readonly name: string;

	readonly reason: string;

	readonly userInfo: NSDictionary<any, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; reason: string; userInfo: NSDictionary<any, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameReasonUserInfo(aName: string, aReason: string, aUserInfo: NSDictionary<any, any>): this;

	raise(): void;
}

declare const NSExecutableArchitectureMismatchError: number;

declare const NSExecutableErrorMaximum: number;

declare const NSExecutableErrorMinimum: number;

declare const NSExecutableLinkError: number;

declare const NSExecutableLoadError: number;

declare const NSExecutableNotLoadableError: number;

declare const NSExecutableRuntimeMismatchError: number;

/**
 * @since 3.0
 */
declare class NSExpression extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSExpression; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	static expressionForAggregate(subexpressions: NSArray<NSExpression> | NSExpression[]): NSExpression;

	/**
	 * @since 7.0
	 */
	static expressionForAnyKey(): NSExpression;

	/**
	 * @since 4.0
	 */
	static expressionForBlockArguments(block: (p1: any, p2: NSArray<NSExpression>, p3: NSMutableDictionary<any, any>) => any, _arguments: NSArray<NSExpression> | NSExpression[]): NSExpression;

	/**
	 * @since 9.0
	 */
	static expressionForConditionalTrueExpressionFalseExpression(predicate: NSPredicate, trueExpression: NSExpression, falseExpression: NSExpression): NSExpression;

	static expressionForConstantValue(obj: any): NSExpression;

	static expressionForEvaluatedObject(): NSExpression;

	static expressionForFunctionArguments(name: string, parameters: NSArray<any> | any[]): NSExpression;

	/**
	 * @since 3.0
	 */
	static expressionForFunctionSelectorNameArguments(target: NSExpression, name: string, parameters: NSArray<any> | any[]): NSExpression;

	/**
	 * @since 3.0
	 */
	static expressionForIntersectSetWith(left: NSExpression, right: NSExpression): NSExpression;

	static expressionForKeyPath(keyPath: string): NSExpression;

	/**
	 * @since 3.0
	 */
	static expressionForMinusSetWith(left: NSExpression, right: NSExpression): NSExpression;

	/**
	 * @since 3.0
	 */
	static expressionForSubqueryUsingIteratorVariablePredicate(expression: NSExpression, variable: string, predicate: NSPredicate): NSExpression;

	/**
	 * @since 3.0
	 */
	static expressionForUnionSetWith(left: NSExpression, right: NSExpression): NSExpression;

	static expressionForVariable(string: string): NSExpression;

	/**
	 * @since 4.0
	 */
	static expressionWithFormatArgumentArray(expressionFormat: string, _arguments: NSArray<any> | any[]): NSExpression;

	static new(): NSExpression; // inherited from NSObject

	readonly arguments: NSArray<NSExpression>;

	/**
	 * @since 3.0
	 */
	readonly collection: any;

	readonly constantValue: any;

	/**
	 * @since 4.0
	 */
	readonly expressionBlock: (p1: any, p2: NSArray<NSExpression>, p3: NSMutableDictionary<any, any>) => any;

	readonly expressionType: NSExpressionType;

	/**
	 * @since 9.0
	 */
	readonly falseExpression: NSExpression;

	readonly function: string;

	readonly keyPath: string;

	/**
	 * @since 3.0
	 */
	readonly leftExpression: NSExpression;

	readonly operand: NSExpression;

	/**
	 * @since 3.0
	 */
	readonly predicate: NSPredicate;

	/**
	 * @since 3.0
	 */
	readonly rightExpression: NSExpression;

	/**
	 * @since 9.0
	 */
	readonly trueExpression: NSExpression;

	readonly variable: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { expressionType: NSExpressionType; });

	/**
	 * @since 7.0
	 */
	allowEvaluation(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	expressionValueWithObjectContext(object: any, context: NSMutableDictionary<any, any>): any;

	initWithCoder(coder: NSCoder): this;

	initWithExpressionType(type: NSExpressionType): this;
}

declare const enum NSExpressionType {

	ConstantValueExpressionType = 0,

	EvaluatedObjectExpressionType = 1,

	VariableExpressionType = 2,

	KeyPathExpressionType = 3,

	FunctionExpressionType = 4,

	UnionSetExpressionType = 5,

	IntersectSetExpressionType = 6,

	MinusSetExpressionType = 7,

	SubqueryExpressionType = 13,

	AggregateExpressionType = 14,

	AnyKeyExpressionType = 15,

	BlockExpressionType = 19,

	ConditionalExpressionType = 20
}

/**
 * @since 8.0
 */
declare class NSExtensionContext extends NSObject {

	static alloc(): NSExtensionContext; // inherited from NSObject

	static new(): NSExtensionContext; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly hostedViewMaximumAllowedSize: CGSize;

	/**
	 * @since 10.0
	 */
	readonly hostedViewMinimumAllowedSize: CGSize;

	readonly inputItems: NSArray<any>;

	/**
	 * @since 13.0
	 */
	readonly intent: INIntent;

	/**
	 * @since 12.0
	 */
	notificationActions: NSArray<UNNotificationAction>;

	/**
	 * @since 10.0
	 * @deprecated 14.0
	 */
	readonly widgetActiveDisplayMode: NCWidgetDisplayMode;

	/**
	 * @since 10.0
	 * @deprecated 14.0
	 */
	widgetLargestAvailableDisplayMode: NCWidgetDisplayMode;

	cancelRequestWithError(error: NSError): void;

	completeRequestReturningItemsCompletionHandler(items: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	completeRequestWithBroadcastURLBroadcastConfigurationSetupInfo(broadcastURL: NSURL, broadcastConfiguration: RPBroadcastConfiguration, setupInfo: NSDictionary<string, NSObject & NSCoding>): void;

	/**
	 * @since 11.0
	 */
	completeRequestWithBroadcastURLSetupInfo(broadcastURL: NSURL, setupInfo: NSDictionary<string, NSObject & NSCoding>): void;

	/**
	 * @since 12.0
	 */
	dismissNotificationContentExtension(): void;

	/**
	 * @since 11.0
	 */
	interfaceParametersDescription(): string;

	loadBroadcastingApplicationInfoWithCompletion(handler: (p1: string, p2: string, p3: UIImage) => void): void;

	/**
	 * @since 10.0
	 */
	mediaPlayingPaused(): void;

	/**
	 * @since 10.0
	 */
	mediaPlayingStarted(): void;

	openURLCompletionHandler(URL: NSURL, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 12.0
	 */
	performNotificationDefaultAction(): void;

	/**
	 * @since 10.0
	 * @deprecated 14.0
	 */
	widgetMaximumSizeForDisplayMode(displayMode: NCWidgetDisplayMode): CGSize;
}

/**
 * @since 8.2
 */
declare var NSExtensionHostDidBecomeActiveNotification: string;

/**
 * @since 8.2
 */
declare var NSExtensionHostDidEnterBackgroundNotification: string;

/**
 * @since 8.2
 */
declare var NSExtensionHostWillEnterForegroundNotification: string;

/**
 * @since 8.2
 */
declare var NSExtensionHostWillResignActiveNotification: string;

/**
 * @since 8.0
 */
declare class NSExtensionItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSExtensionItem; // inherited from NSObject

	static new(): NSExtensionItem; // inherited from NSObject

	attachments: NSArray<NSItemProvider>;

	attributedContentText: NSAttributedString;

	attributedTitle: NSAttributedString;

	userInfo: NSDictionary<any, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare var NSExtensionItemAttachmentsKey: string;

/**
 * @since 8.0
 */
declare var NSExtensionItemAttributedContentTextKey: string;

/**
 * @since 8.0
 */
declare var NSExtensionItemAttributedTitleKey: string;

/**
 * @since 8.0
 */
declare var NSExtensionItemsAndErrorsKey: string;

/**
 * @since 8.0
 */
declare var NSExtensionJavaScriptFinalizeArgumentKey: string;

/**
 * @since 8.0
 */
declare var NSExtensionJavaScriptPreprocessingResultsKey: string;

interface NSExtensionRequestHandling extends NSObjectProtocol {

	beginRequestWithExtensionContext(context: NSExtensionContext): void;
}
declare var NSExtensionRequestHandling: {

	prototype: NSExtensionRequestHandling;
};

declare function NSExtraRefCount(object: any): number;

interface NSFastEnumeration {
}
declare var NSFastEnumeration: {

	prototype: NSFastEnumeration;
};

interface NSFastEnumerationState {
	state: number;
	itemsPtr: interop.Pointer | interop.Reference<any>;
	mutationsPtr: interop.Pointer | interop.Reference<number>;
	extra: interop.Reference<number>;
}
declare var NSFastEnumerationState: interop.StructType<NSFastEnumerationState>;

declare const NSFeatureUnsupportedError: number;

/**
 * @since 8.0
 */
declare class NSFileAccessIntent extends NSObject {

	static alloc(): NSFileAccessIntent; // inherited from NSObject

	static new(): NSFileAccessIntent; // inherited from NSObject

	static readingIntentWithURLOptions(url: NSURL, options: NSFileCoordinatorReadingOptions): NSFileAccessIntent;

	static writingIntentWithURLOptions(url: NSURL, options: NSFileCoordinatorWritingOptions): NSFileAccessIntent;

	readonly URL: NSURL;
}

declare var NSFileAppendOnly: string;

declare var NSFileBusy: string;

/**
 * @since 5.0
 */
declare class NSFileCoordinator extends NSObject {

	static addFilePresenter(filePresenter: NSFilePresenter): void;

	static alloc(): NSFileCoordinator; // inherited from NSObject

	static new(): NSFileCoordinator; // inherited from NSObject

	static removeFilePresenter(filePresenter: NSFilePresenter): void;

	/**
	 * @since 5.0
	 */
	purposeIdentifier: string;

	static readonly filePresenters: NSArray<NSFilePresenter>;

	constructor(o: { filePresenter: NSFilePresenter; });

	cancel(): void;

	/**
	 * @since 8.0
	 */
	coordinateAccessWithIntentsQueueByAccessor(intents: NSArray<NSFileAccessIntent> | NSFileAccessIntent[], queue: NSOperationQueue, accessor: (p1: NSError) => void): void;

	coordinateReadingItemAtURLOptionsErrorByAccessor(url: NSURL, options: NSFileCoordinatorReadingOptions, outError: interop.Pointer | interop.Reference<NSError>, reader: (p1: NSURL) => void): void;

	coordinateReadingItemAtURLOptionsWritingItemAtURLOptionsErrorByAccessor(readingURL: NSURL, readingOptions: NSFileCoordinatorReadingOptions, writingURL: NSURL, writingOptions: NSFileCoordinatorWritingOptions, outError: interop.Pointer | interop.Reference<NSError>, readerWriter: (p1: NSURL, p2: NSURL) => void): void;

	coordinateWritingItemAtURLOptionsErrorByAccessor(url: NSURL, options: NSFileCoordinatorWritingOptions, outError: interop.Pointer | interop.Reference<NSError>, writer: (p1: NSURL) => void): void;

	coordinateWritingItemAtURLOptionsWritingItemAtURLOptionsErrorByAccessor(url1: NSURL, options1: NSFileCoordinatorWritingOptions, url2: NSURL, options2: NSFileCoordinatorWritingOptions, outError: interop.Pointer | interop.Reference<NSError>, writer: (p1: NSURL, p2: NSURL) => void): void;

	initWithFilePresenter(filePresenterOrNil: NSFilePresenter): this;

	/**
	 * @since 11.0
	 */
	itemAtURLDidChangeUbiquityAttributes(url: NSURL, attributes: NSSet<string>): void;

	itemAtURLDidMoveToURL(oldURL: NSURL, newURL: NSURL): void;

	/**
	 * @since 6.0
	 */
	itemAtURLWillMoveToURL(oldURL: NSURL, newURL: NSURL): void;

	prepareForReadingItemsAtURLsOptionsWritingItemsAtURLsOptionsErrorByAccessor(readingURLs: NSArray<NSURL> | NSURL[], readingOptions: NSFileCoordinatorReadingOptions, writingURLs: NSArray<NSURL> | NSURL[], writingOptions: NSFileCoordinatorWritingOptions, outError: interop.Pointer | interop.Reference<NSError>, batchAccessor: (p1: () => void) => void): void;
}

declare const enum NSFileCoordinatorReadingOptions {

	WithoutChanges = 1,

	ResolvesSymbolicLink = 2,

	ImmediatelyAvailableMetadataOnly = 4,

	ForUploading = 8
}

declare const enum NSFileCoordinatorWritingOptions {

	ForDeleting = 1,

	ForMoving = 2,

	ForMerging = 4,

	ForReplacing = 8,

	ContentIndependentMetadataOnly = 16
}

declare var NSFileCreationDate: string;

declare var NSFileDeviceIdentifier: string;

declare const NSFileErrorMaximum: number;

declare const NSFileErrorMinimum: number;

declare var NSFileExtensionHidden: string;

declare var NSFileGroupOwnerAccountID: string;

declare var NSFileGroupOwnerAccountName: string;

declare var NSFileHFSCreatorCode: string;

declare var NSFileHFSTypeCode: string;

declare class NSFileHandle extends NSObject implements NSSecureCoding {

	static alloc(): NSFileHandle; // inherited from NSObject

	static fileHandleForReadingAtPath(path: string): NSFileHandle;

	/**
	 * @since 4.0
	 */
	static fileHandleForReadingFromURLError(url: NSURL): NSFileHandle;

	static fileHandleForUpdatingAtPath(path: string): NSFileHandle;

	/**
	 * @since 4.0
	 */
	static fileHandleForUpdatingURLError(url: NSURL): NSFileHandle;

	static fileHandleForWritingAtPath(path: string): NSFileHandle;

	/**
	 * @since 4.0
	 */
	static fileHandleForWritingToURLError(url: NSURL): NSFileHandle;

	static fileHandleWithDataCompletion(path: string, data: NSData, callback: (p1: NSFileHandle, p2: NSError) => void): void;

	static new(): NSFileHandle; // inherited from NSObject

	readonly availableData: NSData;

	readonly fileDescriptor: number;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	readonly offsetInFile: number;

	/**
	 * @since 5.0
	 */
	readabilityHandler: (p1: NSFileHandle) => void;

	/**
	 * @since 5.0
	 */
	writeabilityHandler: (p1: NSFileHandle) => void;

	static readonly fileHandleWithNullDevice: NSFileHandle;

	static readonly fileHandleWithStandardError: NSFileHandle;

	static readonly fileHandleWithStandardInput: NSFileHandle;

	static readonly fileHandleWithStandardOutput: NSFileHandle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileDescriptor: number; });

	constructor(o: { fileDescriptor: number; closeOnDealloc: boolean; });

	acceptConnectionInBackgroundAndNotify(): void;

	acceptConnectionInBackgroundAndNotifyForModes(modes: NSArray<string> | string[]): void;

	appendDataCompletion(data: NSData, callback: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	closeAndReturnError(): boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	closeFile(): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 13.0
	 */
	getOffsetError(offsetInFile: interop.Pointer | interop.Reference<number>): boolean;

	initWithCoder(coder: NSCoder): this;

	initWithFileDescriptor(fd: number): this;

	initWithFileDescriptorCloseOnDealloc(fd: number, closeopt: boolean): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	readDataOfLength(length: number): NSData;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	readDataToEndOfFile(): NSData;

	/**
	 * @since 13.0
	 */
	readDataToEndOfFileAndReturnError(): NSData;

	/**
	 * @since 13.0
	 */
	readDataUpToLengthError(length: number): NSData;

	readInBackgroundAndNotify(): void;

	readInBackgroundAndNotifyForModes(modes: NSArray<string> | string[]): void;

	readToEndOfFileInBackgroundAndNotify(): void;

	readToEndOfFileInBackgroundAndNotifyForModes(modes: NSArray<string> | string[]): void;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	seekToEndOfFile(): number;

	/**
	 * @since 13.0
	 */
	seekToEndReturningOffsetError(offsetInFile: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	seekToFileOffset(offset: number): void;

	/**
	 * @since 13.0
	 */
	seekToOffsetError(offset: number): boolean;

	/**
	 * @since 13.0
	 */
	synchronizeAndReturnError(): boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	synchronizeFile(): void;

	/**
	 * @since 13.0
	 */
	truncateAtOffsetError(offset: number): boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	truncateFileAtOffset(offset: number): void;

	waitForDataInBackgroundAndNotify(): void;

	waitForDataInBackgroundAndNotifyForModes(modes: NSArray<string> | string[]): void;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	writeData(data: NSData): void;

	/**
	 * @since 13.0
	 */
	writeDataError(data: NSData): boolean;
}

declare var NSFileHandleConnectionAcceptedNotification: string;

declare var NSFileHandleDataAvailableNotification: string;

declare var NSFileHandleNotificationDataItem: string;

declare var NSFileHandleNotificationFileHandleItem: string;

/**
 * @since 2.0
 * @deprecated 5.0
 */
declare var NSFileHandleNotificationMonitorModes: string;

declare var NSFileHandleOperationException: string;

declare var NSFileHandleReadCompletionNotification: string;

declare var NSFileHandleReadToEndOfFileCompletionNotification: string;

declare var NSFileImmutable: string;

declare const NSFileLockingError: number;

declare class NSFileManager extends NSObject {

	static alloc(): NSFileManager; // inherited from NSObject

	static new(): NSFileManager; // inherited from NSObject

	readonly currentDirectoryPath: string;

	/**
	 * @since 2.0
	 */
	delegate: NSFileManagerDelegate;

	/**
	 * @since 10.0
	 */
	readonly temporaryDirectory: NSURL;

	/**
	 * @since 6.0
	 */
	readonly ubiquityIdentityToken: any;

	static readonly defaultManager: NSFileManager;

	/**
	 * @since 4.0
	 */
	URLForDirectoryInDomainAppropriateForURLCreateError(directory: NSSearchPathDirectory, domain: NSSearchPathDomainMask, url: NSURL, shouldCreate: boolean): NSURL;

	/**
	 * @since 5.0
	 */
	URLForPublishingUbiquitousItemAtURLExpirationDateError(url: NSURL, outDate: interop.Pointer | interop.Reference<Date>): NSURL;

	/**
	 * @since 5.0
	 */
	URLForUbiquityContainerIdentifier(containerIdentifier: string): NSURL;

	/**
	 * @since 4.0
	 */
	URLsForDirectoryInDomains(directory: NSSearchPathDirectory, domainMask: NSSearchPathDomainMask): NSArray<NSURL>;

	/**
	 * @since 2.0
	 */
	attributesOfFileSystemForPathError(path: string): NSDictionary<string, any>;

	/**
	 * @since 2.0
	 */
	attributesOfItemAtPathError(path: string): NSDictionary<string, any>;

	changeCurrentDirectoryPath(path: string): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	changeFileAttributesAtPath(attributes: NSDictionary<any, any>, path: string): boolean;

	componentsToDisplayForPath(path: string): NSArray<string>;

	/**
	 * @since 7.0
	 */
	containerURLForSecurityApplicationGroupIdentifier(groupIdentifier: string): NSURL;

	contentsAtPath(path: string): NSData;

	contentsEqualAtPathAndPath(path1: string, path2: string): boolean;

	/**
	 * @since 2.0
	 */
	contentsOfDirectoryAtPathError(path: string): NSArray<string>;

	/**
	 * @since 4.0
	 */
	contentsOfDirectoryAtURLIncludingPropertiesForKeysOptionsError(url: NSURL, keys: NSArray<string> | string[], mask: NSDirectoryEnumerationOptions): NSArray<NSURL>;

	/**
	 * @since 2.0
	 */
	copyItemAtPathToPathError(srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	copyItemAtURLToURLError(srcURL: NSURL, dstURL: NSURL): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	createDirectoryAtPathAttributes(path: string, attributes: NSDictionary<any, any>): boolean;

	/**
	 * @since 2.0
	 */
	createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path: string, createIntermediates: boolean, attributes: NSDictionary<string, any>): boolean;

	/**
	 * @since 5.0
	 */
	createDirectoryAtURLWithIntermediateDirectoriesAttributesError(url: NSURL, createIntermediates: boolean, attributes: NSDictionary<string, any>): boolean;

	createFileAtPathContentsAttributes(path: string, data: NSData, attr: NSDictionary<string, any>): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	createSymbolicLinkAtPathPathContent(path: string, otherpath: string): boolean;

	/**
	 * @since 2.0
	 */
	createSymbolicLinkAtPathWithDestinationPathError(path: string, destPath: string): boolean;

	/**
	 * @since 5.0
	 */
	createSymbolicLinkAtURLWithDestinationURLError(url: NSURL, destURL: NSURL): boolean;

	/**
	 * @since 2.0
	 */
	destinationOfSymbolicLinkAtPathError(path: string): string;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	directoryContentsAtPath(path: string): NSArray<any>;

	displayNameAtPath(path: string): string;

	enumeratorAtPath(path: string): NSDirectoryEnumerator<string>;

	/**
	 * @since 4.0
	 */
	enumeratorAtURLIncludingPropertiesForKeysOptionsErrorHandler(url: NSURL, keys: NSArray<string> | string[], mask: NSDirectoryEnumerationOptions, handler: (p1: NSURL, p2: NSError) => boolean): NSDirectoryEnumerator<NSURL>;

	/**
	 * @since 5.0
	 */
	evictUbiquitousItemAtURLError(url: NSURL): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	fileAttributesAtPathTraverseLink(path: string, yorn: boolean): NSDictionary<any, any>;

	fileExistsAtPath(path: string): boolean;

	fileExistsAtPathIsDirectory(path: string, isDirectory: interop.Pointer | interop.Reference<boolean>): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	fileSystemAttributesAtPath(path: string): NSDictionary<any, any>;

	fileSystemRepresentationWithPath(path: string): interop.Pointer | interop.Reference<any>;

	/**
	 * @since 11.0
	 */
	getFileProviderServicesForItemAtURLCompletionHandler(url: NSURL, completionHandler: (p1: NSDictionary<string, NSFileProviderService>, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	getRelationshipOfDirectoryAtURLToItemAtURLError(outRelationship: interop.Pointer | interop.Reference<NSURLRelationship>, directoryURL: NSURL, otherURL: NSURL): boolean;

	/**
	 * @since 8.0
	 */
	getRelationshipOfDirectoryInDomainToItemAtURLError(outRelationship: interop.Pointer | interop.Reference<NSURLRelationship>, directory: NSSearchPathDirectory, domainMask: NSSearchPathDomainMask, url: NSURL): boolean;

	isDeletableFileAtPath(path: string): boolean;

	isExecutableFileAtPath(path: string): boolean;

	isReadableFileAtPath(path: string): boolean;

	/**
	 * @since 5.0
	 */
	isUbiquitousItemAtURL(url: NSURL): boolean;

	isWritableFileAtPath(path: string): boolean;

	/**
	 * @since 2.0
	 */
	linkItemAtPathToPathError(srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	linkItemAtURLToURLError(srcURL: NSURL, dstURL: NSURL): boolean;

	/**
	 * @since 4.0
	 */
	mountedVolumeURLsIncludingResourceValuesForKeysOptions(propertyKeys: NSArray<string> | string[], options: NSVolumeEnumerationOptions): NSArray<NSURL>;

	/**
	 * @since 2.0
	 */
	moveItemAtPathToPathError(srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	moveItemAtURLToURLError(srcURL: NSURL, dstURL: NSURL): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	pathContentOfSymbolicLinkAtPath(path: string): string;

	/**
	 * @since 2.0
	 */
	removeItemAtPathError(path: string): boolean;

	/**
	 * @since 4.0
	 */
	removeItemAtURLError(URL: NSURL): boolean;

	/**
	 * @since 4.0
	 */
	replaceItemAtURLWithItemAtURLBackupItemNameOptionsResultingItemURLError(originalItemURL: NSURL, newItemURL: NSURL, backupItemName: string, options: NSFileManagerItemReplacementOptions, resultingURL: interop.Pointer | interop.Reference<NSURL>): boolean;

	/**
	 * @since 2.0
	 */
	setAttributesOfItemAtPathError(attributes: NSDictionary<string, any>, path: string): boolean;

	/**
	 * @since 5.0
	 */
	setUbiquitousItemAtURLDestinationURLError(flag: boolean, url: NSURL, destinationURL: NSURL): boolean;

	/**
	 * @since 5.0
	 */
	startDownloadingUbiquitousItemAtURLError(url: NSURL): boolean;

	stringWithFileSystemRepresentationLength(str: string | interop.Pointer | interop.Reference<any>, len: number): string;

	subpathsAtPath(path: string): NSArray<string>;

	/**
	 * @since 2.0
	 */
	subpathsOfDirectoryAtPathError(path: string): NSArray<string>;

	/**
	 * @since 11.0
	 */
	trashItemAtURLResultingItemURLError(url: NSURL, outResultingURL: interop.Pointer | interop.Reference<NSURL>): boolean;
}

interface NSFileManagerDelegate extends NSObjectProtocol {

	fileManagerShouldCopyItemAtPathToPath?(fileManager: NSFileManager, srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldCopyItemAtURLToURL?(fileManager: NSFileManager, srcURL: NSURL, dstURL: NSURL): boolean;

	fileManagerShouldLinkItemAtPathToPath?(fileManager: NSFileManager, srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldLinkItemAtURLToURL?(fileManager: NSFileManager, srcURL: NSURL, dstURL: NSURL): boolean;

	fileManagerShouldMoveItemAtPathToPath?(fileManager: NSFileManager, srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldMoveItemAtURLToURL?(fileManager: NSFileManager, srcURL: NSURL, dstURL: NSURL): boolean;

	fileManagerShouldProceedAfterErrorCopyingItemAtPathToPath?(fileManager: NSFileManager, error: NSError, srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldProceedAfterErrorCopyingItemAtURLToURL?(fileManager: NSFileManager, error: NSError, srcURL: NSURL, dstURL: NSURL): boolean;

	fileManagerShouldProceedAfterErrorLinkingItemAtPathToPath?(fileManager: NSFileManager, error: NSError, srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldProceedAfterErrorLinkingItemAtURLToURL?(fileManager: NSFileManager, error: NSError, srcURL: NSURL, dstURL: NSURL): boolean;

	fileManagerShouldProceedAfterErrorMovingItemAtPathToPath?(fileManager: NSFileManager, error: NSError, srcPath: string, dstPath: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldProceedAfterErrorMovingItemAtURLToURL?(fileManager: NSFileManager, error: NSError, srcURL: NSURL, dstURL: NSURL): boolean;

	fileManagerShouldProceedAfterErrorRemovingItemAtPath?(fileManager: NSFileManager, error: NSError, path: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldProceedAfterErrorRemovingItemAtURL?(fileManager: NSFileManager, error: NSError, URL: NSURL): boolean;

	fileManagerShouldRemoveItemAtPath?(fileManager: NSFileManager, path: string): boolean;

	/**
	 * @since 4.0
	 */
	fileManagerShouldRemoveItemAtURL?(fileManager: NSFileManager, URL: NSURL): boolean;
}
declare var NSFileManagerDelegate: {

	prototype: NSFileManagerDelegate;
};

/**
 * @since 4.0
 */
declare const enum NSFileManagerItemReplacementOptions {

	UsingNewMetadataOnly = 1,

	WithoutDeletingBackupItem = 2
}

declare var NSFileModificationDate: string;

declare const NSFileNoSuchFileError: number;

declare var NSFileOwnerAccountID: string;

declare var NSFileOwnerAccountName: string;

declare var NSFilePathErrorKey: string;

declare var NSFilePosixPermissions: string;

interface NSFilePresenter extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	observedPresentedItemUbiquityAttributes?: NSSet<string>;

	presentedItemOperationQueue: NSOperationQueue;

	presentedItemURL: NSURL;

	accommodatePresentedItemDeletionWithCompletionHandler?(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 17.4
	 */
	accommodatePresentedItemEvictionWithCompletionHandler?(completionHandler: (p1: NSError) => void): void;

	accommodatePresentedSubitemDeletionAtURLCompletionHandler?(url: NSURL, completionHandler: (p1: NSError) => void): void;

	presentedItemDidChange?(): void;

	/**
	 * @since 11.0
	 */
	presentedItemDidChangeUbiquityAttributes?(attributes: NSSet<string>): void;

	presentedItemDidGainVersion?(version: NSFileVersion): void;

	presentedItemDidLoseVersion?(version: NSFileVersion): void;

	presentedItemDidMoveToURL?(newURL: NSURL): void;

	presentedItemDidResolveConflictVersion?(version: NSFileVersion): void;

	presentedSubitemAtURLDidGainVersion?(url: NSURL, version: NSFileVersion): void;

	presentedSubitemAtURLDidLoseVersion?(url: NSURL, version: NSFileVersion): void;

	presentedSubitemAtURLDidMoveToURL?(oldURL: NSURL, newURL: NSURL): void;

	presentedSubitemAtURLDidResolveConflictVersion?(url: NSURL, version: NSFileVersion): void;

	presentedSubitemDidAppearAtURL?(url: NSURL): void;

	presentedSubitemDidChangeAtURL?(url: NSURL): void;

	relinquishPresentedItemToReader?(reader: (p1: () => void) => void): void;

	relinquishPresentedItemToWriter?(writer: (p1: () => void) => void): void;

	savePresentedItemChangesWithCompletionHandler?(completionHandler: (p1: NSError) => void): void;
}
declare var NSFilePresenter: {

	prototype: NSFilePresenter;
};

/**
 * @since 4.0
 */
declare var NSFileProtectionComplete: string;

/**
 * @since 5.0
 */
declare var NSFileProtectionCompleteUnlessOpen: string;

/**
 * @since 5.0
 */
declare var NSFileProtectionCompleteUntilFirstUserAuthentication: string;

/**
 * @since 17.0
 */
declare var NSFileProtectionCompleteWhenUserInactive: string;

/**
 * @since 4.0
 */
declare var NSFileProtectionKey: string;

/**
 * @since 4.0
 */
declare var NSFileProtectionNone: string;

/**
 * @since 11.0
 */
declare class NSFileProviderService extends NSObject {

	static alloc(): NSFileProviderService; // inherited from NSObject

	static new(): NSFileProviderService; // inherited from NSObject

	readonly name: string;

	getFileProviderConnectionWithCompletionHandler(completionHandler: (p1: NSXPCConnection, p2: NSError) => void): void;
}

declare const NSFileReadCorruptFileError: number;

declare const NSFileReadInapplicableStringEncodingError: number;

declare const NSFileReadInvalidFileNameError: number;

declare const NSFileReadNoPermissionError: number;

declare const NSFileReadNoSuchFileError: number;

declare const NSFileReadTooLargeError: number;

declare const NSFileReadUnknownError: number;

declare const NSFileReadUnknownStringEncodingError: number;

declare const NSFileReadUnsupportedSchemeError: number;

declare var NSFileReferenceCount: string;

/**
 * @since 5.0
 */
declare class NSFileSecurity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSFileSecurity; // inherited from NSObject

	static new(): NSFileSecurity; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var NSFileSize: string;

declare var NSFileSystemFileNumber: string;

declare var NSFileSystemFreeNodes: string;

declare var NSFileSystemFreeSize: string;

declare var NSFileSystemNodes: string;

declare var NSFileSystemNumber: string;

declare var NSFileSystemSize: string;

declare var NSFileType: string;

declare var NSFileTypeBlockSpecial: string;

declare var NSFileTypeCharacterSpecial: string;

declare var NSFileTypeDirectory: string;

declare var NSFileTypeRegular: string;

declare var NSFileTypeSocket: string;

declare var NSFileTypeSymbolicLink: string;

declare var NSFileTypeUnknown: string;

/**
 * @since 5.0
 */
declare class NSFileVersion extends NSObject {

	static alloc(): NSFileVersion; // inherited from NSObject

	static currentVersionOfItemAtURL(url: NSURL): NSFileVersion;

	/**
	 * @since 8.0
	 */
	static getNonlocalVersionsOfItemAtURLCompletionHandler(url: NSURL, completionHandler: (p1: NSArray<NSFileVersion>, p2: NSError) => void): void;

	static new(): NSFileVersion; // inherited from NSObject

	static otherVersionsOfItemAtURL(url: NSURL): NSArray<NSFileVersion>;

	static removeOtherVersionsOfItemAtURLError(url: NSURL): boolean;

	static unresolvedConflictVersionsOfItemAtURL(url: NSURL): NSArray<NSFileVersion>;

	static versionOfItemAtURLForPersistentIdentifier(url: NSURL, persistentIdentifier: any): NSFileVersion;

	readonly URL: NSURL;

	readonly conflict: boolean;

	/**
	 * @since 8.0
	 */
	readonly hasLocalContents: boolean;

	/**
	 * @since 8.0
	 */
	readonly hasThumbnail: boolean;

	readonly localizedName: string;

	readonly localizedNameOfSavingComputer: string;

	readonly modificationDate: Date;

	/**
	 * @since 10.0
	 */
	readonly originatorNameComponents: NSPersonNameComponents;

	readonly persistentIdentifier: NSCoding;

	resolved: boolean;

	removeAndReturnError(): boolean;

	replaceItemAtURLOptionsError(url: NSURL, options: NSFileVersionReplacingOptions): NSURL;
}

declare const enum NSFileVersionAddingOptions {

	ByMoving = 1
}

declare const enum NSFileVersionReplacingOptions {

	ByMoving = 1
}

/**
 * @since 4.0
 */
declare class NSFileWrapper extends NSObject implements NSSecureCoding {

	static alloc(): NSFileWrapper; // inherited from NSObject

	static new(): NSFileWrapper; // inherited from NSObject

	readonly directory: boolean;

	fileAttributes: NSDictionary<string, any>;

	readonly fileWrappers: NSDictionary<string, NSFileWrapper>;

	filename: string;

	preferredFilename: string;

	readonly regularFile: boolean;

	readonly regularFileContents: NSData;

	readonly serializedRepresentation: NSData;

	readonly symbolicLink: boolean;

	/**
	 * @since 4.0
	 */
	readonly symbolicLinkDestinationURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { directoryWithFileWrappers: NSDictionary<string, NSFileWrapper>; });

	constructor(o: { regularFileWithContents: NSData; });

	/**
	 * @since 4.0
	 */
	constructor(o: { symbolicLinkWithDestinationURL: NSURL; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { serializedRepresentation: NSData; });

	/**
	 * @since 4.0
	 */
	constructor(o: { URL: NSURL; options: NSFileWrapperReadingOptions; });

	addFileWrapper(child: NSFileWrapper): string;

	addRegularFileWithContentsPreferredFilename(data: NSData, fileName: string): string;

	encodeWithCoder(coder: NSCoder): void;

	initDirectoryWithFileWrappers(childrenByPreferredName: NSDictionary<string, NSFileWrapper>): this;

	initRegularFileWithContents(contents: NSData): this;

	/**
	 * @since 4.0
	 */
	initSymbolicLinkWithDestinationURL(url: NSURL): this;

	initWithCoder(coder: NSCoder): this;

	initWithSerializedRepresentation(serializeRepresentation: NSData): this;

	/**
	 * @since 4.0
	 */
	initWithURLOptionsError(url: NSURL, options: NSFileWrapperReadingOptions): this;

	keyForFileWrapper(child: NSFileWrapper): string;

	/**
	 * @since 4.0
	 */
	matchesContentsOfURL(url: NSURL): boolean;

	/**
	 * @since 4.0
	 */
	readFromURLOptionsError(url: NSURL, options: NSFileWrapperReadingOptions): boolean;

	removeFileWrapper(child: NSFileWrapper): void;

	/**
	 * @since 4.0
	 */
	writeToURLOptionsOriginalContentsURLError(url: NSURL, options: NSFileWrapperWritingOptions, originalContentsURL: NSURL): boolean;
}

/**
 * @since 4.0
 */
declare const enum NSFileWrapperReadingOptions {

	Immediate = 1,

	WithoutMapping = 2
}

/**
 * @since 4.0
 */
declare const enum NSFileWrapperWritingOptions {

	Atomic = 1,

	WithNameUpdating = 2
}

declare const NSFileWriteFileExistsError: number;

declare const NSFileWriteInapplicableStringEncodingError: number;

declare const NSFileWriteInvalidFileNameError: number;

declare const NSFileWriteNoPermissionError: number;

declare const NSFileWriteOutOfSpaceError: number;

declare const NSFileWriteUnknownError: number;

declare const NSFileWriteUnsupportedSchemeError: number;

declare const NSFileWriteVolumeReadOnlyError: number;

declare class NSFormatter extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSFormatter; // inherited from NSObject

	static new(): NSFormatter; // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	attributedStringForObjectValueWithDefaultAttributes(obj: any, attrs: NSDictionary<string, any>): NSAttributedString;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	editingStringForObjectValue(obj: any): string;

	encodeWithCoder(coder: NSCoder): void;

	getObjectValueForStringErrorDescription(obj: interop.Pointer | interop.Reference<any>, string: string, error: interop.Pointer | interop.Reference<string>): boolean;

	initWithCoder(coder: NSCoder): this;

	isPartialStringValidNewEditingStringErrorDescription(partialString: string, newString: interop.Pointer | interop.Reference<string>, error: interop.Pointer | interop.Reference<string>): boolean;

	isPartialStringValidProposedSelectedRangeOriginalStringOriginalSelectedRangeErrorDescription(partialStringPtr: interop.Pointer | interop.Reference<string>, proposedSelRangePtr: interop.Pointer | interop.Reference<NSRange>, origString: string, origSelRange: NSRange, error: interop.Pointer | interop.Reference<string>): boolean;

	stringForObjectValue(obj: any): string;
}

/**
 * @since 8.0
 */
declare const enum NSFormattingContext {

	Unknown = 0,

	Dynamic = 1,

	Standalone = 2,

	ListItem = 3,

	BeginningOfSentence = 4,

	MiddleOfSentence = 5
}

declare const NSFormattingError: number;

declare const NSFormattingErrorMaximum: number;

declare const NSFormattingErrorMinimum: number;

/**
 * @since 8.0
 */
declare const enum NSFormattingUnitStyle {

	Short = 1,

	Medium = 2,

	Long = 3
}

declare var NSFoundationVersionNumber: number;

declare function NSFreeHashTable(table: NSHashTable<any>): void;

declare function NSFreeMapTable(table: NSMapTable<any, any>): void;

declare function NSFullUserName(): string;

declare var NSGenericException: string;

declare function NSGetSizeAndAlignment(typePtr: string | interop.Pointer | interop.Reference<any>, sizep: interop.Pointer | interop.Reference<number>, alignp: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function NSGetUncaughtExceptionHandler(): interop.Pointer | interop.Reference<interop.FunctionReference<(p1: NSException) => void>>;

declare var NSGlobalDomain: string;

/**
 * @since 17.0
 */
declare const enum NSGrammaticalCase {

	NotSet = 0,

	Nominative = 1,

	Accusative = 2,

	Dative = 3,

	Genitive = 4,

	Prepositional = 5,

	Ablative = 6,

	Adessive = 7,

	Allative = 8,

	Elative = 9,

	Illative = 10,

	Essive = 11,

	Inessive = 12,

	Locative = 13,

	Translative = 14
}

/**
 * @since 17.0
 */
declare const enum NSGrammaticalDefiniteness {

	NotSet = 0,

	Indefinite = 1,

	Definite = 2
}

/**
 * @since 17.0
 */
declare const enum NSGrammaticalDetermination {

	NotSet = 0,

	Independent = 1,

	Dependent = 2
}

/**
 * @since 15.0
 */
declare const enum NSGrammaticalGender {

	NotSet = 0,

	Feminine = 1,

	Masculine = 2,

	Neuter = 3
}

/**
 * @since 15.0
 */
declare const enum NSGrammaticalNumber {

	NotSet = 0,

	Singular = 1,

	Zero = 2,

	Plural = 3,

	PluralTwo = 4,

	PluralFew = 5,

	PluralMany = 6
}

/**
 * @since 15.0
 */
declare const enum NSGrammaticalPartOfSpeech {

	NotSet = 0,

	Determiner = 1,

	Pronoun = 2,

	Letter = 3,

	Adverb = 4,

	Particle = 5,

	Adjective = 6,

	Adposition = 7,

	Verb = 8,

	Noun = 9,

	Conjunction = 10,

	Numeral = 11,

	Interjection = 12,

	Preposition = 13,

	Abbreviation = 14
}

/**
 * @since 17.0
 */
declare const enum NSGrammaticalPerson {

	NotSet = 0,

	First = 1,

	Second = 2,

	Third = 3
}

/**
 * @since 17.0
 */
declare const enum NSGrammaticalPronounType {

	NotSet = 0,

	Personal = 1,

	Reflexive = 2,

	Possessive = 3
}

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSGregorianCalendar: string;

declare const NSHPUXOperatingSystem: number;

/**
 * @since 2.0
 */
declare class NSHTTPCookie extends NSObject {

	static alloc(): NSHTTPCookie; // inherited from NSObject

	static cookieWithProperties(properties: NSDictionary<string, any>): NSHTTPCookie;

	static cookiesWithResponseHeaderFieldsForURL(headerFields: NSDictionary<string, string>, URL: NSURL): NSArray<NSHTTPCookie>;

	static new(): NSHTTPCookie; // inherited from NSObject

	static requestHeaderFieldsWithCookies(cookies: NSArray<NSHTTPCookie> | NSHTTPCookie[]): NSDictionary<string, string>;

	readonly HTTPOnly: boolean;

	readonly comment: string;

	readonly commentURL: NSURL;

	readonly domain: string;

	readonly expiresDate: Date;

	readonly name: string;

	readonly path: string;

	readonly portList: NSArray<number>;

	readonly properties: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	readonly sameSitePolicy: string;

	readonly secure: boolean;

	readonly sessionOnly: boolean;

	readonly value: string;

	readonly version: number;

	constructor(o: { properties: NSDictionary<string, any>; });

	initWithProperties(properties: NSDictionary<string, any>): this;
}

declare const enum NSHTTPCookieAcceptPolicy {

	Always = 0,

	Never = 1,

	OnlyFromMainDocumentDomain = 2
}

/**
 * @since 2.0
 */
declare var NSHTTPCookieComment: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieCommentURL: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieDiscard: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieDomain: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieExpires: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieManagerAcceptPolicyChangedNotification: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieManagerCookiesChangedNotification: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieMaximumAge: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieName: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieOriginURL: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookiePath: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookiePort: string;

/**
 * @since 13.0
 */
declare var NSHTTPCookieSameSiteLax: string;

/**
 * @since 13.0
 */
declare var NSHTTPCookieSameSitePolicy: string;

/**
 * @since 13.0
 */
declare var NSHTTPCookieSameSiteStrict: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieSecure: string;

/**
 * @since 2.0
 */
declare class NSHTTPCookieStorage extends NSObject {

	static alloc(): NSHTTPCookieStorage; // inherited from NSObject

	static new(): NSHTTPCookieStorage; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static sharedCookieStorageForGroupContainerIdentifier(identifier: string): NSHTTPCookieStorage;

	cookieAcceptPolicy: NSHTTPCookieAcceptPolicy;

	readonly cookies: NSArray<NSHTTPCookie>;

	static readonly sharedHTTPCookieStorage: NSHTTPCookieStorage;

	cookiesForURL(URL: NSURL): NSArray<NSHTTPCookie>;

	deleteCookie(cookie: NSHTTPCookie): void;

	/**
	 * @since 8.0
	 */
	getCookiesForTaskCompletionHandler(task: NSURLSessionTask, completionHandler: (p1: NSArray<NSHTTPCookie>) => void): void;

	/**
	 * @since 8.0
	 */
	removeCookiesSinceDate(date: Date): void;

	setCookie(cookie: NSHTTPCookie): void;

	setCookiesForURLMainDocumentURL(cookies: NSArray<NSHTTPCookie> | NSHTTPCookie[], URL: NSURL, mainDocumentURL: NSURL): void;

	/**
	 * @since 5.0
	 */
	sortedCookiesUsingDescriptors(sortOrder: NSArray<NSSortDescriptor> | NSSortDescriptor[]): NSArray<NSHTTPCookie>;

	/**
	 * @since 8.0
	 */
	storeCookiesForTask(cookies: NSArray<NSHTTPCookie> | NSHTTPCookie[], task: NSURLSessionTask): void;
}

/**
 * @since 2.0
 */
declare var NSHTTPCookieValue: string;

/**
 * @since 2.0
 */
declare var NSHTTPCookieVersion: string;

/**
 * @since 2.0
 */
declare class NSHTTPURLResponse extends NSURLResponse {

	static alloc(): NSHTTPURLResponse; // inherited from NSObject

	static localizedStringForStatusCode(statusCode: number): string;

	static new(): NSHTTPURLResponse; // inherited from NSObject

	readonly allHeaderFields: NSDictionary<any, any>;

	readonly statusCode: number;

	/**
	 * @since 5.0
	 */
	constructor(o: { URL: NSURL; statusCode: number; HTTPVersion: string; headerFields: NSDictionary<string, string>; });

	/**
	 * @since 5.0
	 */
	initWithURLStatusCodeHTTPVersionHeaderFields(url: NSURL, statusCode: number, HTTPVersion: string, headerFields: NSDictionary<string, string>): this;

	/**
	 * @since 13.0
	 */
	valueForHTTPHeaderField(field: string): string;
}

interface NSHashEnumerator {
	_pi: number;
	_si: number;
	_bs: interop.Pointer | interop.Reference<any>;
}
declare var NSHashEnumerator: interop.StructType<NSHashEnumerator>;

declare function NSHashGet(table: NSHashTable<any>, pointer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function NSHashInsert(table: NSHashTable<any>, pointer: interop.Pointer | interop.Reference<any>): void;

declare function NSHashInsertIfAbsent(table: NSHashTable<any>, pointer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function NSHashInsertKnownAbsent(table: NSHashTable<any>, pointer: interop.Pointer | interop.Reference<any>): void;

declare function NSHashRemove(table: NSHashTable<any>, pointer: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 6.0
 */
declare class NSHashTable<ObjectType> extends NSObject implements NSCopying, NSFastEnumeration, NSSecureCoding {

	static alloc<ObjectType>(): NSHashTable<ObjectType>; // inherited from NSObject

	static hashTableWithOptions<ObjectType>(options: NSPointerFunctionsOptions): NSHashTable<any>;

	static new<ObjectType>(): NSHashTable<ObjectType>; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static weakObjectsHashTable<ObjectType>(): NSHashTable<any>;

	readonly allObjects: NSArray<any>;

	readonly anyObject: any;

	readonly count: number;

	readonly pointerFunctions: NSPointerFunctions;

	readonly setRepresentation: NSSet<any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { options: NSPointerFunctionsOptions; capacity: number; });

	constructor(o: { pointerFunctions: NSPointerFunctions; capacity: number; });

	addObject(object: any): void;

	containsObject(anObject: any): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithOptionsCapacity(options: NSPointerFunctionsOptions, initialCapacity: number): this;

	initWithPointerFunctionsCapacity(functions: NSPointerFunctions, initialCapacity: number): this;

	intersectHashTable(other: NSHashTable<any>): void;

	intersectsHashTable(other: NSHashTable<any>): boolean;

	isEqualToHashTable(other: NSHashTable<any>): boolean;

	isSubsetOfHashTable(other: NSHashTable<any>): boolean;

	member(object: any): any;

	minusHashTable(other: NSHashTable<any>): void;

	objectEnumerator(): NSEnumerator<any>;

	removeAllObjects(): void;

	removeObject(object: any): void;

	unionHashTable(other: NSHashTable<any>): void;
}

interface NSHashTableCallBacks {
	hash: interop.FunctionReference<(p1: NSHashTable<any>, p2: interop.Pointer | interop.Reference<any>) => number>;
	isEqual: interop.FunctionReference<(p1: NSHashTable<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => boolean>;
	retain: interop.FunctionReference<(p1: NSHashTable<any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	release: interop.FunctionReference<(p1: NSHashTable<any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	describe: interop.FunctionReference<(p1: NSHashTable<any>, p2: interop.Pointer | interop.Reference<any>) => string>;
}
declare var NSHashTableCallBacks: interop.StructType<NSHashTableCallBacks>;

/**
 * @since 6.0
 */
declare var NSHashTableCopyIn: NSPointerFunctionsOptions;

/**
 * @since 6.0
 */
declare var NSHashTableObjectPointerPersonality: NSPointerFunctionsOptions;

/**
 * @since 6.0
 */
declare var NSHashTableStrongMemory: NSPointerFunctionsOptions;

/**
 * @since 6.0
 */
declare var NSHashTableWeakMemory: NSPointerFunctionsOptions;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSHebrewCalendar: string;

declare var NSHelpAnchorErrorKey: string;

declare function NSHomeDirectory(): string;

declare function NSHomeDirectoryForUser(userName: string): string;

declare const NSISO2022JPStringEncoding: number;

/**
 * @since 4.0
 * @deprecated 8.0
 */
declare var NSISO8601Calendar: string;

declare const enum NSISO8601DateFormatOptions {

	WithYear = 1,

	WithMonth = 2,

	WithWeekOfYear = 4,

	WithDay = 16,

	WithTime = 32,

	WithTimeZone = 64,

	WithSpaceBetweenDateAndTime = 128,

	WithDashSeparatorInDate = 256,

	WithColonSeparatorInTime = 512,

	WithColonSeparatorInTimeZone = 1024,

	WithFractionalSeconds = 2048,

	WithFullDate = 275,

	WithFullTime = 1632,

	WithInternetDateTime = 1907
}

/**
 * @since 10.0
 */
declare class NSISO8601DateFormatter extends NSFormatter implements NSSecureCoding {

	static alloc(): NSISO8601DateFormatter; // inherited from NSObject

	static new(): NSISO8601DateFormatter; // inherited from NSObject

	static stringFromDateTimeZoneFormatOptions(date: Date, timeZone: NSTimeZone, formatOptions: NSISO8601DateFormatOptions): string;

	formatOptions: NSISO8601DateFormatOptions;

	timeZone: NSTimeZone;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	dateFromString(string: string): Date;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	stringFromDate(date: Date): string;
}

declare const NSISOLatin1StringEncoding: number;

declare const NSISOLatin2StringEncoding: number;

/**
 * @since 15.0
 */
declare var NSImageURLAttributeName: string;

declare var NSInconsistentArchiveException: string;

declare function NSIncrementExtraRefCount(object: any): void;

declare class NSIndexPath extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSIndexPath; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static indexPathForItemInSection(item: number, section: number): NSIndexPath;

	static indexPathForRowInSection(row: number, section: number): NSIndexPath;

	static indexPathWithIndex(index: number): NSIndexPath;

	static indexPathWithIndexesLength(indexes: interop.Reference<number>, length: number): NSIndexPath;

	static new(): NSIndexPath; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly item: number;

	readonly length: number;

	readonly row: number;

	readonly section: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { index: number; });

	constructor(o: { indexes: interop.Reference<number>; length: number; });

	compare(otherObject: NSIndexPath): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	getIndexes(indexes: interop.Pointer | interop.Reference<number>): void;

	/**
	 * @since 7.0
	 */
	getIndexesRange(indexes: interop.Pointer | interop.Reference<number>, positionRange: NSRange): void;

	indexAtPosition(position: number): number;

	indexPathByAddingIndex(index: number): NSIndexPath;

	indexPathByRemovingLastIndex(): NSIndexPath;

	initWithCoder(coder: NSCoder): this;

	initWithIndex(index: number): this;

	initWithIndexesLength(indexes: interop.Reference<number>, length: number): this;
}

declare class NSIndexSet extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSIndexSet; // inherited from NSObject

	static indexSet(): NSIndexSet;

	static indexSetWithIndex(value: number): NSIndexSet;

	static indexSetWithIndexesInRange(range: NSRange): NSIndexSet;

	static new(): NSIndexSet; // inherited from NSObject

	readonly count: number;

	readonly firstIndex: number;

	readonly lastIndex: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { index: number; });

	constructor(o: { indexSet: NSIndexSet; });

	constructor(o: { indexesInRange: NSRange; });

	containsIndex(value: number): boolean;

	containsIndexes(indexSet: NSIndexSet): boolean;

	containsIndexesInRange(range: NSRange): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 2.0
	 */
	countOfIndexesInRange(range: NSRange): number;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateIndexesInRangeOptionsUsingBlock(range: NSRange, opts: NSEnumerationOptions, block: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateIndexesUsingBlock(block: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateIndexesWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 5.0
	 */
	enumerateRangesInRangeOptionsUsingBlock(range: NSRange, opts: NSEnumerationOptions, block: (p1: NSRange, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 5.0
	 */
	enumerateRangesUsingBlock(block: (p1: NSRange, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 5.0
	 */
	enumerateRangesWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: NSRange, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	getIndexesMaxCountInIndexRange(indexBuffer: interop.Pointer | interop.Reference<number>, bufferSize: number, range: interop.Pointer | interop.Reference<NSRange>): number;

	indexGreaterThanIndex(value: number): number;

	indexGreaterThanOrEqualToIndex(value: number): number;

	/**
	 * @since 4.0
	 */
	indexInRangeOptionsPassingTest(range: NSRange, opts: NSEnumerationOptions, predicate: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	indexLessThanIndex(value: number): number;

	indexLessThanOrEqualToIndex(value: number): number;

	/**
	 * @since 4.0
	 */
	indexPassingTest(predicate: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	/**
	 * @since 4.0
	 */
	indexWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	/**
	 * @since 4.0
	 */
	indexesInRangeOptionsPassingTest(range: NSRange, opts: NSEnumerationOptions, predicate: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	/**
	 * @since 4.0
	 */
	indexesPassingTest(predicate: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	/**
	 * @since 4.0
	 */
	indexesWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	initWithCoder(coder: NSCoder): this;

	initWithIndex(value: number): this;

	initWithIndexSet(indexSet: NSIndexSet): this;

	initWithIndexesInRange(range: NSRange): this;

	intersectsIndexesInRange(range: NSRange): boolean;

	isEqualToIndexSet(indexSet: NSIndexSet): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.0
 * @deprecated 8.0
 */
declare var NSIndianCalendar: string;

/**
 * @since 17.0
 */
declare var NSInflectionAgreementArgumentAttributeName: string;

/**
 * @since 17.0
 */
declare var NSInflectionAgreementConceptAttributeName: string;

/**
 * @since 15.0
 */
declare var NSInflectionAlternativeAttributeName: string;

/**
 * @since 17.0
 */
declare var NSInflectionConceptsKey: string;

/**
 * @since 17.0
 */
declare var NSInflectionReferentConceptAttributeName: string;

/**
 * @since 15.0
 */
declare class NSInflectionRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSInflectionRule; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static canInflectLanguage(language: string): boolean;

	static new(): NSInflectionRule; // inherited from NSObject

	static readonly automaticRule: NSInflectionRule;

	/**
	 * @since 15.0
	 */
	static readonly canInflectPreferredLocalization: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare var NSInflectionRuleAttributeName: string;

/**
 * @since 15.0
 */
declare class NSInflectionRuleExplicit extends NSInflectionRule {

	static alloc(): NSInflectionRuleExplicit; // inherited from NSObject

	static new(): NSInflectionRuleExplicit; // inherited from NSObject

	readonly morphology: NSMorphology;

	constructor(o: { morphology: NSMorphology; });

	initWithMorphology(morphology: NSMorphology): this;
}

/**
 * @since 15.0
 */
declare const enum NSInlinePresentationIntent {

	Emphasized = 1,

	StronglyEmphasized = 2,

	Code = 4,

	Strikethrough = 32,

	SoftBreak = 64,

	LineBreak = 128,

	InlineHTML = 256,

	BlockHTML = 512
}

/**
 * @since 15.0
 */
declare var NSInlinePresentationIntentAttributeName: string;

declare class NSInputStream extends NSStream {

	static alloc(): NSInputStream; // inherited from NSObject

	static inputStreamWithData(data: NSData): NSInputStream;

	static inputStreamWithFileAtPath(path: string): NSInputStream;

	/**
	 * @since 4.0
	 */
	static inputStreamWithURL(url: NSURL): NSInputStream;

	static new(): NSInputStream; // inherited from NSObject

	readonly hasBytesAvailable: boolean;

	constructor(o: { data: NSData; });

	constructor(o: { fileAtPath: string; });

	/**
	 * @since 4.0
	 */
	constructor(o: { URL: NSURL; });

	getBufferLength(buffer: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, len: interop.Pointer | interop.Reference<number>): boolean;

	initWithData(data: NSData): this;

	initWithFileAtPath(path: string): this;

	/**
	 * @since 4.0
	 */
	initWithURL(url: NSURL): this;

	readMaxLength(buffer: string | interop.Pointer | interop.Reference<any>, len: number): number;
}

/**
 * @since 2.0
 * @deprecated 2.0
 */
declare var NSIntMapKeyCallBacks: NSMapTableKeyCallBacks;

/**
 * @since 2.0
 * @deprecated 2.0
 */
declare var NSIntMapValueCallBacks: NSMapTableValueCallBacks;

declare var NSInternalInconsistencyException: string;

declare function NSIntersectionRange(range1: NSRange, range2: NSRange): NSRange;

declare var NSInvalidArchiveOperationException: string;

declare var NSInvalidArgumentException: string;

declare var NSInvalidReceivePortException: string;

declare var NSInvalidSendPortException: string;

declare var NSInvalidUnarchiveOperationException: string;

declare class NSInvocation extends NSObject {

	static alloc(): NSInvocation; // inherited from NSObject

	static invocationWithMethodSignature(sig: NSMethodSignature): NSInvocation;

	static new(): NSInvocation; // inherited from NSObject

	readonly argumentsRetained: boolean;

	readonly methodSignature: NSMethodSignature;

	selector: string;

	target: any;

	getArgumentAtIndex(argumentLocation: interop.Pointer | interop.Reference<any>, idx: number): void;

	getReturnValue(retLoc: interop.Pointer | interop.Reference<any>): void;

	invoke(): void;

	invokeUsingIMP(imp: interop.FunctionReference<() => void>): void;

	invokeWithTarget(target: any): void;

	retainArguments(): void;

	setArgumentAtIndex(argumentLocation: interop.Pointer | interop.Reference<any>, idx: number): void;

	setReturnValue(retLoc: interop.Pointer | interop.Reference<any>): void;
}

/**
 * @since 2.0
 */
declare class NSInvocationOperation extends NSOperation {

	static alloc(): NSInvocationOperation; // inherited from NSObject

	static new(): NSInvocationOperation; // inherited from NSObject

	readonly invocation: NSInvocation;

	readonly result: any;

	constructor(o: { invocation: NSInvocation; });

	constructor(o: { target: any; selector: string; object: any; });

	initWithInvocation(inv: NSInvocation): this;

	initWithTargetSelectorObject(target: any, sel: string, arg: any): this;
}

/**
 * @since 2.0
 */
declare var NSInvocationOperationCancelledException: string;

/**
 * @since 2.0
 */
declare var NSInvocationOperationVoidResultException: string;

/**
 * @since 3.0
 */
declare var NSIsNilTransformerName: string;

/**
 * @since 3.0
 */
declare var NSIsNotNilTransformerName: string;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSIslamicCalendar: string;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSIslamicCivilCalendar: string;

/**
 * @since 8.0
 */
declare class NSItemProvider extends NSObject implements NSCopying {

	static alloc(): NSItemProvider; // inherited from NSObject

	static new(): NSItemProvider; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	preferredPresentationSize: CGSize;

	/**
	 * @since 11.0
	 */
	preferredPresentationStyle: UIPreferredPresentationStyle;

	/**
	 * @since 8.0
	 */
	previewImageHandler: (p1: (p1: NSSecureCoding, p2: NSError) => void, p2: typeof NSObject, p3: NSDictionary<any, any>) => void;

	/**
	 * @since 16.0
	 */
	readonly registeredContentTypes: NSArray<UTType>;

	/**
	 * @since 16.0
	 */
	readonly registeredContentTypesForOpenInPlace: NSArray<UTType>;

	readonly registeredTypeIdentifiers: NSArray<string>;

	/**
	 * @since 11.0
	 */
	suggestedName: string;

	/**
	 * @since 11.0
	 */
	teamData: NSData;

	constructor(o: { contentsOfURL: NSURL; });

	/**
	 * @since 16.0
	 */
	constructor(o: { contentsOfURL: NSURL; contentType: UTType; openInPlace: boolean; coordinated: boolean; visibility: NSItemProviderRepresentationVisibility; });

	constructor(o: { item: NSSecureCoding; typeIdentifier: string; });

	/**
	 * @since 11.0
	 */
	constructor(o: { object: NSItemProviderWriting; });

	/**
	 * @since 11.0
	 */
	canLoadObjectOfClass(aClass: typeof NSObject): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	hasItemConformingToTypeIdentifier(typeIdentifier: string): boolean;

	/**
	 * @since 11.0
	 */
	hasRepresentationConformingToTypeIdentifierFileOptions(typeIdentifier: string, fileOptions: NSItemProviderFileOptions): boolean;

	initWithContentsOfURL(fileURL: NSURL): this;

	/**
	 * @since 16.0
	 */
	initWithContentsOfURLContentTypeOpenInPlaceCoordinatedVisibility(fileURL: NSURL, contentType: UTType, openInPlace: boolean, coordinated: boolean, visibility: NSItemProviderRepresentationVisibility): this;

	initWithItemTypeIdentifier(item: NSSecureCoding, typeIdentifier: string): this;

	/**
	 * @since 11.0
	 */
	initWithObject(object: NSItemProviderWriting): this;

	/**
	 * @since 16.0
	 */
	loadDataRepresentationForContentTypeCompletionHandler(contentType: UTType, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	/**
	 * @since 11.0
	 */
	loadDataRepresentationForTypeIdentifierCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	/**
	 * @since 16.0
	 */
	loadFileRepresentationForContentTypeOpenInPlaceCompletionHandler(contentType: UTType, openInPlace: boolean, completionHandler: (p1: NSURL, p2: boolean, p3: NSError) => void): NSProgress;

	/**
	 * @since 11.0
	 */
	loadFileRepresentationForTypeIdentifierCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSURL, p2: NSError) => void): NSProgress;

	/**
	 * @since 11.0
	 */
	loadInPlaceFileRepresentationForTypeIdentifierCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSURL, p2: boolean, p3: NSError) => void): NSProgress;

	loadItemForTypeIdentifierOptionsCompletionHandler(typeIdentifier: string, options: NSDictionary<any, any>, completionHandler: (p1: NSSecureCoding, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	loadObjectOfClassCompletionHandler(aClass: typeof NSObject, completionHandler: (p1: NSItemProviderReading, p2: NSError) => void): NSProgress;

	/**
	 * @since 8.0
	 */
	loadPreviewImageWithOptionsCompletionHandler(options: NSDictionary<any, any>, completionHandler: (p1: NSSecureCoding, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	registerCKShareContainerAllowedSharingOptions(share: CKShare, container: CKContainer, allowedOptions: CKAllowedSharingOptions): void;

	/**
	 * @since 16.0
	 */
	registerCKShareWithContainerAllowedSharingOptionsPreparationHandler(container: CKContainer, allowedOptions: CKAllowedSharingOptions, preparationHandler: (p1: (p1: CKShare, p2: NSError) => void) => void): void;

	/**
	 * @since 16.0
	 */
	registerDataRepresentationForContentTypeVisibilityLoadHandler(contentType: UTType, visibility: NSItemProviderRepresentationVisibility, loadHandler: (p1: (p1: NSData, p2: NSError) => void) => NSProgress): void;

	/**
	 * @since 11.0
	 */
	registerDataRepresentationForTypeIdentifierVisibilityLoadHandler(typeIdentifier: string, visibility: NSItemProviderRepresentationVisibility, loadHandler: (p1: (p1: NSData, p2: NSError) => void) => NSProgress): void;

	/**
	 * @since 16.0
	 */
	registerFileRepresentationForContentTypeVisibilityOpenInPlaceLoadHandler(contentType: UTType, visibility: NSItemProviderRepresentationVisibility, openInPlace: boolean, loadHandler: (p1: (p1: NSURL, p2: boolean, p3: NSError) => void) => NSProgress): void;

	/**
	 * @since 11.0
	 */
	registerFileRepresentationForTypeIdentifierFileOptionsVisibilityLoadHandler(typeIdentifier: string, fileOptions: NSItemProviderFileOptions, visibility: NSItemProviderRepresentationVisibility, loadHandler: (p1: (p1: NSURL, p2: boolean, p3: NSError) => void) => NSProgress): void;

	registerItemForTypeIdentifierLoadHandler(typeIdentifier: string, loadHandler: (p1: (p1: NSSecureCoding, p2: NSError) => void, p2: typeof NSObject, p3: NSDictionary<any, any>) => void): void;

	/**
	 * @since 11.0
	 */
	registerObjectOfClassVisibilityLoadHandler(aClass: typeof NSObject, visibility: NSItemProviderRepresentationVisibility, loadHandler: (p1: (p1: NSItemProviderWriting, p2: NSError) => void) => NSProgress): void;

	/**
	 * @since 11.0
	 */
	registerObjectVisibility(object: NSItemProviderWriting, visibility: NSItemProviderRepresentationVisibility): void;

	/**
	 * @since 16.0
	 */
	registeredContentTypesConformingToContentType(contentType: UTType): NSArray<UTType>;

	/**
	 * @since 11.0
	 */
	registeredTypeIdentifiersWithFileOptions(fileOptions: NSItemProviderFileOptions): NSArray<string>;
}

/**
 * @since 8.0
 */
declare const enum NSItemProviderErrorCode {

	UnknownError = -1,

	ItemUnavailableError = -1000,

	UnexpectedValueClassError = -1100,

	UnavailableCoercionError = -1200
}

/**
 * @since 8.0
 */
declare var NSItemProviderErrorDomain: string;

/**
 * @since 11.0
 */
declare const enum NSItemProviderFileOptions {

	OpenInPlace = 1
}

/**
 * @since 8.0
 */
declare var NSItemProviderPreferredImageSizeKey: string;

/**
 * @since 11.0
 */
interface NSItemProviderReading extends NSObjectProtocol {
}
declare var NSItemProviderReading: {

	prototype: NSItemProviderReading;

	objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSItemProviderReading;
};

/**
 * @since 11.0
 */
declare const enum NSItemProviderRepresentationVisibility {

	All = 0,

	Team = 1,

	Group = 2,

	OwnProcess = 3
}

/**
 * @since 11.0
 */
interface NSItemProviderWriting extends NSObjectProtocol {

	writableTypeIdentifiersForItemProvider?: NSArray<string>;

	itemProviderVisibilityForRepresentationWithTypeIdentifier?(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;
}
declare var NSItemProviderWriting: {

	prototype: NSItemProviderWriting;

	itemProviderVisibilityForRepresentationWithTypeIdentifier?(typeIdentifier: string): NSItemProviderRepresentationVisibility;
};

/**
 * @since 5.0
 */
declare const enum NSJSONReadingOptions {

	MutableContainers = 1,

	MutableLeaves = 2,

	FragmentsAllowed = 4,

	JSON5Allowed = 8,

	TopLevelDictionaryAssumed = 16,

	AllowFragments = 4
}

/**
 * @since 5.0
 */
declare class NSJSONSerialization extends NSObject {

	static JSONObjectWithDataOptionsError(data: NSData, opt: NSJSONReadingOptions): any;

	static JSONObjectWithStreamOptionsError(stream: NSInputStream, opt: NSJSONReadingOptions): any;

	static alloc(): NSJSONSerialization; // inherited from NSObject

	static dataWithJSONObjectOptionsError(obj: any, opt: NSJSONWritingOptions): NSData;

	static isValidJSONObject(obj: any): boolean;

	static new(): NSJSONSerialization; // inherited from NSObject

	static writeJSONObjectToStreamOptionsError(obj: any, stream: NSOutputStream, opt: NSJSONWritingOptions): number;
}

/**
 * @since 5.0
 */
declare const enum NSJSONWritingOptions {

	PrettyPrinted = 1,

	SortedKeys = 2,

	FragmentsAllowed = 4,

	WithoutEscapingSlashes = 8
}

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare var NSJapaneseCalendar: string;

declare const NSJapaneseEUCStringEncoding: number;

declare const enum NSKeyValueChange {

	Setting = 1,

	Insertion = 2,

	Removal = 3,

	Replacement = 4
}

declare var NSKeyValueChangeIndexesKey: string;

declare var NSKeyValueChangeKindKey: string;

declare var NSKeyValueChangeNewKey: string;

/**
 * @since 2.0
 */
declare var NSKeyValueChangeNotificationIsPriorKey: string;

declare var NSKeyValueChangeOldKey: string;

declare const enum NSKeyValueObservingOptions {

	New = 1,

	Old = 2,

	Initial = 4,

	Prior = 8
}

declare const enum NSKeyValueSetMutationKind {

	UnionSetMutation = 1,

	MinusSetMutation = 2,

	IntersectSetMutation = 3,

	SetSetMutation = 4
}

/**
 * @since 18.0
 */
declare class NSKeyValueSharedObservers extends NSObject {

	static alloc(): NSKeyValueSharedObservers; // inherited from NSObject

	static new(): NSKeyValueSharedObservers; // inherited from NSObject

	constructor(o: { observableClass: typeof NSObject; });

	addSharedObserverForKeyOptionsContext(observer: NSObject, key: string, options: NSKeyValueObservingOptions, context: interop.Pointer | interop.Reference<any>): void;

	initWithObservableClass(observableClass: typeof NSObject): this;

	snapshot(): NSKeyValueSharedObserversSnapshot;
}

/**
 * @since 18.0
 */
declare class NSKeyValueSharedObserversSnapshot extends NSObject {

	static alloc(): NSKeyValueSharedObserversSnapshot; // inherited from NSObject

	static new(): NSKeyValueSharedObserversSnapshot; // inherited from NSObject
}

declare const NSKeyValueValidationError: number;

/**
 * @since 7.0
 */
declare var NSKeyedArchiveRootObjectKey: string;

declare class NSKeyedArchiver extends NSCoder {

	static alloc(): NSKeyedArchiver; // inherited from NSObject

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	static archiveRootObjectToFile(rootObject: any, path: string): boolean;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	static archivedDataWithRootObject(rootObject: any): NSData;

	/**
	 * @since 11.0
	 */
	static archivedDataWithRootObjectRequiringSecureCodingError(object: any, requiresSecureCoding: boolean): NSData;

	static classNameForClass(cls: typeof NSObject): string;

	static new(): NSKeyedArchiver; // inherited from NSObject

	static setClassNameForClass(codedName: string, cls: typeof NSObject): void;

	delegate: NSKeyedArchiverDelegate;

	/**
	 * @since 10.0
	 */
	readonly encodedData: NSData;

	outputFormat: NSPropertyListFormat;

	/**
	 * @since 6.0
	 */
	requiresSecureCoding: boolean;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	constructor(o: { forWritingWithMutableData: NSMutableData; });

	/**
	 * @since 11.0
	 */
	constructor(o: { requiringSecureCoding: boolean; });

	classNameForClass(cls: typeof NSObject): string;

	finishEncoding(): void;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	initForWritingWithMutableData(data: NSMutableData): this;

	/**
	 * @since 11.0
	 */
	initRequiringSecureCoding(requiresSecureCoding: boolean): this;

	setClassNameForClass(codedName: string, cls: typeof NSObject): void;
}

interface NSKeyedArchiverDelegate extends NSObjectProtocol {

	archiverDidEncodeObject?(archiver: NSKeyedArchiver, object: any): void;

	archiverDidFinish?(archiver: NSKeyedArchiver): void;

	archiverWillEncodeObject?(archiver: NSKeyedArchiver, object: any): any;

	archiverWillFinish?(archiver: NSKeyedArchiver): void;

	archiverWillReplaceObjectWithObject?(archiver: NSKeyedArchiver, object: any, newObject: any): void;
}
declare var NSKeyedArchiverDelegate: {

	prototype: NSKeyedArchiverDelegate;
};

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare var NSKeyedUnarchiveFromDataTransformerName: string;

declare class NSKeyedUnarchiver extends NSCoder {

	static alloc(): NSKeyedUnarchiver; // inherited from NSObject

	static classForClassName(codedName: string): typeof NSObject;

	static new(): NSKeyedUnarchiver; // inherited from NSObject

	static setClassForClassName(cls: typeof NSObject, codedName: string): void;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	static unarchiveObjectWithData(data: NSData): any;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	static unarchiveObjectWithFile(path: string): any;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	static unarchiveTopLevelObjectWithDataError(data: NSData): any;

	/**
	 * @since 14.0
	 */
	static unarchivedArrayOfObjectsOfClassFromDataError(cls: typeof NSObject, data: NSData): NSArray<any>;

	/**
	 * @since 14.0
	 */
	static unarchivedArrayOfObjectsOfClassesFromDataError(classes: NSSet<typeof NSObject>, data: NSData): NSArray<any>;

	/**
	 * @since 14.0
	 */
	static unarchivedDictionaryWithKeysOfClassObjectsOfClassFromDataError(keyCls: typeof NSObject, valueCls: typeof NSObject, data: NSData): NSDictionary<any, any>;

	/**
	 * @since 14.0
	 */
	static unarchivedDictionaryWithKeysOfClassesObjectsOfClassesFromDataError(keyClasses: NSSet<typeof NSObject>, valueClasses: NSSet<typeof NSObject>, data: NSData): NSDictionary<any, any>;

	/**
	 * @since 11.0
	 */
	static unarchivedObjectOfClassFromDataError(cls: typeof NSObject, data: NSData): any;

	/**
	 * @since 11.0
	 */
	static unarchivedObjectOfClassesFromDataError(classes: NSSet<typeof NSObject>, data: NSData): any;

	/**
	 * @since 9.0
	 */
	decodingFailurePolicy: NSDecodingFailurePolicy;

	delegate: NSKeyedUnarchiverDelegate;

	/**
	 * @since 6.0
	 */
	requiresSecureCoding: boolean;

	/**
	 * @since 11.0
	 */
	constructor(o: { forReadingFromData: NSData; });

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	constructor(o: { forReadingWithData: NSData; });

	classForClassName(codedName: string): typeof NSObject;

	finishDecoding(): void;

	/**
	 * @since 11.0
	 */
	initForReadingFromDataError(data: NSData): this;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	initForReadingWithData(data: NSData): this;

	setClassForClassName(cls: typeof NSObject, codedName: string): void;
}

interface NSKeyedUnarchiverDelegate extends NSObjectProtocol {

	unarchiverCannotDecodeObjectOfClassNameOriginalClasses?(unarchiver: NSKeyedUnarchiver, name: string, classNames: NSArray<string> | string[]): typeof NSObject;

	unarchiverDidDecodeObject?(unarchiver: NSKeyedUnarchiver, object: any): any;

	unarchiverDidFinish?(unarchiver: NSKeyedUnarchiver): void;

	unarchiverWillFinish?(unarchiver: NSKeyedUnarchiver): void;

	unarchiverWillReplaceObjectWithObject?(unarchiver: NSKeyedUnarchiver, object: any, newObject: any): void;
}
declare var NSKeyedUnarchiverDelegate: {

	prototype: NSKeyedUnarchiverDelegate;
};

/**
 * @since 15.0
 */
declare var NSLanguageIdentifierAttributeName: string;

/**
 * @since 8.0
 */
declare class NSLengthFormatter extends NSFormatter {

	static alloc(): NSLengthFormatter; // inherited from NSObject

	static new(): NSLengthFormatter; // inherited from NSObject

	forPersonHeightUse: boolean;

	numberFormatter: NSNumberFormatter;

	unitStyle: NSFormattingUnitStyle;

	stringFromMeters(numberInMeters: number): string;

	stringFromValueUnit(value: number, unit: NSLengthFormatterUnit): string;

	unitStringFromMetersUsedUnit(numberInMeters: number, unitp: interop.Pointer | interop.Reference<NSLengthFormatterUnit>): string;

	unitStringFromValueUnit(value: number, unit: NSLengthFormatterUnit): string;
}

/**
 * @since 8.0
 */
declare const enum NSLengthFormatterUnit {

	Millimeter = 8,

	Centimeter = 9,

	Meter = 11,

	Kilometer = 14,

	Inch = 1281,

	Foot = 1282,

	Yard = 1283,

	Mile = 1284
}

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagAdjective: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagAdverb: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagClassifier: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagCloseParenthesis: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagCloseQuote: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagConjunction: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagDash: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagDeterminer: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagIdiom: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagInterjection: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagNoun: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagNumber: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOpenParenthesis: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOpenQuote: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOrganizationName: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOther: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOtherPunctuation: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOtherWhitespace: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagOtherWord: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagParagraphBreak: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagParticle: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagPersonalName: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagPlaceName: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagPreposition: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagPronoun: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagPunctuation: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeLanguage: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeLemma: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeLexicalClass: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeNameType: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeNameTypeOrLexicalClass: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeScript: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSchemeTokenType: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagSentenceTerminator: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagVerb: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagWhitespace: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagWord: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare var NSLinguisticTagWordJoiner: string;

/**
 * @since 5.0
 * @deprecated 100000
 */
declare class NSLinguisticTagger extends NSObject {

	static alloc(): NSLinguisticTagger; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	static availableTagSchemesForLanguage(language: string): NSArray<string>;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	static availableTagSchemesForUnitLanguage(unit: NSLinguisticTaggerUnit, language: string): NSArray<string>;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	static dominantLanguageForString(string: string): string;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	static enumerateTagsForStringRangeUnitSchemeOptionsOrthographyUsingBlock(string: string, range: NSRange, unit: NSLinguisticTaggerUnit, scheme: string, options: NSLinguisticTaggerOptions, orthography: NSOrthography, block: (p1: string, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	static new(): NSLinguisticTagger; // inherited from NSObject

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	static tagForStringAtIndexUnitSchemeOrthographyTokenRange(string: string, charIndex: number, unit: NSLinguisticTaggerUnit, scheme: string, orthography: NSOrthography, tokenRange: interop.Pointer | interop.Reference<NSRange>): string;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	static tagsForStringRangeUnitSchemeOptionsOrthographyTokenRanges(string: string, range: NSRange, unit: NSLinguisticTaggerUnit, scheme: string, options: NSLinguisticTaggerOptions, orthography: NSOrthography, tokenRanges: interop.Pointer | interop.Reference<NSArray<NSValue>>): NSArray<string>;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	readonly dominantLanguage: string;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	string: string;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	readonly tagSchemes: NSArray<string>;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	constructor(o: { tagSchemes: NSArray<string> | string[]; options: number; });

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	enumerateTagsInRangeSchemeOptionsUsingBlock(range: NSRange, tagScheme: string, opts: NSLinguisticTaggerOptions, block: (p1: string, p2: NSRange, p3: NSRange, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	enumerateTagsInRangeUnitSchemeOptionsUsingBlock(range: NSRange, unit: NSLinguisticTaggerUnit, scheme: string, options: NSLinguisticTaggerOptions, block: (p1: string, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	initWithTagSchemesOptions(tagSchemes: NSArray<string> | string[], opts: number): this;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	orthographyAtIndexEffectiveRange(charIndex: number, effectiveRange: interop.Pointer | interop.Reference<NSRange>): NSOrthography;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	possibleTagsAtIndexSchemeTokenRangeSentenceRangeScores(charIndex: number, tagScheme: string, tokenRange: interop.Pointer | interop.Reference<NSRange>, sentenceRange: interop.Pointer | interop.Reference<NSRange>, scores: interop.Pointer | interop.Reference<NSArray<NSValue>>): NSArray<string>;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	sentenceRangeForRange(range: NSRange): NSRange;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	setOrthographyRange(orthography: NSOrthography, range: NSRange): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	stringEditedInRangeChangeInLength(newRange: NSRange, delta: number): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	tagAtIndexSchemeTokenRangeSentenceRange(charIndex: number, scheme: string, tokenRange: interop.Pointer | interop.Reference<NSRange>, sentenceRange: interop.Pointer | interop.Reference<NSRange>): string;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	tagAtIndexUnitSchemeTokenRange(charIndex: number, unit: NSLinguisticTaggerUnit, scheme: string, tokenRange: interop.Pointer | interop.Reference<NSRange>): string;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	tagsInRangeSchemeOptionsTokenRanges(range: NSRange, tagScheme: string, opts: NSLinguisticTaggerOptions, tokenRanges: interop.Pointer | interop.Reference<NSArray<NSValue>>): NSArray<string>;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	tagsInRangeUnitSchemeOptionsTokenRanges(range: NSRange, unit: NSLinguisticTaggerUnit, scheme: string, options: NSLinguisticTaggerOptions, tokenRanges: interop.Pointer | interop.Reference<NSArray<NSValue>>): NSArray<string>;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	tokenRangeAtIndexUnit(charIndex: number, unit: NSLinguisticTaggerUnit): NSRange;
}

declare const enum NSLinguisticTaggerOptions {

	OmitWords = 1,

	OmitPunctuation = 2,

	OmitWhitespace = 4,

	OmitOther = 8,

	JoinNames = 16
}

declare const enum NSLinguisticTaggerUnit {

	Word = 0,

	Sentence = 1,

	Paragraph = 2,

	Document = 3
}

/**
 * @since 13.0
 */
declare class NSListFormatter extends NSFormatter {

	static alloc(): NSListFormatter; // inherited from NSObject

	static localizedStringByJoiningStrings(strings: NSArray<string> | string[]): string;

	static new(): NSListFormatter; // inherited from NSObject

	itemFormatter: NSFormatter;

	locale: NSLocale;

	stringFromItems(items: NSArray<any> | any[]): string;
}

declare var NSLoadedClasses: string;

declare class NSLocale extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSLocale; // inherited from NSObject

	static canonicalLanguageIdentifierFromString(string: string): string;

	static canonicalLocaleIdentifierFromString(string: string): string;

	/**
	 * @since 4.0
	 */
	static characterDirectionForLanguage(isoLangCode: string): NSLocaleLanguageDirection;

	static componentsFromLocaleIdentifier(string: string): NSDictionary<string, string>;

	/**
	 * @since 4.0
	 */
	static lineDirectionForLanguage(isoLangCode: string): NSLocaleLanguageDirection;

	static localeIdentifierFromComponents(dict: NSDictionary<string, string>): string;

	/**
	 * @since 4.0
	 */
	static localeIdentifierFromWindowsLocaleCode(lcid: number): string;

	/**
	 * @since 4.0
	 */
	static localeWithLocaleIdentifier(ident: string): NSLocale;

	static new(): NSLocale; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static windowsLocaleCodeFromLocaleIdentifier(localeIdentifier: string): number;

	/**
	 * @since 10.0
	 */
	readonly alternateQuotationBeginDelimiter: string;

	/**
	 * @since 10.0
	 */
	readonly alternateQuotationEndDelimiter: string;

	/**
	 * @since 10.0
	 */
	readonly calendarIdentifier: string;

	/**
	 * @since 10.0
	 */
	readonly collationIdentifier: string;

	/**
	 * @since 10.0
	 */
	readonly collatorIdentifier: string;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	readonly countryCode: string;

	/**
	 * @since 10.0
	 */
	readonly currencyCode: string;

	/**
	 * @since 10.0
	 */
	readonly currencySymbol: string;

	/**
	 * @since 10.0
	 */
	readonly decimalSeparator: string;

	/**
	 * @since 10.0
	 */
	readonly exemplarCharacterSet: NSCharacterSet;

	/**
	 * @since 10.0
	 */
	readonly groupingSeparator: string;

	/**
	 * @since 10.0
	 */
	readonly languageCode: string;

	/**
	 * @since 17.0
	 */
	readonly languageIdentifier: string;

	readonly localeIdentifier: string;

	/**
	 * @since 10.0
	 */
	readonly quotationBeginDelimiter: string;

	/**
	 * @since 10.0
	 */
	readonly quotationEndDelimiter: string;

	/**
	 * @since 17.0
	 */
	readonly regionCode: string;

	/**
	 * @since 10.0
	 */
	readonly scriptCode: string;

	/**
	 * @since 10.0
	 */
	readonly usesMetricSystem: boolean;

	/**
	 * @since 10.0
	 */
	readonly variantCode: string;

	static readonly ISOCountryCodes: NSArray<string>;

	static readonly ISOCurrencyCodes: NSArray<string>;

	static readonly ISOLanguageCodes: NSArray<string>;

	/**
	 * @since 2.0
	 */
	static readonly autoupdatingCurrentLocale: NSLocale;

	static readonly availableLocaleIdentifiers: NSArray<string>;

	/**
	 * @since 2.0
	 */
	static readonly commonISOCurrencyCodes: NSArray<string>;

	static readonly currentLocale: NSLocale;

	/**
	 * @since 2.0
	 */
	static readonly preferredLanguages: NSArray<string>;

	static readonly systemLocale: NSLocale;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { localeIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	displayNameForKeyValue(key: string, value: any): string;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocaleIdentifier(string: string): this;

	/**
	 * @since 10.0
	 */
	localizedStringForCalendarIdentifier(calendarIdentifier: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForCollationIdentifier(collationIdentifier: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForCollatorIdentifier(collatorIdentifier: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForCountryCode(countryCode: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForCurrencyCode(currencyCode: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForLanguageCode(languageCode: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForLocaleIdentifier(localeIdentifier: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForScriptCode(scriptCode: string): string;

	/**
	 * @since 10.0
	 */
	localizedStringForVariantCode(variantCode: string): string;

	objectForKey(key: string): any;
}

/**
 * @since 4.0
 */
declare var NSLocaleAlternateQuotationBeginDelimiterKey: string;

/**
 * @since 4.0
 */
declare var NSLocaleAlternateQuotationEndDelimiterKey: string;

declare var NSLocaleCalendar: string;

declare var NSLocaleCollationIdentifier: string;

/**
 * @since 4.0
 */
declare var NSLocaleCollatorIdentifier: string;

declare var NSLocaleCountryCode: string;

declare var NSLocaleCurrencyCode: string;

declare var NSLocaleCurrencySymbol: string;

declare var NSLocaleDecimalSeparator: string;

declare var NSLocaleExemplarCharacterSet: string;

declare var NSLocaleGroupingSeparator: string;

declare var NSLocaleIdentifier: string;

declare var NSLocaleLanguageCode: string;

declare const enum NSLocaleLanguageDirection {

	Unknown = 0,

	LeftToRight = 1,

	RightToLeft = 2,

	TopToBottom = 3,

	BottomToTop = 4
}

declare var NSLocaleMeasurementSystem: string;

/**
 * @since 4.0
 */
declare var NSLocaleQuotationBeginDelimiterKey: string;

/**
 * @since 4.0
 */
declare var NSLocaleQuotationEndDelimiterKey: string;

declare var NSLocaleScriptCode: string;

declare var NSLocaleUsesMetricSystem: string;

declare var NSLocaleVariantCode: string;

declare var NSLocalizedDescriptionKey: string;

/**
 * @since 11.0
 */
declare var NSLocalizedFailureErrorKey: string;

declare var NSLocalizedFailureReasonErrorKey: string;

/**
 * @since 18.0
 */
declare var NSLocalizedNumberFormatAttributeName: string;

/**
 * @since 18.0
 */
declare class NSLocalizedNumberFormatRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSLocalizedNumberFormatRule; // inherited from NSObject

	static automatic(): NSLocalizedNumberFormatRule;

	static new(): NSLocalizedNumberFormatRule; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var NSLocalizedRecoveryOptionsErrorKey: string;

declare var NSLocalizedRecoverySuggestionErrorKey: string;

declare class NSLock extends NSObject implements NSLocking {

	static alloc(): NSLock; // inherited from NSObject

	static new(): NSLock; // inherited from NSObject

	/**
	 * @since 2.0
	 */
	name: string;

	lock(): void;

	lockBeforeDate(limit: Date): boolean;

	tryLock(): boolean;

	unlock(): void;
}

interface NSLocking {

	lock(): void;

	unlock(): void;
}
declare var NSLocking: {

	prototype: NSLocking;
};

declare function NSLogPageSize(): number;

declare const NSMACHOperatingSystem: number;

declare const NSMacOSRomanStringEncoding: number;

declare var NSMachErrorDomain: string;

declare class NSMachPort extends NSPort {

	static alloc(): NSMachPort; // inherited from NSObject

	static new(): NSMachPort; // inherited from NSObject

	static portWithMachPort(machPort: number): NSPort;

	/**
	 * @since 2.0
	 */
	static portWithMachPortOptions(machPort: number, f: NSMachPortOptions): NSPort;

	readonly machPort: number;

	constructor(o: { machPort: number; });

	/**
	 * @since 2.0
	 */
	constructor(o: { machPort: number; options: NSMachPortOptions; });

	delegate(): NSMachPortDelegate;

	initWithMachPort(machPort: number): this;

	/**
	 * @since 2.0
	 */
	initWithMachPortOptions(machPort: number, f: NSMachPortOptions): this;

	setDelegate(anObject: NSMachPortDelegate): void;
}

interface NSMachPortDelegate extends NSPortDelegate {

	handleMachMessage?(msg: interop.Pointer | interop.Reference<any>): void;
}
declare var NSMachPortDelegate: {

	prototype: NSMachPortDelegate;
};

/**
 * @since 2.0
 */
declare const enum NSMachPortOptions {

	DeallocateNone = 0,

	DeallocateSendRight = 1,

	DeallocateReceiveRight = 2
}

declare function NSMakeCollectable(cf: any): any;

declare var NSMallocException: string;

interface NSMapEnumerator {
	_pi: number;
	_si: number;
	_bs: interop.Pointer | interop.Reference<any>;
}
declare var NSMapEnumerator: interop.StructType<NSMapEnumerator>;

declare function NSMapGet(table: NSMapTable<any, any>, key: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function NSMapInsert(table: NSMapTable<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function NSMapInsertIfAbsent(table: NSMapTable<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function NSMapInsertKnownAbsent(table: NSMapTable<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function NSMapMember(table: NSMapTable<any, any>, key: interop.Pointer | interop.Reference<any>, originalKey: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function NSMapRemove(table: NSMapTable<any, any>, key: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 6.0
 */
declare class NSMapTable<KeyType, ObjectType> extends NSObject implements NSCopying, NSFastEnumeration, NSSecureCoding {

	static alloc<KeyType, ObjectType>(): NSMapTable<KeyType, ObjectType>; // inherited from NSObject

	static mapTableWithKeyOptionsValueOptions<KeyType, ObjectType>(keyOptions: NSPointerFunctionsOptions, valueOptions: NSPointerFunctionsOptions): NSMapTable<any, any>;

	static new<KeyType, ObjectType>(): NSMapTable<KeyType, ObjectType>; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static strongToStrongObjectsMapTable<KeyType, ObjectType>(): NSMapTable<any, any>;

	/**
	 * @since 6.0
	 */
	static strongToWeakObjectsMapTable<KeyType, ObjectType>(): NSMapTable<any, any>;

	/**
	 * @since 6.0
	 */
	static weakToStrongObjectsMapTable<KeyType, ObjectType>(): NSMapTable<any, any>;

	/**
	 * @since 6.0
	 */
	static weakToWeakObjectsMapTable<KeyType, ObjectType>(): NSMapTable<any, any>;

	readonly count: number;

	readonly keyPointerFunctions: NSPointerFunctions;

	readonly valuePointerFunctions: NSPointerFunctions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { keyOptions: NSPointerFunctionsOptions; valueOptions: NSPointerFunctionsOptions; capacity: number; });

	constructor(o: { keyPointerFunctions: NSPointerFunctions; valuePointerFunctions: NSPointerFunctions; capacity: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithKeyOptionsValueOptionsCapacity(keyOptions: NSPointerFunctionsOptions, valueOptions: NSPointerFunctionsOptions, initialCapacity: number): this;

	initWithKeyPointerFunctionsValuePointerFunctionsCapacity(keyFunctions: NSPointerFunctions, valueFunctions: NSPointerFunctions, initialCapacity: number): this;

	keyEnumerator(): NSEnumerator<any>;

	objectEnumerator(): NSEnumerator<any>;

	objectForKey(aKey: any): any;

	removeAllObjects(): void;

	removeObjectForKey(aKey: any): void;

	setObjectForKey(anObject: any, aKey: any): void;
}

/**
 * @since 6.0
 */
declare var NSMapTableCopyIn: NSPointerFunctionsOptions;

interface NSMapTableKeyCallBacks {
	hash: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => number>;
	isEqual: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => boolean>;
	retain: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	release: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	describe: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => string>;
	notAKeyMarker: interop.Pointer | interop.Reference<any>;
}
declare var NSMapTableKeyCallBacks: interop.StructType<NSMapTableKeyCallBacks>;

/**
 * @since 6.0
 */
declare var NSMapTableObjectPointerPersonality: NSPointerFunctionsOptions;

/**
 * @since 6.0
 */
declare var NSMapTableStrongMemory: NSPointerFunctionsOptions;

interface NSMapTableValueCallBacks {
	retain: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	release: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	describe: interop.FunctionReference<(p1: NSMapTable<any, any>, p2: interop.Pointer | interop.Reference<any>) => string>;
}
declare var NSMapTableValueCallBacks: interop.StructType<NSMapTableValueCallBacks>;

/**
 * @since 6.0
 */
declare var NSMapTableWeakMemory: NSPointerFunctionsOptions;

/**
 * @since 16.0
 */
declare var NSMarkdownSourcePositionAttributeName: string;

/**
 * @since 8.0
 */
declare class NSMassFormatter extends NSFormatter {

	static alloc(): NSMassFormatter; // inherited from NSObject

	static new(): NSMassFormatter; // inherited from NSObject

	forPersonMassUse: boolean;

	numberFormatter: NSNumberFormatter;

	unitStyle: NSFormattingUnitStyle;

	stringFromKilograms(numberInKilograms: number): string;

	stringFromValueUnit(value: number, unit: NSMassFormatterUnit): string;

	unitStringFromKilogramsUsedUnit(numberInKilograms: number, unitp: interop.Pointer | interop.Reference<NSMassFormatterUnit>): string;

	unitStringFromValueUnit(value: number, unit: NSMassFormatterUnit): string;
}

/**
 * @since 8.0
 */
declare const enum NSMassFormatterUnit {

	Gram = 11,

	Kilogram = 14,

	Ounce = 1537,

	Pound = 1538,

	Stone = 1539
}

declare const enum NSMatchingFlags {

	Progress = 1,

	Completed = 2,

	HitEnd = 4,

	RequiredEnd = 8,

	InternalError = 16
}

declare const enum NSMatchingOptions {

	ReportProgress = 1,

	ReportCompletion = 2,

	Anchored = 4,

	WithTransparentBounds = 8,

	WithoutAnchoringBounds = 16
}

declare var NSMaximumKeyValueOperator: string;

/**
 * @since 10.0
 */
declare class NSMeasurement<UnitType> extends NSObject implements NSCopying, NSSecureCoding {

	static alloc<UnitType>(): NSMeasurement<UnitType>; // inherited from NSObject

	static new<UnitType>(): NSMeasurement<UnitType>; // inherited from NSObject

	readonly doubleValue: number;

	readonly unit: NSUnit;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { doubleValue: number; unit: NSUnit; });

	canBeConvertedToUnit(unit: NSUnit): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDoubleValueUnit(doubleValue: number, unit: NSUnit): this;

	measurementByAddingMeasurement(measurement: NSMeasurement<NSUnit>): NSMeasurement<NSUnit>;

	measurementByConvertingToUnit(unit: NSUnit): NSMeasurement<any>;

	measurementBySubtractingMeasurement(measurement: NSMeasurement<NSUnit>): NSMeasurement<NSUnit>;
}

/**
 * @since 10.0
 */
declare class NSMeasurementFormatter extends NSFormatter implements NSSecureCoding {

	static alloc(): NSMeasurementFormatter; // inherited from NSObject

	static new(): NSMeasurementFormatter; // inherited from NSObject

	locale: NSLocale;

	numberFormatter: NSNumberFormatter;

	unitOptions: NSMeasurementFormatterUnitOptions;

	unitStyle: NSFormattingUnitStyle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	stringFromMeasurement(measurement: NSMeasurement<any>): string;

	stringFromUnit(unit: NSUnit): string;
}

/**
 * @since 10.0
 */
declare const enum NSMeasurementFormatterUnitOptions {

	ProvidedUnit = 1,

	NaturalScale = 2,

	TemperatureWithoutUnit = 4
}

declare class NSMessagePort extends NSPort {

	static alloc(): NSMessagePort; // inherited from NSObject

	static new(): NSMessagePort; // inherited from NSObject
}

/**
 * @since 5.0
 */
declare class NSMetadataItem extends NSObject {

	static alloc(): NSMetadataItem; // inherited from NSObject

	static new(): NSMetadataItem; // inherited from NSObject

	readonly attributes: NSArray<string>;

	valueForAttribute(key: string): any;

	valuesForAttributes(keys: NSArray<string> | string[]): NSDictionary<string, any>;
}

/**
 * @since 8.0
 */
declare var NSMetadataItemContentTypeKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataItemContentTypeTreeKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemDisplayNameKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemFSContentChangeDateKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemFSCreationDateKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemFSNameKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemFSSizeKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemIsUbiquitousKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemPathKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataItemURLKey: string;

/**
 * @since 5.0
 */
declare class NSMetadataQuery extends NSObject {

	static alloc(): NSMetadataQuery; // inherited from NSObject

	static new(): NSMetadataQuery; // inherited from NSObject

	delegate: NSMetadataQueryDelegate;

	readonly gathering: boolean;

	readonly groupedResults: NSArray<NSMetadataQueryResultGroup>;

	groupingAttributes: NSArray<string>;

	notificationBatchingInterval: number;

	/**
	 * @since 7.0
	 */
	operationQueue: NSOperationQueue;

	predicate: NSPredicate;

	readonly resultCount: number;

	readonly results: NSArray<any>;

	/**
	 * @since 7.0
	 */
	searchItems: NSArray<any>;

	searchScopes: NSArray<any>;

	sortDescriptors: NSArray<NSSortDescriptor>;

	readonly started: boolean;

	readonly stopped: boolean;

	valueListAttributes: NSArray<string>;

	readonly valueLists: NSDictionary<string, NSArray<NSMetadataQueryAttributeValueTuple>>;

	disableUpdates(): void;

	enableUpdates(): void;

	/**
	 * @since 7.0
	 */
	enumerateResultsUsingBlock(block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 7.0
	 */
	enumerateResultsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	indexOfResult(result: any): number;

	resultAtIndex(idx: number): any;

	startQuery(): boolean;

	stopQuery(): void;

	valueOfAttributeForResultAtIndex(attrName: string, idx: number): any;
}

/**
 * @since 8.0
 */
declare var NSMetadataQueryAccessibleUbiquitousExternalDocumentsScope: string;

/**
 * @since 5.0
 */
declare class NSMetadataQueryAttributeValueTuple extends NSObject {

	static alloc(): NSMetadataQueryAttributeValueTuple; // inherited from NSObject

	static new(): NSMetadataQueryAttributeValueTuple; // inherited from NSObject

	readonly attribute: string;

	readonly count: number;

	readonly value: any;
}

interface NSMetadataQueryDelegate extends NSObjectProtocol {

	metadataQueryReplacementObjectForResultObject?(query: NSMetadataQuery, result: NSMetadataItem): any;

	metadataQueryReplacementValueForAttributeValue?(query: NSMetadataQuery, attrName: string, attrValue: any): any;
}
declare var NSMetadataQueryDelegate: {

	prototype: NSMetadataQueryDelegate;
};

/**
 * @since 5.0
 */
declare var NSMetadataQueryDidFinishGatheringNotification: string;

/**
 * @since 5.0
 */
declare var NSMetadataQueryDidStartGatheringNotification: string;

/**
 * @since 5.0
 */
declare var NSMetadataQueryDidUpdateNotification: string;

/**
 * @since 5.0
 */
declare var NSMetadataQueryGatheringProgressNotification: string;

/**
 * @since 5.0
 */
declare var NSMetadataQueryResultContentRelevanceAttribute: string;

/**
 * @since 5.0
 */
declare class NSMetadataQueryResultGroup extends NSObject {

	static alloc(): NSMetadataQueryResultGroup; // inherited from NSObject

	static new(): NSMetadataQueryResultGroup; // inherited from NSObject

	readonly attribute: string;

	readonly resultCount: number;

	readonly results: NSArray<any>;

	readonly subgroups: NSArray<NSMetadataQueryResultGroup>;

	readonly value: any;

	resultAtIndex(idx: number): any;
}

/**
 * @since 5.0
 */
declare var NSMetadataQueryUbiquitousDataScope: string;

/**
 * @since 5.0
 */
declare var NSMetadataQueryUbiquitousDocumentsScope: string;

/**
 * @since 8.0
 */
declare var NSMetadataQueryUpdateAddedItemsKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataQueryUpdateChangedItemsKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataQueryUpdateRemovedItemsKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataUbiquitousItemContainerDisplayNameKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataUbiquitousItemDownloadRequestedKey: string;

/**
 * @since 7.0
 */
declare var NSMetadataUbiquitousItemDownloadingErrorKey: string;

/**
 * @since 7.0
 */
declare var NSMetadataUbiquitousItemDownloadingStatusCurrent: string;

/**
 * @since 7.0
 */
declare var NSMetadataUbiquitousItemDownloadingStatusDownloaded: string;

/**
 * @since 7.0
 */
declare var NSMetadataUbiquitousItemDownloadingStatusKey: string;

/**
 * @since 7.0
 */
declare var NSMetadataUbiquitousItemDownloadingStatusNotDownloaded: string;

/**
 * @since 5.0
 */
declare var NSMetadataUbiquitousItemHasUnresolvedConflictsKey: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var NSMetadataUbiquitousItemIsDownloadedKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataUbiquitousItemIsDownloadingKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataUbiquitousItemIsExternalDocumentKey: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousItemIsSharedKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataUbiquitousItemIsUploadedKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataUbiquitousItemIsUploadingKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataUbiquitousItemPercentDownloadedKey: string;

/**
 * @since 5.0
 */
declare var NSMetadataUbiquitousItemPercentUploadedKey: string;

/**
 * @since 8.0
 */
declare var NSMetadataUbiquitousItemURLInLocalContainerKey: string;

/**
 * @since 7.0
 */
declare var NSMetadataUbiquitousItemUploadingErrorKey: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemCurrentUserPermissionsKey: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemCurrentUserRoleKey: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemMostRecentEditorNameComponentsKey: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemOwnerNameComponentsKey: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemPermissionsReadOnly: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemPermissionsReadWrite: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemRoleOwner: string;

/**
 * @since 10.0
 */
declare var NSMetadataUbiquitousSharedItemRoleParticipant: string;

declare class NSMethodSignature extends NSObject {

	static alloc(): NSMethodSignature; // inherited from NSObject

	static new(): NSMethodSignature; // inherited from NSObject

	static signatureWithObjCTypes(types: string | interop.Pointer | interop.Reference<any>): NSMethodSignature;

	readonly frameLength: number;

	readonly methodReturnLength: number;

	readonly methodReturnType: interop.Pointer | interop.Reference<any>;

	readonly numberOfArguments: number;

	getArgumentTypeAtIndex(idx: number): interop.Pointer | interop.Reference<any>;

	isOneway(): boolean;
}

declare var NSMinimumKeyValueOperator: string;

/**
 * @since 15.0
 */
declare class NSMorphology extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSMorphology; // inherited from NSObject

	static new(): NSMorphology; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	definiteness: NSGrammaticalDefiniteness;

	/**
	 * @since 17.0
	 */
	determination: NSGrammaticalDetermination;

	/**
	 * @since 17.0
	 */
	grammaticalCase: NSGrammaticalCase;

	grammaticalGender: NSGrammaticalGender;

	/**
	 * @since 17.0
	 */
	grammaticalPerson: NSGrammaticalPerson;

	number: NSGrammaticalNumber;

	partOfSpeech: NSGrammaticalPartOfSpeech;

	/**
	 * @since 17.0
	 */
	pronounType: NSGrammaticalPronounType;

	/**
	 * @since 15.0
	 */
	readonly unspecified: boolean;

	/**
	 * @since 15.0
	 */
	static readonly userMorphology: NSMorphology;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 15.0
	 * @deprecated 17.0
	 */
	customPronounForLanguage(language: string): NSMorphologyCustomPronoun;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 15.0
	 * @deprecated 17.0
	 */
	setCustomPronounForLanguageError(features: NSMorphologyCustomPronoun, language: string): boolean;
}

/**
 * @since 15.0
 */
declare var NSMorphologyAttributeName: string;

/**
 * @since 15.0
 * @deprecated 17.0
 */
declare class NSMorphologyCustomPronoun extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSMorphologyCustomPronoun; // inherited from NSObject

	static isSupportedForLanguage(language: string): boolean;

	static new(): NSMorphologyCustomPronoun; // inherited from NSObject

	static requiredKeysForLanguage(language: string): NSArray<string>;

	objectForm: string;

	possessiveAdjectiveForm: string;

	possessiveForm: string;

	reflexiveForm: string;

	subjectForm: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class NSMorphologyPronoun extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSMorphologyPronoun; // inherited from NSObject

	static new(): NSMorphologyPronoun; // inherited from NSObject

	readonly dependentMorphology: NSMorphology;

	readonly morphology: NSMorphology;

	readonly pronoun: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { pronoun: string; morphology: NSMorphology; dependentMorphology: NSMorphology; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPronounMorphologyDependentMorphology(pronoun: string, morphology: NSMorphology, dependentMorphology: NSMorphology): this;
}

/**
 * @since 14.5
 */
declare var NSMultipleUnderlyingErrorsKey: string;

declare class NSMutableArray<ObjectType> extends NSArray<any> {

	static alloc<ObjectType>(): NSMutableArray<ObjectType>; // inherited from NSObject

	static array<ObjectType>(): NSMutableArray<ObjectType>; // inherited from NSArray

	static arrayWithArray<ObjectType>(array: NSArray<any> | any[]): NSMutableArray<ObjectType>; // inherited from NSArray

	static arrayWithCapacity<ObjectType>(numItems: number): NSMutableArray<ObjectType>;

	static arrayWithContentsOfFile<ObjectType>(path: string): NSMutableArray<any>;

	static arrayWithContentsOfURL<ObjectType>(url: NSURL): NSMutableArray<any>;

	static arrayWithObject<ObjectType>(anObject: any): NSMutableArray<ObjectType>; // inherited from NSArray

	static arrayWithObjects<ObjectType>(firstObj: any): NSMutableArray<ObjectType>; // inherited from NSArray

	static arrayWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSMutableArray<ObjectType>; // inherited from NSArray

	static new<ObjectType>(): NSMutableArray<ObjectType>; // inherited from NSObject

	constructor(o: { capacity: number; });

	addObject(anObject: any): void;

	addObjectsFromArray(otherArray: NSArray<any> | any[]): void;

	applyDifference(difference: NSOrderedCollectionDifference<any>): void;

	exchangeObjectAtIndexWithObjectAtIndex(idx1: number, idx2: number): void;

	filterUsingPredicate(predicate: NSPredicate): void;

	initWithCapacity(numItems: number): this;

	insertObjectAtIndex(anObject: any, index: number): void;

	insertObjectsAtIndexes(objects: NSArray<any> | any[], indexes: NSIndexSet): void;

	removeAllObjects(): void;

	removeLastObject(): void;

	removeObject(anObject: any): void;

	removeObjectAtIndex(index: number): void;

	removeObjectIdenticalTo(anObject: any): void;

	removeObjectIdenticalToInRange(anObject: any, range: NSRange): void;

	removeObjectInRange(anObject: any, range: NSRange): void;

	removeObjectsAtIndexes(indexes: NSIndexSet): void;

	/**
	 * @since 2.0
	 * @deprecated 4.0
	 */
	removeObjectsFromIndicesNumIndices(indices: interop.Pointer | interop.Reference<number>, cnt: number): void;

	removeObjectsInArray(otherArray: NSArray<any> | any[]): void;

	removeObjectsInRange(range: NSRange): void;

	replaceObjectAtIndexWithObject(index: number, anObject: any): void;

	replaceObjectsAtIndexesWithObjects(indexes: NSIndexSet, objects: NSArray<any> | any[]): void;

	replaceObjectsInRangeWithObjectsFromArray(range: NSRange, otherArray: NSArray<any> | any[]): void;

	replaceObjectsInRangeWithObjectsFromArrayRange(range: NSRange, otherArray: NSArray<any> | any[], otherRange: NSRange): void;

	setArray(otherArray: NSArray<any> | any[]): void;

	/**
	 * @since 6.0
	 */
	setObjectAtIndexedSubscript(obj: any, idx: number): void;

	/**
	 * @since 4.0
	 */
	sortUsingComparator(cmptr: (p1: any, p2: any) => NSComparisonResult): void;

	sortUsingDescriptors(sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]): void;

	sortUsingFunctionContext(compare: interop.FunctionReference<(p1: any, p2: any, p3: interop.Pointer | interop.Reference<any>) => number>, context: interop.Pointer | interop.Reference<any>): void;

	sortUsingSelector(comparator: string): void;

	/**
	 * @since 4.0
	 */
	sortWithOptionsUsingComparator(opts: NSSortOptions, cmptr: (p1: any, p2: any) => NSComparisonResult): void;
}

/**
 * @since 3.2
 */
declare class NSMutableAttributedString extends NSAttributedString {

	static alloc(): NSMutableAttributedString; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static attributedStringWithAdaptiveImageGlyphAttributes(adaptiveImageGlyph: NSAdaptiveImageGlyph, attributes: NSDictionary<string, any>): NSMutableAttributedString; // inherited from NSAttributedString

	/**
	 * @since 18.0
	 */
	static attributedStringWithAttachmentAttributes(attachment: NSTextAttachment, attributes: NSDictionary<string, any>): NSMutableAttributedString; // inherited from NSAttributedString

	static new(): NSMutableAttributedString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSMutableAttributedString; // inherited from NSItemProviderReading

	readonly mutableString: NSMutableString;

	addAttributeValueRange(name: string, value: any, range: NSRange): void;

	addAttributesRange(attrs: NSDictionary<string, any>, range: NSRange): void;

	appendAttributedString(attrString: NSAttributedString): void;

	beginEditing(): void;

	deleteCharactersInRange(range: NSRange): void;

	endEditing(): void;

	/**
	 * @since 7.0
	 */
	fixAttributesInRange(range: NSRange): void;

	insertAttributedStringAtIndex(attrString: NSAttributedString, loc: number): void;

	/**
	 * @since 7.0
	 */
	readFromDataOptionsDocumentAttributesError(data: NSData, opts: NSDictionary<string, any>, dict: interop.Pointer | interop.Reference<NSDictionary<string, any>>): boolean;

	/**
	 * @since 7.0
	 * @deprecated 9.0
	 */
	readFromFileURLOptionsDocumentAttributesError(url: NSURL, opts: NSDictionary<any, any>, dict: interop.Pointer | interop.Reference<NSDictionary<any, any>>): boolean;

	/**
	 * @since 9.0
	 */
	readFromURLOptionsDocumentAttributesError(url: NSURL, opts: NSDictionary<string, any>, dict: interop.Pointer | interop.Reference<NSDictionary<string, any>>): boolean;

	removeAttributeRange(name: string, range: NSRange): void;

	replaceCharactersInRangeWithAttributedString(range: NSRange, attrString: NSAttributedString): void;

	replaceCharactersInRangeWithString(range: NSRange, str: string): void;

	setAttributedString(attrString: NSAttributedString): void;

	setAttributesRange(attrs: NSDictionary<string, any>, range: NSRange): void;
}

declare class NSMutableCharacterSet extends NSCharacterSet implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSMutableCharacterSet; // inherited from NSObject

	static new(): NSMutableCharacterSet; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addCharactersInRange(aRange: NSRange): void;

	addCharactersInString(aString: string): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	formIntersectionWithCharacterSet(otherSet: NSCharacterSet): void;

	formUnionWithCharacterSet(otherSet: NSCharacterSet): void;

	initWithCoder(coder: NSCoder): this;

	invert(): void;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	removeCharactersInRange(aRange: NSRange): void;

	removeCharactersInString(aString: string): void;
}

interface NSMutableCopying {

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}
declare var NSMutableCopying: {

	prototype: NSMutableCopying;
};

declare class NSMutableData extends NSData {

	static alloc(): NSMutableData; // inherited from NSObject

	static data(): NSMutableData; // inherited from NSData

	static dataWithBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): NSMutableData; // inherited from NSData

	static dataWithBytesNoCopyLength(bytes: interop.Pointer | interop.Reference<any>, length: number): NSMutableData; // inherited from NSData

	static dataWithBytesNoCopyLengthFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, length: number, b: boolean): NSMutableData; // inherited from NSData

	static dataWithCapacity(aNumItems: number): NSMutableData;

	static dataWithContentsOfFile(path: string): NSMutableData; // inherited from NSData

	static dataWithContentsOfFileOptionsError(path: string, readOptionsMask: NSDataReadingOptions): NSMutableData; // inherited from NSData

	static dataWithContentsOfURL(url: NSURL): NSMutableData; // inherited from NSData

	static dataWithContentsOfURLOptionsError(url: NSURL, readOptionsMask: NSDataReadingOptions): NSMutableData; // inherited from NSData

	static dataWithData(data: NSData): NSMutableData; // inherited from NSData

	static dataWithLength(length: number): NSMutableData;

	static new(): NSMutableData; // inherited from NSObject

	length: number;

	readonly mutableBytes: interop.Pointer | interop.Reference<any>;

	constructor(o: { capacity: number; });

	constructor(o: { length: number; });

	appendBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): void;

	appendData(other: NSData): void;

	/**
	 * @since 13.0
	 */
	compressUsingAlgorithmError(algorithm: NSDataCompressionAlgorithm): boolean;

	/**
	 * @since 13.0
	 */
	decompressUsingAlgorithmError(algorithm: NSDataCompressionAlgorithm): boolean;

	increaseLengthBy(extraLength: number): void;

	initWithCapacity(capacity: number): this;

	initWithLength(length: number): this;

	replaceBytesInRangeWithBytes(range: NSRange, bytes: interop.Pointer | interop.Reference<any>): void;

	replaceBytesInRangeWithBytesLength(range: NSRange, replacementBytes: interop.Pointer | interop.Reference<any>, replacementLength: number): void;

	resetBytesInRange(range: NSRange): void;

	setData(data: NSData): void;
}

declare class NSMutableDictionary<KeyType, ObjectType> extends NSDictionary<any, any> {

	static alloc<KeyType, ObjectType>(): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSObject

	static dictionary<KeyType, ObjectType>(): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSDictionary

	static dictionaryWithCapacity<KeyType, ObjectType>(numItems: number): NSMutableDictionary<KeyType, ObjectType>;

	static dictionaryWithContentsOfFile<KeyType, ObjectType>(path: string): NSMutableDictionary<any, any>;

	static dictionaryWithContentsOfURL<KeyType, ObjectType>(url: NSURL): NSMutableDictionary<any, any>;

	static dictionaryWithDictionary<KeyType, ObjectType>(dict: NSDictionary<any, any>): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSDictionary

	static dictionaryWithObjectForKey<KeyType, ObjectType>(object: any, key: any): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSDictionary

	static dictionaryWithObjectsAndKeys<KeyType, ObjectType>(firstObject: any): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSDictionary

	static dictionaryWithObjectsForKeys<KeyType, ObjectType>(objects: NSArray<any> | any[], keys: NSArray<any> | any[]): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSDictionary

	static dictionaryWithObjectsForKeysCount<KeyType, ObjectType>(objects: interop.Reference<any>, keys: interop.Reference<any>, cnt: number): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSDictionary

	/**
	 * @since 6.0
	 */
	static dictionaryWithSharedKeySet<KeyType, ObjectType>(keyset: any): NSMutableDictionary<any, any>;

	static new<KeyType, ObjectType>(): NSMutableDictionary<KeyType, ObjectType>; // inherited from NSObject

	constructor(o: { capacity: number; });

	addEntriesFromDictionary(otherDictionary: NSDictionary<any, any>): void;

	initWithCapacity(numItems: number): this;

	removeAllObjects(): void;

	removeObjectForKey(aKey: any): void;

	removeObjectsForKeys(keyArray: NSArray<any> | any[]): void;

	setDictionary(otherDictionary: NSDictionary<any, any>): void;

	setObjectForKey(anObject: any, aKey: any): void;

	/**
	 * @since 6.0
	 */
	setObjectForKeyedSubscript(obj: any, key: any): void;
}

declare class NSMutableIndexSet extends NSIndexSet {

	static alloc(): NSMutableIndexSet; // inherited from NSObject

	static indexSet(): NSMutableIndexSet; // inherited from NSIndexSet

	static indexSetWithIndex(value: number): NSMutableIndexSet; // inherited from NSIndexSet

	static indexSetWithIndexesInRange(range: NSRange): NSMutableIndexSet; // inherited from NSIndexSet

	static new(): NSMutableIndexSet; // inherited from NSObject

	addIndex(value: number): void;

	addIndexes(indexSet: NSIndexSet): void;

	addIndexesInRange(range: NSRange): void;

	removeAllIndexes(): void;

	removeIndex(value: number): void;

	removeIndexes(indexSet: NSIndexSet): void;

	removeIndexesInRange(range: NSRange): void;

	shiftIndexesStartingAtIndexBy(index: number, delta: number): void;
}

/**
 * @since 5.0
 */
declare class NSMutableOrderedSet<ObjectType> extends NSOrderedSet<any> {

	static alloc<ObjectType>(): NSMutableOrderedSet<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSMutableOrderedSet<ObjectType>; // inherited from NSObject

	static orderedSet<ObjectType>(): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithArray<ObjectType>(array: NSArray<any> | any[]): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithArrayRangeCopyItems<ObjectType>(array: NSArray<any> | any[], range: NSRange, flag: boolean): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithCapacity<ObjectType>(numItems: number): NSMutableOrderedSet<ObjectType>;

	static orderedSetWithObject<ObjectType>(object: any): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithObjects<ObjectType>(firstObj: any): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithOrderedSet<ObjectType>(set: NSOrderedSet<any>): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithOrderedSetRangeCopyItems<ObjectType>(set: NSOrderedSet<any>, range: NSRange, flag: boolean): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithSet<ObjectType>(set: NSSet<any>): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	static orderedSetWithSetCopyItems<ObjectType>(set: NSSet<any>, flag: boolean): NSMutableOrderedSet<ObjectType>; // inherited from NSOrderedSet

	constructor(o: { capacity: number; });

	addObject(object: any): void;

	addObjectsCount(objects: interop.Reference<any>, count: number): void;

	addObjectsFromArray(array: NSArray<any> | any[]): void;

	applyDifference(difference: NSOrderedCollectionDifference<any>): void;

	exchangeObjectAtIndexWithObjectAtIndex(idx1: number, idx2: number): void;

	/**
	 * @since 5.0
	 */
	filterUsingPredicate(p: NSPredicate): void;

	initWithCapacity(numItems: number): this;

	insertObjectAtIndex(object: any, idx: number): void;

	insertObjectsAtIndexes(objects: NSArray<any> | any[], indexes: NSIndexSet): void;

	intersectOrderedSet(other: NSOrderedSet<any>): void;

	intersectSet(other: NSSet<any>): void;

	minusOrderedSet(other: NSOrderedSet<any>): void;

	minusSet(other: NSSet<any>): void;

	moveObjectsAtIndexesToIndex(indexes: NSIndexSet, idx: number): void;

	removeAllObjects(): void;

	removeObject(object: any): void;

	removeObjectAtIndex(idx: number): void;

	removeObjectsAtIndexes(indexes: NSIndexSet): void;

	removeObjectsInArray(array: NSArray<any> | any[]): void;

	removeObjectsInRange(range: NSRange): void;

	replaceObjectAtIndexWithObject(idx: number, object: any): void;

	replaceObjectsAtIndexesWithObjects(indexes: NSIndexSet, objects: NSArray<any> | any[]): void;

	replaceObjectsInRangeWithObjectsCount(range: NSRange, objects: interop.Reference<any>, count: number): void;

	setObjectAtIndex(obj: any, idx: number): void;

	/**
	 * @since 6.0
	 */
	setObjectAtIndexedSubscript(obj: any, idx: number): void;

	sortRangeOptionsUsingComparator(range: NSRange, opts: NSSortOptions, cmptr: (p1: any, p2: any) => NSComparisonResult): void;

	sortUsingComparator(cmptr: (p1: any, p2: any) => NSComparisonResult): void;

	/**
	 * @since 5.0
	 */
	sortUsingDescriptors(sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]): void;

	sortWithOptionsUsingComparator(opts: NSSortOptions, cmptr: (p1: any, p2: any) => NSComparisonResult): void;

	unionOrderedSet(other: NSOrderedSet<any>): void;

	unionSet(other: NSSet<any>): void;
}

declare class NSMutableSet<ObjectType> extends NSSet<any> {

	static alloc<ObjectType>(): NSMutableSet<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSMutableSet<ObjectType>; // inherited from NSObject

	static set<ObjectType>(): NSMutableSet<ObjectType>; // inherited from NSSet

	static setWithArray<ObjectType>(array: NSArray<any> | any[]): NSMutableSet<ObjectType>; // inherited from NSSet

	static setWithCapacity<ObjectType>(numItems: number): NSMutableSet<ObjectType>;

	static setWithObject<ObjectType>(object: any): NSMutableSet<ObjectType>; // inherited from NSSet

	static setWithObjects<ObjectType>(firstObj: any): NSMutableSet<ObjectType>; // inherited from NSSet

	static setWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSMutableSet<ObjectType>; // inherited from NSSet

	static setWithSet<ObjectType>(set: NSSet<any>): NSMutableSet<ObjectType>; // inherited from NSSet

	constructor(o: { capacity: number; });

	addObject(object: any): void;

	addObjectsFromArray(array: NSArray<any> | any[]): void;

	/**
	 * @since 3.0
	 */
	filterUsingPredicate(predicate: NSPredicate): void;

	initWithCapacity(numItems: number): this;

	intersectSet(otherSet: NSSet<any>): void;

	minusSet(otherSet: NSSet<any>): void;

	removeAllObjects(): void;

	removeObject(object: any): void;

	setSet(otherSet: NSSet<any>): void;

	unionSet(otherSet: NSSet<any>): void;
}

declare class NSMutableString extends NSString {

	static alloc(): NSMutableString; // inherited from NSObject

	static new(): NSMutableString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSMutableString; // inherited from NSItemProviderReading

	static string(): NSMutableString; // inherited from NSString

	static stringWithCStringEncoding(cString: string | interop.Pointer | interop.Reference<any>, enc: number): NSMutableString; // inherited from NSString

	static stringWithCapacity(capacity: number): NSMutableString;

	static stringWithCharactersLength(characters: interop.Pointer | interop.Reference<string>, length: number): NSMutableString; // inherited from NSString

	static stringWithContentsOfFileEncodingError(path: string, enc: number): NSMutableString; // inherited from NSString

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number>): NSMutableString; // inherited from NSString

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number): NSMutableString; // inherited from NSString

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number>): NSMutableString; // inherited from NSString

	static stringWithString(string: string): NSMutableString; // inherited from NSString

	static stringWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>): NSMutableString; // inherited from NSString

	constructor(o: { capacity: number; });

	appendString(aString: string): void;

	/**
	 * @since 9.0
	 */
	applyTransformReverseRangeUpdatedRange(transform: string, reverse: boolean, range: NSRange, resultingRange: interop.Pointer | interop.Reference<NSRange>): boolean;

	deleteCharactersInRange(range: NSRange): void;

	initWithCapacity(capacity: number): this;

	insertStringAtIndex(aString: string, loc: number): void;

	replaceCharactersInRangeWithString(range: NSRange, aString: string): void;

	replaceOccurrencesOfStringWithStringOptionsRange(target: string, replacement: string, options: NSStringCompareOptions, searchRange: NSRange): number;

	setString(aString: string): void;
}

/**
 * @since 2.0
 */
declare class NSMutableURLRequest extends NSURLRequest {

	static alloc(): NSMutableURLRequest; // inherited from NSObject

	static new(): NSMutableURLRequest; // inherited from NSObject

	static requestWithURL(URL: NSURL): NSMutableURLRequest; // inherited from NSURLRequest

	static requestWithURLCachePolicyTimeoutInterval(URL: NSURL, cachePolicy: NSURLRequestCachePolicy, timeoutInterval: number): NSMutableURLRequest; // inherited from NSURLRequest

	HTTPBody: NSData;

	HTTPBodyStream: NSInputStream;

	HTTPMethod: string;

	HTTPShouldHandleCookies: boolean;

	/**
	 * @since 4.0
	 */
	HTTPShouldUsePipelining: boolean;

	URL: NSURL;

	allHTTPHeaderFields: NSDictionary<string, string>;

	/**
	 * @since 6.0
	 */
	allowsCellularAccess: boolean;

	/**
	 * @since 13.0
	 */
	allowsConstrainedNetworkAccess: boolean;

	/**
	 * @since 13.0
	 */
	allowsExpensiveNetworkAccess: boolean;

	/**
	 * @since 18.0
	 */
	allowsPersistentDNS: boolean;

	/**
	 * @since 14.5
	 */
	assumesHTTP3Capable: boolean;

	/**
	 * @since 15.0
	 */
	attribution: NSURLRequestAttribution;

	cachePolicy: NSURLRequestCachePolicy;

	mainDocumentURL: NSURL;

	/**
	 * @since 4.0
	 */
	networkServiceType: NSURLRequestNetworkServiceType;

	/**
	 * @since 16.1
	 */
	requiresDNSSECValidation: boolean;

	timeoutInterval: number;

	addValueForHTTPHeaderField(value: string, field: string): void;

	/**
	 * @since 9.0
	 */
	bindToHotspotHelperCommand(command: NEHotspotHelperCommand): void;

	setValueForHTTPHeaderField(value: string, field: string): void;
}

declare const NSNEXTSTEPStringEncoding: number;

/**
 * @since 3.0
 */
declare var NSNegateBooleanTransformerName: string;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare class NSNetService extends NSObject {

	static alloc(): NSNetService; // inherited from NSObject

	static dataFromTXTRecordDictionary(txtDictionary: NSDictionary<string, NSData>): NSData;

	static dictionaryFromTXTRecordData(txtData: NSData): NSDictionary<string, NSData>;

	static new(): NSNetService; // inherited from NSObject

	readonly addresses: NSArray<NSData>;

	delegate: NSNetServiceDelegate;

	readonly domain: string;

	readonly hostName: string;

	/**
	 * @since 7.0
	 */
	includesPeerToPeer: boolean;

	readonly name: string;

	/**
	 * @since 2.0
	 */
	readonly port: number;

	readonly type: string;

	constructor(o: { domain: string; type: string; name: string; });

	constructor(o: { domain: string; type: string; name: string; port: number; });

	TXTRecordData(): NSData;

	getInputStreamOutputStream(inputStream: interop.Pointer | interop.Reference<NSInputStream>, outputStream: interop.Pointer | interop.Reference<NSOutputStream>): boolean;

	initWithDomainTypeName(domain: string, type: string, name: string): this;

	initWithDomainTypeNamePort(domain: string, type: string, name: string, port: number): this;

	publish(): void;

	/**
	 * @since 2.0
	 */
	publishWithOptions(options: NSNetServiceOptions): void;

	removeFromRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	resolve(): void;

	resolveWithTimeout(timeout: number): void;

	scheduleInRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	setTXTRecordData(recordData: NSData): boolean;

	startMonitoring(): void;

	stop(): void;

	stopMonitoring(): void;
}

/**
 * @since 2.0
 * @deprecated 100000
 */
declare class NSNetServiceBrowser extends NSObject {

	static alloc(): NSNetServiceBrowser; // inherited from NSObject

	static new(): NSNetServiceBrowser; // inherited from NSObject

	delegate: NSNetServiceBrowserDelegate;

	/**
	 * @since 7.0
	 */
	includesPeerToPeer: boolean;

	removeFromRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	scheduleInRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	searchForBrowsableDomains(): void;

	searchForRegistrationDomains(): void;

	searchForServicesOfTypeInDomain(type: string, domainString: string): void;

	stop(): void;
}

/**
 * @since 2.0
 */
interface NSNetServiceBrowserDelegate extends NSObjectProtocol {

	netServiceBrowserDidFindDomainMoreComing?(browser: NSNetServiceBrowser, domainString: string, moreComing: boolean): void;

	netServiceBrowserDidFindServiceMoreComing?(browser: NSNetServiceBrowser, service: NSNetService, moreComing: boolean): void;

	netServiceBrowserDidNotSearch?(browser: NSNetServiceBrowser, errorDict: NSDictionary<string, number>): void;

	netServiceBrowserDidRemoveDomainMoreComing?(browser: NSNetServiceBrowser, domainString: string, moreComing: boolean): void;

	netServiceBrowserDidRemoveServiceMoreComing?(browser: NSNetServiceBrowser, service: NSNetService, moreComing: boolean): void;

	netServiceBrowserDidStopSearch?(browser: NSNetServiceBrowser): void;

	netServiceBrowserWillSearch?(browser: NSNetServiceBrowser): void;
}
declare var NSNetServiceBrowserDelegate: {

	prototype: NSNetServiceBrowserDelegate;
};

/**
 * @since 2.0
 */
interface NSNetServiceDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	netServiceDidAcceptConnectionWithInputStreamOutputStream?(sender: NSNetService, inputStream: NSInputStream, outputStream: NSOutputStream): void;

	netServiceDidNotPublish?(sender: NSNetService, errorDict: NSDictionary<string, number>): void;

	netServiceDidNotResolve?(sender: NSNetService, errorDict: NSDictionary<string, number>): void;

	netServiceDidPublish?(sender: NSNetService): void;

	netServiceDidResolveAddress?(sender: NSNetService): void;

	netServiceDidStop?(sender: NSNetService): void;

	netServiceDidUpdateTXTRecordData?(sender: NSNetService, data: NSData): void;

	netServiceWillPublish?(sender: NSNetService): void;

	netServiceWillResolve?(sender: NSNetService): void;
}
declare var NSNetServiceDelegate: {

	prototype: NSNetServiceDelegate;
};

/**
 * @since 2.0
 */
declare const enum NSNetServiceOptions {

	NoAutoRename = 1,

	ListenForConnections = 2
}

/**
 * @since 2.0
 */
declare const enum NSNetServicesError {

	UnknownError = -72000,

	CollisionError = -72001,

	NotFoundError = -72002,

	ActivityInProgress = -72003,

	BadArgumentError = -72004,

	CancelledError = -72005,

	InvalidError = -72006,

	TimeoutError = -72007,

	MissingRequiredConfigurationError = -72008
}

/**
 * @since 2.0
 */
declare var NSNetServicesErrorCode: string;

/**
 * @since 2.0
 */
declare var NSNetServicesErrorDomain: string;

declare function NSNextHashEnumeratorItem(enumerator: interop.Pointer | interop.Reference<NSHashEnumerator>): interop.Pointer | interop.Reference<any>;

declare function NSNextMapEnumeratorPair(enumerator: interop.Pointer | interop.Reference<NSMapEnumerator>, key: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare const NSNonLossyASCIIStringEncoding: number;

declare var NSNonOwnedPointerHashCallBacks: NSHashTableCallBacks;

declare var NSNonOwnedPointerMapKeyCallBacks: NSMapTableKeyCallBacks;

declare var NSNonOwnedPointerMapValueCallBacks: NSMapTableValueCallBacks;

declare var NSNonOwnedPointerOrNullMapKeyCallBacks: NSMapTableKeyCallBacks;

declare var NSNonRetainedObjectHashCallBacks: NSHashTableCallBacks;

declare var NSNonRetainedObjectMapKeyCallBacks: NSMapTableKeyCallBacks;

declare var NSNonRetainedObjectMapValueCallBacks: NSMapTableValueCallBacks;

declare var NSNotFound: number;

declare class NSNotification extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSNotification; // inherited from NSObject

	static new(): NSNotification; // inherited from NSObject

	static notificationWithNameObject(aName: string, anObject: any): NSNotification;

	static notificationWithNameObjectUserInfo(aName: string, anObject: any, aUserInfo: NSDictionary<any, any>): NSNotification;

	readonly name: string;

	readonly object: any;

	readonly userInfo: NSDictionary<any, any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 4.0
	 */
	constructor(o: { name: string; object: any; userInfo: NSDictionary<any, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 4.0
	 */
	initWithNameObjectUserInfo(name: string, object: any, userInfo: NSDictionary<any, any>): this;
}

declare class NSNotificationCenter extends NSObject {

	static alloc(): NSNotificationCenter; // inherited from NSObject

	static new(): NSNotificationCenter; // inherited from NSObject

	static readonly defaultCenter: NSNotificationCenter;

	/**
	 * @since 4.0
	 */
	addObserverForNameObjectQueueUsingBlock(name: string, obj: any, queue: NSOperationQueue, block: (p1: NSNotification) => void): NSObjectProtocol;

	addObserverSelectorNameObject(observer: any, aSelector: string, aName: string, anObject: any): void;

	postNotification(notification: NSNotification): void;

	postNotificationNameObject(aName: string, anObject: any): void;

	postNotificationNameObjectUserInfo(aName: string, anObject: any, aUserInfo: NSDictionary<any, any>): void;

	removeObserver(observer: any): void;

	removeObserverNameObject(observer: any, aName: string, anObject: any): void;
}

declare const enum NSNotificationCoalescing {

	NoCoalescing = 0,

	CoalescingOnName = 1,

	CoalescingOnSender = 2
}

declare class NSNotificationQueue extends NSObject {

	static alloc(): NSNotificationQueue; // inherited from NSObject

	static new(): NSNotificationQueue; // inherited from NSObject

	static readonly defaultQueue: NSNotificationQueue;

	constructor(o: { notificationCenter: NSNotificationCenter; });

	dequeueNotificationsMatchingCoalesceMask(notification: NSNotification, coalesceMask: number): void;

	enqueueNotificationPostingStyle(notification: NSNotification, postingStyle: NSPostingStyle): void;

	enqueueNotificationPostingStyleCoalesceMaskForModes(notification: NSNotification, postingStyle: NSPostingStyle, coalesceMask: NSNotificationCoalescing, modes: NSArray<string> | string[]): void;

	initWithNotificationCenter(notificationCenter: NSNotificationCenter): this;
}

declare class NSNull extends NSObject implements CAAction, NSCopying, NSSecureCoding {

	static alloc(): NSNull; // inherited from NSObject

	static new(): NSNull; // inherited from NSObject

	static null(): NSNull;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	runActionForKeyObjectArguments(event: string, anObject: any, dict: NSDictionary<any, any>): void;
}

declare class NSNumber extends NSValue implements CKRecordValue, NSFetchRequestResult {

	static alloc(): NSNumber; // inherited from NSObject

	static new(): NSNumber; // inherited from NSObject

	static numberWithBool(value: boolean): number;

	static numberWithChar(value: number): number;

	static numberWithDouble(value: number): number;

	static numberWithFloat(value: number): number;

	static numberWithInt(value: number): number;

	/**
	 * @since 2.0
	 */
	static numberWithInteger(value: number): number;

	static numberWithLong(value: number): number;

	static numberWithLongLong(value: number): number;

	static numberWithShort(value: number): number;

	static numberWithUnsignedChar(value: number): number;

	static numberWithUnsignedInt(value: number): number;

	/**
	 * @since 2.0
	 */
	static numberWithUnsignedInteger(value: number): number;

	static numberWithUnsignedLong(value: number): number;

	static numberWithUnsignedLongLong(value: number): number;

	static numberWithUnsignedShort(value: number): number;

	/**
	 * @since 17.4
	 */
	static valueWithGCPoint2(point: GCPoint2): NSNumber; // inherited from NSValue

	readonly boolValue: boolean;

	readonly charValue: number;

	readonly decimalValue: NSDecimal;

	readonly doubleValue: number;

	readonly floatValue: number;

	readonly intValue: number;

	/**
	 * @since 2.0
	 */
	readonly integerValue: number;

	readonly longLongValue: number;

	readonly longValue: number;

	readonly shortValue: number;

	readonly stringValue: string;

	readonly unsignedCharValue: number;

	readonly unsignedIntValue: number;

	/**
	 * @since 2.0
	 */
	readonly unsignedIntegerValue: number;

	readonly unsignedLongLongValue: number;

	readonly unsignedLongValue: number;

	readonly unsignedShortValue: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { bool: boolean; });

	constructor(o: { char: number; });

	constructor(o: { double: number; });

	constructor(o: { float: number; });

	constructor(o: { int: number; });

	/**
	 * @since 2.0
	 */
	constructor(o: { integer: number; });

	constructor(o: { long: number; });

	constructor(o: { longLong: number; });

	constructor(o: { short: number; });

	constructor(o: { unsignedChar: number; });

	constructor(o: { unsignedInt: number; });

	/**
	 * @since 2.0
	 */
	constructor(o: { unsignedInteger: number; });

	constructor(o: { unsignedLong: number; });

	constructor(o: { unsignedLongLong: number; });

	constructor(o: { unsignedShort: number; });

	class(): typeof NSObject;

	compare(otherNumber: number): NSComparisonResult;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	descriptionWithLocale(locale: any): string;

	initWithBool(value: boolean): this;

	initWithChar(value: number): this;

	initWithDouble(value: number): this;

	initWithFloat(value: number): this;

	initWithInt(value: number): this;

	/**
	 * @since 2.0
	 */
	initWithInteger(value: number): this;

	initWithLong(value: number): this;

	initWithLongLong(value: number): this;

	initWithShort(value: number): this;

	initWithUnsignedChar(value: number): this;

	initWithUnsignedInt(value: number): this;

	/**
	 * @since 2.0
	 */
	initWithUnsignedInteger(value: number): this;

	initWithUnsignedLong(value: number): this;

	initWithUnsignedLongLong(value: number): this;

	initWithUnsignedShort(value: number): this;

	isEqual(object: any): boolean;

	isEqualToNumber(number: number): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class NSNumberFormatter extends NSFormatter {

	static alloc(): NSNumberFormatter; // inherited from NSObject

	static defaultFormatterBehavior(): NSNumberFormatterBehavior;

	/**
	 * @since 4.0
	 */
	static localizedStringFromNumberNumberStyle(num: number, nstyle: NSNumberFormatterStyle): string;

	static new(): NSNumberFormatter; // inherited from NSObject

	static setDefaultFormatterBehavior(behavior: NSNumberFormatterBehavior): void;

	allowsFloats: boolean;

	alwaysShowsDecimalSeparator: boolean;

	currencyCode: string;

	currencyDecimalSeparator: string;

	/**
	 * @since 2.0
	 */
	currencyGroupingSeparator: string;

	currencySymbol: string;

	decimalSeparator: string;

	exponentSymbol: string;

	formatWidth: number;

	formatterBehavior: NSNumberFormatterBehavior;

	/**
	 * @since 8.0
	 */
	formattingContext: NSFormattingContext;

	generatesDecimalNumbers: boolean;

	groupingSeparator: string;

	groupingSize: number;

	internationalCurrencySymbol: string;

	/**
	 * @since 2.0
	 */
	lenient: boolean;

	locale: NSLocale;

	maximum: number;

	maximumFractionDigits: number;

	maximumIntegerDigits: number;

	/**
	 * @since 2.0
	 */
	maximumSignificantDigits: number;

	minimum: number;

	minimumFractionDigits: number;

	/**
	 * @since 18.0
	 */
	minimumGroupingDigits: number;

	minimumIntegerDigits: number;

	/**
	 * @since 2.0
	 */
	minimumSignificantDigits: number;

	minusSign: string;

	multiplier: number;

	negativeFormat: string;

	negativeInfinitySymbol: string;

	negativePrefix: string;

	negativeSuffix: string;

	nilSymbol: string;

	notANumberSymbol: string;

	numberStyle: NSNumberFormatterStyle;

	paddingCharacter: string;

	paddingPosition: NSNumberFormatterPadPosition;

	/**
	 * @since 2.0
	 */
	partialStringValidationEnabled: boolean;

	perMillSymbol: string;

	percentSymbol: string;

	plusSign: string;

	positiveFormat: string;

	positiveInfinitySymbol: string;

	positivePrefix: string;

	positiveSuffix: string;

	roundingIncrement: number;

	roundingMode: NSNumberFormatterRoundingMode;

	secondaryGroupingSize: number;

	textAttributesForNegativeInfinity: NSDictionary<string, any>;

	textAttributesForNegativeValues: NSDictionary<string, any>;

	textAttributesForNil: NSDictionary<string, any>;

	textAttributesForNotANumber: NSDictionary<string, any>;

	textAttributesForPositiveInfinity: NSDictionary<string, any>;

	textAttributesForPositiveValues: NSDictionary<string, any>;

	textAttributesForZero: NSDictionary<string, any>;

	usesGroupingSeparator: boolean;

	/**
	 * @since 2.0
	 */
	usesSignificantDigits: boolean;

	zeroSymbol: string;

	getObjectValueForStringRangeError(obj: interop.Pointer | interop.Reference<any>, string: string, rangep: interop.Pointer | interop.Reference<NSRange>): boolean;

	numberFromString(string: string): number;

	stringFromNumber(number: number): string;
}

declare const enum NSNumberFormatterBehavior {

	BehaviorDefault = 0,

	Behavior10_4 = 1040
}

declare const enum NSNumberFormatterPadPosition {

	BeforePrefix = 0,

	AfterPrefix = 1,

	BeforeSuffix = 2,

	AfterSuffix = 3
}

declare const enum NSNumberFormatterRoundingMode {

	Ceiling = 0,

	Floor = 1,

	Down = 2,

	Up = 3,

	HalfEven = 4,

	HalfDown = 5,

	HalfUp = 6
}

declare const enum NSNumberFormatterStyle {

	NoStyle = 0,

	DecimalStyle = 1,

	CurrencyStyle = 2,

	PercentStyle = 3,

	ScientificStyle = 4,

	SpellOutStyle = 5,

	OrdinalStyle = 6,

	CurrencyISOCodeStyle = 8,

	CurrencyPluralStyle = 9,

	CurrencyAccountingStyle = 10
}

declare const NSOSF1OperatingSystem: number;

declare var NSOSStatusErrorDomain: string;

declare var NSObjectHashCallBacks: NSHashTableCallBacks;

declare var NSObjectInaccessibleException: string;

declare var NSObjectMapKeyCallBacks: NSMapTableKeyCallBacks;

declare var NSObjectMapValueCallBacks: NSMapTableValueCallBacks;

declare var NSObjectNotAvailableException: string;

declare var NSOldStyleException: string;

declare function NSOpenStepRootDirectory(): string;

declare const NSOpenStepUnicodeReservedBase: number;

interface NSOperatingSystemVersion {
	majorVersion: number;
	minorVersion: number;
	patchVersion: number;
}
declare var NSOperatingSystemVersion: interop.StructType<NSOperatingSystemVersion>;

/**
 * @since 2.0
 */
declare class NSOperation extends NSObject {

	static alloc(): NSOperation; // inherited from NSObject

	static new(): NSOperation; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly asynchronous: boolean;

	readonly cancelled: boolean;

	/**
	 * @since 4.0
	 */
	completionBlock: () => void;

	readonly concurrent: boolean;

	readonly dependencies: NSArray<NSOperation>;

	readonly executing: boolean;

	readonly finished: boolean;

	/**
	 * @since 8.0
	 */
	name: string;

	/**
	 * @since 8.0
	 */
	qualityOfService: NSQualityOfService;

	queuePriority: NSOperationQueuePriority;

	readonly ready: boolean;

	/**
	 * @since 4.0
	 * @deprecated 8.0
	 */
	threadPriority: number;

	addDependency(op: NSOperation): void;

	cancel(): void;

	main(): void;

	removeDependency(op: NSOperation): void;

	start(): void;

	/**
	 * @since 4.0
	 */
	waitUntilFinished(): void;
}

/**
 * @since 2.0
 */
declare class NSOperationQueue extends NSObject implements NSProgressReporting {

	static alloc(): NSOperationQueue; // inherited from NSObject

	static new(): NSOperationQueue; // inherited from NSObject

	maxConcurrentOperationCount: number;

	/**
	 * @since 4.0
	 */
	name: string;

	/**
	 * @since 4.0
	 * @deprecated 100000
	 */
	readonly operationCount: number;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	readonly operations: NSArray<NSOperation>;

	/**
	 * @since 8.0
	 */
	qualityOfService: NSQualityOfService;

	suspended: boolean;

	/**
	 * @since 8.0
	 */
	underlyingQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 4.0
	 */
	static readonly currentQueue: NSOperationQueue;

	/**
	 * @since 4.0
	 */
	static readonly mainQueue: NSOperationQueue;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 13.0
	 */
	addBarrierBlock(barrier: () => void): void;

	addOperation(op: NSOperation): void;

	/**
	 * @since 4.0
	 */
	addOperationWithBlock(block: () => void): void;

	/**
	 * @since 4.0
	 */
	addOperationsWaitUntilFinished(ops: NSArray<NSOperation> | NSOperation[], wait: boolean): void;

	cancelAllOperations(): void;

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

	self(): this;

	waitUntilAllOperationsAreFinished(): void;
}

declare var NSOperationQueueDefaultMaxConcurrentOperationCount: number;

declare const enum NSOperationQueuePriority {

	VeryLow = -8,

	Low = -4,

	Normal = 0,

	High = 4,

	VeryHigh = 8
}

/**
 * @since 13.0
 */
declare class NSOrderedCollectionChange<ObjectType> extends NSObject {

	static alloc<ObjectType>(): NSOrderedCollectionChange<ObjectType>; // inherited from NSObject

	static changeWithObjectTypeIndex<ObjectType>(anObject: any, type: NSCollectionChangeType, index: number): NSOrderedCollectionChange<any>;

	static changeWithObjectTypeIndexAssociatedIndex<ObjectType>(anObject: any, type: NSCollectionChangeType, index: number, associatedIndex: number): NSOrderedCollectionChange<any>;

	static new<ObjectType>(): NSOrderedCollectionChange<ObjectType>; // inherited from NSObject

	readonly associatedIndex: number;

	readonly changeType: NSCollectionChangeType;

	readonly index: number;

	readonly object: any;

	constructor(o: { object: any; type: NSCollectionChangeType; index: number; });

	constructor(o: { object: any; type: NSCollectionChangeType; index: number; associatedIndex: number; });

	initWithObjectTypeIndex(anObject: any, type: NSCollectionChangeType, index: number): this;

	initWithObjectTypeIndexAssociatedIndex(anObject: any, type: NSCollectionChangeType, index: number, associatedIndex: number): this;
}

/**
 * @since 13.0
 */
declare class NSOrderedCollectionDifference<ObjectType> extends NSObject implements NSFastEnumeration {

	static alloc<ObjectType>(): NSOrderedCollectionDifference<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSOrderedCollectionDifference<ObjectType>; // inherited from NSObject

	readonly hasChanges: boolean;

	/**
	 * @since 13.0
	 */
	readonly insertions: NSArray<NSOrderedCollectionChange<any>>;

	/**
	 * @since 13.0
	 */
	readonly removals: NSArray<NSOrderedCollectionChange<any>>;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { changes: NSArray<NSOrderedCollectionChange<any>> | NSOrderedCollectionChange<any>[]; });

	constructor(o: { insertIndexes: NSIndexSet; insertedObjects: NSArray<any> | any[]; removeIndexes: NSIndexSet; removedObjects: NSArray<any> | any[]; });

	constructor(o: { insertIndexes: NSIndexSet; insertedObjects: NSArray<any> | any[]; removeIndexes: NSIndexSet; removedObjects: NSArray<any> | any[]; additionalChanges: NSArray<NSOrderedCollectionChange<any>> | NSOrderedCollectionChange<any>[]; });

	differenceByTransformingChangesWithBlock(block: (p1: NSOrderedCollectionChange<any>) => NSOrderedCollectionChange<any>): NSOrderedCollectionDifference<any>;

	initWithChanges(changes: NSArray<NSOrderedCollectionChange<any>> | NSOrderedCollectionChange<any>[]): this;

	initWithInsertIndexesInsertedObjectsRemoveIndexesRemovedObjects(inserts: NSIndexSet, insertedObjects: NSArray<any> | any[], removes: NSIndexSet, removedObjects: NSArray<any> | any[]): this;

	initWithInsertIndexesInsertedObjectsRemoveIndexesRemovedObjectsAdditionalChanges(inserts: NSIndexSet, insertedObjects: NSArray<any> | any[], removes: NSIndexSet, removedObjects: NSArray<any> | any[], changes: NSArray<NSOrderedCollectionChange<any>> | NSOrderedCollectionChange<any>[]): this;

	/**
	 * @since 13.0
	 */
	inverseDifference(): this;
}

/**
 * @since 13.0
 */
declare const enum NSOrderedCollectionDifferenceCalculationOptions {

	OmitInsertedObjects = 1,

	OmitRemovedObjects = 2,

	InferMoves = 4
}

/**
 * @since 5.0
 */
declare class NSOrderedSet<ObjectType> extends NSObject implements NSCopying, NSFastEnumeration, NSMutableCopying, NSSecureCoding {

	static alloc<ObjectType>(): NSOrderedSet<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSOrderedSet<ObjectType>; // inherited from NSObject

	static orderedSet<ObjectType>(): NSOrderedSet<ObjectType>;

	static orderedSetWithArray<ObjectType>(array: NSArray<any> | any[]): NSOrderedSet<ObjectType>;

	static orderedSetWithArrayRangeCopyItems<ObjectType>(array: NSArray<any> | any[], range: NSRange, flag: boolean): NSOrderedSet<ObjectType>;

	static orderedSetWithObject<ObjectType>(object: any): NSOrderedSet<ObjectType>;

	static orderedSetWithObjects<ObjectType>(firstObj: any): NSOrderedSet<ObjectType>;

	static orderedSetWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSOrderedSet<ObjectType>;

	static orderedSetWithOrderedSet<ObjectType>(set: NSOrderedSet<any>): NSOrderedSet<ObjectType>;

	static orderedSetWithOrderedSetRangeCopyItems<ObjectType>(set: NSOrderedSet<any>, range: NSRange, flag: boolean): NSOrderedSet<ObjectType>;

	static orderedSetWithSet<ObjectType>(set: NSSet<any>): NSOrderedSet<ObjectType>;

	static orderedSetWithSetCopyItems<ObjectType>(set: NSSet<any>, flag: boolean): NSOrderedSet<ObjectType>;

	readonly array: NSArray<any>;

	readonly count: number;

	readonly firstObject: any;

	readonly lastObject: any;

	readonly reversedOrderedSet: NSOrderedSet<any>;

	readonly set: NSSet<any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[index: number]: any;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { array: NSArray<any> | any[]; });

	constructor(o: { array: NSArray<any> | any[]; copyItems: boolean; });

	constructor(o: { array: NSArray<any> | any[]; range: NSRange; copyItems: boolean; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { object: any; });

	constructor(o: { objects: any; });

	constructor(o: { objects: interop.Reference<any>; count: number; });

	constructor(o: { orderedSet: NSOrderedSet<any>; });

	constructor(o: { orderedSet: NSOrderedSet<any>; copyItems: boolean; });

	constructor(o: { orderedSet: NSOrderedSet<any>; range: NSRange; copyItems: boolean; });

	constructor(o: { set: NSSet<any>; });

	constructor(o: { set: NSSet<any>; copyItems: boolean; });

	containsObject(object: any): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	descriptionWithLocale(locale: any): string;

	descriptionWithLocaleIndent(locale: any, level: number): string;

	differenceFromOrderedSet(other: NSOrderedSet<any>): NSOrderedCollectionDifference<any>;

	differenceFromOrderedSetWithOptions(other: NSOrderedSet<any>, options: NSOrderedCollectionDifferenceCalculationOptions): NSOrderedCollectionDifference<any>;

	differenceFromOrderedSetWithOptionsUsingEquivalenceTest(other: NSOrderedSet<any>, options: NSOrderedCollectionDifferenceCalculationOptions, block: (p1: any, p2: any) => boolean): NSOrderedCollectionDifference<any>;

	encodeWithCoder(coder: NSCoder): void;

	enumerateObjectsAtIndexesOptionsUsingBlock(s: NSIndexSet, opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateObjectsUsingBlock(block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateObjectsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 5.0
	 */
	filteredOrderedSetUsingPredicate(p: NSPredicate): NSOrderedSet<any>;

	getObjectsRange(objects: interop.Reference<any>, range: NSRange): void;

	indexOfObject(object: any): number;

	indexOfObjectAtIndexesOptionsPassingTest(s: NSIndexSet, opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	indexOfObjectInSortedRangeOptionsUsingComparator(object: any, range: NSRange, opts: NSBinarySearchingOptions, cmp: (p1: any, p2: any) => NSComparisonResult): number;

	indexOfObjectPassingTest(predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	indexOfObjectWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): number;

	indexesOfObjectsAtIndexesOptionsPassingTest(s: NSIndexSet, opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	indexesOfObjectsPassingTest(predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	indexesOfObjectsWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSIndexSet;

	initWithArray(array: NSArray<any> | any[]): this;

	initWithArrayCopyItems(set: NSArray<any> | any[], flag: boolean): this;

	initWithArrayRangeCopyItems(set: NSArray<any> | any[], range: NSRange, flag: boolean): this;

	initWithCoder(coder: NSCoder): this;

	initWithObject(object: any): this;

	initWithObjects(firstObj: any): this;

	initWithObjectsCount(objects: interop.Reference<any>, cnt: number): this;

	initWithOrderedSet(set: NSOrderedSet<any>): this;

	initWithOrderedSetCopyItems(set: NSOrderedSet<any>, flag: boolean): this;

	initWithOrderedSetRangeCopyItems(set: NSOrderedSet<any>, range: NSRange, flag: boolean): this;

	initWithSet(set: NSSet<any>): this;

	initWithSetCopyItems(set: NSSet<any>, flag: boolean): this;

	intersectsOrderedSet(other: NSOrderedSet<any>): boolean;

	intersectsSet(set: NSSet<any>): boolean;

	isEqualToOrderedSet(other: NSOrderedSet<any>): boolean;

	isSubsetOfOrderedSet(other: NSOrderedSet<any>): boolean;

	isSubsetOfSet(set: NSSet<any>): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	objectAtIndex(idx: number): any;

	/**
	 * @since 6.0
	 */
	objectAtIndexedSubscript(idx: number): any;

	objectEnumerator(): NSEnumerator<any>;

	objectsAtIndexes(indexes: NSIndexSet): NSArray<any>;

	orderedSetByApplyingDifference(difference: NSOrderedCollectionDifference<any>): NSOrderedSet<any>;

	reverseObjectEnumerator(): NSEnumerator<any>;

	sortedArrayUsingComparator(cmptr: (p1: any, p2: any) => NSComparisonResult): NSArray<any>;

	/**
	 * @since 5.0
	 */
	sortedArrayUsingDescriptors(sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]): NSArray<any>;

	sortedArrayWithOptionsUsingComparator(opts: NSSortOptions, cmptr: (p1: any, p2: any) => NSComparisonResult): NSArray<any>;
}

/**
 * @since 4.0
 */
declare class NSOrthography extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSOrthography; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static defaultOrthographyForLanguage(language: string): NSOrthography;

	static new(): NSOrthography; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static orthographyWithDominantScriptLanguageMap(script: string, map: NSDictionary<string, NSArray<string>>): NSOrthography;

	/**
	 * @since 4.0
	 */
	readonly allLanguages: NSArray<string>;

	/**
	 * @since 4.0
	 */
	readonly allScripts: NSArray<string>;

	/**
	 * @since 4.0
	 */
	readonly dominantLanguage: string;

	readonly dominantScript: string;

	readonly languageMap: NSDictionary<string, NSArray<string>>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 4.0
	 */
	constructor(o: { dominantScript: string; languageMap: NSDictionary<string, NSArray<string>>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 4.0
	 */
	dominantLanguageForScript(script: string): string;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 4.0
	 */
	initWithDominantScriptLanguageMap(script: string, map: NSDictionary<string, NSArray<string>>): this;

	/**
	 * @since 4.0
	 */
	languagesForScript(script: string): NSArray<string>;
}

declare class NSOutputStream extends NSStream {

	static alloc(): NSOutputStream; // inherited from NSObject

	static new(): NSOutputStream; // inherited from NSObject

	static outputStreamToBufferCapacity(buffer: string | interop.Pointer | interop.Reference<any>, capacity: number): NSOutputStream;

	static outputStreamToFileAtPathAppend(path: string, shouldAppend: boolean): NSOutputStream;

	static outputStreamToMemory(): NSOutputStream;

	/**
	 * @since 4.0
	 */
	static outputStreamWithURLAppend(url: NSURL, shouldAppend: boolean): NSOutputStream;

	readonly hasSpaceAvailable: boolean;

	constructor(o: { toBuffer: string | interop.Pointer | interop.Reference<any>; capacity: number; });

	constructor(o: { toFileAtPath: string; append: boolean; });

	constructor(o: { toMemory: void; });

	/**
	 * @since 4.0
	 */
	constructor(o: { URL: NSURL; append: boolean; });

	initToBufferCapacity(buffer: string | interop.Pointer | interop.Reference<any>, capacity: number): this;

	initToFileAtPathAppend(path: string, shouldAppend: boolean): this;

	initToMemory(): this;

	/**
	 * @since 4.0
	 */
	initWithURLAppend(url: NSURL, shouldAppend: boolean): this;

	writeMaxLength(buffer: string | interop.Pointer | interop.Reference<any>, len: number): number;
}

declare var NSOwnedObjectIdentityHashCallBacks: NSHashTableCallBacks;

declare var NSOwnedPointerHashCallBacks: NSHashTableCallBacks;

declare var NSOwnedPointerMapKeyCallBacks: NSMapTableKeyCallBacks;

declare var NSOwnedPointerMapValueCallBacks: NSMapTableValueCallBacks;

declare var NSPOSIXErrorDomain: string;

declare function NSPageSize(): number;

declare var NSParseErrorException: string;

/**
 * @since 4.0
 * @deprecated 8.0
 */
declare var NSPersianCalendar: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentDelimiter: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentFamilyName: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentGivenName: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentKey: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentMiddleName: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentNickname: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentPrefix: string;

/**
 * @since 9.0
 */
declare var NSPersonNameComponentSuffix: string;

/**
 * @since 9.0
 */
declare class NSPersonNameComponents extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSPersonNameComponents; // inherited from NSObject

	static new(): NSPersonNameComponents; // inherited from NSObject

	familyName: string;

	givenName: string;

	middleName: string;

	namePrefix: string;

	nameSuffix: string;

	nickname: string;

	phoneticRepresentation: NSPersonNameComponents;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare class NSPersonNameComponentsFormatter extends NSFormatter {

	static alloc(): NSPersonNameComponentsFormatter; // inherited from NSObject

	static localizedStringFromPersonNameComponentsStyleOptions(components: NSPersonNameComponents, nameFormatStyle: NSPersonNameComponentsFormatterStyle, nameOptions: NSPersonNameComponentsFormatterOptions): string;

	static new(): NSPersonNameComponentsFormatter; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	locale: NSLocale;

	phonetic: boolean;

	style: NSPersonNameComponentsFormatterStyle;

	annotatedStringFromPersonNameComponents(components: NSPersonNameComponents): NSAttributedString;

	/**
	 * @since 10.0
	 */
	personNameComponentsFromString(string: string): NSPersonNameComponents;

	stringFromPersonNameComponents(components: NSPersonNameComponents): string;
}

/**
 * @since 9.0
 */
declare const enum NSPersonNameComponentsFormatterOptions {

	Phonetic = 2
}

/**
 * @since 9.0
 */
declare const enum NSPersonNameComponentsFormatterStyle {

	Default = 0,

	Short = 1,

	Medium = 2,

	Long = 3,

	Abbreviated = 4
}

declare class NSPipe extends NSObject {

	static alloc(): NSPipe; // inherited from NSObject

	static new(): NSPipe; // inherited from NSObject

	static pipe(): NSPipe;

	readonly fileHandleForReading: NSFileHandle;

	readonly fileHandleForWriting: NSFileHandle;
}

/**
 * @since 6.0
 */
declare class NSPointerArray extends NSObject implements NSCopying, NSFastEnumeration, NSSecureCoding {

	static alloc(): NSPointerArray; // inherited from NSObject

	static new(): NSPointerArray; // inherited from NSObject

	static pointerArrayWithOptions(options: NSPointerFunctionsOptions): NSPointerArray;

	static pointerArrayWithPointerFunctions(functions: NSPointerFunctions): NSPointerArray;

	/**
	 * @since 6.0
	 */
	static strongObjectsPointerArray(): NSPointerArray;

	/**
	 * @since 6.0
	 */
	static weakObjectsPointerArray(): NSPointerArray;

	readonly allObjects: NSArray<any>;

	count: number;

	readonly pointerFunctions: NSPointerFunctions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { options: NSPointerFunctionsOptions; });

	constructor(o: { pointerFunctions: NSPointerFunctions; });

	addPointer(pointer: interop.Pointer | interop.Reference<any>): void;

	compact(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithOptions(options: NSPointerFunctionsOptions): this;

	initWithPointerFunctions(functions: NSPointerFunctions): this;

	insertPointerAtIndex(item: interop.Pointer | interop.Reference<any>, index: number): void;

	pointerAtIndex(index: number): interop.Pointer | interop.Reference<any>;

	removePointerAtIndex(index: number): void;

	replacePointerAtIndexWithPointer(index: number, item: interop.Pointer | interop.Reference<any>): void;
}

/**
 * @since 6.0
 */
declare class NSPointerFunctions extends NSObject implements NSCopying {

	static alloc(): NSPointerFunctions; // inherited from NSObject

	static new(): NSPointerFunctions; // inherited from NSObject

	static pointerFunctionsWithOptions(options: NSPointerFunctionsOptions): NSPointerFunctions;

	acquireFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>, p3: boolean) => interop.Pointer | interop.Reference<any>>;

	descriptionFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;

	hashFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>) => number>;

	isEqualFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>) => boolean>;

	relinquishFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>) => void>;

	sizeFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;

	/**
	 * @since 2.0
	 * @deprecated 10.0
	 */
	usesStrongWriteBarrier: boolean;

	/**
	 * @since 2.0
	 * @deprecated 10.0
	 */
	usesWeakReadAndWriteBarriers: boolean;

	constructor(o: { options: NSPointerFunctionsOptions; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithOptions(options: NSPointerFunctionsOptions): this;
}

declare const enum NSPointerFunctionsOptions {

	StrongMemory = 0,

	ZeroingWeakMemory = 1,

	OpaqueMemory = 2,

	MallocMemory = 3,

	MachVirtualMemory = 4,

	WeakMemory = 5,

	ObjectPersonality = 0,

	OpaquePersonality = 256,

	ObjectPointerPersonality = 512,

	CStringPersonality = 768,

	StructPersonality = 1024,

	IntegerPersonality = 1280,

	CopyIn = 65536
}

declare var NSPointerToStructHashCallBacks: NSHashTableCallBacks;

declare class NSPort extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSPort; // inherited from NSObject

	static new(): NSPort; // inherited from NSObject

	static port(): NSPort;

	readonly reservedSpaceLength: number;

	readonly valid: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	delegate(): NSPortDelegate;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	invalidate(): void;

	removeFromRunLoopForMode(runLoop: NSRunLoop, mode: string): void;

	scheduleInRunLoopForMode(runLoop: NSRunLoop, mode: string): void;

	sendBeforeDateComponentsFromReserved(limitDate: Date, components: NSMutableArray<any>, receivePort: NSPort, headerSpaceReserved: number): boolean;

	sendBeforeDateMsgidComponentsFromReserved(limitDate: Date, msgID: number, components: NSMutableArray<any>, receivePort: NSPort, headerSpaceReserved: number): boolean;

	setDelegate(anObject: NSPortDelegate): void;
}

interface NSPortDelegate extends NSObjectProtocol {
}
declare var NSPortDelegate: {

	prototype: NSPortDelegate;
};

declare var NSPortDidBecomeInvalidNotification: string;

declare var NSPortReceiveException: string;

declare var NSPortSendException: string;

declare var NSPortTimeoutException: string;

declare const enum NSPostingStyle {

	WhenIdle = 1,

	ASAP = 2,

	Now = 3
}

/**
 * @since 3.0
 */
declare class NSPredicate extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSPredicate; // inherited from NSObject

	static new(): NSPredicate; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static predicateWithBlock(block: (p1: any, p2: NSDictionary<string, any>) => boolean): NSPredicate;

	static predicateWithFormatArgumentArray(predicateFormat: string, _arguments: NSArray<any> | any[]): NSPredicate;

	static predicateWithValue(value: boolean): NSPredicate;

	readonly predicateFormat: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 7.0
	 */
	allowEvaluation(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	evaluateWithObject(object: any): boolean;

	/**
	 * @since 3.0
	 */
	evaluateWithObjectSubstitutionVariables(object: any, bindings: NSDictionary<string, any>): boolean;

	initWithCoder(coder: NSCoder): this;

	predicateWithSubstitutionVariables(variables: NSDictionary<string, any>): this;
}

declare const enum NSPredicateOperatorType {

	LessThanPredicateOperatorType = 0,

	LessThanOrEqualToPredicateOperatorType = 1,

	GreaterThanPredicateOperatorType = 2,

	GreaterThanOrEqualToPredicateOperatorType = 3,

	EqualToPredicateOperatorType = 4,

	NotEqualToPredicateOperatorType = 5,

	MatchesPredicateOperatorType = 6,

	LikePredicateOperatorType = 7,

	BeginsWithPredicateOperatorType = 8,

	EndsWithPredicateOperatorType = 9,

	InPredicateOperatorType = 10,

	CustomSelectorPredicateOperatorType = 11,

	ContainsPredicateOperatorType = 99,

	BetweenPredicateOperatorType = 100
}

/**
 * @since 15.0
 */
declare class NSPresentationIntent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSPresentationIntent; // inherited from NSObject

	static blockQuoteIntentWithIdentityNestedInsideIntent(identity: number, parent: NSPresentationIntent): NSPresentationIntent;

	static codeBlockIntentWithIdentityLanguageHintNestedInsideIntent(identity: number, languageHint: string, parent: NSPresentationIntent): NSPresentationIntent;

	static headerIntentWithIdentityLevelNestedInsideIntent(identity: number, level: number, parent: NSPresentationIntent): NSPresentationIntent;

	static listItemIntentWithIdentityOrdinalNestedInsideIntent(identity: number, ordinal: number, parent: NSPresentationIntent): NSPresentationIntent;

	static new(): NSPresentationIntent; // inherited from NSObject

	static orderedListIntentWithIdentityNestedInsideIntent(identity: number, parent: NSPresentationIntent): NSPresentationIntent;

	static paragraphIntentWithIdentityNestedInsideIntent(identity: number, parent: NSPresentationIntent): NSPresentationIntent;

	static tableCellIntentWithIdentityColumnNestedInsideIntent(identity: number, column: number, parent: NSPresentationIntent): NSPresentationIntent;

	static tableHeaderRowIntentWithIdentityNestedInsideIntent(identity: number, parent: NSPresentationIntent): NSPresentationIntent;

	static tableIntentWithIdentityColumnCountAlignmentsNestedInsideIntent(identity: number, columnCount: number, alignments: NSArray<number> | number[], parent: NSPresentationIntent): NSPresentationIntent;

	static tableRowIntentWithIdentityRowNestedInsideIntent(identity: number, row: number, parent: NSPresentationIntent): NSPresentationIntent;

	static thematicBreakIntentWithIdentityNestedInsideIntent(identity: number, parent: NSPresentationIntent): NSPresentationIntent;

	static unorderedListIntentWithIdentityNestedInsideIntent(identity: number, parent: NSPresentationIntent): NSPresentationIntent;

	readonly column: number;

	readonly columnAlignments: NSArray<number>;

	readonly columnCount: number;

	readonly headerLevel: number;

	readonly identity: number;

	readonly indentationLevel: number;

	readonly intentKind: NSPresentationIntentKind;

	readonly languageHint: string;

	readonly ordinal: number;

	readonly parentIntent: NSPresentationIntent;

	readonly row: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEquivalentToPresentationIntent(other: NSPresentationIntent): boolean;
}

/**
 * @since 15.0
 */
declare var NSPresentationIntentAttributeName: string;

/**
 * @since 15.0
 */
declare const enum NSPresentationIntentKind {

	Paragraph = 0,

	Header = 1,

	OrderedList = 2,

	UnorderedList = 3,

	ListItem = 4,

	CodeBlock = 5,

	BlockQuote = 6,

	ThematicBreak = 7,

	Table = 8,

	TableHeaderRow = 9,

	TableRow = 10,

	TableCell = 11
}

/**
 * @since 15.0
 */
declare const enum NSPresentationIntentTableColumnAlignment {

	Left = 0,

	Center = 1,

	Right = 2
}

declare class NSProcessInfo extends NSObject {

	static alloc(): NSProcessInfo; // inherited from NSObject

	static new(): NSProcessInfo; // inherited from NSObject

	/**
	 * @since 2.0
	 */
	readonly activeProcessorCount: number;

	readonly arguments: NSArray<string>;

	readonly environment: NSDictionary<string, string>;

	readonly globallyUniqueString: string;

	readonly hostName: string;

	/**
	 * @since 14.0
	 */
	readonly iOSAppOnMac: boolean;

	/**
	 * @since 9.0
	 */
	readonly lowPowerModeEnabled: boolean;

	/**
	 * @since 13.0
	 */
	readonly macCatalystApp: boolean;

	/**
	 * @since 8.0
	 */
	readonly operatingSystemVersion: NSOperatingSystemVersion;

	readonly operatingSystemVersionString: string;

	/**
	 * @since 2.0
	 */
	readonly physicalMemory: number;

	readonly processIdentifier: number;

	processName: string;

	/**
	 * @since 2.0
	 */
	readonly processorCount: number;

	/**
	 * @since 4.0
	 */
	readonly systemUptime: number;

	/**
	 * @since 11.0
	 */
	readonly thermalState: NSProcessInfoThermalState;

	static readonly processInfo: NSProcessInfo;

	/**
	 * @since 7.0
	 */
	beginActivityWithOptionsReason(options: NSActivityOptions, reason: string): NSObjectProtocol;

	/**
	 * @since 7.0
	 */
	endActivity(activity: NSObjectProtocol): void;

	hasPerformanceProfile(performanceProfile: number): boolean;

	isDeviceCertifiedFor(performanceTier: number): boolean;

	/**
	 * @since 8.0
	 */
	isOperatingSystemAtLeastVersion(version: NSOperatingSystemVersion): boolean;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	operatingSystem(): number;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	operatingSystemName(): string;

	/**
	 * @since 7.0
	 */
	performActivityWithOptionsReasonUsingBlock(options: NSActivityOptions, reason: string, block: () => void): void;

	/**
	 * @since 8.2
	 */
	performExpiringActivityWithReasonUsingBlock(reason: string, block: (p1: boolean) => void): void;
}

/**
 * @since 9.0
 */
declare var NSProcessInfoPowerStateDidChangeNotification: string;

/**
 * @since 11.0
 */
declare const enum NSProcessInfoThermalState {

	Nominal = 0,

	Fair = 1,

	Serious = 2,

	Critical = 3
}

/**
 * @since 11.0
 */
declare var NSProcessInfoThermalStateDidChangeNotification: string;

/**
 * @since 7.0
 */
declare class NSProgress extends NSObject {

	static alloc(): NSProgress; // inherited from NSObject

	static currentProgress(): NSProgress;

	/**
	 * @since 9.0
	 */
	static discreteProgressWithTotalUnitCount(unitCount: number): NSProgress;

	static new(): NSProgress; // inherited from NSObject

	static progressWithTotalUnitCount(unitCount: number): NSProgress;

	/**
	 * @since 9.0
	 */
	static progressWithTotalUnitCountParentPendingUnitCount(unitCount: number, parent: NSProgress, portionOfParentTotalUnitCount: number): NSProgress;

	cancellable: boolean;

	cancellationHandler: () => void;

	readonly cancelled: boolean;

	completedUnitCount: number;

	/**
	 * @since 11.0
	 */
	estimatedTimeRemaining: number;

	/**
	 * @since 11.0
	 */
	fileCompletedCount: number;

	/**
	 * @since 11.0
	 */
	fileOperationKind: string;

	/**
	 * @since 11.0
	 */
	fileTotalCount: number;

	/**
	 * @since 11.0
	 */
	fileURL: NSURL;

	readonly finished: boolean;

	readonly fractionCompleted: number;

	readonly indeterminate: boolean;

	kind: string;

	localizedAdditionalDescription: string;

	localizedDescription: string;

	pausable: boolean;

	readonly paused: boolean;

	pausingHandler: () => void;

	/**
	 * @since 9.0
	 */
	resumingHandler: () => void;

	/**
	 * @since 11.0
	 */
	throughput: number;

	totalUnitCount: number;

	readonly userInfo: NSDictionary<string, any>;

	constructor(o: { parent: NSProgress; userInfo: NSDictionary<string, any>; });

	/**
	 * @since 9.0
	 */
	addChildWithPendingUnitCount(child: NSProgress, inUnitCount: number): void;

	becomeCurrentWithPendingUnitCount(unitCount: number): void;

	cancel(): void;

	initWithParentUserInfo(parentProgressOrNil: NSProgress, userInfoOrNil: NSDictionary<string, any>): this;

	pause(): void;

	/**
	 * @since 11.0
	 */
	performAsCurrentWithPendingUnitCountUsingBlock(unitCount: number, work: () => void): void;

	resignCurrent(): void;

	/**
	 * @since 9.0
	 */
	resume(): void;

	setUserInfoObjectForKey(objectOrNil: any, key: string): void;
}

/**
 * @since 7.0
 */
declare var NSProgressEstimatedTimeRemainingKey: string;

/**
 * @since 7.0
 */
declare var NSProgressFileCompletedCountKey: string;

/**
 * @since 7.0
 */
declare var NSProgressFileOperationKindCopying: string;

/**
 * @since 7.0
 */
declare var NSProgressFileOperationKindDecompressingAfterDownloading: string;

/**
 * @since 7.0
 */
declare var NSProgressFileOperationKindDownloading: string;

/**
 * @since 15.0
 */
declare var NSProgressFileOperationKindDuplicating: string;

/**
 * @since 7.0
 */
declare var NSProgressFileOperationKindKey: string;

/**
 * @since 7.0
 */
declare var NSProgressFileOperationKindReceiving: string;

/**
 * @since 8.0
 */
declare var NSProgressFileOperationKindUploading: string;

/**
 * @since 7.0
 */
declare var NSProgressFileTotalCountKey: string;

/**
 * @since 7.0
 */
declare var NSProgressFileURLKey: string;

/**
 * @since 7.0
 */
declare var NSProgressKindFile: string;

interface NSProgressReporting extends NSObjectProtocol {

	progress: NSProgress;
}
declare var NSProgressReporting: {

	prototype: NSProgressReporting;
};

/**
 * @since 7.0
 */
declare var NSProgressThroughputKey: string;

declare const NSPropertyListErrorMaximum: number;

declare const NSPropertyListErrorMinimum: number;

declare const enum NSPropertyListFormat {

	OpenStepFormat = 1,

	XMLFormat_v1_0 = 100,

	BinaryFormat_v1_0 = 200
}

declare const enum NSPropertyListMutabilityOptions {

	Immutable = 0,

	MutableContainers = 1,

	MutableContainersAndLeaves = 2
}

declare const NSPropertyListReadCorruptError: number;

declare const NSPropertyListReadStreamError: number;

declare const NSPropertyListReadUnknownVersionError: number;

declare class NSPropertyListSerialization extends NSObject {

	static alloc(): NSPropertyListSerialization; // inherited from NSObject

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	static dataFromPropertyListFormatErrorDescription(plist: any, format: NSPropertyListFormat, errorString: interop.Pointer | interop.Reference<string>): NSData;

	/**
	 * @since 4.0
	 */
	static dataWithPropertyListFormatOptionsError(plist: any, format: NSPropertyListFormat, opt: number): NSData;

	static new(): NSPropertyListSerialization; // inherited from NSObject

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	static propertyListFromDataMutabilityOptionFormatErrorDescription(data: NSData, opt: NSPropertyListMutabilityOptions, format: interop.Pointer | interop.Reference<NSPropertyListFormat>, errorString: interop.Pointer | interop.Reference<string>): any;

	static propertyListIsValidForFormat(plist: any, format: NSPropertyListFormat): boolean;

	/**
	 * @since 4.0
	 */
	static propertyListWithDataOptionsFormatError(data: NSData, opt: NSPropertyListMutabilityOptions, format: interop.Pointer | interop.Reference<NSPropertyListFormat>): any;

	/**
	 * @since 4.0
	 */
	static propertyListWithStreamOptionsFormatError(stream: NSInputStream, opt: NSPropertyListMutabilityOptions, format: interop.Pointer | interop.Reference<NSPropertyListFormat>): any;

	/**
	 * @since 4.0
	 */
	static writePropertyListToStreamFormatOptionsError(plist: any, stream: NSOutputStream, format: NSPropertyListFormat, opt: number): number;
}

declare const NSPropertyListWriteInvalidError: number;

declare const NSPropertyListWriteStreamError: number;

declare const NSProprietaryStringEncoding: number;

/**
 * @since 2.0
 */
declare function NSProtocolFromString(namestr: string): any /* Protocol */;

declare class NSProxy implements NSObjectProtocol {

	static alloc(): NSProxy;

	static class(): typeof NSObject;

	static respondsToSelector(aSelector: string): boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dealloc(): void;

	finalize(): void;

	forwardInvocation(invocation: NSInvocation): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	methodSignatureForSelector(sel: string): NSMethodSignature;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 4.0
 */
declare class NSPurgeableData extends NSMutableData implements NSDiscardableContent {

	static alloc(): NSPurgeableData; // inherited from NSObject

	static data(): NSPurgeableData; // inherited from NSData

	static dataWithBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): NSPurgeableData; // inherited from NSData

	static dataWithBytesNoCopyLength(bytes: interop.Pointer | interop.Reference<any>, length: number): NSPurgeableData; // inherited from NSData

	static dataWithBytesNoCopyLengthFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, length: number, b: boolean): NSPurgeableData; // inherited from NSData

	static dataWithCapacity(aNumItems: number): NSPurgeableData; // inherited from NSMutableData

	static dataWithContentsOfFile(path: string): NSPurgeableData; // inherited from NSData

	static dataWithContentsOfFileOptionsError(path: string, readOptionsMask: NSDataReadingOptions): NSPurgeableData; // inherited from NSData

	static dataWithContentsOfURL(url: NSURL): NSPurgeableData; // inherited from NSData

	static dataWithContentsOfURLOptionsError(url: NSURL, readOptionsMask: NSDataReadingOptions): NSPurgeableData; // inherited from NSData

	static dataWithData(data: NSData): NSPurgeableData; // inherited from NSData

	static dataWithLength(length: number): NSPurgeableData; // inherited from NSMutableData

	static new(): NSPurgeableData; // inherited from NSObject

	beginContentAccess(): boolean;

	discardContentIfPossible(): void;

	endContentAccess(): void;

	isContentDiscarded(): boolean;
}

/**
 * @since 8.0
 */
declare const enum NSQualityOfService {

	UserInteractive = 33,

	UserInitiated = 25,

	Utility = 17,

	Background = 9,

	Default = -1
}

interface NSRange {
	location: number;
	length: number;
}
declare var NSRange: interop.StructType<NSRange>;

declare var NSRangeException: string;

declare function NSRangeFromString(aString: string): NSRange;

/**
 * @since 2.0
 * @deprecated 6.0
 */
declare function NSRealMemoryAvailable(): number;

declare var NSRecoveryAttempterErrorKey: string;

declare class NSRecursiveLock extends NSObject implements NSLocking {

	static alloc(): NSRecursiveLock; // inherited from NSObject

	static new(): NSRecursiveLock; // inherited from NSObject

	/**
	 * @since 2.0
	 */
	name: string;

	lock(): void;

	lockBeforeDate(limit: Date): boolean;

	tryLock(): boolean;

	unlock(): void;
}

declare function NSRecycleZone(zone: interop.Pointer | interop.Reference<any>): void;

declare var NSRegistrationDomain: string;

/**
 * @since 4.0
 */
declare class NSRegularExpression extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSRegularExpression; // inherited from NSObject

	static escapedPatternForString(string: string): string;

	static escapedTemplateForString(string: string): string;

	static new(): NSRegularExpression; // inherited from NSObject

	static regularExpressionWithPatternOptionsError(pattern: string, options: NSRegularExpressionOptions): NSRegularExpression;

	readonly numberOfCaptureGroups: number;

	readonly options: NSRegularExpressionOptions;

	readonly pattern: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { pattern: string; options: NSRegularExpressionOptions; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	enumerateMatchesInStringOptionsRangeUsingBlock(string: string, options: NSMatchingOptions, range: NSRange, block: (p1: NSTextCheckingResult, p2: NSMatchingFlags, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	firstMatchInStringOptionsRange(string: string, options: NSMatchingOptions, range: NSRange): NSTextCheckingResult;

	initWithCoder(coder: NSCoder): this;

	initWithPatternOptionsError(pattern: string, options: NSRegularExpressionOptions): this;

	matchesInStringOptionsRange(string: string, options: NSMatchingOptions, range: NSRange): NSArray<NSTextCheckingResult>;

	numberOfMatchesInStringOptionsRange(string: string, options: NSMatchingOptions, range: NSRange): number;

	rangeOfFirstMatchInStringOptionsRange(string: string, options: NSMatchingOptions, range: NSRange): NSRange;

	replaceMatchesInStringOptionsRangeWithTemplate(string: NSMutableString, options: NSMatchingOptions, range: NSRange, templ: string): number;

	replacementStringForResultInStringOffsetTemplate(result: NSTextCheckingResult, string: string, offset: number, templ: string): string;

	stringByReplacingMatchesInStringOptionsRangeWithTemplate(string: string, options: NSMatchingOptions, range: NSRange, templ: string): string;
}

declare const enum NSRegularExpressionOptions {

	CaseInsensitive = 1,

	AllowCommentsAndWhitespace = 2,

	IgnoreMetacharacters = 4,

	DotMatchesLineSeparators = 8,

	AnchorsMatchLines = 16,

	UseUnixLineSeparators = 32,

	UseUnicodeWordBoundaries = 64
}

/**
 * @since 13.0
 */
declare class NSRelativeDateTimeFormatter extends NSFormatter {

	static alloc(): NSRelativeDateTimeFormatter; // inherited from NSObject

	static new(): NSRelativeDateTimeFormatter; // inherited from NSObject

	calendar: NSCalendar;

	dateTimeStyle: NSRelativeDateTimeFormatterStyle;

	formattingContext: NSFormattingContext;

	locale: NSLocale;

	unitsStyle: NSRelativeDateTimeFormatterUnitsStyle;

	localizedStringForDateRelativeToDate(date: Date, referenceDate: Date): string;

	localizedStringFromDateComponents(dateComponents: NSDateComponents): string;

	localizedStringFromTimeInterval(timeInterval: number): string;
}

/**
 * @since 13.0
 */
declare const enum NSRelativeDateTimeFormatterStyle {

	Numeric = 0,

	Named = 1
}

/**
 * @since 13.0
 */
declare const enum NSRelativeDateTimeFormatterUnitsStyle {

	Full = 0,

	SpellOut = 1,

	Short = 2,

	Abbreviated = 3
}

/**
 * @since 15.0
 */
declare var NSReplacementIndexAttributeName: string;

/**
 * @since 4.0
 * @deprecated 8.0
 */
declare var NSRepublicOfChinaCalendar: string;

declare function NSResetHashTable(table: NSHashTable<any>): void;

declare function NSResetMapTable(table: NSMapTable<any, any>): void;

declare function NSRoundDownToMultipleOfPageSize(bytes: number): number;

declare function NSRoundUpToMultipleOfPageSize(bytes: number): number;

declare const enum NSRoundingMode {

	Plain = 0,

	Down = 1,

	Up = 2,

	Bankers = 3
}

declare class NSRunLoop extends NSObject {

	static alloc(): NSRunLoop; // inherited from NSObject

	static new(): NSRunLoop; // inherited from NSObject

	readonly currentMode: string;

	static readonly currentRunLoop: NSRunLoop;

	/**
	 * @since 2.0
	 */
	static readonly mainRunLoop: NSRunLoop;

	acceptInputForModeBeforeDate(mode: string, limitDate: Date): void;

	addPortForMode(aPort: NSPort, mode: string): void;

	addTimerForMode(timer: NSTimer, mode: string): void;

	cancelPerformSelectorTargetArgument(aSelector: string, target: any, arg: any): void;

	cancelPerformSelectorsWithTarget(target: any): void;

	getCFRunLoop(): any;

	limitDateForMode(mode: string): Date;

	/**
	 * @since 10.0
	 */
	performBlock(block: () => void): void;

	/**
	 * @since 10.0
	 */
	performInModesBlock(modes: NSArray<string> | string[], block: () => void): void;

	performSelectorTargetArgumentOrderModes(aSelector: string, target: any, arg: any, order: number, modes: NSArray<string> | string[]): void;

	removePortForMode(aPort: NSPort, mode: string): void;

	run(): void;

	runModeBeforeDate(mode: string, limitDate: Date): boolean;

	runUntilDate(limitDate: Date): void;
}

/**
 * @since 2.0
 */
declare var NSRunLoopCommonModes: string;

declare class NSScanner extends NSObject implements NSCopying {

	static alloc(): NSScanner; // inherited from NSObject

	static localizedScannerWithString(string: string): any;

	static new(): NSScanner; // inherited from NSObject

	static scannerWithString(string: string): NSScanner;

	readonly atEnd: boolean;

	caseSensitive: boolean;

	charactersToBeSkipped: NSCharacterSet;

	locale: any;

	scanLocation: number;

	readonly string: string;

	constructor(o: { string: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithString(string: string): this;

	scanCharactersFromSetIntoString(set: NSCharacterSet, result: interop.Pointer | interop.Reference<string>): boolean;

	scanDecimal(dcm: interop.Pointer | interop.Reference<NSDecimal>): boolean;

	scanDouble(result: interop.Pointer | interop.Reference<number>): boolean;

	scanFloat(result: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 2.0
	 */
	scanHexDouble(result: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 2.0
	 */
	scanHexFloat(result: interop.Pointer | interop.Reference<number>): boolean;

	scanHexInt(result: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 2.0
	 */
	scanHexLongLong(result: interop.Pointer | interop.Reference<number>): boolean;

	scanInt(result: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 2.0
	 */
	scanInteger(result: interop.Pointer | interop.Reference<number>): boolean;

	scanLongLong(result: interop.Pointer | interop.Reference<number>): boolean;

	scanStringIntoString(string: string, result: interop.Pointer | interop.Reference<string>): boolean;

	/**
	 * @since 7.0
	 */
	scanUnsignedLongLong(result: interop.Pointer | interop.Reference<number>): boolean;

	scanUpToCharactersFromSetIntoString(set: NSCharacterSet, result: interop.Pointer | interop.Reference<string>): boolean;

	scanUpToStringIntoString(string: string, result: interop.Pointer | interop.Reference<string>): boolean;
}

declare const enum NSSearchPathDirectory {

	ApplicationDirectory = 1,

	DemoApplicationDirectory = 2,

	DeveloperApplicationDirectory = 3,

	AdminApplicationDirectory = 4,

	LibraryDirectory = 5,

	DeveloperDirectory = 6,

	UserDirectory = 7,

	DocumentationDirectory = 8,

	DocumentDirectory = 9,

	CoreServiceDirectory = 10,

	AutosavedInformationDirectory = 11,

	DesktopDirectory = 12,

	CachesDirectory = 13,

	ApplicationSupportDirectory = 14,

	DownloadsDirectory = 15,

	InputMethodsDirectory = 16,

	MoviesDirectory = 17,

	MusicDirectory = 18,

	PicturesDirectory = 19,

	PrinterDescriptionDirectory = 20,

	SharedPublicDirectory = 21,

	PreferencePanesDirectory = 22,

	ApplicationScriptsDirectory = 23,

	ItemReplacementDirectory = 99,

	AllApplicationsDirectory = 100,

	AllLibrariesDirectory = 101,

	TrashDirectory = 102
}

declare const enum NSSearchPathDomainMask {

	UserDomainMask = 1,

	LocalDomainMask = 2,

	NetworkDomainMask = 4,

	SystemDomainMask = 8,

	AllDomainsMask = 65535
}

declare function NSSearchPathForDirectoriesInDomains(directory: NSSearchPathDirectory, domainMask: NSSearchPathDomainMask, expandTilde: boolean): NSArray<string>;

interface NSSecureCoding extends NSCoding {
}
declare var NSSecureCoding: {

	prototype: NSSecureCoding;
};

/**
 * @since 12.0
 */
declare class NSSecureUnarchiveFromDataTransformer extends NSValueTransformer {

	static alloc(): NSSecureUnarchiveFromDataTransformer; // inherited from NSObject

	static new(): NSSecureUnarchiveFromDataTransformer; // inherited from NSObject

	static readonly allowedTopLevelClasses: NSArray<typeof NSObject>;
}

/**
 * @since 12.0
 */
declare var NSSecureUnarchiveFromDataTransformerName: string;

declare function NSSelectorFromString(aSelectorName: string): string;

declare class NSSet<ObjectType> extends NSObject implements NSCopying, NSFastEnumeration, NSMutableCopying, NSSecureCoding {

	static alloc<ObjectType>(): NSSet<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): NSSet<ObjectType>; // inherited from NSObject

	static set<ObjectType>(): NSSet<ObjectType>;

	static setWithArray<ObjectType>(array: NSArray<any> | any[]): NSSet<ObjectType>;

	static setWithObject<ObjectType>(object: any): NSSet<ObjectType>;

	static setWithObjects<ObjectType>(firstObj: any): NSSet<ObjectType>;

	static setWithObjectsCount<ObjectType>(objects: interop.Reference<any>, cnt: number): NSSet<ObjectType>;

	static setWithSet<ObjectType>(set: NSSet<any>): NSSet<ObjectType>;

	readonly allObjects: NSArray<any>;

	readonly count: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { array: NSArray<any> | any[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { objects: any; });

	constructor(o: { objects: interop.Reference<any>; count: number; });

	constructor(o: { set: NSSet<any>; });

	constructor(o: { set: NSSet<any>; copyItems: boolean; });

	anyObject(): any;

	containsObject(anObject: any): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	descriptionWithLocale(locale: any): string;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateObjectsUsingBlock(block: (p1: any, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateObjectsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: any, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 3.0
	 */
	filteredSetUsingPredicate(predicate: NSPredicate): NSSet<any>;

	initWithArray(array: NSArray<any> | any[]): this;

	initWithCoder(coder: NSCoder): this;

	initWithObjects(firstObj: any): this;

	initWithObjectsCount(objects: interop.Reference<any>, cnt: number): this;

	initWithSet(set: NSSet<any>): this;

	initWithSetCopyItems(set: NSSet<any>, flag: boolean): this;

	intersectsSet(otherSet: NSSet<any>): boolean;

	isEqualToSet(otherSet: NSSet<any>): boolean;

	isSubsetOfSet(otherSet: NSSet<any>): boolean;

	makeObjectsPerformSelector(aSelector: string): void;

	makeObjectsPerformSelectorWithObject(aSelector: string, argument: any): void;

	member(object: any): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	objectEnumerator(): NSEnumerator<any>;

	/**
	 * @since 4.0
	 */
	objectsPassingTest(predicate: (p1: any, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSSet<any>;

	/**
	 * @since 4.0
	 */
	objectsWithOptionsPassingTest(opts: NSEnumerationOptions, predicate: (p1: any, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSSet<any>;

	/**
	 * @since 2.0
	 */
	setByAddingObject(anObject: any): NSSet<any>;

	/**
	 * @since 2.0
	 */
	setByAddingObjectsFromArray(other: NSArray<any> | any[]): NSSet<any>;

	/**
	 * @since 2.0
	 */
	setByAddingObjectsFromSet(other: NSSet<any>): NSSet<any>;

	/**
	 * @since 4.0
	 */
	sortedArrayUsingDescriptors(sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]): NSArray<any>;
}

declare function NSSetUncaughtExceptionHandler(p1: interop.Pointer | interop.Reference<interop.FunctionReference<(p1: NSException) => void>>): void;

declare function NSSetZoneName(zone: interop.Pointer | interop.Reference<any>, name: string): void;

declare const NSShiftJISStringEncoding: number;

declare function NSShouldRetainWithZone(anObject: any, requestedZone: interop.Pointer | interop.Reference<any>): boolean;

declare class NSSimpleCString extends NSString {

	static alloc(): NSSimpleCString; // inherited from NSObject

	static new(): NSSimpleCString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSSimpleCString; // inherited from NSItemProviderReading

	static string(): NSSimpleCString; // inherited from NSString

	static stringWithCStringEncoding(cString: string | interop.Pointer | interop.Reference<any>, enc: number): NSSimpleCString; // inherited from NSString

	static stringWithCharactersLength(characters: interop.Pointer | interop.Reference<string>, length: number): NSSimpleCString; // inherited from NSString

	static stringWithContentsOfFileEncodingError(path: string, enc: number): NSSimpleCString; // inherited from NSString

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number>): NSSimpleCString; // inherited from NSString

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number): NSSimpleCString; // inherited from NSString

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number>): NSSimpleCString; // inherited from NSString

	static stringWithString(string: string): NSSimpleCString; // inherited from NSString

	static stringWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>): NSSimpleCString; // inherited from NSString
}

declare class NSSocketPort extends NSPort {

	static alloc(): NSSocketPort; // inherited from NSObject

	static new(): NSSocketPort; // inherited from NSObject

	readonly address: NSData;

	readonly protocol: number;

	readonly protocolFamily: number;

	readonly socket: number;

	readonly socketType: number;

	constructor(o: { remoteWithProtocolFamily: number; socketType: number; protocol: number; address: NSData; });

	constructor(o: { remoteWithTCPPort: number; host: string; });

	constructor(o: { protocolFamily: number; socketType: number; protocol: number; address: NSData; });

	constructor(o: { protocolFamily: number; socketType: number; protocol: number; socket: number; });

	constructor(o: { TCPPort: number; });

	initRemoteWithProtocolFamilySocketTypeProtocolAddress(family: number, type: number, protocol: number, address: NSData): this;

	initRemoteWithTCPPortHost(port: number, hostName: string): this;

	initWithProtocolFamilySocketTypeProtocolAddress(family: number, type: number, protocol: number, address: NSData): this;

	initWithProtocolFamilySocketTypeProtocolSocket(family: number, type: number, protocol: number, sock: number): this;

	initWithTCPPort(port: number): this;
}

declare const NSSolarisOperatingSystem: number;

declare class NSSortDescriptor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSSortDescriptor; // inherited from NSObject

	static new(): NSSortDescriptor; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static sortDescriptorWithKeyAscending(key: string, ascending: boolean): NSSortDescriptor;

	/**
	 * @since 4.0
	 */
	static sortDescriptorWithKeyAscendingComparator(key: string, ascending: boolean, cmptr: (p1: any, p2: any) => NSComparisonResult): NSSortDescriptor;

	/**
	 * @since 4.0
	 */
	static sortDescriptorWithKeyAscendingSelector(key: string, ascending: boolean, selector: string): NSSortDescriptor;

	readonly ascending: boolean;

	/**
	 * @since 4.0
	 */
	readonly comparator: (p1: any, p2: any) => NSComparisonResult;

	readonly key: string;

	readonly reversedSortDescriptor: any;

	readonly selector: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { key: string; ascending: boolean; });

	/**
	 * @since 4.0
	 */
	constructor(o: { key: string; ascending: boolean; comparator: (p1: any, p2: any) => NSComparisonResult; });

	constructor(o: { key: string; ascending: boolean; selector: string; });

	/**
	 * @since 7.0
	 */
	allowEvaluation(): void;

	compareObjectToObject(object1: any, object2: any): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithKeyAscending(key: string, ascending: boolean): this;

	/**
	 * @since 4.0
	 */
	initWithKeyAscendingComparator(key: string, ascending: boolean, cmptr: (p1: any, p2: any) => NSComparisonResult): this;

	initWithKeyAscendingSelector(key: string, ascending: boolean, selector: string): this;
}

declare const enum NSSortOptions {

	Concurrent = 1,

	Stable = 16
}

declare class NSStream extends NSObject {

	static alloc(): NSStream; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static getBoundStreamsWithBufferSizeInputStreamOutputStream(bufferSize: number, inputStream: interop.Pointer | interop.Reference<NSInputStream>, outputStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	static getStreamsToHostWithNamePortInputStreamOutputStream(hostname: string, port: number, inputStream: interop.Pointer | interop.Reference<NSInputStream>, outputStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

	static new(): NSStream; // inherited from NSObject

	delegate: NSStreamDelegate;

	readonly streamError: NSError;

	readonly streamStatus: NSStreamStatus;

	close(): void;

	open(): void;

	propertyForKey(key: string): any;

	removeFromRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	scheduleInRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	setPropertyForKey(property: any, key: string): boolean;
}

/**
 * @since 2.0
 */
declare var NSStreamDataWrittenToMemoryStreamKey: string;

interface NSStreamDelegate extends NSObjectProtocol {

	streamHandleEvent?(aStream: NSStream, eventCode: NSStreamEvent): void;
}
declare var NSStreamDelegate: {

	prototype: NSStreamDelegate;
};

declare const enum NSStreamEvent {

	None = 0,

	OpenCompleted = 1,

	HasBytesAvailable = 2,

	HasSpaceAvailable = 4,

	ErrorOccurred = 8,

	EndEncountered = 16
}

/**
 * @since 2.0
 */
declare var NSStreamFileCurrentOffsetKey: string;

/**
 * @since 4.0
 */
declare var NSStreamNetworkServiceType: string;

/**
 * @since 5.0
 */
declare var NSStreamNetworkServiceTypeBackground: string;

/**
 * @since 10.0
 */
declare var NSStreamNetworkServiceTypeCallSignaling: string;

/**
 * @since 5.0
 */
declare var NSStreamNetworkServiceTypeVideo: string;

/**
 * @since 4.0
 */
declare var NSStreamNetworkServiceTypeVoIP: string;

/**
 * @since 5.0
 */
declare var NSStreamNetworkServiceTypeVoice: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSErrorDomain: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyConfigurationKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyHostKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyPasswordKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyPortKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyUserKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyVersion4: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyVersion5: string;

/**
 * @since 2.0
 */
declare var NSStreamSOCKSProxyVersionKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSSLErrorDomain: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSecurityLevelKey: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSecurityLevelNegotiatedSSL: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSecurityLevelNone: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSecurityLevelSSLv2: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSecurityLevelSSLv3: string;

/**
 * @since 2.0
 */
declare var NSStreamSocketSecurityLevelTLSv1: string;

declare const enum NSStreamStatus {

	NotOpen = 0,

	Opening = 1,

	Open = 2,

	Reading = 3,

	Writing = 4,

	AtEnd = 5,

	Closed = 6,

	Error = 7
}

declare class NSString extends NSObject implements CKRecordValue, CNKeyDescriptor, NSCopying, NSItemProviderReading, NSItemProviderWriting, NSMutableCopying, NSSecureCoding {

	static alloc(): NSString; // inherited from NSObject

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static localizedNameOfStringEncoding(encoding: number): string;

	/**
	 * @since 10.0
	 */
	static localizedUserNotificationStringForKeyArguments(key: string, _arguments: NSArray<any> | any[]): string;

	static new(): NSString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSString;

	static pathWithComponents(components: NSArray<string> | string[]): string;

	static string(): NSString;

	/**
	 * @since 8.0
	 */
	static stringEncodingForDataEncodingOptionsConvertedStringUsedLossyConversion(data: NSData, opts: NSDictionary<string, any>, string: interop.Pointer | interop.Reference<string>, usedLossyConversion: interop.Pointer | interop.Reference<boolean>): number;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	static stringWithCString(bytes: string | interop.Pointer | interop.Reference<any>): any;

	static stringWithCStringEncoding(cString: string | interop.Pointer | interop.Reference<any>, enc: number): NSString;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	static stringWithCStringLength(bytes: string | interop.Pointer | interop.Reference<any>, length: number): any;

	static stringWithCharactersLength(characters: interop.Pointer | interop.Reference<string>, length: number): NSString;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	static stringWithContentsOfFile(path: string): any;

	static stringWithContentsOfFileEncodingCompletion(path: string, enc: number, callback: (p1: string, p2: NSError) => void): void;

	static stringWithContentsOfFileEncodingError(path: string, enc: number): NSString;

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number>): NSString;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	static stringWithContentsOfURL(url: NSURL): any;

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number): NSString;

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number>): NSString;

	static stringWithString(string: string): NSString;

	static stringWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>): NSString;

	readonly UTF8String: interop.Pointer | interop.Reference<any>;

	readonly absolutePath: boolean;

	/**
	 * @since 2.0
	 */
	readonly boolValue: boolean;

	readonly capitalizedString: string;

	readonly decomposedStringWithCanonicalMapping: string;

	readonly decomposedStringWithCompatibilityMapping: string;

	readonly doubleValue: number;

	readonly fastestEncoding: number;

	readonly fileSystemRepresentation: interop.Pointer | interop.Reference<any>;

	readonly floatValue: number;

	readonly intValue: number;

	/**
	 * @since 2.0
	 */
	readonly integerValue: number;

	readonly lastPathComponent: string;

	readonly length: number;

	/**
	 * @since 9.0
	 */
	readonly localizedCapitalizedString: string;

	/**
	 * @since 9.0
	 */
	readonly localizedLowercaseString: string;

	/**
	 * @since 9.0
	 */
	readonly localizedUppercaseString: string;

	/**
	 * @since 2.0
	 */
	readonly longLongValue: number;

	readonly lowercaseString: string;

	readonly pathComponents: NSArray<string>;

	readonly pathExtension: string;

	readonly precomposedStringWithCanonicalMapping: string;

	readonly precomposedStringWithCompatibilityMapping: string;

	readonly smallestEncoding: number;

	readonly stringByAbbreviatingWithTildeInPath: string;

	readonly stringByDeletingLastPathComponent: string;

	readonly stringByDeletingPathExtension: string;

	readonly stringByExpandingTildeInPath: string;

	/**
	 * @since 7.0
	 */
	readonly stringByRemovingPercentEncoding: string;

	readonly stringByResolvingSymlinksInPath: string;

	readonly stringByStandardizingPath: string;

	readonly uppercaseString: string;

	static readonly availableStringEncodings: interop.Pointer | interop.Reference<number>;

	static readonly defaultCStringEncoding: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { bytes: interop.Pointer | interop.Reference<any>; length: number; encoding: number; });

	constructor(o: { bytesNoCopy: interop.Pointer | interop.Reference<any>; length: number; encoding: number; deallocator: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void; });

	constructor(o: { bytesNoCopy: interop.Pointer | interop.Reference<any>; length: number; encoding: number; freeWhenDone: boolean; });

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	constructor(o: { CString: string | interop.Pointer | interop.Reference<any>; });

	constructor(o: { CString: string | interop.Pointer | interop.Reference<any>; encoding: number; });

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	constructor(o: { CString: string | interop.Pointer | interop.Reference<any>; length: number; });

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	constructor(o: { CStringNoCopy: string | interop.Pointer | interop.Reference<any>; length: number; freeWhenDone: boolean; });

	constructor(o: { characters: interop.Pointer | interop.Reference<string>; length: number; });

	constructor(o: { charactersNoCopy: interop.Pointer | interop.Reference<string>; length: number; deallocator: (p1: interop.Pointer | interop.Reference<string>, p2: number) => void; });

	constructor(o: { charactersNoCopy: interop.Pointer | interop.Reference<string>; length: number; freeWhenDone: boolean; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	constructor(o: { contentsOfFile: string; });

	constructor(o: { contentsOfFile: string; encoding: number; });

	constructor(o: { contentsOfFile: string; usedEncoding: interop.Pointer | interop.Reference<number>; });

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { contentsOfURL: NSURL; encoding: number; });

	constructor(o: { contentsOfURL: NSURL; usedEncoding: interop.Pointer | interop.Reference<number>; });

	constructor(o: { data: NSData; encoding: number; });

	constructor(o: { string: string; });

	constructor(o: { UTF8String: string | interop.Pointer | interop.Reference<any>; });

	/**
	 * @since 7.0
	 */
	boundingRectWithSizeOptionsAttributesContext(size: CGSize, options: NSStringDrawingOptions, attributes: NSDictionary<string, any>, context: NSStringDrawingContext): CGRect;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	cString(): interop.Pointer | interop.Reference<any>;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	cStringLength(): number;

	cStringUsingEncoding(encoding: number): interop.Pointer | interop.Reference<any>;

	canBeConvertedToEncoding(encoding: number): boolean;

	/**
	 * @since 6.0
	 */
	capitalizedStringWithLocale(locale: NSLocale): string;

	caseInsensitiveCompare(string: string): NSComparisonResult;

	characterAtIndex(index: number): string;

	class(): typeof NSObject;

	commonPrefixWithStringOptions(str: string, mask: NSStringCompareOptions): string;

	compare(string: string): NSComparisonResult;

	compareOptions(string: string, mask: NSStringCompareOptions): NSComparisonResult;

	compareOptionsRange(string: string, mask: NSStringCompareOptions, rangeOfReceiverToCompare: NSRange): NSComparisonResult;

	compareOptionsRangeLocale(string: string, mask: NSStringCompareOptions, rangeOfReceiverToCompare: NSRange, locale: any): NSComparisonResult;

	completePathIntoStringCaseSensitiveMatchesIntoArrayFilterTypes(outputName: interop.Pointer | interop.Reference<string>, flag: boolean, outputArray: interop.Pointer | interop.Reference<NSArray<string>>, filterTypes: NSArray<string> | string[]): number;

	/**
	 * @since 2.0
	 */
	componentsSeparatedByCharactersInSet(separator: NSCharacterSet): NSArray<string>;

	componentsSeparatedByString(separator: string): NSArray<string>;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 8.0
	 */
	containsString(str: string): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dataUsingEncoding(encoding: number): NSData;

	dataUsingEncodingAllowLossyConversion(encoding: number, lossy: boolean): NSData;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawAtPointForWidthWithFontFontSizeLineBreakModeBaselineAdjustment(point: CGPoint, width: number, font: UIFont, fontSize: number, lineBreakMode: NSLineBreakMode, baselineAdjustment: UIBaselineAdjustment): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawAtPointForWidthWithFontLineBreakMode(point: CGPoint, width: number, font: UIFont, lineBreakMode: NSLineBreakMode): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawAtPointForWidthWithFontMinFontSizeActualFontSizeLineBreakModeBaselineAdjustment(point: CGPoint, width: number, font: UIFont, minFontSize: number, actualFontSize: interop.Pointer | interop.Reference<number>, lineBreakMode: NSLineBreakMode, baselineAdjustment: UIBaselineAdjustment): CGSize;

	/**
	 * @since 7.0
	 */
	drawAtPointWithAttributes(point: CGPoint, attrs: NSDictionary<string, any>): void;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawAtPointWithFont(point: CGPoint, font: UIFont): CGSize;

	/**
	 * @since 7.0
	 */
	drawInRectWithAttributes(rect: CGRect, attrs: NSDictionary<string, any>): void;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawInRectWithFont(rect: CGRect, font: UIFont): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawInRectWithFontLineBreakMode(rect: CGRect, font: UIFont, lineBreakMode: NSLineBreakMode): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	drawInRectWithFontLineBreakModeAlignment(rect: CGRect, font: UIFont, lineBreakMode: NSLineBreakMode, alignment: NSTextAlignment): CGSize;

	/**
	 * @since 7.0
	 */
	drawWithRectOptionsAttributesContext(rect: CGRect, options: NSStringDrawingOptions, attributes: NSDictionary<string, any>, context: NSStringDrawingContext): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateLinesUsingBlock(block: (p1: string, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	enumerateLinguisticTagsInRangeSchemeOptionsOrthographyUsingBlock(range: NSRange, scheme: string, options: NSLinguisticTaggerOptions, orthography: NSOrthography, block: (p1: string, p2: NSRange, p3: NSRange, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4.0
	 */
	enumerateSubstringsInRangeOptionsUsingBlock(range: NSRange, opts: NSStringEnumerationOptions, block: (p1: string, p2: NSRange, p3: NSRange, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	getBytesMaxLengthUsedLengthEncodingOptionsRangeRemainingRange(buffer: interop.Pointer | interop.Reference<any>, maxBufferCount: number, usedBufferCount: interop.Pointer | interop.Reference<number>, encoding: number, options: NSStringEncodingConversionOptions, range: NSRange, leftover: interop.Pointer | interop.Reference<NSRange>): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	getCString(bytes: string | interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	getCStringMaxLength(bytes: string | interop.Pointer | interop.Reference<any>, maxLength: number): void;

	getCStringMaxLengthEncoding(buffer: string | interop.Pointer | interop.Reference<any>, maxBufferCount: number, encoding: number): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	getCStringMaxLengthRangeRemainingRange(bytes: string | interop.Pointer | interop.Reference<any>, maxLength: number, aRange: NSRange, leftoverRange: interop.Pointer | interop.Reference<NSRange>): void;

	getCharacters(buffer: interop.Pointer | interop.Reference<string>): void;

	getCharactersRange(buffer: interop.Pointer | interop.Reference<string>, range: NSRange): void;

	getFileSystemRepresentationMaxLength(cname: string | interop.Pointer | interop.Reference<any>, max: number): boolean;

	getLineStartEndContentsEndForRange(startPtr: interop.Pointer | interop.Reference<number>, lineEndPtr: interop.Pointer | interop.Reference<number>, contentsEndPtr: interop.Pointer | interop.Reference<number>, range: NSRange): void;

	getParagraphStartEndContentsEndForRange(startPtr: interop.Pointer | interop.Reference<number>, parEndPtr: interop.Pointer | interop.Reference<number>, contentsEndPtr: interop.Pointer | interop.Reference<number>, range: NSRange): void;

	hasPrefix(str: string): boolean;

	hasSuffix(str: string): boolean;

	initWithBytesLengthEncoding(bytes: interop.Pointer | interop.Reference<any>, len: number, encoding: number): this;

	initWithBytesNoCopyLengthEncodingDeallocator(bytes: interop.Pointer | interop.Reference<any>, len: number, encoding: number, deallocator: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): this;

	initWithBytesNoCopyLengthEncodingFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, len: number, encoding: number, freeBuffer: boolean): this;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	initWithCString(bytes: string | interop.Pointer | interop.Reference<any>): this;

	initWithCStringEncoding(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>, encoding: number): this;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	initWithCStringLength(bytes: string | interop.Pointer | interop.Reference<any>, length: number): this;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	initWithCStringNoCopyLengthFreeWhenDone(bytes: string | interop.Pointer | interop.Reference<any>, length: number, freeBuffer: boolean): this;

	initWithCharactersLength(characters: interop.Pointer | interop.Reference<string>, length: number): this;

	initWithCharactersNoCopyLengthDeallocator(chars: interop.Pointer | interop.Reference<string>, len: number, deallocator: (p1: interop.Pointer | interop.Reference<string>, p2: number) => void): this;

	initWithCharactersNoCopyLengthFreeWhenDone(characters: interop.Pointer | interop.Reference<string>, length: number, freeBuffer: boolean): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	initWithContentsOfFile(path: string): this;

	initWithContentsOfFileEncodingError(path: string, enc: number): this;

	initWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number>): this;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	initWithContentsOfURL(url: NSURL): this;

	initWithContentsOfURLEncodingError(url: NSURL, enc: number): this;

	initWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number>): this;

	initWithDataEncoding(data: NSData, encoding: number): this;

	initWithString(aString: string): this;

	initWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>): this;

	isEqual(object: any): boolean;

	isEqualToString(aString: string): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	lengthOfBytesUsingEncoding(enc: number): number;

	lineRangeForRange(range: NSRange): NSRange;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	linguisticTagsInRangeSchemeOptionsOrthographyTokenRanges(range: NSRange, scheme: string, options: NSLinguisticTaggerOptions, orthography: NSOrthography, tokenRanges: interop.Pointer | interop.Reference<NSArray<NSValue>>): NSArray<string>;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	localizedCaseInsensitiveCompare(string: string): NSComparisonResult;

	/**
	 * @since 8.0
	 */
	localizedCaseInsensitiveContainsString(str: string): boolean;

	localizedCompare(string: string): NSComparisonResult;

	/**
	 * @since 4.0
	 */
	localizedStandardCompare(string: string): NSComparisonResult;

	/**
	 * @since 9.0
	 */
	localizedStandardContainsString(str: string): boolean;

	/**
	 * @since 9.0
	 */
	localizedStandardRangeOfString(str: string): NSRange;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	lossyCString(): interop.Pointer | interop.Reference<any>;

	/**
	 * @since 6.0
	 */
	lowercaseStringWithLocale(locale: NSLocale): string;

	maximumLengthOfBytesUsingEncoding(enc: number): number;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	paragraphRangeForRange(range: NSRange): NSRange;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	propertyList(): any;

	propertyListFromStringsFileFormat(): NSDictionary<any, any>;

	rangeOfCharacterFromSet(searchSet: NSCharacterSet): NSRange;

	rangeOfCharacterFromSetOptions(searchSet: NSCharacterSet, mask: NSStringCompareOptions): NSRange;

	rangeOfCharacterFromSetOptionsRange(searchSet: NSCharacterSet, mask: NSStringCompareOptions, rangeOfReceiverToSearch: NSRange): NSRange;

	rangeOfComposedCharacterSequenceAtIndex(index: number): NSRange;

	/**
	 * @since 2.0
	 */
	rangeOfComposedCharacterSequencesForRange(range: NSRange): NSRange;

	rangeOfString(searchString: string): NSRange;

	rangeOfStringOptions(searchString: string, mask: NSStringCompareOptions): NSRange;

	rangeOfStringOptionsRange(searchString: string, mask: NSStringCompareOptions, rangeOfReceiverToSearch: NSRange): NSRange;

	/**
	 * @since 2.0
	 */
	rangeOfStringOptionsRangeLocale(searchString: string, mask: NSStringCompareOptions, rangeOfReceiverToSearch: NSRange, locale: NSLocale): NSRange;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 7.0
	 */
	sizeWithAttributes(attrs: NSDictionary<string, any>): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	sizeWithFont(font: UIFont): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	sizeWithFontConstrainedToSize(font: UIFont, size: CGSize): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	sizeWithFontConstrainedToSizeLineBreakMode(font: UIFont, size: CGSize, lineBreakMode: NSLineBreakMode): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	sizeWithFontForWidthLineBreakMode(font: UIFont, width: number, lineBreakMode: NSLineBreakMode): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	sizeWithFontMinFontSizeActualFontSizeForWidthLineBreakMode(font: UIFont, minFontSize: number, actualFontSize: interop.Pointer | interop.Reference<number>, width: number, lineBreakMode: NSLineBreakMode): CGSize;

	sr_sensorForDeletionRecordsFromSensor(): string;

	/**
	 * @since 7.0
	 */
	stringByAddingPercentEncodingWithAllowedCharacters(allowedCharacters: NSCharacterSet): string;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	stringByAddingPercentEscapesUsingEncoding(enc: number): string;

	stringByAppendingPathComponent(str: string): string;

	/**
	 * @since 14.0
	 */
	stringByAppendingPathComponentConformingToType(partialName: string, contentType: UTType): string;

	stringByAppendingPathExtension(str: string): string;

	/**
	 * @since 14.0
	 */
	stringByAppendingPathExtensionForType(contentType: UTType): string;

	stringByAppendingString(aString: string): string;

	/**
	 * @since 9.0
	 */
	stringByApplyingTransformReverse(transform: string, reverse: boolean): string;

	/**
	 * @since 2.0
	 */
	stringByFoldingWithOptionsLocale(options: NSStringCompareOptions, locale: NSLocale): string;

	stringByPaddingToLengthWithStringStartingAtIndex(newLength: number, padString: string, padIndex: number): string;

	/**
	 * @since 2.0
	 */
	stringByReplacingCharactersInRangeWithString(range: NSRange, replacement: string): string;

	/**
	 * @since 2.0
	 */
	stringByReplacingOccurrencesOfStringWithString(target: string, replacement: string): string;

	/**
	 * @since 2.0
	 */
	stringByReplacingOccurrencesOfStringWithStringOptionsRange(target: string, replacement: string, options: NSStringCompareOptions, searchRange: NSRange): string;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	stringByReplacingPercentEscapesUsingEncoding(enc: number): string;

	stringByTrimmingCharactersInSet(set: NSCharacterSet): string;

	stringsByAppendingPaths(paths: NSArray<string> | string[]): NSArray<string>;

	substringFromIndex(from: number): string;

	substringToIndex(to: number): string;

	substringWithRange(range: NSRange): string;

	/**
	 * @since 6.0
	 */
	uppercaseStringWithLocale(locale: NSLocale): string;

	/**
	 * @since 9.0
	 */
	variantFittingPresentationWidth(width: number): string;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	writeToFileAtomically(path: string, useAuxiliaryFile: boolean): boolean;

	writeToFileAtomicallyEncodingCompletion(path: string, atomically: boolean, enc: number, callback: (p1: NSError) => void): void;

	writeToFileAtomicallyEncodingError(path: string, useAuxiliaryFile: boolean, enc: number): boolean;

	/**
	 * @since 2.0
	 * @deprecated 2.0
	 */
	writeToURLAtomically(url: NSURL, atomically: boolean): boolean;

	writeToURLAtomicallyEncodingError(url: NSURL, useAuxiliaryFile: boolean, enc: number): boolean;
}

declare const enum NSStringCompareOptions {

	CaseInsensitiveSearch = 1,

	LiteralSearch = 2,

	BackwardsSearch = 4,

	AnchoredSearch = 8,

	NumericSearch = 64,

	DiacriticInsensitiveSearch = 128,

	WidthInsensitiveSearch = 256,

	ForcedOrderingSearch = 512,

	RegularExpressionSearch = 1024
}

declare const enum NSStringEncodingConversionOptions {

	AllowLossy = 1,

	ExternalRepresentation = 2
}

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionAllowLossyKey: string;

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionDisallowedEncodingsKey: string;

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionFromWindowsKey: string;

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionLikelyLanguageKey: string;

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionLossySubstitutionKey: string;

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionSuggestedEncodingsKey: string;

/**
 * @since 8.0
 */
declare var NSStringEncodingDetectionUseOnlySuggestedEncodingsKey: string;

declare var NSStringEncodingErrorKey: string;

declare const enum NSStringEnumerationOptions {

	ByLines = 0,

	ByParagraphs = 1,

	ByComposedCharacterSequences = 2,

	ByWords = 3,

	BySentences = 4,

	ByCaretPositions = 5,

	ByDeletionClusters = 6,

	Reverse = 256,

	SubstringNotRequired = 512,

	Localized = 1024
}

declare function NSStringFromClass(aClass: typeof NSObject): string;

declare function NSStringFromHashTable(table: NSHashTable<any>): string;

declare function NSStringFromMapTable(table: NSMapTable<any, any>): string;

/**
 * @since 2.0
 */
declare function NSStringFromProtocol(proto: any /* Protocol */): string;

declare function NSStringFromRange(range: NSRange): string;

declare function NSStringFromSelector(aSelector: string): string;

/**
 * @since 9.0
 */
declare var NSStringTransformFullwidthToHalfwidth: string;

/**
 * @since 9.0
 */
declare var NSStringTransformHiraganaToKatakana: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToArabic: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToCyrillic: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToGreek: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToHangul: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToHebrew: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToHiragana: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToKatakana: string;

/**
 * @since 9.0
 */
declare var NSStringTransformLatinToThai: string;

/**
 * @since 9.0
 */
declare var NSStringTransformMandarinToLatin: string;

/**
 * @since 9.0
 */
declare var NSStringTransformStripCombiningMarks: string;

/**
 * @since 9.0
 */
declare var NSStringTransformStripDiacritics: string;

/**
 * @since 9.0
 */
declare var NSStringTransformToLatin: string;

/**
 * @since 9.0
 */
declare var NSStringTransformToUnicodeName: string;

/**
 * @since 9.0
 */
declare var NSStringTransformToXMLHex: string;

declare var NSSumKeyValueOperator: string;

declare const NSSunOSOperatingSystem: number;

interface NSSwappedDouble {
	v: number;
}
declare var NSSwappedDouble: interop.StructType<NSSwappedDouble>;

interface NSSwappedFloat {
	v: number;
}
declare var NSSwappedFloat: interop.StructType<NSSwappedFloat>;

declare const NSSymbolStringEncoding: number;

/**
 * @since 4.0
 */
declare var NSSystemClockDidChangeNotification: string;

/**
 * @since 2.0
 */
declare var NSSystemTimeZoneDidChangeNotification: string;

declare function NSTemporaryDirectory(): string;

/**
 * @since 17.0
 */
declare class NSTermOfAddress extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSTermOfAddress; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static currentUser(): NSTermOfAddress;

	static feminine(): NSTermOfAddress;

	static localizedForLanguageIdentifierWithPronouns(language: string, pronouns: NSArray<NSMorphologyPronoun> | NSMorphologyPronoun[]): NSTermOfAddress;

	static masculine(): NSTermOfAddress;

	static neutral(): NSTermOfAddress;

	static new(): NSTermOfAddress; // inherited from NSObject

	readonly languageIdentifier: string;

	readonly pronouns: NSArray<NSMorphologyPronoun>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 4.0
 */
declare var NSTextCheckingAirlineKey: string;

declare const NSTextCheckingAllCustomTypes: number;

declare const NSTextCheckingAllSystemTypes: number;

declare const NSTextCheckingAllTypes: number;

/**
 * @since 4.0
 */
declare var NSTextCheckingCityKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingCountryKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingFlightKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingJobTitleKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingNameKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingOrganizationKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingPhoneKey: string;

/**
 * @since 4.0
 */
declare class NSTextCheckingResult extends NSObject implements NSCopying, NSSecureCoding {

	static addressCheckingResultWithRangeComponents(range: NSRange, components: NSDictionary<string, string>): NSTextCheckingResult;

	static alloc(): NSTextCheckingResult; // inherited from NSObject

	static correctionCheckingResultWithRangeReplacementString(range: NSRange, replacementString: string): NSTextCheckingResult;

	/**
	 * @since 7.0
	 */
	static correctionCheckingResultWithRangeReplacementStringAlternativeStrings(range: NSRange, replacementString: string, alternativeStrings: NSArray<string> | string[]): NSTextCheckingResult;

	static dashCheckingResultWithRangeReplacementString(range: NSRange, replacementString: string): NSTextCheckingResult;

	static dateCheckingResultWithRangeDate(range: NSRange, date: Date): NSTextCheckingResult;

	static dateCheckingResultWithRangeDateTimeZoneDuration(range: NSRange, date: Date, timeZone: NSTimeZone, duration: number): NSTextCheckingResult;

	static grammarCheckingResultWithRangeDetails(range: NSRange, details: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]): NSTextCheckingResult;

	static linkCheckingResultWithRangeURL(range: NSRange, url: NSURL): NSTextCheckingResult;

	static new(): NSTextCheckingResult; // inherited from NSObject

	static orthographyCheckingResultWithRangeOrthography(range: NSRange, orthography: NSOrthography): NSTextCheckingResult;

	/**
	 * @since 4.0
	 */
	static phoneNumberCheckingResultWithRangePhoneNumber(range: NSRange, phoneNumber: string): NSTextCheckingResult;

	static quoteCheckingResultWithRangeReplacementString(range: NSRange, replacementString: string): NSTextCheckingResult;

	/**
	 * @since 4.0
	 */
	static regularExpressionCheckingResultWithRangesCountRegularExpression(ranges: interop.Pointer | interop.Reference<NSRange>, count: number, regularExpression: NSRegularExpression): NSTextCheckingResult;

	static replacementCheckingResultWithRangeReplacementString(range: NSRange, replacementString: string): NSTextCheckingResult;

	static spellCheckingResultWithRange(range: NSRange): NSTextCheckingResult;

	/**
	 * @since 4.0
	 */
	static transitInformationCheckingResultWithRangeComponents(range: NSRange, components: NSDictionary<string, string>): NSTextCheckingResult;

	readonly URL: NSURL;

	readonly addressComponents: NSDictionary<string, string>;

	/**
	 * @since 7.0
	 */
	readonly alternativeStrings: NSArray<string>;

	/**
	 * @since 4.0
	 */
	readonly components: NSDictionary<string, string>;

	readonly date: Date;

	readonly duration: number;

	readonly grammarDetails: NSArray<NSDictionary<string, any>>;

	/**
	 * @since 4.0
	 */
	readonly numberOfRanges: number;

	readonly orthography: NSOrthography;

	/**
	 * @since 4.0
	 */
	readonly phoneNumber: string;

	readonly range: NSRange;

	/**
	 * @since 4.0
	 */
	readonly regularExpression: NSRegularExpression;

	readonly replacementString: string;

	readonly resultType: NSTextCheckingType;

	readonly timeZone: NSTimeZone;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 4.0
	 */
	rangeAtIndex(idx: number): NSRange;

	/**
	 * @since 11.0
	 */
	rangeWithName(name: string): NSRange;

	/**
	 * @since 5.0
	 */
	resultByAdjustingRangesWithOffset(offset: number): NSTextCheckingResult;
}

/**
 * @since 4.0
 */
declare var NSTextCheckingStateKey: string;

/**
 * @since 4.0
 */
declare var NSTextCheckingStreetKey: string;

declare const enum NSTextCheckingType {

	Orthography = 1,

	Spelling = 2,

	Grammar = 4,

	Date = 8,

	Address = 16,

	Link = 32,

	Quote = 64,

	Dash = 128,

	Replacement = 256,

	Correction = 512,

	RegularExpression = 1024,

	PhoneNumber = 2048,

	TransitInformation = 4096
}

/**
 * @since 4.0
 */
declare var NSTextCheckingZIPKey: string;

declare class NSThread extends NSObject {

	static alloc(): NSThread; // inherited from NSObject

	static detachNewThreadSelectorToTargetWithObject(selector: string, target: any, argument: any): void;

	/**
	 * @since 10.0
	 */
	static detachNewThreadWithBlock(block: () => void): void;

	static exit(): void;

	static isMultiThreaded(): boolean;

	static new(): NSThread; // inherited from NSObject

	static setThreadPriority(p: number): boolean;

	static sleepForTimeInterval(ti: number): void;

	static sleepUntilDate(date: Date): void;

	static threadPriority(): number;

	/**
	 * @since 2.0
	 */
	readonly cancelled: boolean;

	/**
	 * @since 2.0
	 */
	readonly executing: boolean;

	/**
	 * @since 2.0
	 */
	readonly finished: boolean;

	/**
	 * @since 2.0
	 */
	readonly isMainThread: boolean;

	/**
	 * @since 2.0
	 */
	name: string;

	/**
	 * @since 8.0
	 */
	qualityOfService: NSQualityOfService;

	/**
	 * @since 2.0
	 */
	stackSize: number;

	readonly threadDictionary: NSMutableDictionary<any, any>;

	/**
	 * @since 4.0
	 */
	threadPriority: number;

	/**
	 * @since 2.0
	 */
	static readonly callStackReturnAddresses: NSArray<number>;

	/**
	 * @since 4.0
	 */
	static readonly callStackSymbols: NSArray<string>;

	static readonly currentThread: NSThread;

	/**
	 * @since 2.0
	 */
	static readonly isMainThread: boolean;

	/**
	 * @since 2.0
	 */
	static readonly mainThread: NSThread;

	/**
	 * @since 10.0
	 */
	constructor(o: { block: () => void; });

	/**
	 * @since 2.0
	 */
	constructor(o: { target: any; selector: string; object: any; });

	/**
	 * @since 2.0
	 */
	cancel(): void;

	/**
	 * @since 10.0
	 */
	initWithBlock(block: () => void): this;

	/**
	 * @since 2.0
	 */
	initWithTargetSelectorObject(target: any, selector: string, argument: any): this;

	/**
	 * @since 2.0
	 */
	main(): void;

	/**
	 * @since 2.0
	 */
	start(): void;
}

declare var NSThreadWillExitNotification: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var NSThumbnail1024x1024SizeKey: string;

declare class NSTimeZone extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSTimeZone; // inherited from NSObject

	static new(): NSTimeZone; // inherited from NSObject

	static resetSystemTimeZone(): void;

	static timeZoneForSecondsFromGMT(seconds: number): NSTimeZone;

	static timeZoneWithAbbreviation(abbreviation: string): NSTimeZone;

	static timeZoneWithName(tzName: string): NSTimeZone;

	static timeZoneWithNameData(tzName: string, aData: NSData): NSTimeZone;

	readonly abbreviation: string;

	readonly data: NSData;

	readonly daylightSavingTime: boolean;

	/**
	 * @since 2.0
	 */
	readonly daylightSavingTimeOffset: number;

	readonly name: string;

	/**
	 * @since 2.0
	 */
	readonly nextDaylightSavingTimeTransition: Date;

	readonly secondsFromGMT: number;

	/**
	 * @since 4.0
	 */
	static abbreviationDictionary: NSDictionary<string, string>;

	static defaultTimeZone: NSTimeZone;

	static readonly knownTimeZoneNames: NSArray<string>;

	static readonly localTimeZone: NSTimeZone;

	static readonly systemTimeZone: NSTimeZone;

	/**
	 * @since 4.0
	 */
	static readonly timeZoneDataVersion: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; });

	constructor(o: { name: string; data: NSData; });

	abbreviationForDate(aDate: Date): string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 2.0
	 */
	daylightSavingTimeOffsetForDate(aDate: Date): number;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithName(tzName: string): this;

	initWithNameData(tzName: string, aData: NSData): this;

	isDaylightSavingTimeForDate(aDate: Date): boolean;

	isEqualToTimeZone(aTimeZone: NSTimeZone): boolean;

	/**
	 * @since 2.0
	 */
	localizedNameLocale(style: NSTimeZoneNameStyle, locale: NSLocale): string;

	/**
	 * @since 2.0
	 */
	nextDaylightSavingTimeTransitionAfterDate(aDate: Date): Date;

	secondsFromGMTForDate(aDate: Date): number;
}

declare const enum NSTimeZoneNameStyle {

	Standard = 0,

	ShortStandard = 1,

	DaylightSaving = 2,

	ShortDaylightSaving = 3,

	Generic = 4,

	ShortGeneric = 5
}

declare class NSTimer extends NSObject {

	static alloc(): NSTimer; // inherited from NSObject

	static new(): NSTimer; // inherited from NSObject

	static scheduledTimerWithTimeIntervalInvocationRepeats(ti: number, invocation: NSInvocation, yesOrNo: boolean): NSTimer;

	/**
	 * @since 10.0
	 */
	static scheduledTimerWithTimeIntervalRepeatsBlock(interval: number, repeats: boolean, block: (p1: NSTimer) => void): NSTimer;

	static scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(ti: number, aTarget: any, aSelector: string, userInfo: any, yesOrNo: boolean): NSTimer;

	static timerWithTimeIntervalInvocationRepeats(ti: number, invocation: NSInvocation, yesOrNo: boolean): NSTimer;

	/**
	 * @since 10.0
	 */
	static timerWithTimeIntervalRepeatsBlock(interval: number, repeats: boolean, block: (p1: NSTimer) => void): NSTimer;

	static timerWithTimeIntervalTargetSelectorUserInfoRepeats(ti: number, aTarget: any, aSelector: string, userInfo: any, yesOrNo: boolean): NSTimer;

	fireDate: Date;

	readonly timeInterval: number;

	/**
	 * @since 7.0
	 */
	tolerance: number;

	readonly userInfo: any;

	readonly valid: boolean;

	/**
	 * @since 10.0
	 */
	constructor(o: { fireDate: Date; interval: number; repeats: boolean; block: (p1: NSTimer) => void; });

	constructor(o: { fireDate: Date; interval: number; target: any; selector: string; userInfo: any; repeats: boolean; });

	fire(): void;

	/**
	 * @since 10.0
	 */
	initWithFireDateIntervalRepeatsBlock(date: Date, interval: number, repeats: boolean, block: (p1: NSTimer) => void): this;

	initWithFireDateIntervalTargetSelectorUserInfoRepeats(date: Date, ti: number, t: any, s: string, ui: any, rep: boolean): this;

	invalidate(): void;
}

declare class NSURL extends NSObject implements NSCopying, NSItemProviderReading, NSItemProviderWriting, NSSecureCoding, QLPreviewItem {

	/**
	 * @since 8.0
	 */
	static URLByResolvingAliasFileAtURLOptionsError(url: NSURL, options: NSURLBookmarkResolutionOptions): NSURL;

	/**
	 * @since 4.0
	 */
	static URLByResolvingBookmarkDataOptionsRelativeToURLBookmarkDataIsStaleError(bookmarkData: NSData, options: NSURLBookmarkResolutionOptions, relativeURL: NSURL, isStale: interop.Pointer | interop.Reference<boolean>): NSURL;

	/**
	 * @since 9.0
	 */
	static URLWithDataRepresentationRelativeToURL(data: NSData, baseURL: NSURL): NSURL;

	static URLWithString(URLString: string): NSURL;

	/**
	 * @since 17.0
	 */
	static URLWithStringEncodingInvalidCharacters(URLString: string, encodingInvalidCharacters: boolean): NSURL;

	static URLWithStringRelativeToURL(URLString: string, baseURL: NSURL): NSURL;

	/**
	 * @since 9.0
	 */
	static absoluteURLWithDataRepresentationRelativeToURL(data: NSData, baseURL: NSURL): NSURL;

	static alloc(): NSURL; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static bookmarkDataWithContentsOfURLError(bookmarkFileURL: NSURL): NSData;

	/**
	 * @since 7.0
	 */
	static fileURLWithFileSystemRepresentationIsDirectoryRelativeToURL(path: string | interop.Pointer | interop.Reference<any>, isDir: boolean, baseURL: NSURL): NSURL;

	static fileURLWithPath(path: string): NSURL;

	/**
	 * @since 4.0
	 */
	static fileURLWithPathComponents(components: NSArray<string> | string[]): NSURL;

	/**
	 * @since 2.0
	 */
	static fileURLWithPathIsDirectory(path: string, isDir: boolean): NSURL;

	/**
	 * @since 9.0
	 */
	static fileURLWithPathIsDirectoryRelativeToURL(path: string, isDir: boolean, baseURL: NSURL): NSURL;

	/**
	 * @since 9.0
	 */
	static fileURLWithPathRelativeToURL(path: string, baseURL: NSURL): NSURL;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): NSURL; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSURL;

	/**
	 * @since 4.0
	 */
	static resourceValuesForKeysFromBookmarkData(keys: NSArray<string> | string[], bookmarkData: NSData): NSDictionary<string, any>;

	/**
	 * @since 4.0
	 */
	static writeBookmarkDataToURLOptionsError(bookmarkData: NSData, bookmarkFileURL: NSURL, options: number): boolean;

	/**
	 * @since 4.0
	 */
	readonly URLByDeletingLastPathComponent: NSURL;

	/**
	 * @since 4.0
	 */
	readonly URLByDeletingPathExtension: NSURL;

	/**
	 * @since 4.0
	 */
	readonly URLByResolvingSymlinksInPath: NSURL;

	/**
	 * @since 4.0
	 */
	readonly URLByStandardizingPath: NSURL;

	readonly absoluteString: string;

	readonly absoluteURL: NSURL;

	readonly baseURL: NSURL;

	/**
	 * @since 9.0
	 */
	readonly dataRepresentation: NSData;

	/**
	 * @since 4.0
	 */
	readonly filePathURL: NSURL;

	/**
	 * @since 7.0
	 */
	readonly fileSystemRepresentation: interop.Pointer | interop.Reference<any>;

	readonly fileURL: boolean;

	readonly fragment: string;

	/**
	 * @since 9.0
	 */
	readonly hasDirectoryPath: boolean;

	readonly host: string;

	/**
	 * @since 4.0
	 */
	readonly lastPathComponent: string;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly parameterString: string;

	readonly password: string;

	readonly path: string;

	/**
	 * @since 4.0
	 */
	readonly pathComponents: NSArray<string>;

	/**
	 * @since 4.0
	 */
	readonly pathExtension: string;

	readonly port: number;

	readonly query: string;

	readonly relativePath: string;

	readonly relativeString: string;

	readonly resourceSpecifier: string;

	readonly scheme: string;

	readonly standardizedURL: NSURL;

	readonly user: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly previewItemTitle: string; // inherited from QLPreviewItem

	readonly previewItemURL: NSURL; // inherited from QLPreviewItem

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	/**
	 * @since 9.0
	 */
	constructor(o: { absoluteURLWithDataRepresentation: NSData; relativeToURL: NSURL; });

	/**
	 * @since 4.0
	 */
	constructor(o: { byResolvingBookmarkData: NSData; options: NSURLBookmarkResolutionOptions; relativeToURL: NSURL; bookmarkDataIsStale: interop.Pointer | interop.Reference<boolean>; });

	/**
	 * @since 7.0
	 */
	constructor(o: { fileURLWithFileSystemRepresentation: string | interop.Pointer | interop.Reference<any>; isDirectory: boolean; relativeToURL: NSURL; });

	constructor(o: { fileURLWithPath: string; });

	/**
	 * @since 2.0
	 */
	constructor(o: { fileURLWithPath: string; isDirectory: boolean; });

	/**
	 * @since 9.0
	 */
	constructor(o: { fileURLWithPath: string; isDirectory: boolean; relativeToURL: NSURL; });

	/**
	 * @since 9.0
	 */
	constructor(o: { fileURLWithPath: string; relativeToURL: NSURL; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.0
	 */
	constructor(o: { dataRepresentation: NSData; relativeToURL: NSURL; });

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	constructor(o: { scheme: string; host: string; path: string; });

	constructor(o: { string: string; });

	/**
	 * @since 17.0
	 */
	constructor(o: { string: string; encodingInvalidCharacters: boolean; });

	constructor(o: { string: string; relativeToURL: NSURL; });

	/**
	 * @since 4.0
	 */
	URLByAppendingPathComponent(pathComponent: string): NSURL;

	/**
	 * @since 14.0
	 */
	URLByAppendingPathComponentConformingToType(partialName: string, contentType: UTType): NSURL;

	/**
	 * @since 5.0
	 */
	URLByAppendingPathComponentIsDirectory(pathComponent: string, isDirectory: boolean): NSURL;

	/**
	 * @since 4.0
	 */
	URLByAppendingPathExtension(pathExtension: string): NSURL;

	/**
	 * @since 14.0
	 */
	URLByAppendingPathExtensionForType(contentType: UTType): NSURL;

	/**
	 * @since 4.0
	 */
	bookmarkDataWithOptionsIncludingResourceValuesForKeysRelativeToURLError(options: NSURLBookmarkCreationOptions, keys: NSArray<string> | string[], relativeURL: NSURL): NSData;

	/**
	 * @since 8.0
	 */
	checkPromisedItemIsReachableAndReturnError(): boolean;

	/**
	 * @since 4.0
	 */
	checkResourceIsReachableAndReturnError(): boolean;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	fileReferenceURL(): NSURL;

	/**
	 * @since 7.0
	 */
	getFileSystemRepresentationMaxLength(buffer: string | interop.Pointer | interop.Reference<any>, maxBufferLength: number): boolean;

	/**
	 * @since 8.0
	 */
	getPromisedItemResourceValueForKeyError(value: interop.Pointer | interop.Reference<any>, key: string): boolean;

	/**
	 * @since 4.0
	 */
	getResourceValueForKeyError(value: interop.Pointer | interop.Reference<any>, key: string): boolean;

	/**
	 * @since 9.0
	 */
	initAbsoluteURLWithDataRepresentationRelativeToURL(data: NSData, baseURL: NSURL): this;

	/**
	 * @since 4.0
	 */
	initByResolvingBookmarkDataOptionsRelativeToURLBookmarkDataIsStaleError(bookmarkData: NSData, options: NSURLBookmarkResolutionOptions, relativeURL: NSURL, isStale: interop.Pointer | interop.Reference<boolean>): this;

	/**
	 * @since 7.0
	 */
	initFileURLWithFileSystemRepresentationIsDirectoryRelativeToURL(path: string | interop.Pointer | interop.Reference<any>, isDir: boolean, baseURL: NSURL): this;

	initFileURLWithPath(path: string): this;

	/**
	 * @since 2.0
	 */
	initFileURLWithPathIsDirectory(path: string, isDir: boolean): this;

	/**
	 * @since 9.0
	 */
	initFileURLWithPathIsDirectoryRelativeToURL(path: string, isDir: boolean, baseURL: NSURL): this;

	/**
	 * @since 9.0
	 */
	initFileURLWithPathRelativeToURL(path: string, baseURL: NSURL): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 9.0
	 */
	initWithDataRepresentationRelativeToURL(data: NSData, baseURL: NSURL): this;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	initWithSchemeHostPath(scheme: string, host: string, path: string): this;

	initWithString(URLString: string): this;

	/**
	 * @since 17.0
	 */
	initWithStringEncodingInvalidCharacters(URLString: string, encodingInvalidCharacters: boolean): this;

	initWithStringRelativeToURL(URLString: string, baseURL: NSURL): this;

	isEqual(object: any): boolean;

	/**
	 * @since 4.0
	 */
	isFileReferenceURL(): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 8.0
	 */
	promisedItemResourceValuesForKeysError(keys: NSArray<string> | string[]): NSDictionary<string, any>;

	/**
	 * @since 7.0
	 */
	removeAllCachedResourceValues(): void;

	/**
	 * @since 7.0
	 */
	removeCachedResourceValueForKey(key: string): void;

	/**
	 * @since 4.0
	 */
	resourceValuesForKeysError(keys: NSArray<string> | string[]): NSDictionary<string, any>;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setResourceValueForKeyError(value: any, key: string): boolean;

	/**
	 * @since 4.0
	 */
	setResourceValuesError(keyedValues: NSDictionary<string, any>): boolean;

	/**
	 * @since 7.0
	 */
	setTemporaryResourceValueForKey(value: any, key: string): void;

	/**
	 * @since 8.0
	 */
	startAccessingSecurityScopedResource(): boolean;

	/**
	 * @since 8.0
	 */
	stopAccessingSecurityScopedResource(): void;
}

/**
 * @since 8.0
 */
declare var NSURLAddedToDirectoryDateKey: string;

/**
 * @since 4.0
 */
declare var NSURLAttributeModificationDateKey: string;

/**
 * @since 2.0
 */
declare class NSURLAuthenticationChallenge extends NSObject implements NSSecureCoding {

	static alloc(): NSURLAuthenticationChallenge; // inherited from NSObject

	static new(): NSURLAuthenticationChallenge; // inherited from NSObject

	readonly error: NSError;

	readonly failureResponse: NSURLResponse;

	readonly previousFailureCount: number;

	readonly proposedCredential: NSURLCredential;

	readonly protectionSpace: NSURLProtectionSpace;

	readonly sender: NSURLAuthenticationChallengeSender;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { authenticationChallenge: NSURLAuthenticationChallenge; sender: NSURLAuthenticationChallengeSender; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { protectionSpace: NSURLProtectionSpace; proposedCredential: NSURLCredential; previousFailureCount: number; failureResponse: NSURLResponse; error: NSError; sender: NSURLAuthenticationChallengeSender; });

	encodeWithCoder(coder: NSCoder): void;

	initWithAuthenticationChallengeSender(challenge: NSURLAuthenticationChallenge, sender: NSURLAuthenticationChallengeSender): this;

	initWithCoder(coder: NSCoder): this;

	initWithProtectionSpaceProposedCredentialPreviousFailureCountFailureResponseErrorSender(space: NSURLProtectionSpace, credential: NSURLCredential, previousFailureCount: number, response: NSURLResponse, error: NSError, sender: NSURLAuthenticationChallengeSender): this;
}

/**
 * @since 2.0
 */
interface NSURLAuthenticationChallengeSender extends NSObjectProtocol {

	cancelAuthenticationChallenge(challenge: NSURLAuthenticationChallenge): void;

	continueWithoutCredentialForAuthenticationChallenge(challenge: NSURLAuthenticationChallenge): void;

	performDefaultHandlingForAuthenticationChallenge?(challenge: NSURLAuthenticationChallenge): void;

	rejectProtectionSpaceAndContinueWithChallenge?(challenge: NSURLAuthenticationChallenge): void;

	useCredentialForAuthenticationChallenge(credential: NSURLCredential, challenge: NSURLAuthenticationChallenge): void;
}
declare var NSURLAuthenticationChallengeSender: {

	prototype: NSURLAuthenticationChallengeSender;
};

/**
 * @since 3.0
 */
declare var NSURLAuthenticationMethodClientCertificate: string;

/**
 * @since 2.0
 */
declare var NSURLAuthenticationMethodDefault: string;

/**
 * @since 2.0
 */
declare var NSURLAuthenticationMethodHTMLForm: string;

/**
 * @since 2.0
 */
declare var NSURLAuthenticationMethodHTTPBasic: string;

/**
 * @since 2.0
 */
declare var NSURLAuthenticationMethodHTTPDigest: string;

/**
 * @since 2.0
 */
declare var NSURLAuthenticationMethodNTLM: string;

/**
 * @since 2.0
 */
declare var NSURLAuthenticationMethodNegotiate: string;

/**
 * @since 3.0
 */
declare var NSURLAuthenticationMethodServerTrust: string;

/**
 * @since 4.0
 */
declare const enum NSURLBookmarkCreationOptions {

	PreferFileIDResolution = 256,

	MinimalBookmark = 512,

	SuitableForBookmarkFile = 1024,

	WithSecurityScope = 2048,

	SecurityScopeAllowOnlyReadAccess = 4096,

	WithoutImplicitSecurityScope = 536870912
}

/**
 * @since 4.0
 */
declare const enum NSURLBookmarkResolutionOptions {

	WithoutUI = 256,

	WithoutMounting = 512,

	WithSecurityScope = 1024,

	WithoutImplicitStartAccessing = 32768
}

/**
 * @since 2.0
 */
declare class NSURLCache extends NSObject {

	static alloc(): NSURLCache; // inherited from NSObject

	static new(): NSURLCache; // inherited from NSObject

	readonly currentDiskUsage: number;

	readonly currentMemoryUsage: number;

	diskCapacity: number;

	memoryCapacity: number;

	static sharedURLCache: NSURLCache;

	/**
	 * @since 13.0
	 */
	constructor(o: { memoryCapacity: number; diskCapacity: number; directoryURL: NSURL; });

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	constructor(o: { memoryCapacity: number; diskCapacity: number; diskPath: string; });

	cachedResponseForRequest(request: NSURLRequest): NSCachedURLResponse;

	/**
	 * @since 8.0
	 */
	getCachedResponseForDataTaskCompletionHandler(dataTask: NSURLSessionDataTask, completionHandler: (p1: NSCachedURLResponse) => void): void;

	/**
	 * @since 13.0
	 */
	initWithMemoryCapacityDiskCapacityDirectoryURL(memoryCapacity: number, diskCapacity: number, directoryURL: NSURL): this;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	initWithMemoryCapacityDiskCapacityDiskPath(memoryCapacity: number, diskCapacity: number, path: string): this;

	removeAllCachedResponses(): void;

	/**
	 * @since 8.0
	 */
	removeCachedResponseForDataTask(dataTask: NSURLSessionDataTask): void;

	removeCachedResponseForRequest(request: NSURLRequest): void;

	/**
	 * @since 8.0
	 */
	removeCachedResponsesSinceDate(date: Date): void;

	/**
	 * @since 8.0
	 */
	storeCachedResponseForDataTask(cachedResponse: NSCachedURLResponse, dataTask: NSURLSessionDataTask): void;

	storeCachedResponseForRequest(cachedResponse: NSCachedURLResponse, request: NSURLRequest): void;
}

declare const enum NSURLCacheStoragePolicy {

	Allowed = 0,

	AllowedInMemoryOnly = 1,

	NotAllowed = 2
}

/**
 * @since 10.0
 */
declare var NSURLCanonicalPathKey: string;

/**
 * @since 7.0
 */
declare class NSURLComponents extends NSObject implements NSCopying {

	static alloc(): NSURLComponents; // inherited from NSObject

	static componentsWithString(URLString: string): NSURLComponents;

	/**
	 * @since 17.0
	 */
	static componentsWithStringEncodingInvalidCharacters(URLString: string, encodingInvalidCharacters: boolean): NSURLComponents;

	static componentsWithURLResolvingAgainstBaseURL(url: NSURL, resolve: boolean): NSURLComponents;

	static new(): NSURLComponents; // inherited from NSObject

	readonly URL: NSURL;

	/**
	 * @since 16.0
	 */
	encodedHost: string;

	fragment: string;

	host: string;

	password: string;

	path: string;

	percentEncodedFragment: string;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	percentEncodedHost: string;

	percentEncodedPassword: string;

	percentEncodedPath: string;

	percentEncodedQuery: string;

	/**
	 * @since 11.0
	 */
	percentEncodedQueryItems: NSArray<NSURLQueryItem>;

	percentEncodedUser: string;

	port: number;

	query: string;

	/**
	 * @since 8.0
	 */
	queryItems: NSArray<NSURLQueryItem>;

	/**
	 * @since 9.0
	 */
	readonly rangeOfFragment: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfHost: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfPassword: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfPath: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfPort: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfQuery: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfScheme: NSRange;

	/**
	 * @since 9.0
	 */
	readonly rangeOfUser: NSRange;

	scheme: string;

	/**
	 * @since 8.0
	 */
	readonly string: string;

	user: string;

	constructor(o: { string: string; });

	/**
	 * @since 17.0
	 */
	constructor(o: { string: string; encodingInvalidCharacters: boolean; });

	constructor(o: { URL: NSURL; resolvingAgainstBaseURL: boolean; });

	URLRelativeToURL(baseURL: NSURL): NSURL;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithString(URLString: string): this;

	/**
	 * @since 17.0
	 */
	initWithStringEncodingInvalidCharacters(URLString: string, encodingInvalidCharacters: boolean): this;

	initWithURLResolvingAgainstBaseURL(url: NSURL, resolve: boolean): this;
}

/**
 * @since 2.0
 */
declare class NSURLConnection extends NSObject {

	static alloc(): NSURLConnection; // inherited from NSObject

	static canHandleRequest(request: NSURLRequest): boolean;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	static connectionWithRequestDelegate(request: NSURLRequest, delegate: any): NSURLConnection;

	static new(): NSURLConnection; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static sendAsynchronousRequestQueueCompletionHandler(request: NSURLRequest, queue: NSOperationQueue, handler: (p1: NSURLResponse, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	static sendSynchronousRequestReturningResponseError(request: NSURLRequest, response: interop.Pointer | interop.Reference<NSURLResponse>): NSData;

	/**
	 * @since 5.0
	 */
	readonly currentRequest: NSURLRequest;

	/**
	 * @since 5.0
	 */
	readonly originalRequest: NSURLRequest;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	constructor(o: { request: NSURLRequest; delegate: any; });

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	constructor(o: { request: NSURLRequest; delegate: any; startImmediately: boolean; });

	cancel(): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	initWithRequestDelegate(request: NSURLRequest, delegate: any): this;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	initWithRequestDelegateStartImmediately(request: NSURLRequest, delegate: any, startImmediately: boolean): this;

	/**
	 * @since 2.0
	 */
	scheduleInRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;

	/**
	 * @since 5.0
	 */
	setDelegateQueue(queue: NSOperationQueue): void;

	/**
	 * @since 2.0
	 */
	start(): void;

	/**
	 * @since 2.0
	 */
	unscheduleFromRunLoopForMode(aRunLoop: NSRunLoop, mode: string): void;
}

/**
 * @since 2.0
 */
interface NSURLConnectionDataDelegate extends NSURLConnectionDelegate {

	connectionDidFinishLoading?(connection: NSURLConnection): void;

	connectionDidReceiveData?(connection: NSURLConnection, data: NSData): void;

	connectionDidReceiveResponse?(connection: NSURLConnection, response: NSURLResponse): void;

	connectionDidSendBodyDataTotalBytesWrittenTotalBytesExpectedToWrite?(connection: NSURLConnection, bytesWritten: number, totalBytesWritten: number, totalBytesExpectedToWrite: number): void;

	connectionNeedNewBodyStream?(connection: NSURLConnection, request: NSURLRequest): NSInputStream;

	connectionWillCacheResponse?(connection: NSURLConnection, cachedResponse: NSCachedURLResponse): NSCachedURLResponse;

	connectionWillSendRequestRedirectResponse?(connection: NSURLConnection, request: NSURLRequest, response: NSURLResponse): NSURLRequest;
}
declare var NSURLConnectionDataDelegate: {

	prototype: NSURLConnectionDataDelegate;
};

/**
 * @since 2.0
 */
interface NSURLConnectionDelegate extends NSObjectProtocol {

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	connectionCanAuthenticateAgainstProtectionSpace?(connection: NSURLConnection, protectionSpace: NSURLProtectionSpace): boolean;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	connectionDidCancelAuthenticationChallenge?(connection: NSURLConnection, challenge: NSURLAuthenticationChallenge): void;

	connectionDidFailWithError?(connection: NSURLConnection, error: NSError): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	connectionDidReceiveAuthenticationChallenge?(connection: NSURLConnection, challenge: NSURLAuthenticationChallenge): void;

	connectionShouldUseCredentialStorage?(connection: NSURLConnection): boolean;

	connectionWillSendRequestForAuthenticationChallenge?(connection: NSURLConnection, challenge: NSURLAuthenticationChallenge): void;
}
declare var NSURLConnectionDelegate: {

	prototype: NSURLConnectionDelegate;
};

/**
 * @since 2.0
 */
interface NSURLConnectionDownloadDelegate extends NSURLConnectionDelegate {

	connectionDidFinishDownloadingDestinationURL(connection: NSURLConnection, destinationURL: NSURL): void;

	connectionDidResumeDownloadingTotalBytesWrittenExpectedTotalBytes?(connection: NSURLConnection, totalBytesWritten: number, expectedTotalBytes: number): void;

	connectionDidWriteDataTotalBytesWrittenExpectedTotalBytes?(connection: NSURLConnection, bytesWritten: number, totalBytesWritten: number, expectedTotalBytes: number): void;
}
declare var NSURLConnectionDownloadDelegate: {

	prototype: NSURLConnectionDownloadDelegate;
};

/**
 * @since 4.0
 */
declare var NSURLContentAccessDateKey: string;

/**
 * @since 4.0
 */
declare var NSURLContentModificationDateKey: string;

/**
 * @since 14.0
 */
declare var NSURLContentTypeKey: string;

/**
 * @since 4.0
 */
declare var NSURLCreationDateKey: string;

/**
 * @since 2.0
 */
declare class NSURLCredential extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSURLCredential; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	static credentialForTrust(trust: any): NSURLCredential;

	/**
	 * @since 3.0
	 */
	static credentialWithIdentityCertificatesPersistence(identity: any, certArray: NSArray<any> | any[], persistence: NSURLCredentialPersistence): NSURLCredential;

	static credentialWithUserPasswordPersistence(user: string, password: string, persistence: NSURLCredentialPersistence): NSURLCredential;

	static new(): NSURLCredential; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	readonly certificates: NSArray<any>;

	readonly hasPassword: boolean;

	readonly identity: any;

	readonly password: string;

	readonly persistence: NSURLCredentialPersistence;

	readonly user: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 3.0
	 */
	constructor(o: { identity: any; certificates: NSArray<any> | any[]; persistence: NSURLCredentialPersistence; });

	/**
	 * @since 3.0
	 */
	constructor(o: { trust: any; });

	constructor(o: { user: string; password: string; persistence: NSURLCredentialPersistence; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 3.0
	 */
	initWithIdentityCertificatesPersistence(identity: any, certArray: NSArray<any> | any[], persistence: NSURLCredentialPersistence): this;

	/**
	 * @since 3.0
	 */
	initWithTrust(trust: any): this;

	initWithUserPasswordPersistence(user: string, password: string, persistence: NSURLCredentialPersistence): this;
}

declare const enum NSURLCredentialPersistence {

	None = 0,

	ForSession = 1,

	Permanent = 2,

	Synchronizable = 3
}

/**
 * @since 2.0
 */
declare class NSURLCredentialStorage extends NSObject {

	static alloc(): NSURLCredentialStorage; // inherited from NSObject

	static new(): NSURLCredentialStorage; // inherited from NSObject

	readonly allCredentials: NSDictionary<NSURLProtectionSpace, NSDictionary<string, NSURLCredential>>;

	static readonly sharedCredentialStorage: NSURLCredentialStorage;

	credentialsForProtectionSpace(space: NSURLProtectionSpace): NSDictionary<string, NSURLCredential>;

	defaultCredentialForProtectionSpace(space: NSURLProtectionSpace): NSURLCredential;

	/**
	 * @since 8.0
	 */
	getCredentialsForProtectionSpaceTaskCompletionHandler(protectionSpace: NSURLProtectionSpace, task: NSURLSessionTask, completionHandler: (p1: NSDictionary<string, NSURLCredential>) => void): void;

	/**
	 * @since 8.0
	 */
	getDefaultCredentialForProtectionSpaceTaskCompletionHandler(space: NSURLProtectionSpace, task: NSURLSessionTask, completionHandler: (p1: NSURLCredential) => void): void;

	removeCredentialForProtectionSpace(credential: NSURLCredential, space: NSURLProtectionSpace): void;

	/**
	 * @since 7.0
	 */
	removeCredentialForProtectionSpaceOptions(credential: NSURLCredential, space: NSURLProtectionSpace, options: NSDictionary<string, any>): void;

	/**
	 * @since 8.0
	 */
	removeCredentialForProtectionSpaceOptionsTask(credential: NSURLCredential, protectionSpace: NSURLProtectionSpace, options: NSDictionary<string, any>, task: NSURLSessionTask): void;

	setCredentialForProtectionSpace(credential: NSURLCredential, space: NSURLProtectionSpace): void;

	/**
	 * @since 8.0
	 */
	setCredentialForProtectionSpaceTask(credential: NSURLCredential, protectionSpace: NSURLProtectionSpace, task: NSURLSessionTask): void;

	setDefaultCredentialForProtectionSpace(credential: NSURLCredential, space: NSURLProtectionSpace): void;

	/**
	 * @since 8.0
	 */
	setDefaultCredentialForProtectionSpaceTask(credential: NSURLCredential, protectionSpace: NSURLProtectionSpace, task: NSURLSessionTask): void;
}

/**
 * @since 2.0
 */
declare var NSURLCredentialStorageChangedNotification: string;

/**
 * @since 7.0
 */
declare var NSURLCredentialStorageRemoveSynchronizableCredentials: string;

/**
 * @since 4.0
 */
declare var NSURLCustomIconKey: string;

/**
 * @since 17.0
 */
declare var NSURLDirectoryEntryCountKey: string;

/**
 * @since 8.0
 */
declare var NSURLDocumentIdentifierKey: string;

/**
 * @since 4.0
 */
declare var NSURLEffectiveIconKey: string;

declare const NSURLErrorAppTransportSecurityRequiresSecureConnection: number;

declare const NSURLErrorBackgroundSessionInUseByAnotherProcess: number;

declare const NSURLErrorBackgroundSessionRequiresSharedContainer: number;

declare const NSURLErrorBackgroundSessionWasDisconnected: number;

/**
 * @since 8.0
 */
declare var NSURLErrorBackgroundTaskCancelledReasonKey: string;

declare const NSURLErrorBadServerResponse: number;

declare const NSURLErrorBadURL: number;

declare const NSURLErrorCallIsActive: number;

declare const NSURLErrorCancelled: number;

declare const NSURLErrorCancelledReasonBackgroundUpdatesDisabled: number;

declare const NSURLErrorCancelledReasonInsufficientSystemResources: number;

declare const NSURLErrorCancelledReasonUserForceQuitApplication: number;

declare const NSURLErrorCannotCloseFile: number;

declare const NSURLErrorCannotConnectToHost: number;

declare const NSURLErrorCannotCreateFile: number;

declare const NSURLErrorCannotDecodeContentData: number;

declare const NSURLErrorCannotDecodeRawData: number;

declare const NSURLErrorCannotFindHost: number;

declare const NSURLErrorCannotLoadFromNetwork: number;

declare const NSURLErrorCannotMoveFile: number;

declare const NSURLErrorCannotOpenFile: number;

declare const NSURLErrorCannotParseResponse: number;

declare const NSURLErrorCannotRemoveFile: number;

declare const NSURLErrorCannotWriteToFile: number;

declare const NSURLErrorClientCertificateRejected: number;

declare const NSURLErrorClientCertificateRequired: number;

declare const NSURLErrorDNSLookupFailed: number;

declare const NSURLErrorDataLengthExceedsMaximum: number;

declare const NSURLErrorDataNotAllowed: number;

declare var NSURLErrorDomain: string;

declare const NSURLErrorDownloadDecodingFailedMidStream: number;

declare const NSURLErrorDownloadDecodingFailedToComplete: number;

/**
 * @since 4.0
 */
declare var NSURLErrorFailingURLErrorKey: string;

/**
 * @since 4.0
 */
declare var NSURLErrorFailingURLPeerTrustErrorKey: string;

/**
 * @since 4.0
 */
declare var NSURLErrorFailingURLStringErrorKey: string;

declare const NSURLErrorFileDoesNotExist: number;

declare const NSURLErrorFileIsDirectory: number;

declare const NSURLErrorFileOutsideSafeArea: number;

declare const NSURLErrorHTTPTooManyRedirects: number;

declare const NSURLErrorInternationalRoamingOff: number;

declare var NSURLErrorKey: string;

declare const NSURLErrorNetworkConnectionLost: number;

/**
 * @since 13.0
 */
declare const enum NSURLErrorNetworkUnavailableReason {

	Cellular = 0,

	Expensive = 1,

	Constrained = 2
}

/**
 * @since 13.0
 */
declare var NSURLErrorNetworkUnavailableReasonKey: string;

declare const NSURLErrorNoPermissionsToReadFile: number;

declare const NSURLErrorNotConnectedToInternet: number;

declare const NSURLErrorRedirectToNonExistentLocation: number;

declare const NSURLErrorRequestBodyStreamExhausted: number;

declare const NSURLErrorResourceUnavailable: number;

declare const NSURLErrorSecureConnectionFailed: number;

declare const NSURLErrorServerCertificateHasBadDate: number;

declare const NSURLErrorServerCertificateHasUnknownRoot: number;

declare const NSURLErrorServerCertificateNotYetValid: number;

declare const NSURLErrorServerCertificateUntrusted: number;

declare const NSURLErrorTimedOut: number;

declare const NSURLErrorUnknown: number;

declare const NSURLErrorUnsupportedURL: number;

declare const NSURLErrorUserAuthenticationRequired: number;

declare const NSURLErrorUserCancelledAuthentication: number;

declare const NSURLErrorZeroByteResource: number;

/**
 * @since 4.0
 */
declare var NSURLFileAllocatedSizeKey: string;

/**
 * @since 14.0
 */
declare var NSURLFileContentIdentifierKey: string;

/**
 * @since 16.4
 */
declare var NSURLFileIdentifierKey: string;

/**
 * @since 9.0
 */
declare var NSURLFileProtectionComplete: string;

/**
 * @since 9.0
 */
declare var NSURLFileProtectionCompleteUnlessOpen: string;

/**
 * @since 9.0
 */
declare var NSURLFileProtectionCompleteUntilFirstUserAuthentication: string;

/**
 * @since 17.0
 */
declare var NSURLFileProtectionCompleteWhenUserInactive: string;

/**
 * @since 9.0
 */
declare var NSURLFileProtectionKey: string;

/**
 * @since 9.0
 */
declare var NSURLFileProtectionNone: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceIdentifierKey: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeBlockSpecial: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeCharacterSpecial: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeDirectory: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeKey: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeNamedPipe: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeRegular: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeSocket: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeSymbolicLink: string;

/**
 * @since 5.0
 */
declare var NSURLFileResourceTypeUnknown: string;

declare var NSURLFileScheme: string;

/**
 * @since 5.0
 */
declare var NSURLFileSecurityKey: string;

/**
 * @since 4.0
 */
declare var NSURLFileSizeKey: string;

/**
 * @since 8.0
 */
declare var NSURLGenerationIdentifierKey: string;

/**
 * @since 4.0
 */
declare var NSURLHasHiddenExtensionKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsAliasFileKey: string;

/**
 * @since 9.0
 */
declare var NSURLIsApplicationKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsDirectoryKey: string;

/**
 * @since 5.1
 */
declare var NSURLIsExcludedFromBackupKey: string;

/**
 * @since 5.0
 */
declare var NSURLIsExecutableKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsHiddenKey: string;

/**
 * @since 5.0
 */
declare var NSURLIsMountTriggerKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsPackageKey: string;

/**
 * @since 14.0
 */
declare var NSURLIsPurgeableKey: string;

/**
 * @since 5.0
 */
declare var NSURLIsReadableKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsRegularFileKey: string;

/**
 * @since 14.0
 */
declare var NSURLIsSparseKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsSymbolicLinkKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsSystemImmutableKey: string;

/**
 * @since 5.0
 */
declare var NSURLIsUbiquitousItemKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsUserImmutableKey: string;

/**
 * @since 4.0
 */
declare var NSURLIsVolumeKey: string;

/**
 * @since 5.0
 */
declare var NSURLIsWritableKey: string;

/**
 * @since 5.0
 */
declare var NSURLKeysOfUnsetValuesKey: string;

/**
 * @since 4.0
 */
declare var NSURLLabelColorKey: string;

/**
 * @since 4.0
 */
declare var NSURLLabelNumberKey: string;

/**
 * @since 4.0
 */
declare var NSURLLinkCountKey: string;

/**
 * @since 4.0
 */
declare var NSURLLocalizedLabelKey: string;

/**
 * @since 4.0
 */
declare var NSURLLocalizedNameKey: string;

/**
 * @since 4.0
 */
declare var NSURLLocalizedTypeDescriptionKey: string;

/**
 * @since 14.0
 */
declare var NSURLMayHaveExtendedAttributesKey: string;

/**
 * @since 14.0
 */
declare var NSURLMayShareFileContentKey: string;

/**
 * @since 4.0
 */
declare var NSURLNameKey: string;

/**
 * @since 4.0
 */
declare var NSURLParentDirectoryURLKey: string;

/**
 * @since 6.0
 */
declare var NSURLPathKey: string;

/**
 * @since 5.0
 */
declare var NSURLPreferredIOBlockSizeKey: string;

/**
 * @since 2.0
 */
declare class NSURLProtectionSpace extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSURLProtectionSpace; // inherited from NSObject

	static new(): NSURLProtectionSpace; // inherited from NSObject

	readonly authenticationMethod: string;

	/**
	 * @since 3.0
	 */
	readonly distinguishedNames: NSArray<NSData>;

	readonly host: string;

	readonly isProxy: boolean;

	readonly port: number;

	readonly protocol: string;

	readonly proxyType: string;

	readonly realm: string;

	readonly receivesCredentialSecurely: boolean;

	/**
	 * @since 3.0
	 */
	readonly serverTrust: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { host: string; port: number; protocol: string; realm: string; authenticationMethod: string; });

	constructor(o: { proxyHost: string; port: number; type: string; realm: string; authenticationMethod: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHostPortProtocolRealmAuthenticationMethod(host: string, port: number, protocol: string, realm: string, authenticationMethod: string): this;

	initWithProxyHostPortTypeRealmAuthenticationMethod(host: string, port: number, type: string, realm: string, authenticationMethod: string): this;
}

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceFTP: string;

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceFTPProxy: string;

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceHTTP: string;

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceHTTPProxy: string;

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceHTTPS: string;

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceHTTPSProxy: string;

/**
 * @since 2.0
 */
declare var NSURLProtectionSpaceSOCKSProxy: string;

/**
 * @since 2.0
 */
declare class NSURLProtocol extends NSObject {

	static alloc(): NSURLProtocol; // inherited from NSObject

	static canInitWithRequest(request: NSURLRequest): boolean;

	/**
	 * @since 8.0
	 */
	static canInitWithTask(task: NSURLSessionTask): boolean;

	static canonicalRequestForRequest(request: NSURLRequest): NSURLRequest;

	static new(): NSURLProtocol; // inherited from NSObject

	static propertyForKeyInRequest(key: string, request: NSURLRequest): any;

	static registerClass(protocolClass: typeof NSObject): boolean;

	static removePropertyForKeyInRequest(key: string, request: NSMutableURLRequest): void;

	static requestIsCacheEquivalentToRequest(a: NSURLRequest, b: NSURLRequest): boolean;

	static setPropertyForKeyInRequest(value: any, key: string, request: NSMutableURLRequest): void;

	static unregisterClass(protocolClass: typeof NSObject): void;

	readonly cachedResponse: NSCachedURLResponse;

	readonly client: NSURLProtocolClient;

	readonly request: NSURLRequest;

	/**
	 * @since 8.0
	 */
	readonly task: NSURLSessionTask;

	constructor(o: { request: NSURLRequest; cachedResponse: NSCachedURLResponse; client: NSURLProtocolClient; });

	/**
	 * @since 8.0
	 */
	constructor(o: { task: NSURLSessionTask; cachedResponse: NSCachedURLResponse; client: NSURLProtocolClient; });

	initWithRequestCachedResponseClient(request: NSURLRequest, cachedResponse: NSCachedURLResponse, client: NSURLProtocolClient): this;

	/**
	 * @since 8.0
	 */
	initWithTaskCachedResponseClient(task: NSURLSessionTask, cachedResponse: NSCachedURLResponse, client: NSURLProtocolClient): this;

	startLoading(): void;

	stopLoading(): void;
}

/**
 * @since 2.0
 */
interface NSURLProtocolClient extends NSObjectProtocol {

	URLProtocolCachedResponseIsValid(protocol: NSURLProtocol, cachedResponse: NSCachedURLResponse): void;

	URLProtocolDidCancelAuthenticationChallenge(protocol: NSURLProtocol, challenge: NSURLAuthenticationChallenge): void;

	URLProtocolDidFailWithError(protocol: NSURLProtocol, error: NSError): void;

	URLProtocolDidFinishLoading(protocol: NSURLProtocol): void;

	URLProtocolDidLoadData(protocol: NSURLProtocol, data: NSData): void;

	URLProtocolDidReceiveAuthenticationChallenge(protocol: NSURLProtocol, challenge: NSURLAuthenticationChallenge): void;

	URLProtocolDidReceiveResponseCacheStoragePolicy(protocol: NSURLProtocol, response: NSURLResponse, policy: NSURLCacheStoragePolicy): void;

	URLProtocolWasRedirectedToRequestRedirectResponse(protocol: NSURLProtocol, request: NSURLRequest, redirectResponse: NSURLResponse): void;
}
declare var NSURLProtocolClient: {

	prototype: NSURLProtocolClient;
};

/**
 * @since 8.0
 */
declare class NSURLQueryItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSURLQueryItem; // inherited from NSObject

	static new(): NSURLQueryItem; // inherited from NSObject

	static queryItemWithNameValue(name: string, value: string): NSURLQueryItem;

	readonly name: string;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; value: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameValue(name: string, value: string): this;
}

/**
 * @since 8.0
 */
declare const enum NSURLRelationship {

	Contains = 0,

	Same = 1,

	Other = 2
}

/**
 * @since 2.0
 */
declare class NSURLRequest extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSURLRequest; // inherited from NSObject

	static new(): NSURLRequest; // inherited from NSObject

	static requestWithURL(URL: NSURL): NSURLRequest;

	static requestWithURLCachePolicyTimeoutInterval(URL: NSURL, cachePolicy: NSURLRequestCachePolicy, timeoutInterval: number): NSURLRequest;

	readonly HTTPBody: NSData;

	readonly HTTPBodyStream: NSInputStream;

	readonly HTTPMethod: string;

	readonly HTTPShouldHandleCookies: boolean;

	/**
	 * @since 4.0
	 */
	readonly HTTPShouldUsePipelining: boolean;

	readonly URL: NSURL;

	readonly allHTTPHeaderFields: NSDictionary<string, string>;

	/**
	 * @since 6.0
	 */
	readonly allowsCellularAccess: boolean;

	/**
	 * @since 13.0
	 */
	readonly allowsConstrainedNetworkAccess: boolean;

	/**
	 * @since 13.0
	 */
	readonly allowsExpensiveNetworkAccess: boolean;

	/**
	 * @since 18.0
	 */
	readonly allowsPersistentDNS: boolean;

	/**
	 * @since 14.5
	 */
	readonly assumesHTTP3Capable: boolean;

	/**
	 * @since 15.0
	 */
	readonly attribution: NSURLRequestAttribution;

	readonly cachePolicy: NSURLRequestCachePolicy;

	readonly mainDocumentURL: NSURL;

	/**
	 * @since 4.0
	 */
	readonly networkServiceType: NSURLRequestNetworkServiceType;

	/**
	 * @since 16.1
	 */
	readonly requiresDNSSECValidation: boolean;

	readonly timeoutInterval: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; cachePolicy: NSURLRequestCachePolicy; timeoutInterval: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithURL(URL: NSURL): this;

	initWithURLCachePolicyTimeoutInterval(URL: NSURL, cachePolicy: NSURLRequestCachePolicy, timeoutInterval: number): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	valueForHTTPHeaderField(field: string): string;
}

/**
 * @since 15.0
 */
declare const enum NSURLRequestAttribution {

	Developer = 0,

	User = 1
}

declare const enum NSURLRequestCachePolicy {

	UseProtocolCachePolicy = 0,

	ReloadIgnoringLocalCacheData = 1,

	ReloadIgnoringLocalAndRemoteCacheData = 4,

	ReloadIgnoringCacheData = 1,

	ReturnCacheDataElseLoad = 2,

	ReturnCacheDataDontLoad = 3,

	ReloadRevalidatingCacheData = 5
}

declare const enum NSURLRequestNetworkServiceType {

	NetworkServiceTypeDefault = 0,

	NetworkServiceTypeVoIP = 1,

	NetworkServiceTypeVideo = 2,

	NetworkServiceTypeBackground = 3,

	NetworkServiceTypeVoice = 4,

	NetworkServiceTypeResponsiveData = 6,

	NetworkServiceTypeAVStreaming = 8,

	NetworkServiceTypeResponsiveAV = 9,

	NetworkServiceTypeCallSignaling = 11
}

/**
 * @since 2.0
 */
declare class NSURLResponse extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSURLResponse; // inherited from NSObject

	static new(): NSURLResponse; // inherited from NSObject

	readonly MIMEType: string;

	readonly URL: NSURL;

	readonly expectedContentLength: number;

	readonly suggestedFilename: string;

	readonly textEncodingName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { URL: NSURL; MIMEType: string; expectedContentLength: number; textEncodingName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithURLMIMETypeExpectedContentLengthTextEncodingName(URL: NSURL, MIMEType: string, length: number, name: string): this;
}

/**
 * @since 7.0
 */
declare class NSURLSession extends NSObject {

	static alloc(): NSURLSession; // inherited from NSObject

	static new(): NSURLSession; // inherited from NSObject

	static sessionWithConfiguration(configuration: NSURLSessionConfiguration): NSURLSession;

	static sessionWithConfigurationDelegateDelegateQueue(configuration: NSURLSessionConfiguration, delegate: NSURLSessionDelegate, queue: NSOperationQueue): NSURLSession;

	readonly configuration: NSURLSessionConfiguration;

	readonly delegate: NSURLSessionDelegate;

	readonly delegateQueue: NSOperationQueue;

	sessionDescription: string;

	static readonly sharedSession: NSURLSession;

	dataTaskWithRequest(request: NSURLRequest): NSURLSessionDataTask;

	dataTaskWithRequestCompletionHandler(request: NSURLRequest, completionHandler: (p1: NSData, p2: NSURLResponse, p3: NSError) => void): NSURLSessionDataTask;

	dataTaskWithURL(url: NSURL): NSURLSessionDataTask;

	dataTaskWithURLCompletionHandler(url: NSURL, completionHandler: (p1: NSData, p2: NSURLResponse, p3: NSError) => void): NSURLSessionDataTask;

	downloadTaskWithRequest(request: NSURLRequest): NSURLSessionDownloadTask;

	downloadTaskWithRequestCompletionHandler(request: NSURLRequest, completionHandler: (p1: NSURL, p2: NSURLResponse, p3: NSError) => void): NSURLSessionDownloadTask;

	downloadTaskWithResumeData(resumeData: NSData): NSURLSessionDownloadTask;

	downloadTaskWithResumeDataCompletionHandler(resumeData: NSData, completionHandler: (p1: NSURL, p2: NSURLResponse, p3: NSError) => void): NSURLSessionDownloadTask;

	downloadTaskWithURL(url: NSURL): NSURLSessionDownloadTask;

	downloadTaskWithURLCompletionHandler(url: NSURL, completionHandler: (p1: NSURL, p2: NSURLResponse, p3: NSError) => void): NSURLSessionDownloadTask;

	finishTasksAndInvalidate(): void;

	flushWithCompletionHandler(completionHandler: () => void): void;

	/**
	 * @since 9.0
	 */
	getAllTasksWithCompletionHandler(completionHandler: (p1: NSArray<NSURLSessionTask>) => void): void;

	getTasksWithCompletionHandler(completionHandler: (p1: NSArray<NSURLSessionDataTask>, p2: NSArray<NSURLSessionUploadTask>, p3: NSArray<NSURLSessionDownloadTask>) => void): void;

	invalidateAndCancel(): void;

	resetWithCompletionHandler(completionHandler: () => void): void;

	/**
	 * @since 9.0
	 */
	streamTaskWithHostNamePort(hostname: string, port: number): NSURLSessionStreamTask;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	streamTaskWithNetService(service: NSNetService): NSURLSessionStreamTask;

	uploadTaskWithRequestFromData(request: NSURLRequest, bodyData: NSData): NSURLSessionUploadTask;

	uploadTaskWithRequestFromDataCompletionHandler(request: NSURLRequest, bodyData: NSData, completionHandler: (p1: NSData, p2: NSURLResponse, p3: NSError) => void): NSURLSessionUploadTask;

	uploadTaskWithRequestFromFile(request: NSURLRequest, fileURL: NSURL): NSURLSessionUploadTask;

	uploadTaskWithRequestFromFileCompletionHandler(request: NSURLRequest, fileURL: NSURL, completionHandler: (p1: NSData, p2: NSURLResponse, p3: NSError) => void): NSURLSessionUploadTask;

	/**
	 * @since 17.0
	 */
	uploadTaskWithResumeData(resumeData: NSData): NSURLSessionUploadTask;

	/**
	 * @since 17.0
	 */
	uploadTaskWithResumeDataCompletionHandler(resumeData: NSData, completionHandler: (p1: NSData, p2: NSURLResponse, p3: NSError) => void): NSURLSessionUploadTask;

	uploadTaskWithStreamedRequest(request: NSURLRequest): NSURLSessionUploadTask;

	/**
	 * @since 13.0
	 */
	webSocketTaskWithRequest(request: NSURLRequest): NSURLSessionWebSocketTask;

	/**
	 * @since 13.0
	 */
	webSocketTaskWithURL(url: NSURL): NSURLSessionWebSocketTask;

	/**
	 * @since 13.0
	 */
	webSocketTaskWithURLProtocols(url: NSURL, protocols: NSArray<string> | string[]): NSURLSessionWebSocketTask;
}

/**
 * @since 7.0
 */
declare const enum NSURLSessionAuthChallengeDisposition {

	UseCredential = 0,

	PerformDefaultHandling = 1,

	CancelAuthenticationChallenge = 2,

	RejectProtectionSpace = 3
}

/**
 * @since 7.0
 */
declare class NSURLSessionConfiguration extends NSObject implements NSCopying {

	static alloc(): NSURLSessionConfiguration; // inherited from NSObject

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	static backgroundSessionConfiguration(identifier: string): NSURLSessionConfiguration;

	/**
	 * @since 8.0
	 */
	static backgroundSessionConfigurationWithIdentifier(identifier: string): NSURLSessionConfiguration;

	static new(): NSURLSessionConfiguration; // inherited from NSObject

	HTTPAdditionalHeaders: NSDictionary<any, any>;

	HTTPCookieAcceptPolicy: NSHTTPCookieAcceptPolicy;

	HTTPCookieStorage: NSHTTPCookieStorage;

	HTTPMaximumConnectionsPerHost: number;

	HTTPShouldSetCookies: boolean;

	HTTPShouldUsePipelining: boolean;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	TLSMaximumSupportedProtocol: SSLProtocol;

	/**
	 * @since 13.0
	 */
	TLSMaximumSupportedProtocolVersion: tls_protocol_version_t;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	TLSMinimumSupportedProtocol: SSLProtocol;

	/**
	 * @since 13.0
	 */
	TLSMinimumSupportedProtocolVersion: tls_protocol_version_t;

	URLCache: NSURLCache;

	URLCredentialStorage: NSURLCredentialStorage;

	allowsCellularAccess: boolean;

	/**
	 * @since 13.0
	 */
	allowsConstrainedNetworkAccess: boolean;

	/**
	 * @since 13.0
	 */
	allowsExpensiveNetworkAccess: boolean;

	connectionProxyDictionary: NSDictionary<any, any>;

	/**
	 * @since 7.0
	 */
	discretionary: boolean;

	readonly identifier: string;

	/**
	 * @since 11.0
	 */
	multipathServiceType: NSURLSessionMultipathServiceType;

	networkServiceType: NSURLRequestNetworkServiceType;

	protocolClasses: NSArray<typeof NSObject>;

	proxyConfigurations: NSArray<NSObject & OS_nw_proxy_config>;

	requestCachePolicy: NSURLRequestCachePolicy;

	/**
	 * @since 16.0
	 */
	requiresDNSSECValidation: boolean;

	/**
	 * @since 7.0
	 */
	sessionSendsLaunchEvents: boolean;

	/**
	 * @since 8.0
	 */
	sharedContainerIdentifier: string;

	/**
	 * @since 9.0
	 */
	shouldUseExtendedBackgroundIdleMode: boolean;

	timeoutIntervalForRequest: number;

	timeoutIntervalForResource: number;

	/**
	 * @since 11.0
	 */
	waitsForConnectivity: boolean;

	static readonly defaultSessionConfiguration: NSURLSessionConfiguration;

	static readonly ephemeralSessionConfiguration: NSURLSessionConfiguration;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 7.0
 */
interface NSURLSessionDataDelegate extends NSURLSessionTaskDelegate {

	URLSessionDataTaskDidBecomeDownloadTask?(session: NSURLSession, dataTask: NSURLSessionDataTask, downloadTask: NSURLSessionDownloadTask): void;

	/**
	 * @since 9.0
	 */
	URLSessionDataTaskDidBecomeStreamTask?(session: NSURLSession, dataTask: NSURLSessionDataTask, streamTask: NSURLSessionStreamTask): void;

	URLSessionDataTaskDidReceiveData?(session: NSURLSession, dataTask: NSURLSessionDataTask, data: NSData): void;

	URLSessionDataTaskDidReceiveResponseCompletionHandler?(session: NSURLSession, dataTask: NSURLSessionDataTask, response: NSURLResponse, completionHandler: (p1: NSURLSessionResponseDisposition) => void): void;

	URLSessionDataTaskWillCacheResponseCompletionHandler?(session: NSURLSession, dataTask: NSURLSessionDataTask, proposedResponse: NSCachedURLResponse, completionHandler: (p1: NSCachedURLResponse) => void): void;
}
declare var NSURLSessionDataDelegate: {

	prototype: NSURLSessionDataDelegate;
};

/**
 * @since 7.0
 */
declare class NSURLSessionDataTask extends NSURLSessionTask {

	static alloc(): NSURLSessionDataTask; // inherited from NSObject

	static new(): NSURLSessionDataTask; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare const enum NSURLSessionDelayedRequestDisposition {

	ContinueLoading = 0,

	UseNewRequest = 1,

	Cancel = 2
}

/**
 * @since 7.0
 */
interface NSURLSessionDelegate extends NSObjectProtocol {

	URLSessionDidBecomeInvalidWithError?(session: NSURLSession, error: NSError): void;

	/**
	 * @since 7.0
	 */
	URLSessionDidFinishEventsForBackgroundURLSession?(session: NSURLSession): void;

	URLSessionDidReceiveChallengeCompletionHandler?(session: NSURLSession, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;
}
declare var NSURLSessionDelegate: {

	prototype: NSURLSessionDelegate;
};

/**
 * @since 7.0
 */
interface NSURLSessionDownloadDelegate extends NSURLSessionTaskDelegate {

	URLSessionDownloadTaskDidFinishDownloadingToURL(session: NSURLSession, downloadTask: NSURLSessionDownloadTask, location: NSURL): void;

	URLSessionDownloadTaskDidResumeAtOffsetExpectedTotalBytes?(session: NSURLSession, downloadTask: NSURLSessionDownloadTask, fileOffset: number, expectedTotalBytes: number): void;

	URLSessionDownloadTaskDidWriteDataTotalBytesWrittenTotalBytesExpectedToWrite?(session: NSURLSession, downloadTask: NSURLSessionDownloadTask, bytesWritten: number, totalBytesWritten: number, totalBytesExpectedToWrite: number): void;
}
declare var NSURLSessionDownloadDelegate: {

	prototype: NSURLSessionDownloadDelegate;
};

/**
 * @since 7.0
 */
declare class NSURLSessionDownloadTask extends NSURLSessionTask {

	static alloc(): NSURLSessionDownloadTask; // inherited from NSObject

	static new(): NSURLSessionDownloadTask; // inherited from NSObject

	cancelByProducingResumeData(completionHandler: (p1: NSData) => void): void;
}

/**
 * @since 7.0
 */
declare var NSURLSessionDownloadTaskResumeData: string;

/**
 * @since 11.0
 */
declare const enum NSURLSessionMultipathServiceType {

	None = 0,

	Handover = 1,

	Interactive = 2,

	Aggregate = 3
}

/**
 * @since 7.0
 */
declare const enum NSURLSessionResponseDisposition {

	Cancel = 0,

	Allow = 1,

	BecomeDownload = 2,

	BecomeStream = 3
}

/**
 * @since 9.0
 */
interface NSURLSessionStreamDelegate extends NSURLSessionTaskDelegate {

	URLSessionBetterRouteDiscoveredForStreamTask?(session: NSURLSession, streamTask: NSURLSessionStreamTask): void;

	URLSessionReadClosedForStreamTask?(session: NSURLSession, streamTask: NSURLSessionStreamTask): void;

	URLSessionStreamTaskDidBecomeInputStreamOutputStream?(session: NSURLSession, streamTask: NSURLSessionStreamTask, inputStream: NSInputStream, outputStream: NSOutputStream): void;

	URLSessionWriteClosedForStreamTask?(session: NSURLSession, streamTask: NSURLSessionStreamTask): void;
}
declare var NSURLSessionStreamDelegate: {

	prototype: NSURLSessionStreamDelegate;
};

/**
 * @since 9.0
 */
declare class NSURLSessionStreamTask extends NSURLSessionTask {

	static alloc(): NSURLSessionStreamTask; // inherited from NSObject

	static new(): NSURLSessionStreamTask; // inherited from NSObject

	captureStreams(): void;

	closeRead(): void;

	closeWrite(): void;

	readDataOfMinLengthMaxLengthTimeoutCompletionHandler(minBytes: number, maxBytes: number, timeout: number, completionHandler: (p1: NSData, p2: boolean, p3: NSError) => void): void;

	startSecureConnection(): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	stopSecureConnection(): void;

	writeDataTimeoutCompletionHandler(data: NSData, timeout: number, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 7.0
 */
declare class NSURLSessionTask extends NSObject implements NSCopying, NSProgressReporting {

	static alloc(): NSURLSessionTask; // inherited from NSObject

	static new(): NSURLSessionTask; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	countOfBytesClientExpectsToReceive: number;

	/**
	 * @since 11.0
	 */
	countOfBytesClientExpectsToSend: number;

	readonly countOfBytesExpectedToReceive: number;

	readonly countOfBytesExpectedToSend: number;

	readonly countOfBytesReceived: number;

	readonly countOfBytesSent: number;

	readonly currentRequest: NSURLRequest;

	/**
	 * @since 15.0
	 */
	delegate: NSURLSessionTaskDelegate;

	/**
	 * @since 11.0
	 */
	earliestBeginDate: Date;

	readonly error: NSError;

	readonly originalRequest: NSURLRequest;

	/**
	 * @since 14.5
	 */
	prefersIncrementalDelivery: boolean;

	/**
	 * @since 8.0
	 */
	priority: number;

	readonly response: NSURLResponse;

	readonly state: NSURLSessionTaskState;

	taskDescription: string;

	readonly taskIdentifier: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	cancel(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	resume(): void;

	retainCount(): number;

	self(): this;

	suspend(): void;
}

/**
 * @since 7.0
 */
interface NSURLSessionTaskDelegate extends NSURLSessionDelegate {

	/**
	 * @since 16.0
	 */
	URLSessionDidCreateTask?(session: NSURLSession, task: NSURLSessionTask): void;

	URLSessionTaskDidCompleteWithError?(session: NSURLSession, task: NSURLSessionTask, error: NSError): void;

	/**
	 * @since 10.0
	 */
	URLSessionTaskDidFinishCollectingMetrics?(session: NSURLSession, task: NSURLSessionTask, metrics: NSURLSessionTaskMetrics): void;

	URLSessionTaskDidReceiveChallengeCompletionHandler?(session: NSURLSession, task: NSURLSessionTask, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	/**
	 * @since 17.0
	 */
	URLSessionTaskDidReceiveInformationalResponse?(session: NSURLSession, task: NSURLSessionTask, response: NSHTTPURLResponse): void;

	URLSessionTaskDidSendBodyDataTotalBytesSentTotalBytesExpectedToSend?(session: NSURLSession, task: NSURLSessionTask, bytesSent: number, totalBytesSent: number, totalBytesExpectedToSend: number): void;

	/**
	 * @since 11.0
	 */
	URLSessionTaskIsWaitingForConnectivity?(session: NSURLSession, task: NSURLSessionTask): void;

	URLSessionTaskNeedNewBodyStream?(session: NSURLSession, task: NSURLSessionTask, completionHandler: (p1: NSInputStream) => void): void;

	/**
	 * @since 17.0
	 */
	URLSessionTaskNeedNewBodyStreamFromOffsetCompletionHandler?(session: NSURLSession, task: NSURLSessionTask, offset: number, completionHandler: (p1: NSInputStream) => void): void;

	/**
	 * @since 11.0
	 */
	URLSessionTaskWillBeginDelayedRequestCompletionHandler?(session: NSURLSession, task: NSURLSessionTask, request: NSURLRequest, completionHandler: (p1: NSURLSessionDelayedRequestDisposition, p2: NSURLRequest) => void): void;

	URLSessionTaskWillPerformHTTPRedirectionNewRequestCompletionHandler?(session: NSURLSession, task: NSURLSessionTask, response: NSHTTPURLResponse, request: NSURLRequest, completionHandler: (p1: NSURLRequest) => void): void;
}
declare var NSURLSessionTaskDelegate: {

	prototype: NSURLSessionTaskDelegate;
};

/**
 * @since 10.0
 */
declare class NSURLSessionTaskMetrics extends NSObject {

	static alloc(): NSURLSessionTaskMetrics; // inherited from NSObject

	static new(): NSURLSessionTaskMetrics; // inherited from NSObject

	readonly redirectCount: number;

	readonly taskInterval: NSDateInterval;

	readonly transactionMetrics: NSArray<NSURLSessionTaskTransactionMetrics>;
}

/**
 * @since 14.0
 */
declare const enum NSURLSessionTaskMetricsDomainResolutionProtocol {

	Unknown = 0,

	UDP = 1,

	TCP = 2,

	TLS = 3,

	HTTPS = 4
}

/**
 * @since 10.0
 */
declare const enum NSURLSessionTaskMetricsResourceFetchType {

	Unknown = 0,

	NetworkLoad = 1,

	ServerPush = 2,

	LocalCache = 3
}

/**
 * @since 8.0
 */
declare var NSURLSessionTaskPriorityDefault: number;

/**
 * @since 8.0
 */
declare var NSURLSessionTaskPriorityHigh: number;

/**
 * @since 8.0
 */
declare var NSURLSessionTaskPriorityLow: number;

/**
 * @since 7.0
 */
declare const enum NSURLSessionTaskState {

	Running = 0,

	Suspended = 1,

	Canceling = 2,

	Completed = 3
}

/**
 * @since 10.0
 */
declare class NSURLSessionTaskTransactionMetrics extends NSObject {

	static alloc(): NSURLSessionTaskTransactionMetrics; // inherited from NSObject

	static new(): NSURLSessionTaskTransactionMetrics; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly cellular: boolean;

	readonly connectEndDate: Date;

	readonly connectStartDate: Date;

	/**
	 * @since 13.0
	 */
	readonly constrained: boolean;

	/**
	 * @since 13.0
	 */
	readonly countOfRequestBodyBytesBeforeEncoding: number;

	/**
	 * @since 13.0
	 */
	readonly countOfRequestBodyBytesSent: number;

	/**
	 * @since 13.0
	 */
	readonly countOfRequestHeaderBytesSent: number;

	/**
	 * @since 13.0
	 */
	readonly countOfResponseBodyBytesAfterDecoding: number;

	/**
	 * @since 13.0
	 */
	readonly countOfResponseBodyBytesReceived: number;

	/**
	 * @since 13.0
	 */
	readonly countOfResponseHeaderBytesReceived: number;

	readonly domainLookupEndDate: Date;

	readonly domainLookupStartDate: Date;

	/**
	 * @since 14.0
	 */
	readonly domainResolutionProtocol: NSURLSessionTaskMetricsDomainResolutionProtocol;

	/**
	 * @since 13.0
	 */
	readonly expensive: boolean;

	readonly fetchStartDate: Date;

	/**
	 * @since 13.0
	 */
	readonly localAddress: string;

	/**
	 * @since 13.0
	 */
	readonly localPort: number;

	/**
	 * @since 13.0
	 */
	readonly multipath: boolean;

	/**
	 * @since 13.0
	 */
	readonly negotiatedTLSCipherSuite: number;

	/**
	 * @since 13.0
	 */
	readonly negotiatedTLSProtocolVersion: number;

	readonly networkProtocolName: string;

	readonly proxyConnection: boolean;

	/**
	 * @since 13.0
	 */
	readonly remoteAddress: string;

	/**
	 * @since 13.0
	 */
	readonly remotePort: number;

	readonly request: NSURLRequest;

	readonly requestEndDate: Date;

	readonly requestStartDate: Date;

	readonly resourceFetchType: NSURLSessionTaskMetricsResourceFetchType;

	readonly response: NSURLResponse;

	readonly responseEndDate: Date;

	readonly responseStartDate: Date;

	readonly reusedConnection: boolean;

	readonly secureConnectionEndDate: Date;

	readonly secureConnectionStartDate: Date;
}

/**
 * @since 7.0
 */
declare var NSURLSessionTransferSizeUnknown: number;

/**
 * @since 7.0
 */
declare class NSURLSessionUploadTask extends NSURLSessionDataTask {

	static alloc(): NSURLSessionUploadTask; // inherited from NSObject

	static new(): NSURLSessionUploadTask; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	cancelByProducingResumeData(completionHandler: (p1: NSData) => void): void;
}

/**
 * @since 17.0
 */
declare var NSURLSessionUploadTaskResumeData: string;

/**
 * @since 13.0
 */
declare const enum NSURLSessionWebSocketCloseCode {

	Invalid = 0,

	NormalClosure = 1000,

	GoingAway = 1001,

	ProtocolError = 1002,

	UnsupportedData = 1003,

	NoStatusReceived = 1005,

	AbnormalClosure = 1006,

	InvalidFramePayloadData = 1007,

	PolicyViolation = 1008,

	MessageTooBig = 1009,

	MandatoryExtensionMissing = 1010,

	InternalServerError = 1011,

	TLSHandshakeFailure = 1015
}

/**
 * @since 13.0
 */
interface NSURLSessionWebSocketDelegate extends NSURLSessionTaskDelegate {

	URLSessionWebSocketTaskDidCloseWithCodeReason?(session: NSURLSession, webSocketTask: NSURLSessionWebSocketTask, closeCode: NSURLSessionWebSocketCloseCode, reason: NSData): void;

	URLSessionWebSocketTaskDidOpenWithProtocol?(session: NSURLSession, webSocketTask: NSURLSessionWebSocketTask, protocol: string): void;
}
declare var NSURLSessionWebSocketDelegate: {

	prototype: NSURLSessionWebSocketDelegate;
};

/**
 * @since 13.0
 */
declare class NSURLSessionWebSocketMessage extends NSObject {

	static alloc(): NSURLSessionWebSocketMessage; // inherited from NSObject

	static new(): NSURLSessionWebSocketMessage; // inherited from NSObject

	readonly data: NSData;

	readonly string: string;

	readonly type: NSURLSessionWebSocketMessageType;

	constructor(o: { data: NSData; });

	constructor(o: { string: string; });

	initWithData(data: NSData): this;

	initWithString(string: string): this;
}

/**
 * @since 13.0
 */
declare const enum NSURLSessionWebSocketMessageType {

	Data = 0,

	String = 1
}

/**
 * @since 13.0
 */
declare class NSURLSessionWebSocketTask extends NSURLSessionTask {

	static alloc(): NSURLSessionWebSocketTask; // inherited from NSObject

	static new(): NSURLSessionWebSocketTask; // inherited from NSObject

	readonly closeCode: NSURLSessionWebSocketCloseCode;

	readonly closeReason: NSData;

	maximumMessageSize: number;

	cancelWithCloseCodeReason(closeCode: NSURLSessionWebSocketCloseCode, reason: NSData): void;

	receiveMessageWithCompletionHandler(completionHandler: (p1: NSURLSessionWebSocketMessage, p2: NSError) => void): void;

	sendMessageCompletionHandler(message: NSURLSessionWebSocketMessage, completionHandler: (p1: NSError) => void): void;

	sendPingWithPongReceiveHandler(pongReceiveHandler: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var NSURLThumbnailDictionaryKey: string;

/**
 * @since 5.0
 */
declare var NSURLTotalFileAllocatedSizeKey: string;

/**
 * @since 5.0
 */
declare var NSURLTotalFileSizeKey: string;

/**
 * @since 4.0
 * @deprecated 100000
 */
declare var NSURLTypeIdentifierKey: string;

/**
 * @since 8.0
 */
declare var NSURLUbiquitousItemContainerDisplayNameKey: string;

/**
 * @since 8.0
 */
declare var NSURLUbiquitousItemDownloadRequestedKey: string;

/**
 * @since 7.0
 */
declare var NSURLUbiquitousItemDownloadingErrorKey: string;

/**
 * @since 7.0
 */
declare var NSURLUbiquitousItemDownloadingStatusCurrent: string;

/**
 * @since 7.0
 */
declare var NSURLUbiquitousItemDownloadingStatusDownloaded: string;

/**
 * @since 7.0
 */
declare var NSURLUbiquitousItemDownloadingStatusKey: string;

/**
 * @since 7.0
 */
declare var NSURLUbiquitousItemDownloadingStatusNotDownloaded: string;

/**
 * @since 5.0
 */
declare var NSURLUbiquitousItemHasUnresolvedConflictsKey: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var NSURLUbiquitousItemIsDownloadedKey: string;

/**
 * @since 5.0
 */
declare var NSURLUbiquitousItemIsDownloadingKey: string;

/**
 * @since 14.5
 */
declare var NSURLUbiquitousItemIsExcludedFromSyncKey: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousItemIsSharedKey: string;

/**
 * @since 5.0
 */
declare var NSURLUbiquitousItemIsUploadedKey: string;

/**
 * @since 5.0
 */
declare var NSURLUbiquitousItemIsUploadingKey: string;

/**
 * @since 5.0
 * @deprecated 6.0
 */
declare var NSURLUbiquitousItemPercentDownloadedKey: string;

/**
 * @since 5.0
 * @deprecated 6.0
 */
declare var NSURLUbiquitousItemPercentUploadedKey: string;

/**
 * @since 7.0
 */
declare var NSURLUbiquitousItemUploadingErrorKey: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemCurrentUserPermissionsKey: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemCurrentUserRoleKey: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemMostRecentEditorNameComponentsKey: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemOwnerNameComponentsKey: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemPermissionsReadOnly: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemPermissionsReadWrite: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemRoleOwner: string;

/**
 * @since 10.0
 */
declare var NSURLUbiquitousSharedItemRoleParticipant: string;

/**
 * @since 11.0
 */
declare var NSURLVolumeAvailableCapacityForImportantUsageKey: string;

/**
 * @since 11.0
 */
declare var NSURLVolumeAvailableCapacityForOpportunisticUsageKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeAvailableCapacityKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeCreationDateKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIdentifierKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsAutomountedKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsBrowsableKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsEjectableKey: string;

/**
 * @since 10.0
 */
declare var NSURLVolumeIsEncryptedKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsInternalKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeIsJournalingKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsLocalKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsReadOnlyKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeIsRemovableKey: string;

/**
 * @since 10.0
 */
declare var NSURLVolumeIsRootFileSystemKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeLocalizedFormatDescriptionKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeLocalizedNameKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeMaximumFileSizeKey: string;

/**
 * @since 16.4
 */
declare var NSURLVolumeMountFromLocationKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeNameKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeResourceCountKey: string;

/**
 * @since 16.4
 */
declare var NSURLVolumeSubtypeKey: string;

/**
 * @since 11.0
 */
declare var NSURLVolumeSupportsAccessPermissionsKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeSupportsAdvisoryFileLockingKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsCasePreservedNamesKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsCaseSensitiveNamesKey: string;

/**
 * @since 10.0
 */
declare var NSURLVolumeSupportsCompressionKey: string;

/**
 * @since 10.0
 */
declare var NSURLVolumeSupportsExclusiveRenamingKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeSupportsExtendedSecurityKey: string;

/**
 * @since 10.0
 */
declare var NSURLVolumeSupportsFileCloningKey: string;

/**
 * @since 14.0
 */
declare var NSURLVolumeSupportsFileProtectionKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsHardLinksKey: string;

/**
 * @since 11.0
 */
declare var NSURLVolumeSupportsImmutableFilesKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsJournalingKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsPersistentIDsKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeSupportsRenamingKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeSupportsRootDirectoryDatesKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsSparseFilesKey: string;

/**
 * @since 10.0
 */
declare var NSURLVolumeSupportsSwapRenamingKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsSymbolicLinksKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeSupportsVolumeSizesKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeSupportsZeroRunsKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeTotalCapacityKey: string;

/**
 * @since 16.4
 */
declare var NSURLVolumeTypeNameKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeURLForRemountingKey: string;

/**
 * @since 4.0
 */
declare var NSURLVolumeURLKey: string;

/**
 * @since 5.0
 */
declare var NSURLVolumeUUIDStringKey: string;

declare const NSUTF16BigEndianStringEncoding: number;

declare const NSUTF16LittleEndianStringEncoding: number;

declare const NSUTF16StringEncoding: number;

declare const NSUTF32BigEndianStringEncoding: number;

declare const NSUTF32LittleEndianStringEncoding: number;

declare const NSUTF32StringEncoding: number;

declare const NSUTF8StringEncoding: number;

/**
 * @since 6.0
 */
declare class NSUUID extends NSObject implements NSCopying, NSSecureCoding {

	static UUID(): NSUUID;

	static alloc(): NSUUID; // inherited from NSObject

	static new(): NSUUID; // inherited from NSObject

	readonly UUIDString: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { UUIDBytes: interop.Reference<number>; });

	constructor(o: { UUIDString: string; });

	/**
	 * @since 15.0
	 */
	compare(otherUUID: NSUUID): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	getUUIDBytes(uuid: interop.Reference<number>): void;

	initWithCoder(coder: NSCoder): this;

	initWithUUIDBytes(bytes: interop.Reference<number>): this;

	initWithUUIDString(string: string): this;
}

declare const NSUbiquitousFileErrorMaximum: number;

declare const NSUbiquitousFileErrorMinimum: number;

declare const NSUbiquitousFileNotUploadedDueToQuotaError: number;

declare const NSUbiquitousFileUbiquityServerNotAvailable: number;

declare const NSUbiquitousFileUnavailableError: number;

/**
 * @since 5.0
 */
declare class NSUbiquitousKeyValueStore extends NSObject {

	static alloc(): NSUbiquitousKeyValueStore; // inherited from NSObject

	static new(): NSUbiquitousKeyValueStore; // inherited from NSObject

	readonly dictionaryRepresentation: NSDictionary<string, any>;

	static readonly defaultStore: NSUbiquitousKeyValueStore;

	arrayForKey(aKey: string): NSArray<any>;

	boolForKey(aKey: string): boolean;

	dataForKey(aKey: string): NSData;

	dictionaryForKey(aKey: string): NSDictionary<string, any>;

	doubleForKey(aKey: string): number;

	longLongForKey(aKey: string): number;

	objectForKey(aKey: string): any;

	removeObjectForKey(aKey: string): void;

	setArrayForKey(anArray: NSArray<any> | any[], aKey: string): void;

	setBoolForKey(value: boolean, aKey: string): void;

	setDataForKey(aData: NSData, aKey: string): void;

	setDictionaryForKey(aDictionary: NSDictionary<string, any>, aKey: string): void;

	setDoubleForKey(value: number, aKey: string): void;

	setLongLongForKey(value: number, aKey: string): void;

	setObjectForKey(anObject: any, aKey: string): void;

	setStringForKey(aString: string, aKey: string): void;

	stringForKey(aKey: string): string;

	synchronize(): boolean;
}

declare const NSUbiquitousKeyValueStoreAccountChange: number;

/**
 * @since 5.0
 */
declare var NSUbiquitousKeyValueStoreChangeReasonKey: string;

/**
 * @since 5.0
 */
declare var NSUbiquitousKeyValueStoreChangedKeysKey: string;

/**
 * @since 5.0
 */
declare var NSUbiquitousKeyValueStoreDidChangeExternallyNotification: string;

declare const NSUbiquitousKeyValueStoreInitialSyncChange: number;

declare const NSUbiquitousKeyValueStoreQuotaViolationChange: number;

declare const NSUbiquitousKeyValueStoreServerChange: number;

/**
 * @since 9.3
 */
declare var NSUbiquitousUserDefaultsCompletedInitialSyncNotification: string;

/**
 * @since 9.3
 */
declare var NSUbiquitousUserDefaultsDidChangeAccountsNotification: string;

/**
 * @since 9.3
 */
declare var NSUbiquitousUserDefaultsNoCloudAccountNotification: string;

/**
 * @since 6.0
 */
declare var NSUbiquityIdentityDidChangeNotification: string;

/**
 * @since 3.0
 * @deprecated 12.0
 */
declare var NSUnarchiveFromDataTransformerName: string;

declare const NSUndefinedDateComponent: number;

declare var NSUndefinedKeyException: string;

declare var NSUnderlyingErrorKey: string;

declare var NSUndoCloseGroupingRunLoopOrdering: number;

/**
 * @since 3.0
 */
declare class NSUndoManager extends NSObject {

	static alloc(): NSUndoManager; // inherited from NSObject

	static new(): NSUndoManager; // inherited from NSObject

	readonly canRedo: boolean;

	readonly canUndo: boolean;

	readonly groupingLevel: number;

	groupsByEvent: boolean;

	levelsOfUndo: number;

	/**
	 * @since 5.0
	 */
	readonly redoActionIsDiscardable: boolean;

	readonly redoActionName: string;

	/**
	 * @since 17.4
	 */
	readonly redoCount: number;

	readonly redoMenuItemTitle: string;

	readonly redoing: boolean;

	runLoopModes: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly undoActionIsDiscardable: boolean;

	readonly undoActionName: string;

	/**
	 * @since 17.4
	 */
	readonly undoCount: number;

	readonly undoMenuItemTitle: string;

	readonly undoRegistrationEnabled: boolean;

	readonly undoing: boolean;

	beginUndoGrouping(): void;

	disableUndoRegistration(): void;

	enableUndoRegistration(): void;

	endUndoGrouping(): void;

	prepareWithInvocationTarget(target: any): any;

	redo(): void;

	/**
	 * @since 18.0
	 */
	redoActionUserInfoValueForKey(key: string): any;

	redoMenuTitleForUndoActionName(actionName: string): string;

	/**
	 * @since 9.0
	 */
	registerUndoWithTargetHandler(target: any, undoHandler: (p1: any) => void): void;

	registerUndoWithTargetSelectorObject(target: any, selector: string, object: any): void;

	removeAllActions(): void;

	removeAllActionsWithTarget(target: any): void;

	/**
	 * @since 5.0
	 */
	setActionIsDiscardable(discardable: boolean): void;

	setActionName(actionName: string): void;

	/**
	 * @since 18.0
	 */
	setActionUserInfoValueForKey(info: any, key: string): void;

	undo(): void;

	/**
	 * @since 18.0
	 */
	undoActionUserInfoValueForKey(key: string): any;

	undoMenuTitleForUndoActionName(actionName: string): string;

	undoNestedGroup(): void;
}

/**
 * @since 3.0
 */
declare var NSUndoManagerCheckpointNotification: string;

/**
 * @since 5.0
 */
declare var NSUndoManagerDidCloseUndoGroupNotification: string;

/**
 * @since 3.0
 */
declare var NSUndoManagerDidOpenUndoGroupNotification: string;

/**
 * @since 3.0
 */
declare var NSUndoManagerDidRedoChangeNotification: string;

/**
 * @since 3.0
 */
declare var NSUndoManagerDidUndoChangeNotification: string;

/**
 * @since 5.0
 */
declare var NSUndoManagerGroupIsDiscardableKey: string;

/**
 * @since 3.0
 */
declare var NSUndoManagerWillCloseUndoGroupNotification: string;

/**
 * @since 3.0
 */
declare var NSUndoManagerWillRedoChangeNotification: string;

/**
 * @since 3.0
 */
declare var NSUndoManagerWillUndoChangeNotification: string;

declare const NSUnicodeStringEncoding: number;

declare var NSUnionOfArraysKeyValueOperator: string;

declare var NSUnionOfObjectsKeyValueOperator: string;

declare var NSUnionOfSetsKeyValueOperator: string;

declare function NSUnionRange(range1: NSRange, range2: NSRange): NSRange;

/**
 * @since 10.0
 */
declare class NSUnit extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSUnit; // inherited from NSObject

	static new(): NSUnit; // inherited from NSObject

	readonly symbol: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { symbol: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSymbol(symbol: string): this;
}

/**
 * @since 10.0
 */
declare class NSUnitAcceleration extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitAcceleration; // inherited from NSObject

	static baseUnit(): NSUnitAcceleration; // inherited from NSDimension

	static new(): NSUnitAcceleration; // inherited from NSObject

	static readonly gravity: NSUnitAcceleration;

	static readonly metersPerSecondSquared: NSUnitAcceleration;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitAngle extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitAngle; // inherited from NSObject

	static baseUnit(): NSUnitAngle; // inherited from NSDimension

	static new(): NSUnitAngle; // inherited from NSObject

	static readonly arcMinutes: NSUnitAngle;

	static readonly arcSeconds: NSUnitAngle;

	static readonly degrees: NSUnitAngle;

	static readonly gradians: NSUnitAngle;

	static readonly radians: NSUnitAngle;

	static readonly revolutions: NSUnitAngle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitArea extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitArea; // inherited from NSObject

	static baseUnit(): NSUnitArea; // inherited from NSDimension

	static new(): NSUnitArea; // inherited from NSObject

	static readonly acres: NSUnitArea;

	static readonly ares: NSUnitArea;

	static readonly hectares: NSUnitArea;

	static readonly squareCentimeters: NSUnitArea;

	static readonly squareFeet: NSUnitArea;

	static readonly squareInches: NSUnitArea;

	static readonly squareKilometers: NSUnitArea;

	static readonly squareMegameters: NSUnitArea;

	static readonly squareMeters: NSUnitArea;

	static readonly squareMicrometers: NSUnitArea;

	static readonly squareMiles: NSUnitArea;

	static readonly squareMillimeters: NSUnitArea;

	static readonly squareNanometers: NSUnitArea;

	static readonly squareYards: NSUnitArea;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitConcentrationMass extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitConcentrationMass; // inherited from NSObject

	static baseUnit(): NSUnitConcentrationMass; // inherited from NSDimension

	static millimolesPerLiterWithGramsPerMole(gramsPerMole: number): NSUnitConcentrationMass;

	static new(): NSUnitConcentrationMass; // inherited from NSObject

	static readonly gramsPerLiter: NSUnitConcentrationMass;

	static readonly milligramsPerDeciliter: NSUnitConcentrationMass;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitConverter extends NSObject {

	static alloc(): NSUnitConverter; // inherited from NSObject

	static new(): NSUnitConverter; // inherited from NSObject

	baseUnitValueFromValue(value: number): number;

	valueFromBaseUnitValue(baseUnitValue: number): number;
}

/**
 * @since 10.0
 */
declare class NSUnitConverterLinear extends NSUnitConverter implements NSSecureCoding {

	static alloc(): NSUnitConverterLinear; // inherited from NSObject

	static new(): NSUnitConverterLinear; // inherited from NSObject

	readonly coefficient: number;

	readonly constant: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { coefficient: number; });

	constructor(o: { coefficient: number; constant: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCoefficient(coefficient: number): this;

	initWithCoefficientConstant(coefficient: number, constant: number): this;
}

/**
 * @since 10.0
 */
declare class NSUnitDispersion extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitDispersion; // inherited from NSObject

	static baseUnit(): NSUnitDispersion; // inherited from NSDimension

	static new(): NSUnitDispersion; // inherited from NSObject

	static readonly partsPerMillion: NSUnitDispersion;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitDuration extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitDuration; // inherited from NSObject

	static baseUnit(): NSUnitDuration; // inherited from NSDimension

	static new(): NSUnitDuration; // inherited from NSObject

	static readonly hours: NSUnitDuration;

	/**
	 * @since 13.0
	 */
	static readonly microseconds: NSUnitDuration;

	/**
	 * @since 13.0
	 */
	static readonly milliseconds: NSUnitDuration;

	static readonly minutes: NSUnitDuration;

	/**
	 * @since 13.0
	 */
	static readonly nanoseconds: NSUnitDuration;

	/**
	 * @since 13.0
	 */
	static readonly picoseconds: NSUnitDuration;

	static readonly seconds: NSUnitDuration;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitElectricCharge extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitElectricCharge; // inherited from NSObject

	static baseUnit(): NSUnitElectricCharge; // inherited from NSDimension

	static new(): NSUnitElectricCharge; // inherited from NSObject

	static readonly ampereHours: NSUnitElectricCharge;

	static readonly coulombs: NSUnitElectricCharge;

	static readonly kiloampereHours: NSUnitElectricCharge;

	static readonly megaampereHours: NSUnitElectricCharge;

	static readonly microampereHours: NSUnitElectricCharge;

	static readonly milliampereHours: NSUnitElectricCharge;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitElectricCurrent extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitElectricCurrent; // inherited from NSObject

	static baseUnit(): NSUnitElectricCurrent; // inherited from NSDimension

	static new(): NSUnitElectricCurrent; // inherited from NSObject

	static readonly amperes: NSUnitElectricCurrent;

	static readonly kiloamperes: NSUnitElectricCurrent;

	static readonly megaamperes: NSUnitElectricCurrent;

	static readonly microamperes: NSUnitElectricCurrent;

	static readonly milliamperes: NSUnitElectricCurrent;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitElectricPotentialDifference extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitElectricPotentialDifference; // inherited from NSObject

	static baseUnit(): NSUnitElectricPotentialDifference; // inherited from NSDimension

	static new(): NSUnitElectricPotentialDifference; // inherited from NSObject

	static readonly kilovolts: NSUnitElectricPotentialDifference;

	static readonly megavolts: NSUnitElectricPotentialDifference;

	static readonly microvolts: NSUnitElectricPotentialDifference;

	static readonly millivolts: NSUnitElectricPotentialDifference;

	static readonly volts: NSUnitElectricPotentialDifference;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitElectricResistance extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitElectricResistance; // inherited from NSObject

	static baseUnit(): NSUnitElectricResistance; // inherited from NSDimension

	static new(): NSUnitElectricResistance; // inherited from NSObject

	static readonly kiloohms: NSUnitElectricResistance;

	static readonly megaohms: NSUnitElectricResistance;

	static readonly microohms: NSUnitElectricResistance;

	static readonly milliohms: NSUnitElectricResistance;

	static readonly ohms: NSUnitElectricResistance;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitEnergy extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitEnergy; // inherited from NSObject

	static baseUnit(): NSUnitEnergy; // inherited from NSDimension

	static new(): NSUnitEnergy; // inherited from NSObject

	static readonly calories: NSUnitEnergy;

	static readonly joules: NSUnitEnergy;

	static readonly kilocalories: NSUnitEnergy;

	static readonly kilojoules: NSUnitEnergy;

	static readonly kilowattHours: NSUnitEnergy;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitFrequency extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitFrequency; // inherited from NSObject

	static baseUnit(): NSUnitFrequency; // inherited from NSDimension

	static new(): NSUnitFrequency; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static readonly framesPerSecond: NSUnitFrequency;

	static readonly gigahertz: NSUnitFrequency;

	static readonly hertz: NSUnitFrequency;

	static readonly kilohertz: NSUnitFrequency;

	static readonly megahertz: NSUnitFrequency;

	static readonly microhertz: NSUnitFrequency;

	static readonly millihertz: NSUnitFrequency;

	static readonly nanohertz: NSUnitFrequency;

	static readonly terahertz: NSUnitFrequency;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitFuelEfficiency extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitFuelEfficiency; // inherited from NSObject

	static baseUnit(): NSUnitFuelEfficiency; // inherited from NSDimension

	static new(): NSUnitFuelEfficiency; // inherited from NSObject

	static readonly litersPer100Kilometers: NSUnitFuelEfficiency;

	static readonly milesPerGallon: NSUnitFuelEfficiency;

	static readonly milesPerImperialGallon: NSUnitFuelEfficiency;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitIlluminance extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitIlluminance; // inherited from NSObject

	static baseUnit(): NSUnitIlluminance; // inherited from NSDimension

	static new(): NSUnitIlluminance; // inherited from NSObject

	static readonly lux: NSUnitIlluminance;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class NSUnitInformationStorage extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitInformationStorage; // inherited from NSObject

	static baseUnit(): NSUnitInformationStorage; // inherited from NSDimension

	static new(): NSUnitInformationStorage; // inherited from NSObject

	static readonly bits: NSUnitInformationStorage;

	static readonly bytes: NSUnitInformationStorage;

	static readonly exabits: NSUnitInformationStorage;

	static readonly exabytes: NSUnitInformationStorage;

	static readonly exbibits: NSUnitInformationStorage;

	static readonly exbibytes: NSUnitInformationStorage;

	static readonly gibibits: NSUnitInformationStorage;

	static readonly gibibytes: NSUnitInformationStorage;

	static readonly gigabits: NSUnitInformationStorage;

	static readonly gigabytes: NSUnitInformationStorage;

	static readonly kibibits: NSUnitInformationStorage;

	static readonly kibibytes: NSUnitInformationStorage;

	static readonly kilobits: NSUnitInformationStorage;

	static readonly kilobytes: NSUnitInformationStorage;

	static readonly mebibits: NSUnitInformationStorage;

	static readonly mebibytes: NSUnitInformationStorage;

	static readonly megabits: NSUnitInformationStorage;

	static readonly megabytes: NSUnitInformationStorage;

	static readonly nibbles: NSUnitInformationStorage;

	static readonly pebibits: NSUnitInformationStorage;

	static readonly pebibytes: NSUnitInformationStorage;

	static readonly petabits: NSUnitInformationStorage;

	static readonly petabytes: NSUnitInformationStorage;

	static readonly tebibits: NSUnitInformationStorage;

	static readonly tebibytes: NSUnitInformationStorage;

	static readonly terabits: NSUnitInformationStorage;

	static readonly terabytes: NSUnitInformationStorage;

	static readonly yobibits: NSUnitInformationStorage;

	static readonly yobibytes: NSUnitInformationStorage;

	static readonly yottabits: NSUnitInformationStorage;

	static readonly yottabytes: NSUnitInformationStorage;

	static readonly zebibits: NSUnitInformationStorage;

	static readonly zebibytes: NSUnitInformationStorage;

	static readonly zettabits: NSUnitInformationStorage;

	static readonly zettabytes: NSUnitInformationStorage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitLength extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitLength; // inherited from NSObject

	static baseUnit(): NSUnitLength; // inherited from NSDimension

	static new(): NSUnitLength; // inherited from NSObject

	static readonly astronomicalUnits: NSUnitLength;

	static readonly centimeters: NSUnitLength;

	static readonly decameters: NSUnitLength;

	static readonly decimeters: NSUnitLength;

	static readonly fathoms: NSUnitLength;

	static readonly feet: NSUnitLength;

	static readonly furlongs: NSUnitLength;

	static readonly hectometers: NSUnitLength;

	static readonly inches: NSUnitLength;

	static readonly kilometers: NSUnitLength;

	static readonly lightyears: NSUnitLength;

	static readonly megameters: NSUnitLength;

	static readonly meters: NSUnitLength;

	static readonly micrometers: NSUnitLength;

	static readonly miles: NSUnitLength;

	static readonly millimeters: NSUnitLength;

	static readonly nanometers: NSUnitLength;

	static readonly nauticalMiles: NSUnitLength;

	static readonly parsecs: NSUnitLength;

	static readonly picometers: NSUnitLength;

	static readonly scandinavianMiles: NSUnitLength;

	static readonly yards: NSUnitLength;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitMass extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitMass; // inherited from NSObject

	static baseUnit(): NSUnitMass; // inherited from NSDimension

	static new(): NSUnitMass; // inherited from NSObject

	static readonly carats: NSUnitMass;

	static readonly centigrams: NSUnitMass;

	static readonly decigrams: NSUnitMass;

	static readonly grams: NSUnitMass;

	static readonly kilograms: NSUnitMass;

	static readonly metricTons: NSUnitMass;

	static readonly micrograms: NSUnitMass;

	static readonly milligrams: NSUnitMass;

	static readonly nanograms: NSUnitMass;

	static readonly ounces: NSUnitMass;

	static readonly ouncesTroy: NSUnitMass;

	static readonly picograms: NSUnitMass;

	static readonly poundsMass: NSUnitMass;

	static readonly shortTons: NSUnitMass;

	static readonly slugs: NSUnitMass;

	static readonly stones: NSUnitMass;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitPower extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitPower; // inherited from NSObject

	static baseUnit(): NSUnitPower; // inherited from NSDimension

	static new(): NSUnitPower; // inherited from NSObject

	static readonly femtowatts: NSUnitPower;

	static readonly gigawatts: NSUnitPower;

	static readonly horsepower: NSUnitPower;

	static readonly kilowatts: NSUnitPower;

	static readonly megawatts: NSUnitPower;

	static readonly microwatts: NSUnitPower;

	static readonly milliwatts: NSUnitPower;

	static readonly nanowatts: NSUnitPower;

	static readonly picowatts: NSUnitPower;

	static readonly terawatts: NSUnitPower;

	static readonly watts: NSUnitPower;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitPressure extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitPressure; // inherited from NSObject

	static baseUnit(): NSUnitPressure; // inherited from NSDimension

	static new(): NSUnitPressure; // inherited from NSObject

	static readonly bars: NSUnitPressure;

	static readonly gigapascals: NSUnitPressure;

	static readonly hectopascals: NSUnitPressure;

	static readonly inchesOfMercury: NSUnitPressure;

	static readonly kilopascals: NSUnitPressure;

	static readonly megapascals: NSUnitPressure;

	static readonly millibars: NSUnitPressure;

	static readonly millimetersOfMercury: NSUnitPressure;

	static readonly newtonsPerMetersSquared: NSUnitPressure;

	static readonly poundsForcePerSquareInch: NSUnitPressure;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitSpeed extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitSpeed; // inherited from NSObject

	static baseUnit(): NSUnitSpeed; // inherited from NSDimension

	static new(): NSUnitSpeed; // inherited from NSObject

	static readonly kilometersPerHour: NSUnitSpeed;

	static readonly knots: NSUnitSpeed;

	static readonly metersPerSecond: NSUnitSpeed;

	static readonly milesPerHour: NSUnitSpeed;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitTemperature extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitTemperature; // inherited from NSObject

	static baseUnit(): NSUnitTemperature; // inherited from NSDimension

	static new(): NSUnitTemperature; // inherited from NSObject

	static readonly celsius: NSUnitTemperature;

	static readonly fahrenheit: NSUnitTemperature;

	static readonly kelvin: NSUnitTemperature;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class NSUnitVolume extends NSDimension implements NSSecureCoding {

	static alloc(): NSUnitVolume; // inherited from NSObject

	static baseUnit(): NSUnitVolume; // inherited from NSDimension

	static new(): NSUnitVolume; // inherited from NSObject

	static readonly acreFeet: NSUnitVolume;

	static readonly bushels: NSUnitVolume;

	static readonly centiliters: NSUnitVolume;

	static readonly cubicCentimeters: NSUnitVolume;

	static readonly cubicDecimeters: NSUnitVolume;

	static readonly cubicFeet: NSUnitVolume;

	static readonly cubicInches: NSUnitVolume;

	static readonly cubicKilometers: NSUnitVolume;

	static readonly cubicMeters: NSUnitVolume;

	static readonly cubicMiles: NSUnitVolume;

	static readonly cubicMillimeters: NSUnitVolume;

	static readonly cubicYards: NSUnitVolume;

	static readonly cups: NSUnitVolume;

	static readonly deciliters: NSUnitVolume;

	static readonly fluidOunces: NSUnitVolume;

	static readonly gallons: NSUnitVolume;

	static readonly imperialFluidOunces: NSUnitVolume;

	static readonly imperialGallons: NSUnitVolume;

	static readonly imperialPints: NSUnitVolume;

	static readonly imperialQuarts: NSUnitVolume;

	static readonly imperialTablespoons: NSUnitVolume;

	static readonly imperialTeaspoons: NSUnitVolume;

	static readonly kiloliters: NSUnitVolume;

	static readonly liters: NSUnitVolume;

	static readonly megaliters: NSUnitVolume;

	static readonly metricCups: NSUnitVolume;

	static readonly milliliters: NSUnitVolume;

	static readonly pints: NSUnitVolume;

	static readonly quarts: NSUnitVolume;

	static readonly tablespoons: NSUnitVolume;

	static readonly teaspoons: NSUnitVolume;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class NSUserActivity extends NSObject implements NSItemProviderReading, NSItemProviderWriting {

	static alloc(): NSUserActivity; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static deleteAllSavedUserActivitiesWithCompletionHandler(handler: () => void): void;

	/**
	 * @since 12.0
	 */
	static deleteSavedUserActivitiesWithPersistentIdentifiersCompletionHandler(persistentIdentifiers: NSArray<string> | string[], handler: () => void): void;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): NSUserActivity; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSUserActivity;

	readonly activityType: string;

	/**
	 * @since 14.0
	 */
	readonly appClipActivationPayload: APActivationPayload;

	contentAttributeSet: CSSearchableItemAttributeSet;

	/**
	 * @since 11.3
	 */
	readonly contextIdentifierPath: NSArray<string>;

	delegate: NSUserActivityDelegate;

	/**
	 * @since 11.3
	 */
	readonly detectedBarcodeDescriptor: CIBarcodeDescriptor;

	/**
	 * @since 9.0
	 */
	eligibleForHandoff: boolean;

	/**
	 * @since 12.0
	 */
	eligibleForPrediction: boolean;

	/**
	 * @since 9.0
	 */
	eligibleForPublicIndexing: boolean;

	/**
	 * @since 9.0
	 */
	eligibleForSearch: boolean;

	/**
	 * @since 9.0
	 */
	expirationDate: Date;

	/**
	 * @since 10.1
	 */
	externalMediaContentIdentifier: string;

	/**
	 * @since 10.0
	 */
	readonly interaction: INInteraction;

	/**
	 * @since 11.3
	 */
	readonly isClassKitDeepLink: boolean;

	/**
	 * @since 9.0
	 */
	keywords: NSSet<string>;

	/**
	 * @since 10.0
	 */
	mapItem: MKMapItem;

	/**
	 * @since 12.0
	 */
	readonly ndefMessagePayload: NFCNDEFMessage;

	needsSave: boolean;

	/**
	 * @since 12.0
	 */
	persistentIdentifier: string;

	/**
	 * @since 11.0
	 */
	referrerURL: NSURL;

	/**
	 * @since 9.0
	 */
	requiredUserInfoKeys: NSSet<string>;

	/**
	 * @since 14.0
	 */
	shortcutAvailability: INShortcutAvailabilityOptions;

	/**
	 * @since 12.0
	 */
	suggestedInvocationPhrase: string;

	supportsContinuationStreams: boolean;

	/**
	 * @since 13.0
	 */
	targetContentIdentifier: string;

	title: string;

	userInfo: NSDictionary<any, any>;

	webpageURL: NSURL;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { activityType: string; });

	addUserInfoEntriesFromDictionary(otherDictionary: NSDictionary<any, any>): void;

	becomeCurrent(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	getContinuationStreamsWithCompletionHandler(completionHandler: (p1: NSInputStream, p2: NSOutputStream, p3: NSError) => void): void;

	initWithActivityType(activityType: string): this;

	invalidate(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 9.0
	 */
	resignCurrent(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare const NSUserActivityConnectionUnavailableError: number;

/**
 * @since 8.0
 */
interface NSUserActivityDelegate extends NSObjectProtocol {

	userActivityDidReceiveInputStreamOutputStream?(userActivity: NSUserActivity, inputStream: NSInputStream, outputStream: NSOutputStream): void;

	userActivityWasContinued?(userActivity: NSUserActivity): void;

	userActivityWillSave?(userActivity: NSUserActivity): void;
}
declare var NSUserActivityDelegate: {

	prototype: NSUserActivityDelegate;
};

declare const NSUserActivityErrorMaximum: number;

declare const NSUserActivityErrorMinimum: number;

declare const NSUserActivityHandoffFailedError: number;

declare const NSUserActivityHandoffUserInfoTooLargeError: number;

declare const NSUserActivityRemoteApplicationTimedOutError: number;

declare var NSUserActivityTypeBrowsingWeb: string;

declare const NSUserCancelledError: number;

declare class NSUserDefaults extends NSObject {

	static alloc(): NSUserDefaults; // inherited from NSObject

	static new(): NSUserDefaults; // inherited from NSObject

	static resetStandardUserDefaults(): void;

	readonly volatileDomainNames: NSArray<string>;

	static readonly standardUserDefaults: NSUserDefaults;

	/**
	 * @since 7.0
	 */
	constructor(o: { suiteName: string; });

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	constructor(o: { user: string; });

	/**
	 * @since 4.0
	 */
	URLForKey(defaultName: string): NSURL;

	addSuiteNamed(suiteName: string): void;

	arrayForKey(defaultName: string): NSArray<any>;

	boolForKey(defaultName: string): boolean;

	dataForKey(defaultName: string): NSData;

	dictionaryForKey(defaultName: string): NSDictionary<string, any>;

	dictionaryRepresentation(): NSDictionary<string, any>;

	doubleForKey(defaultName: string): number;

	floatForKey(defaultName: string): number;

	/**
	 * @since 7.0
	 */
	initWithSuiteName(suitename: string): this;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	initWithUser(username: string): this;

	integerForKey(defaultName: string): number;

	objectForKey(defaultName: string): any;

	objectIsForcedForKey(key: string): boolean;

	objectIsForcedForKeyInDomain(key: string, domain: string): boolean;

	persistentDomainForName(domainName: string): NSDictionary<string, any>;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	persistentDomainNames(): NSArray<any>;

	registerDefaults(registrationDictionary: NSDictionary<string, any>): void;

	removeObjectForKey(defaultName: string): void;

	removePersistentDomainForName(domainName: string): void;

	removeSuiteNamed(suiteName: string): void;

	removeVolatileDomainForName(domainName: string): void;

	setBoolForKey(value: boolean, defaultName: string): void;

	setDoubleForKey(value: number, defaultName: string): void;

	setFloatForKey(value: number, defaultName: string): void;

	setIntegerForKey(value: number, defaultName: string): void;

	setObjectForKey(value: any, defaultName: string): void;

	setPersistentDomainForName(domain: NSDictionary<string, any>, domainName: string): void;

	/**
	 * @since 4.0
	 */
	setURLForKey(url: NSURL, defaultName: string): void;

	setVolatileDomainForName(domain: NSDictionary<string, any>, domainName: string): void;

	stringArrayForKey(defaultName: string): NSArray<string>;

	stringForKey(defaultName: string): string;

	synchronize(): boolean;

	volatileDomainForName(domainName: string): NSDictionary<string, any>;
}

declare var NSUserDefaultsDidChangeNotification: string;

/**
 * @since 9.3
 */
declare var NSUserDefaultsSizeLimitExceededNotification: string;

declare function NSUserName(): string;

declare const NSValidationErrorMaximum: number;

declare const NSValidationErrorMinimum: number;

declare class NSValue extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSValue; // inherited from NSObject

	static new(): NSValue; // inherited from NSObject

	static valueWithBytesObjCType(value: interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>): NSValue;

	static valueWithCATransform3D(t: CATransform3D): NSValue;

	static valueWithCGAffineTransform(transform: CGAffineTransform): NSValue;

	static valueWithCGPoint(point: CGPoint): NSValue;

	static valueWithCGRect(rect: CGRect): NSValue;

	static valueWithCGSize(size: CGSize): NSValue;

	static valueWithCGVector(vector: CGVector): NSValue;

	/**
	 * @since 4.0
	 */
	static valueWithCMTime(time: CMTime): NSValue;

	/**
	 * @since 4.0
	 */
	static valueWithCMTimeMapping(timeMapping: CMTimeMapping): NSValue;

	/**
	 * @since 4.0
	 */
	static valueWithCMTimeRange(timeRange: CMTimeRange): NSValue;

	/**
	 * @since 16.0
	 */
	static valueWithCMVideoDimensions(dimensions: CMVideoDimensions): NSValue;

	/**
	 * @since 11.0
	 */
	static valueWithDirectionalEdgeInsets(insets: NSDirectionalEdgeInsets): NSValue;

	/**
	 * @since 17.4
	 */
	static valueWithGCPoint2(point: GCPoint2): NSValue;

	static valueWithMKCoordinate(coordinate: CLLocationCoordinate2D): NSValue;

	static valueWithMKCoordinateSpan(span: MKCoordinateSpan): NSValue;

	static valueWithNonretainedObject(anObject: any): NSValue;

	static valueWithObjCType(value: interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>): NSValue;

	static valueWithPointer(pointer: interop.Pointer | interop.Reference<any>): NSValue;

	static valueWithRange(range: NSRange): NSValue;

	static valueWithSCNMatrix4(v: SCNMatrix4): NSValue;

	static valueWithSCNVector3(v: SCNVector3): NSValue;

	static valueWithSCNVector4(v: SCNVector4): NSValue;

	static valueWithUIEdgeInsets(insets: UIEdgeInsets): NSValue;

	/**
	 * @since 5.0
	 */
	static valueWithUIOffset(insets: UIOffset): NSValue;

	readonly CATransform3DValue: CATransform3D;

	readonly CGAffineTransformValue: CGAffineTransform;

	readonly CGPointValue: CGPoint;

	readonly CGRectValue: CGRect;

	readonly CGSizeValue: CGSize;

	readonly CGVectorValue: CGVector;

	/**
	 * @since 4.0
	 */
	readonly CMTimeMappingValue: CMTimeMapping;

	/**
	 * @since 4.0
	 */
	readonly CMTimeRangeValue: CMTimeRange;

	/**
	 * @since 4.0
	 */
	readonly CMTimeValue: CMTime;

	/**
	 * @since 16.0
	 */
	readonly CMVideoDimensionsValue: CMVideoDimensions;

	/**
	 * @since 17.4
	 */
	readonly GCPoint2Value: GCPoint2;

	readonly MKCoordinateSpanValue: MKCoordinateSpan;

	readonly MKCoordinateValue: CLLocationCoordinate2D;

	readonly SCNMatrix4Value: SCNMatrix4;

	readonly SCNVector3Value: SCNVector3;

	readonly SCNVector4Value: SCNVector4;

	readonly UIEdgeInsetsValue: UIEdgeInsets;

	/**
	 * @since 5.0
	 */
	readonly UIOffsetValue: UIOffset;

	/**
	 * @since 11.0
	 */
	readonly directionalEdgeInsetsValue: NSDirectionalEdgeInsets;

	readonly nonretainedObjectValue: any;

	readonly objCType: interop.Pointer | interop.Reference<any>;

	readonly pointerValue: interop.Pointer | interop.Reference<any>;

	readonly rangeValue: NSRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { bytes: interop.Pointer | interop.Reference<any>; objCType: string | interop.Pointer | interop.Reference<any>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	getValue(value: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 11.0
	 */
	getValueSize(value: interop.Pointer | interop.Reference<any>, size: number): void;

	initWithBytesObjCType(value: interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>): this;

	initWithCoder(coder: NSCoder): this;

	isEqualToValue(value: NSValue): boolean;
}

/**
 * @since 3.0
 */
declare class NSValueTransformer extends NSObject {

	static alloc(): NSValueTransformer; // inherited from NSObject

	static allowsReverseTransformation(): boolean;

	static new(): NSValueTransformer; // inherited from NSObject

	static setValueTransformerForName(transformer: NSValueTransformer, name: string): void;

	static transformedValueClass(): typeof NSObject;

	static valueTransformerForName(name: string): NSValueTransformer;

	static valueTransformerNames(): NSArray<string>;

	reverseTransformedValue(value: any): any;

	transformedValue(value: any): any;
}

/**
 * @since 4.0
 */
declare const enum NSVolumeEnumerationOptions {

	SkipHiddenVolumes = 2,

	ProduceFileReferenceURLs = 4
}

declare var NSWillBecomeMultiThreadedNotification: string;

declare const NSWindows95OperatingSystem: number;

declare const NSWindowsCP1250StringEncoding: number;

declare const NSWindowsCP1251StringEncoding: number;

declare const NSWindowsCP1252StringEncoding: number;

declare const NSWindowsCP1253StringEncoding: number;

declare const NSWindowsCP1254StringEncoding: number;

declare const NSWindowsNTOperatingSystem: number;

declare const NSWrapCalendarComponents: number;

declare class NSXMLParser extends NSObject {

	static alloc(): NSXMLParser; // inherited from NSObject

	static new(): NSXMLParser; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	allowedExternalEntityURLs: NSSet<NSURL>;

	readonly columnNumber: number;

	delegate: NSXMLParserDelegate;

	/**
	 * @since 8.0
	 */
	externalEntityResolvingPolicy: NSXMLParserExternalEntityResolvingPolicy;

	readonly lineNumber: number;

	readonly parserError: NSError;

	readonly publicID: string;

	shouldProcessNamespaces: boolean;

	shouldReportNamespacePrefixes: boolean;

	shouldResolveExternalEntities: boolean;

	readonly systemID: string;

	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { data: NSData; });

	/**
	 * @since 5.0
	 */
	constructor(o: { stream: NSInputStream; });

	abortParsing(): void;

	initWithContentsOfURL(url: NSURL): this;

	initWithData(data: NSData): this;

	/**
	 * @since 5.0
	 */
	initWithStream(stream: NSInputStream): this;

	parse(): boolean;
}

interface NSXMLParserDelegate extends NSObjectProtocol {

	parserDidEndDocument?(parser: NSXMLParser): void;

	parserDidEndElementNamespaceURIQualifiedName?(parser: NSXMLParser, elementName: string, namespaceURI: string, qName: string): void;

	parserDidEndMappingPrefix?(parser: NSXMLParser, prefix: string): void;

	parserDidStartDocument?(parser: NSXMLParser): void;

	parserDidStartElementNamespaceURIQualifiedNameAttributes?(parser: NSXMLParser, elementName: string, namespaceURI: string, qName: string, attributeDict: NSDictionary<string, string>): void;

	parserDidStartMappingPrefixToURI?(parser: NSXMLParser, prefix: string, namespaceURI: string): void;

	parserFoundAttributeDeclarationWithNameForElementTypeDefaultValue?(parser: NSXMLParser, attributeName: string, elementName: string, type: string, defaultValue: string): void;

	parserFoundCDATA?(parser: NSXMLParser, CDATABlock: NSData): void;

	parserFoundCharacters?(parser: NSXMLParser, string: string): void;

	parserFoundComment?(parser: NSXMLParser, comment: string): void;

	parserFoundElementDeclarationWithNameModel?(parser: NSXMLParser, elementName: string, model: string): void;

	parserFoundExternalEntityDeclarationWithNamePublicIDSystemID?(parser: NSXMLParser, name: string, publicID: string, systemID: string): void;

	parserFoundIgnorableWhitespace?(parser: NSXMLParser, whitespaceString: string): void;

	parserFoundInternalEntityDeclarationWithNameValue?(parser: NSXMLParser, name: string, value: string): void;

	parserFoundNotationDeclarationWithNamePublicIDSystemID?(parser: NSXMLParser, name: string, publicID: string, systemID: string): void;

	parserFoundProcessingInstructionWithTargetData?(parser: NSXMLParser, target: string, data: string): void;

	parserFoundUnparsedEntityDeclarationWithNamePublicIDSystemIDNotationName?(parser: NSXMLParser, name: string, publicID: string, systemID: string, notationName: string): void;

	parserParseErrorOccurred?(parser: NSXMLParser, parseError: NSError): void;

	parserResolveExternalEntityNameSystemID?(parser: NSXMLParser, name: string, systemID: string): NSData;

	parserValidationErrorOccurred?(parser: NSXMLParser, validationError: NSError): void;
}
declare var NSXMLParserDelegate: {

	prototype: NSXMLParserDelegate;
};

declare const enum NSXMLParserError {

	InternalError = 1,

	OutOfMemoryError = 2,

	DocumentStartError = 3,

	EmptyDocumentError = 4,

	PrematureDocumentEndError = 5,

	InvalidHexCharacterRefError = 6,

	InvalidDecimalCharacterRefError = 7,

	InvalidCharacterRefError = 8,

	InvalidCharacterError = 9,

	CharacterRefAtEOFError = 10,

	CharacterRefInPrologError = 11,

	CharacterRefInEpilogError = 12,

	CharacterRefInDTDError = 13,

	EntityRefAtEOFError = 14,

	EntityRefInPrologError = 15,

	EntityRefInEpilogError = 16,

	EntityRefInDTDError = 17,

	ParsedEntityRefAtEOFError = 18,

	ParsedEntityRefInPrologError = 19,

	ParsedEntityRefInEpilogError = 20,

	ParsedEntityRefInInternalSubsetError = 21,

	EntityReferenceWithoutNameError = 22,

	EntityReferenceMissingSemiError = 23,

	ParsedEntityRefNoNameError = 24,

	ParsedEntityRefMissingSemiError = 25,

	UndeclaredEntityError = 26,

	UnparsedEntityError = 28,

	EntityIsExternalError = 29,

	EntityIsParameterError = 30,

	UnknownEncodingError = 31,

	EncodingNotSupportedError = 32,

	StringNotStartedError = 33,

	StringNotClosedError = 34,

	NamespaceDeclarationError = 35,

	EntityNotStartedError = 36,

	EntityNotFinishedError = 37,

	LessThanSymbolInAttributeError = 38,

	AttributeNotStartedError = 39,

	AttributeNotFinishedError = 40,

	AttributeHasNoValueError = 41,

	AttributeRedefinedError = 42,

	LiteralNotStartedError = 43,

	LiteralNotFinishedError = 44,

	CommentNotFinishedError = 45,

	ProcessingInstructionNotStartedError = 46,

	ProcessingInstructionNotFinishedError = 47,

	NotationNotStartedError = 48,

	NotationNotFinishedError = 49,

	AttributeListNotStartedError = 50,

	AttributeListNotFinishedError = 51,

	MixedContentDeclNotStartedError = 52,

	MixedContentDeclNotFinishedError = 53,

	ElementContentDeclNotStartedError = 54,

	ElementContentDeclNotFinishedError = 55,

	XMLDeclNotStartedError = 56,

	XMLDeclNotFinishedError = 57,

	ConditionalSectionNotStartedError = 58,

	ConditionalSectionNotFinishedError = 59,

	ExternalSubsetNotFinishedError = 60,

	DOCTYPEDeclNotFinishedError = 61,

	MisplacedCDATAEndStringError = 62,

	CDATANotFinishedError = 63,

	MisplacedXMLDeclarationError = 64,

	SpaceRequiredError = 65,

	SeparatorRequiredError = 66,

	NMTOKENRequiredError = 67,

	NAMERequiredError = 68,

	PCDATARequiredError = 69,

	URIRequiredError = 70,

	PublicIdentifierRequiredError = 71,

	LTRequiredError = 72,

	GTRequiredError = 73,

	LTSlashRequiredError = 74,

	EqualExpectedError = 75,

	TagNameMismatchError = 76,

	UnfinishedTagError = 77,

	StandaloneValueError = 78,

	InvalidEncodingNameError = 79,

	CommentContainsDoubleHyphenError = 80,

	InvalidEncodingError = 81,

	ExternalStandaloneEntityError = 82,

	InvalidConditionalSectionError = 83,

	EntityValueRequiredError = 84,

	NotWellBalancedError = 85,

	ExtraContentError = 86,

	InvalidCharacterInEntityError = 87,

	ParsedEntityRefInInternalError = 88,

	EntityRefLoopError = 89,

	EntityBoundaryError = 90,

	InvalidURIError = 91,

	URIFragmentError = 92,

	NoDTDError = 94,

	DelegateAbortedParseError = 512
}

/**
 * @since 2.0
 */
declare var NSXMLParserErrorDomain: string;

declare const enum NSXMLParserExternalEntityResolvingPolicy {

	ResolveExternalEntitiesNever = 0,

	ResolveExternalEntitiesNoNetwork = 1,

	ResolveExternalEntitiesSameOriginOnly = 2,

	ResolveExternalEntitiesAlways = 3
}

/**
 * @since 6.0
 */
declare class NSXPCCoder extends NSCoder {

	static alloc(): NSXPCCoder; // inherited from NSObject

	static new(): NSXPCCoder; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly connection: NSXPCConnection;

	userInfo: NSObjectProtocol;

	/**
	 * @since 7.0
	 */
	decodeXPCObjectOfTypeForKey(type: interop.Pointer | interop.Reference<any>, key: string): NSObject & OS_xpc_object;

	encodeXPCObjectForKey(xpcObject: NSObject & OS_xpc_object, key: string): void;
}

/**
 * @since 6.0
 */
declare class NSXPCConnection extends NSObject implements NSXPCProxyCreating {

	static alloc(): NSXPCConnection; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static currentConnection(): NSXPCConnection;

	static new(): NSXPCConnection; // inherited from NSObject

	readonly auditSessionIdentifier: number;

	readonly effectiveGroupIdentifier: number;

	readonly effectiveUserIdentifier: number;

	readonly endpoint: NSXPCListenerEndpoint;

	exportedInterface: NSXPCInterface;

	exportedObject: any;

	interruptionHandler: () => void;

	invalidationHandler: () => void;

	readonly processIdentifier: number;

	remoteObjectInterface: NSXPCInterface;

	readonly remoteObjectProxy: any;

	readonly serviceName: string;

	constructor(o: { listenerEndpoint: NSXPCListenerEndpoint; });

	/**
	 * @since 14.0
	 */
	activate(): void;

	initWithListenerEndpoint(endpoint: NSXPCListenerEndpoint): this;

	invalidate(): void;

	remoteObjectProxyWithErrorHandler(handler: (p1: NSError) => void): any;

	resume(): void;

	/**
	 * @since 13.0
	 */
	scheduleSendBarrierBlock(block: () => void): void;

	suspend(): void;

	/**
	 * @since 9.0
	 */
	synchronousRemoteObjectProxyWithErrorHandler(handler: (p1: NSError) => void): any;
}

declare const NSXPCConnectionCodeSigningRequirementFailure: number;

declare const NSXPCConnectionErrorMaximum: number;

declare const NSXPCConnectionErrorMinimum: number;

declare const NSXPCConnectionInterrupted: number;

declare const NSXPCConnectionInvalid: number;

/**
 * @since 6.0
 */
declare const enum NSXPCConnectionOptions {

	Privileged = 4096
}

declare const NSXPCConnectionReplyInvalid: number;

/**
 * @since 6.0
 */
declare class NSXPCInterface extends NSObject {

	static alloc(): NSXPCInterface; // inherited from NSObject

	static interfaceWithProtocol(protocol: any /* Protocol */): NSXPCInterface;

	static new(): NSXPCInterface; // inherited from NSObject

	protocol: any /* Protocol */;

	/**
	 * @since 13.0
	 */
	XPCTypeForSelectorArgumentIndexOfReply(sel: string, arg: number, ofReply: boolean): interop.Pointer | interop.Reference<any>;

	classesForSelectorArgumentIndexOfReply(sel: string, arg: number, ofReply: boolean): NSSet<typeof NSObject>;

	interfaceForSelectorArgumentIndexOfReply(sel: string, arg: number, ofReply: boolean): NSXPCInterface;

	setClassesForSelectorArgumentIndexOfReply(classes: NSSet<typeof NSObject>, sel: string, arg: number, ofReply: boolean): void;

	setInterfaceForSelectorArgumentIndexOfReply(ifc: NSXPCInterface, sel: string, arg: number, ofReply: boolean): void;

	/**
	 * @since 13.0
	 */
	setXPCTypeForSelectorArgumentIndexOfReply(type: interop.Pointer | interop.Reference<any>, sel: string, arg: number, ofReply: boolean): void;
}

/**
 * @since 6.0
 */
declare class NSXPCListener extends NSObject {

	static alloc(): NSXPCListener; // inherited from NSObject

	static anonymousListener(): NSXPCListener;

	static new(): NSXPCListener; // inherited from NSObject

	static serviceListener(): NSXPCListener;

	delegate: NSXPCListenerDelegate;

	readonly endpoint: NSXPCListenerEndpoint;

	/**
	 * @since 14.0
	 */
	activate(): void;

	invalidate(): void;

	resume(): void;

	suspend(): void;
}

interface NSXPCListenerDelegate extends NSObjectProtocol {

	listenerShouldAcceptNewConnection?(listener: NSXPCListener, newConnection: NSXPCConnection): boolean;
}
declare var NSXPCListenerDelegate: {

	prototype: NSXPCListenerDelegate;
};

/**
 * @since 6.0
 */
declare class NSXPCListenerEndpoint extends NSObject implements NSSecureCoding {

	static alloc(): NSXPCListenerEndpoint; // inherited from NSObject

	static new(): NSXPCListenerEndpoint; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

interface NSXPCProxyCreating {

	remoteObjectProxy: any;

	remoteObjectProxyWithErrorHandler(handler: (p1: NSError) => void): any;

	/**
	 * @since 9.0
	 */
	synchronousRemoteObjectProxyWithErrorHandler?(handler: (p1: NSError) => void): any;
}
declare var NSXPCProxyCreating: {

	prototype: NSXPCProxyCreating;
};

declare function NSZoneCalloc(zone: interop.Pointer | interop.Reference<any>, numElems: number, byteSize: number): interop.Pointer | interop.Reference<any>;

declare function NSZoneFree(zone: interop.Pointer | interop.Reference<any>, ptr: interop.Pointer | interop.Reference<any>): void;

declare function NSZoneFromPointer(ptr: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function NSZoneMalloc(zone: interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare function NSZoneName(zone: interop.Pointer | interop.Reference<any>): string;

declare function NSZoneRealloc(zone: interop.Pointer | interop.Reference<any>, ptr: interop.Pointer | interop.Reference<any>, size: number): interop.Pointer | interop.Reference<any>;

declare const NS_BigEndian: number;

declare const NS_LittleEndian: number;

declare const NS_UnknownByteOrder: number;

interface _expressionFlags {
	_evaluationBlocked: number;
	_usesKVC: number;
	_validatedExpression: number;
	_validatedKeys: number;
	_reservedExpressionFlags: number;
}
declare var _expressionFlags: interop.StructType<_expressionFlags>;

interface _predicateFlags {
	_evaluationBlocked: number;
	_reservedPredicateFlags: number;
}
declare var _predicateFlags: interop.StructType<_predicateFlags>;
