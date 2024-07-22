
/**
 * @since 17.0
 */
declare function AXAnimatedImagesEnabled(): boolean;

/**
 * @since 17.0
 */
declare var AXAnimatedImagesEnabledDidChangeNotification: string;

/**
 * @since 18.0
 */
declare function AXAssistiveAccessEnabled(): boolean;

/**
 * @since 15.2
 */
declare class AXBrailleMap extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AXBrailleMap; // inherited from NSObject

	static new(): AXBrailleMap; // inherited from NSObject

	readonly dimensions: CGSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	heightAtPoint(point: CGPoint): number;

	initWithCoder(coder: NSCoder): this;

	presentImage(image: any): void;

	setHeightAtPoint(status: number, point: CGPoint): void;
}

interface AXBrailleMapRenderer extends NSObjectProtocol {

	/**
	 * @since 15.2
	 */
	accessibilityBrailleMapRenderRegion?: CGRect;

	/**
	 * @since 15.2
	 */
	accessibilityBrailleMapRenderer?: (p1: AXBrailleMap) => void;
}
declare var AXBrailleMapRenderer: {

	prototype: AXBrailleMapRenderer;
};

/**
 * @since 15.0
 */
declare class AXCategoricalDataAxisDescriptor extends NSObject implements AXDataAxisDescriptor {

	static alloc(): AXCategoricalDataAxisDescriptor; // inherited from NSObject

	static new(): AXCategoricalDataAxisDescriptor; // inherited from NSObject

	categoryOrder: NSArray<string>;

	attributedTitle: NSAttributedString; // inherited from AXDataAxisDescriptor

	title: string; // inherited from AXDataAxisDescriptor

	constructor(o: { attributedTitle: NSAttributedString; categoryOrder: NSArray<string> | string[]; });

	constructor(o: { title: string; categoryOrder: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAttributedTitleCategoryOrder(attributedTitle: NSAttributedString, categoryOrder: NSArray<string> | string[]): this;

	initWithTitleCategoryOrder(title: string, categoryOrder: NSArray<string> | string[]): this;
}

/**
 * @since 15.0
 */
interface AXChart extends NSObjectProtocol {

	accessibilityChartDescriptor: AXChartDescriptor;
}
declare var AXChart: {

	prototype: AXChart;
};

/**
 * @since 15.0
 */
declare class AXChartDescriptor extends NSObject implements NSCopying {

	static alloc(): AXChartDescriptor; // inherited from NSObject

	static new(): AXChartDescriptor; // inherited from NSObject

	additionalAxes: NSArray<AXDataAxisDescriptor>;

	attributedTitle: NSAttributedString;

	contentDirection: AXChartDescriptorContentDirection;

	contentFrame: CGRect;

	series: NSArray<AXDataSeriesDescriptor>;

	summary: string;

	title: string;

	xAxis: AXDataAxisDescriptor;

	yAxis: AXNumericDataAxisDescriptor;

	constructor(o: { attributedTitle: NSAttributedString; summary: string; xAxisDescriptor: AXDataAxisDescriptor; yAxisDescriptor: AXNumericDataAxisDescriptor; additionalAxes: NSArray<AXDataAxisDescriptor> | AXDataAxisDescriptor[]; series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]; });

	constructor(o: { attributedTitle: NSAttributedString; summary: string; xAxisDescriptor: AXDataAxisDescriptor; yAxisDescriptor: AXNumericDataAxisDescriptor; series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]; });

	constructor(o: { title: string; summary: string; xAxisDescriptor: AXDataAxisDescriptor; yAxisDescriptor: AXNumericDataAxisDescriptor; additionalAxes: NSArray<AXDataAxisDescriptor> | AXDataAxisDescriptor[]; series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]; });

	constructor(o: { title: string; summary: string; xAxisDescriptor: AXDataAxisDescriptor; yAxisDescriptor: AXNumericDataAxisDescriptor; series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAttributedTitleSummaryXAxisDescriptorYAxisDescriptorAdditionalAxesSeries(attributedTitle: NSAttributedString, summary: string, xAxis: AXDataAxisDescriptor, yAxis: AXNumericDataAxisDescriptor, additionalAxes: NSArray<AXDataAxisDescriptor> | AXDataAxisDescriptor[], series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]): this;

	initWithAttributedTitleSummaryXAxisDescriptorYAxisDescriptorSeries(attributedTitle: NSAttributedString, summary: string, xAxis: AXDataAxisDescriptor, yAxis: AXNumericDataAxisDescriptor, series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]): this;

	initWithTitleSummaryXAxisDescriptorYAxisDescriptorAdditionalAxesSeries(title: string, summary: string, xAxis: AXDataAxisDescriptor, yAxis: AXNumericDataAxisDescriptor, additionalAxes: NSArray<AXDataAxisDescriptor> | AXDataAxisDescriptor[], series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]): this;

	initWithTitleSummaryXAxisDescriptorYAxisDescriptorSeries(title: string, summary: string, xAxis: AXDataAxisDescriptor, yAxis: AXNumericDataAxisDescriptor, series: NSArray<AXDataSeriesDescriptor> | AXDataSeriesDescriptor[]): this;
}

