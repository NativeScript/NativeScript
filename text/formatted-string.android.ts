import formattedStringCommon = require("./formatted-string-common");
import spanModule = require("text/span");

global.moduleMerge(formattedStringCommon, exports);

export class FormattedString extends formattedStringCommon.FormattedString {
    public createFormattedStringCore() {
        var ssb = new android.text.SpannableStringBuilder();
        var i;
        var spanStart = 0;
        var spanLength = 0;
        var spanText = "";
        for (i = 0; i < this.spans.length; i++) {
            var span = <spanModule.Span>this.spans.getItem(i);
            spanText = span.text || "";
            spanLength = spanText.length;
            if (spanLength !== 0) {
                ssb.insert(spanStart, spanText);
                span.updateSpanModifiers(this);
                var p;
                for (p = 0; p < span.spanModifiers.length; p++) {
                    ssb.setSpan(span.spanModifiers[p], spanStart, spanStart + spanLength, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                }
                spanStart += spanLength;
            }
        }
        this._formattedText = ssb;
    }
}
