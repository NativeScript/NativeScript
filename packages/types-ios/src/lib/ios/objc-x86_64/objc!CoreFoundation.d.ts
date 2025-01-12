
/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFAbsoluteTimeAddGregorianUnits(at: number, tz: NSTimeZone, units: CFGregorianUnits): number;

declare function CFAbsoluteTimeGetCurrent(): number;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFAbsoluteTimeGetDayOfWeek(at: number, tz: NSTimeZone): number;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFAbsoluteTimeGetDayOfYear(at: number, tz: NSTimeZone): number;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFAbsoluteTimeGetDifferenceAsGregorianUnits(at1: number, at2: number, tz: NSTimeZone, unitFlags: number): CFGregorianUnits;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFAbsoluteTimeGetGregorianDate(at: number, tz: NSTimeZone): CFGregorianDate;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFAbsoluteTimeGetWeekOfYear(at: number, tz: NSTimeZone): number;

declare function CFAllocatorAllocate(allocator: any, size: number, hint: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 18.0
 */
declare function CFAllocatorAllocateBytes(allocator: any, size: number, hint: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 18.0
 */
declare function CFAllocatorAllocateTyped(allocator: any, size: number, descriptor: number, hint: number): interop.Pointer | interop.Reference<any>;

interface CFAllocatorContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	allocate: interop.FunctionReference<(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	reallocate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	deallocate: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>;
	preferredSize: interop.FunctionReference<(p1: number, p2: number, p3: interop.Pointer | interop.Reference<any>) => number>;
}
declare var CFAllocatorContext: interop.StructType<CFAllocatorContext>;

declare function CFAllocatorCreate(allocator: any, context: interop.Pointer | interop.Reference<CFAllocatorContext>): interop.Unmanaged<any>;

declare function CFAllocatorDeallocate(allocator: any, ptr: interop.Pointer | interop.Reference<any>): void;

declare function CFAllocatorGetContext(allocator: any, context: interop.Pointer | interop.Reference<CFAllocatorContext>): void;

declare function CFAllocatorGetDefault(): interop.Unmanaged<any>;

declare function CFAllocatorGetPreferredSizeForSize(allocator: any, size: number, hint: number): number;

declare function CFAllocatorGetTypeID(): number;

declare function CFAllocatorReallocate(allocator: any, ptr: interop.Pointer | interop.Reference<any>, newsize: number, hint: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 18.0
 */
declare function CFAllocatorReallocateBytes(allocator: any, ptr: interop.Pointer | interop.Reference<any>, newsize: number, hint: number): interop.Pointer | interop.Reference<any>;

/**
 * @since 18.0
 */
declare function CFAllocatorReallocateTyped(allocator: any, ptr: interop.Pointer | interop.Reference<any>, newsize: number, descriptor: number, hint: number): interop.Pointer | interop.Reference<any>;

declare function CFAllocatorSetDefault(allocator: any): void;

declare function CFArrayAppendArray(theArray: NSArray<any> | any[], otherArray: NSArray<any> | any[], otherRange: CFRange): void;

declare function CFArrayAppendValue(theArray: NSArray<any> | any[], value: interop.Pointer | interop.Reference<any>): void;

declare function CFArrayApplyFunction(theArray: NSArray<any> | any[], range: CFRange, applier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

declare function CFArrayBSearchValues(theArray: NSArray<any> | any[], range: CFRange, value: interop.Pointer | interop.Reference<any>, comparator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => CFComparisonResult>, context: interop.Pointer | interop.Reference<any>): number;

interface CFArrayCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
}
declare var CFArrayCallBacks: interop.StructType<CFArrayCallBacks>;

declare function CFArrayContainsValue(theArray: NSArray<any> | any[], range: CFRange, value: interop.Pointer | interop.Reference<any>): boolean;

declare function CFArrayCreate(allocator: any, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, numValues: number, callBacks: interop.Pointer | interop.Reference<CFArrayCallBacks>): NSArray<any>;

declare function CFArrayCreateCopy(allocator: any, theArray: NSArray<any> | any[]): NSArray<any>;

declare function CFArrayCreateMutable(allocator: any, capacity: number, callBacks: interop.Pointer | interop.Reference<CFArrayCallBacks>): NSArray<any>;

declare function CFArrayCreateMutableCopy(allocator: any, capacity: number, theArray: NSArray<any> | any[]): NSArray<any>;

declare function CFArrayExchangeValuesAtIndices(theArray: NSArray<any> | any[], idx1: number, idx2: number): void;

declare function CFArrayGetCount(theArray: NSArray<any> | any[]): number;

declare function CFArrayGetCountOfValue(theArray: NSArray<any> | any[], range: CFRange, value: interop.Pointer | interop.Reference<any>): number;

declare function CFArrayGetFirstIndexOfValue(theArray: NSArray<any> | any[], range: CFRange, value: interop.Pointer | interop.Reference<any>): number;

declare function CFArrayGetLastIndexOfValue(theArray: NSArray<any> | any[], range: CFRange, value: interop.Pointer | interop.Reference<any>): number;

declare function CFArrayGetTypeID(): number;

declare function CFArrayGetValueAtIndex(theArray: NSArray<any> | any[], idx: number): interop.Pointer | interop.Reference<any>;

declare function CFArrayGetValues(theArray: NSArray<any> | any[], range: CFRange, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFArrayInsertValueAtIndex(theArray: NSArray<any> | any[], idx: number, value: interop.Pointer | interop.Reference<any>): void;

declare function CFArrayRemoveAllValues(theArray: NSArray<any> | any[]): void;

declare function CFArrayRemoveValueAtIndex(theArray: NSArray<any> | any[], idx: number): void;

declare function CFArrayReplaceValues(theArray: NSArray<any> | any[], range: CFRange, newValues: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, newCount: number): void;

declare function CFArraySetValueAtIndex(theArray: NSArray<any> | any[], idx: number, value: interop.Pointer | interop.Reference<any>): void;

declare function CFArraySortValues(theArray: NSArray<any> | any[], range: CFRange, comparator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => CFComparisonResult>, context: interop.Pointer | interop.Reference<any>): void;

declare function CFAttributedStringBeginEditing(aStr: NSAttributedString): void;

declare function CFAttributedStringCreate(alloc: any, str: string, attributes: NSDictionary<any, any>): NSAttributedString;

declare function CFAttributedStringCreateCopy(alloc: any, aStr: NSAttributedString): NSAttributedString;

declare function CFAttributedStringCreateMutable(alloc: any, maxLength: number): NSAttributedString;

declare function CFAttributedStringCreateMutableCopy(alloc: any, maxLength: number, aStr: NSAttributedString): NSAttributedString;

declare function CFAttributedStringCreateWithSubstring(alloc: any, aStr: NSAttributedString, range: CFRange): NSAttributedString;

declare function CFAttributedStringEndEditing(aStr: NSAttributedString): void;

declare function CFAttributedStringGetAttribute(aStr: NSAttributedString, loc: number, attrName: string, effectiveRange: interop.Pointer | interop.Reference<CFRange>): any;

declare function CFAttributedStringGetAttributeAndLongestEffectiveRange(aStr: NSAttributedString, loc: number, attrName: string, inRange: CFRange, longestEffectiveRange: interop.Pointer | interop.Reference<CFRange>): any;

declare function CFAttributedStringGetAttributes(aStr: NSAttributedString, loc: number, effectiveRange: interop.Pointer | interop.Reference<CFRange>): NSDictionary<any, any>;

declare function CFAttributedStringGetAttributesAndLongestEffectiveRange(aStr: NSAttributedString, loc: number, inRange: CFRange, longestEffectiveRange: interop.Pointer | interop.Reference<CFRange>): NSDictionary<any, any>;

declare function CFAttributedStringGetBidiLevelsAndResolvedDirections(attributedString: NSAttributedString, range: CFRange, baseDirection: number, bidiLevels: string | interop.Pointer | interop.Reference<any>, baseDirections: string | interop.Pointer | interop.Reference<any>): boolean;

declare function CFAttributedStringGetLength(aStr: NSAttributedString): number;

declare function CFAttributedStringGetMutableString(aStr: NSAttributedString): string;

declare function CFAttributedStringGetString(aStr: NSAttributedString): string;

declare function CFAttributedStringGetTypeID(): number;

declare function CFAttributedStringRemoveAttribute(aStr: NSAttributedString, range: CFRange, attrName: string): void;

declare function CFAttributedStringReplaceAttributedString(aStr: NSAttributedString, range: CFRange, replacement: NSAttributedString): void;

declare function CFAttributedStringReplaceString(aStr: NSAttributedString, range: CFRange, replacement: string): void;

declare function CFAttributedStringSetAttribute(aStr: NSAttributedString, range: CFRange, attrName: string, value: any): void;

declare function CFAttributedStringSetAttributes(aStr: NSAttributedString, range: CFRange, replacement: NSDictionary<any, any>, clearOtherAttributes: boolean): void;

/**
 * @since 7.0
 */
declare function CFAutorelease(arg: any): any;

declare function CFBagAddValue(theBag: any, value: interop.Pointer | interop.Reference<any>): void;

declare function CFBagApplyFunction(theBag: any, applier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

interface CFBagCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var CFBagCallBacks: interop.StructType<CFBagCallBacks>;

declare function CFBagContainsValue(theBag: any, value: interop.Pointer | interop.Reference<any>): boolean;

declare function CFBagCreate(allocator: any, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, numValues: number, callBacks: interop.Pointer | interop.Reference<CFBagCallBacks>): any;

declare function CFBagCreateCopy(allocator: any, theBag: any): any;

declare function CFBagCreateMutable(allocator: any, capacity: number, callBacks: interop.Pointer | interop.Reference<CFBagCallBacks>): any;

declare function CFBagCreateMutableCopy(allocator: any, capacity: number, theBag: any): any;

declare function CFBagGetCount(theBag: any): number;

declare function CFBagGetCountOfValue(theBag: any, value: interop.Pointer | interop.Reference<any>): number;

declare function CFBagGetTypeID(): number;

declare function CFBagGetValue(theBag: any, value: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function CFBagGetValueIfPresent(theBag: any, candidate: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function CFBagGetValues(theBag: any, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFBagRemoveAllValues(theBag: any): void;

declare function CFBagRemoveValue(theBag: any, value: interop.Pointer | interop.Reference<any>): void;

declare function CFBagReplaceValue(theBag: any, value: interop.Pointer | interop.Reference<any>): void;

declare function CFBagSetValue(theBag: any, value: interop.Pointer | interop.Reference<any>): void;

declare function CFBinaryHeapAddValue(heap: any, value: interop.Pointer | interop.Reference<any>): void;

declare function CFBinaryHeapApplyFunction(heap: any, applier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

interface CFBinaryHeapCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	compare: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => CFComparisonResult>;
}
declare var CFBinaryHeapCallBacks: interop.StructType<CFBinaryHeapCallBacks>;

interface CFBinaryHeapCompareContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFBinaryHeapCompareContext: interop.StructType<CFBinaryHeapCompareContext>;

declare function CFBinaryHeapContainsValue(heap: any, value: interop.Pointer | interop.Reference<any>): boolean;

declare function CFBinaryHeapCreate(allocator: any, capacity: number, callBacks: interop.Pointer | interop.Reference<CFBinaryHeapCallBacks>, compareContext: interop.Pointer | interop.Reference<CFBinaryHeapCompareContext>): any;

declare function CFBinaryHeapCreateCopy(allocator: any, capacity: number, heap: any): any;

declare function CFBinaryHeapGetCount(heap: any): number;

declare function CFBinaryHeapGetCountOfValue(heap: any, value: interop.Pointer | interop.Reference<any>): number;

declare function CFBinaryHeapGetMinimum(heap: any): interop.Pointer | interop.Reference<any>;

declare function CFBinaryHeapGetMinimumIfPresent(heap: any, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function CFBinaryHeapGetTypeID(): number;

declare function CFBinaryHeapGetValues(heap: any, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFBinaryHeapRemoveAllValues(heap: any): void;

declare function CFBinaryHeapRemoveMinimumValue(heap: any): void;

declare function CFBitVectorContainsBit(bv: any, range: CFRange, value: number): boolean;

declare function CFBitVectorCreate(allocator: any, bytes: string | interop.Pointer | interop.Reference<any>, numBits: number): any;

declare function CFBitVectorCreateCopy(allocator: any, bv: any): any;

declare function CFBitVectorCreateMutable(allocator: any, capacity: number): any;

declare function CFBitVectorCreateMutableCopy(allocator: any, capacity: number, bv: any): any;

declare function CFBitVectorFlipBitAtIndex(bv: any, idx: number): void;

declare function CFBitVectorFlipBits(bv: any, range: CFRange): void;

declare function CFBitVectorGetBitAtIndex(bv: any, idx: number): number;

declare function CFBitVectorGetBits(bv: any, range: CFRange, bytes: string | interop.Pointer | interop.Reference<any>): void;

declare function CFBitVectorGetCount(bv: any): number;

declare function CFBitVectorGetCountOfBit(bv: any, range: CFRange, value: number): number;

declare function CFBitVectorGetFirstIndexOfBit(bv: any, range: CFRange, value: number): number;

declare function CFBitVectorGetLastIndexOfBit(bv: any, range: CFRange, value: number): number;

declare function CFBitVectorGetTypeID(): number;

declare function CFBitVectorSetAllBits(bv: any, value: number): void;

declare function CFBitVectorSetBitAtIndex(bv: any, idx: number, value: number): void;

declare function CFBitVectorSetBits(bv: any, range: CFRange, value: number): void;

declare function CFBitVectorSetCount(bv: any, count: number): void;

declare function CFBooleanGetTypeID(): number;

declare function CFBooleanGetValue(boolean: number): boolean;

declare function CFBundleCopyAuxiliaryExecutableURL(bundle: any, executableName: string): NSURL;

declare function CFBundleCopyBuiltInPlugInsURL(bundle: any): NSURL;

declare function CFBundleCopyBundleLocalizations(bundle: any): NSArray<any>;

declare function CFBundleCopyBundleURL(bundle: any): NSURL;

/**
 * @since 2.0
 */
declare function CFBundleCopyExecutableArchitectures(bundle: any): NSArray<any>;

/**
 * @since 2.0
 */
declare function CFBundleCopyExecutableArchitecturesForURL(url: NSURL): NSArray<any>;

declare function CFBundleCopyExecutableURL(bundle: any): NSURL;

declare function CFBundleCopyInfoDictionaryForURL(url: NSURL): NSDictionary<any, any>;

declare function CFBundleCopyInfoDictionaryInDirectory(bundleURL: NSURL): NSDictionary<any, any>;

declare function CFBundleCopyLocalizationsForPreferences(locArray: NSArray<any> | any[], prefArray: NSArray<any> | any[]): NSArray<any>;

declare function CFBundleCopyLocalizationsForURL(url: NSURL): NSArray<any>;

declare function CFBundleCopyLocalizedString(bundle: any, key: string, value: string, tableName: string): string;

declare function CFBundleCopyPreferredLocalizationsFromArray(locArray: NSArray<any> | any[]): NSArray<any>;

declare function CFBundleCopyPrivateFrameworksURL(bundle: any): NSURL;

declare function CFBundleCopyResourceURL(bundle: any, resourceName: string, resourceType: string, subDirName: string): NSURL;

declare function CFBundleCopyResourceURLForLocalization(bundle: any, resourceName: string, resourceType: string, subDirName: string, localizationName: string): NSURL;

declare function CFBundleCopyResourceURLInDirectory(bundleURL: NSURL, resourceName: string, resourceType: string, subDirName: string): NSURL;

declare function CFBundleCopyResourceURLsOfType(bundle: any, resourceType: string, subDirName: string): NSArray<any>;

declare function CFBundleCopyResourceURLsOfTypeForLocalization(bundle: any, resourceType: string, subDirName: string, localizationName: string): NSArray<any>;

declare function CFBundleCopyResourceURLsOfTypeInDirectory(bundleURL: NSURL, resourceType: string, subDirName: string): NSArray<any>;

declare function CFBundleCopyResourcesDirectoryURL(bundle: any): NSURL;

declare function CFBundleCopySharedFrameworksURL(bundle: any): NSURL;

declare function CFBundleCopySharedSupportURL(bundle: any): NSURL;

declare function CFBundleCopySupportFilesDirectoryURL(bundle: any): NSURL;

declare function CFBundleCreate(allocator: any, bundleURL: NSURL): any;

declare function CFBundleCreateBundlesFromDirectory(allocator: any, directoryURL: NSURL, bundleType: string): NSArray<any>;

declare function CFBundleGetAllBundles(): NSArray<any>;

declare function CFBundleGetBundleWithIdentifier(bundleID: string): any;

declare function CFBundleGetDataPointerForName(bundle: any, symbolName: string): interop.Pointer | interop.Reference<any>;

declare function CFBundleGetDataPointersForNames(bundle: any, symbolNames: NSArray<any> | any[], stbl: interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFBundleGetDevelopmentRegion(bundle: any): string;

declare function CFBundleGetFunctionPointerForName(bundle: any, functionName: string): interop.Pointer | interop.Reference<any>;

declare function CFBundleGetFunctionPointersForNames(bundle: any, functionNames: NSArray<any> | any[], ftbl: interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFBundleGetIdentifier(bundle: any): string;

declare function CFBundleGetInfoDictionary(bundle: any): NSDictionary<any, any>;

declare function CFBundleGetLocalInfoDictionary(bundle: any): NSDictionary<any, any>;

declare function CFBundleGetMainBundle(): any;

declare function CFBundleGetPackageInfo(bundle: any, packageType: interop.Pointer | interop.Reference<number>, packageCreator: interop.Pointer | interop.Reference<number>): void;

declare function CFBundleGetPackageInfoInDirectory(url: NSURL, packageType: interop.Pointer | interop.Reference<number>, packageCreator: interop.Pointer | interop.Reference<number>): boolean;

declare function CFBundleGetPlugIn(bundle: any): any;

declare function CFBundleGetTypeID(): number;

declare function CFBundleGetValueForInfoDictionaryKey(bundle: any, key: string): any;

declare function CFBundleGetVersionNumber(bundle: any): number;

declare function CFBundleIsExecutableLoaded(bundle: any): boolean;

declare function CFBundleLoadExecutable(bundle: any): boolean;

/**
 * @since 2.0
 */
declare function CFBundleLoadExecutableAndReturnError(bundle: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 */
declare function CFBundlePreflightExecutable(bundle: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

declare function CFBundleUnloadExecutable(bundle: any): void;

declare function CFCalendarCopyCurrent(): NSCalendar;

declare function CFCalendarCopyLocale(calendar: NSCalendar): NSLocale;

declare function CFCalendarCopyTimeZone(calendar: NSCalendar): NSTimeZone;

declare function CFCalendarCreateWithIdentifier(allocator: any, identifier: string): NSCalendar;

declare function CFCalendarGetFirstWeekday(calendar: NSCalendar): number;

declare function CFCalendarGetIdentifier(calendar: NSCalendar): string;

declare function CFCalendarGetMaximumRangeOfUnit(calendar: NSCalendar, unit: CFCalendarUnit): CFRange;

declare function CFCalendarGetMinimumDaysInFirstWeek(calendar: NSCalendar): number;

declare function CFCalendarGetMinimumRangeOfUnit(calendar: NSCalendar, unit: CFCalendarUnit): CFRange;

declare function CFCalendarGetOrdinalityOfUnit(calendar: NSCalendar, smallerUnit: CFCalendarUnit, biggerUnit: CFCalendarUnit, at: number): number;

declare function CFCalendarGetRangeOfUnit(calendar: NSCalendar, smallerUnit: CFCalendarUnit, biggerUnit: CFCalendarUnit, at: number): CFRange;

/**
 * @since 2.0
 */
declare function CFCalendarGetTimeRangeOfUnit(calendar: NSCalendar, unit: CFCalendarUnit, at: number, startp: interop.Pointer | interop.Reference<number>, tip: interop.Pointer | interop.Reference<number>): boolean;

declare function CFCalendarGetTypeID(): number;

declare function CFCalendarSetFirstWeekday(calendar: NSCalendar, wkdy: number): void;

declare function CFCalendarSetLocale(calendar: NSCalendar, locale: NSLocale): void;

declare function CFCalendarSetMinimumDaysInFirstWeek(calendar: NSCalendar, mwd: number): void;

declare function CFCalendarSetTimeZone(calendar: NSCalendar, tz: NSTimeZone): void;

declare const enum CFCalendarUnit {

	kCFCalendarUnitEra = 2,

	kCFCalendarUnitYear = 4,

	kCFCalendarUnitMonth = 8,

	kCFCalendarUnitDay = 16,

	kCFCalendarUnitHour = 32,

	kCFCalendarUnitMinute = 64,

	kCFCalendarUnitSecond = 128,

	kCFCalendarUnitWeek = 256,

	kCFCalendarUnitWeekday = 512,

	kCFCalendarUnitWeekdayOrdinal = 1024,

	kCFCalendarUnitQuarter = 2048,

	kCFCalendarUnitWeekOfMonth = 4096,

	kCFCalendarUnitWeekOfYear = 8192,

	kCFCalendarUnitYearForWeekOfYear = 16384,

	kCFCalendarUnitDayOfYear = 65536
}

declare function CFCharacterSetAddCharactersInRange(theSet: NSCharacterSet, theRange: CFRange): void;

declare function CFCharacterSetAddCharactersInString(theSet: NSCharacterSet, theString: string): void;

declare function CFCharacterSetCreateBitmapRepresentation(alloc: any, theSet: NSCharacterSet): NSData;

declare function CFCharacterSetCreateCopy(alloc: any, theSet: NSCharacterSet): NSCharacterSet;

declare function CFCharacterSetCreateInvertedSet(alloc: any, theSet: NSCharacterSet): NSCharacterSet;

declare function CFCharacterSetCreateMutable(alloc: any): NSCharacterSet;

declare function CFCharacterSetCreateMutableCopy(alloc: any, theSet: NSCharacterSet): NSCharacterSet;

declare function CFCharacterSetCreateWithBitmapRepresentation(alloc: any, theData: NSData): NSCharacterSet;

declare function CFCharacterSetCreateWithCharactersInRange(alloc: any, theRange: CFRange): NSCharacterSet;

declare function CFCharacterSetCreateWithCharactersInString(alloc: any, theString: string): NSCharacterSet;

declare function CFCharacterSetGetPredefined(theSetIdentifier: CFCharacterSetPredefinedSet): NSCharacterSet;

declare function CFCharacterSetGetTypeID(): number;

declare function CFCharacterSetHasMemberInPlane(theSet: NSCharacterSet, thePlane: number): boolean;

declare function CFCharacterSetIntersect(theSet: NSCharacterSet, theOtherSet: NSCharacterSet): void;

declare function CFCharacterSetInvert(theSet: NSCharacterSet): void;

declare function CFCharacterSetIsCharacterMember(theSet: NSCharacterSet, theChar: number): boolean;

declare function CFCharacterSetIsLongCharacterMember(theSet: NSCharacterSet, theChar: number): boolean;

declare function CFCharacterSetIsSupersetOfSet(theSet: NSCharacterSet, theOtherset: NSCharacterSet): boolean;

declare const enum CFCharacterSetPredefinedSet {

	kCFCharacterSetControl = 1,

	kCFCharacterSetWhitespace = 2,

	kCFCharacterSetWhitespaceAndNewline = 3,

	kCFCharacterSetDecimalDigit = 4,

	kCFCharacterSetLetter = 5,

	kCFCharacterSetLowercaseLetter = 6,

	kCFCharacterSetUppercaseLetter = 7,

	kCFCharacterSetNonBase = 8,

	kCFCharacterSetDecomposable = 9,

	kCFCharacterSetAlphaNumeric = 10,

	kCFCharacterSetPunctuation = 11,

	kCFCharacterSetCapitalizedLetter = 13,

	kCFCharacterSetSymbol = 14,

	kCFCharacterSetNewline = 15,

	kCFCharacterSetIllegal = 12
}

declare function CFCharacterSetRemoveCharactersInRange(theSet: NSCharacterSet, theRange: CFRange): void;

declare function CFCharacterSetRemoveCharactersInString(theSet: NSCharacterSet, theString: string): void;

declare function CFCharacterSetUnion(theSet: NSCharacterSet, theOtherSet: NSCharacterSet): void;

declare const enum CFComparisonResult {

	kCFCompareLessThan = -1,

	kCFCompareEqualTo = 0,

	kCFCompareGreaterThan = 1
}

declare function CFCopyDescription(cf: any): string;

/**
 * @since 5.0
 */
declare function CFCopyHomeDirectoryURL(): NSURL;

declare function CFCopyTypeIDDescription(type_id: number): string;

declare function CFDataAppendBytes(theData: NSData, bytes: string | interop.Pointer | interop.Reference<any>, length: number): void;

declare function CFDataCreate(allocator: any, bytes: string | interop.Pointer | interop.Reference<any>, length: number): NSData;

declare function CFDataCreateCopy(allocator: any, theData: NSData): NSData;

declare function CFDataCreateMutable(allocator: any, capacity: number): NSData;

declare function CFDataCreateMutableCopy(allocator: any, capacity: number, theData: NSData): NSData;

declare function CFDataCreateWithBytesNoCopy(allocator: any, bytes: string | interop.Pointer | interop.Reference<any>, length: number, bytesDeallocator: any): NSData;

declare function CFDataDeleteBytes(theData: NSData, range: CFRange): void;

/**
 * @since 4.0
 */
declare function CFDataFind(theData: NSData, dataToFind: NSData, searchRange: CFRange, compareOptions: CFDataSearchFlags): CFRange;

declare function CFDataGetBytePtr(theData: NSData): interop.Pointer | interop.Reference<any>;

declare function CFDataGetBytes(theData: NSData, range: CFRange, buffer: string | interop.Pointer | interop.Reference<any>): void;

declare function CFDataGetLength(theData: NSData): number;

declare function CFDataGetMutableBytePtr(theData: NSData): interop.Pointer | interop.Reference<any>;

declare function CFDataGetTypeID(): number;

declare function CFDataIncreaseLength(theData: NSData, extraLength: number): void;

declare function CFDataReplaceBytes(theData: NSData, range: CFRange, newBytes: string | interop.Pointer | interop.Reference<any>, newLength: number): void;

/**
 * @since 4.0
 */
declare const enum CFDataSearchFlags {

	kCFDataSearchBackwards = 1,

	kCFDataSearchAnchored = 2
}

declare function CFDataSetLength(theData: NSData, length: number): void;

declare function CFDateCompare(theDate: Date, otherDate: Date, context: interop.Pointer | interop.Reference<any>): CFComparisonResult;

declare function CFDateCreate(allocator: any, at: number): Date;

declare function CFDateFormatterCopyProperty(formatter: any, key: string): any;

declare function CFDateFormatterCreate(allocator: any, locale: NSLocale, dateStyle: CFDateFormatterStyle, timeStyle: CFDateFormatterStyle): any;

/**
 * @since 4.0
 */
declare function CFDateFormatterCreateDateFormatFromTemplate(allocator: any, tmplate: string, options: number, locale: NSLocale): string;

declare function CFDateFormatterCreateDateFromString(allocator: any, formatter: any, string: string, rangep: interop.Pointer | interop.Reference<CFRange>): Date;

/**
 * @since 10.0
 */
declare function CFDateFormatterCreateISO8601Formatter(allocator: any, formatOptions: CFISO8601DateFormatOptions): any;

declare function CFDateFormatterCreateStringWithAbsoluteTime(allocator: any, formatter: any, at: number): string;

declare function CFDateFormatterCreateStringWithDate(allocator: any, formatter: any, date: Date): string;

declare function CFDateFormatterGetAbsoluteTimeFromString(formatter: any, string: string, rangep: interop.Pointer | interop.Reference<CFRange>, atp: interop.Pointer | interop.Reference<number>): boolean;

declare function CFDateFormatterGetDateStyle(formatter: any): CFDateFormatterStyle;

declare function CFDateFormatterGetFormat(formatter: any): string;

declare function CFDateFormatterGetLocale(formatter: any): NSLocale;

declare function CFDateFormatterGetTimeStyle(formatter: any): CFDateFormatterStyle;

declare function CFDateFormatterGetTypeID(): number;

declare function CFDateFormatterSetFormat(formatter: any, formatString: string): void;

declare function CFDateFormatterSetProperty(formatter: any, key: string, value: any): void;

declare const enum CFDateFormatterStyle {

	kCFDateFormatterNoStyle = 0,

	kCFDateFormatterShortStyle = 1,

	kCFDateFormatterMediumStyle = 2,

	kCFDateFormatterLongStyle = 3,

	kCFDateFormatterFullStyle = 4
}

declare function CFDateGetAbsoluteTime(theDate: Date): number;

declare function CFDateGetTimeIntervalSinceDate(theDate: Date, otherDate: Date): number;

declare function CFDateGetTypeID(): number;

declare function CFDictionaryAddValue(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function CFDictionaryApplyFunction(theDict: NSDictionary<any, any>, applier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

declare function CFDictionaryContainsKey(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>): boolean;

declare function CFDictionaryContainsValue(theDict: NSDictionary<any, any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function CFDictionaryCreate(allocator: any, keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, numValues: number, keyCallBacks: interop.Pointer | interop.Reference<CFDictionaryKeyCallBacks>, valueCallBacks: interop.Pointer | interop.Reference<CFDictionaryValueCallBacks>): NSDictionary<any, any>;

declare function CFDictionaryCreateCopy(allocator: any, theDict: NSDictionary<any, any>): NSDictionary<any, any>;

declare function CFDictionaryCreateMutable(allocator: any, capacity: number, keyCallBacks: interop.Pointer | interop.Reference<CFDictionaryKeyCallBacks>, valueCallBacks: interop.Pointer | interop.Reference<CFDictionaryValueCallBacks>): NSDictionary<any, any>;

declare function CFDictionaryCreateMutableCopy(allocator: any, capacity: number, theDict: NSDictionary<any, any>): NSDictionary<any, any>;

declare function CFDictionaryGetCount(theDict: NSDictionary<any, any>): number;

declare function CFDictionaryGetCountOfKey(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>): number;

declare function CFDictionaryGetCountOfValue(theDict: NSDictionary<any, any>, value: interop.Pointer | interop.Reference<any>): number;

declare function CFDictionaryGetKeysAndValues(theDict: NSDictionary<any, any>, keys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFDictionaryGetTypeID(): number;

declare function CFDictionaryGetValue(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function CFDictionaryGetValueIfPresent(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

interface CFDictionaryKeyCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var CFDictionaryKeyCallBacks: interop.StructType<CFDictionaryKeyCallBacks>;

declare function CFDictionaryRemoveAllValues(theDict: NSDictionary<any, any>): void;

declare function CFDictionaryRemoveValue(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>): void;

declare function CFDictionaryReplaceValue(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function CFDictionarySetValue(theDict: NSDictionary<any, any>, key: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>): void;

interface CFDictionaryValueCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
}
declare var CFDictionaryValueCallBacks: interop.StructType<CFDictionaryValueCallBacks>;

declare function CFEqual(cf1: any, cf2: any): boolean;

/**
 * @since 2.0
 */
declare function CFErrorCopyDescription(err: NSError): string;

/**
 * @since 2.0
 */
declare function CFErrorCopyFailureReason(err: NSError): string;

/**
 * @since 2.0
 */
declare function CFErrorCopyRecoverySuggestion(err: NSError): string;

/**
 * @since 2.0
 */
declare function CFErrorCopyUserInfo(err: NSError): NSDictionary<any, any>;

/**
 * @since 2.0
 */
declare function CFErrorCreate(allocator: any, domain: string, code: number, userInfo: NSDictionary<any, any>): NSError;

/**
 * @since 2.0
 */
declare function CFErrorCreateWithUserInfoKeysAndValues(allocator: any, domain: string, code: number, userInfoKeys: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, userInfoValues: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, numUserInfoValues: number): NSError;

/**
 * @since 2.0
 */
declare function CFErrorGetCode(err: NSError): number;

/**
 * @since 2.0
 */
declare function CFErrorGetDomain(err: NSError): string;

/**
 * @since 2.0
 */
declare function CFErrorGetTypeID(): number;

interface CFFileDescriptorContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFFileDescriptorContext: interop.StructType<CFFileDescriptorContext>;

/**
 * @since 2.0
 */
declare function CFFileDescriptorCreate(allocator: any, fd: number, closeOnInvalidate: boolean, callout: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFFileDescriptorContext>): any;

/**
 * @since 2.0
 */
declare function CFFileDescriptorCreateRunLoopSource(allocator: any, f: any, order: number): any;

/**
 * @since 2.0
 */
declare function CFFileDescriptorDisableCallBacks(f: any, callBackTypes: number): void;

/**
 * @since 2.0
 */
declare function CFFileDescriptorEnableCallBacks(f: any, callBackTypes: number): void;

/**
 * @since 2.0
 */
declare function CFFileDescriptorGetContext(f: any, context: interop.Pointer | interop.Reference<CFFileDescriptorContext>): void;

/**
 * @since 2.0
 */
declare function CFFileDescriptorGetNativeDescriptor(f: any): number;

/**
 * @since 2.0
 */
declare function CFFileDescriptorGetTypeID(): number;

/**
 * @since 2.0
 */
declare function CFFileDescriptorInvalidate(f: any): void;

/**
 * @since 2.0
 */
declare function CFFileDescriptorIsValid(f: any): boolean;

/**
 * @since 6.0
 */
declare const enum CFFileSecurityClearOptions {

	kCFFileSecurityClearOwner = 1,

	kCFFileSecurityClearGroup = 2,

	kCFFileSecurityClearMode = 4,

	kCFFileSecurityClearOwnerUUID = 8,

	kCFFileSecurityClearGroupUUID = 16,

	kCFFileSecurityClearAccessControlList = 32
}

/**
 * @since 6.0
 */
declare function CFFileSecurityClearProperties(fileSec: NSFileSecurity, clearPropertyMask: CFFileSecurityClearOptions): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityCopyAccessControlList(fileSec: NSFileSecurity, accessControlList: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityCopyGroupUUID(fileSec: NSFileSecurity, groupUUID: interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityCopyOwnerUUID(fileSec: NSFileSecurity, ownerUUID: interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityCreate(allocator: any): NSFileSecurity;

/**
 * @since 5.0
 */
declare function CFFileSecurityCreateCopy(allocator: any, fileSec: NSFileSecurity): NSFileSecurity;

/**
 * @since 5.0
 */
declare function CFFileSecurityGetGroup(fileSec: NSFileSecurity, group: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityGetMode(fileSec: NSFileSecurity, mode: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityGetOwner(fileSec: NSFileSecurity, owner: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecurityGetTypeID(): number;

/**
 * @since 5.0
 */
declare function CFFileSecuritySetAccessControlList(fileSec: NSFileSecurity, accessControlList: interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecuritySetGroup(fileSec: NSFileSecurity, group: number): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecuritySetGroupUUID(fileSec: NSFileSecurity, groupUUID: any): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecuritySetMode(fileSec: NSFileSecurity, mode: number): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecuritySetOwner(fileSec: NSFileSecurity, owner: number): boolean;

/**
 * @since 5.0
 */
declare function CFFileSecuritySetOwnerUUID(fileSec: NSFileSecurity, ownerUUID: any): boolean;

declare function CFGetAllocator(cf: any): any;

declare function CFGetRetainCount(cf: any): number;

declare function CFGetTypeID(cf: any): number;

interface CFGregorianDate {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}
declare var CFGregorianDate: interop.StructType<CFGregorianDate>;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFGregorianDateGetAbsoluteTime(gdate: CFGregorianDate, tz: NSTimeZone): number;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFGregorianDateIsValid(gdate: CFGregorianDate, unitFlags: number): boolean;

declare const enum CFGregorianUnitFlags {

	kCFGregorianUnitsYears = 1,

	kCFGregorianUnitsMonths = 2,

	kCFGregorianUnitsDays = 4,

	kCFGregorianUnitsHours = 8,

	kCFGregorianUnitsMinutes = 16,

	kCFGregorianUnitsSeconds = 32,

	kCFGregorianAllUnits = 16777215
}

interface CFGregorianUnits {
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}
declare var CFGregorianUnits: interop.StructType<CFGregorianUnits>;

declare function CFHash(cf: any): number;

declare const enum CFISO8601DateFormatOptions {

	kCFISO8601DateFormatWithYear = 1,

	kCFISO8601DateFormatWithMonth = 2,

	kCFISO8601DateFormatWithWeekOfYear = 4,

	kCFISO8601DateFormatWithDay = 16,

	kCFISO8601DateFormatWithTime = 32,

	kCFISO8601DateFormatWithTimeZone = 64,

	kCFISO8601DateFormatWithSpaceBetweenDateAndTime = 128,

	kCFISO8601DateFormatWithDashSeparatorInDate = 256,

	kCFISO8601DateFormatWithColonSeparatorInTime = 512,

	kCFISO8601DateFormatWithColonSeparatorInTimeZone = 1024,

	kCFISO8601DateFormatWithFractionalSeconds = 2048,

	kCFISO8601DateFormatWithFullDate = 275,

	kCFISO8601DateFormatWithFullTime = 1632,

	kCFISO8601DateFormatWithInternetDateTime = 1907
}

declare function CFLocaleCopyAvailableLocaleIdentifiers(): NSArray<any>;

/**
 * @since 2.0
 */
declare function CFLocaleCopyCommonISOCurrencyCodes(): NSArray<any>;

declare function CFLocaleCopyCurrent(): NSLocale;

declare function CFLocaleCopyDisplayNameForPropertyValue(displayLocale: NSLocale, key: string, value: string): string;

declare function CFLocaleCopyISOCountryCodes(): NSArray<any>;

declare function CFLocaleCopyISOCurrencyCodes(): NSArray<any>;

declare function CFLocaleCopyISOLanguageCodes(): NSArray<any>;

/**
 * @since 2.0
 */
declare function CFLocaleCopyPreferredLanguages(): NSArray<any>;

declare function CFLocaleCreate(allocator: any, localeIdentifier: string): NSLocale;

declare function CFLocaleCreateCanonicalLanguageIdentifierFromString(allocator: any, localeIdentifier: string): string;

declare function CFLocaleCreateCanonicalLocaleIdentifierFromScriptManagerCodes(allocator: any, lcode: number, rcode: number): string;

declare function CFLocaleCreateCanonicalLocaleIdentifierFromString(allocator: any, localeIdentifier: string): string;

declare function CFLocaleCreateComponentsFromLocaleIdentifier(allocator: any, localeID: string): NSDictionary<any, any>;

declare function CFLocaleCreateCopy(allocator: any, locale: NSLocale): NSLocale;

declare function CFLocaleCreateLocaleIdentifierFromComponents(allocator: any, dictionary: NSDictionary<any, any>): string;

/**
 * @since 4.0
 */
declare function CFLocaleCreateLocaleIdentifierFromWindowsLocaleCode(allocator: any, lcid: number): string;

declare function CFLocaleGetIdentifier(locale: NSLocale): string;

/**
 * @since 4.0
 */
declare function CFLocaleGetLanguageCharacterDirection(isoLangCode: string): CFLocaleLanguageDirection;

/**
 * @since 4.0
 */
declare function CFLocaleGetLanguageLineDirection(isoLangCode: string): CFLocaleLanguageDirection;

declare function CFLocaleGetSystem(): NSLocale;

declare function CFLocaleGetTypeID(): number;

declare function CFLocaleGetValue(locale: NSLocale, key: string): any;

/**
 * @since 4.0
 */
declare function CFLocaleGetWindowsLocaleCodeFromLocaleIdentifier(localeIdentifier: string): number;

declare const enum CFLocaleLanguageDirection {

	kCFLocaleLanguageDirectionUnknown = 0,

	kCFLocaleLanguageDirectionLeftToRight = 1,

	kCFLocaleLanguageDirectionRightToLeft = 2,

	kCFLocaleLanguageDirectionTopToBottom = 3,

	kCFLocaleLanguageDirectionBottomToTop = 4
}

interface CFMachPortContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFMachPortContext: interop.StructType<CFMachPortContext>;

declare function CFMachPortCreate(allocator: any, callout: interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFMachPortContext>, shouldFreeInfo: string | interop.Pointer | interop.Reference<any>): NSMachPort;

declare function CFMachPortCreateRunLoopSource(allocator: any, port: NSMachPort, order: number): any;

declare function CFMachPortCreateWithPort(allocator: any, portNum: number, callout: interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFMachPortContext>, shouldFreeInfo: string | interop.Pointer | interop.Reference<any>): NSMachPort;

declare function CFMachPortGetContext(port: NSMachPort, context: interop.Pointer | interop.Reference<CFMachPortContext>): void;

declare function CFMachPortGetInvalidationCallBack(port: NSMachPort): interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer | interop.Reference<any>) => void>;

declare function CFMachPortGetPort(port: NSMachPort): number;

declare function CFMachPortGetTypeID(): number;

declare function CFMachPortInvalidate(port: NSMachPort): void;

declare function CFMachPortIsValid(port: NSMachPort): boolean;

declare function CFMachPortSetInvalidationCallBack(port: NSMachPort, callout: interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer | interop.Reference<any>) => void>): void;

declare function CFMakeCollectable(cf: any): interop.Unmanaged<any>;

interface CFMessagePortContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFMessagePortContext: interop.StructType<CFMessagePortContext>;

declare function CFMessagePortCreateLocal(allocator: any, name: string, callout: interop.FunctionReference<(p1: NSMessagePort, p2: number, p3: NSData, p4: interop.Pointer | interop.Reference<any>) => NSData>, context: interop.Pointer | interop.Reference<CFMessagePortContext>, shouldFreeInfo: string | interop.Pointer | interop.Reference<any>): NSMessagePort;

declare function CFMessagePortCreateRemote(allocator: any, name: string): NSMessagePort;

declare function CFMessagePortCreateRunLoopSource(allocator: any, local: NSMessagePort, order: number): any;

declare function CFMessagePortGetContext(ms: NSMessagePort, context: interop.Pointer | interop.Reference<CFMessagePortContext>): void;

declare function CFMessagePortGetInvalidationCallBack(ms: NSMessagePort): interop.FunctionReference<(p1: NSMessagePort, p2: interop.Pointer | interop.Reference<any>) => void>;

declare function CFMessagePortGetName(ms: NSMessagePort): string;

declare function CFMessagePortGetTypeID(): number;

declare function CFMessagePortInvalidate(ms: NSMessagePort): void;

declare function CFMessagePortIsRemote(ms: NSMessagePort): boolean;

declare function CFMessagePortIsValid(ms: NSMessagePort): boolean;

declare function CFMessagePortSendRequest(remote: NSMessagePort, msgid: number, data: NSData, sendTimeout: number, rcvTimeout: number, replyMode: string, returnData: interop.Pointer | interop.Reference<NSData>): number;

/**
 * @since 4.0
 */
declare function CFMessagePortSetDispatchQueue(ms: NSMessagePort, queue: NSObject & OS_dispatch_queue): void;

declare function CFMessagePortSetInvalidationCallBack(ms: NSMessagePort, callout: interop.FunctionReference<(p1: NSMessagePort, p2: interop.Pointer | interop.Reference<any>) => void>): void;

declare function CFMessagePortSetName(ms: NSMessagePort, newName: string): boolean;

declare function CFNotificationCenterAddObserver(center: any, observer: interop.Pointer | interop.Reference<any>, callBack: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>, p3: string, p4: interop.Pointer | interop.Reference<any>, p5: NSDictionary<any, any>) => void>, name: string, object: interop.Pointer | interop.Reference<any>, suspensionBehavior: CFNotificationSuspensionBehavior): void;

declare function CFNotificationCenterGetDarwinNotifyCenter(): any;

declare function CFNotificationCenterGetLocalCenter(): any;

declare function CFNotificationCenterGetTypeID(): number;

declare function CFNotificationCenterPostNotification(center: any, name: string, object: interop.Pointer | interop.Reference<any>, userInfo: NSDictionary<any, any>, deliverImmediately: boolean): void;

declare function CFNotificationCenterPostNotificationWithOptions(center: any, name: string, object: interop.Pointer | interop.Reference<any>, userInfo: NSDictionary<any, any>, options: number): void;

declare function CFNotificationCenterRemoveEveryObserver(center: any, observer: interop.Pointer | interop.Reference<any>): void;

declare function CFNotificationCenterRemoveObserver(center: any, observer: interop.Pointer | interop.Reference<any>, name: string, object: interop.Pointer | interop.Reference<any>): void;

declare const enum CFNotificationSuspensionBehavior {

	Drop = 1,

	Coalesce = 2,

	Hold = 3,

	DeliverImmediately = 4
}

declare function CFNullGetTypeID(): number;

declare function CFNumberCompare(number: number, otherNumber: number, context: interop.Pointer | interop.Reference<any>): CFComparisonResult;

declare function CFNumberCreate(allocator: any, theType: CFNumberType, valuePtr: interop.Pointer | interop.Reference<any>): number;

declare function CFNumberFormatterCopyProperty(formatter: any, key: string): any;

declare function CFNumberFormatterCreate(allocator: any, locale: NSLocale, style: CFNumberFormatterStyle): any;

declare function CFNumberFormatterCreateNumberFromString(allocator: any, formatter: any, string: string, rangep: interop.Pointer | interop.Reference<CFRange>, options: number): number;

declare function CFNumberFormatterCreateStringWithNumber(allocator: any, formatter: any, number: number): string;

declare function CFNumberFormatterCreateStringWithValue(allocator: any, formatter: any, numberType: CFNumberType, valuePtr: interop.Pointer | interop.Reference<any>): string;

declare function CFNumberFormatterGetDecimalInfoForCurrencyCode(currencyCode: string, defaultFractionDigits: interop.Pointer | interop.Reference<number>, roundingIncrement: interop.Pointer | interop.Reference<number>): boolean;

declare function CFNumberFormatterGetFormat(formatter: any): string;

declare function CFNumberFormatterGetLocale(formatter: any): NSLocale;

declare function CFNumberFormatterGetStyle(formatter: any): CFNumberFormatterStyle;

declare function CFNumberFormatterGetTypeID(): number;

declare function CFNumberFormatterGetValueFromString(formatter: any, string: string, rangep: interop.Pointer | interop.Reference<CFRange>, numberType: CFNumberType, valuePtr: interop.Pointer | interop.Reference<any>): boolean;

declare const enum CFNumberFormatterOptionFlags {

	kCFNumberFormatterParseIntegersOnly = 1
}

declare const enum CFNumberFormatterPadPosition {

	kCFNumberFormatterPadBeforePrefix = 0,

	kCFNumberFormatterPadAfterPrefix = 1,

	kCFNumberFormatterPadBeforeSuffix = 2,

	kCFNumberFormatterPadAfterSuffix = 3
}

declare const enum CFNumberFormatterRoundingMode {

	kCFNumberFormatterRoundCeiling = 0,

	kCFNumberFormatterRoundFloor = 1,

	kCFNumberFormatterRoundDown = 2,

	kCFNumberFormatterRoundUp = 3,

	kCFNumberFormatterRoundHalfEven = 4,

	kCFNumberFormatterRoundHalfDown = 5,

	kCFNumberFormatterRoundHalfUp = 6
}

declare function CFNumberFormatterSetFormat(formatter: any, formatString: string): void;

declare function CFNumberFormatterSetProperty(formatter: any, key: string, value: any): void;

declare const enum CFNumberFormatterStyle {

	kCFNumberFormatterNoStyle = 0,

	kCFNumberFormatterDecimalStyle = 1,

	kCFNumberFormatterCurrencyStyle = 2,

	kCFNumberFormatterPercentStyle = 3,

	kCFNumberFormatterScientificStyle = 4,

	kCFNumberFormatterSpellOutStyle = 5,

	kCFNumberFormatterOrdinalStyle = 6,

	kCFNumberFormatterCurrencyISOCodeStyle = 8,

	kCFNumberFormatterCurrencyPluralStyle = 9,

	kCFNumberFormatterCurrencyAccountingStyle = 10
}

declare function CFNumberGetByteSize(number: number): number;

declare function CFNumberGetType(number: number): CFNumberType;

declare function CFNumberGetTypeID(): number;

declare function CFNumberGetValue(number: number, theType: CFNumberType, valuePtr: interop.Pointer | interop.Reference<any>): boolean;

declare function CFNumberIsFloatType(number: number): boolean;

declare const enum CFNumberType {

	kCFNumberSInt8Type = 1,

	kCFNumberSInt16Type = 2,

	kCFNumberSInt32Type = 3,

	kCFNumberSInt64Type = 4,

	kCFNumberFloat32Type = 5,

	kCFNumberFloat64Type = 6,

	kCFNumberCharType = 7,

	kCFNumberShortType = 8,

	kCFNumberIntType = 9,

	kCFNumberLongType = 10,

	kCFNumberLongLongType = 11,

	kCFNumberFloatType = 12,

	kCFNumberDoubleType = 13,

	kCFNumberCFIndexType = 14,

	kCFNumberNSIntegerType = 15,

	kCFNumberCGFloatType = 16,

	kCFNumberMaxType = 16
}

declare function CFPlugInAddInstanceForFactory(factoryID: any): void;

declare function CFPlugInCreate(allocator: any, plugInURL: NSURL): any;

declare function CFPlugInFindFactoriesForPlugInType(typeUUID: any): NSArray<any>;

declare function CFPlugInFindFactoriesForPlugInTypeInPlugIn(typeUUID: any, plugIn: any): NSArray<any>;

declare function CFPlugInGetBundle(plugIn: any): any;

declare function CFPlugInGetTypeID(): number;

declare function CFPlugInInstanceCreate(allocator: any, factoryUUID: any, typeUUID: any): interop.Pointer | interop.Reference<any>;

declare function CFPlugInInstanceCreateWithInstanceDataSize(allocator: any, instanceDataSize: number, deallocateInstanceFunction: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>, factoryName: string, getInterfaceFunction: interop.FunctionReference<(p1: any, p2: string, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => boolean>): any;

declare function CFPlugInInstanceGetFactoryName(instance: any): string;

declare function CFPlugInInstanceGetInstanceData(instance: any): interop.Pointer | interop.Reference<any>;

declare function CFPlugInInstanceGetInterfaceFunctionTable(instance: any, interfaceName: string, ftbl: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function CFPlugInInstanceGetTypeID(): number;

declare function CFPlugInIsLoadOnDemand(plugIn: any): boolean;

declare function CFPlugInRegisterFactoryFunction(factoryUUID: any, func: interop.FunctionReference<(p1: any, p2: any) => interop.Pointer | interop.Reference<any>>): boolean;

declare function CFPlugInRegisterFactoryFunctionByName(factoryUUID: any, plugIn: any, functionName: string): boolean;

declare function CFPlugInRegisterPlugInType(factoryUUID: any, typeUUID: any): boolean;

declare function CFPlugInRemoveInstanceForFactory(factoryID: any): void;

declare function CFPlugInSetLoadOnDemand(plugIn: any, flag: boolean): void;

declare function CFPlugInUnregisterFactory(factoryUUID: any): boolean;

declare function CFPlugInUnregisterPlugInType(factoryUUID: any, typeUUID: any): boolean;

declare function CFPreferencesAddSuitePreferencesToApp(applicationID: string, suiteID: string): void;

declare function CFPreferencesAppSynchronize(applicationID: string): boolean;

declare function CFPreferencesAppValueIsForced(key: string, applicationID: string): boolean;

declare function CFPreferencesCopyAppValue(key: string, applicationID: string): any;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFPreferencesCopyApplicationList(userName: string, hostName: string): NSArray<any>;

declare function CFPreferencesCopyKeyList(applicationID: string, userName: string, hostName: string): NSArray<any>;

declare function CFPreferencesCopyMultiple(keysToFetch: NSArray<any> | any[], applicationID: string, userName: string, hostName: string): NSDictionary<any, any>;

declare function CFPreferencesCopyValue(key: string, applicationID: string, userName: string, hostName: string): any;

declare function CFPreferencesGetAppBooleanValue(key: string, applicationID: string, keyExistsAndHasValidFormat: string | interop.Pointer | interop.Reference<any>): boolean;

declare function CFPreferencesGetAppIntegerValue(key: string, applicationID: string, keyExistsAndHasValidFormat: string | interop.Pointer | interop.Reference<any>): number;

declare function CFPreferencesRemoveSuitePreferencesFromApp(applicationID: string, suiteID: string): void;

declare function CFPreferencesSetAppValue(key: string, value: any, applicationID: string): void;

declare function CFPreferencesSetMultiple(keysToSet: NSDictionary<any, any>, keysToRemove: NSArray<any> | any[], applicationID: string, userName: string, hostName: string): void;

declare function CFPreferencesSetValue(key: string, value: any, applicationID: string, userName: string, hostName: string): void;

declare function CFPreferencesSynchronize(applicationID: string, userName: string, hostName: string): boolean;

/**
 * @since 4.0
 */
declare function CFPropertyListCreateData(allocator: any, propertyList: any, format: CFPropertyListFormat, options: number, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSData>;

declare function CFPropertyListCreateDeepCopy(allocator: any, propertyList: any, mutabilityOption: number): any;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFPropertyListCreateFromStream(allocator: any, stream: NSInputStream, streamLength: number, mutabilityOption: number, format: interop.Pointer | interop.Reference<CFPropertyListFormat>, errorString: interop.Pointer | interop.Reference<string>): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFPropertyListCreateFromXMLData(allocator: any, xmlData: NSData, mutabilityOption: number, errorString: interop.Pointer | interop.Reference<string>): interop.Unmanaged<any>;

/**
 * @since 4.0
 */
declare function CFPropertyListCreateWithData(allocator: any, data: NSData, options: number, format: interop.Pointer | interop.Reference<CFPropertyListFormat>, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<any>;

/**
 * @since 4.0
 */
declare function CFPropertyListCreateWithStream(allocator: any, stream: NSInputStream, streamLength: number, options: number, format: interop.Pointer | interop.Reference<CFPropertyListFormat>, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFPropertyListCreateXMLData(allocator: any, propertyList: any): interop.Unmanaged<NSData>;

declare const enum CFPropertyListFormat {

	kCFPropertyListOpenStepFormat = 1,

	kCFPropertyListXMLFormat_v1_0 = 100,

	kCFPropertyListBinaryFormat_v1_0 = 200
}

declare function CFPropertyListIsValid(plist: any, format: CFPropertyListFormat): boolean;

declare const enum CFPropertyListMutabilityOptions {

	kCFPropertyListImmutable = 0,

	kCFPropertyListMutableContainers = 1,

	kCFPropertyListMutableContainersAndLeaves = 2
}

/**
 * @since 4.0
 */
declare function CFPropertyListWrite(propertyList: any, stream: NSOutputStream, format: CFPropertyListFormat, options: number, error: interop.Pointer | interop.Reference<NSError>): number;

/**
 * @since 2.0
 * @deprecated 8.0
 */
declare function CFPropertyListWriteToStream(propertyList: any, stream: NSOutputStream, format: CFPropertyListFormat, errorString: interop.Pointer | interop.Reference<string>): number;

interface CFRange {
	location: number;
	length: number;
}
declare var CFRange: interop.StructType<CFRange>;

declare function CFReadStreamClose(stream: NSInputStream): void;

/**
 * @since 7.0
 */
declare function CFReadStreamCopyDispatchQueue(stream: NSInputStream): NSObject & OS_dispatch_queue;

/**
 * @since 2.0
 */
declare function CFReadStreamCopyError(stream: NSInputStream): NSError;

declare function CFReadStreamCopyProperty(stream: NSInputStream, propertyName: string): any;

declare function CFReadStreamCreateWithBytesNoCopy(alloc: any, bytes: string | interop.Pointer | interop.Reference<any>, length: number, bytesDeallocator: any): NSInputStream;

declare function CFReadStreamCreateWithFile(alloc: any, fileURL: NSURL): NSInputStream;

declare function CFReadStreamGetBuffer(stream: NSInputStream, maxBytesToRead: number, numBytesRead: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

declare function CFReadStreamGetError(stream: NSInputStream): CFStreamError;

declare function CFReadStreamGetStatus(stream: NSInputStream): CFStreamStatus;

declare function CFReadStreamGetTypeID(): number;

declare function CFReadStreamHasBytesAvailable(stream: NSInputStream): boolean;

declare function CFReadStreamOpen(stream: NSInputStream): boolean;

declare function CFReadStreamRead(stream: NSInputStream, buffer: string | interop.Pointer | interop.Reference<any>, bufferLength: number): number;

declare function CFReadStreamScheduleWithRunLoop(stream: NSInputStream, runLoop: any, runLoopMode: string): void;

declare function CFReadStreamSetClient(stream: NSInputStream, streamEvents: number, clientCB: interop.FunctionReference<(p1: NSInputStream, p2: CFStreamEventType, p3: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFStreamClientContext>): boolean;

/**
 * @since 7.0
 */
declare function CFReadStreamSetDispatchQueue(stream: NSInputStream, q: NSObject & OS_dispatch_queue): void;

declare function CFReadStreamSetProperty(stream: NSInputStream, propertyName: string, propertyValue: any): boolean;

declare function CFReadStreamUnscheduleFromRunLoop(stream: NSInputStream, runLoop: any, runLoopMode: string): void;

declare function CFRelease(cf: any): void;

declare function CFRetain(cf: any): any;

declare const enum CFRunLoopActivity {

	kCFRunLoopEntry = 1,

	kCFRunLoopBeforeTimers = 2,

	kCFRunLoopBeforeSources = 4,

	kCFRunLoopBeforeWaiting = 32,

	kCFRunLoopAfterWaiting = 64,

	kCFRunLoopExit = 128,

	kCFRunLoopAllActivities = 268435455
}

declare function CFRunLoopAddCommonMode(rl: any, mode: string): void;

declare function CFRunLoopAddObserver(rl: any, observer: any, mode: string): void;

declare function CFRunLoopAddSource(rl: any, source: any, mode: string): void;

declare function CFRunLoopAddTimer(rl: any, timer: NSTimer, mode: string): void;

declare function CFRunLoopContainsObserver(rl: any, observer: any, mode: string): boolean;

declare function CFRunLoopContainsSource(rl: any, source: any, mode: string): boolean;

declare function CFRunLoopContainsTimer(rl: any, timer: NSTimer, mode: string): boolean;

declare function CFRunLoopCopyAllModes(rl: any): NSArray<any>;

declare function CFRunLoopCopyCurrentMode(rl: any): string;

declare function CFRunLoopGetCurrent(): any;

declare function CFRunLoopGetMain(): any;

declare function CFRunLoopGetNextTimerFireDate(rl: any, mode: string): number;

declare function CFRunLoopGetTypeID(): number;

declare function CFRunLoopIsWaiting(rl: any): boolean;

interface CFRunLoopObserverContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFRunLoopObserverContext: interop.StructType<CFRunLoopObserverContext>;

declare function CFRunLoopObserverCreate(allocator: any, activities: number, repeats: boolean, order: number, callout: interop.FunctionReference<(p1: any, p2: CFRunLoopActivity, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFRunLoopObserverContext>): any;

/**
 * @since 5.0
 */
declare function CFRunLoopObserverCreateWithHandler(allocator: any, activities: number, repeats: boolean, order: number, block: (p1: any, p2: CFRunLoopActivity) => void): any;

declare function CFRunLoopObserverDoesRepeat(observer: any): boolean;

declare function CFRunLoopObserverGetActivities(observer: any): number;

declare function CFRunLoopObserverGetContext(observer: any, context: interop.Pointer | interop.Reference<CFRunLoopObserverContext>): void;

declare function CFRunLoopObserverGetOrder(observer: any): number;

declare function CFRunLoopObserverGetTypeID(): number;

declare function CFRunLoopObserverInvalidate(observer: any): void;

declare function CFRunLoopObserverIsValid(observer: any): boolean;

/**
 * @since 4.0
 */
declare function CFRunLoopPerformBlock(rl: any, mode: any, block: () => void): void;

declare function CFRunLoopRemoveObserver(rl: any, observer: any, mode: string): void;

declare function CFRunLoopRemoveSource(rl: any, source: any, mode: string): void;

declare function CFRunLoopRemoveTimer(rl: any, timer: NSTimer, mode: string): void;

declare function CFRunLoopRun(): void;

declare function CFRunLoopRunInMode(mode: string, seconds: number, returnAfterSourceHandled: boolean): CFRunLoopRunResult;

declare const enum CFRunLoopRunResult {

	kCFRunLoopRunFinished = 1,

	kCFRunLoopRunStopped = 2,

	kCFRunLoopRunTimedOut = 3,

	kCFRunLoopRunHandledSource = 4
}

interface CFRunLoopSourceContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	schedule: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: any, p3: string) => void>;
	cancel: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: any, p3: string) => void>;
	perform: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
}
declare var CFRunLoopSourceContext: interop.StructType<CFRunLoopSourceContext>;

interface CFRunLoopSourceContext1 {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	getPort: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	perform: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: number, p3: any, p4: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
}
declare var CFRunLoopSourceContext1: interop.StructType<CFRunLoopSourceContext1>;

declare function CFRunLoopSourceCreate(allocator: any, order: number, context: interop.Pointer | interop.Reference<CFRunLoopSourceContext>): any;

declare function CFRunLoopSourceGetContext(source: any, context: interop.Pointer | interop.Reference<CFRunLoopSourceContext>): void;

declare function CFRunLoopSourceGetOrder(source: any): number;

declare function CFRunLoopSourceGetTypeID(): number;

declare function CFRunLoopSourceInvalidate(source: any): void;

declare function CFRunLoopSourceIsValid(source: any): boolean;

declare function CFRunLoopSourceSignal(source: any): void;

declare function CFRunLoopStop(rl: any): void;

interface CFRunLoopTimerContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFRunLoopTimerContext: interop.StructType<CFRunLoopTimerContext>;

declare function CFRunLoopTimerCreate(allocator: any, fireDate: number, interval: number, flags: number, order: number, callout: interop.FunctionReference<(p1: NSTimer, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFRunLoopTimerContext>): NSTimer;

/**
 * @since 5.0
 */
declare function CFRunLoopTimerCreateWithHandler(allocator: any, fireDate: number, interval: number, flags: number, order: number, block: (p1: NSTimer) => void): NSTimer;

declare function CFRunLoopTimerDoesRepeat(timer: NSTimer): boolean;

declare function CFRunLoopTimerGetContext(timer: NSTimer, context: interop.Pointer | interop.Reference<CFRunLoopTimerContext>): void;

declare function CFRunLoopTimerGetInterval(timer: NSTimer): number;

declare function CFRunLoopTimerGetNextFireDate(timer: NSTimer): number;

declare function CFRunLoopTimerGetOrder(timer: NSTimer): number;

/**
 * @since 7.0
 */
declare function CFRunLoopTimerGetTolerance(timer: NSTimer): number;

declare function CFRunLoopTimerGetTypeID(): number;

declare function CFRunLoopTimerInvalidate(timer: NSTimer): void;

declare function CFRunLoopTimerIsValid(timer: NSTimer): boolean;

declare function CFRunLoopTimerSetNextFireDate(timer: NSTimer, fireDate: number): void;

/**
 * @since 7.0
 */
declare function CFRunLoopTimerSetTolerance(timer: NSTimer, tolerance: number): void;

declare function CFRunLoopWakeUp(rl: any): void;

declare function CFSetAddValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function CFSetApplyFunction(theSet: NSSet<any>, applier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

interface CFSetCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var CFSetCallBacks: interop.StructType<CFSetCallBacks>;

declare function CFSetContainsValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): boolean;

declare function CFSetCreate(allocator: any, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, numValues: number, callBacks: interop.Pointer | interop.Reference<CFSetCallBacks>): NSSet<any>;

declare function CFSetCreateCopy(allocator: any, theSet: NSSet<any>): NSSet<any>;

declare function CFSetCreateMutable(allocator: any, capacity: number, callBacks: interop.Pointer | interop.Reference<CFSetCallBacks>): NSSet<any>;

declare function CFSetCreateMutableCopy(allocator: any, capacity: number, theSet: NSSet<any>): NSSet<any>;

declare function CFSetGetCount(theSet: NSSet<any>): number;

declare function CFSetGetCountOfValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): number;

declare function CFSetGetTypeID(): number;

declare function CFSetGetValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function CFSetGetValueIfPresent(theSet: NSSet<any>, candidate: interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): boolean;

declare function CFSetGetValues(theSet: NSSet<any>, values: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): void;

declare function CFSetRemoveAllValues(theSet: NSSet<any>): void;

declare function CFSetRemoveValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function CFSetReplaceValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function CFSetSetValue(theSet: NSSet<any>, value: interop.Pointer | interop.Reference<any>): void;

declare function CFShow(obj: any): void;

declare function CFShowStr(str: string): void;

declare const enum CFSocketCallBackType {

	kCFSocketNoCallBack = 0,

	kCFSocketReadCallBack = 1,

	kCFSocketAcceptCallBack = 2,

	kCFSocketDataCallBack = 3,

	kCFSocketConnectCallBack = 4,

	kCFSocketWriteCallBack = 8
}

declare function CFSocketConnectToAddress(s: any, address: NSData, timeout: number): CFSocketError;

interface CFSocketContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFSocketContext: interop.StructType<CFSocketContext>;

declare function CFSocketCopyAddress(s: any): NSData;

declare function CFSocketCopyPeerAddress(s: any): NSData;

declare function CFSocketCopyRegisteredSocketSignature(nameServerSignature: interop.Pointer | interop.Reference<CFSocketSignature>, timeout: number, name: string, signature: interop.Pointer | interop.Reference<CFSocketSignature>, nameServerAddress: interop.Pointer | interop.Reference<NSData>): CFSocketError;

declare function CFSocketCopyRegisteredValue(nameServerSignature: interop.Pointer | interop.Reference<CFSocketSignature>, timeout: number, name: string, value: interop.Pointer | interop.Reference<any>, nameServerAddress: interop.Pointer | interop.Reference<NSData>): CFSocketError;

declare function CFSocketCreate(allocator: any, protocolFamily: number, socketType: number, protocol: number, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFSocketContext>): any;

declare function CFSocketCreateConnectedToSocketSignature(allocator: any, signature: interop.Pointer | interop.Reference<CFSocketSignature>, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFSocketContext>, timeout: number): any;

declare function CFSocketCreateRunLoopSource(allocator: any, s: any, order: number): any;

declare function CFSocketCreateWithNative(allocator: any, sock: number, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFSocketContext>): any;

declare function CFSocketCreateWithSocketSignature(allocator: any, signature: interop.Pointer | interop.Reference<CFSocketSignature>, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<CFSocketContext>): any;

declare function CFSocketDisableCallBacks(s: any, callBackTypes: number): void;

declare function CFSocketEnableCallBacks(s: any, callBackTypes: number): void;

declare const enum CFSocketError {

	kCFSocketSuccess = 0,

	kCFSocketError = -1,

	kCFSocketTimeout = -2
}

declare function CFSocketGetContext(s: any, context: interop.Pointer | interop.Reference<CFSocketContext>): void;

declare function CFSocketGetDefaultNameRegistryPortNumber(): number;

declare function CFSocketGetNative(s: any): number;

declare function CFSocketGetSocketFlags(s: any): number;

declare function CFSocketGetTypeID(): number;

declare function CFSocketInvalidate(s: any): void;

declare function CFSocketIsValid(s: any): boolean;

declare function CFSocketRegisterSocketSignature(nameServerSignature: interop.Pointer | interop.Reference<CFSocketSignature>, timeout: number, name: string, signature: interop.Pointer | interop.Reference<CFSocketSignature>): CFSocketError;

declare function CFSocketRegisterValue(nameServerSignature: interop.Pointer | interop.Reference<CFSocketSignature>, timeout: number, name: string, value: any): CFSocketError;

declare function CFSocketSendData(s: any, address: NSData, data: NSData, timeout: number): CFSocketError;

declare function CFSocketSetAddress(s: any, address: NSData): CFSocketError;

declare function CFSocketSetDefaultNameRegistryPortNumber(port: number): void;

declare function CFSocketSetSocketFlags(s: any, flags: number): void;

interface CFSocketSignature {
	protocolFamily: number;
	socketType: number;
	protocol: number;
	address: NSData;
}
declare var CFSocketSignature: interop.StructType<CFSocketSignature>;

declare function CFSocketUnregister(nameServerSignature: interop.Pointer | interop.Reference<CFSocketSignature>, timeout: number, name: string): CFSocketError;

interface CFStreamClientContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFStreamClientContext: interop.StructType<CFStreamClientContext>;

declare function CFStreamCreateBoundPair(alloc: any, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>, transferBufferSize: number): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFStreamCreatePairWithPeerSocketSignature(alloc: any, signature: interop.Pointer | interop.Reference<CFSocketSignature>, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFStreamCreatePairWithSocket(alloc: any, sock: number, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function CFStreamCreatePairWithSocketToHost(alloc: any, host: string, port: number, readStream: interop.Pointer | interop.Reference<NSInputStream>, writeStream: interop.Pointer | interop.Reference<NSOutputStream>): void;

interface CFStreamError {
	domain: number;
	error: number;
}
declare var CFStreamError: interop.StructType<CFStreamError>;

declare const enum CFStreamErrorDomain {

	kCFStreamErrorDomainCustom = -1,

	kCFStreamErrorDomainPOSIX = 1,

	kCFStreamErrorDomainMacOSStatus = 2
}

declare const enum CFStreamEventType {

	kCFStreamEventNone = 0,

	kCFStreamEventOpenCompleted = 1,

	kCFStreamEventHasBytesAvailable = 2,

	kCFStreamEventCanAcceptBytes = 4,

	kCFStreamEventErrorOccurred = 8,

	kCFStreamEventEndEncountered = 16
}

declare const enum CFStreamStatus {

	kCFStreamStatusNotOpen = 0,

	kCFStreamStatusOpening = 1,

	kCFStreamStatusOpen = 2,

	kCFStreamStatusReading = 3,

	kCFStreamStatusWriting = 4,

	kCFStreamStatusAtEnd = 5,

	kCFStreamStatusClosed = 6,

	kCFStreamStatusError = 7
}

declare function CFStringAppend(theString: string, appendedString: string): void;

declare function CFStringAppendCString(theString: string, cStr: string | interop.Pointer | interop.Reference<any>, encoding: number): void;

declare function CFStringAppendCharacters(theString: string, chars: interop.Pointer | interop.Reference<number>, numChars: number): void;

declare function CFStringAppendPascalString(theString: string, pStr: string | interop.Pointer | interop.Reference<any>, encoding: number): void;

declare const enum CFStringBuiltInEncodings {

	kCFStringEncodingMacRoman = 0,

	kCFStringEncodingWindowsLatin1 = 1280,

	kCFStringEncodingISOLatin1 = 513,

	kCFStringEncodingNextStepLatin = 2817,

	kCFStringEncodingASCII = 1536,

	kCFStringEncodingUnicode = 256,

	kCFStringEncodingUTF8 = 134217984,

	kCFStringEncodingNonLossyASCII = 3071,

	kCFStringEncodingUTF16 = 256,

	kCFStringEncodingUTF16BE = 268435712,

	kCFStringEncodingUTF16LE = 335544576,

	kCFStringEncodingUTF32 = 201326848,

	kCFStringEncodingUTF32BE = 402653440,

	kCFStringEncodingUTF32LE = 469762304
}

declare function CFStringCapitalize(theString: string, locale: NSLocale): void;

declare function CFStringCompare(theString1: string, theString2: string, compareOptions: CFStringCompareFlags): CFComparisonResult;

declare const enum CFStringCompareFlags {

	kCFCompareCaseInsensitive = 1,

	kCFCompareBackwards = 4,

	kCFCompareAnchored = 8,

	kCFCompareNonliteral = 16,

	kCFCompareLocalized = 32,

	kCFCompareNumerically = 64,

	kCFCompareDiacriticInsensitive = 128,

	kCFCompareWidthInsensitive = 256,

	kCFCompareForcedOrdering = 512
}

declare function CFStringCompareWithOptions(theString1: string, theString2: string, rangeToCompare: CFRange, compareOptions: CFStringCompareFlags): CFComparisonResult;

/**
 * @since 2.0
 */
declare function CFStringCompareWithOptionsAndLocale(theString1: string, theString2: string, rangeToCompare: CFRange, compareOptions: CFStringCompareFlags, locale: NSLocale): CFComparisonResult;

declare function CFStringConvertEncodingToIANACharSetName(encoding: number): string;

declare function CFStringConvertEncodingToNSStringEncoding(encoding: number): number;

declare function CFStringConvertEncodingToWindowsCodepage(encoding: number): number;

declare function CFStringConvertIANACharSetNameToEncoding(theString: string): number;

declare function CFStringConvertNSStringEncodingToEncoding(encoding: number): number;

declare function CFStringConvertWindowsCodepageToEncoding(codepage: number): number;

declare function CFStringCreateArrayBySeparatingStrings(alloc: any, theString: string, separatorString: string): NSArray<any>;

declare function CFStringCreateArrayWithFindResults(alloc: any, theString: string, stringToFind: string, rangeToSearch: CFRange, compareOptions: CFStringCompareFlags): NSArray<any>;

declare function CFStringCreateByCombiningStrings(alloc: any, theArray: NSArray<any> | any[], separatorString: string): string;

declare function CFStringCreateCopy(alloc: any, theString: string): string;

declare function CFStringCreateExternalRepresentation(alloc: any, theString: string, encoding: number, lossByte: number): NSData;

declare function CFStringCreateFromExternalRepresentation(alloc: any, data: NSData, encoding: number): string;

declare function CFStringCreateMutable(alloc: any, maxLength: number): string;

declare function CFStringCreateMutableCopy(alloc: any, maxLength: number, theString: string): string;

declare function CFStringCreateMutableWithExternalCharactersNoCopy(alloc: any, chars: interop.Pointer | interop.Reference<number>, numChars: number, capacity: number, externalCharactersAllocator: any): string;

declare function CFStringCreateWithBytes(alloc: any, bytes: string | interop.Pointer | interop.Reference<any>, numBytes: number, encoding: number, isExternalRepresentation: boolean): string;

declare function CFStringCreateWithBytesNoCopy(alloc: any, bytes: string | interop.Pointer | interop.Reference<any>, numBytes: number, encoding: number, isExternalRepresentation: boolean, contentsDeallocator: any): string;

declare function CFStringCreateWithCString(alloc: any, cStr: string | interop.Pointer | interop.Reference<any>, encoding: number): string;

declare function CFStringCreateWithCStringNoCopy(alloc: any, cStr: string | interop.Pointer | interop.Reference<any>, encoding: number, contentsDeallocator: any): string;

declare function CFStringCreateWithCharacters(alloc: any, chars: interop.Pointer | interop.Reference<number>, numChars: number): string;

declare function CFStringCreateWithCharactersNoCopy(alloc: any, chars: interop.Pointer | interop.Reference<number>, numChars: number, contentsDeallocator: any): string;

declare function CFStringCreateWithFileSystemRepresentation(alloc: any, buffer: string | interop.Pointer | interop.Reference<any>): string;

declare function CFStringCreateWithPascalString(alloc: any, pStr: string | interop.Pointer | interop.Reference<any>, encoding: number): string;

declare function CFStringCreateWithPascalStringNoCopy(alloc: any, pStr: string | interop.Pointer | interop.Reference<any>, encoding: number, contentsDeallocator: any): string;

declare function CFStringCreateWithSubstring(alloc: any, str: string, range: CFRange): string;

declare function CFStringDelete(theString: string, range: CFRange): void;

declare const enum CFStringEncodings {

	kCFStringEncodingMacJapanese = 1,

	kCFStringEncodingMacChineseTrad = 2,

	kCFStringEncodingMacKorean = 3,

	kCFStringEncodingMacArabic = 4,

	kCFStringEncodingMacHebrew = 5,

	kCFStringEncodingMacGreek = 6,

	kCFStringEncodingMacCyrillic = 7,

	kCFStringEncodingMacDevanagari = 9,

	kCFStringEncodingMacGurmukhi = 10,

	kCFStringEncodingMacGujarati = 11,

	kCFStringEncodingMacOriya = 12,

	kCFStringEncodingMacBengali = 13,

	kCFStringEncodingMacTamil = 14,

	kCFStringEncodingMacTelugu = 15,

	kCFStringEncodingMacKannada = 16,

	kCFStringEncodingMacMalayalam = 17,

	kCFStringEncodingMacSinhalese = 18,

	kCFStringEncodingMacBurmese = 19,

	kCFStringEncodingMacKhmer = 20,

	kCFStringEncodingMacThai = 21,

	kCFStringEncodingMacLaotian = 22,

	kCFStringEncodingMacGeorgian = 23,

	kCFStringEncodingMacArmenian = 24,

	kCFStringEncodingMacChineseSimp = 25,

	kCFStringEncodingMacTibetan = 26,

	kCFStringEncodingMacMongolian = 27,

	kCFStringEncodingMacEthiopic = 28,

	kCFStringEncodingMacCentralEurRoman = 29,

	kCFStringEncodingMacVietnamese = 30,

	kCFStringEncodingMacExtArabic = 31,

	kCFStringEncodingMacSymbol = 33,

	kCFStringEncodingMacDingbats = 34,

	kCFStringEncodingMacTurkish = 35,

	kCFStringEncodingMacCroatian = 36,

	kCFStringEncodingMacIcelandic = 37,

	kCFStringEncodingMacRomanian = 38,

	kCFStringEncodingMacCeltic = 39,

	kCFStringEncodingMacGaelic = 40,

	kCFStringEncodingMacFarsi = 140,

	kCFStringEncodingMacUkrainian = 152,

	kCFStringEncodingMacInuit = 236,

	kCFStringEncodingMacVT100 = 252,

	kCFStringEncodingMacHFS = 255,

	kCFStringEncodingISOLatin2 = 514,

	kCFStringEncodingISOLatin3 = 515,

	kCFStringEncodingISOLatin4 = 516,

	kCFStringEncodingISOLatinCyrillic = 517,

	kCFStringEncodingISOLatinArabic = 518,

	kCFStringEncodingISOLatinGreek = 519,

	kCFStringEncodingISOLatinHebrew = 520,

	kCFStringEncodingISOLatin5 = 521,

	kCFStringEncodingISOLatin6 = 522,

	kCFStringEncodingISOLatinThai = 523,

	kCFStringEncodingISOLatin7 = 525,

	kCFStringEncodingISOLatin8 = 526,

	kCFStringEncodingISOLatin9 = 527,

	kCFStringEncodingISOLatin10 = 528,

	kCFStringEncodingDOSLatinUS = 1024,

	kCFStringEncodingDOSGreek = 1029,

	kCFStringEncodingDOSBalticRim = 1030,

	kCFStringEncodingDOSLatin1 = 1040,

	kCFStringEncodingDOSGreek1 = 1041,

	kCFStringEncodingDOSLatin2 = 1042,

	kCFStringEncodingDOSCyrillic = 1043,

	kCFStringEncodingDOSTurkish = 1044,

	kCFStringEncodingDOSPortuguese = 1045,

	kCFStringEncodingDOSIcelandic = 1046,

	kCFStringEncodingDOSHebrew = 1047,

	kCFStringEncodingDOSCanadianFrench = 1048,

	kCFStringEncodingDOSArabic = 1049,

	kCFStringEncodingDOSNordic = 1050,

	kCFStringEncodingDOSRussian = 1051,

	kCFStringEncodingDOSGreek2 = 1052,

	kCFStringEncodingDOSThai = 1053,

	kCFStringEncodingDOSJapanese = 1056,

	kCFStringEncodingDOSChineseSimplif = 1057,

	kCFStringEncodingDOSKorean = 1058,

	kCFStringEncodingDOSChineseTrad = 1059,

	kCFStringEncodingWindowsLatin2 = 1281,

	kCFStringEncodingWindowsCyrillic = 1282,

	kCFStringEncodingWindowsGreek = 1283,

	kCFStringEncodingWindowsLatin5 = 1284,

	kCFStringEncodingWindowsHebrew = 1285,

	kCFStringEncodingWindowsArabic = 1286,

	kCFStringEncodingWindowsBalticRim = 1287,

	kCFStringEncodingWindowsVietnamese = 1288,

	kCFStringEncodingWindowsKoreanJohab = 1296,

	kCFStringEncodingANSEL = 1537,

	kCFStringEncodingJIS_X0201_76 = 1568,

	kCFStringEncodingJIS_X0208_83 = 1569,

	kCFStringEncodingJIS_X0208_90 = 1570,

	kCFStringEncodingJIS_X0212_90 = 1571,

	kCFStringEncodingJIS_C6226_78 = 1572,

	kCFStringEncodingShiftJIS_X0213 = 1576,

	kCFStringEncodingShiftJIS_X0213_MenKuTen = 1577,

	kCFStringEncodingGB_2312_80 = 1584,

	kCFStringEncodingGBK_95 = 1585,

	kCFStringEncodingGB_18030_2000 = 1586,

	kCFStringEncodingKSC_5601_87 = 1600,

	kCFStringEncodingKSC_5601_92_Johab = 1601,

	kCFStringEncodingCNS_11643_92_P1 = 1617,

	kCFStringEncodingCNS_11643_92_P2 = 1618,

	kCFStringEncodingCNS_11643_92_P3 = 1619,

	kCFStringEncodingISO_2022_JP = 2080,

	kCFStringEncodingISO_2022_JP_2 = 2081,

	kCFStringEncodingISO_2022_JP_1 = 2082,

	kCFStringEncodingISO_2022_JP_3 = 2083,

	kCFStringEncodingISO_2022_CN = 2096,

	kCFStringEncodingISO_2022_CN_EXT = 2097,

	kCFStringEncodingISO_2022_KR = 2112,

	kCFStringEncodingEUC_JP = 2336,

	kCFStringEncodingEUC_CN = 2352,

	kCFStringEncodingEUC_TW = 2353,

	kCFStringEncodingEUC_KR = 2368,

	kCFStringEncodingShiftJIS = 2561,

	kCFStringEncodingKOI8_R = 2562,

	kCFStringEncodingBig5 = 2563,

	kCFStringEncodingMacRomanLatin1 = 2564,

	kCFStringEncodingHZ_GB_2312 = 2565,

	kCFStringEncodingBig5_HKSCS_1999 = 2566,

	kCFStringEncodingVISCII = 2567,

	kCFStringEncodingKOI8_U = 2568,

	kCFStringEncodingBig5_E = 2569,

	kCFStringEncodingNextStepJapanese = 2818,

	kCFStringEncodingEBCDIC_US = 3073,

	kCFStringEncodingEBCDIC_CP037 = 3074,

	kCFStringEncodingUTF7 = 67109120,

	kCFStringEncodingUTF7_IMAP = 2576,

	kCFStringEncodingShiftJIS_X0213_00 = 1576
}

declare function CFStringFind(theString: string, stringToFind: string, compareOptions: CFStringCompareFlags): CFRange;

declare function CFStringFindAndReplace(theString: string, stringToFind: string, replacementString: string, rangeToSearch: CFRange, compareOptions: CFStringCompareFlags): number;

declare function CFStringFindCharacterFromSet(theString: string, theSet: NSCharacterSet, rangeToSearch: CFRange, searchOptions: CFStringCompareFlags, result: interop.Pointer | interop.Reference<CFRange>): boolean;

declare function CFStringFindWithOptions(theString: string, stringToFind: string, rangeToSearch: CFRange, searchOptions: CFStringCompareFlags, result: interop.Pointer | interop.Reference<CFRange>): boolean;

/**
 * @since 2.0
 */
declare function CFStringFindWithOptionsAndLocale(theString: string, stringToFind: string, rangeToSearch: CFRange, searchOptions: CFStringCompareFlags, locale: NSLocale, result: interop.Pointer | interop.Reference<CFRange>): boolean;

/**
 * @since 2.0
 */
declare function CFStringFold(theString: string, theFlags: CFStringCompareFlags, theLocale: NSLocale): void;

declare function CFStringGetBytes(theString: string, range: CFRange, encoding: number, lossByte: number, isExternalRepresentation: boolean, buffer: string | interop.Pointer | interop.Reference<any>, maxBufLen: number, usedBufLen: interop.Pointer | interop.Reference<number>): number;

declare function CFStringGetCString(theString: string, buffer: string | interop.Pointer | interop.Reference<any>, bufferSize: number, encoding: number): boolean;

declare function CFStringGetCStringPtr(theString: string, encoding: number): interop.Pointer | interop.Reference<any>;

declare function CFStringGetCharacterAtIndex(theString: string, idx: number): number;

declare function CFStringGetCharacters(theString: string, range: CFRange, buffer: interop.Pointer | interop.Reference<number>): void;

declare function CFStringGetCharactersPtr(theString: string): interop.Pointer | interop.Reference<number>;

declare function CFStringGetDoubleValue(str: string): number;

declare function CFStringGetFastestEncoding(theString: string): number;

declare function CFStringGetFileSystemRepresentation(string: string, buffer: string | interop.Pointer | interop.Reference<any>, maxBufLen: number): boolean;

/**
 * @since 4.2
 */
declare function CFStringGetHyphenationLocationBeforeIndex(string: string, location: number, limitRange: CFRange, options: number, locale: NSLocale, character: interop.Pointer | interop.Reference<number>): number;

declare function CFStringGetIntValue(str: string): number;

declare function CFStringGetLength(theString: string): number;

declare function CFStringGetLineBounds(theString: string, range: CFRange, lineBeginIndex: interop.Pointer | interop.Reference<number>, lineEndIndex: interop.Pointer | interop.Reference<number>, contentsEndIndex: interop.Pointer | interop.Reference<number>): void;

declare function CFStringGetListOfAvailableEncodings(): interop.Pointer | interop.Reference<number>;

declare function CFStringGetMaximumSizeForEncoding(length: number, encoding: number): number;

declare function CFStringGetMaximumSizeOfFileSystemRepresentation(string: string): number;

declare function CFStringGetMostCompatibleMacStringEncoding(encoding: number): number;

declare function CFStringGetNameOfEncoding(encoding: number): string;

/**
 * @since 2.0
 */
declare function CFStringGetParagraphBounds(string: string, range: CFRange, parBeginIndex: interop.Pointer | interop.Reference<number>, parEndIndex: interop.Pointer | interop.Reference<number>, contentsEndIndex: interop.Pointer | interop.Reference<number>): void;

declare function CFStringGetPascalString(theString: string, buffer: string | interop.Pointer | interop.Reference<any>, bufferSize: number, encoding: number): boolean;

declare function CFStringGetPascalStringPtr(theString: string, encoding: number): interop.Pointer | interop.Reference<any>;

declare function CFStringGetRangeOfComposedCharactersAtIndex(theString: string, theIndex: number): CFRange;

declare function CFStringGetSmallestEncoding(theString: string): number;

declare function CFStringGetSystemEncoding(): number;

declare function CFStringGetTypeID(): number;

declare function CFStringHasPrefix(theString: string, prefix: string): boolean;

declare function CFStringHasSuffix(theString: string, suffix: string): boolean;

interface CFStringInlineBuffer {
	buffer: interop.Reference<number>;
	theString: string;
	directUniCharBuffer: interop.Pointer | interop.Reference<number>;
	directCStringBuffer: interop.Pointer | interop.Reference<any>;
	rangeToBuffer: CFRange;
	bufferedRangeStart: number;
	bufferedRangeEnd: number;
}
declare var CFStringInlineBuffer: interop.StructType<CFStringInlineBuffer>;

declare function CFStringInsert(str: string, idx: number, insertedStr: string): void;

declare function CFStringIsEncodingAvailable(encoding: number): boolean;

/**
 * @since 4.3
 */
declare function CFStringIsHyphenationAvailableForLocale(locale: NSLocale): boolean;

declare function CFStringLowercase(theString: string, locale: NSLocale): void;

declare const enum CFStringNormalizationForm {

	kCFStringNormalizationFormD = 0,

	kCFStringNormalizationFormKD = 1,

	kCFStringNormalizationFormC = 2,

	kCFStringNormalizationFormKC = 3
}

declare function CFStringNormalize(theString: string, theForm: CFStringNormalizationForm): void;

declare function CFStringPad(theString: string, padString: string, length: number, indexIntoPad: number): void;

declare function CFStringReplace(theString: string, range: CFRange, replacement: string): void;

declare function CFStringReplaceAll(theString: string, replacement: string): void;

declare function CFStringSetExternalCharactersNoCopy(theString: string, chars: interop.Pointer | interop.Reference<number>, length: number, capacity: number): void;

/**
 * @since 3.0
 */
declare function CFStringTokenizerAdvanceToNextToken(tokenizer: any): CFStringTokenizerTokenType;

/**
 * @since 3.0
 */
declare function CFStringTokenizerCopyBestStringLanguage(string: string, range: CFRange): string;

/**
 * @since 3.0
 */
declare function CFStringTokenizerCopyCurrentTokenAttribute(tokenizer: any, attribute: number): any;

/**
 * @since 3.0
 */
declare function CFStringTokenizerCreate(alloc: any, string: string, range: CFRange, options: number, locale: NSLocale): any;

/**
 * @since 3.0
 */
declare function CFStringTokenizerGetCurrentSubTokens(tokenizer: any, ranges: interop.Pointer | interop.Reference<CFRange>, maxRangeLength: number, derivedSubTokens: NSArray<any> | any[]): number;

/**
 * @since 3.0
 */
declare function CFStringTokenizerGetCurrentTokenRange(tokenizer: any): CFRange;

/**
 * @since 3.0
 */
declare function CFStringTokenizerGetTypeID(): number;

/**
 * @since 3.0
 */
declare function CFStringTokenizerGoToTokenAtIndex(tokenizer: any, index: number): CFStringTokenizerTokenType;

/**
 * @since 3.0
 */
declare function CFStringTokenizerSetString(tokenizer: any, string: string, range: CFRange): void;

declare const enum CFStringTokenizerTokenType {

	kCFStringTokenizerTokenNone = 0,

	kCFStringTokenizerTokenNormal = 1,

	kCFStringTokenizerTokenHasSubTokensMask = 2,

	kCFStringTokenizerTokenHasDerivedSubTokensMask = 4,

	kCFStringTokenizerTokenHasHasNumbersMask = 8,

	kCFStringTokenizerTokenHasNonLettersMask = 16,

	kCFStringTokenizerTokenIsCJWordMask = 32
}

declare function CFStringTransform(string: string, range: interop.Pointer | interop.Reference<CFRange>, transform: string, reverse: boolean): boolean;

declare function CFStringTrim(theString: string, trimString: string): void;

declare function CFStringTrimWhitespace(theString: string): void;

declare function CFStringUppercase(theString: string, locale: NSLocale): void;

interface CFSwappedFloat32 {
	v: number;
}
declare var CFSwappedFloat32: interop.StructType<CFSwappedFloat32>;

interface CFSwappedFloat64 {
	v: number;
}
declare var CFSwappedFloat64: interop.StructType<CFSwappedFloat64>;

declare function CFTimeZoneCopyAbbreviation(tz: NSTimeZone, at: number): string;

declare function CFTimeZoneCopyAbbreviationDictionary(): NSDictionary<any, any>;

declare function CFTimeZoneCopyDefault(): NSTimeZone;

declare function CFTimeZoneCopyKnownNames(): NSArray<any>;

/**
 * @since 2.0
 */
declare function CFTimeZoneCopyLocalizedName(tz: NSTimeZone, style: CFTimeZoneNameStyle, locale: NSLocale): string;

declare function CFTimeZoneCopySystem(): NSTimeZone;

declare function CFTimeZoneCreate(allocator: any, name: string, data: NSData): NSTimeZone;

declare function CFTimeZoneCreateWithName(allocator: any, name: string, tryAbbrev: boolean): NSTimeZone;

declare function CFTimeZoneCreateWithTimeIntervalFromGMT(allocator: any, ti: number): NSTimeZone;

declare function CFTimeZoneGetData(tz: NSTimeZone): NSData;

/**
 * @since 2.0
 */
declare function CFTimeZoneGetDaylightSavingTimeOffset(tz: NSTimeZone, at: number): number;

declare function CFTimeZoneGetName(tz: NSTimeZone): string;

/**
 * @since 2.0
 */
declare function CFTimeZoneGetNextDaylightSavingTimeTransition(tz: NSTimeZone, at: number): number;

declare function CFTimeZoneGetSecondsFromGMT(tz: NSTimeZone, at: number): number;

declare function CFTimeZoneGetTypeID(): number;

declare function CFTimeZoneIsDaylightSavingTime(tz: NSTimeZone, at: number): boolean;

/**
 * @since 2.0
 */
declare const enum CFTimeZoneNameStyle {

	kCFTimeZoneNameStyleStandard = 0,

	kCFTimeZoneNameStyleShortStandard = 1,

	kCFTimeZoneNameStyleDaylightSaving = 2,

	kCFTimeZoneNameStyleShortDaylightSaving = 3,

	kCFTimeZoneNameStyleGeneric = 4,

	kCFTimeZoneNameStyleShortGeneric = 5
}

declare function CFTimeZoneResetSystem(): void;

declare function CFTimeZoneSetAbbreviationDictionary(dict: NSDictionary<any, any>): void;

declare function CFTimeZoneSetDefault(tz: NSTimeZone): void;

declare function CFTreeAppendChild(tree: any, newChild: any): void;

declare function CFTreeApplyFunctionToChildren(tree: any, applier: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

interface CFTreeContext {
	version: number;
	info: interop.Pointer | interop.Reference<any>;
	retain: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>>;
	release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => string>;
}
declare var CFTreeContext: interop.StructType<CFTreeContext>;

declare function CFTreeCreate(allocator: any, context: interop.Pointer | interop.Reference<CFTreeContext>): any;

declare function CFTreeFindRoot(tree: any): any;

declare function CFTreeGetChildAtIndex(tree: any, idx: number): any;

declare function CFTreeGetChildCount(tree: any): number;

declare function CFTreeGetChildren(tree: any, children: interop.Pointer | interop.Reference<any>): void;

declare function CFTreeGetContext(tree: any, context: interop.Pointer | interop.Reference<CFTreeContext>): void;

declare function CFTreeGetFirstChild(tree: any): any;

declare function CFTreeGetNextSibling(tree: any): any;

declare function CFTreeGetParent(tree: any): any;

declare function CFTreeGetTypeID(): number;

declare function CFTreeInsertSibling(tree: any, newSibling: any): void;

declare function CFTreePrependChild(tree: any, newChild: any): void;

declare function CFTreeRemove(tree: any): void;

declare function CFTreeRemoveAllChildren(tree: any): void;

declare function CFTreeSetContext(tree: any, context: interop.Pointer | interop.Reference<CFTreeContext>): void;

declare function CFTreeSortChildren(tree: any, comparator: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => CFComparisonResult>, context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 4.0
 */
declare const enum CFURLBookmarkCreationOptions {

	kCFURLBookmarkCreationMinimalBookmarkMask = 512,

	kCFURLBookmarkCreationSuitableForBookmarkFile = 1024,

	kCFURLBookmarkCreationWithSecurityScope = 2048,

	kCFURLBookmarkCreationSecurityScopeAllowOnlyReadAccess = 4096,

	kCFURLBookmarkCreationWithoutImplicitSecurityScope = 536870912,

	kCFURLBookmarkCreationPreferFileIDResolutionMask = 256
}

/**
 * @since 4.0
 */
declare const enum CFURLBookmarkResolutionOptions {

	kCFURLBookmarkResolutionWithoutUIMask = 256,

	kCFURLBookmarkResolutionWithoutMountingMask = 512,

	kCFURLBookmarkResolutionWithSecurityScope = 1024,

	kCFURLBookmarkResolutionWithoutImplicitStartAccessing = 32768,

	kCFBookmarkResolutionWithoutUIMask = 256,

	kCFBookmarkResolutionWithoutMountingMask = 512
}

declare function CFURLCanBeDecomposed(anURL: NSURL): boolean;

/**
 * @since 4.0
 */
declare function CFURLClearResourcePropertyCache(url: NSURL): void;

/**
 * @since 4.0
 */
declare function CFURLClearResourcePropertyCacheForKey(url: NSURL, key: string): void;

declare const enum CFURLComponentType {

	kCFURLComponentScheme = 1,

	kCFURLComponentNetLocation = 2,

	kCFURLComponentPath = 3,

	kCFURLComponentResourceSpecifier = 4,

	kCFURLComponentUser = 5,

	kCFURLComponentPassword = 6,

	kCFURLComponentUserInfo = 7,

	kCFURLComponentHost = 8,

	kCFURLComponentPort = 9,

	kCFURLComponentParameterString = 10,

	kCFURLComponentQuery = 11,

	kCFURLComponentFragment = 12
}

declare function CFURLCopyAbsoluteURL(relativeURL: NSURL): NSURL;

declare function CFURLCopyFileSystemPath(anURL: NSURL, pathStyle: CFURLPathStyle): string;

declare function CFURLCopyFragment(anURL: NSURL, charactersToLeaveEscaped: string): string;

declare function CFURLCopyHostName(anURL: NSURL): string;

declare function CFURLCopyLastPathComponent(url: NSURL): string;

declare function CFURLCopyNetLocation(anURL: NSURL): string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare function CFURLCopyParameterString(anURL: NSURL, charactersToLeaveEscaped: string): string;

declare function CFURLCopyPassword(anURL: NSURL): string;

declare function CFURLCopyPath(anURL: NSURL): string;

declare function CFURLCopyPathExtension(url: NSURL): string;

declare function CFURLCopyQueryString(anURL: NSURL, charactersToLeaveEscaped: string): string;

/**
 * @since 4.0
 */
declare function CFURLCopyResourcePropertiesForKeys(url: NSURL, keys: NSArray<any> | any[], error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSDictionary<any, any>>;

/**
 * @since 4.0
 */
declare function CFURLCopyResourcePropertyForKey(url: NSURL, key: string, propertyValueTypeRefPtr: interop.Pointer | interop.Reference<any>, error: interop.Pointer | interop.Reference<NSError>): boolean;

declare function CFURLCopyResourceSpecifier(anURL: NSURL): string;

declare function CFURLCopyScheme(anURL: NSURL): string;

declare function CFURLCopyStrictPath(anURL: NSURL, isAbsolute: string | interop.Pointer | interop.Reference<any>): string;

declare function CFURLCopyUserName(anURL: NSURL): string;

declare function CFURLCreateAbsoluteURLWithBytes(alloc: any, relativeURLBytes: string | interop.Pointer | interop.Reference<any>, length: number, encoding: number, baseURL: NSURL, useCompatibilityMode: boolean): NSURL;

/**
 * @since 4.0
 */
declare function CFURLCreateBookmarkData(allocator: any, url: NSURL, options: CFURLBookmarkCreationOptions, resourcePropertiesToInclude: NSArray<any> | any[], relativeToURL: NSURL, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSData>;

/**
 * @since 5.0
 */
declare function CFURLCreateBookmarkDataFromFile(allocator: any, fileURL: NSURL, errorRef: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSData>;

/**
 * @since 4.0
 */
declare function CFURLCreateByResolvingBookmarkData(allocator: any, bookmark: NSData, options: CFURLBookmarkResolutionOptions, relativeToURL: NSURL, resourcePropertiesToInclude: NSArray<any> | any[], isStale: string | interop.Pointer | interop.Reference<any>, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSURL>;

declare function CFURLCreateCopyAppendingPathComponent(allocator: any, url: NSURL, pathComponent: string, isDirectory: boolean): NSURL;

declare function CFURLCreateCopyAppendingPathExtension(allocator: any, url: NSURL, extension: string): NSURL;

declare function CFURLCreateCopyDeletingLastPathComponent(allocator: any, url: NSURL): NSURL;

declare function CFURLCreateCopyDeletingPathExtension(allocator: any, url: NSURL): NSURL;

declare function CFURLCreateData(allocator: any, url: NSURL, encoding: number, escapeWhitespace: boolean): NSData;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFURLCreateDataAndPropertiesFromResource(alloc: any, url: NSURL, resourceData: interop.Pointer | interop.Reference<NSData>, properties: interop.Pointer | interop.Reference<NSDictionary<any, any>>, desiredProperties: NSArray<any> | any[], errorCode: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 4.0
 */
declare function CFURLCreateFilePathURL(allocator: any, url: NSURL, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSURL>;

/**
 * @since 4.0
 */
declare function CFURLCreateFileReferenceURL(allocator: any, url: NSURL, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<NSURL>;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFURLCreateFromFSRef(allocator: any, fsRef: interop.Pointer | interop.Reference<any>): NSURL;

declare function CFURLCreateFromFileSystemRepresentation(allocator: any, buffer: string | interop.Pointer | interop.Reference<any>, bufLen: number, isDirectory: boolean): NSURL;

declare function CFURLCreateFromFileSystemRepresentationRelativeToBase(allocator: any, buffer: string | interop.Pointer | interop.Reference<any>, bufLen: number, isDirectory: boolean, baseURL: NSURL): NSURL;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFURLCreatePropertyFromResource(alloc: any, url: NSURL, property: string, errorCode: interop.Pointer | interop.Reference<number>): any;

/**
 * @since 4.0
 */
declare function CFURLCreateResourcePropertiesForKeysFromBookmarkData(allocator: any, resourcePropertiesToReturn: NSArray<any> | any[], bookmark: NSData): interop.Unmanaged<NSDictionary<any, any>>;

/**
 * @since 4.0
 */
declare function CFURLCreateResourcePropertyForKeyFromBookmarkData(allocator: any, resourcePropertyKey: string, bookmark: NSData): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFURLCreateStringByAddingPercentEscapes(allocator: any, originalString: string, charactersToLeaveUnescaped: string, legalURLCharactersToBeEscaped: string, encoding: number): string;

declare function CFURLCreateStringByReplacingPercentEscapes(allocator: any, originalString: string, charactersToLeaveEscaped: string): string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function CFURLCreateStringByReplacingPercentEscapesUsingEncoding(allocator: any, origString: string, charsToLeaveEscaped: string, encoding: number): string;

declare function CFURLCreateWithBytes(allocator: any, URLBytes: string | interop.Pointer | interop.Reference<any>, length: number, encoding: number, baseURL: NSURL): NSURL;

declare function CFURLCreateWithFileSystemPath(allocator: any, filePath: string, pathStyle: CFURLPathStyle, isDirectory: boolean): NSURL;

declare function CFURLCreateWithFileSystemPathRelativeToBase(allocator: any, filePath: string, pathStyle: CFURLPathStyle, isDirectory: boolean, baseURL: NSURL): NSURL;

declare function CFURLCreateWithString(allocator: any, URLString: string, baseURL: NSURL): NSURL;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFURLDestroyResource(url: NSURL, errorCode: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 4.0
 */
declare function CFURLEnumeratorCreateForDirectoryURL(alloc: any, directoryURL: NSURL, option: CFURLEnumeratorOptions, propertyKeys: NSArray<any> | any[]): any;

/**
 * @since 4.0
 */
declare function CFURLEnumeratorCreateForMountedVolumes(alloc: any, option: CFURLEnumeratorOptions, propertyKeys: NSArray<any> | any[]): any;

/**
 * @since 4.0
 */
declare function CFURLEnumeratorGetDescendentLevel(enumerator: any): number;

/**
 * @since 4.0
 */
declare function CFURLEnumeratorGetNextURL(enumerator: any, url: interop.Pointer | interop.Reference<NSURL>, error: interop.Pointer | interop.Reference<NSError>): CFURLEnumeratorResult;

/**
 * @since 4.0
 * @deprecated 5.0
 */
declare function CFURLEnumeratorGetSourceDidChange(enumerator: any): boolean;

/**
 * @since 4.0
 */
declare function CFURLEnumeratorGetTypeID(): number;

declare const enum CFURLEnumeratorOptions {

	kCFURLEnumeratorDefaultBehavior = 0,

	kCFURLEnumeratorDescendRecursively = 1,

	kCFURLEnumeratorSkipInvisibles = 2,

	kCFURLEnumeratorGenerateFileReferenceURLs = 4,

	kCFURLEnumeratorSkipPackageContents = 8,

	kCFURLEnumeratorIncludeDirectoriesPreOrder = 16,

	kCFURLEnumeratorIncludeDirectoriesPostOrder = 32,

	kCFURLEnumeratorGenerateRelativePathURLs = 64
}

declare const enum CFURLEnumeratorResult {

	kCFURLEnumeratorSuccess = 1,

	kCFURLEnumeratorEnd = 2,

	kCFURLEnumeratorError = 3,

	kCFURLEnumeratorDirectoryPostOrderSuccess = 4
}

/**
 * @since 4.0
 */
declare function CFURLEnumeratorSkipDescendents(enumerator: any): void;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare const enum CFURLError {

	kCFURLUnknownError = -10,

	kCFURLUnknownSchemeError = -11,

	kCFURLResourceNotFoundError = -12,

	kCFURLResourceAccessViolationError = -13,

	kCFURLRemoteHostUnavailableError = -14,

	kCFURLImproperArgumentsError = -15,

	kCFURLUnknownPropertyKeyError = -16,

	kCFURLPropertyKeyUnavailableError = -17,

	kCFURLTimeoutError = -18
}

declare function CFURLGetBaseURL(anURL: NSURL): NSURL;

declare function CFURLGetByteRangeForComponent(url: NSURL, component: CFURLComponentType, rangeIncludingSeparators: interop.Pointer | interop.Reference<CFRange>): CFRange;

declare function CFURLGetBytes(url: NSURL, buffer: string | interop.Pointer | interop.Reference<any>, bufferLength: number): number;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFURLGetFSRef(url: NSURL, fsRef: interop.Pointer | interop.Reference<any>): boolean;

declare function CFURLGetFileSystemRepresentation(url: NSURL, resolveAgainstBase: boolean, buffer: string | interop.Pointer | interop.Reference<any>, maxBufLen: number): boolean;

declare function CFURLGetPortNumber(anURL: NSURL): number;

declare function CFURLGetString(anURL: NSURL): string;

declare function CFURLGetTypeID(): number;

declare function CFURLHasDirectoryPath(anURL: NSURL): boolean;

/**
 * @since 7.0
 */
declare function CFURLIsFileReferenceURL(url: NSURL): boolean;

declare const enum CFURLPathStyle {

	kCFURLPOSIXPathStyle = 0,

	kCFURLHFSPathStyle = 1,

	kCFURLWindowsPathStyle = 2
}

/**
 * @since 4.0
 */
declare function CFURLResourceIsReachable(url: NSURL, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 4.0
 */
declare function CFURLSetResourcePropertiesForKeys(url: NSURL, keyedPropertyValues: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 4.0
 */
declare function CFURLSetResourcePropertyForKey(url: NSURL, key: string, propertyValue: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 4.0
 */
declare function CFURLSetTemporaryResourcePropertyForKey(url: NSURL, key: string, propertyValue: any): void;

/**
 * @since 8.0
 */
declare function CFURLStartAccessingSecurityScopedResource(url: NSURL): boolean;

/**
 * @since 8.0
 */
declare function CFURLStopAccessingSecurityScopedResource(url: NSURL): void;

/**
 * @since 5.0
 */
declare function CFURLWriteBookmarkDataToFile(bookmarkRef: NSData, fileURL: NSURL, options: number, errorRef: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare function CFURLWriteDataAndPropertiesToResource(url: NSURL, dataToWrite: NSData, propertiesToWrite: NSDictionary<any, any>, errorCode: interop.Pointer | interop.Reference<number>): boolean;

interface CFUUIDBytes {
	byte0: number;
	byte1: number;
	byte2: number;
	byte3: number;
	byte4: number;
	byte5: number;
	byte6: number;
	byte7: number;
	byte8: number;
	byte9: number;
	byte10: number;
	byte11: number;
	byte12: number;
	byte13: number;
	byte14: number;
	byte15: number;
}
declare var CFUUIDBytes: interop.StructType<CFUUIDBytes>;

declare function CFUUIDCreate(alloc: any): any;

declare function CFUUIDCreateFromString(alloc: any, uuidStr: string): any;

declare function CFUUIDCreateFromUUIDBytes(alloc: any, bytes: CFUUIDBytes): any;

declare function CFUUIDCreateString(alloc: any, uuid: any): string;

declare function CFUUIDCreateWithBytes(alloc: any, byte0: number, byte1: number, byte2: number, byte3: number, byte4: number, byte5: number, byte6: number, byte7: number, byte8: number, byte9: number, byte10: number, byte11: number, byte12: number, byte13: number, byte14: number, byte15: number): any;

declare function CFUUIDGetConstantUUIDWithBytes(alloc: any, byte0: number, byte1: number, byte2: number, byte3: number, byte4: number, byte5: number, byte6: number, byte7: number, byte8: number, byte9: number, byte10: number, byte11: number, byte12: number, byte13: number, byte14: number, byte15: number): any;

declare function CFUUIDGetTypeID(): number;

declare function CFUUIDGetUUIDBytes(uuid: any): CFUUIDBytes;

declare function CFWriteStreamCanAcceptBytes(stream: NSOutputStream): boolean;

declare function CFWriteStreamClose(stream: NSOutputStream): void;

/**
 * @since 7.0
 */
declare function CFWriteStreamCopyDispatchQueue(stream: NSOutputStream): NSObject & OS_dispatch_queue;

/**
 * @since 2.0
 */
declare function CFWriteStreamCopyError(stream: NSOutputStream): NSError;

declare function CFWriteStreamCopyProperty(stream: NSOutputStream, propertyName: string): any;

declare function CFWriteStreamCreateWithAllocatedBuffers(alloc: any, bufferAllocator: any): NSOutputStream;

declare function CFWriteStreamCreateWithBuffer(alloc: any, buffer: string | interop.Pointer | interop.Reference<any>, bufferCapacity: number): NSOutputStream;

declare function CFWriteStreamCreateWithFile(alloc: any, fileURL: NSURL): NSOutputStream;

declare function CFWriteStreamGetError(stream: NSOutputStream): CFStreamError;

declare function CFWriteStreamGetStatus(stream: NSOutputStream): CFStreamStatus;

declare function CFWriteStreamGetTypeID(): number;

declare function CFWriteStreamOpen(stream: NSOutputStream): boolean;

declare function CFWriteStreamScheduleWithRunLoop(stream: NSOutputStream, runLoop: any, runLoopMode: string): void;

declare function CFWriteStreamSetClient(stream: NSOutputStream, streamEvents: number, clientCB: interop.FunctionReference<(p1: NSOutputStream, p2: CFStreamEventType, p3: interop.Pointer | interop.Reference<any>) => void>, clientContext: interop.Pointer | interop.Reference<CFStreamClientContext>): boolean;

/**
 * @since 7.0
 */
declare function CFWriteStreamSetDispatchQueue(stream: NSOutputStream, q: NSObject & OS_dispatch_queue): void;

declare function CFWriteStreamSetProperty(stream: NSOutputStream, propertyName: string, propertyValue: any): boolean;

declare function CFWriteStreamUnscheduleFromRunLoop(stream: NSOutputStream, runLoop: any, runLoopMode: string): void;

declare function CFWriteStreamWrite(stream: NSOutputStream, buffer: string | interop.Pointer | interop.Reference<any>, bufferLength: number): number;

interface CGAffineTransform {
	a: number;
	b: number;
	c: number;
	d: number;
	tx: number;
	ty: number;
}
declare var CGAffineTransform: interop.StructType<CGAffineTransform>;

interface CGAffineTransformComponents {
	scale: CGSize;
	horizontalShear: number;
	rotation: number;
	translation: CGVector;
}
declare var CGAffineTransformComponents: interop.StructType<CGAffineTransformComponents>;

interface CGPoint {
	x: number;
	y: number;
}
declare var CGPoint: interop.StructType<CGPoint>;

interface CGRect {
	origin: CGPoint;
	size: CGSize;
}
declare var CGRect: interop.StructType<CGRect>;

declare const enum CGRectEdge {

	MinXEdge = 0,

	MinYEdge = 1,

	MaxXEdge = 2,

	MaxYEdge = 3
}

interface CGSize {
	width: number;
	height: number;
}
declare var CGSize: interop.StructType<CGSize>;

interface CGVector {
	dx: number;
	dy: number;
}
declare var CGVector: interop.StructType<CGVector>;

interface IUnknownVTbl {
	_reserved: interop.Pointer | interop.Reference<any>;
	QueryInterface: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: CFUUIDBytes, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	AddRef: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	Release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
}
declare var IUnknownVTbl: interop.StructType<IUnknownVTbl>;

declare const enum __CFByteOrder {

	CFByteOrderUnknown = 0,

	CFByteOrderLittleEndian = 1,

	CFByteOrderBigEndian = 2
}

declare function __CFRangeMake(loc: number, len: number): CFRange;

declare function __CFStringMakeConstantString(cStr: string | interop.Pointer | interop.Reference<any>): string;

declare var kCFAbsoluteTimeIntervalSince1904: number;

declare var kCFAbsoluteTimeIntervalSince1970: number;

declare var kCFAllocatorDefault: any;

declare var kCFAllocatorMalloc: any;

declare var kCFAllocatorMallocZone: any;

declare var kCFAllocatorNull: any;

declare var kCFAllocatorSystemDefault: any;

declare var kCFAllocatorUseContext: any;

declare var kCFBooleanFalse: number;

declare var kCFBooleanTrue: number;

declare var kCFBuddhistCalendar: string;

declare var kCFBundleDevelopmentRegionKey: string;

declare const kCFBundleExecutableArchitectureARM64: number;

declare const kCFBundleExecutableArchitectureI386: number;

declare const kCFBundleExecutableArchitecturePPC: number;

declare const kCFBundleExecutableArchitecturePPC64: number;

declare const kCFBundleExecutableArchitectureX86_64: number;

declare var kCFBundleExecutableKey: string;

declare var kCFBundleIdentifierKey: string;

declare var kCFBundleInfoDictionaryVersionKey: string;

declare var kCFBundleLocalizationsKey: string;

declare var kCFBundleNameKey: string;

declare var kCFBundleVersionKey: string;

declare const kCFCalendarComponentsWrap: number;

declare var kCFChineseCalendar: string;

declare var kCFCopyStringBagCallBacks: CFBagCallBacks;

declare var kCFCopyStringDictionaryKeyCallBacks: CFDictionaryKeyCallBacks;

declare var kCFCopyStringSetCallBacks: CFSetCallBacks;

declare var kCFCoreFoundationVersionNumber: number;

declare var kCFDateFormatterAMSymbol: string;

declare var kCFDateFormatterCalendar: string;

declare var kCFDateFormatterCalendarName: string;

declare var kCFDateFormatterDefaultDate: string;

declare var kCFDateFormatterDefaultFormat: string;

/**
 * @since 4.0
 */
declare var kCFDateFormatterDoesRelativeDateFormattingKey: string;

declare var kCFDateFormatterEraSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterGregorianStartDate: string;

declare var kCFDateFormatterIsLenient: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterLongEraSymbols: string;

declare var kCFDateFormatterMonthSymbols: string;

declare var kCFDateFormatterPMSymbol: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterQuarterSymbols: string;

declare var kCFDateFormatterShortMonthSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterShortQuarterSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterShortStandaloneMonthSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterShortStandaloneQuarterSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterShortStandaloneWeekdaySymbols: string;

declare var kCFDateFormatterShortWeekdaySymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterStandaloneMonthSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterStandaloneQuarterSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterStandaloneWeekdaySymbols: string;

declare var kCFDateFormatterTimeZone: string;

declare var kCFDateFormatterTwoDigitStartDate: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterVeryShortMonthSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterVeryShortStandaloneMonthSymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterVeryShortStandaloneWeekdaySymbols: string;

/**
 * @since 2.0
 */
declare var kCFDateFormatterVeryShortWeekdaySymbols: string;

declare var kCFDateFormatterWeekdaySymbols: string;

/**
 * @since 2.0
 */
declare var kCFErrorDescriptionKey: string;

/**
 * @since 2.0
 */
declare var kCFErrorDomainCocoa: string;

/**
 * @since 2.0
 */
declare var kCFErrorDomainMach: string;

/**
 * @since 2.0
 */
declare var kCFErrorDomainOSStatus: string;

/**
 * @since 2.0
 */
declare var kCFErrorDomainPOSIX: string;

/**
 * @since 5.0
 */
declare var kCFErrorFilePathKey: string;

/**
 * @since 2.0
 */
declare var kCFErrorLocalizedDescriptionKey: string;

/**
 * @since 11.0
 */
declare var kCFErrorLocalizedFailureKey: string;

/**
 * @since 2.0
 */
declare var kCFErrorLocalizedFailureReasonKey: string;

/**
 * @since 2.0
 */
declare var kCFErrorLocalizedRecoverySuggestionKey: string;

/**
 * @since 5.0
 */
declare var kCFErrorURLKey: string;

/**
 * @since 2.0
 */
declare var kCFErrorUnderlyingErrorKey: string;

declare const kCFFileDescriptorReadCallBack: number;

declare const kCFFileDescriptorWriteCallBack: number;

declare var kCFGregorianCalendar: string;

declare var kCFHebrewCalendar: string;

/**
 * @since 4.0
 */
declare var kCFISO8601Calendar: string;

/**
 * @since 4.0
 */
declare var kCFIndianCalendar: string;

declare var kCFIslamicCalendar: string;

declare var kCFIslamicCivilCalendar: string;

/**
 * @since 8.0
 */
declare var kCFIslamicTabularCalendar: string;

/**
 * @since 8.0
 */
declare var kCFIslamicUmmAlQuraCalendar: string;

declare var kCFJapaneseCalendar: string;

/**
 * @since 4.0
 */
declare var kCFLocaleAlternateQuotationBeginDelimiterKey: string;

/**
 * @since 4.0
 */
declare var kCFLocaleAlternateQuotationEndDelimiterKey: string;

declare var kCFLocaleCalendar: string;

declare var kCFLocaleCalendarIdentifier: string;

declare var kCFLocaleCollationIdentifier: string;

/**
 * @since 4.0
 */
declare var kCFLocaleCollatorIdentifier: string;

declare var kCFLocaleCountryCode: string;

declare var kCFLocaleCurrencyCode: string;

declare var kCFLocaleCurrencySymbol: string;

/**
 * @since 2.0
 */
declare var kCFLocaleCurrentLocaleDidChangeNotification: string;

declare var kCFLocaleDecimalSeparator: string;

declare var kCFLocaleExemplarCharacterSet: string;

declare var kCFLocaleGroupingSeparator: string;

declare var kCFLocaleIdentifier: string;

declare var kCFLocaleLanguageCode: string;

declare var kCFLocaleMeasurementSystem: string;

/**
 * @since 4.0
 */
declare var kCFLocaleQuotationBeginDelimiterKey: string;

/**
 * @since 4.0
 */
declare var kCFLocaleQuotationEndDelimiterKey: string;

declare var kCFLocaleScriptCode: string;

declare var kCFLocaleUsesMetricSystem: string;

declare var kCFLocaleVariantCode: string;

declare const kCFMessagePortBecameInvalidError: number;

declare const kCFMessagePortIsInvalid: number;

declare const kCFMessagePortReceiveTimeout: number;

declare const kCFMessagePortSendTimeout: number;

declare const kCFMessagePortSuccess: number;

declare const kCFMessagePortTransportError: number;

declare var kCFNotFound: number;

declare const kCFNotificationDeliverImmediately: number;

declare const kCFNotificationPostToAllSessions: number;

declare var kCFNull: NSNull;

declare var kCFNumberFormatterAlwaysShowDecimalSeparator: string;

declare var kCFNumberFormatterCurrencyCode: string;

declare var kCFNumberFormatterCurrencyDecimalSeparator: string;

/**
 * @since 2.0
 */
declare var kCFNumberFormatterCurrencyGroupingSeparator: string;

declare var kCFNumberFormatterCurrencySymbol: string;

declare var kCFNumberFormatterDecimalSeparator: string;

declare var kCFNumberFormatterDefaultFormat: string;

declare var kCFNumberFormatterExponentSymbol: string;

declare var kCFNumberFormatterFormatWidth: string;

declare var kCFNumberFormatterGroupingSeparator: string;

declare var kCFNumberFormatterGroupingSize: string;

declare var kCFNumberFormatterInfinitySymbol: string;

declare var kCFNumberFormatterInternationalCurrencySymbol: string;

/**
 * @since 2.0
 */
declare var kCFNumberFormatterIsLenient: string;

declare var kCFNumberFormatterMaxFractionDigits: string;

declare var kCFNumberFormatterMaxIntegerDigits: string;

/**
 * @since 2.0
 */
declare var kCFNumberFormatterMaxSignificantDigits: string;

declare var kCFNumberFormatterMinFractionDigits: string;

/**
 * @since 18.0
 */
declare var kCFNumberFormatterMinGroupingDigits: string;

declare var kCFNumberFormatterMinIntegerDigits: string;

/**
 * @since 2.0
 */
declare var kCFNumberFormatterMinSignificantDigits: string;

declare var kCFNumberFormatterMinusSign: string;

declare var kCFNumberFormatterMultiplier: string;

declare var kCFNumberFormatterNaNSymbol: string;

declare var kCFNumberFormatterNegativePrefix: string;

declare var kCFNumberFormatterNegativeSuffix: string;

declare var kCFNumberFormatterPaddingCharacter: string;

declare var kCFNumberFormatterPaddingPosition: string;

declare var kCFNumberFormatterPerMillSymbol: string;

declare var kCFNumberFormatterPercentSymbol: string;

declare var kCFNumberFormatterPlusSign: string;

declare var kCFNumberFormatterPositivePrefix: string;

declare var kCFNumberFormatterPositiveSuffix: string;

declare var kCFNumberFormatterRoundingIncrement: string;

declare var kCFNumberFormatterRoundingMode: string;

declare var kCFNumberFormatterSecondaryGroupingSize: string;

declare var kCFNumberFormatterUseGroupingSeparator: string;

/**
 * @since 2.0
 */
declare var kCFNumberFormatterUseSignificantDigits: string;

declare var kCFNumberFormatterZeroSymbol: string;

declare var kCFNumberNaN: number;

declare var kCFNumberNegativeInfinity: number;

declare var kCFNumberPositiveInfinity: number;

/**
 * @since 4.0
 */
declare var kCFPersianCalendar: string;

declare var kCFPlugInDynamicRegisterFunctionKey: string;

declare var kCFPlugInDynamicRegistrationKey: string;

declare var kCFPlugInFactoriesKey: string;

declare var kCFPlugInTypesKey: string;

declare var kCFPlugInUnloadFunctionKey: string;

declare var kCFPreferencesAnyApplication: string;

declare var kCFPreferencesAnyHost: string;

declare var kCFPreferencesAnyUser: string;

declare var kCFPreferencesCurrentApplication: string;

declare var kCFPreferencesCurrentHost: string;

declare var kCFPreferencesCurrentUser: string;

declare const kCFPropertyListReadCorruptError: number;

declare const kCFPropertyListReadStreamError: number;

declare const kCFPropertyListReadUnknownVersionError: number;

declare const kCFPropertyListWriteStreamError: number;

/**
 * @since 4.0
 */
declare var kCFRepublicOfChinaCalendar: string;

declare var kCFRunLoopCommonModes: string;

declare var kCFRunLoopDefaultMode: string;

declare const kCFSocketAutomaticallyReenableAcceptCallBack: number;

declare const kCFSocketAutomaticallyReenableDataCallBack: number;

declare const kCFSocketAutomaticallyReenableReadCallBack: number;

declare const kCFSocketAutomaticallyReenableWriteCallBack: number;

declare const kCFSocketCloseOnInvalidate: number;

declare var kCFSocketCommandKey: string;

declare var kCFSocketErrorKey: string;

declare const kCFSocketLeaveErrors: number;

declare var kCFSocketNameKey: string;

declare var kCFSocketRegisterCommand: string;

declare var kCFSocketResultKey: string;

declare var kCFSocketRetrieveCommand: string;

declare var kCFSocketValueKey: string;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainSOCKS: number;

/**
 * @since 2.0
 */
declare var kCFStreamErrorDomainSSL: number;

declare var kCFStreamPropertyAppendToFile: string;

declare var kCFStreamPropertyDataWritten: string;

declare var kCFStreamPropertyFileCurrentOffset: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySOCKSPassword: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySOCKSProxy: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySOCKSProxyHost: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySOCKSProxyPort: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySOCKSUser: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySOCKSVersion: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertyShouldCloseNativeSocket: string;

declare var kCFStreamPropertySocketNativeHandle: string;

declare var kCFStreamPropertySocketRemoteHostName: string;

declare var kCFStreamPropertySocketRemotePortNumber: string;

/**
 * @since 2.0
 */
declare var kCFStreamPropertySocketSecurityLevel: string;

/**
 * @since 2.0
 */
declare var kCFStreamSocketSOCKSVersion4: string;

/**
 * @since 2.0
 */
declare var kCFStreamSocketSOCKSVersion5: string;

/**
 * @since 2.0
 */
declare var kCFStreamSocketSecurityLevelNegotiatedSSL: string;

/**
 * @since 2.0
 */
declare var kCFStreamSocketSecurityLevelNone: string;

/**
 * @since 2.0
 * @deprecated 10.0
 */
declare var kCFStreamSocketSecurityLevelSSLv2: string;

/**
 * @since 2.0
 * @deprecated 10.0
 */
declare var kCFStreamSocketSecurityLevelSSLv3: string;

/**
 * @since 2.0
 */
declare var kCFStreamSocketSecurityLevelTLSv1: string;

declare var kCFStringBinaryHeapCallBacks: CFBinaryHeapCallBacks;

declare const kCFStringTokenizerAttributeLanguage: number;

declare const kCFStringTokenizerAttributeLatinTranscription: number;

declare const kCFStringTokenizerUnitLineBreak: number;

declare const kCFStringTokenizerUnitParagraph: number;

declare const kCFStringTokenizerUnitSentence: number;

declare const kCFStringTokenizerUnitWord: number;

declare const kCFStringTokenizerUnitWordBoundary: number;

declare var kCFStringTransformFullwidthHalfwidth: string;

declare var kCFStringTransformHiraganaKatakana: string;

declare var kCFStringTransformLatinArabic: string;

declare var kCFStringTransformLatinCyrillic: string;

declare var kCFStringTransformLatinGreek: string;

declare var kCFStringTransformLatinHangul: string;

declare var kCFStringTransformLatinHebrew: string;

declare var kCFStringTransformLatinHiragana: string;

declare var kCFStringTransformLatinKatakana: string;

declare var kCFStringTransformLatinThai: string;

declare var kCFStringTransformMandarinLatin: string;

declare var kCFStringTransformStripCombiningMarks: string;

/**
 * @since 2.0
 */
declare var kCFStringTransformStripDiacritics: string;

declare var kCFStringTransformToLatin: string;

declare var kCFStringTransformToUnicodeName: string;

declare var kCFStringTransformToXMLHex: string;

/**
 * @since 2.0
 */
declare var kCFTimeZoneSystemTimeZoneDidChangeNotification: string;

declare var kCFTypeArrayCallBacks: CFArrayCallBacks;

declare var kCFTypeBagCallBacks: CFBagCallBacks;

declare var kCFTypeDictionaryKeyCallBacks: CFDictionaryKeyCallBacks;

declare var kCFTypeDictionaryValueCallBacks: CFDictionaryValueCallBacks;

declare var kCFTypeSetCallBacks: CFSetCallBacks;

/**
 * @since 8.0
 */
declare var kCFURLAddedToDirectoryDateKey: string;

/**
 * @since 4.0
 */
declare var kCFURLAttributeModificationDateKey: string;

/**
 * @since 10.0
 */
declare var kCFURLCanonicalPathKey: string;

/**
 * @since 4.0
 */
declare var kCFURLContentAccessDateKey: string;

/**
 * @since 4.0
 */
declare var kCFURLContentModificationDateKey: string;

/**
 * @since 4.0
 */
declare var kCFURLCreationDateKey: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var kCFURLCustomIconKey: string;

/**
 * @since 17.0
 */
declare var kCFURLDirectoryEntryCountKey: string;

/**
 * @since 8.0
 */
declare var kCFURLDocumentIdentifierKey: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var kCFURLEffectiveIconKey: string;

/**
 * @since 4.0
 */
declare var kCFURLFileAllocatedSizeKey: string;

/**
 * @since 14.0
 */
declare var kCFURLFileContentIdentifierKey: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLFileDirectoryContents: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLFileExists: string;

/**
 * @since 16.4
 */
declare var kCFURLFileIdentifierKey: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLFileLastModificationTime: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLFileLength: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLFileOwnerID: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLFilePOSIXMode: string;

/**
 * @since 9.0
 */
declare var kCFURLFileProtectionComplete: string;

/**
 * @since 9.0
 */
declare var kCFURLFileProtectionCompleteUnlessOpen: string;

/**
 * @since 9.0
 */
declare var kCFURLFileProtectionCompleteUntilFirstUserAuthentication: string;

/**
 * @since 17.0
 */
declare var kCFURLFileProtectionCompleteWhenUserInactive: string;

/**
 * @since 9.0
 */
declare var kCFURLFileProtectionKey: string;

/**
 * @since 9.0
 */
declare var kCFURLFileProtectionNone: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceIdentifierKey: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeBlockSpecial: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeCharacterSpecial: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeDirectory: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeKey: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeNamedPipe: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeRegular: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeSocket: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeSymbolicLink: string;

/**
 * @since 5.0
 */
declare var kCFURLFileResourceTypeUnknown: string;

/**
 * @since 5.0
 */
declare var kCFURLFileSecurityKey: string;

/**
 * @since 4.0
 */
declare var kCFURLFileSizeKey: string;

/**
 * @since 8.0
 */
declare var kCFURLGenerationIdentifierKey: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLHTTPStatusCode: string;

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare var kCFURLHTTPStatusLine: string;

/**
 * @since 4.0
 */
declare var kCFURLHasHiddenExtensionKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsAliasFileKey: string;

/**
 * @since 9.0
 */
declare var kCFURLIsApplicationKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsDirectoryKey: string;

/**
 * @since 5.1
 */
declare var kCFURLIsExcludedFromBackupKey: string;

/**
 * @since 5.0
 */
declare var kCFURLIsExecutableKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsHiddenKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsMountTriggerKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsPackageKey: string;

/**
 * @since 14.0
 */
declare var kCFURLIsPurgeableKey: string;

/**
 * @since 5.0
 */
declare var kCFURLIsReadableKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsRegularFileKey: string;

/**
 * @since 14.0
 */
declare var kCFURLIsSparseKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsSymbolicLinkKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsSystemImmutableKey: string;

/**
 * @since 5.0
 */
declare var kCFURLIsUbiquitousItemKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsUserImmutableKey: string;

/**
 * @since 4.0
 */
declare var kCFURLIsVolumeKey: string;

/**
 * @since 5.0
 */
declare var kCFURLIsWritableKey: string;

/**
 * @since 5.0
 */
declare var kCFURLKeysOfUnsetValuesKey: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var kCFURLLabelColorKey: string;

/**
 * @since 4.0
 */
declare var kCFURLLabelNumberKey: string;

/**
 * @since 4.0
 */
declare var kCFURLLinkCountKey: string;

/**
 * @since 4.0
 */
declare var kCFURLLocalizedLabelKey: string;

/**
 * @since 4.0
 */
declare var kCFURLLocalizedNameKey: string;

/**
 * @since 4.0
 */
declare var kCFURLLocalizedTypeDescriptionKey: string;

/**
 * @since 14.0
 */
declare var kCFURLMayHaveExtendedAttributesKey: string;

/**
 * @since 14.0
 */
declare var kCFURLMayShareFileContentKey: string;

/**
 * @since 4.0
 */
declare var kCFURLNameKey: string;

/**
 * @since 4.0
 */
declare var kCFURLParentDirectoryURLKey: string;

/**
 * @since 6.0
 */
declare var kCFURLPathKey: string;

/**
 * @since 5.0
 */
declare var kCFURLPreferredIOBlockSizeKey: string;

/**
 * @since 5.0
 */
declare var kCFURLTotalFileAllocatedSizeKey: string;

/**
 * @since 5.0
 */
declare var kCFURLTotalFileSizeKey: string;

/**
 * @since 4.0
 * @deprecated 100000
 */
declare var kCFURLTypeIdentifierKey: string;

/**
 * @since 7.0
 */
declare var kCFURLUbiquitousItemDownloadingErrorKey: string;

/**
 * @since 7.0
 */
declare var kCFURLUbiquitousItemDownloadingStatusCurrent: string;

/**
 * @since 7.0
 */
declare var kCFURLUbiquitousItemDownloadingStatusDownloaded: string;

/**
 * @since 7.0
 */
declare var kCFURLUbiquitousItemDownloadingStatusKey: string;

/**
 * @since 7.0
 */
declare var kCFURLUbiquitousItemDownloadingStatusNotDownloaded: string;

/**
 * @since 5.0
 */
declare var kCFURLUbiquitousItemHasUnresolvedConflictsKey: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var kCFURLUbiquitousItemIsDownloadedKey: string;

/**
 * @since 5.0
 */
declare var kCFURLUbiquitousItemIsDownloadingKey: string;

/**
 * @since 14.5
 */
declare var kCFURLUbiquitousItemIsExcludedFromSyncKey: string;

/**
 * @since 5.0
 */
declare var kCFURLUbiquitousItemIsUploadedKey: string;

/**
 * @since 5.0
 */
declare var kCFURLUbiquitousItemIsUploadingKey: string;

/**
 * @since 5.0
 * @deprecated 6.0
 */
declare var kCFURLUbiquitousItemPercentDownloadedKey: string;

/**
 * @since 5.0
 * @deprecated 6.0
 */
declare var kCFURLUbiquitousItemPercentUploadedKey: string;

/**
 * @since 7.0
 */
declare var kCFURLUbiquitousItemUploadingErrorKey: string;

/**
 * @since 11.0
 */
declare var kCFURLVolumeAvailableCapacityForImportantUsageKey: string;

/**
 * @since 11.0
 */
declare var kCFURLVolumeAvailableCapacityForOpportunisticUsageKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeAvailableCapacityKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeCreationDateKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIdentifierKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsAutomountedKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsBrowsableKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsEjectableKey: string;

/**
 * @since 10.0
 */
declare var kCFURLVolumeIsEncryptedKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsInternalKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeIsJournalingKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsLocalKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsReadOnlyKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeIsRemovableKey: string;

/**
 * @since 10.0
 */
declare var kCFURLVolumeIsRootFileSystemKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeLocalizedFormatDescriptionKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeLocalizedNameKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeMaximumFileSizeKey: string;

/**
 * @since 16.4
 */
declare var kCFURLVolumeMountFromLocationKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeNameKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeResourceCountKey: string;

/**
 * @since 16.4
 */
declare var kCFURLVolumeSubtypeKey: string;

/**
 * @since 11.0
 */
declare var kCFURLVolumeSupportsAccessPermissionsKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeSupportsAdvisoryFileLockingKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsCasePreservedNamesKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsCaseSensitiveNamesKey: string;

/**
 * @since 10.0
 */
declare var kCFURLVolumeSupportsCompressionKey: string;

/**
 * @since 10.0
 */
declare var kCFURLVolumeSupportsExclusiveRenamingKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeSupportsExtendedSecurityKey: string;

/**
 * @since 10.0
 */
declare var kCFURLVolumeSupportsFileCloningKey: string;

/**
 * @since 14.0
 */
declare var kCFURLVolumeSupportsFileProtectionKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsHardLinksKey: string;

/**
 * @since 11.0
 */
declare var kCFURLVolumeSupportsImmutableFilesKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsJournalingKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsPersistentIDsKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeSupportsRenamingKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeSupportsRootDirectoryDatesKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsSparseFilesKey: string;

/**
 * @since 10.0
 */
declare var kCFURLVolumeSupportsSwapRenamingKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsSymbolicLinksKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeSupportsVolumeSizesKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeSupportsZeroRunsKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeTotalCapacityKey: string;

/**
 * @since 16.4
 */
declare var kCFURLVolumeTypeNameKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeURLForRemountingKey: string;

/**
 * @since 4.0
 */
declare var kCFURLVolumeURLKey: string;

/**
 * @since 5.0
 */
declare var kCFURLVolumeUUIDStringKey: string;
