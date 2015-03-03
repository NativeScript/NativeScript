import common = require("ui/button/button-common");
import utils = require("utils/utils");
import trace = require("trace");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class Button extends common.Button {
    private _android: android.widget.Button;
    private _isPressed: boolean;

    constructor() {
        super();

        this._isPressed = false;
    }

    get android(): android.widget.Button {
        return this._android;
    }

    public _createUI() {

        var that = new WeakRef(this);

        this._android = new android.widget.Button(this._context);

        this._android.setOnClickListener(new android.view.View.OnClickListener({
            get owner() {
                return that.get();
            },

            onClick: function (v) {
                if (this.owner) {
                    this.owner._emit(common.knownEvents.tap);
                }
            }
        }));
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        if (this.android) {
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
                this.android.measure(widthMeasureSpec, heightMeasureSpec);
            }
        }

        super.onLayout(left, top, right, bottom);
    }
}