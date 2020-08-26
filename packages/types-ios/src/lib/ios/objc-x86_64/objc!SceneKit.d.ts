
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

	static hide(): SCNAction;

	static javaScriptActionWithScriptDuration(script: string, seconds: number): SCNAction;

	static moveByDuration(delta: SCNVector3, duration: number): SCNAction;

	static moveByXYZDuration(deltaX: number, deltaY: number, deltaZ: number, duration: number): SCNAction;

	static moveToDuration(location: SCNVector3, duration: number): SCNAction;

	static new(): SCNAction; // inherited from NSObject

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

	static runBlockQueue(block: (p1: SCNNode) => void, queue: NSObject): SCNAction;

	static scaleByDuration(scale: number, sec: number): SCNAction;

	static scaleToDuration(scale: number, sec: number): SCNAction;

	static sequence(actions: NSArray<SCNAction> | SCNAction[]): SCNAction;

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	isAnimationForKeyPaused(key: string): boolean;

	pauseAnimationForKey(key: string): void;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	resumeAnimationForKey(key: string): void;

	setSpeedForAnimationKey(speed: number, key: string): void;
}
declare var SCNAnimatable: {

	prototype: SCNAnimatable;
};

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	play(): void;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

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

declare class SCNAvoidOccluderConstraint extends SCNConstraint {

	static alloc(): SCNAvoidOccluderConstraint; // inherited from NSObject

	static avoidOccluderConstraintWithTarget(target: SCNNode): SCNAvoidOccluderConstraint;

	static new(): SCNAvoidOccluderConstraint; // inherited from NSObject

	bias: number;

	delegate: SCNAvoidOccluderConstraintDelegate;

	occluderCategoryBitMask: number;

	target: SCNNode;
}

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

declare class SCNBillboardConstraint extends SCNConstraint {

	static alloc(): SCNBillboardConstraint; // inherited from NSObject

	static billboardConstraint(): SCNBillboardConstraint;

	static new(): SCNBillboardConstraint; // inherited from NSObject

	freeAxes: SCNBillboardAxis;
}

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNBox; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNBox; // inherited from SCNGeometry

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

	static cameraWithMDLCamera(mdlCamera: MDLCamera): SCNCamera;

	static new(): SCNCamera; // inherited from NSObject

	aperture: number;

	apertureBladeCount: number;

	automaticallyAdjustsZRange: boolean;

	averageGray: number;

	bloomBlurRadius: number;

	bloomIntensity: number;

	bloomIterationCount: number;

	bloomIterationSpread: number;

	bloomThreshold: number;

	categoryBitMask: number;

	colorFringeIntensity: number;

	colorFringeStrength: number;

	readonly colorGrading: SCNMaterialProperty;

	contrast: number;

	exposureAdaptationBrighteningSpeedFactor: number;

	exposureAdaptationDarkeningSpeedFactor: number;

	exposureOffset: number;

	fStop: number;

	fieldOfView: number;

	focalBlurRadius: number;

	focalBlurSampleCount: number;

	focalDistance: number;

	focalLength: number;

	focalSize: number;

	focusDistance: number;

	grainIntensity: number;

	grainIsColored: boolean;

	grainScale: number;

	maximumExposure: number;

	minimumExposure: number;

	motionBlurIntensity: number;

	name: string;

	orthographicScale: number;

	projectionDirection: SCNCameraProjectionDirection;

	projectionTransform: SCNMatrix4;

	saturation: number;

	screenSpaceAmbientOcclusionBias: number;

	screenSpaceAmbientOcclusionDepthThreshold: number;

	screenSpaceAmbientOcclusionIntensity: number;

	screenSpaceAmbientOcclusionNormalThreshold: number;

	screenSpaceAmbientOcclusionRadius: number;

	sensorHeight: number;

	usesOrthographicProjection: boolean;

	vignettingIntensity: number;

	vignettingPower: number;

	wantsDepthOfField: boolean;

	wantsExposureAdaptation: boolean;

	wantsHDR: boolean;

	whiteBalanceTemperature: number;

	whiteBalanceTint: number;

	whitePoint: number;

	xFov: number;

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	projectionTransformWithViewportSize(viewportSize: CGSize): SCNMatrix4;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setSpeedForAnimationKey(speed: number, key: string): void;
}

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

	translateInCameraSpaceByXYZ(deltaX: number, deltaY: number, deltaX2: number): void;
}

interface SCNCameraControllerDelegate extends NSObjectProtocol {

	cameraInertiaDidEndForController?(cameraController: SCNCameraController): void;

	cameraInertiaWillStartForController?(cameraController: SCNCameraController): void;
}
declare var SCNCameraControllerDelegate: {

	prototype: SCNCameraControllerDelegate;
};

