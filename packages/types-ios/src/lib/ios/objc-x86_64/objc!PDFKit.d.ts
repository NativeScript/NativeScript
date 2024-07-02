
declare const enum PDFAccessPermissions {

	AllowsLowQualityPrinting = 1,

	AllowsHighQualityPrinting = 2,

	AllowsDocumentChanges = 4,

	AllowsDocumentAssembly = 8,

	AllowsContentCopying = 16,

	AllowsContentAccessibility = 32,

	AllowsCommenting = 64,

	AllowsFormFieldEntry = 128
}

/**
 * @since 11.0
 */
declare class PDFAction extends NSObject implements NSCopying {

	static alloc(): PDFAction; // inherited from NSObject

	static new(): PDFAction; // inherited from NSObject

	readonly type: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class PDFActionGoTo extends PDFAction implements NSCopying {

	static alloc(): PDFActionGoTo; // inherited from NSObject

	static new(): PDFActionGoTo; // inherited from NSObject

	destination: PDFDestination;

	constructor(o: { destination: PDFDestination; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithDestination(destination: PDFDestination): this;
}

/**
 * @since 11.0
 */
declare class PDFActionNamed extends PDFAction implements NSCopying {

	static alloc(): PDFActionNamed; // inherited from NSObject

	static new(): PDFActionNamed; // inherited from NSObject

	name: PDFActionNamedName;

	constructor(o: { name: PDFActionNamedName; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithName(name: PDFActionNamedName): this;
}

declare const enum PDFActionNamedName {

	kPDFActionNamedNone = 0,

	kPDFActionNamedNextPage = 1,

	kPDFActionNamedPreviousPage = 2,

	kPDFActionNamedFirstPage = 3,

	kPDFActionNamedLastPage = 4,

	kPDFActionNamedGoBack = 5,

	kPDFActionNamedGoForward = 6,

	kPDFActionNamedGoToPage = 7,

	kPDFActionNamedFind = 8,

	kPDFActionNamedPrint = 9,

	kPDFActionNamedZoomIn = 10,

	kPDFActionNamedZoomOut = 11
}

/**
 * @since 11.0
 */
declare class PDFActionRemoteGoTo extends PDFAction implements NSCopying {

	static alloc(): PDFActionRemoteGoTo; // inherited from NSObject

	static new(): PDFActionRemoteGoTo; // inherited from NSObject

	URL: NSURL;

	pageIndex: number;

	point: CGPoint;

	constructor(o: { pageIndex: number; atPoint: CGPoint; fileURL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithPageIndexAtPointFileURL(pageIndex: number, point: CGPoint, url: NSURL): this;
}

/**
 * @since 11.0
 */
declare class PDFActionResetForm extends PDFAction implements NSCopying {

	static alloc(): PDFActionResetForm; // inherited from NSObject

	static new(): PDFActionResetForm; // inherited from NSObject

	fields: NSArray<string>;

	fieldsIncludedAreCleared: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class PDFActionURL extends PDFAction implements NSCopying {

	static alloc(): PDFActionURL; // inherited from NSObject

	static new(): PDFActionURL; // inherited from NSObject

	URL: NSURL;

	constructor(o: { URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithURL(url: NSURL): this;
}

/**
 * @since 11.0
 */
declare class PDFAnnotation extends NSObject implements NSCoding, NSCopying {

	static alloc(): PDFAnnotation; // inherited from NSObject

	static lineStyleFromName(name: string): PDFLineStyle;

	static nameForLineStyle(style: PDFLineStyle): string;

	static new(): PDFAnnotation; // inherited from NSObject

	URL: NSURL;

	/**
	 * @since 11.0
	 */
	action: PDFAction;

	readonly activatableTextField: boolean;

	alignment: NSTextAlignment;

	allowsToggleToOff: boolean;

	/**
	 * @since 11.0
	 */
	readonly annotationKeyValues: NSDictionary<any, any>;

	backgroundColor: UIColor;

	/**
	 * @since 11.0
	 */
	border: PDFBorder;

	bounds: CGRect;

	buttonWidgetState: PDFWidgetCellState;

	buttonWidgetStateString: string;

	caption: string;

	choices: NSArray<string>;

	/**
	 * @since 11.0
	 */
	color: UIColor;

	comb: boolean;

	/**
	 * @since 11.0
	 */
	contents: string;

	destination: PDFDestination;

	endLineStyle: PDFLineStyle;

	endPoint: CGPoint;

	fieldName: string;

	font: UIFont;

	fontColor: UIColor;

	readonly hasAppearanceStream: boolean;

	/**
	 * @since 11.0
	 */
	highlighted: boolean;

	iconType: PDFTextAnnotationIconType;

	interiorColor: UIColor;

	readonly isPasswordField: boolean;

	listChoice: boolean;

	markupType: PDFMarkupType;

	maximumLength: number;

	/**
	 * @since 11.0
	 */
	modificationDate: Date;

	multiline: boolean;

	open: boolean;

	page: PDFPage;

	readonly paths: NSArray<UIBezierPath>;

	/**
	 * @since 11.0
	 */
	popup: PDFAnnotation;

	quadrilateralPoints: NSArray<NSValue>;

	radiosInUnison: boolean;

	readOnly: boolean;

	shouldDisplay: boolean;

	shouldPrint: boolean;

	stampName: string;

	startLineStyle: PDFLineStyle;

	startPoint: CGPoint;

	type: string;

	/**
	 * @since 11.0
	 */
	userName: string;

	values: NSArray<string>;

	widgetControlType: PDFWidgetControlType;

	widgetDefaultStringValue: string;

	widgetFieldType: string;

	widgetStringValue: string;

	/**
	 * @since 11.0
	 */
	constructor(o: { bounds: CGRect; forType: string; withProperties: NSDictionary<any, any>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addBezierPath(path: UIBezierPath): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 11.0
	 */
	drawWithBoxInContext(box: PDFDisplayBox, context: any): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 11.0
	 */
	initWithBoundsForTypeWithProperties(bounds: CGRect, annotationType: string, properties: NSDictionary<any, any>): this;

	initWithCoder(coder: NSCoder): this;

	removeBezierPath(path: UIBezierPath): void;

	/**
	 * @since 11.0
	 */
	removeValueForAnnotationKey(key: string): void;

	/**
	 * @since 11.0
	 */
	setBooleanForAnnotationKey(value: boolean, key: string): boolean;

	/**
	 * @since 11.0
	 */
	setRectForAnnotationKey(value: CGRect, key: string): boolean;

	/**
	 * @since 11.0
	 */
	setValueForAnnotationKey(value: any, key: string): boolean;

	/**
	 * @since 11.0
	 */
	valueForAnnotationKey(key: string): any;
}

/**
 * @since 11.0
 */
declare var PDFAnnotationHighlightingModeInvert: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationHighlightingModeNone: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationHighlightingModeOutline: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationHighlightingModePush: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyAction: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyAdditionalActions: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyAppearanceDictionary: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyAppearanceState: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyBorder: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyBorderStyle: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyColor: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyContents: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyDate: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyDefaultAppearance: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyDestination: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyFlags: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyHighlightingMode: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyIconName: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyInklist: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyInteriorColor: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyLineEndingStyles: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyLinePoints: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyName: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyOpen: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyPage: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyParent: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyPopup: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyQuadPoints: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyQuadding: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyRect: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeySubtype: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyTextLabel: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetAppearanceDictionary: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetBackgroundColor: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetBorderColor: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetCaption: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetDefaultValue: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetDownCaption: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetFieldFlags: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetFieldType: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetMaxLen: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetOptions: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetRolloverCaption: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetRotation: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetTextLabelUI: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationKeyWidgetValue: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationLineEndingStyleCircle: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationLineEndingStyleClosedArrow: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationLineEndingStyleDiamond: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationLineEndingStyleNone: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationLineEndingStyleOpenArrow: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationLineEndingStyleSquare: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeCircle: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeFreeText: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeHighlight: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeInk: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeLine: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeLink: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypePopup: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeSquare: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeStamp: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeStrikeOut: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeText: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeUnderline: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationSubtypeWidget: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeComment: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeHelp: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeInsert: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeKey: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeNewParagraph: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeNote: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationTextIconTypeParagraph: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationWidgetSubtypeButton: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationWidgetSubtypeChoice: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationWidgetSubtypeSignature: string;

/**
 * @since 11.0
 */
declare var PDFAnnotationWidgetSubtypeText: string;

/**
 * @since 11.0
 */
declare class PDFAppearanceCharacteristics extends NSObject implements NSCopying {

	static alloc(): PDFAppearanceCharacteristics; // inherited from NSObject

	static new(): PDFAppearanceCharacteristics; // inherited from NSObject

	readonly appearanceCharacteristicsKeyValues: NSDictionary<any, any>;

	backgroundColor: UIColor;

	borderColor: UIColor;

	caption: string;

	controlType: PDFWidgetControlType;

	downCaption: string;

	rolloverCaption: string;

	rotation: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare var PDFAppearanceCharacteristicsKeyBackgroundColor: string;

/**
 * @since 11.0
 */
declare var PDFAppearanceCharacteristicsKeyBorderColor: string;

/**
 * @since 11.0
 */
declare var PDFAppearanceCharacteristicsKeyCaption: string;

/**
 * @since 11.0
 */
declare var PDFAppearanceCharacteristicsKeyDownCaption: string;

/**
 * @since 11.0
 */
declare var PDFAppearanceCharacteristicsKeyRolloverCaption: string;

/**
 * @since 11.0
 */
declare var PDFAppearanceCharacteristicsKeyRotation: string;

declare const enum PDFAreaOfInterest {

	kPDFNoArea = 0,

	kPDFPageArea = 1,

	kPDFTextArea = 2,

	kPDFAnnotationArea = 4,

	kPDFLinkArea = 8,

	kPDFControlArea = 16,

	kPDFTextFieldArea = 32,

	kPDFIconArea = 64,

	kPDFPopupArea = 128,

	kPDFImageArea = 256,

	kPDFAnyArea = 9223372036854775807
}

/**
 * @since 11.0
 */
declare class PDFBorder extends NSObject implements NSCoding, NSCopying {

	static alloc(): PDFBorder; // inherited from NSObject

	static new(): PDFBorder; // inherited from NSObject

	readonly borderKeyValues: NSDictionary<any, any>;

	dashPattern: NSArray<any>;

	lineWidth: number;

	style: PDFBorderStyle;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawInRect(rect: CGRect): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare var PDFBorderKeyDashPattern: string;

/**
 * @since 11.0
 */
declare var PDFBorderKeyLineWidth: string;

/**
 * @since 11.0
 */
declare var PDFBorderKeyStyle: string;

declare const enum PDFBorderStyle {

	kPDFBorderStyleSolid = 0,

	kPDFBorderStyleDashed = 1,

	kPDFBorderStyleBeveled = 2,

	kPDFBorderStyleInset = 3,

	kPDFBorderStyleUnderline = 4
}

/**
 * @since 11.0
 */
declare class PDFDestination extends NSObject implements NSCopying {

	static alloc(): PDFDestination; // inherited from NSObject

	static new(): PDFDestination; // inherited from NSObject

	readonly page: PDFPage;

	readonly point: CGPoint;

	/**
	 * @since 11.0
	 */
	zoom: number;

	constructor(o: { page: PDFPage; atPoint: CGPoint; });

	/**
	 * @since 11.0
	 */
	compare(destination: PDFDestination): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithPageAtPoint(page: PDFPage, point: CGPoint): this;
}

declare const enum PDFDisplayBox {

	kPDFDisplayBoxMediaBox = 0,

	kPDFDisplayBoxCropBox = 1,

	kPDFDisplayBoxBleedBox = 2,

	kPDFDisplayBoxTrimBox = 3,

	kPDFDisplayBoxArtBox = 4
}

declare const enum PDFDisplayDirection {

	kPDFDisplayDirectionVertical = 0,

	kPDFDisplayDirectionHorizontal = 1
}

declare const enum PDFDisplayMode {

	kPDFDisplaySinglePage = 0,

	kPDFDisplaySinglePageContinuous = 1,

	kPDFDisplayTwoUp = 2,

	kPDFDisplayTwoUpContinuous = 3
}

/**
 * @since 11.0
 */
declare class PDFDocument extends NSObject implements NSCopying {

	static alloc(): PDFDocument; // inherited from NSObject

	static new(): PDFDocument; // inherited from NSObject

	readonly accessPermissions: PDFAccessPermissions;

	/**
	 * @since 11.0
	 */
	readonly allowsCommenting: boolean;

	/**
	 * @since 11.0
	 */
	readonly allowsContentAccessibility: boolean;

	/**
	 * @since 11.0
	 */
	readonly allowsCopying: boolean;

	/**
	 * @since 11.0
	 */
	readonly allowsDocumentAssembly: boolean;

	/**
	 * @since 11.0
	 */
	readonly allowsDocumentChanges: boolean;

	/**
	 * @since 11.0
	 */
	readonly allowsFormFieldEntry: boolean;

	/**
	 * @since 11.0
	 */
	readonly allowsPrinting: boolean;

	delegate: PDFDocumentDelegate;

	documentAttributes: NSDictionary<any, any>;

	readonly documentRef: any;

	readonly documentURL: NSURL;

	readonly isEncrypted: boolean;

	readonly isFinding: boolean;

	readonly isLocked: boolean;

	readonly majorVersion: number;

	readonly minorVersion: number;

	/**
	 * @since 11.0
	 */
	outlineRoot: PDFOutline;

	readonly pageClass: typeof NSObject;

	readonly pageCount: number;

	/**
	 * @since 11.0
	 */
	readonly permissionsStatus: PDFDocumentPermissions;

	readonly selectionForEntireDocument: PDFSelection;

	readonly string: string;

	constructor(o: { data: NSData; });

	constructor(o: { URL: NSURL; });

	beginFindStringWithOptions(string: string, options: NSStringCompareOptions): void;

	/**
	 * @since 11.0
	 */
	beginFindStringsWithOptions(strings: NSArray<string> | string[], options: NSStringCompareOptions): void;

	cancelFindString(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dataRepresentation(): NSData;

	/**
	 * @since 11.0
	 */
	dataRepresentationWithOptions(options: NSDictionary<any, any>): NSData;

	exchangePageAtIndexWithPageAtIndex(indexA: number, indexB: number): void;

	findStringFromSelectionWithOptions(string: string, selection: PDFSelection, options: NSStringCompareOptions): PDFSelection;

	findStringWithOptions(string: string, options: NSStringCompareOptions): NSArray<PDFSelection>;

	indexForPage(page: PDFPage): number;

	initWithData(data: NSData): this;

	initWithURL(url: NSURL): this;

	insertPageAtIndex(page: PDFPage, index: number): void;

	outlineItemForSelection(selection: PDFSelection): PDFOutline;

	pageAtIndex(index: number): PDFPage;

	removePageAtIndex(index: number): void;

	selectionFromPageAtCharacterIndexToPageAtCharacterIndex(startPage: PDFPage, startCharacter: number, endPage: PDFPage, endCharacter: number): PDFSelection;

	selectionFromPageAtPointToPageAtPoint(startPage: PDFPage, startPoint: CGPoint, endPage: PDFPage, endPoint: CGPoint): PDFSelection;

	/**
	 * @since 18.0
	 */
	selectionFromPageAtPointToPageAtPointWithGranularity(startPage: PDFPage, startPoint: CGPoint, endPage: PDFPage, endPoint: CGPoint, granularity: PDFSelectionGranularity): PDFSelection;

	unlockWithPassword(password: string): boolean;

	writeToFile(path: string): boolean;

	writeToFileWithOptions(path: string, options: NSDictionary<string, any>): boolean;

	writeToURL(url: NSURL): boolean;

	writeToURLWithOptions(url: NSURL, options: NSDictionary<string, any>): boolean;
}

/**
 * @since 15.0
 */
declare var PDFDocumentAccessPermissionsOption: string;

/**
 * @since 11.0
 */
declare var PDFDocumentAuthorAttribute: string;

/**
 * @since 16.0
 */
declare var PDFDocumentBurnInAnnotationsOption: string;

/**
 * @since 11.0
 */
declare var PDFDocumentCreationDateAttribute: string;

/**
 * @since 11.0
 */
declare var PDFDocumentCreatorAttribute: string;

interface PDFDocumentDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	classForAnnotationType?(annotationType: string): typeof NSObject;

	/**
	 * @since 11.0
	 */
	classForPage?(): typeof NSObject;

	didMatchString?(instance: PDFSelection): void;

	documentDidBeginDocumentFind?(notification: NSNotification): void;

	documentDidBeginPageFind?(notification: NSNotification): void;

	documentDidEndDocumentFind?(notification: NSNotification): void;

	documentDidEndPageFind?(notification: NSNotification): void;

	documentDidFindMatch?(notification: NSNotification): void;

	documentDidUnlock?(notification: NSNotification): void;
}
declare var PDFDocumentDelegate: {

	prototype: PDFDocumentDelegate;
};

/**
 * @since 11.0
 */
declare var PDFDocumentDidBeginFindNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidBeginPageFindNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidBeginPageWriteNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidBeginWriteNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidEndFindNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidEndPageFindNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidEndPageWriteNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidEndWriteNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidFindMatchNotification: string;

/**
 * @since 11.0
 */
declare var PDFDocumentDidUnlockNotification: string;

/**
 * @since 15.0
 */
declare var PDFDocumentFoundSelectionKey: string;

/**
 * @since 11.0
 */
declare var PDFDocumentKeywordsAttribute: string;

/**
 * @since 11.0
 */
declare var PDFDocumentModificationDateAttribute: string;

/**
 * @since 16.4
 */
declare var PDFDocumentOptimizeImagesForScreenOption: string;

/**
 * @since 11.0
 */
declare var PDFDocumentOwnerPasswordOption: string;

/**
 * @since 15.0
 */
declare var PDFDocumentPageIndexKey: string;

declare const enum PDFDocumentPermissions {

	kPDFDocumentPermissionsNone = 0,

	kPDFDocumentPermissionsUser = 1,

	kPDFDocumentPermissionsOwner = 2
}

/**
 * @since 11.0
 */
declare var PDFDocumentProducerAttribute: string;

/**
 * @since 16.4
 */
declare var PDFDocumentSaveImagesAsJPEGOption: string;

/**
 * @since 16.0
 */
declare var PDFDocumentSaveTextFromOCROption: string;

/**
 * @since 11.0
 */
declare var PDFDocumentSubjectAttribute: string;

/**
 * @since 11.0
 */
declare var PDFDocumentTitleAttribute: string;

/**
 * @since 11.0
 */
declare var PDFDocumentUserPasswordOption: string;

declare const enum PDFInterpolationQuality {

	kPDFInterpolationQualityNone = 0,

	kPDFInterpolationQualityLow = 1,

	kPDFInterpolationQualityHigh = 2
}

declare const enum PDFLineStyle {

	kPDFLineStyleNone = 0,

	kPDFLineStyleSquare = 1,

	kPDFLineStyleCircle = 2,

	kPDFLineStyleDiamond = 3,

	kPDFLineStyleOpenArrow = 4,

	kPDFLineStyleClosedArrow = 5
}

declare const enum PDFMarkupType {

	kPDFMarkupTypeHighlight = 0,

	kPDFMarkupTypeStrikeOut = 1,

	kPDFMarkupTypeUnderline = 2,

	kPDFMarkupTypeRedact = 3
}

/**
 * @since 11.0
 */
declare class PDFOutline extends NSObject {

	static alloc(): PDFOutline; // inherited from NSObject

	static new(): PDFOutline; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	action: PDFAction;

	destination: PDFDestination;

	readonly document: PDFDocument;

	/**
	 * @since 11.0
	 */
	readonly index: number;

	/**
	 * @since 11.0
	 */
	isOpen: boolean;

	label: string;

	readonly numberOfChildren: number;

	/**
	 * @since 11.0
	 */
	readonly parent: PDFOutline;

	childAtIndex(index: number): PDFOutline;

	/**
	 * @since 11.0
	 */
	insertChildAtIndex(child: PDFOutline, index: number): void;

	/**
	 * @since 11.0
	 */
	removeFromParent(): void;
}

/**
 * @since 11.0
 */
declare class PDFPage extends NSObject implements NSCopying {

	static alloc(): PDFPage; // inherited from NSObject

	static new(): PDFPage; // inherited from NSObject

	readonly annotations: NSArray<PDFAnnotation>;

	readonly attributedString: NSAttributedString;

	readonly dataRepresentation: NSData;

	displaysAnnotations: boolean;

	readonly document: PDFDocument;

	readonly label: string;

	readonly numberOfCharacters: number;

	readonly pageRef: any;

	rotation: number;

	readonly string: string;

	/**
	 * @since 11.0
	 */
	constructor(o: { image: UIImage; });

	/**
	 * @since 16.0
	 */
	constructor(o: { image: UIImage; options: NSDictionary<string, any>; });

	addAnnotation(annotation: PDFAnnotation): void;

	annotationAtPoint(point: CGPoint): PDFAnnotation;

	boundsForBox(box: PDFDisplayBox): CGRect;

	characterBoundsAtIndex(index: number): CGRect;

	characterIndexAtPoint(point: CGPoint): number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 11.0
	 */
	drawWithBoxToContext(box: PDFDisplayBox, context: any): void;

	/**
	 * @since 11.0
	 */
	initWithImage(image: UIImage): this;

	/**
	 * @since 16.0
	 */
	initWithImageOptions(image: UIImage, options: NSDictionary<string, any>): this;

	removeAnnotation(annotation: PDFAnnotation): void;

	selectionForLineAtPoint(point: CGPoint): PDFSelection;

	selectionForRange(range: NSRange): PDFSelection;

	selectionForRect(rect: CGRect): PDFSelection;

	selectionForWordAtPoint(point: CGPoint): PDFSelection;

	selectionFromPointToPoint(startPoint: CGPoint, endPoint: CGPoint): PDFSelection;

	setBoundsForBox(bounds: CGRect, box: PDFDisplayBox): void;

	/**
	 * @since 11.0
	 */
	thumbnailOfSizeForBox(size: CGSize, box: PDFDisplayBox): UIImage;

	/**
	 * @since 11.0
	 */
	transformContextForBox(context: any, box: PDFDisplayBox): void;

	/**
	 * @since 11.0
	 */
	transformForBox(box: PDFDisplayBox): CGAffineTransform;
}

/**
 * @since 16.0
 */
declare var PDFPageImageInitializationOptionCompressionQuality: string;

/**
 * @since 16.0
 */
declare var PDFPageImageInitializationOptionMediaBox: string;

/**
 * @since 16.0
 */
declare var PDFPageImageInitializationOptionRotation: string;

/**
 * @since 16.0
 */
declare var PDFPageImageInitializationOptionUpscaleIfSmaller: string;

/**
 * @since 16.0
 */
interface PDFPageOverlayViewProvider extends NSObjectProtocol {

	pdfViewOverlayViewForPage(view: PDFView, page: PDFPage): UIView;

	pdfViewWillDisplayOverlayViewForPage?(pdfView: PDFView, overlayView: UIView, page: PDFPage): void;

	pdfViewWillEndDisplayingOverlayViewForPage?(pdfView: PDFView, overlayView: UIView, page: PDFPage): void;
}
declare var PDFPageOverlayViewProvider: {

	prototype: PDFPageOverlayViewProvider;
};

/**
 * @since 11.0
 */
declare class PDFSelection extends NSObject implements NSCopying {

	static alloc(): PDFSelection; // inherited from NSObject

	static new(): PDFSelection; // inherited from NSObject

	readonly attributedString: NSAttributedString;

	/**
	 * @since 11.0
	 */
	color: UIColor;

	readonly pages: NSArray<PDFPage>;

	readonly string: string;

	/**
	 * @since 11.0
	 */
	constructor(o: { document: PDFDocument; });

	addSelection(selection: PDFSelection): void;

	/**
	 * @since 11.0
	 */
	addSelections(selections: NSArray<PDFSelection> | PDFSelection[]): void;

	boundsForPage(page: PDFPage): CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawForPageActive(page: PDFPage, active: boolean): void;

	drawForPageWithBoxActive(page: PDFPage, box: PDFDisplayBox, active: boolean): void;

	extendSelectionAtEnd(succeed: number): void;

	extendSelectionAtStart(precede: number): void;

	/**
	 * @since 11.0
	 */
	extendSelectionForLineBoundaries(): void;

	/**
	 * @since 11.0
	 */
	initWithDocument(document: PDFDocument): this;

	/**
	 * @since 11.0
	 */
	numberOfTextRangesOnPage(page: PDFPage): number;

	/**
	 * @since 11.0
	 */
	rangeAtIndexOnPage(index: number, page: PDFPage): NSRange;

	/**
	 * @since 11.0
	 */
	selectionsByLine(): NSArray<PDFSelection>;
}

declare const enum PDFSelectionGranularity {

	Character = 0,

	Word = 1,

	Line = 2
}

declare const enum PDFTextAnnotationIconType {

	kPDFTextAnnotationIconComment = 0,

	kPDFTextAnnotationIconKey = 1,

	kPDFTextAnnotationIconNote = 2,

	kPDFTextAnnotationIconHelp = 3,

	kPDFTextAnnotationIconNewParagraph = 4,

	kPDFTextAnnotationIconParagraph = 5,

	kPDFTextAnnotationIconInsert = 6
}

declare const enum PDFThumbnailLayoutMode {

	Vertical = 0,

	Horizontal = 1
}

/**
 * @since 11.0
 */
declare class PDFThumbnailView extends UIView implements NSCoding {

	static alloc(): PDFThumbnailView; // inherited from NSObject

	static appearance(): PDFThumbnailView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PDFThumbnailView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PDFThumbnailView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFThumbnailView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PDFThumbnailView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFThumbnailView; // inherited from UIAppearance

	static new(): PDFThumbnailView; // inherited from NSObject

	PDFView: PDFView;

	/**
	 * @since 11.0
	 */
	contentInset: UIEdgeInsets;

	/**
	 * @since 11.0
	 */
	layoutMode: PDFThumbnailLayoutMode;

	readonly selectedPages: NSArray<PDFPage>;

	thumbnailSize: CGSize;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare var PDFThumbnailViewDocumentEditedNotification: string;

/**
 * @since 11.0
 */
declare class PDFView extends UIView implements UIFindInteractionDelegate, UIGestureRecognizerDelegate {

	static alloc(): PDFView; // inherited from NSObject

	static appearance(): PDFView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PDFView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PDFView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PDFView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFView; // inherited from UIAppearance

	static new(): PDFView; // inherited from NSObject

	autoScales: boolean;

	readonly canGoBack: boolean;

	readonly canGoForward: boolean;

	readonly canGoToFirstPage: boolean;

	readonly canGoToLastPage: boolean;

	readonly canGoToNextPage: boolean;

	readonly canGoToPreviousPage: boolean;

	readonly canZoomIn: boolean;

	readonly canZoomOut: boolean;

	readonly currentDestination: PDFDestination;

	readonly currentPage: PDFPage;

	currentSelection: PDFSelection;

	delegate: PDFViewDelegate;

	displayBox: PDFDisplayBox;

	/**
	 * @since 11.0
	 */
	displayDirection: PDFDisplayDirection;

	displayMode: PDFDisplayMode;

	displaysAsBook: boolean;

	displaysPageBreaks: boolean;

	/**
	 * @since 11.0
	 */
	displaysRTL: boolean;

	document: PDFDocument;

	readonly documentView: UIView;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	enableDataDetectors: boolean;

	/**
	 * @since 16.0
	 */
	readonly findInteraction: UIFindInteraction;

	/**
	 * @since 16.0
	 */
	findInteractionEnabled: boolean;

	/**
	 * @since 11.0
	 */
	highlightedSelections: NSArray<PDFSelection>;

	/**
	 * @since 16.0
	 */
	inMarkupMode: boolean;

	/**
	 * @since 11.0
	 */
	interpolationQuality: PDFInterpolationQuality;

	/**
	 * @since 11.0
	 */
	readonly isUsingPageViewController: boolean;

	/**
	 * @since 11.0
	 */
	maxScaleFactor: number;

	/**
	 * @since 11.0
	 */
	minScaleFactor: number;

	/**
	 * @since 11.0
	 */
	pageBreakMargins: UIEdgeInsets;

	/**
	 * @since 16.0
	 */
	pageOverlayViewProvider: PDFPageOverlayViewProvider;

	/**
	 * @since 12.0
	 */
	pageShadowsEnabled: boolean;

	scaleFactor: number;

	/**
	 * @since 11.0
	 */
	readonly scaleFactorForSizeToFit: number;

	/**
	 * @since 11.0
	 */
	readonly visiblePages: NSArray<PDFPage>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 11.0
	 */
	annotationsChangedOnPage(page: PDFPage): void;

	areaOfInterestForMouse(event: _UIEvent): PDFAreaOfInterest;

	areaOfInterestForPoint(cursorLocation: CGPoint): PDFAreaOfInterest;

	class(): typeof NSObject;

	clearSelection(): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	convertPointFromPage(point: CGPoint, page: PDFPage): CGPoint;

	convertPointToPage(point: CGPoint, page: PDFPage): CGPoint;

	convertRectFromPage(rect: CGRect, page: PDFPage): CGRect;

	convertRectToPage(rect: CGRect, page: PDFPage): CGRect;

	copy(): void;

	/**
	 * @since 11.0
	 */
	drawPagePostToContext(page: PDFPage, context: any): void;

	/**
	 * @since 11.0
	 */
	drawPageToContext(page: PDFPage, context: any): void;

	findInteractionDidBeginFindSession(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionDidEndFindSession(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionSessionForView(interaction: UIFindInteraction, view: UIView): UIFindSession;

	/**
	 * @since 7.0
	 */
	gestureRecognizerShouldBeRequiredToFailByGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldBegin(gestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 13.4
	 */
	gestureRecognizerShouldReceiveEvent(gestureRecognizer: UIGestureRecognizer, event: _UIEvent): boolean;

	gestureRecognizerShouldReceivePress(gestureRecognizer: UIGestureRecognizer, press: UIPress): boolean;

	gestureRecognizerShouldReceiveTouch(gestureRecognizer: UIGestureRecognizer, touch: UITouch): boolean;

	gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 7.0
	 */
	gestureRecognizerShouldRequireFailureOfGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	goBack(sender: any): void;

	goForward(sender: any): void;

	goToDestination(destination: PDFDestination): void;

	goToFirstPage(sender: any): void;

	goToLastPage(sender: any): void;

	goToNextPage(sender: any): void;

	goToPage(page: PDFPage): void;

	goToPreviousPage(sender: any): void;

	goToRectOnPage(rect: CGRect, page: PDFPage): void;

	goToSelection(selection: PDFSelection): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	layoutDocumentView(): void;

	pageForPointNearest(point: CGPoint, nearest: boolean): PDFPage;

	/**
	 * @since 11.0
	 */
	performAction(action: PDFAction): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	rowSizeForPage(page: PDFPage): CGSize;

	scrollSelectionToVisible(sender: any): void;

	self(): this;

	/**
	 * @since 11.0
	 */
	setCurrentSelectionAnimate(selection: PDFSelection, animate: boolean): void;

	/**
	 * @since 11.0
	 */
	usePageViewControllerWithViewOptions(enable: boolean, viewOptions: NSDictionary<any, any>): void;

	zoomIn(sender: any): void;

	zoomOut(sender: any): void;
}

/**
 * @since 11.0
 */
declare var PDFViewAnnotationHitNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewAnnotationWillHitNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewChangedHistoryNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewCopyPermissionNotification: string;

interface PDFViewDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	PDFViewOpenPDFForRemoteGoToAction?(sender: PDFView, action: PDFActionRemoteGoTo): void;

	/**
	 * @since 13.0
	 */
	PDFViewParentViewController?(): UIViewController;

	/**
	 * @since 11.0
	 */
	PDFViewPerformFind?(sender: PDFView): void;

	/**
	 * @since 11.0
	 */
	PDFViewPerformGoToPage?(sender: PDFView): void;

	/**
	 * @since 11.0
	 */
	PDFViewWillClickOnLinkWithURL?(sender: PDFView, url: NSURL): void;
}
declare var PDFViewDelegate: {

	prototype: PDFViewDelegate;
};

/**
 * @since 11.0
 */
declare var PDFViewDisplayBoxChangedNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewDisplayModeChangedNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewDocumentChangedNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewPageChangedNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewPrintPermissionNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewScaleChangedNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewSelectionChangedNotification: string;

/**
 * @since 11.0
 */
declare var PDFViewVisiblePagesChangedNotification: string;

declare const enum PDFWidgetCellState {

	kPDFWidgetMixedState = -1,

	kPDFWidgetOffState = 0,

	kPDFWidgetOnState = 1
}

declare const enum PDFWidgetControlType {

	kPDFWidgetUnknownControl = -1,

	kPDFWidgetPushButtonControl = 0,

	kPDFWidgetRadioButtonControl = 1,

	kPDFWidgetCheckBoxControl = 2
}

/**
 * @since 11.0
 */
declare var kPDFDestinationUnspecifiedValue: number;
