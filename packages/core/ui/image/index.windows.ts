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

function bitmapFromBytesAsync(bytes: Uint8Array): Promise<Microsoft.UI.Xaml.Media.Imaging.BitmapImage> {
	return new Promise((resolve, reject) => {
		const createOnUIThread = (stream: Windows.Storage.Streams.InMemoryRandomAccessStream) => {
			const create = () => {
				try {
					stream.Seek(0);
					const bmp = new Microsoft.UI.Xaml.Media.Imaging.BitmapImage();
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
			NSWinRT.toPromise(stream.WriteAsync(buffer)).then(
				() => createOnUIThread(stream),
				(err: any) => reject(err)
			);
		} catch (e) {
			reject(e);
		}
	});
}

export class Image extends ImageBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.Border;
	private _image!: Microsoft.UI.Xaml.Controls.Image;
	private _border!: Microsoft.UI.Xaml.Controls.Border;

	constructor() {
		super();
		this.isLoading = false;
	}

	public createNativeView() {
		this._image = new Microsoft.UI.Xaml.Controls.Image();
		this._border = new Microsoft.UI.Xaml.Controls.Border();
		this._border.Child = this._image;
		return this._border;
	}

	get windows(): Microsoft.UI.Xaml.Controls.Image {
		return this._image;
	}

	public disposeImageSource() {
		// Do NOT null this._image.Source here. dispose is always followed by a _setNativeImage that
		// either sets the new bitmap (XAML replaces in one pass) or nulls for the clear case — nulling
		// here forced a second render pass per rebind on a list that swaps the image every row. We only
		// release the JS-side refs; the old bitmap is dropped when the new Source is assigned.
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
		if (this._image) {
			this._image.Stretch = STRETCH_MAP[value] ?? 2;
		}
	}

	public _setNativeImage(nativeImage: any) {
		if (!this._image) {
			if (Trace.isEnabled()) {
				Trace.write('Image._setNativeImage: native image host missing', Trace.categories.Error);
			}
			return;
		}

		if (!nativeImage) {
			// Clearing: null out the existing source (and only then — see below). Setting a NEW source
			// does NOT need a null first; XAML replaces it in one pass. Nulling-then-setting forced two
			// render passes per row on a list that swaps the image every rebind — pure waste.
			if (this._image.Source) {
				this._image.Source = null as never;
			}
			if (Trace.isEnabled()) {
				Trace.write('Image._setNativeImage: nativeImage is null/undefined', Trace.categories.Debug);
			}
			return;
		}

		if (nativeImage instanceof ArrayBuffer || nativeImage instanceof Uint8Array) {
			const bytes = nativeImage instanceof Uint8Array ? nativeImage : new Uint8Array(nativeImage);
			bitmapFromBytesAsync(bytes)
				.then((bmp: any) => {
					if (this._image) {
						this._image.Source = bmp;
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
			this._image.Source = nativeImage;
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