declare const enum SCNCameraProjectionDirection {

	Vertical = 0,

	Horizontal = 1
}

declare class SCNCapsule extends SCNGeometry {

	static alloc(): SCNCapsule; // inherited from NSObject

	static capsuleWithCapRadiusHeight(capRadius: number, height: number): SCNCapsule;

	static geometry(): SCNCapsule; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCapsule; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNCapsule; // inherited from SCNGeometry

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCone; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNCone; // inherited from SCNGeometry

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNCylinder; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNCylinder; // inherited from SCNGeometry

	static new(): SCNCylinder; // inherited from NSObject

	height: number;

	heightSegmentCount: number;

	radialSegmentCount: number;

	radius: number;
}

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNFloor; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNFloor; // inherited from SCNGeometry

	static new(): SCNFloor; // inherited from NSObject

	length: number;

	reflectionCategoryBitMask: number;

	reflectionFalloffEnd: number;

	reflectionFalloffStart: number;

	reflectionResolutionScaleFactor: number;

	reflectivity: number;

	width: number;
}

declare class SCNGeometry extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNBoundingVolume, SCNShadable {

	static alloc(): SCNGeometry; // inherited from NSObject

	static geometry(): SCNGeometry;

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNGeometry;

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNGeometry;

	static new(): SCNGeometry; // inherited from NSObject

	edgeCreasesElement: SCNGeometryElement;

	edgeCreasesSource: SCNGeometrySource;

	firstMaterial: SCNMaterial;

	readonly geometryElementCount: number;

	readonly geometryElements: NSArray<SCNGeometryElement>;

	readonly geometrySources: NSArray<SCNGeometrySource>;

	levelsOfDetail: NSArray<SCNLevelOfDetail>;

	materials: NSArray<SCNMaterial>;

	name: string;

	subdivisionLevel: number;

	tessellator: SCNGeometryTessellator;

	wantsAdaptiveSubdivision: boolean;

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	program: SCNProgram; // inherited from SCNShadable

	shaderModifiers: NSDictionary<string, string>; // inherited from SCNShadable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

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

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	materialWithName(name: string): SCNMaterial;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	removeMaterialAtIndex(index: number): void;

	replaceMaterialAtIndexWithMaterial(index: number, material: SCNMaterial): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): void;

	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare class SCNGeometryElement extends NSObject implements NSSecureCoding {

	static alloc(): SCNGeometryElement; // inherited from NSObject

	static geometryElementWithDataPrimitiveTypePrimitiveCountBytesPerIndex(data: NSData, primitiveType: SCNGeometryPrimitiveType, primitiveCount: number, bytesPerIndex: number): SCNGeometryElement;

	static geometryElementWithMDLSubmesh(mdlSubMesh: MDLSubmesh): SCNGeometryElement;

	static new(): SCNGeometryElement; // inherited from NSObject

	readonly bytesPerIndex: number;

	readonly data: NSData;

	maximumPointScreenSpaceRadius: number;

	minimumPointScreenSpaceRadius: number;

	pointSize: number;

	readonly primitiveCount: number;

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

	static geometrySourceWithBufferVertexFormatSemanticVertexCountDataOffsetDataStride(mtlBuffer: MTLBuffer, vertexFormat: MTLVertexFormat, semantic: string, vertexCount: number, offset: number, stride: number): SCNGeometrySource;

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

declare var SCNGeometrySourceSemanticTangent: string;

declare var SCNGeometrySourceSemanticTexcoord: string;

declare var SCNGeometrySourceSemanticVertex: string;

declare var SCNGeometrySourceSemanticVertexCrease: string;

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

declare var SCNHitTestOptionCategoryBitMask: string;

declare var SCNHitTestOptionIgnoreLightArea: string;

declare var SCNHitTestOptionSearchMode: string;

declare class SCNHitTestResult extends NSObject {

	static alloc(): SCNHitTestResult; // inherited from NSObject

	static new(): SCNHitTestResult; // inherited from NSObject

	readonly boneNode: SCNNode;

	readonly faceIndex: number;

	readonly geometryIndex: number;

	readonly localCoordinates: SCNVector3;

	readonly localNormal: SCNVector3;

	readonly modelTransform: SCNMatrix4;

	readonly node: SCNNode;

	readonly simdLocalCoordinates: interop.Reference<number>;

	readonly simdLocalNormal: interop.Reference<number>;

	readonly simdModelTransform: simd_float4x4;

	readonly simdWorldCoordinates: interop.Reference<number>;

	readonly simdWorldNormal: interop.Reference<number>;

	readonly worldCoordinates: SCNVector3;

	readonly worldNormal: SCNVector3;

	textureCoordinatesWithMappingChannel(channel: number): CGPoint;
}

declare var SCNHitTestRootNodeKey: string;

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

	constructor(o: { chainRootNode: SCNNode; });

	initWithChainRootNode(chainRootNode: SCNNode): this;

	maxAllowedRotationAngleForJoint(node: SCNNode): number;

	setMaxAllowedRotationAngleForJoint(angle: number, node: SCNNode): void;
}

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

	static lightWithMDLLight(mdlLight: MDLLight): SCNLight;

	static new(): SCNLight; // inherited from NSObject

	IESProfileURL: NSURL;

	areaExtents: interop.Reference<number>;

	areaPolygonVertices: NSArray<NSValue>;

	areaType: SCNLightAreaType;

	attenuationEndDistance: number;

	attenuationFalloffExponent: number;

	attenuationStartDistance: number;

	automaticallyAdjustsShadowProjection: boolean;

	castsShadow: boolean;

	categoryBitMask: number;

	color: any;

	doubleSided: boolean;

	drawsArea: boolean;

	forcesBackFaceCasters: boolean;

	readonly gobo: SCNMaterialProperty;

	intensity: number;

	maximumShadowDistance: number;

	name: string;

	orthographicScale: number;

	parallaxCenterOffset: interop.Reference<number>;

	parallaxCorrectionEnabled: boolean;

	parallaxExtentsFactor: interop.Reference<number>;

	readonly probeEnvironment: SCNMaterialProperty;

	probeExtents: interop.Reference<number>;

	probeOffset: interop.Reference<number>;

	probeType: SCNLightProbeType;

	probeUpdateType: SCNLightProbeUpdateType;

	sampleDistributedShadowMaps: boolean;

	shadowBias: number;

	shadowCascadeCount: number;

	shadowCascadeSplittingFactor: number;

	shadowColor: any;

	shadowMapSize: CGSize;

	shadowMode: SCNShadowMode;

	shadowRadius: number;

	shadowSampleCount: number;

	readonly sphericalHarmonicsCoefficients: NSData;

	spotInnerAngle: number;

	spotOuterAngle: number;

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare const enum SCNLightAreaType {

	Rectangle = 1,

	Polygon = 4
}

