
declare class GKAchievement extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKAchievement; // inherited from NSObject

	static loadAchievementsWithCompletionHandler(completionHandler: (p1: NSArray<GKAchievement>, p2: NSError) => void): void;

	static new(): GKAchievement; // inherited from NSObject

	static reportAchievementsWithCompletionHandler(achievements: NSArray<GKAchievement> | GKAchievement[], completionHandler: (p1: NSError) => void): void;

	static reportAchievementsWithEligibleChallengesWithCompletionHandler(achievements: NSArray<GKAchievement> | GKAchievement[], challenges: NSArray<GKChallenge> | GKChallenge[], completionHandler: (p1: NSError) => void): void;

	static resetAchievementsWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	readonly completed: boolean;

	readonly hidden: boolean;

	identifier: string;

	readonly lastReportedDate: Date;

	percentComplete: number;

	readonly player: GKPlayer;

	readonly playerID: string;

	showsCompletionBanner: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; });

	constructor(o: { identifier: string; forPlayer: string; });

	constructor(o: { identifier: string; player: GKPlayer; });

	challengeComposeControllerWithMessagePlayersCompletionHandler(message: string, players: NSArray<GKPlayer> | GKPlayer[], completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string>) => void): UIViewController;

	challengeComposeControllerWithPlayersMessageCompletionHandler(playerIDs: NSArray<string> | string[], message: string, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string>) => void): UIViewController;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifier(identifier: string): this;

	initWithIdentifierForPlayer(identifier: string, playerID: string): this;

	initWithIdentifierPlayer(identifier: string, player: GKPlayer): this;

	issueChallengeToPlayersMessage(playerIDs: NSArray<string> | string[], message: string): void;

	issueChallengeToPlayersMessageMethod(playerIDs: NSArray<string> | string[], message: string): void;

	reportAchievementWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	selectChallengeablePlayerIDsWithCompletionHandler(playerIDs: NSArray<string> | string[], completionHandler: (p1: NSArray<string>, p2: NSError) => void): void;

	selectChallengeablePlayersWithCompletionHandler(players: NSArray<GKPlayer> | GKPlayer[], completionHandler: (p1: NSArray<GKPlayer>, p2: NSError) => void): void;
}

declare class GKAchievementChallenge extends GKChallenge {

	static alloc(): GKAchievementChallenge; // inherited from NSObject

	static new(): GKAchievementChallenge; // inherited from NSObject

	readonly achievement: GKAchievement;
}

declare class GKAchievementDescription extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKAchievementDescription; // inherited from NSObject

	static incompleteAchievementImage(): UIImage;

	static loadAchievementDescriptionsWithCompletionHandler(completionHandler: (p1: NSArray<GKAchievementDescription>, p2: NSError) => void): void;

	static new(): GKAchievementDescription; // inherited from NSObject

	static placeholderCompletedAchievementImage(): UIImage;

	readonly achievedDescription: string;

	readonly groupIdentifier: string;

	readonly hidden: boolean;

	readonly identifier: string;

	readonly image: UIImage;

	readonly maximumPoints: number;

	readonly replayable: boolean;

	readonly title: string;

	readonly unachievedDescription: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	loadImageWithCompletionHandler(completionHandler: (p1: UIImage, p2: NSError) => void): void;
}

declare class GKAchievementViewController extends GKGameCenterViewController {

	static alloc(): GKAchievementViewController; // inherited from NSObject

	static new(): GKAchievementViewController; // inherited from NSObject

	achievementDelegate: GKAchievementViewControllerDelegate;
}

interface GKAchievementViewControllerDelegate extends NSObjectProtocol {

	achievementViewControllerDidFinish(viewController: GKAchievementViewController): void;
}
declare var GKAchievementViewControllerDelegate: {

	prototype: GKAchievementViewControllerDelegate;
};

declare const enum GKAuthenticationType {

	AuthenticatingWithoutUI = 0,

	AuthenticatingWithGreenBuddyUI = 1,

	AuthenticatingWithAuthKitInvocation = 2
}

declare class GKBasePlayer extends NSObject {

	static alloc(): GKBasePlayer; // inherited from NSObject

	static new(): GKBasePlayer; // inherited from NSObject

	readonly displayName: string;

	readonly playerID: string;
}

declare class GKChallenge extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKChallenge; // inherited from NSObject

	static loadReceivedChallengesWithCompletionHandler(completionHandler: (p1: NSArray<GKChallenge>, p2: NSError) => void): void;

	static new(): GKChallenge; // inherited from NSObject

	readonly completionDate: Date;

	readonly issueDate: Date;

	readonly issuingPlayer: GKPlayer;

	readonly issuingPlayerID: string;

	readonly message: string;

	readonly receivingPlayer: GKPlayer;

	readonly receivingPlayerID: string;

	readonly state: GKChallengeState;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	decline(): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class GKChallengeEventHandler extends NSObject {

	static alloc(): GKChallengeEventHandler; // inherited from NSObject

	static challengeEventHandler(): GKChallengeEventHandler;

	static new(): GKChallengeEventHandler; // inherited from NSObject

	delegate: GKChallengeEventHandlerDelegate;
}

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

interface GKChallengeListener extends NSObjectProtocol {

	playerDidCompleteChallengeIssuedByFriend?(player: GKPlayer, challenge: GKChallenge, friendPlayer: GKPlayer): void;

	playerDidReceiveChallenge?(player: GKPlayer, challenge: GKChallenge): void;

	playerIssuedChallengeWasCompletedByFriend?(player: GKPlayer, challenge: GKChallenge, friendPlayer: GKPlayer): void;

	playerWantsToPlayChallenge?(player: GKPlayer, challenge: GKChallenge): void;
}
declare var GKChallengeListener: {

	prototype: GKChallengeListener;
};

