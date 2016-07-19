
declare class SK3DNode extends SKNode {

	static node(): SK3DNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SK3DNode; // inherited from SKNode

	static nodeWithViewportSize(viewportSize: CGSize): SK3DNode;

	autoenablesDefaultLighting: boolean;

	loops: boolean;

	playing: boolean;

	pointOfView: SCNNode;

	sceneTime: number;

	scnScene: SCNScene;

	viewportSize: CGSize;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { viewportSize: CGSize; });

	hitTestOptions(point: CGPoint, options: NSDictionary<string, any>): NSArray<SCNHitTestResult>;
}

declare class SKAction extends NSObject implements NSCoding, NSCopying {

	static actionNamed(name: string): SKAction;

	static actionNamedDuration(name: string, sec: number): SKAction;

	static actionNamedFromURL(name: string, url: NSURL): SKAction;

	static actionNamedFromURLDuration(name: string, url: NSURL, sec: number): SKAction;

	static alloc(): SKAction; // inherited from NSObject

	static animateWithNormalTexturesTimePerFrame(textures: NSArray<SKTexture>, sec: number): SKAction;

	static animateWithNormalTexturesTimePerFrameResizeRestore(textures: NSArray<SKTexture>, sec: number, resize: boolean, restore: boolean): SKAction;

	static animateWithTexturesTimePerFrame(textures: NSArray<SKTexture>, sec: number): SKAction;

	static animateWithTexturesTimePerFrameResizeRestore(textures: NSArray<SKTexture>, sec: number, resize: boolean, restore: boolean): SKAction;

	static applyAngularImpulseDuration(impulse: number, sec: number): SKAction;

	static applyForceAtPointDuration(force: CGVector, point: CGPoint, sec: number): SKAction;

	static applyForceDuration(force: CGVector, sec: number): SKAction;

	static applyImpulseAtPointDuration(impulse: CGVector, point: CGPoint, sec: number): SKAction;

	static applyImpulseDuration(impulse: CGVector, sec: number): SKAction;

	static applyTorqueDuration(torque: number, sec: number): SKAction;

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

	static colorizeWithColorColorBlendFactorDuration(color: UIColor, colorBlendFactor: number, sec: number): SKAction;

	static customActionWithDurationActionBlock(seconds: number, block: (p1: SKNode, p2: number) => void): SKAction;

	static fadeAlphaByDuration(factor: number, sec: number): SKAction;

	static fadeAlphaToDuration(alpha: number, sec: number): SKAction;

	static fadeInWithDuration(sec: number): SKAction;

	static fadeOutWithDuration(sec: number): SKAction;

	static falloffByDuration(falloff: number, sec: number): SKAction;

	static falloffToDuration(falloff: number, sec: number): SKAction;

	static followPathAsOffsetOrientToPathDuration(path: any, offset: boolean, orient: boolean, sec: number): SKAction;

	static followPathAsOffsetOrientToPathSpeed(path: any, offset: boolean, orient: boolean, speed: number): SKAction;

	static followPathDuration(path: any, sec: number): SKAction;

	static followPathSpeed(path: any, speed: number): SKAction;

	static group(actions: NSArray<SKAction>): SKAction;

	static hide(): SKAction;

	static moveByDuration(delta: CGVector, sec: number): SKAction;

	static moveByXYDuration(deltaX: number, deltaY: number, sec: number): SKAction;

	static moveToDuration(location: CGPoint, sec: number): SKAction;

	static moveToXDuration(x: number, sec: number): SKAction;

	static moveToYDuration(y: number, sec: number): SKAction;

	static new(): SKAction; // inherited from NSObject

	static pause(): SKAction;

	static performSelectorOnTarget(selector: string, target: any): SKAction;

	static play(): SKAction;

	static playSoundFileNamedWaitForCompletion(soundFile: string, wait: boolean): SKAction;

	static reachToNodeRootNodeDuration(node: SKNode, root: SKNode, sec: number): SKAction;

	static reachToNodeRootNodeVelocity(node: SKNode, root: SKNode, velocity: number): SKAction;

