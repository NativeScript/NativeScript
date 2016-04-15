import { View } from "ui/core/view";
import { EventData } from "data/observable";
import { LayoutBase } from "ui/layouts/layout-base";
import { Label } from "ui/label";
import { TextField } from "ui/text-field";
import { TextView } from "ui/text-view";
import { Button } from "ui/button";
import { FontStyle, FontWeight } from "ui/enums";
import typeUtils = require("utils/types");
import { Color } from "color";

const fontFamilies = ["system", "sans-serif", "serif", "monospace"];
const fontWeights = [FontWeight.normal, FontWeight.bold];
const fontStyles = [FontStyle.normal, FontStyle.italic];

export function onStackLayoutLoaded(args: EventData) {
    var layout = <LayoutBase>args.object;
    _generateViews(() => { return new Label(); }, layout);
    _generateViews(() => { return new TextField(); }, layout);
    _generateViews(() => { return new TextView(); }, layout);
    _generateViews(() => { return new Button(); }, layout);
}

function _generateViews(factory: () => View, layout: LayoutBase) {
    for (var f = 0; f < fontFamilies.length; f++) {
        for (var w = 0; w < fontWeights.length; w++) {
            for (var s = 0; s < fontStyles.length; s++) {
                var view = factory();
                var css = `font-family: ${fontFamilies[f]}; font-weight: ${fontWeights[w]}; font-style: ${fontStyles[s]};`;
                (<any>view).text = `${typeUtils.getClass(view)} ${css}`;
                (<any>view).textWrap = true;
                view.style.textAlignment = "left";
                view.setInlineStyle(css);
                view.margin = "1 0";
                view.borderWidth = 1;
                view.height = 75;
                view.color = new Color("Black");
                view.backgroundColor = new Color("LightGray");
                view.on("loaded", args => {
                    (<any>view).text += _getFontInfo(view);
                });
                layout.addChild(view);
            }
        }
    }
}

function _getFontInfo(view: View): string {
    if (view.ios) {
        var uiFont: UIFont;
        if (view.ios instanceof UIButton) {
            uiFont = view.ios.titleLabel.font;
        }
        else if (view.ios.font) {
            uiFont = view.ios.font;
        }

        return ` ${uiFont.fontName} ${uiFont.pointSize}pt.`;
    }

    return "";
}