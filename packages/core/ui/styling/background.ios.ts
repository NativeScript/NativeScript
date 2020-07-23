import { ScrollEventData } from '../scroll-view';

import { Background as BackgroundDefinition } from './background';
import { View, Point } from '../core/view';
import { LinearGradient } from './linear-gradient';
import { Color } from '../../color';
import { isDataURI, isFileOrResourcePath, layout } from '../../utils';
import { ImageSource } from '../../image-source';
import { CSSValue, parse as cssParse } from '../../css-value';

export * from './background-common';

interface NativeView extends UIView {
	hasNonUniformBorder: boolean;

	borderLayer: CALayer;

	hasBorderMask: boolean;
	borderOriginalMask: CALayer;

	topBorderLayer: CALayer;
	rightBorderLayer: CALayer;
	bottomBorderLayer: CALayer;
	leftBorderLayer: CALayer;

	gradientLayer: CAGradientLayer;
}

interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

const clearCGColor = UIColor.clearColor.CGColor;
const symbolUrl = Symbol('backgroundImageUrl');

export enum CacheMode {
	none,
}

export module ios {
	export function createBackgroundUIColor(view: View, callback: (uiColor: UIColor) => void, flip?: boolean): void {
		const background = view.style.backgroundInternal;
		const nativeView = <NativeView>view.nativeViewProtected;

		if (nativeView.hasNonUniformBorder) {
			unsubscribeFromScrollNotifications(view);
			clearNonUniformBorders(nativeView);
		}

		clearGradient(nativeView);
		if (background.image instanceof LinearGradient) {
			drawGradient(nativeView, background.image);
		}

		const hasNonUniformBorderWidths = background.hasBorderWidth() && !background.hasUniformBorder();
		const hasNonUniformBorderRadiuses = background.hasBorderRadius() && !background.hasUniformBorderRadius();
		if (background.hasUniformBorderColor() && (hasNonUniformBorderWidths || hasNonUniformBorderRadiuses)) {
			drawUniformColorNonUniformBorders(nativeView, background);
			subscribeForScrollNotifications(view);
		} else if (background.hasUniformBorder()) {
			const layer = nativeView.layer;
			const borderColor = background.getUniformBorderColor();
			layer.borderColor = !borderColor ? undefined : borderColor.ios.CGColor;
			layer.borderWidth = layout.toDeviceIndependentPixels(background.getUniformBorderWidth());
			const renderSize = view.getActualSize() || { width: 0, height: 0 };
			const cornerRadius = layout.toDeviceIndependentPixels(background.getUniformBorderRadius());
			layer.cornerRadius = Math.min(Math.min(renderSize.width / 2, renderSize.height / 2), cornerRadius);
		} else {
			drawNoRadiusNonUniformBorders(nativeView, background);
			subscribeForScrollNotifications(view);
		}

		// Clip-path should be called after borders are applied.
		// It will eventually move them to different layer if uniform.
		if (background.clipPath) {
			drawClipPath(nativeView, background);
		}

		if (!background.image || background.image instanceof LinearGradient) {
			const uiColor = background.color ? background.color.ios : undefined;
			callback(uiColor);
		} else {
			setUIColorFromImage(view, nativeView, callback, flip);
		}
	}
}

function onScroll(this: void, args: ScrollEventData): void {
	const view = <View>args.object;
	const nativeView = view.nativeViewProtected;
	if (nativeView instanceof UIScrollView) {
		adjustLayersForScrollView(<any>nativeView);
	}
}

function adjustLayersForScrollView(nativeView: UIScrollView & NativeView) {
	const layer = nativeView.borderLayer;
	if (layer instanceof CALayer) {
		// Compensates with transition for the background layers for scrolling in ScrollView based controls.
		CATransaction.begin();
		CATransaction.setValueForKey(kCFBooleanTrue, kCATransactionDisableActions);
		const offset = nativeView.contentOffset;
		const transform = {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			tx: offset.x,
			ty: offset.y,
		};
		layer.setAffineTransform(transform);
		if (nativeView.layer.mask) {
			nativeView.layer.mask.setAffineTransform(transform);
		}
		CATransaction.commit();
	}
}

function unsubscribeFromScrollNotifications(view: View) {
	if (view.nativeViewProtected instanceof UIScrollView) {
		view.off('scroll', onScroll);
	}
}
function subscribeForScrollNotifications(view: View) {
	if (view.nativeViewProtected instanceof UIScrollView) {
		view.on('scroll', onScroll);
		adjustLayersForScrollView(<any>view.nativeViewProtected);
	}
}

