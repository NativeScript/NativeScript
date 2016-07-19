
declare function CFAbsoluteTimeAddGregorianUnits(at: number, tz: NSTimeZone, units: CFGregorianUnits): number;

declare function CFAbsoluteTimeGetCurrent(): number;

declare function CFAbsoluteTimeGetDayOfWeek(at: number, tz: NSTimeZone): number;

declare function CFAbsoluteTimeGetDayOfYear(at: number, tz: NSTimeZone): number;

declare function CFAbsoluteTimeGetDifferenceAsGregorianUnits(at1: number, at2: number, tz: NSTimeZone, unitFlags: number): CFGregorianUnits;

declare function CFAbsoluteTimeGetGregorianDate(at: number, tz: NSTimeZone): CFGregorianDate;

declare function CFAbsoluteTimeGetWeekOfYear(at: number, tz: NSTimeZone): number;

declare function CFAllocatorAllocate(allocator: any, size: number, hint: number): interop.Pointer;

interface CFAllocatorContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	allocate: interop.FunctionReference<(p1: number, p2: number, p3: interop.Pointer) => interop.Pointer>;
	reallocate: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: number, p4: interop.Pointer) => interop.Pointer>;
	deallocate: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>;
	preferredSize: interop.FunctionReference<(p1: number, p2: number, p3: interop.Pointer) => number>;
}
declare var CFAllocatorContext: interop.StructType<CFAllocatorContext>;

declare function CFAllocatorCreate(allocator: any, context: interop.Reference<CFAllocatorContext>): interop.Unmanaged<any>;

declare function CFAllocatorDeallocate(allocator: any, ptr: interop.Pointer): void;

declare function CFAllocatorGetContext(allocator: any, context: interop.Reference<CFAllocatorContext>): void;

declare function CFAllocatorGetDefault(): interop.Unmanaged<any>;

declare function CFAllocatorGetPreferredSizeForSize(allocator: any, size: number, hint: number): number;

declare function CFAllocatorGetTypeID(): number;

declare function CFAllocatorReallocate(allocator: any, ptr: interop.Pointer, newsize: number, hint: number): interop.Pointer;

declare function CFAllocatorSetDefault(allocator: any): void;

declare function CFArrayAppendArray(theArray: NSArray<any>, otherArray: NSArray<any>, otherRange: CFRange): void;

declare function CFArrayAppendValue(theArray: NSArray<any>, value: interop.Pointer): void;

declare function CFArrayApplyFunction(theArray: NSArray<any>, range: CFRange, applier: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, context: interop.Pointer): void;

declare function CFArrayBSearchValues(theArray: NSArray<any>, range: CFRange, value: interop.Pointer, comparator: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => CFComparisonResult>, context: interop.Pointer): number;

interface CFArrayCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
}
declare var CFArrayCallBacks: interop.StructType<CFArrayCallBacks>;

declare function CFArrayContainsValue(theArray: NSArray<any>, range: CFRange, value: interop.Pointer): boolean;

declare function CFArrayCreate(allocator: any, values: interop.Reference<interop.Pointer>, numValues: number, callBacks: interop.Reference<CFArrayCallBacks>): NSArray<any>;

declare function CFArrayCreateCopy(allocator: any, theArray: NSArray<any>): NSArray<any>;

declare function CFArrayCreateMutable(allocator: any, capacity: number, callBacks: interop.Reference<CFArrayCallBacks>): NSArray<any>;

declare function CFArrayCreateMutableCopy(allocator: any, capacity: number, theArray: NSArray<any>): NSArray<any>;

declare function CFArrayExchangeValuesAtIndices(theArray: NSArray<any>, idx1: number, idx2: number): void;

declare function CFArrayGetCount(theArray: NSArray<any>): number;

declare function CFArrayGetCountOfValue(theArray: NSArray<any>, range: CFRange, value: interop.Pointer): number;

declare function CFArrayGetFirstIndexOfValue(theArray: NSArray<any>, range: CFRange, value: interop.Pointer): number;

declare function CFArrayGetLastIndexOfValue(theArray: NSArray<any>, range: CFRange, value: interop.Pointer): number;

declare function CFArrayGetTypeID(): number;

declare function CFArrayGetValueAtIndex(theArray: NSArray<any>, idx: number): interop.Pointer;

declare function CFArrayGetValues(theArray: NSArray<any>, range: CFRange, values: interop.Reference<interop.Pointer>): void;

declare function CFArrayInsertValueAtIndex(theArray: NSArray<any>, idx: number, value: interop.Pointer): void;

declare function CFArrayRemoveAllValues(theArray: NSArray<any>): void;

declare function CFArrayRemoveValueAtIndex(theArray: NSArray<any>, idx: number): void;

declare function CFArrayReplaceValues(theArray: NSArray<any>, range: CFRange, newValues: interop.Reference<interop.Pointer>, newCount: number): void;

declare function CFArraySetValueAtIndex(theArray: NSArray<any>, idx: number, value: interop.Pointer): void;

declare function CFArraySortValues(theArray: NSArray<any>, range: CFRange, comparator: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => CFComparisonResult>, context: interop.Pointer): void;

declare function CFAttributedStringBeginEditing(aStr: NSAttributedString): void;

declare function CFAttributedStringCreate(alloc: any, str: string, attributes: NSDictionary<any, any>): NSAttributedString;

declare function CFAttributedStringCreateCopy(alloc: any, aStr: NSAttributedString): NSAttributedString;

declare function CFAttributedStringCreateMutable(alloc: any, maxLength: number): NSAttributedString;

declare function CFAttributedStringCreateMutableCopy(alloc: any, maxLength: number, aStr: NSAttributedString): NSAttributedString;

declare function CFAttributedStringCreateWithSubstring(alloc: any, aStr: NSAttributedString, range: CFRange): NSAttributedString;

declare function CFAttributedStringEndEditing(aStr: NSAttributedString): void;

declare function CFAttributedStringGetAttribute(aStr: NSAttributedString, loc: number, attrName: string, effectiveRange: interop.Reference<CFRange>): any;

declare function CFAttributedStringGetAttributeAndLongestEffectiveRange(aStr: NSAttributedString, loc: number, attrName: string, inRange: CFRange, longestEffectiveRange: interop.Reference<CFRange>): any;

declare function CFAttributedStringGetAttributes(aStr: NSAttributedString, loc: number, effectiveRange: interop.Reference<CFRange>): NSDictionary<any, any>;

declare function CFAttributedStringGetAttributesAndLongestEffectiveRange(aStr: NSAttributedString, loc: number, inRange: CFRange, longestEffectiveRange: interop.Reference<CFRange>): NSDictionary<any, any>;

declare function CFAttributedStringGetLength(aStr: NSAttributedString): number;

declare function CFAttributedStringGetMutableString(aStr: NSAttributedString): string;

declare function CFAttributedStringGetString(aStr: NSAttributedString): string;

declare function CFAttributedStringGetTypeID(): number;

declare function CFAttributedStringRemoveAttribute(aStr: NSAttributedString, range: CFRange, attrName: string): void;

declare function CFAttributedStringReplaceAttributedString(aStr: NSAttributedString, range: CFRange, replacement: NSAttributedString): void;

declare function CFAttributedStringReplaceString(aStr: NSAttributedString, range: CFRange, replacement: string): void;

declare function CFAttributedStringSetAttribute(aStr: NSAttributedString, range: CFRange, attrName: string, value: any): void;

declare function CFAttributedStringSetAttributes(aStr: NSAttributedString, range: CFRange, replacement: NSDictionary<any, any>, clearOtherAttributes: boolean): void;

declare function CFAutorelease(arg: any): any;

declare function CFBagAddValue(theBag: any, value: interop.Pointer): void;

declare function CFBagApplyFunction(theBag: any, applier: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, context: interop.Pointer): void;

interface CFBagCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer) => number>;
}
declare var CFBagCallBacks: interop.StructType<CFBagCallBacks>;

declare function CFBagContainsValue(theBag: any, value: interop.Pointer): boolean;

declare function CFBagCreate(allocator: any, values: interop.Reference<interop.Pointer>, numValues: number, callBacks: interop.Reference<CFBagCallBacks>): any;

declare function CFBagCreateCopy(allocator: any, theBag: any): any;

declare function CFBagCreateMutable(allocator: any, capacity: number, callBacks: interop.Reference<CFBagCallBacks>): any;

declare function CFBagCreateMutableCopy(allocator: any, capacity: number, theBag: any): any;

declare function CFBagGetCount(theBag: any): number;

declare function CFBagGetCountOfValue(theBag: any, value: interop.Pointer): number;

declare function CFBagGetTypeID(): number;

declare function CFBagGetValue(theBag: any, value: interop.Pointer): interop.Pointer;

declare function CFBagGetValueIfPresent(theBag: any, candidate: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CFBagGetValues(theBag: any, values: interop.Reference<interop.Pointer>): void;

declare function CFBagRemoveAllValues(theBag: any): void;

declare function CFBagRemoveValue(theBag: any, value: interop.Pointer): void;

declare function CFBagReplaceValue(theBag: any, value: interop.Pointer): void;

declare function CFBagSetValue(theBag: any, value: interop.Pointer): void;

declare function CFBinaryHeapAddValue(heap: any, value: interop.Pointer): void;

declare function CFBinaryHeapApplyFunction(heap: any, applier: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, context: interop.Pointer): void;

interface CFBinaryHeapCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	compare: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => CFComparisonResult>;
}
declare var CFBinaryHeapCallBacks: interop.StructType<CFBinaryHeapCallBacks>;

interface CFBinaryHeapCompareContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFBinaryHeapCompareContext: interop.StructType<CFBinaryHeapCompareContext>;

declare function CFBinaryHeapContainsValue(heap: any, value: interop.Pointer): boolean;

declare function CFBinaryHeapCreate(allocator: any, capacity: number, callBacks: interop.Reference<CFBinaryHeapCallBacks>, compareContext: interop.Reference<CFBinaryHeapCompareContext>): any;

declare function CFBinaryHeapCreateCopy(allocator: any, capacity: number, heap: any): any;

declare function CFBinaryHeapGetCount(heap: any): number;

declare function CFBinaryHeapGetCountOfValue(heap: any, value: interop.Pointer): number;

declare function CFBinaryHeapGetMinimum(heap: any): interop.Pointer;

declare function CFBinaryHeapGetMinimumIfPresent(heap: any, value: interop.Reference<interop.Pointer>): boolean;

declare function CFBinaryHeapGetTypeID(): number;

declare function CFBinaryHeapGetValues(heap: any, values: interop.Reference<interop.Pointer>): void;

declare function CFBinaryHeapRemoveAllValues(heap: any): void;

declare function CFBinaryHeapRemoveMinimumValue(heap: any): void;

