
declare class SK3DNode extends SKNode {

	static alloc(): SK3DNode; // inherited from NSObject

	static new(): SK3DNode; // inherited from NSObject

	static node(): SK3DNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SK3DNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SK3DNode; // inherited from SKNode

	static nodeWithViewportSize(viewportSize: CGSize): SK3DNode;

	autoenablesDefaultLighting: boolean;

	loops: boolean;

	playing: boolean;

	pointOfView: SCNNode;

	sceneTime: number;

	scnScene: SCNScene;

	viewportSize: CGSize;

	constructor(o: { viewportSize: CGSize; });

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;

	initWithViewportSize(viewportSize: CGSize): this;

	projectPoint(point: interop.Reference<number>): interop.Reference<number>;

	unprojectPoint(point: interop.Reference<number>): interop.Reference<number>;
}

declare class SKAction extends NSObject implements NSCopying, NSSecureCoding {

	static actionNamed(name: string): SKAction;

	static actionNamedDuration(name: string, duration: number): SKAction;

	static actionNamedFromURL(name: string, url: NSURL): SKAction;

	static actionNamedFromURLDuration(name: string, url: NSURL, duration: number): SKAction;

	static alloc(): SKAction; // inherited from NSObject

	static animateWithNormalTexturesTimePerFrame(textures: NSArray<SKTexture> | SKTexture[], sec: number): SKAction;

	static animateWithNormalTexturesTimePerFrameResizeRestore(textures: NSArray<SKTexture> | SKTexture[], sec: number, resize: boolean, restore: boolean): SKAction;

	static animateWithTexturesTimePerFrame(textures: NSArray<SKTexture> | SKTexture[], sec: number): SKAction;

	static animateWithTexturesTimePerFrameResizeRestore(textures: NSArray<SKTexture> | SKTexture[], sec: number, resize: boolean, restore: boolean): SKAction;

	static animateWithWarpsTimes(warps: NSArray<SKWarpGeometry> | SKWarpGeometry[], times: NSArray<number> | number[]): SKAction;

	static animateWithWarpsTimesRestore(warps: NSArray<SKWarpGeometry> | SKWarpGeometry[], times: NSArray<number> | number[], restore: boolean): SKAction;

	static applyAngularImpulseDuration(impulse: number, duration: number): SKAction;

	static applyForceAtPointDuration(force: CGVector, point: CGPoint, duration: number): SKAction;

	static applyForceDuration(force: CGVector, duration: number): SKAction;

	static applyImpulseAtPointDuration(impulse: CGVector, point: CGPoint, duration: number): SKAction;

	static applyImpulseDuration(impulse: CGVector, duration: number): SKAction;

	static applyTorqueDuration(torque: number, duration: number): SKAction;

	static changeChargeByDuration(v: number, duration: number): SKAction;

	static changeChargeToDuration(v: number, duration: number): SKAction;

	static changeMassByDuration(v: number, duration: number): SKAction;

	static changeMassToDuration(v: number, duration: number): SKAction;

	static changeObstructionByDuration(v: number, duration: number): SKAction;

	static changeObstructionToDuration(v: number, duration: number): SKAction;

	static changeOcclusionByDuration(v: number, duration: number): SKAction;

	static changeOcclusionToDuration(v: number, duration: number): SKAction;

	static changePlaybackRateByDuration(v: number, duration: number): SKAction;

	static changePlaybackRateToDuration(v: number, duration: number): SKAction;

	static changeReverbByDuration(v: number, duration: number): SKAction;

	static changeReverbToDuration(v: number, duration: number): SKAction;

	static changeVolumeByDuration(v: number, duration: number): SKAction;

	static changeVolumeToDuration(v: number, duration: number): SKAction;

	static colorizeWithColorBlendFactorDuration(colorBlendFactor: number, sec: number): SKAction;

	static colorizeWithColorColorBlendFactorDuration(color: UIColor, colorBlendFactor: number, duration: number): SKAction;

	static customActionWithDurationActionBlock(duration: number, block: (p1: SKNode, p2: number) => void): SKAction;

	static fadeAlphaByDuration(factor: number, duration: number): SKAction;

	static fadeAlphaToDuration(alpha: number, duration: number): SKAction;

	static fadeInWithDuration(duration: number): SKAction;

	static fadeOutWithDuration(duration: number): SKAction;

	static falloffByDuration(falloff: number, duration: number): SKAction;

	static falloffToDuration(falloff: number, duration: number): SKAction;

	static followPathAsOffsetOrientToPathDuration(path: any, offset: boolean, orient: boolean, duration: number): SKAction;

	static followPathAsOffsetOrientToPathSpeed(path: any, offset: boolean, orient: boolean, speed: number): SKAction;

	static followPathDuration(path: any, duration: number): SKAction;

	static followPathSpeed(path: any, speed: number): SKAction;

	static group(actions: NSArray<SKAction> | SKAction[]): SKAction;

	static hide(): SKAction;

	static moveByDuration(delta: CGVector, duration: number): SKAction;

	static moveByXYDuration(deltaX: number, deltaY: number, duration: number): SKAction;

	static moveToDuration(location: CGPoint, duration: number): SKAction;

	static moveToXDuration(x: number, duration: number): SKAction;

	static moveToYDuration(y: number, duration: number): SKAction;

	static new(): SKAction; // inherited from NSObject

	static pause(): SKAction;

	static performSelectorOnTarget(selector: string, target: any): SKAction;

	static play(): SKAction;

	static playSoundFileNamedWaitForCompletion(soundFile: string, wait: boolean): SKAction;

	static reachToNodeRootNodeDuration(node: SKNode, root: SKNode, sec: number): SKAction;

	static reachToNodeRootNodeVelocity(node: SKNode, root: SKNode, velocity: number): SKAction;

	static reachToRootNodeDuration(position: CGPoint, root: SKNode, duration: number): SKAction;

	static reachToRootNodeVelocity(position: CGPoint, root: SKNode, velocity: number): SKAction;

	static removeFromParent(): SKAction;

	static repeatActionCount(action: SKAction, count: number): SKAction;

	static repeatActionForever(action: SKAction): SKAction;

	static resizeByWidthHeightDuration(width: number, height: number, duration: number): SKAction;

	static resizeToHeightDuration(height: number, duration: number): SKAction;

	static resizeToWidthDuration(width: number, duration: number): SKAction;

	static resizeToWidthHeightDuration(width: number, height: number, duration: number): SKAction;

	static rotateByAngleDuration(radians: number, duration: number): SKAction;

	static rotateToAngleDuration(radians: number, duration: number): SKAction;

	static rotateToAngleDurationShortestUnitArc(radians: number, duration: number, shortestUnitArc: boolean): SKAction;

	static runActionOnChildWithName(action: SKAction, name: string): SKAction;

	static runBlock(block: () => void): SKAction;

	static runBlockQueue(block: () => void, queue: NSObject): SKAction;

	static scaleByDuration(scale: number, duration: number): SKAction;

	static scaleToDuration(scale: number, duration: number): SKAction;

	static scaleToSizeDuration(size: CGSize, duration: number): SKAction;

	static scaleXByYDuration(xScale: number, yScale: number, duration: number): SKAction;

	static scaleXToDuration(scale: number, duration: number): SKAction;

	static scaleXToYDuration(xScale: number, yScale: number, duration: number): SKAction;

	static scaleYToDuration(scale: number, duration: number): SKAction;

	static sequence(actions: NSArray<SKAction> | SKAction[]): SKAction;

	static setNormalTexture(texture: SKTexture): SKAction;

	static setNormalTextureResize(texture: SKTexture, resize: boolean): SKAction;

	static setTexture(texture: SKTexture): SKAction;

	static setTextureResize(texture: SKTexture, resize: boolean): SKAction;

	static speedByDuration(speed: number, duration: number): SKAction;

	static speedToDuration(speed: number, duration: number): SKAction;

	static stereoPanByDuration(v: number, duration: number): SKAction;

	static stereoPanToDuration(v: number, duration: number): SKAction;

	static stop(): SKAction;

