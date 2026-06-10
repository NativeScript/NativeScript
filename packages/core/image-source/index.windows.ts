import type { ImageSource as ImageSourceDefinition } from '.';
import { ImageAsset } from '../image-asset';
import { path as fsPath, knownFolders } from '../file-system';
import { isFileOrResourcePath } from '../utils';
import { Trace } from '../trace';
import { isMainThread, dispatchToMainThread } from '../utils/mainthread-helper';
import { requestInternal as httpRequest } from '../http/http-request-internal';
export { isFileOrResourcePath };

// Cached constants for resource name handling
const RES_PREFIX = 'res://';
const LEADING_SLASHES_RE = /^[\\/]+/;
const BACKSLASH_RE = /\\/g;

function resolveAppPath(filePath: string): string {
	if (filePath.startsWith('~/')) {
		return fsPath.join(knownFolders.currentApp().path, filePath.substring(2));
	}
	return filePath;
}

function makeBitmapImage() {
	return new Microsoft.UI.Xaml.Media.Imaging.BitmapImage();
}

function bitmapFromUriAsync(uriStr: string): Promise<Microsoft.UI.Xaml.Media.Imaging.BitmapImage> {
	return new Promise((resolve, reject) => {
		try {
			const bmp = makeBitmapImage();
			const onOpened = () => {
				resolve(bmp);
			};
			const onFailed = (s: any, e: any) => {
				reject(e || new Error('Image load failed'));
			};
			bmp.ImageOpened = onOpened;
			bmp.ImageFailed = onFailed;
			bmp.UriSource = new Windows.Foundation.Uri(uriStr);
		} catch (err) { reject(err); }
	});
}

function fileUri(filePath: string): string {
	if (/^(ms-|http|file:)/i.test(filePath)) return filePath;
	return 'file:///' + filePath.replace(/\\/g, '/');
}

function bytesToStream(bytes: Uint8Array): Promise<any> {
	return new Promise((resolve, reject) => {
		try {
			const writer = new Windows.Storage.Streams.DataWriter();
			writer.WriteBytes(bytes as never);
			const buffer = writer.DetachBuffer();
			const stream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
			NSWinRT.toPromise((stream as any).WriteAsync(buffer)).then(
				() => { try { (stream as any).Seek(0); resolve(stream); } catch (e) { reject(e); } },
				reject
			);
		} catch (e) { reject(e); }
	});
}

function bitmapFromStream(stream: any): Promise<any> {
	return new Promise((resolve, reject) => {
		// BitmapImage has UI thread affinity — create and load on the UI thread.
		const create = () => {
			try {
				(stream as any).Seek(0);
				const bmp = makeBitmapImage();
				NSWinRT.toPromise(bmp.SetSourceAsync(stream)).then(
					() => resolve(bmp),
					reject
				);
			} catch (e) { reject(e); }
		};
		if (isMainThread()) {
			create();
		} else {
			dispatchToMainThread(create);
		}
	});
}

function bitmapFromBytesAsync(bytes: Uint8Array): Promise<any> {
	return bytesToStream(bytes).then((stream) => {
		return bitmapFromStream(stream);
	});
}

function fetchBytesAsync(url: string): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		try {
			const httpClient = new Windows.Web.Http.HttpClient();
			const uri = new Windows.Foundation.Uri(url);
			NSWinRT.toPromise(httpClient.GetBufferAsync(uri)).then(
				(buffer: any) => {
					try {
						const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
						const bytes = new Uint8Array(buffer.Length);
						reader.ReadBytes(bytes as never);
						resolve(bytes);
					} catch (e) { reject(e); }
				},
				(err: any) => { reject(err); }
			);
		} catch (e) { reject(e); }
	});
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function readFileBytes(filePath: string): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		try {
			NSWinRT.toPromise((Windows.Storage.PathIO as any).ReadBufferAsync(filePath)).then(
				(buffer: any) => {
					try {
						const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
						const bytes = new Uint8Array(buffer.Length);
						reader.ReadBytes(bytes as never);
						resolve(bytes);
					} catch (e) { reject(e); }
				},
				reject
			);
		} catch (e) { reject(e); }
	});
}

