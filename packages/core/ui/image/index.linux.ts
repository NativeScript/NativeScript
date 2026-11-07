import { ImageBase, stretchProperty, imageSourceProperty, srcProperty, tintColorProperty } from './image-common';
import { ImageSource } from '../../image-source';
import { ImageAsset } from '../../image-asset';
import { Color } from '../../color';
import { Trace } from '../../trace';
import { layout } from '../../utils';

export * from './image-common';

/** GtkPicture showing the ImageSource's GdkTexture. */
export class Image extends ImageBase {
	private _imageSourceAffectsLayout = true;

	public createNativeView() {
		const picture: any = gtk_picture_new();
		gtk_picture_set_can_shrink(picture, 1);
		return picture;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	public disposeImageSource() {
		if (this.nativeViewProtected) {
			gtk_picture_set_paintable(this.nativeViewProtected, null);
		}
		this.imageSource = null;
	}

	public disposeNativeView(): void {
		this.disposeImageSource();
		super.disposeNativeView();
	}

	public _setNativeImage(texture: any) {
		if (this.nativeViewProtected) {
			gtk_picture_set_paintable(this.nativeViewProtected, texture ?? null);
		}
		if (this._imageSourceAffectsLayout) {
			this.requestLayout();
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// We don't call super because we measure native view with specific size.
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const nativeWidth = this.imageSource ? layout.toDevicePixels(this.imageSource.width) : 0;
		const nativeHeight = this.imageSource ? layout.toDevicePixels(this.imageSource.height) : 0;

		let measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
		let measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);

		const finiteWidth: boolean = widthMode !== layout.UNSPECIFIED;
		const finiteHeight: boolean = heightMode !== layout.UNSPECIFIED;

		this._imageSourceAffectsLayout = widthMode !== layout.EXACTLY || heightMode !== layout.EXACTLY;

		if (nativeWidth !== 0 && nativeHeight !== 0 && (finiteWidth || finiteHeight)) {
			const scale = Image.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight, this.stretch);
			const resultW = Math.round(nativeWidth * scale.width);
			const resultH = Math.round(nativeHeight * scale.height);

			measureWidth = finiteWidth ? Math.min(resultW, width) : resultW;
			measureHeight = finiteHeight ? Math.min(resultH, height) : resultH;

			if (Trace.isEnabled()) {
				Trace.write('Image stretch: ' + this.stretch + ', nativeWidth: ' + nativeWidth + ', nativeHeight: ' + nativeHeight, Trace.categories.Layout);
			}
		}

		const widthAndState = Image.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightAndState = Image.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public static computeScaleFactor(measureWidth: number, measureHeight: number, widthIsFinite: boolean, heightIsFinite: boolean, nativeWidth: number, nativeHeight: number, imageStretch: string): { width: number; height: number } {
		let scaleW = 1;
		let scaleH = 1;

		if ((imageStretch === 'aspectFill' || imageStretch === 'aspectFit' || imageStretch === 'fill') && (widthIsFinite || heightIsFinite)) {
			scaleW = nativeWidth > 0 ? measureWidth / nativeWidth : 0;
			scaleH = nativeHeight > 0 ? measureHeight / nativeHeight : 0;

			if (!widthIsFinite) {
				scaleW = scaleH;
			} else if (!heightIsFinite) {
				scaleH = scaleW;
			} else {
				// No infinite dimensions.
				switch (imageStretch) {
					case 'aspectFit':
						scaleH = scaleW < scaleH ? scaleW : scaleH;
						scaleW = scaleH;
						break;
					case 'aspectFill':
						scaleH = scaleW > scaleH ? scaleW : scaleH;
						scaleW = scaleH;
						break;
				}
			}
		}

		return { width: scaleW, height: scaleH };
	}

	[stretchProperty.setNative](value: 'none' | 'aspectFill' | 'aspectFit' | 'fill') {
		// GTK 4.6 pictures scale with or without the aspect ratio (no cropping fill)
		gtk_picture_set_keep_aspect_ratio(this.nativeViewProtected, value === 'fill' ? 0 : 1);
	}

	[imageSourceProperty.setNative](value: ImageSource) {
		this._setNativeImage(value ? (value as any).linux : null);
	}

	[srcProperty.setNative](value: string | ImageSource | ImageAsset) {
		this._createImageSourceFromSrc(value);
	}

	// raster textures can't be recolored; symbolic icons follow the CSS color
	[tintColorProperty.setNative](value: Color) {}
}
