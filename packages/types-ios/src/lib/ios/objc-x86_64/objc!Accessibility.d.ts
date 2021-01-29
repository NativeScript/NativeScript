
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

declare const enum AXCustomContentImportance {

	Default = 0,

	High = 1
}

interface AXCustomContentProvider extends NSObjectProtocol {

	accessibilityCustomContent: NSArray<AXCustomContent>;
}
declare var AXCustomContentProvider: {

	prototype: AXCustomContentProvider;
};

declare function AXNameFromColor(color: any): string;