declare const enum GKChallengeState {

	Invalid = 0,

	Pending = 1,

	Completed = 2,

	Declined = 3
}

declare class GKCloudPlayer extends GKBasePlayer {

	static alloc(): GKCloudPlayer; // inherited from NSObject

	static getCurrentSignedInPlayerForContainerCompletionHandler(containerName: string, handler: (p1: GKCloudPlayer, p2: NSError) => void): void;

	static new(): GKCloudPlayer; // inherited from NSObject
}

declare const enum GKConnectionState {

	NotConnected = 0,

	Connected = 1
}

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

	APINotAvailable = 31
}

declare var GKErrorDomain: string;

declare var GKExchangeTimeoutDefault: number;

declare var GKExchangeTimeoutNone: number;

declare class GKFriendRequestComposeViewController extends UINavigationController {

	static alloc(): GKFriendRequestComposeViewController; // inherited from NSObject

	static maxNumberOfRecipients(): number;

	static new(): GKFriendRequestComposeViewController; // inherited from NSObject

	composeViewDelegate: GKFriendRequestComposeViewControllerDelegate;

	addRecipientPlayers(players: NSArray<GKPlayer> | GKPlayer[]): void;

	addRecipientsWithEmailAddresses(emailAddresses: NSArray<string> | string[]): void;

	addRecipientsWithPlayerIDs(playerIDs: NSArray<string> | string[]): void;

	setMessage(message: string): void;
}

interface GKFriendRequestComposeViewControllerDelegate {

	friendRequestComposeViewControllerDidFinish(viewController: GKFriendRequestComposeViewController): void;
}
declare var GKFriendRequestComposeViewControllerDelegate: {

	prototype: GKFriendRequestComposeViewControllerDelegate;
};

interface GKGameCenterControllerDelegate extends NSObjectProtocol {

	gameCenterViewControllerDidFinish(gameCenterViewController: GKGameCenterViewController): void;
}
declare var GKGameCenterControllerDelegate: {

	prototype: GKGameCenterControllerDelegate;
};

declare class GKGameCenterViewController extends UINavigationController {

	static alloc(): GKGameCenterViewController; // inherited from NSObject

	static new(): GKGameCenterViewController; // inherited from NSObject

	gameCenterDelegate: GKGameCenterControllerDelegate;

	leaderboardCategory: string;

	leaderboardIdentifier: string;

	leaderboardTimeScope: GKLeaderboardTimeScope;

	viewState: GKGameCenterViewControllerState;
}

declare const enum GKGameCenterViewControllerState {

	Default = -1,

	Leaderboards = 0,

	Achievements = 1,

	Challenges = 2
}

declare class GKGameSession extends NSObject {

	static addEventListener(listener: NSObject): void;

	static alloc(): GKGameSession; // inherited from NSObject

	static createSessionInContainerWithTitleMaxConnectedPlayersCompletionHandler(containerName: string, title: string, maxPlayers: number, completionHandler: (p1: GKGameSession, p2: NSError) => void): void;

	static loadSessionWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: GKGameSession, p2: NSError) => void): void;

	static loadSessionsInContainerCompletionHandler(containerName: string, completionHandler: (p1: NSArray<GKGameSession>, p2: NSError) => void): void;

	static new(): GKGameSession; // inherited from NSObject

	static removeEventListener(listener: NSObject): void;

	static removeSessionWithIdentifierCompletionHandler(identifier: string, completionHandler: (p1: NSError) => void): void;

	readonly badgedPlayers: NSArray<GKCloudPlayer>;

	readonly identifier: string;

	readonly lastModifiedDate: Date;

	readonly lastModifiedPlayer: GKCloudPlayer;

	readonly maxNumberOfConnectedPlayers: number;

	readonly owner: GKCloudPlayer;

	readonly players: NSArray<GKCloudPlayer>;

	readonly title: string;

	clearBadgeForPlayersCompletionHandler(players: NSArray<GKCloudPlayer> | GKCloudPlayer[], completionHandler: (p1: NSError) => void): void;

	getShareURLWithCompletionHandler(completionHandler: (p1: NSURL, p2: NSError) => void): void;

	loadDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	playersWithConnectionState(state: GKConnectionState): NSArray<GKCloudPlayer>;

	saveDataCompletionHandler(data: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	sendDataWithTransportTypeCompletionHandler(data: NSData, transport: GKTransportType, completionHandler: (p1: NSError) => void): void;

	sendMessageWithLocalizedFormatKeyArgumentsDataToPlayersBadgePlayersCompletionHandler(key: string, _arguments: NSArray<string> | string[], data: NSData, players: NSArray<GKCloudPlayer> | GKCloudPlayer[], badgePlayers: boolean, completionHandler: (p1: NSError) => void): void;

	setConnectionStateCompletionHandler(state: GKConnectionState, completionHandler: (p1: NSError) => void): void;
}

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

declare var GKGameSessionErrorDomain: string;

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

declare class GKInvite extends NSObject {

	static alloc(): GKInvite; // inherited from NSObject

	static new(): GKInvite; // inherited from NSObject

	readonly hosted: boolean;

	readonly inviter: string;

	readonly playerAttributes: number;

	readonly playerGroup: number;

	readonly sender: GKPlayer;
}

interface GKInviteEventListener {

	playerDidAcceptInvite?(player: GKPlayer, invite: GKInvite): void;

	playerDidRequestMatchWithPlayers?(player: GKPlayer, playerIDsToInvite: NSArray<string> | string[]): void;

	playerDidRequestMatchWithRecipients?(player: GKPlayer, recipientPlayers: NSArray<GKPlayer> | GKPlayer[]): void;
}
declare var GKInviteEventListener: {

	prototype: GKInviteEventListener;
};

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

