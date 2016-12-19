import { View } from "ui/core/view";
import { Page, NavigatedData } from "ui/page";
import { StackLayout } from "ui/layouts/stack-layout";
import { ScrollView } from "ui/scroll-view";
import { Label } from "ui/label";
import { FontStyle, FontWeight } from "ui/enums";
import * as typeUtils from "utils/types";
import { Color } from "color";
import * as font from "ui/styling/font";

const genericFontFamilies = [
    "system",
    "sans-serif",
    "serif",
    "monospace",
];
var fontFamilies = [];
var fontNames = [];
const embeddedFontNames = [
    "FontAwesome",
    "Pacifico",
    "Sofia"
];
const fontStyles = [
    FontStyle.normal,
    FontStyle.italic
];
const fontWeights = [
    FontWeight.thin,
    FontWeight.extraLight,
    FontWeight.light,
    FontWeight.normal,
    FontWeight.medium,
    FontWeight.semiBold,
    FontWeight.bold,
    FontWeight.extraBold,
    FontWeight.black,
];

var green = new Color("Green");
var red = new Color("Red");
var white = new Color("White");
var black = new Color("Black");

var compareIgnoreCase = function (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
};

if (font.ios) {
    // for (var f = 0; f < embeddedFontNames.length; f++) {
    //     font.ios.registerFont(`fonts/${embeddedFontNames[f]}.ttf`);
    // }

    var font_internal = <any>font;
    font_internal.ensureSystemFontSets();

    (<Set<string>>font_internal.systemFontFamilies).forEach(f => fontFamilies.push(f));
    fontFamilies = fontFamilies.sort(compareIgnoreCase);

    (<Set<string>>font_internal.systemFonts).forEach(f => fontNames.push(f));
    fontNames = fontNames.sort(compareIgnoreCase);
}

export function onPageLoaded(args: NavigatedData) {
    var page = <Page>args.object;
    var scrollView = new ScrollView();
    var stackLayout = new StackLayout();
    generateLabels(stackLayout);
    scrollView.content = stackLayout;
    page.content = scrollView;
}

function generateLabels(layout: StackLayout) {
    layout.addChild(prepareTitle("Generic Font Families", 24));
    for (var f = 0; f < genericFontFamilies.length; f++) {
        layout.addChild(prepareTitle(genericFontFamilies[f], 20));
        for (var s = 0; s < fontStyles.length; s++) {
            for (var w = 0; w < fontWeights.length; w++) {
                var view = prepareLabel(genericFontFamilies[f], fontStyles[s], fontWeights[w]);
                layout.addChild(view);
            }
        }
    }

    if (fontFamilies.length > 0)
    {
        layout.addChild(prepareTitle("Font Families", 24));
    }
    for (var f = 0; f < fontFamilies.length; f++) {
        layout.addChild(prepareTitle(fontFamilies[f], 20));
        for (var s = 0; s < fontStyles.length; s++) {
            for (var w = 0; w < fontWeights.length; w++) {
                var view = prepareLabel(fontFamilies[f], fontStyles[s], fontWeights[w]);
                layout.addChild(view);
            }
        }
    }

    if (fontNames.length > 0) {
        layout.addChild(prepareTitle("Phone Fonts", 24));
    }
    for (var f = 0; f < fontNames.length; f++) {
        var view = prepareLabel(fontNames[f], "normal", "normal");
        layout.addChild(view);
    }

    if (embeddedFontNames.length > 0) {
        layout.addChild(prepareTitle("Embedded Fonts", 24));
    }
    for (var f = 0; f < embeddedFontNames.length; f++) {
        var view = prepareLabel(embeddedFontNames[f], "normal", "normal");
        layout.addChild(view);
    }
}

function prepareTitle(text: string, fontSize: number) {
    var title = new Label();
    title.text = text;
    title.height = 100;
    title.backgroundColor = black;
    title.color = white;
    title.fontSize = fontSize;
    title.style.fontStyle = "italic";
    title.borderWidth = 1;
    title.borderColor = white;
    title.textAlignment = "center";
    return title;
}

function prepareLabel(fontFamily: string, fontStyle: string, fontWeight: string): View {
    var label = new Label();
    label["font-family"] = fontFamily;
    var fontFamilyCss = `font-family: ${fontFamily}; `;
    var fontStyleCss = fontStyle !== FontStyle.normal ? `font-style: ${fontStyle}; ` : "";
    var fontWeightCss = fontWeight !== FontWeight.normal ? `font-weight: ${fontWeight}; ` : "";
    var css = `${fontFamilyCss}${fontStyleCss}${fontWeightCss}`;
    label.text = `${typeUtils.getClass(label) } {${css}};`;
    label.textWrap = true;
    label.style.textAlignment = "left";
    label.borderWidth = 1;
    label.borderColor = black;
    label.style.padding = "2"; 
    label.setInlineStyle(css);
    label.on("loaded", args => {
        var sender = <Label>args.object;
        if (sender.ios) {
            var uiFont = _getUIFont(label);
            sender.text += `\niOS Font: ${uiFont.fontName};`;
            if (genericFontFamilies.indexOf(fontFamily) !== -1) {
                return;
            }
            if (uiFont.fontName.replace(" ", "").indexOf((<string>sender["font-family"]).replace(" ", "")) !== -1) {
                sender.color = green;
            }
            else {
                sender.color = red;
            }
        }
    });
    if (fontFamily === "FontAwesome") {
        label.text += "\uF17B\uF10B";
    }
    return label;
}

function _getUIFont(view: any): UIFont {
    if (view.ios) {
        if (view.ios instanceof UIButton) {
            return view.ios.titleLabel.font;
        }
        else if (view.ios.font) {
            return view.ios.font;
        }
    }
}