declare function CFBitVectorContainsBit(bv: any, range: CFRange, value: number): boolean;

declare function CFBitVectorCreate(allocator: any, bytes: string, numBits: number): any;

declare function CFBitVectorCreateCopy(allocator: any, bv: any): any;

declare function CFBitVectorCreateMutable(allocator: any, capacity: number): any;

declare function CFBitVectorCreateMutableCopy(allocator: any, capacity: number, bv: any): any;

declare function CFBitVectorFlipBitAtIndex(bv: any, idx: number): void;

declare function CFBitVectorFlipBits(bv: any, range: CFRange): void;

declare function CFBitVectorGetBitAtIndex(bv: any, idx: number): number;

declare function CFBitVectorGetBits(bv: any, range: CFRange, bytes: string): void;

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

declare function CFBundleCloseBundleResourceMap(bundle: any, refNum: number): void;

declare function CFBundleCopyAuxiliaryExecutableURL(bundle: any, executableName: string): NSURL;

declare function CFBundleCopyBuiltInPlugInsURL(bundle: any): NSURL;

declare function CFBundleCopyBundleLocalizations(bundle: any): NSArray<any>;

declare function CFBundleCopyBundleURL(bundle: any): NSURL;

declare function CFBundleCopyExecutableArchitectures(bundle: any): NSArray<any>;

declare function CFBundleCopyExecutableArchitecturesForURL(url: NSURL): NSArray<any>;

declare function CFBundleCopyExecutableURL(bundle: any): NSURL;

declare function CFBundleCopyInfoDictionaryForURL(url: NSURL): NSDictionary<any, any>;

declare function CFBundleCopyInfoDictionaryInDirectory(bundleURL: NSURL): NSDictionary<any, any>;

declare function CFBundleCopyLocalizationsForPreferences(locArray: NSArray<any>, prefArray: NSArray<any>): NSArray<any>;

declare function CFBundleCopyLocalizationsForURL(url: NSURL): NSArray<any>;

declare function CFBundleCopyLocalizedString(bundle: any, key: string, value: string, tableName: string): string;

declare function CFBundleCopyPreferredLocalizationsFromArray(locArray: NSArray<any>): NSArray<any>;

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

declare function CFBundleGetDataPointerForName(bundle: any, symbolName: string): interop.Pointer;

declare function CFBundleGetDataPointersForNames(bundle: any, symbolNames: NSArray<any>, stbl: interop.Reference<interop.Pointer>): void;

declare function CFBundleGetDevelopmentRegion(bundle: any): string;

declare function CFBundleGetFunctionPointerForName(bundle: any, functionName: string): interop.Pointer;

declare function CFBundleGetFunctionPointersForNames(bundle: any, functionNames: NSArray<any>, ftbl: interop.Reference<interop.Pointer>): void;

declare function CFBundleGetIdentifier(bundle: any): string;

declare function CFBundleGetInfoDictionary(bundle: any): NSDictionary<any, any>;

declare function CFBundleGetLocalInfoDictionary(bundle: any): NSDictionary<any, any>;

declare function CFBundleGetMainBundle(): any;

declare function CFBundleGetPackageInfo(bundle: any, packageType: interop.Reference<number>, packageCreator: interop.Reference<number>): void;

declare function CFBundleGetPackageInfoInDirectory(url: NSURL, packageType: interop.Reference<number>, packageCreator: interop.Reference<number>): boolean;

declare function CFBundleGetPlugIn(bundle: any): any;

declare function CFBundleGetTypeID(): number;

declare function CFBundleGetValueForInfoDictionaryKey(bundle: any, key: string): any;

declare function CFBundleGetVersionNumber(bundle: any): number;

declare function CFBundleIsExecutableLoaded(bundle: any): boolean;

declare function CFBundleLoadExecutable(bundle: any): boolean;

declare function CFBundleLoadExecutableAndReturnError(bundle: any, error: interop.Reference<NSError>): boolean;

declare function CFBundleOpenBundleResourceFiles(bundle: any, refNum: interop.Reference<number>, localizedRefNum: interop.Reference<number>): number;

declare function CFBundleOpenBundleResourceMap(bundle: any): number;

declare function CFBundlePreflightExecutable(bundle: any, error: interop.Reference<NSError>): boolean;

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

declare function CFCalendarGetTimeRangeOfUnit(calendar: NSCalendar, unit: CFCalendarUnit, at: number, startp: interop.Reference<number>, tip: interop.Reference<number>): boolean;

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

	kCFCalendarUnitYearForWeekOfYear = 16384
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

declare function CFCopyHomeDirectoryURL(): NSURL;

declare function CFCopyTypeIDDescription(type_id: number): string;

declare function CFDataAppendBytes(theData: NSData, bytes: string, length: number): void;

declare function CFDataCreate(allocator: any, bytes: string, length: number): NSData;

declare function CFDataCreateCopy(allocator: any, theData: NSData): NSData;

declare function CFDataCreateMutable(allocator: any, capacity: number): NSData;

declare function CFDataCreateMutableCopy(allocator: any, capacity: number, theData: NSData): NSData;

declare function CFDataCreateWithBytesNoCopy(allocator: any, bytes: string, length: number, bytesDeallocator: any): NSData;

declare function CFDataDeleteBytes(theData: NSData, range: CFRange): void;

declare function CFDataFind(theData: NSData, dataToFind: NSData, searchRange: CFRange, compareOptions: CFDataSearchFlags): CFRange;

declare function CFDataGetBytePtr(theData: NSData): string;

declare function CFDataGetBytes(theData: NSData, range: CFRange, buffer: string): void;

declare function CFDataGetLength(theData: NSData): number;

declare function CFDataGetMutableBytePtr(theData: NSData): string;

declare function CFDataGetTypeID(): number;

declare function CFDataIncreaseLength(theData: NSData, extraLength: number): void;

declare function CFDataReplaceBytes(theData: NSData, range: CFRange, newBytes: string, newLength: number): void;

declare const enum CFDataSearchFlags {

	kCFDataSearchBackwards = 1,

	kCFDataSearchAnchored = 2
}

declare function CFDataSetLength(theData: NSData, length: number): void;

declare function CFDateCompare(theDate: Date, otherDate: Date, context: interop.Pointer): CFComparisonResult;

declare function CFDateCreate(allocator: any, at: number): Date;

declare function CFDateFormatterCopyProperty(formatter: any, key: string): any;

declare function CFDateFormatterCreate(allocator: any, locale: NSLocale, dateStyle: CFDateFormatterStyle, timeStyle: CFDateFormatterStyle): any;

declare function CFDateFormatterCreateDateFormatFromTemplate(allocator: any, tmplate: string, options: number, locale: NSLocale): string;

declare function CFDateFormatterCreateDateFromString(allocator: any, formatter: any, string: string, rangep: interop.Reference<CFRange>): Date;

declare function CFDateFormatterCreateStringWithAbsoluteTime(allocator: any, formatter: any, at: number): string;

declare function CFDateFormatterCreateStringWithDate(allocator: any, formatter: any, date: Date): string;

declare function CFDateFormatterGetAbsoluteTimeFromString(formatter: any, string: string, rangep: interop.Reference<CFRange>, atp: interop.Reference<number>): boolean;

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

declare function CFDictionaryAddValue(theDict: NSDictionary<any, any>, key: interop.Pointer, value: interop.Pointer): void;

declare function CFDictionaryApplyFunction(theDict: NSDictionary<any, any>, applier: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => void>, context: interop.Pointer): void;

declare function CFDictionaryContainsKey(theDict: NSDictionary<any, any>, key: interop.Pointer): boolean;

declare function CFDictionaryContainsValue(theDict: NSDictionary<any, any>, value: interop.Pointer): boolean;

declare function CFDictionaryCreate(allocator: any, keys: interop.Reference<interop.Pointer>, values: interop.Reference<interop.Pointer>, numValues: number, keyCallBacks: interop.Reference<CFDictionaryKeyCallBacks>, valueCallBacks: interop.Reference<CFDictionaryValueCallBacks>): NSDictionary<any, any>;

declare function CFDictionaryCreateCopy(allocator: any, theDict: NSDictionary<any, any>): NSDictionary<any, any>;

declare function CFDictionaryCreateMutable(allocator: any, capacity: number, keyCallBacks: interop.Reference<CFDictionaryKeyCallBacks>, valueCallBacks: interop.Reference<CFDictionaryValueCallBacks>): NSDictionary<any, any>;

declare function CFDictionaryCreateMutableCopy(allocator: any, capacity: number, theDict: NSDictionary<any, any>): NSDictionary<any, any>;

declare function CFDictionaryGetCount(theDict: NSDictionary<any, any>): number;

declare function CFDictionaryGetCountOfKey(theDict: NSDictionary<any, any>, key: interop.Pointer): number;

declare function CFDictionaryGetCountOfValue(theDict: NSDictionary<any, any>, value: interop.Pointer): number;

declare function CFDictionaryGetKeysAndValues(theDict: NSDictionary<any, any>, keys: interop.Reference<interop.Pointer>, values: interop.Reference<interop.Pointer>): void;

declare function CFDictionaryGetTypeID(): number;

declare function CFDictionaryGetValue(theDict: NSDictionary<any, any>, key: interop.Pointer): interop.Pointer;

declare function CFDictionaryGetValueIfPresent(theDict: NSDictionary<any, any>, key: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

interface CFDictionaryKeyCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer) => number>;
}
declare var CFDictionaryKeyCallBacks: interop.StructType<CFDictionaryKeyCallBacks>;

declare function CFDictionaryRemoveAllValues(theDict: NSDictionary<any, any>): void;

declare function CFDictionaryRemoveValue(theDict: NSDictionary<any, any>, key: interop.Pointer): void;

declare function CFDictionaryReplaceValue(theDict: NSDictionary<any, any>, key: interop.Pointer, value: interop.Pointer): void;

declare function CFDictionarySetValue(theDict: NSDictionary<any, any>, key: interop.Pointer, value: interop.Pointer): void;

interface CFDictionaryValueCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
}
declare var CFDictionaryValueCallBacks: interop.StructType<CFDictionaryValueCallBacks>;

declare function CFEqual(cf1: any, cf2: any): boolean;

declare function CFErrorCopyDescription(err: NSError): string;

declare function CFErrorCopyFailureReason(err: NSError): string;

declare function CFErrorCopyRecoverySuggestion(err: NSError): string;

declare function CFErrorCopyUserInfo(err: NSError): NSDictionary<any, any>;

declare function CFErrorCreate(allocator: any, domain: string, code: number, userInfo: NSDictionary<any, any>): NSError;

declare function CFErrorCreateWithUserInfoKeysAndValues(allocator: any, domain: string, code: number, userInfoKeys: interop.Reference<interop.Pointer>, userInfoValues: interop.Reference<interop.Pointer>, numUserInfoValues: number): NSError;

