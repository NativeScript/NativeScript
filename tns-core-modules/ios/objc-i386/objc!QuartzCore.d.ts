
interface CAAction {

	runActionForKeyObjectArguments(event: string, anObject: any, dict: NSDictionary<any, any>): void;
}
declare var CAAction: {

	prototype: CAAction;
};

declare class CAAnimation extends NSObject implements CAAction, CAMediaTiming, NSCoding, NSCopying {

	static alloc(): CAAnimation; // inherited from NSObject

	static animation(): CAAnimation;

	static defaultValueForKey(key: string): any;

	static new(): CAAnimation; // inherited from NSObject

	animationEvents: NSArray<SCNAnimationEvent>;

	delegate: any;

	fadeInDuration: number;

	fadeOutDuration: number;

	removedOnCompletion: boolean;

	timingFunction: CAMediaTimingFunction;

	usesSceneTimeBase: boolean;

	autoreverses: boolean; // inherited from CAMediaTiming

	beginTime: number; // inherited from CAMediaTiming

	duration: number; // inherited from CAMediaTiming

	fillMode: string; // inherited from CAMediaTiming

	repeatCount: number; // inherited from CAMediaTiming

	repeatDuration: number; // inherited from CAMediaTiming

	speed: number; // inherited from CAMediaTiming

	timeOffset: number; // inherited from CAMediaTiming

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	runActionForKeyObjectArguments(event: string, anObject: any, dict: NSDictionary<any, any>): void; // inherited from CAAction

	self(): CAAnimation; // inherited from NSObjectProtocol

	shouldArchiveValueForKey(key: string): boolean;
}

declare class CAAnimationGroup extends CAAnimation {

	static animation(): CAAnimationGroup; // inherited from CAAnimation

	animations: NSArray<CAAnimation>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class CABasicAnimation extends CAPropertyAnimation {

	static animationWithKeyPath(path: string): CABasicAnimation; // inherited from CAPropertyAnimation

	byValue: any;

	fromValue: any;

	toValue: any;
}

declare function CACurrentMediaTime(): number;

declare class CADisplayLink extends NSObject {

	static alloc(): CADisplayLink; // inherited from NSObject

	static displayLinkWithTargetSelector(target: any, sel: string): CADisplayLink;

	static new(): CADisplayLink; // inherited from NSObject

	/* readonly */ duration: number;

	frameInterval: number;

	paused: boolean;

	/* readonly */ timestamp: number;

	constructor(); // inherited from NSObject

	addToRunLoopForMode(runloop: NSRunLoop, mode: string): void;

	invalidate(): void;

	removeFromRunLoopForMode(runloop: NSRunLoop, mode: string): void;

	self(): CADisplayLink; // inherited from NSObjectProtocol
}

declare class CAEAGLLayer extends CALayer implements EAGLDrawable {

	static layer(): CAEAGLLayer; // inherited from CALayer

	presentsWithTransaction: boolean;

	drawableProperties: NSDictionary<any, any>; // inherited from EAGLDrawable

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare const enum CAEdgeAntialiasingMask {

	kCALayerLeftEdge = 1,

	kCALayerRightEdge = 2,

	kCALayerBottomEdge = 4,

	kCALayerTopEdge = 8
}

declare class CAEmitterBehavior extends NSObject implements NSCoding {

	static alloc(): CAEmitterBehavior; // inherited from NSObject

	static behaviorTypes(): NSArray<string>;

	static behaviorWithType(type: string): CAEmitterBehavior;

	static new(): CAEmitterBehavior; // inherited from NSObject

	enabled: boolean;

	name: string;

	/* readonly */ type: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { type: string; });

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CAEmitterBehavior; // inherited from NSObjectProtocol
}

declare class CAEmitterCell extends NSObject implements CAMediaTiming, NSCoding {

	static alloc(): CAEmitterCell; // inherited from NSObject

	static defaultValueForKey(key: string): any;

	static emitterCell(): CAEmitterCell;

	static new(): CAEmitterCell; // inherited from NSObject

	alphaRange: number;

	alphaSpeed: number;

	birthRate: number;

	blueRange: number;

	blueSpeed: number;

	color: any;

	contents: any;

	contentsRect: CGRect;

	contentsScale: number;

	emissionLatitude: number;

	emissionLongitude: number;

	emissionRange: number;

	emitterCells: NSArray<CAEmitterCell>;

	enabled: boolean;

	greenRange: number;

	greenSpeed: number;

	lifetime: number;

