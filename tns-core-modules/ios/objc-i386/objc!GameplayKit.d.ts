
declare class GKARC4RandomSource extends GKRandomSource {

	static alloc(): GKARC4RandomSource; // inherited from NSObject

	static new(): GKARC4RandomSource; // inherited from NSObject

	seed: NSData;

	constructor(o: { seed: NSData; });

	dropValuesWithCount(count: number): void;

	initWithSeed(seed: NSData): this;
}

declare class GKAgent extends GKComponent {

	static alloc(): GKAgent; // inherited from NSObject

	static new(): GKAgent; // inherited from NSObject

	behavior: GKBehavior;

	delegate: GKAgentDelegate;

	mass: number;

	maxAcceleration: number;

	maxSpeed: number;

	radius: number;

	/* readonly */ speed: number;
}

declare class GKAgent2D extends GKAgent {

	static alloc(): GKAgent2D; // inherited from NSObject

	static new(): GKAgent2D; // inherited from NSObject

	rotation: number;
}

interface GKAgentDelegate extends NSObjectProtocol {

	agentDidUpdate?(agent: GKAgent): void;

	agentWillUpdate?(agent: GKAgent): void;
}
declare var GKAgentDelegate: {

	prototype: GKAgentDelegate;
};

declare class GKBehavior extends NSObject implements NSFastEnumeration {

	static alloc(): GKBehavior; // inherited from NSObject

	static behaviorWithGoalWeight(goal: GKGoal, weight: number): GKBehavior;

	static behaviorWithGoals(goals: NSArray<GKGoal>): GKBehavior;

	static behaviorWithGoalsAndWeights(goals: NSArray<GKGoal>, weights: NSArray<number>): GKBehavior;

	static behaviorWithWeightedGoals(weightedGoals: NSDictionary<GKGoal, number>): GKBehavior;

	static new(): GKBehavior; // inherited from NSObject

	/* readonly */ goalCount: number;
	[index: number]: GKGoal;
	[Symbol.iterator](): Iterator<any>;

	objectAtIndexedSubscript(idx: number): GKGoal;

	objectForKeyedSubscript(goal: GKGoal): number;

	removeAllGoals(): void;

	removeGoal(goal: GKGoal): void;

	setObjectForKeyedSubscript(weight: number, goal: GKGoal): void;

	setWeightForGoal(weight: number, goal: GKGoal): void;

	weightForGoal(goal: GKGoal): number;
}

declare class GKCircleObstacle extends GKObstacle {

	static alloc(): GKCircleObstacle; // inherited from NSObject

	static new(): GKCircleObstacle; // inherited from NSObject

	static obstacleWithRadius(radius: number): GKCircleObstacle;

	radius: number;

	constructor(o: { radius: number; });

	initWithRadius(radius: number): this;
}

declare class GKComponent extends NSObject implements NSCopying {

	static alloc(): GKComponent; // inherited from NSObject

	static new(): GKComponent; // inherited from NSObject

	/* readonly */ entity: GKEntity;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	updateWithDeltaTime(seconds: number): void;
}

declare class GKComponentSystem<ComponentType> extends NSObject implements NSFastEnumeration {

	static alloc<ComponentType>(): GKComponentSystem<ComponentType>; // inherited from NSObject

	static new<ComponentType>(): GKComponentSystem<ComponentType>; // inherited from NSObject

	/* readonly */ componentClass: typeof NSObject;

	/* readonly */ components: NSArray<ComponentType>;
	[index: number]: ComponentType;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { componentClass: typeof NSObject; });

	addComponent(component: ComponentType): void;

	addComponentWithEntity(entity: GKEntity): void;

	initWithComponentClass(cls: typeof NSObject): this;

	objectAtIndexedSubscript(idx: number): ComponentType;

	removeComponent(component: ComponentType): void;

	removeComponentWithEntity(entity: GKEntity): void;

	updateWithDeltaTime(seconds: number): void;
}

declare class GKEntity extends NSObject implements NSCopying {

	static alloc(): GKEntity; // inherited from NSObject

