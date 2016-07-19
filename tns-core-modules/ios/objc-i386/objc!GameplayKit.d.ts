
declare class GKARC4RandomSource extends GKRandomSource {

	seed: NSData;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { seed: NSData; });

	dropValuesWithCount(count: number): void;
}

declare class GKAgent extends GKComponent {

	behavior: GKBehavior;

	delegate: GKAgentDelegate;

	mass: number;

	maxAcceleration: number;

	maxSpeed: number;

	radius: number;

	/* readonly */ speed: number;
}

declare class GKAgent2D extends GKAgent {

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

	constructor(); // inherited from NSObject

	objectAtIndexedSubscript(idx: number): GKGoal;

	objectForKeyedSubscript(goal: GKGoal): number;

	removeAllGoals(): void;

	removeGoal(goal: GKGoal): void;

	self(): GKBehavior; // inherited from NSObjectProtocol

	setObjectForKeyedSubscript(weight: number, goal: GKGoal): void;

	setWeightForGoal(weight: number, goal: GKGoal): void;

	weightForGoal(goal: GKGoal): number;
}

declare class GKCircleObstacle extends GKObstacle {

	static obstacleWithRadius(radius: number): GKCircleObstacle;

	radius: number;

	constructor(o: { radius: number; });
}

declare class GKComponent extends NSObject implements NSCopying {

	static alloc(): GKComponent; // inherited from NSObject

	static new(): GKComponent; // inherited from NSObject

	/* readonly */ entity: GKEntity;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): GKComponent; // inherited from NSObjectProtocol

	updateWithDeltaTime(seconds: number): void;
}

declare class GKComponentSystem<ComponentType> extends NSObject implements NSFastEnumeration {

	static alloc<ComponentType>(): GKComponentSystem<ComponentType>; // inherited from NSObject

	static new<ComponentType>(): GKComponentSystem<ComponentType>; // inherited from NSObject

	/* readonly */ componentClass: typeof NSObject;

	/* readonly */ components: NSArray<ComponentType>;
	[index: number]: ComponentType;
	[Symbol.iterator](): Iterator<any>;

	constructor(); // inherited from NSObject

	constructor(o: { componentClass: typeof NSObject; });

	addComponent(component: ComponentType): void;

	addComponentWithEntity(entity: GKEntity): void;

	objectAtIndexedSubscript(idx: number): ComponentType;

	removeComponent(component: ComponentType): void;

	removeComponentWithEntity(entity: GKEntity): void;

	self(): GKComponentSystem<ComponentType>; // inherited from NSObjectProtocol

	updateWithDeltaTime(seconds: number): void;
}

declare class GKEntity extends NSObject implements NSCopying {

	static alloc(): GKEntity; // inherited from NSObject

	static entity(): GKEntity;

	static new(): GKEntity; // inherited from NSObject

	/* readonly */ components: NSArray<GKComponent>;

	constructor(); // inherited from NSObject

	addComponent(component: GKComponent): void;

	componentForClass(componentClass: typeof NSObject): GKComponent;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	removeComponentForClass(componentClass: typeof NSObject): void;

	self(): GKEntity; // inherited from NSObjectProtocol

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

	static d20(): GKGaussianDistribution; // inherited from GKRandomDistribution

	static d6(): GKGaussianDistribution; // inherited from GKRandomDistribution

	static distributionForDieWithSideCount(sideCount: number): GKGaussianDistribution; // inherited from GKRandomDistribution

	static distributionWithLowestValueHighestValue(lowestInclusive: number, highestInclusive: number): GKGaussianDistribution; // inherited from GKRandomDistribution

	/* readonly */ deviation: number;

	/* readonly */ mean: number;

	constructor(o: { randomSource: GKRandom; lowestValue: number; highestValue: number; }); // inherited from GKRandomDistribution

	constructor(o: { randomSource: GKRandom; mean: number; deviation: number; });
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

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): GKGoal; // inherited from NSObjectProtocol
}

declare class GKGraph extends NSObject {

	static alloc(): GKGraph; // inherited from NSObject

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKGraph;

	static new(): GKGraph; // inherited from NSObject

	/* readonly */ nodes: NSArray<GKGraphNode>;

	constructor(); // inherited from NSObject

	constructor(o: { nodes: NSArray<GKGraphNode>; });

	addNodes(nodes: NSArray<GKGraphNode>): void;

	connectNodeToLowestCostNodeBidirectional(node: GKGraphNode, bidirectional: boolean): void;

	findPathFromNodeToNode(startNode: GKGraphNode, endNode: GKGraphNode): NSArray<GKGraphNode>;