	static strengthByDuration(strength: number, duration: number): SKAction;

	static strengthToDuration(strength: number, duration: number): SKAction;

	static unhide(): SKAction;

	static waitForDuration(duration: number): SKAction;

	static waitForDurationWithRange(duration: number, durationRange: number): SKAction;

	static warpToDuration(warp: SKWarpGeometry, duration: number): SKAction;

	duration: number;

	speed: number;

	timingFunction: (p1: number) => number;

	timingMode: SKActionTimingMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	reversedAction(): SKAction;
}

declare const enum SKActionTimingMode {

	Linear = 0,

	EaseIn = 1,

	EaseOut = 2,

	EaseInEaseOut = 3
}

declare class SKAttribute extends NSObject implements NSSecureCoding {

	static alloc(): SKAttribute; // inherited from NSObject

	static attributeWithNameType(name: string, type: SKAttributeType): SKAttribute;

	static new(): SKAttribute; // inherited from NSObject

	readonly name: string;

	readonly type: SKAttributeType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; type: SKAttributeType; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameType(name: string, type: SKAttributeType): this;
}

declare const enum SKAttributeType {

	None = 0,

	Float = 1,

	VectorFloat2 = 2,

	VectorFloat3 = 3,

	VectorFloat4 = 4,

	HalfFloat = 5,

	VectorHalfFloat2 = 6,

	VectorHalfFloat3 = 7,

	VectorHalfFloat4 = 8
}

declare class SKAttributeValue extends NSObject implements NSSecureCoding {

	static alloc(): SKAttributeValue; // inherited from NSObject

	static new(): SKAttributeValue; // inherited from NSObject

	static valueWithFloat(value: number): SKAttributeValue;

	static valueWithVectorFloat2(value: interop.Reference<number>): SKAttributeValue;

	static valueWithVectorFloat3(value: interop.Reference<number>): SKAttributeValue;

	static valueWithVectorFloat4(value: interop.Reference<number>): SKAttributeValue;

	floatValue: number;

	vectorFloat2Value: interop.Reference<number>;

	vectorFloat3Value: interop.Reference<number>;

	vectorFloat4Value: interop.Reference<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SKAudioNode extends SKNode implements NSSecureCoding {

	static alloc(): SKAudioNode; // inherited from NSObject

	static new(): SKAudioNode; // inherited from NSObject

	static node(): SKAudioNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKAudioNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKAudioNode; // inherited from SKNode

	autoplayLooped: boolean;

	avAudioNode: AVAudioNode;

	positional: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { AVAudioNode: AVAudioNode; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	encodeWithCoder(coder: NSCoder): void;

	initWithAVAudioNode(node: AVAudioNode): this;

	initWithCoder(coder: NSCoder): this;

	initWithFileNamed(name: string): this;

	initWithURL(url: NSURL): this;
}

declare const enum SKBlendMode {

	Alpha = 0,

	Add = 1,

	Subtract = 2,

	Multiply = 3,

	MultiplyX2 = 4,

	Screen = 5,

	Replace = 6,

	MultiplyAlpha = 7
}

declare class SKCameraNode extends SKNode {

	static alloc(): SKCameraNode; // inherited from NSObject

	static new(): SKCameraNode; // inherited from NSObject

	static node(): SKCameraNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKCameraNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKCameraNode; // inherited from SKNode

	containedNodeSet(): NSSet<SKNode>;

	containsNode(node: SKNode): boolean;
}

declare class SKConstraint extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKConstraint; // inherited from NSObject

	static distanceToNode(range: SKRange, node: SKNode): SKConstraint;

	static distanceToPoint(range: SKRange, point: CGPoint): SKConstraint;

	static distanceToPointInNode(range: SKRange, point: CGPoint, node: SKNode): SKConstraint;

	static new(): SKConstraint; // inherited from NSObject

	static orientToNodeOffset(node: SKNode, radians: SKRange): SKConstraint;

	static orientToPointInNodeOffset(point: CGPoint, node: SKNode, radians: SKRange): SKConstraint;

	static orientToPointOffset(point: CGPoint, radians: SKRange): SKConstraint;

	static positionX(range: SKRange): SKConstraint;

	static positionXY(xRange: SKRange, yRange: SKRange): SKConstraint;

	static positionY(range: SKRange): SKConstraint;

	static zRotation(zRange: SKRange): SKConstraint;

	enabled: boolean;

	referenceNode: SKNode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SKCropNode extends SKNode {

	static alloc(): SKCropNode; // inherited from NSObject

	static new(): SKCropNode; // inherited from NSObject

	static node(): SKCropNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKCropNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKCropNode; // inherited from SKNode

	maskNode: SKNode;
}

declare class SKEffectNode extends SKNode implements SKWarpable {

	static alloc(): SKEffectNode; // inherited from NSObject

	static new(): SKEffectNode; // inherited from NSObject

	static node(): SKEffectNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKEffectNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKEffectNode; // inherited from SKNode

	blendMode: SKBlendMode;

	filter: CIFilter;

	shader: SKShader;

	shouldCenterFilter: boolean;

	shouldEnableEffects: boolean;

	shouldRasterize: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	subdivisionLevels: number; // inherited from SKWarpable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	warpGeometry: SKWarpGeometry; // inherited from SKWarpable

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
}

declare class SKEmitterNode extends SKNode {

	static alloc(): SKEmitterNode; // inherited from NSObject

	static new(): SKEmitterNode; // inherited from NSObject

	static node(): SKEmitterNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKEmitterNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKEmitterNode; // inherited from SKNode

	emissionAngle: number;

	emissionAngleRange: number;

	fieldBitMask: number;

	numParticlesToEmit: number;

	particleAction: SKAction;

	particleAlpha: number;

	particleAlphaRange: number;

	particleAlphaSequence: SKKeyframeSequence;

	particleAlphaSpeed: number;

	particleBirthRate: number;

	particleBlendMode: SKBlendMode;

	particleColor: UIColor;

	particleColorAlphaRange: number;

	particleColorAlphaSpeed: number;

	particleColorBlendFactor: number;

	particleColorBlendFactorRange: number;

	particleColorBlendFactorSequence: SKKeyframeSequence;

	particleColorBlendFactorSpeed: number;

	particleColorBlueRange: number;

	particleColorBlueSpeed: number;

	particleColorGreenRange: number;

	particleColorGreenSpeed: number;

	particleColorRedRange: number;

	particleColorRedSpeed: number;

	particleColorSequence: SKKeyframeSequence;

	particleLifetime: number;

	particleLifetimeRange: number;

	particlePosition: CGPoint;

	particlePositionRange: CGVector;

	particleRenderOrder: SKParticleRenderOrder;

	particleRotation: number;

	particleRotationRange: number;

	particleRotationSpeed: number;

	particleScale: number;

	particleScaleRange: number;

	particleScaleSequence: SKKeyframeSequence;

	particleScaleSpeed: number;

	particleSize: CGSize;

	particleSpeed: number;

	particleSpeedRange: number;

	particleTexture: SKTexture;

	particleZPosition: number;

	particleZPositionRange: number;

	particleZPositionSpeed: number;

	shader: SKShader;

	targetNode: SKNode;

	xAcceleration: number;

	yAcceleration: number;

	advanceSimulationTime(sec: number): void;

	resetSimulation(): void;
}

declare class SKFieldNode extends SKNode {

	static alloc(): SKFieldNode; // inherited from NSObject

	static customFieldWithEvaluationBlock(block: (p1: interop.Reference<number>, p2: interop.Reference<number>, p3: number, p4: number, p5: number) => interop.Reference<number>): SKFieldNode;

	static dragField(): SKFieldNode;

	static electricField(): SKFieldNode;

	static linearGravityFieldWithVector(direction: interop.Reference<number>): SKFieldNode;

	static magneticField(): SKFieldNode;

	static new(): SKFieldNode; // inherited from NSObject

	static node(): SKFieldNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKFieldNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKFieldNode; // inherited from SKNode

	static noiseFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SKFieldNode;

	static radialGravityField(): SKFieldNode;

	static springField(): SKFieldNode;

	static turbulenceFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SKFieldNode;

	static velocityFieldWithTexture(velocityTexture: SKTexture): SKFieldNode;

	static velocityFieldWithVector(direction: interop.Reference<number>): SKFieldNode;

	static vortexField(): SKFieldNode;

	animationSpeed: number;

	categoryBitMask: number;

	direction: interop.Reference<number>;

	enabled: boolean;

	exclusive: boolean;

	falloff: number;

	minimumRadius: number;

	region: SKRegion;

	smoothness: number;

	strength: number;

	texture: SKTexture;
}

declare const enum SKInterpolationMode {

	Linear = 1,

	Spline = 2,

	Step = 3
}

declare class SKKeyframeSequence extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKKeyframeSequence; // inherited from NSObject

	static new(): SKKeyframeSequence; // inherited from NSObject

	interpolationMode: SKInterpolationMode;

	repeatMode: SKRepeatMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { capacity: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { keyframeValues: NSArray<any> | any[]; times: NSArray<number> | number[]; });

	addKeyframeValueTime(value: any, time: number): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	count(): number;

	encodeWithCoder(coder: NSCoder): void;

	getKeyframeTimeForIndex(index: number): number;

	getKeyframeValueForIndex(index: number): any;

	initWithCapacity(numItems: number): this;

	initWithCoder(coder: NSCoder): this;

	initWithKeyframeValuesTimes(values: NSArray<any> | any[], times: NSArray<number> | number[]): this;

	removeKeyframeAtIndex(index: number): void;

	removeLastKeyframe(): void;

	sampleAtTime(time: number): any;

	setKeyframeTimeForIndex(time: number, index: number): void;

	setKeyframeValueForIndex(value: any, index: number): void;

	setKeyframeValueTimeForIndex(value: any, time: number, index: number): void;
}

declare const enum SKLabelHorizontalAlignmentMode {

	Center = 0,

	Left = 1,

	Right = 2
}

declare class SKLabelNode extends SKNode {

