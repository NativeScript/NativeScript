import { ScrollEventData } from '../scroll-view';
import { CoreTypes } from '../../core-types';
import { Background as BackgroundDefinition } from './background';
import { View, Point } from '../core/view';
import { LinearGradient } from './linear-gradient';
import { Color } from '../../color';
import { Screen } from '../../platform';
import { isDataURI, isFileOrResourcePath, layout } from '../../utils';
import { ios as iosViewUtils, NativeScriptUIView } from '../utils';
import { ImageSource } from '../../image-source';
import { CSSValue, parse as cssParse } from '../../css-value';
import { BoxShadow } from './box-shadow';
import { Length } from './style-properties';
import { BackgroundClearFlags } from './background-common';

export * from './background-common';

interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

interface BackgroundDrawParams {
	repeatX: boolean;
	repeatY: boolean;
	posX: number;
	posY: number;
	sizeX?: number;
	sizeY?: number;
}

interface CappedOuterRadii {
	topLeft: number;
	topRight: number;
	bottomLeft: number;
	bottomRight: number;
}

interface ShadowLayerResizablePropertyValues {
	maskPath: any;
	shadowPath: any;
}

const clearCGColor = UIColor.clearColor.CGColor;
const uriPattern = /url\(('|")(.*?)\1\)/;
const symbolUrl = Symbol('backgroundImageUrl');

export enum CacheMode {
	none,
}

export namespace ios {
	export function createBackgroundUIColor(view: View, callback: (uiColor: UIColor) => void, flip?: boolean): void {
		const background = view.style.backgroundInternal;
		const nativeView = <NativeScriptUIView>view.nativeViewProtected;

		if (!nativeView) {
			return;
		}

		// Cleanup of previous values
		clearBackgroundUIColor(view);

		let needsLayerAdjustmentOnScroll = false;

		// Add new gradient layer or update existing one
		if (background.image instanceof LinearGradient) {
			if (!nativeView.gradientLayer) {
				nativeView.gradientLayer = CAGradientLayer.new();
				nativeView.layer.insertSublayerAtIndex(nativeView.gradientLayer, 0);
			}
			iosViewUtils.drawGradient(nativeView, nativeView.gradientLayer, background.image);
			needsLayerAdjustmentOnScroll = true;
		}

		const hasNonUniformBorderWidths = background.hasBorderWidth() && !background.hasUniformBorder();
		const hasNonUniformBorderRadiuses = background.hasBorderRadius() && !background.hasUniformBorderRadius();
		if (background.hasUniformBorderColor() && (hasNonUniformBorderWidths || hasNonUniformBorderRadiuses)) {
			drawUniformColorNonUniformBorders(nativeView, background);
			needsLayerAdjustmentOnScroll = true;
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
			needsLayerAdjustmentOnScroll = true;
		}

		// Clip-path should be called after borders are applied.
		// It will eventually move them to different layer if uniform.
		if (background.clipPath) {
			drawClipPath(nativeView, background);
		}

		if (!background.image) {
			const uiColor = background.color ? background.color.ios : undefined;
			callback(uiColor);
		} else {
			if (!(background.image instanceof LinearGradient)) {
				setUIColorFromImage(view, nativeView, callback, flip);
			}
		}

		if (background.hasBoxShadow() && !background.clipPath) {
			drawBoxShadow(view);
			needsLayerAdjustmentOnScroll = true;
		}

		if (needsLayerAdjustmentOnScroll) {
			registerAdjustLayersOnScrollListener(view);
		}
	}

	export function clearBackgroundUIColor(view: View): void {
		const nativeView: NativeScriptUIView = view.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const background: BackgroundDefinition = view.style.backgroundInternal;
		const hasGradientBackground: boolean = background.image && background.image instanceof LinearGradient;
		let hasLayerAdjustmentOnScroll: boolean = false;

		// Unset this in case another layer handles background color
		nativeView.layer.backgroundColor = null;

		// Clear box shadow if it's no longer needed
		if (background.clearFlags & BackgroundClearFlags.CLEAR_BOX_SHADOW || background.clipPath) {
			hasLayerAdjustmentOnScroll = true;
			clearBoxShadow(nativeView);
		}

		if (nativeView.hasNonUniformBorder) {
			hasLayerAdjustmentOnScroll = true;
			clearNonUniformBorders(nativeView);
		}

		if (nativeView.gradientLayer && !hasGradientBackground) {
			hasLayerAdjustmentOnScroll = true;
			nativeView.gradientLayer.removeFromSuperlayer();
			nativeView.gradientLayer = null;
		}

		if (hasLayerAdjustmentOnScroll) {
			unregisterAdjustLayersOnScrollListener(view);
		}

		// Reset clear flags
		background.clearFlags = BackgroundClearFlags.NONE;
	}

	export function drawBoxShadow(view: View): void {
		const background = view.style.backgroundInternal;
		const nativeView = <NativeScriptUIView>view.nativeViewProtected;
		const layer = nativeView.layer;

		// There is no parent to add shadow to
		if (!layer.superlayer) {
			return;
		}

		const boxShadow: BoxShadow = background.getBoxShadow();
		const spreadRadius = layout.toDeviceIndependentPixels(boxShadow.spreadRadius);
		const bounds = nativeView.bounds;
		const viewFrame = nativeView.frame;

		// Initialize shadow layer
		let shadowLayer: CALayer;
		if (nativeView.shadowLayer) {
			shadowLayer = nativeView.shadowLayer;
		} else {
			shadowLayer = CALayer.new();

			const maskLayer = CAShapeLayer.new();
			const startingPoint = CGPointMake(0, 0);
			maskLayer.position = startingPoint;
			maskLayer.anchorPoint = startingPoint;
			maskLayer.fillRule = kCAFillRuleEvenOdd;
			shadowLayer.mask = maskLayer;

			// Instead of nesting it, add shadow layer underneath view so that it's not affected by border masking
			layer.superlayer.insertSublayerBelow(shadowLayer, layer);
			nativeView.shadowLayer = shadowLayer;
		}

		// Since shadow layer is added to view layer's superlayer, we have to be more specific about shadow layer position
		shadowLayer.bounds = bounds;
		shadowLayer.position = CGPointMake(viewFrame.origin.x + viewFrame.size.width / 2, viewFrame.origin.y + viewFrame.size.height / 2);

		shadowLayer.allowsEdgeAntialiasing = true;
		shadowLayer.contentsScale = Screen.mainScreen.scale;

		// Shadow opacity is handled on the shadow's color instance
		shadowLayer.shadowOpacity = boxShadow.color?.a ? boxShadow.color?.a / 255 : 1;
		shadowLayer.shadowRadius = layout.toDeviceIndependentPixels(boxShadow.blurRadius);
		shadowLayer.shadowColor = boxShadow.color?.ios?.CGColor;

		// prettier-ignore
		shadowLayer.shadowOffset = CGSizeMake(
			layout.toDeviceIndependentPixels(boxShadow.offsetX),
			layout.toDeviceIndependentPixels(boxShadow.offsetY)
		);

		const { maskPath, shadowPath } = generateShadowLayerPaths(view, bounds);

		(shadowLayer.mask as CAShapeLayer).path = maskPath;
		// Apply spread radius by expanding shadow layer bounds (this has a nice glow with radii set to 0)
		shadowLayer.shadowPath = shadowPath;
	}

	export function generateShadowLayerPaths(view: View, bounds: CGRect): ShadowLayerResizablePropertyValues {
		const background = view.style.backgroundInternal;
		const nativeView = <NativeScriptUIView>view.nativeViewProtected;
		const layer = nativeView.layer;

		const boxShadow: BoxShadow = background.getBoxShadow();
		const spreadRadius = layout.toDeviceIndependentPixels(boxShadow.spreadRadius);

		const { width, height } = bounds.size;
		const hasNonUniformBorderWidths = background.hasBorderWidth() && !background.hasUniformBorder();
		const hasNonUniformBorderRadiuses = background.hasBorderRadius() && !background.hasUniformBorderRadius();

		let maskPath, shadowPath;

		// Generate more detailed paths if view has border radius
		if (background.hasBorderRadius()) {
			if (background.hasUniformBorder()) {
				const cornerRadius = layer.cornerRadius;
				const cappedRadius = getBorderCapRadius(cornerRadius, width / 2, height / 2);
				const cappedOuterRadii: CappedOuterRadii = {
					topLeft: cappedRadius,
					topRight: cappedRadius,
					bottomLeft: cappedRadius,
					bottomRight: cappedRadius,
				};
				const cappedOuterRadiiWithSpread: CappedOuterRadii = {
					topLeft: cappedRadius + spreadRadius,
					topRight: cappedRadius + spreadRadius,
					bottomLeft: cappedRadius + spreadRadius,
					bottomRight: cappedRadius + spreadRadius,
				};

				maskPath = getBordersClipPath(bounds, cappedOuterRadii);
				shadowPath = getBordersClipPath(bounds, cappedOuterRadiiWithSpread, spreadRadius);
			} else {
				const outerTopLeftRadius = layout.toDeviceIndependentPixels(background.borderTopLeftRadius);
				const outerTopRightRadius = layout.toDeviceIndependentPixels(background.borderTopRightRadius);
				const outerBottomRightRadius = layout.toDeviceIndependentPixels(background.borderBottomRightRadius);
				const outerBottomLeftRadius = layout.toDeviceIndependentPixels(background.borderBottomLeftRadius);

				const topRadii = outerTopLeftRadius + outerTopRightRadius;
				const rightRadii = outerTopRightRadius + outerBottomRightRadius;
				const bottomRadii = outerBottomRightRadius + outerBottomLeftRadius;
				const leftRadii = outerBottomLeftRadius + outerTopLeftRadius;
				const cappedOuterRadii: CappedOuterRadii = {
					topLeft: getBorderCapRadius(outerTopLeftRadius, (outerTopLeftRadius / topRadii) * width, (outerTopLeftRadius / leftRadii) * height),
					topRight: getBorderCapRadius(outerTopRightRadius, (outerTopRightRadius / topRadii) * width, (outerTopRightRadius / rightRadii) * height),
					bottomLeft: getBorderCapRadius(outerBottomLeftRadius, (outerBottomLeftRadius / bottomRadii) * width, (outerBottomLeftRadius / leftRadii) * height),
					bottomRight: getBorderCapRadius(outerBottomRightRadius, (outerBottomRightRadius / bottomRadii) * width, (outerBottomRightRadius / rightRadii) * height),
				};

				// Add spread radius to corners that actually have radius as shadow has grown larger
				// than view itself and needs to be rounded accordingly
				const cappedOuterRadiiWithSpread: CappedOuterRadii = {
					topLeft: cappedOuterRadii.topLeft > 0 ? cappedOuterRadii.topLeft + spreadRadius : cappedOuterRadii.topLeft,
					topRight: cappedOuterRadii.topRight > 0 ? cappedOuterRadii.topRight + spreadRadius : cappedOuterRadii.topRight,
					bottomLeft: cappedOuterRadii.bottomLeft > 0 ? cappedOuterRadii.bottomLeft + spreadRadius : cappedOuterRadii.bottomLeft,
					bottomRight: cappedOuterRadii.bottomRight > 0 ? cappedOuterRadii.bottomRight + spreadRadius : cappedOuterRadii.bottomRight,
				};

				maskPath = getBordersClipPath(bounds, cappedOuterRadii);
				shadowPath = getBordersClipPath(bounds, cappedOuterRadiiWithSpread, spreadRadius);
			}
		} else {
			maskPath = CGPathCreateWithRect(bounds, null);
			shadowPath = CGPathCreateWithRect(CGRectInset(bounds, -spreadRadius, -spreadRadius), null);
		}

		return {
			maskPath: drawShadowMaskPath(bounds, boxShadow, maskPath),
			shadowPath,
		};
	}
}

function onScroll(this: void, args: ScrollEventData): void {
	const view = <View>args.object;
	const nativeView = view.nativeViewProtected;
	if (nativeView instanceof UIScrollView) {
		adjustLayersForScrollView(<any>nativeView);
	}
}

function adjustLayersForScrollView(nativeView: UIScrollView & NativeScriptUIView) {
	const layersToAdjust: CALayer[] = [];
	if (nativeView.gradientLayer) {
		layersToAdjust.push(nativeView.gradientLayer);
	}
	if (nativeView.borderLayer) {
		layersToAdjust.push(nativeView.borderLayer);
	}
	if (nativeView.shadowLayer) {
		layersToAdjust.push(nativeView.shadowLayer);
	}

	// Compensates with transition for the background layers for scrolling in ScrollView based controls.
	CATransaction.begin();
	CATransaction.setDisableActions(true);
	const offset = nativeView.contentOffset;
	const transform = {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: offset.x,
		ty: offset.y,
	};

	for (const layer of layersToAdjust) {
		layer.setAffineTransform(transform);
	}

	if (nativeView.layer.mask) {
		nativeView.layer.mask.setAffineTransform(transform);
	}

	CATransaction.setDisableActions(false);
	CATransaction.commit();
}

function unregisterAdjustLayersOnScrollListener(view: View) {
	if (view.nativeViewProtected instanceof UIScrollView) {
		view.off('scroll', onScroll);
	}
}

function registerAdjustLayersOnScrollListener(view: View) {
	if (view.nativeViewProtected instanceof UIScrollView) {
		view.on('scroll', onScroll);
		adjustLayersForScrollView(<any>view.nativeViewProtected);
	}
}

function clearNonUniformBorders(nativeView: NativeScriptUIView): void {
	if (nativeView.borderLayer) {
		nativeView.borderLayer.removeFromSuperlayer();
		nativeView.borderLayer = null;
	}

	if (nativeView.hasBorderMask) {
		nativeView.layer.mask = nativeView.borderOriginalMask;
		nativeView.hasBorderMask = false;
		nativeView.borderOriginalMask = null;
	}

	if (nativeView.topBorderLayer) {
		nativeView.topBorderLayer.removeFromSuperlayer();
		nativeView.topBorderLayer = null;
	}

	if (nativeView.rightBorderLayer) {
		nativeView.rightBorderLayer.removeFromSuperlayer();
		nativeView.rightBorderLayer = null;
	}

	if (nativeView.bottomBorderLayer) {
		nativeView.bottomBorderLayer.removeFromSuperlayer();
		nativeView.bottomBorderLayer = null;
	}

	if (nativeView.leftBorderLayer) {
		nativeView.leftBorderLayer.removeFromSuperlayer();
		nativeView.leftBorderLayer = null;
	}
}

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
		const match = imageUri.match(uriPattern);
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
		ImageSource.fromUrl(imageUri)
			.then((r) => {
				if (style && style[symbolUrl] === imageUri) {
					uiColorFromImage(r.ios, view, callback, flip);
				}
			})
			.catch(() => {});
	}

	uiColorFromImage(bitmap, view, callback, flip);
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
	const nativeView: NativeScriptUIView = view.nativeViewProtected;

	if (!img || !nativeView) {
		callback(background.color && background.color.ios);

		return;
	}

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

function getBorderCapRadius(a: number, b: number, c: number): number {
	return a && Math.min(a, Math.min(b, c));
}

function getBordersClipPath(bounds: CGRect, cappedRadii: CappedOuterRadii, offset: number = 0): any {
	const { width, height } = bounds.size;
	const { x, y } = bounds.origin;

	const left = x - offset;
	const top = y - offset;
	const right = x + width + offset;
	const bottom = y + height + offset;

	const clipPath = CGPathCreateMutable();

	CGPathMoveToPoint(clipPath, null, left + cappedRadii.topLeft, top);
	CGPathAddArcToPoint(clipPath, null, right, top, right, top + cappedRadii.topRight, cappedRadii.topRight);
	CGPathAddArcToPoint(clipPath, null, right, bottom, right - cappedRadii.bottomRight, bottom, cappedRadii.bottomRight);
	CGPathAddArcToPoint(clipPath, null, left, bottom, left, bottom - cappedRadii.bottomLeft, cappedRadii.bottomLeft);
	CGPathAddArcToPoint(clipPath, null, left, top, left + cappedRadii.topLeft, top, cappedRadii.topLeft);
	CGPathCloseSubpath(clipPath);

	return clipPath;
}

function drawUniformColorNonUniformBorders(nativeView: NativeScriptUIView, background: BackgroundDefinition) {
	const layer: CALayer = nativeView.layer;
	const layerBounds = layer.bounds;
	layer.backgroundColor = null;
	layer.borderColor = null;
	layer.borderWidth = 0;
	layer.cornerRadius = 0;

	const { width, height } = layerBounds.size;
	const { x, y } = layerBounds.origin;

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

	const cappedOuterRadii: CappedOuterRadii = {
		topLeft: getBorderCapRadius(outerTopLeftRadius, (outerTopLeftRadius / topRadii) * width, (outerTopLeftRadius / leftRadii) * height),
		topRight: getBorderCapRadius(outerTopRightRadius, (outerTopRightRadius / topRadii) * width, (outerTopRightRadius / rightRadii) * height),
		bottomLeft: getBorderCapRadius(outerBottomLeftRadius, (outerBottomLeftRadius / bottomRadii) * width, (outerBottomLeftRadius / leftRadii) * height),
		bottomRight: getBorderCapRadius(outerBottomRightRadius, (outerBottomRightRadius / bottomRadii) * width, (outerBottomRightRadius / rightRadii) * height),
	};

	// Outer contour
	const clipPath = getBordersClipPath(layerBounds, cappedOuterRadii);

	nativeView.borderOriginalMask = layer.mask;
	const clipShapeLayer = CAShapeLayer.layer();
	clipShapeLayer.path = clipPath;
	layer.mask = clipShapeLayer;
	nativeView.hasBorderMask = true;

	if (cappedBorderLeftWidth > 0 || cappedBorderTopWidth > 0 || cappedBorderRightWidth > 0 || cappedBorderBottomWidth > 0) {
		const borderPath = CGPathCreateMutable();
		CGPathAddPath(borderPath, null, clipPath);

		// Inner contour
		if (cappedBorderTopWidth > 0 || cappedBorderLeftWidth > 0) {
			CGPathMoveToPoint(borderPath, null, left + cappedOuterRadii.topLeft, top + cappedBorderTopWidth);
		} else {
			CGPathMoveToPoint(borderPath, null, left, top);
		}

		if (cappedBorderTopWidth > 0 || cappedBorderRightWidth > 0) {
			const innerTopRightWRadius = max(0, cappedOuterRadii.topRight - cappedBorderRightWidth);
			const innerTopRightHRadius = max(0, cappedOuterRadii.topRight - cappedBorderTopWidth);
			const innerTopRightMaxRadius = max(innerTopRightWRadius, innerTopRightHRadius);
			const innerTopRightTransform: any = CGAffineTransformMake(innerTopRightMaxRadius && innerTopRightWRadius / innerTopRightMaxRadius, 0, 0, innerTopRightMaxRadius && innerTopRightHRadius / innerTopRightMaxRadius, right - cappedBorderRightWidth - innerTopRightWRadius, top + cappedBorderTopWidth + innerTopRightHRadius);
			CGPathAddArc(borderPath, innerTopRightTransform, 0, 0, innerTopRightMaxRadius, (Math.PI * 3) / 2, 0, false);
		} else {
			CGPathMoveToPoint(borderPath, null, right, top);
		}

		if (cappedBorderBottomWidth > 0 || cappedBorderRightWidth > 0) {
			const innerBottomRightWRadius = max(0, cappedOuterRadii.bottomRight - cappedBorderRightWidth);
			const innerBottomRightHRadius = max(0, cappedOuterRadii.bottomRight - cappedBorderBottomWidth);
			const innerBottomRightMaxRadius = max(innerBottomRightWRadius, innerBottomRightHRadius);
			const innerBottomRightTransform: any = CGAffineTransformMake(innerBottomRightMaxRadius && innerBottomRightWRadius / innerBottomRightMaxRadius, 0, 0, innerBottomRightMaxRadius && innerBottomRightHRadius / innerBottomRightMaxRadius, right - cappedBorderRightWidth - innerBottomRightWRadius, bottom - cappedBorderBottomWidth - innerBottomRightHRadius);
			CGPathAddArc(borderPath, innerBottomRightTransform, 0, 0, innerBottomRightMaxRadius, 0, Math.PI / 2, false);
		} else {
			CGPathAddLineToPoint(borderPath, null, right, bottom);
		}

		if (cappedBorderBottomWidth > 0 || cappedBorderLeftWidth > 0) {
			const innerBottomLeftWRadius = max(0, cappedOuterRadii.bottomLeft - cappedBorderLeftWidth);
			const innerBottomLeftHRadius = max(0, cappedOuterRadii.bottomLeft - cappedBorderBottomWidth);
			const innerBottomLeftMaxRadius = max(innerBottomLeftWRadius, innerBottomLeftHRadius);
			const innerBottomLeftTransform: any = CGAffineTransformMake(innerBottomLeftMaxRadius && innerBottomLeftWRadius / innerBottomLeftMaxRadius, 0, 0, innerBottomLeftMaxRadius && innerBottomLeftHRadius / innerBottomLeftMaxRadius, left + cappedBorderLeftWidth + innerBottomLeftWRadius, bottom - cappedBorderBottomWidth - innerBottomLeftHRadius);
			CGPathAddArc(borderPath, innerBottomLeftTransform, 0, 0, innerBottomLeftMaxRadius, Math.PI / 2, Math.PI, false);
		} else {
			CGPathAddLineToPoint(borderPath, null, left, bottom);
		}

		if (cappedBorderTopWidth > 0 || cappedBorderLeftWidth > 0) {
			const innerTopLeftWRadius = max(0, cappedOuterRadii.topLeft - cappedBorderLeftWidth);
			const innerTopLeftHRadius = max(0, cappedOuterRadii.topLeft - cappedBorderTopWidth);
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

function drawNoRadiusNonUniformBorders(nativeView: NativeScriptUIView, background: BackgroundDefinition) {
	const layer: CALayer = nativeView.layer;
	const borderLayer = CALayer.layer();
	layer.addSublayer(borderLayer);
	nativeView.borderLayer = borderLayer;

	borderLayer.borderColor = undefined;
	borderLayer.borderWidth = 0;
	borderLayer.cornerRadius = 0;

	const layerBounds = layer.bounds;
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

/**
 * Creates a mask that ensures no shadow will be displayed underneath transparent backgrounds.
 *
 * @param bounds
 * @param boxShadow
 * @param bordersClipPath
 * @returns
 */
function drawShadowMaskPath(bounds: CGRect, boxShadow: BoxShadow, bordersClipPath: any): CAShapeLayer {
	const shadowRadius = layout.toDeviceIndependentPixels(boxShadow.blurRadius);
	const spreadRadius = layout.toDeviceIndependentPixels(boxShadow.spreadRadius);
	const offsetX = layout.toDeviceIndependentPixels(boxShadow.offsetX);
	const offsetY = layout.toDeviceIndependentPixels(boxShadow.offsetY);

	// This value has to be large enough to avoid clipping shadow
	const outerRectRadius: number = shadowRadius * 3 + spreadRadius;

	const maskPath = CGPathCreateMutable();
	// Proper clip position and size
	const outerRect = CGRectOffset(CGRectInset(bounds, -outerRectRadius, -outerRectRadius), offsetX, offsetY);

	CGPathAddPath(maskPath, null, bordersClipPath);
	CGPathAddRect(maskPath, null, outerRect);

	return maskPath;
}

function clearBoxShadow(nativeView: NativeScriptUIView) {
	if (nativeView.shadowLayer) {
		nativeView.shadowLayer.removeFromSuperlayer();
		nativeView.shadowLayer = null;
	}
}

function drawClipPath(nativeView: NativeScriptUIView, background: BackgroundDefinition) {
	const layer: CALayer = nativeView.layer;
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
