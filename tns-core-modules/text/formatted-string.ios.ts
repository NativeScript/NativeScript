import { FormattedStringBase } from "./formatted-string-common";
import { toUIString } from "utils/types";

export * from "./formatted-string-common";

export class FormattedString extends FormattedStringBase {
    public createFormattedStringCore() {
        let mas = NSMutableAttributedString.alloc().init();
        for (let i = 0, spanStart = 0, spanLength = 0, length = this.spans.length, spanText = ""; i < length; i++) {
            let span = this.spans.getItem(i);
            spanText = toUIString(span.text);
            spanLength = spanText.length;
            span.updateSpanModifiers(this);
            let attrDict = NSMutableDictionary.alloc<string, any>().init();
            for (let p = 0; p < span.spanModifiers.length; p++) {
                attrDict.setObjectForKey(span.spanModifiers[p].value, span.spanModifiers[p].key);
            }
            let nsAttributedString = NSMutableAttributedString.alloc().initWithStringAttributes(String(spanText), attrDict);
            mas.insertAttributedStringAtIndex(nsAttributedString, spanStart);
            spanStart += spanLength;
        }
        this._formattedText = mas;
    }
    
    public _updateCharactersInRangeReplacementString(rangeLocation: number, rangeLength: number, replacementString: string): void {
        let deletingText = !replacementString;
        let currentLocation = 0;
        for (let i = 0, length = this.spans.length; i < length; i++) {
            let span = this.spans.getItem(i);
            if (currentLocation <= rangeLocation && rangeLocation < (currentLocation + span.text.length)){
                let newText = splice(span.text, rangeLocation - currentLocation, deletingText ? rangeLength : 0, replacementString);
                span._setTextInternal(newText); 
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
}