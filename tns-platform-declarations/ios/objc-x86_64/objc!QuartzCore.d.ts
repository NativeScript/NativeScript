
interface CAAction {

	runActionForKeyObjectArguments(event: string, anObject: any, dict: NSDictionary<any, any>): void;
}
declare var CAAction: {

	prototype: CAAction;
};

declare class CAAnimation extends NSObject implements CAAction, CAMediaTiming, NSCopying, NSSecureCoding, SCNAnimationProtocol {

	static alloc(): CAAnimation; // inherited from NSObject

	static animation(): CAAnimation;

	static animationWithSCNAnimation(animation: SCNAnimation): CAAnimation;

	static defaultValueForKey(key: string): any;

	static new(): CAAnimation; // inherited from NSObject

	animationEvents: NSArray<SCNAnimationEvent>;

	delegate: CAAnimationDelegate;

	fadeInDuration: number;

	fadeOutDuration: number;

	removedOnCompletion: boolean;

	timingFunction: CAMediaTimingFunction;

	usesSceneTimeBase: boolean;

	autoreverses: boolean; // inherited from CAMediaTiming

	beginTime: number; // inherited from CAMediaTiming

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	duration: number; // inherited from CAMediaTiming

	fillMode: string; // inherited from CAMediaTiming

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	repeatCount: number; // inherited from CAMediaTiming

	repeatDuration: number; // inherited from CAMediaTiming

	speed: number; // inherited from CAMediaTiming

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	timeOffset: number; // inherited from CAMediaTiming

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	runActionForKeyObjectArguments(event: string, anObject: any, dict: NSDictionary<any, any>): void;

	self(): this;

	shouldArchiveValueForKey(key: string): boolean;
}

interface CAAnimationDelegate extends NSObjectProtocol {

	animationDidStart?(anim: CAAnimation): void;

	animationDidStopFinished?(anim: CAAnimation, flag: boolean): void;
}
declare var CAAnimationDelegate: {

	prototype: CAAnimationDelegate;
};

declare class CAAnimationGroup extends CAAnimation {

	static alloc(): CAAnimationGroup; // inherited from NSObject

	static animation(): CAAnimationGroup; // inherited from CAAnimation

	static new(): CAAnimationGroup; // inherited from NSObject

	animations: NSArray<CAAnimation>;
}

declare class CABasicAnimation extends CAPropertyAnimation {

	static alloc(): CABasicAnimation; // inherited from NSObject

	static animation(): CABasicAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CABasicAnimation; // inherited from CAPropertyAnimation

	static new(): CABasicAnimation; // inherited from NSObject

	byValue: any;

	fromValue: any;

	toValue: any;
}

declare const enum CACornerMask {

	kCALayerMinXMinYCorner = 1,

	kCALayerMaxXMinYCorner = 2,

	kCALayerMinXMaxYCorner = 4,

	kCALayerMaxXMaxYCorner = 8
}

declare function CACurrentMediaTime(): number;

declare class CADisplayLink extends NSObject {

	static alloc(): CADisplayLink; // inherited from NSObject

	static displayLinkWithTargetSelector(target: any, sel: string): CADisplayLink;

	static new(): CADisplayLink; // inherited from NSObject

	readonly duration: number;

	frameInterval: number;

	paused: boolean;

	preferredFramesPerSecond: number;

	readonly targetTimestamp: number;

	readonly timestamp: number;

	addToRunLoopForMode(runloop: NSRunLoop, mode: string): void;

	invalidate(): void;

	removeFromRunLoopForMode(runloop: NSRunLoop, mode: string): void;
}

declare class CAEAGLLayer extends CALayer implements EAGLDrawable {

	static alloc(): CAEAGLLayer; // inherited from NSObject

	static layer(): CAEAGLLayer; // inherited from CALayer

	static new(): CAEAGLLayer; // inherited from NSObject

	presentsWithTransaction: boolean;

	drawableProperties: NSDictionary<string, any>; // inherited from EAGLDrawable
}

declare const enum CAEdgeAntialiasingMask {

	kCALayerLeftEdge = 1,

	kCALayerRightEdge = 2,

	kCALayerBottomEdge = 4,

	kCALayerTopEdge = 8
}

declare class CAEmitterCell extends NSObject implements CAMediaTiming, NSSecureCoding {

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

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	shouldArchiveValueForKey(key: string): boolean;
}

declare class CAEmitterLayer extends CALayer {

	static alloc(): CAEmitterLayer; // inherited from NSObject

	static layer(): CAEmitterLayer; // inherited from CALayer

	static new(): CAEmitterLayer; // inherited from NSObject

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
}

