
declare class RPPreviewViewController extends UIViewController {

	previewControllerDelegate: RPPreviewViewControllerDelegate;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): RPPreviewViewController; // inherited from NSObjectProtocol
}

interface RPPreviewViewControllerDelegate extends NSObjectProtocol {

	previewControllerDidFinish?(previewController: RPPreviewViewController): void;

	previewControllerDidFinishWithActivityTypes?(previewController: RPPreviewViewController, activityTypes: NSSet<string>): void;
}
declare var RPPreviewViewControllerDelegate: {

	prototype: RPPreviewViewControllerDelegate;
};

declare const enum RPRecordingErrorCode {

	Unknown = -5800,

	UserDeclined = -5801,

	Disabled = -5802,

	FailedToStart = -5803,

	Failed = -5804,

	InsufficientStorage = -5805,

	Interrupted = -5806,

	ContentResize = -5807
}

declare var RPRecordingErrorDomain: string;

declare class RPScreenRecorder extends NSObject {

	static alloc(): RPScreenRecorder; // inherited from NSObject

	static new(): RPScreenRecorder; // inherited from NSObject

	static sharedRecorder(): RPScreenRecorder;

	/* readonly */ available: boolean;

	delegate: RPScreenRecorderDelegate;

	/* readonly */ microphoneEnabled: boolean;

	/* readonly */ recording: boolean;

	constructor(); // inherited from NSObject

	discardRecordingWithHandler(handler: () => void): void;

	self(): RPScreenRecorder; // inherited from NSObjectProtocol

	startRecordingWithMicrophoneEnabledHandler(microphoneEnabled: boolean, handler: (p1: NSError) => void): void;

	stopRecordingWithHandler(handler: (p1: RPPreviewViewController, p2: NSError) => void): void;
}

interface RPScreenRecorderDelegate extends NSObjectProtocol {

	screenRecorderDidChangeAvailability?(screenRecorder: RPScreenRecorder): void;

	screenRecorderDidStopRecordingWithErrorPreviewViewController?(screenRecorder: RPScreenRecorder, error: NSError, previewViewController: RPPreviewViewController): void;
}
declare var RPScreenRecorderDelegate: {

	prototype: RPScreenRecorderDelegate;
};
