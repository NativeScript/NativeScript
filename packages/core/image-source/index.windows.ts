import type { ImageSource as ImageSourceDefinition } from '.';
import { ImageAsset } from '../image-asset';
import { path as fsPath, knownFolders } from '../file-system';
import { isFileOrResourcePath } from '../utils';
import { Trace } from '../trace';

export { isFileOrResourcePath };

// Cached constants for resource name handling
const RES_PREFIX = 'res://';
const LEADING_SLASHES_RE = /^[\\/]+/;
const BACKSLASH_RE = /\\/g;

function makeBitmapImage() {
	return new Windows.UI.Xaml.Media.Imaging.BitmapImage();
}

function bitmapFromUriAsync(uriStr: string): Promise<Windows.UI.Xaml.Media.Imaging.BitmapImage> {
	return new Promise((resolve, reject) => {
		try {
			const bmp = makeBitmapImage();
			const onOpened = () => {
				bmp.ImageOpened = null;
				bmp.ImageFailed = null;
				resolve(bmp);
			};
			const onFailed = (s: any, e: any) => {
				bmp.ImageOpened = null;
				bmp.ImageFailed = null;
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
		try {
			const bmp = makeBitmapImage();
			NSWinRT.toPromise(bmp.SetSourceAsync(stream)).then(
				() => resolve(bmp),
				reject
			);
		} catch (e) { reject(e); }
	});
}

function bitmapFromBytesAsync(bytes: Uint8Array): Promise<any> {
	try { console.log(`[Image.Windows] bitmapFromBytesAsync: bytes.length=${bytes?.length ?? 0}`); } catch (_e) { }
	return bytesToStream(bytes).then((stream) => {
		try { console.log(`[Image.Windows] bitmapFromBytesAsync: streamReady`); } catch (_e) { }
		return bitmapFromStream(stream);
	});
}

function fetchBytesAsync(url: string): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		try {
			try { console.log(`[Image.Windows] fetchBytesAsync: fetching ${url}`); } catch (_e) { }
			const httpClient = new Windows.Web.Http.HttpClient();
			const uri = new Windows.Foundation.Uri(url);
			NSWinRT.toPromise(httpClient.GetBufferAsync(uri)).then(
				(buffer: any) => {
					try {
						const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
						const bytes = new Uint8Array(buffer.Length);
						reader.ReadBytes(bytes as never);
						try { console.log(`[Image.Windows] fetchBytesAsync: fetched ${bytes.length} bytes for ${url}`); } catch (_e) { }
						resolve(bytes);
					} catch (e) { try { console.log(`[Image.Windows] fetchBytesAsync: error reading buffer -> ${e}`); } catch (_ee) {} ; reject(e); }
				},
				(err: any) => { try { console.log(`[Image.Windows] fetchBytesAsync: http error -> ${err}`); } catch (_e) {} ; reject(err); }
			);
		} catch (e) { try { console.log(`[Image.Windows] fetchBytesAsync: exception -> ${e}`); } catch (_e) {} ; reject(e); }
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
		// Use the JS-side HttpClient + bitmap creation path to avoid using
		// the native ImageHelper URL loader which can surface unobserved
		// Task exceptions in some network failure scenarios.
		return fetchBytesAsync(url).then((bytes) => {
			return bitmapFromBytesAsync(bytes).then((bmp) => {
				const src = new ImageSource(bmp);
				src._rawBytes = bytes;
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		}).catch((err) => {
			try { console.log(`[Image.Windows] fromUrl: fetch/bitmap path failed -> ${err}. Trying uri-based loader fallback for ${url}`); } catch (_e) { }
			// Try the native Uri loader as a fallback
			return bitmapFromUriAsync(url).then((bmp) => {
				const src = new ImageSource(bmp);
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		});
	}

	static fromResourceSync(name: string): ImageSource {
		if (!name) return null as any;
		try {
			// Do not mutate the input `name`. Normalize into a local variable.
			const resourceName = name.startsWith(RES_PREFIX) ? name.slice(RES_PREFIX.length) : name;
			// Strip leading slashes using slice in a small loop (avoids regex)
			let normalized = resourceName;
			while (normalized.length && (normalized.charAt(0) === '/' || normalized.charAt(0) === '\\')) {
				normalized = normalized.slice(1);
			}
			// Replace backslashes with forward slashes without regex
			if (normalized.indexOf('\\') !== -1) {
				normalized = normalized.split('\\').join('/');
			}
			const exts = ['', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp'];

			// Always map to the packaged app assets so Windows picks scale-qualified files
			for (const ext of exts) {
				try {
					const msAppx = `ms-appx:///Assets/${normalized}${ext}`;
					try { console.log(`[Image.Windows] fromResourceSync: trying ${msAppx}`); } catch (_e) { }
					const src = ImageSource.fromFileSync(msAppx);
					if (src) {
						try { console.log(`[Image.Windows] fromResourceSync: loaded ${msAppx}`); } catch (_e) { }
						return src;
					}
				} catch { /* ignore and try next */ }
			}
			try { console.log(`[Image.Windows] fromResourceSync: no resource found for ${name}`); } catch (_e) { }

			return null as any;
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

			console.log(`ImageSource.fromResource: loading resource '${name}' (normalized: '${normalized}')`);
			for (const ext of exts) {
				const msAppx = `ms-appx:///Assets/${normalized}${ext}`;
				try {
					const result = await ImageSource.fromFile(msAppx);
					if (result) return result;
				} catch (err) {
					try { console.log(`[Image.Windows] fromResource: failed to load ${msAppx} -> ${err}`); } catch (_e) { }
				}
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
				bmp.ImageOpened = null;
			};
			bmp.UriSource = new Windows.Foundation.Uri(fileUri(filePath));
			src.windows = bmp;
			return src;
		} catch {
			return null as any;
		}
	}

	static fromFile(filePath: string): Promise<ImageSource> {
		return readFileBytes(filePath).then((bytes) => {
			return bitmapFromBytesAsync(bytes).then((bmp) => {
				const src = new ImageSource(bmp);
				src._rawBytes = bytes;
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		}).catch(() => {
			return bitmapFromUriAsync(filePath).then((bmp) => {
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
