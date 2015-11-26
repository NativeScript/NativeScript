import spanCommon = require("./span-common");
import enums = require("ui/enums");
import formattedString = require("text/formatted-string");
import utils = require("utils/utils");
import fontModule = require("ui/styling/font");

global.moduleMerge(spanCommon, exports);

export class CustomTypefaceSpan extends android.text.style.TypefaceSpan {
    private typeface: any;

    constructor(family: string, typeface: any) {
        super(family);
        this.typeface = typeface;
        return global.__native(this);
    }

    public updateDrawState(ds: any): void {
        CustomTypefaceSpan.applyCustomTypeFace(ds, this.typeface);
    }

    public updateMeasureState(paint: any): void {
        CustomTypefaceSpan.applyCustomTypeFace(paint, this.typeface);
    }

    private static applyCustomTypeFace(paint: any, tf: any) {
        let oldStyle;
        let old = paint.getTypeface();
        if (old === null) {
            oldStyle = 0;
        } else {
            oldStyle = old.getStyle();
        }

        let fake = oldStyle & ~tf.getStyle();
        if ((fake & android.graphics.Typeface.BOLD) !== 0) {
            paint.setFakeBoldText(true);
        }

        if ((fake & android.graphics.Typeface.ITALIC) !== 0) {
            paint.setTextSkewX(-0.25);
        }

        paint.setTypeface(tf);
    }
}

export class Span extends spanCommon.Span {
    public updateSpanModifiers(parent: formattedString.FormattedString) {
        super.updateSpanModifiers(parent);
        var realFontFamily = this.fontFamily || (parent ? parent.fontFamily : undefined);
        if (realFontFamily) {
            let font = new fontModule.Font(realFontFamily,
                0,
                (realFontAttributes & enums.FontAttributes.Italic) ? enums.FontStyle.italic : enums.FontStyle.normal,
                (realFontAttributes & enums.FontAttributes.Bold) ? enums.FontWeight.bold : enums.FontWeight.normal);
            let typefaceSpan = new CustomTypefaceSpan(realFontFamily, font.getAndroidTypeface());
            this.spanModifiers.push(typefaceSpan);
        }
        var realFontSize = this.fontSize ||
            (parent ? parent.fontSize : undefined) ||
            (parent && parent.parent ? parent.parent.style.fontSize : undefined);
        if (realFontSize) {
            this.spanModifiers.push(new android.text.style.AbsoluteSizeSpan(realFontSize * utils.layout.getDisplayDensity()));
        }

        var realForegroundColor = this.foregroundColor ||
            (parent ? parent.foregroundColor : undefined) ||
            (parent && parent.parent ? parent.parent.style.color : undefined);
        if (realForegroundColor) {
            this.spanModifiers.push(new android.text.style.ForegroundColorSpan(realForegroundColor.android));
        }

        var realBackgroundColor = this.backgroundColor ||
            (parent ? parent.backgroundColor : undefined) ||
            (parent && parent.parent ? parent.parent.style.backgroundColor : undefined);
        if (realBackgroundColor) {
            this.spanModifiers.push(new android.text.style.BackgroundColorSpan(realBackgroundColor.android));
        }

        var realFontAttributes = this.fontAttributes || (parent ? parent.fontAttributes : undefined);
        if (realFontAttributes) {
            if ((realFontAttributes & enums.FontAttributes.Bold) && (realFontAttributes & enums.FontAttributes.Italic)) {
                this.spanModifiers.push(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD_ITALIC));
            }
            else if (realFontAttributes & enums.FontAttributes.Bold) {
                this.spanModifiers.push(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD));
            }
            else if (realFontAttributes & enums.FontAttributes.Italic) {
                this.spanModifiers.push(new android.text.style.StyleSpan(android.graphics.Typeface.ITALIC));
            }
        }
        var realUnderline = this.underline || (parent ? parent.underline : undefined);
        if (realUnderline) {
            this.spanModifiers.push(new android.text.style.UnderlineSpan());
        }
        var realStrikethrough = this.strikethrough || (parent ? parent.strikethrough : undefined);
        if (realStrikethrough) {
            this.spanModifiers.push(new android.text.style.StrikethroughSpan());
        }
    }
}