declare class GKLeaderboard extends NSObject {

	static alloc(): GKLeaderboard; // inherited from NSObject

	static loadCategoriesWithCompletionHandler(completionHandler: (p1: NSArray<string>, p2: NSArray<string>, p3: NSError) => void): void;

	static loadLeaderboardsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboard>, p2: NSError) => void): void;

	static new(): GKLeaderboard; // inherited from NSObject

	static setDefaultLeaderboardWithCompletionHandler(leaderboardIdentifier: string, completionHandler: (p1: NSError) => void): void;

	category: string;

	readonly groupIdentifier: string;

	identifier: string;

	readonly loading: boolean;

	readonly localPlayerScore: GKScore;

	readonly maxRange: number;

	playerScope: GKLeaderboardPlayerScope;

	range: NSRange;

	readonly scores: NSArray<GKScore>;

	timeScope: GKLeaderboardTimeScope;

	readonly title: string;

	constructor(o: { playerIDs: NSArray<string> | string[]; });

	constructor(o: { players: NSArray<GKPlayer> | GKPlayer[]; });

	initWithPlayerIDs(playerIDs: NSArray<string> | string[]): this;

	initWithPlayers(players: NSArray<GKPlayer> | GKPlayer[]): this;

	loadImageWithCompletionHandler(completionHandler: (p1: UIImage, p2: NSError) => void): void;

	loadScoresWithCompletionHandler(completionHandler: (p1: NSArray<GKScore>, p2: NSError) => void): void;
}

declare const enum GKLeaderboardPlayerScope {

	Global = 0,

	FriendsOnly = 1
}

declare class GKLeaderboardSet extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKLeaderboardSet; // inherited from NSObject

	static loadLeaderboardSetsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboardSet>, p2: NSError) => void): void;

	static new(): GKLeaderboardSet; // inherited from NSObject

	readonly groupIdentifier: string;

	identifier: string;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	loadImageWithCompletionHandler(completionHandler: (p1: UIImage, p2: NSError) => void): void;

	loadLeaderboardsWithCompletionHandler(completionHandler: (p1: NSArray<GKLeaderboard>, p2: NSError) => void): void;
}

declare const enum GKLeaderboardTimeScope {

	Today = 0,

	Week = 1,

	AllTime = 2
}

declare class GKLeaderboardViewController extends GKGameCenterViewController {

	static alloc(): GKLeaderboardViewController; // inherited from NSObject

	static new(): GKLeaderboardViewController; // inherited from NSObject

	category: string;

	leaderboardDelegate: GKLeaderboardViewControllerDelegate;

	timeScope: GKLeaderboardTimeScope;
}

interface GKLeaderboardViewControllerDelegate extends NSObjectProtocol {

	leaderboardViewControllerDidFinish(viewController: GKLeaderboardViewController): void;
}
declare var GKLeaderboardViewControllerDelegate: {

	prototype: GKLeaderboardViewControllerDelegate;
};

declare class GKLocalPlayer extends GKPlayer implements GKSavedGameListener {

	static alloc(): GKLocalPlayer; // inherited from NSObject

	static anonymousGuestPlayerWithIdentifier(guestIdentifier: string): GKLocalPlayer; // inherited from GKPlayer

	static new(): GKLocalPlayer; // inherited from NSObject

	authenticateHandler: (p1: UIViewController, p2: NSError) => void;

	readonly authenticated: boolean;

	readonly friends: NSArray<string>;

	readonly multiplayerGamingRestricted: boolean;

	readonly underage: boolean;

	static readonly local: GKLocalPlayer;

	static readonly localPlayer: GKLocalPlayer;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	authenticateWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	deleteSavedGamesWithNameCompletionHandler(name: string, handler: (p1: NSError) => void): void;

	fetchSavedGamesWithCompletionHandler(handler: (p1: NSArray<GKSavedGame>, p2: NSError) => void): void;

	generateIdentityVerificationSignatureWithCompletionHandler(completionHandler: (p1: NSURL, p2: NSData, p3: NSData, p4: number, p5: NSError) => void): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadChallengableFriendsWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer>, p2: NSError) => void): void;

	loadDefaultLeaderboardCategoryIDWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	loadDefaultLeaderboardIdentifierWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	loadFriendPlayersWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer>, p2: NSError) => void): void;

	loadFriendsWithCompletionHandler(completionHandler: (p1: NSArray<string>, p2: NSError) => void): void;

	loadRecentPlayersWithCompletionHandler(completionHandler: (p1: NSArray<GKPlayer>, p2: NSError) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	playerDidModifySavedGame(player: GKPlayer, savedGame: GKSavedGame): void;

	playerHasConflictingSavedGames(player: GKPlayer, savedGames: NSArray<GKSavedGame> | GKSavedGame[]): void;

	registerListener(listener: GKLocalPlayerListener): void;

	resolveConflictingSavedGamesWithDataCompletionHandler(conflictingSavedGames: NSArray<GKSavedGame> | GKSavedGame[], data: NSData, handler: (p1: NSArray<GKSavedGame>, p2: NSError) => void): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	saveGameDataWithNameCompletionHandler(data: NSData, name: string, handler: (p1: GKSavedGame, p2: NSError) => void): void;

	self(): this;

	setDefaultLeaderboardCategoryIDCompletionHandler(categoryID: string, completionHandler: (p1: NSError) => void): void;

	setDefaultLeaderboardIdentifierCompletionHandler(leaderboardIdentifier: string, completionHandler: (p1: NSError) => void): void;

	unregisterAllListeners(): void;

	unregisterListener(listener: GKLocalPlayerListener): void;
}