declare class CAGradientLayer extends CALayer {

	static alloc(): CAGradientLayer; // inherited from NSObject

	static layer(): CAGradientLayer; // inherited from CALayer

	static new(): CAGradientLayer; // inherited from NSObject

	colors: NSArray<any>;

	endPoint: CGPoint;

	locations: NSArray<number>;

	startPoint: CGPoint;

	type: string;
}

declare class CAKeyframeAnimation extends CAPropertyAnimation {

	static alloc(): CAKeyframeAnimation; // inherited from NSObject

	static animation(): CAKeyframeAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CAKeyframeAnimation; // inherited from CAPropertyAnimation

	static new(): CAKeyframeAnimation; // inherited from NSObject

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

declare class CALayer extends NSObject implements CAMediaTiming, NSSecureCoding {

	static alloc(): CALayer; // inherited from NSObject

	static cornerCurveExpansionFactor(curve: string): number;

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

	contentsFormat: string;

	contentsGravity: string;

	contentsRect: CGRect;

	contentsScale: number;

	cornerCurve: string;

	cornerRadius: number;

	delegate: CALayerDelegate;

	doubleSided: boolean;

	drawsAsynchronously: boolean;

	edgeAntialiasingMask: CAEdgeAntialiasingMask;

	filters: NSArray<any>;

	frame: CGRect;

	geometryFlipped: boolean;

	hidden: boolean;

	magnificationFilter: string;

	mask: CALayer;

	maskedCorners: CACornerMask;

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

	readonly superlayer: CALayer;

	transform: CATransform3D;

	readonly visibleRect: CGRect;

	zPosition: number;

	autoreverses: boolean; // inherited from CAMediaTiming

	beginTime: number; // inherited from CAMediaTiming

	duration: number; // inherited from CAMediaTiming

	fillMode: string; // inherited from CAMediaTiming

	repeatCount: number; // inherited from CAMediaTiming

	repeatDuration: number; // inherited from CAMediaTiming

	speed: number; // inherited from CAMediaTiming

	timeOffset: number; // inherited from CAMediaTiming

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

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

	encodeWithCoder(coder: NSCoder): void;

	hitTest(p: CGPoint): CALayer;

	initWithCoder(coder: NSCoder): this;

	initWithLayer(layer: any): this;

	insertSublayerAbove(layer: CALayer, sibling: CALayer): void;

	insertSublayerAtIndex(layer: CALayer, idx: number): void;

	insertSublayerBelow(layer: CALayer, sibling: CALayer): void;

	layoutIfNeeded(): void;

	layoutSublayers(): void;

	modelLayer(): this;

	needsDisplay(): boolean;

	needsLayout(): boolean;

	preferredFrameSize(): CGSize;

	presentationLayer(): this;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeFromSuperlayer(): void;

	renderInContext(ctx: any): void;

	replaceSublayerWith(oldLayer: CALayer, newLayer: CALayer): void;

	scrollPoint(p: CGPoint): void;

	scrollRectToVisible(r: CGRect): void;

	setAffineTransform(m: CGAffineTransform): void;

	setNeedsDisplay(): void;

	setNeedsDisplayInRect(r: CGRect): void;

	setNeedsLayout(): void;

	shouldArchiveValueForKey(key: string): boolean;
}

interface CALayerDelegate extends NSObjectProtocol {

	actionForLayerForKey?(layer: CALayer, event: string): CAAction;

	displayLayer?(layer: CALayer): void;

	drawLayerInContext?(layer: CALayer, ctx: any): void;

	layerWillDraw?(layer: CALayer): void;

	layoutSublayersOfLayer?(layer: CALayer): void;
}
declare var CALayerDelegate: {

	prototype: CALayerDelegate;
};

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

declare class CAMediaTimingFunction extends NSObject implements NSSecureCoding {

	static alloc(): CAMediaTimingFunction; // inherited from NSObject

	static functionWithControlPoints(c1x: number, c1y: number, c2x: number, c2y: number): CAMediaTimingFunction;

	static functionWithName(name: string): CAMediaTimingFunction;


	static new(): CAMediaTimingFunction; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { controlPoints: number; });

	encodeWithCoder(coder: NSCoder): void;

	getControlPointAtIndexValues(idx: number, ptr: interop.Reference<number>): void;

	initWithCoder(coder: NSCoder): this;

	initWithControlPoints(c1x: number, c1y: number, c2x: number, c2y: number): this;
}

interface CAMetalDrawable extends MTLDrawable {

	layer: CAMetalLayer;

	texture: MTLTexture;
}
declare var CAMetalDrawable: {

	prototype: CAMetalDrawable;
};

