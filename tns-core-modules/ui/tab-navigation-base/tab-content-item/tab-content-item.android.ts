// Types
import { TabContentItem as TabContentItemDefinition } from ".";
import { TabNavigationBase } from "../tab-navigation-base";

// Requires
import { TabContentItemBase } from "./tab-content-item-common";

export * from "./tab-content-item-common";

export class TabContentItem extends TabContentItemBase {
    public nativeViewProtected: android.widget.TextView;
    public tabItemSpec: org.nativescript.widgets.TabItemSpec;
    public index: number;
    private _defaultTransformationMethod: android.text.method.TransformationMethod;

    get _hasFragments(): boolean {
        return true;
    }

    public initNativeView(): void {
        super.initNativeView();
        if (this.nativeViewProtected) {
            this._defaultTransformationMethod = this.nativeViewProtected.getTransformationMethod();
        }
    }

    public onLoaded(): void {
        super.onLoaded();
    }

    public resetNativeView(): void {
        super.resetNativeView();
        if (this.nativeViewProtected) {
            // We reset it here too because this could be changed by multiple properties - whiteSpace, secure, textTransform
            this.nativeViewProtected.setTransformationMethod(this._defaultTransformationMethod);
        }
    }

    public disposeNativeView(): void {
        super.disposeNativeView();
        (<TabContentItemDefinition>this).canBeLoaded = false;
    }

    public createNativeView() {
        return this.nativeViewProtected;
    }

    public _getChildFragmentManager(): androidx.fragment.app.FragmentManager {
        const tabView = <TabNavigationBase>this.parent;
        let tabFragment = null;
        const fragmentManager = tabView._getFragmentManager();
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
