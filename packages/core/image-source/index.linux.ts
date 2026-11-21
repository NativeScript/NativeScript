import { ImageSource as ImageSourceDefinition } from '.';
import { ImageAsset } from '../image-asset';
import type { ImageBase } from '../ui/image/image-common';
import { Font } from '../ui/styling/font';
import { Color } from '../color';
import { path as fsPath, knownFolders } from '../file-system';
import { isFileOrResourcePath, RESOURCE_PREFIX } from '../utils';
import { getScaledDimensions } from './image-source-common';

export { isFileOrResourcePath };

function bytesOf(data: any): Uint8Array {
	if (data instanceof ArrayBuffer) return new Uint8Array(data);
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	return null;
}

/** GdkTexture from encoded image bytes (PNG, JPEG, ... through GdkPixbuf loaders). `borrow` skips the copy (decoding is synchronous). */
function textureFromBytes(bytes: Uint8Array, borrow = false): any {
	const gbytes = borrow ? g_bytes_new_static(bytes as any, bytes.byteLength) : g_bytes_new(bytes as any, bytes.byteLength);
	const stream = g_memory_input_stream_new_from_bytes(gbytes);
	const pixbuf = gdk_pixbuf_new_from_stream(stream, null, null);
	g_object_unref(stream);
	g_bytes_unref(gbytes);
	if (!pixbuf) {
		return null;
	}
	const texture = gdk_texture_new_for_pixbuf(pixbuf);
	g_object_unref(pixbuf);
	return texture;
}

/** Resources live in App_Resources/Linux (staged next to the executable). */
function resourcePath(name: string): string | null {
	const appRoot = fsPath.join(knownFolders.currentApp().path, '..', 'App_Resources', 'Linux');
	for (const candidate of [`images/${name}`, `images/${name}.png`, `images/${name}.svg`, `images/${name}.jpg`, name, `${name}.png`]) {
		const full = fsPath.join(appRoot, candidate);
		if (g_file_test(full, 1)) {
			return full;
		}
	}
	return null;
}

export class ImageSource implements ImageSourceDefinition {
	public android: any;
	public ios: any;
	public windows: any;
	private _linux: any = null;

	/** The GdkTexture. */
	get linux(): any {
		return this._linux;
	}

	get height(): number {
		return this._linux ? gdk_texture_get_height(this._linux) : NaN;
	}

	get width(): number {
		return this._linux ? gdk_texture_get_width(this._linux) : NaN;
	}

	get rotationAngle(): number {
		return 0;
	}

	set rotationAngle(_value: number) {}

	constructor(nativeSource?: any) {
		if (nativeSource) {
			this.setNativeSource(nativeSource);
		}
	}

	static fromAsset(asset: ImageAsset): Promise<ImageSource> {
		return new Promise((resolve, reject) => {
			asset.getImageAsync((image, err) => (image ? resolve(new ImageSource(image)) : reject(err)));
		});
	}

	static fromUrl(url: string): Promise<ImageSource> {
		return fetch(url)
			.then((response) => response.arrayBuffer())
			.then((data) => ImageSource.fromDataSync(data));
	}

	static iosSystemScaleFor(_scale: any) {
		return 0;
	}

	/** Freedesktop icon names, e.g. "document-open". */
	static fromSystemImageSync(name: string, _instance?: ImageBase): ImageSource {
		const theme = gtk_icon_theme_get_for_display(gdk_display_get_default());
		const icon = gtk_icon_theme_lookup_icon(theme, name, null, 48, 1, GtkTextDirection.NONE, 0 as any);
		if (!icon) {
			return null;
		}
		const file = gtk_icon_paintable_get_file(icon);
		const path = file && g_file_get_path(file);
		g_object_unref(icon);
		return path ? ImageSource.fromFileSync(interop.stringFromCString(path)) : null;
	}

	static fromSystemImage(name: string, instance?: ImageBase): Promise<ImageSource> {
		return Promise.resolve(ImageSource.fromSystemImageSync(name, instance));
	}

	static fromResourceSync(name: string): ImageSource {
		const path = resourcePath(name);
		return path ? ImageSource.fromFileSync(path) : null;
	}

	static fromResource(name: string): Promise<ImageSource> {
		return Promise.resolve(ImageSource.fromResourceSync(name));
	}

	static fromFileSync(path: string): ImageSource {
		if (path.startsWith('~/')) {
			path = fsPath.join(knownFolders.currentApp().path, path.replace('~/', ''));
		}
		const appBundle = (globalThis as any).__nsBundle;
		if (appBundle?.mounted && appBundle.contains(path)) {
			const real = appBundle.realpath(path);
			if (!real) {
				// decoded synchronously, straight from the bundle's memory
				const texture = appBundle.exists(path) ? textureFromBytes(new Uint8Array(appBundle.read(path)), true) : null;
				return texture ? new ImageSource(texture) : null;
			}
			path = real;
		}
		const texture = gdk_texture_new_from_filename(path, null);
		return texture ? new ImageSource(texture) : null;
	}

	static fromFile(path: string): Promise<ImageSource> {
		return Promise.resolve(ImageSource.fromFileSync(path));
	}

	static fromFileOrResourceSync(path: string): ImageSource {
		if (!isFileOrResourcePath(path)) {
			throw new Error('Path "' + path + '" is not a valid file or resource.');
		}
		return path.startsWith(RESOURCE_PREFIX) ? ImageSource.fromResourceSync(path.slice(RESOURCE_PREFIX.length)) : ImageSource.fromFileSync(path);
	}