interface GKLocalPlayerListener extends GKChallengeListener, GKInviteEventListener, GKSavedGameListener, GKTurnBasedEventListener {
}
declare var GKLocalPlayerListener: {

	prototype: GKLocalPlayerListener;
};

declare class GKMatch extends NSObject {

	static alloc(): GKMatch; // inherited from NSObject

	static new(): GKMatch; // inherited from NSObject

	delegate: GKMatchDelegate;

	readonly expectedPlayerCount: number;

	readonly playerIDs: NSArray<string>;

	readonly players: NSArray<GKPlayer>;

	chooseBestHostPlayerWithCompletionHandler(completionHandler: (p1: string) => void): void;

	chooseBestHostingPlayerWithCompletionHandler(completionHandler: (p1: GKPlayer) => void): void;

	disconnect(): void;

	rematchWithCompletionHandler(completionHandler: (p1: GKMatch, p2: NSError) => void): void;

	sendDataToAllPlayersWithDataModeError(data: NSData, mode: GKMatchSendDataMode): boolean;

	sendDataToPlayersDataModeError(data: NSData, players: NSArray<GKPlayer> | GKPlayer[], mode: GKMatchSendDataMode): boolean;

	sendDataToPlayersWithDataModeError(data: NSData, playerIDs: NSArray<string> | string[], mode: GKMatchSendDataMode): boolean;

	voiceChatWithName(name: string): GKVoiceChat;
}

interface GKMatchDelegate extends NSObjectProtocol {

	matchDidFailWithError?(match: GKMatch, error: NSError): void;

	matchDidReceiveDataForRecipientFromRemotePlayer?(match: GKMatch, data: NSData, recipient: GKPlayer, player: GKPlayer): void;

	matchDidReceiveDataFromPlayer?(match: GKMatch, data: NSData, playerID: string): void;

	matchDidReceiveDataFromRemotePlayer?(match: GKMatch, data: NSData, player: GKPlayer): void;

	matchPlayerDidChangeConnectionState?(match: GKMatch, player: GKPlayer, state: GKPlayerConnectionState): void;

	matchPlayerDidChangeState?(match: GKMatch, playerID: string, state: GKPlayerConnectionState): void;

	matchShouldReinviteDisconnectedPlayer?(match: GKMatch, player: GKPlayer): boolean;

	matchShouldReinvitePlayer?(match: GKMatch, playerID: string): boolean;
}
declare var GKMatchDelegate: {

	prototype: GKMatchDelegate;
};

declare class GKMatchRequest extends NSObject {

	static alloc(): GKMatchRequest; // inherited from NSObject

	static maxPlayersAllowedForMatchOfType(matchType: GKMatchType): number;

	static new(): GKMatchRequest; // inherited from NSObject

	defaultNumberOfPlayers: number;

	inviteMessage: string;

	inviteeResponseHandler: (p1: string, p2: GKInviteRecipientResponse) => void;

	maxPlayers: number;

	minPlayers: number;

	playerAttributes: number;

	playerGroup: number;

	playersToInvite: NSArray<string>;

	recipientResponseHandler: (p1: GKPlayer, p2: GKInviteRecipientResponse) => void;

	recipients: NSArray<GKPlayer>;

	restrictToAutomatch: boolean;
}

declare const enum GKMatchSendDataMode {

	Reliable = 0,

	Unreliable = 1
}

declare const enum GKMatchType {

	PeerToPeer = 0,

	Hosted = 1,

	TurnBased = 2
}

declare class GKMatchmaker extends NSObject {

	static alloc(): GKMatchmaker; // inherited from NSObject

	static new(): GKMatchmaker; // inherited from NSObject

	static sharedMatchmaker(): GKMatchmaker;

	inviteHandler: (p1: GKInvite, p2: NSArray<any>) => void;

	addPlayersToMatchMatchRequestCompletionHandler(match: GKMatch, matchRequest: GKMatchRequest, completionHandler: (p1: NSError) => void): void;

	cancel(): void;

	cancelInviteToPlayer(playerID: string): void;

	cancelPendingInviteToPlayer(player: GKPlayer): void;

	findMatchForRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: GKMatch, p2: NSError) => void): void;

	findPlayersForHostedMatchRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: NSArray<string>, p2: NSError) => void): void;

	findPlayersForHostedRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: NSArray<GKPlayer>, p2: NSError) => void): void;

	finishMatchmakingForMatch(match: GKMatch): void;

	matchForInviteCompletionHandler(invite: GKInvite, completionHandler: (p1: GKMatch, p2: NSError) => void): void;

	queryActivityWithCompletionHandler(completionHandler: (p1: number, p2: NSError) => void): void;

	queryPlayerGroupActivityWithCompletionHandler(playerGroup: number, completionHandler: (p1: number, p2: NSError) => void): void;

	startBrowsingForNearbyPlayersWithHandler(reachableHandler: (p1: GKPlayer, p2: boolean) => void): void;

	startBrowsingForNearbyPlayersWithReachableHandler(reachableHandler: (p1: string, p2: boolean) => void): void;

	stopBrowsingForNearbyPlayers(): void;
}

declare class GKMatchmakerViewController extends UINavigationController {

	static alloc(): GKMatchmakerViewController; // inherited from NSObject

	static new(): GKMatchmakerViewController; // inherited from NSObject

	defaultInvitationMessage: string;

	hosted: boolean;

	readonly matchRequest: GKMatchRequest;

	matchmakerDelegate: GKMatchmakerViewControllerDelegate;

	constructor(o: { invite: GKInvite; });

	constructor(o: { matchRequest: GKMatchRequest; });

	addPlayersToMatch(match: GKMatch): void;

	initWithInvite(invite: GKInvite): this;

	initWithMatchRequest(request: GKMatchRequest): this;

