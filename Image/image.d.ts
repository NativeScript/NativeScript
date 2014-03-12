export declare module tk {
    export module ui {
        export enum ImageType {
            PNG = 0,
            JPEG = 1,
        }

        export class Image {
            loadFromResource(name: string): boolean;
            loadFromFile(path: string): boolean;
            loadFromData(data: any): boolean;
            saveToFile(path: string, format: ImageType, quality?: number): boolean;

            getHeight(): number;
            getWidth(): number;
        }
    }
}