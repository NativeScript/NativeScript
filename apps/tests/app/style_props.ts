import styles = require("ui/styling");
import observable = require("ui/core/dependency-observable");
import styleProperty = require("ui/styling/style-property");
import view = require("ui/core/view");
import buttonModule = require("ui/button");
import pages = require("ui/page");
import stackLayoutDef = require("ui/layouts/stack-layout");
import native_api = require("native-api");

export var fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.AffectsLayout));

export class MyTextViewStyler implements styles.stylers.Styler {
    public static setFontFamilyProperty(view: view.View, newValue: any) {
        if (view.android) {
            (<native_api.android.widget.TextView>view.android).setTypeface(native_api.android.graphics.Typeface.create(newValue, native_api.android.graphics.Typeface.NORMAL));
        }
        else if (view.ios) {
            var fontSize = (<native_api.UIButton>view._nativeView).titleLabel.font.pointSize;
            (<native_api.UIButton>view._nativeView).titleLabel.font = native_api.UIFont.fontWithNameSize(newValue, fontSize);
        }
    }

    public static resetFontFamilyProperty(view: view.View, nativeValue: any) {
        if (view.android) {
            (<native_api.android.widget.TextView>view.android).setTypeface(native_api.android.graphics.Typeface.create(nativeValue, native_api.android.graphics.Typeface.NORMAL));
        }
        else if (view.ios) {
            var fontSize = (<native_api.UIButton>view._nativeView).titleLabel.font.pointSize;
            (<native_api.UIButton>view._nativeView).titleLabel.font = native_api.UIFont.fontWithNameSize(nativeValue, fontSize);;
        }
    }

    public static getNativeFontFamilyValue = function (view: view.View): any {
        if (view.android) {
            return (<native_api.android.widget.TextView>view.android).getTypeface();
        }
        else if (view.ios) {
            return (<native_api.UIButton>view._nativeView).titleLabel.font.fontName;
        }
        return null;
    }

    public static registerHandlers() {
        styles.stylers.registerHandler(fontFamilyProperty, new styles.stylers.StylePropertyChangedHandler(
            MyTextViewStyler.setFontFamilyProperty,
            MyTextViewStyler.resetFontFamilyProperty,
            MyTextViewStyler.getNativeFontFamilyValue), "MyButton");
    }
}

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

MyTextViewStyler.registerHandlers();

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
