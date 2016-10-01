
declare class GKARC4RandomSource extends GKRandomSource {

	static alloc(): GKARC4RandomSource; // inherited from NSObject

	static new(): GKARC4RandomSource; // inherited from NSObject

	seed: NSData;

	constructor(o: { seed: NSData; });

	dropValuesWithCount(count: number): void;

	initWithSeed(seed: NSData): this;
}

declare class GKAgent extends GKComponent implements NSCoding {

	static alloc(): GKAgent; // inherited from NSObject

	static new(): GKAgent; // inherited from NSObject

	behavior: GKBehavior;

	delegate: GKAgentDelegate;

	mass: number;

	maxAcceleration: number;

	maxSpeed: number;

	radius: number;

	speed: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class GKAgent2D extends GKAgent implements NSCoding {

	static alloc(): GKAgent2D; // inherited from NSObject

	static new(): GKAgent2D; // inherited from NSObject

	rotation: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class GKAgent3D extends GKAgent {

	static alloc(): GKAgent3D; // inherited from NSObject

	static new(): GKAgent3D; // inherited from NSObject

	rightHanded: boolean;
}

interface GKAgentDelegate extends NSObjectProtocol {

	agentDidUpdate?(agent: GKAgent): void;

	agentWillUpdate?(agent: GKAgent): void;
}
declare var GKAgentDelegate: {

	prototype: GKAgentDelegate;
};

declare class GKBehavior extends NSObject implements NSCopying, NSFastEnumeration {

	static alloc(): GKBehavior; // inherited from NSObject

	static behaviorWithGoalWeight(goal: GKGoal, weight: number): GKBehavior;

	static behaviorWithGoals(goals: NSArray<GKGoal>): GKBehavior;

	static behaviorWithGoalsAndWeights(goals: NSArray<GKGoal>, weights: NSArray<number>): GKBehavior;

	static behaviorWithWeightedGoals(weightedGoals: NSDictionary<GKGoal, number>): GKBehavior;

	static new(): GKBehavior; // inherited from NSObject

	readonly goalCount: number;
	[index: number]: GKGoal;
	[Symbol.iterator](): Iterator<any>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	objectAtIndexedSubscript(idx: number): GKGoal;

	objectForKeyedSubscript(goal: GKGoal): number;

	removeAllGoals(): void;

	removeGoal(goal: GKGoal): void;

	setObjectForKeyedSubscript(weight: number, goal: GKGoal): void;

	setWeightForGoal(weight: number, goal: GKGoal): void;

	weightForGoal(goal: GKGoal): number;
}

declare class GKBillowNoiseSource extends GKCoherentNoiseSource {

	static alloc(): GKBillowNoiseSource; // inherited from NSObject

	static billowNoiseSourceWithFrequencyOctaveCountPersistenceLacunaritySeed(frequency: number, octaveCount: number, persistence: number, lacunarity: number, seed: number): GKBillowNoiseSource;

	static new(): GKBillowNoiseSource; // inherited from NSObject

	persistence: number;

	constructor(o: { frequency: number; octaveCount: number; persistence: number; lacunarity: number; seed: number; });

	initWithFrequencyOctaveCountPersistenceLacunaritySeed(frequency: number, octaveCount: number, persistence: number, lacunarity: number, seed: number): this;
}

declare class GKCheckerboardNoiseSource extends GKNoiseSource {

	static alloc(): GKCheckerboardNoiseSource; // inherited from NSObject

	static checkerboardNoiseWithSquareSize(squareSize: number): GKCheckerboardNoiseSource;

	static new(): GKCheckerboardNoiseSource; // inherited from NSObject

	squareSize: number;

	constructor(o: { squareSize: number; });

	initWithSquareSize(squareSize: number): this;
}

declare class GKCircleObstacle extends GKObstacle {

	static alloc(): GKCircleObstacle; // inherited from NSObject

	static new(): GKCircleObstacle; // inherited from NSObject

	static obstacleWithRadius(radius: number): GKCircleObstacle;

	radius: number;

	constructor(o: { radius: number; });

	initWithRadius(radius: number): this;
}

declare class GKCoherentNoiseSource extends GKNoiseSource {

	static alloc(): GKCoherentNoiseSource; // inherited from NSObject

	static new(): GKCoherentNoiseSource; // inherited from NSObject

	frequency: number;

	lacunarity: number;

	octaveCount: number;

	seed: number;
}

declare class GKComponent extends NSObject implements NSCoding, NSCopying {

	static alloc(): GKComponent; // inherited from NSObject

	static new(): GKComponent; // inherited from NSObject

	readonly entity: GKEntity;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	didAddToEntity(): void;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	updateWithDeltaTime(seconds: number): void;

	willRemoveFromEntity(): void;
}

declare class GKComponentSystem<ComponentType> extends NSObject implements NSFastEnumeration {

	static alloc<ComponentType>(): GKComponentSystem<ComponentType>; // inherited from NSObject

	static new<ComponentType>(): GKComponentSystem<ComponentType>; // inherited from NSObject

	readonly componentClass: typeof NSObject;

	readonly components: NSArray<ComponentType>;
	[index: number]: ComponentType;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { componentClass: typeof NSObject; });

	addComponent(component: ComponentType): void;

	addComponentWithEntity(entity: GKEntity): void;

	classForGenericArgumentAtIndex(index: number): typeof NSObject;

	initWithComponentClass(cls: typeof NSObject): this;

	objectAtIndexedSubscript(idx: number): ComponentType;

	removeComponent(component: ComponentType): void;

	removeComponentWithEntity(entity: GKEntity): void;

	updateWithDeltaTime(seconds: number): void;
}

declare class GKCompositeBehavior extends GKBehavior {

