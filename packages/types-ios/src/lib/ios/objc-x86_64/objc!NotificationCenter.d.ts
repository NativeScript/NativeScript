
declare const enum NCUpdateResult {

	NewData = 0,

	NoData = 1,

	Failed = 2
}

/**
 * @since 8.0
 * @deprecated 14.0
 */
declare class NCWidgetController extends NSObject {

	static alloc(): NCWidgetController; // inherited from NSObject

	static new(): NCWidgetController; // inherited from NSObject

	static widgetController(): NCWidgetController;

	setHasContentForWidgetWithBundleIdentifier(flag: boolean, bundleID: string): void;
}

/**
 * @since 10.0
 * @deprecated 14.0
 */
declare const enum NCWidgetDisplayMode {

	Compact = 0,

	Expanded = 1
}

/**
 * @since 10.0
 * @deprecated 14.0
 */
interface NCWidgetProviding extends NSObjectProtocol {

	/**
	 * @since 10.0
	 * @deprecated 14.0
	 */
	widgetActiveDisplayModeDidChangeWithMaximumSize?(activeDisplayMode: NCWidgetDisplayMode, maxSize: CGSize): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	widgetMarginInsetsForProposedMarginInsets?(defaultMarginInsets: UIEdgeInsets): UIEdgeInsets;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	widgetPerformUpdateWithCompletionHandler?(completionHandler: (p1: NCUpdateResult) => void): void;
}
declare var NCWidgetProviding: {

	prototype: NCWidgetProviding;
};
