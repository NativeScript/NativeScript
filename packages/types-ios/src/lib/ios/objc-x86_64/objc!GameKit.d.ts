
/**
 * @since 14.0
 */
declare class GKAccessPoint extends NSObject {

	static alloc(): GKAccessPoint; // inherited from NSObject

	static new(): GKAccessPoint; // inherited from NSObject

	active: boolean;

	readonly frameInScreenCoordinates: CGRect;

	readonly isPresentingGameCenter: boolean;

	location: GKAccessPointLocation;

	parentWindow: UIWindow | null;

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	showHighlights: boolean;

	readonly visible: boolean;

	static readonly shared: GKAccessPoint;

	/**
	 * @since 26.2
	 */
	triggerAccessPointForArcadeWithHandler(handler: () => void | null): void;

	/**
	 * @since 26.0
	 */
	triggerAccessPointForChallengesWithHandler(handler: () => void | null): void;

	/**
	 * @since 26.0
	 */
	triggerAccessPointForFriendingWithHandler(handler: () => void | null): void;

	/**
	 * @since 26.0
	 */
	triggerAccessPointForPlayTogetherWithHandler(handler: () => void | null): void;

	/**
	 * @since 18.0
	 */
	triggerAccessPointWithAchievementIDHandler(achievementID: string, handler: () => void | null): void;

	/**
	 * @since 26.0
	 */
	triggerAccessPointWithChallengeDefinitionIDHandler(challengeDefinitionID: string, handler: () => void | null): void;

	/**
	 * @since 26.0
	 */
	triggerAccessPointWithGameActivityDefinitionIDHandler(gameActivityDefinitionID: string, handler: () => void | null): void;

	/**
	 * @since 26.0
	 */
	triggerAccessPointWithGameActivityHandler(gameActivity: GKGameActivity, handler: () => void | null): void;

	triggerAccessPointWithHandler(handler: () => void): void;

	/**
	 * @since 18.0
	 */
	triggerAccessPointWithLeaderboardIDPlayerScopeTimeScopeHandler(leaderboardID: string, playerScope: GKLeaderboardPlayerScope, timeScope: GKLeaderboardTimeScope, handler: () => void | null): void;

	/**
	 * @since 18.0
	 */
	triggerAccessPointWithLeaderboardSetIDHandler(leaderboardSetID: string, handler: () => void | null): void;

	/**
	 * @since 18.0
	 */
	triggerAccessPointWithPlayerHandler(player: GKPlayer, handler: () => void | null): void;

	triggerAccessPointWithStateHandler(state: GKGameCenterViewControllerState, handler: () => void): void;
}

/**
 * @since 14.0
 */
declare const enum GKAccessPointLocation {

	TopLeading = 0,

	TopTrailing = 1,

	BottomLeading = 2,

	BottomTrailing = 3
}

/**
 * @since 4.1
 */
declare class GKAchievement extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKAchievement; // inherited from NSObject

	static loadAchievementsWithCompletionHandler(completionHandler: (p1: NSArray<GKAchievement> | null, p2: NSError | null) => void | null): void;

	static new(): GKAchievement; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static reportAchievementsWithCompletionHandler(achievements: NSArray<GKAchievement> | GKAchievement[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 * @deprecated 26.0
	 */
	static reportAchievementsWithEligibleChallengesWithCompletionHandler(achievements: NSArray<GKAchievement> | GKAchievement[], challenges: NSArray<GKChallenge> | GKChallenge[], completionHandler: (p1: NSError | null) => void | null): void;

	static resetAchievementsWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	readonly completed: boolean;

	/**
	 * @since 4.1
	 * @deprecated 6.0
	 */
	readonly hidden: boolean;

	identifier: string | null;

	readonly lastReportedDate: Date;

	percentComplete: number;

	/**
	 * @since 8.0
	 */
	readonly player: GKPlayer | null;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	readonly playerID: string | null;

	/**
	 * @since 5.0
	 */
	showsCompletionBanner: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string | null; });

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	constructor(o: { identifier: string | null; forPlayer: string; });

	/**
	 * @since 8.0
	 */
	constructor(o: { identifier: string | null; player: GKPlayer; });

	/**
	 * @since 17.0
	 * @deprecated 26.0
	 */
	challengeComposeControllerWithMessagePlayersCompletion(message: string | null, players: NSArray<GKPlayer> | GKPlayer[], completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<GKPlayer> | null) => void | null): UIViewController;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	challengeComposeControllerWithMessagePlayersCompletionHandler(message: string | null, players: NSArray<GKPlayer> | GKPlayer[], completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string> | null) => void | null): UIViewController;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	challengeComposeControllerWithPlayersMessageCompletionHandler(playerIDs: NSArray<string> | string[] | null, message: string | null, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string> | null) => void | null): UIViewController | null;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifier(identifier: string | null): this;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	initWithIdentifierForPlayer(identifier: string | null, playerID: string): this;

	/**
	 * @since 8.0
	 */
	initWithIdentifierPlayer(identifier: string | null, player: GKPlayer): this;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	issueChallengeToPlayersMessage(playerIDs: NSArray<string> | string[] | null, message: string | null): void;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	reportAchievementWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	selectChallengeablePlayerIDsWithCompletionHandler(playerIDs: NSArray<string> | string[] | null, completionHandler: (p1: NSArray<string> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 8.0
	 * @deprecated 26.0
	 */
	selectChallengeablePlayersWithCompletionHandler(players: NSArray<GKPlayer> | GKPlayer[], completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void | null): void;
}

/**
 * @since 6.0
 * @deprecated 26.0
 */
declare class GKAchievementChallenge extends GKChallenge {

	static alloc(): GKAchievementChallenge; // inherited from NSObject

	static new(): GKAchievementChallenge; // inherited from NSObject

	readonly achievement: GKAchievement | null;
}

/**
 * @since 4.1
 */
declare class GKAchievementDescription extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKAchievementDescription; // inherited from NSObject

	static incompleteAchievementImage(): UIImage;

	static loadAchievementDescriptionsWithCompletionHandler(completionHandler: (p1: NSArray<GKAchievementDescription> | null, p2: NSError | null) => void | null): void;

	static new(): GKAchievementDescription; // inherited from NSObject

	static placeholderCompletedAchievementImage(): UIImage;

	readonly achievedDescription: string | null;

	/**
	 * @since 26.0
	 */
	readonly activityIdentifier: string;

	/**
	 * @since 26.0
	 */
	readonly activityProperties: NSDictionary<string, string>;

	/**
	 * @since 6.0
	 */
	readonly groupIdentifier: string | null;

	readonly hidden: boolean;

	readonly identifier: string | null;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	readonly image: UIImage | null;

	readonly maximumPoints: number;

	/**
	 * @since 17.0
	 */
	readonly rarityPercent: number | null;

	/**
	 * @since 18.4
	 */
	readonly releaseState: GKReleaseState;

	/**
	 * @since 6.0
	 */
	readonly replayable: boolean;

	readonly title: string | null;

	readonly unachievedDescription: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	loadImageWithCompletionHandler(completionHandler: (p1: UIImage | null, p2: NSError | null) => void | null): void;
}

/**
 * @since 4.1
 * @deprecated 7.0
 */
declare class GKAchievementViewController extends GKGameCenterViewController {

	static alloc(): GKAchievementViewController; // inherited from NSObject

	static new(): GKAchievementViewController; // inherited from NSObject

	achievementDelegate: GKAchievementViewControllerDelegate;
}

/**
 * @since 4.1
 * @deprecated 7.0
 */
interface GKAchievementViewControllerDelegate extends NSObjectProtocol {

	achievementViewControllerDidFinish(viewController: GKAchievementViewController): void;
}
declare var GKAchievementViewControllerDelegate: {

	prototype: GKAchievementViewControllerDelegate;
};

/**
 * @since 10.0
 */
declare class GKBasePlayer extends NSObject implements NSCopying {

	static alloc(): GKBasePlayer; // inherited from NSObject

	static new(): GKBasePlayer; // inherited from NSObject

	readonly displayName: string | null;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	readonly playerID: string | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 6.0
 * @deprecated 26.0
 */
declare class GKChallenge extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKChallenge; // inherited from NSObject

	static loadReceivedChallengesWithCompletionHandler(completionHandler: (p1: NSArray<GKChallenge> | null, p2: NSError | null) => void | null): void;

	static new(): GKChallenge; // inherited from NSObject

	readonly completionDate: Date | null;

	readonly issueDate: Date;

	/**
	 * @since 8.0
	 */
	readonly issuingPlayer: GKPlayer | null;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	readonly issuingPlayerID: string | null;

	readonly message: string | null;

	/**
	 * @since 8.0
	 */
	readonly receivingPlayer: GKPlayer | null;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	readonly receivingPlayerID: string | null;

	readonly state: GKChallengeState;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	decline(): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 26.0
 */
declare class GKChallengeDefinition extends NSObject {

	static alloc(): GKChallengeDefinition; // inherited from NSObject

	static loadChallengeDefinitionsWithCompletionHandler(completionHandler: (p1: NSArray<GKChallengeDefinition> | null, p2: NSError | null) => void): void;

	static new(): GKChallengeDefinition; // inherited from NSObject

	readonly details: string | null;

	readonly durationOptions: NSArray<NSDateComponents>;

	readonly groupIdentifier: string | null;

	readonly identifier: string;

	readonly isRepeatable: boolean;

	readonly leaderboard: GKLeaderboard | null;

	readonly releaseState: GKReleaseState;

	readonly title: string;

	hasActiveChallengesWithCompletionHandler(completionHandler: (p1: boolean, p2: NSError | null) => void): void;