	static alloc(): GKCompositeBehavior; // inherited from NSObject

	static behaviorWithBehaviors(behaviors: NSArray<GKBehavior>): GKCompositeBehavior;

	static behaviorWithBehaviorsAndWeights(behaviors: NSArray<GKBehavior>, weights: NSArray<number>): GKCompositeBehavior;

	static behaviorWithGoalWeight(goal: GKGoal, weight: number): GKCompositeBehavior; // inherited from GKBehavior

	static behaviorWithGoals(goals: NSArray<GKGoal>): GKCompositeBehavior; // inherited from GKBehavior

	static behaviorWithGoalsAndWeights(goals: NSArray<GKGoal>, weights: NSArray<number>): GKCompositeBehavior; // inherited from GKBehavior

	static behaviorWithWeightedGoals(weightedGoals: NSDictionary<GKGoal, number>): GKCompositeBehavior; // inherited from GKBehavior

	static new(): GKCompositeBehavior; // inherited from NSObject

	readonly behaviorCount: number;
	[index: number]: GKBehavior;

	objectAtIndexedSubscript(idx: number): GKBehavior;

	objectForKeyedSubscript(behavior: GKBehavior): number;

	removeAllBehaviors(): void;

	removeBehavior(behavior: GKBehavior): void;

	setObjectForKeyedSubscript(weight: number, behavior: GKBehavior): void;

	setWeightForBehavior(weight: number, behavior: GKBehavior): void;

	weightForBehavior(behavior: GKBehavior): number;
}

declare class GKConstantNoiseSource extends GKNoiseSource {

	static alloc(): GKConstantNoiseSource; // inherited from NSObject

	static constantNoiseWithValue(value: number): GKConstantNoiseSource;

	static new(): GKConstantNoiseSource; // inherited from NSObject

	value: number;

	constructor(o: { value: number; });

	initWithValue(value: number): this;
}

declare class GKCylindersNoiseSource extends GKNoiseSource {

	static alloc(): GKCylindersNoiseSource; // inherited from NSObject

	static cylindersNoiseWithFrequency(frequency: number): GKCylindersNoiseSource;

	static new(): GKCylindersNoiseSource; // inherited from NSObject

	frequency: number;

	constructor(o: { frequency: number; });

	initWithFrequency(frequency: number): this;
}

declare class GKDecisionNode extends NSObject {

	static alloc(): GKDecisionNode; // inherited from NSObject

	static new(): GKDecisionNode; // inherited from NSObject

	createBranchWithPredicateAttribute(predicate: NSPredicate, attribute: NSObjectProtocol): this;

	createBranchWithValueAttribute(value: number, attribute: NSObjectProtocol): this;

	createBranchWithWeightAttribute(weight: number, attribute: NSObjectProtocol): this;
}

declare class GKDecisionTree extends NSObject implements NSSecureCoding {

	static alloc(): GKDecisionTree; // inherited from NSObject

	static new(): GKDecisionTree; // inherited from NSObject

	randomSource: GKRandomSource;

	readonly rootNode: GKDecisionNode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { attribute: NSObjectProtocol; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { examples: NSArray<NSArray<NSObjectProtocol>>; actions: NSArray<NSObjectProtocol>; attributes: NSArray<NSObjectProtocol>; });

	encodeWithCoder(aCoder: NSCoder): void;

	findActionForAnswers(answers: NSDictionary<NSObjectProtocol, NSObjectProtocol>): NSObjectProtocol;

	initWithAttribute(attribute: NSObjectProtocol): this;

	initWithCoder(aDecoder: NSCoder): this;

