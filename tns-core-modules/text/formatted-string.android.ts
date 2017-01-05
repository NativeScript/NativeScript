import { FormattedStringBase } from "./formatted-string-common";
import { toUIString } from "utils/types";

export * from "./formatted-string-common";

export class FormattedString extends FormattedStringBase {
    public createFormattedStringCore() {
        let ssb = new android.text.SpannableStringBuilder();

        for (let i = 0, spanStart = 0, spanLength = 0, spanText = "", length = this.spans.length; i < length; i++) {
            let span = this.spans.getItem(i);
            spanText = toUIString(span.text);
            spanLength = spanText.length;
            if (spanLength !== 0) {
                ssb.insert(spanStart, spanText);
                span.updateSpanModifiers(this);
                for (let p = 0, spanModifiersLength = span.spanModifiers.length; p < spanModifiersLength; p++) {
                    ssb.setSpan(span.spanModifiers[p], spanStart, spanStart + spanLength, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                }
                spanStart += spanLength;
            }
        }
        this._formattedText = ssb;
    }

    public _updateCharactersInRangeReplacementString(rangeLocation: number, rangeLength: number, replacementString: string): void {
        //
    }
}