	loadImageWithCompletionHandler(completionHandler: (p1: UIImage, p2: NSError | null) => void): void;
}

/**
 * @since 6.0
 * @deprecated 7.0
 */
declare class GKChallengeEventHandler extends NSObject {

	static alloc(): GKChallengeEventHandler; // inherited from NSObject

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	static challengeEventHandler(): GKChallengeEventHandler;

	static new(): GKChallengeEventHandler; // inherited from NSObject

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	delegate: GKChallengeEventHandlerDelegate;
}

/**
 * @since 6.0
 * @deprecated 7.0
 */
interface GKChallengeEventHandlerDelegate extends NSObjectProtocol {

	localPlayerDidCompleteChallenge?(challenge: GKChallenge): void;

	localPlayerDidReceiveChallenge?(challenge: GKChallenge): void;

	localPlayerDidSelectChallenge?(challenge: GKChallenge): void;

	remotePlayerDidCompleteChallenge?(challenge: GKChallenge): void;

	shouldShowBannerForLocallyCompletedChallenge?(challenge: GKChallenge): boolean;

	shouldShowBannerForLocallyReceivedChallenge?(challenge: GKChallenge): boolean;

	shouldShowBannerForRemotelyCompletedChallenge?(challenge: GKChallenge): boolean;
}
declare var GKChallengeEventHandlerDelegate: {

	prototype: GKChallengeEventHandlerDelegate;
};

/**
 * @since 7.0
 * @deprecated 26.0
 */
interface GKChallengeListener extends NSObjectProtocol {

	playerDidCompleteChallengeIssuedByFriend?(player: GKPlayer, challenge: GKChallenge, friendPlayer: GKPlayer): void;

	playerDidReceiveChallenge?(player: GKPlayer, challenge: GKChallenge): void;

	playerIssuedChallengeWasCompletedByFriend?(player: GKPlayer, challenge: GKChallenge, friendPlayer: GKPlayer): void;

	playerWantsToPlayChallenge?(player: GKPlayer, challenge: GKChallenge): void;
}
declare var GKChallengeListener: {

	prototype: GKChallengeListener;
};

/**
 * @since 6.0
 * @deprecated 26.0
 */
declare const enum GKChallengeState {

	Invalid = 0,

	Pending = 1,

	Completed = 2,

	Declined = 3
}

/**
 * @since 10.0
 * @deprecated 12.0
 */
declare class GKCloudPlayer extends GKBasePlayer {

	static alloc(): GKCloudPlayer; // inherited from NSObject

	static getCurrentSignedInPlayerForContainerCompletionHandler(containerName: string | null, handler: (p1: GKCloudPlayer | null, p2: NSError | null) => void): void;

	static new(): GKCloudPlayer; // inherited from NSObject
}

/**
 * @since 10.0
 */
declare const enum GKConnectionState {

	NotConnected = 0,

	Connected = 1
}

/**
 * @since 4.0
 */
declare const enum GKErrorCode {

	Unknown = 1,

	Cancelled = 2,

	CommunicationsFailure = 3,

	UserDenied = 4,

	InvalidCredentials = 5,

	NotAuthenticated = 6,

	AuthenticationInProgress = 7,

	InvalidPlayer = 8,

	ScoreNotSet = 9,

	ParentalControlsBlocked = 10,

	PlayerStatusExceedsMaximumLength = 11,

	PlayerStatusInvalid = 12,

	MatchRequestInvalid = 13,

	Underage = 14,

	GameUnrecognized = 15,

	NotSupported = 16,

	InvalidParameter = 17,

	UnexpectedConnection = 18,

	ChallengeInvalid = 19,

	TurnBasedMatchDataTooLarge = 20,

	TurnBasedTooManySessions = 21,

	TurnBasedInvalidParticipant = 22,

	TurnBasedInvalidTurn = 23,

	TurnBasedInvalidState = 24,

	InvitationsDisabled = 25,

	PlayerPhotoFailure = 26,

	UbiquityContainerUnavailable = 27,

	MatchNotConnected = 28,

	GameSessionRequestInvalid = 29,

	RestrictedToAutomatch = 30,

	APINotAvailable = 31,

	NotAuthorized = 32,

	ConnectionTimeout = 33,

	APIObsolete = 34,

	ICloudUnavailable = 35,

	LockdownMode = 36,

	AppUnlisted = 37,

	DebugMode = 38,

	FriendListDescriptionMissing = 100,

	FriendListRestricted = 101,

	FriendListDenied = 102,

	FriendRequestNotAvailable = 103
}

/**
 * @since 4.0
 */
declare var GKErrorDomain: string;

/**
 * @since 7.0
 */
declare var GKExchangeTimeoutDefault: number;

/**
 * @since 7.0
 */
declare var GKExchangeTimeoutNone: number;

/**
 * @since 4.2
 * @deprecated 10.0
 */
declare class GKFriendRequestComposeViewController extends UINavigationController {

	static alloc(): GKFriendRequestComposeViewController; // inherited from NSObject

	static maxNumberOfRecipients(): number;

	static new(): GKFriendRequestComposeViewController; // inherited from NSObject

	/**
	 * @since 4.2
	 * @deprecated 10.0
	 */
	composeViewDelegate: GKFriendRequestComposeViewControllerDelegate | null;

	/**
	 * @since 8.0
	 */
	addRecipientPlayers(players: NSArray<GKPlayer> | GKPlayer[]): void;

	addRecipientsWithEmailAddresses(emailAddresses: NSArray<string> | string[]): void;

	/**
	 * @since 4.2
	 * @deprecated 8.0
	 */
	addRecipientsWithPlayerIDs(playerIDs: NSArray<string> | string[]): void;

	setMessage(message: string | null): void;
}

/**
 * @since 4.2
 * @deprecated 10.0
 */
interface GKFriendRequestComposeViewControllerDelegate {

	/**
	 * @since 4.2
	 * @deprecated 10.0
	 */
	friendRequestComposeViewControllerDidFinish(viewController: GKFriendRequestComposeViewController): void;
}
declare var GKFriendRequestComposeViewControllerDelegate: {

	prototype: GKFriendRequestComposeViewControllerDelegate;
};

/**
 * @since 14.5
 */
declare const enum GKFriendsAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

/**
 * @since 26.0
 */
declare class GKGameActivity extends NSObject {

	static alloc(): GKGameActivity; // inherited from NSObject

	static checkPendingGameActivityExistenceWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	static isValidPartyCode(partyCode: string): boolean;

	static new(): GKGameActivity; // inherited from NSObject

	static startWithDefinitionError(activityDefinition: GKGameActivityDefinition, error?: interop.Reference<NSError>): GKGameActivity | null;

	static startWithDefinitionPartyCodeError(activityDefinition: GKGameActivityDefinition, partyCode: string, error?: interop.Reference<NSError>): GKGameActivity | null;

	readonly achievements: NSSet<GKAchievement>;

	readonly activityDefinition: GKGameActivityDefinition;

	readonly creationDate: Date;

	readonly duration: number;

	readonly endDate: Date | null;

	readonly identifier: string;

	readonly lastResumeDate: Date | null;

	readonly leaderboardScores: NSSet<GKLeaderboardScore>;

	readonly partyCode: string | null;

	readonly partyURL: NSURL | null;

	properties: NSDictionary<string, string>;

	readonly startDate: Date | null;

	readonly state: GKGameActivityState;

	static readonly validPartyCodeAlphabet: NSArray<string>;

	constructor(o: { definition: GKGameActivityDefinition; });

	end(): void;

	findMatchWithCompletionHandler(completionHandler: (p1: GKMatch | null, p2: NSError | null) => void): void;

	findPlayersForHostedMatchWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void): void;

	getProgressOnAchievement(achievement: GKAchievement): number;

	getScoreOnLeaderboard(leaderboard: GKLeaderboard): GKLeaderboardScore | null;

	initWithDefinition(activityDefinition: GKGameActivityDefinition): this;

	makeMatchRequest(): GKMatchRequest | null;

	pause(): void;

	removeAchievements(achievements: NSArray<GKAchievement> | GKAchievement[]): void;

	removeScoresFromLeaderboards(leaderboards: NSArray<GKLeaderboard> | GKLeaderboard[]): void;

	resume(): void;

	setAchievementCompleted(achievement: GKAchievement): void;

	setProgressOnAchievementToPercentComplete(achievement: GKAchievement, percentComplete: number): void;

	setScoreOnLeaderboardToScore(leaderboard: GKLeaderboard, score: number): void;

	setScoreOnLeaderboardToScoreContext(leaderboard: GKLeaderboard, score: number, context: number): void;

	start(): void;
}

/**
 * @since 26.0
 */
declare class GKGameActivityDefinition extends NSObject {

	static alloc(): GKGameActivityDefinition; // inherited from NSObject

	static loadGameActivityDefinitionsWithCompletionHandler(completionHandler: (p1: NSArray<GKGameActivityDefinition> | null, p2: NSError | null) => void): void;

	static loadGameActivityDefinitionsWithIDsCompletionHandler(activityDefinitionIDs: NSArray<string> | string[] | null, completionHandler: (p1: NSArray<GKGameActivityDefinition> | null, p2: NSError | null) => void): void;

	static new(): GKGameActivityDefinition; // inherited from NSObject

	readonly defaultProperties: NSDictionary<string, string>;

	readonly details: string | null;

	readonly fallbackURL: NSURL | null;

	readonly groupIdentifier: string | null;

	readonly identifier: string;

	readonly maxPlayers: number | null;

	readonly minPlayers: number | null;

	readonly playStyle: GKGameActivityPlayStyle;

	readonly releaseState: GKReleaseState;

	readonly supportsPartyCode: boolean;

	readonly supportsUnlimitedPlayers: boolean;

	readonly title: string;

