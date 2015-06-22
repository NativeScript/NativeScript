declare module "ui/styling/font" {
    export class Font {
        public static default: Font;

        public fontFamily: string;
        public fontStyle: string;
        public fontWeight: string;

        public isBold: boolean;
        public isItalic: boolean;

        public ios: UIFontDescriptor;
        public android: android.graphics.Typeface;

        constructor(family: string, style: string, weight: string);

        public withFontFamily(family: string): Font;
        public withFontStyle(style: string): Font;
        public withFontWeight(weight: string): Font;
    }
}