	static alloc(): SKLabelNode; // inherited from NSObject

	static labelNodeWithAttributedText(attributedText: NSAttributedString): SKLabelNode;

	static labelNodeWithFontNamed(fontName: string): SKLabelNode;

	static labelNodeWithText(text: string): SKLabelNode;

	static new(): SKLabelNode; // inherited from NSObject

	static node(): SKLabelNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKLabelNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKLabelNode; // inherited from SKNode

	attributedText: NSAttributedString;

	blendMode: SKBlendMode;

	color: UIColor;

	colorBlendFactor: number;

	fontColor: UIColor;

	fontName: string;

	fontSize: number;

	horizontalAlignmentMode: SKLabelHorizontalAlignmentMode;

	lineBreakMode: NSLineBreakMode;

	numberOfLines: number;

	preferredMaxLayoutWidth: number;

	text: string;

	verticalAlignmentMode: SKLabelVerticalAlignmentMode;

	constructor(o: { fontNamed: string; });

	initWithFontNamed(fontName: string): this;
}

declare const enum SKLabelVerticalAlignmentMode {

	Baseline = 0,

	Center = 1,

	Top = 2,

	Bottom = 3
}

declare class SKLightNode extends SKNode {

	static alloc(): SKLightNode; // inherited from NSObject

	static new(): SKLightNode; // inherited from NSObject

	static node(): SKLightNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKLightNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKLightNode; // inherited from SKNode

	ambientColor: UIColor;

	categoryBitMask: number;

	enabled: boolean;

	falloff: number;

	lightColor: UIColor;

	shadowColor: UIColor;
}

declare class SKMutableTexture extends SKTexture {

	static alloc(): SKMutableTexture; // inherited from NSObject

	static mutableTextureWithSize(size: CGSize): SKMutableTexture;

	static new(): SKMutableTexture; // inherited from NSObject

	static textureNoiseWithSmoothnessSizeGrayscale(smoothness: number, size: CGSize, grayscale: boolean): SKMutableTexture; // inherited from SKTexture

	static textureVectorNoiseWithSmoothnessSize(smoothness: number, size: CGSize): SKMutableTexture; // inherited from SKTexture

	static textureWithCGImage(image: any): SKMutableTexture; // inherited from SKTexture

	static textureWithDataSize(pixelData: NSData, size: CGSize): SKMutableTexture; // inherited from SKTexture

	static textureWithDataSizeFlipped(pixelData: NSData, size: CGSize, flipped: boolean): SKMutableTexture; // inherited from SKTexture

	static textureWithDataSizeRowLengthAlignment(pixelData: NSData, size: CGSize, rowLength: number, alignment: number): SKMutableTexture; // inherited from SKTexture

	static textureWithImage(image: UIImage): SKMutableTexture; // inherited from SKTexture

	static textureWithImageNamed(name: string): SKMutableTexture; // inherited from SKTexture

	static textureWithNoiseMap(noiseMap: GKNoiseMap): SKMutableTexture; // inherited from SKTexture

	static textureWithRectInTexture(rect: CGRect, texture: SKTexture): SKMutableTexture; // inherited from SKTexture

	constructor(o: { size: CGSize; });

	constructor(o: { size: CGSize; pixelFormat: number; });

	initWithSize(size: CGSize): this;

	initWithSizePixelFormat(size: CGSize, format: number): this;

	modifyPixelDataWithBlock(block: (p1: interop.Pointer | interop.Reference<any>, p2: number) => void): void;
}

declare class SKNode extends UIResponder implements NSCopying, NSSecureCoding, UIFocusItem {

	static alloc(): SKNode; // inherited from NSObject

	static new(): SKNode; // inherited from NSObject

	static node(): SKNode;

	static nodeWithFileNamed(filename: string): SKNode;

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKNode;

	static obstaclesFromNodeBounds(nodes: NSArray<SKNode> | SKNode[]): NSArray<GKPolygonObstacle>;

	static obstaclesFromNodePhysicsBodies(nodes: NSArray<SKNode> | SKNode[]): NSArray<GKPolygonObstacle>;

	static obstaclesFromSpriteTexturesAccuracy(sprites: NSArray<SKNode> | SKNode[], accuracy: number): NSArray<GKPolygonObstacle>;

	alpha: number;

	attributeValues: NSDictionary<string, SKAttributeValue>;

	readonly children: NSArray<SKNode>;

	constraints: NSArray<SKConstraint>;

	entity: GKEntity;

	focusBehavior: SKNodeFocusBehavior;

	hidden: boolean;

	name: string;

	readonly parent: SKNode;

	paused: boolean;

	physicsBody: SKPhysicsBody;

	position: CGPoint;

	reachConstraints: SKReachConstraints;

	readonly scene: SKScene;

	speed: number;

	userData: NSMutableDictionary<any, any>;

	userInteractionEnabled: boolean;

	xScale: number;

	yScale: number;

	zPosition: number;

	zRotation: number;

	readonly canBecomeFocused: boolean; // inherited from UIFocusItem

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly frame: CGRect; // inherited from UIFocusItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	actionForKey(key: string): SKAction;

	addChild(node: SKNode): void;

	calculateAccumulatedFrame(): CGRect;

	childNodeWithName(name: string): SKNode;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	containsPoint(p: CGPoint): boolean;

	convertPointFromNode(point: CGPoint, node: SKNode): CGPoint;

	convertPointToNode(point: CGPoint, node: SKNode): CGPoint;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	didHintFocusMovement(hint: UIFocusMovementHint): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	encodeWithCoder(coder: NSCoder): void;

