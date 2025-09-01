
/**
 * @since 17.0
 */
declare class SCSensitivityAnalysis extends NSObject {

	static alloc(): SCSensitivityAnalysis; // inherited from NSObject

	static new(): SCSensitivityAnalysis; // inherited from NSObject

	readonly sensitive: boolean;

	readonly shouldIndicateSensitivity: boolean;

	readonly shouldInterruptVideo: boolean;

	readonly shouldMuteAudio: boolean;
}

/**
 * @since 17.0
 */
declare const enum SCSensitivityAnalysisPolicy {

	Disabled = 0,

	SimpleInterventions = 1,

	DescriptiveInterventions = 2
}

/**
 * @since 17.0
 */
declare class SCSensitivityAnalyzer extends NSObject {

	static alloc(): SCSensitivityAnalyzer; // inherited from NSObject

	static new(): SCSensitivityAnalyzer; // inherited from NSObject

	readonly analysisPolicy: SCSensitivityAnalysisPolicy;

	analyzeCGImageCompletionHandler(image: any, completionHandler: (p1: SCSensitivityAnalysis, p2: NSError) => void): void;

	analyzeImageFileCompletionHandler(fileURL: NSURL, completionHandler: (p1: SCSensitivityAnalysis, p2: NSError) => void): void;

	analyzeVideoFileCompletionHandler(fileURL: NSURL, completionHandler: (p1: SCSensitivityAnalysis, p2: NSError) => void): NSProgress;
}

/**
 * @since 26.0
 */
declare class SCVideoStreamAnalyzer extends NSObject {

	static alloc(): SCVideoStreamAnalyzer; // inherited from NSObject

	static new(): SCVideoStreamAnalyzer; // inherited from NSObject

	readonly analysis: SCSensitivityAnalysis;

	analysisChangedHandler: (p1: SCSensitivityAnalysis, p2: NSError) => void;

	constructor(o: { participantUUID: string; streamDirection: SCVideoStreamAnalyzerStreamDirection; });

	analyzePixelBuffer(pixelBuffer: any): void;

	beginAnalysisOfCaptureDeviceInputError(captureDeviceInput: AVCaptureDeviceInput): boolean;

	beginAnalysisOfDecompressionSessionError(decompressionSession: any): boolean;

	continueStream(): void;

	endAnalysis(): void;

	initWithParticipantUUIDStreamDirectionError(participantUUID: string, streamDirection: SCVideoStreamAnalyzerStreamDirection): this;
}

/**
 * @since 26.0
 */
declare const enum SCVideoStreamAnalyzerStreamDirection {

	Outgoing = 1,

	Incoming = 2
}