	static reachToRootNodeDuration(position: CGPoint, root: SKNode, sec: number): SKAction;

	static reachToRootNodeVelocity(position: CGPoint, root: SKNode, velocity: number): SKAction;

	static removeFromParent(): SKAction;

	static repeatActionCount(action: SKAction, count: number): SKAction;

	static repeatActionForever(action: SKAction): SKAction;

	static resizeByWidthHeightDuration(width: number, height: number, duration: number): SKAction;

	static resizeToHeightDuration(height: number, duration: number): SKAction;

	static resizeToWidthDuration(width: number, duration: number): SKAction;

	static resizeToWidthHeightDuration(width: number, height: number, duration: number): SKAction;

	static rotateByAngleDuration(radians: number, sec: number): SKAction;

	static rotateToAngleDuration(radians: number, sec: number): SKAction;

	static rotateToAngleDurationShortestUnitArc(radians: number, sec: number, shortestUnitArc: boolean): SKAction;

	static runActionOnChildWithName(action: SKAction, name: string): SKAction;

	static runBlock(block: () => void): SKAction;

	static runBlockQueue(block: () => void, queue: NSObject): SKAction;

	static scaleByDuration(scale: number, sec: number): SKAction;

	static scaleToDuration(scale: number, sec: number): SKAction;

	static scaleXByYDuration(xScale: number, yScale: number, sec: number): SKAction;

	static scaleXToDuration(scale: number, sec: number): SKAction;

	static scaleXToYDuration(xScale: number, yScale: number, sec: number): SKAction;

	static scaleYToDuration(scale: number, sec: number): SKAction;

	static sequence(actions: NSArray<SKAction>): SKAction;

	static setNormalTexture(texture: SKTexture): SKAction;

	static setNormalTextureResize(texture: SKTexture, resize: boolean): SKAction;

	static setTexture(texture: SKTexture): SKAction;

	static setTextureResize(texture: SKTexture, resize: boolean): SKAction;

	static speedByDuration(speed: number, sec: number): SKAction;

	static speedToDuration(speed: number, sec: number): SKAction;

	static stereoPanByDuration(v: number, duration: number): SKAction;

	static stereoPanToDuration(v: number, duration: number): SKAction;

	static stop(): SKAction;

	static strengthByDuration(strength: number, sec: number): SKAction;

	static strengthToDuration(strength: number, sec: number): SKAction;

	static unhide(): SKAction;

	static waitForDuration(sec: number): SKAction;

	static waitForDurationWithRange(sec: number, durationRange: number): SKAction;

	duration: number;

	speed: number;

	timingFunction: (p1: number) => number;

	timingMode: SKActionTimingMode;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	reversedAction(): SKAction;

	self(): SKAction; // inherited from NSObjectProtocol
}

declare const enum SKActionTimingMode {

	Linear = 0,

	EaseIn = 1,

	EaseOut = 2,

	EaseInEaseOut = 3
}

declare class SKAudioNode extends SKNode implements NSCoding {

	static node(): SKAudioNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKAudioNode; // inherited from SKNode

	autoplayLooped: boolean;

	avAudioNode: AVAudioNode;

	positional: boolean;

	constructor(o: { AVAudioNode: AVAudioNode; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });
}

declare const enum SKBlendMode {

	Alpha = 0,

	Add = 1,

	Subtract = 2,

	Multiply = 3,

	MultiplyX2 = 4,

	Screen = 5,

	Replace = 6
}

declare class SKCameraNode extends SKNode {

	static node(): SKCameraNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKCameraNode; // inherited from SKNode

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	containedNodeSet(): NSSet<SKNode>;

	containsNode(node: SKNode): boolean;
}

declare class SKConstraint extends NSObject implements NSCoding, NSCopying {

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

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SKConstraint; // inherited from NSObjectProtocol
}

declare class SKCropNode extends SKNode {

	static node(): SKCropNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKCropNode; // inherited from SKNode