	static fromDataSync(data: any): ImageSource {
		const bytes = bytesOf(data);
		const texture = bytes && textureFromBytes(bytes);
		return texture ? new ImageSource(texture) : null;
	}

	static fromData(data: any): Promise<ImageSource> {
		return Promise.resolve(ImageSource.fromDataSync(data));
	}

	static fromBase64Sync(source: string): ImageSource {
		const base64 = source.replace(/^data:image\/[a-z+]+;base64,/, '');
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return ImageSource.fromDataSync(bytes);
	}

	static fromBase64(source: string): Promise<ImageSource> {
		return Promise.resolve(ImageSource.fromBase64Sync(source));
	}

	// TODO(linux): render glyphs with Pango
	static fromFontIconCodeSync(_source: string, _font: Font, _color: Color): ImageSource {
		return null;
	}

	public fromAsset(asset: ImageAsset): any {
		return ImageSource.fromAsset(asset);
	}

	public loadFromResource(name: string): boolean {
		return this._replace(ImageSource.fromResourceSync(name));
	}

	public fromResource(name: string): Promise<boolean> {
		return Promise.resolve(this.loadFromResource(name));
	}

	public loadFromFile(path: string): boolean {
		return this._replace(ImageSource.fromFileSync(path));
	}

	public fromFile(path: string): Promise<boolean> {
		return Promise.resolve(this.loadFromFile(path));
	}

	public loadFromData(data: any): boolean {
		return this._replace(ImageSource.fromDataSync(data));
	}

	public fromData(data: any): Promise<boolean> {
		return Promise.resolve(this.loadFromData(data));
	}

	public loadFromBase64(source: string): boolean {
		return this._replace(ImageSource.fromBase64Sync(source));
	}

	public fromBase64(source: string): Promise<boolean> {
		return Promise.resolve(this.loadFromBase64(source));
	}

	public loadFromFontIconCode(source: string, font: Font, color: Color): boolean {
		return this._replace(ImageSource.fromFontIconCodeSync(source, font, color));
	}

	private _replace(source: ImageSource | null): boolean {
		this.setNativeSource(source?.linux ?? null);
		return !!source;
	}

	public setNativeSource(source: any): void {
		if (source && g_type_check_instance_is_a(source, gdk_pixbuf_get_type())) {
			source = gdk_texture_new_for_pixbuf(source);
		}
		this._linux = source;
	}

	public getNativeSource(): any {
		return this._linux;
	}

	public saveToFile(path: string, format: 'png' | 'jpeg' | 'jpg', _quality?: number): boolean {
		return !!this._linux && !!gdk_texture_save_to_png(this._linux, path);
	}

	public saveToFileAsync(path: string, format: 'png' | 'jpeg' | 'jpg', quality?: number): Promise<boolean> {
		return Promise.resolve(this.saveToFile(path, format, quality));
	}

	public toBase64String(format: 'png' | 'jpeg' | 'jpg', quality?: number): string {
		if (!this._linux) {
			return null;
		}
		// encoded in memory, no temp file
		const size = new interop.Reference(interop.types.uint64, 0);
		const data = g_bytes_unref_to_data(gdk_texture_save_to_png_bytes(this._linux), size);
		if (!data) {
			return null;
		}
		const bytes = new Uint8Array(interop.bufferFromData(data as any, Number(size.value), g_free));
		let binary = '';
		for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}

	public toBase64StringAsync(format: 'png' | 'jpeg' | 'jpg', quality?: number): Promise<string> {
		return Promise.resolve(this.toBase64String(format, quality));
	}

	public resize(maxSize: number, options?: any): any {
		if (!this._linux) {
			return null;
		}
		const size = getScaledDimensions(this.width, this.height, maxSize);
		const pixbuf = gdk_pixbuf_get_from_texture(this._linux);
		const scaled = pixbuf && gdk_pixbuf_scale_simple(pixbuf, size.width, size.height, 2 /* BILINEAR */);
		if (pixbuf) g_object_unref(pixbuf);
		return scaled ? new ImageSource(scaled) : null;
	}

	public resizeAsync(maxSize: number, options?: any): Promise<any> {
		return Promise.resolve(this.resize(maxSize, options));
	}
}

export function fromAsset(asset: ImageAsset): Promise<ImageSource> {
	return ImageSource.fromAsset(asset);
}

export function fromResource(name: string): ImageSource {
	return ImageSource.fromResourceSync(name);
}

export function fromFile(path: string): ImageSource {
	return ImageSource.fromFileSync(path);
}

export function fromData(data: any): ImageSource {
	return ImageSource.fromDataSync(data);
}

export function fromFontIconCode(source: string, font: Font, color: Color): ImageSource {
	return ImageSource.fromFontIconCodeSync(source, font, color);
}

export function fromBase64(source: string): ImageSource {
	return ImageSource.fromBase64Sync(source);
}

export function fromNativeSource(nativeSource: any): ImageSource {
	return new ImageSource(nativeSource);
}

export function fromUrl(url: string): Promise<any> {
	return ImageSource.fromUrl(url);
}

export function fromFileOrResource(path: string): ImageSource {
	return ImageSource.fromFileOrResourceSync(path);
}
