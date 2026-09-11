declare class NativeScriptUtils extends NSObject {

	static alloc(): NativeScriptUtils; // inherited from NSObject

	static applyFiltersFilters(image: UIImage, filters: NSArray<NSDictionary<any, any>> | NSDictionary<any, any>[]): UIImage;

	static applyFiltersFiltersCompletion(image: UIImage, filters: NSArray<NSDictionary<any, any>> | NSDictionary<any, any>[], completion: (p1: UIImage) => void): void;

	static averageColor(image: UIImage): UIColor;

	static compressImageToFitFormat(image: UIImage, maxBytes: number, format: string): NSDictionary<any, any>;

	static compressImageToFitFormatCompletion(image: UIImage, maxBytes: number, format: string, completion: (p1: NSDictionary<any, any>) => void): void;

	static createMutableStringForSpanFontColorBackgroundColorTextDecorationBaselineOffset(text: string, font: UIFont, color: UIColor, backgroundColor: UIColor, textDecoration: string, baselineOffset: number): NSMutableAttributedString;

	static createMutableStringWithDetails(details: NSDictionary<any, any>): NSMutableAttributedString;

	static createUIFont(font: NSDictionary<any, any>): UIFont;

	static cropImageXYWidthHeight(image: UIImage, x: number, y: number, width: number, height: number): UIImage;

	static decodeImageAtPathMaxSize(path: string, maxSize: number): UIImage;

	static decodeImageAtPathMaxSizeCompletion(path: string, maxSize: number, completion: (p1: UIImage) => void): void;

	static decodeImageWithDataMaxSize(data: NSData, maxSize: number): UIImage;

	static decodeImageWithDataMaxSizeCompletion(data: NSData, maxSize: number, completion: (p1: UIImage) => void): void;

	static dominantColorsCount(image: UIImage, count: number): NSArray<UIColor>;

	static drawTextOnImageXYFontColor(text: string, image: UIImage, x: number, y: number, font: UIFont, color: UIColor): UIImage;

	static flipImageHorizontalVertical(image: UIImage, horizontal: boolean, vertical: boolean): UIImage;

	static getImageDataFormatQuality(image: UIImage, format: string, quality: number): NSData;

	static getImageDataFormatQualityCompletion(image: UIImage, format: string, quality: number, completion: (p1: NSData) => void): void;

	static getSystemFontWeightItalicSymbolicTraits(size: number, weight: number, italic: boolean, symbolicTraits: UIFontDescriptorSymbolicTraits): UIFont;

	static hammingDistanceTo(a: string, b: string): number;

	static imageMetadataAtPath(path: string): NSDictionary<any, any>;

	static new(): NativeScriptUtils; // inherited from NSObject

	static normalizeOrientation(image: UIImage): UIImage;

	static overlayImageWithXYOpacity(base: UIImage, other: UIImage, x: number, y: number, opacity: number): UIImage;

	static perceptualHash(image: UIImage): string;

	static pixelSize(image: UIImage): CGSize;

	static rendererFormatWithScaleOpaque(scale: number, opaque: boolean): UIGraphicsImageRendererFormat;

	static resizeImageMaxSizeOpaque(image: UIImage, maxSize: number, opaque: boolean): UIImage;

	static resizeImageMaxSizeOpaqueCompletion(image: UIImage, maxSize: number, opaque: boolean, completion: (p1: UIImage) => void): void;

	static resizeImageWidthHeightModeBackground(image: UIImage, width: number, height: number, mode: string, background: UIColor): UIImage;

	static rotateImageDegrees(image: UIImage, degrees: number): UIImage;

	static roundCornersRadius(image: UIImage, radius: number): UIImage;

	static saveImageToPathFormatQuality(image: UIImage, path: string, format: string, quality: number): boolean;

	static saveImageToPathFormatQualityCompletion(image: UIImage, path: string, format: string, quality: number, completion: (p1: boolean) => void): void;

	static scaleImageWidthHeightScaleFactor(image: UIImage, width: number, height: number, scaleFactor: number): UIImage;

	static snapshotViewScale(view: UIView, scale: number): UIImage;

	static tintImageColor(image: UIImage, color: UIColor): UIImage;

	static transformImageOptions(image: UIImage, options: NSDictionary<any, any>): UIImage;

	static transformImageOptionsCompletion(image: UIImage, options: NSDictionary<any, any>, completion: (p1: UIImage) => void): void;
}