declare function CFErrorGetCode(err: NSError): number;

declare function CFErrorGetDomain(err: NSError): string;

declare function CFErrorGetTypeID(): number;

interface CFFileDescriptorContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFFileDescriptorContext: interop.StructType<CFFileDescriptorContext>;

declare function CFFileDescriptorCreate(allocator: any, fd: number, closeOnInvalidate: boolean, callout: interop.FunctionReference<(p1: any, p2: number, p3: interop.Pointer) => void>, context: interop.Reference<CFFileDescriptorContext>): any;

declare function CFFileDescriptorCreateRunLoopSource(allocator: any, f: any, order: number): any;

declare function CFFileDescriptorDisableCallBacks(f: any, callBackTypes: number): void;

declare function CFFileDescriptorEnableCallBacks(f: any, callBackTypes: number): void;

declare function CFFileDescriptorGetContext(f: any, context: interop.Reference<CFFileDescriptorContext>): void;

declare function CFFileDescriptorGetNativeDescriptor(f: any): number;

declare function CFFileDescriptorGetTypeID(): number;

declare function CFFileDescriptorInvalidate(f: any): void;

declare function CFFileDescriptorIsValid(f: any): boolean;

declare const enum CFFileSecurityClearOptions {

	kCFFileSecurityClearOwner = 1,

	kCFFileSecurityClearGroup = 2,

	kCFFileSecurityClearMode = 4,

	kCFFileSecurityClearOwnerUUID = 8,

	kCFFileSecurityClearGroupUUID = 16,

	kCFFileSecurityClearAccessControlList = 32
}

declare function CFFileSecurityClearProperties(fileSec: NSFileSecurity, clearPropertyMask: CFFileSecurityClearOptions): boolean;

declare function CFFileSecurityCopyAccessControlList(fileSec: NSFileSecurity, accessControlList: interop.Reference<interop.Pointer>): boolean;

declare function CFFileSecurityCopyGroupUUID(fileSec: NSFileSecurity, groupUUID: interop.Reference<any>): boolean;

declare function CFFileSecurityCopyOwnerUUID(fileSec: NSFileSecurity, ownerUUID: interop.Reference<any>): boolean;

declare function CFFileSecurityCreate(allocator: any): NSFileSecurity;

declare function CFFileSecurityCreateCopy(allocator: any, fileSec: NSFileSecurity): NSFileSecurity;

declare function CFFileSecurityGetGroup(fileSec: NSFileSecurity, group: interop.Reference<number>): boolean;

declare function CFFileSecurityGetMode(fileSec: NSFileSecurity, mode: interop.Reference<number>): boolean;

declare function CFFileSecurityGetOwner(fileSec: NSFileSecurity, owner: interop.Reference<number>): boolean;

declare function CFFileSecurityGetTypeID(): number;

declare function CFFileSecuritySetAccessControlList(fileSec: NSFileSecurity, accessControlList: interop.Pointer): boolean;

declare function CFFileSecuritySetGroup(fileSec: NSFileSecurity, group: number): boolean;

declare function CFFileSecuritySetGroupUUID(fileSec: NSFileSecurity, groupUUID: any): boolean;

declare function CFFileSecuritySetMode(fileSec: NSFileSecurity, mode: number): boolean;

declare function CFFileSecuritySetOwner(fileSec: NSFileSecurity, owner: number): boolean;

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

declare function CFGregorianDateGetAbsoluteTime(gdate: CFGregorianDate, tz: NSTimeZone): number;

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

declare function CFLocaleCopyAvailableLocaleIdentifiers(): NSArray<any>;

declare function CFLocaleCopyCommonISOCurrencyCodes(): NSArray<any>;

declare function CFLocaleCopyCurrent(): NSLocale;

declare function CFLocaleCopyDisplayNameForPropertyValue(displayLocale: NSLocale, key: string, value: string): string;

declare function CFLocaleCopyISOCountryCodes(): NSArray<any>;

declare function CFLocaleCopyISOCurrencyCodes(): NSArray<any>;

declare function CFLocaleCopyISOLanguageCodes(): NSArray<any>;

declare function CFLocaleCopyPreferredLanguages(): NSArray<any>;

declare function CFLocaleCreate(allocator: any, localeIdentifier: string): NSLocale;

declare function CFLocaleCreateCanonicalLanguageIdentifierFromString(allocator: any, localeIdentifier: string): string;

declare function CFLocaleCreateCanonicalLocaleIdentifierFromScriptManagerCodes(allocator: any, lcode: number, rcode: number): string;

declare function CFLocaleCreateCanonicalLocaleIdentifierFromString(allocator: any, localeIdentifier: string): string;

declare function CFLocaleCreateComponentsFromLocaleIdentifier(allocator: any, localeID: string): NSDictionary<any, any>;

declare function CFLocaleCreateCopy(allocator: any, locale: NSLocale): NSLocale;

declare function CFLocaleCreateLocaleIdentifierFromComponents(allocator: any, dictionary: NSDictionary<any, any>): string;

declare function CFLocaleCreateLocaleIdentifierFromWindowsLocaleCode(allocator: any, lcid: number): string;

declare function CFLocaleGetIdentifier(locale: NSLocale): string;

declare function CFLocaleGetLanguageCharacterDirection(isoLangCode: string): CFLocaleLanguageDirection;

declare function CFLocaleGetLanguageLineDirection(isoLangCode: string): CFLocaleLanguageDirection;

declare function CFLocaleGetSystem(): NSLocale;

declare function CFLocaleGetTypeID(): number;

declare function CFLocaleGetValue(locale: NSLocale, key: string): any;

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
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFMachPortContext: interop.StructType<CFMachPortContext>;

declare function CFMachPortCreate(allocator: any, callout: interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer, p3: number, p4: interop.Pointer) => void>, context: interop.Reference<CFMachPortContext>, shouldFreeInfo: string): NSMachPort;

declare function CFMachPortCreateRunLoopSource(allocator: any, port: NSMachPort, order: number): any;

declare function CFMachPortCreateWithPort(allocator: any, portNum: number, callout: interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer, p3: number, p4: interop.Pointer) => void>, context: interop.Reference<CFMachPortContext>, shouldFreeInfo: string): NSMachPort;

declare function CFMachPortGetContext(port: NSMachPort, context: interop.Reference<CFMachPortContext>): void;

declare function CFMachPortGetInvalidationCallBack(port: NSMachPort): interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer) => void>;

declare function CFMachPortGetPort(port: NSMachPort): number;

declare function CFMachPortGetTypeID(): number;

declare function CFMachPortInvalidate(port: NSMachPort): void;

declare function CFMachPortIsValid(port: NSMachPort): boolean;

declare function CFMachPortSetInvalidationCallBack(port: NSMachPort, callout: interop.FunctionReference<(p1: NSMachPort, p2: interop.Pointer) => void>): void;

declare function CFMakeCollectable(cf: any): interop.Unmanaged<any>;

interface CFMessagePortContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFMessagePortContext: interop.StructType<CFMessagePortContext>;

declare function CFMessagePortCreateLocal(allocator: any, name: string, callout: interop.FunctionReference<(p1: NSMessagePort, p2: number, p3: NSData, p4: interop.Pointer) => NSData>, context: interop.Reference<CFMessagePortContext>, shouldFreeInfo: string): NSMessagePort;

declare function CFMessagePortCreateRemote(allocator: any, name: string): NSMessagePort;

declare function CFMessagePortCreateRunLoopSource(allocator: any, local: NSMessagePort, order: number): any;

declare function CFMessagePortGetContext(ms: NSMessagePort, context: interop.Reference<CFMessagePortContext>): void;

declare function CFMessagePortGetInvalidationCallBack(ms: NSMessagePort): interop.FunctionReference<(p1: NSMessagePort, p2: interop.Pointer) => void>;

declare function CFMessagePortGetName(ms: NSMessagePort): string;

declare function CFMessagePortGetTypeID(): number;

declare function CFMessagePortInvalidate(ms: NSMessagePort): void;

declare function CFMessagePortIsRemote(ms: NSMessagePort): boolean;

declare function CFMessagePortIsValid(ms: NSMessagePort): boolean;

declare function CFMessagePortSendRequest(remote: NSMessagePort, msgid: number, data: NSData, sendTimeout: number, rcvTimeout: number, replyMode: string, returnData: interop.Reference<NSData>): number;

declare function CFMessagePortSetDispatchQueue(ms: NSMessagePort, queue: NSObject): void;

declare function CFMessagePortSetInvalidationCallBack(ms: NSMessagePort, callout: interop.FunctionReference<(p1: NSMessagePort, p2: interop.Pointer) => void>): void;

declare function CFMessagePortSetName(ms: NSMessagePort, newName: string): boolean;

declare function CFNotificationCenterAddObserver(center: any, observer: interop.Pointer, callBack: interop.FunctionReference<(p1: any, p2: interop.Pointer, p3: string, p4: interop.Pointer, p5: NSDictionary<any, any>) => void>, name: string, object: interop.Pointer, suspensionBehavior: CFNotificationSuspensionBehavior): void;

declare function CFNotificationCenterGetDarwinNotifyCenter(): any;

declare function CFNotificationCenterGetLocalCenter(): any;

declare function CFNotificationCenterGetTypeID(): number;

declare function CFNotificationCenterPostNotification(center: any, name: string, object: interop.Pointer, userInfo: NSDictionary<any, any>, deliverImmediately: boolean): void;

declare function CFNotificationCenterPostNotificationWithOptions(center: any, name: string, object: interop.Pointer, userInfo: NSDictionary<any, any>, options: number): void;

declare function CFNotificationCenterRemoveEveryObserver(center: any, observer: interop.Pointer): void;

declare function CFNotificationCenterRemoveObserver(center: any, observer: interop.Pointer, name: string, object: interop.Pointer): void;

declare const enum CFNotificationSuspensionBehavior {

	Drop = 1,

	Coalesce = 2,

	Hold = 3,

	DeliverImmediately = 4
}

declare function CFNullGetTypeID(): number;

declare function CFNumberCompare(number: number, otherNumber: number, context: interop.Pointer): CFComparisonResult;

declare function CFNumberCreate(allocator: any, theType: CFNumberType, valuePtr: interop.Pointer): number;

declare function CFNumberFormatterCopyProperty(formatter: any, key: string): any;

declare function CFNumberFormatterCreate(allocator: any, locale: NSLocale, style: CFNumberFormatterStyle): any;

declare function CFNumberFormatterCreateNumberFromString(allocator: any, formatter: any, string: string, rangep: interop.Reference<CFRange>, options: number): number;

declare function CFNumberFormatterCreateStringWithNumber(allocator: any, formatter: any, number: number): string;

declare function CFNumberFormatterCreateStringWithValue(allocator: any, formatter: any, numberType: CFNumberType, valuePtr: interop.Pointer): string;

