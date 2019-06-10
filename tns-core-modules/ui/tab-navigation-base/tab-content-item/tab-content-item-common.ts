// Types
import { TabContentItem as TabContentItemDefinition } from ".";
import { AddChildFromBuilder } from "../../core/view";
import { TabNavigationBase } from "../tab-navigation-base";

// Requires
import { View, ViewBase, CSSType } from "../../core/view";

export const traceCategory = "TabView";

@CSSType("TabContentItem")
export abstract class TabContentItemBase extends ViewBase implements TabContentItemDefinition, AddChildFromBuilder {
    private _view: View;

    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof View) {
            this.view = value;
        }
    }

    // TODO: Should we rename this to content? Or even better - inherit ContentView???
    get view(): View {
        return this._view;
    }
    set view(value: View) {
        if (this._view !== value) {
            if (this._view) {
                throw new Error("Changing the view of an already loaded TabContentItem is not currently supported.");
            }

            this._view = value;
            this._addView(value);
        }
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        const view = this._view;
        if (view) {
            callback(view);
        }
    }

    public loadView(view: ViewBase): void {
        const tabView = <TabNavigationBase>this.parent;
        if (tabView && tabView.items) {
            // Don't load items until their fragments are instantiated.
            if ((<TabContentItemDefinition>this).canBeLoaded) {
                super.loadView(view);
            }
        }
    }
}
