
/**
 * @since 11.0
 */
declare class SCNAccelerationConstraint extends SCNConstraint {

	static accelerationConstraint(): SCNAccelerationConstraint;

	static alloc(): SCNAccelerationConstraint; // inherited from NSObject

	static new(): SCNAccelerationConstraint; // inherited from NSObject

	damping: number;

	decelerationDistance: number;

	maximumLinearAcceleration: number;

	maximumLinearVelocity: number;
}

declare class SCNAction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNAction; // inherited from NSObject

	static customActionWithDurationActionBlock(seconds: number, block: (p1: SCNNode, p2: number) => void): SCNAction;

	static fadeInWithDuration(sec: number): SCNAction;

	static fadeOpacityByDuration(factor: number, sec: number): SCNAction;

	static fadeOpacityToDuration(opacity: number, sec: number): SCNAction;

	static fadeOutWithDuration(sec: number): SCNAction;

	static group(actions: NSArray<SCNAction> | SCNAction[]): SCNAction;

	/**
	 * @since 9.0
	 */
	static hide(): SCNAction;

	static javaScriptActionWithScriptDuration(script: string, seconds: number): SCNAction;

	static moveByDuration(delta: SCNVector3, duration: number): SCNAction;

	static moveByXYZDuration(deltaX: number, deltaY: number, deltaZ: number, duration: number): SCNAction;

	static moveToDuration(location: SCNVector3, duration: number): SCNAction;

	static new(): SCNAction; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static playAudioSourceWaitForCompletion(source: SCNAudioSource, wait: boolean): SCNAction;

	static removeFromParentNode(): SCNAction;

	static repeatActionCount(action: SCNAction, count: number): SCNAction;

	static repeatActionForever(action: SCNAction): SCNAction;

	static rotateByAngleAroundAxisDuration(angle: number, axis: SCNVector3, duration: number): SCNAction;

	static rotateByXYZDuration(xAngle: number, yAngle: number, zAngle: number, duration: number): SCNAction;

	static rotateToAxisAngleDuration(axisAngle: SCNVector4, duration: number): SCNAction;

	static rotateToXYZDuration(xAngle: number, yAngle: number, zAngle: number, duration: number): SCNAction;

	static rotateToXYZDurationShortestUnitArc(xAngle: number, yAngle: number, zAngle: number, duration: number, shortestUnitArc: boolean): SCNAction;

	static runBlock(block: (p1: SCNNode) => void): SCNAction;

	static runBlockQueue(block: (p1: SCNNode) => void, queue: NSObject & OS_dispatch_queue): SCNAction;

	static scaleByDuration(scale: number, sec: number): SCNAction;

	static scaleToDuration(scale: number, sec: number): SCNAction;

	static sequence(actions: NSArray<SCNAction> | SCNAction[]): SCNAction;

	/**
	 * @since 9.0
	 */
	static unhide(): SCNAction;

	static waitForDuration(sec: number): SCNAction;

	static waitForDurationWithRange(sec: number, durationRange: number): SCNAction;

	duration: number;

	speed: number;

	timingFunction: (p1: number) => number;

	timingMode: SCNActionTimingMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	reversedAction(): SCNAction;
}

/**
 * @since 8.0
 */
declare const enum SCNActionTimingMode {

	Linear = 0,

	EaseIn = 1,

	EaseOut = 2,

	EaseInEaseOut = 3
}

interface SCNActionable extends NSObjectProtocol {

	actionKeys: NSArray<string>;

	hasActions: boolean;

	actionForKey(key: string): SCNAction;

	removeActionForKey(key: string): void;

	removeAllActions(): void;

	runAction(action: SCNAction): void;

	runActionCompletionHandler(action: SCNAction, block: () => void): void;

	runActionForKey(action: SCNAction, key: string): void;

	runActionForKeyCompletionHandler(action: SCNAction, key: string, block: () => void): void;
}
declare var SCNActionable: {

	prototype: SCNActionable;
};

interface SCNAnimatable extends NSObjectProtocol {

	animationKeys: NSArray<string>;

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}
declare var SCNAnimatable: {

	prototype: SCNAnimatable;
};

/**
 * @since 11.0
 */
declare class SCNAnimation extends NSObject implements NSCopying, NSSecureCoding, SCNAnimationProtocol {

	static alloc(): SCNAnimation; // inherited from NSObject

	static animationNamed(animationName: string): SCNAnimation;

	static animationWithCAAnimation(caAnimation: CAAnimation): SCNAnimation;

	static animationWithContentsOfURL(animationUrl: NSURL): SCNAnimation;

	static new(): SCNAnimation; // inherited from NSObject

	additive: boolean;

	animationDidStart: (p1: SCNAnimation, p2: SCNAnimatable) => void;

	animationDidStop: (p1: SCNAnimation, p2: SCNAnimatable, p3: boolean) => void;

	animationEvents: NSArray<SCNAnimationEvent>;

	appliedOnCompletion: boolean;

	autoreverses: boolean;

	blendInDuration: number;

	blendOutDuration: number;

	cumulative: boolean;

	duration: number;

	fillsBackward: boolean;

	fillsForward: boolean;

	keyPath: string;

	removedOnCompletion: boolean;

	repeatCount: number;

	startDelay: number;

	timeOffset: number;

	timingFunction: SCNTimingFunction;

	usesSceneTimeBase: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

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

	self(): this;
}

declare class SCNAnimationEvent extends NSObject {

	static alloc(): SCNAnimationEvent; // inherited from NSObject

	static animationEventWithKeyTimeBlock(time: number, eventBlock: (p1: SCNAnimationProtocol, p2: any, p3: boolean) => void): SCNAnimationEvent;

	static new(): SCNAnimationEvent; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class SCNAnimationPlayer extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNAnimationPlayer; // inherited from NSObject

	static animationPlayerWithAnimation(animation: SCNAnimation): SCNAnimationPlayer;

	static new(): SCNAnimationPlayer; // inherited from NSObject

	readonly animation: SCNAnimation;

	blendFactor: number;

	paused: boolean;

	speed: number;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	play(): void;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;

	stop(): void;

	stopWithBlendOutDuration(duration: number): void;
}

interface SCNAnimationProtocol extends NSObjectProtocol {
}
declare var SCNAnimationProtocol: {

	prototype: SCNAnimationProtocol;
};

declare const enum SCNAntialiasingMode {

	None = 0,

	Multisampling2X = 1,

	Multisampling4X = 2
}

/**
 * @since 9.0
 */
declare class SCNAudioPlayer extends NSObject {

	static alloc(): SCNAudioPlayer; // inherited from NSObject

	static audioPlayerWithAVAudioNode(audioNode: AVAudioNode): SCNAudioPlayer;

	static audioPlayerWithSource(source: SCNAudioSource): SCNAudioPlayer;

	static new(): SCNAudioPlayer; // inherited from NSObject

	readonly audioNode: AVAudioNode;

	readonly audioSource: SCNAudioSource;

	didFinishPlayback: () => void;

	willStartPlayback: () => void;

	constructor(o: { AVAudioNode: AVAudioNode; });

	constructor(o: { source: SCNAudioSource; });

	initWithAVAudioNode(audioNode: AVAudioNode): this;

	initWithSource(source: SCNAudioSource): this;
}

/**
 * @since 9.0
 */
declare class SCNAudioSource extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNAudioSource; // inherited from NSObject

	static audioSourceNamed(fileName: string): SCNAudioSource;

	static new(): SCNAudioSource; // inherited from NSObject

	loops: boolean;

	positional: boolean;

	rate: number;

	reverbBlend: number;

	shouldStream: boolean;

	volume: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithFileNamed(name: string): this;

	initWithURL(url: NSURL): this;

	load(): void;
}

/**
 * @since 11.0
 */
declare class SCNAvoidOccluderConstraint extends SCNConstraint {

	static alloc(): SCNAvoidOccluderConstraint; // inherited from NSObject

	static avoidOccluderConstraintWithTarget(target: SCNNode): SCNAvoidOccluderConstraint;

	static new(): SCNAvoidOccluderConstraint; // inherited from NSObject

	bias: number;

	delegate: SCNAvoidOccluderConstraintDelegate;

	occluderCategoryBitMask: number;

	target: SCNNode;
}

/**
 * @since 11.0
 */
interface SCNAvoidOccluderConstraintDelegate extends NSObjectProtocol {

	avoidOccluderConstraintDidAvoidOccluderForNode?(constraint: SCNAvoidOccluderConstraint, occluder: SCNNode, node: SCNNode): void;

	avoidOccluderConstraintShouldAvoidOccluderForNode?(constraint: SCNAvoidOccluderConstraint, occluder: SCNNode, node: SCNNode): boolean;
}
declare var SCNAvoidOccluderConstraintDelegate: {

	prototype: SCNAvoidOccluderConstraintDelegate;
};

declare const enum SCNBillboardAxis {

	X = 1,

	Y = 2,

	Z = 4,

	All = 7
}

/**
 * @since 9.0
 */
declare class SCNBillboardConstraint extends SCNConstraint {

	static alloc(): SCNBillboardConstraint; // inherited from NSObject

	static billboardConstraint(): SCNBillboardConstraint;

	static new(): SCNBillboardConstraint; // inherited from NSObject

	freeAxes: SCNBillboardAxis;
}

/**
 * @since 9.0
 */
declare const enum SCNBlendMode {

	Alpha = 0,

	Add = 1,

	Subtract = 2,

	Multiply = 3,

	Screen = 4,

	Replace = 5,

	Max = 6
}

interface SCNBoundingVolume extends NSObjectProtocol {

	getBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): boolean;

	getBoundingSphereCenterRadius(center: interop.Pointer | interop.Reference<SCNVector3>, radius: interop.Pointer | interop.Reference<number>): boolean;

	setBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): void;
}
declare var SCNBoundingVolume: {

	prototype: SCNBoundingVolume;
};

declare class SCNBox extends SCNGeometry {

	static alloc(): SCNBox; // inherited from NSObject

	static boxWithWidthHeightLengthChamferRadius(width: number, height: number, length: number, chamferRadius: number): SCNBox;

	static geometry(): SCNBox; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNBox; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNBox; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNBox; // inherited from SCNGeometry

	static new(): SCNBox; // inherited from NSObject

	chamferRadius: number;

	chamferSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	length: number;

	lengthSegmentCount: number;

	width: number;

	widthSegmentCount: number;
}

/**
 * @since 9.0
 */
declare const enum SCNBufferFrequency {

	PerFrame = 0,

	PerNode = 1,

	PerShadable = 2
}

interface SCNBufferStream extends NSObjectProtocol {

	writeBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): void;
}
declare var SCNBufferStream: {

	prototype: SCNBufferStream;
};

declare class SCNCamera extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNTechniqueSupport {

	static alloc(): SCNCamera; // inherited from NSObject

	static camera(): SCNCamera;

	/**
	 * @since 9.0
	 */
	static cameraWithMDLCamera(mdlCamera: MDLCamera): SCNCamera;

	static new(): SCNCamera; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	aperture: number;

	/**
	 * @since 11.0
	 */
	apertureBladeCount: number;

	automaticallyAdjustsZRange: boolean;

	/**
	 * @since 10.0
	 */
	averageGray: number;

	/**
	 * @since 10.0
	 */
	bloomBlurRadius: number;

	/**
	 * @since 10.0
	 */
	bloomIntensity: number;

	/**
	 * @since 13.0
	 */
	bloomIterationCount: number;

	/**
	 * @since 13.0
	 */
	bloomIterationSpread: number;

	/**
	 * @since 10.0
	 */
	bloomThreshold: number;

	categoryBitMask: number;

	/**
	 * @since 10.0
	 */
	colorFringeIntensity: number;

	/**
	 * @since 10.0
	 */
	colorFringeStrength: number;

	/**
	 * @since 10.0
	 */
	readonly colorGrading: SCNMaterialProperty;

	/**
	 * @since 10.0
	 */
	contrast: number;

	/**
	 * @since 10.0
	 */
	exposureAdaptationBrighteningSpeedFactor: number;

	/**
	 * @since 10.0
	 */
	exposureAdaptationDarkeningSpeedFactor: number;

	/**
	 * @since 10.0
	 */
	exposureOffset: number;

	/**
	 * @since 11.0
	 */
	fStop: number;

	/**
	 * @since 11.0
	 */
	fieldOfView: number;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	focalBlurRadius: number;