	maskNode: SKNode;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKEffectNode extends SKNode {

	static node(): SKEffectNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKEffectNode; // inherited from SKNode

	blendMode: SKBlendMode;

	filter: CIFilter;

	shader: SKShader;

	shouldCenterFilter: boolean;

	shouldEnableEffects: boolean;

	shouldRasterize: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKEmitterNode extends SKNode {

	static node(): SKEmitterNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKEmitterNode; // inherited from SKNode

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

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	advanceSimulationTime(sec: number): void;

	resetSimulation(): void;
}

declare class SKFieldNode extends SKNode {

	static dragField(): SKFieldNode;

	static electricField(): SKFieldNode;

	static magneticField(): SKFieldNode;

	static node(): SKFieldNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKFieldNode; // inherited from SKNode

	static noiseFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SKFieldNode;

	static radialGravityField(): SKFieldNode;

	static springField(): SKFieldNode;

	static turbulenceFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): SKFieldNode;

	static velocityFieldWithTexture(velocityTexture: SKTexture): SKFieldNode;

	static vortexField(): SKFieldNode;

	animationSpeed: number;

	categoryBitMask: number;

	enabled: boolean;

	exclusive: boolean;

	falloff: number;

	minimumRadius: number;

	region: SKRegion;

	smoothness: number;

	strength: number;

	texture: SKTexture;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare const enum SKInterpolationMode {

	Linear = 1,

	Spline = 2,

	Step = 3
}

declare class SKKeyframeSequence extends NSObject implements NSCoding, NSCopying {

	static alloc(): SKKeyframeSequence; // inherited from NSObject

	static new(): SKKeyframeSequence; // inherited from NSObject

	interpolationMode: SKInterpolationMode;

	repeatMode: SKRepeatMode;

	constructor(); // inherited from NSObject

	constructor(o: { capacity: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { keyframeValues: NSArray<any>; times: NSArray<number>; });

	addKeyframeValueTime(value: any, time: number): void;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	count(): number;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	getKeyframeTimeForIndex(index: number): number;

	getKeyframeValueForIndex(index: number): any;

	removeKeyframeAtIndex(index: number): void;

	removeLastKeyframe(): void;

	sampleAtTime(time: number): any;

	self(): SKKeyframeSequence; // inherited from NSObjectProtocol

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

	static labelNodeWithFontNamed(fontName: string): SKLabelNode;

	static labelNodeWithText(text: string): SKLabelNode;

	static node(): SKLabelNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKLabelNode; // inherited from SKNode

	blendMode: SKBlendMode;

	color: UIColor;

	colorBlendFactor: number;

	fontColor: UIColor;

	fontName: string;

	fontSize: number;

	horizontalAlignmentMode: SKLabelHorizontalAlignmentMode;

	text: string;

	verticalAlignmentMode: SKLabelVerticalAlignmentMode;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fontNamed: string; });
}

declare const enum SKLabelVerticalAlignmentMode {

	Baseline = 0,

	Center = 1,

	Top = 2,

	Bottom = 3
}

declare class SKLightNode extends SKNode {

	static node(): SKLightNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKLightNode; // inherited from SKNode

	ambientColor: UIColor;

	categoryBitMask: number;

	enabled: boolean;

	falloff: number;

	lightColor: UIColor;

	shadowColor: UIColor;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKMutableTexture extends SKTexture {

	static mutableTextureWithSize(size: CGSize): SKMutableTexture;

	static textureNoiseWithSmoothnessSizeGrayscale(smoothness: number, size: CGSize, grayscale: boolean): SKMutableTexture; // inherited from SKTexture

	static textureVectorNoiseWithSmoothnessSize(smoothness: number, size: CGSize): SKMutableTexture; // inherited from SKTexture

	static textureWithCGImage(image: any): SKMutableTexture; // inherited from SKTexture

	static textureWithDataSize(pixelData: NSData, size: CGSize): SKMutableTexture; // inherited from SKTexture

	static textureWithDataSizeFlipped(pixelData: NSData, size: CGSize, flipped: boolean): SKMutableTexture; // inherited from SKTexture

	static textureWithDataSizeRowLengthAlignment(pixelData: NSData, size: CGSize, rowLength: number, alignment: number): SKMutableTexture; // inherited from SKTexture

	static textureWithImage(image: UIImage): SKMutableTexture; // inherited from SKTexture

	static textureWithImageNamed(name: string): SKMutableTexture; // inherited from SKTexture

	static textureWithRectInTexture(rect: CGRect, texture: SKTexture): SKMutableTexture; // inherited from SKTexture

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { size: CGSize; });

