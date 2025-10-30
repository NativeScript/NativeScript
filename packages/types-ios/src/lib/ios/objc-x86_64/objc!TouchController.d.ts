
/**
 * @since 26.0
 */
declare class TCButton extends NSObject implements TCControl, TCControlLayout {

	static alloc(): TCButton; // inherited from NSObject

	static new(): TCButton; // inherited from NSObject

	contents: TCControlContents;

	anchor: TCControlLayoutAnchor; // inherited from TCControlLayout

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem; // inherited from TCControlLayout

	readonly colliderShape: TCColliderShape; // inherited from TCControl

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from TCControl

	readonly hash: number; // inherited from NSObjectProtocol

	highlightDuration: number; // inherited from TCControl

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly label: TCControlLabel; // inherited from TCControl

	offset: CGPoint; // inherited from TCControlLayout

	readonly position: CGPoint; // inherited from TCControlLayout

	readonly pressed: boolean; // inherited from TCControl

	size: CGSize; // inherited from TCControlLayout

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	zIndex: number; // inherited from TCControlLayout

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;

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
 * @since 26.0
 */
declare class TCButtonDescriptor extends NSObject {

	static alloc(): TCButtonDescriptor; // inherited from NSObject

	static new(): TCButtonDescriptor; // inherited from NSObject

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	colliderShape: TCColliderShape;

	contents: TCControlContents;

	highlightDuration: number;

	label: TCControlLabel;

	offset: CGPoint;

	size: CGSize;

	zIndex: number;
}

/**
 * @since 26.0
 */
declare const enum TCColliderShape {

	Circle = 0,

	Rect = 1,

	LeftSide = 2,

	RightSide = 3
}

/**
 * @since 26.0
 */
interface TCControl extends NSObjectProtocol, TCControlLayout {

	colliderShape: TCColliderShape;

	enabled: boolean;

	highlightDuration?: number;

	label: TCControlLabel;

	pressed: boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;
}
declare var TCControl: {

	prototype: TCControl;
};

/**
 * @since 26.0
 */
declare class TCControlContents extends NSObject {

	static alloc(): TCControlContents; // inherited from NSObject

	static buttonContentsForSystemImageNamedSizeShapeController(imageName: string, size: CGSize, shape: TCControlContentsButtonShape, controller: TCTouchController): TCControlContents;

	static contentsWithImages(images: NSArray<TCControlImage> | TCControlImage[]): TCControlContents;

	static directionPadContentsForLabelSizeStyleDirectionController(label: TCControlLabel, size: CGSize, style: TCControlContentsDpadElementStyle, direction: TCControlContentsDpadDirection, controller: TCTouchController): TCControlContents;

	static new(): TCControlContents; // inherited from NSObject

	static switchedOnContentsForSystemImageNamedSizeShapeController(imageName: string, size: CGSize, shape: TCControlContentsButtonShape, controller: TCTouchController): TCControlContents;

	static throttleBackgroundContentsOfSizeController(size: CGSize, controller: TCTouchController): TCControlContents;

	static throttleIndicatorContentsOfSizeController(size: CGSize, controller: TCTouchController): TCControlContents;

	static thumbstickBackgroundContentsOfSizeController(size: CGSize, controller: TCTouchController): TCControlContents;

	static thumbstickStickContentsOfSizeController(size: CGSize, controller: TCTouchController): TCControlContents;

	readonly images: NSArray<TCControlImage>;
}

/**
 * @since 26.0
 */
declare const enum TCControlContentsButtonShape {

	Circle = 0,

	Rect = 1
}

/**
 * @since 26.0
 */
declare const enum TCControlContentsDpadDirection {

	Up = 0,

	Down = 1,

	Left = 2,

	Right = 3
}

/**
 * @since 26.0
 */
declare const enum TCControlContentsDpadElementStyle {

	Circle = 0,

	Pentagon = 1
}

/**
 * @since 26.0
 */
declare class TCControlImage extends NSObject {

	static alloc(): TCControlImage; // inherited from NSObject

	static new(): TCControlImage; // inherited from NSObject

	highlightTexture: MTLTexture;

	offset: CGPoint;

	size: CGSize;

	texture: MTLTexture;

	tintColor: any;

	constructor(o: { CGImage: any; size: CGSize; device: MTLDevice; });

	constructor(o: { texture: MTLTexture; size: CGSize; });

	constructor(o: { texture: MTLTexture; size: CGSize; highlightTexture: MTLTexture; offset: CGPoint; tintColor: any; });

	constructor(o: { UIImage: UIImage; size: CGSize; device: MTLDevice; });

	initWithCGImageSizeDevice(cgImage: any, size: CGSize, device: MTLDevice): this;

	initWithTextureSize(texture: MTLTexture, size: CGSize): this;

