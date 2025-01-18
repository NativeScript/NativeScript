import { ScrollEventData } from '../scroll-view';
import { Background as BackgroundDefinition } from './background';
import { View, Point, Position } from '../core/view';
import { LinearGradient } from './linear-gradient';
import { Screen } from '../../platform';
import { isDataURI, isFileOrResourcePath, layout } from '../../utils';
import { ios as iosViewUtils, NativeScriptUIView } from '../utils';
import { ImageSource } from '../../image-source';
import type { CSSValue } from '../../css-value/reworkcss-value';
import { parse as cssParse } from '../../css-value/reworkcss-value.js';
import { BoxShadow } from './box-shadow';
import { Length } from './style-properties';
import { BackgroundClearFlags } from './background-common';

export * from './background-common';

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

		// Unset this in case another layer handles background color (e.g. gradient)
		nativeView.layer.backgroundColor = null;

		// Cleanup of previous values
		clearBackgroundVisualEffects(view);

		// Borders, shadows, etc
		drawBackgroundVisualEffects(view);

		if (!background.image) {
			callback(background?.color?.ios);
		} else {
			if (!(background.image instanceof LinearGradient)) {
				createUIImageFromURI(view, background.image, flip, (image: UIImage) => {
					callback(image ? UIColor.alloc().initWithPatternImage(image) : background?.color?.ios);
				});
			}
		}
	}

	export function drawBackgroundVisualEffects(view: View): void {
		const background = view.style.backgroundInternal;
		const nativeView = <NativeScriptUIView>view.nativeViewProtected;
		const layer: CALayer = nativeView.layer;

		let needsLayerAdjustmentOnScroll = false;

		// Add new gradient layer or update existing one
		if (background.image instanceof LinearGradient) {
			if (!nativeView.gradientLayer) {
				nativeView.gradientLayer = CAGradientLayer.new();
				layer.insertSublayerAtIndex(nativeView.gradientLayer, 0);
			}
			iosViewUtils.drawGradient(nativeView, nativeView.gradientLayer, background.image);
			needsLayerAdjustmentOnScroll = true;
		}

		// Initialize clipping mask (usually for clip-path and non-uniform rounded borders)
		maskLayerIfNeeded(nativeView, background);

		if (background.hasUniformBorder()) {
			const borderColor = background.getUniformBorderColor();
			layer.borderColor = borderColor?.ios?.CGColor;
			layer.borderWidth = layout.toDeviceIndependentPixels(background.getUniformBorderWidth());
			layer.cornerRadius = getUniformBorderRadius(view, layer.bounds);
		} else {
			drawNonUniformBorders(nativeView, background);
			needsLayerAdjustmentOnScroll = true;
		}

		// Clip-path should be called after borders are applied
		if (nativeView.maskType === iosViewUtils.LayerMask.CLIP_PATH && layer.mask instanceof CAShapeLayer) {
			layer.mask.path = generateClipPath(view, layer.bounds);
		}

		if (background.hasBoxShadow()) {
			drawBoxShadow(view);
			needsLayerAdjustmentOnScroll = true;
		}

		if (needsLayerAdjustmentOnScroll) {
			registerAdjustLayersOnScrollListener(view);
		}
	}

	export function clearBackgroundVisualEffects(view: View): void {
		const nativeView: NativeScriptUIView = view.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const background: BackgroundDefinition = view.style.backgroundInternal;
		const hasGradientBackground: boolean = background.image && background.image instanceof LinearGradient;

		// Remove mask if there is no clip path or non-uniform border with radius
		let needsMask;
		switch (nativeView.maskType) {
			case iosViewUtils.LayerMask.BORDER:
				needsMask = !background.hasUniformBorder() && background.hasBorderRadius();
				break;
			case iosViewUtils.LayerMask.CLIP_PATH:
				needsMask = !!background.clipPath;
				break;
			default:
				needsMask = false;
				break;
		}

		if (!needsMask) {
			clearLayerMask(nativeView);
		}

		// Clear box shadow if it's no longer needed
		if (background.clearFlags & BackgroundClearFlags.CLEAR_BOX_SHADOW) {
			clearBoxShadow(nativeView);
		}

		// Non-uniform borders cleanup
		if (nativeView.hasNonUniformBorder) {
			if (nativeView.hasNonUniformBorderColor && background.hasUniformBorderColor()) {
				clearNonUniformColorBorders(nativeView);
			}

			if (background.hasUniformBorder()) {
				clearNonUniformBorders(nativeView);
			}
		}

		if (nativeView.gradientLayer && !hasGradientBackground) {
			nativeView.gradientLayer.removeFromSuperlayer();
			nativeView.gradientLayer = null;
		}

		// Force unset scroll listener
		unregisterAdjustLayersOnScrollListener(view);

		// Reset clear flags
		background.clearFlags = BackgroundClearFlags.NONE;
	}

	export function createUIImageFromURI(view: View, imageURI: string, flip: boolean, callback: (image: UIImage) => void): void {
		const nativeView: UIView = view.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const frame = nativeView.frame;
		const boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
		const boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;
		if (!boundsWidth || !boundsHeight) {
			return undefined;
		}

		const style = view.style;

		if (imageURI) {
			const match = imageURI.match(uriPattern);
			if (match && match[2]) {
				imageURI = match[2];
			}
		}

		let bitmap: UIImage;
		if (isDataURI(imageURI)) {
			const base64Data = imageURI.split(',')[1];
			if (base64Data !== undefined) {
				const imageSource = ImageSource.fromBase64Sync(base64Data);
				bitmap = imageSource && imageSource.ios;
			}
		} else if (isFileOrResourcePath(imageURI)) {
			const imageSource = ImageSource.fromFileOrResourceSync(imageURI);
			bitmap = imageSource && imageSource.ios;
		} else if (imageURI.indexOf('http') !== -1) {
			style[symbolUrl] = imageURI;
			ImageSource.fromUrl(imageURI)
				.then((r) => {
					if (style && style[symbolUrl] === imageURI) {
						callback(generatePatternImage(r.ios, view, flip));
					}
				})
				.catch(() => {});
		}

		callback(generatePatternImage(bitmap, view, flip));
	}

	export function generateShadowLayerPaths(view: View, bounds: CGRect): { maskPath: any; shadowPath: any } {
		const background = view.style.backgroundInternal;
		const nativeView = <NativeScriptUIView>view.nativeViewProtected;
		const layer = nativeView.layer;

		const boxShadow: BoxShadow = background.getBoxShadow();
		const spreadRadius = layout.toDeviceIndependentPixels(boxShadow.spreadRadius);

		const { width, height } = bounds.size;

		let innerPath, shadowPath;

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

				innerPath = generateNonUniformBorderOuterClipPath(bounds, cappedOuterRadii);
				shadowPath = generateNonUniformBorderOuterClipPath(bounds, cappedOuterRadiiWithSpread, spreadRadius);
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

				innerPath = generateNonUniformBorderOuterClipPath(bounds, cappedOuterRadii);
				shadowPath = generateNonUniformBorderOuterClipPath(bounds, cappedOuterRadiiWithSpread, spreadRadius);
			}
		} else {
			innerPath = CGPathCreateWithRect(bounds, null);
			shadowPath = CGPathCreateWithRect(CGRectInset(bounds, -spreadRadius, -spreadRadius), null);
		}

		return {
			maskPath: generateShadowMaskPath(bounds, boxShadow, innerPath),
			shadowPath,
		};
	}

	export function generateClipPath(view: View, bounds: CGRect): UIBezierPath {
		const background = view.style.backgroundInternal;
		const { origin, size } = bounds;

		const position = {
			left: origin.x,
			top: origin.y,
			bottom: size.height,
			right: size.width,
		};

		if (position.right === 0 || position.bottom === 0) {
			return;
		}

		let path: UIBezierPath;
		const clipPath = background.clipPath;

		const functionName: string = clipPath.substring(0, clipPath.indexOf('('));
		const value: string = clipPath.replace(`${functionName}(`, '').replace(')', '');

		switch (functionName) {
			case 'rect':
				path = rectPath(value, position);
				break;

			case 'inset':
				path = insetPath(value, position);
				break;

			case 'circle':
				path = circlePath(value, position);
				break;

			case 'ellipse':
				path = ellipsePath(value, position);
				break;

			case 'polygon':
				path = polygonPath(value, position);
				break;
		}
		return path;
	}

	export function getUniformBorderRadius(view: View, bounds: CGRect): number {
		const background = view.style.backgroundInternal;
		const { width, height } = bounds.size;
		const cornerRadius = layout.toDeviceIndependentPixels(background.getUniformBorderRadius());

		return Math.min(Math.min(width / 2, height / 2), cornerRadius);
	}

	export function generateNonUniformBorderInnerClipRoundedPath(view: View, bounds: CGRect): any {
		const background = view.style.backgroundInternal;

		const cappedOuterRadii = calculateNonUniformBorderCappedRadii(bounds, background);
		return generateNonUniformBorderInnerClipPath(bounds, background, cappedOuterRadii);
	}

	export function generateNonUniformBorderOuterClipRoundedPath(view: View, bounds: CGRect): any {
		const background = view.style.backgroundInternal;

		const cappedOuterRadii = calculateNonUniformBorderCappedRadii(bounds, background);
		return generateNonUniformBorderOuterClipPath(bounds, cappedOuterRadii);
	}

	export function generateNonUniformMultiColorBorderRoundedPaths(view: View, bounds: CGRect): Array<any> {
		const background = view.style.backgroundInternal;

		return generateNonUniformMultiColorBorderPaths(bounds, background);
	}
}

