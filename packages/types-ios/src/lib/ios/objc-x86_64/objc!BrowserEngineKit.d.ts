
declare class BEAutoFillTextSuggestion extends BETextSuggestion {

	static alloc(): BEAutoFillTextSuggestion; // inherited from NSObject

	static new(): BEAutoFillTextSuggestion; // inherited from NSObject

	readonly contents: NSDictionary<string, string>;
}

declare class BEContextMenuConfiguration extends UIContextMenuConfiguration {

	static alloc(): BEContextMenuConfiguration; // inherited from NSObject

	static configurationWithIdentifierPreviewProviderActionProvider(identifier: any, previewProvider: () => UIViewController, actionProvider: (p1: NSArray<UIMenuElement>) => UIMenu): BEContextMenuConfiguration; // inherited from UIContextMenuConfiguration

	static new(): BEContextMenuConfiguration; // inherited from NSObject

	fulfillUsingConfiguration(configuration: UIContextMenuConfiguration): boolean;
}

interface BEDirectionalTextRange {
	offset: number;
	length: number;
}
declare var BEDirectionalTextRange: interop.StructType<BEDirectionalTextRange>;

declare class BEDragInteraction extends UIDragInteraction {

	static alloc(): BEDragInteraction; // inherited from NSObject

	static new(): BEDragInteraction; // inherited from NSObject

	readonly delegate: BEDragInteractionDelegate;

	constructor(o: { delegate: BEDragInteractionDelegate; });

	initWithDelegate(delegate: BEDragInteractionDelegate): this;
}

interface BEDragInteractionDelegate extends UIDragInteractionDelegate {

	dragInteractionItemsForAddingToSessionForTouchAtPointCompletion?(dragInteraction: BEDragInteraction, session: UIDragSession, point: CGPoint, completion: (p1: NSArray<UIDragItem>) => boolean): void;

	dragInteractionPrepareDragSessionCompletion?(dragInteraction: BEDragInteraction, session: UIDragSession, completion: () => boolean): void;
}
declare var BEDragInteractionDelegate: {

	prototype: BEDragInteractionDelegate;
};

interface BEExtendedTextInputTraits extends UITextInputTraits {

	insertionPointColor?: UIColor;

	selectionHandleColor?: UIColor;

	selectionHighlightColor?: UIColor;

	singleLineDocument?: boolean;

	typingAdaptationEnabled?: boolean;
}
declare var BEExtendedTextInputTraits: {

	prototype: BEExtendedTextInputTraits;
};

declare const enum BEGestureType {

	Loupe = 0,

	OneFingerTap = 1,

	DoubleTapAndHold = 2,

	DoubleTap = 3,

	OneFingerDoubleTap = 8,

	OneFingerTripleTap = 9,

	TwoFingerSingleTap = 10,

	TwoFingerRangedSelectGesture = 11,

	IMPhraseBoundaryDrag = 14,

	ForceTouch = 15
}

declare class BEKeyEntry extends NSObject {

	static alloc(): BEKeyEntry; // inherited from NSObject

	static new(): BEKeyEntry; // inherited from NSObject

	readonly key: UIKey;

	readonly keyRepeating: boolean;

	readonly state: BEKeyPressState;

	readonly timestamp: number;
}

declare class BEKeyEntryContext extends NSObject {

	static alloc(): BEKeyEntryContext; // inherited from NSObject

	static new(): BEKeyEntryContext; // inherited from NSObject

	documentEditable: boolean;

	readonly keyEntry: BEKeyEntry;

	shouldEvaluateForInputSystemHandling: boolean;

	shouldInsertCharacter: boolean;

	constructor(o: { keyEntry: BEKeyEntry; });

	initWithKeyEntry(keyEntry: BEKeyEntry): this;
}

declare const enum BEKeyModifierFlags {

	None = 0,

	Shift = 1,

	CapsLock = 2
}

declare const enum BEKeyPressState {

	Down = 1,

	Up = 2
}

declare class BELayerHierarchy extends NSObject {

	static alloc(): BELayerHierarchy; // inherited from NSObject

	static layerHierarchyWithError(): BELayerHierarchy;

	static new(): BELayerHierarchy; // inherited from NSObject

	readonly handle: BELayerHierarchyHandle;

	layer: CALayer;

	invalidate(): void;
}

declare class BELayerHierarchyHandle extends NSObject implements NSSecureCoding {

	static alloc(): BELayerHierarchyHandle; // inherited from NSObject