	constructor(o: { size: CGSize; pixelFormat: number; });

	modifyPixelDataWithBlock(block: (p1: interop.Pointer, p2: number) => void): void;

	textureByApplyingCIFilter(filter: CIFilter): SKMutableTexture; // inherited from SKTexture

	textureByGeneratingNormalMap(): SKMutableTexture; // inherited from SKTexture

	textureByGeneratingNormalMapWithSmoothnessContrast(smoothness: number, contrast: number): SKMutableTexture; // inherited from SKTexture
}

declare class SKNode extends UIResponder implements NSCoding, NSCopying {

	static node(): SKNode;

	static nodeWithFileNamed(filename: string): SKNode;

	static obstaclesFromNodeBounds(nodes: NSArray<SKNode>): NSArray<GKPolygonObstacle>;

	static obstaclesFromNodePhysicsBodies(nodes: NSArray<SKNode>): NSArray<GKPolygonObstacle>;

	static obstaclesFromSpriteTexturesAccuracy(sprites: NSArray<SKNode>, accuracy: number): NSArray<GKPolygonObstacle>;

	alpha: number;

	/* readonly */ children: NSArray<SKNode>;

	constraints: NSArray<SKConstraint>;

	/* readonly */ frame: CGRect;

	hidden: boolean;

	name: string;

	/* readonly */ parent: SKNode;

	paused: boolean;

	physicsBody: SKPhysicsBody;

	position: CGPoint;

	reachConstraints: SKReachConstraints;

	/* readonly */ scene: SKScene;

	speed: number;

	userData: NSMutableDictionary<any, any>;

	userInteractionEnabled: boolean;

	xScale: number;

	yScale: number;

	zPosition: number;

	zRotation: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	actionForKey(key: string): SKAction;

	addChild(node: SKNode): void;

	calculateAccumulatedFrame(): CGRect;

	childNodeWithName(name: string): SKNode;

	containsPoint(p: CGPoint): boolean;

	convertPointFromNode(point: CGPoint, node: SKNode): CGPoint;

	convertPointToNode(point: CGPoint, node: SKNode): CGPoint;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	enumerateChildNodesWithNameUsingBlock(name: string, block: (p1: SKNode, p2: interop.Reference<boolean>) => void): void;

	hasActions(): boolean;

	inParentHierarchy(parent: SKNode): boolean;

	insertChildAtIndex(node: SKNode, index: number): void;

	intersectsNode(node: SKNode): boolean;

	isEqualToNode(node: SKNode): boolean;

	moveToParent(parent: SKNode): void;

	nodeAtPoint(p: CGPoint): SKNode;

	nodesAtPoint(p: CGPoint): NSArray<SKNode>;

	objectForKeyedSubscript(name: string): NSArray<SKNode>;

	removeActionForKey(key: string): void;

	removeAllActions(): void;

	removeAllChildren(): void;

	removeChildrenInArray(nodes: NSArray<SKNode>): void;

	removeFromParent(): void;

	runAction(action: SKAction): void;

	runActionCompletion(action: SKAction, block: () => void): void;

	runActionWithKey(action: SKAction, key: string): void;

	setScale(scale: number): void;
}

declare const enum SKParticleRenderOrder {

	OldestLast = 0,

	OldestFirst = 1,

	DontCare = 2
}

declare class SKPhysicsBody extends NSObject implements NSCoding, NSCopying {

	static alloc(): SKPhysicsBody; // inherited from NSObject

	static bodyWithBodies(bodies: NSArray<SKPhysicsBody>): SKPhysicsBody;

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