function writeBytesToFile(filePath: string, bytes: Uint8Array): Promise<boolean> {
	return new Promise((resolve, reject) => {
		NSWinRT.toPromise(
			NativeScript.Widgets.ImageHelper.SaveToFileAsync(bytes as never, filePath)
		).then(
			(result) => resolve(result),
			(err) => reject(err)
		);
	});
}

function resizeBitmapAsync(bytes: Uint8Array, maxSize: number): Promise<{ bmp: any; bytes: Uint8Array; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		NSWinRT.toPromise(
			NativeScript.Widgets.ImageHelper.ResizeAsync(bytes as never, maxSize)
		).then(
			(result: NativeScript.Widgets.ImageResult) => {
				resolve({
					bmp: result.Bitmap,
					bytes: bytes,
					width: result.Width,
					height: result.Height,
				});
			})
			.catch((err) => reject(err));

	});
}

export class ImageSource implements ImageSourceDefinition {
	public android: any;
	public ios: any;
	public windows: any; // BitmapImage or raw Uint8Array (lazy)

	private _rawBytes: Uint8Array | null = null;
	private _width: number = 0;
	private _height: number = 0;
	private _rotationAngle: number = 0;

	public get height(): number { return this._height; }
	public get width(): number { return this._width; }
	public get rotationAngle(): number { return this._rotationAngle; }
	public set rotationAngle(value: number) { this._rotationAngle = value; }

	constructor(nativeSource?: any) {
		if (nativeSource) {
			this.setNativeSource(nativeSource);
		}
	}

