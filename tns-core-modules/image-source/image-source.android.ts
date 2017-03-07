// Definitions.
import { ImageSource as ImageSourceDefinition } from "image-source";
import { ImageAsset } from "image-asset";
import * as httpModule from "http";

// Types.
import { path as fsPath, knownFolders } from "file-system";
import { isFileOrResourcePath, RESOURCE_PREFIX } from "utils/utils";
import { getNativeApplication } from "application";

export { isFileOrResourcePath };

let http: typeof httpModule;
function ensureHttp() {
    if (!http) {
        http = require("http");
    }
}

let application: android.app.Application;
let resources: android.content.res.Resources;

function getApplication() {
    if (!application) {
        application = (<android.app.Application>getNativeApplication());
    }

    return application;
}
function getResources() {
    if (!resources) {
        resources = getApplication().getResources();
    }

    return resources;
}

export class ImageSource implements ImageSourceDefinition {
    public android: android.graphics.Bitmap;
    public ios: UIImage;

    public fromAsset(asset: ImageAsset): Promise<ImageSource> {
        return new Promise<ImageSource>((resolve, reject) => {
            asset.getImageAsync((image, err) => {
                if (image) {
                    this.setRotationAngleFromFile(asset.android);
                    this.setNativeSource(image);
                    resolve(this);
                }
                else {
                    reject(err);
                }
            });
        });
    }

    public loadFromResource(name: string): boolean {
        this.android = null;
        const res = getResources();
        if (res) {
            const identifier: number = res.getIdentifier(name, 'drawable', getApplication().getPackageName());
            if (0 < identifier) {
                // Load BitmapDrawable with getDrawable to make use of Android internal caching
                const bitmapDrawable = <android.graphics.drawable.BitmapDrawable>res.getDrawable(identifier);
                if (bitmapDrawable && bitmapDrawable.getBitmap) {
                    this.android = bitmapDrawable.getBitmap();
                }
            }
        }

        return this.android != null;
    }

    public fromResource(name: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(this.loadFromResource(name));
        });
    }

    private setRotationAngleFromFile(filename: string) {
        this.rotationAngle = 0;
        const ei = new android.media.ExifInterface(filename);
        const orientation = ei.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION, android.media.ExifInterface.ORIENTATION_NORMAL);

        switch (orientation) {
            case android.media.ExifInterface.ORIENTATION_ROTATE_90:
                this.rotationAngle = 90;
                break;
            case android.media.ExifInterface.ORIENTATION_ROTATE_180:
                this.rotationAngle = 180;
                break;
            case android.media.ExifInterface.ORIENTATION_ROTATE_270:
                this.rotationAngle = 270;
                break;
        }
    }

    public loadFromFile(path: string): boolean {
        let fileName = typeof path === "string" ? path.trim() : "";
        if (fileName.indexOf("~/") === 0) {
            fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace("~/", ""));
        }

        this.setRotationAngleFromFile(fileName);
        this.android = android.graphics.BitmapFactory.decodeFile(fileName, null);

        return this.android != null;
    }

    public fromFile(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(this.loadFromFile(path));
        });
    }

    public loadFromData(data: any): boolean {
        this.android = android.graphics.BitmapFactory.decodeStream(data);
        return this.android != null;
    }

    public fromData(data: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(this.loadFromData(data));
        });
    }

    public loadFromBase64(source: string): boolean {
        if (typeof source === "string") {
            const bytes = android.util.Base64.decode(source, android.util.Base64.DEFAULT);
            this.android = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length)
        }
        return this.android != null;
    }

    public fromBase64(data: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(this.loadFromBase64(data));
        });
    }

    public setNativeSource(source: any): boolean {
        this.android = source;
        return source != null;
    }

    public saveToFile(path: string, format: "png" | "jpeg" | "jpg", quality = 100): boolean {
        if (!this.android) {
            return false;
        }

        const targetFormat = getTargetFormat(format);

        // TODO add exception handling
        const outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

        const res = this.android.compress(targetFormat, quality, outputStream);
        outputStream.close();
        return res;
    }

    public toBase64String(format: "png" | "jpeg" | "jpg", quality = 100): string {
        if (!this.android) {
            return null;
        }

        const targetFormat = getTargetFormat(format);

        const outputStream = new java.io.ByteArrayOutputStream();
        const base64Stream = new android.util.Base64OutputStream(outputStream, android.util.Base64.NO_WRAP);

        this.android.compress(targetFormat, quality, base64Stream);

        base64Stream.close();
        outputStream.close();

        return outputStream.toString();
    }

    get height(): number {
        if (this.android) {
            return this.android.getHeight();
        }

        return NaN;
    }

    get width(): number {
        if (this.android) {
            return this.android.getWidth();
        }

        return NaN;
    }

    private _rotationAngle: number;
    get rotationAngle(): number {
        return this._rotationAngle;
    }

    set rotationAngle(value: number) {
        this._rotationAngle = value;
    }
}

function getTargetFormat(format: "png" | "jpeg" | "jpg"): android.graphics.Bitmap.CompressFormat {
    switch (format) {
        case "jpeg" || "jpg":
            return android.graphics.Bitmap.CompressFormat.JPEG;
        default:
            return android.graphics.Bitmap.CompressFormat.PNG;
    }
}

export function fromAsset(asset: ImageAsset): Promise<ImageSource> {
    const image = new ImageSource();
    return image.fromAsset(asset);
}

export function fromResource(name: string): ImageSource {
    const image = new ImageSource();
    return image.loadFromResource(name) ? image : null;
}

export function fromFile(path: string): ImageSource {
    const image = new ImageSource();
    return image.loadFromFile(path) ? image : null;
}

export function fromData(data: any): ImageSource {
    const image = new ImageSource();
    return image.loadFromData(data) ? image : null;
}

export function fromBase64(source: string): ImageSource {
    const image = new ImageSource();
    return image.loadFromBase64(source) ? image : null;
}

export function fromNativeSource(source: any): ImageSource {
    const image = new ImageSource();
    return image.setNativeSource(source) ? image : null;
}

export function fromUrl(url: string): Promise<ImageSource> {
    ensureHttp();
    return http.getImage(url);
}

export function fromFileOrResource(path: string): ImageSource {
    if (!isFileOrResourcePath(path)) {
        throw new Error("Path \"" + "\" is not a valid file or resource.");
    }

    if (path.indexOf(RESOURCE_PREFIX) === 0) {
        return fromResource(path.substr(RESOURCE_PREFIX.length));
    }
    return fromFile(path);
}