	static entity(): GKEntity;

	static new(): GKEntity; // inherited from NSObject

	/* readonly */ components: NSArray<GKComponent>;

	addComponent(component: GKComponent): void;

	componentForClass(componentClass: typeof NSObject): GKComponent;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

	/* readonly */ deviation: number;

	/* readonly */ mean: number;

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

declare class GKGraph extends NSObject {

	static alloc(): GKGraph; // inherited from NSObject

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKGraph;

	static new(): GKGraph; // inherited from NSObject

	/* readonly */ nodes: NSArray<GKGraphNode>;

	constructor(o: { nodes: NSArray<GKGraphNode>; });

	addNodes(nodes: NSArray<GKGraphNode>): void;

	connectNodeToLowestCostNodeBidirectional(node: GKGraphNode, bidirectional: boolean): void;

	findPathFromNodeToNode(startNode: GKGraphNode, endNode: GKGraphNode): NSArray<GKGraphNode>;

	initWithNodes(nodes: NSArray<GKGraphNode>): this;

	removeNodes(nodes: NSArray<GKGraphNode>): void;
}

declare class GKGraphNode extends NSObject {

	static alloc(): GKGraphNode; // inherited from NSObject

	static new(): GKGraphNode; // inherited from NSObject

	/* readonly */ connectedNodes: NSArray<GKGraphNode>;

	addConnectionsToNodesBidirectional(nodes: NSArray<GKGraphNode>, bidirectional: boolean): void;

	costToNode(node: GKGraphNode): number;

	estimatedCostToNode(node: GKGraphNode): number;

	findPathFromNode(startNode: GKGraphNode): NSArray<GKGraphNode>;

	findPathToNode(goalNode: GKGraphNode): NSArray<GKGraphNode>;

	removeConnectionsToNodesBidirectional(nodes: NSArray<GKGraphNode>, bidirectional: boolean): void;
}

declare class GKGraphNode2D extends GKGraphNode {

	static alloc(): GKGraphNode2D; // inherited from NSObject

	static new(): GKGraphNode2D; // inherited from NSObject
}

declare class GKGridGraph extends GKGraph {

	static alloc(): GKGridGraph; // inherited from NSObject

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKGridGraph; // inherited from GKGraph

	static new(): GKGridGraph; // inherited from NSObject

	/* readonly */ diagonalsAllowed: boolean;

	/* readonly */ gridHeight: number;

	/* readonly */ gridWidth: number;

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

declare class GKMinmaxStrategist extends NSObject implements GKStrategist {

	static alloc(): GKMinmaxStrategist; // inherited from NSObject

	static new(): GKMinmaxStrategist; // inherited from NSObject

	maxLookAheadDepth: number;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	gameModel: GKGameModel; // inherited from GKStrategist

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	randomSource: GKRandom; // inherited from GKStrategist

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */  // inherited from NSObjectProtocol

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

declare class GKNSPredicateRule extends GKRule {

	static alloc(): GKNSPredicateRule; // inherited from NSObject

	static new(): GKNSPredicateRule; // inherited from NSObject

	static ruleWithBlockPredicateAction(predicate: (p1: GKRuleSystem) => boolean, action: (p1: GKRuleSystem) => void): GKNSPredicateRule; // inherited from GKRule

	static ruleWithPredicateAssertingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKNSPredicateRule; // inherited from GKRule

	static ruleWithPredicateRetractingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKNSPredicateRule; // inherited from GKRule

	/* readonly */ predicate: NSPredicate;

	constructor(o: { predicate: NSPredicate; });

	initWithPredicate(predicate: NSPredicate): this;
}

declare class GKObstacle extends NSObject {

	static alloc(): GKObstacle; // inherited from NSObject

	static new(): GKObstacle; // inherited from NSObject
}

declare class GKObstacleGraph extends GKGraph {

	static alloc(): GKObstacleGraph; // inherited from NSObject

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKObstacleGraph; // inherited from GKGraph

	static graphWithObstaclesBufferRadius(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number): GKObstacleGraph;

