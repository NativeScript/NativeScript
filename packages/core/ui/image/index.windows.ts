export * from './image-common';

import { ImageBase, stretchProperty, imageSourceProperty, srcProperty } from './image-common';
import { ImageSource } from '../../image-source';
import { ImageAsset } from '../../image-asset';
import { Trace } from '../../trace';
import { dispatchToMainThread, isMainThread } from '../../utils/mainthread-helper';

const STRETCH_MAP: Record<string, number> = {
	none: 0,         // Stretch.None
	fill: 1,         // Stretch.Fill
	aspectFit: 2,    // Stretch.Uniform
	aspectFill: 3,   // Stretch.UniformToFill
};

function bitmapFromBytesAsync(bytes: Uint8Array): Promise<any> {
	return new Promise((resolve, reject) => {
		const createOnUIThread = (stream: any) => {
			const create = () => {
				try {
					(stream as any).Seek(0);
					const bmp = new (Windows as any).UI.Xaml.Media.Imaging.BitmapImage();
					NSWinRT.toPromise(bmp.SetSourceAsync(stream)).then(
						() => resolve(bmp),
						(err: any) => reject(err)
					);
				} catch (e) {
					reject(e);
				}
			};
			if (isMainThread()) {
				create();
			} else {
				dispatchToMainThread(create);
			}
		};

		try {
			const writer = new Windows.Storage.Streams.DataWriter();
			writer.WriteBytes(bytes as never);
			const buffer = writer.DetachBuffer();
			const stream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
			NSWinRT.toPromise((stream as any).WriteAsync(buffer)).then(
				() => createOnUIThread(stream),
				(err: any) => reject(err)
			);
		} catch (e) {
			reject(e);
		}
	});
}

export class Image extends ImageBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Image;
	private _windows!: Windows.UI.Xaml.Controls.Image;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Image();
		this.isLoading = false;
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.Image {
		return this._windows;
	}

	public disposeImageSource() {
		if (this.nativeViewProtected?.Source === this.imageSource?.windows) {
			this.nativeViewProtected.Source = null as never;
		}
		if (this.imageSource?.windows) {
			this.imageSource.windows = null;
		}
		this.imageSource = null as never;
	}

	[imageSourceProperty.setNative](value: ImageSource) {
		if (value !== this.imageSource) {
			this.disposeImageSource();
		}
		this._setNativeImage(value ? value.windows : null);
	}

	[srcProperty.setNative](value: string | ImageSource | ImageAsset) {
		this._createImageSourceFromSrc(value);
	}

	//@ts-ignore
	[stretchProperty.setNative](value: string) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.Stretch = STRETCH_MAP[value] ?? 2;
		}
	}

	public _setNativeImage(nativeImage: any) {
		if (!this.nativeViewProtected) {
			if (Trace.isEnabled()) {
				Trace.write('Image._setNativeImage: nativeViewProtected missing', Trace.categories.Error);
			}
			return;
		}

		if (this.nativeViewProtected.Source) {
			this.nativeViewProtected.Source = null as never;
		}

		if (!nativeImage) {
			if (Trace.isEnabled()) {
				Trace.write('Image._setNativeImage: nativeImage is null/undefined', Trace.categories.Debug);
			}
			return;
		}

		if (nativeImage instanceof ArrayBuffer || nativeImage instanceof Uint8Array) {
			const bytes = nativeImage instanceof Uint8Array ? nativeImage : new Uint8Array(nativeImage);
			bitmapFromBytesAsync(bytes)
				.then((bmp: any) => {
					if (this.nativeViewProtected) {
						this.nativeViewProtected.Source = bmp;
						if (Trace.isEnabled()) {
							Trace.write(`Image._setNativeImage: set Source to BitmapImage (PixelWidth=${bmp?.PixelWidth ?? 'unknown'})`, Trace.categories.Debug);
						}
					}
				})
				.catch((err) => {
					if (Trace.isEnabled()) {
						Trace.write(`Image._setNativeImage: bitmapFromBytesAsync error: ${err}`, Trace.categories.Error);
					}
				});
			return;
		}


		try {
			this.nativeViewProtected.Source = nativeImage;
			if (Trace.isEnabled()) {
				Trace.write(`Image._setNativeImage: set Source to nativeImage (type=${typeof nativeImage}, PixelWidth=${nativeImage?.PixelWidth ?? 'n/a'})`, Trace.categories.Debug);
			}
		} catch (err) {
			if (Trace.isEnabled()) {
				Trace.write(`Image._setNativeImage: error setting Source: ${err}`, Trace.categories.Error);
			}
		}
	}
}