	static handleWithXPCRepresentationError(xpcRepresentation: interop.Pointer | interop.Reference<any>): BELayerHierarchyHandle;

	static new(): BELayerHierarchyHandle; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	createXPCRepresentation(): interop.Pointer | interop.Reference<any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class BELayerHierarchyHostingTransactionCoordinator extends NSObject implements NSSecureCoding {

	static alloc(): BELayerHierarchyHostingTransactionCoordinator; // inherited from NSObject

	static coordinatorWithError(): BELayerHierarchyHostingTransactionCoordinator;

	static coordinatorWithXPCRepresentationError(xpcRepresentation: interop.Pointer | interop.Reference<any>): BELayerHierarchyHostingTransactionCoordinator;

	static new(): BELayerHierarchyHostingTransactionCoordinator; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addLayerHierarchy(layerHierarchy: BELayerHierarchy): void;

	addLayerHierarchyHostingView(hostingView: BELayerHierarchyHostingView): void;

	commit(): void;

	createXPCRepresentation(): interop.Pointer | interop.Reference<any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class BELayerHierarchyHostingView extends UIView {

	static alloc(): BELayerHierarchyHostingView; // inherited from NSObject

	static appearance(): BELayerHierarchyHostingView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): BELayerHierarchyHostingView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): BELayerHierarchyHostingView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BELayerHierarchyHostingView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): BELayerHierarchyHostingView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BELayerHierarchyHostingView; // inherited from UIAppearance

	static new(): BELayerHierarchyHostingView; // inherited from NSObject

	handle: BELayerHierarchyHandle;
}

declare class BEMediaEnvironment extends NSObject {

	static alloc(): BEMediaEnvironment; // inherited from NSObject

	static new(): BEMediaEnvironment; // inherited from NSObject

	constructor(o: { webPageURL: NSURL; });

	constructor(o: { XPCRepresentation: interop.Pointer | interop.Reference<any>; });

	activateWithError(): boolean;

	createXPCRepresentation(): interop.Pointer | interop.Reference<any>;

	initWithWebPageURL(url: NSURL): this;

	initWithXPCRepresentationError(xpcRepresentation: interop.Pointer | interop.Reference<any>): this;

	makeCaptureSessionWithError(): AVCaptureSession;

	suspendWithError(): boolean;
}

declare class BENetworkingProcess extends NSObject {

	static alloc(): BENetworkingProcess; // inherited from NSObject

	static networkProcessWithInterruptionHandlerCompletion(interruptionHandler: () => void, completion: (p1: BENetworkingProcess, p2: NSError) => void): void;

	static new(): BENetworkingProcess; // inherited from NSObject

	grantCapabilityError(capability: BEProcessCapability): BEProcessCapabilityGrant;

	invalidate(): void;

	makeLibXPCConnectionError(): interop.Pointer | interop.Reference<any>;
}

declare class BEProcessCapability extends NSObject {

	static alloc(): BEProcessCapability; // inherited from NSObject

	static background(): BEProcessCapability;

	static foreground(): BEProcessCapability;

	static mediaPlaybackAndCaptureWithEnvironment(environment: BEMediaEnvironment): BEProcessCapability;

	static new(): BEProcessCapability; // inherited from NSObject

	static suspended(): BEProcessCapability;

	requestWithError(): BEProcessCapabilityGrant;
}

interface BEProcessCapabilityGrant extends NSObjectProtocol {

	valid: boolean;

	invalidate(): boolean;
}
declare var BEProcessCapabilityGrant: {

	prototype: BEProcessCapabilityGrant;
};

declare class BERenderingProcess extends NSObject {

	static alloc(): BERenderingProcess; // inherited from NSObject

	static new(): BERenderingProcess; // inherited from NSObject

	static renderingProcessWithInterruptionHandlerCompletion(interruptionHandler: () => void, completion: (p1: BERenderingProcess, p2: NSError) => void): void;

	createVisibilityPropagationInteraction(): UIInteraction;

	grantCapabilityError(capability: BEProcessCapability): BEProcessCapabilityGrant;

	invalidate(): void;

	makeLibXPCConnectionError(): interop.Pointer | interop.Reference<any>;
}

interface BEResponderEditActions extends UIResponderStandardEditActions {

	addShortcut?(sender: any): void;

	findSelected?(sender: any): void;

	lookup?(sender: any): void;

	promptForReplace?(sender: any): void;

	replace?(sender: any): void;

	share?(sender: any): void;

	translate?(sender: any): void;

