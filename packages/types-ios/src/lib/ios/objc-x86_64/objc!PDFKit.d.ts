
declare class PDFAction extends NSObject implements NSCopying {

	static alloc(): PDFAction; // inherited from NSObject

	static new(): PDFAction; // inherited from NSObject

	readonly type: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class PDFActionGoTo extends PDFAction implements NSCopying {

	static alloc(): PDFActionGoTo; // inherited from NSObject

	static new(): PDFActionGoTo; // inherited from NSObject

	destination: PDFDestination;

	constructor(o: { destination: PDFDestination; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithDestination(destination: PDFDestination): this;
}

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

declare class PDFActionResetForm extends PDFAction implements NSCopying {

	static alloc(): PDFActionResetForm; // inherited from NSObject

	static new(): PDFActionResetForm; // inherited from NSObject

	fields: NSArray<string>;

	fieldsIncludedAreCleared: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class PDFActionURL extends PDFAction implements NSCopying {

	static alloc(): PDFActionURL; // inherited from NSObject

	static new(): PDFActionURL; // inherited from NSObject

	URL: NSURL;

	constructor(o: { URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithURL(url: NSURL): this;
}

declare class PDFAnnotation extends NSObject implements NSCoding, NSCopying {

	static alloc(): PDFAnnotation; // inherited from NSObject

	static lineStyleFromName(name: string): PDFLineStyle;

	static nameForLineStyle(style: PDFLineStyle): string;

	static new(): PDFAnnotation; // inherited from NSObject

	URL: NSURL;

	action: PDFAction;

	alignment: NSTextAlignment;

	allowsToggleToOff: boolean;

	readonly annotationKeyValues: NSDictionary<any, any>;

	backgroundColor: UIColor;

	border: PDFBorder;

	bounds: CGRect;

	buttonWidgetState: PDFWidgetCellState;

	buttonWidgetStateString: string;

	caption: string;

	choices: NSArray<string>;

	color: UIColor;

	comb: boolean;

	contents: string;

	destination: PDFDestination;

	endLineStyle: PDFLineStyle;

	endPoint: CGPoint;

	fieldName: string;

	font: UIFont;

	fontColor: UIColor;

	readonly hasAppearanceStream: boolean;

	highlighted: boolean;

	iconType: PDFTextAnnotationIconType;

	interiorColor: UIColor;

	readonly isPasswordField: boolean;

	listChoice: boolean;

	markupType: PDFMarkupType;

	maximumLength: number;

	modificationDate: Date;

	multiline: boolean;

	open: boolean;

	page: PDFPage;

	readonly paths: NSArray<UIBezierPath>;

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

	userName: string;

	values: NSArray<string>;

	widgetControlType: PDFWidgetControlType;

	widgetDefaultStringValue: string;

	widgetFieldType: string;

	widgetStringValue: string;

	constructor(o: { bounds: CGRect; forType: string; withProperties: NSDictionary<any, any>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addBezierPath(path: UIBezierPath): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawWithBoxInContext(box: PDFDisplayBox, context: any): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithBoundsForTypeWithProperties(bounds: CGRect, annotationType: string, properties: NSDictionary<any, any>): this;

	initWithCoder(coder: NSCoder): this;

	removeBezierPath(path: UIBezierPath): void;

	removeValueForAnnotationKey(key: string): void;

	setBooleanForAnnotationKey(value: boolean, key: string): boolean;

	setRectForAnnotationKey(value: CGRect, key: string): boolean;

	setValueForAnnotationKey(value: any, key: string): boolean;

	valueForAnnotationKey(key: string): any;
}

declare var PDFAnnotationHighlightingModeInvert: string;

declare var PDFAnnotationHighlightingModeNone: string;

declare var PDFAnnotationHighlightingModeOutline: string;

declare var PDFAnnotationHighlightingModePush: string;

declare var PDFAnnotationKeyAction: string;

declare var PDFAnnotationKeyAdditionalActions: string;

declare var PDFAnnotationKeyAppearanceDictionary: string;

declare var PDFAnnotationKeyAppearanceState: string;

declare var PDFAnnotationKeyBorder: string;

declare var PDFAnnotationKeyBorderStyle: string;

declare var PDFAnnotationKeyColor: string;

declare var PDFAnnotationKeyContents: string;

declare var PDFAnnotationKeyDate: string;

declare var PDFAnnotationKeyDefaultAppearance: string;

declare var PDFAnnotationKeyDestination: string;

declare var PDFAnnotationKeyFlags: string;

declare var PDFAnnotationKeyHighlightingMode: string;

declare var PDFAnnotationKeyIconName: string;

declare var PDFAnnotationKeyInklist: string;

declare var PDFAnnotationKeyInteriorColor: string;

declare var PDFAnnotationKeyLineEndingStyles: string;

declare var PDFAnnotationKeyLinePoints: string;

declare var PDFAnnotationKeyName: string;

declare var PDFAnnotationKeyOpen: string;

declare var PDFAnnotationKeyPage: string;

declare var PDFAnnotationKeyParent: string;

declare var PDFAnnotationKeyPopup: string;

declare var PDFAnnotationKeyQuadPoints: string;

declare var PDFAnnotationKeyQuadding: string;

declare var PDFAnnotationKeyRect: string;

declare var PDFAnnotationKeySubtype: string;

declare var PDFAnnotationKeyTextLabel: string;

declare var PDFAnnotationKeyWidgetAppearanceDictionary: string;

declare var PDFAnnotationKeyWidgetBackgroundColor: string;

declare var PDFAnnotationKeyWidgetBorderColor: string;

declare var PDFAnnotationKeyWidgetCaption: string;

declare var PDFAnnotationKeyWidgetDefaultValue: string;

declare var PDFAnnotationKeyWidgetDownCaption: string;

declare var PDFAnnotationKeyWidgetFieldFlags: string;

declare var PDFAnnotationKeyWidgetFieldType: string;

declare var PDFAnnotationKeyWidgetMaxLen: string;

declare var PDFAnnotationKeyWidgetOptions: string;

declare var PDFAnnotationKeyWidgetRolloverCaption: string;

declare var PDFAnnotationKeyWidgetRotation: string;

declare var PDFAnnotationKeyWidgetTextLabelUI: string;

declare var PDFAnnotationKeyWidgetValue: string;

declare var PDFAnnotationLineEndingStyleCircle: string;

declare var PDFAnnotationLineEndingStyleClosedArrow: string;

declare var PDFAnnotationLineEndingStyleDiamond: string;

declare var PDFAnnotationLineEndingStyleNone: string;

declare var PDFAnnotationLineEndingStyleOpenArrow: string;

declare var PDFAnnotationLineEndingStyleSquare: string;

declare var PDFAnnotationSubtypeCircle: string;

declare var PDFAnnotationSubtypeFreeText: string;

declare var PDFAnnotationSubtypeHighlight: string;

declare var PDFAnnotationSubtypeInk: string;

declare var PDFAnnotationSubtypeLine: string;

declare var PDFAnnotationSubtypeLink: string;

declare var PDFAnnotationSubtypePopup: string;

declare var PDFAnnotationSubtypeSquare: string;

declare var PDFAnnotationSubtypeStamp: string;

declare var PDFAnnotationSubtypeStrikeOut: string;

declare var PDFAnnotationSubtypeText: string;

declare var PDFAnnotationSubtypeUnderline: string;

declare var PDFAnnotationSubtypeWidget: string;

declare var PDFAnnotationTextIconTypeComment: string;

declare var PDFAnnotationTextIconTypeHelp: string;

declare var PDFAnnotationTextIconTypeInsert: string;

declare var PDFAnnotationTextIconTypeKey: string;

declare var PDFAnnotationTextIconTypeNewParagraph: string;

declare var PDFAnnotationTextIconTypeNote: string;

declare var PDFAnnotationTextIconTypeParagraph: string;

declare var PDFAnnotationWidgetSubtypeButton: string;

declare var PDFAnnotationWidgetSubtypeChoice: string;

declare var PDFAnnotationWidgetSubtypeSignature: string;

declare var PDFAnnotationWidgetSubtypeText: string;

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

declare var PDFAppearanceCharacteristicsKeyBackgroundColor: string;

declare var PDFAppearanceCharacteristicsKeyBorderColor: string;

declare var PDFAppearanceCharacteristicsKeyCaption: string;

declare var PDFAppearanceCharacteristicsKeyDownCaption: string;

declare var PDFAppearanceCharacteristicsKeyRolloverCaption: string;

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

	kPDFImageArea = 256
}

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

declare var PDFBorderKeyDashPattern: string;

declare var PDFBorderKeyLineWidth: string;

declare var PDFBorderKeyStyle: string;

declare const enum PDFBorderStyle {

	kPDFBorderStyleSolid = 0,

	kPDFBorderStyleDashed = 1,

	kPDFBorderStyleBeveled = 2,

	kPDFBorderStyleInset = 3,

	kPDFBorderStyleUnderline = 4
}

declare class PDFDestination extends NSObject implements NSCopying {

	static alloc(): PDFDestination; // inherited from NSObject

	static new(): PDFDestination; // inherited from NSObject

	readonly page: PDFPage;

	readonly point: CGPoint;

	zoom: number;

	constructor(o: { page: PDFPage; atPoint: CGPoint; });

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

declare class PDFDocument extends NSObject implements NSCopying {

	static alloc(): PDFDocument; // inherited from NSObject

	static new(): PDFDocument; // inherited from NSObject

	readonly allowsCommenting: boolean;

	readonly allowsContentAccessibility: boolean;

	readonly allowsCopying: boolean;

	readonly allowsDocumentAssembly: boolean;

	readonly allowsDocumentChanges: boolean;

	readonly allowsFormFieldEntry: boolean;

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

	outlineRoot: PDFOutline;

	readonly pageClass: typeof NSObject;

	readonly pageCount: number;

	readonly permissionsStatus: PDFDocumentPermissions;

	readonly selectionForEntireDocument: PDFSelection;

	readonly string: string;

	constructor(o: { data: NSData; });

	constructor(o: { URL: NSURL; });

	beginFindStringWithOptions(string: string, options: NSStringCompareOptions): void;

	beginFindStringsWithOptions(strings: NSArray<string> | string[], options: NSStringCompareOptions): void;

	cancelFindString(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dataRepresentation(): NSData;

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

	unlockWithPassword(password: string): boolean;

	writeToFile(path: string): boolean;

	writeToFileWithOptions(path: string, options: NSDictionary<string, any>): boolean;

	writeToURL(url: NSURL): boolean;

	writeToURLWithOptions(url: NSURL, options: NSDictionary<string, any>): boolean;
}

declare var PDFDocumentAuthorAttribute: string;

declare var PDFDocumentCreationDateAttribute: string;

declare var PDFDocumentCreatorAttribute: string;

interface PDFDocumentDelegate extends NSObjectProtocol {

	classForAnnotationType?(annotationType: string): typeof NSObject;

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

declare var PDFDocumentDidBeginFindNotification: string;

declare var PDFDocumentDidBeginPageFindNotification: string;

declare var PDFDocumentDidBeginPageWriteNotification: string;

declare var PDFDocumentDidBeginWriteNotification: string;

declare var PDFDocumentDidEndFindNotification: string;

declare var PDFDocumentDidEndPageFindNotification: string;

declare var PDFDocumentDidEndPageWriteNotification: string;

declare var PDFDocumentDidEndWriteNotification: string;

declare var PDFDocumentDidFindMatchNotification: string;

declare var PDFDocumentDidUnlockNotification: string;

declare var PDFDocumentKeywordsAttribute: string;

declare var PDFDocumentModificationDateAttribute: string;

declare var PDFDocumentOwnerPasswordOption: string;

declare const enum PDFDocumentPermissions {

	kPDFDocumentPermissionsNone = 0,

	kPDFDocumentPermissionsUser = 1,

	kPDFDocumentPermissionsOwner = 2
}

declare var PDFDocumentProducerAttribute: string;

declare var PDFDocumentSubjectAttribute: string;

declare var PDFDocumentTitleAttribute: string;

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

	kPDFMarkupTypeUnderline = 2
}

declare class PDFOutline extends NSObject {

	static alloc(): PDFOutline; // inherited from NSObject

	static new(): PDFOutline; // inherited from NSObject

	action: PDFAction;

	destination: PDFDestination;

	readonly document: PDFDocument;

	readonly index: number;

	isOpen: boolean;

	label: string;

	readonly numberOfChildren: number;

	readonly parent: PDFOutline;

	childAtIndex(index: number): PDFOutline;

	insertChildAtIndex(child: PDFOutline, index: number): void;

	removeFromParent(): void;
}

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

	constructor(o: { image: UIImage; });

	addAnnotation(annotation: PDFAnnotation): void;

	annotationAtPoint(point: CGPoint): PDFAnnotation;

	boundsForBox(box: PDFDisplayBox): CGRect;

	characterBoundsAtIndex(index: number): CGRect;

	characterIndexAtPoint(point: CGPoint): number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawWithBoxToContext(box: PDFDisplayBox, context: any): void;

	initWithImage(image: UIImage): this;

	removeAnnotation(annotation: PDFAnnotation): void;

	selectionForLineAtPoint(point: CGPoint): PDFSelection;

	selectionForRange(range: NSRange): PDFSelection;

	selectionForRect(rect: CGRect): PDFSelection;

	selectionForWordAtPoint(point: CGPoint): PDFSelection;

	selectionFromPointToPoint(startPoint: CGPoint, endPoint: CGPoint): PDFSelection;

	setBoundsForBox(bounds: CGRect, box: PDFDisplayBox): void;

	thumbnailOfSizeForBox(size: CGSize, box: PDFDisplayBox): UIImage;

	transformContextForBox(context: any, box: PDFDisplayBox): void;

	transformForBox(box: PDFDisplayBox): CGAffineTransform;
}

declare class PDFSelection extends NSObject implements NSCopying {

	static alloc(): PDFSelection; // inherited from NSObject

	static new(): PDFSelection; // inherited from NSObject

	readonly attributedString: NSAttributedString;

	color: UIColor;

	readonly pages: NSArray<PDFPage>;

	readonly string: string;

	constructor(o: { document: PDFDocument; });

	addSelection(selection: PDFSelection): void;

	addSelections(selections: NSArray<PDFSelection> | PDFSelection[]): void;

	boundsForPage(page: PDFPage): CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawForPageActive(page: PDFPage, active: boolean): void;

	drawForPageWithBoxActive(page: PDFPage, box: PDFDisplayBox, active: boolean): void;

	extendSelectionAtEnd(succeed: number): void;

	extendSelectionAtStart(precede: number): void;

	extendSelectionForLineBoundaries(): void;

	initWithDocument(document: PDFDocument): this;

	numberOfTextRangesOnPage(page: PDFPage): number;

	rangeAtIndexOnPage(index: number, page: PDFPage): NSRange;

	selectionsByLine(): NSArray<PDFSelection>;
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

declare class PDFThumbnailView extends UIView implements NSCoding {

	static alloc(): PDFThumbnailView; // inherited from NSObject

	static appearance(): PDFThumbnailView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PDFThumbnailView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PDFThumbnailView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFThumbnailView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PDFThumbnailView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFThumbnailView; // inherited from UIAppearance

	static new(): PDFThumbnailView; // inherited from NSObject

	PDFView: PDFView;

	contentInset: UIEdgeInsets;

	layoutMode: PDFThumbnailLayoutMode;

	readonly selectedPages: NSArray<PDFPage>;

	thumbnailSize: CGSize;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var PDFThumbnailViewDocumentEditedNotification: string;

declare class PDFView extends UIView implements UIGestureRecognizerDelegate {

	static alloc(): PDFView; // inherited from NSObject

	static appearance(): PDFView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PDFView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PDFView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PDFView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PDFView; // inherited from UIAppearance

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

	displayDirection: PDFDisplayDirection;

	displayMode: PDFDisplayMode;

	displaysAsBook: boolean;

	displaysPageBreaks: boolean;

	displaysRTL: boolean;

	document: PDFDocument;

	readonly documentView: UIView;

	enableDataDetectors: boolean;

	highlightedSelections: NSArray<PDFSelection>;

	interpolationQuality: PDFInterpolationQuality;

	readonly isUsingPageViewController: boolean;

	maxScaleFactor: number;

	minScaleFactor: number;

	pageBreakMargins: UIEdgeInsets;

	pageShadowsEnabled: boolean;

	scaleFactor: number;

	readonly scaleFactorForSizeToFit: number;

	readonly visiblePages: NSArray<PDFPage>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

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

	drawPagePostToContext(page: PDFPage, context: any): void;

	drawPageToContext(page: PDFPage, context: any): void;

	gestureRecognizerShouldBeRequiredToFailByGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldBegin(gestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldReceivePress(gestureRecognizer: UIGestureRecognizer, press: UIPress): boolean;

	gestureRecognizerShouldReceiveTouch(gestureRecognizer: UIGestureRecognizer, touch: UITouch): boolean;

	gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

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

	performAction(action: PDFAction): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	rowSizeForPage(page: PDFPage): CGSize;

	scrollSelectionToVisible(sender: any): void;

	self(): this;

	setCurrentSelectionAnimate(selection: PDFSelection, animate: boolean): void;

	usePageViewControllerWithViewOptions(enable: boolean, viewOptions: NSDictionary<any, any>): void;

	zoomIn(sender: any): void;

	zoomOut(sender: any): void;
}

declare var PDFViewAnnotationHitNotification: string;

declare var PDFViewAnnotationWillHitNotification: string;

declare var PDFViewChangedHistoryNotification: string;

declare var PDFViewCopyPermissionNotification: string;

interface PDFViewDelegate extends NSObjectProtocol {

	PDFViewOpenPDFForRemoteGoToAction?(sender: PDFView, action: PDFActionRemoteGoTo): void;

	PDFViewParentViewController?(): UIViewController;

	PDFViewPerformFind?(sender: PDFView): void;

	PDFViewPerformGoToPage?(sender: PDFView): void;

	PDFViewWillClickOnLinkWithURL?(sender: PDFView, url: NSURL): void;
}
declare var PDFViewDelegate: {

	prototype: PDFViewDelegate;
};

declare var PDFViewDisplayBoxChangedNotification: string;

declare var PDFViewDisplayModeChangedNotification: string;

declare var PDFViewDocumentChangedNotification: string;

declare var PDFViewPageChangedNotification: string;

declare var PDFViewPrintPermissionNotification: string;

declare var PDFViewScaleChangedNotification: string;

declare var PDFViewSelectionChangedNotification: string;

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

declare var kPDFDestinationUnspecifiedValue: number;