	setHostedPlayerConnected(playerID: string, connected: boolean): void;

	setHostedPlayerDidConnect(player: GKPlayer, connected: boolean): void;

	setHostedPlayerReady(playerID: string): void;
}

interface GKMatchmakerViewControllerDelegate extends NSObjectProtocol {

	matchmakerViewControllerDidFailWithError(viewController: GKMatchmakerViewController, error: NSError): void;

	matchmakerViewControllerDidFindHostedPlayers?(viewController: GKMatchmakerViewController, players: NSArray<GKPlayer> | GKPlayer[]): void;

	matchmakerViewControllerDidFindMatch?(viewController: GKMatchmakerViewController, match: GKMatch): void;

	matchmakerViewControllerDidFindPlayers?(viewController: GKMatchmakerViewController, playerIDs: NSArray<string> | string[]): void;

	matchmakerViewControllerDidReceiveAcceptFromHostedPlayer?(viewController: GKMatchmakerViewController, playerID: string): void;

	matchmakerViewControllerHostedPlayerDidAccept?(viewController: GKMatchmakerViewController, player: GKPlayer): void;

	matchmakerViewControllerWasCancelled(viewController: GKMatchmakerViewController): void;
}
declare var GKMatchmakerViewControllerDelegate: {

	prototype: GKMatchmakerViewControllerDelegate;
};

declare class GKNotificationBanner extends NSObject {

	static alloc(): GKNotificationBanner; // inherited from NSObject

	static new(): GKNotificationBanner; // inherited from NSObject

	static showBannerWithTitleMessageCompletionHandler(title: string, message: string, completionHandler: () => void): void;

	static showBannerWithTitleMessageDurationCompletionHandler(title: string, message: string, duration: number, completionHandler: () => void): void;
}

declare const enum GKPeerConnectionState {

	StateAvailable = 0,

	StateUnavailable = 1,

	StateConnected = 2,

	StateDisconnected = 3,

	StateConnecting = 4
}

declare const enum GKPeerPickerConnectionType {

	Online = 1,

	Nearby = 2
}

declare class GKPeerPickerController extends NSObject {

	static alloc(): GKPeerPickerController; // inherited from NSObject

	static new(): GKPeerPickerController; // inherited from NSObject

	connectionTypesMask: GKPeerPickerConnectionType;

	delegate: GKPeerPickerControllerDelegate;

	readonly visible: boolean;

	dismiss(): void;

	show(): void;
}

interface GKPeerPickerControllerDelegate extends NSObjectProtocol {

	peerPickerControllerDidCancel?(picker: GKPeerPickerController): void;

	peerPickerControllerDidConnectPeerToSession?(picker: GKPeerPickerController, peerID: string, session: GKSession): void;

	peerPickerControllerDidSelectConnectionType?(picker: GKPeerPickerController, type: GKPeerPickerConnectionType): void;

	peerPickerControllerSessionForConnectionType?(picker: GKPeerPickerController, type: GKPeerPickerConnectionType): GKSession;
}
declare var GKPeerPickerControllerDelegate: {

	prototype: GKPeerPickerControllerDelegate;
};

declare const enum GKPhotoSize {

	Small = 0,

	Normal = 1
}

declare class GKPlayer extends GKBasePlayer {

	static alloc(): GKPlayer; // inherited from NSObject

	static anonymousGuestPlayerWithIdentifier(guestIdentifier: string): GKPlayer;

	static loadPlayersForIdentifiersWithCompletionHandler(identifiers: NSArray<string> | string[], completionHandler: (p1: NSArray<GKPlayer>, p2: NSError) => void): void;

	static new(): GKPlayer; // inherited from NSObject

	readonly alias: string;

	readonly gamePlayerID: string;

	readonly guestIdentifier: string;

	readonly isFriend: boolean;

	readonly teamPlayerID: string;

	loadPhotoForSizeWithCompletionHandler(size: GKPhotoSize, completionHandler: (p1: UIImage, p2: NSError) => void): void;

	scopedIDsArePersistent(): boolean;
}

declare var GKPlayerAuthenticationDidChangeNotificationName: string;

declare const enum GKPlayerConnectionState {

	StateUnknown = 0,

	StateConnected = 1,

	StateDisconnected = 2
}

declare var GKPlayerDidChangeNotificationName: string;

declare class GKSavedGame extends NSObject implements NSCopying {

	static alloc(): GKSavedGame; // inherited from NSObject

	static new(): GKSavedGame; // inherited from NSObject

	readonly deviceName: string;

	readonly modificationDate: Date;

	readonly name: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	loadDataWithCompletionHandler(handler: (p1: NSData, p2: NSError) => void): void;
}

interface GKSavedGameListener extends NSObjectProtocol {

	playerDidModifySavedGame?(player: GKPlayer, savedGame: GKSavedGame): void;

	playerHasConflictingSavedGames?(player: GKPlayer, savedGames: NSArray<GKSavedGame> | GKSavedGame[]): void;
}
declare var GKSavedGameListener: {

	prototype: GKSavedGameListener;
};

declare class GKScore extends NSObject implements NSCoding, NSSecureCoding {

	static alloc(): GKScore; // inherited from NSObject

	static new(): GKScore; // inherited from NSObject

	static reportScoresWithCompletionHandler(scores: NSArray<GKScore> | GKScore[], completionHandler: (p1: NSError) => void): void;

	static reportScoresWithEligibleChallengesWithCompletionHandler(scores: NSArray<GKScore> | GKScore[], challenges: NSArray<GKChallenge> | GKChallenge[], completionHandler: (p1: NSError) => void): void;

	category: string;

	context: number;

	readonly date: Date;

	readonly formattedValue: string;

	leaderboardIdentifier: string;

	readonly player: GKPlayer;