	lifetimeRange: number;

	magnificationFilter: string;

	minificationFilter: string;

	minificationFilterBias: number;

	name: string;

	redRange: number;

	redSpeed: number;

	scale: number;

	scaleRange: number;

	scaleSpeed: number;

	spin: number;

	spinRange: number;

	style: NSDictionary<any, any>;

	velocity: number;

	velocityRange: number;

	xAcceleration: number;

	yAcceleration: number;

	zAcceleration: number;

	autoreverses: boolean; // inherited from CAMediaTiming

	beginTime: number; // inherited from CAMediaTiming

	duration: number; // inherited from CAMediaTiming

	fillMode: string; // inherited from CAMediaTiming

	repeatCount: number; // inherited from CAMediaTiming

	repeatDuration: number; // inherited from CAMediaTiming

	speed: number; // inherited from CAMediaTiming

	timeOffset: number; // inherited from CAMediaTiming

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CAEmitterCell; // inherited from NSObjectProtocol

	shouldArchiveValueForKey(key: string): boolean;
}

declare class CAEmitterLayer extends CALayer {

	static layer(): CAEmitterLayer; // inherited from CALayer

	birthRate: number;

	emitterCells: NSArray<CAEmitterCell>;

	emitterDepth: number;

	emitterMode: string;

	emitterPosition: CGPoint;

	emitterShape: string;

	emitterSize: CGSize;

	emitterZPosition: number;

	lifetime: number;

	preservesDepth: boolean;

	renderMode: string;

	scale: number;

	seed: number;

	spin: number;

	velocity: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CAGradientLayer extends CALayer {

	static layer(): CAGradientLayer; // inherited from CALayer

	colors: NSArray<any>;

	endPoint: CGPoint;

	locations: NSArray<number>;

	startPoint: CGPoint;

	type: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CAKeyframeAnimation extends CAPropertyAnimation {

	static animationWithKeyPath(path: string): CAKeyframeAnimation; // inherited from CAPropertyAnimation

	biasValues: NSArray<number>;

	calculationMode: string;

	continuityValues: NSArray<number>;

	keyTimes: NSArray<number>;

	path: any;

	rotationMode: string;

	tensionValues: NSArray<number>;

	timingFunctions: NSArray<CAMediaTimingFunction>;

	values: NSArray<any>;
}

declare class CALayer extends NSObject implements CAMediaTiming, NSCoding {

	static alloc(): CALayer; // inherited from NSObject

	static defaultActionForKey(event: string): CAAction;

	static defaultValueForKey(key: string): any;

	static layer(): CALayer;

	static needsDisplayForKey(key: string): boolean;

	static new(): CALayer; // inherited from NSObject

	actions: NSDictionary<string, CAAction>;

	allowsEdgeAntialiasing: boolean;

	allowsGroupOpacity: boolean;

	anchorPoint: CGPoint;

	anchorPointZ: number;

	backgroundColor: any;

	backgroundFilters: NSArray<any>;

	borderColor: any;

	borderWidth: number;

	bounds: CGRect;

	compositingFilter: any;

	contents: any;

	contentsCenter: CGRect;

	contentsGravity: string;

	contentsRect: CGRect;

	contentsScale: number;

	cornerRadius: number;

	delegate: any;

	doubleSided: boolean;

	drawsAsynchronously: boolean;

	edgeAntialiasingMask: CAEdgeAntialiasingMask;

	filters: NSArray<any>;

	frame: CGRect;

	geometryFlipped: boolean;

	hidden: boolean;

	magnificationFilter: string;

	mask: CALayer;

	masksToBounds: boolean;

	minificationFilter: string;

	minificationFilterBias: number;

	name: string;

	needsDisplayOnBoundsChange: boolean;

	opacity: number;

	opaque: boolean;

	position: CGPoint;

	rasterizationScale: number;

	shadowColor: any;

	shadowOffset: CGSize;

	shadowOpacity: number;

	shadowPath: any;

	shadowRadius: number;

	shouldRasterize: boolean;

	style: NSDictionary<any, any>;

	sublayerTransform: CATransform3D;

	sublayers: NSArray<CALayer>;

	/* readonly */ superlayer: CALayer;

	transform: CATransform3D;

	/* readonly */ visibleRect: CGRect;

	zPosition: number;

	autoreverses: boolean; // inherited from CAMediaTiming

	beginTime: number; // inherited from CAMediaTiming

	duration: number; // inherited from CAMediaTiming

	fillMode: string; // inherited from CAMediaTiming

	repeatCount: number; // inherited from CAMediaTiming

	repeatDuration: number; // inherited from CAMediaTiming

	speed: number; // inherited from CAMediaTiming

	timeOffset: number; // inherited from CAMediaTiming

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; });