	removeNodes(nodes: NSArray<GKGraphNode>): void;

	self(): GKGraph; // inherited from NSObjectProtocol
}

declare class GKGraphNode extends NSObject {

	static alloc(): GKGraphNode; // inherited from NSObject

	static new(): GKGraphNode; // inherited from NSObject

	/* readonly */ connectedNodes: NSArray<GKGraphNode>;

	constructor(); // inherited from NSObject

	addConnectionsToNodesBidirectional(nodes: NSArray<GKGraphNode>, bidirectional: boolean): void;

	costToNode(node: GKGraphNode): number;

	estimatedCostToNode(node: GKGraphNode): number;

	findPathFromNode(startNode: GKGraphNode): NSArray<GKGraphNode>;

	findPathToNode(goalNode: GKGraphNode): NSArray<GKGraphNode>;

	removeConnectionsToNodesBidirectional(nodes: NSArray<GKGraphNode>, bidirectional: boolean): void;

	self(): GKGraphNode; // inherited from NSObjectProtocol
}

declare class GKGraphNode2D extends GKGraphNode {
}

declare class GKGridGraph extends GKGraph {

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKGridGraph; // inherited from GKGraph

	/* readonly */ diagonalsAllowed: boolean;

	/* readonly */ gridHeight: number;

	/* readonly */ gridWidth: number;

	constructor(o: { nodes: NSArray<GKGraphNode>; }); // inherited from GKGraph

	connectNodeToAdjacentNodes(node: GKGridGraphNode): void;
}

declare class GKGridGraphNode extends GKGraphNode {
}

declare class GKLinearCongruentialRandomSource extends GKRandomSource {

	seed: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { seed: number; });
}

declare class GKMersenneTwisterRandomSource extends GKRandomSource {

	seed: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { seed: number; });
}

declare class GKMinmaxStrategist extends NSObject implements GKStrategist {

	static alloc(): GKMinmaxStrategist; // inherited from NSObject

	static new(): GKMinmaxStrategist; // inherited from NSObject

	maxLookAheadDepth: number;

	gameModel: GKGameModel; // inherited from GKStrategist

	randomSource: GKRandom; // inherited from GKStrategist

	constructor(); // inherited from NSObject

	bestMoveForActivePlayer(): GKGameModelUpdate; // inherited from GKStrategist

	bestMoveForPlayer(player: GKGameModelPlayer): GKGameModelUpdate;

	randomMoveForPlayerFromNumberOfBestMoves(player: GKGameModelPlayer, numMovesToConsider: number): GKGameModelUpdate;

	self(): GKMinmaxStrategist; // inherited from NSObjectProtocol
}

declare class GKNSPredicateRule extends GKRule {

	static ruleWithBlockPredicateAction(predicate: (p1: GKRuleSystem) => boolean, action: (p1: GKRuleSystem) => void): GKNSPredicateRule; // inherited from GKRule

	static ruleWithPredicateAssertingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKNSPredicateRule; // inherited from GKRule

	static ruleWithPredicateRetractingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKNSPredicateRule; // inherited from GKRule

	/* readonly */ predicate: NSPredicate;

	constructor(o: { predicate: NSPredicate; });
}

declare class GKObstacle extends NSObject {

	static alloc(): GKObstacle; // inherited from NSObject

	static new(): GKObstacle; // inherited from NSObject

	constructor(); // inherited from NSObject

	self(): GKObstacle; // inherited from NSObjectProtocol
}

declare class GKObstacleGraph extends GKGraph {

	static graphWithNodes(nodes: NSArray<GKGraphNode>): GKObstacleGraph; // inherited from GKGraph

	static graphWithObstaclesBufferRadius(obstacles: NSArray<GKPolygonObstacle>, bufferRadius: number): GKObstacleGraph;

	/* readonly */ bufferRadius: number;

	/* readonly */ obstacles: NSArray<GKPolygonObstacle>;

	constructor(o: { nodes: NSArray<GKGraphNode>; }); // inherited from GKGraph

	constructor(o: { obstacles: NSArray<GKPolygonObstacle>; bufferRadius: number; });

	addObstacles(obstacles: NSArray<GKPolygonObstacle>): void;

	connectNodeUsingObstacles(node: GKGraphNode2D): void;

	connectNodeUsingObstaclesIgnoringBufferRadiusOfObstacles(node: GKGraphNode2D, obstaclesBufferRadiusToIgnore: NSArray<GKPolygonObstacle>): void;

	connectNodeUsingObstaclesIgnoringObstacles(node: GKGraphNode2D, obstaclesToIgnore: NSArray<GKPolygonObstacle>): void;

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

