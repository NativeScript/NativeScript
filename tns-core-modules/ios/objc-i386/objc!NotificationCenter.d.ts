
declare const enum NCUpdateResult {

	NewData = 0,

	NoData = 1,

	Failed = 2
}

declare class NCWidgetController extends NSObject {

	static alloc(): NCWidgetController; // inherited from NSObject

	static new(): NCWidgetController; // inherited from NSObject

	static widgetController(): NCWidgetController;

	setHasContentForWidgetWithBundleIdentifier(flag: boolean, bundleID: string): void;
}

declare const enum NCWidgetDisplayMode {

	Compact = 0,

	Expanded = 1
}

interface NCWidgetProviding extends NSObjectProtocol {

	widgetActiveDisplayModeDidChangeWithMaximumSize?(activeDisplayMode: NCWidgetDisplayMode, maxSize: CGSize): void;

	widgetMarginInsetsForProposedMarginInsets?(defaultMarginInsets: UIEdgeInsets): UIEdgeInsets;

	widgetPerformUpdateWithCompletionHandler?(completionHandler: (p1: NCUpdateResult) => void): void;
}
declare var NCWidgetProviding: {

	prototype: NCWidgetProviding;
};
