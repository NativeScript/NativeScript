declare module "ui/styling/font" {
    export class Font {
        public static default: Font;

        public fontFamily: string;
        public fontStyle: string;
        public fontWeight: string;
        public fontSize: number;

        public isBold: boolean;
        public isItalic: boolean;

        constructor(family: string, size: number, style: string, weight: string);

        public getAndroidTypeface(): any /* android.graphics.Typeface */;
        public getUIFont(defaultFont: any /* UIFont */): any /* UIFont */;

        public withFontFamily(family: string): Font;
        public withFontStyle(style: string): Font;
        public withFontWeight(weight: string): Font;
        public withFontSize(size: number): Font;

        public static equals(value1: Font, value2: Font): boolean;
        public static parse(cssValue: string): Font;
    }

    export module ios {
        export function registerFont(fontFile: string);
    }
}
