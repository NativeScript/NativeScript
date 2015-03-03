import view = require("ui/core/view");
import application = require("application");
import dependencyObservable = require("ui/core/dependency-observable");
import types = require("utils/types");

var _defaultNativeValuesCache = {};

export class StylePropertyChangedHandler {
    private _applyProperty: (view: view.View, newValue: any) => void;
    private _resetProperty: (view: view.View, nativeValue: any) => void;
    private _getNativeValue: (view: view.View) => any;

    constructor(
        applyCallback: (view: view.View, newValue: any) => void,
        resetCallback: (view: view.View, nativeValue: any) => void,
        getNativeValue?: (view: view.View) => any) {

        this._applyProperty = applyCallback;
        this._resetProperty = resetCallback;
        this._getNativeValue = getNativeValue;
    }

    public applyProperty(property: dependencyObservable.Property, view: view.View, newValue: any) {
        var className = types.getClass(view);
        if (!_defaultNativeValuesCache.hasOwnProperty(className + property.id) && this._getNativeValue) {
            _defaultNativeValuesCache[className + property.id] = this._getNativeValue(view);
        }

        if (application.android) {
            newValue = newValue.android ? newValue.android : newValue;
        }
        else if (application.ios) {
            newValue = newValue.ios ? newValue.ios : newValue;
        }

        this._applyProperty(view, newValue);
    }

    public resetProperty(property: dependencyObservable.Property, view: view.View) {
        var className = types.getClass(view);
        this._resetProperty(view, _defaultNativeValuesCache[className + property.id]);
    }
}