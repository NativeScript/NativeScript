
declare const enum GSSyncState {

	Ready = 0,

	Offline = 1,

	Local = 2,

	Syncing = 3,

	Conflicted = 4,

	Error = 5,

	Closed = 6
}

declare class GSSyncedDirectory extends NSObject {

	static alloc(): GSSyncedDirectory; // inherited from NSObject

	static new(): GSSyncedDirectory; // inherited from NSObject

	static openDirectoryForContainerIdentifier(containerIdentifier: string): GSSyncedDirectory;

	readonly directoryState: GSSyncedDirectoryState;

	close(): void;

	finishSyncingCompletionHandler(statusDisplay: UIWindow, completion: () => void): void;

	finishSyncingWithCompletionHandler(completion: () => void): void;

	resolveConflictsWithVersion(version: GSSyncedDirectoryVersion): void;

	triggerPendingUploadWithCompletionHandler(completion: (p1: boolean) => void): void;
}

declare class GSSyncedDirectoryState extends NSObject {

	static alloc(): GSSyncedDirectoryState; // inherited from NSObject

	static new(): GSSyncedDirectoryState; // inherited from NSObject

	readonly conflictedVersions: NSArray<GSSyncedDirectoryVersion>;

	readonly error: NSError;

	readonly state: GSSyncState;

	readonly url: NSURL;
}

declare class GSSyncedDirectoryVersion extends NSObject {

	static alloc(): GSSyncedDirectoryVersion; // inherited from NSObject

	static new(): GSSyncedDirectoryVersion; // inherited from NSObject

	readonly isLocal: boolean;

	readonly localizedNameOfSavingComputer: string;

	readonly modifiedDate: Date;

	readonly url: NSURL;
}

declare var GameSaveVersionNumber: number;

declare var GameSaveVersionString: interop.Reference<number>;
