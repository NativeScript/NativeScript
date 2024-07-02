
declare const enum MFMailComposeControllerDeferredAction {

	None = 0,

	AdjustInsertionPoint = 1,

	AddMissingRecipients = 2
}

/**
 * @since 3.0
 */
declare const enum MFMailComposeErrorCode {

	SaveFailed = 0,

	SendFailed = 1
}

/**
 * @since 3.0
 */
declare var MFMailComposeErrorDomain: string;

/**
 * @since 3.0
 */
declare const enum MFMailComposeResult {

	Cancelled = 0,

	Saved = 1,

	Sent = 2,

	Failed = 3
}

/**
 * @since 3.0
 */
declare class MFMailComposeViewController extends UINavigationController {

	static alloc(): MFMailComposeViewController; // inherited from NSObject

	static canSendMail(): boolean;

	static new(): MFMailComposeViewController; // inherited from NSObject

	mailComposeDelegate: MFMailComposeViewControllerDelegate;

	addAttachmentDataMimeTypeFileName(attachment: NSData, mimeType: string, filename: string): void;

	setBccRecipients(bccRecipients: NSArray<string> | string[]): void;

	setCcRecipients(ccRecipients: NSArray<string> | string[]): void;

	setMessageBodyIsHTML(body: string, isHTML: boolean): void;

	/**
	 * @since 11.0
	 */
	setPreferredSendingEmailAddress(emailAddress: string): void;

	setSubject(subject: string): void;

	setToRecipients(toRecipients: NSArray<string> | string[]): void;
}

interface MFMailComposeViewControllerDelegate extends NSObjectProtocol {

	mailComposeControllerDidFinishWithResultError?(controller: MFMailComposeViewController, result: MFMailComposeResult, error: NSError): void;
}
declare var MFMailComposeViewControllerDelegate: {

	prototype: MFMailComposeViewControllerDelegate;
};

/**
 * @since 4.0
 */
declare class MFMessageComposeViewController extends UINavigationController {

	static alloc(): MFMessageComposeViewController; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static canSendAttachments(): boolean;

	/**
	 * @since 7.0
	 */
	static canSendSubject(): boolean;

	static canSendText(): boolean;

	/**
	 * @since 7.0
	 */
	static isSupportedAttachmentUTI(uti: string): boolean;

	static new(): MFMessageComposeViewController; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly attachments: NSArray<NSDictionary<any, any>>;

	body: string;

	/**
	 * @since 10.0
	 */
	message: MSMessage;

	messageComposeDelegate: MFMessageComposeViewControllerDelegate;

	recipients: NSArray<string>;

	/**
	 * @since 7.0
	 */
	subject: string;

	/**
	 * @since 7.0
	 */
	addAttachmentDataTypeIdentifierFilename(attachmentData: NSData, uti: string, filename: string): boolean;

	/**
	 * @since 7.0
	 */
	addAttachmentURLWithAlternateFilename(attachmentURL: NSURL, alternateFilename: string): boolean;

	/**
	 * @since 7.0
	 */
	disableUserAttachments(): void;

	/**
	 * @since 16.0
	 */
	insertCollaborationItemProvider(itemProvider: NSItemProvider): boolean;

	/**
	 * @since 17.0
	 */
	setUPIVerificationCodeSendCompletion(completion: (p1: boolean) => void): void;
}

declare var MFMessageComposeViewControllerAttachmentAlternateFilename: string;

declare var MFMessageComposeViewControllerAttachmentURL: string;

interface MFMessageComposeViewControllerDelegate extends NSObjectProtocol {

	messageComposeViewControllerDidFinishWithResult(controller: MFMessageComposeViewController, result: MessageComposeResult): void;
}
declare var MFMessageComposeViewControllerDelegate: {

	prototype: MFMessageComposeViewControllerDelegate;
};

/**
 * @since 5.0
 */
declare var MFMessageComposeViewControllerTextMessageAvailabilityDidChangeNotification: string;

/**
 * @since 5.0
 */
declare var MFMessageComposeViewControllerTextMessageAvailabilityKey: string;

/**
 * @since 4.0
 */
declare const enum MessageComposeResult {

	Cancelled = 0,

	Sent = 1,

	Failed = 2
}