	transliterateChinese?(sender: any): void;
}
declare var BEResponderEditActions: {

	prototype: BEResponderEditActions;
};

declare class BEScrollView extends UIScrollView {

	static alloc(): BEScrollView; // inherited from NSObject

	static appearance(): BEScrollView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): BEScrollView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): BEScrollView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BEScrollView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): BEScrollView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): BEScrollView; // inherited from UIAppearance

	static new(): BEScrollView; // inherited from NSObject

	delegate: BEScrollViewDelegate;
}

interface BEScrollViewDelegate extends UIScrollViewDelegate {

	parentScrollViewForScrollView?(scrollView: BEScrollView): BEScrollView;

	scrollViewHandleScrollUpdateCompletion?(scrollView: BEScrollView, scrollUpdate: BEScrollViewScrollUpdate, completion: (p1: boolean) => void): void;
}
declare var BEScrollViewDelegate: {

	prototype: BEScrollViewDelegate;
};

declare class BEScrollViewScrollUpdate extends NSObject {

	static alloc(): BEScrollViewScrollUpdate; // inherited from NSObject

	static new(): BEScrollViewScrollUpdate; // inherited from NSObject

	readonly phase: BEScrollViewScrollUpdatePhase;

	readonly timestamp: number;

	locationInView(view: UIView): CGPoint;

	translationInView(view: UIView): CGPoint;
}

declare const enum BEScrollViewScrollUpdatePhase {

	Began = 0,

	Changed = 1,

	Ended = 2,

	Cancelled = 3
}

declare const enum BESelectionFlags {

	SelectionFlagsNone = 0,

	WordIsNearTap = 1,

	SelectionFlipped = 2,

	PhraseBoundaryChanged = 4
}

declare const enum BESelectionTouchPhase {

	Started = 0,

	Moved = 1,

	Ended = 2,

	EndedMovingForward = 3,

	EndedMovingBackward = 4,

	EndedNotMoving = 5
}

declare class BETextAlternatives extends NSObject {

	static alloc(): BETextAlternatives; // inherited from NSObject

	static new(): BETextAlternatives; // inherited from NSObject

	readonly alternativeStrings: NSArray<string>;

	readonly primaryString: string;
}

declare class BETextDocumentContext extends NSObject {

	static alloc(): BETextDocumentContext; // inherited from NSObject

	static new(): BETextDocumentContext; // inherited from NSObject

	autocorrectedRanges: NSArray<NSValue>;

	constructor(o: { attributedSelectedText: NSAttributedString; contextBefore: NSAttributedString; contextAfter: NSAttributedString; markedText: NSAttributedString; selectedRangeInMarkedText: NSRange; });

	constructor(o: { selectedText: string; contextBefore: string; contextAfter: string; markedText: string; selectedRangeInMarkedText: NSRange; });

	addTextRectForCharacterRange(rect: CGRect, range: NSRange): void;

	initWithAttributedSelectedTextContextBeforeContextAfterMarkedTextSelectedRangeInMarkedText(selectedText: NSAttributedString, contextBefore: NSAttributedString, contextAfter: NSAttributedString, markedText: NSAttributedString, selectedRangeInMarkedText: NSRange): this;

	initWithSelectedTextContextBeforeContextAfterMarkedTextSelectedRangeInMarkedText(selectedText: string, contextBefore: string, contextAfter: string, markedText: string, selectedRangeInMarkedText: NSRange): this;
}

declare class BETextDocumentRequest extends NSObject {

	static alloc(): BETextDocumentRequest; // inherited from NSObject

	static new(): BETextDocumentRequest; // inherited from NSObject

	granularityCount: number;

	options: BETextDocumentRequestOptions;

	surroundingGranularity: UITextGranularity;
}

declare const enum BETextDocumentRequestOptions {

	OptionNone = 0,

	OptionText = 1,

	OptionAttributedText = 2,

	OptionTextRects = 4,

	OptionMarkedTextRects = 32,

	OptionAutocorrectedRanges = 128
}

interface BETextInput extends BEResponderEditActions, BETextSelectionDirectionNavigation, UIKeyInput {

	asyncInputDelegate: BETextInputDelegate;

	attributedMarkedText: NSAttributedString;

	automaticallyPresentEditMenu: boolean;

	editable: boolean;

	extendedTextInputTraits: BEExtendedTextInputTraits;

	hasMarkedText: boolean;

	markedText: string;

	markedTextRange: UITextRange;

	replaceAllowed: boolean;

	selectedText: string;