declare const enum AXChartDescriptorContentDirection {

	ContentDirectionLeftToRight = 0,

	ContentDirectionRightToLeft = 1,

	ContentDirectionTopToBottom = 2,

	ContentDirectionBottomToTop = 3,

	ContentDirectionRadialClockwise = 4,

	ContentDirectionRadialCounterClockwise = 5
}

/**
 * @since 14.0
 */
declare class AXCustomContent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AXCustomContent; // inherited from NSObject

	static customContentWithAttributedLabelAttributedValue(label: NSAttributedString, value: NSAttributedString): AXCustomContent;

	static customContentWithLabelValue(label: string, value: string): AXCustomContent;

	static new(): AXCustomContent; // inherited from NSObject

	readonly attributedLabel: NSAttributedString;

	readonly attributedValue: NSAttributedString;

	importance: AXCustomContentImportance;

	readonly label: string;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare const enum AXCustomContentImportance {

	Default = 0,

	High = 1
}

/**
 * @since 14.0
 */
interface AXCustomContentProvider extends NSObjectProtocol {

	accessibilityCustomContent: NSArray<AXCustomContent>;

	/**
	 * @since 17.0
	 */
	accessibilityCustomContentBlock?: () => NSArray<AXCustomContent>;
}
declare var AXCustomContentProvider: {

	prototype: AXCustomContentProvider;
};

/**
 * @since 15.0
 */
interface AXDataAxisDescriptor extends NSCopying {

	attributedTitle: NSAttributedString;

	title: string;
}
declare var AXDataAxisDescriptor: {

	prototype: AXDataAxisDescriptor;
};

/**
 * @since 15.0
 */
declare class AXDataPoint extends NSObject implements NSCopying {

	static alloc(): AXDataPoint; // inherited from NSObject

	static new(): AXDataPoint; // inherited from NSObject

	additionalValues: NSArray<AXDataPointValue>;

	attributedLabel: NSAttributedString;

	label: string;

	xValue: AXDataPointValue;

	yValue: AXDataPointValue;

	constructor(o: { x: AXDataPointValue; y: AXDataPointValue; });

	constructor(o: { x: AXDataPointValue; y: AXDataPointValue; additionalValues: NSArray<AXDataPointValue> | AXDataPointValue[]; });

