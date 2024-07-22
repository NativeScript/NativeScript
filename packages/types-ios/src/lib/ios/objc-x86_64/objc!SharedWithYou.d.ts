
/**
 * @since 16.0
 */
declare class SWAttributionView extends UIView {

	static alloc(): SWAttributionView; // inherited from NSObject

	static appearance(): SWAttributionView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): SWAttributionView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SWAttributionView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SWAttributionView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SWAttributionView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SWAttributionView; // inherited from UIAppearance

	static new(): SWAttributionView; // inherited from NSObject

	backgroundStyle: SWAttributionViewBackgroundStyle;

	displayContext: SWAttributionViewDisplayContext;

	highlight: SWHighlight;

	readonly highlightMenu: UIMenu;

	horizontalAlignment: SWAttributionViewHorizontalAlignment;

	menuTitleForHideAction: string;

	preferredMaxLayoutWidth: number;

	supplementalMenu: UIMenu;
}

/**
 * @since 16.0
 */
declare const enum SWAttributionViewBackgroundStyle {

	Default = 0,

	Color = 1,

	Material = 2
}

/**
 * @since 16.0
 */
declare const enum SWAttributionViewDisplayContext {

	Summary = 0,

	Detail = 1
}

/**
 * @since 16.0
 */
declare const enum SWAttributionViewHorizontalAlignment {

	Default = 0,

	Leading = 1,

	Center = 2,

	Trailing = 3
}

/**
 * @since 16.0
 */
declare class SWCollaborationHighlight extends SWHighlight implements NSCopying, NSSecureCoding {

	static alloc(): SWCollaborationHighlight; // inherited from NSObject

	static new(): SWCollaborationHighlight; // inherited from NSObject

	readonly collaborationIdentifier: string;

	readonly contentType: UTType;

	readonly creationDate: Date;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare var SWCollaborationMetadataTypeIdentifier: string;

/**
 * @since 16.0
 */
declare class SWCollaborationView extends UIView {

	static alloc(): SWCollaborationView; // inherited from NSObject

	static appearance(): SWCollaborationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): SWCollaborationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): SWCollaborationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SWCollaborationView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): SWCollaborationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): SWCollaborationView; // inherited from UIAppearance

	static new(): SWCollaborationView; // inherited from NSObject

	activeParticipantCount: number;

	cloudSharingControllerDelegate: UICloudSharingControllerDelegate;

	cloudSharingDelegate: UICloudSharingControllerDelegate;

	delegate: SWCollaborationViewDelegate;

	headerImage: UIImage;

	headerSubtitle: string;

	headerTitle: string;

	manageButtonTitle: string;

	constructor(o: { itemProvider: NSItemProvider; });

	dismissPopover(completion: () => void): void;

	initWithItemProvider(itemProvider: NSItemProvider): this;

	setContentView(detailViewListContentView: UIView): void;

	setShowManageButton(showManageButton: boolean): void;
}

/**
 * @since 16.0
 */
interface SWCollaborationViewDelegate extends NSObjectProtocol {

	collaborationViewDidDismissPopover?(collaborationView: SWCollaborationView): void;

	collaborationViewShouldPresentPopover?(collaborationView: SWCollaborationView): boolean;

	collaborationViewWillPresentPopover?(collaborationView: SWCollaborationView): void;
}
declare var SWCollaborationViewDelegate: {

	prototype: SWCollaborationViewDelegate;
};

/**
 * @since 16.0
 */