	initWithTextureSizeHighlightTextureOffsetTintColor(texture: MTLTexture, size: CGSize, highlightTexture: MTLTexture, offset: CGPoint, tintColor: any): this;

	initWithUIImageSizeDevice(uiImage: UIImage, size: CGSize, device: MTLDevice): this;
}

/**
 * @since 26.0
 */
declare class TCControlLabel extends NSObject {

	static alloc(): TCControlLabel; // inherited from NSObject

	static new(): TCControlLabel; // inherited from NSObject

	readonly name: string;

	readonly role: TCControlLabelRole;

	static readonly buttonA: TCControlLabel;

	static readonly buttonB: TCControlLabel;

	static readonly buttonLeftShoulder: TCControlLabel;

	static readonly buttonLeftTrigger: TCControlLabel;

	static readonly buttonMenu: TCControlLabel;

	static readonly buttonOptions: TCControlLabel;

	static readonly buttonRightShoulder: TCControlLabel;

	static readonly buttonRightTrigger: TCControlLabel;

	static readonly buttonX: TCControlLabel;

	static readonly buttonY: TCControlLabel;

	static readonly directionPad: TCControlLabel;

	static readonly leftThumbstick: TCControlLabel;

	static readonly leftThumbstickButton: TCControlLabel;

	static readonly rightThumbstick: TCControlLabel;

	static readonly rightThumbstickButton: TCControlLabel;

	constructor(o: { name: string; role: TCControlLabelRole; });

	initWithNameRole(name: string, role: TCControlLabelRole): this;
}

/**
 * @since 26.0
 */
declare const enum TCControlLabelRole {

	Button = 0,

	DirectionPad = 1
}

/**
 * @since 26.0
 */
interface TCControlLayout extends NSObjectProtocol {

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	offset: CGPoint;

	position: CGPoint;

	size: CGSize;

	zIndex: number;
}
declare var TCControlLayout: {

	prototype: TCControlLayout;
};

/**
 * @since 26.0
 */
declare const enum TCControlLayoutAnchor {

	TopLeft = 0,

	TopCenter = 1,

	TopRight = 2,

	CenterLeft = 3,

	Center = 4,

	CenterRight = 5,

	BottomLeft = 6,

	BottomCenter = 7,

	BottomRight = 8
}

/**
 * @since 26.0
 */
declare const enum TCControlLayoutAnchorCoordinateSystem {

	Relative = 0,

	Absolute = 1
}

/**
 * @since 26.0
 */
declare class TCDirectionPad extends NSObject implements TCControl, TCControlLayout {

	static alloc(): TCDirectionPad; // inherited from NSObject

	static new(): TCDirectionPad; // inherited from NSObject

	compositeLabel: TCControlLabel;

	digital: boolean;

	downContents: TCControlContents;

	downLabel: TCControlLabel;

	leftContents: TCControlContents;

	leftLabel: TCControlLabel;

	mutuallyExclusiveInput: boolean;

	radial: boolean;

	rightContents: TCControlContents;

	rightLabel: TCControlLabel;

	upContents: TCControlContents;

	upLabel: TCControlLabel;

	anchor: TCControlLayoutAnchor; // inherited from TCControlLayout

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem; // inherited from TCControlLayout

	readonly colliderShape: TCColliderShape; // inherited from TCControl

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from TCControl

	readonly hash: number; // inherited from NSObjectProtocol

	highlightDuration: number; // inherited from TCControl

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly label: TCControlLabel; // inherited from TCControl

	offset: CGPoint; // inherited from TCControlLayout

	readonly position: CGPoint; // inherited from TCControlLayout

	readonly pressed: boolean; // inherited from TCControl

	size: CGSize; // inherited from TCControlLayout

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	zIndex: number; // inherited from TCControlLayout

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;

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
 * @since 26.0
 */
declare class TCDirectionPadDescriptor extends NSObject {

	static alloc(): TCDirectionPadDescriptor; // inherited from NSObject

	static new(): TCDirectionPadDescriptor; // inherited from NSObject

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	colliderShape: TCColliderShape;

	compositeLabel: TCControlLabel;

	digital: boolean;

	downContents: TCControlContents;

	downLabel: TCControlLabel;

	highlightDuration: number;

	leftContents: TCControlContents;

	leftLabel: TCControlLabel;

	mutuallyExclusiveInput: boolean;

	offset: CGPoint;

	radial: boolean;

	rightContents: TCControlContents;

	rightLabel: TCControlLabel;

	size: CGSize;

	upContents: TCControlContents;

	upLabel: TCControlLabel;

	zIndex: number;
}

/**
 * @since 26.0
 */
declare var TCGameControllerProductCategoryTouchController: string;

/**
 * @since 26.0
 */
declare class TCSwitch extends NSObject implements TCControl, TCControlLayout {

