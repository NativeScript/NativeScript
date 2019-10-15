
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

	previewControllerDidSaveEditedCopyOfPreviewItemAtURL?(controller: QLPreviewController, previewItem: QLPreviewItem, modifiedContentsURL: NSURL): void;

	previewControllerDidUpdateContentsOfPreviewItem?(controller: QLPreviewController, previewItem: QLPreviewItem): void;

	previewControllerEditingModeForPreviewItem?(controller: QLPreviewController, previewItem: QLPreviewItem): QLPreviewItemEditingMode;

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

declare const enum QLPreviewItemEditingMode {

	Disabled = 0,

	UpdateContents = 1,

	CreateCopy = 2
}

interface QLPreviewingController extends NSObjectProtocol {

	preparePreviewOfFileAtURLCompletionHandler?(url: NSURL, handler: (p1: NSError) => void): void;

	preparePreviewOfSearchableItemWithIdentifierQueryStringCompletionHandler?(identifier: string, queryString: string, handler: (p1: NSError) => void): void;
}
declare var QLPreviewingController: {

	prototype: QLPreviewingController;
};