declare const enum SCNLightProbeType {

	Irradiance = 0,

	Radiance = 1
}

declare const enum SCNLightProbeUpdateType {

	Never = 0,

	Realtime = 1
}

declare var SCNLightTypeAmbient: string;

declare var SCNLightTypeArea: string;

declare var SCNLightTypeDirectional: string;

declare var SCNLightTypeIES: string;

declare var SCNLightTypeOmni: string;

declare var SCNLightTypeProbe: string;

declare var SCNLightTypeSpot: string;

declare var SCNLightingModelBlinn: string;

declare var SCNLightingModelConstant: string;

declare var SCNLightingModelLambert: string;

declare var SCNLightingModelPhong: string;

declare var SCNLightingModelPhysicallyBased: string;

declare var SCNLightingModelShadowOnly: string;

declare class SCNLookAtConstraint extends SCNConstraint {

	static alloc(): SCNLookAtConstraint; // inherited from NSObject

	static lookAtConstraintWithTarget(target: SCNNode): SCNLookAtConstraint;

	static new(): SCNLookAtConstraint; // inherited from NSObject

	gimbalLockEnabled: boolean;

	localFront: SCNVector3;

	target: SCNNode;

	targetOffset: SCNVector3;

	worldUp: SCNVector3;

	setTarget(target: SCNNode): void;
}

declare class SCNMaterial extends NSObject implements NSCopying, NSSecureCoding, SCNAnimatable, SCNShadable {

	static alloc(): SCNMaterial; // inherited from NSObject

	static material(): SCNMaterial;

	static materialWithMDLMaterial(mdlMaterial: MDLMaterial): SCNMaterial;

	static new(): SCNMaterial; // inherited from NSObject

	readonly ambient: SCNMaterialProperty;

	readonly ambientOcclusion: SCNMaterialProperty;

	blendMode: SCNBlendMode;

	readonly clearCoat: SCNMaterialProperty;

	readonly clearCoatNormal: SCNMaterialProperty;

	readonly clearCoatRoughness: SCNMaterialProperty;

	colorBufferWriteMask: SCNColorMask;

	cullMode: SCNCullMode;

	readonly diffuse: SCNMaterialProperty;

	readonly displacement: SCNMaterialProperty;

	doubleSided: boolean;

	readonly emission: SCNMaterialProperty;

	fillMode: SCNFillMode;

	fresnelExponent: number;

	lightingModelName: string;

	litPerPixel: boolean;

	locksAmbientWithDiffuse: boolean;