	constructor(); // inherited from NSObject

	constructor(o: { graphNodes: NSArray<GKGraphNode2D>; radius: number; });

	self(): GKPath; // inherited from NSObjectProtocol
}

declare class GKPolygonObstacle extends GKObstacle {

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

	constructor(); // inherited from NSObject

	constructor(o: { randomSource: GKRandom; lowestValue: number; highestValue: number; });

	nextBool(): boolean; // inherited from GKRandom

	nextInt(): number; // inherited from GKRandom

	nextIntWithUpperBound(upperBound: number): number; // inherited from GKRandom

	nextUniform(): number; // inherited from GKRandom

	self(): GKRandomDistribution; // inherited from NSObjectProtocol
}

declare class GKRandomSource extends NSObject implements GKRandom, NSCopying, NSSecureCoding {

	static alloc(): GKRandomSource; // inherited from NSObject

	static new(): GKRandomSource; // inherited from NSObject

	static sharedRandom(): GKRandomSource;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	arrayByShufflingObjectsInArray(array: NSArray<any>): NSArray<any>;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	nextBool(): boolean; // inherited from GKRandom

	nextInt(): number; // inherited from GKRandom

	nextIntWithUpperBound(upperBound: number): number; // inherited from GKRandom

	nextUniform(): number; // inherited from GKRandom

	self(): GKRandomSource; // inherited from NSObjectProtocol
}

declare class GKRule extends NSObject {

	static alloc(): GKRule; // inherited from NSObject

	static new(): GKRule; // inherited from NSObject

	static ruleWithBlockPredicateAction(predicate: (p1: GKRuleSystem) => boolean, action: (p1: GKRuleSystem) => void): GKRule;

	static ruleWithPredicateAssertingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKRule;

	static ruleWithPredicateRetractingFactGrade(predicate: NSPredicate, fact: NSObjectProtocol, grade: number): GKRule;

	salience: number;

	constructor(); // inherited from NSObject

	evaluatePredicateWithSystem(system: GKRuleSystem): boolean;

	performActionWithSystem(system: GKRuleSystem): void;

	self(): GKRule; // inherited from NSObjectProtocol
}

declare class GKRuleSystem extends NSObject {

	static alloc(): GKRuleSystem; // inherited from NSObject

	static new(): GKRuleSystem; // inherited from NSObject

	/* readonly */ agenda: NSArray<GKRule>;

	/* readonly */ executed: NSArray<GKRule>;

	/* readonly */ facts: NSArray<any>;

	/* readonly */ rules: NSArray<GKRule>;

	/* readonly */ state: NSMutableDictionary<any, any>;

	constructor(); // inherited from NSObject

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

	self(): GKRuleSystem; // inherited from NSObjectProtocol
}

declare class GKShuffledDistribution extends GKRandomDistribution {

	static d20(): GKShuffledDistribution; // inherited from GKRandomDistribution

	static d6(): GKShuffledDistribution; // inherited from GKRandomDistribution

	static distributionForDieWithSideCount(sideCount: number): GKShuffledDistribution; // inherited from GKRandomDistribution

	static distributionWithLowestValueHighestValue(lowestInclusive: number, highestInclusive: number): GKShuffledDistribution; // inherited from GKRandomDistribution

	constructor(o: { randomSource: GKRandom; lowestValue: number; highestValue: number; }); // inherited from GKRandomDistribution
}

declare class GKState extends NSObject {

	static alloc(): GKState; // inherited from NSObject

	static new(): GKState; // inherited from NSObject

	static state(): GKState;

	/* readonly */ stateMachine: GKStateMachine;

	constructor(); // inherited from NSObject

	didEnterWithPreviousState(previousState: GKState): void;

	isValidNextState(stateClass: typeof NSObject): boolean;

	self(): GKState; // inherited from NSObjectProtocol

	updateWithDeltaTime(seconds: number): void;

	willExitWithNextState(nextState: GKState): void;
}

declare class GKStateMachine extends NSObject {

	static alloc(): GKStateMachine; // inherited from NSObject

	static new(): GKStateMachine; // inherited from NSObject

	static stateMachineWithStates(states: NSArray<GKState>): GKStateMachine;

	/* readonly */ currentState: GKState;

	constructor(); // inherited from NSObject

	constructor(o: { states: NSArray<GKState>; });

	canEnterState(stateClass: typeof NSObject): boolean;

	enterState(stateClass: typeof NSObject): boolean;

	self(): GKStateMachine; // inherited from NSObjectProtocol

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
