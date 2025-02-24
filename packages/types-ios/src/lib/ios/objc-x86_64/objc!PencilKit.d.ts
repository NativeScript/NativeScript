
/**
 * @since 13.0
 */
declare var PKAppleDrawingTypeIdentifier: string;

/**
 * @since 13.0
 */
declare class PKCanvasView extends UIScrollView implements PKToolPickerObserver {

	static alloc(): PKCanvasView; // inherited from NSObject

	static appearance(): PKCanvasView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PKCanvasView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKCanvasView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKCanvasView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKCanvasView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKCanvasView; // inherited from UIAppearance

	static new(): PKCanvasView; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	allowsFingerDrawing: boolean;

	delegate: PKCanvasViewDelegate;

	drawing: PKDrawing;

	/**
	 * @since 18.0
	 */
	drawingEnabled: boolean;

	readonly drawingGestureRecognizer: UIGestureRecognizer;

	/**
	 * @since 14.0
	 */
	drawingPolicy: PKCanvasViewDrawingPolicy;

	/**
	 * @since 17.0
	 */
	maximumSupportedContentVersion: PKContentVersion;

	rulerActive: boolean;

	tool: PKTool;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

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

	toolPickerFramesObscuredDidChange(toolPicker: PKToolPicker): void;

	toolPickerIsRulerActiveDidChange(toolPicker: PKToolPicker): void;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	toolPickerSelectedToolDidChange(toolPicker: PKToolPicker): void;

	/**
	 * @since 18.0
	 */
	toolPickerSelectedToolItemDidChange(toolPicker: PKToolPicker): void;

	toolPickerVisibilityDidChange(toolPicker: PKToolPicker): void;
}

/**
 * @since 13.0
 */
interface PKCanvasViewDelegate extends NSObjectProtocol, UIScrollViewDelegate {

	canvasViewDidBeginUsingTool?(canvasView: PKCanvasView): void;

	canvasViewDidEndUsingTool?(canvasView: PKCanvasView): void;

	canvasViewDidFinishRendering?(canvasView: PKCanvasView): void;

	canvasViewDrawingDidChange?(canvasView: PKCanvasView): void;
}
declare var PKCanvasViewDelegate: {

	prototype: PKCanvasViewDelegate;
};

declare const enum PKCanvasViewDrawingPolicy {

	Default = 0,

	AnyInput = 1,

	PencilOnly = 2
}

declare const enum PKContentVersion {

	Version1 = 1,

	Version2 = 2,

	Version3 = 3,

	VersionLatest = 3
}

/**
 * @since 13.0
 */
