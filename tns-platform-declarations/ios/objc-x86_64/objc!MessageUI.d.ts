
declare const enum MFMailComposeErrorCode {

	SaveFailed = 0,

	SendFailed = 1
}

declare var MFMailComposeErrorDomain: string;

declare const enum MFMailComposeResult {

	Cancelled = 0,

	Saved = 1,

	Sent = 2,

	Failed = 3
}

declare class MFMailComposeViewController extends UINavigationController {

	static alloc(): MFMailComposeViewController; // inherited from NSObject

	static canSendMail(): boolean;

	static new(): MFMailComposeViewController; // inherited from NSObject

	mailComposeDelegate: MFMailComposeViewControllerDelegate;

	addAttachmentDataMimeTypeFileName(attachment: NSData, mimeType: string, filename: string): void;

	setBccRecipients(bccRecipients: NSArray<string> | string[]): void;

	setCcRecipients(ccRecipients: NSArray<string> | string[]): void;

	setMessageBodyIsHTML(body: string, isHTML: boolean): void;

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

declare class MFMessageComposeViewController extends UINavigationController {

	static alloc(): MFMessageComposeViewController; // inherited from NSObject

	static canSendAttachments(): boolean;

	static canSendSubject(): boolean;

	static canSendText(): boolean;

	static isSupportedAttachmentUTI(uti: string): boolean;

	static new(): MFMessageComposeViewController; // inherited from NSObject

	readonly attachments: NSArray<NSDictionary<any, any>>;

	body: string;

	message: MSMessage;

	messageComposeDelegate: MFMessageComposeViewControllerDelegate;

	recipients: NSArray<string>;

	subject: string;

	addAttachmentDataTypeIdentifierFilename(attachmentData: NSData, uti: string, filename: string): boolean;

	addAttachmentURLWithAlternateFilename(attachmentURL: NSURL, alternateFilename: string): boolean;

	disableUserAttachments(): void;
}

declare var MFMessageComposeViewControllerAttachmentAlternateFilename: string;

declare var MFMessageComposeViewControllerAttachmentURL: string;

interface MFMessageComposeViewControllerDelegate extends NSObjectProtocol {

	messageComposeViewControllerDidFinishWithResult(controller: MFMessageComposeViewController, result: MessageComposeResult): void;
}
declare var MFMessageComposeViewControllerDelegate: {

	prototype: MFMessageComposeViewControllerDelegate;
};

declare var MFMessageComposeViewControllerTextMessageAvailabilityDidChangeNotification: string;

declare var MFMessageComposeViewControllerTextMessageAvailabilityKey: string;

declare const enum MessageComposeResult {

	Cancelled = 0,

	Sent = 1,

	Failed = 2
}