	static fromAsset(asset: ImageAsset): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			asset.getImageAsync((fileOrNative: any, err: any) => {
				if (err) { reject(err); return; }
				if (!fileOrNative) { reject(new Error('No image from asset')); return; }
				try {
					if (typeof fileOrNative === 'string') {
						ImageSource.fromFile(fileOrNative).then(resolve, reject);
						return;
					}
					NSWinRT.toPromise(fileOrNative.OpenAsync(0 /* FileAccessMode.Read */)).then(
						(stream: any) => bitmapFromStream(stream).then(
							(bmp) => resolve(new ImageSource(bmp)),
							reject
						),
						reject
					);
				} catch (e) { reject(e); }
			});
		});
	}

	static fromUrl(url: string): Promise<ImageSource> {
		return httpRequest({ url, method: 'GET' }).then((response) => response.content.toNativeImage().then((value) => new ImageSource(value)));
	}

	static fromResourceSync(name: string): ImageSource {
		if (!name) return null as any;
		try {
			const resourceName = name.startsWith(RES_PREFIX) ? name.slice(RES_PREFIX.length) : name;
			const normalized = resourceName.replace(LEADING_SLASHES_RE, '').replace(BACKSLASH_RE, '/');
			const exts = ['', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp'];
			const resolve = (globalThis as any).__nsMsAppxResolve;
			if (typeof resolve === 'function') {
				for (const ext of exts) {
					const uri = `ms-appx:///Assets/${normalized}${ext}`;
					if (resolve(uri) != null) {
						return ImageSource.fromFileSync(uri);
					}
				}
				return null as any;
			}
			// Fallback when runtime hasn't registered the resolver yet
			return ImageSource.fromFileSync(`ms-appx:///Assets/${normalized}`);
		} catch {
			return null as any;
		}
	}

	static async fromResource(name: string): Promise<ImageSource> {
		if (!name) return null as any;
		try {
			const resourceName = name.startsWith(RES_PREFIX) ? name.slice(RES_PREFIX.length) : name;
			const normalized = resourceName.replace(LEADING_SLASHES_RE, '').replace(BACKSLASH_RE, '/');
			const exts = ['', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp'];

			for (const ext of exts) {
				try {
					const bmp = await bitmapFromUriAsync(`ms-appx:///Assets/${normalized}${ext}`);
					if (bmp) {
						const src = new ImageSource(bmp);
						src._width = bmp.PixelWidth ?? 0;
						src._height = bmp.PixelHeight ?? 0;
						return src;
					}
				} catch { /* try next extension */ }
			}

			return null as any;
		} catch {
			return null as any;
		}
	}

	static fromFileSync(filePath: string): ImageSource {
		try {
			const resolved = resolveAppPath(filePath);
			const bmp = makeBitmapImage();
			const src = new ImageSource();
			bmp.ImageOpened = () => {
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				//@ts-ignore
				bmp.ImageOpened = null;
			};
			bmp.ImageFailed = () => {
				//@ts-ignore
				bmp.ImageOpened = null;
				//@ts-ignore
				bmp.ImageFailed = null;
			}
			bmp.UriSource = new Windows.Foundation.Uri(fileUri(resolved));
			src.windows = bmp;
			return src;
		} catch {
			return null as any;
		}
	}

	static fromFile(filePath: string): Promise<ImageSource> {
		const resolved = resolveAppPath(filePath);
		return readFileBytes(resolved).then((bytes) => {
			return bitmapFromBytesAsync(bytes).then((bmp) => {
				const src = new ImageSource(bmp);
				src._rawBytes = bytes;
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		}).catch(() => {
			return bitmapFromUriAsync(fileUri(resolved)).then((bmp) => {
				const src = new ImageSource(bmp);
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		});
	}

	static fromDataSync(data: ArrayBuffer | Uint8Array): ImageSource {
		const src = new ImageSource();
		const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
		src.windows = bytes;
		src._rawBytes = bytes;
		return src;
	}

	static fromData(data: ArrayBuffer | Uint8Array): Promise<ImageSource> {
		const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
		return bitmapFromBytesAsync(bytes).then((bmp) => {
			const src = new ImageSource(bmp);
			src._rawBytes = bytes;
			src._width = bmp.PixelWidth ?? 0;
			src._height = bmp.PixelHeight ?? 0;
			return src;
		});
	}

	static fromBase64Sync(source: string): ImageSource {
		try {
			const bytes = Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			return ImageSource.fromDataSync(bytes);
		} catch {
			return null as any;
		}
	}

	static fromBase64(source: string): Promise<ImageSource> {
		try {
			const bytes = Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			return ImageSource.fromData(bytes);
		} catch (e) {
			return Promise.reject(e);
		}
	}

	static fromSystemImageSync(name: string): ImageSource {
		return ImageSource.fromResourceSync(name);
	}

	static fromSystemImage(name: string): Promise<ImageSource> {
		return ImageSource.fromResource(name);
	}

	static fromFontIconCodeSync(_source: string, _font: any, _color: any): ImageSource {
		return null as any;
	}

	public getNativeSource(): any {
		return this.windows ?? this._rawBytes;
	}

	public setNativeSource(source: any): void {
		this.windows = source;
		try {
			if (source && typeof source.PixelWidth === 'number') {
				this._width = source.PixelWidth;
				this._height = source.PixelHeight;
			}
		} catch { }
	}

	public saveToFile(_path: string, _format: string, _quality?: number): boolean {
		return false;
	}

	public saveToFileAsync(path: string, _format: string, _quality?: number): Promise<boolean> {
		if (!this._rawBytes) {
			return Promise.resolve(false);
		}
		return writeBytesToFile(path, this._rawBytes).catch(() => false);
	}

	public toBase64String(_format: string, _quality?: number): string {
		if (!this._rawBytes) return '';
		try {
			return bytesToBase64(this._rawBytes);
		} catch {
			return '';
		}
	}

	public toBase64StringAsync(format: string, quality?: number): Promise<string> {
		return Promise.resolve(this.toBase64String(format, quality));
	}

	public resize(_maxSize: number, _options?: any): ImageSource {
		return this;
	}

	public resizeAsync(maxSize: number, _options?: any): Promise<any> {
		if (!this._rawBytes) {
			return Promise.resolve(this);
		}
		return resizeBitmapAsync(this._rawBytes, maxSize).then(({ bmp, bytes, width, height }) => {
			const src = new ImageSource(bmp);
			src._rawBytes = bytes;
			src._width = width;
			src._height = height;
			return src;
		}).catch(() => this);
	}
}
