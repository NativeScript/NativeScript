
/**
 * @since 11.0
 */
declare class FPUIActionExtensionContext extends NSExtensionContext {

	static alloc(): FPUIActionExtensionContext; // inherited from NSObject

	static new(): FPUIActionExtensionContext; // inherited from NSObject

	readonly domainIdentifier: string;

	completeRequest(): void;
}

/**
 * @since 11.0
 */
declare class FPUIActionExtensionViewController extends UIViewController {

	static alloc(): FPUIActionExtensionViewController; // inherited from NSObject

	static new(): FPUIActionExtensionViewController; // inherited from NSObject

	readonly extensionContext: FPUIActionExtensionContext;

	prepareForActionWithIdentifierItemIdentifiers(actionIdentifier: string, itemIdentifiers: NSArray<string> | string[]): void;

	prepareForError(error: NSError): void;
}

/**
 * @since 11.0
 */
declare var FPUIErrorDomain: string;

/**
 * @since 11.0
 */
declare const enum FPUIExtensionErrorCode {

	UserCancelled = 0,

	Failed = 1
}