declare function CFNumberFormatterGetDecimalInfoForCurrencyCode(currencyCode: string, defaultFractionDigits: interop.Reference<number>, roundingIncrement: interop.Reference<number>): boolean;

declare function CFNumberFormatterGetFormat(formatter: any): string;

declare function CFNumberFormatterGetLocale(formatter: any): NSLocale;

declare function CFNumberFormatterGetStyle(formatter: any): CFNumberFormatterStyle;

declare function CFNumberFormatterGetTypeID(): number;

declare function CFNumberFormatterGetValueFromString(formatter: any, string: string, rangep: interop.Reference<CFRange>, numberType: CFNumberType, valuePtr: interop.Pointer): boolean;

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

declare function CFNumberGetValue(number: number, theType: CFNumberType, valuePtr: interop.Pointer): boolean;

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

declare function CFPlugInInstanceCreate(allocator: any, factoryUUID: any, typeUUID: any): interop.Pointer;

declare function CFPlugInInstanceCreateWithInstanceDataSize(allocator: any, instanceDataSize: number, deallocateInstanceFunction: interop.FunctionReference<(p1: interop.Pointer) => void>, factoryName: string, getInterfaceFunction: interop.FunctionReference<(p1: any, p2: string, p3: interop.Reference<interop.Pointer>) => boolean>): any;

declare function CFPlugInInstanceGetFactoryName(instance: any): string;

declare function CFPlugInInstanceGetInstanceData(instance: any): interop.Pointer;

declare function CFPlugInInstanceGetInterfaceFunctionTable(instance: any, interfaceName: string, ftbl: interop.Reference<interop.Pointer>): boolean;

declare function CFPlugInInstanceGetTypeID(): number;

declare function CFPlugInIsLoadOnDemand(plugIn: any): boolean;

declare function CFPlugInRegisterFactoryFunction(factoryUUID: any, func: interop.FunctionReference<(p1: any, p2: any) => interop.Pointer>): boolean;

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

declare function CFPreferencesCopyApplicationList(userName: string, hostName: string): NSArray<any>;

declare function CFPreferencesCopyKeyList(applicationID: string, userName: string, hostName: string): NSArray<any>;

declare function CFPreferencesCopyMultiple(keysToFetch: NSArray<any>, applicationID: string, userName: string, hostName: string): NSDictionary<any, any>;

declare function CFPreferencesCopyValue(key: string, applicationID: string, userName: string, hostName: string): any;

declare function CFPreferencesGetAppBooleanValue(key: string, applicationID: string, keyExistsAndHasValidFormat: string): boolean;

declare function CFPreferencesGetAppIntegerValue(key: string, applicationID: string, keyExistsAndHasValidFormat: string): number;

declare function CFPreferencesRemoveSuitePreferencesFromApp(applicationID: string, suiteID: string): void;

declare function CFPreferencesSetAppValue(key: string, value: any, applicationID: string): void;

declare function CFPreferencesSetMultiple(keysToSet: NSDictionary<any, any>, keysToRemove: NSArray<any>, applicationID: string, userName: string, hostName: string): void;

declare function CFPreferencesSetValue(key: string, value: any, applicationID: string, userName: string, hostName: string): void;

declare function CFPreferencesSynchronize(applicationID: string, userName: string, hostName: string): boolean;

declare function CFPropertyListCreateData(allocator: any, propertyList: any, format: CFPropertyListFormat, options: number, error: interop.Reference<NSError>): interop.Unmanaged<NSData>;

declare function CFPropertyListCreateDeepCopy(allocator: any, propertyList: any, mutabilityOption: number): any;

declare function CFPropertyListCreateFromStream(allocator: any, stream: NSInputStream, streamLength: number, mutabilityOption: number, format: interop.Reference<CFPropertyListFormat>, errorString: interop.Reference<string>): interop.Unmanaged<any>;

declare function CFPropertyListCreateFromXMLData(allocator: any, xmlData: NSData, mutabilityOption: number, errorString: interop.Reference<string>): interop.Unmanaged<any>;

declare function CFPropertyListCreateWithData(allocator: any, data: NSData, options: number, format: interop.Reference<CFPropertyListFormat>, error: interop.Reference<NSError>): interop.Unmanaged<any>;

declare function CFPropertyListCreateWithStream(allocator: any, stream: NSInputStream, streamLength: number, options: number, format: interop.Reference<CFPropertyListFormat>, error: interop.Reference<NSError>): interop.Unmanaged<any>;

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

declare function CFPropertyListWrite(propertyList: any, stream: NSOutputStream, format: CFPropertyListFormat, options: number, error: interop.Reference<NSError>): number;

declare function CFPropertyListWriteToStream(propertyList: any, stream: NSOutputStream, format: CFPropertyListFormat, errorString: interop.Reference<string>): number;

interface CFRange {
	location: number;
	length: number;
}
declare var CFRange: interop.StructType<CFRange>;

declare function CFReadStreamClose(stream: NSInputStream): void;

declare function CFReadStreamCopyDispatchQueue(stream: NSInputStream): NSObject;

declare function CFReadStreamCopyError(stream: NSInputStream): NSError;

declare function CFReadStreamCopyProperty(stream: NSInputStream, propertyName: string): any;

declare function CFReadStreamCreateWithBytesNoCopy(alloc: any, bytes: string, length: number, bytesDeallocator: any): NSInputStream;

declare function CFReadStreamCreateWithFile(alloc: any, fileURL: NSURL): NSInputStream;

declare function CFReadStreamGetBuffer(stream: NSInputStream, maxBytesToRead: number, numBytesRead: interop.Reference<number>): string;

declare function CFReadStreamGetError(stream: NSInputStream): CFStreamError;

declare function CFReadStreamGetStatus(stream: NSInputStream): CFStreamStatus;

declare function CFReadStreamGetTypeID(): number;

declare function CFReadStreamHasBytesAvailable(stream: NSInputStream): boolean;

declare function CFReadStreamOpen(stream: NSInputStream): boolean;

declare function CFReadStreamRead(stream: NSInputStream, buffer: string, bufferLength: number): number;

declare function CFReadStreamScheduleWithRunLoop(stream: NSInputStream, runLoop: any, runLoopMode: string): void;

declare function CFReadStreamSetClient(stream: NSInputStream, streamEvents: number, clientCB: interop.FunctionReference<(p1: NSInputStream, p2: CFStreamEventType, p3: interop.Pointer) => void>, clientContext: interop.Reference<CFStreamClientContext>): boolean;

declare function CFReadStreamSetDispatchQueue(stream: NSInputStream, q: NSObject): void;

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
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFRunLoopObserverContext: interop.StructType<CFRunLoopObserverContext>;

declare function CFRunLoopObserverCreate(allocator: any, activities: number, repeats: boolean, order: number, callout: interop.FunctionReference<(p1: any, p2: CFRunLoopActivity, p3: interop.Pointer) => void>, context: interop.Reference<CFRunLoopObserverContext>): any;

declare function CFRunLoopObserverCreateWithHandler(allocator: any, activities: number, repeats: boolean, order: number, block: (p1: any, p2: CFRunLoopActivity) => void): any;

declare function CFRunLoopObserverDoesRepeat(observer: any): boolean;

declare function CFRunLoopObserverGetActivities(observer: any): number;

declare function CFRunLoopObserverGetContext(observer: any, context: interop.Reference<CFRunLoopObserverContext>): void;

declare function CFRunLoopObserverGetOrder(observer: any): number;

declare function CFRunLoopObserverGetTypeID(): number;

declare function CFRunLoopObserverInvalidate(observer: any): void;

declare function CFRunLoopObserverIsValid(observer: any): boolean;

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
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer) => number>;
	schedule: interop.FunctionReference<(p1: interop.Pointer, p2: any, p3: string) => void>;
	cancel: interop.FunctionReference<(p1: interop.Pointer, p2: any, p3: string) => void>;
	perform: interop.FunctionReference<(p1: interop.Pointer) => void>;
}
declare var CFRunLoopSourceContext: interop.StructType<CFRunLoopSourceContext>;

interface CFRunLoopSourceContext1 {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer) => number>;
	getPort: interop.FunctionReference<(p1: interop.Pointer) => number>;
	perform: interop.FunctionReference<(p1: interop.Pointer, p2: number, p3: any, p4: interop.Pointer) => interop.Pointer>;
}
declare var CFRunLoopSourceContext1: interop.StructType<CFRunLoopSourceContext1>;

declare function CFRunLoopSourceCreate(allocator: any, order: number, context: interop.Reference<CFRunLoopSourceContext>): any;

declare function CFRunLoopSourceGetContext(source: any, context: interop.Reference<CFRunLoopSourceContext>): void;

declare function CFRunLoopSourceGetOrder(source: any): number;

declare function CFRunLoopSourceGetTypeID(): number;

declare function CFRunLoopSourceInvalidate(source: any): void;

declare function CFRunLoopSourceIsValid(source: any): boolean;

declare function CFRunLoopSourceSignal(source: any): void;

declare function CFRunLoopStop(rl: any): void;

interface CFRunLoopTimerContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFRunLoopTimerContext: interop.StructType<CFRunLoopTimerContext>;

declare function CFRunLoopTimerCreate(allocator: any, fireDate: number, interval: number, flags: number, order: number, callout: interop.FunctionReference<(p1: NSTimer, p2: interop.Pointer) => void>, context: interop.Reference<CFRunLoopTimerContext>): NSTimer;

declare function CFRunLoopTimerCreateWithHandler(allocator: any, fireDate: number, interval: number, flags: number, order: number, block: (p1: NSTimer) => void): NSTimer;

declare function CFRunLoopTimerDoesRepeat(timer: NSTimer): boolean;

declare function CFRunLoopTimerGetContext(timer: NSTimer, context: interop.Reference<CFRunLoopTimerContext>): void;

declare function CFRunLoopTimerGetInterval(timer: NSTimer): number;

declare function CFRunLoopTimerGetNextFireDate(timer: NSTimer): number;

declare function CFRunLoopTimerGetOrder(timer: NSTimer): number;

declare function CFRunLoopTimerGetTolerance(timer: NSTimer): number;

declare function CFRunLoopTimerGetTypeID(): number;

declare function CFRunLoopTimerInvalidate(timer: NSTimer): void;

declare function CFRunLoopTimerIsValid(timer: NSTimer): boolean;

declare function CFRunLoopTimerSetNextFireDate(timer: NSTimer, fireDate: number): void;

declare function CFRunLoopTimerSetTolerance(timer: NSTimer, tolerance: number): void;

declare function CFRunLoopWakeUp(rl: any): void;

declare function CFSetAddValue(theSet: NSSet<any>, value: interop.Pointer): void;

