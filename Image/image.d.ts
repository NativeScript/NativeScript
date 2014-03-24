import types_module = require("Image/image_types");

export declare class Image {
    loadFromResource(name: string): boolean;
    loadFromFile(path: string): boolean;
    loadFromData(data: any): boolean;
    loadFromBitmap(source: any): boolean;
    saveToFile(path: string, format: types_module.ImageType, quality?: number): boolean;

    getHeight(): number;
    getWidth(): number;
}