	readonly metalness: SCNMaterialProperty;

	readonly multiply: SCNMaterialProperty;

	name: string;

	readonly normal: SCNMaterialProperty;

	readsFromDepthBuffer: boolean;

	readonly reflective: SCNMaterialProperty;

	readonly roughness: SCNMaterialProperty;

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

	program: SCNProgram; // inherited from SCNShadable

	shaderModifiers: NSDictionary<string, string>; // inherited from SCNShadable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	handleUnbindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setSpeedForAnimationKey(speed: number, key: string): void;
}

declare class SCNMaterialProperty extends NSObject implements NSSecureCoding, SCNAnimatable {

	static alloc(): SCNMaterialProperty; // inherited from NSObject

	static materialPropertyWithContents(contents: any): SCNMaterialProperty;

	static new(): SCNMaterialProperty; // inherited from NSObject

	borderColor: any;

	contents: any;

	contentsTransform: SCNMatrix4;

	intensity: number;

	magnificationFilter: SCNFilterMode;

	mappingChannel: number;

	maxAnisotropy: number;

	minificationFilter: SCNFilterMode;

	mipFilter: SCNFilterMode;

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

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

	unifiesNormals: boolean;

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setSpeedForAnimationKey(speed: number, key: string): void;

	setWeightForTargetAtIndex(weight: number, targetIndex: number): void;

	setWeightForTargetNamed(weight: number, targetName: string): void;

	weightForTargetAtIndex(targetIndex: number): number;

	weightForTargetNamed(targetName: string): number;
}

declare const enum SCNMorpherCalculationMode {

	Normalized = 0,

	Additive = 1
}

declare const enum SCNMovabilityHint {

	Fixed = 0,

	Movable = 1
}

declare class SCNNode extends NSObject implements NSCopying, NSSecureCoding, SCNActionable, SCNAnimatable, SCNBoundingVolume, UIFocusItem {

	static alloc(): SCNNode; // inherited from NSObject

	static new(): SCNNode; // inherited from NSObject

	static node(): SCNNode;

	static nodeWithGeometry(geometry: SCNGeometry): SCNNode;

	static nodeWithMDLObject(mdlObject: MDLObject): SCNNode;

	readonly audioPlayers: NSArray<SCNAudioPlayer>;

	camera: SCNCamera;

	castsShadow: boolean;

	categoryBitMask: number;

	readonly childNodes: NSArray<SCNNode>;

	constraints: NSArray<SCNConstraint>;

	entity: GKEntity;

	eulerAngles: SCNVector3;

	filters: NSArray<CIFilter>;

	focusBehavior: SCNNodeFocusBehavior;

	geometry: SCNGeometry;

	hidden: boolean;

	light: SCNLight;

	morpher: SCNMorpher;

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

	simdEulerAngles: interop.Reference<number>;

	simdOrientation: simd_quatf;

	simdPivot: simd_float4x4;

	simdPosition: interop.Reference<number>;

	simdRotation: interop.Reference<number>;

	simdScale: interop.Reference<number>;

	simdTransform: simd_float4x4;

	readonly simdWorldFront: interop.Reference<number>;

	simdWorldOrientation: simd_quatf;

	simdWorldPosition: interop.Reference<number>;

	readonly simdWorldRight: interop.Reference<number>;

	simdWorldTransform: simd_float4x4;

	readonly simdWorldUp: interop.Reference<number>;

	skinner: SCNSkinner;

	transform: SCNMatrix4;

	readonly worldFront: SCNVector3;

	worldOrientation: SCNVector4;

	worldPosition: SCNVector3;

	readonly worldRight: SCNVector3;

	readonly worldTransform: SCNMatrix4;

	readonly worldUp: SCNVector3;

	static readonly localFront: SCNVector3;

	static readonly localRight: SCNVector3;

	static readonly localUp: SCNVector3;

	static readonly simdLocalFront: interop.Reference<number>;

	static readonly simdLocalRight: interop.Reference<number>;

	static readonly simdLocalUp: interop.Reference<number>;

	readonly actionKeys: NSArray<string>; // inherited from SCNActionable

	readonly animationKeys: NSArray<string>; // inherited from SCNAnimatable

	readonly canBecomeFocused: boolean; // inherited from UIFocusItem

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly frame: CGRect; // inherited from UIFocusItem

	readonly hasActions: boolean; // inherited from SCNActionable

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	actionForKey(key: string): SCNAction;

	addAnimationForKey(animation: SCNAnimationProtocol, key: string): void;

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	addAudioPlayer(player: SCNAudioPlayer): void;

	addChildNode(child: SCNNode): void;

	addParticleSystem(system: SCNParticleSystem): void;

	animationForKey(key: string): CAAnimation;

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