declare function CFSetApplyFunction(theSet: NSSet<any>, applier: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, context: interop.Pointer): void;

interface CFSetCallBacks {
	version: number;
	retain: interop.FunctionReference<(p1: any, p2: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: any, p2: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
	equal: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => boolean>;
	hash: interop.FunctionReference<(p1: interop.Pointer) => number>;
}
declare var CFSetCallBacks: interop.StructType<CFSetCallBacks>;

declare function CFSetContainsValue(theSet: NSSet<any>, value: interop.Pointer): boolean;

declare function CFSetCreate(allocator: any, values: interop.Reference<interop.Pointer>, numValues: number, callBacks: interop.Reference<CFSetCallBacks>): NSSet<any>;

declare function CFSetCreateCopy(allocator: any, theSet: NSSet<any>): NSSet<any>;

declare function CFSetCreateMutable(allocator: any, capacity: number, callBacks: interop.Reference<CFSetCallBacks>): NSSet<any>;

declare function CFSetCreateMutableCopy(allocator: any, capacity: number, theSet: NSSet<any>): NSSet<any>;

declare function CFSetGetCount(theSet: NSSet<any>): number;

declare function CFSetGetCountOfValue(theSet: NSSet<any>, value: interop.Pointer): number;

declare function CFSetGetTypeID(): number;

declare function CFSetGetValue(theSet: NSSet<any>, value: interop.Pointer): interop.Pointer;

declare function CFSetGetValueIfPresent(theSet: NSSet<any>, candidate: interop.Pointer, value: interop.Reference<interop.Pointer>): boolean;

declare function CFSetGetValues(theSet: NSSet<any>, values: interop.Reference<interop.Pointer>): void;

declare function CFSetRemoveAllValues(theSet: NSSet<any>): void;

declare function CFSetRemoveValue(theSet: NSSet<any>, value: interop.Pointer): void;

declare function CFSetReplaceValue(theSet: NSSet<any>, value: interop.Pointer): void;

declare function CFSetSetValue(theSet: NSSet<any>, value: interop.Pointer): void;

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
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFSocketContext: interop.StructType<CFSocketContext>;

declare function CFSocketCopyAddress(s: any): NSData;

declare function CFSocketCopyPeerAddress(s: any): NSData;

declare function CFSocketCopyRegisteredSocketSignature(nameServerSignature: interop.Reference<CFSocketSignature>, timeout: number, name: string, signature: interop.Reference<CFSocketSignature>, nameServerAddress: interop.Reference<NSData>): CFSocketError;

declare function CFSocketCopyRegisteredValue(nameServerSignature: interop.Reference<CFSocketSignature>, timeout: number, name: string, value: interop.Reference<any>, nameServerAddress: interop.Reference<NSData>): CFSocketError;

declare function CFSocketCreate(allocator: any, protocolFamily: number, socketType: number, protocol: number, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer, p5: interop.Pointer) => void>, context: interop.Reference<CFSocketContext>): any;

declare function CFSocketCreateConnectedToSocketSignature(allocator: any, signature: interop.Reference<CFSocketSignature>, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer, p5: interop.Pointer) => void>, context: interop.Reference<CFSocketContext>, timeout: number): any;

declare function CFSocketCreateRunLoopSource(allocator: any, s: any, order: number): any;

declare function CFSocketCreateWithNative(allocator: any, sock: number, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer, p5: interop.Pointer) => void>, context: interop.Reference<CFSocketContext>): any;

declare function CFSocketCreateWithSocketSignature(allocator: any, signature: interop.Reference<CFSocketSignature>, callBackTypes: number, callout: interop.FunctionReference<(p1: any, p2: CFSocketCallBackType, p3: NSData, p4: interop.Pointer, p5: interop.Pointer) => void>, context: interop.Reference<CFSocketContext>): any;

declare function CFSocketDisableCallBacks(s: any, callBackTypes: number): void;

declare function CFSocketEnableCallBacks(s: any, callBackTypes: number): void;

declare const enum CFSocketError {

	kCFSocketSuccess = 0,

	kCFSocketError = -1,

	kCFSocketTimeout = -2
}

declare function CFSocketGetContext(s: any, context: interop.Reference<CFSocketContext>): void;

declare function CFSocketGetDefaultNameRegistryPortNumber(): number;

declare function CFSocketGetNative(s: any): number;

declare function CFSocketGetSocketFlags(s: any): number;

declare function CFSocketGetTypeID(): number;

declare function CFSocketInvalidate(s: any): void;

declare function CFSocketIsValid(s: any): boolean;

declare function CFSocketRegisterSocketSignature(nameServerSignature: interop.Reference<CFSocketSignature>, timeout: number, name: string, signature: interop.Reference<CFSocketSignature>): CFSocketError;

declare function CFSocketRegisterValue(nameServerSignature: interop.Reference<CFSocketSignature>, timeout: number, name: string, value: any): CFSocketError;

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

declare function CFSocketUnregister(nameServerSignature: interop.Reference<CFSocketSignature>, timeout: number, name: string): CFSocketError;

interface CFStreamClientContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFStreamClientContext: interop.StructType<CFStreamClientContext>;

declare function CFStreamCreateBoundPair(alloc: any, readStream: interop.Reference<NSInputStream>, writeStream: interop.Reference<NSOutputStream>, transferBufferSize: number): void;

declare function CFStreamCreatePairWithPeerSocketSignature(alloc: any, signature: interop.Reference<CFSocketSignature>, readStream: interop.Reference<NSInputStream>, writeStream: interop.Reference<NSOutputStream>): void;

declare function CFStreamCreatePairWithSocket(alloc: any, sock: number, readStream: interop.Reference<NSInputStream>, writeStream: interop.Reference<NSOutputStream>): void;

declare function CFStreamCreatePairWithSocketToHost(alloc: any, host: string, port: number, readStream: interop.Reference<NSInputStream>, writeStream: interop.Reference<NSOutputStream>): void;

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

declare function CFStringAppendCString(theString: string, cStr: string, encoding: number): void;

declare function CFStringAppendCharacters(theString: string, chars: interop.Reference<number>, numChars: number): void;

declare function CFStringAppendPascalString(theString: string, pStr: string, encoding: number): void;

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

declare function CFStringCompareWithOptionsAndLocale(theString1: string, theString2: string, rangeToCompare: CFRange, compareOptions: CFStringCompareFlags, locale: NSLocale): CFComparisonResult;

declare function CFStringConvertEncodingToIANACharSetName(encoding: number): string;

declare function CFStringConvertEncodingToNSStringEncoding(encoding: number): number;

declare function CFStringConvertEncodingToWindowsCodepage(encoding: number): number;

declare function CFStringConvertIANACharSetNameToEncoding(theString: string): number;

declare function CFStringConvertNSStringEncodingToEncoding(encoding: number): number;

declare function CFStringConvertWindowsCodepageToEncoding(codepage: number): number;

declare function CFStringCreateArrayBySeparatingStrings(alloc: any, theString: string, separatorString: string): NSArray<any>;

declare function CFStringCreateArrayWithFindResults(alloc: any, theString: string, stringToFind: string, rangeToSearch: CFRange, compareOptions: CFStringCompareFlags): NSArray<any>;

declare function CFStringCreateByCombiningStrings(alloc: any, theArray: NSArray<any>, separatorString: string): string;

declare function CFStringCreateCopy(alloc: any, theString: string): string;

declare function CFStringCreateExternalRepresentation(alloc: any, theString: string, encoding: number, lossByte: number): NSData;

declare function CFStringCreateFromExternalRepresentation(alloc: any, data: NSData, encoding: number): string;

declare function CFStringCreateMutable(alloc: any, maxLength: number): string;

declare function CFStringCreateMutableCopy(alloc: any, maxLength: number, theString: string): string;

declare function CFStringCreateMutableWithExternalCharactersNoCopy(alloc: any, chars: interop.Reference<number>, numChars: number, capacity: number, externalCharactersAllocator: any): string;

declare function CFStringCreateWithBytes(alloc: any, bytes: string, numBytes: number, encoding: number, isExternalRepresentation: boolean): string;

declare function CFStringCreateWithBytesNoCopy(alloc: any, bytes: string, numBytes: number, encoding: number, isExternalRepresentation: boolean, contentsDeallocator: any): string;

declare function CFStringCreateWithCString(alloc: any, cStr: string, encoding: number): string;

declare function CFStringCreateWithCStringNoCopy(alloc: any, cStr: string, encoding: number, contentsDeallocator: any): string;

declare function CFStringCreateWithCharacters(alloc: any, chars: interop.Reference<number>, numChars: number): string;

declare function CFStringCreateWithCharactersNoCopy(alloc: any, chars: interop.Reference<number>, numChars: number, contentsDeallocator: any): string;

declare function CFStringCreateWithFileSystemRepresentation(alloc: any, buffer: string): string;

declare function CFStringCreateWithPascalString(alloc: any, pStr: string, encoding: number): string;

declare function CFStringCreateWithPascalStringNoCopy(alloc: any, pStr: string, encoding: number, contentsDeallocator: any): string;

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

declare function CFStringFindCharacterFromSet(theString: string, theSet: NSCharacterSet, rangeToSearch: CFRange, searchOptions: CFStringCompareFlags, result: interop.Reference<CFRange>): boolean;

declare function CFStringFindWithOptions(theString: string, stringToFind: string, rangeToSearch: CFRange, searchOptions: CFStringCompareFlags, result: interop.Reference<CFRange>): boolean;

declare function CFStringFindWithOptionsAndLocale(theString: string, stringToFind: string, rangeToSearch: CFRange, searchOptions: CFStringCompareFlags, locale: NSLocale, result: interop.Reference<CFRange>): boolean;

declare function CFStringFold(theString: string, theFlags: CFStringCompareFlags, theLocale: NSLocale): void;

declare function CFStringGetBytes(theString: string, range: CFRange, encoding: number, lossByte: number, isExternalRepresentation: boolean, buffer: string, maxBufLen: number, usedBufLen: interop.Reference<number>): number;

declare function CFStringGetCString(theString: string, buffer: string, bufferSize: number, encoding: number): boolean;

declare function CFStringGetCStringPtr(theString: string, encoding: number): string;

declare function CFStringGetCharacterAtIndex(theString: string, idx: number): number;

declare function CFStringGetCharacters(theString: string, range: CFRange, buffer: interop.Reference<number>): void;

declare function CFStringGetCharactersPtr(theString: string): interop.Reference<number>;

declare function CFStringGetDoubleValue(str: string): number;

declare function CFStringGetFastestEncoding(theString: string): number;

declare function CFStringGetFileSystemRepresentation(string: string, buffer: string, maxBufLen: number): boolean;

declare function CFStringGetHyphenationLocationBeforeIndex(string: string, location: number, limitRange: CFRange, options: number, locale: NSLocale, character: interop.Reference<number>): number;

