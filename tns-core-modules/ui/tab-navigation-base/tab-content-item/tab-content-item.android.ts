// Types
import { TabContentItem as TabContentItemDefinition } from ".";
import { TabNavigationBase } from "../tab-navigation-base";

// Requires
import { TabContentItemBase, traceCategory } from "./tab-content-item-common";
import { traceEnabled, traceWrite, traceMessageType } from "../../core/view";

export * from "./tab-content-item-common";

export class TabContentItem extends TabContentItemBase {
    public nativeViewProtected: android.widget.TextView;
    public tabItemSpec: org.nativescript.widgets.TabItemSpec;
    public index: number;

    get _hasFragments(): boolean {
        return true;
    }

    public disposeNativeView(): void {
        super.disposeNativeView();
        (<TabContentItemDefinition>this).canBeLoaded = false;
    }

    public _getChildFragmentManager(): androidx.fragment.app.FragmentManager {
        const tabView = <TabNavigationBase>this.parent;
        let tabFragment = null;
        const fragmentManager = tabView._getFragmentManager();

        if (typeof this.index === "undefined") {
            traceWrite(`Current TabContentItem index is not set`, traceCategory, traceMessageType.error);
        }

        for (let fragment of (<Array<any>>fragmentManager.getFragments().toArray())) {
            if (fragment.index === this.index) {
                tabFragment = fragment;
                break;
            }
        }

        // TODO: can happen in a modal tabview scenario when the modal dialog fragment is already removed
        if (!tabFragment) {
            // if (traceEnabled()) {
            //     traceWrite(`Could not get child fragment manager for tab item with index ${this.index}`, traceCategory);
            // }

            // TODO: fix d.ts in view module
            return (<any>tabView)._getRootFragmentManager();
        }

        return tabFragment.getChildFragmentManager();
    }
}