	initWithExamplesActionsAttributes(examples: NSArray<NSArray<NSObjectProtocol>>, actions: NSArray<NSObjectProtocol>, attributes: NSArray<NSObjectProtocol>): this;
}

declare class GKEntity extends NSObject implements NSCoding, NSCopying {

	static alloc(): GKEntity; // inherited from NSObject

	static entity(): GKEntity;

	static new(): GKEntity; // inherited from NSObject

	readonly components: NSArray<GKComponent>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addComponent(component: GKComponent): void;

	componentForClass(componentClass: typeof NSObject): GKComponent;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	removeComponentForClass(componentClass: typeof NSObject): void;

	updateWithDeltaTime(seconds: number): void;
}

interface GKGameModel extends NSCopying, NSObjectProtocol {

	activePlayer: GKGameModelPlayer;

	players: NSArray<GKGameModelPlayer>;

	applyGameModelUpdate(gameModelUpdate: GKGameModelUpdate): void;

	gameModelUpdatesForPlayer(player: GKGameModelPlayer): NSArray<GKGameModelUpdate>;

	isLossForPlayer?(player: GKGameModelPlayer): boolean;

	isWinForPlayer?(player: GKGameModelPlayer): boolean;

	scoreForPlayer?(player: GKGameModelPlayer): number;

	setGameModel(gameModel: GKGameModel): void;

	unapplyGameModelUpdate?(gameModelUpdate: GKGameModelUpdate): void;
}
declare var GKGameModel: {

	prototype: GKGameModel;
};

declare var GKGameModelMaxScore: number;

declare var GKGameModelMinScore: number;

interface GKGameModelPlayer extends NSObjectProtocol {

	playerId: number;
}
declare var GKGameModelPlayer: {

	prototype: GKGameModelPlayer;
};

interface GKGameModelUpdate extends NSObjectProtocol {

	value: number;
}
declare var GKGameModelUpdate: {

	prototype: GKGameModelUpdate;
};

declare class GKGaussianDistribution extends GKRandomDistribution {

	static alloc(): GKGaussianDistribution; // inherited from NSObject

	static d20(): GKGaussianDistribution; // inherited from GKRandomDistribution

	static d6(): GKGaussianDistribution; // inherited from GKRandomDistribution

	static distributionForDieWithSideCount(sideCount: number): GKGaussianDistribution; // inherited from GKRandomDistribution

	static distributionWithLowestValueHighestValue(lowestInclusive: number, highestInclusive: number): GKGaussianDistribution; // inherited from GKRandomDistribution

	static new(): GKGaussianDistribution; // inherited from NSObject

	readonly deviation: number;

	readonly mean: number;

	constructor(o: { randomSource: GKRandom; mean: number; deviation: number; });

	initWithRandomSourceMeanDeviation(source: GKRandom, mean: number, deviation: number): this;
}

declare class GKGoal extends NSObject implements NSCopying {

	static alloc(): GKGoal; // inherited from NSObject

	static goalToAlignWithAgentsMaxDistanceMaxAngle(agents: NSArray<GKAgent>, maxDistance: number, maxAngle: number): GKGoal;

	static goalToAvoidAgentsMaxPredictionTime(agents: NSArray<GKAgent>, maxPredictionTime: number): GKGoal;

	static goalToAvoidObstaclesMaxPredictionTime(obstacles: NSArray<GKObstacle>, maxPredictionTime: number): GKGoal;

	static goalToCohereWithAgentsMaxDistanceMaxAngle(agents: NSArray<GKAgent>, maxDistance: number, maxAngle: number): GKGoal;

	static goalToFleeAgent(agent: GKAgent): GKGoal;

	static goalToFollowPathMaxPredictionTimeForward(path: GKPath, maxPredictionTime: number, forward: boolean): GKGoal;

	static goalToInterceptAgentMaxPredictionTime(target: GKAgent, maxPredictionTime: number): GKGoal;

	static goalToReachTargetSpeed(targetSpeed: number): GKGoal;

	static goalToSeekAgent(agent: GKAgent): GKGoal;

	static goalToSeparateFromAgentsMaxDistanceMaxAngle(agents: NSArray<GKAgent>, maxDistance: number, maxAngle: number): GKGoal;

	static goalToStayOnPathMaxPredictionTime(path: GKPath, maxPredictionTime: number): GKGoal;

	static goalToWander(speed: number): GKGoal;

	static new(): GKGoal; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class GKGraph extends NSObject implements NSCoding, NSCopying {

	static alloc(): GKGraph; // inherited from NSObject

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKGraph;

	static new(): GKGraph; // inherited from NSObject

	readonly nodes: NSArray<GKGraphNode>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nodes: NSArray<GKGraphNode>; });

