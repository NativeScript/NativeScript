
import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Slider extends view.View {
    private static valueProperty = "value";
    private static maxValueProperty = "maxValue";

    private _android: android.widget.SeekBar;
    private _changeListener: android.widget.SeekBar.OnSeekBarChangeListener;

    private _preValue: number;
    private _preMaxValue: number;

    constructor() {
        super();
        this._preValue = 0;
        this._preMaxValue = 100;
    }

    private createUI(context: android.content.Context) {
        this._android = new android.widget.SeekBar(context);

        this._android.setMax(this._preMaxValue);
        this._android.setProgress(this._preValue);

        var that = this;
        this._changeListener = new android.widget.SeekBar.OnSeekBarChangeListener({
            onProgressChanged: function (seekBar: android.widget.SeekBar, progress: number, fromUser: boolean) {
                //console.log("changed");
                that.setProperty(Slider.valueProperty, seekBar.getProgress());
            },

            onStartTrackingTouch: function (seekBar: android.widget.SeekBar) {

            },

            onStopTrackingTouch: function (seekBar: android.widget.SeekBar) {

            }
        });
        this._android.setOnSeekBarChangeListener(this._changeListener);
    }

    public onInitialized(context: android.content.Context) {
        if (!this._android) {
            // TODO: We need to decide whether we will support context switching and if yes - to implement it.
            this.createUI(context);
        }
    }

    get android(): android.widget.SeekBar {
        return this._android;
    }

    get maxValue(): number {
        return this._android.getMax();
    }

    set maxValue(value: number) {
        this.setProperty(Slider.maxValueProperty, value);
    }

    get value(): number {
        return this._android.getProgress();
    }

    set value(value: number) {
        this.setProperty(Slider.valueProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO: Will this be a gigantic if-else switch?
        if (data.propertyName === Slider.maxValueProperty) {
            if (this._android)
                this._android.setMax(data.value);
            else
                this._preMaxValue = data.value;
        } else if (data.propertyName === Slider.valueProperty) {
            if (this._android)
                this._android.setProgress(data.value);
            else
                this._preValue = data.value;
        } else if (true) {
        }
    }
}