	loadAchievementDescriptionsWithCompletionHandler(completionHandler: (p1: NSArray<GKAchievementDescription> | null, p2: NSError | null) => void): void;

	loadImageWithCompletionHandler(completionHandler: (p1: UIImage, p2: NSError | null) => void): void;

	loadLeaderboardsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboard> | null, p2: NSError | null) => void): void;
}

/**
 * @since 26.0
 */
interface GKGameActivityListener {

	playerWantsToPlayGameActivityCompletionHandler?(player: GKPlayer, activity: GKGameActivity, completionHandler: (p1: boolean) => void): void;
}
declare var GKGameActivityListener: {

	prototype: GKGameActivityListener;
};

/**
 * @since 26.0
 */
declare const enum GKGameActivityPlayStyle {

	Unspecified = 0,

	Synchronous = 1,

	Asynchronous = 2
}

/**
 * @since 26.0
 */
declare const enum GKGameActivityState {

	Initialized = 0,

	Active = 1,

	Paused = 2,

	Ended = 4
}

/**
 * @since 6.0
 * @deprecated 26.0
 */
interface GKGameCenterControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 6.0
	 */
	gameCenterViewControllerDidFinish(gameCenterViewController: GKGameCenterViewController): void;
}
declare var GKGameCenterControllerDelegate: {

	prototype: GKGameCenterControllerDelegate;
};

/**
 * @since 6.0
 * @deprecated 26.0
 */
declare class GKGameCenterViewController extends UINavigationController {

	static alloc(): GKGameCenterViewController; // inherited from NSObject

	static new(): GKGameCenterViewController; // inherited from NSObject

	gameCenterDelegate: GKGameCenterControllerDelegate | null;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	leaderboardCategory: string | null;

	/**
	 * @since 7.0
	 * @deprecated 14.0
	 */
	leaderboardIdentifier: string | null;

	/**
	 * @since 4.1
	 * @deprecated 14.0
	 */
	leaderboardTimeScope: GKLeaderboardTimeScope;

	/**
	 * @since 6.0
	 * @deprecated 14.0
	 */
	viewState: GKGameCenterViewControllerState;

	/**
	 * @since 14.0
	 */
	constructor(o: { achievementID: string; });

	/**
	 * @since 14.0
	 */
	constructor(o: { leaderboardID: string; playerScope: GKLeaderboardPlayerScope; timeScope: GKLeaderboardTimeScope; });

	/**
	 * @since 14.0
	 */
	constructor(o: { leaderboard: GKLeaderboard; playerScope: GKLeaderboardPlayerScope; });

	/**
	 * @since 18.0
	 */
	constructor(o: { leaderboardSetID: string; });

	/**
	 * @since 18.0
	 */
	constructor(o: { player: GKPlayer; });

	/**
	 * @since 14.0
	 */
	constructor(o: { state: GKGameCenterViewControllerState; });

	/**
	 * @since 14.0
	 */
	initWithAchievementID(achievementID: string): this;

	/**
	 * @since 14.0
	 */
	initWithLeaderboardIDPlayerScopeTimeScope(leaderboardID: string, playerScope: GKLeaderboardPlayerScope, timeScope: GKLeaderboardTimeScope): this;

	/**
	 * @since 14.0
	 */
	initWithLeaderboardPlayerScope(leaderboard: GKLeaderboard, playerScope: GKLeaderboardPlayerScope): this;

	/**
	 * @since 18.0
	 */
	initWithLeaderboardSetID(leaderboardSetID: string): this;

	/**
	 * @since 18.0
	 */
	initWithPlayer(player: GKPlayer): this;

	/**
	 * @since 14.0
	 */
	initWithState(state: GKGameCenterViewControllerState): this;
}

/**
 * @since 6.0
 */
declare const enum GKGameCenterViewControllerState {

	Default = -1,

	Leaderboards = 0,

	Achievements = 1,

	Challenges = 2,

	LocalPlayerProfile = 3,

	Dashboard = 4,

	LocalPlayerFriendsList = 5
}

/**
 * @since 10.0
 * @deprecated 12.0
 */
declare class GKGameSession extends NSObject {

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	static addEventListener(listener: NSObject & GKGameSessionEventListener): void;

	static alloc(): GKGameSession; // inherited from NSObject

	static createSessionInContainerWithTitleMaxConnectedPlayersCompletionHandler(containerName: string | null, title: string, maxPlayers: number, completionHandler: (p1: GKGameSession | null, p2: NSError | null) => void): void;

	static loadSessionWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: GKGameSession | null, p2: NSError | null) => void): void;

	static loadSessionsInContainerCompletionHandler(containerName: string | null, completionHandler: (p1: NSArray<GKGameSession> | null, p2: NSError | null) => void): void;

	static new(): GKGameSession; // inherited from NSObject

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	static removeEventListener(listener: NSObject & GKGameSessionEventListener): void;

	static removeSessionWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: NSError | null) => void): void;

	readonly badgedPlayers: NSArray<GKCloudPlayer>;

	readonly identifier: string;

	readonly lastModifiedDate: Date;

	readonly lastModifiedPlayer: GKCloudPlayer;

	readonly maxNumberOfConnectedPlayers: number;

	readonly owner: GKCloudPlayer;

	readonly players: NSArray<GKCloudPlayer>;

	readonly title: string;

	clearBadgeForPlayersCompletionHandler(players: NSArray<GKCloudPlayer> | GKCloudPlayer[], completionHandler: (p1: NSError | null) => void): void;

	getShareURLWithCompletionHandler(completionHandler: (p1: NSURL | null, p2: NSError | null) => void): void;

	loadDataWithCompletionHandler(completionHandler: (p1: NSData | null, p2: NSError | null) => void): void;

	playersWithConnectionState(state: GKConnectionState): NSArray<GKCloudPlayer>;

	saveDataCompletionHandler(data: NSData, completionHandler: (p1: NSData | null, p2: NSError | null) => void): void;

	sendDataWithTransportTypeCompletionHandler(data: NSData, transport: GKTransportType, completionHandler: (p1: NSError | null) => void): void;

	sendMessageWithLocalizedFormatKeyArgumentsDataToPlayersBadgePlayersCompletionHandler(key: string, _arguments: NSArray<string> | string[], data: NSData | null, players: NSArray<GKCloudPlayer> | GKCloudPlayer[], badgePlayers: boolean, completionHandler: (p1: NSError | null) => void): void;

	setConnectionStateCompletionHandler(state: GKConnectionState, completionHandler: (p1: NSError | null) => void): void;
}

/**
 * @since 10.0
 * @deprecated 12.0
 */
declare const enum GKGameSessionErrorCode {

	Unknown = 1,

	NotAuthenticated = 2,

	SessionConflict = 3,

	SessionNotShared = 4,

	ConnectionCancelledByUser = 5,

	ConnectionFailed = 6,

	SessionHasMaxConnectedPlayers = 7,

	SendDataNotConnected = 8,

	SendDataNoRecipients = 9,

	SendDataNotReachable = 10,

	SendRateLimitReached = 11,

	BadContainer = 12,

	CloudQuotaExceeded = 13,

	NetworkFailure = 14,

	CloudDriveDisabled = 15,

	InvalidSession = 16
}

/**
 * @since 10.0
 * @deprecated 12.0
 */
declare var GKGameSessionErrorDomain: string;

/**
 * @since 10.0
 * @deprecated 12.0
 */
interface GKGameSessionEventListener extends NSObjectProtocol {

	sessionDidAddPlayer?(session: GKGameSession, player: GKCloudPlayer): void;

	sessionDidReceiveDataFromPlayer?(session: GKGameSession, data: NSData, player: GKCloudPlayer): void;

	sessionDidReceiveMessageWithDataFromPlayer?(session: GKGameSession, message: string, data: NSData, player: GKCloudPlayer): void;

	sessionDidRemovePlayer?(session: GKGameSession, player: GKCloudPlayer): void;

	sessionPlayerDidChangeConnectionState?(session: GKGameSession, player: GKCloudPlayer, newState: GKConnectionState): void;

	sessionPlayerDidSaveData?(session: GKGameSession, player: GKCloudPlayer, data: NSData): void;
}
declare var GKGameSessionEventListener: {

	prototype: GKGameSessionEventListener;
};

/**
 * @since 4.1
 */
declare class GKInvite extends NSObject {

	static alloc(): GKInvite; // inherited from NSObject

	static new(): GKInvite; // inherited from NSObject

	readonly hosted: boolean;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	readonly inviter: string;

	/**
	 * @since 6.0
	 */
	readonly playerAttributes: number;

	/**
	 * @since 6.0
	 */
	readonly playerGroup: number;

	/**
	 * @since 8.0
	 */
	readonly sender: GKPlayer;
}

/**
 * @since 7.0
 */
interface GKInviteEventListener {

	/**
	 * @since 7.0
	 */
	playerDidAcceptInvite?(player: GKPlayer, invite: GKInvite): void;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	playerDidRequestMatchWithPlayers?(player: GKPlayer, playerIDsToInvite: NSArray<string> | string[]): void;

	/**
	 * @since 8.0
	 */
	playerDidRequestMatchWithRecipients?(player: GKPlayer, recipientPlayers: NSArray<GKPlayer> | GKPlayer[]): void;
}
declare var GKInviteEventListener: {

	prototype: GKInviteEventListener;
};

/**
 * @since 8.0
 */
declare const enum GKInviteRecipientResponse {

	InviteRecipientResponseAccepted = 0,

	InviteRecipientResponseDeclined = 1,

	InviteRecipientResponseFailed = 2,

	InviteRecipientResponseIncompatible = 3,

	InviteRecipientResponseUnableToConnect = 4,

	InviteRecipientResponseNoAnswer = 5,

	InviteeResponseAccepted = 0,

	InviteeResponseDeclined = 1,

	InviteeResponseFailed = 2,

	InviteeResponseIncompatible = 3,

	InviteeResponseUnableToConnect = 4,

	InviteeResponseNoAnswer = 5
}