	addNodes(nodes: NSArray<GKGraphNode>): void;

	connectNodeToLowestCostNodeBidirectional(node: GKGraphNode, bidirectional: boolean): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	findPathFromNodeToNode(startNode: GKGraphNode, endNode: GKGraphNode): NSArray<GKGraphNode>;

	initWithCoder(aDecoder: NSCoder): this;

	initWithNodes(nodes: NSArray<GKGraphNode>): this;

	removeNodes(nodes: NSArray<GKGraphNode>): void;
}

declare class GKGraphNode extends NSObject implements NSCoding {

	static alloc(): GKGraphNode; // inherited from NSObject

	static new(): GKGraphNode; // inherited from NSObject

	readonly connectedNodes: NSArray<GKGraphNode>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addConnectionsToNodesBidirectional(nodes: NSArray<GKGraphNode>, bidirectional: boolean): void;

	costToNode(node: GKGraphNode): number;

	encodeWithCoder(aCoder: NSCoder): void;

	estimatedCostToNode(node: GKGraphNode): number;

	findPathFromNode(startNode: GKGraphNode): NSArray<GKGraphNode>;

	findPathToNode(goalNode: GKGraphNode): NSArray<GKGraphNode>;

	initWithCoder(aDecoder: NSCoder): this;

	removeConnectionsToNodesBidirectional(nodes: NSArray<GKGraphNode>, bidirectional: boolean): void;
}

declare class GKGraphNode2D extends GKGraphNode {

	static alloc(): GKGraphNode2D; // inherited from NSObject

	static new(): GKGraphNode2D; // inherited from NSObject
}

declare class GKGraphNode3D extends GKGraphNode {

	static alloc(): GKGraphNode3D; // inherited from NSObject

	static new(): GKGraphNode3D; // inherited from NSObject
}

declare class GKGridGraph<NodeType> extends GKGraph {

	static alloc<NodeType>(): GKGridGraph<NodeType>; // inherited from NSObject

	static graphWithNodes<NodeType>(nodes: NSArray<GKGraphNode>): GKGridGraph<NodeType>; // inherited from GKGraph

	static new<NodeType>(): GKGridGraph<NodeType>; // inherited from NSObject

	readonly diagonalsAllowed: boolean;

	readonly gridHeight: number;

	readonly gridWidth: number;

	classForGenericArgumentAtIndex(index: number): typeof NSObject;

	connectNodeToAdjacentNodes(node: GKGridGraphNode): void;
}

declare class GKGridGraphNode extends GKGraphNode {

	static alloc(): GKGridGraphNode; // inherited from NSObject

	static new(): GKGridGraphNode; // inherited from NSObject
}

declare class GKLinearCongruentialRandomSource extends GKRandomSource {

	static alloc(): GKLinearCongruentialRandomSource; // inherited from NSObject

	static new(): GKLinearCongruentialRandomSource; // inherited from NSObject

	seed: number;

	constructor(o: { seed: number; });

	initWithSeed(seed: number): this;
}

declare class GKMersenneTwisterRandomSource extends GKRandomSource {

	static alloc(): GKMersenneTwisterRandomSource; // inherited from NSObject

	static new(): GKMersenneTwisterRandomSource; // inherited from NSObject

	seed: number;

	constructor(o: { seed: number; });

	initWithSeed(seed: number): this;
}

declare class GKMeshGraph<NodeType> extends GKGraph {

	static alloc<NodeType>(): GKMeshGraph<NodeType>; // inherited from NSObject

	static graphWithNodes<NodeType>(nodes: NSArray<GKGraphNode>): GKMeshGraph<NodeType>; // inherited from GKGraph

	static new<NodeType>(): GKMeshGraph<NodeType>; // inherited from NSObject

	readonly bufferRadius: number;

	readonly obstacles: NSArray<GKPolygonObstacle>;

	readonly triangleCount: number;

	triangulationMode: GKMeshGraphTriangulationMode;

	addObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	classForGenericArgumentAtIndex(index: number): typeof NSObject;

	connectNodeUsingObstacles(node: NodeType): void;

	removeObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	triangulate(): void;
}

declare const enum GKMeshGraphTriangulationMode {

	Vertices = 1,

	Centers = 2,

	EdgeMidpoints = 4
}

declare class GKMinmaxStrategist extends NSObject implements GKStrategist {

	static alloc(): GKMinmaxStrategist; // inherited from NSObject

	static new(): GKMinmaxStrategist; // inherited from NSObject

	maxLookAheadDepth: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	gameModel: GKGameModel; // inherited from GKStrategist

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	randomSource: GKRandom; // inherited from GKStrategist

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	bestMoveForActivePlayer(): GKGameModelUpdate;