	readonly playerID: string;

	readonly rank: number;

	shouldSetDefaultLeaderboard: boolean;

	value: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { category: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { leaderboardIdentifier: string; });

	constructor(o: { leaderboardIdentifier: string; forPlayer: string; });

	constructor(o: { leaderboardIdentifier: string; player: GKPlayer; });

	challengeComposeControllerWithMessagePlayersCompletionHandler(message: string, players: NSArray<GKPlayer> | GKPlayer[], completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string>) => void): UIViewController;

	challengeComposeControllerWithPlayersMessageCompletionHandler(playerIDs: NSArray<string> | string[], message: string, completionHandler: (p1: UIViewController, p2: boolean, p3: NSArray<string>) => void): UIViewController;

	encodeWithCoder(coder: NSCoder): void;

	initWithCategory(category: string): this;

	initWithCoder(coder: NSCoder): this;

	initWithLeaderboardIdentifier(identifier: string): this;

	initWithLeaderboardIdentifierForPlayer(identifier: string, playerID: string): this;

	initWithLeaderboardIdentifierPlayer(identifier: string, player: GKPlayer): this;

	issueChallengeToPlayersMessage(playerIDs: NSArray<string> | string[], message: string): void;

	issueChallengeToPlayersMessageMethod(playerIDs: NSArray<string> | string[], message: string): void;

	reportScoreWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

declare class GKScoreChallenge extends GKChallenge {

	static alloc(): GKScoreChallenge; // inherited from NSObject

	static new(): GKScoreChallenge; // inherited from NSObject

	readonly score: GKScore;
}

declare const enum GKSendDataMode {

	Reliable = 0,

	Unreliable = 1
}

declare class GKSession extends NSObject {

	static alloc(): GKSession; // inherited from NSObject

	static new(): GKSession; // inherited from NSObject

	available: boolean;

	delegate: GKSessionDelegate;

	disconnectTimeout: number;

	readonly displayName: string;

	readonly peerID: string;

	readonly sessionID: string;

	readonly sessionMode: GKSessionMode;

	constructor(o: { sessionID: string; displayName: string; sessionMode: GKSessionMode; });

	acceptConnectionFromPeerError(peerID: string): boolean;

	cancelConnectToPeer(peerID: string): void;

	connectToPeerWithTimeout(peerID: string, timeout: number): void;

	denyConnectionFromPeer(peerID: string): void;

	disconnectFromAllPeers(): void;

	disconnectPeerFromAllPeers(peerID: string): void;

	displayNameForPeer(peerID: string): string;

	initWithSessionIDDisplayNameSessionMode(sessionID: string, name: string, mode: GKSessionMode): this;

	peersWithConnectionState(state: GKPeerConnectionState): NSArray<any>;

	sendDataToAllPeersWithDataModeError(data: NSData, mode: GKSendDataMode): boolean;

	sendDataToPeersWithDataModeError(data: NSData, peers: NSArray<any> | any[], mode: GKSendDataMode): boolean;

	setDataReceiveHandlerWithContext(handler: any, context: interop.Pointer | interop.Reference<any>): void;
}

interface GKSessionDelegate extends NSObjectProtocol {

	sessionConnectionWithPeerFailedWithError?(session: GKSession, peerID: string, error: NSError): void;

	sessionDidFailWithError?(session: GKSession, error: NSError): void;

	sessionDidReceiveConnectionRequestFromPeer?(session: GKSession, peerID: string): void;

	sessionPeerDidChangeState?(session: GKSession, peerID: string, state: GKPeerConnectionState): void;
}
declare var GKSessionDelegate: {

	prototype: GKSessionDelegate;
};

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

declare var GKSessionErrorDomain: string;

declare const enum GKSessionMode {

	Server = 0,

	Client = 1,

	Peer = 2
}

declare const enum GKTransportType {

	Unreliable = 0,

	Reliable = 1
}

declare class GKTurnBasedEventHandler extends NSObject {

	static alloc(): GKTurnBasedEventHandler; // inherited from NSObject

	static new(): GKTurnBasedEventHandler; // inherited from NSObject

	static sharedTurnBasedEventHandler(): GKTurnBasedEventHandler;

	delegate: NSObject;
}

interface GKTurnBasedEventHandlerDelegate {

	handleInviteFromGameCenter(playersToInvite: NSArray<string> | string[]): void;

	handleMatchEnded?(match: GKTurnBasedMatch): void;

	handleTurnEventForMatch?(match: GKTurnBasedMatch): void;

	handleTurnEventForMatchDidBecomeActive(match: GKTurnBasedMatch, didBecomeActive: boolean): void;
}
declare var GKTurnBasedEventHandlerDelegate: {

	prototype: GKTurnBasedEventHandlerDelegate;
};

interface GKTurnBasedEventListener {

	playerDidRequestMatchWithOtherPlayers?(player: GKPlayer, playersToInvite: NSArray<GKPlayer> | GKPlayer[]): void;

	playerDidRequestMatchWithPlayers?(player: GKPlayer, playerIDsToInvite: NSArray<string> | string[]): void;

	playerMatchEnded?(player: GKPlayer, match: GKTurnBasedMatch): void;

	playerReceivedExchangeCancellationForMatch?(player: GKPlayer, exchange: GKTurnBasedExchange, match: GKTurnBasedMatch): void;

	playerReceivedExchangeRepliesForCompletedExchangeForMatch?(player: GKPlayer, replies: NSArray<GKTurnBasedExchangeReply> | GKTurnBasedExchangeReply[], exchange: GKTurnBasedExchange, match: GKTurnBasedMatch): void;

	playerReceivedExchangeRequestForMatch?(player: GKPlayer, exchange: GKTurnBasedExchange, match: GKTurnBasedMatch): void;

