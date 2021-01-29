
declare class CLKWatchFaceLibrary extends NSObject {

	static alloc(): CLKWatchFaceLibrary; // inherited from NSObject

	static new(): CLKWatchFaceLibrary; // inherited from NSObject

	addWatchFaceAtURLCompletionHandler(fileURL: NSURL, handler: (p1: NSError) => void): void;
}

declare const enum CLKWatchFaceLibraryErrorCode {

	NotFileURL = 1,

	InvalidFile = 2,

	PermissionDenied = 3,

	FaceNotAvailable = 4
}

declare var CLKWatchFaceLibraryErrorDomain: string;