declare class SWHighlight extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWHighlight; // inherited from NSObject

	static new(): SWHighlight; // inherited from NSObject

	readonly URL: NSURL;

	readonly identifier: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare class SWHighlightCenter extends NSObject {

	static alloc(): SWHighlightCenter; // inherited from NSObject

	static new(): SWHighlightCenter; // inherited from NSObject

	delegate: SWHighlightCenterDelegate;

	readonly highlights: NSArray<SWHighlight>;

	static readonly highlightCollectionTitle: string;

	static readonly systemCollaborationSupportAvailable: boolean;

	/**
	 * @since 16.1
	 */
	clearNoticesForHighlight(highlight: SWCollaborationHighlight): void;

	collaborationHighlightForIdentifierError(collaborationIdentifier: string): SWCollaborationHighlight;

	/**
	 * @since 16.0
	 */
	getCollaborationHighlightForURLCompletionHandler(URL: NSURL, completionHandler: (p1: SWCollaborationHighlight, p2: NSError) => void): void;

	getHighlightForURLCompletionHandler(URL: NSURL, completionHandler: (p1: SWHighlight, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	getSignedIdentityProofForCollaborationHighlightUsingDataCompletionHandler(collaborationHighlight: SWCollaborationHighlight, data: NSData, completionHandler: (p1: SWSignedPersonIdentityProof, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	postNoticeForHighlightEvent(event: SWHighlightEvent): void;
}

interface SWHighlightCenterDelegate extends NSObjectProtocol {

	highlightCenterHighlightsDidChange(highlightCenter: SWHighlightCenter): void;
}
declare var SWHighlightCenterDelegate: {

	prototype: SWHighlightCenterDelegate;
};

/**
 * @since 16.0
 */
declare const enum SWHighlightCenterErrorCode {

	NoError = 0,

	InternalError = 1,

	InvalidURL = 2,

	AccessDenied = 3
}

/**
 * @since 16.0
 */
declare class SWHighlightChangeEvent extends NSObject implements SWHighlightEvent {

	static alloc(): SWHighlightChangeEvent; // inherited from NSObject

	static new(): SWHighlightChangeEvent; // inherited from NSObject

	readonly changeEventTrigger: SWHighlightChangeEventTrigger;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly highlightURL: NSURL; // inherited from SWHighlightEvent

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { highlight: SWHighlight; trigger: SWHighlightChangeEventTrigger; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHighlightTrigger(highlight: SWHighlight, trigger: SWHighlightChangeEventTrigger): this;

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

/**
 * @since 16.0
 */
declare const enum SWHighlightChangeEventTrigger {

	Edit = 1,

	Comment = 2
}

/**
 * @since 16.0
 */
interface SWHighlightEvent extends NSCopying, NSObjectProtocol, NSSecureCoding {

	highlightURL: NSURL;
}
declare var SWHighlightEvent: {

	prototype: SWHighlightEvent;
};

/**
 * @since 16.0
 */
declare class SWHighlightMembershipEvent extends NSObject implements SWHighlightEvent {

	static alloc(): SWHighlightMembershipEvent; // inherited from NSObject

	static new(): SWHighlightMembershipEvent; // inherited from NSObject

	readonly membershipEventTrigger: SWHighlightMembershipEventTrigger;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly highlightURL: NSURL; // inherited from SWHighlightEvent

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { highlight: SWHighlight; trigger: SWHighlightMembershipEventTrigger; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHighlightTrigger(highlight: SWHighlight, trigger: SWHighlightMembershipEventTrigger): this;

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

/**
 * @since 16.0
 */
declare const enum SWHighlightMembershipEventTrigger {

	AddedCollaborator = 1,

	RemovedCollaborator = 2
}

/**
 * @since 16.0
 */
declare class SWHighlightMentionEvent extends NSObject implements SWHighlightEvent {

	static alloc(): SWHighlightMentionEvent; // inherited from NSObject

	static new(): SWHighlightMentionEvent; // inherited from NSObject

	readonly mentionedPersonHandle: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly highlightURL: NSURL; // inherited from SWHighlightEvent

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { highlight: SWHighlight; mentionedPersonCloudKitShareHandle: string; });

	constructor(o: { highlight: SWHighlight; mentionedPersonIdentity: SWPersonIdentity; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHighlightMentionedPersonCloudKitShareHandle(highlight: SWHighlight, handle: string): this;

	initWithHighlightMentionedPersonIdentity(highlight: SWHighlight, identity: SWPersonIdentity): this;

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

/**
 * @since 16.0
 */
declare class SWHighlightPersistenceEvent extends NSObject implements SWHighlightEvent {

	static alloc(): SWHighlightPersistenceEvent; // inherited from NSObject

	static new(): SWHighlightPersistenceEvent; // inherited from NSObject

	readonly persistenceEventTrigger: SWHighlightPersistenceEventTrigger;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly highlightURL: NSURL; // inherited from SWHighlightEvent

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { highlight: SWHighlight; trigger: SWHighlightPersistenceEventTrigger; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHighlightTrigger(highlight: SWHighlight, trigger: SWHighlightPersistenceEventTrigger): this;

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

/**
 * @since 16.0
 */
declare const enum SWHighlightPersistenceEventTrigger {

	Created = 1,

	Deleted = 2,

	Renamed = 3,

	Moved = 4
}

/**
 * @since 16.0
 */
declare class SWRemoveParticipantAlertController extends UIViewController {

	static alertControllerWithParticipantHighlight(participant: SWPerson, highlight: SWCollaborationHighlight): SWRemoveParticipantAlertController;

	static alloc(): SWRemoveParticipantAlertController; // inherited from NSObject

	static new(): SWRemoveParticipantAlertController; // inherited from NSObject
}
