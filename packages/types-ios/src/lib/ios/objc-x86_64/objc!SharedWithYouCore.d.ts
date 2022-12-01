
declare class SWAction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWAction; // inherited from NSObject

	static new(): SWAction; // inherited from NSObject

	readonly complete: boolean;

	readonly uuid: NSUUID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fail(): void;

	fulfill(): void;

	initWithCoder(coder: NSCoder): this;
}

interface SWCollaborationActionHandler extends NSObjectProtocol {

	collaborationCoordinatorHandleStartCollaborationAction(coordinator: SWCollaborationCoordinator, action: SWStartCollaborationAction): void;

	collaborationCoordinatorHandleUpdateCollaborationParticipantsAction(coordinator: SWCollaborationCoordinator, action: SWUpdateCollaborationParticipantsAction): void;
}
declare var SWCollaborationActionHandler: {

	prototype: SWCollaborationActionHandler;
};

declare class SWCollaborationCoordinator extends NSObject {

	static alloc(): SWCollaborationCoordinator; // inherited from NSObject

	static new(): SWCollaborationCoordinator; // inherited from NSObject

	actionHandler: SWCollaborationActionHandler;

	static readonly sharedCoordinator: SWCollaborationCoordinator;
}

declare class SWCollaborationMetadata extends NSObject implements NSCopying, NSItemProviderReading, NSItemProviderWriting, NSMutableCopying, NSSecureCoding {

	static alloc(): SWCollaborationMetadata; // inherited from NSObject

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): SWCollaborationMetadata; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): SWCollaborationMetadata;

	readonly collaborationIdentifier: string;

	defaultShareOptions: SWCollaborationShareOptions;

	initiatorHandle: string;

	initiatorNameComponents: NSPersonNameComponents;

	readonly localIdentifier: string;

	title: string;

	userSelectedShareOptions: SWCollaborationShareOptions;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { collaborationIdentifier: string; });

	constructor(o: { localIdentifier: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCollaborationIdentifier(collaborationIdentifier: string): this;

	initWithLocalIdentifier(localIdentifier: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class SWCollaborationOption extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWCollaborationOption; // inherited from NSObject

	static new(): SWCollaborationOption; // inherited from NSObject

	static optionWithTitleIdentifier(title: string, identifier: string): SWCollaborationOption;

	readonly identifier: string;

	requiredOptionsIdentifiers: NSArray<string>;

	selected: boolean;

	subtitle: string;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; identifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleIdentifier(title: string, identifier: string): this;
}

declare class SWCollaborationOptionsGroup extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWCollaborationOptionsGroup; // inherited from NSObject

	static new(): SWCollaborationOptionsGroup; // inherited from NSObject

	static optionsGroupWithIdentifierOptions(identifier: string, options: NSArray<SWCollaborationOption> | SWCollaborationOption[]): SWCollaborationOptionsGroup;

	footer: string;

	readonly identifier: string;

	options: NSArray<SWCollaborationOption>;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; options: NSArray<SWCollaborationOption> | SWCollaborationOption[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierOptions(identifier: string, options: NSArray<SWCollaborationOption> | SWCollaborationOption[]): this;
}

declare class SWCollaborationOptionsPickerGroup extends SWCollaborationOptionsGroup {

	static alloc(): SWCollaborationOptionsPickerGroup; // inherited from NSObject

	static new(): SWCollaborationOptionsPickerGroup; // inherited from NSObject

	selectedOptionIdentifier: string;
}

declare class SWCollaborationShareOptions extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWCollaborationShareOptions; // inherited from NSObject

	static new(): SWCollaborationShareOptions; // inherited from NSObject

	static shareOptionsWithOptionsGroups(optionsGroups: NSArray<SWCollaborationOptionsGroup> | SWCollaborationOptionsGroup[]): SWCollaborationShareOptions;

	static shareOptionsWithOptionsGroupsSummary(optionsGroups: NSArray<SWCollaborationOptionsGroup> | SWCollaborationOptionsGroup[], summary: string): SWCollaborationShareOptions;

	optionsGroups: NSArray<SWCollaborationOptionsGroup>;

	summary: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { optionsGroups: NSArray<SWCollaborationOptionsGroup> | SWCollaborationOptionsGroup[]; });

	constructor(o: { optionsGroups: NSArray<SWCollaborationOptionsGroup> | SWCollaborationOptionsGroup[]; summary: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithOptionsGroups(optionsGroups: NSArray<SWCollaborationOptionsGroup> | SWCollaborationOptionsGroup[]): this;

	initWithOptionsGroupsSummary(optionsGroups: NSArray<SWCollaborationOptionsGroup> | SWCollaborationOptionsGroup[], summary: string): this;
}

declare class SWPerson extends NSObject implements NSSecureCoding {

	static alloc(): SWPerson; // inherited from NSObject

	static new(): SWPerson; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { handle: string; identity: SWPersonIdentity; displayName: string; thumbnailImageData: NSData; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHandleIdentityDisplayNameThumbnailImageData(handle: string, identity: SWPersonIdentity, displayName: string, thumbnailImageData: NSData): this;
}

declare class SWPersonIdentity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWPersonIdentity; // inherited from NSObject

	static new(): SWPersonIdentity; // inherited from NSObject

	readonly rootHash: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { rootHash: NSData; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRootHash(rootHash: NSData): this;
}

declare class SWPersonIdentityProof extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SWPersonIdentityProof; // inherited from NSObject

	static new(): SWPersonIdentityProof; // inherited from NSObject

	readonly inclusionHashes: NSArray<NSData>;

	readonly publicKey: NSData;

	readonly publicKeyIndex: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SWSignedPersonIdentityProof extends SWPersonIdentityProof {

	static alloc(): SWSignedPersonIdentityProof; // inherited from NSObject

	static new(): SWSignedPersonIdentityProof; // inherited from NSObject

	readonly signatureData: NSData;

	constructor(o: { personIdentityProof: SWPersonIdentityProof; signatureData: NSData; });

	initWithPersonIdentityProofSignatureData(personIdentityProof: SWPersonIdentityProof, data: NSData): this;
}

declare class SWStartCollaborationAction extends SWAction implements NSCopying, NSSecureCoding {

	static alloc(): SWStartCollaborationAction; // inherited from NSObject

	static new(): SWStartCollaborationAction; // inherited from NSObject

	readonly collaborationMetadata: SWCollaborationMetadata;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fulfillUsingURLCollaborationIdentifier(url: NSURL, collaborationIdentifier: string): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SWUpdateCollaborationParticipantsAction extends SWAction implements NSCopying, NSSecureCoding {

	static alloc(): SWUpdateCollaborationParticipantsAction; // inherited from NSObject

	static new(): SWUpdateCollaborationParticipantsAction; // inherited from NSObject

	readonly addedIdentities: NSArray<SWPersonIdentity>;

	readonly collaborationMetadata: SWCollaborationMetadata;

	readonly removedIdentities: NSArray<SWPersonIdentity>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SharedWithYouCoreVersionNumber: number;

declare var SharedWithYouCoreVersionString: interop.Reference<number>;

declare var UTCollaborationOptionsTypeIdentifier: string;