declare function CFStringGetIntValue(str: string): number;

declare function CFStringGetLength(theString: string): number;

declare function CFStringGetLineBounds(theString: string, range: CFRange, lineBeginIndex: interop.Reference<number>, lineEndIndex: interop.Reference<number>, contentsEndIndex: interop.Reference<number>): void;

declare function CFStringGetListOfAvailableEncodings(): interop.Reference<number>;

declare function CFStringGetMaximumSizeForEncoding(length: number, encoding: number): number;

declare function CFStringGetMaximumSizeOfFileSystemRepresentation(string: string): number;

declare function CFStringGetMostCompatibleMacStringEncoding(encoding: number): number;

declare function CFStringGetNameOfEncoding(encoding: number): string;

declare function CFStringGetParagraphBounds(string: string, range: CFRange, parBeginIndex: interop.Reference<number>, parEndIndex: interop.Reference<number>, contentsEndIndex: interop.Reference<number>): void;

declare function CFStringGetPascalString(theString: string, buffer: string, bufferSize: number, encoding: number): boolean;

declare function CFStringGetPascalStringPtr(theString: string, encoding: number): string;

declare function CFStringGetRangeOfComposedCharactersAtIndex(theString: string, theIndex: number): CFRange;

declare function CFStringGetSmallestEncoding(theString: string): number;

declare function CFStringGetSystemEncoding(): number;

declare function CFStringGetTypeID(): number;

declare function CFStringHasPrefix(theString: string, prefix: string): boolean;

declare function CFStringHasSuffix(theString: string, suffix: string): boolean;

interface CFStringInlineBuffer {
	buffer: interop.Reference<number>;
	theString: string;
	directUniCharBuffer: interop.Reference<number>;
	directCStringBuffer: string;
	rangeToBuffer: CFRange;
	bufferedRangeStart: number;
	bufferedRangeEnd: number;
}
declare var CFStringInlineBuffer: interop.StructType<CFStringInlineBuffer>;

declare function CFStringInsert(str: string, idx: number, insertedStr: string): void;

declare function CFStringIsEncodingAvailable(encoding: number): boolean;

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

declare function CFStringSetExternalCharactersNoCopy(theString: string, chars: interop.Reference<number>, length: number, capacity: number): void;

declare function CFStringTokenizerAdvanceToNextToken(tokenizer: any): CFStringTokenizerTokenType;

declare function CFStringTokenizerCopyBestStringLanguage(string: string, range: CFRange): string;

declare function CFStringTokenizerCopyCurrentTokenAttribute(tokenizer: any, attribute: number): any;

declare function CFStringTokenizerCreate(alloc: any, string: string, range: CFRange, options: number, locale: NSLocale): any;

declare function CFStringTokenizerGetCurrentSubTokens(tokenizer: any, ranges: interop.Reference<CFRange>, maxRangeLength: number, derivedSubTokens: NSArray<any>): number;

declare function CFStringTokenizerGetCurrentTokenRange(tokenizer: any): CFRange;

declare function CFStringTokenizerGetTypeID(): number;

declare function CFStringTokenizerGoToTokenAtIndex(tokenizer: any, index: number): CFStringTokenizerTokenType;

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

declare function CFStringTransform(string: string, range: interop.Reference<CFRange>, transform: string, reverse: boolean): boolean;

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

declare function CFTimeZoneCopyLocalizedName(tz: NSTimeZone, style: CFTimeZoneNameStyle, locale: NSLocale): string;

declare function CFTimeZoneCopySystem(): NSTimeZone;

declare function CFTimeZoneCreate(allocator: any, name: string, data: NSData): NSTimeZone;

declare function CFTimeZoneCreateWithName(allocator: any, name: string, tryAbbrev: boolean): NSTimeZone;

declare function CFTimeZoneCreateWithTimeIntervalFromGMT(allocator: any, ti: number): NSTimeZone;

declare function CFTimeZoneGetData(tz: NSTimeZone): NSData;

declare function CFTimeZoneGetDaylightSavingTimeOffset(tz: NSTimeZone, at: number): number;

declare function CFTimeZoneGetName(tz: NSTimeZone): string;

declare function CFTimeZoneGetNextDaylightSavingTimeTransition(tz: NSTimeZone, at: number): number;

declare function CFTimeZoneGetSecondsFromGMT(tz: NSTimeZone, at: number): number;

declare function CFTimeZoneGetTypeID(): number;

declare function CFTimeZoneIsDaylightSavingTime(tz: NSTimeZone, at: number): boolean;

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

declare function CFTreeApplyFunctionToChildren(tree: any, applier: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer) => void>, context: interop.Pointer): void;

interface CFTreeContext {
	version: number;
	info: interop.Pointer;
	retain: interop.FunctionReference<(p1: interop.Pointer) => interop.Pointer>;
	release: interop.FunctionReference<(p1: interop.Pointer) => void>;
	copyDescription: interop.FunctionReference<(p1: interop.Pointer) => string>;
}
declare var CFTreeContext: interop.StructType<CFTreeContext>;

declare function CFTreeCreate(allocator: any, context: interop.Reference<CFTreeContext>): any;

declare function CFTreeFindRoot(tree: any): any;

declare function CFTreeGetChildAtIndex(tree: any, idx: number): any;

declare function CFTreeGetChildCount(tree: any): number;

declare function CFTreeGetChildren(tree: any, children: interop.Reference<any>): void;

declare function CFTreeGetContext(tree: any, context: interop.Reference<CFTreeContext>): void;

declare function CFTreeGetFirstChild(tree: any): any;

declare function CFTreeGetNextSibling(tree: any): any;

declare function CFTreeGetParent(tree: any): any;

declare function CFTreeGetTypeID(): number;

declare function CFTreeInsertSibling(tree: any, newSibling: any): void;

declare function CFTreePrependChild(tree: any, newChild: any): void;

declare function CFTreeRemove(tree: any): void;

declare function CFTreeRemoveAllChildren(tree: any): void;

declare function CFTreeSetContext(tree: any, context: interop.Reference<CFTreeContext>): void;

declare function CFTreeSortChildren(tree: any, comparator: interop.FunctionReference<(p1: interop.Pointer, p2: interop.Pointer, p3: interop.Pointer) => CFComparisonResult>, context: interop.Pointer): void;

declare const enum CFURLBookmarkCreationOptions {

	kCFURLBookmarkCreationMinimalBookmarkMask = 512,

	kCFURLBookmarkCreationSuitableForBookmarkFile = 1024,

	kCFURLBookmarkCreationWithSecurityScope = 2048,

	kCFURLBookmarkCreationSecurityScopeAllowOnlyReadAccess = 4096,

	kCFURLBookmarkCreationPreferFileIDResolutionMask = 256
}

declare const enum CFURLBookmarkResolutionOptions {

	kCFURLBookmarkResolutionWithoutUIMask = 256,

	kCFURLBookmarkResolutionWithoutMountingMask = 512,

	kCFURLBookmarkResolutionWithSecurityScope = 1024,

	kCFBookmarkResolutionWithoutUIMask = 256,

	kCFBookmarkResolutionWithoutMountingMask = 512
}

declare function CFURLCanBeDecomposed(anURL: NSURL): boolean;

declare function CFURLClearResourcePropertyCache(url: NSURL): void;

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

declare function CFURLCopyParameterString(anURL: NSURL, charactersToLeaveEscaped: string): string;

declare function CFURLCopyPassword(anURL: NSURL): string;

declare function CFURLCopyPath(anURL: NSURL): string;

declare function CFURLCopyPathExtension(url: NSURL): string;

declare function CFURLCopyQueryString(anURL: NSURL, charactersToLeaveEscaped: string): string;

declare function CFURLCopyResourcePropertiesForKeys(url: NSURL, keys: NSArray<any>, error: interop.Reference<NSError>): interop.Unmanaged<NSDictionary<any, any>>;

declare function CFURLCopyResourcePropertyForKey(url: NSURL, key: string, propertyValueTypeRefPtr: interop.Pointer, error: interop.Reference<NSError>): boolean;

declare function CFURLCopyResourceSpecifier(anURL: NSURL): string;

declare function CFURLCopyScheme(anURL: NSURL): string;

declare function CFURLCopyStrictPath(anURL: NSURL, isAbsolute: string): string;

declare function CFURLCopyUserName(anURL: NSURL): string;

declare function CFURLCreateAbsoluteURLWithBytes(alloc: any, relativeURLBytes: string, length: number, encoding: number, baseURL: NSURL, useCompatibilityMode: boolean): NSURL;

declare function CFURLCreateBookmarkData(allocator: any, url: NSURL, options: CFURLBookmarkCreationOptions, resourcePropertiesToInclude: NSArray<any>, relativeToURL: NSURL, error: interop.Reference<NSError>): interop.Unmanaged<NSData>;

declare function CFURLCreateBookmarkDataFromFile(allocator: any, fileURL: NSURL, errorRef: interop.Reference<NSError>): interop.Unmanaged<NSData>;

declare function CFURLCreateByResolvingBookmarkData(allocator: any, bookmark: NSData, options: CFURLBookmarkResolutionOptions, relativeToURL: NSURL, resourcePropertiesToInclude: NSArray<any>, isStale: string, error: interop.Reference<NSError>): interop.Unmanaged<NSURL>;

declare function CFURLCreateCopyAppendingPathComponent(allocator: any, url: NSURL, pathComponent: string, isDirectory: boolean): NSURL;

declare function CFURLCreateCopyAppendingPathExtension(allocator: any, url: NSURL, extension: string): NSURL;

declare function CFURLCreateCopyDeletingLastPathComponent(allocator: any, url: NSURL): NSURL;

declare function CFURLCreateCopyDeletingPathExtension(allocator: any, url: NSURL): NSURL;

declare function CFURLCreateData(allocator: any, url: NSURL, encoding: number, escapeWhitespace: boolean): NSData;

declare function CFURLCreateDataAndPropertiesFromResource(alloc: any, url: NSURL, resourceData: interop.Reference<NSData>, properties: interop.Reference<NSDictionary<any, any>>, desiredProperties: NSArray<any>, errorCode: interop.Reference<number>): boolean;

declare function CFURLCreateFilePathURL(allocator: any, url: NSURL, error: interop.Reference<NSError>): interop.Unmanaged<NSURL>;

declare function CFURLCreateFileReferenceURL(allocator: any, url: NSURL, error: interop.Reference<NSError>): interop.Unmanaged<NSURL>;

declare function CFURLCreateFromFSRef(allocator: any, fsRef: interop.Pointer): NSURL;

declare function CFURLCreateFromFileSystemRepresentation(allocator: any, buffer: string, bufLen: number, isDirectory: boolean): NSURL;