	actionForKey(event: string): CAAction;

	addAnimationForKey(anim: CAAnimation, key: string): void;

	addSublayer(layer: CALayer): void;

	affineTransform(): CGAffineTransform;

	animationForKey(key: string): CAAnimation;

	animationKeys(): NSArray<string>;

	containsPoint(p: CGPoint): boolean;

	contentsAreFlipped(): boolean;

	convertPointFromLayer(p: CGPoint, l: CALayer): CGPoint;

	convertPointToLayer(p: CGPoint, l: CALayer): CGPoint;

	convertRectFromLayer(r: CGRect, l: CALayer): CGRect;

	convertRectToLayer(r: CGRect, l: CALayer): CGRect;

	convertTimeFromLayer(t: number, l: CALayer): number;

	convertTimeToLayer(t: number, l: CALayer): number;

	display(): void;

	displayIfNeeded(): void;

	drawInContext(ctx: any): void;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	hitTest(p: CGPoint): CALayer;

	insertSublayerAbove(layer: CALayer, sibling: CALayer): void;

	insertSublayerAtIndex(layer: CALayer, idx: number): void;

	insertSublayerBelow(layer: CALayer, sibling: CALayer): void;

	layoutIfNeeded(): void;

	layoutSublayers(): void;

	modelLayer(): any;

	needsDisplay(): boolean;

	needsLayout(): boolean;

	preferredFrameSize(): CGSize;

	presentationLayer(): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeFromSuperlayer(): void;

	renderInContext(ctx: any): void;

	replaceSublayerWith(layer: CALayer, layer2: CALayer): void;

	scrollPoint(p: CGPoint): void;

	scrollRectToVisible(r: CGRect): void;

	self(): CALayer; // inherited from NSObjectProtocol

	setAffineTransform(m: CGAffineTransform): void;

	setNeedsDisplay(): void;

	setNeedsDisplayInRect(r: CGRect): void;

	setNeedsLayout(): void;

	shouldArchiveValueForKey(key: string): boolean;
}

interface CAMediaTiming {

	autoreverses: boolean;

	beginTime: number;

	duration: number;

	fillMode: string;

	repeatCount: number;

	repeatDuration: number;

	speed: number;

	timeOffset: number;
}
declare var CAMediaTiming: {

	prototype: CAMediaTiming;
};

declare class CAMediaTimingFunction extends NSObject implements NSCoding {

	static alloc(): CAMediaTimingFunction; // inherited from NSObject

	static functionWithControlPoints(c1x: number, c1y: number, c2x: number, c2y: number): CAMediaTimingFunction;

	static functionWithName(name: string): CAMediaTimingFunction;

	static new(): CAMediaTimingFunction; // inherited from NSObject

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { controlPoints: number; });

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	getControlPointAtIndexValues(idx: number, ptr: interop.Reference<number>): void;

	self(): CAMediaTimingFunction; // inherited from NSObjectProtocol
}

declare class CAPropertyAnimation extends CAAnimation {

	static animation(): CAPropertyAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CAPropertyAnimation;

	additive: boolean;

	cumulative: boolean;

	keyPath: string;

