import viewModule = require("ui/core/view");
import constants = require("ui/styling/visual-state-constants");
import observable = require("ui/core/dependency-observable");
import styleProperty = require("ui/styling/style-property");

export class VisualState {
    private _setters: {};

    constructor() {
        this._setters = {};
    }

    get setters(): {} {
        return this._setters;
    }
}

/**
 * 
 */
export function goToState(view: viewModule.View, state: string): string {
    var root = <any>viewModule.getAncestor(view, "Page");
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
        state = constants.Normal;
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
}

function applyProperties(view: viewModule.View, state: VisualState) {
    if (!state) {
        return;
    }

    var property: styleProperty.Property;

    for (var name in state.setters) {
        property = styleProperty.getPropertyByName(name);
        if (property) {
            view.style._setValue(property, state.setters[name], observable.ValueSource.VisualState);
        }
    }
}