import type { ImageSource as ImageSourceDefinition } from '.';
import { ImageAsset } from '../image-asset';
import { path as fsPath, knownFolders } from '../file-system';
import { isFileOrResourcePath } from '../utils';

export { isFileOrResourcePath };

function makeBitmapImage(): any {
	return new (Windows as any).UI.Xaml.Media.Imaging.BitmapImage();
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
	return bytesToStream(bytes).then(bitmapFromStream);
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
				reject
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
		try {
			const writer = new Windows.Storage.Streams.DataWriter();
			writer.WriteBytes(bytes as never);
			const buffer = writer.DetachBuffer();
			NSWinRT.toPromise((Windows.Storage.PathIO as any).WriteBufferAsync(filePath, buffer)).then(
				() => resolve(true),
				reject
			);
		} catch (e) { reject(e); }
	});
}

function resizeBitmapAsync(bytes: Uint8Array, maxSize: number): Promise<{ bmp: any; bytes: Uint8Array; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		bytesToStream(bytes).then((inStream: any) => {
			try {
				const BitmapDecoder = (Windows as any).Graphics?.Imaging?.BitmapDecoder;
				if (!BitmapDecoder) { reject(new Error('BitmapDecoder unavailable')); return; }
				NSWinRT.toPromise(BitmapDecoder.CreateAsync(inStream)).then(
					(decoder: any) => {
						try {
							const srcW: number = decoder.PixelWidth;
							const srcH: number = decoder.PixelHeight;
							const scale = maxSize / Math.max(srcW, srcH);
							const dstW = Math.round(srcW * scale);
							const dstH = Math.round(srcH * scale);

							const outStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
							const BitmapEncoder = (Windows as any).Graphics?.Imaging?.BitmapEncoder;

							NSWinRT.toPromise(BitmapEncoder.CreateForTranscodingAsync(outStream, decoder)).then(
								(encoder: any) => {
									try {
										const transform = encoder.BitmapTransform;
										transform.ScaledWidth = dstW;
										transform.ScaledHeight = dstH;
										NSWinRT.toPromise(encoder.FlushAsync()).then(
											() => {
												try {
													(outStream as any).Seek(0);
													bitmapFromStream(outStream).then(
														(bmp: any) => {
															// read encoded bytes from outStream
															(outStream as any).Seek(0);
															const size: number = (outStream as any).Size;
															const reader2 = new Windows.Storage.Streams.DataReader(outStream);
															NSWinRT.toPromise((reader2 as any).LoadAsync(size)).then(
																() => {
																	const outBytes = new Uint8Array(size);
																	reader2.ReadBytes(outBytes as never);
																	resolve({ bmp, bytes: outBytes, width: dstW, height: dstH });
																},
																reject
															);
														},
														reject
													);
												} catch (e) { reject(e); }
											},
											reject
										);
									} catch (e) { reject(e); }
								},
								reject
							);
						} catch (e) { reject(e); }
					},
					reject
				);
			} catch (e) { reject(e); }
		}, reject);
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
		return fetchBytesAsync(url).then((bytes) => {
			return bitmapFromBytesAsync(bytes).then((bmp) => {
				const src = new ImageSource(bmp);
				src._rawBytes = bytes;
				src._width = bmp.PixelWidth ?? 0;
				src._height = bmp.PixelHeight ?? 0;
				return src;
			});
		});
	}

	static fromResourceSync(name: string): ImageSource {
		try {
			const filePath = fsPath.join(knownFolders.currentApp().path, 'App_Resources', 'Windows', name);
			return ImageSource.fromFileSync(filePath);
		} catch {
			return null as any;
		}
	}

	static fromResource(name: string): Promise<ImageSource> {
		return ImageSource.fromFile(
			fsPath.join(knownFolders.currentApp().path, 'App_Resources', 'Windows', name)
		);
	}

	static fromFileSync(filePath: string): ImageSource {
		try {
			const bmp = makeBitmapImage();
			bmp.UriSource = new Windows.Foundation.Uri(fileUri(filePath));
			const src = new ImageSource();
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
			// fallback to sync (UriSource)
			return ImageSource.fromFileSync(filePath);
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

	public setNativeSource(source: any): void {
		this.windows = source;
		try {
			if (source && typeof source.PixelWidth === 'number') {
				this._width = source.PixelWidth;
				this._height = source.PixelHeight;
			}
		} catch {}
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