	playerReceivedTurnEventForMatchDidBecomeActive?(player: GKPlayer, match: GKTurnBasedMatch, didBecomeActive: boolean): void;

	playerWantsToQuitMatch?(player: GKPlayer, match: GKTurnBasedMatch): void;
}
declare var GKTurnBasedEventListener: {

	prototype: GKTurnBasedEventListener;
};

declare class GKTurnBasedExchange extends NSObject {

	static alloc(): GKTurnBasedExchange; // inherited from NSObject

	static new(): GKTurnBasedExchange; // inherited from NSObject

	readonly completionDate: Date;

	readonly data: NSData;

	readonly exchangeID: string;

	readonly message: string;

	readonly recipients: NSArray<GKTurnBasedParticipant>;

	readonly replies: NSArray<GKTurnBasedExchangeReply>;

	readonly sendDate: Date;

	readonly sender: GKTurnBasedParticipant;

	readonly status: GKTurnBasedExchangeStatus;

	readonly timeoutDate: Date;

	cancelWithLocalizableMessageKeyArgumentsCompletionHandler(key: string, _arguments: NSArray<string> | string[], completionHandler: (p1: NSError) => void): void;

	replyWithLocalizableMessageKeyArgumentsDataCompletionHandler(key: string, _arguments: NSArray<string> | string[], data: NSData, completionHandler: (p1: NSError) => void): void;
}

declare class GKTurnBasedExchangeReply extends NSObject {

	static alloc(): GKTurnBasedExchangeReply; // inherited from NSObject

	static new(): GKTurnBasedExchangeReply; // inherited from NSObject

	readonly data: NSData;

	readonly message: string;

	readonly recipient: GKTurnBasedParticipant;

	readonly replyDate: Date;
}

declare const enum GKTurnBasedExchangeStatus {

	Unknown = 0,

	Active = 1,

	Complete = 2,

	Resolved = 3,

	Canceled = 4
}

declare class GKTurnBasedMatch extends NSObject {

	static alloc(): GKTurnBasedMatch; // inherited from NSObject

	static findMatchForRequestWithCompletionHandler(request: GKMatchRequest, completionHandler: (p1: GKTurnBasedMatch, p2: NSError) => void): void;

	static loadMatchWithIDWithCompletionHandler(matchID: string, completionHandler: (p1: GKTurnBasedMatch, p2: NSError) => void): void;

	static loadMatchesWithCompletionHandler(completionHandler: (p1: NSArray<GKTurnBasedMatch>, p2: NSError) => void): void;

	static new(): GKTurnBasedMatch; // inherited from NSObject

	readonly activeExchanges: NSArray<GKTurnBasedExchange>;

	readonly completedExchanges: NSArray<GKTurnBasedExchange>;

	readonly creationDate: Date;

	readonly currentParticipant: GKTurnBasedParticipant;

	readonly exchangeDataMaximumSize: number;

	readonly exchangeMaxInitiatedExchangesPerPlayer: number;

	readonly exchanges: NSArray<GKTurnBasedExchange>;

	readonly matchData: NSData;

	readonly matchDataMaximumSize: number;

	readonly matchID: string;

	message: string;

	readonly participants: NSArray<GKTurnBasedParticipant>;

	readonly status: GKTurnBasedMatchStatus;

	acceptInviteWithCompletionHandler(completionHandler: (p1: GKTurnBasedMatch, p2: NSError) => void): void;

	declineInviteWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	endMatchInTurnWithMatchDataCompletionHandler(matchData: NSData, completionHandler: (p1: NSError) => void): void;

	endMatchInTurnWithMatchDataScoresAchievementsCompletionHandler(matchData: NSData, scores: NSArray<GKScore> | GKScore[], achievements: NSArray<GKAchievement> | GKAchievement[], completionHandler: (p1: NSError) => void): void;

	endTurnWithNextParticipantMatchDataCompletionHandler(nextParticipant: GKTurnBasedParticipant, matchData: NSData, completionHandler: (p1: NSError) => void): void;

	endTurnWithNextParticipantsTurnTimeoutMatchDataCompletionHandler(nextParticipants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], timeout: number, matchData: NSData, completionHandler: (p1: NSError) => void): void;

	loadMatchDataWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	participantQuitInTurnWithOutcomeNextParticipantMatchDataCompletionHandler(matchOutcome: GKTurnBasedMatchOutcome, nextParticipant: GKTurnBasedParticipant, matchData: NSData, completionHandler: (p1: NSError) => void): void;

	participantQuitInTurnWithOutcomeNextParticipantsTurnTimeoutMatchDataCompletionHandler(matchOutcome: GKTurnBasedMatchOutcome, nextParticipants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], timeout: number, matchData: NSData, completionHandler: (p1: NSError) => void): void;

	participantQuitOutOfTurnWithOutcomeWithCompletionHandler(matchOutcome: GKTurnBasedMatchOutcome, completionHandler: (p1: NSError) => void): void;

	rematchWithCompletionHandler(completionHandler: (p1: GKTurnBasedMatch, p2: NSError) => void): void;

	removeWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	saveCurrentTurnWithMatchDataCompletionHandler(matchData: NSData, completionHandler: (p1: NSError) => void): void;

	saveMergedMatchDataWithResolvedExchangesCompletionHandler(matchData: NSData, exchanges: NSArray<GKTurnBasedExchange> | GKTurnBasedExchange[], completionHandler: (p1: NSError) => void): void;

	sendExchangeToParticipantsDataLocalizableMessageKeyArgumentsTimeoutCompletionHandler(participants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], data: NSData, key: string, _arguments: NSArray<string> | string[], timeout: number, completionHandler: (p1: GKTurnBasedExchange, p2: NSError) => void): void;

	sendReminderToParticipantsLocalizableMessageKeyArgumentsCompletionHandler(participants: NSArray<GKTurnBasedParticipant> | GKTurnBasedParticipant[], key: string, _arguments: NSArray<string> | string[], completionHandler: (p1: NSError) => void): void;

	setLocalizableMessageWithKeyArguments(key: string, _arguments: NSArray<string> | string[]): void;
}

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

