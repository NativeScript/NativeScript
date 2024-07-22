
/**
 * @since 11.0
 */
declare class QLFileThumbnailRequest extends NSObject {

	static alloc(): QLFileThumbnailRequest; // inherited from NSObject

	static new(): QLFileThumbnailRequest; // inherited from NSObject

	readonly fileURL: NSURL;

	readonly maximumSize: CGSize;

	readonly minimumSize: CGSize;

	readonly scale: number;
}

/**
 * @since 13.0
 */
declare const enum QLThumbnailError {

	GenerationFailed = 0,

	SavingToURLFailed = 1,

	NoCachedThumbnail = 2,

	NoCloudThumbnail = 3,

	RequestInvalid = 4,

	RequestCancelled = 5
}

/**
 * @since 13.0
 */
declare var QLThumbnailErrorDomain: string;

/**
 * @since 13.0
 */
declare class QLThumbnailGenerationRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): QLThumbnailGenerationRequest; // inherited from NSObject

	static new(): QLThumbnailGenerationRequest; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	contentType: UTType;

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

/**
 * @since 13.0
 */
declare const enum QLThumbnailGenerationRequestRepresentationTypes {

	Icon = 1,

	LowQualityThumbnail = 2,

	Thumbnail = 4,

	All = -1
}

/**
 * @since 13.0
 */
declare class QLThumbnailGenerator extends NSObject {

	static alloc(): QLThumbnailGenerator; // inherited from NSObject

	static new(): QLThumbnailGenerator; // inherited from NSObject

	static readonly sharedGenerator: QLThumbnailGenerator;

	cancelRequest(request: QLThumbnailGenerationRequest): void;

	generateBestRepresentationForRequestCompletionHandler(request: QLThumbnailGenerationRequest, completionHandler: (p1: QLThumbnailRepresentation, p2: NSError) => void): void;

	generateRepresentationsForRequestUpdateHandler(request: QLThumbnailGenerationRequest, updateHandler: (p1: QLThumbnailRepresentation, p2: QLThumbnailRepresentationType, p3: NSError) => void): void;

	saveBestRepresentationForRequestToFileAtURLAsContentTypeCompletionHandler(request: QLThumbnailGenerationRequest, fileURL: NSURL, contentType: UTType, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	saveBestRepresentationForRequestToFileAtURLWithContentTypeCompletionHandler(request: QLThumbnailGenerationRequest, fileURL: NSURL, contentType: string, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class QLThumbnailProvider extends NSObject {

	static alloc(): QLThumbnailProvider; // inherited from NSObject

	static new(): QLThumbnailProvider; // inherited from NSObject

	provideThumbnailForFileRequestCompletionHandler(request: QLFileThumbnailRequest, handler: (p1: QLThumbnailReply, p2: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class QLThumbnailReply extends NSObject {

	static alloc(): QLThumbnailReply; // inherited from NSObject

	static new(): QLThumbnailReply; // inherited from NSObject

	static replyWithContextSizeCurrentContextDrawingBlock(contextSize: CGSize, drawingBlock: () => boolean): QLThumbnailReply;

	static replyWithContextSizeDrawingBlock(contextSize: CGSize, drawingBlock: (p1: any) => boolean): QLThumbnailReply;

	static replyWithImageFileURL(fileURL: NSURL): QLThumbnailReply;

	/**
	 * @since 15.0
	 */
	extensionBadge: string;
}

/**
 * @since 13.0
 */
declare class QLThumbnailRepresentation extends NSObject {

	static alloc(): QLThumbnailRepresentation; // inherited from NSObject

	static new(): QLThumbnailRepresentation; // inherited from NSObject

	readonly CGImage: any;

	readonly UIImage: UIImage;

	/**
	 * @since 15.0
	 */
	readonly contentRect: CGRect;

	readonly type: QLThumbnailRepresentationType;
}

/**
 * @since 13.0
 */
declare const enum QLThumbnailRepresentationType {

	Icon = 0,

	LowQualityThumbnail = 1,

	Thumbnail = 2
}
