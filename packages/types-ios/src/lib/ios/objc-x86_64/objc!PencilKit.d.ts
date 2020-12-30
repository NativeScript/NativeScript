
declare var PKAppleDrawingTypeIdentifier: string;

declare class PKCanvasView extends UIScrollView implements PKToolPickerObserver {

	static alloc(): PKCanvasView; // inherited from NSObject

	static appearance(): PKCanvasView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PKCanvasView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKCanvasView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKCanvasView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKCanvasView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKCanvasView; // inherited from UIAppearance

	static new(): PKCanvasView; // inherited from NSObject

	allowsFingerDrawing: boolean;

	delegate: PKCanvasViewDelegate;

	drawing: PKDrawing;

	readonly drawingGestureRecognizer: UIGestureRecognizer;

	drawingPolicy: PKCanvasViewDrawingPolicy;

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

	toolPickerSelectedToolDidChange(toolPicker: PKToolPicker): void;

	toolPickerVisibilityDidChange(toolPicker: PKToolPicker): void;
}

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

declare class PKDrawing extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PKDrawing; // inherited from NSObject

	static new(): PKDrawing; // inherited from NSObject

	readonly bounds: CGRect;

	readonly strokes: NSArray<PKStroke>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { data: NSData; });

	constructor(o: { strokes: NSArray<PKStroke> | PKStroke[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dataRepresentation(): NSData;

	drawingByAppendingDrawing(drawing: PKDrawing): PKDrawing;

	drawingByAppendingStrokes(strokes: NSArray<PKStroke> | PKStroke[]): PKDrawing;

	drawingByApplyingTransform(transform: CGAffineTransform): PKDrawing;

	encodeWithCoder(coder: NSCoder): void;

	imageFromRectScale(rect: CGRect, scale: number): UIImage;

	initWithCoder(coder: NSCoder): this;

	initWithDataError(data: NSData): this;

	initWithStrokes(strokes: NSArray<PKStroke> | PKStroke[]): this;
}

declare class PKEraserTool extends PKTool {

	static alloc(): PKEraserTool; // inherited from NSObject

	static new(): PKEraserTool; // inherited from NSObject

	readonly eraserType: PKEraserType;

	constructor(o: { eraserType: PKEraserType; });

	initWithEraserType(eraserType: PKEraserType): this;
}

declare const enum PKEraserType {

	Vector = 0,

	Bitmap = 1
}

declare class PKFloatRange extends NSObject implements NSCopying {

	static alloc(): PKFloatRange; // inherited from NSObject

	static new(): PKFloatRange; // inherited from NSObject

	readonly lowerBound: number;

	readonly upperBound: number;

	constructor(o: { lowerBound: number; upperBound: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithLowerBoundUpperBound(lowerBound: number, upperBound: number): this;
}

declare class PKInk extends NSObject implements NSCopying {

	static alloc(): PKInk; // inherited from NSObject

	static new(): PKInk; // inherited from NSObject

	readonly color: UIColor;

	readonly inkType: string;

	constructor(o: { inkType: string; color: UIColor; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithInkTypeColor(type: string, color: UIColor): this;
}

declare var PKInkTypeMarker: string;

declare var PKInkTypePen: string;

declare var PKInkTypePencil: string;

declare class PKInkingTool extends PKTool {

	static alloc(): PKInkingTool; // inherited from NSObject

	static convertColorFromUserInterfaceStyleTo(color: UIColor, fromUserInterfaceStyle: UIUserInterfaceStyle, toUserInterfaceStyle: UIUserInterfaceStyle): UIColor;

	static defaultWidthForInkType(inkType: string): number;

	static maximumWidthForInkType(inkType: string): number;

	static minimumWidthForInkType(inkType: string): number;

	static new(): PKInkingTool; // inherited from NSObject

	readonly color: UIColor;

	readonly ink: PKInk;

	readonly inkType: string;

	readonly width: number;

	constructor(o: { inkType: string; color: UIColor; });

	constructor(o: { inkType: string; color: UIColor; width: number; });

	constructor(o: { ink: PKInk; width: number; });

	initWithInkTypeColor(type: string, color: UIColor): this;

	initWithInkTypeColorWidth(type: string, color: UIColor, width: number): this;

	initWithInkWidth(ink: PKInk, width: number): this;
}

declare class PKLassoTool extends PKTool {

	static alloc(): PKLassoTool; // inherited from NSObject

	static new(): PKLassoTool; // inherited from NSObject
}

declare class PKStroke extends NSObject implements NSCopying {

	static alloc(): PKStroke; // inherited from NSObject

	static new(): PKStroke; // inherited from NSObject

	readonly ink: PKInk;

	readonly mask: UIBezierPath;

	readonly maskedPathRanges: NSArray<PKFloatRange>;

	readonly path: PKStrokePath;

	readonly renderBounds: CGRect;

	readonly transform: CGAffineTransform;

	constructor(o: { ink: PKInk; strokePath: PKStrokePath; transform: CGAffineTransform; mask: UIBezierPath; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithInkStrokePathTransformMask(ink: PKInk, strokePath: PKStrokePath, transform: CGAffineTransform, mask: UIBezierPath): this;
}

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

declare class PKStrokePoint extends NSObject implements NSCopying {

	static alloc(): PKStrokePoint; // inherited from NSObject

	static new(): PKStrokePoint; // inherited from NSObject

	readonly altitude: number;

	readonly azimuth: number;

	readonly force: number;

	readonly location: CGPoint;

	readonly opacity: number;

	readonly size: CGSize;

	readonly timeOffset: number;

	constructor(o: { location: CGPoint; timeOffset: number; size: CGSize; opacity: number; force: number; azimuth: number; altitude: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithLocationTimeOffsetSizeOpacityForceAzimuthAltitude(location: CGPoint, timeOffset: number, size: CGSize, opacity: number, force: number, azimuth: number, altitude: number): this;
}

declare class PKTool extends NSObject implements NSCopying {

	static alloc(): PKTool; // inherited from NSObject

	static new(): PKTool; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class PKToolPicker extends NSObject {

	static alloc(): PKToolPicker; // inherited from NSObject

	static new(): PKToolPicker; // inherited from NSObject

	static sharedToolPickerForWindow(window: UIWindow): PKToolPicker;

	colorUserInterfaceStyle: UIUserInterfaceStyle;

	readonly isVisible: boolean;

	overrideUserInterfaceStyle: UIUserInterfaceStyle;

	rulerActive: boolean;

	selectedTool: PKTool;

	showsDrawingPolicyControls: boolean;

	stateAutosaveName: string;

	addObserver(observer: PKToolPickerObserver): void;

	frameObscuredInView(view: UIView): CGRect;

	removeObserver(observer: PKToolPickerObserver): void;

	setVisibleForFirstResponder(visible: boolean, responder: UIResponder): void;
}

interface PKToolPickerObserver extends NSObjectProtocol {

	toolPickerFramesObscuredDidChange?(toolPicker: PKToolPicker): void;

	toolPickerIsRulerActiveDidChange?(toolPicker: PKToolPicker): void;

	toolPickerSelectedToolDidChange?(toolPicker: PKToolPicker): void;

	toolPickerVisibilityDidChange?(toolPicker: PKToolPicker): void;
}
declare var PKToolPickerObserver: {

	prototype: PKToolPickerObserver;
};
