
declare class FPUIActionExtensionContext extends NSExtensionContext {

	static alloc(): FPUIActionExtensionContext; // inherited from NSObject

	static new(): FPUIActionExtensionContext; // inherited from NSObject

	readonly domainIdentifier: string;

	completeRequest(): void;
}

declare class FPUIActionExtensionViewController extends UIViewController {

	static alloc(): FPUIActionExtensionViewController; // inherited from NSObject

	static new(): FPUIActionExtensionViewController; // inherited from NSObject

	readonly extensionContext: FPUIActionExtensionContext;

	prepareForActionWithIdentifierItemIdentifiers(actionIdentifier: string, itemIdentifiers: NSArray<string> | string[]): void;

	prepareForError(error: NSError): void;
}

declare var FPUIErrorDomain: string;

declare const enum FPUIExtensionErrorCode {

	UserCancelled = 0,

	Failed = 1
}
