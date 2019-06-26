import { Page } from "tns-core-modules/ui/page";
import { unsetValue } from "tns-core-modules/ui/core/view";
import { TextView } from "tns-core-modules/ui/text-view";
import { TextField } from "tns-core-modules/ui/text-field";

function exectuteOnAll(page: Page, callback: (txt: TextView | TextField) => void) {
    page.getViewById("container").eachChild((child) => {
        if (child instanceof TextView || child instanceof TextField) {
            callback(child);
        }

        return true;
    });
}

export function setText(args) {
    exectuteOnAll(args.object.page, (txt) => {
        txt.text = "set text";
    });
}

export function resetStyles(args) {
    exectuteOnAll(args.object.page, (txt) => {
        txt.style.color = unsetValue;
        txt.style.placeholderColor = unsetValue;
    });
}

export function resetText(args) {
    exectuteOnAll(args.object.page, (txt) => {
        txt.text = "";
    });
}
