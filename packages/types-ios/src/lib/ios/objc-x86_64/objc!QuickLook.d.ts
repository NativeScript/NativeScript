
declare class QLFilePreviewRequest extends NSObject {

	static alloc(): QLFilePreviewRequest; // inherited from NSObject

	static new(): QLFilePreviewRequest; // inherited from NSObject

	readonly fileURL: NSURL;
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

declare class QLPreviewProvider extends NSObject implements NSExtensionRequestHandling {

	static alloc(): QLPreviewProvider; // inherited from NSObject

	static new(): QLPreviewProvider; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

declare class QLPreviewReply extends NSObject {

	static alloc(): QLPreviewReply; // inherited from NSObject

	static new(): QLPreviewReply; // inherited from NSObject

	attachments: NSDictionary<string, QLPreviewReplyAttachment>;

	stringEncoding: number;

	title: string;

	constructor(o: { forPDFWithPageSize: CGSize; documentCreationBlock: (p1: QLPreviewReply, p2: interop.Pointer | interop.Reference<NSError>) => PDFDocument; });

	constructor(o: { contextSize: CGSize; isBitmap: boolean; drawingBlock: (p1: any, p2: QLPreviewReply, p3: interop.Pointer | interop.Reference<NSError>) => boolean; });

	constructor(o: { dataOfContentType: UTType; contentSize: CGSize; dataCreationBlock: (p1: QLPreviewReply, p2: interop.Pointer | interop.Reference<NSError>) => NSData; });

	constructor(o: { fileURL: NSURL; });

	initForPDFWithPageSizeDocumentCreationBlock(defaultPageSize: CGSize, documentCreationBlock: (p1: QLPreviewReply, p2: interop.Pointer | interop.Reference<NSError>) => PDFDocument): this;

	initWithContextSizeIsBitmapDrawingBlock(contextSize: CGSize, isBitmap: boolean, drawingBlock: (p1: any, p2: QLPreviewReply, p3: interop.Pointer | interop.Reference<NSError>) => boolean): this;

	initWithDataOfContentTypeContentSizeDataCreationBlock(contentType: UTType, contentSize: CGSize, dataCreationBlock: (p1: QLPreviewReply, p2: interop.Pointer | interop.Reference<NSError>) => NSData): this;

	initWithFileURL(fileURL: NSURL): this;
}

declare class QLPreviewReplyAttachment extends NSObject {

	static alloc(): QLPreviewReplyAttachment; // inherited from NSObject

	static new(): QLPreviewReplyAttachment; // inherited from NSObject

	readonly contentType: UTType;

	readonly data: NSData;

	constructor(o: { data: NSData; contentType: UTType; });

	initWithDataContentType(data: NSData, contentType: UTType): this;
}

declare class QLPreviewSceneActivationConfiguration extends UIWindowSceneActivationConfiguration {

	static alloc(): QLPreviewSceneActivationConfiguration; // inherited from NSObject

	static new(): QLPreviewSceneActivationConfiguration; // inherited from NSObject

	constructor(o: { itemsAtURLs: NSArray<NSURL> | NSURL[]; options: QLPreviewSceneOptions; });

	initWithItemsAtURLsOptions(urls: NSArray<NSURL> | NSURL[], options: QLPreviewSceneOptions): this;
}

declare class QLPreviewSceneOptions extends NSObject {

	static alloc(): QLPreviewSceneOptions; // inherited from NSObject

	static new(): QLPreviewSceneOptions; // inherited from NSObject

	initialPreviewIndex: number;
}

interface QLPreviewingController extends NSObjectProtocol {

	preparePreviewOfFileAtURLCompletionHandler?(url: NSURL, handler: (p1: NSError) => void): void;

	preparePreviewOfSearchableItemWithIdentifierQueryStringCompletionHandler?(identifier: string, queryString: string, handler: (p1: NSError) => void): void;

	providePreviewForFileRequestCompletionHandler?(request: QLFilePreviewRequest, handler: (p1: QLPreviewReply, p2: NSError) => void): void;
}
declare var QLPreviewingController: {

	prototype: QLPreviewingController;
};
