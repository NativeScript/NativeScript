
/**
 * @since 17.0
 */
declare class SCSensitivityAnalysis extends NSObject {

	static alloc(): SCSensitivityAnalysis; // inherited from NSObject

	static new(): SCSensitivityAnalysis; // inherited from NSObject

	readonly sensitive: boolean;
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
