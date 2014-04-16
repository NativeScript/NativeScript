export declare enum ImageType {
    PNG = 0,
    JPEG = 1,
}

export declare class Image {
    static imageFromResource(name: string): Image;
    static imageFromFile(path: string): Image;
    static imageFromData(data: any): Image;
    static imageFromNativeBitmap(source: any): Image;

    loadFromResource(name: string): boolean;
    loadFromFile(path: string): boolean;
    loadFromData(data: any): boolean;
    loadFromNativeBitmap(source: any): boolean;
    saveToFile(path: string, format: ImageType, quality?: number): boolean;

    getHeight(): number;
    getWidth(): number;
}