	enumerateChildNodesWithNameUsingBlock(name: string, block: (p1: SKNode, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	hasActions(): boolean;

	inParentHierarchy(parent: SKNode): boolean;

	initWithCoder(coder: NSCoder): this;

	insertChildAtIndex(node: SKNode, index: number): void;

	intersectsNode(node: SKNode): boolean;

	isEqual(object: any): boolean;

	isEqualToNode(node: SKNode): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	moveToParent(parent: SKNode): void;

	nodeAtPoint(p: CGPoint): SKNode;

	nodesAtPoint(p: CGPoint): NSArray<SKNode>;

	objectForKeyedSubscript(name: string): NSArray<SKNode>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeActionForKey(key: string): void;

	removeAllActions(): void;

	removeAllChildren(): void;

	removeChildrenInArray(nodes: NSArray<SKNode> | SKNode[]): void;

	removeFromParent(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	runAction(action: SKAction): void;

	runActionCompletion(action: SKAction, block: () => void): void;

	runActionWithKey(action: SKAction, key: string): void;

	self(): this;

	setNeedsFocusUpdate(): void;

	setScale(scale: number): void;

	setValueForAttributeNamed(value: SKAttributeValue, key: string): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	updateFocusIfNeeded(): void;

	valueForAttributeNamed(key: string): SKAttributeValue;
}

declare const enum SKNodeFocusBehavior {

	None = 0,

	Occluding = 1,

	Focusable = 2
}

declare const enum SKParticleRenderOrder {

	OldestLast = 0,

	OldestFirst = 1,

	DontCare = 2
}

declare class SKPhysicsBody extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKPhysicsBody; // inherited from NSObject

	static bodyWithBodies(bodies: NSArray<SKPhysicsBody> | SKPhysicsBody[]): SKPhysicsBody;

	static bodyWithCircleOfRadius(r: number): SKPhysicsBody;

	static bodyWithCircleOfRadiusCenter(r: number, center: CGPoint): SKPhysicsBody;

	static bodyWithEdgeChainFromPath(path: any): SKPhysicsBody;

	static bodyWithEdgeFromPointToPoint(p1: CGPoint, p2: CGPoint): SKPhysicsBody;

	static bodyWithEdgeLoopFromPath(path: any): SKPhysicsBody;

	static bodyWithEdgeLoopFromRect(rect: CGRect): SKPhysicsBody;

	static bodyWithPolygonFromPath(path: any): SKPhysicsBody;

	static bodyWithRectangleOfSize(s: CGSize): SKPhysicsBody;

	static bodyWithRectangleOfSizeCenter(s: CGSize, center: CGPoint): SKPhysicsBody;

	static bodyWithTextureAlphaThresholdSize(texture: SKTexture, alphaThreshold: number, size: CGSize): SKPhysicsBody;

	static bodyWithTextureSize(texture: SKTexture, size: CGSize): SKPhysicsBody;

	static new(): SKPhysicsBody; // inherited from NSObject

	affectedByGravity: boolean;

	allowsRotation: boolean;

	angularDamping: number;

	angularVelocity: number;

	readonly area: number;

	categoryBitMask: number;

	charge: number;

	collisionBitMask: number;

	contactTestBitMask: number;

	density: number;

	dynamic: boolean;

	fieldBitMask: number;

	friction: number;

	readonly joints: NSArray<SKPhysicsJoint>;

	linearDamping: number;

	mass: number;

	readonly node: SKNode;

	pinned: boolean;

	resting: boolean;

	restitution: number;

	usesPreciseCollisionDetection: boolean;

	velocity: CGVector;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	allContactedBodies(): NSArray<SKPhysicsBody>;

	applyAngularImpulse(impulse: number): void;

	applyForce(force: CGVector): void;

	applyForceAtPoint(force: CGVector, point: CGPoint): void;

	applyImpulse(impulse: CGVector): void;

	applyImpulseAtPoint(impulse: CGVector, point: CGPoint): void;

	applyTorque(torque: number): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SKPhysicsContact extends NSObject {

	static alloc(): SKPhysicsContact; // inherited from NSObject

	static new(): SKPhysicsContact; // inherited from NSObject

	readonly bodyA: SKPhysicsBody;

	readonly bodyB: SKPhysicsBody;

	readonly collisionImpulse: number;

	readonly contactNormal: CGVector;

	readonly contactPoint: CGPoint;
}

interface SKPhysicsContactDelegate extends NSObjectProtocol {

	didBeginContact?(contact: SKPhysicsContact): void;

	didEndContact?(contact: SKPhysicsContact): void;
}
declare var SKPhysicsContactDelegate: {

	prototype: SKPhysicsContactDelegate;
};

declare class SKPhysicsJoint extends NSObject implements NSSecureCoding {

	static alloc(): SKPhysicsJoint; // inherited from NSObject

	static new(): SKPhysicsJoint; // inherited from NSObject

	bodyA: SKPhysicsBody;

	bodyB: SKPhysicsBody;

	readonly reactionForce: CGVector;

	readonly reactionTorque: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SKPhysicsJointFixed extends SKPhysicsJoint {

	static alloc(): SKPhysicsJointFixed; // inherited from NSObject

	static jointWithBodyABodyBAnchor(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchor: CGPoint): SKPhysicsJointFixed;

	static new(): SKPhysicsJointFixed; // inherited from NSObject
}

declare class SKPhysicsJointLimit extends SKPhysicsJoint {

	static alloc(): SKPhysicsJointLimit; // inherited from NSObject

	static jointWithBodyABodyBAnchorAAnchorB(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchorA: CGPoint, anchorB: CGPoint): SKPhysicsJointLimit;

	static new(): SKPhysicsJointLimit; // inherited from NSObject

	maxLength: number;
}

declare class SKPhysicsJointPin extends SKPhysicsJoint {

	static alloc(): SKPhysicsJointPin; // inherited from NSObject

	static jointWithBodyABodyBAnchor(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchor: CGPoint): SKPhysicsJointPin;

	static new(): SKPhysicsJointPin; // inherited from NSObject

	frictionTorque: number;

	lowerAngleLimit: number;

	rotationSpeed: number;

	shouldEnableLimits: boolean;

	upperAngleLimit: number;
}

declare class SKPhysicsJointSliding extends SKPhysicsJoint {

	static alloc(): SKPhysicsJointSliding; // inherited from NSObject

	static jointWithBodyABodyBAnchorAxis(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchor: CGPoint, axis: CGVector): SKPhysicsJointSliding;

	static new(): SKPhysicsJointSliding; // inherited from NSObject

	lowerDistanceLimit: number;

	shouldEnableLimits: boolean;

	upperDistanceLimit: number;
}

declare class SKPhysicsJointSpring extends SKPhysicsJoint {

	static alloc(): SKPhysicsJointSpring; // inherited from NSObject

	static jointWithBodyABodyBAnchorAAnchorB(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchorA: CGPoint, anchorB: CGPoint): SKPhysicsJointSpring;

	static new(): SKPhysicsJointSpring; // inherited from NSObject

	damping: number;

	frequency: number;
}

declare class SKPhysicsWorld extends NSObject implements NSSecureCoding {

	static alloc(): SKPhysicsWorld; // inherited from NSObject

	static new(): SKPhysicsWorld; // inherited from NSObject

	contactDelegate: SKPhysicsContactDelegate;

	gravity: CGVector;

	speed: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addJoint(joint: SKPhysicsJoint): void;

	bodyAlongRayStartEnd(start: CGPoint, end: CGPoint): SKPhysicsBody;

	bodyAtPoint(point: CGPoint): SKPhysicsBody;

	bodyInRect(rect: CGRect): SKPhysicsBody;

	encodeWithCoder(coder: NSCoder): void;

	enumerateBodiesAlongRayStartEndUsingBlock(start: CGPoint, end: CGPoint, block: (p1: SKPhysicsBody, p2: CGPoint, p3: CGVector, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateBodiesAtPointUsingBlock(point: CGPoint, block: (p1: SKPhysicsBody, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateBodiesInRectUsingBlock(rect: CGRect, block: (p1: SKPhysicsBody, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	initWithCoder(coder: NSCoder): this;

	removeAllJoints(): void;

	removeJoint(joint: SKPhysicsJoint): void;

	sampleFieldsAt(position: interop.Reference<number>): interop.Reference<number>;
}

declare class SKRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKRange; // inherited from NSObject

	static new(): SKRange; // inherited from NSObject

	static rangeWithConstantValue(value: number): SKRange;

	static rangeWithLowerLimit(lower: number): SKRange;

	static rangeWithLowerLimitUpperLimit(lower: number, upper: number): SKRange;

	static rangeWithNoLimits(): SKRange;

	static rangeWithUpperLimit(upper: number): SKRange;

	static rangeWithValueVariance(value: number, variance: number): SKRange;

	lowerLimit: number;

	upperLimit: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { lowerLimit: number; upperLimit: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLowerLimitUpperLimit(lower: number, upper: number): this;
}

declare class SKReachConstraints extends NSObject implements NSSecureCoding {

	static alloc(): SKReachConstraints; // inherited from NSObject

	static new(): SKReachConstraints; // inherited from NSObject

	lowerAngleLimit: number;

	upperAngleLimit: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { lowerAngleLimit: number; upperAngleLimit: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLowerAngleLimitUpperAngleLimit(lowerAngleLimit: number, upperAngleLimit: number): this;
}

declare class SKReferenceNode extends SKNode {

	static alloc(): SKReferenceNode; // inherited from NSObject

	static new(): SKReferenceNode; // inherited from NSObject

	static node(): SKReferenceNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKReferenceNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKReferenceNode; // inherited from SKNode

	static referenceNodeWithFileNamed(fileName: string): SKReferenceNode;

	static referenceNodeWithURL(referenceURL: NSURL): SKReferenceNode;

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	didLoadReferenceNode(node: SKNode): void;

	initWithFileNamed(fileName: string): this;

	initWithURL(url: NSURL): this;

	resolveReferenceNode(): void;
}

declare class SKRegion extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKRegion; // inherited from NSObject

	static infiniteRegion(): SKRegion;

	static new(): SKRegion; // inherited from NSObject

	readonly path: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { path: any; });

	constructor(o: { radius: number; });

	constructor(o: { size: CGSize; });

	containsPoint(point: CGPoint): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPath(path: any): this;

	initWithRadius(radius: number): this;

	initWithSize(size: CGSize): this;

	inverseRegion(): this;

	regionByDifferenceFromRegion(region: SKRegion): this;

	regionByIntersectionWithRegion(region: SKRegion): this;

	regionByUnionWithRegion(region: SKRegion): this;
}

declare class SKRenderer extends NSObject {

	static alloc(): SKRenderer; // inherited from NSObject

	static new(): SKRenderer; // inherited from NSObject

	static rendererWithDevice(device: MTLDevice): SKRenderer;

	ignoresSiblingOrder: boolean;

	scene: SKScene;

	shouldCullNonVisibleNodes: boolean;

	showsDrawCount: boolean;

	showsFields: boolean;

	showsNodeCount: boolean;

	showsPhysics: boolean;

	showsQuadCount: boolean;

	renderWithViewportCommandBufferRenderPassDescriptor(viewport: CGRect, commandBuffer: MTLCommandBuffer, renderPassDescriptor: MTLRenderPassDescriptor): void;

	renderWithViewportRenderCommandEncoderRenderPassDescriptorCommandQueue(viewport: CGRect, renderCommandEncoder: MTLRenderCommandEncoder, renderPassDescriptor: MTLRenderPassDescriptor, commandQueue: MTLCommandQueue): void;

	updateAtTime(currentTime: number): void;
}

declare const enum SKRepeatMode {

	Clamp = 1,

	Loop = 2
}

declare class SKScene extends SKEffectNode implements GKSceneRootNodeType {

	static alloc(): SKScene; // inherited from NSObject

	static new(): SKScene; // inherited from NSObject

	static node(): SKScene; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKScene; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKScene; // inherited from SKNode

	static sceneWithSize(size: CGSize): SKScene;

	anchorPoint: CGPoint;

	readonly audioEngine: AVAudioEngine;

	backgroundColor: UIColor;

	camera: SKCameraNode;

	delegate: SKSceneDelegate;

	listener: SKNode;

	readonly physicsWorld: SKPhysicsWorld;

	scaleMode: SKSceneScaleMode;

	size: CGSize;

	readonly view: SKView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { size: CGSize; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	convertPointFromView(point: CGPoint): CGPoint;

	convertPointToView(point: CGPoint): CGPoint;

	didApplyConstraints(): void;

	didChangeSize(oldSize: CGSize): void;

	didEvaluateActions(): void;

	didFinishUpdate(): void;

	didMoveToView(view: SKView): void;

	didSimulatePhysics(): void;

	initWithSize(size: CGSize): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	sceneDidLoad(): void;

	self(): this;

	update(currentTime: number): void;

	willMoveFromView(view: SKView): void;
}

interface SKSceneDelegate extends NSObjectProtocol {

	didApplyConstraintsForScene?(scene: SKScene): void;

	didEvaluateActionsForScene?(scene: SKScene): void;

	didFinishUpdateForScene?(scene: SKScene): void;

	didSimulatePhysicsForScene?(scene: SKScene): void;

	updateForScene?(currentTime: number, scene: SKScene): void;
}
declare var SKSceneDelegate: {

	prototype: SKSceneDelegate;
};

declare const enum SKSceneScaleMode {

	Fill = 0,

	AspectFill = 1,

	AspectFit = 2,

	ResizeFill = 3
}

declare class SKShader extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKShader; // inherited from NSObject

	static new(): SKShader; // inherited from NSObject

	static shader(): SKShader;

	static shaderWithFileNamed(name: string): SKShader;

	static shaderWithSource(source: string): SKShader;

	static shaderWithSourceUniforms(source: string, uniforms: NSArray<SKUniform> | SKUniform[]): SKShader;

	attributes: NSArray<SKAttribute>;

	source: string;

	uniforms: NSArray<SKUniform>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { source: string; });

	constructor(o: { source: string; uniforms: NSArray<SKUniform> | SKUniform[]; });

	addUniform(uniform: SKUniform): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSource(source: string): this;

	initWithSourceUniforms(source: string, uniforms: NSArray<SKUniform> | SKUniform[]): this;

	removeUniformNamed(name: string): void;

	uniformNamed(name: string): SKUniform;
}

declare class SKShapeNode extends SKNode {

	static alloc(): SKShapeNode; // inherited from NSObject

	static new(): SKShapeNode; // inherited from NSObject

	static node(): SKShapeNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKShapeNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKShapeNode; // inherited from SKNode

	static shapeNodeWithCircleOfRadius(radius: number): SKShapeNode;

	static shapeNodeWithEllipseInRect(rect: CGRect): SKShapeNode;

	static shapeNodeWithEllipseOfSize(size: CGSize): SKShapeNode;

	static shapeNodeWithPath(path: any): SKShapeNode;

	static shapeNodeWithPathCentered(path: any, centered: boolean): SKShapeNode;

	static shapeNodeWithPointsCount(points: interop.Pointer | interop.Reference<CGPoint>, numPoints: number): SKShapeNode;

	static shapeNodeWithRect(rect: CGRect): SKShapeNode;

	static shapeNodeWithRectCornerRadius(rect: CGRect, cornerRadius: number): SKShapeNode;

	static shapeNodeWithRectOfSize(size: CGSize): SKShapeNode;

	static shapeNodeWithRectOfSizeCornerRadius(size: CGSize, cornerRadius: number): SKShapeNode;

	static shapeNodeWithSplinePointsCount(points: interop.Pointer | interop.Reference<CGPoint>, numPoints: number): SKShapeNode;

	antialiased: boolean;

	blendMode: SKBlendMode;

	fillColor: UIColor;

	fillShader: SKShader;

	fillTexture: SKTexture;

	glowWidth: number;

	lineCap: CGLineCap;

	lineJoin: CGLineJoin;

	readonly lineLength: number;

	lineWidth: number;

	miterLimit: number;

	path: any;

	strokeColor: UIColor;

	strokeShader: SKShader;

	strokeTexture: SKTexture;
}

declare class SKSpriteNode extends SKNode implements SKWarpable {

	static alloc(): SKSpriteNode; // inherited from NSObject

	static new(): SKSpriteNode; // inherited from NSObject

	static node(): SKSpriteNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKSpriteNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKSpriteNode; // inherited from SKNode

	static spriteNodeWithColorSize(color: UIColor, size: CGSize): SKSpriteNode;

	static spriteNodeWithImageNamed(name: string): SKSpriteNode;

	static spriteNodeWithImageNamedNormalMapped(name: string, generateNormalMap: boolean): SKSpriteNode;

	static spriteNodeWithTexture(texture: SKTexture): SKSpriteNode;

	static spriteNodeWithTextureNormalMap(texture: SKTexture, normalMap: SKTexture): SKSpriteNode;

	static spriteNodeWithTextureSize(texture: SKTexture, size: CGSize): SKSpriteNode;

	anchorPoint: CGPoint;

	blendMode: SKBlendMode;

	centerRect: CGRect;

	color: UIColor;

	colorBlendFactor: number;

	lightingBitMask: number;

	normalTexture: SKTexture;

	shader: SKShader;

	shadowCastBitMask: number;

	shadowedBitMask: number;

	size: CGSize;

	texture: SKTexture;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	subdivisionLevels: number; // inherited from SKWarpable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	warpGeometry: SKWarpGeometry; // inherited from SKWarpable

	readonly  // inherited from NSObjectProtocol

	constructor(o: { color: UIColor; size: CGSize; });

	constructor(o: { imageNamed: string; });

	constructor(o: { texture: SKTexture; });

	constructor(o: { texture: SKTexture; color: UIColor; size: CGSize; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithColorSize(color: UIColor, size: CGSize): this;

	initWithImageNamed(name: string): this;

	initWithTexture(texture: SKTexture): this;

	initWithTextureColorSize(texture: SKTexture, color: UIColor, size: CGSize): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scaleToSize(size: CGSize): void;

	self(): this;
}

declare class SKTexture extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKTexture; // inherited from NSObject

	static new(): SKTexture; // inherited from NSObject

	static preloadTexturesWithCompletionHandler(textures: NSArray<SKTexture> | SKTexture[], completionHandler: () => void): void;

	static textureNoiseWithSmoothnessSizeGrayscale(smoothness: number, size: CGSize, grayscale: boolean): SKTexture;

	static textureVectorNoiseWithSmoothnessSize(smoothness: number, size: CGSize): SKTexture;

	static textureWithCGImage(image: any): SKTexture;

	static textureWithDataSize(pixelData: NSData, size: CGSize): SKTexture;

	static textureWithDataSizeFlipped(pixelData: NSData, size: CGSize, flipped: boolean): SKTexture;

	static textureWithDataSizeRowLengthAlignment(pixelData: NSData, size: CGSize, rowLength: number, alignment: number): SKTexture;

	static textureWithImage(image: UIImage): SKTexture;

	static textureWithImageNamed(name: string): SKTexture;

	static textureWithNoiseMap(noiseMap: GKNoiseMap): SKTexture;

	static textureWithRectInTexture(rect: CGRect, texture: SKTexture): SKTexture;

	filteringMode: SKTextureFilteringMode;

	usesMipmaps: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	CGImage(): any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	preloadWithCompletionHandler(completionHandler: () => void): void;

	size(): CGSize;

	textureByApplyingCIFilter(filter: CIFilter): this;

	textureByGeneratingNormalMap(): this;

	textureByGeneratingNormalMapWithSmoothnessContrast(smoothness: number, contrast: number): this;

	textureRect(): CGRect;
}

declare class SKTextureAtlas extends NSObject implements NSSecureCoding {

	static alloc(): SKTextureAtlas; // inherited from NSObject

	static atlasNamed(name: string): SKTextureAtlas;

	static atlasWithDictionary(properties: NSDictionary<string, any>): SKTextureAtlas;

	static new(): SKTextureAtlas; // inherited from NSObject

	static preloadTextureAtlasesNamedWithCompletionHandler(atlasNames: NSArray<string> | string[], completionHandler: (p1: NSError, p2: NSArray<SKTextureAtlas>) => void): void;

	static preloadTextureAtlasesWithCompletionHandler(textureAtlases: NSArray<SKTextureAtlas> | SKTextureAtlas[], completionHandler: () => void): void;

	readonly textureNames: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	preloadWithCompletionHandler(completionHandler: () => void): void;

	textureNamed(name: string): SKTexture;
}

declare const enum SKTextureFilteringMode {

	Nearest = 0,

	Linear = 1
}

declare const enum SKTileAdjacencyMask {

	AdjacencyUp = 1,

	AdjacencyUpperRight = 2,

	AdjacencyRight = 4,

	AdjacencyLowerRight = 8,

	AdjacencyDown = 16,

	AdjacencyLowerLeft = 32,

	AdjacencyLeft = 64,

	AdjacencyUpperLeft = 128,

	AdjacencyAll = 255,

	HexFlatAdjacencyUp = 1,

	HexFlatAdjacencyUpperRight = 2,

	HexFlatAdjacencyLowerRight = 4,

	HexFlatAdjacencyDown = 8,

	HexFlatAdjacencyLowerLeft = 16,

	HexFlatAdjacencyUpperLeft = 32,

	HexFlatAdjacencyAll = 63,

	HexPointyAdjacencyUpperLeft = 1,

	HexPointyAdjacencyUpperRight = 2,

	HexPointyAdjacencyRight = 4,

	HexPointyAdjacencyLowerRight = 8,

	HexPointyAdjacencyLowerLeft = 16,

	HexPointyAdjacencyLeft = 32,

	HexPointyAdjacencyAdd = 63,

	AdjacencyUpEdge = 124,

	AdjacencyUpperRightEdge = 112,

	AdjacencyRightEdge = 241,

	AdjacencyLowerRightEdge = 193,

	AdjacencyDownEdge = 199,

	AdjacencyLowerLeftEdge = 7,

	AdjacencyLeftEdge = 31,

	AdjacencyUpperLeftEdge = 28,

	AdjacencyUpperRightCorner = 223,

	AdjacencyLowerRightCorner = 127,

	AdjacencyLowerLeftCorner = 253,

	AdjacencyUpperLeftCorner = 247
}

declare class SKTileDefinition extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKTileDefinition; // inherited from NSObject

	static new(): SKTileDefinition; // inherited from NSObject

	static tileDefinitionWithTexture(texture: SKTexture): SKTileDefinition;

	static tileDefinitionWithTextureNormalTextureSize(texture: SKTexture, normalTexture: SKTexture, size: CGSize): SKTileDefinition;

	static tileDefinitionWithTextureSize(texture: SKTexture, size: CGSize): SKTileDefinition;

	static tileDefinitionWithTexturesNormalTexturesSizeTimePerFrame(textures: NSArray<SKTexture> | SKTexture[], normalTextures: NSArray<SKTexture> | SKTexture[], size: CGSize, timePerFrame: number): SKTileDefinition;

	static tileDefinitionWithTexturesSizeTimePerFrame(textures: NSArray<SKTexture> | SKTexture[], size: CGSize, timePerFrame: number): SKTileDefinition;

	flipHorizontally: boolean;

	flipVertically: boolean;

	name: string;

	normalTextures: NSArray<SKTexture>;

	placementWeight: number;

	rotation: SKTileDefinitionRotation;

	size: CGSize;

	textures: NSArray<SKTexture>;

	timePerFrame: number;

	userData: NSMutableDictionary<any, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { texture: SKTexture; });

	constructor(o: { texture: SKTexture; normalTexture: SKTexture; size: CGSize; });

	constructor(o: { texture: SKTexture; size: CGSize; });

	constructor(o: { textures: NSArray<SKTexture> | SKTexture[]; normalTextures: NSArray<SKTexture> | SKTexture[]; size: CGSize; timePerFrame: number; });

	constructor(o: { textures: NSArray<SKTexture> | SKTexture[]; size: CGSize; timePerFrame: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTexture(texture: SKTexture): this;

	initWithTextureNormalTextureSize(texture: SKTexture, normalTexture: SKTexture, size: CGSize): this;

	initWithTextureSize(texture: SKTexture, size: CGSize): this;

	initWithTexturesNormalTexturesSizeTimePerFrame(textures: NSArray<SKTexture> | SKTexture[], normalTextures: NSArray<SKTexture> | SKTexture[], size: CGSize, timePerFrame: number): this;

	initWithTexturesSizeTimePerFrame(textures: NSArray<SKTexture> | SKTexture[], size: CGSize, timePerFrame: number): this;
}

declare const enum SKTileDefinitionRotation {

	Rotation0 = 0,

	Rotation90 = 1,

	Rotation180 = 2,

	Rotation270 = 3
}

declare class SKTileGroup extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKTileGroup; // inherited from NSObject

	static emptyTileGroup(): SKTileGroup;

	static new(): SKTileGroup; // inherited from NSObject

	static tileGroupWithRules(rules: NSArray<SKTileGroupRule> | SKTileGroupRule[]): SKTileGroup;

	static tileGroupWithTileDefinition(tileDefinition: SKTileDefinition): SKTileGroup;

	name: string;

	rules: NSArray<SKTileGroupRule>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { rules: NSArray<SKTileGroupRule> | SKTileGroupRule[]; });

	constructor(o: { tileDefinition: SKTileDefinition; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRules(rules: NSArray<SKTileGroupRule> | SKTileGroupRule[]): this;

	initWithTileDefinition(tileDefinition: SKTileDefinition): this;
}

declare class SKTileGroupRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKTileGroupRule; // inherited from NSObject

	static new(): SKTileGroupRule; // inherited from NSObject

	static tileGroupRuleWithAdjacencyTileDefinitions(adjacency: SKTileAdjacencyMask, tileDefinitions: NSArray<SKTileDefinition> | SKTileDefinition[]): SKTileGroupRule;

	adjacency: SKTileAdjacencyMask;

	name: string;

	tileDefinitions: NSArray<SKTileDefinition>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { adjacency: SKTileAdjacencyMask; tileDefinitions: NSArray<SKTileDefinition> | SKTileDefinition[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAdjacencyTileDefinitions(adjacency: SKTileAdjacencyMask, tileDefinitions: NSArray<SKTileDefinition> | SKTileDefinition[]): this;

	initWithCoder(coder: NSCoder): this;
}

declare class SKTileMapNode extends SKNode implements NSCopying, NSSecureCoding {

	static alloc(): SKTileMapNode; // inherited from NSObject

	static new(): SKTileMapNode; // inherited from NSObject

	static node(): SKTileMapNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKTileMapNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKTileMapNode; // inherited from SKNode

	static tileMapNodeWithTileSetColumnsRowsTileSize(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize): SKTileMapNode;

	static tileMapNodeWithTileSetColumnsRowsTileSizeFillWithTileGroup(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize, tileGroup: SKTileGroup): SKTileMapNode;

	static tileMapNodeWithTileSetColumnsRowsTileSizeTileGroupLayout(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize, tileGroupLayout: NSArray<SKTileGroup> | SKTileGroup[]): SKTileMapNode;

	static tileMapNodesWithTileSetColumnsRowsTileSizeFromNoiseMapTileTypeNoiseMapThresholds(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize, noiseMap: GKNoiseMap, thresholds: NSArray<number> | number[]): NSArray<SKTileMapNode>;

	anchorPoint: CGPoint;

	blendMode: SKBlendMode;

	color: UIColor;

	colorBlendFactor: number;

	enableAutomapping: boolean;

	lightingBitMask: number;

	readonly mapSize: CGSize;

	numberOfColumns: number;

	numberOfRows: number;

	shader: SKShader;

	tileSet: SKTileSet;

	tileSize: CGSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { tileSet: SKTileSet; columns: number; rows: number; tileSize: CGSize; });

	constructor(o: { tileSet: SKTileSet; columns: number; rows: number; tileSize: CGSize; fillWithTileGroup: SKTileGroup; });

	constructor(o: { tileSet: SKTileSet; columns: number; rows: number; tileSize: CGSize; tileGroupLayout: NSArray<SKTileGroup> | SKTileGroup[]; });

	centerOfTileAtColumnRow(column: number, row: number): CGPoint;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fillWithTileGroup(tileGroup: SKTileGroup): void;

	initWithCoder(coder: NSCoder): this;

	initWithTileSetColumnsRowsTileSize(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize): this;

	initWithTileSetColumnsRowsTileSizeFillWithTileGroup(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize, tileGroup: SKTileGroup): this;

	initWithTileSetColumnsRowsTileSizeTileGroupLayout(tileSet: SKTileSet, columns: number, rows: number, tileSize: CGSize, tileGroupLayout: NSArray<SKTileGroup> | SKTileGroup[]): this;

	setTileGroupAndTileDefinitionForColumnRow(tileGroup: SKTileGroup, tileDefinition: SKTileDefinition, column: number, row: number): void;

	setTileGroupForColumnRow(tileGroup: SKTileGroup, column: number, row: number): void;

	tileColumnIndexFromPosition(position: CGPoint): number;

	tileDefinitionAtColumnRow(column: number, row: number): SKTileDefinition;

	tileGroupAtColumnRow(column: number, row: number): SKTileGroup;

	tileRowIndexFromPosition(position: CGPoint): number;
}

declare class SKTileSet extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKTileSet; // inherited from NSObject

	static new(): SKTileSet; // inherited from NSObject

	static tileSetFromURL(url: NSURL): SKTileSet;

	static tileSetNamed(name: string): SKTileSet;

	static tileSetWithTileGroups(tileGroups: NSArray<SKTileGroup> | SKTileGroup[]): SKTileSet;

	static tileSetWithTileGroupsTileSetType(tileGroups: NSArray<SKTileGroup> | SKTileGroup[], tileSetType: SKTileSetType): SKTileSet;

	defaultTileGroup: SKTileGroup;

	defaultTileSize: CGSize;

	name: string;

	tileGroups: NSArray<SKTileGroup>;

	type: SKTileSetType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { tileGroups: NSArray<SKTileGroup> | SKTileGroup[]; });

	constructor(o: { tileGroups: NSArray<SKTileGroup> | SKTileGroup[]; tileSetType: SKTileSetType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTileGroups(tileGroups: NSArray<SKTileGroup> | SKTileGroup[]): this;

	initWithTileGroupsTileSetType(tileGroups: NSArray<SKTileGroup> | SKTileGroup[], tileSetType: SKTileSetType): this;
}

declare const enum SKTileSetType {

	Grid = 0,

	Isometric = 1,

	HexagonalFlat = 2,

	HexagonalPointy = 3
}

declare class SKTransformNode extends SKNode {

	static alloc(): SKTransformNode; // inherited from NSObject

	static new(): SKTransformNode; // inherited from NSObject

	static node(): SKTransformNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKTransformNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKTransformNode; // inherited from SKNode

	xRotation: number;

	yRotation: number;

	eulerAngles(): interop.Reference<number>;

	quaternion(): simd_quatf;

	rotationMatrix(): simd_float3x3;

	setEulerAngles(euler: interop.Reference<number>): void;

	setQuaternion(quaternion: simd_quatf): void;

	setRotationMatrix(rotationMatrix: simd_float3x3): void;
}

declare class SKTransition extends NSObject implements NSCopying {

	static alloc(): SKTransition; // inherited from NSObject

	static crossFadeWithDuration(sec: number): SKTransition;

	static doorsCloseHorizontalWithDuration(sec: number): SKTransition;

	static doorsCloseVerticalWithDuration(sec: number): SKTransition;

	static doorsOpenHorizontalWithDuration(sec: number): SKTransition;

	static doorsOpenVerticalWithDuration(sec: number): SKTransition;

	static doorwayWithDuration(sec: number): SKTransition;

	static fadeWithColorDuration(color: UIColor, sec: number): SKTransition;

	static fadeWithDuration(sec: number): SKTransition;

	static flipHorizontalWithDuration(sec: number): SKTransition;

	static flipVerticalWithDuration(sec: number): SKTransition;

	static moveInWithDirectionDuration(direction: SKTransitionDirection, sec: number): SKTransition;

	static new(): SKTransition; // inherited from NSObject

	static pushWithDirectionDuration(direction: SKTransitionDirection, sec: number): SKTransition;

	static revealWithDirectionDuration(direction: SKTransitionDirection, sec: number): SKTransition;

	static transitionWithCIFilterDuration(filter: CIFilter, sec: number): SKTransition;

	pausesIncomingScene: boolean;

	pausesOutgoingScene: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum SKTransitionDirection {

	Up = 0,

	Down = 1,

	Right = 2,

	Left = 3
}

declare class SKUniform extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKUniform; // inherited from NSObject

	static new(): SKUniform; // inherited from NSObject

	static uniformWithName(name: string): SKUniform;

	static uniformWithNameFloat(name: string, value: number): SKUniform;

	static uniformWithNameMatrixFloat2x2(name: string, value: simd_float2x2): SKUniform;

	static uniformWithNameMatrixFloat3x3(name: string, value: simd_float3x3): SKUniform;

	static uniformWithNameMatrixFloat4x4(name: string, value: simd_float4x4): SKUniform;

	static uniformWithNameTexture(name: string, texture: SKTexture): SKUniform;

	static uniformWithNameVectorFloat2(name: string, value: interop.Reference<number>): SKUniform;

	static uniformWithNameVectorFloat3(name: string, value: interop.Reference<number>): SKUniform;

	static uniformWithNameVectorFloat4(name: string, value: interop.Reference<number>): SKUniform;

	floatValue: number;

	matrixFloat2x2Value: simd_float2x2;

	matrixFloat3x3Value: simd_float3x3;

	matrixFloat4x4Value: simd_float4x4;

	readonly name: string;

	textureValue: SKTexture;

	readonly uniformType: SKUniformType;

	vectorFloat2Value: interop.Reference<number>;

	vectorFloat3Value: interop.Reference<number>;

	vectorFloat4Value: interop.Reference<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; });

	constructor(o: { name: string; float: number; });

	constructor(o: { name: string; matrixFloat2x2: simd_float2x2; });

	constructor(o: { name: string; matrixFloat3x3: simd_float3x3; });

	constructor(o: { name: string; matrixFloat4x4: simd_float4x4; });

	constructor(o: { name: string; texture: SKTexture; });

	constructor(o: { name: string; vectorFloat2: interop.Reference<number>; });

	constructor(o: { name: string; vectorFloat3: interop.Reference<number>; });

	constructor(o: { name: string; vectorFloat4: interop.Reference<number>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithName(name: string): this;

	initWithNameFloat(name: string, value: number): this;

	initWithNameMatrixFloat2x2(name: string, value: simd_float2x2): this;

	initWithNameMatrixFloat3x3(name: string, value: simd_float3x3): this;

	initWithNameMatrixFloat4x4(name: string, value: simd_float4x4): this;

	initWithNameTexture(name: string, texture: SKTexture): this;

	initWithNameVectorFloat2(name: string, value: interop.Reference<number>): this;

	initWithNameVectorFloat3(name: string, value: interop.Reference<number>): this;

	initWithNameVectorFloat4(name: string, value: interop.Reference<number>): this;
}

declare const enum SKUniformType {

	None = 0,

	Float = 1,

	FloatVector2 = 2,

	FloatVector3 = 3,

	FloatVector4 = 4,

	FloatMatrix2 = 5,

	FloatMatrix3 = 6,

	FloatMatrix4 = 7,

	Texture = 8
}

declare class SKVideoNode extends SKNode {

	static alloc(): SKVideoNode; // inherited from NSObject

	static new(): SKVideoNode; // inherited from NSObject

	static node(): SKVideoNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKVideoNode; // inherited from SKNode

	static nodeWithFileNamedSecurelyWithClassesAndError(filename: string, classes: NSSet<typeof NSObject>): SKVideoNode; // inherited from SKNode

	static videoNodeWithAVPlayer(player: AVPlayer): SKVideoNode;

	static videoNodeWithFileNamed(videoFile: string): SKVideoNode;

	static videoNodeWithURL(videoURL: NSURL): SKVideoNode;

	static videoNodeWithVideoFileNamed(videoFile: string): SKVideoNode;

	static videoNodeWithVideoURL(videoURL: NSURL): SKVideoNode;

	anchorPoint: CGPoint;

	size: CGSize;

	constructor(o: { AVPlayer: AVPlayer; });

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	constructor(o: { videoFileNamed: string; });

	constructor(o: { videoURL: NSURL; });

	initWithAVPlayer(player: AVPlayer): this;

	initWithFileNamed(videoFile: string): this;

	initWithURL(url: NSURL): this;

	initWithVideoFileNamed(videoFile: string): this;

	initWithVideoURL(url: NSURL): this;

	pause(): void;

	play(): void;
}

declare class SKView extends UIView {

	static alloc(): SKView; // inherited from NSObject

	static appearance(): SKView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): SKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SKView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SKView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SKView; // inherited from UIAppearance

	static new(): SKView; // inherited from NSObject

	allowsTransparency: boolean;

	asynchronous: boolean;

	delegate: NSObject;

	frameInterval: number;

	ignoresSiblingOrder: boolean;

	paused: boolean;

	preferredFrameRate: number;

	preferredFramesPerSecond: number;

	readonly scene: SKScene;

	shouldCullNonVisibleNodes: boolean;

	showsDrawCount: boolean;

	showsFPS: boolean;

	showsFields: boolean;

	showsNodeCount: boolean;

	showsPhysics: boolean;

	showsQuadCount: boolean;

	convertPointFromScene(point: CGPoint, scene: SKScene): CGPoint;

	convertPointToScene(point: CGPoint, scene: SKScene): CGPoint;

	presentScene(scene: SKScene): void;

	presentSceneTransition(scene: SKScene, transition: SKTransition): void;

	textureFromNode(node: SKNode): SKTexture;

	textureFromNodeCrop(node: SKNode, crop: CGRect): SKTexture;
}

interface SKViewDelegate extends NSObjectProtocol {

	viewShouldRenderAtTime?(view: SKView, time: number): boolean;
}
declare var SKViewDelegate: {

	prototype: SKViewDelegate;
};

declare class SKWarpGeometry extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SKWarpGeometry; // inherited from NSObject

	static new(): SKWarpGeometry; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SKWarpGeometryGrid extends SKWarpGeometry implements NSSecureCoding {

	static alloc(): SKWarpGeometryGrid; // inherited from NSObject

	static grid(): SKWarpGeometryGrid;

	static gridWithColumnsRows(cols: number, rows: number): SKWarpGeometryGrid;

	static gridWithColumnsRowsSourcePositionsDestPositions(cols: number, rows: number, sourcePositions: interop.Pointer | interop.Reference<interop.Reference<number>>, destPositions: interop.Pointer | interop.Reference<interop.Reference<number>>): SKWarpGeometryGrid;

	static new(): SKWarpGeometryGrid; // inherited from NSObject

	readonly numberOfColumns: number;

	readonly numberOfRows: number;

	readonly vertexCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { columns: number; rows: number; sourcePositions: interop.Pointer | interop.Reference<interop.Reference<number>>; destPositions: interop.Pointer | interop.Reference<interop.Reference<number>>; });

	destPositionAtIndex(index: number): interop.Reference<number>;

	encodeWithCoder(coder: NSCoder): void;

	gridByReplacingDestPositions(destPositions: interop.Pointer | interop.Reference<interop.Reference<number>>): this;

	gridByReplacingSourcePositions(sourcePositions: interop.Pointer | interop.Reference<interop.Reference<number>>): this;

	initWithCoder(coder: NSCoder): this;

	initWithColumnsRowsSourcePositionsDestPositions(cols: number, rows: number, sourcePositions: interop.Pointer | interop.Reference<interop.Reference<number>>, destPositions: interop.Pointer | interop.Reference<interop.Reference<number>>): this;

	sourcePositionAtIndex(index: number): interop.Reference<number>;
}

interface SKWarpable extends NSObjectProtocol {

	subdivisionLevels: number;

	warpGeometry: SKWarpGeometry;
}
declare var SKWarpable: {

	prototype: SKWarpable;
};