declare function CFURLCreateFromFileSystemRepresentationRelativeToBase(allocator: any, buffer: string, bufLen: number, isDirectory: boolean, baseURL: NSURL): NSURL;

declare function CFURLCreatePropertyFromResource(alloc: any, url: NSURL, property: string, errorCode: interop.Reference<number>): any;

declare function CFURLCreateResourcePropertiesForKeysFromBookmarkData(allocator: any, resourcePropertiesToReturn: NSArray<any>, bookmark: NSData): interop.Unmanaged<NSDictionary<any, any>>;

declare function CFURLCreateResourcePropertyForKeyFromBookmarkData(allocator: any, resourcePropertyKey: string, bookmark: NSData): interop.Unmanaged<any>;

declare function CFURLCreateStringByAddingPercentEscapes(allocator: any, originalString: string, charactersToLeaveUnescaped: string, legalURLCharactersToBeEscaped: string, encoding: number): string;

declare function CFURLCreateStringByReplacingPercentEscapes(allocator: any, originalString: string, charactersToLeaveEscaped: string): string;

declare function CFURLCreateStringByReplacingPercentEscapesUsingEncoding(allocator: any, origString: string, charsToLeaveEscaped: string, encoding: number): string;

declare function CFURLCreateWithBytes(allocator: any, URLBytes: string, length: number, encoding: number, baseURL: NSURL): NSURL;

declare function CFURLCreateWithFileSystemPath(allocator: any, filePath: string, pathStyle: CFURLPathStyle, isDirectory: boolean): NSURL;

declare function CFURLCreateWithFileSystemPathRelativeToBase(allocator: any, filePath: string, pathStyle: CFURLPathStyle, isDirectory: boolean, baseURL: NSURL): NSURL;

declare function CFURLCreateWithString(allocator: any, URLString: string, baseURL: NSURL): NSURL;

declare function CFURLDestroyResource(url: NSURL, errorCode: interop.Reference<number>): boolean;

declare function CFURLEnumeratorCreateForDirectoryURL(alloc: any, directoryURL: NSURL, option: CFURLEnumeratorOptions, propertyKeys: NSArray<any>): any;

declare function CFURLEnumeratorCreateForMountedVolumes(alloc: any, option: CFURLEnumeratorOptions, propertyKeys: NSArray<any>): any;

declare function CFURLEnumeratorGetDescendentLevel(enumerator: any): number;

declare function CFURLEnumeratorGetNextURL(enumerator: any, url: interop.Reference<NSURL>, error: interop.Reference<NSError>): CFURLEnumeratorResult;

declare function CFURLEnumeratorGetSourceDidChange(enumerator: any): boolean;

declare function CFURLEnumeratorGetTypeID(): number;

declare const enum CFURLEnumeratorOptions {

	kCFURLEnumeratorDefaultBehavior = 0,

	kCFURLEnumeratorDescendRecursively = 1,

	kCFURLEnumeratorSkipInvisibles = 2,

	kCFURLEnumeratorGenerateFileReferenceURLs = 4,

	kCFURLEnumeratorSkipPackageContents = 8,

	kCFURLEnumeratorIncludeDirectoriesPreOrder = 16,

	kCFURLEnumeratorIncludeDirectoriesPostOrder = 32
}

declare const enum CFURLEnumeratorResult {

	kCFURLEnumeratorSuccess = 1,

	kCFURLEnumeratorEnd = 2,

	kCFURLEnumeratorError = 3,

	kCFURLEnumeratorDirectoryPostOrderSuccess = 4
}

declare function CFURLEnumeratorSkipDescendents(enumerator: any): void;

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

declare function CFURLGetByteRangeForComponent(url: NSURL, component: CFURLComponentType, rangeIncludingSeparators: interop.Reference<CFRange>): CFRange;

declare function CFURLGetBytes(url: NSURL, buffer: string, bufferLength: number): number;

declare function CFURLGetFSRef(url: NSURL, fsRef: interop.Pointer): boolean;

declare function CFURLGetFileSystemRepresentation(url: NSURL, resolveAgainstBase: boolean, buffer: string, maxBufLen: number): boolean;

declare function CFURLGetPortNumber(anURL: NSURL): number;

declare function CFURLGetString(anURL: NSURL): string;

declare function CFURLGetTypeID(): number;

declare function CFURLHasDirectoryPath(anURL: NSURL): boolean;

declare function CFURLIsFileReferenceURL(url: NSURL): boolean;

declare const enum CFURLPathStyle {

	kCFURLPOSIXPathStyle = 0,

	kCFURLHFSPathStyle = 1,

	kCFURLWindowsPathStyle = 2
}

declare function CFURLResourceIsReachable(url: NSURL, error: interop.Reference<NSError>): boolean;

declare function CFURLSetResourcePropertiesForKeys(url: NSURL, keyedPropertyValues: NSDictionary<any, any>, error: interop.Reference<NSError>): boolean;

declare function CFURLSetResourcePropertyForKey(url: NSURL, key: string, propertyValue: any, error: interop.Reference<NSError>): boolean;

declare function CFURLSetTemporaryResourcePropertyForKey(url: NSURL, key: string, propertyValue: any): void;

declare function CFURLStartAccessingSecurityScopedResource(url: NSURL): boolean;

declare function CFURLStopAccessingSecurityScopedResource(url: NSURL): void;

declare function CFURLWriteBookmarkDataToFile(bookmarkRef: NSData, fileURL: NSURL, options: number, errorRef: interop.Reference<NSError>): boolean;

declare function CFURLWriteDataAndPropertiesToResource(url: NSURL, dataToWrite: NSData, propertiesToWrite: NSDictionary<any, any>, errorCode: interop.Reference<number>): boolean;

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

declare function CFWriteStreamCopyDispatchQueue(stream: NSOutputStream): NSObject;

declare function CFWriteStreamCopyError(stream: NSOutputStream): NSError;

declare function CFWriteStreamCopyProperty(stream: NSOutputStream, propertyName: string): any;

declare function CFWriteStreamCreateWithAllocatedBuffers(alloc: any, bufferAllocator: any): NSOutputStream;

declare function CFWriteStreamCreateWithBuffer(alloc: any, buffer: string, bufferCapacity: number): NSOutputStream;

declare function CFWriteStreamCreateWithFile(alloc: any, fileURL: NSURL): NSOutputStream;

declare function CFWriteStreamGetError(stream: NSOutputStream): CFStreamError;

declare function CFWriteStreamGetStatus(stream: NSOutputStream): CFStreamStatus;

declare function CFWriteStreamGetTypeID(): number;

declare function CFWriteStreamOpen(stream: NSOutputStream): boolean;

declare function CFWriteStreamScheduleWithRunLoop(stream: NSOutputStream, runLoop: any, runLoopMode: string): void;

declare function CFWriteStreamSetClient(stream: NSOutputStream, streamEvents: number, clientCB: interop.FunctionReference<(p1: NSOutputStream, p2: CFStreamEventType, p3: interop.Pointer) => void>, clientContext: interop.Reference<CFStreamClientContext>): boolean;

declare function CFWriteStreamSetDispatchQueue(stream: NSOutputStream, q: NSObject): void;

declare function CFWriteStreamSetProperty(stream: NSOutputStream, propertyName: string, propertyValue: any): boolean;

declare function CFWriteStreamUnscheduleFromRunLoop(stream: NSOutputStream, runLoop: any, runLoopMode: string): void;

declare function CFWriteStreamWrite(stream: NSOutputStream, buffer: string, bufferLength: number): number;

interface IUnknownVTbl {
	_reserved: interop.Pointer;
	QueryInterface: interop.FunctionReference<(p1: interop.Pointer, p2: CFUUIDBytes, p3: interop.Reference<interop.Pointer>) => number>;
	AddRef: interop.FunctionReference<(p1: interop.Pointer) => number>;
	Release: interop.FunctionReference<(p1: interop.Pointer) => number>;
}
declare var IUnknownVTbl: interop.StructType<IUnknownVTbl>;

declare const enum __CFByteOrder {

	CFByteOrderUnknown = 0,

	CFByteOrderLittleEndian = 1,

	CFByteOrderBigEndian = 2
}

declare function __CFRangeMake(loc: number, len: number): CFRange;

declare function __CFStringMakeConstantString(cStr: string): string;

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

declare var kCFBundleExecutableKey: string;

declare var kCFBundleIdentifierKey: string;

declare var kCFBundleInfoDictionaryVersionKey: string;

declare var kCFBundleLocalizationsKey: string;

declare var kCFBundleNameKey: string;

declare var kCFBundleVersionKey: string;

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

declare var kCFDateFormatterDoesRelativeDateFormattingKey: string;

declare var kCFDateFormatterEraSymbols: string;

declare var kCFDateFormatterGregorianStartDate: string;

declare var kCFDateFormatterIsLenient: string;

declare var kCFDateFormatterLongEraSymbols: string;

declare var kCFDateFormatterMonthSymbols: string;

declare var kCFDateFormatterPMSymbol: string;

declare var kCFDateFormatterQuarterSymbols: string;

declare var kCFDateFormatterShortMonthSymbols: string;

declare var kCFDateFormatterShortQuarterSymbols: string;

declare var kCFDateFormatterShortStandaloneMonthSymbols: string;

declare var kCFDateFormatterShortStandaloneQuarterSymbols: string;

declare var kCFDateFormatterShortStandaloneWeekdaySymbols: string;

declare var kCFDateFormatterShortWeekdaySymbols: string;

declare var kCFDateFormatterStandaloneMonthSymbols: string;

declare var kCFDateFormatterStandaloneQuarterSymbols: string;

declare var kCFDateFormatterStandaloneWeekdaySymbols: string;

declare var kCFDateFormatterTimeZone: string;

declare var kCFDateFormatterTwoDigitStartDate: string;

declare var kCFDateFormatterVeryShortMonthSymbols: string;

declare var kCFDateFormatterVeryShortStandaloneMonthSymbols: string;

declare var kCFDateFormatterVeryShortStandaloneWeekdaySymbols: string;

declare var kCFDateFormatterVeryShortWeekdaySymbols: string;

declare var kCFDateFormatterWeekdaySymbols: string;

declare var kCFErrorDescriptionKey: string;

declare var kCFErrorDomainCocoa: string;

declare var kCFErrorDomainMach: string;

declare var kCFErrorDomainOSStatus: string;

declare var kCFErrorDomainPOSIX: string;

declare var kCFErrorFilePathKey: string;

declare var kCFErrorLocalizedDescriptionKey: string;

declare var kCFErrorLocalizedFailureReasonKey: string;

declare var kCFErrorLocalizedRecoverySuggestionKey: string;

declare var kCFErrorURLKey: string;

declare var kCFErrorUnderlyingErrorKey: string;

declare var kCFGregorianCalendar: string;

declare var kCFHebrewCalendar: string;

declare var kCFISO8601Calendar: string;

