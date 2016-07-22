import formattedStringCommon = require("./formatted-string-common");
import spanModule = require("text/span");
import types = require("utils/types");

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
            spanText = types.toUIString(span.text);
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
    
    public _updateCharactersInRangeReplacementString(rangeLocation: number, rangeLength: number, replacementString: string): void {
        let deletingText = !replacementString;
        let currentLocation = 0;
        for (let i = 0; i < this.spans.length; i++) {
            let span = <spanModule.Span>this.spans.getItem(i);
            if (currentLocation <= rangeLocation && rangeLocation < (currentLocation + span.text.length)){
                (<any>span)._text = splice(span.text, rangeLocation - currentLocation, deletingText ? rangeLength : 0, replacementString);
                //console.log(`>>> ${span.text}`);
                return;
            } 
            currentLocation += span.text.length;
        }
    }
}

/*
 * @param {String} value The string to splice.
 * @param {number} start Index at which to start changing the string.
 * @param {number} delCount An integer indicating the number of old chars to remove.
 * @param {string} newSubStr The String that is spliced in.
 * @return {string} A new string with the spliced substring.function splice(value: string, start: number, delCount: number, newSubStr: string) {
 */
function splice(value: string, start: number, delCount: number, newSubStr: string) {
    return value.slice(0, start) + newSubStr + value.slice(start + Math.abs(delCount));
};