/**
 * @since 4.1
 */
declare class GKLeaderboard extends NSObject {

	static alloc(): GKLeaderboard; // inherited from NSObject

	/**
	 * @since 4.1
	 * @deprecated 6.0
	 */
	static loadCategoriesWithCompletionHandler(completionHandler: (p1: NSArray<string> | null, p2: NSArray<string> | null, p3: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 * @deprecated 14.0
	 */
	static loadLeaderboardsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboard> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	static loadLeaderboardsWithIDsCompletionHandler(leaderboardIDs: NSArray<string> | string[] | null, completionHandler: (p1: NSArray<GKLeaderboard> | null, p2: NSError | null) => void): void;

	static new(): GKLeaderboard; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	static setDefaultLeaderboardWithCompletionHandler(leaderboardIdentifier: string | null, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	static submitScoreContextPlayerLeaderboardIDsCompletionHandler(score: number, context: number, player: GKPlayer, leaderboardIDs: NSArray<string> | string[], completionHandler: (p1: NSError | null) => void): void;

	/**
	 * @since 26.0
	 */
	readonly activityIdentifier: string;

	/**
	 * @since 26.0
	 */
	readonly activityProperties: NSDictionary<string, string>;

	/**
	 * @since 14.0
	 */
	readonly baseLeaderboardID: string;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	category: string | null;

	/**
	 * @since 14.0
	 */
	readonly duration: number;

	/**
	 * @since 6.0
	 */
	readonly groupIdentifier: string | null;

	/**
	 * @since 7.0
	 * @deprecated 14.0
	 */
	identifier: string | null;

	/**
	 * @since 26.0
	 */
	readonly isHidden: boolean;

	/**
	 * @since 26.0
	 */
	readonly leaderboardDescription: string;

	/**
	 * @since 4.1
	 * @deprecated 14.0
	 */
	readonly loading: boolean;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	readonly localPlayerScore: GKScore | null;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	readonly maxRange: number;

	/**
	 * @since 14.0
	 */
	readonly nextStartDate: Date | null;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	playerScope: GKLeaderboardPlayerScope;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	range: NSRange;

	/**
	 * @since 26.0
	 */
	readonly releaseState: GKReleaseState;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	readonly scores: NSArray<GKScore> | null;

	/**
	 * @since 14.0
	 */
	readonly startDate: Date | null;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	timeScope: GKLeaderboardTimeScope;

	readonly title: string | null;

	/**
	 * @since 14.0
	 */
	readonly type: GKLeaderboardType;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	constructor(o: { playerIDs: NSArray<string> | string[] | null; });

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	constructor(o: { players: NSArray<GKPlayer> | GKPlayer[]; });

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	initWithPlayerIDs(playerIDs: NSArray<string> | string[] | null): this;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	initWithPlayers(players: NSArray<GKPlayer> | GKPlayer[]): this;

	/**
	 * @since 14.0
	 */
	loadEntriesForPlayerScopeTimeScopeRangeCompletionHandler(playerScope: GKLeaderboardPlayerScope, timeScope: GKLeaderboardTimeScope, range: NSRange, completionHandler: (p1: GKLeaderboardEntry, p2: NSArray<GKLeaderboardEntry> | null, p3: number, p4: NSError | null) => void): void;

	/**
	 * @since 14.0
	 */
	loadEntriesForPlayersTimeScopeCompletionHandler(players: NSArray<GKPlayer> | GKPlayer[], timeScope: GKLeaderboardTimeScope, completionHandler: (p1: GKLeaderboardEntry, p2: NSArray<GKLeaderboardEntry> | null, p3: NSError | null) => void): void;

	/**
	 * @since 7.0
	 */
	loadImageWithCompletionHandler(completionHandler: (p1: UIImage | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	loadPreviousOccurrenceWithCompletionHandler(completionHandler: (p1: GKLeaderboard, p2: NSError | null) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 14.0
	 */
	loadScoresWithCompletionHandler(completionHandler: (p1: NSArray<GKScore> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	submitScoreContextPlayerCompletionHandler(score: number, context: number, player: GKPlayer, completionHandler: (p1: NSError | null) => void): void;
}

/**
 * @since 14.0
 */
declare class GKLeaderboardEntry extends NSObject {

	static alloc(): GKLeaderboardEntry; // inherited from NSObject

	static new(): GKLeaderboardEntry; // inherited from NSObject

	readonly context: number;

	readonly date: Date;

	readonly formattedScore: string;

	readonly player: GKPlayer;

	readonly rank: number;

	readonly score: number;

	/**
	 * @since 17.0
	 * @deprecated 26.0
	 */
	challengeComposeControllerWithMessagePlayersCompletion(message: string | null, players: NSArray<GKPlayer> | GKPlayer[] | null, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<GKPlayer> | null) => void | null): UIViewController;

	/**
	 * @since 14.0
	 * @deprecated 17.0
	 */
	challengeComposeControllerWithMessagePlayersCompletionHandler(message: string | null, players: NSArray<GKPlayer> | GKPlayer[] | null, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string> | null) => void | null): UIViewController;
}

/**
 * @since 4.0
 */
declare const enum GKLeaderboardPlayerScope {

	Global = 0,

	FriendsOnly = 1
}

/**
 * @since 14.0
 */
declare class GKLeaderboardScore extends NSObject {

	static alloc(): GKLeaderboardScore; // inherited from NSObject

	static new(): GKLeaderboardScore; // inherited from NSObject

	context: number;

	leaderboardID: string;

	player: GKPlayer;

	value: number;
}

/**
 * @since 7.0
 */
declare class GKLeaderboardSet extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKLeaderboardSet; // inherited from NSObject

	static loadLeaderboardSetsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboardSet> | null, p2: NSError | null) => void | null): void;

	static new(): GKLeaderboardSet; // inherited from NSObject

	readonly groupIdentifier: string | null;

	identifier: string | null;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 7.0
	 */
	loadImageWithCompletionHandler(completionHandler: (p1: UIImage | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 * @deprecated 14.0
	 */
	loadLeaderboardsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboard> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	loadLeaderboardsWithHandler(handler: (p1: NSArray<GKLeaderboard> | null, p2: NSError | null) => void): void;
}

/**
 * @since 4.0
 */
declare const enum GKLeaderboardTimeScope {

	Today = 0,

	Week = 1,

	AllTime = 2
}

/**
 * @since 14.0
 */
declare const enum GKLeaderboardType {

	Classic = 0,

	Recurring = 1
}

/**
 * @since 4.1
 * @deprecated 7.0
 */
declare class GKLeaderboardViewController extends GKGameCenterViewController {

	static alloc(): GKLeaderboardViewController; // inherited from NSObject

	static new(): GKLeaderboardViewController; // inherited from NSObject

	category: string;

	leaderboardDelegate: GKLeaderboardViewControllerDelegate;

	timeScope: GKLeaderboardTimeScope;
}

/**
 * @since 4.1
 * @deprecated 7.0
 */
interface GKLeaderboardViewControllerDelegate extends NSObjectProtocol {

	leaderboardViewControllerDidFinish(viewController: GKLeaderboardViewController): void;
}
declare var GKLeaderboardViewControllerDelegate: {

	prototype: GKLeaderboardViewControllerDelegate;
};

/**
 * @since 4.1
 */
declare class GKLocalPlayer extends GKPlayer implements GKSavedGameListener {

	static alloc(): GKLocalPlayer; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static anonymousGuestPlayerWithIdentifier(guestIdentifier: string): GKLocalPlayer; // inherited from GKPlayer

	static new(): GKLocalPlayer; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	authenticateHandler: (p1: UIViewController | null, p2: NSError | null) => void | null;

	readonly authenticated: boolean;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	readonly friends: NSArray<string> | null;

	/**
	 * @since 15.0
	 */
	readonly isPresentingFriendRequestViewController: boolean;

	/**
	 * @since 13.0
	 */
	readonly multiplayerGamingRestricted: boolean;

	/**
	 * @since 14.0
	 */
	readonly personalizedCommunicationRestricted: boolean;

	readonly underage: boolean;

	/**
	 * @since 13.0
	 */
	static readonly local: GKLocalPlayer;

	static readonly localPlayer: GKLocalPlayer;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 4.1
	 * @deprecated 6.0
	 */
	authenticateWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 8.0
	 */
	deleteSavedGamesWithNameCompletionHandler(name: string, handler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 13.5
	 */
	fetchItemsForIdentityVerificationSignature(completionHandler: (p1: NSURL | null, p2: NSData | null, p3: NSData | null, p4: number, p5: NSError | null) => void | null): void;

	/**
	 * @since 8.0
	 */
	fetchSavedGamesWithCompletionHandler(handler: (p1: NSArray<GKSavedGame> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 * @deprecated 13.5
	 */
	generateIdentityVerificationSignatureWithCompletionHandler(completionHandler: (p1: NSURL | null, p2: NSData | null, p3: NSData | null, p4: number, p5: NSError | null) => void | null): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadChallengableFriendsWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	loadDefaultLeaderboardCategoryIDWithCompletionHandler(completionHandler: (p1: string | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 * @deprecated 26.2
	 */
	loadDefaultLeaderboardIdentifierWithCompletionHandler(completionHandler: (p1: string | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	loadFriendPlayersWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.5
	 */
	loadFriends(completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void): void;

	/**
	 * @since 14.5
	 */
	loadFriendsAuthorizationStatus(completionHandler: (p1: GKFriendsAuthorizationStatus, p2: NSError | null) => void): void;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	loadFriendsWithCompletionHandler(completionHandler: (p1: NSArray<string> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.5
	 */
	loadFriendsWithIdentifiersCompletionHandler(identifiers: NSArray<string> | string[], completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void): void;

	/**
	 * @since 10.0
	 */
	loadRecentPlayersWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void | null): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	playerDidModifySavedGame(player: GKPlayer, savedGame: GKSavedGame): void;

	playerHasConflictingSavedGames(player: GKPlayer, savedGames: NSArray<GKSavedGame> | GKSavedGame[]): void;

	/**
	 * @since 15.0
	 */
	presentFriendRequestCreatorFromViewControllerError(viewController: UIViewController, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 7.0
	 */
	registerListener(listener: GKLocalPlayerListener): void;

	/**
	 * @since 8.0
	 */
	resolveConflictingSavedGamesWithDataCompletionHandler(conflictingSavedGames: NSArray<GKSavedGame> | GKSavedGame[], data: NSData, handler: (p1: NSArray<GKSavedGame> | null, p2: NSError | null) => void | null): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 8.0
	 */
	saveGameDataWithNameCompletionHandler(data: NSData, name: string, handler: (p1: GKSavedGame | null, p2: NSError | null) => void | null): void;

	self(): this;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	setDefaultLeaderboardCategoryIDCompletionHandler(categoryID: string | null, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 * @deprecated 26.2
	 */
	setDefaultLeaderboardIdentifierCompletionHandler(leaderboardIdentifier: string, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 */
	unregisterAllListeners(): void;

	/**
	 * @since 7.0
	 */
	unregisterListener(listener: GKLocalPlayerListener): void;
}

/**
 * @since 7.0
 */
interface GKLocalPlayerListener extends GKChallengeListener, GKGameActivityListener, GKInviteEventListener, GKSavedGameListener, GKTurnBasedEventListener {
}
declare var GKLocalPlayerListener: {

	prototype: GKLocalPlayerListener;
};

/**
 * @since 4.1
 */
declare class GKMatch extends NSObject {

	static alloc(): GKMatch; // inherited from NSObject

	static new(): GKMatch; // inherited from NSObject

	delegate: GKMatchDelegate | null;

	readonly expectedPlayerCount: number;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	readonly playerIDs: NSArray<string> | null;

	/**
	 * @since 17.2
	 */
	readonly playerProperties: NSDictionary<GKPlayer, NSDictionary<string, any>> | null;

	/**
	 * @since 8.0
	 */
	readonly players: NSArray<GKPlayer>;

	/**
	 * @since 17.2
	 */
	readonly properties: NSDictionary<string, any> | null;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	chooseBestHostPlayerWithCompletionHandler(completionHandler: (p1: string | null) => void): void;

	/**
	 * @since 8.0
	 */
	chooseBestHostingPlayerWithCompletionHandler(completionHandler: (p1: GKPlayer | null) => void): void;

	disconnect(): void;

	/**
	 * @since 6.0
	 */
	rematchWithCompletionHandler(completionHandler: (p1: GKMatch | null, p2: NSError | null) => void | null): void;

	sendDataToAllPlayersWithDataModeError(data: NSData, mode: GKMatchSendDataMode, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 8.0
	 */
	sendDataToPlayersDataModeError(data: NSData, players: NSArray<GKPlayer> | GKPlayer[], mode: GKMatchSendDataMode, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	sendDataToPlayersWithDataModeError(data: NSData, playerIDs: NSArray<string> | string[], mode: GKMatchSendDataMode, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 4.1
	 * @deprecated 18.0
	 */
	voiceChatWithName(name: string): GKVoiceChat | null;
}

/**
 * @since 4.0
 */
interface GKMatchDelegate extends NSObjectProtocol {

	/**
	 * @since 4.1
	 */
	matchDidFailWithError?(match: GKMatch, error: NSError | null): void;

	/**
	 * @since 9.0
	 */
	matchDidReceiveDataForRecipientFromRemotePlayer?(match: GKMatch, data: NSData, recipient: GKPlayer, player: GKPlayer): void;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	matchDidReceiveDataFromPlayer?(match: GKMatch, data: NSData, playerID: string): void;

	/**
	 * @since 8.0
	 */
	matchDidReceiveDataFromRemotePlayer?(match: GKMatch, data: NSData, player: GKPlayer): void;

	/**
	 * @since 4.1
	 */
	matchPlayerDidChangeConnectionState?(match: GKMatch, player: GKPlayer, state: GKPlayerConnectionState): void;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	matchPlayerDidChangeState?(match: GKMatch, playerID: string, state: GKPlayerConnectionState): void;

	/**
	 * @since 8.0
	 */
	matchShouldReinviteDisconnectedPlayer?(match: GKMatch, player: GKPlayer): boolean;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	matchShouldReinvitePlayer?(match: GKMatch, playerID: string): boolean;
}
declare var GKMatchDelegate: {

	prototype: GKMatchDelegate;
};

/**
 * @since 4.1
 */
declare class GKMatchRequest extends NSObject {

	static alloc(): GKMatchRequest; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static maxPlayersAllowedForMatchOfType(matchType: GKMatchType): number;

	static new(): GKMatchRequest; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	defaultNumberOfPlayers: number;

	/**
	 * @since 6.0
	 */
	inviteMessage: string | null;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	inviteeResponseHandler: (p1: string, p2: GKInviteRecipientResponse) => void | null;

	maxPlayers: number;

	minPlayers: number;

	playerAttributes: number;

	playerGroup: number;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	playersToInvite: NSArray<string> | null;

	/**
	 * @since 17.2
	 */
	properties: NSDictionary<string, any> | null;

	/**
	 * @since 17.2
	 */
	queueName: string | null;

	/**
	 * @since 17.2
	 */
	recipientProperties: NSDictionary<GKPlayer, NSDictionary<string, any>> | null;

	/**
	 * @since 8.0
	 */
	recipientResponseHandler: (p1: GKPlayer, p2: GKInviteRecipientResponse) => void | null;

	/**
	 * @since 8.0
	 */
	recipients: NSArray<GKPlayer> | null;

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	restrictToAutomatch: boolean;
}

/**
 * @since 4.0
 */
declare const enum GKMatchSendDataMode {

	Reliable = 0,

	Unreliable = 1
}

/**
 * @since 6.0
 */
declare const enum GKMatchType {

	PeerToPeer = 0,

	Hosted = 1,

	TurnBased = 2
}

/**
 * @since 17.2
 */
declare class GKMatchedPlayers extends NSObject {

	static alloc(): GKMatchedPlayers; // inherited from NSObject

	static new(): GKMatchedPlayers; // inherited from NSObject

	readonly playerProperties: NSDictionary<GKPlayer, NSDictionary<string, any>> | null;

	readonly players: NSArray<GKPlayer>;

	readonly properties: NSDictionary<string, any> | null;
}

/**
 * @since 4.1
 */
declare class GKMatchmaker extends NSObject {

	static alloc(): GKMatchmaker; // inherited from NSObject

	static new(): GKMatchmaker; // inherited from NSObject

	static sharedMatchmaker(): GKMatchmaker;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	inviteHandler: (p1: GKInvite, p2: NSArray<any> | null) => void | null;

	addPlayersToMatchMatchRequestCompletionHandler(match: GKMatch, matchRequest: GKMatchRequest, completionHandler: (p1: NSError | null) => void | null): void;

	cancel(): void;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	cancelInviteToPlayer(playerID: string): void;

	/**
	 * @since 8.0
	 */
	cancelPendingInviteToPlayer(player: GKPlayer): void;

	findMatchForRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: GKMatch | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 17.2
	 */
	findMatchedPlayersWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: GKMatchedPlayers | null, p2: NSError | null) => void): void;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	findPlayersForHostedMatchRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: NSArray<string> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 8.0
	 */
	findPlayersForHostedRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 */
	finishMatchmakingForMatch(match: GKMatch): void;

	/**
	 * @since 6.0
	 */
	matchForInviteCompletionHandler(invite: GKInvite, completionHandler: (p1: GKMatch | null, p2: NSError | null) => void | null): void;

	queryActivityWithCompletionHandler(completionHandler: (p1: number, p2: NSError | null) => void | null): void;

	queryPlayerGroupActivityWithCompletionHandler(playerGroup: number, completionHandler: (p1: number, p2: NSError | null) => void | null): void;

	/**
	 * @since 17.2
	 */
	queryQueueActivityWithCompletionHandler(queueName: string, completionHandler: (p1: number, p2: NSError | null) => void | null): void;

	/**
	 * @since 8.0
	 */
	startBrowsingForNearbyPlayersWithHandler(reachableHandler: (p1: GKPlayer, p2: boolean) => void | null): void;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	startBrowsingForNearbyPlayersWithReachableHandler(reachableHandler: (p1: string, p2: boolean) => void | null): void;

	/**
	 * @since 16.2
	 */
	startGroupActivityWithPlayerHandler(handler: (p1: GKPlayer) => void): void;

	/**
	 * @since 6.0
	 */
	stopBrowsingForNearbyPlayers(): void;

	/**
	 * @since 16.2
	 */
	stopGroupActivity(): void;
}

/**
 * @since 4.1
 */
declare class GKMatchmakerViewController extends UINavigationController {

	static alloc(): GKMatchmakerViewController; // inherited from NSObject

	static new(): GKMatchmakerViewController; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	canStartWithMinimumPlayers: boolean;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	defaultInvitationMessage: string | null;

	hosted: boolean;

	readonly matchRequest: GKMatchRequest;

	matchmakerDelegate: GKMatchmakerViewControllerDelegate | null;

	/**
	 * @since 14.0
	 */
	matchmakingMode: GKMatchmakingMode;

	constructor(o: { invite: GKInvite; });

	constructor(o: { matchRequest: GKMatchRequest; });

	/**
	 * @since 5.0
	 */
	addPlayersToMatch(match: GKMatch): void;

	initWithInvite(invite: GKInvite): this;

	initWithMatchRequest(request: GKMatchRequest): this;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	setHostedPlayerConnected(playerID: string, connected: boolean): void;

	/**
	 * @since 8.0
	 */
	setHostedPlayerDidConnect(player: GKPlayer, connected: boolean): void;

	/**
	 * @since 4.1
	 * @deprecated 5.0
	 */
	setHostedPlayerReady(playerID: string): void;
}

/**
 * @since 4.0
 */
interface GKMatchmakerViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 4.1
	 */
	matchmakerViewControllerDidFailWithError(viewController: GKMatchmakerViewController, error: NSError): void;

	/**
	 * @since 8.0
	 */
	matchmakerViewControllerDidFindHostedPlayers?(viewController: GKMatchmakerViewController, players: NSArray<GKPlayer> | GKPlayer[]): void;

	/**
	 * @since 4.1
	 */
	matchmakerViewControllerDidFindMatch?(viewController: GKMatchmakerViewController, match: GKMatch): void;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	matchmakerViewControllerDidFindPlayers?(viewController: GKMatchmakerViewController, playerIDs: NSArray<string> | string[]): void;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	matchmakerViewControllerDidReceiveAcceptFromHostedPlayer?(viewController: GKMatchmakerViewController, playerID: string): void;

	/**
	 * @since 17.2
	 */
	matchmakerViewControllerGetMatchPropertiesForRecipientWithCompletionHandler?(viewController: GKMatchmakerViewController, recipient: GKPlayer, completionHandler: (p1: NSDictionary<string, any>) => void): void;

	/**
	 * @since 8.0
	 */
	matchmakerViewControllerHostedPlayerDidAccept?(viewController: GKMatchmakerViewController, player: GKPlayer): void;

	/**
	 * @since 4.1
	 */
	matchmakerViewControllerWasCancelled(viewController: GKMatchmakerViewController): void;
}
declare var GKMatchmakerViewControllerDelegate: {

	prototype: GKMatchmakerViewControllerDelegate;
};

/**
 * @since 14.0
 */
declare const enum GKMatchmakingMode {

	Default = 0,

	NearbyOnly = 1,

	AutomatchOnly = 2,

	InviteOnly = 3
}

/**
 * @since 5.0
 * @deprecated 17.0
 */
declare class GKNotificationBanner extends NSObject {

	static alloc(): GKNotificationBanner; // inherited from NSObject

	static new(): GKNotificationBanner; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 16.1
	 */
	static showBannerWithTitleMessageCompletionHandler(title: string | null, message: string | null, completionHandler: () => void | null): void;

	/**
	 * @since 5.0
	 * @deprecated 16.1
	 */
	static showBannerWithTitleMessageDurationCompletionHandler(title: string | null, message: string | null, duration: number, completionHandler: () => void | null): void;
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare const enum GKPeerConnectionState {

	StateAvailable = 0,

	StateUnavailable = 1,

	StateConnected = 2,

	StateDisconnected = 3,

	StateConnecting = 4,

	StateConnectedRelay = 5
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare const enum GKPeerPickerConnectionType {

	Online = 1,

	Nearby = 2
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare class GKPeerPickerController extends NSObject {

	static alloc(): GKPeerPickerController; // inherited from NSObject

	static new(): GKPeerPickerController; // inherited from NSObject

	connectionTypesMask: GKPeerPickerConnectionType;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	delegate: GKPeerPickerControllerDelegate | null;

	readonly visible: boolean;

	dismiss(): void;

	show(): void;
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
interface GKPeerPickerControllerDelegate extends NSObjectProtocol {

	peerPickerControllerDidCancel?(picker: GKPeerPickerController): void;

	peerPickerControllerDidConnectPeerToSession?(picker: GKPeerPickerController, peerID: string, session: GKSession): void;

	peerPickerControllerDidSelectConnectionType?(picker: GKPeerPickerController, type: GKPeerPickerConnectionType): void;

	peerPickerControllerSessionForConnectionType?(picker: GKPeerPickerController, type: GKPeerPickerConnectionType): GKSession;
}
declare var GKPeerPickerControllerDelegate: {

	prototype: GKPeerPickerControllerDelegate;
};

/**
 * @since 5.0
 */
declare const enum GKPhotoSize {

	Small = 0,

	Normal = 1
}

/**
 * @since 4.1
 */
declare class GKPlayer extends GKBasePlayer {

	static alloc(): GKPlayer; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static anonymousGuestPlayerWithIdentifier(guestIdentifier: string): GKPlayer;

	/**
	 * @since 4.1
	 * @deprecated 14.5
	 */
	static loadPlayersForIdentifiersWithCompletionHandler(identifiers: NSArray<string> | string[], completionHandler: (p1: NSArray<GKPlayer> | null, p2: NSError | null) => void | null): void;

	static new(): GKPlayer; // inherited from NSObject

	readonly alias: string;

	/**
	 * @since 12.4
	 */
	readonly gamePlayerID: string;

	/**
	 * @since 9.0
	 */
	readonly guestIdentifier: string | null;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	readonly isFriend: boolean;

	/**
	 * @since 14.0
	 */
	readonly isInvitable: boolean;

	/**
	 * @since 12.4
	 */
	readonly teamPlayerID: string;

	/**
	 * @since 5.0
	 */
	loadPhotoForSizeWithCompletionHandler(size: GKPhotoSize, completionHandler: (p1: UIImage | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 13.0
	 */
	scopedIDsArePersistent(): boolean;
}

/**
 * @since 4.1
 */
declare var GKPlayerAuthenticationDidChangeNotificationName: string;

/**
 * @since 4.0
 */
declare const enum GKPlayerConnectionState {

	StateUnknown = 0,

	StateConnected = 1,

	StateDisconnected = 2
}

/**
 * @since 4.0
 */
declare var GKPlayerDidChangeNotificationName: string;

/**
 * @since 14.0
 */
declare var GKPlayerIDNoLongerAvailable: string;

/**
 * @since 18.4
 */
declare const enum GKReleaseState {

	Unknown = 0,

	Released = 1,

	Prereleased = 2
}

/**
 * @since 8.0
 */
declare class GKSavedGame extends NSObject implements NSCopying {

	static alloc(): GKSavedGame; // inherited from NSObject

	static new(): GKSavedGame; // inherited from NSObject

	readonly deviceName: string | null;

	readonly modificationDate: Date | null;

	readonly name: string | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	loadDataWithCompletionHandler(handler: (p1: NSData | null, p2: NSError | null) => void | null): void;
}

/**
 * @since 8.0
 */
interface GKSavedGameListener extends NSObjectProtocol {

	playerDidModifySavedGame?(player: GKPlayer, savedGame: GKSavedGame): void;

	playerHasConflictingSavedGames?(player: GKPlayer, savedGames: NSArray<GKSavedGame> | GKSavedGame[]): void;
}
declare var GKSavedGameListener: {

	prototype: GKSavedGameListener;
};

/**
 * @since 4.1
 * @deprecated 14.0
 */
declare class GKScore extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKScore; // inherited from NSObject

	static new(): GKScore; // inherited from NSObject

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	static reportLeaderboardScoresWithEligibleChallengesWithCompletionHandler(scores: NSArray<GKLeaderboardScore> | GKLeaderboardScore[], challenges: NSArray<GKChallenge> | GKChallenge[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 * @deprecated 14.0
	 */
	static reportScoresWithCompletionHandler(scores: NSArray<GKScore> | GKScore[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 * @deprecated 14.0
	 */
	static reportScoresWithEligibleChallengesWithCompletionHandler(scores: NSArray<GKScore> | GKScore[], challenges: NSArray<GKChallenge> | GKChallenge[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	category: string | null;

	/**
	 * @since 5.0
	 * @deprecated 14.0
	 */
	context: number;

	readonly date: Date;

	readonly formattedValue: string | null;

	/**
	 * @since 7.0
	 * @deprecated 14.0
	 */
	leaderboardIdentifier: string;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	readonly player: GKPlayer | null;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	readonly playerID: string | null;

	readonly rank: number;

	/**
	 * @since 5.0
	 * @deprecated 14.0
	 */
	shouldSetDefaultLeaderboard: boolean;

	value: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	constructor(o: { category: string | null; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { leaderboardIdentifier: string; });

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	constructor(o: { leaderboardIdentifier: string; forPlayer: string; });

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	constructor(o: { leaderboardIdentifier: string; player: GKPlayer; });

	/**
	 * @since 17.0
	 * @deprecated 26.0
	 */
	challengeComposeControllerWithMessagePlayersCompletion(message: string | null, players: NSArray<GKPlayer> | GKPlayer[] | null, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<GKPlayer> | null) => void | null): UIViewController;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	challengeComposeControllerWithMessagePlayersCompletionHandler(message: string | null, players: NSArray<GKPlayer> | GKPlayer[] | null, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string> | null) => void | null): UIViewController;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	challengeComposeControllerWithPlayersMessageCompletionHandler(playerIDs: NSArray<string> | string[] | null, message: string | null, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string> | null) => void | null): UIViewController | null;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	initWithCategory(category: string | null): this;

	initWithCoder(coder: NSCoder): this;

	initWithLeaderboardIdentifier(identifier: string): this;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	initWithLeaderboardIdentifierForPlayer(identifier: string, playerID: string): this;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	initWithLeaderboardIdentifierPlayer(identifier: string, player: GKPlayer): this;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	issueChallengeToPlayersMessage(playerIDs: NSArray<string> | string[] | null, message: string | null): void;

	/**
	 * @since 4.1
	 * @deprecated 7.0
	 */
	reportScoreWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;
}

/**
 * @since 6.0
 * @deprecated 26.0
 */
declare class GKScoreChallenge extends GKChallenge {

	static alloc(): GKScoreChallenge; // inherited from NSObject

	static new(): GKScoreChallenge; // inherited from NSObject

	/**
	 * @since 17.4
	 */
	readonly leaderboardEntry: GKLeaderboardEntry | null;

	/**
	 * @since 6.0
	 * @deprecated 17.4
	 */
	readonly score: GKScore | null;
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare const enum GKSendDataMode {

	Reliable = 0,

	Unreliable = 1
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare class GKSession extends NSObject {

	static alloc(): GKSession; // inherited from NSObject

	static new(): GKSession; // inherited from NSObject

	available: boolean;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	delegate: GKSessionDelegate;

	disconnectTimeout: number;

	readonly displayName: string;

	readonly peerID: string;

	readonly sessionID: string;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	readonly sessionMode: GKSessionMode;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	constructor(o: { sessionID: string; displayName: string; sessionMode: GKSessionMode; });

	acceptConnectionFromPeerError(peerID: string, error?: interop.Reference<NSError>): boolean;

	cancelConnectToPeer(peerID: string): void;

	connectToPeerWithTimeout(peerID: string, timeout: number): void;

	denyConnectionFromPeer(peerID: string): void;

	disconnectFromAllPeers(): void;

	disconnectPeerFromAllPeers(peerID: string): void;

	displayNameForPeer(peerID: string): string;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	initWithSessionIDDisplayNameSessionMode(sessionID: string, name: string, mode: GKSessionMode): this;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	peersWithConnectionState(state: GKPeerConnectionState): NSArray<any>;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	sendDataToAllPeersWithDataModeError(data: NSData, mode: GKSendDataMode, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	sendDataToPeersWithDataModeError(data: NSData, peers: NSArray<any> | any[], mode: GKSendDataMode, error?: interop.Reference<NSError>): boolean;

	setDataReceiveHandlerWithContext(handler: any, context: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): void;
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
interface GKSessionDelegate extends NSObjectProtocol {

	sessionConnectionWithPeerFailedWithError?(session: GKSession, peerID: string, error: NSError): void;

	sessionDidFailWithError?(session: GKSession, error: NSError): void;

	sessionDidReceiveConnectionRequestFromPeer?(session: GKSession, peerID: string): void;

	sessionPeerDidChangeState?(session: GKSession, peerID: string, state: GKPeerConnectionState): void;
}
declare var GKSessionDelegate: {

	prototype: GKSessionDelegate;
};

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare const enum GKSessionError {

	InvalidParameterError = 30500,

	PeerNotFoundError = 30501,

	DeclinedError = 30502,

	TimedOutError = 30503,

	CancelledError = 30504,

	ConnectionFailedError = 30505,

	ConnectionClosedError = 30506,

	DataTooBigError = 30507,

	NotConnectedError = 30508,

	CannotEnableError = 30509,

	InProgressError = 30510,

	ConnectivityError = 30201,

	TransportError = 30202,

	InternalError = 30203,

	UnknownError = 30204,

	SystemError = 30205
}

/**
 * @since 3.0
 * @deprecated 18.4
 */
declare var GKSessionErrorDomain: string;

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare const enum GKSessionMode {

	Server = 0,

	Client = 1,

	Peer = 2
}

/**
 * @since 10.0
 */
declare const enum GKTransportType {

	Unreliable = 0,

	Reliable = 1
}

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare class GKTurnBasedEventHandler extends NSObject {

	static alloc(): GKTurnBasedEventHandler; // inherited from NSObject

	static new(): GKTurnBasedEventHandler; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	static sharedTurnBasedEventHandler(): GKTurnBasedEventHandler;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	delegate: NSObject & GKTurnBasedEventHandlerDelegate | null;
}

/**
 * @since 5.0
 * @deprecated 7.0
 */
interface GKTurnBasedEventHandlerDelegate {

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	handleInviteFromGameCenter(playersToInvite: NSArray<string> | string[]): void;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	handleMatchEnded?(match: GKTurnBasedMatch): void;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	handleTurnEventForMatch?(match: GKTurnBasedMatch): void;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	handleTurnEventForMatchDidBecomeActive(match: GKTurnBasedMatch, didBecomeActive: boolean): void;
}
declare var GKTurnBasedEventHandlerDelegate: {

	prototype: GKTurnBasedEventHandlerDelegate;
};

/**
 * @since 7.0
 */
interface GKTurnBasedEventListener {

	/**
	 * @since 8.0
	 */
	playerDidRequestMatchWithOtherPlayers?(player: GKPlayer, playersToInvite: NSArray<GKPlayer> | GKPlayer[]): void;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	playerDidRequestMatchWithPlayers?(player: GKPlayer, playerIDsToInvite: NSArray<string> | string[]): void;

	playerMatchEnded?(player: GKPlayer, match: GKTurnBasedMatch): void;

	/**
	 * @since 7.0
	 */
	playerReceivedExchangeCancellationForMatch?(player: GKPlayer, exchange: GKTurnBasedExchange, match: GKTurnBasedMatch): void;

	/**
	 * @since 7.0
	 */
	playerReceivedExchangeRepliesForCompletedExchangeForMatch?(player: GKPlayer, replies: NSArray<GKTurnBasedExchangeReply> | GKTurnBasedExchangeReply[], exchange: GKTurnBasedExchange, match: GKTurnBasedMatch): void;

	/**
	 * @since 7.0
	 */
	playerReceivedExchangeRequestForMatch?(player: GKPlayer, exchange: GKTurnBasedExchange, match: GKTurnBasedMatch): void;

	/**
	 * @since 7.0
	 */
	playerReceivedTurnEventForMatchDidBecomeActive?(player: GKPlayer, match: GKTurnBasedMatch, didBecomeActive: boolean): void;

	/**
	 * @since 9.0
	 */
	playerWantsToQuitMatch?(player: GKPlayer, match: GKTurnBasedMatch): void;
}
declare var GKTurnBasedEventListener: {

	prototype: GKTurnBasedEventListener;
};

/**
 * @since 7.0
 */
declare class GKTurnBasedExchange extends NSObject {

	static alloc(): GKTurnBasedExchange; // inherited from NSObject

	static new(): GKTurnBasedExchange; // inherited from NSObject

	readonly completionDate: Date | null;

	readonly data: NSData | null;

	readonly exchangeID: string | null;

	readonly message: string | null;

	readonly recipients: NSArray<GKTurnBasedParticipant> | null;

	readonly replies: NSArray<GKTurnBasedExchangeReply> | null;

	readonly sendDate: Date | null;

	readonly sender: GKTurnBasedParticipant | null;

	readonly status: GKTurnBasedExchangeStatus;

	readonly timeoutDate: Date | null;

	/**
	 * @since 7.0
	 */
	cancelWithLocalizableMessageKeyArgumentsCompletionHandler(key: string, _arguments: NSArray<string> | string[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 */
	replyWithLocalizableMessageKeyArgumentsDataCompletionHandler(key: string, _arguments: NSArray<string> | string[], data: NSData, completionHandler: (p1: NSError | null) => void | null): void;
}

/**
 * @since 7.0
 */
declare class GKTurnBasedExchangeReply extends NSObject {

	static alloc(): GKTurnBasedExchangeReply; // inherited from NSObject

	static new(): GKTurnBasedExchangeReply; // inherited from NSObject

	readonly data: NSData | null;

	readonly message: string | null;

	readonly recipient: GKTurnBasedParticipant | null;

	/**
	 * @since 8.0
	 */
	readonly replyDate: Date | null;
}

/**
 * @since 7.0
 */
declare const enum GKTurnBasedExchangeStatus {

	Unknown = 0,

	Active = 1,

	Complete = 2,

	Resolved = 3,

	Canceled = 4
}

/**
 * @since 5.0
 */
declare class GKTurnBasedMatch extends NSObject {

	static alloc(): GKTurnBasedMatch; // inherited from NSObject

	static findMatchForRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: GKTurnBasedMatch | null, p2: NSError | null) => void): void;

	/**
	 * @since 5.0
	 */
	static loadMatchWithIDWithCompletionHandler(matchID: string, completionHandler: (p1: GKTurnBasedMatch | null, p2: NSError | null) => void | null): void;

	static loadMatchesWithCompletionHandler(completionHandler: (p1: NSArray<GKTurnBasedMatch> | null, p2: NSError | null) => void | null): void;

	static new(): GKTurnBasedMatch; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly activeExchanges: NSArray<GKTurnBasedExchange> | null;

	/**
	 * @since 7.0
	 */
	readonly completedExchanges: NSArray<GKTurnBasedExchange> | null;

	readonly creationDate: Date | null;

	readonly currentParticipant: GKTurnBasedParticipant | null;

	/**
	 * @since 7.0
	 */
	readonly exchangeDataMaximumSize: number;

	/**
	 * @since 7.0
	 */
	readonly exchangeMaxInitiatedExchangesPerPlayer: number;

	/**
	 * @since 7.0
	 */
	readonly exchanges: NSArray<GKTurnBasedExchange> | null;

	readonly matchData: NSData | null;

	/**
	 * @since 6.0
	 */
	readonly matchDataMaximumSize: number;

	readonly matchID: string | null;

	message: string | null;

	readonly participants: NSArray<GKTurnBasedParticipant> | null;

	readonly status: GKTurnBasedMatchStatus;

	/**
	 * @since 5.0
	 */
	acceptInviteWithCompletionHandler(completionHandler: (p1: GKTurnBasedMatch | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 5.0
	 */
	declineInviteWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	endMatchInTurnWithMatchDataCompletionHandler(matchData: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	endMatchInTurnWithMatchDataLeaderboardScoresAchievementsCompletionHandler(matchData: NSData, scores: NSArray<GKLeaderboardScore> | GKLeaderboardScore[], achievements: NSArray<any> | any[], completionHandler: (p1: NSError | null) => void): void;

	/**
	 * @since 6.0
	 * @deprecated 14.0
	 */
	endMatchInTurnWithMatchDataScoresAchievementsCompletionHandler(matchData: NSData, scores: NSArray<GKScore> | GKScore[] | null, achievements: NSArray<GKAchievement> | GKAchievement[] | null, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	endTurnWithNextParticipantMatchDataCompletionHandler(nextParticipant: GKTurnBasedParticipant, matchData: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 */
	endTurnWithNextParticipantsTurnTimeoutMatchDataCompletionHandler(nextParticipants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], timeout: number, matchData: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	loadMatchDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError | null) => void | null): void;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	participantQuitInTurnWithOutcomeNextParticipantMatchDataCompletionHandler(matchOutcome: GKTurnBasedMatchOutcome, nextParticipant: GKTurnBasedParticipant, matchData: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 */
	participantQuitInTurnWithOutcomeNextParticipantsTurnTimeoutMatchDataCompletionHandler(matchOutcome: GKTurnBasedMatchOutcome, nextParticipants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], timeout: number, matchData: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	participantQuitOutOfTurnWithOutcomeWithCompletionHandler(matchOutcome: GKTurnBasedMatchOutcome, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 */
	rematchWithCompletionHandler(completionHandler: (p1: GKTurnBasedMatch | null, p2: NSError | null) => void | null): void;

	removeWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 6.0
	 */
	saveCurrentTurnWithMatchDataCompletionHandler(matchData: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 */
	saveMergedMatchDataWithResolvedExchangesCompletionHandler(matchData: NSData, exchanges: NSArray<GKTurnBasedExchange> | GKTurnBasedExchange[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 */
	sendExchangeToParticipantsDataLocalizableMessageKeyArgumentsTimeoutCompletionHandler(participants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], data: NSData, key: string, _arguments: NSArray<string> | string[], timeout: number, completionHandler: (p1: GKTurnBasedExchange | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 */
	sendReminderToParticipantsLocalizableMessageKeyArgumentsCompletionHandler(participants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], key: string, _arguments: NSArray<string> | string[], completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 7.0
	 */
	setLocalizableMessageWithKeyArguments(key: string, _arguments: NSArray<string> | string[] | null): void;
}

/**
 * @since 5.0
 */
declare const enum GKTurnBasedMatchOutcome {

	None = 0,

	Quit = 1,

	Won = 2,

	Lost = 3,

	Tied = 4,

	TimeExpired = 5,

	First = 6,

	Second = 7,

	Third = 8,

	Fourth = 9,

	CustomRange = 16711680
}

/**
 * @since 5.0
 */
declare const enum GKTurnBasedMatchStatus {

	Unknown = 0,

	Open = 1,

	Ended = 2,

	Matching = 3
}

/**
 * @since 5.0
 */
declare class GKTurnBasedMatchmakerViewController extends UINavigationController {

	static alloc(): GKTurnBasedMatchmakerViewController; // inherited from NSObject

	static new(): GKTurnBasedMatchmakerViewController; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	matchmakingMode: GKMatchmakingMode;

	showExistingMatches: boolean;

	turnBasedMatchmakerDelegate: GKTurnBasedMatchmakerViewControllerDelegate | null;

	constructor(o: { matchRequest: GKMatchRequest; });

	initWithMatchRequest(request: GKMatchRequest): this;
}

/**
 * @since 5.0
 */
interface GKTurnBasedMatchmakerViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 5.0
	 */
	turnBasedMatchmakerViewControllerDidFailWithError(viewController: GKTurnBasedMatchmakerViewController, error: NSError): void;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	turnBasedMatchmakerViewControllerDidFindMatch?(viewController: GKTurnBasedMatchmakerViewController, match: GKTurnBasedMatch): void;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	turnBasedMatchmakerViewControllerPlayerQuitForMatch?(viewController: GKTurnBasedMatchmakerViewController, match: GKTurnBasedMatch): void;

	/**
	 * @since 5.0
	 */
	turnBasedMatchmakerViewControllerWasCancelled(viewController: GKTurnBasedMatchmakerViewController): void;
}
declare var GKTurnBasedMatchmakerViewControllerDelegate: {

	prototype: GKTurnBasedMatchmakerViewControllerDelegate;
};

/**
 * @since 5.0
 */
declare class GKTurnBasedParticipant extends NSObject {

	static alloc(): GKTurnBasedParticipant; // inherited from NSObject

	static new(): GKTurnBasedParticipant; // inherited from NSObject

	readonly lastTurnDate: Date | null;

	matchOutcome: GKTurnBasedMatchOutcome;

	/**
	 * @since 8.0
	 */
	readonly player: GKPlayer | null;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	readonly playerID: string | null;

	readonly status: GKTurnBasedParticipantStatus;

	/**
	 * @since 6.0
	 */
	readonly timeoutDate: Date | null;
}

/**
 * @since 5.0
 */
declare const enum GKTurnBasedParticipantStatus {

	Unknown = 0,

	Invited = 1,

	Declined = 2,

	Matching = 3,

	Active = 4,

	Done = 5
}

/**
 * @since 6.0
 */
declare var GKTurnTimeoutDefault: number;

/**
 * @since 6.0
 */
declare var GKTurnTimeoutNone: number;

/**
 * @since 4.1
 * @deprecated 18.0
 */
declare class GKVoiceChat extends NSObject {

	static alloc(): GKVoiceChat; // inherited from NSObject

	static isVoIPAllowed(): boolean;

	static new(): GKVoiceChat; // inherited from NSObject

	active: boolean;

	readonly name: string;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	readonly playerIDs: NSArray<string> | null;

	/**
	 * @since 4.1
	 * @deprecated 8.0
	 */
	playerStateUpdateHandler: (p1: string, p2: GKVoiceChatPlayerState) => void;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	playerVoiceChatStateDidChangeHandler: (p1: GKPlayer, p2: GKVoiceChatPlayerState) => void;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	readonly players: NSArray<GKPlayer>;

	volume: number;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	setMuteForPlayer(isMuted: boolean, playerID: string): void;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	setPlayerMuted(player: GKPlayer, isMuted: boolean): void;

	start(): void;

	stop(): void;
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
interface GKVoiceChatClient extends NSObjectProtocol {

	participantID(): string;

	voiceChatServiceDidNotStartWithParticipantIDError?(voiceChatService: GKVoiceChatService, participantID: string, error: NSError | null): void;

	voiceChatServiceDidReceiveInvitationFromParticipantIDCallID?(voiceChatService: GKVoiceChatService, participantID: string, callID: number): void;

	voiceChatServiceDidStartWithParticipantID?(voiceChatService: GKVoiceChatService, participantID: string): void;

	voiceChatServiceDidStopWithParticipantIDError?(voiceChatService: GKVoiceChatService, participantID: string, error: NSError | null): void;

	voiceChatServiceSendDataToParticipantID(voiceChatService: GKVoiceChatService, data: NSData, participantID: string): void;

	voiceChatServiceSendRealTimeDataToParticipantID?(voiceChatService: GKVoiceChatService, data: NSData, participantID: string): void;
}
declare var GKVoiceChatClient: {

	prototype: GKVoiceChatClient;
};

/**
 * @since 4.1
 * @deprecated 18.0
 */
declare const enum GKVoiceChatPlayerState {

	Connected = 0,

	Disconnected = 1,

	Speaking = 2,

	Silent = 3,

	Connecting = 4
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare class GKVoiceChatService extends NSObject {

	static alloc(): GKVoiceChatService; // inherited from NSObject

	static defaultVoiceChatService(): GKVoiceChatService;

	static isVoIPAllowed(): boolean;

	static new(): GKVoiceChatService; // inherited from NSObject

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	client: GKVoiceChatClient;

	readonly inputMeterLevel: number;

	inputMeteringEnabled: boolean;

	microphoneMuted: boolean;

	readonly outputMeterLevel: number;

	outputMeteringEnabled: boolean;

	remoteParticipantVolume: number;

	acceptCallIDError(callID: number, error?: interop.Reference<NSError>): boolean;

	denyCallID(callID: number): void;

	receivedDataFromParticipantID(arbitraryData: NSData, participantID: string): void;

	receivedRealTimeDataFromParticipantID(audio: NSData, participantID: string): void;

	startVoiceChatWithParticipantIDError(participantID: string, error?: interop.Reference<NSError>): boolean;

	stopVoiceChatWithParticipantID(participantID: string): void;
}

/**
 * @since 3.0
 * @deprecated 7.0
 */
declare const enum GKVoiceChatServiceError {

	InternalError = 32000,

	NoRemotePacketsError = 32001,

	UnableToConnectError = 32002,

	RemoteParticipantHangupError = 32003,

	InvalidCallIDError = 32004,

	AudioUnavailableError = 32005,

	UninitializedClientError = 32006,

	ClientMissingRequiredMethodsError = 32007,

	RemoteParticipantBusyError = 32008,

	RemoteParticipantCancelledError = 32009,

	RemoteParticipantResponseInvalidError = 32010,

	RemoteParticipantDeclinedInviteError = 32011,

	MethodCurrentlyInvalidError = 32012,

	NetworkConfigurationError = 32013,

	UnsupportedRemoteVersionError = 32014,

	OutOfMemoryError = 32015,

	InvalidParameterError = 32016
}

/**
 * @since 3.0
 * @deprecated 18.4
 */
declare var GKVoiceChatServiceErrorDomain: string;