declare class CAMetalLayer extends CALayer {

	static alloc(): CAMetalLayer; // inherited from NSObject

	static layer(): CAMetalLayer; // inherited from CALayer

	static new(): CAMetalLayer; // inherited from NSObject

	allowsNextDrawableTimeout: boolean;

	colorspace: any;

	device: MTLDevice;

	drawableSize: CGSize;

	framebufferOnly: boolean;

	maximumDrawableCount: number;

	pixelFormat: MTLPixelFormat;

	readonly preferredDevice: MTLDevice;

	presentsWithTransaction: boolean;

	nextDrawable(): CAMetalDrawable;
}

declare class CAPropertyAnimation extends CAAnimation {

	static alloc(): CAPropertyAnimation; // inherited from NSObject

	static animation(): CAPropertyAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CAPropertyAnimation;

	static new(): CAPropertyAnimation; // inherited from NSObject

	additive: boolean;

	cumulative: boolean;

	keyPath: string;

	valueFunction: CAValueFunction;
}

declare class CAReplicatorLayer extends CALayer {

	static alloc(): CAReplicatorLayer; // inherited from NSObject

	static layer(): CAReplicatorLayer; // inherited from CALayer

	static new(): CAReplicatorLayer; // inherited from NSObject

	instanceAlphaOffset: number;

	instanceBlueOffset: number;

	instanceColor: any;

	instanceCount: number;

	instanceDelay: number;

	instanceGreenOffset: number;

	instanceRedOffset: number;

	instanceTransform: CATransform3D;

	preservesDepth: boolean;
}

declare class CAScrollLayer extends CALayer {

	static alloc(): CAScrollLayer; // inherited from NSObject

	static layer(): CAScrollLayer; // inherited from CALayer

	static new(): CAScrollLayer; // inherited from NSObject

	scrollMode: string;

	scrollToPoint(p: CGPoint): void;

	scrollToRect(r: CGRect): void;
}

declare class CAShapeLayer extends CALayer {

	static alloc(): CAShapeLayer; // inherited from NSObject

	static layer(): CAShapeLayer; // inherited from CALayer

	static new(): CAShapeLayer; // inherited from NSObject

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
}

declare class CASpringAnimation extends CABasicAnimation {

	static alloc(): CASpringAnimation; // inherited from NSObject

	static animation(): CASpringAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CASpringAnimation; // inherited from CAPropertyAnimation

	static new(): CASpringAnimation; // inherited from NSObject

	damping: number;

	initialVelocity: number;

	mass: number;

	readonly settlingDuration: number;

	stiffness: number;
}

declare class CATextLayer extends CALayer {

	static alloc(): CATextLayer; // inherited from NSObject

	static layer(): CATextLayer; // inherited from CALayer

	static new(): CATextLayer; // inherited from NSObject

	alignmentMode: string;

	allowsFontSubpixelQuantization: boolean;

	font: any;

	fontSize: number;

	foregroundColor: any;

	string: any;

	truncationMode: string;

	wrapped: boolean;
}

declare class CATiledLayer extends CALayer {

	static alloc(): CATiledLayer; // inherited from NSObject

	static fadeDuration(): number;

	static layer(): CATiledLayer; // inherited from CALayer

	static new(): CATiledLayer; // inherited from NSObject

	levelsOfDetail: number;

	levelsOfDetailBias: number;

	tileSize: CGSize;
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

	static alloc(): CATransformLayer; // inherited from NSObject

	static layer(): CATransformLayer; // inherited from CALayer

	static new(): CATransformLayer; // inherited from NSObject
}

declare class CATransition extends CAAnimation {

	static alloc(): CATransition; // inherited from NSObject

	static animation(): CATransition; // inherited from CAAnimation

	static new(): CATransition; // inherited from NSObject

	endProgress: number;

	startProgress: number;

	subtype: string;

	type: string;
}

declare class CAValueFunction extends NSObject implements NSSecureCoding {

	static alloc(): CAValueFunction; // inherited from NSObject

	static functionWithName(name: string): CAValueFunction;

	static new(): CAValueFunction; // inherited from NSObject

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

interface _CALayerIvars {
	refcount: number;
	magic: number;
	layer: interop.Pointer | interop.Reference<any>;
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

declare var kCAContentsFormatGray8Uint: string;

declare var kCAContentsFormatRGBA16Float: string;

declare var kCAContentsFormatRGBA8Uint: string;

declare var kCACornerCurveCircular: string;

declare var kCACornerCurveContinuous: string;

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

declare var kCAGradientLayerConic: string;

declare var kCAGradientLayerRadial: string;

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
