import * as buttonModule from "tns-core-modules/ui/button";
import * as pages from "tns-core-modules/ui/page";
import * as stackLayoutDef from "tns-core-modules/ui/layouts/stack-layout";

// import {isAndroid} from "tns-core-modules/platform";
// import * as style from "ui/styling/style";
// import {PropertyMetadata, PropertyMetadataSettings} from "ui/core/dependency-observable";
// import * as view from "ui/core/view";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
// let AffectsLayout = isAndroid ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

// export var fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family", new PropertyMetadata(undefined, AffectsLayout));

// export class MyTextViewStyler implements style.Styler {
//     public static setFontFamilyProperty(view: view.View, newValue: any) {
//         if (view.android) {
//             (<android.widget.TextView>view.android).setTypeface(android.graphics.Typeface.create(newValue, android.graphics.Typeface.NORMAL));
//         }
//         else if (view.ios) {
//             var fontSize = (<UIButton>view._nativeView).titleLabel.font.pointSize;
//             (<UIButton>view._nativeView).titleLabel.font = UIFont.fontWithNameSize(newValue, fontSize);
//         }
//     }

//     public static resetFontFamilyProperty(view: view.View, nativeValue: any) {
//         if (view.android) {
//             (<android.widget.TextView>view.android).setTypeface(android.graphics.Typeface.create(nativeValue, android.graphics.Typeface.NORMAL));
//         }
//         else if (view.ios) {
//             var fontSize = (<UIButton>view._nativeView).titleLabel.font.pointSize;
//             (<UIButton>view._nativeView).titleLabel.font = UIFont.fontWithNameSize(nativeValue, fontSize);
//         }
//     }

//     public static getNativeFontFamilyValue = function (view: view.View): any {
//         if (view.android) {
//             return (<android.widget.TextView>view.android).getTypeface();
//         }
//         else if (view.ios) {
//             return (<UIButton>view._nativeView).titleLabel.font.fontName;
//         }
//         return null;
//     }

//     public static registerHandlers() {
//         style.registerHandler(fontFamilyProperty, new style.StylePropertyChangedHandler(
//             MyTextViewStyler.setFontFamilyProperty,
//             MyTextViewStyler.resetFontFamilyProperty,
//             MyTextViewStyler.getNativeFontFamilyValue), "MyButton");
//     }
// }

//export class MyStyle extends styles.Style {
//    get fontFamily(): string {
//        return this._getValue(fontFamilyProperty);
//    }
//    set fontFamily(value: string) {
//        this._setValue(fontFamilyProperty, value, observable.ValueSource.Local);
//    }
//}

//Object.defineProperty(styles.Style.prototype, "fontFamily", {
//    get: function () {
//        return this._getValue(fontFamilyProperty);
//    },
//    set: function (value) {
//        this._setValue(fontFamilyProperty, value, observable.ValueSource.Local);
//    },
//    enumerable: true,
//    configurable: true
//});

export class MyButton extends buttonModule.Button {
    
}

// MyTextViewStyler.registerHandlers();

export function createPage() {
    var stackLayout = new stackLayoutDef.StackLayout();

    var btn = new MyButton();
    btn.text = "Alabala";
    btn.id = "btn";

    var btn1 = new MyButton();
    btn1.text = "Alabala";
    btn1.id = "btn1";
    
    var btn2 = new buttonModule.Button();
    btn2.text = "Alabala";
    
    stackLayout.addChild(btn);
    stackLayout.addChild(btn1);
    stackLayout.addChild(btn2);
    
    var page = new pages.Page();
    page.css = "#btn {font-family: Courier New} #btn1 {font-family: Times New Roman} #btn2 {color: yellow}";
    page.content = stackLayout;
    return page;
}
