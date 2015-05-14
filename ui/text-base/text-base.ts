import definition = require("ui/text-base");
import view = require("ui/core/view");
import observable = require("data/observable");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import formattedString = require("text/formatted-string");
import weakEventListener = require("ui/core/weak-event-listener");
import utils = require("utils/utils");
import trace = require("trace");

var textProperty = new dependencyObservable.Property(
    "text",
    "TextBase",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

var formattedTextProperty = new dependencyObservable.Property(
    "formattedText",
    "TextBase",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textBase = <TextBase>data.object;
    textBase._onTextPropertyChanged(data);
}

(<proxy.PropertyMetadata>textProperty.metadata).onSetNativeValue = onTextPropertyChanged;

function onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textBase = <TextBase>data.object;
    textBase._onFormattedTextPropertyChanged(data);
}

(<proxy.PropertyMetadata>formattedTextProperty.metadata).onSetNativeValue = onFormattedTextPropertyChanged;

export class TextBase extends view.View implements definition.TextBase {
    public static textProperty = textProperty;
    public static formattedTextProperty = formattedTextProperty;

    private _formattedTextChangedListenerId: number;

    constructor(options?: definition.Options) {
        super(options);
    }

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.formattedText) {
            this.formattedText.updateSpansBindingContext(newValue);
        }
    }

    get text(): string {
        return this._getValue(TextBase.textProperty);
    }

    set text(value: string) {
        this._setValue(TextBase.textProperty, value);
    }

    get fontSize(): number {
        return this.style.fontSize;
    }
    set fontSize(value: number) {
        this.style.fontSize = value;
    }

    get textAlignment(): string {
        return this.style.textAlignment;
    }
    set textAlignment(value: string) {
        this.style.textAlignment;
    }

    get formattedText(): formattedString.FormattedString {
        return this._getValue(TextBase.formattedTextProperty);
    }

    set formattedText(value: formattedString.FormattedString) {
        if (this.formattedText !== value) {
            if (this.formattedText) {
                weakEventListener.WeakEventListener.removeWeakEventListener(this._formattedTextChangedListenerId);
                delete this._formattedTextChangedListenerId;
            }
            this._setValue(TextBase.formattedTextProperty, value);
            if (value) {
                this._formattedTextChangedListenerId = weakEventListener.WeakEventListener.addWeakEventListener({
                    target: this,
                    source: value,
                    eventName: observable.Observable.propertyChangeEvent,
                    handler: this.onFormattedTextChanged,
                });
            }
        }
    }

    private onFormattedTextChanged(eventData: observable.PropertyChangeData) {
        this.setFormattedTextPropertyToNative(eventData.value);
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            this.android.setText(data.newValue + "");
        }
        else if (this.ios) {
            this.ios.text = data.newValue + "";
        }
    }

    private setFormattedTextPropertyToNative(value) {
        if (this.android) {
            this.android.setText(value._formattedText);
        } else if (this.ios) {
            this.ios.attributedText = value._formattedText;
            this.requestLayout();
        }
    }

    public _onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (data.newValue) {
            (<formattedString.FormattedString>data.newValue).parent = this;
        }
        this.setFormattedTextPropertyToNative(data.newValue);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        if (this.android && this._nativeView) {
            var measuredWidth = this.getMeasuredWidth();
            var measuredHeight = this.getMeasuredHeight();

            var measureSpecs = this._getCurrentMeasureSpecs();
            var widthModeIsNotExact = utils.layout.getMeasureSpecMode(measureSpecs.widthMeasureSpec) !== utils.layout.EXACTLY;
            var heightModeIsNotExact = utils.layout.getMeasureSpecMode(measureSpecs.heightMeasureSpec) !== utils.layout.EXACTLY;

            var width = right - left;
            var height = bottom - top;
            if ((Math.abs(measuredWidth - width) > 1 && widthModeIsNotExact) || (Math.abs(measuredHeight - height) > 1 && heightModeIsNotExact)) {
                var widthMeasureSpec = utils.layout.makeMeasureSpec(width, utils.layout.EXACTLY);
                var heightMeasureSpec = utils.layout.makeMeasureSpec(height, utils.layout.EXACTLY);
                trace.write(this + ", measuredSize: (" + measuredWidth + ", " + measuredHeight + ")" + ", remeasure with: (" + width + ", " + height + ")", trace.categories.Layout);
                (<android.view.View>this._nativeView).measure(widthMeasureSpec, heightMeasureSpec);
            }
        }

        super.onLayout(left, top, right, bottom);
    }
}