	static new(): GKObstacleGraph; // inherited from NSObject

	/* readonly */ bufferRadius: number;

	/* readonly */ obstacles: NSArray<GKPolygonObstacle>;

	constructor(o: { obstacles: NSArray<GKPolygonObstacle>; bufferRadius: number; });

	addObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	connectNodeUsingObstacles(node: GKGraphNode2D): void;

	connectNodeUsingObstaclesIgnoringBufferRadiusOfObstacles(node: GKGraphNode2D, obstaclesBufferRadiusToIgnore: NSArray<GKPolygonObstacle>): void;

	connectNodeUsingObstaclesIgnoringObstacles(node: GKGraphNode2D, obstaclesToIgnore: NSArray<GKPolygonObstacle>): void;

	initWithObstaclesBufferRadius(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number): this;

	isConnectionLockedFromNodeToNode(startNode: GKGraphNode2D, endNode: GKGraphNode2D): boolean;

	lockConnectionFromNodeToNode(startNode: GKGraphNode2D, endNode: GKGraphNode2D): void;

	nodesForObstacle(obstacle: GKPolygonObstacle): NSArray<GKGraphNode2D>;

	removeAllObstacles(): void;

	removeObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	unlockConnectionFromNodeToNode(startNode: GKGraphNode2D, endNode: GKGraphNode2D): void;
}

declare class GKPath extends NSObject {

	static alloc(): GKPath; // inherited from NSObject

	static new(): GKPath; // inherited from NSObject

	static pathWithGraphNodesRadius(graphNodes: NSArray<GKGraphNode2D>, radius: number): GKPath;

	cyclical: boolean;

	/* readonly */ numPoints: number;

	radius: number;

	constructor(o: { graphNodes: NSArray<GKGraphNode2D>; radius: number; });

	initWithGraphNodesRadius(graphNodes: NSArray<GKGraphNode2D>, radius: number): this;
}

declare class GKPolygonObstacle extends GKObstacle {

	static alloc(): GKPolygonObstacle; // inherited from NSObject

	static new(): GKPolygonObstacle; // inherited from NSObject

	/* readonly */ vertexCount: number;
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

	/* readonly */ highestValue: number;

	/* readonly */ lowestValue: number;

	/* readonly */ numberOfPossibleOutcomes: number;

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

	static supportsSecureCoding(): boolean;

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

	/* readonly */ agenda: NSArray<GKRule>;

	/* readonly */ executed: NSArray<GKRule>;

	/* readonly */ facts: NSArray<any>;

	/* readonly */ rules: NSArray<GKRule>;

	/* readonly */ state: NSMutableDictionary<any, any>;

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

declare class GKShuffledDistribution extends GKRandomDistribution {

	static alloc(): GKShuffledDistribution; // inherited from NSObject

	static d20(): GKShuffledDistribution; // inherited from GKRandomDistribution

	static d6(): GKShuffledDistribution; // inherited from GKRandomDistribution

	static distributionForDieWithSideCount(sideCount: number): GKShuffledDistribution; // inherited from GKRandomDistribution

	static distributionWithLowestValueHighestValue(lowestInclusive: number, highestInclusive: number): GKShuffledDistribution; // inherited from GKRandomDistribution

	static new(): GKShuffledDistribution; // inherited from NSObject
}

declare class GKState extends NSObject {

	static alloc(): GKState; // inherited from NSObject

	static new(): GKState; // inherited from NSObject

	static state(): GKState;

	/* readonly */ stateMachine: GKStateMachine;

	didEnterWithPreviousState(previousState: GKState): void;

	isValidNextState(stateClass: typeof NSObject): boolean;

	updateWithDeltaTime(seconds: number): void;

	willExitWithNextState(nextState: GKState): void;
}

declare class GKStateMachine extends NSObject {

	static alloc(): GKStateMachine; // inherited from NSObject

	static new(): GKStateMachine; // inherited from NSObject

	static stateMachineWithStates(states: NSArray<GKState>): GKStateMachine;

	/* readonly */ currentState: GKState;

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