	static alloc(): TCSwitch; // inherited from NSObject

	static new(): TCSwitch; // inherited from NSObject

	contents: TCControlContents;

	readonly switchedOn: boolean;

	switchedOnContents: TCControlContents;

	anchor: TCControlLayoutAnchor; // inherited from TCControlLayout

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem; // inherited from TCControlLayout

	readonly colliderShape: TCColliderShape; // inherited from TCControl

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from TCControl

	readonly hash: number; // inherited from NSObjectProtocol

	highlightDuration: number; // inherited from TCControl

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly label: TCControlLabel; // inherited from TCControl

	offset: CGPoint; // inherited from TCControlLayout

	readonly position: CGPoint; // inherited from TCControlLayout

	readonly pressed: boolean; // inherited from TCControl

	size: CGSize; // inherited from TCControlLayout

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	zIndex: number; // inherited from TCControlLayout

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;

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
 * @since 26.0
 */
declare class TCSwitchDescriptor extends NSObject {

	static alloc(): TCSwitchDescriptor; // inherited from NSObject

	static new(): TCSwitchDescriptor; // inherited from NSObject

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	colliderShape: TCColliderShape;

	contents: TCControlContents;

	highlightDuration: number;

	label: TCControlLabel;

	offset: CGPoint;

	size: CGSize;

	switchedOnContents: TCControlContents;

	zIndex: number;
}

/**
 * @since 26.0
 */
declare class TCThrottle extends NSObject implements TCControl, TCControlLayout {

	static alloc(): TCThrottle; // inherited from NSObject

	static new(): TCThrottle; // inherited from NSObject

	backgroundContents: TCControlContents;

	baseValue: number;

	indicatorContents: TCControlContents;

	indicatorSize: CGSize;

	readonly orientation: TCThrottleOrientation;

	snapsToBaseValue: boolean;

	throttleSize: CGSize;

	anchor: TCControlLayoutAnchor; // inherited from TCControlLayout

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem; // inherited from TCControlLayout

	readonly colliderShape: TCColliderShape; // inherited from TCControl

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from TCControl

	readonly hash: number; // inherited from NSObjectProtocol

	highlightDuration: number; // inherited from TCControl

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly label: TCControlLabel; // inherited from TCControl

	offset: CGPoint; // inherited from TCControlLayout

	readonly position: CGPoint; // inherited from TCControlLayout

	readonly pressed: boolean; // inherited from TCControl

	size: CGSize; // inherited from TCControlLayout

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	zIndex: number; // inherited from TCControlLayout

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;

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
 * @since 26.0
 */
declare class TCThrottleDescriptor extends NSObject {

	static alloc(): TCThrottleDescriptor; // inherited from NSObject

	static new(): TCThrottleDescriptor; // inherited from NSObject

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	backgroundContents: TCControlContents;

	baseValue: number;

	colliderShape: TCColliderShape;

	highlightDuration: number;

	indicatorContents: TCControlContents;

	indicatorSize: CGSize;

	label: TCControlLabel;

	offset: CGPoint;

	orientation: TCThrottleOrientation;

	size: CGSize;

	snapsToBaseValue: boolean;

	throttleSize: CGSize;

	zIndex: number;
}

/**
 * @since 26.0
 */
declare const enum TCThrottleOrientation {

	Vertical = 0,

	Horizontal = 1
}

/**
 * @since 26.0
 */
declare class TCThumbstick extends NSObject implements TCControl, TCControlLayout {

	static alloc(): TCThumbstick; // inherited from NSObject

	static new(): TCThumbstick; // inherited from NSObject

	backgroundContents: TCControlContents;

	hidesWhenNotPressed: boolean;

	stickContents: TCControlContents;

	stickSize: CGSize;

	anchor: TCControlLayoutAnchor; // inherited from TCControlLayout

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem; // inherited from TCControlLayout

	readonly colliderShape: TCColliderShape; // inherited from TCControl

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from TCControl

	readonly hash: number; // inherited from NSObjectProtocol

	highlightDuration: number; // inherited from TCControl

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly label: TCControlLabel; // inherited from TCControl

	offset: CGPoint; // inherited from TCControlLayout

	readonly position: CGPoint; // inherited from TCControlLayout

	readonly pressed: boolean; // inherited from TCControl

	size: CGSize; // inherited from TCControlLayout

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	zIndex: number; // inherited from TCControlLayout

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;

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
 * @since 26.0
 */
declare class TCThumbstickDescriptor extends NSObject {

	static alloc(): TCThumbstickDescriptor; // inherited from NSObject

	static new(): TCThumbstickDescriptor; // inherited from NSObject

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	backgroundContents: TCControlContents;

	colliderShape: TCColliderShape;

	hidesWhenNotPressed: boolean;

	highlightDuration: number;

