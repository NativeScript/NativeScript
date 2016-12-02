declare module "ui/styling/font" {
    export class Font {
        public static default: Font;

        public fontFamily: string;
        public fontStyle: "normal" | "italic";
        public fontWeight: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900";
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
    }

    interface ParsedFont {
        fontStyle?: "normal" | "italic";
        fontVariant?: string;
        fontWeight?: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900",
        lineHeight?: string,
        fontSize?: string,
        fontFamily?: string
    }

    export function parseFont(fontValue: string): ParsedFont;

    export module ios {
        export function registerFont(fontFile: string);
    }
}
