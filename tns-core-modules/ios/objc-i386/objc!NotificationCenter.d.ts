
declare const enum NCUpdateResult {

	NewData = 0,

	NoData = 1,

	Failed = 2
}

declare class NCWidgetController extends NSObject {

	static alloc(): NCWidgetController; // inherited from NSObject

	static new(): NCWidgetController; // inherited from NSObject

	static widgetController(): NCWidgetController;

	constructor(); // inherited from NSObject

	self(): NCWidgetController; // inherited from NSObjectProtocol

	setHasContentForWidgetWithBundleIdentifier(flag: boolean, bundleID: string): void;
}

interface NCWidgetProviding extends NSObjectProtocol {

	widgetMarginInsetsForProposedMarginInsets?(defaultMarginInsets: UIEdgeInsets): UIEdgeInsets;

	widgetPerformUpdateWithCompletionHandler?(completionHandler: (p1: NCUpdateResult) => void): void;
}
declare var NCWidgetProviding: {

	prototype: NCWidgetProviding;
};
