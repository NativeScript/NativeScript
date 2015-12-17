declare module "ui/styling/background" {
    import imageSource = require("image-source");
    import colorModule = require("color");
    import viewModule = require("ui/core/view");
    import style = require("ui/styling");

    export interface BackgroundDrawParams {
        repeatX: boolean;
        repeatY: boolean;
        posX: number;
        posY: number;
        sizeX?: number;
        sizeY?: number;
    }

    export class Background {
        static default: Background;
        color: colorModule.Color;
        image: imageSource.ImageSource;
        repeat: string;
        position: string;
        size: string;

        constructor(
            color: colorModule.Color,
            image: imageSource.ImageSource,
            repeat: string,
            position: string,
            size: string);

        public withColor(value: colorModule.Color): Background;
        public withImage(value: imageSource.ImageSource): Background;

        public withRepeat(value: string): Background;

        public withPosition(value: string): Background;

        public withSize(value: string): Background;

        public getDrawParams(width: number, height: number): BackgroundDrawParams;

        public isEmpty(): boolean;

        public static equals(value1: Background, value2: Background): boolean;
    }

    export module ios {
        /**
         * Create an iOS specific background image. Returns an UIImage.
         * @param style The Style to obtrain background properties from.
         * @param width The width.
         * @param height The height.
         */
        export function createBackgroundUIImage(style: style.Style, width: number, height: number): any;
        export function createBackgroundUIColor(view: viewModule.View, flip?: boolean): any /* UIColor */;
    }
}
