import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import types = require("utils/types");

//late import
var _appModule = null;

function appModule() {
    if (!_appModule) {
        _appModule = require("application");
    }
    return _appModule;
}

var _defaultNativeValuesCache = {};

export class StylePropertyChangedHandler {
    private _applyProperty: (view: view.View, newValue: any, defaultValue?: any) => void;
    private _resetProperty: (view: view.View, nativeValue: any) => void;
    private _getNativeValue: (view: view.View) => any;

    constructor(
        applyCallback: (view: view.View, newValue: any, defaultValue?: any) => void,
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

        if (appModule().android) {
            newValue = newValue.android ? newValue.android : newValue;
        } else if (appModule().ios) {
            newValue = newValue.ios ? newValue.ios : newValue;
        }

        this._applyProperty(view, newValue, _defaultNativeValuesCache[className + property.id]);
    }

    public resetProperty(property: dependencyObservable.Property, view: view.View) {
        var className = types.getClass(view);
        this._resetProperty(view, _defaultNativeValuesCache[className + property.id]);
    }
}