	constructor(o: { x: AXDataPointValue; y: AXDataPointValue; additionalValues: NSArray<AXDataPointValue> | AXDataPointValue[]; label: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithXY(xValue: AXDataPointValue, yValue: AXDataPointValue): this;

	initWithXYAdditionalValues(xValue: AXDataPointValue, yValue: AXDataPointValue, additionalValues: NSArray<AXDataPointValue> | AXDataPointValue[]): this;

	initWithXYAdditionalValuesLabel(xValue: AXDataPointValue, yValue: AXDataPointValue, additionalValues: NSArray<AXDataPointValue> | AXDataPointValue[], label: string): this;
}

/**
 * @since 15.0
 */
declare class AXDataPointValue extends NSObject implements NSCopying {

	static alloc(): AXDataPointValue; // inherited from NSObject

	static new(): AXDataPointValue; // inherited from NSObject

	static valueWithCategory(category: string): AXDataPointValue;

	static valueWithNumber(number: number): AXDataPointValue;

	category: string;

	number: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
declare class AXDataSeriesDescriptor extends NSObject implements NSCopying {

	static alloc(): AXDataSeriesDescriptor; // inherited from NSObject

	static new(): AXDataSeriesDescriptor; // inherited from NSObject

	attributedName: NSAttributedString;

	dataPoints: NSArray<AXDataPoint>;

	isContinuous: boolean;

	name: string;

	constructor(o: { attributedName: NSAttributedString; isContinuous: boolean; dataPoints: NSArray<AXDataPoint> | AXDataPoint[]; });

	constructor(o: { name: string; isContinuous: boolean; dataPoints: NSArray<AXDataPoint> | AXDataPoint[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAttributedNameIsContinuousDataPoints(attributedName: NSAttributedString, isContinuous: boolean, dataPoints: NSArray<AXDataPoint> | AXDataPoint[]): this;

	initWithNameIsContinuousDataPoints(name: string, isContinuous: boolean, dataPoints: NSArray<AXDataPoint> | AXDataPoint[]): this;
}

/**
 * @since 15.0
 */
declare const enum AXHearingDeviceEar {

	None = 0,

	Left = 2,

	Right = 4,

	Both = 6
}

/**
 * @since 15.0
 */
declare class AXLiveAudioGraph extends NSObject {

	static alloc(): AXLiveAudioGraph; // inherited from NSObject

	static new(): AXLiveAudioGraph; // inherited from NSObject

	static start(): void;

	static stop(): void;

	static updateValue(value: number): void;
}

/**
 * @since 15.0
 */
declare function AXMFiHearingDevicePairedUUIDs(): NSArray<NSUUID>;

/**
 * @since 15.0
 */
declare var AXMFiHearingDevicePairedUUIDsDidChangeNotification: string;

/**
 * @since 15.0
 */
declare function AXMFiHearingDeviceStreamingEar(): AXHearingDeviceEar;

/**
 * @since 15.0
 */
declare var AXMFiHearingDeviceStreamingEarDidChangeNotification: string;

/**
 * @since 14.0
 */
declare function AXNameFromColor(color: any): string;

/**
 * @since 15.0
 */
declare class AXNumericDataAxisDescriptor extends NSObject implements AXDataAxisDescriptor {

	static alloc(): AXNumericDataAxisDescriptor; // inherited from NSObject

	static new(): AXNumericDataAxisDescriptor; // inherited from NSObject

	gridlinePositions: NSArray<number>;

	lowerBound: number;

	scaleType: AXNumericDataAxisDescriptorScale;

	upperBound: number;

	valueDescriptionProvider: (p1: number) => string;

	attributedTitle: NSAttributedString; // inherited from AXDataAxisDescriptor

	title: string; // inherited from AXDataAxisDescriptor

	constructor(o: { attributedTitle: NSAttributedString; lowerBound: number; upperBound: number; gridlinePositions: NSArray<number> | number[]; valueDescriptionProvider: (p1: number) => string; });

	constructor(o: { title: string; lowerBound: number; upperBound: number; gridlinePositions: NSArray<number> | number[]; valueDescriptionProvider: (p1: number) => string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAttributedTitleLowerBoundUpperBoundGridlinePositionsValueDescriptionProvider(attributedTitle: NSAttributedString, lowerbound: number, upperBound: number, gridlinePositions: NSArray<number> | number[], valueDescriptionProvider: (p1: number) => string): this;

	initWithTitleLowerBoundUpperBoundGridlinePositionsValueDescriptionProvider(title: string, lowerbound: number, upperBound: number, gridlinePositions: NSArray<number> | number[], valueDescriptionProvider: (p1: number) => string): this;
}

declare const enum AXNumericDataAxisDescriptorScale {

	ScaleTypeLinear = 0,

	ScaleTypeLog10 = 1,

	ScaleTypeLn = 2
}

/**
 * @since 18.0
 */
declare function AXOpenSettingsFeature(feature: AXSettingsFeature, completionHandler: (p1: NSError) => void): void;

/**
 * @since 17.0
 */
declare function AXPrefersHorizontalTextLayout(): boolean;

/**
 * @since 17.0
 */
declare var AXPrefersHorizontalTextLayoutDidChangeNotification: string;

/**
 * @since 18.0
 */
declare function AXPrefersNonBlinkingTextInsertionIndicator(): boolean;

/**
 * @since 18.0
 */
declare var AXPrefersNonBlinkingTextInsertionIndicatorDidChangeNotification: string;

/**
 * @since 18.0
 */
declare class AXRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AXRequest; // inherited from NSObject

	static new(): AXRequest; // inherited from NSObject

	readonly technology: string;

	static readonly currentRequest: AXRequest;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare const enum AXSettingsFeature {

	PersonalVoiceAllowAppsToRequestToUse = 1
}

/**
 * @since 15.0
 */
declare function AXSupportsBidirectionalAXMFiHearingDeviceStreaming(): boolean;

/**
 * @since 18.0
 */
declare var AXTechnologyAutomation: string;

/**
 * @since 18.0
 */
declare var AXTechnologyFullKeyboardAccess: string;

/**
 * @since 18.0
 */
declare var AXTechnologyHoverText: string;

/**
 * @since 18.0
 */
declare var AXTechnologySpeakScreen: string;

/**
 * @since 18.0
 */
declare var AXTechnologySwitchControl: string;

/**
 * @since 18.0
 */
declare var AXTechnologyVoiceControl: string;

/**
 * @since 18.0
 */
declare var AXTechnologyVoiceOver: string;

/**
 * @since 18.0
 */
declare var AXTechnologyZoom: string;
