/* tslint:disable:no-unused-variable */
import definition = require("ui/core/control-state-change");

var ObserverClass = NSObject.extend(
    {
        observeValueForKeyPathOfObjectChangeContext: function (path: string, obj: Object, change: NSDictionary, context: any) {
            if (path === "selected") {
                this["_owner"]._onSelectedChanged();
            } else if (path === "enabled") {
                this["_owner"]._onEnabledChanged();
            } else if (path === "highlighted") {
                this["_owner"]._onHighlightedChanged();
            }
        }
    },
    {
    });

export class ControlStateChangeListener implements definition.ControlStateChangeListener {
    private _observer: NSObject;
    private _states: string[];
    private _control: UIControl;
    private _observing: boolean = false;

    private _callback: (state: string) => void;

    constructor(control: UIControl, callback: (state: string) => void) {
        this._observer = ObserverClass.alloc();
        this._observer["_owner"] = this;
        this._control = control;
        this._callback = callback;
    }

    public start() {
        if (!this._observing) {
            this._control.addObserverForKeyPathOptionsContext(this._observer, "highlighted", NSKeyValueObservingOptions.NSKeyValueObservingOptionNew, null);
            this._observing = true;
            this._updateState();
        }
    }

    public stop() {
        if (this._observing) {
            this._observing = false;
            this._control.removeObserverForKeyPath(this._observer, "highlighted");
        }
    }

    private _onEnabledChanged() {
        this._updateState();
    }

    private _onSelectedChanged() {
        this._updateState();
    }

    private _onHighlightedChanged() {
        this._updateState();
    }

    private _updateState() {
        var state = "normal";
        if (this._control.highlighted) {
            state = "highlighted";
        }
        this._callback(state);
    }
}
