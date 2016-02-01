/* tslint:disable:no-unused-variable */
import definition = require("ui/core/control-state-change");
import * as visualStateConstants from "ui/styling/visual-state-constants";

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

    private _callback: (state: string) => void;

    constructor(control: UIControl, callback: (state: string) => void) {
        this._observer = ObserverClass.alloc();
        this._observer["_owner"] = this;

        // TODO: Commenting for now, needs revision later since we must detach the observers upon control deallocation
        //control.addObserverForKeyPathOptionsContext(this._observer, "selected", NSKeyValueObservingOptions.NSKeyValueObservingOptionNew, null);
        //control.addObserverForKeyPathOptionsContext(this._observer, "enabled", NSKeyValueObservingOptions.NSKeyValueObservingOptionNew, null);
        //control.addObserverForKeyPathOptionsContext(this._observer, "highlighted", NSKeyValueObservingOptions.NSKeyValueObservingOptionNew, null);

        this._control = control;
        this._callback = callback;
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
        var state = visualStateConstants.Normal;
        if (this._control.highlighted) {
            state = visualStateConstants.Pressed;
        } else if (this._control.highlighted) {
            // TODO:
        }

        this._callback(state);
    }
}