declare class PKDrawing extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PKDrawing; // inherited from NSObject

	static new(): PKDrawing; // inherited from NSObject

	readonly bounds: CGRect;

	/**
	 * @since 17.0
	 */
	readonly requiredContentVersion: PKContentVersion;

	/**
	 * @since 14.0
	 */
	readonly strokes: NSArray<PKStroke>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { data: NSData; });

	/**
	 * @since 14.0
	 */
	constructor(o: { strokes: NSArray<PKStroke> | PKStroke[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dataRepresentation(): NSData;

	drawingByAppendingDrawing(drawing: PKDrawing): PKDrawing;

	/**
	 * @since 14.0
	 */
	drawingByAppendingStrokes(strokes: NSArray<PKStroke> | PKStroke[]): PKDrawing;

	drawingByApplyingTransform(transform: CGAffineTransform): PKDrawing;

	encodeWithCoder(coder: NSCoder): void;

	imageFromRectScale(rect: CGRect, scale: number): UIImage;

	initWithCoder(coder: NSCoder): this;

	initWithDataError(data: NSData): this;

	/**
	 * @since 14.0
	 */
	initWithStrokes(strokes: NSArray<PKStroke> | PKStroke[]): this;
}

/**
 * @since 13.0
 */
declare class PKEraserTool extends PKTool {

	static alloc(): PKEraserTool; // inherited from NSObject

	/**
	 * @since 16.4
	 */
	static defaultWidthForEraserType(eraserType: PKEraserType): number;

	/**
	 * @since 16.4
	 */
	static maximumWidthForEraserType(eraserType: PKEraserType): number;

	/**
	 * @since 16.4
	 */
	static minimumWidthForEraserType(eraserType: PKEraserType): number;

	static new(): PKEraserTool; // inherited from NSObject

	readonly eraserType: PKEraserType;

	/**
	 * @since 16.4
	 */
	readonly width: number;

	constructor(o: { eraserType: PKEraserType; });

	/**
	 * @since 16.4
	 */
	constructor(o: { eraserType: PKEraserType; width: number; });

	initWithEraserType(eraserType: PKEraserType): this;

	/**
	 * @since 16.4
	 */
	initWithEraserTypeWidth(eraserType: PKEraserType, width: number): this;
}

declare const enum PKEraserType {

	Vector = 0,

	Bitmap = 1,

	FixedWidthBitmap = 2
}

/**
 * @since 14.0
 */
declare class PKFloatRange extends NSObject implements NSCopying {

	static alloc(): PKFloatRange; // inherited from NSObject

	static new(): PKFloatRange; // inherited from NSObject

	readonly lowerBound: number;

	readonly upperBound: number;

	constructor(o: { lowerBound: number; upperBound: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithLowerBoundUpperBound(lowerBound: number, upperBound: number): this;
}

/**
 * @since 14.0
 */
declare class PKInk extends NSObject implements NSCopying {

	static alloc(): PKInk; // inherited from NSObject

	static new(): PKInk; // inherited from NSObject

	readonly color: UIColor;

	readonly inkType: string;

	/**
	 * @since 17.0
	 */
	readonly requiredContentVersion: PKContentVersion;

	constructor(o: { inkType: string; color: UIColor; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithInkTypeColor(type: string, color: UIColor): this;
}

/**
 * @since 17.0
 */
declare var PKInkTypeCrayon: string;

/**
 * @since 17.0
 */
declare var PKInkTypeFountainPen: string;

/**
 * @since 13.0
 */
declare var PKInkTypeMarker: string;

/**
 * @since 17.0
 */
declare var PKInkTypeMonoline: string;

/**
 * @since 13.0
 */
declare var PKInkTypePen: string;

/**
 * @since 13.0
 */
declare var PKInkTypePencil: string;

/**
 * @since 17.0
 */
declare var PKInkTypeWatercolor: string;

/**
 * @since 13.0
 */
declare class PKInkingTool extends PKTool {

	static alloc(): PKInkingTool; // inherited from NSObject

	static convertColorFromUserInterfaceStyleTo(color: UIColor, fromUserInterfaceStyle: UIUserInterfaceStyle, toUserInterfaceStyle: UIUserInterfaceStyle): UIColor;

	static defaultWidthForInkType(inkType: string): number;

	static maximumWidthForInkType(inkType: string): number;

	static minimumWidthForInkType(inkType: string): number;

	static new(): PKInkingTool; // inherited from NSObject

	readonly color: UIColor;

	/**
	 * @since 14.0
	 */
	readonly ink: PKInk;

	readonly inkType: string;

	/**
	 * @since 17.0
	 */
	readonly requiredContentVersion: PKContentVersion;

	readonly width: number;

	constructor(o: { inkType: string; color: UIColor; });

	constructor(o: { inkType: string; color: UIColor; width: number; });

	/**
	 * @since 14.0
	 */
	constructor(o: { ink: PKInk; width: number; });

	initWithInkTypeColor(type: string, color: UIColor): this;

	initWithInkTypeColorWidth(type: string, color: UIColor, width: number): this;

	/**
	 * @since 14.0
	 */
	initWithInkWidth(ink: PKInk, width: number): this;
}

/**
 * @since 13.0
 */
declare class PKLassoTool extends PKTool {

	static alloc(): PKLassoTool; // inherited from NSObject

	static new(): PKLassoTool; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class PKStroke extends NSObject implements NSCopying {

	static alloc(): PKStroke; // inherited from NSObject

	static new(): PKStroke; // inherited from NSObject

	readonly ink: PKInk;

	readonly mask: UIBezierPath;

	readonly maskedPathRanges: NSArray<PKFloatRange>;

	readonly path: PKStrokePath;

	/**
	 * @since 16.0
	 */
	readonly randomSeed: number;

	readonly renderBounds: CGRect;

	/**
	 * @since 17.0
	 */
	readonly requiredContentVersion: PKContentVersion;

	readonly transform: CGAffineTransform;

	constructor(o: { ink: PKInk; strokePath: PKStrokePath; transform: CGAffineTransform; mask: UIBezierPath; });

	/**
	 * @since 16.0
	 */
	constructor(o: { ink: PKInk; strokePath: PKStrokePath; transform: CGAffineTransform; mask: UIBezierPath; randomSeed: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithInkStrokePathTransformMask(ink: PKInk, strokePath: PKStrokePath, transform: CGAffineTransform, mask: UIBezierPath): this;

	/**
	 * @since 16.0
	 */
	initWithInkStrokePathTransformMaskRandomSeed(ink: PKInk, strokePath: PKStrokePath, transform: CGAffineTransform, mask: UIBezierPath, randomSeed: number): this;
}

/**
 * @since 14.0
 */
declare class PKStrokePath extends NSObject implements NSCopying {

	static alloc(): PKStrokePath; // inherited from NSObject

	static new(): PKStrokePath; // inherited from NSObject

	readonly count: number;

	readonly creationDate: Date;
	[index: number]: PKStrokePoint;

	constructor(o: { controlPoints: NSArray<PKStrokePoint> | PKStrokePoint[]; creationDate: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	enumerateInterpolatedPointsInRangeStrideByDistanceUsingBlock(range: PKFloatRange, distanceStep: number, block: (p1: PKStrokePoint, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateInterpolatedPointsInRangeStrideByParametricStepUsingBlock(range: PKFloatRange, parametricStep: number, block: (p1: PKStrokePoint, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateInterpolatedPointsInRangeStrideByTimeUsingBlock(range: PKFloatRange, timeStep: number, block: (p1: PKStrokePoint, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	initWithControlPointsCreationDate(controlPoints: NSArray<PKStrokePoint> | PKStrokePoint[], creationDate: Date): this;

	interpolatedLocationAt(parametricValue: number): CGPoint;

	interpolatedPointAt(parametricValue: number): PKStrokePoint;

	objectAtIndexedSubscript(i: number): PKStrokePoint;

	parametricValueOffsetByDistance(parametricValue: number, distanceStep: number): number;

	parametricValueOffsetByTime(parametricValue: number, timeStep: number): number;

	pointAtIndex(i: number): PKStrokePoint;
}

/**
 * @since 14.0
 */
declare class PKStrokePoint extends NSObject implements NSCopying {

	static alloc(): PKStrokePoint; // inherited from NSObject

	static new(): PKStrokePoint; // inherited from NSObject

	readonly altitude: number;

	readonly azimuth: number;

	readonly force: number;

	readonly location: CGPoint;

	readonly opacity: number;

	/**
	 * @since 17.0
	 */
	readonly secondaryScale: number;

	readonly size: CGSize;

	readonly timeOffset: number;

	constructor(o: { location: CGPoint; timeOffset: number; size: CGSize; opacity: number; force: number; azimuth: number; altitude: number; });

	constructor(o: { location: CGPoint; timeOffset: number; size: CGSize; opacity: number; force: number; azimuth: number; altitude: number; secondaryScale: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithLocationTimeOffsetSizeOpacityForceAzimuthAltitude(location: CGPoint, timeOffset: number, size: CGSize, opacity: number, force: number, azimuth: number, altitude: number): this;

	initWithLocationTimeOffsetSizeOpacityForceAzimuthAltitudeSecondaryScale(location: CGPoint, timeOffset: number, size: CGSize, opacity: number, force: number, azimuth: number, altitude: number, secondaryScale: number): this;
}

/**
 * @since 13.0
 */
declare class PKTool extends NSObject implements NSCopying {

	static alloc(): PKTool; // inherited from NSObject

	static new(): PKTool; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class PKToolPicker extends NSObject {

	static alloc(): PKToolPicker; // inherited from NSObject

	static new(): PKToolPicker; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	static sharedToolPickerForWindow(window: UIWindow): PKToolPicker;

	/**
	 * @since 18.0
	 */
	accessoryItem: UIBarButtonItem;

	colorUserInterfaceStyle: UIUserInterfaceStyle;

	/**
	 * @since 18.0
	 */
	delegate: PKToolPickerDelegate;

	readonly isVisible: boolean;

	/**
	 * @since 17.0
	 */
	maximumSupportedContentVersion: PKContentVersion;

	overrideUserInterfaceStyle: UIUserInterfaceStyle;

	rulerActive: boolean;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	selectedTool: PKTool;

	/**
	 * @since 18.0
	 */
	selectedToolItem: PKToolPickerItem;

	/**
	 * @since 18.0
	 */
	selectedToolItemIdentifier: string;

	/**
	 * @since 14.0
	 */
	showsDrawingPolicyControls: boolean;

	/**
	 * @since 14.0
	 */
	stateAutosaveName: string;

	/**
	 * @since 18.0
	 */
	readonly toolItems: NSArray<PKToolPickerItem>;

	/**
	 * @since 18.0
	 */
	constructor(o: { toolItems: NSArray<PKToolPickerItem> | PKToolPickerItem[]; });

	addObserver(observer: PKToolPickerObserver): void;

	frameObscuredInView(view: UIView): CGRect;

	/**
	 * @since 18.0
	 */
	initWithToolItems(items: NSArray<PKToolPickerItem> | PKToolPickerItem[]): this;

	removeObserver(observer: PKToolPickerObserver): void;

	setVisibleForFirstResponder(visible: boolean, responder: UIResponder): void;
}

/**
 * @since 18.0
 */
declare class PKToolPickerCustomItem extends PKToolPickerItem {

	static alloc(): PKToolPickerCustomItem; // inherited from NSObject

	static new(): PKToolPickerCustomItem; // inherited from NSObject

	allowsColorSelection: boolean;

	color: UIColor;

	readonly configuration: PKToolPickerCustomItemConfiguration;

	width: number;

	constructor(o: { configuration: PKToolPickerCustomItemConfiguration; });

	initWithConfiguration(configuration: PKToolPickerCustomItemConfiguration): this;

	reloadImage(): void;
}

/**
 * @since 18.0
 */
declare class PKToolPickerCustomItemConfiguration extends NSObject implements NSCopying {

	static alloc(): PKToolPickerCustomItemConfiguration; // inherited from NSObject

	static new(): PKToolPickerCustomItemConfiguration; // inherited from NSObject

	allowsColorSelection: boolean;

	defaultColor: UIColor;

	defaultWidth: number;

	identifier: string;

	imageProvider: (p1: PKToolPickerCustomItem) => UIImage;

	name: string;

	toolAttributeControls: PKToolPickerCustomItemControlOptions;

	viewControllerProvider: (p1: PKToolPickerCustomItem) => UIViewController;

	widthVariants: NSDictionary<number, UIImage>;

	constructor(o: { identifier: string; name: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithIdentifierName(identifier: string, name: string): this;
}

declare const enum PKToolPickerCustomItemControlOptions {

	None = 0,

	Width = 1,

	Opacity = 2
}

/**
 * @since 18.0
 */
interface PKToolPickerDelegate extends NSObjectProtocol {
}
declare var PKToolPickerDelegate: {

	prototype: PKToolPickerDelegate;
};

/**
 * @since 18.0
 */
declare class PKToolPickerEraserItem extends PKToolPickerItem {

	static alloc(): PKToolPickerEraserItem; // inherited from NSObject

	static new(): PKToolPickerEraserItem; // inherited from NSObject

	readonly eraserTool: PKEraserTool;

	constructor(o: { eraserType: PKEraserType; });

	constructor(o: { eraserType: PKEraserType; width: number; });

	initWithEraserType(eraserType: PKEraserType): this;

	initWithEraserTypeWidth(eraserType: PKEraserType, width: number): this;
}

/**
 * @since 18.0
 */
declare class PKToolPickerInkingItem extends PKToolPickerItem {

	static alloc(): PKToolPickerInkingItem; // inherited from NSObject

	static new(): PKToolPickerInkingItem; // inherited from NSObject

	allowsColorSelection: boolean;

	readonly inkingTool: PKInkingTool;

	constructor(o: { inkType: string; });

	constructor(o: { inkType: string; color: UIColor; });

	constructor(o: { inkType: string; color: UIColor; width: number; });

	constructor(o: { inkType: string; color: UIColor; width: number; identifier: string; });

	constructor(o: { inkType: string; width: number; });

	initWithInkType(inkType: string): this;

	initWithInkTypeColor(inkType: string, color: UIColor): this;

	initWithInkTypeColorWidth(inkType: string, color: UIColor, width: number): this;

	initWithInkTypeColorWidthIdentifier(inkType: string, color: UIColor, width: number, identifier: string): this;

	initWithInkTypeWidth(inkType: string, width: number): this;
}

/**
 * @since 18.0
 */
declare class PKToolPickerItem extends NSObject implements NSCopying {

	static alloc(): PKToolPickerItem; // inherited from NSObject

	static new(): PKToolPickerItem; // inherited from NSObject

	readonly identifier: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare class PKToolPickerLassoItem extends PKToolPickerItem {

	static alloc(): PKToolPickerLassoItem; // inherited from NSObject

	static new(): PKToolPickerLassoItem; // inherited from NSObject

	readonly lassoTool: PKLassoTool;
}

/**
 * @since 13.0
 */
interface PKToolPickerObserver extends NSObjectProtocol {

	toolPickerFramesObscuredDidChange?(toolPicker: PKToolPicker): void;

	toolPickerIsRulerActiveDidChange?(toolPicker: PKToolPicker): void;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	toolPickerSelectedToolDidChange?(toolPicker: PKToolPicker): void;

	/**
	 * @since 18.0
	 */
	toolPickerSelectedToolItemDidChange?(toolPicker: PKToolPicker): void;

	toolPickerVisibilityDidChange?(toolPicker: PKToolPicker): void;
}
declare var PKToolPickerObserver: {

	prototype: PKToolPickerObserver;
};

/**
 * @since 18.0
 */
declare class PKToolPickerRulerItem extends PKToolPickerItem {

	static alloc(): PKToolPickerRulerItem; // inherited from NSObject

	static new(): PKToolPickerRulerItem; // inherited from NSObject
}

/**
 * @since 18.0
 */
declare class PKToolPickerScribbleItem extends PKToolPickerItem {

	static alloc(): PKToolPickerScribbleItem; // inherited from NSObject

	static new(): PKToolPickerScribbleItem; // inherited from NSObject
}