declare var kCFIndianCalendar: string;

declare var kCFIslamicCalendar: string;

declare var kCFIslamicCivilCalendar: string;

declare var kCFIslamicTabularCalendar: string;

declare var kCFIslamicUmmAlQuraCalendar: string;

declare var kCFJapaneseCalendar: string;

declare var kCFLocaleAlternateQuotationBeginDelimiterKey: string;

declare var kCFLocaleAlternateQuotationEndDelimiterKey: string;

declare var kCFLocaleCalendar: string;

declare var kCFLocaleCalendarIdentifier: string;

declare var kCFLocaleCollationIdentifier: string;

declare var kCFLocaleCollatorIdentifier: string;

declare var kCFLocaleCountryCode: string;

declare var kCFLocaleCurrencyCode: string;

declare var kCFLocaleCurrencySymbol: string;

declare var kCFLocaleCurrentLocaleDidChangeNotification: string;

declare var kCFLocaleDecimalSeparator: string;

declare var kCFLocaleExemplarCharacterSet: string;

declare var kCFLocaleGroupingSeparator: string;

declare var kCFLocaleIdentifier: string;

declare var kCFLocaleLanguageCode: string;

declare var kCFLocaleMeasurementSystem: string;

declare var kCFLocaleQuotationBeginDelimiterKey: string;

declare var kCFLocaleQuotationEndDelimiterKey: string;

declare var kCFLocaleScriptCode: string;

declare var kCFLocaleUsesMetricSystem: string;

declare var kCFLocaleVariantCode: string;

declare var kCFNotFound: number;

declare var kCFNull: NSNull;

declare var kCFNumberFormatterAlwaysShowDecimalSeparator: string;

declare var kCFNumberFormatterCurrencyCode: string;

declare var kCFNumberFormatterCurrencyDecimalSeparator: string;

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

declare var kCFNumberFormatterIsLenient: string;

declare var kCFNumberFormatterMaxFractionDigits: string;

declare var kCFNumberFormatterMaxIntegerDigits: string;

declare var kCFNumberFormatterMaxSignificantDigits: string;

declare var kCFNumberFormatterMinFractionDigits: string;

declare var kCFNumberFormatterMinIntegerDigits: string;

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

declare var kCFNumberFormatterUseSignificantDigits: string;

declare var kCFNumberFormatterZeroSymbol: string;

declare var kCFNumberNaN: number;

declare var kCFNumberNegativeInfinity: number;

declare var kCFNumberPositiveInfinity: number;

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

declare var kCFRepublicOfChinaCalendar: string;

declare var kCFRunLoopCommonModes: string;

declare var kCFRunLoopDefaultMode: string;

declare var kCFSocketCommandKey: string;

declare var kCFSocketErrorKey: string;

declare var kCFSocketNameKey: string;

declare var kCFSocketRegisterCommand: string;

declare var kCFSocketResultKey: string;

declare var kCFSocketRetrieveCommand: string;

declare var kCFSocketValueKey: string;

declare var kCFStreamPropertyAppendToFile: string;

declare var kCFStreamPropertyDataWritten: string;

declare var kCFStreamPropertyFileCurrentOffset: string;

declare var kCFStreamPropertySocketNativeHandle: string;

declare var kCFStreamPropertySocketRemoteHostName: string;

declare var kCFStreamPropertySocketRemotePortNumber: string;

declare var kCFStringBinaryHeapCallBacks: CFBinaryHeapCallBacks;

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

declare var kCFStringTransformStripDiacritics: string;

declare var kCFStringTransformToLatin: string;

declare var kCFStringTransformToUnicodeName: string;

declare var kCFStringTransformToXMLHex: string;

declare var kCFTimeZoneSystemTimeZoneDidChangeNotification: string;

declare var kCFTypeArrayCallBacks: CFArrayCallBacks;

declare var kCFTypeBagCallBacks: CFBagCallBacks;

declare var kCFTypeDictionaryKeyCallBacks: CFDictionaryKeyCallBacks;

declare var kCFTypeDictionaryValueCallBacks: CFDictionaryValueCallBacks;

declare var kCFTypeSetCallBacks: CFSetCallBacks;

declare var kCFURLAddedToDirectoryDateKey: string;

declare var kCFURLAttributeModificationDateKey: string;

declare var kCFURLContentAccessDateKey: string;

declare var kCFURLContentModificationDateKey: string;

declare var kCFURLCreationDateKey: string;

declare var kCFURLCustomIconKey: string;

declare var kCFURLDocumentIdentifierKey: string;

declare var kCFURLEffectiveIconKey: string;

declare var kCFURLFileAllocatedSizeKey: string;

declare var kCFURLFileDirectoryContents: string;

declare var kCFURLFileExists: string;

declare var kCFURLFileLastModificationTime: string;

declare var kCFURLFileLength: string;

declare var kCFURLFileOwnerID: string;

declare var kCFURLFilePOSIXMode: string;

declare var kCFURLFileProtectionComplete: string;

declare var kCFURLFileProtectionCompleteUnlessOpen: string;

declare var kCFURLFileProtectionCompleteUntilFirstUserAuthentication: string;

declare var kCFURLFileProtectionKey: string;

declare var kCFURLFileProtectionNone: string;

declare var kCFURLFileResourceIdentifierKey: string;

declare var kCFURLFileResourceTypeBlockSpecial: string;

declare var kCFURLFileResourceTypeCharacterSpecial: string;

declare var kCFURLFileResourceTypeDirectory: string;

declare var kCFURLFileResourceTypeKey: string;

declare var kCFURLFileResourceTypeNamedPipe: string;

declare var kCFURLFileResourceTypeRegular: string;

declare var kCFURLFileResourceTypeSocket: string;

declare var kCFURLFileResourceTypeSymbolicLink: string;

declare var kCFURLFileResourceTypeUnknown: string;

declare var kCFURLFileSecurityKey: string;

declare var kCFURLFileSizeKey: string;

declare var kCFURLGenerationIdentifierKey: string;

declare var kCFURLHTTPStatusCode: string;

declare var kCFURLHTTPStatusLine: string;

declare var kCFURLHasHiddenExtensionKey: string;

declare var kCFURLIsAliasFileKey: string;

declare var kCFURLIsApplicationKey: string;

declare var kCFURLIsDirectoryKey: string;

declare var kCFURLIsExcludedFromBackupKey: string;

declare var kCFURLIsExecutableKey: string;

declare var kCFURLIsHiddenKey: string;

declare var kCFURLIsMountTriggerKey: string;

declare var kCFURLIsPackageKey: string;

declare var kCFURLIsReadableKey: string;

declare var kCFURLIsRegularFileKey: string;

declare var kCFURLIsSymbolicLinkKey: string;

declare var kCFURLIsSystemImmutableKey: string;

declare var kCFURLIsUbiquitousItemKey: string;

declare var kCFURLIsUserImmutableKey: string;

declare var kCFURLIsVolumeKey: string;

declare var kCFURLIsWritableKey: string;

declare var kCFURLKeysOfUnsetValuesKey: string;

declare var kCFURLLabelColorKey: string;

declare var kCFURLLabelNumberKey: string;

declare var kCFURLLinkCountKey: string;

declare var kCFURLLocalizedLabelKey: string;

declare var kCFURLLocalizedNameKey: string;

declare var kCFURLLocalizedTypeDescriptionKey: string;

declare var kCFURLNameKey: string;

declare var kCFURLParentDirectoryURLKey: string;

declare var kCFURLPathKey: string;

declare var kCFURLPreferredIOBlockSizeKey: string;

declare var kCFURLTotalFileAllocatedSizeKey: string;

declare var kCFURLTotalFileSizeKey: string;

declare var kCFURLTypeIdentifierKey: string;

declare var kCFURLUbiquitousItemDownloadingErrorKey: string;

declare var kCFURLUbiquitousItemDownloadingStatusCurrent: string;

declare var kCFURLUbiquitousItemDownloadingStatusDownloaded: string;

declare var kCFURLUbiquitousItemDownloadingStatusKey: string;

declare var kCFURLUbiquitousItemDownloadingStatusNotDownloaded: string;

declare var kCFURLUbiquitousItemHasUnresolvedConflictsKey: string;

declare var kCFURLUbiquitousItemIsDownloadedKey: string;

declare var kCFURLUbiquitousItemIsDownloadingKey: string;

declare var kCFURLUbiquitousItemIsUploadedKey: string;

declare var kCFURLUbiquitousItemIsUploadingKey: string;

declare var kCFURLUbiquitousItemPercentDownloadedKey: string;

declare var kCFURLUbiquitousItemPercentUploadedKey: string;

declare var kCFURLUbiquitousItemUploadingErrorKey: string;

declare var kCFURLVolumeAvailableCapacityKey: string;

declare var kCFURLVolumeCreationDateKey: string;

declare var kCFURLVolumeIdentifierKey: string;

declare var kCFURLVolumeIsAutomountedKey: string;

declare var kCFURLVolumeIsBrowsableKey: string;

declare var kCFURLVolumeIsEjectableKey: string;

declare var kCFURLVolumeIsInternalKey: string;

declare var kCFURLVolumeIsJournalingKey: string;

declare var kCFURLVolumeIsLocalKey: string;

declare var kCFURLVolumeIsReadOnlyKey: string;

declare var kCFURLVolumeIsRemovableKey: string;

declare var kCFURLVolumeLocalizedFormatDescriptionKey: string;

declare var kCFURLVolumeLocalizedNameKey: string;

declare var kCFURLVolumeMaximumFileSizeKey: string;

declare var kCFURLVolumeNameKey: string;

declare var kCFURLVolumeResourceCountKey: string;

declare var kCFURLVolumeSupportsAdvisoryFileLockingKey: string;

declare var kCFURLVolumeSupportsCasePreservedNamesKey: string;

declare var kCFURLVolumeSupportsCaseSensitiveNamesKey: string;

declare var kCFURLVolumeSupportsExtendedSecurityKey: string;

declare var kCFURLVolumeSupportsHardLinksKey: string;

declare var kCFURLVolumeSupportsJournalingKey: string;

declare var kCFURLVolumeSupportsPersistentIDsKey: string;

declare var kCFURLVolumeSupportsRenamingKey: string;

declare var kCFURLVolumeSupportsRootDirectoryDatesKey: string;

declare var kCFURLVolumeSupportsSparseFilesKey: string;

declare var kCFURLVolumeSupportsSymbolicLinksKey: string;

declare var kCFURLVolumeSupportsVolumeSizesKey: string;

declare var kCFURLVolumeSupportsZeroRunsKey: string;

declare var kCFURLVolumeTotalCapacityKey: string;

declare var kCFURLVolumeURLForRemountingKey: string;

declare var kCFURLVolumeURLKey: string;

declare var kCFURLVolumeUUIDStringKey: string;