	/**
	 * @since 11.0
	 */
	focalBlurSampleCount: number;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	focalDistance: number;

	/**
	 * @since 11.0
	 */
	focalLength: number;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	focalSize: number;

	/**
	 * @since 11.0
	 */
	focusDistance: number;

	/**
	 * @since 13.0
	 */
	grainIntensity: number;

	/**
	 * @since 13.0
	 */
	grainIsColored: boolean;

	/**
	 * @since 13.0
	 */
	grainScale: number;

	/**
	 * @since 10.0
	 */
	maximumExposure: number;

	/**
	 * @since 10.0
	 */
	minimumExposure: number;

	/**
	 * @since 10.0
	 */
	motionBlurIntensity: number;

	name: string;

	orthographicScale: number;

	/**
	 * @since 11.0
	 */
	projectionDirection: SCNCameraProjectionDirection;

	projectionTransform: SCNMatrix4;

	/**
	 * @since 10.0
	 */
	saturation: number;

	/**
	 * @since 11.0
	 */
	screenSpaceAmbientOcclusionBias: number;

	/**
	 * @since 11.0
	 */
	screenSpaceAmbientOcclusionDepthThreshold: number;

	/**
	 * @since 11.0
	 */
	screenSpaceAmbientOcclusionIntensity: number;

	/**
	 * @since 11.0
	 */
	screenSpaceAmbientOcclusionNormalThreshold: number;

	/**
	 * @since 11.0
	 */
	screenSpaceAmbientOcclusionRadius: number;

	/**
	 * @since 11.0
	 */
	sensorHeight: number;

	usesOrthographicProjection: boolean;

	/**
	 * @since 10.0
	 */
	vignettingIntensity: number;

	/**
	 * @since 10.0
	 */
	vignettingPower: number;

	/**
	 * @since 11.0
	 */
	wantsDepthOfField: boolean;

	/**
	 * @since 10.0
	 */
	wantsExposureAdaptation: boolean;

	/**
	 * @since 10.0
	 */
	wantsHDR: boolean;

	/**
	 * @since 13.0
	 */
	whiteBalanceTemperature: number;

	/**
	 * @since 13.0
	 */
	whiteBalanceTint: number;

	/**
	 * @since 10.0
	 */
	whitePoint: number;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	xFov: number;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	yFov: number;

	zFar: number;

	zNear: number;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 13.0
	 */
	projectionTransformWithViewportSize(viewportSize: CGSize): SCNMatrix4;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

/**
 * @since 11.0
 */
interface SCNCameraControlConfiguration extends NSObjectProtocol {

	allowsTranslation: boolean;

	autoSwitchToFreeCamera: boolean;

	flyModeVelocity: number;

	panSensitivity: number;

	rotationSensitivity: number;

	truckSensitivity: number;
}
declare var SCNCameraControlConfiguration: {

	prototype: SCNCameraControlConfiguration;
};

/**
 * @since 11.0
 */
declare class SCNCameraController extends NSObject {

	static alloc(): SCNCameraController; // inherited from NSObject

	static new(): SCNCameraController; // inherited from NSObject

	automaticTarget: boolean;

	delegate: SCNCameraControllerDelegate;

	inertiaEnabled: boolean;

	inertiaFriction: number;

	readonly inertiaRunning: boolean;

	interactionMode: SCNInteractionMode;

	maximumHorizontalAngle: number;

	maximumVerticalAngle: number;

	minimumHorizontalAngle: number;

	minimumVerticalAngle: number;

	pointOfView: SCNNode;

	target: SCNVector3;

	worldUp: SCNVector3;

	beginInteractionWithViewport(location: CGPoint, viewport: CGSize): void;

	clearRoll(): void;

	continueInteractionWithViewportSensitivity(location: CGPoint, viewport: CGSize, sensitivity: number): void;

	dollyByOnScreenPointViewport(delta: number, point: CGPoint, viewport: CGSize): void;

	dollyToTarget(delta: number): void;

	endInteractionWithViewportVelocity(location: CGPoint, viewport: CGSize, velocity: CGPoint): void;

	frameNodes(nodes: NSArray<SCNNode> | SCNNode[]): void;

	rollAroundTarget(delta: number): void;

	rollByAroundScreenPointViewport(delta: number, point: CGPoint, viewport: CGSize): void;

	rotateByXY(deltaX: number, deltaY: number): void;

	stopInertia(): void;

	translateInCameraSpaceByXYZ(deltaX: number, deltaY: number, deltaZ: number): void;
}

/**
 * @since 11.0
 */
interface SCNCameraControllerDelegate extends NSObjectProtocol {

	cameraInertiaDidEndForController?(cameraController: SCNCameraController): void;

	cameraInertiaWillStartForController?(cameraController: SCNCameraController): void;
}
declare var SCNCameraControllerDelegate: {

	prototype: SCNCameraControllerDelegate;
};

/**
 * @since 11.0
 */
declare const enum SCNCameraProjectionDirection {

	Vertical = 0,

	Horizontal = 1
}

declare class SCNCapsule extends SCNGeometry {

	static alloc(): SCNCapsule; // inherited from NSObject

	static capsuleWithCapRadiusHeight(capRadius: number, height: number): SCNCapsule;

	static geometry(): SCNCapsule; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCapsule; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNCapsule; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNCapsule; // inherited from SCNGeometry

	static new(): SCNCapsule; // inherited from NSObject

	capRadius: number;

	capSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;
}

declare const enum SCNChamferMode {

	Both = 0,

	Front = 1,

	Back = 2
}

/**
 * @since 11.0
 */
declare const enum SCNColorMask {

	None = 0,

	Red = 8,

	Green = 4,

	Blue = 2,

	Alpha = 1,

	All = 15
}

declare class SCNCone extends SCNGeometry {

	static alloc(): SCNCone; // inherited from NSObject

	static coneWithTopRadiusBottomRadiusHeight(topRadius: number, bottomRadius: number, height: number): SCNCone;

	static geometry(): SCNCone; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCone; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNCone; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNCone; // inherited from SCNGeometry

	static new(): SCNCone; // inherited from NSObject

	bottomRadius: number;

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;

	topRadius: number;
}

declare var SCNConsistencyElementIDErrorKey: string;

declare var SCNConsistencyElementTypeErrorKey: string;

declare const SCNConsistencyInvalidArgumentError: number;

declare const SCNConsistencyInvalidCountError: number;

declare const SCNConsistencyInvalidURIError: number;

declare var SCNConsistencyLineNumberErrorKey: string;

declare const SCNConsistencyMissingAttributeError: number;

declare const SCNConsistencyMissingElementError: number;

declare const SCNConsistencyXMLSchemaValidationError: number;

declare class SCNConstraint extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNConstraint; // inherited from NSObject

	static new(): SCNConstraint; // inherited from NSObject

	enabled: boolean;

	/**
	 * @since 11.0
	 */
	incremental: boolean;

	influenceFactor: number;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare const enum SCNCullMode {

	Back = 0,

	Front = 1
}

declare class SCNCylinder extends SCNGeometry {

	static alloc(): SCNCylinder; // inherited from NSObject

	static cylinderWithRadiusHeight(radius: number, height: number): SCNCylinder;

	static geometry(): SCNCylinder; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCylinder; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNCylinder; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNCylinder; // inherited from SCNGeometry

	static new(): SCNCylinder; // inherited from NSObject

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;

	radius: number;
}

/**
 * @since 9.0
 */
declare const enum SCNDebugOptions {

	None = 0,

	ShowPhysicsShapes = 1,

	ShowBoundingBoxes = 2,

	ShowLightInfluences = 4,

	ShowLightExtents = 8,

	ShowPhysicsFields = 16,

	ShowWireframe = 32,

	RenderAsWireframe = 64,

	ShowSkeletons = 128,

	ShowCreases = 256,

	ShowConstraints = 512,

	ShowCameras = 1024
}

declare var SCNDetailedErrorsKey: string;

/**
 * @since 11.0
 */
declare class SCNDistanceConstraint extends SCNConstraint {

	static alloc(): SCNDistanceConstraint; // inherited from NSObject

	static distanceConstraintWithTarget(target: SCNNode): SCNDistanceConstraint;

	static new(): SCNDistanceConstraint; // inherited from NSObject

	maximumDistance: number;

	minimumDistance: number;

	target: SCNNode;
}

declare var SCNErrorDomain: string;

declare function SCNExportJavaScriptModule(context: JSContext): void;

/**
 * @since 11.0
 */
declare const enum SCNFillMode {

	Fill = 0,

	Lines = 1
}

declare const enum SCNFilterMode {

	None = 0,

	Nearest = 1,

	Linear = 2
}

declare class SCNFloor extends SCNGeometry {

	static alloc(): SCNFloor; // inherited from NSObject

	static floor(): SCNFloor;

	static geometry(): SCNFloor; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNFloor; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNFloor; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNFloor; // inherited from SCNGeometry

	static new(): SCNFloor; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	length: number;

	/**
	 * @since 10.0
	 */
	reflectionCategoryBitMask: number;

	reflectionFalloffEnd: number;

	reflectionFalloffStart: number;

	reflectionResolutionScaleFactor: number;

	reflectivity: number;

	/**
	 * @since 10.0
	 */
	width: number;
}

declare class SCNGeometry extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNBoundingVolume, SCNShadable {

	static alloc(): SCNGeometry; // inherited from NSObject

	static geometry(): SCNGeometry;

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNGeometry;

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNGeometry;

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNGeometry;

	static new(): SCNGeometry; // inherited from NSObject

	edgeCreasesElement: SCNGeometryElement;

	edgeCreasesSource: SCNGeometrySource;

	firstMaterial: SCNMaterial;

	readonly geometryElementCount: number;

	readonly geometryElements: NSArray<SCNGeometryElement>;

	/**
	 * @since 16.0
	 */
	readonly geometrySourceChannels: NSArray<number>;

	readonly geometrySources: NSArray<SCNGeometrySource>;

	levelsOfDetail: NSArray<SCNLevelOfDetail>;

	materials: NSArray<SCNMaterial>;

	name: string;

	subdivisionLevel: number;

	/**
	 * @since 11.0
	 */
	tessellator: SCNGeometryTessellator;

	/**
	 * @since 11.0
	 */
	wantsAdaptiveSubdivision: boolean;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	minimumLanguageVersion: number; // inherited from SCNShadable

	program: SCNProgram; // inherited from SCNShadable

	shaderModifiers: NSDictionary<string, string>; // inherited from SCNShadable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	geometryElementAtIndex(elementIndex: number): SCNGeometryElement;

	geometrySourcesForSemantic(semantic: string): NSArray<SCNGeometrySource>;

	getBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): boolean;

	getBoundingSphereCenterRadius(center: interop.Pointer | interop.Reference<SCNVector3>, radius: interop.Pointer | interop.Reference<number>): boolean;

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	handleUnbindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	initWithCoder(coder: NSCoder): this;

