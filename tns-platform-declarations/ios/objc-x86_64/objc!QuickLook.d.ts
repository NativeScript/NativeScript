
declare class QLFileThumbnailRequest extends NSObject {

	static alloc(): QLFileThumbnailRequest; // inherited from NSObject

	static new(): QLFileThumbnailRequest; // inherited from NSObject

	readonly fileURL: NSURL;

	readonly maximumSize: CGSize;

	readonly minimumSize: CGSize;

	readonly scale: number;
}

declare class QLPreviewController extends UIViewController {

	static alloc(): QLPreviewController; // inherited from NSObject

	static canPreviewItem(item: QLPreviewItem): boolean;

	static new(): QLPreviewController; // inherited from NSObject

	readonly currentPreviewItem: QLPreviewItem;

	currentPreviewItemIndex: number;

	dataSource: QLPreviewControllerDataSource;

	delegate: QLPreviewControllerDelegate;

	refreshCurrentPreviewItem(): void;

	reloadData(): void;
}

interface QLPreviewControllerDataSource {

	numberOfPreviewItemsInPreviewController(controller: QLPreviewController): number;

	previewControllerPreviewItemAtIndex(controller: QLPreviewController, index: number): QLPreviewItem;
}
declare var QLPreviewControllerDataSource: {

	prototype: QLPreviewControllerDataSource;
};

interface QLPreviewControllerDelegate extends NSObjectProtocol {

	previewControllerDidDismiss?(controller: QLPreviewController): void;

	previewControllerFrameForPreviewItemInSourceView?(controller: QLPreviewController, item: QLPreviewItem, view: interop.Pointer | interop.Reference<UIView>): CGRect;

	previewControllerShouldOpenURLForPreviewItem?(controller: QLPreviewController, url: NSURL, item: QLPreviewItem): boolean;

	previewControllerTransitionImageForPreviewItemContentRect?(controller: QLPreviewController, item: QLPreviewItem, contentRect: interop.Pointer | interop.Reference<CGRect>): UIImage;

	previewControllerTransitionViewForPreviewItem?(controller: QLPreviewController, item: QLPreviewItem): UIView;

	previewControllerWillDismiss?(controller: QLPreviewController): void;
}
declare var QLPreviewControllerDelegate: {

	prototype: QLPreviewControllerDelegate;
};

interface QLPreviewItem extends NSObjectProtocol {

	previewItemTitle?: string;

	previewItemURL: NSURL;
}
declare var QLPreviewItem: {

	prototype: QLPreviewItem;
};

interface QLPreviewingController extends NSObjectProtocol {

	preparePreviewOfFileAtURLCompletionHandler?(url: NSURL, handler: (p1: NSError) => void): void;

	preparePreviewOfSearchableItemWithIdentifierQueryStringCompletionHandler?(identifier: string, queryString: string, handler: (p1: NSError) => void): void;
}
declare var QLPreviewingController: {

	prototype: QLPreviewingController;
};

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
