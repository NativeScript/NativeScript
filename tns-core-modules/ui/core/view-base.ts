import { ViewBase as ViewBaseDefinition } from "ui/core/view-base";
import { Observable, EventData } from "data/observable";
import { Property, InheritedProperty, CssProperty, Style } from "./properties";
import { Binding, BindingOptions, Bindable } from "ui/core/bindable";
import { isIOS } from "platform";
import { fromString as gestureFromString } from "ui/gestures";

export { Observable, EventData, Binding, BindingOptions, Bindable, isIOS, gestureFromString };
export * from "./properties";

let defaultBindingSource = {};

export function getAncestor(view: ViewBaseDefinition, criterion: string | Function): ViewBaseDefinition {
    let matcher: (view: ViewBaseDefinition) => boolean = null;
    if (typeof criterion === "string") {
        matcher = (view: ViewBaseDefinition) => view.typeName === criterion;
    } else {
        matcher = (view: ViewBaseDefinition) => view instanceof criterion;
    }

    for (let parent = view.parent; parent != null; parent = parent.parent) {
        if (matcher(parent)) {
            return parent;
        }
    }

    return null;
}

export function getEventOrGestureName(name: string): string {
    return name.indexOf("on") === 0 ? name.substr(2, name.length - 2) : name;
}

export function isEventOrGesture(name: string, view: ViewBaseDefinition): boolean {
    if (typeof name === "string") {
        let eventOrGestureName = getEventOrGestureName(name);
        let evt = `${eventOrGestureName}Event`;

        return view.constructor && evt in view.constructor ||
            gestureFromString(eventOrGestureName.toLowerCase()) !== undefined;
    }

    return false;
}

export class ViewBase extends Observable implements ViewBaseDefinition {
    private _updatingJSPropertiesDict = {};
    private _style: Style;

    public bindingContext: any;
    public nativeView: any;
    public parent: ViewBase;
    public isCollapsed;

    constructor() {
        super();
        this._style = new Style(this);
    }

    get style(): Style {
        return this._style;
    }

    get android(): any {
        return undefined;
    }

    get ios(): any {
        return undefined;
    }

    private bindings = new Map<string, Binding>();
    public bind(options: BindingOptions, source: Object = defaultBindingSource): void {
        let binding: Binding = this.bindings.get(options.targetProperty);
        if (binding) {
            binding.unbind();
        }

        binding = new Binding(this, options);
        this.bindings.set(options.targetProperty, binding);

        let bindingSource = source;
        if (bindingSource === defaultBindingSource) {
            bindingSource = this.bindingContext;
            binding.sourceIsBindingContext = true;
        }

        // if (!types.isNullOrUndefined(bindingSource)) {
        binding.bind(bindingSource);
        // }
    }

    public unbind(property: string): void {
        let binding: Binding = this.bindings.get(property);
        if (binding) {
            binding.unbind();
            this.bindings.delete(property);
        }
    }

    public _updateTwoWayBinding(propertyName: string, value: any) {
        let binding: Binding = this.bindings.get(propertyName);
        if (binding) {
            binding.updateTwoWay(value);
        }
    }

    // public _setCore(data: PropertyChangeData) {
    //     super._setCore(data);
    //     this._updateTwoWayBinding(data.propertyName, data.value);
    // }

    public nativePropertyChanged(property: Property<ViewBase, any>, newValue: any): void {
        if (this._updatingJSPropertiesDict[property.native]) {
            return;
        }
        this._updatingJSPropertiesDict[property.native] = true;
        property.set.call(this, newValue);
        delete this._updatingJSPropertiesDict[property.native];
    }

    public requestLayout(): void {
        //
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        //
    }
}

export const visibilityProperty = new CssProperty<Style, "visible" | "hidden" | "collapse" | "collapsed">({
    name: "visibility", cssName: "visibility", defaultValue: "visible", affectsLayout: isIOS, valueChanged: (target, newValue) => {
        if (newValue !== "visible" && newValue !== "collapse" && newValue !== "collapsed" && newValue !== "hidden") {
            throw new Error(`Invalid visibility value: ${newValue}`);
        }

        target.view.isCollapsed = (newValue === "collapse" || newValue === "collapsed");
    }
});
visibilityProperty.register(Style);

export let bindingContextProperty = new InheritedProperty<ViewBase, any>({ name: "bindingContext" });
bindingContextProperty.register(ViewBase);