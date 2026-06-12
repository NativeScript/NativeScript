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

// Packaged MSIX apps cannot load bundled assets via file:// — currentApp().path is the
// InstalledLocation, which is access-restricted for file:// URIs (BitmapImage.ImageFailed fires).
// App-relative ~/ paths must use the ms-appx:/// scheme instead (the same scheme the
// background-image path already relies on). Other schemes / absolute paths pass through fileUri.
function appContentUri(filePath: string): string {
	if (filePath.startsWith('~/')) return 'ms-appx:///app/' + filePath.substring(2);
	return fileUri(resolveAppPath(filePath));
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
			bmp.UriSource = new Windows.Foundation.Uri(appContentUri(filePath));
			src.windows = bmp;
			return src;
		} catch {
			return null as any;
		}
	}

	static fromFile(filePath: string): Promise<ImageSource> {
		// App-relative ~/ assets load via ms-appx:/// (like fromFileSync); the InstalledLocation
		// filesystem path lacks the app/ folder and PathIO.ReadBufferAsync against it can stall.
		if (filePath && filePath.startsWith('~/')) {
			return bitmapFromUriAsync(appContentUri(filePath)).then((bmp) => {
				const src = new ImageSource(bmp);
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		}
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
			return bitmapFromUriAsync(appContentUri(filePath)).then((bmp) => {
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

	static fromFileOrResourceSync(path: string): ImageSource {
		if (!isFileOrResourcePath(path)) {
			if (Trace.isEnabled()) {
				Trace.write('Path "' + path + '" is not a valid file or resource.', Trace.categories.Binding, Trace.messageType.error);
			}
			return null as any;
		}
		if (path.indexOf(RES_PREFIX) === 0) {
			return ImageSource.fromResourceSync(path.slice(RES_PREFIX.length));
		}
		return ImageSource.fromFileSync(path);
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

	// Deprecated instance loaders (parity with iOS/Android): delegate to the static factories and
	// mutate `this`. Windows previously had only the statics, so `new ImageSource().fromAsset(...)` threw.
	private _adoptFrom(imgSource: ImageSource | null): boolean {
		this.windows = imgSource ? imgSource.windows : null;
		this._width = imgSource ? imgSource.width : 0;
		this._height = imgSource ? imgSource.height : 0;
		return !!this.windows;
	}

	public fromAsset(asset: ImageAsset): Promise<ImageSource> {
		console.log('fromAsset() is deprecated. Use ImageSource.fromAsset() instead.');
		return ImageSource.fromAsset(asset).then((imgSource) => {
			this._adoptFrom(imgSource);
			return this;
		});
	}

	public loadFromResource(name: string): boolean {
		console.log('loadFromResource() is deprecated. Use ImageSource.fromResourceSync() instead.');
		return this._adoptFrom(ImageSource.fromResourceSync(name));
	}

	public fromResource(name: string): Promise<boolean> {
		console.log('fromResource() is deprecated. Use ImageSource.fromResource() instead.');
		return ImageSource.fromResource(name).then((imgSource) => this._adoptFrom(imgSource));
	}

	public loadFromFile(path: string): boolean {
		console.log('loadFromFile() is deprecated. Use ImageSource.fromFileSync() instead.');
		return this._adoptFrom(ImageSource.fromFileSync(path));
	}

	public fromFile(path: string): Promise<boolean> {
		console.log('fromFile() is deprecated. Use ImageSource.fromFile() instead.');
		return ImageSource.fromFile(path).then((imgSource) => this._adoptFrom(imgSource));
	}

	public loadFromData(data: any): boolean {
		console.log('loadFromData() is deprecated. Use ImageSource.fromDataSync() instead.');
		return this._adoptFrom(ImageSource.fromDataSync(data));
	}

	public fromData(data: any): Promise<boolean> {
		console.log('fromData() is deprecated. Use ImageSource.fromData() instead.');
		return ImageSource.fromData(data).then((imgSource) => this._adoptFrom(imgSource));
	}

	public loadFromBase64(source: string): boolean {
		console.log('loadFromBase64() is deprecated. Use ImageSource.fromBase64Sync() instead.');
		return this._adoptFrom(ImageSource.fromBase64Sync(source));
	}

	public fromBase64(source: string): Promise<boolean> {
		console.log('fromBase64() is deprecated. Use ImageSource.fromBase64() instead.');
		return ImageSource.fromBase64(source).then((imgSource) => this._adoptFrom(imgSource));
	}

	public loadFromFontIconCode(source: string, font: any, color: any): boolean {
		console.log('loadFromFontIconCode() is deprecated. Use ImageSource.fromFontIconCodeSync() instead.');
		return this._adoptFrom(ImageSource.fromFontIconCodeSync(source, font, color));
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

export function fromFileOrResource(path: string): ImageSource {
	console.log('fromFileOrResource() is deprecated. Use ImageSource.fromFileOrResourceSync() instead.');
	return ImageSource.fromFileOrResourceSync(path);
}