	/* readonly */ area: number;

	categoryBitMask: number;

	charge: number;

	collisionBitMask: number;

	contactTestBitMask: number;

	density: number;

	dynamic: boolean;

	fieldBitMask: number;

	friction: number;

	/* readonly */ joints: NSArray<SKPhysicsJoint>;

	linearDamping: number;

	mass: number;

	/* readonly */ node: SKNode;

	pinned: boolean;

	resting: boolean;

	restitution: number;

	usesPreciseCollisionDetection: boolean;

	velocity: CGVector;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	allContactedBodies(): NSArray<SKPhysicsBody>;

	applyAngularImpulse(impulse: number): void;

	applyForce(force: CGVector): void;

	applyForceAtPoint(force: CGVector, point: CGPoint): void;

	applyImpulse(impulse: CGVector): void;

	applyImpulseAtPoint(impulse: CGVector, point: CGPoint): void;

	applyTorque(torque: number): void;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SKPhysicsBody; // inherited from NSObjectProtocol
}

declare class SKPhysicsContact extends NSObject {

	static alloc(): SKPhysicsContact; // inherited from NSObject

	static new(): SKPhysicsContact; // inherited from NSObject

	/* readonly */ bodyA: SKPhysicsBody;

	/* readonly */ bodyB: SKPhysicsBody;

	/* readonly */ collisionImpulse: number;

	/* readonly */ contactNormal: CGVector;

	/* readonly */ contactPoint: CGPoint;

	constructor(); // inherited from NSObject

	self(): SKPhysicsContact; // inherited from NSObjectProtocol
}

interface SKPhysicsContactDelegate extends NSObjectProtocol {

	didBeginContact?(contact: SKPhysicsContact): void;

	didEndContact?(contact: SKPhysicsContact): void;
}
declare var SKPhysicsContactDelegate: {

	prototype: SKPhysicsContactDelegate;
};

declare class SKPhysicsJoint extends NSObject implements NSCoding {

	static alloc(): SKPhysicsJoint; // inherited from NSObject

	static new(): SKPhysicsJoint; // inherited from NSObject

	bodyA: SKPhysicsBody;

	bodyB: SKPhysicsBody;

	/* readonly */ reactionForce: CGVector;

	/* readonly */ reactionTorque: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SKPhysicsJoint; // inherited from NSObjectProtocol
}

declare class SKPhysicsJointFixed extends SKPhysicsJoint {

