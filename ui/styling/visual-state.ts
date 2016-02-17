import viewModule = require("ui/core/view");
import observable = require("ui/core/dependency-observable");
import styleProperty = require("ui/styling/style-property");
import cssSelector = require("ui/styling/css-selector");
import * as visualStateConstants from "ui/styling/visual-state-constants";

export class VisualState {
    private _setters: {}; // use css selector instead
    private _animations: cssSelector.CssVisualStateSelector[];

    constructor() {
        this._setters = {};
        this._animations = [];
    }

    get setters(): {} {
        return this._setters;
    }

    get animations(): cssSelector.CssVisualStateSelector[] {
        return this._animations;
    }
}

/**
 *
 */
export function goToState(view: viewModule.View, state: string): string {
    var root = <any>view.page;
    if (!root) {
        return undefined;
    }

    //TODO: this of optimization
    var allStates = root._getStyleScope().getVisualStates(view);
    if (!allStates) {
        return undefined;
    }

    // logic here is:
    // 1. Verify the new state, whether we have setters for it and rollback to Normal(default) if not.
    // 2. If the new visual state is the same as the current one, do nothing
    // 3. Else, remove the visual state value for all the properties from the current state that are not present in the new one
    // 4. Apply all the properties from the new state.

    // Step 1
    if (!(state in allStates)) {
        // TODO: Directly go to normal?
        state = visualStateConstants.Normal;
    }

    // Step 2
    if (state !== view.visualState) {
        var newState: VisualState = allStates[state];
        var oldState: VisualState = allStates[view.visualState];

        // Step 3
        resetProperties(view, oldState, newState);

        // Step 4
        applyProperties(view, newState);
    }

    return state;
}

function resetProperties(view: viewModule.View, oldState: VisualState, newState: VisualState) {
    if (!oldState) {
        return;
    }

    var property: styleProperty.Property;

    for (var name in oldState.setters) {
        if (newState && (name in newState.setters)) {
            // Property will be altered by the new state, no need to reset it.
            continue;
        }

        property = styleProperty.getPropertyByName(name);
        if (property) {
            view.style._resetValue(property, observable.ValueSource.VisualState);
        }
    }

    for (var animation of oldState.animations) {
        animation.eachSetter((property, value) => {
            view.style._resetValue(property, observable.ValueSource.Local);
        });
    }
}

function applyProperties(view: viewModule.View, state: VisualState) {
    if (!state) {
        return;
    }

    let property: styleProperty.Property;

    for (let name in state.setters) {
        property = styleProperty.getPropertyByName(name);
        if (property) {
            view.style._setValue(property, state.setters[name], observable.ValueSource.VisualState);
        }
    }

    for (let animation of state.animations) {
        animation.apply(view);;
    }
}
