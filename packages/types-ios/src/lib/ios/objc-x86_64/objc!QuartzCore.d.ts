
/**
 * @since 2.0
 */
interface CAAction {

	runActionForKeyObjectArguments(event: string, anObject: any, dict: NSDictionary<any, any>): void;
}
declare var CAAction: {

	prototype: CAAction;
};

/**
 * @since 2.0
 */
declare class CAAnimation extends NSObject implements CAAction, CAMediaTiming, NSCopying, NSSecureCoding, SCNAnimationProtocol {

	static alloc(): CAAnimation; // inherited from NSObject

	static animation(): CAAnimation;

	/**
	 * @since 11.0
	 */
	static animationWithSCNAnimation(animation: SCNAnimation): CAAnimation;

	static defaultValueForKey(key: string): any;

	static new(): CAAnimation; // inherited from NSObject

	animationEvents: NSArray<SCNAnimationEvent>;

	delegate: CAAnimationDelegate;

	fadeInDuration: number;

	fadeOutDuration: number;

	/**
	 * @since 15.0
	 */
	preferredFrameRateRange: CAFrameRateRange;

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

/**
 * @since 10.0
 */
interface CAAnimationDelegate extends NSObjectProtocol {

	animationDidStart?(anim: CAAnimation): void;

	animationDidStopFinished?(anim: CAAnimation, flag: boolean): void;
}
declare var CAAnimationDelegate: {

	prototype: CAAnimationDelegate;
};

/**
 * @since 2.0
 */
declare class CAAnimationGroup extends CAAnimation {

	static alloc(): CAAnimationGroup; // inherited from NSObject

	static animation(): CAAnimationGroup; // inherited from CAAnimation

	static new(): CAAnimationGroup; // inherited from NSObject

	animations: NSArray<CAAnimation>;
}

/**
 * @since 2.0
 */
declare class CABasicAnimation extends CAPropertyAnimation {

	static alloc(): CABasicAnimation; // inherited from NSObject

	static animation(): CABasicAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CABasicAnimation; // inherited from CAPropertyAnimation

	static new(): CABasicAnimation; // inherited from NSObject

	byValue: any;

	fromValue: any;

	toValue: any;
}

/**
 * @since 11.0
 */
declare const enum CACornerMask {

	kCALayerMinXMinYCorner = 1,

	kCALayerMaxXMinYCorner = 2,

	kCALayerMinXMaxYCorner = 4,

	kCALayerMaxXMaxYCorner = 8
}

/**
 * @since 2.0
 */
declare function CACurrentMediaTime(): number;

/**
 * @since 3.1
 */
declare class CADisplayLink extends NSObject {

	static alloc(): CADisplayLink; // inherited from NSObject

	static displayLinkWithTargetSelector(target: any, sel: string): CADisplayLink;

	static new(): CADisplayLink; // inherited from NSObject

	readonly duration: number;

	/**
	 * @since 3.1
	 * @deprecated 10.0
	 */
	frameInterval: number;

	paused: boolean;

	/**
	 * @since 15.0
	 */
	preferredFrameRateRange: CAFrameRateRange;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	preferredFramesPerSecond: number;

	/**
	 * @since 10.0
	 */
	readonly targetTimestamp: number;

	readonly timestamp: number;

	addToRunLoopForMode(runloop: NSRunLoop, mode: string): void;

	invalidate(): void;

	removeFromRunLoopForMode(runloop: NSRunLoop, mode: string): void;
}

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare class CAEAGLLayer extends CALayer implements EAGLDrawable {

	static alloc(): CAEAGLLayer; // inherited from NSObject

	static layer(): CAEAGLLayer; // inherited from CALayer

	static new(): CAEAGLLayer; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	presentsWithTransaction: boolean;

	drawableProperties: NSDictionary<string, any>; // inherited from EAGLDrawable
}

/**
 * @since 16.0
 */
declare class CAEDRMetadata extends NSObject implements NSCopying, NSSecureCoding {

	static HDR10MetadataWithDisplayInfoContentInfoOpticalOutputScale(displayData: NSData, contentData: NSData, scale: number): CAEDRMetadata;

	static HDR10MetadataWithMinLuminanceMaxLuminanceOpticalOutputScale(minNits: number, maxNits: number, scale: number): CAEDRMetadata;

	/**
	 * @since 17.0
	 */
	static HLGMetadataWithAmbientViewingEnvironment(data: NSData): CAEDRMetadata;