	selectedTextRange: UITextRange;

	selectionAtDocumentStart: boolean;

	selectionClipRect: CGRect;

	textFirstRect: CGRect;

	textInputView: UIView;

	textLastRect: CGRect;

	unobscuredContentRect: CGRect;

	unscaledView: UIView;

	addTextAlternatives(alternatives: BETextAlternatives): void;

	adjustSelectionBoundaryToPointTouchPhaseBaseIsStartFlags(point: CGPoint, touch: BESelectionTouchPhase, boundaryIsStart: boolean, flags: BESelectionFlags): void;

	adjustSelectionByRangeCompletionHandler(range: BEDirectionalTextRange, completionHandler: () => void): void;

	alternativesForSelectedText(): NSArray<BETextAlternatives>;

	autoscrollToPoint(point: CGPoint): void;

	canPerformActionWithSender(action: string, sender: any): boolean;

	cancelAutoscroll(): void;

	caretRectForPosition(position: UITextPosition): CGRect;

	deleteInDirectionToGranularity(direction: UITextStorageDirection, granularity: UITextGranularity): void;

	didInsertFinalDictationResult(): void;

	handleKeyEntryWithCompletionHandler(entry: BEKeyEntry, completionHandler: (p1: BEKeyEntry, p2: boolean) => void): void;

	insertTextAlternatives(alternatives: BETextAlternatives): void;

	insertTextPlaceholderWithSizeCompletionHandler(size: CGSize, completionHandler: (p1: UITextPlaceholder) => void): void;

	insertTextSuggestion(textSuggestion: BETextSuggestion): void;

	isPointNearMarkedText(point: CGPoint): boolean;

	moveByOffset(offset: number): void;

	moveSelectionAtBoundaryInStorageDirectionCompletionHandler(granularity: UITextGranularity, direction: UITextStorageDirection, completionHandler: () => void): void;

	offsetFromPositionToPosition(from: UITextPosition, toPosition: UITextPosition): number;

	removeTextPlaceholderWillInsertTextCompletionHandler(placeholder: UITextPlaceholder, willInsertText: boolean, completionHandler: () => void): void;

	replaceDictatedTextWithText(oldText: string, newText: string): void;

	replaceSelectedTextWithText(text: string, replacementText: string): void;

	replaceTextWithTextOptionsCompletionHandler(originalText: string, replacementText: string, options: BETextReplacementOptions, completionHandler: (p1: NSArray<UITextSelectionRect>) => void): void;

	requestDocumentContextCompletionHandler(request: BETextDocumentRequest, completionHandler: (p1: BETextDocumentContext) => void): void;

	requestPreferredArrowDirectionForEditMenuWithCompletionHandler(completionHandler: (p1: UIEditMenuArrowDirection) => void): void;

	requestTextContextForAutocorrectionWithCompletionHandler(completionHandler: (p1: BETextDocumentContext) => void): void;

	requestTextRectsForStringWithCompletionHandler(input: string, completionHandler: (p1: NSArray<UITextSelectionRect>) => void): void;

	selectPositionAtPointCompletionHandler(point: CGPoint, completionHandler: () => void): void;

	selectPositionAtPointWithContextRequestCompletionHandler(point: CGPoint, request: BETextDocumentRequest, completionHandler: (p1: BETextDocumentContext) => void): void;

	selectTextForEditMenuWithLocationInViewCompletionHandler(locationInView: CGPoint, completionHandler: (p1: boolean, p2: string, p3: NSRange) => void): void;

	selectTextInGranularityAtPointCompletionHandler(granularity: UITextGranularity, point: CGPoint, completionHandler: () => void): void;

	selectWordForReplacement(): void;

	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	setAttributedMarkedTextSelectedRange(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	setSelectionFromPointToPointGestureState(from: CGPoint, to: CGPoint, gesture: BEGestureType, state: UIGestureRecognizerState): void;

	shiftKeyStateChangedFromStateToState(oldState: BEKeyModifierFlags, newState: BEKeyModifierFlags): void;

	systemWillDismissEditMenuWithAnimator(animator: UIEditMenuInteractionAnimating): void;

	systemWillPresentEditMenuWithAnimator(animator: UIEditMenuInteractionAnimating): void;

	textInRange(range: UITextRange): string;

	textInteractionGestureShouldBeginAtPoint(gestureType: BEGestureType, point: CGPoint): boolean;

	textStylingAtPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	transposeCharactersAroundSelection(): void;

	unmarkText(): void;

	updateCurrentSelectionToFromGestureInState(point: CGPoint, gestureType: BEGestureType, state: UIGestureRecognizerState): void;

	updateSelectionWithExtentPointBoundaryCompletionHandler(point: CGPoint, granularity: UITextGranularity, completionHandler: (p1: boolean) => void): void;

	willInsertFinalDictationResult(): void;
}
declare var BETextInput: {

	prototype: BETextInput;
};

interface BETextInputDelegate {

