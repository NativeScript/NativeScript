
declare class QLFileThumbnailRequest extends NSObject {

	static alloc(): QLFileThumbnailRequest; // inherited from NSObject

	static new(): QLFileThumbnailRequest; // inherited from NSObject

	readonly fileURL: NSURL;

	readonly maximumSize: CGSize;

	readonly minimumSize: CGSize;

	readonly scale: number;
}

declare const enum QLThumbnailError {

	GenerationFailed = 0,

	SavingToURLFailed = 1,

	NoCachedThumbnail = 2,

	NoCloudThumbnail = 3,

	RequestInvalid = 4,

	RequestCancelled = 5
}

declare var QLThumbnailErrorDomain: string;

declare class QLThumbnailGenerationRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): QLThumbnailGenerationRequest; // inherited from NSObject

	static new(): QLThumbnailGenerationRequest; // inherited from NSObject

	iconMode: boolean;

	minimumDimension: number;

	readonly representationTypes: QLThumbnailGenerationRequestRepresentationTypes;

	readonly scale: number;

	readonly size: CGSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fileAtURL: NSURL; size: CGSize; scale: number; representationTypes: QLThumbnailGenerationRequestRepresentationTypes; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithFileAtURLSizeScaleRepresentationTypes(url: NSURL, size: CGSize, scale: number, representationTypes: QLThumbnailGenerationRequestRepresentationTypes): this;
}

declare const enum QLThumbnailGenerationRequestRepresentationTypes {

	Icon = 1,

	LowQualityThumbnail = 2,

	Thumbnail = 4,

	All = -1
}

declare class QLThumbnailGenerator extends NSObject {

	static alloc(): QLThumbnailGenerator; // inherited from NSObject

	static new(): QLThumbnailGenerator; // inherited from NSObject

	static readonly sharedGenerator: QLThumbnailGenerator;

	cancelRequest(request: QLThumbnailGenerationRequest): void;

	generateBestRepresentationForRequestCompletionHandler(request: QLThumbnailGenerationRequest, completionHandler: (p1: QLThumbnailRepresentation, p2: NSError) => void): void;

	generateRepresentationsForRequestUpdateHandler(request: QLThumbnailGenerationRequest, updateHandler: (p1: QLThumbnailRepresentation, p2: QLThumbnailRepresentationType, p3: NSError) => void): void;

	saveBestRepresentationForRequestToFileAtURLWithContentTypeCompletionHandler(request: QLThumbnailGenerationRequest, fileURL: NSURL, contentType: string, completionHandler: (p1: NSError) => void): void;
}

declare class QLThumbnailProvider extends NSObject {

	static alloc(): QLThumbnailProvider; // inherited from NSObject

	static new(): QLThumbnailProvider; // inherited from NSObject

	provideThumbnailForFileRequestCompletionHandler(request: QLFileThumbnailRequest, handler: (p1: QLThumbnailReply, p2: NSError) => void): void;
}

declare class QLThumbnailReply extends NSObject {

	static alloc(): QLThumbnailReply; // inherited from NSObject

	static new(): QLThumbnailReply; // inherited from NSObject

	static replyWithContextSizeCurrentContextDrawingBlock(contextSize: CGSize, drawingBlock: () => boolean): QLThumbnailReply;

	static replyWithContextSizeDrawingBlock(contextSize: CGSize, drawingBlock: (p1: any) => boolean): QLThumbnailReply;

	static replyWithImageFileURL(fileURL: NSURL): QLThumbnailReply;
}

declare class QLThumbnailRepresentation extends NSObject {

	static alloc(): QLThumbnailRepresentation; // inherited from NSObject

	static new(): QLThumbnailRepresentation; // inherited from NSObject

	readonly CGImage: any;

	readonly UIImage: UIImage;

	readonly type: QLThumbnailRepresentationType;
}

declare const enum QLThumbnailRepresentationType {

	Icon = 0,

	LowQualityThumbnail = 1,

	Thumbnail = 2
}