	insertMaterialAtIndex(material: SCNMaterial, index: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	materialWithName(name: string): SCNMaterial;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	removeMaterialAtIndex(index: number): void;

	replaceMaterialAtIndexWithMaterial(index: number, material: SCNMaterial): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare class SCNGeometryElement extends NSObject implements NSSecureCoding {

	static alloc(): SCNGeometryElement; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static geometryElementWithBufferPrimitiveTypePrimitiveCountBytesPerIndex(buffer: MTLBuffer, primitiveType: SCNGeometryPrimitiveType, primitiveCount: number, bytesPerIndex: number): SCNGeometryElement;

	/**
	 * @since 16.0
	 */
	static geometryElementWithBufferPrimitiveTypePrimitiveCountIndicesChannelCountInterleavedIndicesChannelsBytesPerIndex(buffer: MTLBuffer, primitiveType: SCNGeometryPrimitiveType, primitiveCount: number, indicesChannelCount: number, interleavedIndicesChannels: boolean, bytesPerIndex: number): SCNGeometryElement;

	static geometryElementWithDataPrimitiveTypePrimitiveCountBytesPerIndex(data: NSData, primitiveType: SCNGeometryPrimitiveType, primitiveCount: number, bytesPerIndex: number): SCNGeometryElement;

	/**
	 * @since 16.0
	 */
	static geometryElementWithDataPrimitiveTypePrimitiveCountIndicesChannelCountInterleavedIndicesChannelsBytesPerIndex(data: NSData, primitiveType: SCNGeometryPrimitiveType, primitiveCount: number, indicesChannelCount: number, interleavedIndicesChannels: boolean, bytesPerIndex: number): SCNGeometryElement;

	/**
	 * @since 9.0
	 */
	static geometryElementWithMDLSubmesh(mdlSubMesh: MDLSubmesh): SCNGeometryElement;

	static new(): SCNGeometryElement; // inherited from NSObject

	readonly bytesPerIndex: number;

	readonly data: NSData;

	/**
	 * @since 16.0
	 */
	readonly indicesChannelCount: number;

	/**
	 * @since 16.0
	 */
	readonly interleavedIndicesChannels: boolean;

	/**
	 * @since 11.0
	 */
	maximumPointScreenSpaceRadius: number;

	/**
	 * @since 11.0
	 */
	minimumPointScreenSpaceRadius: number;

	/**
	 * @since 11.0
	 */
	pointSize: number;

	readonly primitiveCount: number;

	/**
	 * @since 11.0
	 */
	primitiveRange: NSRange;

	readonly primitiveType: SCNGeometryPrimitiveType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum SCNGeometryPrimitiveType {

	Triangles = 0,

	TriangleStrip = 1,

	Line = 2,

	Point = 3,

	Polygon = 4
}

declare class SCNGeometrySource extends NSObject implements NSSecureCoding {

	static alloc(): SCNGeometrySource; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static geometrySourceWithBufferVertexFormatSemanticVertexCountDataOffsetDataStride(buffer: MTLBuffer, vertexFormat: MTLVertexFormat, semantic: string, vertexCount: number, offset: number, stride: number): SCNGeometrySource;

	static geometrySourceWithDataSemanticVectorCountFloatComponentsComponentsPerVectorBytesPerComponentDataOffsetDataStride(data: NSData, semantic: string, vectorCount: number, floatComponents: boolean, componentsPerVector: number, bytesPerComponent: number, offset: number, stride: number): SCNGeometrySource;

	static geometrySourceWithNormalsCount(normals: interop.Pointer | interop.Reference<SCNVector3>, count: number): SCNGeometrySource;

	static geometrySourceWithTextureCoordinatesCount(texcoord: interop.Pointer | interop.Reference<CGPoint>, count: number): SCNGeometrySource;

	static geometrySourceWithVerticesCount(vertices: interop.Pointer | interop.Reference<SCNVector3>, count: number): SCNGeometrySource;

	static new(): SCNGeometrySource; // inherited from NSObject

	readonly bytesPerComponent: number;

	readonly componentsPerVector: number;

	readonly data: NSData;

	readonly dataOffset: number;

	readonly dataStride: number;

	readonly floatComponents: boolean;

	readonly semantic: string;

	readonly vectorCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SCNGeometrySourceSemanticBoneIndices: string;

declare var SCNGeometrySourceSemanticBoneWeights: string;

declare var SCNGeometrySourceSemanticColor: string;

declare var SCNGeometrySourceSemanticEdgeCrease: string;

declare var SCNGeometrySourceSemanticNormal: string;

/**
 * @since 10.0
 */
declare var SCNGeometrySourceSemanticTangent: string;

declare var SCNGeometrySourceSemanticTexcoord: string;

declare var SCNGeometrySourceSemanticVertex: string;

declare var SCNGeometrySourceSemanticVertexCrease: string;

/**
 * @since 11.0
 */
declare class SCNGeometryTessellator extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNGeometryTessellator; // inherited from NSObject

	static new(): SCNGeometryTessellator; // inherited from NSObject

	adaptive: boolean;

	edgeTessellationFactor: number;

	insideTessellationFactor: number;

	maximumEdgeLength: number;

	screenSpace: boolean;

	smoothingMode: SCNTessellationSmoothingMode;

	tessellationFactorScale: number;

	tessellationPartitionMode: MTLTessellationPartitionMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SCNHitTestBackFaceCullingKey: string;

declare var SCNHitTestBoundingBoxOnlyKey: string;

declare var SCNHitTestClipToZRangeKey: string;

declare var SCNHitTestFirstFoundOnlyKey: string;

declare var SCNHitTestIgnoreChildNodesKey: string;

declare var SCNHitTestIgnoreHiddenNodesKey: string;

/**
 * @since 10.0
 */
declare var SCNHitTestOptionCategoryBitMask: string;

/**
 * @since 13.0
 */
declare var SCNHitTestOptionIgnoreLightArea: string;

/**
 * @since 11.0
 */
declare var SCNHitTestOptionSearchMode: string;

declare class SCNHitTestResult extends NSObject {

	static alloc(): SCNHitTestResult; // inherited from NSObject

	static new(): SCNHitTestResult; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly boneNode: SCNNode;

	readonly faceIndex: number;

	readonly geometryIndex: number;

	readonly localCoordinates: SCNVector3;

	readonly localNormal: SCNVector3;

	readonly modelTransform: SCNMatrix4;

	readonly node: SCNNode;

	/**
	 * @since 13.0
	 */
	readonly simdLocalCoordinates: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	readonly simdLocalNormal: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	readonly simdModelTransform: simd_float4x4;

	/**
	 * @since 13.0
	 */
	readonly simdWorldCoordinates: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	readonly simdWorldNormal: interop.Reference<number>;

	readonly worldCoordinates: SCNVector3;

	readonly worldNormal: SCNVector3;

	textureCoordinatesWithMappingChannel(channel: number): CGPoint;
}

declare var SCNHitTestRootNodeKey: string;

/**
 * @since 11.0
 */
declare const enum SCNHitTestSearchMode {

	Closest = 0,

	All = 1,

	Any = 2
}

declare var SCNHitTestSortResultsKey: string;

declare class SCNIKConstraint extends SCNConstraint {

	static alloc(): SCNIKConstraint; // inherited from NSObject

	static inverseKinematicsConstraintWithChainRootNode(chainRootNode: SCNNode): SCNIKConstraint;

	static new(): SCNIKConstraint; // inherited from NSObject

	readonly chainRootNode: SCNNode;

	targetPosition: SCNVector3;

	/**
	 * @since 9.0
	 */
	constructor(o: { chainRootNode: SCNNode; });

	/**
	 * @since 9.0
	 */
	initWithChainRootNode(chainRootNode: SCNNode): this;

	maxAllowedRotationAngleForJoint(node: SCNNode): number;

	setMaxAllowedRotationAngleForJoint(angle: number, node: SCNNode): void;
}

/**
 * @since 11.0
 */
declare const enum SCNInteractionMode {

	Fly = 0,

	OrbitTurntable = 1,

	OrbitAngleMapping = 2,

	OrbitCenteredArcball = 3,

	OrbitArcball = 4,

	Pan = 5,

	Truck = 6
}

declare class SCNLevelOfDetail extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNLevelOfDetail; // inherited from NSObject

	static levelOfDetailWithGeometryScreenSpaceRadius(geometry: SCNGeometry, radius: number): SCNLevelOfDetail;

	static levelOfDetailWithGeometryWorldSpaceDistance(geometry: SCNGeometry, distance: number): SCNLevelOfDetail;

	static new(): SCNLevelOfDetail; // inherited from NSObject

	readonly geometry: SCNGeometry;

	readonly screenSpaceRadius: number;

	readonly worldSpaceDistance: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SCNLight extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNTechniqueSupport {

	static alloc(): SCNLight; // inherited from NSObject

	static light(): SCNLight;

	/**
	 * @since 9.0
	 */
	static lightWithMDLLight(mdlLight: MDLLight): SCNLight;

	static new(): SCNLight; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	IESProfileURL: NSURL;

	/**
	 * @since 13.0
	 */
	areaExtents: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	areaPolygonVertices: NSArray<NSValue>;

	/**
	 * @since 13.0
	 */
	areaType: SCNLightAreaType;

	attenuationEndDistance: number;

	attenuationFalloffExponent: number;

	attenuationStartDistance: number;

	/**
	 * @since 11.0
	 */
	automaticallyAdjustsShadowProjection: boolean;

	castsShadow: boolean;

	categoryBitMask: number;

	color: any;

	/**
	 * @since 13.0
	 */
	doubleSided: boolean;

	/**
	 * @since 13.0
	 */
	drawsArea: boolean;

	/**
	 * @since 11.0
	 */
	forcesBackFaceCasters: boolean;

	readonly gobo: SCNMaterialProperty;

	/**
	 * @since 10.0
	 */
	intensity: number;

	/**
	 * @since 11.0
	 */
	maximumShadowDistance: number;

	name: string;

	orthographicScale: number;

	/**
	 * @since 13.0
	 */
	parallaxCenterOffset: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	parallaxCorrectionEnabled: boolean;

	/**
	 * @since 13.0
	 */
	parallaxExtentsFactor: interop.Reference<number>;

	/**
	 * @since 12.0
	 */
	readonly probeEnvironment: SCNMaterialProperty;

	/**
	 * @since 13.0
	 */
	probeExtents: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	probeOffset: interop.Reference<number>;

	/**
	 * @since 13.0
	 */
	probeType: SCNLightProbeType;

	/**
	 * @since 13.0
	 */
	probeUpdateType: SCNLightProbeUpdateType;

	/**
	 * @since 11.0
	 */
	sampleDistributedShadowMaps: boolean;

	shadowBias: number;

	/**
	 * @since 11.0
	 */
	shadowCascadeCount: number;

	/**
	 * @since 11.0
	 */
	shadowCascadeSplittingFactor: number;

	shadowColor: any;

	shadowMapSize: CGSize;

	shadowMode: SCNShadowMode;

	shadowRadius: number;

	shadowSampleCount: number;

	/**
	 * @since 11.0
	 */
	readonly sphericalHarmonicsCoefficients: NSData;

	spotInnerAngle: number;

	spotOuterAngle: number;

	/**
	 * @since 10.0
	 */
	temperature: number;

	type: string;

	zFar: number;

	zNear: number;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

/**
 * @since 13.0
 */
declare const enum SCNLightAreaType {

	Rectangle = 1,

	Polygon = 4
}

/**
 * @since 13.0
 */
declare const enum SCNLightProbeType {

	Irradiance = 0,

	Radiance = 1
}

/**
 * @since 13.0
 */
declare const enum SCNLightProbeUpdateType {

	Never = 0,

	Realtime = 1
}

declare var SCNLightTypeAmbient: string;

/**
 * @since 13.0
 */
declare var SCNLightTypeArea: string;

declare var SCNLightTypeDirectional: string;

/**
 * @since 10.0
 */
declare var SCNLightTypeIES: string;

declare var SCNLightTypeOmni: string;

/**
 * @since 10.0
 */
declare var SCNLightTypeProbe: string;

declare var SCNLightTypeSpot: string;

declare var SCNLightingModelBlinn: string;

declare var SCNLightingModelConstant: string;

declare var SCNLightingModelLambert: string;

declare var SCNLightingModelPhong: string;

/**
 * @since 10.0
 */
declare var SCNLightingModelPhysicallyBased: string;

/**
 * @since 13.0
 */
declare var SCNLightingModelShadowOnly: string;

declare class SCNLookAtConstraint extends SCNConstraint {

	static alloc(): SCNLookAtConstraint; // inherited from NSObject

	static lookAtConstraintWithTarget(target: SCNNode): SCNLookAtConstraint;

	static new(): SCNLookAtConstraint; // inherited from NSObject

	gimbalLockEnabled: boolean;

	/**
	 * @since 11.0
	 */
	localFront: SCNVector3;

	target: SCNNode;

	/**
	 * @since 11.0
	 */
	targetOffset: SCNVector3;

	/**
	 * @since 11.0
	 */
	worldUp: SCNVector3;

	/**
	 * @since 10.0
	 */
	setTarget(target: SCNNode): void;
}

declare class SCNMaterial extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNShadable {

	static alloc(): SCNMaterial; // inherited from NSObject

	static material(): SCNMaterial;

	/**
	 * @since 9.0
	 */
	static materialWithMDLMaterial(mdlMaterial: MDLMaterial): SCNMaterial;

	static new(): SCNMaterial; // inherited from NSObject

	readonly ambient: SCNMaterialProperty;

	/**
	 * @since 9.0
	 */
	readonly ambientOcclusion: SCNMaterialProperty;

	/**
	 * @since 9.0
	 */
	blendMode: SCNBlendMode;

	/**
	 * @since 13.0
	 */
	readonly clearCoat: SCNMaterialProperty;

	/**
	 * @since 13.0
	 */
	readonly clearCoatNormal: SCNMaterialProperty;

	/**
	 * @since 13.0
	 */
	readonly clearCoatRoughness: SCNMaterialProperty;

	/**
	 * @since 11.0
	 */
	colorBufferWriteMask: SCNColorMask;

	cullMode: SCNCullMode;

	readonly diffuse: SCNMaterialProperty;

	/**
	 * @since 11.0
	 */
	readonly displacement: SCNMaterialProperty;

	doubleSided: boolean;

	readonly emission: SCNMaterialProperty;

	/**
	 * @since 11.0
	 */
	fillMode: SCNFillMode;

	fresnelExponent: number;

	lightingModelName: string;

	litPerPixel: boolean;

	locksAmbientWithDiffuse: boolean;

	/**
	 * @since 10.0
	 */
	readonly metalness: SCNMaterialProperty;

	readonly multiply: SCNMaterialProperty;

	name: string;

	readonly normal: SCNMaterialProperty;

	readsFromDepthBuffer: boolean;

	readonly reflective: SCNMaterialProperty;

	/**
	 * @since 10.0
	 */
	readonly roughness: SCNMaterialProperty;

	/**
	 * @since 9.0
	 */
	readonly selfIllumination: SCNMaterialProperty;

	shininess: number;

	readonly specular: SCNMaterialProperty;

	transparency: number;

	transparencyMode: SCNTransparencyMode;

	readonly transparent: SCNMaterialProperty;

	writesToDepthBuffer: boolean;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	minimumLanguageVersion: number; // inherited from SCNShadable

	program: SCNProgram; // inherited from SCNShadable

	shaderModifiers: NSDictionary<string, string>; // inherited from SCNShadable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	handleUnbindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare class SCNMaterialProperty extends NSObject implements NSSecureCoding, SCNAnimatable {

	static alloc(): SCNMaterialProperty; // inherited from NSObject

	static materialPropertyWithContents(contents: any): SCNMaterialProperty;

	static new(): SCNMaterialProperty; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static precomputedLightingEnvironmentContentsWithDataError(data: NSData): any;

	/**
	 * @since 17.0
	 */
	static precomputedLightingEnvironmentContentsWithURLError(url: NSURL): any;

	/**
	 * @since 17.0
	 */
	static precomputedLightingEnvironmentDataForContentsDeviceError(contents: any, device: MTLDevice): NSData;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	borderColor: any;

	contents: any;

	contentsTransform: SCNMatrix4;

	intensity: number;

	magnificationFilter: SCNFilterMode;

	mappingChannel: number;

	maxAnisotropy: number;

	minificationFilter: SCNFilterMode;

	mipFilter: SCNFilterMode;

	/**
	 * @since 11.0
	 */
	textureComponents: SCNColorMask;

	wrapS: SCNWrapMode;

	wrapT: SCNWrapMode;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

interface SCNMatrix4 {
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
declare var SCNMatrix4: interop.StructType<SCNMatrix4>;

declare function SCNMatrix4EqualToMatrix4(a: SCNMatrix4, b: SCNMatrix4): boolean;

declare var SCNMatrix4Identity: SCNMatrix4;

declare function SCNMatrix4Invert(m: SCNMatrix4): SCNMatrix4;

declare function SCNMatrix4IsIdentity(m: SCNMatrix4): boolean;

declare function SCNMatrix4MakeRotation(angle: number, x: number, y: number, z: number): SCNMatrix4;

declare function SCNMatrix4Mult(a: SCNMatrix4, b: SCNMatrix4): SCNMatrix4;

declare function SCNMatrix4Rotate(m: SCNMatrix4, angle: number, x: number, y: number, z: number): SCNMatrix4;

declare function SCNMatrix4Scale(m: SCNMatrix4, sx: number, sy: number, sz: number): SCNMatrix4;

declare var SCNModelTransform: string;

declare var SCNModelViewProjectionTransform: string;

declare var SCNModelViewTransform: string;

declare class SCNMorpher extends NSObject implements NSSecureCoding, SCNAnimatable {

	static alloc(): SCNMorpher; // inherited from NSObject

	static new(): SCNMorpher; // inherited from NSObject

	calculationMode: SCNMorpherCalculationMode;

	targets: NSArray<SCNGeometry>;

	/**
	 * @since 11.0
	 */
	unifiesNormals: boolean;

	/**
	 * @since 11.0
	 */
	weights: NSArray<number>;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;

	setWeightForTargetAtIndex(weight: number, targetIndex: number): void;

	/**
	 * @since 11.0
	 */
	setWeightForTargetNamed(weight: number, targetName: string): void;

	weightForTargetAtIndex(targetIndex: number): number;

	/**
	 * @since 11.0
	 */
	weightForTargetNamed(targetName: string): number;
}

declare const enum SCNMorpherCalculationMode {

	Normalized = 0,

	Additive = 1
}

/**
 * @since 10.0
 */
declare const enum SCNMovabilityHint {

	Fixed = 0,

	Movable = 1
}

declare class SCNNode extends NSObject implements NSCopying, NSSecureCoding, SCNActionable, SCNAnimatable, SCNBoundingVolume, UIFocusItem {

	static alloc(): SCNNode; // inherited from NSObject

	static new(): SCNNode; // inherited from NSObject

	static node(): SCNNode;

	static nodeWithGeometry(geometry: SCNGeometry): SCNNode;

	/**
	 * @since 9.0
	 */
	static nodeWithMDLObject(mdlObject: MDLObject): SCNNode;

	/**
	 * @since 9.0
	 */
	readonly audioPlayers: NSArray<SCNAudioPlayer>;

	camera: SCNCamera;

	castsShadow: boolean;

	categoryBitMask: number;

	readonly childNodes: NSArray<SCNNode>;

	constraints: NSArray<SCNConstraint>;

	/**
	 * @since 11.0
	 */
	entity: GKEntity;

	eulerAngles: SCNVector3;

	filters: NSArray<CIFilter>;

	/**
	 * @since 11.0
	 */
	focusBehavior: SCNNodeFocusBehavior;

	geometry: SCNGeometry;

	hidden: boolean;

	light: SCNLight;

	morpher: SCNMorpher;

	/**
	 * @since 10.0
	 */
	movabilityHint: SCNMovabilityHint;

	name: string;

	opacity: number;

	orientation: SCNVector4;

	readonly parentNode: SCNNode;

	readonly particleSystems: NSArray<SCNParticleSystem>;

	paused: boolean;

	physicsBody: SCNPhysicsBody;

	physicsField: SCNPhysicsField;

	pivot: SCNMatrix4;

	position: SCNVector3;

	readonly presentationNode: SCNNode;

	rendererDelegate: SCNNodeRendererDelegate;

	renderingOrder: number;

	rotation: SCNVector4;

	scale: SCNVector3;

	/**
	 * @since 11.0
	 */
	simdEulerAngles: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdOrientation: simd_quatf;

	/**
	 * @since 11.0
	 */
	simdPivot: simd_float4x4;

	/**
	 * @since 11.0
	 */
	simdPosition: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdRotation: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdScale: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdTransform: simd_float4x4;

	/**
	 * @since 11.0
	 */
	readonly simdWorldFront: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdWorldOrientation: simd_quatf;

	/**
	 * @since 11.0
	 */
	simdWorldPosition: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	readonly simdWorldRight: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdWorldTransform: simd_float4x4;

	/**
	 * @since 11.0
	 */
	readonly simdWorldUp: interop.Reference<number>;

	skinner: SCNSkinner;

	transform: SCNMatrix4;

	/**
	 * @since 11.0
	 */
	readonly worldFront: SCNVector3;

	/**
	 * @since 11.0
	 */
	worldOrientation: SCNVector4;

	/**
	 * @since 11.0
	 */
	worldPosition: SCNVector3;

	/**
	 * @since 11.0
	 */
	readonly worldRight: SCNVector3;

	readonly worldTransform: SCNMatrix4;

	/**
	 * @since 11.0
	 */
	readonly worldUp: SCNVector3;

	/**
	 * @since 11.0
	 */
	static readonly localFront: SCNVector3;

	/**
	 * @since 11.0
	 */
	static readonly localRight: SCNVector3;

	/**
	 * @since 11.0
	 */
	static readonly localUp: SCNVector3;

	/**
	 * @since 11.0
	 */
	static readonly simdLocalFront: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	static readonly simdLocalRight: interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	static readonly simdLocalUp: interop.Reference<number>;

	readonly actionKeys: NSArray<string>; // inherited from SCNActionable

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly canBecomeFocused: boolean; // inherited from UIFocusItem

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	readonly focusEffect: UIFocusEffect; // inherited from UIFocusItem

	/**
	 * @since 14.0
	 */
	readonly focusGroupIdentifier: string; // inherited from UIFocusEnvironment

	/**
	 * @since 15.0
	 */
	readonly focusGroupPriority: number; // inherited from UIFocusItem

	/**
	 * @since 12.0
	 */
	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly focusItemDeferralMode: UIFocusItemDeferralMode; // inherited from UIFocusItem

	/**
	 * @since 12.0
	 */
	readonly frame: CGRect; // inherited from UIFocusItem

	readonly hasActions: boolean; // inherited from SCNActionable

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	readonly isTransparentFocusItem: boolean; // inherited from UIFocusItem

	/**
	 * @since 12.0
	 */
	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	actionForKey(key: string): SCNAction;

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 9.0
	 */
	addAudioPlayer(player: SCNAudioPlayer): void;

	addChildNode(child: SCNNode): void;

	addParticleSystem(system: SCNParticleSystem): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	childNodeWithNameRecursively(name: string, recursively: boolean): SCNNode;

	childNodesPassingTest(predicate: (p1: SCNNode, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSArray<SCNNode>;

	class(): typeof NSObject;

	clone(): this;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	convertPositionFromNode(position: SCNVector3, node: SCNNode): SCNVector3;

	convertPositionToNode(position: SCNVector3, node: SCNNode): SCNVector3;

	convertTransformFromNode(transform: SCNMatrix4, node: SCNNode): SCNMatrix4;

	convertTransformToNode(transform: SCNMatrix4, node: SCNNode): SCNMatrix4;

	/**
	 * @since 11.0
	 */
	convertVectorFromNode(vector: SCNVector3, node: SCNNode): SCNVector3;

	/**
	 * @since 11.0
	 */
	convertVectorToNode(vector: SCNVector3, node: SCNNode): SCNVector3;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 12.0
	 */
	didHintFocusMovement(hint: UIFocusMovementHint): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	encodeWithCoder(coder: NSCoder): void;

	enumerateChildNodesUsingBlock(block: (p1: SCNNode, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 10.0
	 */
	enumerateHierarchyUsingBlock(block: (p1: SCNNode, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	flattenedClone(): this;

	getBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): boolean;

	getBoundingSphereCenterRadius(center: interop.Pointer | interop.Reference<SCNVector3>, radius: interop.Pointer | interop.Reference<number>): boolean;

	hitTestWithSegmentFromPointToPointOptions(pointA: SCNVector3, pointB: SCNVector3, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	initWithCoder(coder: NSCoder): this;

	insertChildNodeAtIndex(child: SCNNode, index: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 11.0
	 */
	localRotateBy(rotation: SCNVector4): void;

	/**
	 * @since 11.0
	 */
	localTranslateBy(translation: SCNVector3): void;

	/**
	 * @since 11.0
	 */
	lookAt(worldTarget: SCNVector3): void;

	/**
	 * @since 11.0
	 */
	lookAtUpLocalFront(worldTarget: SCNVector3, worldUp: SCNVector3, localFront: SCNVector3): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeActionForKey(key: string): void;

	removeAllActions(): void;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	/**
	 * @since 9.0
	 */
	removeAllAudioPlayers(): void;

	removeAllParticleSystems(): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	/**
	 * @since 9.0
	 */
	removeAudioPlayer(player: SCNAudioPlayer): void;

	removeFromParentNode(): void;

	removeParticleSystem(system: SCNParticleSystem): void;

	replaceChildNodeWith(oldChild: SCNNode, newChild: SCNNode): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	rotateByAroundTarget(worldRotation: SCNVector4, worldTarget: SCNVector3): void;

	runAction(action: SCNAction): void;

	runActionCompletionHandler(action: SCNAction, block: () => void): void;

	runActionForKey(action: SCNAction, key: string): void;

	runActionForKeyCompletionHandler(action: SCNAction, key: string, block: () => void): void;

	self(): this;

	setBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): void;

	setNeedsFocusUpdate(): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;

	/**
	 * @since 11.0
	 */
	setWorldTransform(worldTransform: SCNMatrix4): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	/**
	 * @since 11.0
	 */
	simdConvertPositionFromNode(position: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdConvertPositionToNode(position: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdConvertTransformFromNode(transform: simd_float4x4, node: SCNNode): simd_float4x4;

	/**
	 * @since 11.0
	 */
	simdConvertTransformToNode(transform: simd_float4x4, node: SCNNode): simd_float4x4;

	/**
	 * @since 11.0
	 */
	simdConvertVectorFromNode(vector: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdConvertVectorToNode(vector: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	/**
	 * @since 11.0
	 */
	simdLocalRotateBy(rotation: simd_quatf): void;

	/**
	 * @since 11.0
	 */
	simdLocalTranslateBy(translation: interop.Reference<number>): void;

	/**
	 * @since 11.0
	 */
	simdLookAt(worldTarget: interop.Reference<number>): void;

	/**
	 * @since 11.0
	 */
	simdLookAtUpLocalFront(worldTarget: interop.Reference<number>, worldUp: interop.Reference<number>, localFront: interop.Reference<number>): void;

	/**
	 * @since 11.0
	 */
	simdRotateByAroundTarget(worldRotation: simd_quatf, worldTarget: interop.Reference<number>): void;

	updateFocusIfNeeded(): void;
}

/**
 * @since 11.0
 */
declare const enum SCNNodeFocusBehavior {

	None = 0,

	Occluding = 1,

	Focusable = 2
}

interface SCNNodeRendererDelegate extends NSObjectProtocol {

	renderNodeRendererArguments?(node: SCNNode, renderer: SCNRenderer, _arguments: NSDictionary<string, any>): void;
}
declare var SCNNodeRendererDelegate: {

	prototype: SCNNodeRendererDelegate;
};

declare var SCNNormalTransform: string;

declare const enum SCNParticleBirthDirection {

	Constant = 0,

	SurfaceNormal = 1,

	Random = 2
}

declare const enum SCNParticleBirthLocation {

	Surface = 0,

	Volume = 1,

	Vertex = 2
}

declare const enum SCNParticleBlendMode {

	Additive = 0,

	Subtract = 1,

	Multiply = 2,

	Screen = 3,

	Alpha = 4,

	Replace = 5
}

declare const enum SCNParticleEvent {

	Birth = 0,

	Death = 1,

	Collision = 2
}

declare const enum SCNParticleImageSequenceAnimationMode {

	Repeat = 0,

	Clamp = 1,

	AutoReverse = 2
}

declare const enum SCNParticleInputMode {

	OverLife = 0,

	OverDistance = 1,

	OverOtherProperty = 2
}

declare const enum SCNParticleModifierStage {

	PreDynamics = 0,

	PostDynamics = 1,

	PreCollision = 2,

	PostCollision = 3
}

declare const enum SCNParticleOrientationMode {

	BillboardScreenAligned = 0,

	BillboardViewAligned = 1,

	Free = 2,

	BillboardYAligned = 3
}

declare var SCNParticlePropertyAngle: string;

declare var SCNParticlePropertyAngularVelocity: string;

declare var SCNParticlePropertyBounce: string;

declare var SCNParticlePropertyCharge: string;

declare var SCNParticlePropertyColor: string;

declare var SCNParticlePropertyContactNormal: string;

declare var SCNParticlePropertyContactPoint: string;

declare class SCNParticlePropertyController extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNParticlePropertyController; // inherited from NSObject

	static controllerWithAnimation(animation: CAAnimation): SCNParticlePropertyController;

	static new(): SCNParticlePropertyController; // inherited from NSObject

	animation: CAAnimation;

	inputBias: number;

	inputMode: SCNParticleInputMode;

	inputOrigin: SCNNode;

	inputProperty: string;

	inputScale: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SCNParticlePropertyFrame: string;

declare var SCNParticlePropertyFrameRate: string;

declare var SCNParticlePropertyFriction: string;

declare var SCNParticlePropertyLife: string;

declare var SCNParticlePropertyOpacity: string;

declare var SCNParticlePropertyPosition: string;

declare var SCNParticlePropertyRotationAxis: string;

declare var SCNParticlePropertySize: string;

declare var SCNParticlePropertyVelocity: string;

declare const enum SCNParticleSortingMode {

	None = 0,

	ProjectedDepth = 1,

	Distance = 2,

	OldestFirst = 3,

	YoungestFirst = 4
}

declare class SCNParticleSystem extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNParticleSystem; // inherited from NSObject

	static new(): SCNParticleSystem; // inherited from NSObject

	static particleSystem(): SCNParticleSystem;

	static particleSystemNamedInDirectory(name: string, directory: string): SCNParticleSystem;

	acceleration: SCNVector3;

	affectedByGravity: boolean;

	affectedByPhysicsFields: boolean;

	birthDirection: SCNParticleBirthDirection;

	birthLocation: SCNParticleBirthLocation;

	birthRate: number;

	birthRateVariation: number;

	blackPassEnabled: boolean;

	blendMode: SCNParticleBlendMode;

	colliderNodes: NSArray<SCNNode>;

	dampingFactor: number;

	emissionDuration: number;

	emissionDurationVariation: number;

	emitterShape: SCNGeometry;

	emittingDirection: SCNVector3;

	fresnelExponent: number;

	idleDuration: number;

	idleDurationVariation: number;

	imageSequenceAnimationMode: SCNParticleImageSequenceAnimationMode;

	imageSequenceColumnCount: number;

	imageSequenceFrameRate: number;

	imageSequenceFrameRateVariation: number;

	imageSequenceInitialFrame: number;

	imageSequenceInitialFrameVariation: number;

	imageSequenceRowCount: number;

	lightingEnabled: boolean;

	local: boolean;

	loops: boolean;

	/**
	 * @since 11.0
	 */
	orientationDirection: SCNVector3;

	orientationMode: SCNParticleOrientationMode;

	particleAngle: number;

	particleAngleVariation: number;

	particleAngularVelocity: number;

	particleAngularVelocityVariation: number;

	particleBounce: number;

	particleBounceVariation: number;

	particleCharge: number;

	particleChargeVariation: number;

	particleColor: UIColor;

	particleColorVariation: SCNVector4;

	particleDiesOnCollision: boolean;

	particleFriction: number;

	particleFrictionVariation: number;

	particleImage: any;

	/**
	 * @since 11.0
	 */
	particleIntensity: number;

	/**
	 * @since 11.0
	 */
	particleIntensityVariation: number;

	particleLifeSpan: number;

	particleLifeSpanVariation: number;

	particleMass: number;

	particleMassVariation: number;

	particleSize: number;

	particleSizeVariation: number;

	particleVelocity: number;

	particleVelocityVariation: number;

	propertyControllers: NSDictionary<string, SCNParticlePropertyController>;

	sortingMode: SCNParticleSortingMode;

	speedFactor: number;

	spreadingAngle: number;

	stretchFactor: number;

	systemSpawnedOnCollision: SCNParticleSystem;

	systemSpawnedOnDying: SCNParticleSystem;

	systemSpawnedOnLiving: SCNParticleSystem;

	warmupDuration: number;

	/**
	 * @since 15.0
	 */
	writesToDepthBuffer: boolean;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	addModifierForPropertiesAtStageWithBlock(properties: NSArray<string> | string[], stage: SCNParticleModifierStage, block: (p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: number, p5: number) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	handleEventForPropertiesWithBlock(event: SCNParticleEvent, properties: NSArray<string> | string[], block: (p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: number) => void): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAllModifiers(): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	removeModifiersOfStage(stage: SCNParticleModifierStage): void;

	reset(): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare class SCNPhysicsBallSocketJoint extends SCNPhysicsBehavior {

	static alloc(): SCNPhysicsBallSocketJoint; // inherited from NSObject

	static jointWithBodyAAnchorABodyBAnchorB(bodyA: SCNPhysicsBody, anchorA: SCNVector3, bodyB: SCNPhysicsBody, anchorB: SCNVector3): SCNPhysicsBallSocketJoint;

	static jointWithBodyAnchor(body: SCNPhysicsBody, anchor: SCNVector3): SCNPhysicsBallSocketJoint;

	static new(): SCNPhysicsBallSocketJoint; // inherited from NSObject

	anchorA: SCNVector3;

	anchorB: SCNVector3;

	readonly bodyA: SCNPhysicsBody;

	readonly bodyB: SCNPhysicsBody;
}

declare class SCNPhysicsBehavior extends NSObject implements NSSecureCoding {

	static alloc(): SCNPhysicsBehavior; // inherited from NSObject

	static new(): SCNPhysicsBehavior; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SCNPhysicsBody extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsBody; // inherited from NSObject

	static bodyWithTypeShape(type: SCNPhysicsBodyType, shape: SCNPhysicsShape): SCNPhysicsBody;

	static dynamicBody(): SCNPhysicsBody;

	static kinematicBody(): SCNPhysicsBody;

	static new(): SCNPhysicsBody; // inherited from NSObject

	static staticBody(): SCNPhysicsBody;

	/**
	 * @since 9.0
	 */
	affectedByGravity: boolean;

	allowsResting: boolean;

	angularDamping: number;

	/**
	 * @since 12.0
	 */
	angularRestingThreshold: number;

	angularVelocity: SCNVector4;

	angularVelocityFactor: SCNVector3;

	categoryBitMask: number;

	/**
	 * @since 12.0
	 */
	centerOfMassOffset: SCNVector3;

	charge: number;

	collisionBitMask: number;

	/**
	 * @since 9.0
	 */
	contactTestBitMask: number;

	/**
	 * @since 12.0
	 */
	continuousCollisionDetectionThreshold: number;

	damping: number;

	friction: number;

	readonly isResting: boolean;

	/**
	 * @since 12.0
	 */
	linearRestingThreshold: number;

	mass: number;

	/**
	 * @since 9.0
	 */
	momentOfInertia: SCNVector3;

	physicsShape: SCNPhysicsShape;

	restitution: number;

	rollingFriction: number;

	type: SCNPhysicsBodyType;

	/**
	 * @since 9.0
	 */
	usesDefaultMomentOfInertia: boolean;

	velocity: SCNVector3;

	velocityFactor: SCNVector3;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	applyForceAtPositionImpulse(direction: SCNVector3, position: SCNVector3, impulse: boolean): void;

	applyForceImpulse(direction: SCNVector3, impulse: boolean): void;

	applyTorqueImpulse(torque: SCNVector4, impulse: boolean): void;

	clearAllForces(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	resetTransform(): void;

	/**
	 * @since 12.0
	 */
	setResting(resting: boolean): void;
}

declare const enum SCNPhysicsBodyType {

	Static = 0,

	Dynamic = 1,

	Kinematic = 2
}

declare const enum SCNPhysicsCollisionCategory {

	Default = 1,

	Static = 2,

	All = -1
}

/**
 * @since 11.0
 */
declare class SCNPhysicsConeTwistJoint extends SCNPhysicsBehavior {

	static alloc(): SCNPhysicsConeTwistJoint; // inherited from NSObject

	static jointWithBodyAFrameABodyBFrameB(bodyA: SCNPhysicsBody, frameA: SCNMatrix4, bodyB: SCNPhysicsBody, frameB: SCNMatrix4): SCNPhysicsConeTwistJoint;

	static jointWithBodyFrame(body: SCNPhysicsBody, frame: SCNMatrix4): SCNPhysicsConeTwistJoint;

	static new(): SCNPhysicsConeTwistJoint; // inherited from NSObject

	readonly bodyA: SCNPhysicsBody;

	readonly bodyB: SCNPhysicsBody;

	frameA: SCNMatrix4;

	frameB: SCNMatrix4;

	maximumAngularLimit1: number;

	maximumAngularLimit2: number;

	maximumTwistAngle: number;
}

declare class SCNPhysicsContact extends NSObject {

	static alloc(): SCNPhysicsContact; // inherited from NSObject

	static new(): SCNPhysicsContact; // inherited from NSObject

	readonly collisionImpulse: number;

	readonly contactNormal: SCNVector3;

	readonly contactPoint: SCNVector3;

	readonly nodeA: SCNNode;

	readonly nodeB: SCNNode;

	readonly penetrationDistance: number;

	/**
	 * @since 11.0
	 */
	readonly sweepTestFraction: number;
}

interface SCNPhysicsContactDelegate extends NSObjectProtocol {

	physicsWorldDidBeginContact?(world: SCNPhysicsWorld, contact: SCNPhysicsContact): void;

	physicsWorldDidEndContact?(world: SCNPhysicsWorld, contact: SCNPhysicsContact): void;

	physicsWorldDidUpdateContact?(world: SCNPhysicsWorld, contact: SCNPhysicsContact): void;
}
declare var SCNPhysicsContactDelegate: {

	prototype: SCNPhysicsContactDelegate;
};

declare class SCNPhysicsField extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsField; // inherited from NSObject

	static customFieldWithEvaluationBlock(block: (p1: SCNVector3, p2: SCNVector3, p3: number, p4: number, p5: number) => SCNVector3): SCNPhysicsField;

	static dragField(): SCNPhysicsField;

	static electricField(): SCNPhysicsField;

	static linearGravityField(): SCNPhysicsField;

	static magneticField(): SCNPhysicsField;

	static new(): SCNPhysicsField; // inherited from NSObject

	static noiseFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SCNPhysicsField;

	static radialGravityField(): SCNPhysicsField;

	static springField(): SCNPhysicsField;

	static turbulenceFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SCNPhysicsField;

	static vortexField(): SCNPhysicsField;

	active: boolean;

	categoryBitMask: number;

	direction: SCNVector3;

	exclusive: boolean;

	falloffExponent: number;

	halfExtent: SCNVector3;

	minimumDistance: number;

	offset: SCNVector3;

	scope: SCNPhysicsFieldScope;

	strength: number;

	usesEllipsoidalExtent: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum SCNPhysicsFieldScope {

	InsideExtent = 0,

	OutsideExtent = 1
}

declare class SCNPhysicsHingeJoint extends SCNPhysicsBehavior {

	static alloc(): SCNPhysicsHingeJoint; // inherited from NSObject

	static jointWithBodyAAxisAAnchorABodyBAxisBAnchorB(bodyA: SCNPhysicsBody, axisA: SCNVector3, anchorA: SCNVector3, bodyB: SCNPhysicsBody, axisB: SCNVector3, anchorB: SCNVector3): SCNPhysicsHingeJoint;

	static jointWithBodyAxisAnchor(body: SCNPhysicsBody, axis: SCNVector3, anchor: SCNVector3): SCNPhysicsHingeJoint;

	static new(): SCNPhysicsHingeJoint; // inherited from NSObject

	anchorA: SCNVector3;

	anchorB: SCNVector3;

	axisA: SCNVector3;

	axisB: SCNVector3;

	readonly bodyA: SCNPhysicsBody;

	readonly bodyB: SCNPhysicsBody;
}

declare class SCNPhysicsShape extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsShape; // inherited from NSObject

	static new(): SCNPhysicsShape; // inherited from NSObject

	static shapeWithGeometryOptions(geometry: SCNGeometry, options: NSDictionary<string, any>): SCNPhysicsShape;

	static shapeWithNodeOptions(node: SCNNode, options: NSDictionary<string, any>): SCNPhysicsShape;

	static shapeWithShapesTransforms(shapes: NSArray<SCNPhysicsShape> | SCNPhysicsShape[], transforms: NSArray<NSValue> | NSValue[]): SCNPhysicsShape;

	/**
	 * @since 9.0
	 */
	readonly options: NSDictionary<string, any>;

	/**
	 * @since 9.0
	 */
	readonly sourceObject: any;

	/**
	 * @since 9.0
	 */
	readonly transforms: NSArray<NSValue>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SCNPhysicsShapeKeepAsCompoundKey: string;

/**
 * @since 10.0
 */
declare var SCNPhysicsShapeOptionCollisionMargin: string;

declare var SCNPhysicsShapeScaleKey: string;

declare var SCNPhysicsShapeTypeBoundingBox: string;

declare var SCNPhysicsShapeTypeConcavePolyhedron: string;

declare var SCNPhysicsShapeTypeConvexHull: string;

declare var SCNPhysicsShapeTypeKey: string;

declare class SCNPhysicsSliderJoint extends SCNPhysicsBehavior {

	static alloc(): SCNPhysicsSliderJoint; // inherited from NSObject

	static jointWithBodyAAxisAAnchorABodyBAxisBAnchorB(bodyA: SCNPhysicsBody, axisA: SCNVector3, anchorA: SCNVector3, bodyB: SCNPhysicsBody, axisB: SCNVector3, anchorB: SCNVector3): SCNPhysicsSliderJoint;

	static jointWithBodyAxisAnchor(body: SCNPhysicsBody, axis: SCNVector3, anchor: SCNVector3): SCNPhysicsSliderJoint;

	static new(): SCNPhysicsSliderJoint; // inherited from NSObject

	anchorA: SCNVector3;

	anchorB: SCNVector3;

	axisA: SCNVector3;

	axisB: SCNVector3;

	readonly bodyA: SCNPhysicsBody;

	readonly bodyB: SCNPhysicsBody;

	maximumAngularLimit: number;

	maximumLinearLimit: number;

	minimumAngularLimit: number;

	minimumLinearLimit: number;

	motorMaximumForce: number;

	motorMaximumTorque: number;

	motorTargetAngularVelocity: number;

	motorTargetLinearVelocity: number;
}

declare var SCNPhysicsTestBackfaceCullingKey: string;

declare var SCNPhysicsTestCollisionBitMaskKey: string;

declare var SCNPhysicsTestSearchModeAll: string;

declare var SCNPhysicsTestSearchModeAny: string;

declare var SCNPhysicsTestSearchModeClosest: string;

declare var SCNPhysicsTestSearchModeKey: string;

declare class SCNPhysicsVehicle extends SCNPhysicsBehavior {

	static alloc(): SCNPhysicsVehicle; // inherited from NSObject

	static new(): SCNPhysicsVehicle; // inherited from NSObject

	static vehicleWithChassisBodyWheels(chassisBody: SCNPhysicsBody, wheels: NSArray<SCNPhysicsVehicleWheel> | SCNPhysicsVehicleWheel[]): SCNPhysicsVehicle;

	readonly chassisBody: SCNPhysicsBody;

	readonly speedInKilometersPerHour: number;

	readonly wheels: NSArray<SCNPhysicsVehicleWheel>;

	applyBrakingForceForWheelAtIndex(value: number, index: number): void;

	applyEngineForceForWheelAtIndex(value: number, index: number): void;

	setSteeringAngleForWheelAtIndex(value: number, index: number): void;
}

declare class SCNPhysicsVehicleWheel extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNPhysicsVehicleWheel; // inherited from NSObject

	static new(): SCNPhysicsVehicleWheel; // inherited from NSObject

	static wheelWithNode(node: SCNNode): SCNPhysicsVehicleWheel;

	axle: SCNVector3;

	connectionPosition: SCNVector3;

	frictionSlip: number;

	maximumSuspensionForce: number;

	maximumSuspensionTravel: number;

	readonly node: SCNNode;

	radius: number;

	steeringAxis: SCNVector3;

	suspensionCompression: number;

	suspensionDamping: number;

	suspensionRestLength: number;

	suspensionStiffness: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SCNPhysicsWorld extends NSObject implements NSSecureCoding {

	static alloc(): SCNPhysicsWorld; // inherited from NSObject

	static new(): SCNPhysicsWorld; // inherited from NSObject

	readonly allBehaviors: NSArray<SCNPhysicsBehavior>;

	contactDelegate: SCNPhysicsContactDelegate;

	gravity: SCNVector3;

	speed: number;

	timeStep: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addBehavior(behavior: SCNPhysicsBehavior): void;

	contactTestBetweenBodyAndBodyOptions(bodyA: SCNPhysicsBody, bodyB: SCNPhysicsBody, options: NSDictionary<string, any>): NSArray<SCNPhysicsContact>;

	contactTestWithBodyOptions(body: SCNPhysicsBody, options: NSDictionary<string, any>): NSArray<SCNPhysicsContact>;

	convexSweepTestWithShapeFromTransformToTransformOptions(shape: SCNPhysicsShape, from: SCNMatrix4, to: SCNMatrix4, options: NSDictionary<string, any>): NSArray<SCNPhysicsContact>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	rayTestWithSegmentFromPointToPointOptions(origin: SCNVector3, dest: SCNVector3, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	removeAllBehaviors(): void;

	removeBehavior(behavior: SCNPhysicsBehavior): void;

	updateCollisionPairs(): void;
}

declare class SCNPlane extends SCNGeometry {

	static alloc(): SCNPlane; // inherited from NSObject

	static geometry(): SCNPlane; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNPlane; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNPlane; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNPlane; // inherited from SCNGeometry

	static new(): SCNPlane; // inherited from NSObject

	static planeWithWidthHeight(width: number, height: number): SCNPlane;

	cornerRadius: number;

	cornerSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	width: number;

	widthSegmentCount: number;
}

/**
 * @since 9.0
 */
declare var SCNPreferLowPowerDeviceKey: string;

/**
 * @since 9.0
 */
declare var SCNPreferredDeviceKey: string;

/**
 * @since 9.0
 */
declare var SCNPreferredRenderingAPIKey: string;

declare class SCNProgram extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNProgram; // inherited from NSObject

	static new(): SCNProgram; // inherited from NSObject

	static program(): SCNProgram;

	delegate: SCNProgramDelegate;

	/**
	 * @since 9.0
	 */
	fragmentFunctionName: string;

	fragmentShader: string;

	/**
	 * @since 9.0
	 */
	library: MTLLibrary;

	opaque: boolean;

	/**
	 * @since 9.0
	 */
	vertexFunctionName: string;

	vertexShader: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 9.0
	 */
	handleBindingOfBufferNamedFrequencyUsingBlock(name: string, frequency: SCNBufferFrequency, block: (p1: SCNBufferStream, p2: SCNNode, p3: SCNShadable, p4: SCNRenderer) => void): void;

	initWithCoder(coder: NSCoder): this;

	semanticForSymbol(symbol: string): string;

	setSemanticForSymbolOptions(semantic: string, symbol: string, options: NSDictionary<string, any>): void;
}

declare const SCNProgramCompilationError: number;

interface SCNProgramDelegate extends NSObjectProtocol {

	programHandleError?(program: SCNProgram, error: NSError): void;
}
declare var SCNProgramDelegate: {

	prototype: SCNProgramDelegate;
};

declare var SCNProgramMappingChannelKey: string;

declare var SCNProjectionTransform: string;

declare class SCNPyramid extends SCNGeometry {

	static alloc(): SCNPyramid; // inherited from NSObject

	static geometry(): SCNPyramid; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNPyramid; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNPyramid; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNPyramid; // inherited from SCNGeometry

	static new(): SCNPyramid; // inherited from NSObject

	static pyramidWithWidthHeightLength(width: number, height: number, length: number): SCNPyramid;

	height: number;

	heightSegmentCount: number;

	length: number;

	lengthSegmentCount: number;

	width: number;

	widthSegmentCount: number;
}

/**
 * @since 9.0
 */
declare const enum SCNReferenceLoadingPolicy {

	Immediate = 0,

	OnDemand = 1
}

/**
 * @since 9.0
 */
declare class SCNReferenceNode extends SCNNode {

	static alloc(): SCNReferenceNode; // inherited from NSObject

	static new(): SCNReferenceNode; // inherited from NSObject

	static node(): SCNReferenceNode; // inherited from SCNNode

	/**
	 * @since 9.0
	 */
	static nodeWithMDLObject(mdlObject: MDLObject): SCNReferenceNode; // inherited from SCNNode

	static referenceNodeWithURL(referenceURL: NSURL): SCNReferenceNode;

	readonly loaded: boolean;

	loadingPolicy: SCNReferenceLoadingPolicy;

	referenceURL: NSURL;

	constructor(o: { URL: NSURL; });

	initWithURL(referenceURL: NSURL): this;

	load(): void;

	unload(): void;
}

declare class SCNRenderer extends NSObject implements SCNSceneRenderer, SCNTechniqueSupport {

	static alloc(): SCNRenderer; // inherited from NSObject

	static new(): SCNRenderer; // inherited from NSObject

	static rendererWithContextOptions(context: EAGLContext, options: NSDictionary<any, any>): SCNRenderer;

	/**
	 * @since 9.0
	 */
	static rendererWithDeviceOptions(device: MTLDevice, options: NSDictionary<any, any>): SCNRenderer;

	readonly nextFrameTime: number;

	/**
	 * @since 9.0
	 */
	readonly audioEngine: AVAudioEngine; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly audioEnvironmentNode: AVAudioEnvironmentNode; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	audioListener: SCNNode; // inherited from SCNSceneRenderer

	autoenablesDefaultLighting: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly colorPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly commandQueue: MTLCommandQueue; // inherited from SCNSceneRenderer

	readonly context: interop.Pointer | interop.Reference<any>; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly currentRenderCommandEncoder: MTLRenderCommandEncoder; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly currentRenderPassDescriptor: MTLRenderPassDescriptor; // inherited from SCNSceneRenderer

	/**
	 * @since 13.0
	 */
	readonly currentViewport: CGRect; // inherited from SCNSceneRenderer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	/**
	 * @since 9.0
	 */
	debugOptions: SCNDebugOptions; // inherited from SCNSceneRenderer

	delegate: SCNSceneRendererDelegate; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly depthPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 9.0
	 */
	readonly device: MTLDevice; // inherited from SCNSceneRenderer

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	jitteringEnabled: boolean; // inherited from SCNSceneRenderer

	loops: boolean; // inherited from SCNSceneRenderer

	overlaySKScene: SKScene; // inherited from SCNSceneRenderer

	playing: boolean; // inherited from SCNSceneRenderer

	pointOfView: SCNNode; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly renderingAPI: SCNRenderingAPI; // inherited from SCNSceneRenderer

	scene: SCNScene; // inherited from SCNSceneRenderer

	sceneTime: number; // inherited from SCNSceneRenderer

	showsStatistics: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly stencilPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	/**
	 * @since 13.0
	 */
	temporalAntialiasingEnabled: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 13.0
	 */
	usesReverseZ: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 17.0
	 */
	readonly workingColorSpace: any; // inherited from SCNSceneRenderer

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean;

	/**
	 * @since 9.0
	 */
	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void;

	projectPoint(point: SCNVector3): SCNVector3;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	render(): void;

	renderAtTime(time: number): void;

	/**
	 * @since 9.0
	 */
	renderAtTimeViewportCommandBufferPassDescriptor(time: number, viewport: CGRect, commandBuffer: MTLCommandBuffer, renderPassDescriptor: MTLRenderPassDescriptor): void;

	/**
	 * @since 11.0
	 */
	renderWithViewportCommandBufferPassDescriptor(viewport: CGRect, commandBuffer: MTLCommandBuffer, renderPassDescriptor: MTLRenderPassDescriptor): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 */
	snapshotAtTimeWithSizeAntialiasingMode(time: number, size: CGSize, antialiasingMode: SCNAntialiasingMode): UIImage;

	unprojectPoint(point: SCNVector3): SCNVector3;

	/**
	 * @since 11.0
	 */
	updateAtTime(time: number): void;

	/**
	 * @since 10.0
	 */
	updateProbesAtTime(lightProbes: NSArray<SCNNode> | SCNNode[], time: number): void;
}

/**
 * @since 9.0
 */
declare const enum SCNRenderingAPI {

	Metal = 0,

	OpenGLES2 = 1
}

/**
 * @since 11.0
 */
declare class SCNReplicatorConstraint extends SCNConstraint {

	static alloc(): SCNReplicatorConstraint; // inherited from NSObject

	static new(): SCNReplicatorConstraint; // inherited from NSObject

	static replicatorConstraintWithTarget(target: SCNNode): SCNReplicatorConstraint;

	orientationOffset: SCNVector4;

	positionOffset: SCNVector3;

	replicatesOrientation: boolean;

	replicatesPosition: boolean;

	replicatesScale: boolean;

	scaleOffset: SCNVector3;

	target: SCNNode;
}

declare class SCNScene extends NSObject implements GKSceneRootNodeType, NSSecureCoding {

	static alloc(): SCNScene; // inherited from NSObject

	static new(): SCNScene; // inherited from NSObject

	static scene(): SCNScene;

	static sceneNamed(name: string): SCNScene;

	static sceneNamedInDirectoryOptions(name: string, directory: string, options: NSDictionary<string, any>): SCNScene;

	/**
	 * @since 9.0
	 */
	static sceneWithMDLAsset(mdlAsset: MDLAsset): SCNScene;

	static sceneWithURLOptionsError(url: NSURL, options: NSDictionary<string, any>): SCNScene;

	readonly background: SCNMaterialProperty;

	fogColor: any;

	fogDensityExponent: number;

	fogEndDistance: number;

	fogStartDistance: number;

	/**
	 * @since 10.0
	 */
	readonly lightingEnvironment: SCNMaterialProperty;

	readonly particleSystems: NSArray<SCNParticleSystem>;

	paused: boolean;

	readonly physicsWorld: SCNPhysicsWorld;

	readonly rootNode: SCNNode;

	/**
	 * @since 13.0
	 */
	screenSpaceReflectionMaximumDistance: number;

	/**
	 * @since 13.0
	 */
	screenSpaceReflectionSampleCount: number;

	/**
	 * @since 13.0
	 */
	screenSpaceReflectionStride: number;

	/**
	 * @since 13.0
	 */
	wantsScreenSpaceReflection: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addParticleSystemWithTransform(system: SCNParticleSystem, transform: SCNMatrix4): void;

	attributeForKey(key: string): any;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllParticleSystems(): void;

	removeParticleSystem(system: SCNParticleSystem): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setAttributeForKey(attribute: any, key: string): void;

	/**
	 * @since 10.0
	 */
	writeToURLOptionsDelegateProgressHandler(url: NSURL, options: NSDictionary<string, any>, delegate: SCNSceneExportDelegate, progressHandler: (p1: number, p2: NSError, p3: interop.Pointer | interop.Reference<boolean>) => void): boolean;
}

declare var SCNSceneEndTimeAttributeKey: string;

/**
 * @since 10.0
 */
interface SCNSceneExportDelegate extends NSObjectProtocol {

	/**
	 * @since 10.0
	 */
	writeImageWithSceneDocumentURLOriginalImageURL?(image: UIImage, documentURL: NSURL, originalImageURL: NSURL): NSURL;
}
declare var SCNSceneExportDelegate: {

	prototype: SCNSceneExportDelegate;
};

declare var SCNSceneExportDestinationURL: string;

declare var SCNSceneFrameRateAttributeKey: string;

interface SCNSceneRenderer extends NSObjectProtocol {

	/**
	 * @since 9.0
	 */
	audioEngine: AVAudioEngine;

	/**
	 * @since 9.0
	 */
	audioEnvironmentNode: AVAudioEnvironmentNode;

	/**
	 * @since 9.0
	 */
	audioListener: SCNNode;

	autoenablesDefaultLighting: boolean;

	/**
	 * @since 9.0
	 */
	colorPixelFormat: MTLPixelFormat;

	/**
	 * @since 9.0
	 */
	commandQueue: MTLCommandQueue;

	context: interop.Pointer | interop.Reference<any>;

	/**
	 * @since 9.0
	 */
	currentRenderCommandEncoder: MTLRenderCommandEncoder;

	/**
	 * @since 9.0
	 */
	currentRenderPassDescriptor: MTLRenderPassDescriptor;

	/**
	 * @since 13.0
	 */
	currentViewport: CGRect;

	/**
	 * @since 9.0
	 */
	debugOptions: SCNDebugOptions;

	delegate: SCNSceneRendererDelegate;

	/**
	 * @since 9.0
	 */
	depthPixelFormat: MTLPixelFormat;

	/**
	 * @since 9.0
	 */
	device: MTLDevice;

	jitteringEnabled: boolean;

	loops: boolean;

	overlaySKScene: SKScene;

	playing: boolean;

	pointOfView: SCNNode;

	/**
	 * @since 9.0
	 */
	renderingAPI: SCNRenderingAPI;

	scene: SCNScene;

	sceneTime: number;

	showsStatistics: boolean;

	/**
	 * @since 9.0
	 */
	stencilPixelFormat: MTLPixelFormat;

	/**
	 * @since 13.0
	 */
	temporalAntialiasingEnabled: boolean;

	/**
	 * @since 13.0
	 */
	usesReverseZ: boolean;

	/**
	 * @since 17.0
	 */
	workingColorSpace: any;

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean;

	/**
	 * @since 9.0
	 */
	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void;

	projectPoint(point: SCNVector3): SCNVector3;

	unprojectPoint(point: SCNVector3): SCNVector3;
}
declare var SCNSceneRenderer: {

	prototype: SCNSceneRenderer;
};

interface SCNSceneRendererDelegate extends NSObjectProtocol {

	rendererDidApplyAnimationsAtTime?(renderer: SCNSceneRenderer, time: number): void;

	/**
	 * @since 11.0
	 */
	rendererDidApplyConstraintsAtTime?(renderer: SCNSceneRenderer, time: number): void;

	rendererDidRenderSceneAtTime?(renderer: SCNSceneRenderer, scene: SCNScene, time: number): void;

	rendererDidSimulatePhysicsAtTime?(renderer: SCNSceneRenderer, time: number): void;

	rendererUpdateAtTime?(renderer: SCNSceneRenderer, time: number): void;

	rendererWillRenderSceneAtTime?(renderer: SCNSceneRenderer, scene: SCNScene, time: number): void;
}
declare var SCNSceneRendererDelegate: {

	prototype: SCNSceneRendererDelegate;
};

declare class SCNSceneSource extends NSObject {

	static alloc(): SCNSceneSource; // inherited from NSObject

	static new(): SCNSceneSource; // inherited from NSObject

	static sceneSourceWithDataOptions(data: NSData, options: NSDictionary<string, any>): SCNSceneSource;

	static sceneSourceWithURLOptions(url: NSURL, options: NSDictionary<string, any>): SCNSceneSource;

	readonly data: NSData;

	readonly url: NSURL;

	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	entriesPassingTest(predicate: (p1: any, p2: string, p3: interop.Pointer | interop.Reference<boolean>) => boolean): NSArray<any>;

	entryWithIdentifierWithClass(uid: string, entryClass: typeof NSObject): any;

	identifiersOfEntriesWithClass(entryClass: typeof NSObject): NSArray<string>;

	initWithDataOptions(data: NSData, options: NSDictionary<string, any>): this;

	initWithURLOptions(url: NSURL, options: NSDictionary<string, any>): this;

	propertyForKey(key: string): any;

	sceneWithOptionsError(options: NSDictionary<string, any>): SCNScene;

	sceneWithOptionsStatusHandler(options: NSDictionary<string, any>, statusHandler: (p1: number, p2: SCNSceneSourceStatus, p3: NSError, p4: interop.Pointer | interop.Reference<boolean>) => void): SCNScene;
}

declare var SCNSceneSourceAnimationImportPolicyDoNotPlay: string;

declare var SCNSceneSourceAnimationImportPolicyKey: string;

declare var SCNSceneSourceAnimationImportPolicyPlay: string;

declare var SCNSceneSourceAnimationImportPolicyPlayRepeatedly: string;

declare var SCNSceneSourceAnimationImportPolicyPlayUsingSceneTimeBase: string;

declare var SCNSceneSourceAssetAuthorKey: string;

declare var SCNSceneSourceAssetAuthoringToolKey: string;

declare var SCNSceneSourceAssetContributorsKey: string;

declare var SCNSceneSourceAssetCreatedDateKey: string;

declare var SCNSceneSourceAssetDirectoryURLsKey: string;

declare var SCNSceneSourceAssetModifiedDateKey: string;

declare var SCNSceneSourceAssetUnitKey: string;

declare var SCNSceneSourceAssetUnitMeterKey: string;

declare var SCNSceneSourceAssetUnitNameKey: string;

declare var SCNSceneSourceAssetUpAxisKey: string;

declare var SCNSceneSourceCheckConsistencyKey: string;

/**
 * @since 11.0
 */
declare var SCNSceneSourceConvertToYUpKey: string;

/**
 * @since 11.0
 */
declare var SCNSceneSourceConvertUnitsToMetersKey: string;

declare var SCNSceneSourceCreateNormalsIfAbsentKey: string;

declare var SCNSceneSourceFlattenSceneKey: string;

/**
 * @since 10.0
 */
declare var SCNSceneSourceLoadingOptionPreserveOriginalTopology: string;

declare var SCNSceneSourceOverrideAssetURLsKey: string;

declare const enum SCNSceneSourceStatus {

	Error = -1,

	Parsing = 4,

	Validating = 8,

	Processing = 12,

	Complete = 16
}

declare var SCNSceneSourceStrictConformanceKey: string;

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare var SCNSceneSourceUseSafeModeKey: string;

declare var SCNSceneStartTimeAttributeKey: string;

declare var SCNSceneUpAxisAttributeKey: string;

interface SCNShadable extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	minimumLanguageVersion?: number;

	program?: SCNProgram;

	shaderModifiers?: NSDictionary<string, string>;

	handleBindingOfSymbolUsingBlock?(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	handleUnbindingOfSymbolUsingBlock?(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;
}
declare var SCNShadable: {

	prototype: SCNShadable;
};

declare var SCNShaderModifierEntryPointFragment: string;

declare var SCNShaderModifierEntryPointGeometry: string;

declare var SCNShaderModifierEntryPointLightingModel: string;

declare var SCNShaderModifierEntryPointSurface: string;

declare const enum SCNShadowMode {

	Forward = 0,

	Deferred = 1,

	Modulated = 2
}

declare class SCNShape extends SCNGeometry {

	static alloc(): SCNShape; // inherited from NSObject

	static geometry(): SCNShape; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNShape; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNShape; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNShape; // inherited from SCNGeometry

	static new(): SCNShape; // inherited from NSObject

	static shapeWithPathExtrusionDepth(path: UIBezierPath, extrusionDepth: number): SCNShape;

	chamferMode: SCNChamferMode;

	chamferProfile: UIBezierPath;

	chamferRadius: number;

	extrusionDepth: number;

	path: UIBezierPath;
}

declare class SCNSkinner extends NSObject implements NSSecureCoding {

	static alloc(): SCNSkinner; // inherited from NSObject

	static new(): SCNSkinner; // inherited from NSObject

	static skinnerWithBaseGeometryBonesBoneInverseBindTransformsBoneWeightsBoneIndices(baseGeometry: SCNGeometry, bones: NSArray<SCNNode> | SCNNode[], boneInverseBindTransforms: NSArray<NSValue> | NSValue[], boneWeights: SCNGeometrySource, boneIndices: SCNGeometrySource): SCNSkinner;

	baseGeometry: SCNGeometry;

	baseGeometryBindTransform: SCNMatrix4;

	readonly boneIndices: SCNGeometrySource;

	readonly boneInverseBindTransforms: NSArray<NSValue>;

	readonly boneWeights: SCNGeometrySource;

	readonly bones: NSArray<SCNNode>;

	skeleton: SCNNode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class SCNSliderConstraint extends SCNConstraint {

	static alloc(): SCNSliderConstraint; // inherited from NSObject

	static new(): SCNSliderConstraint; // inherited from NSObject

	static sliderConstraint(): SCNSliderConstraint;

	collisionCategoryBitMask: number;

	offset: SCNVector3;

	radius: number;
}

declare class SCNSphere extends SCNGeometry {

	static alloc(): SCNSphere; // inherited from NSObject

	static geometry(): SCNSphere; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNSphere; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNSphere; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNSphere; // inherited from SCNGeometry

	static new(): SCNSphere; // inherited from NSObject

	static sphereWithRadius(radius: number): SCNSphere;

	geodesic: boolean;

	radius: number;

	segmentCount: number;
}

declare class SCNTechnique extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable {

	static alloc(): SCNTechnique; // inherited from NSObject

	static new(): SCNTechnique; // inherited from NSObject

	static techniqueBySequencingTechniques(techniques: NSArray<SCNTechnique> | SCNTechnique[]): SCNTechnique;

	static techniqueWithDictionary(dictionary: NSDictionary<string, any>): SCNTechnique;

	readonly dictionaryRepresentation: NSDictionary<string, any>;

	/**
	 * @since 12.0
	 */
	library: MTLLibrary;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	/**
	 * @since 11.0
	 */
	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	animationForKey(key: string): CAAnimation;

	/**
	 * @since 11.0
	 */
	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 9.0
	 */
	objectForKeyedSubscript(key: any): any;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	/**
	 * @since 15.0
	 */
	removeAllAnimationsWithBlendOutDuration(duration: number): void;

	removeAnimationForKey(key: string): void;

	/**
	 * @since 11.0
	 */
	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	/**
	 * @since 9.0
	 */
	setObjectForKeyedSubscript(obj: any, key: any): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	setSpeedForAnimationKey(speed: number, key: string): void;
}

interface SCNTechniqueSupport extends NSObjectProtocol {

	technique: SCNTechnique;
}
declare var SCNTechniqueSupport: {

	prototype: SCNTechniqueSupport;
};

/**
 * @since 11.0
 */
declare const enum SCNTessellationSmoothingMode {

	None = 0,

	PNTriangles = 1,

	Phong = 2
}

declare class SCNText extends SCNGeometry {

	static alloc(): SCNText; // inherited from NSObject

	static geometry(): SCNText; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNText; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNText; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNText; // inherited from SCNGeometry

	static new(): SCNText; // inherited from NSObject

	static textWithStringExtrusionDepth(string: any, extrusionDepth: number): SCNText;

	alignmentMode: string;

	chamferProfile: UIBezierPath;

	chamferRadius: number;

	containerFrame: CGRect;

	extrusionDepth: number;

	flatness: number;

	font: UIFont;

	string: any;

	truncationMode: string;

	wrapped: boolean;
}

/**
 * @since 11.0
 */
declare class SCNTimingFunction extends NSObject implements NSSecureCoding {

	static alloc(): SCNTimingFunction; // inherited from NSObject

	static functionWithCAMediaTimingFunction(caTimingFunction: CAMediaTimingFunction): SCNTimingFunction;

	static functionWithTimingMode(timingMode: SCNActionTimingMode): SCNTimingFunction;

	static new(): SCNTimingFunction; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SCNTorus extends SCNGeometry {

	static alloc(): SCNTorus; // inherited from NSObject

	static geometry(): SCNTorus; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNTorus; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNTorus; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNTorus; // inherited from SCNGeometry

	static new(): SCNTorus; // inherited from NSObject

	static torusWithRingRadiusPipeRadius(ringRadius: number, pipeRadius: number): SCNTorus;

	pipeRadius: number;

	pipeSegmentCount: number;

	ringRadius: number;

	ringSegmentCount: number;
}

declare class SCNTransaction extends NSObject {

	static alloc(): SCNTransaction; // inherited from NSObject

	static begin(): void;

	static commit(): void;

	static flush(): void;

	static lock(): void;

	static new(): SCNTransaction; // inherited from NSObject

	static setValueForKey(value: any, key: string): void;

	static unlock(): void;

	static valueForKey(key: string): any;

	static animationDuration: number;

	static animationTimingFunction: CAMediaTimingFunction;

	static completionBlock: () => void;

	static disableActions: boolean;
}

declare class SCNTransformConstraint extends SCNConstraint {

	static alloc(): SCNTransformConstraint; // inherited from NSObject

	static new(): SCNTransformConstraint; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static orientationConstraintInWorldSpaceWithBlock(world: boolean, block: (p1: SCNNode, p2: SCNVector4) => SCNVector4): SCNTransformConstraint;

	/**
	 * @since 11.0
	 */
	static positionConstraintInWorldSpaceWithBlock(world: boolean, block: (p1: SCNNode, p2: SCNVector3) => SCNVector3): SCNTransformConstraint;

	static transformConstraintInWorldSpaceWithBlock(world: boolean, block: (p1: SCNNode, p2: SCNMatrix4) => SCNMatrix4): SCNTransformConstraint;
}

declare const enum SCNTransparencyMode {

	AOne = 0,

	RGBZero = 1,

	SingleLayer = 2,

	DualLayer = 3,

	Default = 0
}

declare class SCNTube extends SCNGeometry {

	static alloc(): SCNTube; // inherited from NSObject

	static geometry(): SCNTube; // inherited from SCNGeometry

	/**
	 * @since 9.0
	 */
	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNTube; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNTube; // inherited from SCNGeometry

	/**
	 * @since 16.0
	 */
	static geometryWithSourcesElementsSourceChannels(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[], sourceChannels: NSArray<number> | number[]): SCNTube; // inherited from SCNGeometry

	static new(): SCNTube; // inherited from NSObject

	static tubeWithInnerRadiusOuterRadiusHeight(innerRadius: number, outerRadius: number, height: number): SCNTube;

	height: number;

	heightSegmentCount: number;

	innerRadius: number;

	outerRadius: number;

	radialSegmentCount: number;
}

interface SCNVector3 {
	x: number;
	y: number;
	z: number;
}
declare var SCNVector3: interop.StructType<SCNVector3>;

declare function SCNVector3EqualToVector3(a: SCNVector3, b: SCNVector3): boolean;

declare var SCNVector3Zero: SCNVector3;

interface SCNVector4 {
	x: number;
	y: number;
	z: number;
	w: number;
}
declare var SCNVector4: interop.StructType<SCNVector4>;

declare function SCNVector4EqualToVector4(a: SCNVector4, b: SCNVector4): boolean;

declare var SCNVector4Zero: SCNVector4;

declare class SCNView extends UIView implements SCNSceneRenderer, SCNTechniqueSupport {

	static alloc(): SCNView; // inherited from NSObject

	static appearance(): SCNView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): SCNView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SCNView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SCNView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SCNView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SCNView; // inherited from UIAppearance

	static new(): SCNView; // inherited from NSObject

	allowsCameraControl: boolean;

	antialiasingMode: SCNAntialiasingMode;

	/**
	 * @since 11.0
	 */
	readonly cameraControlConfiguration: SCNCameraControlConfiguration;

	/**
	 * @since 11.0
	 */
	readonly defaultCameraController: SCNCameraController;

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
	eaglContext: EAGLContext;

	preferredFramesPerSecond: number;

	rendersContinuously: boolean;

	/**
	 * @since 9.0
	 */
	readonly audioEngine: AVAudioEngine; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly audioEnvironmentNode: AVAudioEnvironmentNode; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	audioListener: SCNNode; // inherited from SCNSceneRenderer

	autoenablesDefaultLighting: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly colorPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly commandQueue: MTLCommandQueue; // inherited from SCNSceneRenderer

	readonly context: interop.Pointer | interop.Reference<any>; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly currentRenderCommandEncoder: MTLRenderCommandEncoder; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly currentRenderPassDescriptor: MTLRenderPassDescriptor; // inherited from SCNSceneRenderer

	/**
	 * @since 13.0
	 */
	readonly currentViewport: CGRect; // inherited from SCNSceneRenderer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	/**
	 * @since 9.0
	 */
	debugOptions: SCNDebugOptions; // inherited from SCNSceneRenderer

	delegate: SCNSceneRendererDelegate; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly depthPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 9.0
	 */
	readonly device: MTLDevice; // inherited from SCNSceneRenderer

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	jitteringEnabled: boolean; // inherited from SCNSceneRenderer

	loops: boolean; // inherited from SCNSceneRenderer

	overlaySKScene: SKScene; // inherited from SCNSceneRenderer

	playing: boolean; // inherited from SCNSceneRenderer

	pointOfView: SCNNode; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly renderingAPI: SCNRenderingAPI; // inherited from SCNSceneRenderer

	scene: SCNScene; // inherited from SCNSceneRenderer

	sceneTime: number; // inherited from SCNSceneRenderer

	showsStatistics: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 9.0
	 */
	readonly stencilPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	/**
	 * @since 13.0
	 */
	temporalAntialiasingEnabled: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 13.0
	 */
	usesReverseZ: boolean; // inherited from SCNSceneRenderer

	/**
	 * @since 17.0
	 */
	readonly workingColorSpace: any; // inherited from SCNSceneRenderer

	readonly  // inherited from NSObjectProtocol

	constructor(o: { frame: CGRect; options: NSDictionary<string, any>; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	initWithFrameOptions(frame: CGRect, options: NSDictionary<string, any>): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean;

	/**
	 * @since 9.0
	 */
	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	pause(sender: any): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	play(sender: any): void;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void;

	projectPoint(point: SCNVector3): SCNVector3;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	snapshot(): UIImage;

	stop(sender: any): void;

	unprojectPoint(point: SCNVector3): SCNVector3;
}

declare var SCNViewTransform: string;

declare const enum SCNWrapMode {

	Clamp = 1,

	Repeat = 2,

	ClampToBorder = 3,

	Mirror = 4
}