function maskLayerIfNeeded(nativeView: NativeScriptUIView, background: BackgroundDefinition) {
	const layer: CALayer = nativeView.layer;

	// Check if layer should be masked
	if (!(layer.mask instanceof CAShapeLayer)) {
		// Since layers can only accept up to a single mask at a time, clip path is given more priority
		if (background.clipPath) {
			nativeView.maskType = iosViewUtils.LayerMask.CLIP_PATH;
		} else if (!background.hasUniformBorder() && background.hasBorderRadius()) {
			nativeView.maskType = iosViewUtils.LayerMask.BORDER;
		} else {
			nativeView.maskType = null;
		}

		if (nativeView.maskType != null) {
			nativeView.originalMask = layer.mask;
			layer.mask = CAShapeLayer.new();
		}
	}
}

function clearLayerMask(nativeView: NativeScriptUIView) {
	if (nativeView.outerShadowContainerLayer) {
		nativeView.outerShadowContainerLayer.mask = null;
	}
	nativeView.layer.mask = nativeView.originalMask;
	nativeView.originalMask = null;
	nativeView.maskType = null;
}

function onBackgroundViewScroll(args: ScrollEventData): void {
	const view = <View>args.object;
	const nativeView = view.nativeViewProtected;
	if (nativeView instanceof UIScrollView) {
		adjustLayersForScrollView(<any>nativeView);
	}
}