	bestMoveForPlayer(player: GKGameModelPlayer): GKGameModelUpdate;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	randomMoveForPlayerFromNumberOfBestMoves(player: GKGameModelPlayer, numMovesToConsider: number): GKGameModelUpdate;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class GKMonteCarloStrategist extends NSObject implements GKStrategist {

	static alloc(): GKMonteCarloStrategist; // inherited from NSObject

	static new(): GKMonteCarloStrategist; // inherited from NSObject

	budget: number;

	explorationParameter: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	gameModel: GKGameModel; // inherited from GKStrategist

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	randomSource: GKRandom; // inherited from GKStrategist

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	bestMoveForActivePlayer(): GKGameModelUpdate;

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

declare class GKNSPredicateRule extends GKRule {

	static alloc(): GKNSPredicateRule; // inherited from NSObject

	static new(): GKNSPredicateRule; // inherited from NSObject

	static ruleWithBlockPredicateAction(predicate: (p1: GKRuleSystem) => boolean, action: (p1: GKRuleSystem) => void): GKNSPredicateRule; // inherited from GKRule

	static ruleWithPredicateAssertingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKNSPredicateRule; // inherited from GKRule

	static ruleWithPredicateRetractingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKNSPredicateRule; // inherited from GKRule

	readonly predicate: NSPredicate;

	constructor(o: { predicate: NSPredicate; });

	initWithPredicate(predicate: NSPredicate): this;
}

declare class GKNoise extends NSObject {

	static alloc(): GKNoise; // inherited from NSObject

	static new(): GKNoise; // inherited from NSObject

	static noiseWithComponentNoisesSelectionNoise(noises: NSArray<GKNoise>, selectionNoise: GKNoise): GKNoise;

	static noiseWithComponentNoisesSelectionNoiseComponentBoundariesBoundaryBlendDistances(noises: NSArray<GKNoise>, selectionNoise: GKNoise, componentBoundaries: NSArray<number>, blendDistances: NSArray<number>): GKNoise;

	static noiseWithNoiseSource(noiseSource: GKNoiseSource): GKNoise;

	static noiseWithNoiseSourceGradientColors(noiseSource: GKNoiseSource, gradientColors: NSDictionary<number, UIColor>): GKNoise;

	gradientColors: NSDictionary<number, UIColor>;

	constructor(o: { noiseSource: GKNoiseSource; });

	constructor(o: { noiseSource: GKNoiseSource; gradientColors: NSDictionary<number, UIColor>; });

	addWithNoise(noise: GKNoise): void;

	applyAbsoluteValue(): void;

	applyTurbulenceWithFrequencyPowerRoughnessSeed(frequency: number, power: number, roughness: number, seed: number): void;

	clampWithLowerBoundUpperBound(lowerBound: number, upperBound: number): void;

	displaceXWithNoiseYWithNoiseZWithNoise(xDisplacementNoise: GKNoise, yDisplacementNoise: GKNoise, zDisplacementNoise: GKNoise): void;

	initWithNoiseSource(noiseSource: GKNoiseSource): this;

	initWithNoiseSourceGradientColors(noiseSource: GKNoiseSource, gradientColors: NSDictionary<number, UIColor>): this;

	invert(): void;

	maximumWithNoise(noise: GKNoise): void;

	minimumWithNoise(noise: GKNoise): void;

	multiplyWithNoise(noise: GKNoise): void;

	raiseToPower(power: number): void;

	raiseToPowerWithNoise(noise: GKNoise): void;

	remapValuesToCurveWithControlPoints(controlPoints: NSDictionary<number, number>): void;

	remapValuesToTerracesWithPeaksTerracesInverted(peakInputValues: NSArray<number>, inverted: boolean): void;
}

declare class GKNoiseMap extends NSObject {

	static alloc(): GKNoiseMap; // inherited from NSObject

	static new(): GKNoiseMap; // inherited from NSObject

	static noiseMapWithNoise(noise: GKNoise): GKNoiseMap;

	readonly seamless: boolean;

	constructor(o: { noise: GKNoise; });

	initWithNoise(noise: GKNoise): this;
}

declare class GKNoiseSource extends NSObject {

	static alloc(): GKNoiseSource; // inherited from NSObject

	static new(): GKNoiseSource; // inherited from NSObject
}

declare class GKObstacle extends NSObject {

	static alloc(): GKObstacle; // inherited from NSObject

	static new(): GKObstacle; // inherited from NSObject
}

declare class GKObstacleGraph<NodeType> extends GKGraph {

	static alloc<NodeType>(): GKObstacleGraph<NodeType>; // inherited from NSObject

	static graphWithNodes<NodeType>(nodes: NSArray<GKGraphNode>): GKObstacleGraph<NodeType>; // inherited from GKGraph

	static graphWithObstaclesBufferRadius<NodeType>(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number): GKObstacleGraph<NodeType>;

	static graphWithObstaclesBufferRadiusNodeClass<NodeType>(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number, nodeClass: typeof NSObject): GKObstacleGraph<NodeType>;

	static new<NodeType>(): GKObstacleGraph<NodeType>; // inherited from NSObject

	readonly bufferRadius: number;

	readonly obstacles: NSArray<GKPolygonObstacle>;

	constructor(o: { obstacles: NSArray<GKPolygonObstacle>; bufferRadius: number; });

	constructor(o: { obstacles: NSArray<GKPolygonObstacle>; bufferRadius: number; nodeClass: typeof NSObject; });

	addObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	classForGenericArgumentAtIndex(index: number): typeof NSObject;

	connectNodeUsingObstacles(node: NodeType): void;

	connectNodeUsingObstaclesIgnoringBufferRadiusOfObstacles(node: NodeType, obstaclesBufferRadiusToIgnore: NSArray<GKPolygonObstacle>): void;

	connectNodeUsingObstaclesIgnoringObstacles(node: NodeType, obstaclesToIgnore: NSArray<GKPolygonObstacle>): void;

	initWithObstaclesBufferRadius(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number): this;

	initWithObstaclesBufferRadiusNodeClass(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number, nodeClass: typeof NSObject): this;

	isConnectionLockedFromNodeToNode(startNode: NodeType, endNode: NodeType): boolean;

	lockConnectionFromNodeToNode(startNode: NodeType, endNode: NodeType): void;

	nodesForObstacle(obstacle: GKPolygonObstacle): NSArray<NodeType>;

	removeAllObstacles(): void;

	removeObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	unlockConnectionFromNodeToNode(startNode: NodeType, endNode: NodeType): void;
}

declare class GKOctree<ElementType> extends NSObject {

	static alloc<ElementType>(): GKOctree<ElementType>; // inherited from NSObject

	static new<ElementType>(): GKOctree<ElementType>; // inherited from NSObject

	removeElement(element: ElementType): boolean;

	removeElementWithNode(element: ElementType, node: GKOctreeNode): boolean;
}

declare class GKOctreeNode extends NSObject {

	static alloc(): GKOctreeNode; // inherited from NSObject

	static new(): GKOctreeNode; // inherited from NSObject
}

declare class GKPath extends NSObject {

	static alloc(): GKPath; // inherited from NSObject

	static new(): GKPath; // inherited from NSObject

	static pathWithGraphNodesRadius(graphNodes: NSArray<GKGraphNode>, radius: number): GKPath;

	cyclical: boolean;

	readonly numPoints: number;

	radius: number;

	constructor(o: { graphNodes: NSArray<GKGraphNode>; radius: number; });

	initWithGraphNodesRadius(graphNodes: NSArray<GKGraphNode>, radius: number): this;
}

declare class GKPerlinNoiseSource extends GKCoherentNoiseSource {

	static alloc(): GKPerlinNoiseSource; // inherited from NSObject

	static new(): GKPerlinNoiseSource; // inherited from NSObject

	static perlinNoiseSourceWithFrequencyOctaveCountPersistenceLacunaritySeed(frequency: number, octaveCount: number, persistence: number, lacunarity: number, seed: number): GKPerlinNoiseSource;

	persistence: number;

	constructor(o: { frequency: number; octaveCount: number; persistence: number; lacunarity: number; seed: number; });

	initWithFrequencyOctaveCountPersistenceLacunaritySeed(frequency: number, octaveCount: number, persistence: number, lacunarity: number, seed: number): this;
}

declare class GKPolygonObstacle extends GKObstacle implements NSCoding {

	static alloc(): GKPolygonObstacle; // inherited from NSObject

	static new(): GKPolygonObstacle; // inherited from NSObject

	readonly vertexCount: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class GKQuadtree<ElementType> extends NSObject {

	static alloc<ElementType>(): GKQuadtree<ElementType>; // inherited from NSObject

	static new<ElementType>(): GKQuadtree<ElementType>; // inherited from NSObject

	removeElement(element: ElementType): boolean;

	removeElementWithNode(data: ElementType, node: GKQuadtreeNode): boolean;
}

declare class GKQuadtreeNode extends NSObject {

	static alloc(): GKQuadtreeNode; // inherited from NSObject

	static new(): GKQuadtreeNode; // inherited from NSObject
}

declare class GKRTree<ElementType> extends NSObject {

	static alloc<ElementType>(): GKRTree<ElementType>; // inherited from NSObject

	static new<ElementType>(): GKRTree<ElementType>; // inherited from NSObject

	static treeWithMaxNumberOfChildren<ElementType>(maxNumberOfChildren: number): GKRTree<ElementType>;

	queryReserve: number;

	constructor(o: { maxNumberOfChildren: number; });

	initWithMaxNumberOfChildren(maxNumberOfChildren: number): this;
}

declare const enum GKRTreeSplitStrategy {

	Halve = 0,

	Linear = 1,

	Quadratic = 2,

	ReduceOverlap = 3
}

interface GKRandom {

	nextBool(): boolean;

	nextInt(): number;

	nextIntWithUpperBound(upperBound: number): number;

	nextUniform(): number;
}
declare var GKRandom: {

	prototype: GKRandom;
};

declare class GKRandomDistribution extends NSObject implements GKRandom {

	static alloc(): GKRandomDistribution; // inherited from NSObject

	static d20(): GKRandomDistribution;

	static d6(): GKRandomDistribution;

	static distributionForDieWithSideCount(sideCount: number): GKRandomDistribution;

	static distributionWithLowestValueHighestValue(lowestInclusive: number, highestInclusive: number): GKRandomDistribution;

	static new(): GKRandomDistribution; // inherited from NSObject

	readonly highestValue: number;

	readonly lowestValue: number;

	readonly numberOfPossibleOutcomes: number;

	constructor(o: { randomSource: GKRandom; lowestValue: number; highestValue: number; });

	initWithRandomSourceLowestValueHighestValue(source: GKRandom, lowestInclusive: number, highestInclusive: number): this;

	nextBool(): boolean;

	nextInt(): number;

	nextIntWithUpperBound(upperBound: number): number;

	nextUniform(): number;
}

declare class GKRandomSource extends NSObject implements GKRandom, NSCopying, NSSecureCoding {

	static alloc(): GKRandomSource; // inherited from NSObject

	static new(): GKRandomSource; // inherited from NSObject

	static sharedRandom(): GKRandomSource;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	arrayByShufflingObjectsInArray(array: NSArray<any>): NSArray<any>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	nextBool(): boolean;

	nextInt(): number;

	nextIntWithUpperBound(upperBound: number): number;

	nextUniform(): number;
}

declare class GKRidgedNoiseSource extends GKCoherentNoiseSource {

	static alloc(): GKRidgedNoiseSource; // inherited from NSObject

	static new(): GKRidgedNoiseSource; // inherited from NSObject

	static ridgedNoiseSourceWithFrequencyOctaveCountLacunaritySeed(frequency: number, octaveCount: number, lacunarity: number, seed: number): GKRidgedNoiseSource;

	constructor(o: { frequency: number; octaveCount: number; lacunarity: number; seed: number; });

	initWithFrequencyOctaveCountLacunaritySeed(frequency: number, octaveCount: number, lacunarity: number, seed: number): this;
}

declare class GKRule extends NSObject {

	static alloc(): GKRule; // inherited from NSObject

	static new(): GKRule; // inherited from NSObject

	static ruleWithBlockPredicateAction(predicate: (p1: GKRuleSystem) => boolean, action: (p1: GKRuleSystem) => void): GKRule;

	static ruleWithPredicateAssertingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKRule;

	static ruleWithPredicateRetractingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKRule;

	salience: number;

	evaluatePredicateWithSystem(system: GKRuleSystem): boolean;

	performActionWithSystem(system: GKRuleSystem): void;
}

declare class GKRuleSystem extends NSObject {

	static alloc(): GKRuleSystem; // inherited from NSObject

	static new(): GKRuleSystem; // inherited from NSObject

	readonly agenda: NSArray<GKRule>;

	readonly executed: NSArray<GKRule>;

	readonly facts: NSArray<any>;

	readonly rules: NSArray<GKRule>;

	readonly state: NSMutableDictionary<any, any>;

	addRule(rule: GKRule): void;

	addRulesFromArray(rules: NSArray<GKRule>): void;

	assertFact(fact: NSObjectProtocol): void;

	assertFactGrade(fact: NSObjectProtocol, grade: number): void;

	evaluate(): void;

	gradeForFact(fact: NSObjectProtocol): number;

	maximumGradeForFacts(facts: NSArray<any>): number;

	minimumGradeForFacts(facts: NSArray<any>): number;

	removeAllRules(): void;

	reset(): void;

	retractFact(fact: NSObjectProtocol): void;

	retractFactGrade(fact: NSObjectProtocol, grade: number): void;
}

declare class GKSKNodeComponent extends GKComponent implements GKAgentDelegate {

	static alloc(): GKSKNodeComponent; // inherited from NSObject

	static componentWithNode(node: SKNode): GKSKNodeComponent;

	static new(): GKSKNodeComponent; // inherited from NSObject

	node: SKNode;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { node: SKNode; });

	agentDidUpdate(agent: GKAgent): void;

	agentWillUpdate(agent: GKAgent): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithNode(node: SKNode): this;

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

declare class GKScene extends NSObject implements NSCoding, NSCopying {

	static alloc(): GKScene; // inherited from NSObject

	static new(): GKScene; // inherited from NSObject

	static sceneWithFileNamed(filename: string): GKScene;

	readonly entities: NSArray<GKEntity>;

	readonly graphs: NSDictionary<string, GKGraph>;

	rootNode: GKSceneRootNodeType;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addEntity(entity: GKEntity): void;

	addGraphName(graph: GKGraph, name: string): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	removeEntity(entity: GKEntity): void;

	removeGraph(name: string): void;
}

interface GKSceneRootNodeType extends NSObjectProtocol {
}
declare var GKSceneRootNodeType: {

	prototype: GKSceneRootNodeType;
};

declare class GKShuffledDistribution extends GKRandomDistribution {

	static alloc(): GKShuffledDistribution; // inherited from NSObject

	static d20(): GKShuffledDistribution; // inherited from GKRandomDistribution

	static d6(): GKShuffledDistribution; // inherited from GKRandomDistribution

	static distributionForDieWithSideCount(sideCount: number): GKShuffledDistribution; // inherited from GKRandomDistribution

	static distributionWithLowestValueHighestValue(lowestInclusive: number, highestInclusive: number): GKShuffledDistribution; // inherited from GKRandomDistribution

	static new(): GKShuffledDistribution; // inherited from NSObject
}

declare class GKSphereObstacle extends GKObstacle {

	static alloc(): GKSphereObstacle; // inherited from NSObject

	static new(): GKSphereObstacle; // inherited from NSObject

	static obstacleWithRadius(radius: number): GKSphereObstacle;

	radius: number;

	constructor(o: { radius: number; });

	initWithRadius(radius: number): this;
}

declare class GKSpheresNoiseSource extends GKNoiseSource {

	static alloc(): GKSpheresNoiseSource; // inherited from NSObject

	static new(): GKSpheresNoiseSource; // inherited from NSObject

	static spheresNoiseWithFrequency(frequency: number): GKSpheresNoiseSource;

	frequency: number;

	constructor(o: { frequency: number; });

	initWithFrequency(frequency: number): this;
}

declare class GKState extends NSObject {

	static alloc(): GKState; // inherited from NSObject

	static new(): GKState; // inherited from NSObject

	static state(): GKState;

	readonly stateMachine: GKStateMachine;

	didEnterWithPreviousState(previousState: GKState): void;

	isValidNextState(stateClass: typeof NSObject): boolean;

	updateWithDeltaTime(seconds: number): void;

	willExitWithNextState(nextState: GKState): void;
}

declare class GKStateMachine extends NSObject {

	static alloc(): GKStateMachine; // inherited from NSObject

	static new(): GKStateMachine; // inherited from NSObject

	static stateMachineWithStates(states: NSArray<GKState>): GKStateMachine;

	readonly currentState: GKState;

	constructor(o: { states: NSArray<GKState>; });

	canEnterState(stateClass: typeof NSObject): boolean;

	enterState(stateClass: typeof NSObject): boolean;

	initWithStates(states: NSArray<GKState>): this;

	stateForClass(stateClass: typeof NSObject): GKState;

	updateWithDeltaTime(sec: number): void;
}

interface GKStrategist extends NSObjectProtocol {

	gameModel: GKGameModel;

	randomSource: GKRandom;

	bestMoveForActivePlayer(): GKGameModelUpdate;
}
declare var GKStrategist: {

	prototype: GKStrategist;
};

declare class GKVoronoiNoiseSource extends GKNoiseSource {

	static alloc(): GKVoronoiNoiseSource; // inherited from NSObject

	static new(): GKVoronoiNoiseSource; // inherited from NSObject

	static voronoiNoiseWithFrequencyDisplacementDistanceEnabledSeed(frequency: number, displacement: number, distanceEnabled: boolean, seed: number): GKVoronoiNoiseSource;

	displacement: number;

	distanceEnabled: boolean;

	frequency: number;

	seed: number;

	constructor(o: { frequency: number; displacement: number; distanceEnabled: boolean; seed: number; });

	initWithFrequencyDisplacementDistanceEnabledSeed(frequency: number, displacement: number, distanceEnabled: boolean, seed: number): this;
}
