
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

declare class PKDrawing extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PKDrawing; // inherited from NSObject

	static new(): PKDrawing; // inherited from NSObject

	readonly bounds: CGRect;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { data: NSData; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dataRepresentation(): NSData;

	drawingByAppendingDrawing(drawing: PKDrawing): PKDrawing;

	drawingByApplyingTransform(transform: CGAffineTransform): PKDrawing;

	encodeWithCoder(coder: NSCoder): void;

	imageFromRectScale(rect: CGRect, scale: number): UIImage;

	initWithCoder(coder: NSCoder): this;

	initWithDataError(data: NSData): this;
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

	readonly inkType: string;

	readonly width: number;

	constructor(o: { inkType: string; color: UIColor; });

	constructor(o: { inkType: string; color: UIColor; width: number; });

	initWithInkTypeColor(type: string, color: UIColor): this;

	initWithInkTypeColorWidth(type: string, color: UIColor, width: number): this;
}

declare class PKLassoTool extends PKTool {

	static alloc(): PKLassoTool; // inherited from NSObject

	static new(): PKLassoTool; // inherited from NSObject
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
