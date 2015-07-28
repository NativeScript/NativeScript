import formattedStringCommon = require("text/formatted-string-common");
import spanModule = require("text/span");

global.moduleMerge(formattedStringCommon, exports);

export class FormattedString extends formattedStringCommon.FormattedString {
    public createFormattedStringCore() {
        var mas = NSMutableAttributedString.alloc().init();
        var i;
        var spanStart = 0;
        var spanLength = 0;
        var spanText = "";
        for (i = 0; i < this.spans.length; i++) {
            var span = <spanModule.Span>this.spans.getItem(i);
            spanText = span.text || "";
            spanLength = spanText.length;
            span.updateSpanModifiers(this);
            var attrDict = NSMutableDictionary.alloc().init();
            var p;
            for (p = 0; p < span.spanModifiers.length; p++) {
                attrDict.setObjectForKey(span.spanModifiers[p].value, span.spanModifiers[p].key);
            }
            var nsAttributedString = NSMutableAttributedString.alloc().initWithStringAttributes(String(spanText), attrDict);
            mas.insertAttributedStringAtIndex(nsAttributedString, spanStart);
            spanStart += spanLength;
        }
        this._formattedText = mas;
    }
}