	valueFunction: CAValueFunction;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class CAReplicatorLayer extends CALayer {

	static layer(): CAReplicatorLayer; // inherited from CALayer

	instanceAlphaOffset: number;

	instanceBlueOffset: number;

	instanceColor: any;

	instanceCount: number;

	instanceDelay: number;

	instanceGreenOffset: number;

	instanceRedOffset: number;

	instanceTransform: CATransform3D;

	preservesDepth: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CAScrollLayer extends CALayer {

	static layer(): CAScrollLayer; // inherited from CALayer

	scrollMode: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer

	scrollToPoint(p: CGPoint): void;

	scrollToRect(r: CGRect): void;
}

declare class CAShapeLayer extends CALayer {

	static layer(): CAShapeLayer; // inherited from CALayer

	fillColor: any;

	fillRule: string;

	lineCap: string;

	lineDashPattern: NSArray<number>;

	lineDashPhase: number;

	lineJoin: string;

	lineWidth: number;

	miterLimit: number;

	path: any;

	strokeColor: any;

	strokeEnd: number;

	strokeStart: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CASpringAnimation extends CABasicAnimation {

	damping: number;

	initialVelocity: number;

	mass: number;

	/* readonly */ settlingDuration: number;

	stiffness: number;
}

declare class CATextLayer extends CALayer {

	static layer(): CATextLayer; // inherited from CALayer

	alignmentMode: string;

	allowsFontSubpixelQuantization: boolean;

	font: any;

	fontSize: number;

	foregroundColor: any;

	string: any;

	truncationMode: string;

	wrapped: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CATiledLayer extends CALayer {

	static fadeDuration(): number;

	static layer(): CATiledLayer; // inherited from CALayer

	levelsOfDetail: number;

	levelsOfDetailBias: number;

	tileSize: CGSize;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CATransaction extends NSObject {

	static alloc(): CATransaction; // inherited from NSObject

	static animationDuration(): number;

	static animationTimingFunction(): CAMediaTimingFunction;

	static begin(): void;

	static commit(): void;

	static completionBlock(): () => void;

	static disableActions(): boolean;

	static flush(): void;

	static lock(): void;

	static new(): CATransaction; // inherited from NSObject

	static setAnimationDuration(dur: number): void;

	static setAnimationTimingFunction(_function: CAMediaTimingFunction): void;

	static setCompletionBlock(block: () => void): void;

	static setDisableActions(flag: boolean): void;

	static setValueForKey(anObject: any, key: string): void;

	static unlock(): void;

	static valueForKey(key: string): any;

	constructor(); // inherited from NSObject

	self(): CATransaction; // inherited from NSObjectProtocol
}

interface CATransform3D {
	m11: number;
	m12: number;
	m13: number;
	m14: number;
	m21: number;
	m22: number;
	m23: number;
	m24: number;
	m31: number;
	m32: number;
	m33: number;
	m34: number;
	m41: number;
	m42: number;
	m43: number;
	m44: number;
}
declare var CATransform3D: interop.StructType<CATransform3D>;

declare function CATransform3DConcat(a: CATransform3D, b: CATransform3D): CATransform3D;

declare function CATransform3DEqualToTransform(a: CATransform3D, b: CATransform3D): boolean;

declare function CATransform3DGetAffineTransform(t: CATransform3D): CGAffineTransform;

declare var CATransform3DIdentity: CATransform3D;

declare function CATransform3DInvert(t: CATransform3D): CATransform3D;

declare function CATransform3DIsAffine(t: CATransform3D): boolean;

declare function CATransform3DIsIdentity(t: CATransform3D): boolean;

declare function CATransform3DMakeAffineTransform(m: CGAffineTransform): CATransform3D;

declare function CATransform3DMakeRotation(angle: number, x: number, y: number, z: number): CATransform3D;

declare function CATransform3DMakeScale(sx: number, sy: number, sz: number): CATransform3D;

declare function CATransform3DMakeTranslation(tx: number, ty: number, tz: number): CATransform3D;

declare function CATransform3DRotate(t: CATransform3D, angle: number, x: number, y: number, z: number): CATransform3D;

declare function CATransform3DScale(t: CATransform3D, sx: number, sy: number, sz: number): CATransform3D;

declare function CATransform3DTranslate(t: CATransform3D, tx: number, ty: number, tz: number): CATransform3D;

declare class CATransformLayer extends CALayer {

	static layer(): CATransformLayer; // inherited from CALayer

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layer: any; }); // inherited from CALayer
}

declare class CATransition extends CAAnimation {

	static animation(): CATransition; // inherited from CAAnimation

	endProgress: number;

	filter: any;

	startProgress: number;

	subtype: string;

	type: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class CAValueFunction extends NSObject implements NSCoding {

	static alloc(): CAValueFunction; // inherited from NSObject

	static functionWithName(name: string): CAValueFunction;

	static new(): CAValueFunction; // inherited from NSObject

	/* readonly */ name: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CAValueFunction; // inherited from NSObjectProtocol
}

interface _CALayerIvars {
	refcount: number;
	magic: number;
	layer: interop.Pointer;
	unused1: interop.Reference<interop.Pointer>;
}
declare var _CALayerIvars: interop.StructType<_CALayerIvars>;

declare var kCAAlignmentCenter: string;

declare var kCAAlignmentJustified: string;

declare var kCAAlignmentLeft: string;

declare var kCAAlignmentNatural: string;

declare var kCAAlignmentRight: string;

declare var kCAAnimationCubic: string;

declare var kCAAnimationCubicPaced: string;

declare var kCAAnimationDiscrete: string;

declare var kCAAnimationLinear: string;

declare var kCAAnimationPaced: string;

declare var kCAAnimationRotateAuto: string;

declare var kCAAnimationRotateAutoReverse: string;

declare var kCAEmitterBehaviorAlignToMotion: string;

declare var kCAEmitterBehaviorAttractor: string;

declare var kCAEmitterBehaviorColorOverLife: string;

declare var kCAEmitterBehaviorDrag: string;

declare var kCAEmitterBehaviorLight: string;

declare var kCAEmitterBehaviorValueOverLife: string;

declare var kCAEmitterBehaviorWave: string;

declare var kCAEmitterLayerAdditive: string;

declare var kCAEmitterLayerBackToFront: string;

declare var kCAEmitterLayerCircle: string;

declare var kCAEmitterLayerCuboid: string;

declare var kCAEmitterLayerLine: string;

declare var kCAEmitterLayerOldestFirst: string;

declare var kCAEmitterLayerOldestLast: string;

declare var kCAEmitterLayerOutline: string;

declare var kCAEmitterLayerPoint: string;

declare var kCAEmitterLayerPoints: string;

declare var kCAEmitterLayerRectangle: string;

declare var kCAEmitterLayerSphere: string;

declare var kCAEmitterLayerSurface: string;

declare var kCAEmitterLayerUnordered: string;

declare var kCAEmitterLayerVolume: string;

declare var kCAFillModeBackwards: string;

declare var kCAFillModeBoth: string;

declare var kCAFillModeForwards: string;

declare var kCAFillModeRemoved: string;

declare var kCAFillRuleEvenOdd: string;

declare var kCAFillRuleNonZero: string;

declare var kCAFilterLinear: string;

declare var kCAFilterNearest: string;

declare var kCAFilterTrilinear: string;

declare var kCAGradientLayerAxial: string;

declare var kCAGravityBottom: string;

declare var kCAGravityBottomLeft: string;

declare var kCAGravityBottomRight: string;

declare var kCAGravityCenter: string;

declare var kCAGravityLeft: string;

declare var kCAGravityResize: string;

declare var kCAGravityResizeAspect: string;

declare var kCAGravityResizeAspectFill: string;

declare var kCAGravityRight: string;

declare var kCAGravityTop: string;

declare var kCAGravityTopLeft: string;

declare var kCAGravityTopRight: string;

declare var kCALineCapButt: string;

declare var kCALineCapRound: string;

declare var kCALineCapSquare: string;

declare var kCALineJoinBevel: string;

declare var kCALineJoinMiter: string;

declare var kCALineJoinRound: string;

declare var kCAMediaTimingFunctionDefault: string;

declare var kCAMediaTimingFunctionEaseIn: string;

declare var kCAMediaTimingFunctionEaseInEaseOut: string;

declare var kCAMediaTimingFunctionEaseOut: string;

declare var kCAMediaTimingFunctionLinear: string;

declare var kCAOnOrderIn: string;

declare var kCAOnOrderOut: string;

declare var kCAScrollBoth: string;

declare var kCAScrollHorizontally: string;

declare var kCAScrollNone: string;

declare var kCAScrollVertically: string;

declare var kCATransactionAnimationDuration: string;

declare var kCATransactionAnimationTimingFunction: string;

declare var kCATransactionCompletionBlock: string;

declare var kCATransactionDisableActions: string;

declare var kCATransition: string;

declare var kCATransitionFade: string;

declare var kCATransitionFromBottom: string;

declare var kCATransitionFromLeft: string;

declare var kCATransitionFromRight: string;

declare var kCATransitionFromTop: string;

declare var kCATransitionMoveIn: string;

declare var kCATransitionPush: string;

declare var kCATransitionReveal: string;

declare var kCATruncationEnd: string;

declare var kCATruncationMiddle: string;

declare var kCATruncationNone: string;

declare var kCATruncationStart: string;

declare var kCAValueFunctionRotateX: string;

declare var kCAValueFunctionRotateY: string;

declare var kCAValueFunctionRotateZ: string;

declare var kCAValueFunctionScale: string;

declare var kCAValueFunctionScaleX: string;

declare var kCAValueFunctionScaleY: string;

declare var kCAValueFunctionScaleZ: string;

declare var kCAValueFunctionTranslate: string;

declare var kCAValueFunctionTranslateX: string;

declare var kCAValueFunctionTranslateY: string;

declare var kCAValueFunctionTranslateZ: string;