function adjustLayersForScrollView(nativeView: UIScrollView & NativeScriptUIView) {
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

	if (nativeView.layer.mask) {
		nativeView.layer.mask.setAffineTransform(transform);
	}

	// Nested layers
	if (nativeView.gradientLayer) {
		nativeView.gradientLayer.setAffineTransform(transform);
	}
	if (nativeView.borderLayer) {
		nativeView.borderLayer.setAffineTransform(transform);
	}
	if (nativeView.outerShadowContainerLayer) {
		// Update bounds of shadow layer as it belongs to parent view
		nativeView.outerShadowContainerLayer.bounds = nativeView.bounds;
		nativeView.outerShadowContainerLayer.setAffineTransform(transform);
	}

	CATransaction.setDisableActions(false);
	CATransaction.commit();
}

function unregisterAdjustLayersOnScrollListener(view: View) {
	if (view.nativeViewProtected instanceof UIScrollView) {
		view.off('scroll', onBackgroundViewScroll);
	}
}

function registerAdjustLayersOnScrollListener(view: View) {
	if (view.nativeViewProtected instanceof UIScrollView) {
		view.off('scroll', onBackgroundViewScroll);
		view.on('scroll', onBackgroundViewScroll);
		adjustLayersForScrollView(<any>view.nativeViewProtected);
	}
}

function clearNonUniformColorBorders(nativeView: NativeScriptUIView): void {
	if (nativeView.borderLayer) {
		nativeView.borderLayer.mask = null;
		nativeView.borderLayer.sublayers = null;
	}
	nativeView.hasNonUniformBorderColor = false;
}

