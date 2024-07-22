
/**
 * @since 8.0
 */
declare class SLComposeServiceViewController extends UIViewController implements UITextViewDelegate {

	static alloc(): SLComposeServiceViewController; // inherited from NSObject

	static new(): SLComposeServiceViewController; // inherited from NSObject

	autoCompletionViewController: UIViewController;

	charactersRemaining: number;

	readonly contentText: string;

	placeholder: string;

	readonly textView: UITextView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	cancel(): void;

	class(): typeof NSObject;

	configurationItems(): NSArray<any>;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didSelectCancel(): void;

	didSelectPost(): void;

	isContentValid(): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadPreviewView(): UIView;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	popConfigurationViewController(): void;

	presentationAnimationDidFinish(): void;

	pushConfigurationViewController(viewController: UIViewController): void;

	reloadConfigurationItems(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	/**
	 * @since 5.0
	 */
	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	self(): this;

	textViewDidBeginEditing(textView: UITextView): void;

	/**
	 * @since 18.0
	 */
	textViewDidBeginFormattingWithViewController(textView: UITextView, viewController: UITextFormattingViewController): void;

	textViewDidChange(textView: UITextView): void;

	textViewDidChangeSelection(textView: UITextView): void;

	textViewDidEndEditing(textView: UITextView): void;

	/**
	 * @since 18.0
	 */
	textViewDidEndFormattingWithViewController(textView: UITextView, viewController: UITextFormattingViewController): void;

	/**
	 * @since 16.0
	 */
	textViewEditMenuForTextInRangeSuggestedActions(textView: UITextView, range: NSRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	/**
	 * @since 17.0
	 */
	textViewMenuConfigurationForTextItemDefaultMenu(textView: UITextView, textItem: UITextItem, defaultMenu: UIMenu): UITextItemMenuConfiguration;

	/**
	 * @since 17.0
	 */
	textViewPrimaryActionForTextItemDefaultAction(textView: UITextView, textItem: UITextItem, defaultAction: UIAction): UIAction;

	textViewShouldBeginEditing(textView: UITextView): boolean;

	textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, text: string): boolean;

	textViewShouldEndEditing(textView: UITextView): boolean;

	/**
	 * @since 7.0
	 * @deprecated 10.0
	 */
	textViewShouldInteractWithTextAttachmentInRange(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange): boolean;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	textViewShouldInteractWithTextAttachmentInRangeInteraction(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	/**
	 * @since 7.0
	 * @deprecated 10.0
	 */
	textViewShouldInteractWithURLInRange(textView: UITextView, URL: NSURL, characterRange: NSRange): boolean;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	textViewShouldInteractWithURLInRangeInteraction(textView: UITextView, URL: NSURL, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	/**
	 * @since 17.0
	 */
	textViewTextItemMenuWillDisplayForTextItemAnimator(textView: UITextView, textItem: UITextItem, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 17.0
	 */
	textViewTextItemMenuWillEndForTextItemAnimator(textView: UITextView, textItem: UITextItem, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 18.0
	 */
	textViewWillBeginFormattingWithViewController(textView: UITextView, viewController: UITextFormattingViewController): void;

	/**
	 * @since 16.0
	 */
	textViewWillDismissEditMenuWithAnimator(textView: UITextView, animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 18.0
	 */
	textViewWillEndFormattingWithViewController(textView: UITextView, viewController: UITextFormattingViewController): void;

	/**
	 * @since 16.0
	 */
	textViewWillPresentEditMenuWithAnimator(textView: UITextView, animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 18.0
	 */
	textViewWritingToolsDidEnd(textView: UITextView): void;

	/**
	 * @since 18.0
	 */
	textViewWritingToolsIgnoredRangesInEnclosingRange(textView: UITextView, enclosingRange: NSRange): NSArray<NSValue>;

	/**
	 * @since 18.0
	 */
	textViewWritingToolsWillBegin(textView: UITextView): void;

	validateContent(): void;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

/**
 * @since 8.0
 */
declare class SLComposeSheetConfigurationItem extends NSObject {

	static alloc(): SLComposeSheetConfigurationItem; // inherited from NSObject

	static new(): SLComposeSheetConfigurationItem; // inherited from NSObject

	tapHandler: () => void;

	title: string;

	value: string;

	valuePending: boolean;
}

/**
 * @since 6.0
 */
declare class SLComposeViewController extends UIViewController {

	static alloc(): SLComposeViewController; // inherited from NSObject

	static composeViewControllerForServiceType(serviceType: string): SLComposeViewController;

	static isAvailableForServiceType(serviceType: string): boolean;

	static new(): SLComposeViewController; // inherited from NSObject

	completionHandler: (p1: SLComposeViewControllerResult) => void;

	readonly serviceType: string;

	addImage(image: UIImage): boolean;

	addURL(url: NSURL): boolean;

	removeAllImages(): boolean;

	removeAllURLs(): boolean;

	setInitialText(text: string): boolean;
}

declare const enum SLComposeViewControllerResult {

	Cancelled = 0,

	Done = 1
}

/**
 * @since 6.0
 */
declare class SLRequest extends NSObject {

	static alloc(): SLRequest; // inherited from NSObject

	static new(): SLRequest; // inherited from NSObject

	static requestForServiceTypeRequestMethodURLParameters(serviceType: string, requestMethod: SLRequestMethod, url: NSURL, parameters: NSDictionary<any, any>): SLRequest;

	readonly URL: NSURL;

	account: ACAccount;

	readonly parameters: NSDictionary<any, any>;

	readonly requestMethod: SLRequestMethod;

	addMultipartDataWithNameTypeFilename(data: NSData, name: string, type: string, filename: string): void;

	performRequestWithHandler(handler: (p1: NSData, p2: NSHTTPURLResponse, p3: NSError) => void): void;

	preparedURLRequest(): NSURLRequest;
}

declare const enum SLRequestMethod {

	GET = 0,

	POST = 1,

	DELETE = 2,

	PUT = 3
}

/**
 * @since 6.0
 * @deprecated 11.0
 */
declare var SLServiceTypeFacebook: string;

/**
 * @since 6.0
 * @deprecated 11.0
 */
declare var SLServiceTypeLinkedIn: string;

/**
 * @since 6.0
 * @deprecated 11.0
 */
declare var SLServiceTypeSinaWeibo: string;

/**
 * @since 6.0
 * @deprecated 11.0
 */
declare var SLServiceTypeTencentWeibo: string;

/**
 * @since 6.0
 * @deprecated 11.0
 */
declare var SLServiceTypeTwitter: string;
