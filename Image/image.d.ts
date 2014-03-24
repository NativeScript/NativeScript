export declare enum ImageType {
    PNG = 0,
    JPEG = 1,
}

export declare class Image {
    loadFromResource(name: string): boolean;
    loadFromFile(path: string): boolean;
    loadFromData(data: any): boolean;
    loadFromBitmap(source: any): boolean;
    saveToFile(path: string, format: ImageType, quality?: number): boolean;

    getHeight(): number;
    getWidth(): number;
}