	convertVectorFromNode(vector: SCNVector3, node: SCNNode): SCNVector3;

	convertVectorToNode(vector: SCNVector3, node: SCNNode): SCNVector3;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	didHintFocusMovement(hint: UIFocusMovementHint): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	encodeWithCoder(coder: NSCoder): void;

	enumerateChildNodesUsingBlock(block: (p1: SCNNode, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateHierarchyUsingBlock(block: (p1: SCNNode, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	flattenedClone(): this;

	getBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): boolean;

	getBoundingSphereCenterRadius(center: interop.Pointer | interop.Reference<SCNVector3>, radius: interop.Pointer | interop.Reference<number>): boolean;

	hitTestWithSegmentFromPointToPointOptions(pointA: SCNVector3, pointB: SCNVector3, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	initWithCoder(coder: NSCoder): this;

	insertChildNodeAtIndex(child: SCNNode, index: number): void;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	localRotateBy(rotation: SCNVector4): void;

	localTranslateBy(translation: SCNVector3): void;

	lookAt(worldTarget: SCNVector3): void;

	lookAtUpLocalFront(worldTarget: SCNVector3, worldUp: SCNVector3, localFront: SCNVector3): void;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeActionForKey(key: string): void;

	removeAllActions(): void;

	removeAllAnimations(): void;

	removeAllAudioPlayers(): void;

	removeAllParticleSystems(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	removeAudioPlayer(player: SCNAudioPlayer): void;

	removeFromParentNode(): void;

	removeParticleSystem(system: SCNParticleSystem): void;

	replaceChildNodeWith(oldChild: SCNNode, newChild: SCNNode): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	rotateByAroundTarget(worldRotation: SCNVector4, worldTarget: SCNVector3): void;

	runAction(action: SCNAction): void;

	runActionCompletionHandler(action: SCNAction, block: () => void): void;

	runActionForKey(action: SCNAction, key: string): void;

	runActionForKeyCompletionHandler(action: SCNAction, key: string, block: () => void): void;

	self(): this;

	setBoundingBoxMinMax(min: interop.Pointer | interop.Reference<SCNVector3>, max: interop.Pointer | interop.Reference<SCNVector3>): void;

	setNeedsFocusUpdate(): void;

	setSpeedForAnimationKey(speed: number, key: string): void;

	setWorldTransform(worldTransform: SCNMatrix4): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	simdConvertPositionFromNode(position: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	simdConvertPositionToNode(position: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	simdConvertTransformFromNode(transform: simd_float4x4, node: SCNNode): simd_float4x4;

	simdConvertTransformToNode(transform: simd_float4x4, node: SCNNode): simd_float4x4;

	simdConvertVectorFromNode(vector: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	simdConvertVectorToNode(vector: interop.Reference<number>, node: SCNNode): interop.Reference<number>;

	simdLocalRotateBy(rotation: simd_quatf): void;

	simdLocalTranslateBy(translation: interop.Reference<number>): void;

	simdLookAt(worldTarget: interop.Reference<number>): void;

	simdLookAtUpLocalFront(worldTarget: interop.Reference<number>, worldUp: interop.Reference<number>, localFront: interop.Reference<number>): void;

	simdRotateByAroundTarget(worldRotation: simd_quatf, worldTarget: interop.Reference<number>): void;

	updateFocusIfNeeded(): void;
}

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

	particleIntensity: number;

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	addModifierForPropertiesAtStageWithBlock(properties: NSArray<string> | string[], stage: SCNParticleModifierStage, block: (p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>, p3: number, p4: number, p5: number) => void): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	handleEventForPropertiesWithBlock(event: SCNParticleEvent, properties: NSArray<string> | string[], block: (p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, p2: interop.Pointer | interop.Reference<number>, p3: interop.Pointer | interop.Reference<number>, p4: number) => void): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAllModifiers(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	removeModifiersOfStage(stage: SCNParticleModifierStage): void;

	reset(): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

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

	affectedByGravity: boolean;

	allowsResting: boolean;

	angularDamping: number;

	angularRestingThreshold: number;

	angularVelocity: SCNVector4;

	angularVelocityFactor: SCNVector3;

	categoryBitMask: number;

	centerOfMassOffset: SCNVector3;

	charge: number;

	collisionBitMask: number;

	contactTestBitMask: number;

	continuousCollisionDetectionThreshold: number;

	damping: number;

	friction: number;

	readonly isResting: boolean;

	linearRestingThreshold: number;

	mass: number;

	momentOfInertia: SCNVector3;

	physicsShape: SCNPhysicsShape;

	restitution: number;

	rollingFriction: number;

	type: SCNPhysicsBodyType;

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

	readonly options: NSDictionary<string, any>;

	readonly sourceObject: any;

	readonly transforms: NSArray<NSValue>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SCNPhysicsShapeKeepAsCompoundKey: string;

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNPlane; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNPlane; // inherited from SCNGeometry

	static new(): SCNPlane; // inherited from NSObject

	static planeWithWidthHeight(width: number, height: number): SCNPlane;

	cornerRadius: number;

	cornerSegmentCount: number;

	height: number;

	heightSegmentCount: number;

	width: number;

	widthSegmentCount: number;
}

declare var SCNPreferLowPowerDeviceKey: string;

declare var SCNPreferredDeviceKey: string;

declare var SCNPreferredRenderingAPIKey: string;

declare class SCNProgram extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SCNProgram; // inherited from NSObject

	static new(): SCNProgram; // inherited from NSObject

	static program(): SCNProgram;

	delegate: SCNProgramDelegate;

	fragmentFunctionName: string;

	fragmentShader: string;

	library: MTLLibrary;

	opaque: boolean;

	vertexFunctionName: string;

	vertexShader: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNPyramid; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNPyramid; // inherited from SCNGeometry

	static new(): SCNPyramid; // inherited from NSObject

	static pyramidWithWidthHeightLength(width: number, height: number, length: number): SCNPyramid;

	height: number;

	heightSegmentCount: number;

	length: number;

	lengthSegmentCount: number;

	width: number;

	widthSegmentCount: number;
}

declare const enum SCNReferenceLoadingPolicy {

	Immediate = 0,

	OnDemand = 1
}

declare class SCNReferenceNode extends SCNNode {

	static alloc(): SCNReferenceNode; // inherited from NSObject

	static new(): SCNReferenceNode; // inherited from NSObject

	static node(): SCNReferenceNode; // inherited from SCNNode

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

	static rendererWithDeviceOptions(device: MTLDevice, options: NSDictionary<any, any>): SCNRenderer;

	readonly nextFrameTime: number;

	readonly audioEngine: AVAudioEngine; // inherited from SCNSceneRenderer

	readonly audioEnvironmentNode: AVAudioEnvironmentNode; // inherited from SCNSceneRenderer

	audioListener: SCNNode; // inherited from SCNSceneRenderer

	autoenablesDefaultLighting: boolean; // inherited from SCNSceneRenderer

	readonly colorPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly commandQueue: MTLCommandQueue; // inherited from SCNSceneRenderer

	readonly context: interop.Pointer | interop.Reference<any>; // inherited from SCNSceneRenderer

	readonly currentRenderCommandEncoder: MTLRenderCommandEncoder; // inherited from SCNSceneRenderer

	readonly currentViewport: CGRect; // inherited from SCNSceneRenderer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	debugOptions: SCNDebugOptions; // inherited from SCNSceneRenderer

	delegate: SCNSceneRendererDelegate; // inherited from SCNSceneRenderer

	readonly depthPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly description: string; // inherited from NSObjectProtocol

	readonly device: MTLDevice; // inherited from SCNSceneRenderer

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	jitteringEnabled: boolean; // inherited from SCNSceneRenderer

	loops: boolean; // inherited from SCNSceneRenderer

	overlaySKScene: SKScene; // inherited from SCNSceneRenderer

	playing: boolean; // inherited from SCNSceneRenderer

	pointOfView: SCNNode; // inherited from SCNSceneRenderer

	readonly renderingAPI: SCNRenderingAPI; // inherited from SCNSceneRenderer

	scene: SCNScene; // inherited from SCNSceneRenderer

	sceneTime: number; // inherited from SCNSceneRenderer

	showsStatistics: boolean; // inherited from SCNSceneRenderer

	readonly stencilPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	temporalAntialiasingEnabled: boolean; // inherited from SCNSceneRenderer

	usesReverseZ: boolean; // inherited from SCNSceneRenderer

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean;

	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void;

	projectPoint(point: SCNVector3): SCNVector3;

	render(): void;

	renderAtTime(time: number): void;

	renderAtTimeViewportCommandBufferPassDescriptor(time: number, viewport: CGRect, commandBuffer: MTLCommandBuffer, renderPassDescriptor: MTLRenderPassDescriptor): void;

	renderWithViewportCommandBufferPassDescriptor(viewport: CGRect, commandBuffer: MTLCommandBuffer, renderPassDescriptor: MTLRenderPassDescriptor): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	snapshotAtTimeWithSizeAntialiasingMode(time: number, size: CGSize, antialiasingMode: SCNAntialiasingMode): UIImage;

	unprojectPoint(point: SCNVector3): SCNVector3;

	updateAtTime(time: number): void;

	updateProbesAtTime(lightProbes: NSArray<SCNNode> | SCNNode[], time: number): void;
}

declare const enum SCNRenderingAPI {

	Metal = 0,

	OpenGLES2 = 1
}

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

	static sceneWithMDLAsset(mdlAsset: MDLAsset): SCNScene;

	static sceneWithURLOptionsError(url: NSURL, options: NSDictionary<string, any>): SCNScene;

	readonly background: SCNMaterialProperty;

	fogColor: any;

	fogDensityExponent: number;

	fogEndDistance: number;

	fogStartDistance: number;

	readonly lightingEnvironment: SCNMaterialProperty;

	readonly particleSystems: NSArray<SCNParticleSystem>;

	paused: boolean;

	readonly physicsWorld: SCNPhysicsWorld;

	readonly rootNode: SCNNode;

	screenSpaceReflectionMaximumDistance: number;

	screenSpaceReflectionSampleCount: number;

	screenSpaceReflectionStride: number;

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

	writeToURLOptionsDelegateProgressHandler(url: NSURL, options: NSDictionary<string, any>, delegate: SCNSceneExportDelegate, progressHandler: (p1: number, p2: NSError, p3: interop.Pointer | interop.Reference<boolean>) => void): boolean;
}

declare var SCNSceneEndTimeAttributeKey: string;

interface SCNSceneExportDelegate extends NSObjectProtocol {

	writeImageWithSceneDocumentURLOriginalImageURL?(image: UIImage, documentURL: NSURL, originalImageURL: NSURL): NSURL;
}
declare var SCNSceneExportDelegate: {

	prototype: SCNSceneExportDelegate;
};

declare var SCNSceneExportDestinationURL: string;

declare var SCNSceneFrameRateAttributeKey: string;

interface SCNSceneRenderer extends NSObjectProtocol {

	audioEngine: AVAudioEngine;

	audioEnvironmentNode: AVAudioEnvironmentNode;

	audioListener: SCNNode;

	autoenablesDefaultLighting: boolean;

	colorPixelFormat: MTLPixelFormat;

	commandQueue: MTLCommandQueue;

	context: interop.Pointer | interop.Reference<any>;

	currentRenderCommandEncoder: MTLRenderCommandEncoder;

	currentViewport: CGRect;

	debugOptions: SCNDebugOptions;

	delegate: SCNSceneRendererDelegate;

	depthPixelFormat: MTLPixelFormat;

	device: MTLDevice;

	jitteringEnabled: boolean;

	loops: boolean;

	overlaySKScene: SKScene;

	playing: boolean;

	pointOfView: SCNNode;

	renderingAPI: SCNRenderingAPI;

	scene: SCNScene;

	sceneTime: number;

	showsStatistics: boolean;

	stencilPixelFormat: MTLPixelFormat;

	temporalAntialiasingEnabled: boolean;

	usesReverseZ: boolean;

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	isNodeInsideFrustumWithPointOfView(node: SCNNode, pointOfView: SCNNode): boolean;

	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

	presentSceneWithTransitionIncomingPointOfViewCompletionHandler(scene: SCNScene, transition: SKTransition, pointOfView: SCNNode, completionHandler: () => void): void;

	projectPoint(point: SCNVector3): SCNVector3;

	unprojectPoint(point: SCNVector3): SCNVector3;
}
declare var SCNSceneRenderer: {

	prototype: SCNSceneRenderer;
};

interface SCNSceneRendererDelegate extends NSObjectProtocol {

	rendererDidApplyAnimationsAtTime?(renderer: SCNSceneRenderer, time: number): void;

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

declare var SCNSceneSourceConvertToYUpKey: string;

declare var SCNSceneSourceConvertUnitsToMetersKey: string;

declare var SCNSceneSourceCreateNormalsIfAbsentKey: string;

declare var SCNSceneSourceFlattenSceneKey: string;

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

declare var SCNSceneSourceUseSafeModeKey: string;

declare var SCNSceneStartTimeAttributeKey: string;

declare var SCNSceneUpAxisAttributeKey: string;

interface SCNShadable extends NSObjectProtocol {

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNShape; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNShape; // inherited from SCNGeometry

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNSphere; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNSphere; // inherited from SCNGeometry

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

	addAnimationPlayerForKey(player: SCNAnimationPlayer, key: string): void;

	animationForKey(key: string): CAAnimation;

	animationPlayerForKey(key: string): SCNAnimationPlayer;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	handleBindingOfSymbolUsingBlock(symbol: string, block: (p1: number, p2: number, p3: SCNNode, p4: SCNRenderer) => void): void;

	initWithCoder(coder: NSCoder): this;

	isAnimationForKeyPaused(key: string): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectForKeyedSubscript(key: any): any;

	pauseAnimationForKey(key: string): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllAnimations(): void;

	removeAnimationForKey(key: string): void;

	removeAnimationForKeyBlendOutDuration(key: string, duration: number): void;

	removeAnimationForKeyFadeOutDuration(key: string, duration: number): void;

	respondsToSelector(aSelector: string): boolean;

	resumeAnimationForKey(key: string): void;

	retainCount(): number;

	self(): this;

	setObjectForKeyedSubscript(obj: any, key: any): void;

	setSpeedForAnimationKey(speed: number, key: string): void;
}

interface SCNTechniqueSupport extends NSObjectProtocol {

	technique: SCNTechnique;
}
declare var SCNTechniqueSupport: {

	prototype: SCNTechniqueSupport;
};

declare const enum SCNTessellationSmoothingMode {

	None = 0,

	PNTriangles = 1,

	Phong = 2
}

declare class SCNText extends SCNGeometry {

	static alloc(): SCNText; // inherited from NSObject

	static geometry(): SCNText; // inherited from SCNGeometry

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNText; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNText; // inherited from SCNGeometry

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNTorus; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNTorus; // inherited from SCNGeometry

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

	static orientationConstraintInWorldSpaceWithBlock(world: boolean, block: (p1: SCNNode, p2: SCNVector4) => SCNVector4): SCNTransformConstraint;

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

	static geometryWithMDLMesh(mdlMesh: MDLMesh): SCNTube; // inherited from SCNGeometry

	static geometryWithSourcesElements(sources: NSArray<SCNGeometrySource> | SCNGeometrySource[], elements: NSArray<SCNGeometryElement> | SCNGeometryElement[]): SCNTube; // inherited from SCNGeometry

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

	static appearanceForTraitCollection(trait: UITraitCollection): SCNView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SCNView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SCNView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SCNView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SCNView; // inherited from UIAppearance

	static new(): SCNView; // inherited from NSObject

	allowsCameraControl: boolean;

	antialiasingMode: SCNAntialiasingMode;

	readonly cameraControlConfiguration: SCNCameraControlConfiguration;

	readonly defaultCameraController: SCNCameraController;

	eaglContext: EAGLContext;

	preferredFramesPerSecond: number;

	rendersContinuously: boolean;

	readonly audioEngine: AVAudioEngine; // inherited from SCNSceneRenderer

	readonly audioEnvironmentNode: AVAudioEnvironmentNode; // inherited from SCNSceneRenderer

	audioListener: SCNNode; // inherited from SCNSceneRenderer

	autoenablesDefaultLighting: boolean; // inherited from SCNSceneRenderer

	readonly colorPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly commandQueue: MTLCommandQueue; // inherited from SCNSceneRenderer

	readonly context: interop.Pointer | interop.Reference<any>; // inherited from SCNSceneRenderer

	readonly currentRenderCommandEncoder: MTLRenderCommandEncoder; // inherited from SCNSceneRenderer

	readonly currentViewport: CGRect; // inherited from SCNSceneRenderer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	debugOptions: SCNDebugOptions; // inherited from SCNSceneRenderer

	delegate: SCNSceneRendererDelegate; // inherited from SCNSceneRenderer

	readonly depthPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly description: string; // inherited from NSObjectProtocol

	readonly device: MTLDevice; // inherited from SCNSceneRenderer

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	jitteringEnabled: boolean; // inherited from SCNSceneRenderer

	loops: boolean; // inherited from SCNSceneRenderer

	overlaySKScene: SKScene; // inherited from SCNSceneRenderer

	playing: boolean; // inherited from SCNSceneRenderer

	pointOfView: SCNNode; // inherited from SCNSceneRenderer

	readonly renderingAPI: SCNRenderingAPI; // inherited from SCNSceneRenderer

	scene: SCNScene; // inherited from SCNSceneRenderer

	sceneTime: number; // inherited from SCNSceneRenderer

	showsStatistics: boolean; // inherited from SCNSceneRenderer

	readonly stencilPixelFormat: MTLPixelFormat; // inherited from SCNSceneRenderer

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	technique: SCNTechnique; // inherited from SCNTechniqueSupport

	temporalAntialiasingEnabled: boolean; // inherited from SCNSceneRenderer

	usesReverseZ: boolean; // inherited from SCNSceneRenderer

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

	nodesInsideFrustumWithPointOfView(pointOfView: SCNNode): NSArray<SCNNode>;

	pause(sender: any): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	play(sender: any): void;

	prepareObjectShouldAbortBlock(object: any, block: () => boolean): boolean;

	prepareObjectsWithCompletionHandler(objects: NSArray<any> | any[], completionHandler: (p1: boolean) => void): void;

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