	invalidateTextEntryContextForTextInput(textInput: BETextInput): void;

	selectionDidChangeForTextInput(textInput: BETextInput): void;

	selectionWillChangeForTextInput(textInput: BETextInput): void;

	shouldDeferEventHandlingToSystemForTextInputContext(textInput: BETextInput, keyEventContext: BEKeyEntryContext): boolean;

	textInputDeferReplaceTextActionToSystem(textInput: BETextInput, sender: any): void;

	textInputSetCandidateSuggestions(textInput: BETextInput, suggestions: NSArray<BETextSuggestion> | BETextSuggestion[]): void;
}
declare var BETextInputDelegate: {

	prototype: BETextInputDelegate;
};

declare class BETextInteraction extends NSObject implements UIInteraction {

	static alloc(): BETextInteraction; // inherited from NSObject

	static new(): BETextInteraction; // inherited from NSObject

	readonly contextMenuInteraction: UIContextMenuInteraction;

	contextMenuInteractionDelegate: UIContextMenuInteractionDelegate;

	delegate: BETextInteractionDelegate;

	readonly textSelectionDisplayInteraction: UITextSelectionDisplayInteraction;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	addShortcutForTextFromRect(text: string, presentationRect: CGRect): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	dismissEditMenuForSelection(): void;

	editabilityChanged(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentEditMenuForSelection(): void;

	refreshKeyboardUI(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	selectionBoundaryAdjustedToPointTouchPhaseFlags(point: CGPoint, touch: BESelectionTouchPhase, flags: BESelectionFlags): void;

	selectionChangedWithGestureAtPointGestureStateFlags(point: CGPoint, gestureType: BEGestureType, gestureState: UIGestureRecognizerState, flags: BESelectionFlags): void;

	self(): this;

	shareTextFromRect(text: string, presentationRect: CGRect): void;

	showDictionaryForTextInContextDefiningTextInRangeFromRect(textWithContext: string, range: NSRange, presentationRect: CGRect): void;

	showReplacementsForText(text: string): void;

	translateTextFromRect(text: string, presentationRect: CGRect): void;

	transliterateChineseForText(text: string): void;

	willMoveToView(view: UIView): void;
}

interface BETextInteractionDelegate {

	systemDidChangeSelectionForInteraction(textInteraction: BETextInteraction): void;

	systemWillChangeSelectionForInteraction(textInteraction: BETextInteraction): void;
}
declare var BETextInteractionDelegate: {

	prototype: BETextInteractionDelegate;
};

declare const enum BETextReplacementOptions {

	None = 0,

	AddUnderline = 1
}

interface BETextSelectionDirectionNavigation {

	extendInLayoutDirection(direction: UITextLayoutDirection): void;

	extendInStorageDirectionByGranularity(direction: UITextStorageDirection, granularity: UITextGranularity): void;

	moveInLayoutDirection(direction: UITextLayoutDirection): void;

	moveInStorageDirectionByGranularity(direction: UITextStorageDirection, granularity: UITextGranularity): void;
}
declare var BETextSelectionDirectionNavigation: {

	prototype: BETextSelectionDirectionNavigation;
};

declare class BETextSuggestion extends NSObject {

	static alloc(): BETextSuggestion; // inherited from NSObject

	static new(): BETextSuggestion; // inherited from NSObject

	readonly inputText: string;

	constructor(o: { inputText: string; });

	initWithInputText(inputText: string): this;
}

declare class BEWebContentProcess extends NSObject {

	static alloc(): BEWebContentProcess; // inherited from NSObject

	static new(): BEWebContentProcess; // inherited from NSObject

	static webContentProcessWithInterruptionHandlerCompletion(interruptionHandler: () => void, completion: (p1: BEWebContentProcess, p2: NSError) => void): void;

	createVisibilityPropagationInteraction(): UIInteraction;

	grantCapabilityError(capability: BEProcessCapability): BEProcessCapabilityGrant;

	invalidate(): void;

	makeLibXPCConnectionError(): interop.Pointer | interop.Reference<any>;
}
