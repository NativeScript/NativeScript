import observable = require("ui/core/observable");

export interface BindingOptions {
    sourceProperty: string;
    targetProperty: string;
    twoWay?: boolean;
}

export class Bindable extends observable.Observable {
    private _bindings = {};

    public bind(source: observable.Observable, options: BindingOptions) {
        var binding: Binding = this._bindings[options.targetProperty];
        if (binding) {
            binding.unbind();
        }

        binding = new Binding(this, options);
        this._bindings[options.targetProperty] = binding;

        binding.bind(source);
    }

    public unbind(options: BindingOptions) {
        var binding: Binding = this._bindings[options.targetProperty];
        if (binding) {
            binding.unbind();
            delete this._bindings[options.targetProperty];
        }
    }

    public updateTwoWayBinding(propertyName: string, value: any) {
        var binding: Binding = this._bindings[propertyName];

        if (binding) {
            binding.updateTwoWay(value);
        }
    }

    public getBinding(propertyName: string) {
        return this._bindings[propertyName];
    }

    private clearBinding(binding: Binding) {
        binding.unbind();
    }
}

class Binding {
    options: BindingOptions;
    updating = false;
    source: observable.Observable;
    target: Bindable;
    callback: (data: observable.PropertyChangeData) => void;

    constructor(target: Bindable, options: BindingOptions) {
        this.target = target;
        this.options = options;
    }

    public bind(obj: observable.Observable) {
        this.source = obj;
        this.updateTarget(this.source.getProperty(this.options.sourceProperty));

        var that = this;
        this.callback = function (data: observable.PropertyChangeData) {
            that.onSourcePropertyChanged(data);
        }

        this.source.addObserver(observable.Observable.propertyChangeEvent, this.callback);
    }

    public unbind() {
        if (!this.source) {
            return;
        }

        this.source.removeObserver(observable.Observable.propertyChangeEvent, this.callback);
        this.source = undefined;
        this.target = undefined;
    }

    public updateTwoWay(value: any) {
        if (this.options.twoWay) {
            this.updateSource(value);
        }
    }

    public onSourcePropertyChanged(data: observable.PropertyChangeData) {
        if (data.propertyName !== this.options.sourceProperty) {
            return;
        }

        this.updateTarget(data.value);
    }

    private updateTarget(value: any) {
        if (this.updating) {
            return;
        }

        this.updating = true;
        this.target.setProperty(this.options.targetProperty, value);
        this.updating = false;
    }

    private updateSource(value: any) {
        if (this.updating) {
            return;
        }

        this.updating = true;
        this.source.setProperty(this.options.sourceProperty, value);
        this.updating = false;
    }
}