	static jointWithBodyABodyBAnchor(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchor: CGPoint): SKPhysicsJointFixed;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKPhysicsJointLimit extends SKPhysicsJoint {

	static jointWithBodyABodyBAnchorAAnchorB(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchorA: CGPoint, anchorB: CGPoint): SKPhysicsJointLimit;

	maxLength: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKPhysicsJointPin extends SKPhysicsJoint {

	static jointWithBodyABodyBAnchor(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchor: CGPoint): SKPhysicsJointPin;

	frictionTorque: number;

	lowerAngleLimit: number;

	rotationSpeed: number;

	shouldEnableLimits: boolean;

	upperAngleLimit: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKPhysicsJointSliding extends SKPhysicsJoint {

	static jointWithBodyABodyBAnchorAxis(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchor: CGPoint, axis: CGVector): SKPhysicsJointSliding;

	lowerDistanceLimit: number;

	shouldEnableLimits: boolean;

	upperDistanceLimit: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKPhysicsJointSpring extends SKPhysicsJoint {

	static jointWithBodyABodyBAnchorAAnchorB(bodyA: SKPhysicsBody, bodyB: SKPhysicsBody, anchorA: CGPoint, anchorB: CGPoint): SKPhysicsJointSpring;

	damping: number;

	frequency: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKPhysicsWorld extends NSObject implements NSCoding {

	static alloc(): SKPhysicsWorld; // inherited from NSObject

	static new(): SKPhysicsWorld; // inherited from NSObject

	contactDelegate: SKPhysicsContactDelegate;

	gravity: CGVector;

	speed: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addJoint(joint: SKPhysicsJoint): void;

	bodyAlongRayStartEnd(start: CGPoint, end: CGPoint): SKPhysicsBody;

	bodyAtPoint(point: CGPoint): SKPhysicsBody;

	bodyInRect(rect: CGRect): SKPhysicsBody;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	enumerateBodiesAlongRayStartEndUsingBlock(start: CGPoint, end: CGPoint, block: (p1: SKPhysicsBody, p2: CGPoint, p3: CGVector, p4: interop.Reference<boolean>) => void): void;

	enumerateBodiesAtPointUsingBlock(point: CGPoint, block: (p1: SKPhysicsBody, p2: interop.Reference<boolean>) => void): void;

	enumerateBodiesInRectUsingBlock(rect: CGRect, block: (p1: SKPhysicsBody, p2: interop.Reference<boolean>) => void): void;

	removeAllJoints(): void;

	removeJoint(joint: SKPhysicsJoint): void;

	self(): SKPhysicsWorld; // inherited from NSObjectProtocol
}

declare class SKRange extends NSObject implements NSCoding, NSCopying {

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

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { lowerLimit: number; upperLimit: number; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SKRange; // inherited from NSObjectProtocol
}

declare class SKReachConstraints extends NSObject implements NSCoding {

	static alloc(): SKReachConstraints; // inherited from NSObject

	static new(): SKReachConstraints; // inherited from NSObject

	lowerAngleLimit: number;

	upperAngleLimit: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { lowerAngleLimit: number; upperAngleLimit: number; });

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SKReachConstraints; // inherited from NSObjectProtocol
}

declare class SKReferenceNode extends SKNode {

	static node(): SKReferenceNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKReferenceNode; // inherited from SKNode

	static referenceNodeWithFileNamed(fileName: string): SKReferenceNode;

	static referenceNodeWithURL(referenceURL: NSURL): SKReferenceNode;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	didLoadReferenceNode(node: SKNode): void;

	resolveReferenceNode(): void;
}

declare class SKRegion extends NSObject implements NSCoding, NSCopying {

	static alloc(): SKRegion; // inherited from NSObject

	static infiniteRegion(): SKRegion;

	static new(): SKRegion; // inherited from NSObject

	/* readonly */ path: any;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { path: any; });

	constructor(o: { radius: number; });

	constructor(o: { size: CGSize; });

	containsPoint(point: CGPoint): boolean;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	inverseRegion(): SKRegion;

	regionByDifferenceFromRegion(region: SKRegion): SKRegion;

	regionByIntersectionWithRegion(region: SKRegion): SKRegion;

	regionByUnionWithRegion(region: SKRegion): SKRegion;

	self(): SKRegion; // inherited from NSObjectProtocol
}

declare const enum SKRepeatMode {

	Clamp = 1,

	Loop = 2
}

declare class SKScene extends SKEffectNode {

	static sceneWithSize(size: CGSize): SKScene;

	anchorPoint: CGPoint;

	/* readonly */ audioEngine: AVAudioEngine;

	backgroundColor: UIColor;

	camera: SKCameraNode;

	delegate: SKSceneDelegate;

	listener: SKNode;

	/* readonly */ physicsWorld: SKPhysicsWorld;

	scaleMode: SKSceneScaleMode;

	size: CGSize;

	/* readonly */ view: SKView;

	constructor(o: { size: CGSize; });

	convertPointFromView(point: CGPoint): CGPoint;

	convertPointToView(point: CGPoint): CGPoint;

	didApplyConstraints(): void;

	didChangeSize(oldSize: CGSize): void;

	didEvaluateActions(): void;

	didFinishUpdate(): void;

	didMoveToView(view: SKView): void;

	didSimulatePhysics(): void;

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

declare class SKShader extends NSObject implements NSCoding, NSCopying {

	static alloc(): SKShader; // inherited from NSObject

	static new(): SKShader; // inherited from NSObject

	static shader(): SKShader;

	static shaderWithFileNamed(name: string): SKShader;

	static shaderWithSource(source: string): SKShader;

	static shaderWithSourceUniforms(source: string, uniforms: NSArray<SKUniform>): SKShader;

	source: string;

	uniforms: NSArray<SKUniform>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { source: string; });

	constructor(o: { source: string; uniforms: NSArray<SKUniform>; });

	addUniform(uniform: SKUniform): void;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	removeUniformNamed(name: string): void;

	self(): SKShader; // inherited from NSObjectProtocol

	uniformNamed(name: string): SKUniform;
}

declare class SKShapeNode extends SKNode {

	static node(): SKShapeNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKShapeNode; // inherited from SKNode

	static shapeNodeWithCircleOfRadius(radius: number): SKShapeNode;

	static shapeNodeWithEllipseInRect(rect: CGRect): SKShapeNode;

	static shapeNodeWithEllipseOfSize(size: CGSize): SKShapeNode;

	static shapeNodeWithPath(path: any): SKShapeNode;

	static shapeNodeWithPathCentered(path: any, centered: boolean): SKShapeNode;

	static shapeNodeWithPointsCount(points: interop.Reference<CGPoint>, numPoints: number): SKShapeNode;

	static shapeNodeWithRect(rect: CGRect): SKShapeNode;

	static shapeNodeWithRectCornerRadius(rect: CGRect, cornerRadius: number): SKShapeNode;

	static shapeNodeWithRectOfSize(size: CGSize): SKShapeNode;

	static shapeNodeWithRectOfSizeCornerRadius(size: CGSize, cornerRadius: number): SKShapeNode;

	static shapeNodeWithSplinePointsCount(points: interop.Reference<CGPoint>, numPoints: number): SKShapeNode;

	antialiased: boolean;

	blendMode: SKBlendMode;

	fillColor: UIColor;

	fillShader: SKShader;

	fillTexture: SKTexture;

	glowWidth: number;

	lineCap: CGLineCap;

	lineJoin: CGLineJoin;

	/* readonly */ lineLength: number;

	lineWidth: number;

	miterLimit: number;

	path: any;

	strokeColor: UIColor;

	strokeShader: SKShader;

	strokeTexture: SKTexture;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class SKSpriteNode extends SKNode {

	static node(): SKSpriteNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKSpriteNode; // inherited from SKNode

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

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { color: UIColor; size: CGSize; });

	constructor(o: { imageNamed: string; });

	constructor(o: { texture: SKTexture; });

	constructor(o: { texture: SKTexture; color: UIColor; size: CGSize; });
}

declare class SKTexture extends NSObject implements NSCoding, NSCopying {

	static alloc(): SKTexture; // inherited from NSObject

	static new(): SKTexture; // inherited from NSObject

	static preloadTexturesWithCompletionHandler(textures: NSArray<SKTexture>, completionHandler: () => void): void;

	static textureNoiseWithSmoothnessSizeGrayscale(smoothness: number, size: CGSize, grayscale: boolean): SKTexture;

	static textureVectorNoiseWithSmoothnessSize(smoothness: number, size: CGSize): SKTexture;

	static textureWithCGImage(image: any): SKTexture;

	static textureWithDataSize(pixelData: NSData, size: CGSize): SKTexture;

	static textureWithDataSizeFlipped(pixelData: NSData, size: CGSize, flipped: boolean): SKTexture;

	static textureWithDataSizeRowLengthAlignment(pixelData: NSData, size: CGSize, rowLength: number, alignment: number): SKTexture;

	static textureWithImage(image: UIImage): SKTexture;

	static textureWithImageNamed(name: string): SKTexture;

	static textureWithRectInTexture(rect: CGRect, texture: SKTexture): SKTexture;

	filteringMode: SKTextureFilteringMode;

	usesMipmaps: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	CGImage(): any;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	preloadWithCompletionHandler(completionHandler: () => void): void;

	self(): SKTexture; // inherited from NSObjectProtocol

	size(): CGSize;

	textureByApplyingCIFilter(filter: CIFilter): SKTexture;

	textureByGeneratingNormalMap(): SKTexture;

	textureByGeneratingNormalMapWithSmoothnessContrast(smoothness: number, contrast: number): SKTexture;

	textureRect(): CGRect;
}

declare class SKTextureAtlas extends NSObject implements NSCoding {

	static alloc(): SKTextureAtlas; // inherited from NSObject

	static atlasNamed(name: string): SKTextureAtlas;

	static atlasWithDictionary(properties: NSDictionary<string, any>): SKTextureAtlas;

	static new(): SKTextureAtlas; // inherited from NSObject

	static preloadTextureAtlasesNamedWithCompletionHandler(atlasNames: NSArray<string>, completionHandler: (p1: NSError, p2: NSArray<SKTextureAtlas>) => void): void;

	static preloadTextureAtlasesWithCompletionHandler(textureAtlases: NSArray<SKTextureAtlas>, completionHandler: () => void): void;

	/* readonly */ textureNames: NSArray<string>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	preloadWithCompletionHandler(completionHandler: () => void): void;

	self(): SKTextureAtlas; // inherited from NSObjectProtocol

	textureNamed(name: string): SKTexture;
}

declare const enum SKTextureFilteringMode {

	Nearest = 0,

	Linear = 1
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

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): SKTransition; // inherited from NSObjectProtocol
}

declare const enum SKTransitionDirection {

	Up = 0,

	Down = 1,

	Right = 2,

	Left = 3
}

declare class SKUniform extends NSObject implements NSCoding, NSCopying {

	static alloc(): SKUniform; // inherited from NSObject

	static new(): SKUniform; // inherited from NSObject

	static uniformWithName(name: string): SKUniform;

	static uniformWithNameFloat(name: string, value: number): SKUniform;

	static uniformWithNameTexture(name: string, texture: SKTexture): SKUniform;

	floatValue: number;

	/* readonly */ name: string;

	textureValue: SKTexture;

	/* readonly */ uniformType: SKUniformType;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; });

	constructor(o: { name: string; float: number; });

	constructor(o: { name: string; texture: SKTexture; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): SKUniform; // inherited from NSObjectProtocol
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

	static node(): SKVideoNode; // inherited from SKNode

	static nodeWithFileNamed(filename: string): SKVideoNode; // inherited from SKNode

	static videoNodeWithAVPlayer(player: AVPlayer): SKVideoNode;

	static videoNodeWithFileNamed(videoFile: string): SKVideoNode;

	static videoNodeWithURL(videoURL: NSURL): SKVideoNode;

	static videoNodeWithVideoFileNamed(videoFile: string): SKVideoNode;

	static videoNodeWithVideoURL(videoURL: NSURL): SKVideoNode;

	anchorPoint: CGPoint;

	size: CGSize;

	constructor(o: { AVPlayer: AVPlayer; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileNamed: string; });

	constructor(o: { URL: NSURL; });

	constructor(o: { videoFileNamed: string; });

	constructor(o: { videoURL: NSURL; });

	pause(): void;

	play(): void;
}

declare class SKView extends UIView {

	static appearance(): SKView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): SKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SKView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): SKView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SKView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): SKView; // inherited from UIAppearance

	allowsTransparency: boolean;

	asynchronous: boolean;

	frameInterval: number;

	ignoresSiblingOrder: boolean;

	paused: boolean;

	/* readonly */ scene: SKScene;

	shouldCullNonVisibleNodes: boolean;

	showsDrawCount: boolean;

	showsFPS: boolean;

	showsFields: boolean;

	showsNodeCount: boolean;

	showsPhysics: boolean;

	showsQuadCount: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	convertPointFromScene(point: CGPoint, scene: SKScene): CGPoint;

	convertPointToScene(point: CGPoint, scene: SKScene): CGPoint;

	presentScene(scene: SKScene): void;

	presentSceneTransition(scene: SKScene, transition: SKTransition): void;

	self(): SKView; // inherited from NSObjectProtocol

	textureFromNode(node: SKNode): SKTexture;

	textureFromNodeCrop(node: SKNode, crop: CGRect): SKTexture;
}