function clearNonUniformBorders(nativeView: NativeView): void {
	if (nativeView.borderLayer) {
		nativeView.borderLayer.removeFromSuperlayer();
	}

	if (nativeView.hasBorderMask) {
		nativeView.layer.mask = nativeView.borderOriginalMask;
		nativeView.hasBorderMask = false;
		nativeView.borderOriginalMask = null;
	}

	if (nativeView.topBorderLayer) {
		nativeView.topBorderLayer.removeFromSuperlayer();
	}

	if (nativeView.rightBorderLayer) {
		nativeView.rightBorderLayer.removeFromSuperlayer();
	}

	if (nativeView.bottomBorderLayer) {
		nativeView.bottomBorderLayer.removeFromSuperlayer();
	}

	if (nativeView.leftBorderLayer) {
		nativeView.leftBorderLayer.removeFromSuperlayer();
	}
}

const pattern: RegExp = /url\(('|")(.*?)\1\)/;
function setUIColorFromImage(view: View, nativeView: UIView, callback: (uiColor: UIColor) => void, flip?: boolean): void {
	const frame = nativeView.frame;
	const boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
	const boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;
	if (!boundsWidth || !boundsHeight) {
		return undefined;
	}

	const style = view.style;
	const background = style.backgroundInternal;
	let imageUri = background.image as string;
	if (imageUri) {
		const match = imageUri.match(pattern);
		if (match && match[2]) {
			imageUri = match[2];
		}
	}

	let bitmap: UIImage;
	if (isDataURI(imageUri)) {
		const base64Data = imageUri.split(',')[1];
		if (base64Data !== undefined) {
			const imageSource = ImageSource.fromBase64Sync(base64Data);
			bitmap = imageSource && imageSource.ios;
		}
	} else if (isFileOrResourcePath(imageUri)) {
		const imageSource = ImageSource.fromFileOrResourceSync(imageUri);
		bitmap = imageSource && imageSource.ios;
	} else if (imageUri.indexOf('http') !== -1) {
		style[symbolUrl] = imageUri;
		ImageSource.fromUrl(imageUri).then((r) => {
			if (style && style[symbolUrl] === imageUri) {
				uiColorFromImage(r.ios, view, callback, flip);
			}
		});
	}

	uiColorFromImage(bitmap, view, callback, flip);
}

interface BackgroundDrawParams {
	repeatX: boolean;
	repeatY: boolean;
	posX: number;
	posY: number;
	sizeX?: number;
	sizeY?: number;
}

function parsePosition(pos: string): { x: CSSValue; y: CSSValue } {
	const values = cssParse(pos);
	if (values.length === 2) {
		return { x: values[0], y: values[1] };
	}

	if (values.length === 1) {
		const center = { type: 'ident', string: 'center' };

		if (values[0].type === 'ident') {
			const val = values[0].string.toLocaleLowerCase();

			// If you only one keyword is specified, the other value is "center"
			if (val === 'left' || val === 'right') {
				return { x: values[0], y: center };
			} else if (val === 'top' || val === 'bottom') {
				return { x: center, y: values[0] };
			} else if (val === 'center') {
				return { x: center, y: center };
			}
		} else if (values[0].type === 'number') {
			return { x: values[0], y: center };
		}
	}

	return null;
}

function getDrawParams(this: void, image: UIImage, background: BackgroundDefinition, width: number, height: number): BackgroundDrawParams {
	if (!image) {
		return null;
	}

	const res: BackgroundDrawParams = {
		repeatX: true,
		repeatY: true,
		posX: 0,
		posY: 0,
	};

	// repeat
	if (background.repeat) {
		switch (background.repeat.toLowerCase()) {
			case 'no-repeat':
				res.repeatX = false;
				res.repeatY = false;
				break;

			case 'repeat-x':
				res.repeatY = false;
				break;

			case 'repeat-y':
				res.repeatX = false;
				break;
		}
	}

	const imageSize = image.size;
	let imageWidth = imageSize.width;
	let imageHeight = imageSize.height;

	// size
	const size = background.size;
	if (size) {
		const values = cssParse(size);
		if (values.length === 2) {
			const vx = values[0];
			const vy = values[1];
			if (vx.unit === '%' && vy.unit === '%') {
				imageWidth = (width * vx.value) / 100;
				imageHeight = (height * vy.value) / 100;

				res.sizeX = imageWidth;
				res.sizeY = imageHeight;
			} else if (vx.type === 'number' && vy.type === 'number' && ((vx.unit === 'px' && vy.unit === 'px') || (vx.unit === '' && vy.unit === ''))) {
				imageWidth = vx.value;
				imageHeight = vy.value;

				res.sizeX = imageWidth;
				res.sizeY = imageHeight;
			}
		} else if (values.length === 1 && values[0].type === 'ident') {
			let scale = 0;
			if (values[0].string === 'cover') {
				scale = Math.max(width / imageWidth, height / imageHeight);
			} else if (values[0].string === 'contain') {
				scale = Math.min(width / imageWidth, height / imageHeight);
			}

			if (scale > 0) {
				imageWidth *= scale;
				imageHeight *= scale;

				res.sizeX = imageWidth;
				res.sizeY = imageHeight;
			}
		}
	}

	// position
	const position = background.position;
	if (position) {
		const v = parsePosition(position);
		if (v) {
			const spaceX = width - imageWidth;
			const spaceY = height - imageHeight;

			if (v.x.unit === '%' && v.y.unit === '%') {
				res.posX = (spaceX * v.x.value) / 100;
				res.posY = (spaceY * v.y.value) / 100;
			} else if (v.x.type === 'number' && v.y.type === 'number' && ((v.x.unit === 'px' && v.y.unit === 'px') || (v.x.unit === '' && v.y.unit === ''))) {
				res.posX = v.x.value;
				res.posY = v.y.value;
			} else if (v.x.type === 'ident' && v.y.type === 'ident') {
				if (v.x.string.toLowerCase() === 'center') {
					res.posX = spaceX / 2;
				} else if (v.x.string.toLowerCase() === 'right') {
					res.posX = spaceX;
				}

				if (v.y.string.toLowerCase() === 'center') {
					res.posY = spaceY / 2;
				} else if (v.y.string.toLowerCase() === 'bottom') {
					res.posY = spaceY;
				}
			} else if (v.x.type === 'number' && v.y.type === 'ident') {
				if (v.x.unit === '%') {
					res.posX = (spaceX * v.x.value) / 100;
				} else if (v.x.unit === 'px' || v.x.unit === '') {
					res.posX = v.x.value;
				}

				if (v.y.string.toLowerCase() === 'center') {
					res.posY = spaceY / 2;
				} else if (v.y.string.toLowerCase() === 'bottom') {
					res.posY = spaceY;
				}
			}
		}
	}

	return res;
}

function uiColorFromImage(img: UIImage, view: View, callback: (uiColor: UIColor) => void, flip?: boolean): void {
	const background = view.style.backgroundInternal;

	if (!img) {
		callback(background.color && background.color.ios);

		return;
	}

	const nativeView = view.nativeViewProtected as UIView;
	const frame = nativeView.frame;
	const boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
	const boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;

	const params = getDrawParams(img, background, boundsWidth, boundsHeight);

	if (params.sizeX > 0 && params.sizeY > 0) {
		const resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
		UIGraphicsBeginImageContextWithOptions(resizeRect.size, false, 0.0);
		img.drawInRect(resizeRect);
		img = UIGraphicsGetImageFromCurrentImageContext();
		UIGraphicsEndImageContext();
	}

	UIGraphicsBeginImageContextWithOptions(CGSizeFromString(`{${boundsWidth},${boundsHeight}}`), false, 0.0);
	const context = UIGraphicsGetCurrentContext();

	if (background.color && background.color.ios) {
		CGContextSetFillColorWithColor(context, background.color.ios.CGColor);
		CGContextFillRect(context, CGRectMake(0, 0, boundsWidth, boundsHeight));
	}

	if (!params.repeatX && !params.repeatY) {
		img.drawAtPoint(CGPointMake(params.posX, params.posY));
	} else {
		const w = params.repeatX ? boundsWidth : img.size.width;
		const h = params.repeatY ? boundsHeight : img.size.height;

		CGContextSetPatternPhase(context, CGSizeMake(params.posX, params.posY));

		params.posX = params.repeatX ? 0 : params.posX;
		params.posY = params.repeatY ? 0 : params.posY;

		const patternRect = CGRectMake(params.posX, params.posY, w, h);

		img.drawAsPatternInRect(patternRect);
	}

	const bkgImage = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();

	if (flip) {
		const flippedImage = _flipImage(bkgImage);
		callback(UIColor.alloc().initWithPatternImage(flippedImage));
	} else {
		callback(UIColor.alloc().initWithPatternImage(bkgImage));
	}
}

// Flipping the default coordinate system
// https://developer.apple.com/library/ios/documentation/2DDrawing/Conceptual/DrawingPrintingiOS/GraphicsDrawingOverview/GraphicsDrawingOverview.html
function _flipImage(originalImage: UIImage): UIImage {
	UIGraphicsBeginImageContextWithOptions(originalImage.size, false, 0.0);
	const context = UIGraphicsGetCurrentContext();
	CGContextSaveGState(context);
	CGContextTranslateCTM(context, 0.0, originalImage.size.height);
	CGContextScaleCTM(context, 1.0, -1.0);
	originalImage.drawInRect(CGRectMake(0, 0, originalImage.size.width, originalImage.size.height));
	CGContextRestoreGState(context);
	const flippedImage = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();

	return flippedImage;
}

function cssValueToDeviceIndependentPixels(source: string, total: number): number {
	source = source.trim();
	if (source.indexOf('px') !== -1) {
		return layout.toDeviceIndependentPixels(parseFloat(source.replace('px', '')));
	} else if (source.indexOf('%') !== -1 && total > 0) {
		return (parseFloat(source.replace('%', '')) / 100) * total;
	} else {
		return parseFloat(source);
	}
}

function drawUniformColorNonUniformBorders(nativeView: NativeView, background: BackgroundDefinition) {
	const layer = nativeView.layer;
	layer.backgroundColor = undefined;
	layer.borderColor = undefined;
	layer.borderWidth = 0;
	layer.cornerRadius = 0;

	const { width, height } = layer.bounds.size;
	const { x, y } = layer.bounds.origin;

	const left = x;
	const top = y;
	const right = x + width;
	const bottom = y + height;

	const { min, max } = Math;

	const borderTopWidth = max(0, layout.toDeviceIndependentPixels(background.borderTopWidth));
	const borderRightWidth = max(0, layout.toDeviceIndependentPixels(background.borderRightWidth));
	const borderBottomWidth = max(0, layout.toDeviceIndependentPixels(background.borderBottomWidth));
	const borderLeftWidth = max(0, layout.toDeviceIndependentPixels(background.borderLeftWidth));

	const borderVWidth = borderTopWidth + borderBottomWidth;
	const borderHWidth = borderLeftWidth + borderRightWidth;

	const cappedBorderTopWidth = borderTopWidth && borderTopWidth * min(1, height / borderVWidth);
	const cappedBorderRightWidth = borderRightWidth && borderRightWidth * min(1, width / borderHWidth);
	const cappedBorderBottomWidth = borderBottomWidth && borderBottomWidth * min(1, height / borderVWidth);
	const cappedBorderLeftWidth = borderLeftWidth && borderLeftWidth * min(1, width / borderHWidth);

	const outerTopLeftRadius = layout.toDeviceIndependentPixels(background.borderTopLeftRadius);
	const outerTopRightRadius = layout.toDeviceIndependentPixels(background.borderTopRightRadius);
	const outerBottomRightRadius = layout.toDeviceIndependentPixels(background.borderBottomRightRadius);
	const outerBottomLeftRadius = layout.toDeviceIndependentPixels(background.borderBottomLeftRadius);

	const topRadii = outerTopLeftRadius + outerTopRightRadius;
	const rightRadii = outerTopRightRadius + outerBottomRightRadius;
	const bottomRadii = outerBottomRightRadius + outerBottomLeftRadius;
	const leftRadii = outerBottomLeftRadius + outerTopLeftRadius;

	function capRadius(a: number, b: number, c: number): number {
		return a && Math.min(a, Math.min(b, c));
	}

	const cappedOuterTopLeftRadius = capRadius(outerTopLeftRadius, (outerTopLeftRadius / topRadii) * width, (outerTopLeftRadius / leftRadii) * height);
	const cappedOuterTopRightRadius = capRadius(outerTopRightRadius, (outerTopRightRadius / topRadii) * width, (outerTopRightRadius / rightRadii) * height);
	const cappedOuterBottomRightRadius = capRadius(outerBottomRightRadius, (outerBottomRightRadius / bottomRadii) * width, (outerBottomRightRadius / rightRadii) * height);
	const cappedOuterBottomLeftRadius = capRadius(outerBottomLeftRadius, (outerBottomLeftRadius / bottomRadii) * width, (outerBottomLeftRadius / leftRadii) * height);

	// Outer contour
	const clipPath = CGPathCreateMutable();
	CGPathMoveToPoint(clipPath, null, left + cappedOuterTopLeftRadius, top);
	CGPathAddArcToPoint(clipPath, null, right, top, right, top + cappedOuterTopRightRadius, cappedOuterTopRightRadius);
	CGPathAddArcToPoint(clipPath, null, right, bottom, right - cappedOuterBottomRightRadius, bottom, cappedOuterBottomRightRadius);
	CGPathAddArcToPoint(clipPath, null, left, bottom, left, bottom - cappedOuterBottomLeftRadius, cappedOuterBottomLeftRadius);
	CGPathAddArcToPoint(clipPath, null, left, top, left + cappedOuterTopLeftRadius, top, cappedOuterTopLeftRadius);
	CGPathCloseSubpath(clipPath);

	nativeView.borderOriginalMask = layer.mask;
	const clipShapeLayer = CAShapeLayer.layer();
	clipShapeLayer.path = clipPath;
	layer.mask = clipShapeLayer;
	nativeView.hasBorderMask = true;

	if (cappedBorderLeftWidth > 0 || cappedBorderTopWidth > 0 || cappedBorderRightWidth > 0 || cappedBorderBottomWidth > 0) {
		const borderPath = CGPathCreateMutable();
		CGPathAddRect(borderPath, null, CGRectMake(left, top, width, height));

		// Inner contour
		if (cappedBorderTopWidth > 0 || cappedBorderLeftWidth > 0) {
			CGPathMoveToPoint(borderPath, null, left + cappedOuterTopLeftRadius, top + cappedBorderTopWidth);
		} else {
			CGPathMoveToPoint(borderPath, null, left, top);
		}

		if (cappedBorderTopWidth > 0 || cappedBorderRightWidth > 0) {
			const innerTopRightWRadius = max(0, cappedOuterTopRightRadius - cappedBorderRightWidth);
			const innerTopRightHRadius = max(0, cappedOuterTopRightRadius - cappedBorderTopWidth);
			const innerTopRightMaxRadius = max(innerTopRightWRadius, innerTopRightHRadius);
			const innerTopRightTransform: any = CGAffineTransformMake(innerTopRightMaxRadius && innerTopRightWRadius / innerTopRightMaxRadius, 0, 0, innerTopRightMaxRadius && innerTopRightHRadius / innerTopRightMaxRadius, right - cappedBorderRightWidth - innerTopRightWRadius, top + cappedBorderTopWidth + innerTopRightHRadius);
			CGPathAddArc(borderPath, innerTopRightTransform, 0, 0, innerTopRightMaxRadius, (Math.PI * 3) / 2, 0, false);
		} else {
			CGPathMoveToPoint(borderPath, null, right, top);
		}

		if (cappedBorderBottomWidth > 0 || cappedBorderRightWidth > 0) {
			const innerBottomRightWRadius = max(0, cappedOuterBottomRightRadius - cappedBorderRightWidth);
			const innerBottomRightHRadius = max(0, cappedOuterBottomRightRadius - cappedBorderBottomWidth);
			const innerBottomRightMaxRadius = max(innerBottomRightWRadius, innerBottomRightHRadius);
			const innerBottomRightTransform: any = CGAffineTransformMake(innerBottomRightMaxRadius && innerBottomRightWRadius / innerBottomRightMaxRadius, 0, 0, innerBottomRightMaxRadius && innerBottomRightHRadius / innerBottomRightMaxRadius, right - cappedBorderRightWidth - innerBottomRightWRadius, bottom - cappedBorderBottomWidth - innerBottomRightHRadius);
			CGPathAddArc(borderPath, innerBottomRightTransform, 0, 0, innerBottomRightMaxRadius, 0, Math.PI / 2, false);
		} else {
			CGPathAddLineToPoint(borderPath, null, right, bottom);
		}

		if (cappedBorderBottomWidth > 0 || cappedBorderLeftWidth > 0) {
			const innerBottomLeftWRadius = max(0, cappedOuterBottomLeftRadius - cappedBorderLeftWidth);
			const innerBottomLeftHRadius = max(0, cappedOuterBottomLeftRadius - cappedBorderBottomWidth);
			const innerBottomLeftMaxRadius = max(innerBottomLeftWRadius, innerBottomLeftHRadius);
			const innerBottomLeftTransform: any = CGAffineTransformMake(innerBottomLeftMaxRadius && innerBottomLeftWRadius / innerBottomLeftMaxRadius, 0, 0, innerBottomLeftMaxRadius && innerBottomLeftHRadius / innerBottomLeftMaxRadius, left + cappedBorderLeftWidth + innerBottomLeftWRadius, bottom - cappedBorderBottomWidth - innerBottomLeftHRadius);
			CGPathAddArc(borderPath, innerBottomLeftTransform, 0, 0, innerBottomLeftMaxRadius, Math.PI / 2, Math.PI, false);
		} else {
			CGPathAddLineToPoint(borderPath, null, left, bottom);
		}

		if (cappedBorderTopWidth > 0 || cappedBorderLeftWidth > 0) {
			const innerTopLeftWRadius = max(0, cappedOuterTopLeftRadius - cappedBorderLeftWidth);
			const innerTopLeftHRadius = max(0, cappedOuterTopLeftRadius - cappedBorderTopWidth);
			const innerTopLeftMaxRadius = max(innerTopLeftWRadius, innerTopLeftHRadius);
			const innerTopLeftTransform: any = CGAffineTransformMake(innerTopLeftMaxRadius && innerTopLeftWRadius / innerTopLeftMaxRadius, 0, 0, innerTopLeftMaxRadius && innerTopLeftHRadius / innerTopLeftMaxRadius, left + cappedBorderLeftWidth + innerTopLeftWRadius, top + cappedBorderTopWidth + innerTopLeftHRadius);
			CGPathAddArc(borderPath, innerTopLeftTransform, 0, 0, innerTopLeftMaxRadius, Math.PI, (Math.PI * 3) / 2, false);
		} else {
			CGPathAddLineToPoint(borderPath, null, left, top);
		}

		CGPathCloseSubpath(borderPath);

		const borderLayer = CAShapeLayer.layer();
		borderLayer.fillColor = (background.borderTopColor && background.borderTopColor.ios.CGColor) || UIColor.blackColor.CGColor;
		borderLayer.fillRule = kCAFillRuleEvenOdd;
		borderLayer.path = borderPath;
		layer.addSublayer(borderLayer);
		nativeView.borderLayer = borderLayer;
	}

	nativeView.hasNonUniformBorder = true;
}

function drawNoRadiusNonUniformBorders(nativeView: NativeView, background: BackgroundDefinition) {
	const borderLayer = CALayer.layer();
	nativeView.layer.addSublayer(borderLayer);
	nativeView.borderLayer = borderLayer;

	borderLayer.borderColor = undefined;
	borderLayer.borderWidth = 0;
	borderLayer.cornerRadius = 0;

	const layerBounds = nativeView.layer.bounds;
	const layerOrigin = layerBounds.origin;
	const layerSize = layerBounds.size;

	const nativeViewLayerBounds = {
		left: layerOrigin.x,
		top: layerOrigin.y,
		bottom: layerSize.height,
		right: layerSize.width,
	};

	const top = layout.toDeviceIndependentPixels(background.borderTopWidth);
	const right = layout.toDeviceIndependentPixels(background.borderRightWidth);
	const bottom = layout.toDeviceIndependentPixels(background.borderBottomWidth);
	const left = layout.toDeviceIndependentPixels(background.borderLeftWidth);

	const lto: Point = {
		x: nativeViewLayerBounds.left,
		y: nativeViewLayerBounds.top,
	}; // left-top-outside
	const lti: Point = {
		x: nativeViewLayerBounds.left + left,
		y: nativeViewLayerBounds.top + top,
	}; // left-top-inside

	const rto: Point = {
		x: nativeViewLayerBounds.right,
		y: nativeViewLayerBounds.top,
	}; // right-top-outside
	const rti: Point = {
		x: nativeViewLayerBounds.right - right,
		y: nativeViewLayerBounds.top + top,
	}; // right-top-inside

	const rbo: Point = {
		x: nativeViewLayerBounds.right,
		y: nativeViewLayerBounds.bottom,
	}; // right-bottom-outside
	const rbi: Point = {
		x: nativeViewLayerBounds.right - right,
		y: nativeViewLayerBounds.bottom - bottom,
	}; // right-bottom-inside

	const lbo: Point = {
		x: nativeViewLayerBounds.left,
		y: nativeViewLayerBounds.bottom,
	}; // left-bottom-outside
	const lbi: Point = {
		x: nativeViewLayerBounds.left + left,
		y: nativeViewLayerBounds.bottom - bottom,
	}; // left-bottom-inside

	let hasNonUniformBorder: boolean;

	const borderTopColor = background.borderTopColor;
	if (top > 0 && borderTopColor && borderTopColor.ios) {
		const topBorderPath = CGPathCreateMutable();
		CGPathMoveToPoint(topBorderPath, null, lto.x, lto.y);
		CGPathAddLineToPoint(topBorderPath, null, rto.x, rto.y);
		CGPathAddLineToPoint(topBorderPath, null, rti.x, rti.y);
		CGPathAddLineToPoint(topBorderPath, null, lti.x, lti.y);
		CGPathAddLineToPoint(topBorderPath, null, lto.x, lto.y);

		const topBorderLayer = CAShapeLayer.layer();
		topBorderLayer.fillColor = background.borderTopColor.ios.CGColor;
		topBorderLayer.path = topBorderPath;

		borderLayer.addSublayer(topBorderLayer);
		nativeView.topBorderLayer = topBorderLayer;
		hasNonUniformBorder = true;
	}

	const borderRightColor = background.borderRightColor;
	if (right > 0 && borderRightColor && borderRightColor.ios) {
		const rightBorderPath = CGPathCreateMutable();
		CGPathMoveToPoint(rightBorderPath, null, rto.x, rto.y);
		CGPathAddLineToPoint(rightBorderPath, null, rbo.x, rbo.y);
		CGPathAddLineToPoint(rightBorderPath, null, rbi.x, rbi.y);
		CGPathAddLineToPoint(rightBorderPath, null, rti.x, rti.y);
		CGPathAddLineToPoint(rightBorderPath, null, rto.x, rto.y);

		const rightBorderLayer = CAShapeLayer.layer();
		rightBorderLayer.fillColor = background.borderRightColor.ios.CGColor;
		rightBorderLayer.path = rightBorderPath;

		borderLayer.addSublayer(rightBorderLayer);
		nativeView.rightBorderLayer = rightBorderLayer;
		hasNonUniformBorder = true;
	}

	const borderBottomColor = background.borderBottomColor;
	if (bottom > 0 && borderBottomColor && borderBottomColor.ios) {
		const bottomBorderPath = CGPathCreateMutable();
		CGPathMoveToPoint(bottomBorderPath, null, rbo.x, rbo.y);
		CGPathAddLineToPoint(bottomBorderPath, null, lbo.x, lbo.y);
		CGPathAddLineToPoint(bottomBorderPath, null, lbi.x, lbi.y);
		CGPathAddLineToPoint(bottomBorderPath, null, rbi.x, rbi.y);
		CGPathAddLineToPoint(bottomBorderPath, null, rbo.x, rbo.y);

		const bottomBorderLayer = CAShapeLayer.layer();
		bottomBorderLayer.fillColor = background.borderBottomColor.ios.CGColor;
		bottomBorderLayer.path = bottomBorderPath;

		borderLayer.addSublayer(bottomBorderLayer);
		nativeView.bottomBorderLayer = bottomBorderLayer;
		hasNonUniformBorder = true;
	}

	const borderLeftColor = background.borderLeftColor;
	if (left > 0 && borderLeftColor && borderLeftColor.ios) {
		const leftBorderPath = CGPathCreateMutable();
		CGPathMoveToPoint(leftBorderPath, null, lbo.x, lbo.y);
		CGPathAddLineToPoint(leftBorderPath, null, lto.x, lto.y);
		CGPathAddLineToPoint(leftBorderPath, null, lti.x, lti.y);
		CGPathAddLineToPoint(leftBorderPath, null, lbi.x, lbi.y);
		CGPathAddLineToPoint(leftBorderPath, null, lbo.x, lbo.y);

		const leftBorderLayer = CAShapeLayer.layer();
		leftBorderLayer.fillColor = background.borderLeftColor.ios.CGColor;
		leftBorderLayer.path = leftBorderPath;

		borderLayer.addSublayer(leftBorderLayer);
		nativeView.leftBorderLayer = leftBorderLayer;
		hasNonUniformBorder = true;
	}

	nativeView.hasNonUniformBorder = hasNonUniformBorder;
}

function drawGradient(nativeView: NativeView, gradient: LinearGradient) {
	const gradientLayer = CAGradientLayer.layer();
	gradientLayer.frame = nativeView.bounds;
	nativeView.gradientLayer = gradientLayer;

	const iosColors = NSMutableArray.alloc().initWithCapacity(gradient.colorStops.length);
	const iosStops = NSMutableArray.alloc<number>().initWithCapacity(gradient.colorStops.length);
	let hasStops = false;

	gradient.colorStops.forEach((stop) => {
		iosColors.addObject(stop.color.ios.CGColor);
		if (stop.offset) {
			iosStops.addObject(stop.offset.value);
			hasStops = true;
		}
	});

	gradientLayer.colors = iosColors;

	if (hasStops) {
		gradientLayer.locations = iosStops;
	}

	const alpha = gradient.angle / (Math.PI * 2);
	const startX = Math.pow(Math.sin(Math.PI * (alpha + 0.75)), 2);
	const startY = Math.pow(Math.sin(Math.PI * (alpha + 0.5)), 2);
	const endX = Math.pow(Math.sin(Math.PI * (alpha + 0.25)), 2);
	const endY = Math.pow(Math.sin(Math.PI * alpha), 2);
	gradientLayer.startPoint = { x: startX, y: startY };
	gradientLayer.endPoint = { x: endX, y: endY };

	nativeView.layer.insertSublayerAtIndex(gradientLayer, 0);
}

function clearGradient(nativeView: NativeView): void {
	if (nativeView.gradientLayer) {
		nativeView.gradientLayer.removeFromSuperlayer();
	}
}

function drawClipPath(nativeView: UIView, background: BackgroundDefinition) {
	const layer = nativeView.layer;
	const layerBounds = layer.bounds;
	const layerOrigin = layerBounds.origin;
	const layerSize = layerBounds.size;

	const bounds = {
		left: layerOrigin.x,
		top: layerOrigin.y,
		bottom: layerSize.height,
		right: layerSize.width,
	};

	if (bounds.right === 0 || bounds.bottom === 0) {
		return;
	}

	let path: UIBezierPath;
	const clipPath = background.clipPath;

	const functionName = clipPath.substring(0, clipPath.indexOf('('));
	const value = clipPath.replace(`${functionName}(`, '').replace(')', '');

	switch (functionName) {
		case 'rect':
			path = rectPath(value, bounds);
			break;

		case 'inset':
			path = insetPath(value, bounds);
			break;

		case 'circle':
			path = circlePath(value, bounds);
			break;

		case 'ellipse':
			path = ellipsePath(value, bounds);
			break;

		case 'polygon':
			path = polygonPath(value, bounds);
			break;
	}

	if (path) {
		const shape = CAShapeLayer.layer();
		shape.path = path;
		layer.mask = shape;
		nativeView.clipsToBounds = true;

		const borderWidth = background.getUniformBorderWidth();
		const borderColor = background.getUniformBorderColor();

		if (borderWidth > 0 && borderColor instanceof Color) {
			const borderLayer = CAShapeLayer.layer();
			borderLayer.path = path;
			borderLayer.lineWidth = borderWidth * 2;
			borderLayer.strokeColor = borderColor.ios.CGColor;
			borderLayer.fillColor = clearCGColor;
			borderLayer.frame = nativeView.bounds;

			layer.borderColor = undefined;
			layer.borderWidth = 0;
			layer.addSublayer(borderLayer);
		}
	}
}

function rectPath(value: string, bounds: Rect): UIBezierPath {
	const arr = value.split(/[\s]+/);
	const top = cssValueToDeviceIndependentPixels(arr[0], bounds.top);
	const right = cssValueToDeviceIndependentPixels(arr[1], bounds.right);
	const bottom = cssValueToDeviceIndependentPixels(arr[2], bounds.bottom);
	const left = cssValueToDeviceIndependentPixels(arr[3], bounds.left);

	return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}

function insetPath(value: string, bounds: Rect): UIBezierPath {
	const arr = value.split(/[\s]+/);

	let topString: string;
	let rightString: string;
	let bottomString: string;
	let leftString: string;
	if (arr.length === 1) {
		topString = rightString = bottomString = leftString = arr[0];
	} else if (arr.length === 2) {
		topString = bottomString = arr[0];
		rightString = leftString = arr[1];
	} else if (arr.length === 3) {
		topString = arr[0];
		rightString = leftString = arr[1];
		bottomString = arr[2];
	} else if (arr.length === 4) {
		topString = arr[0];
		rightString = arr[1];
		bottomString = arr[2];
		leftString = arr[3];
	}

	const top = cssValueToDeviceIndependentPixels(topString, bounds.bottom);
	const right = cssValueToDeviceIndependentPixels('100%', bounds.right) - cssValueToDeviceIndependentPixels(rightString, bounds.right);
	const bottom = cssValueToDeviceIndependentPixels('100%', bounds.bottom) - cssValueToDeviceIndependentPixels(bottomString, bounds.bottom);
	const left = cssValueToDeviceIndependentPixels(leftString, bounds.right);

	return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}

function circlePath(value: string, bounds: Rect): UIBezierPath {
	const arr = value.split(/[\s]+/);
	const radius = cssValueToDeviceIndependentPixels(arr[0], (bounds.right > bounds.bottom ? bounds.bottom : bounds.right) / 2);
	const y = cssValueToDeviceIndependentPixels(arr[2], bounds.bottom);
	const x = cssValueToDeviceIndependentPixels(arr[3], bounds.right);

	return UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(x, y), radius, 0, 360, true).CGPath;
}

function ellipsePath(value: string, bounds: Rect): UIBezierPath {
	const arr = value.split(/[\s]+/);

	const rX = cssValueToDeviceIndependentPixels(arr[0], bounds.right);
	const rY = cssValueToDeviceIndependentPixels(arr[1], bounds.bottom);
	const cX = cssValueToDeviceIndependentPixels(arr[3], bounds.right);
	const cY = cssValueToDeviceIndependentPixels(arr[4], bounds.bottom);

	const left = cX - rX;
	const top = cY - rY;
	const width = rX * 2;
	const height = rY * 2;

	return UIBezierPath.bezierPathWithOvalInRect(CGRectMake(left, top, width, height)).CGPath;
}

function polygonPath(value: string, bounds: Rect): UIBezierPath {
	const path = CGPathCreateMutable();

	let firstPoint: Point;
	const arr = value.split(/[,]+/);
	for (let i = 0; i < arr.length; i++) {
		const xy = arr[i].trim().split(/[\s]+/);
		const point: Point = {
			x: cssValueToDeviceIndependentPixels(xy[0], bounds.right),
			y: cssValueToDeviceIndependentPixels(xy[1], bounds.bottom),
		};

		if (!firstPoint) {
			firstPoint = point;
			CGPathMoveToPoint(path, null, point.x, point.y);
		}

		CGPathAddLineToPoint(path, null, point.x, point.y);
	}

	CGPathAddLineToPoint(path, null, firstPoint.x, firstPoint.y);

	return path;
}