function clearNonUniformBorders(nativeView: NativeScriptUIView): void {
	if (nativeView.borderLayer) {
		nativeView.borderLayer.removeFromSuperlayer();
		nativeView.borderLayer = null;
	}
	nativeView.hasNonUniformBorder = false;
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

function generatePatternImage(img: UIImage, view: View, flip?: boolean): UIImage {
	const background = view.style.backgroundInternal;
	const nativeView: NativeScriptUIView = view.nativeViewProtected;

	if (!img || !nativeView) {
		return null;
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

	const bgImage = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();

	return flip ? _flipImage(bgImage) : bgImage;
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

function calculateNonUniformBorderCappedRadii(bounds: CGRect, background: BackgroundDefinition): CappedOuterRadii {
	const { width, height } = bounds.size;
	const { x, y } = bounds.origin;

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

	return cappedOuterRadii;
}

function drawNonUniformBorders(nativeView: NativeScriptUIView, background: BackgroundDefinition): void {
	const layer: CALayer = nativeView.layer;
	const layerBounds = layer.bounds;

	layer.borderColor = null;
	layer.borderWidth = 0;
	layer.cornerRadius = 0;

	const cappedOuterRadii = calculateNonUniformBorderCappedRadii(layerBounds, background);
	if (nativeView.maskType === iosViewUtils.LayerMask.BORDER && layer.mask instanceof CAShapeLayer) {
		layer.mask.path = generateNonUniformBorderOuterClipPath(layerBounds, cappedOuterRadii);
	}

	if (background.hasBorderWidth()) {
		if (!nativeView.hasNonUniformBorder) {
			nativeView.borderLayer = CAShapeLayer.new();
			nativeView.borderLayer.fillRule = kCAFillRuleEvenOdd;
			layer.addSublayer(nativeView.borderLayer);
			nativeView.hasNonUniformBorder = true;
		}

		if (background.hasUniformBorderColor()) {
			// Use anti-aliasing or borders will draw incorrectly at times
			nativeView.borderLayer.shouldRasterize = true;
			nativeView.borderLayer.rasterizationScale = Screen.mainScreen.scale;
			nativeView.borderLayer.fillColor = background.borderTopColor?.ios?.CGColor || UIColor.blackColor.CGColor;
			nativeView.borderLayer.path = generateNonUniformBorderInnerClipPath(layerBounds, background, cappedOuterRadii);
		} else {
			// Non-uniform borders need more layers in order to display multiple colors at the same time
			let borderTopLayer, borderRightLayer, borderBottomLayer, borderLeftLayer;

			if (!nativeView.hasNonUniformBorderColor) {
				const maskLayer = CAShapeLayer.new();
				maskLayer.fillRule = kCAFillRuleEvenOdd;
				// Use anti-aliasing or borders will draw incorrectly at times
				maskLayer.shouldRasterize = true;
				maskLayer.rasterizationScale = Screen.mainScreen.scale;
				nativeView.borderLayer.mask = maskLayer;

				borderTopLayer = CAShapeLayer.new();
				borderRightLayer = CAShapeLayer.new();
				borderBottomLayer = CAShapeLayer.new();
				borderLeftLayer = CAShapeLayer.new();

				nativeView.borderLayer.addSublayer(borderTopLayer);
				nativeView.borderLayer.addSublayer(borderRightLayer);
				nativeView.borderLayer.addSublayer(borderBottomLayer);
				nativeView.borderLayer.addSublayer(borderLeftLayer);

				nativeView.hasNonUniformBorderColor = true;
			} else {
				borderTopLayer = nativeView.borderLayer.sublayers[0];
				borderRightLayer = nativeView.borderLayer.sublayers[1];
				borderBottomLayer = nativeView.borderLayer.sublayers[2];
				borderLeftLayer = nativeView.borderLayer.sublayers[3];
			}

			const paths = generateNonUniformMultiColorBorderPaths(layerBounds, background);

			borderTopLayer.fillColor = background.borderTopColor?.ios?.CGColor || UIColor.blackColor.CGColor;
			borderTopLayer.path = paths[0];
			borderRightLayer.fillColor = background.borderRightColor?.ios?.CGColor || UIColor.blackColor.CGColor;
			borderRightLayer.path = paths[1];
			borderBottomLayer.fillColor = background.borderBottomColor?.ios?.CGColor || UIColor.blackColor.CGColor;
			borderBottomLayer.path = paths[2];
			borderLeftLayer.fillColor = background.borderLeftColor?.ios?.CGColor || UIColor.blackColor.CGColor;
			borderLeftLayer.path = paths[3];

			// Clip inner area to create borders
			if (nativeView.borderLayer.mask instanceof CAShapeLayer) {
				nativeView.borderLayer.mask.path = generateNonUniformBorderInnerClipPath(layerBounds, background, cappedOuterRadii);
			}
		}
	}
}

function calculateInnerBorderClipRadius(radius: number, insetX: number, insetY: number): { xRadius: number; yRadius: number; maxRadius: number } {
	const innerXRadius = Math.max(0, radius - insetX);
	const innerYRadius = Math.max(0, radius - insetY);
	const innerMaxRadius = Math.max(innerXRadius, innerYRadius);

	return {
		xRadius: innerXRadius,
		yRadius: innerYRadius,
		maxRadius: innerMaxRadius,
	};
}

/**
 * Generates a path that represents the rounded view area.
 *
 * @param bounds
 * @param cappedRadii
 * @param offset
 * @returns
 */
function generateNonUniformBorderOuterClipPath(bounds: CGRect, cappedRadii: CappedOuterRadii, offset: number = 0): any {
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

/**
 * Generates a path that represents the area inside borders.
 *
 * @param bounds
 * @param background
 * @param cappedOuterRadii
 * @returns
 */
function generateNonUniformBorderInnerClipPath(bounds: CGRect, background: BackgroundDefinition, cappedOuterRadii: CappedOuterRadii): any {
	const { width, height } = bounds.size;
	const { x, y } = bounds.origin;

	const position: Position = {
		left: x,
		top: y,
		bottom: y + height,
		right: x + width,
	};

	const borderTopWidth = Math.max(0, layout.toDeviceIndependentPixels(background.borderTopWidth));
	const borderRightWidth = Math.max(0, layout.toDeviceIndependentPixels(background.borderRightWidth));
	const borderBottomWidth = Math.max(0, layout.toDeviceIndependentPixels(background.borderBottomWidth));
	const borderLeftWidth = Math.max(0, layout.toDeviceIndependentPixels(background.borderLeftWidth));

	const borderVWidth = borderTopWidth + borderBottomWidth;
	const borderHWidth = borderLeftWidth + borderRightWidth;

	const cappedBorderTopWidth = borderTopWidth && borderTopWidth * Math.min(1, height / borderVWidth);
	const cappedBorderRightWidth = borderRightWidth && borderRightWidth * Math.min(1, width / borderHWidth);
	const cappedBorderBottomWidth = borderBottomWidth && borderBottomWidth * Math.min(1, height / borderVWidth);
	const cappedBorderLeftWidth = borderLeftWidth && borderLeftWidth * Math.min(1, width / borderHWidth);

	const clipPath = CGPathCreateMutable();
	CGPathAddRect(clipPath, null, CGRectMake(x, y, width, height));

	// Inner clip paths
	if (cappedBorderTopWidth > 0 || cappedBorderLeftWidth > 0) {
		CGPathMoveToPoint(clipPath, null, position.left + cappedOuterRadii.topLeft, position.top + cappedBorderTopWidth);
	} else {
		CGPathMoveToPoint(clipPath, null, position.left, position.top);
	}

	if (cappedBorderTopWidth > 0 || cappedBorderRightWidth > 0) {
		const { xRadius, yRadius, maxRadius } = calculateInnerBorderClipRadius(cappedOuterRadii.topRight, cappedBorderRightWidth, cappedBorderTopWidth);
		const innerTopRightTransform: any = CGAffineTransformMake(maxRadius && xRadius / maxRadius, 0, 0, maxRadius && yRadius / maxRadius, position.right - cappedBorderRightWidth - xRadius, position.top + cappedBorderTopWidth + yRadius);
		CGPathAddArc(clipPath, innerTopRightTransform, 0, 0, maxRadius, (Math.PI * 3) / 2, 0, false);
	} else {
		CGPathAddLineToPoint(clipPath, null, position.right, position.top);
	}

	if (cappedBorderBottomWidth > 0 || cappedBorderRightWidth > 0) {
		const { xRadius, yRadius, maxRadius } = calculateInnerBorderClipRadius(cappedOuterRadii.bottomRight, cappedBorderRightWidth, cappedBorderBottomWidth);
		const innerBottomRightTransform: any = CGAffineTransformMake(maxRadius && xRadius / maxRadius, 0, 0, maxRadius && yRadius / maxRadius, position.right - cappedBorderRightWidth - xRadius, position.bottom - cappedBorderBottomWidth - yRadius);
		CGPathAddArc(clipPath, innerBottomRightTransform, 0, 0, maxRadius, 0, Math.PI / 2, false);
	} else {
		CGPathAddLineToPoint(clipPath, null, position.right, position.bottom);
	}

	if (cappedBorderBottomWidth > 0 || cappedBorderLeftWidth > 0) {
		const { xRadius, yRadius, maxRadius } = calculateInnerBorderClipRadius(cappedOuterRadii.bottomLeft, cappedBorderLeftWidth, cappedBorderBottomWidth);
		const innerBottomLeftTransform: any = CGAffineTransformMake(maxRadius && xRadius / maxRadius, 0, 0, maxRadius && yRadius / maxRadius, position.left + cappedBorderLeftWidth + xRadius, position.bottom - cappedBorderBottomWidth - yRadius);
		CGPathAddArc(clipPath, innerBottomLeftTransform, 0, 0, maxRadius, Math.PI / 2, Math.PI, false);
	} else {
		CGPathAddLineToPoint(clipPath, null, position.left, position.bottom);
	}

	if (cappedBorderTopWidth > 0 || cappedBorderLeftWidth > 0) {
		const { xRadius, yRadius, maxRadius } = calculateInnerBorderClipRadius(cappedOuterRadii.topLeft, cappedBorderLeftWidth, cappedBorderTopWidth);
		const innerTopLeftTransform: any = CGAffineTransformMake(maxRadius && xRadius / maxRadius, 0, 0, maxRadius && yRadius / maxRadius, position.left + cappedBorderLeftWidth + xRadius, position.top + cappedBorderTopWidth + yRadius);
		CGPathAddArc(clipPath, innerTopLeftTransform, 0, 0, maxRadius, Math.PI, (Math.PI * 3) / 2, false);
	} else {
		CGPathAddLineToPoint(clipPath, null, position.left, position.top);
	}

	CGPathCloseSubpath(clipPath);
	return clipPath;
}

/**
 * Calculates the needed widths for creating triangular shapes for each border.
 * To achieve this, all border widths are scaled according to view bounds.
 *
 * @param bounds
 * @param background
 * @returns
 */
function getBorderTriangleWidths(bounds: CGRect, background: BackgroundDefinition): Position {
	const width: number = bounds.origin.x + bounds.size.width;
	const height: number = bounds.origin.y + bounds.size.height;

	const borderTopWidth: number = Math.max(0, layout.toDeviceIndependentPixels(background.borderTopWidth));
	const borderRightWidth: number = Math.max(0, layout.toDeviceIndependentPixels(background.borderRightWidth));
	const borderBottomWidth: number = Math.max(0, layout.toDeviceIndependentPixels(background.borderBottomWidth));
	const borderLeftWidth: number = Math.max(0, layout.toDeviceIndependentPixels(background.borderLeftWidth));

	const verticalBorderWidth: number = borderTopWidth + borderBottomWidth;
	const horizontalBorderWidth: number = borderLeftWidth + borderRightWidth;

	let verticalBorderMultiplier = verticalBorderWidth > 0 ? height / verticalBorderWidth : 0;
	let horizontalBorderMultiplier = horizontalBorderWidth > 0 ? width / horizontalBorderWidth : 0;

	// Both directions should consider each other in order to scale widths properly, as a view might have different width and height
	if (verticalBorderMultiplier > 0 && verticalBorderMultiplier < horizontalBorderMultiplier) {
		horizontalBorderMultiplier -= horizontalBorderMultiplier - verticalBorderMultiplier;
	}

	if (horizontalBorderMultiplier > 0 && horizontalBorderMultiplier < verticalBorderMultiplier) {
		verticalBorderMultiplier -= verticalBorderMultiplier - horizontalBorderMultiplier;
	}

	return {
		top: borderTopWidth * verticalBorderMultiplier,
		right: borderRightWidth * horizontalBorderMultiplier,
		bottom: borderBottomWidth * verticalBorderMultiplier,
		left: borderLeftWidth * horizontalBorderMultiplier,
	};
}

/**
 * Generates paths for visualizing borders with different colors per side.
 * This is achieved by extending all borders enough to consume entire view size,
 * then using an even-odd inner mask to clip and eventually render borders according to their corresponding width.
 *
 * @param bounds
 * @param background
 * @returns
 */
function generateNonUniformMultiColorBorderPaths(bounds: CGRect, background: BackgroundDefinition): Array<any> {
	const { width, height } = bounds.size;
	const { x, y } = bounds.origin;

	const position: Position = {
		left: x,
		top: y,
		bottom: y + height,
		right: x + width,
	};

	const borderWidths: Position = getBorderTriangleWidths(bounds, background);
	const paths = new Array(4);

	const lto: Point = {
		x: position.left,
		y: position.top,
	}; // left-top-outside
	const lti: Point = {
		x: position.left + borderWidths.left,
		y: position.top + borderWidths.top,
	}; // left-top-inside

	const rto: Point = {
		x: position.right,
		y: position.top,
	}; // right-top-outside
	const rti: Point = {
		x: position.right - borderWidths.right,
		y: position.top + borderWidths.top,
	}; // right-top-inside

	const rbo: Point = {
		x: position.right,
		y: position.bottom,
	}; // right-bottom-outside
	const rbi: Point = {
		x: position.right - borderWidths.right,
		y: position.bottom - borderWidths.bottom,
	}; // right-bottom-inside

	const lbo: Point = {
		x: position.left,
		y: position.bottom,
	}; // left-bottom-outside
	const lbi: Point = {
		x: position.left + borderWidths.left,
		y: position.bottom - borderWidths.bottom,
	}; // left-bottom-inside

	const borderTopColor = background.borderTopColor;
	const borderRightColor = background.borderRightColor;
	const borderBottomColor = background.borderBottomColor;
	const borderLeftColor = background.borderLeftColor;

	if (borderWidths.top > 0 && borderTopColor?.ios) {
		const topBorderPath = CGPathCreateMutable();

		CGPathMoveToPoint(topBorderPath, null, lto.x, lto.y);
		CGPathAddLineToPoint(topBorderPath, null, rto.x, rto.y);
		CGPathAddLineToPoint(topBorderPath, null, rti.x, rti.y);
		if (rti.x !== lti.x) {
			CGPathAddLineToPoint(topBorderPath, null, lti.x, lti.y);
		}
		CGPathAddLineToPoint(topBorderPath, null, lto.x, lto.y);

		paths[0] = topBorderPath;
	}
	if (borderWidths.right > 0 && borderRightColor?.ios) {
		const rightBorderPath = CGPathCreateMutable();

		CGPathMoveToPoint(rightBorderPath, null, rto.x, rto.y);
		CGPathAddLineToPoint(rightBorderPath, null, rbo.x, rbo.y);
		CGPathAddLineToPoint(rightBorderPath, null, rbi.x, rbi.y);
		if (rbi.y !== rti.y) {
			CGPathAddLineToPoint(rightBorderPath, null, rti.x, rti.y);
		}
		CGPathAddLineToPoint(rightBorderPath, null, rto.x, rto.y);

		paths[1] = rightBorderPath;
	}
	if (borderWidths.bottom > 0 && borderBottomColor?.ios) {
		const bottomBorderPath = CGPathCreateMutable();

		CGPathMoveToPoint(bottomBorderPath, null, rbo.x, rbo.y);
		CGPathAddLineToPoint(bottomBorderPath, null, lbo.x, lbo.y);
		CGPathAddLineToPoint(bottomBorderPath, null, lbi.x, lbi.y);
		if (lbi.x !== rbi.x) {
			CGPathAddLineToPoint(bottomBorderPath, null, rbi.x, rbi.y);
		}
		CGPathAddLineToPoint(bottomBorderPath, null, rbo.x, rbo.y);

		paths[2] = bottomBorderPath;
	}
	if (borderWidths.left > 0 && borderLeftColor?.ios) {
		const leftBorderPath = CGPathCreateMutable();

		CGPathMoveToPoint(leftBorderPath, null, lbo.x, lbo.y);
		CGPathAddLineToPoint(leftBorderPath, null, lto.x, lto.y);
		CGPathAddLineToPoint(leftBorderPath, null, lti.x, lti.y);
		if (lti.y !== lbi.y) {
			CGPathAddLineToPoint(leftBorderPath, null, lbi.x, lbi.y);
		}
		CGPathAddLineToPoint(leftBorderPath, null, lbo.x, lbo.y);

		paths[3] = leftBorderPath;
	}

	return paths;
}

function drawBoxShadow(view: View): void {
	const background = view.style.backgroundInternal;
	const nativeView = <NativeScriptUIView>view.nativeViewProtected;
	const layer = nativeView.layer;

	// There is no parent to add shadow to
	if (!layer.superlayer) {
		return;
	}

	const bounds = nativeView.bounds;
	const boxShadow: BoxShadow = background.getBoxShadow();

	// Initialize outer shadows
	let outerShadowContainerLayer: CALayer;
	if (nativeView.outerShadowContainerLayer) {
		outerShadowContainerLayer = nativeView.outerShadowContainerLayer;
	} else {
		outerShadowContainerLayer = CALayer.new();

		// TODO: Make this dynamic when views get support for multiple shadows
		const shadowLayer = CALayer.new();
		// This mask is necessary to maintain transparent background
		const maskLayer = CAShapeLayer.new();
		maskLayer.fillRule = kCAFillRuleEvenOdd;

		shadowLayer.mask = maskLayer;
		outerShadowContainerLayer.addSublayer(shadowLayer);

		// Instead of nesting it, add shadow container layer underneath view so that it's not affected by border masking
		layer.superlayer.insertSublayerBelow(outerShadowContainerLayer, layer);
		nativeView.outerShadowContainerLayer = outerShadowContainerLayer;
	}

	// Apply clip path to shadow
	if (nativeView.maskType === iosViewUtils.LayerMask.CLIP_PATH && layer.mask instanceof CAShapeLayer) {
		if (!outerShadowContainerLayer.mask) {
			outerShadowContainerLayer.mask = CAShapeLayer.new();
		}
		if (outerShadowContainerLayer.mask instanceof CAShapeLayer) {
			outerShadowContainerLayer.mask.path = layer.mask.path;
		}
	}

	outerShadowContainerLayer.bounds = bounds;
	outerShadowContainerLayer.anchorPoint = layer.anchorPoint;
	outerShadowContainerLayer.position = nativeView.center;
	outerShadowContainerLayer.zPosition = layer.zPosition;

	// Inherit view visibility values
	outerShadowContainerLayer.opacity = layer.opacity;
	outerShadowContainerLayer.hidden = layer.hidden;

	const outerShadowLayers = outerShadowContainerLayer.sublayers;
	if (outerShadowLayers?.count) {
		for (let i = 0, count = outerShadowLayers.count; i < count; i++) {
			const shadowLayer = outerShadowLayers[i];
			const shadowRadius = layout.toDeviceIndependentPixels(boxShadow.blurRadius);
			const spreadRadius = layout.toDeviceIndependentPixels(boxShadow.spreadRadius);
			const offsetX = layout.toDeviceIndependentPixels(boxShadow.offsetX);
			const offsetY = layout.toDeviceIndependentPixels(boxShadow.offsetY);
			const { maskPath, shadowPath } = ios.generateShadowLayerPaths(view, bounds);

			shadowLayer.allowsEdgeAntialiasing = true;
			shadowLayer.contentsScale = Screen.mainScreen.scale;

			// Shadow opacity is handled on the shadow's color instance
			shadowLayer.shadowOpacity = boxShadow.color?.a ? boxShadow.color.a / 255 : 1;
			shadowLayer.shadowRadius = shadowRadius;
			shadowLayer.shadowColor = boxShadow.color?.ios?.CGColor;
			shadowLayer.shadowOffset = CGSizeMake(offsetX, offsetY);

			// Apply spread radius by expanding shadow layer bounds (this has a nice glow with radii set to 0)
			shadowLayer.shadowPath = shadowPath;

			// A mask that ensures that view maintains transparent background
			if (shadowLayer.mask instanceof CAShapeLayer) {
				shadowLayer.mask.path = maskPath;
			}
		}
	}
}

function clearBoxShadow(nativeView: NativeScriptUIView) {
	if (nativeView.outerShadowContainerLayer) {
		nativeView.outerShadowContainerLayer.removeFromSuperlayer();
		nativeView.outerShadowContainerLayer = null;
	}
}

/**
 * Creates a mask that ensures no shadow will be displayed underneath transparent backgrounds.
 *
 * @param bounds
 * @param boxShadow
 * @param bordersClipPath
 * @returns
 */
function generateShadowMaskPath(bounds: CGRect, boxShadow: BoxShadow, innerClipPath: any): any {
	const shadowRadius = layout.toDeviceIndependentPixels(boxShadow.blurRadius);
	const spreadRadius = layout.toDeviceIndependentPixels(boxShadow.spreadRadius);
	const offsetX = layout.toDeviceIndependentPixels(boxShadow.offsetX);
	const offsetY = layout.toDeviceIndependentPixels(boxShadow.offsetY);

	// This value has to be large enough to avoid clipping shadow halo effect
	const outerRectRadius: number = shadowRadius * 3 + spreadRadius;

	const maskPath = CGPathCreateMutable();
	// Proper clip position and size
	const outerRect = CGRectOffset(CGRectInset(bounds, -outerRectRadius, -outerRectRadius), offsetX, offsetY);

	CGPathAddPath(maskPath, null, innerClipPath);
	CGPathAddRect(maskPath, null, outerRect);

	return maskPath;
}

function rectPath(value: string, position: Position): UIBezierPath {
	const arr = value.split(/[\s]+/);
	const top = cssValueToDeviceIndependentPixels(arr[0], position.top);
	const right = cssValueToDeviceIndependentPixels(arr[1], position.right);
	const bottom = cssValueToDeviceIndependentPixels(arr[2], position.bottom);
	const left = cssValueToDeviceIndependentPixels(arr[3], position.left);

	return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}

function insetPath(value: string, position: Position): UIBezierPath {
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

	const top = cssValueToDeviceIndependentPixels(topString, position.bottom);
	const right = cssValueToDeviceIndependentPixels('100%', position.right) - cssValueToDeviceIndependentPixels(rightString, position.right);
	const bottom = cssValueToDeviceIndependentPixels('100%', position.bottom) - cssValueToDeviceIndependentPixels(bottomString, position.bottom);
	const left = cssValueToDeviceIndependentPixels(leftString, position.right);

	return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}

function circlePath(value: string, position: Position): UIBezierPath {
	const arr = value.split(/[\s]+/);
	const radius = cssValueToDeviceIndependentPixels(arr[0], (position.right > position.bottom ? position.bottom : position.right) / 2);
	const y = cssValueToDeviceIndependentPixels(arr[2], position.bottom);
	const x = cssValueToDeviceIndependentPixels(arr[3], position.right);

	return UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(x, y), radius, 0, 360, true).CGPath;
}

function ellipsePath(value: string, position: Position): UIBezierPath {
	const arr = value.split(/[\s]+/);

	const rX = cssValueToDeviceIndependentPixels(arr[0], position.right);
	const rY = cssValueToDeviceIndependentPixels(arr[1], position.bottom);
	const cX = cssValueToDeviceIndependentPixels(arr[3], position.right);
	const cY = cssValueToDeviceIndependentPixels(arr[4], position.bottom);

	const left = cX - rX;
	const top = cY - rY;
	const width = rX * 2;
	const height = rY * 2;

	return UIBezierPath.bezierPathWithOvalInRect(CGRectMake(left, top, width, height)).CGPath;
}

function polygonPath(value: string, position: Position): UIBezierPath {
	const path = CGPathCreateMutable();

	let firstPoint: Point;
	const arr = value.split(/[,]+/);
	for (let i = 0; i < arr.length; i++) {
		const xy = arr[i].trim().split(/[\s]+/);
		const point: Point = {
			x: cssValueToDeviceIndependentPixels(xy[0], position.right),
			y: cssValueToDeviceIndependentPixels(xy[1], position.bottom),
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