	label: TCControlLabel;

	offset: CGPoint;

	size: CGSize;

	stickContents: TCControlContents;

	stickSize: CGSize;

	zIndex: number;
}

/**
 * @since 26.0
 */
declare class TCTouchController extends NSObject {

	static alloc(): TCTouchController; // inherited from NSObject

	static new(): TCTouchController; // inherited from NSObject

	readonly buttons: NSArray<TCButton>;

	readonly connected: boolean;

	readonly controller: GCController;

	readonly controls: NSArray<TCControl>;

	readonly device: MTLDevice;

	readonly directionPads: NSArray<TCDirectionPad>;

	drawableSize: CGSize;

	size: CGSize;

	readonly switches: NSArray<TCSwitch>;

	readonly throttles: NSArray<TCThrottle>;

	readonly thumbsticks: NSArray<TCThumbstick>;

	readonly touchpads: NSArray<TCTouchpad>;

	static readonly supported: boolean;

	constructor(o: { descriptor: TCTouchControllerDescriptor; });

	addButtonWithDescriptor(descriptor: TCButtonDescriptor): TCButton;

	addDirectionPadWithDescriptor(descriptor: TCDirectionPadDescriptor): TCDirectionPad;

	addSwitchWithDescriptor(descriptor: TCSwitchDescriptor): TCSwitch;

	addThrottleWithDescriptor(descriptor: TCThrottleDescriptor): TCThrottle;

	addThumbstickWithDescriptor(descriptor: TCThumbstickDescriptor): TCThumbstick;

	addTouchpadWithDescriptor(descriptor: TCTouchpadDescriptor): TCTouchpad;

	automaticallyLayoutControlsForLabels(labels: NSArray<TCControlLabel> | TCControlLabel[]): void;

	connect(): void;

	controlAtPoint(point: CGPoint): TCControl;

	disconnect(): void;

	handleTouchBeganAtPointIndex(point: CGPoint, index: number): boolean;

	handleTouchEndedAtPointIndex(point: CGPoint, index: number): boolean;

	handleTouchMovedAtPointIndex(point: CGPoint, index: number): boolean;

	initWithDescriptor(descriptor: TCTouchControllerDescriptor): this;

	removeAllControls(): void;

	removeControl(control: TCControl): void;

	renderUsingRenderCommandEncoder(encoder: MTLRenderCommandEncoder): void;
}

/**
 * @since 26.0
 */
declare class TCTouchControllerDescriptor extends NSObject {

	static alloc(): TCTouchControllerDescriptor; // inherited from NSObject

	static new(): TCTouchControllerDescriptor; // inherited from NSObject

	colorPixelFormat: MTLPixelFormat;

	depthAttachmentPixelFormat: MTLPixelFormat;

	device: MTLDevice;

	drawableSize: CGSize;

	sampleCount: number;

	size: CGSize;

	stencilAttachmentPixelFormat: MTLPixelFormat;

	constructor(o: { MTKView: MTKView; });

	initWithMTKView(mtkView: MTKView): this;
}

/**
 * @since 26.0
 */
declare class TCTouchpad extends NSObject implements TCControl, TCControlLayout {

	static alloc(): TCTouchpad; // inherited from NSObject

	static new(): TCTouchpad; // inherited from NSObject

	contents: TCControlContents;

	reportsRelativeValues: boolean;

	anchor: TCControlLayoutAnchor; // inherited from TCControlLayout

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem; // inherited from TCControlLayout

	readonly colliderShape: TCColliderShape; // inherited from TCControl

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from TCControl

	readonly hash: number; // inherited from NSObjectProtocol

	highlightDuration: number; // inherited from TCControl

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly label: TCControlLabel; // inherited from TCControl

	offset: CGPoint; // inherited from TCControlLayout

	readonly position: CGPoint; // inherited from TCControlLayout

	readonly pressed: boolean; // inherited from TCControl

	size: CGSize; // inherited from TCControlLayout

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	zIndex: number; // inherited from TCControlLayout

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handleTouchBeganAtPoint(point: CGPoint): void;

	handleTouchEndedAtPoint(point: CGPoint): void;

	handleTouchMovedAtPoint(point: CGPoint): void;

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
 * @since 26.0
 */
declare class TCTouchpadDescriptor extends NSObject {

	static alloc(): TCTouchpadDescriptor; // inherited from NSObject

	static new(): TCTouchpadDescriptor; // inherited from NSObject

	anchor: TCControlLayoutAnchor;

	anchorCoordinateSystem: TCControlLayoutAnchorCoordinateSystem;

	colliderShape: TCColliderShape;

	contents: TCControlContents;

	highlightDuration: number;

	label: TCControlLabel;

	offset: CGPoint;

	reportsRelativeValues: boolean;

	size: CGSize;

	zIndex: number;
}