	static alloc(): CAEDRMetadata; // inherited from NSObject

	static new(): CAEDRMetadata; // inherited from NSObject

	static readonly HLGMetadata: CAEDRMetadata;

	/**
	 * @since 16.0
	 */
	static readonly available: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare const enum CAEdgeAntialiasingMask {

	kCALayerLeftEdge = 1,

	kCALayerRightEdge = 2,

	kCALayerBottomEdge = 4,

	kCALayerTopEdge = 8
}

/**
 * @since 5.0
 */
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

/**
 * @since 5.0
 */
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

/**
 * @since 15.0
 */
interface CAFrameRateRange {
	minimum: number;
	maximum: number;
	preferred: number;
}
declare var CAFrameRateRange: interop.StructType<CAFrameRateRange>;

/**
 * @since 15.0
 */
declare var CAFrameRateRangeDefault: CAFrameRateRange;

/**
 * @since 15.0
 */
declare function CAFrameRateRangeIsEqualToRange(range: CAFrameRateRange, other: CAFrameRateRange): boolean;

/**
 * @since 15.0
 */
declare function CAFrameRateRangeMake(minimum: number, maximum: number, preferred: number): CAFrameRateRange;

/**
 * @since 3.0
 */
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

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare class CALayer extends NSObject implements CAMediaTiming, NSSecureCoding {

	static alloc(): CALayer; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static cornerCurveExpansionFactor(curve: string): number;

	static defaultActionForKey(event: string): CAAction;

	static defaultValueForKey(key: string): any;

	static layer(): CALayer;

	static needsDisplayForKey(key: string): boolean;

	static new(): CALayer; // inherited from NSObject

	actions: NSDictionary<string, CAAction>;

	/**
	 * @since 2.0
	 */
	allowsEdgeAntialiasing: boolean;

	/**
	 * @since 2.0
	 */
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

	/**
	 * @since 10.0
	 */
	contentsFormat: string;

	contentsGravity: string;

	contentsRect: CGRect;

	/**
	 * @since 4.0
	 */
	contentsScale: number;

	/**
	 * @since 13.0
	 */
	cornerCurve: string;

	cornerRadius: number;

	delegate: CALayerDelegate;

	doubleSided: boolean;

	/**
	 * @since 6.0
	 */
	drawsAsynchronously: boolean;

	edgeAntialiasingMask: CAEdgeAntialiasingMask;

	filters: NSArray<any>;

	frame: CGRect;

	geometryFlipped: boolean;

	hidden: boolean;

	magnificationFilter: string;

	mask: CALayer;

	/**
	 * @since 11.0
	 */
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

	/**
	 * @since 18.0
	 */
	toneMapMode: string;

	transform: CATransform3D;

	readonly visibleRect: CGRect;

	/**
	 * @since 17.0
	 */
	wantsExtendedDynamicRangeContent: boolean;

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

/**
 * @since 10.0
 */
interface CALayerDelegate extends NSObjectProtocol {

	actionForLayerForKey?(layer: CALayer, event: string): CAAction;

	displayLayer?(layer: CALayer): void;

	drawLayerInContext?(layer: CALayer, ctx: any): void;

	/**
	 * @since 10.0
	 */
	layerWillDraw?(layer: CALayer): void;

	layoutSublayersOfLayer?(layer: CALayer): void;
}
declare var CALayerDelegate: {

	prototype: CALayerDelegate;
};

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
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

/**
 * @since 17.0
 */
declare class CAMetalDisplayLink extends NSObject {

	static alloc(): CAMetalDisplayLink; // inherited from NSObject

	static new(): CAMetalDisplayLink; // inherited from NSObject

	delegate: CAMetalDisplayLinkDelegate;

	paused: boolean;

	preferredFrameLatency: number;

	preferredFrameRateRange: CAFrameRateRange;

	constructor(o: { metalLayer: CAMetalLayer; });

	addToRunLoopForMode(runloop: NSRunLoop, mode: string): void;

	initWithMetalLayer(layer: CAMetalLayer): this;

	invalidate(): void;

	removeFromRunLoopForMode(runloop: NSRunLoop, mode: string): void;
}

/**
 * @since 17.0
 */
interface CAMetalDisplayLinkDelegate {

	metalDisplayLinkNeedsUpdate(link: CAMetalDisplayLink, update: CAMetalDisplayLinkUpdate): void;
}
declare var CAMetalDisplayLinkDelegate: {

	prototype: CAMetalDisplayLinkDelegate;
};

/**
 * @since 17.0
 */
declare class CAMetalDisplayLinkUpdate extends NSObject {

	static alloc(): CAMetalDisplayLinkUpdate; // inherited from NSObject

	static new(): CAMetalDisplayLinkUpdate; // inherited from NSObject

	readonly drawable: CAMetalDrawable;

	readonly targetPresentationTimestamp: number;

	readonly targetTimestamp: number;
}

interface CAMetalDrawable extends MTLDrawable {

	layer: CAMetalLayer;

	texture: MTLTexture;
}
declare var CAMetalDrawable: {

	prototype: CAMetalDrawable;
};

/**
 * @since 13.0
 */
declare class CAMetalLayer extends CALayer {

	static alloc(): CAMetalLayer; // inherited from NSObject

	static layer(): CAMetalLayer; // inherited from CALayer

	static new(): CAMetalLayer; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	EDRMetadata: CAEDRMetadata;

	/**
	 * @since 11.0
	 */
	allowsNextDrawableTimeout: boolean;

	colorspace: any;

	/**
	 * @since 16.0
	 */
	developerHUDProperties: NSDictionary<any, any>;

	device: MTLDevice;

	drawableSize: CGSize;

	framebufferOnly: boolean;

	/**
	 * @since 11.2
	 */
	maximumDrawableCount: number;

	pixelFormat: MTLPixelFormat;

	/**
	 * @since 13.0
	 */
	readonly preferredDevice: MTLDevice;

	presentsWithTransaction: boolean;

	nextDrawable(): CAMetalDrawable;
}

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare class CARenderer extends NSObject {

	static alloc(): CARenderer; // inherited from NSObject

	static new(): CARenderer; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static rendererWithMTLTextureOptions(tex: MTLTexture, dict: NSDictionary<any, any>): CARenderer;

	bounds: CGRect;

	layer: CALayer;

	addUpdateRect(r: CGRect): void;

	beginFrameAtTimeTimeStamp(t: number, ts: interop.Pointer | interop.Reference<CVTimeStamp>): void;

	endFrame(): void;

	nextFrameTime(): number;

	render(): void;

	setDestination(tex: MTLTexture): void;

	updateBounds(): CGRect;
}

/**
 * @since 3.0
 */
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

/**
 * @since 2.0
 */
declare class CAScrollLayer extends CALayer {

	static alloc(): CAScrollLayer; // inherited from NSObject

	static layer(): CAScrollLayer; // inherited from CALayer

	static new(): CAScrollLayer; // inherited from NSObject

	scrollMode: string;

	scrollToPoint(p: CGPoint): void;

	scrollToRect(r: CGRect): void;
}

/**
 * @since 3.0
 */
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

/**
 * @since 9.0
 */
declare class CASpringAnimation extends CABasicAnimation {

	static alloc(): CASpringAnimation; // inherited from NSObject

	static animation(): CASpringAnimation; // inherited from CAAnimation

	static animationWithKeyPath(path: string): CASpringAnimation; // inherited from CAPropertyAnimation

	static new(): CASpringAnimation; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	allowsOverdamping: boolean;

	/**
	 * @since 17.0
	 */
	readonly bounce: number;

	damping: number;

	initialVelocity: number;

	mass: number;

	/**
	 * @since 17.0
	 */
	readonly perceptualDuration: number;

	readonly settlingDuration: number;

	stiffness: number;

	/**
	 * @since 17.0
	 */
	constructor(o: { perceptualDuration: number; bounce: number; });

	/**
	 * @since 17.0
	 */
	initWithPerceptualDurationBounce(perceptualDuration: number, bounce: number): this;
}

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare class CATiledLayer extends CALayer {

	static alloc(): CATiledLayer; // inherited from NSObject

	static fadeDuration(): number;

	static layer(): CATiledLayer; // inherited from CALayer

	static new(): CATiledLayer; // inherited from NSObject

	levelsOfDetail: number;

	levelsOfDetailBias: number;

	tileSize: CGSize;
}

/**
 * @since 18.0
 */
declare var CAToneMapModeAutomatic: string;

/**
 * @since 18.0
 */
declare var CAToneMapModeIfSupported: string;

/**
 * @since 18.0
 */
declare var CAToneMapModeNever: string;

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
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

/**
 * @since 2.0
 */
declare function CATransform3DConcat(a: CATransform3D, b: CATransform3D): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DEqualToTransform(a: CATransform3D, b: CATransform3D): boolean;

/**
 * @since 2.0
 */
declare function CATransform3DGetAffineTransform(t: CATransform3D): CGAffineTransform;

/**
 * @since 2.0
 */
declare var CATransform3DIdentity: CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DInvert(t: CATransform3D): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DIsAffine(t: CATransform3D): boolean;

/**
 * @since 2.0
 */
declare function CATransform3DIsIdentity(t: CATransform3D): boolean;

/**
 * @since 2.0
 */
declare function CATransform3DMakeAffineTransform(m: CGAffineTransform): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DMakeRotation(angle: number, x: number, y: number, z: number): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DMakeScale(sx: number, sy: number, sz: number): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DMakeTranslation(tx: number, ty: number, tz: number): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DRotate(t: CATransform3D, angle: number, x: number, y: number, z: number): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DScale(t: CATransform3D, sx: number, sy: number, sz: number): CATransform3D;

/**
 * @since 2.0
 */
declare function CATransform3DTranslate(t: CATransform3D, tx: number, ty: number, tz: number): CATransform3D;

/**
 * @since 3.0
 */
declare class CATransformLayer extends CALayer {

	static alloc(): CATransformLayer; // inherited from NSObject

	static layer(): CATransformLayer; // inherited from CALayer

	static new(): CATransformLayer; // inherited from NSObject
}

/**
 * @since 2.0
 */
declare class CATransition extends CAAnimation {

	static alloc(): CATransition; // inherited from NSObject

	static animation(): CATransition; // inherited from CAAnimation

	static new(): CATransition; // inherited from NSObject

	endProgress: number;

	startProgress: number;

	subtype: string;

	type: string;
}

/**
 * @since 3.0
 */
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

/**
 * @since 3.2
 */
declare var kCAAlignmentCenter: string;

/**
 * @since 3.2
 */
declare var kCAAlignmentJustified: string;

/**
 * @since 3.2
 */
declare var kCAAlignmentLeft: string;

/**
 * @since 3.2
 */
declare var kCAAlignmentNatural: string;

/**
 * @since 3.2
 */
declare var kCAAlignmentRight: string;

/**
 * @since 4.0
 */
declare var kCAAnimationCubic: string;

/**
 * @since 4.0
 */
declare var kCAAnimationCubicPaced: string;

/**
 * @since 2.0
 */
declare var kCAAnimationDiscrete: string;

/**
 * @since 2.0
 */
declare var kCAAnimationLinear: string;

/**
 * @since 2.0
 */
declare var kCAAnimationPaced: string;

/**
 * @since 2.0
 */
declare var kCAAnimationRotateAuto: string;

/**
 * @since 2.0
 */
declare var kCAAnimationRotateAutoReverse: string;

/**
 * @since 10.0
 */
declare var kCAContentsFormatGray8Uint: string;

/**
 * @since 10.0
 */
declare var kCAContentsFormatRGBA16Float: string;

/**
 * @since 10.0
 */
declare var kCAContentsFormatRGBA8Uint: string;

/**
 * @since 13.0
 */
declare var kCACornerCurveCircular: string;

/**
 * @since 13.0
 */
declare var kCACornerCurveContinuous: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerAdditive: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerBackToFront: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerCircle: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerCuboid: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerLine: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerOldestFirst: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerOldestLast: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerOutline: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerPoint: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerPoints: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerRectangle: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerSphere: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerSurface: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerUnordered: string;

/**
 * @since 5.0
 */
declare var kCAEmitterLayerVolume: string;

/**
 * @since 2.0
 */
declare var kCAFillModeBackwards: string;

/**
 * @since 2.0
 */
declare var kCAFillModeBoth: string;

/**
 * @since 2.0
 */
declare var kCAFillModeForwards: string;

/**
 * @since 2.0
 */
declare var kCAFillModeRemoved: string;

/**
 * @since 3.0
 */
declare var kCAFillRuleEvenOdd: string;

/**
 * @since 3.0
 */
declare var kCAFillRuleNonZero: string;

/**
 * @since 2.0
 */
declare var kCAFilterLinear: string;

/**
 * @since 2.0
 */
declare var kCAFilterNearest: string;

/**
 * @since 3.0
 */
declare var kCAFilterTrilinear: string;

/**
 * @since 3.0
 */
declare var kCAGradientLayerAxial: string;

/**
 * @since 12.0
 */
declare var kCAGradientLayerConic: string;

/**
 * @since 3.2
 */
declare var kCAGradientLayerRadial: string;

/**
 * @since 2.0
 */
declare var kCAGravityBottom: string;

/**
 * @since 2.0
 */
declare var kCAGravityBottomLeft: string;

/**
 * @since 2.0
 */
declare var kCAGravityBottomRight: string;

/**
 * @since 2.0
 */
declare var kCAGravityCenter: string;

/**
 * @since 2.0
 */
declare var kCAGravityLeft: string;

/**
 * @since 2.0
 */
declare var kCAGravityResize: string;

/**
 * @since 2.0
 */
declare var kCAGravityResizeAspect: string;

/**
 * @since 2.0
 */
declare var kCAGravityResizeAspectFill: string;

/**
 * @since 2.0
 */
declare var kCAGravityRight: string;

/**
 * @since 2.0
 */
declare var kCAGravityTop: string;

/**
 * @since 2.0
 */
declare var kCAGravityTopLeft: string;

/**
 * @since 2.0
 */
declare var kCAGravityTopRight: string;

/**
 * @since 3.0
 */
declare var kCALineCapButt: string;

/**
 * @since 3.0
 */
declare var kCALineCapRound: string;

/**
 * @since 3.0
 */
declare var kCALineCapSquare: string;

/**
 * @since 3.0
 */
declare var kCALineJoinBevel: string;

/**
 * @since 3.0
 */
declare var kCALineJoinMiter: string;

/**
 * @since 3.0
 */
declare var kCALineJoinRound: string;

/**
 * @since 3.0
 */
declare var kCAMediaTimingFunctionDefault: string;

/**
 * @since 2.0
 */
declare var kCAMediaTimingFunctionEaseIn: string;

/**
 * @since 2.0
 */
declare var kCAMediaTimingFunctionEaseInEaseOut: string;

/**
 * @since 2.0
 */
declare var kCAMediaTimingFunctionEaseOut: string;

/**
 * @since 2.0
 */
declare var kCAMediaTimingFunctionLinear: string;

/**
 * @since 2.0
 */
declare var kCAOnOrderIn: string;

/**
 * @since 2.0
 */
declare var kCAOnOrderOut: string;

/**
 * @since 2.0
 */
declare var kCARendererColorSpace: string;

/**
 * @since 12.0
 */
declare var kCARendererMetalCommandQueue: string;

/**
 * @since 2.0
 */
declare var kCAScrollBoth: string;

/**
 * @since 2.0
 */
declare var kCAScrollHorizontally: string;

/**
 * @since 2.0
 */
declare var kCAScrollNone: string;

/**
 * @since 2.0
 */
declare var kCAScrollVertically: string;

/**
 * @since 2.0
 */
declare var kCATransactionAnimationDuration: string;

/**
 * @since 3.0
 */
declare var kCATransactionAnimationTimingFunction: string;

/**
 * @since 4.0
 */
declare var kCATransactionCompletionBlock: string;

/**
 * @since 2.0
 */
declare var kCATransactionDisableActions: string;

/**
 * @since 2.0
 */
declare var kCATransition: string;

/**
 * @since 2.0
 */
declare var kCATransitionFade: string;

/**
 * @since 2.0
 */
declare var kCATransitionFromBottom: string;

/**
 * @since 2.0
 */
declare var kCATransitionFromLeft: string;

/**
 * @since 2.0
 */
declare var kCATransitionFromRight: string;

/**
 * @since 2.0
 */
declare var kCATransitionFromTop: string;

/**
 * @since 2.0
 */
declare var kCATransitionMoveIn: string;

/**
 * @since 2.0
 */
declare var kCATransitionPush: string;

/**
 * @since 2.0
 */
declare var kCATransitionReveal: string;

/**
 * @since 3.2
 */
declare var kCATruncationEnd: string;

/**
 * @since 3.2
 */
declare var kCATruncationMiddle: string;

/**
 * @since 3.2
 */
declare var kCATruncationNone: string;

/**
 * @since 3.2
 */
declare var kCATruncationStart: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionRotateX: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionRotateY: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionRotateZ: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionScale: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionScaleX: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionScaleY: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionScaleZ: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionTranslate: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionTranslateX: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionTranslateY: string;

/**
 * @since 3.0
 */
declare var kCAValueFunctionTranslateZ: string;