declare const enum GKTurnBasedMatchStatus {

	Unknown = 0,

	Open = 1,

	Ended = 2,

	Matching = 3
}

declare class GKTurnBasedMatchmakerViewController extends UINavigationController {

	static alloc(): GKTurnBasedMatchmakerViewController; // inherited from NSObject

	static new(): GKTurnBasedMatchmakerViewController; // inherited from NSObject

	showExistingMatches: boolean;

	turnBasedMatchmakerDelegate: GKTurnBasedMatchmakerViewControllerDelegate;

	constructor(o: { matchRequest: GKMatchRequest; });

	initWithMatchRequest(request: GKMatchRequest): this;
}

interface GKTurnBasedMatchmakerViewControllerDelegate extends NSObjectProtocol {

	turnBasedMatchmakerViewControllerDidFailWithError(viewController: GKTurnBasedMatchmakerViewController, error: NSError): void;

	turnBasedMatchmakerViewControllerDidFindMatch?(viewController: GKTurnBasedMatchmakerViewController, match: GKTurnBasedMatch): void;

	turnBasedMatchmakerViewControllerPlayerQuitForMatch?(viewController: GKTurnBasedMatchmakerViewController, match: GKTurnBasedMatch): void;

	turnBasedMatchmakerViewControllerWasCancelled(viewController: GKTurnBasedMatchmakerViewController): void;
}
declare var GKTurnBasedMatchmakerViewControllerDelegate: {

	prototype: GKTurnBasedMatchmakerViewControllerDelegate;
};

declare class GKTurnBasedParticipant extends NSObject {

	static alloc(): GKTurnBasedParticipant; // inherited from NSObject

	static new(): GKTurnBasedParticipant; // inherited from NSObject

	readonly lastTurnDate: Date;

	matchOutcome: GKTurnBasedMatchOutcome;

	readonly player: GKPlayer;

	readonly playerID: string;

	readonly status: GKTurnBasedParticipantStatus;

	readonly timeoutDate: Date;
}

declare const enum GKTurnBasedParticipantStatus {

	Unknown = 0,

	Invited = 1,

	Declined = 2,

	Matching = 3,

	Active = 4,

	Done = 5
}

declare var GKTurnTimeoutDefault: number;

declare var GKTurnTimeoutNone: number;

declare class GKVoiceChat extends NSObject {

	static alloc(): GKVoiceChat; // inherited from NSObject

	static isVoIPAllowed(): boolean;

	static new(): GKVoiceChat; // inherited from NSObject

	active: boolean;

	readonly name: string;

	readonly playerIDs: NSArray<string>;

	playerStateUpdateHandler: (p1: string, p2: GKVoiceChatPlayerState) => void;

	playerVoiceChatStateDidChangeHandler: (p1: GKPlayer, p2: GKVoiceChatPlayerState) => void;

	readonly players: NSArray<GKPlayer>;

	volume: number;

	setMuteForPlayer(isMuted: boolean, playerID: string): void;

	setPlayerMuted(player: GKPlayer, isMuted: boolean): void;

	start(): void;

	stop(): void;
}

interface GKVoiceChatClient extends NSObjectProtocol {

	participantID(): string;

	voiceChatServiceDidNotStartWithParticipantIDError?(voiceChatService: GKVoiceChatService, participantID: string, error: NSError): void;

	voiceChatServiceDidReceiveInvitationFromParticipantIDCallID?(voiceChatService: GKVoiceChatService, participantID: string, callID: number): void;

	voiceChatServiceDidStartWithParticipantID?(voiceChatService: GKVoiceChatService, participantID: string): void;

	voiceChatServiceDidStopWithParticipantIDError?(voiceChatService: GKVoiceChatService, participantID: string, error: NSError): void;

	voiceChatServiceSendDataToParticipantID(voiceChatService: GKVoiceChatService, data: NSData, participantID: string): void;

	voiceChatServiceSendRealTimeDataToParticipantID?(voiceChatService: GKVoiceChatService, data: NSData, participantID: string): void;
}
declare var GKVoiceChatClient: {

	prototype: GKVoiceChatClient;
};

declare const enum GKVoiceChatPlayerState {

	Connected = 0,

	Disconnected = 1,

	Speaking = 2,

	Silent = 3,

	Connecting = 4
}

declare class GKVoiceChatService extends NSObject {

	static alloc(): GKVoiceChatService; // inherited from NSObject

	static defaultVoiceChatService(): GKVoiceChatService;

	static isVoIPAllowed(): boolean;

	static new(): GKVoiceChatService; // inherited from NSObject

	client: GKVoiceChatClient;

	readonly inputMeterLevel: number;

	inputMeteringEnabled: boolean;

	microphoneMuted: boolean;

	readonly outputMeterLevel: number;

	outputMeteringEnabled: boolean;

	remoteParticipantVolume: number;

	acceptCallIDError(callID: number): boolean;

	denyCallID(callID: number): void;

	receivedDataFromParticipantID(arbitraryData: NSData, participantID: string): void;

	receivedRealTimeDataFromParticipantID(audio: NSData, participantID: string): void;

	startVoiceChatWithParticipantIDError(participantID: string): boolean;

	stopVoiceChatWithParticipantID(participantID: string): void;
}

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

declare var GKVoiceChatServiceErrorDomain: string;
