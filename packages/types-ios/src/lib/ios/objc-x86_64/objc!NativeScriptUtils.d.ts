declare class NativeScriptUtils extends NSObject {

	static alloc(): NativeScriptUtils; // inherited from NSObject

	static createMutableStringForSpanFontColorBackgroundColorTextDecorationBaselineOffset(text: string, font: UIFont, color: UIColor, backgroundColor: UIColor, textDecoration: string, baselineOffset: number): NSMutableAttributedString;

	static createMutableStringWithDetails(details: NSDictionary<any, any>): NSMutableAttributedString;

	static createUIFont(font: NSDictionary<any, any>): UIFont;

	static getImageDataFormatQuality(image: UIImage, format: string, quality: number): NSData;

	static getSystemFontWeightItalicSymbolicTraits(size: number, weight: number, italic: boolean, symbolicTraits: UIFontDescriptorSymbolicTraits): UIFont;

	static new(): NativeScriptUtils; // inherited from NSObject

	static scaleImageWidthHeightScaleFactor(image: UIImage, width: number, height: number, scaleFactor: number): UIImage;
}
