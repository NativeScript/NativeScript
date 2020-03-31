// Types
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";
import { TextTransform } from "../text-base";

// Requires
import * as application from "../../application";
import { ad, layout } from "../../utils/utils";
import { Color, CSSType } from "../core/view";
import {  View } from "../frame";
import { TabbableComponent } from "../tabbable-component/tabbable-component.android";

// TODO: Impl trace
// import { isEnabled as traceEnabled, write as traceWrite } from "../../../trace";

export * from "../tab-navigation-base/tab-content-item";
export * from "../tab-navigation-base/tab-navigation-base";
export * from "../tab-navigation-base/tab-strip";
export * from "../tab-navigation-base/tab-strip-item";

const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 8;

const TABID = "_tabId";
const INDEX = "_index";
const ownerSymbol = Symbol("_owner");

let TabFragment: any;
let BottomNavigationBar: any;
let AttachStateChangeListener: any;
let appResources: android.content.res.Resources;

function makeFragmentName(viewId: number, id: number): string {
    return "android:bottomnavigation:" + viewId + ":" + id;
}

function getTabById(id: number): BottomNavigation {
    const ref = tabs.find(ref => {
        const tab = ref.get();

        return tab && tab._domId === id;
    });

    return ref && ref.get();
}

function initializeNativeClasses() {
    if (BottomNavigationBar) {
        return;
    }

    class TabFragmentImplementation extends org.nativescript.widgets.FragmentBase {
        private owner: BottomNavigation;
        private index: number;
        private backgroundBitmap: android.graphics.Bitmap = null;

        constructor() {
            super();

            return global.__native(this);
        }

        static newInstance(tabId: number, index: number): TabFragmentImplementation {
            const args = new android.os.Bundle();
            args.putInt(TABID, tabId);
            args.putInt(INDEX, index);
            const fragment = new TabFragmentImplementation();
            fragment.setArguments(args);

            return fragment;
        }

        public onCreate(savedInstanceState: android.os.Bundle): void {
            super.onCreate(savedInstanceState);
            const args = this.getArguments();
            this.owner = getTabById(args.getInt(TABID));
            this.index = args.getInt(INDEX);
            if (!this.owner) {
                throw new Error(`Cannot find BottomNavigation`);
            }
        }

        public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
            const tabItem = this.owner.items[this.index];

            return tabItem.nativeViewProtected;
        }

        public onDestroyView() {
            const hasRemovingParent = this.getRemovingParentFragment();

            // Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
            // TODO: Consider removing it when update to androidx.fragment:1.2.0
            if (hasRemovingParent && this.owner.selectedIndex === this.index) {
                const bitmapDrawable = new android.graphics.drawable.BitmapDrawable(appResources, this.backgroundBitmap);
                this.owner._originalBackground = this.owner.backgroundColor || new Color("White");
                this.owner.nativeViewProtected.setBackgroundDrawable(bitmapDrawable);
                this.backgroundBitmap = null;

                let thisView = this.getView();
                if (thisView) {
                    let thisViewParent = thisView.getParent();
                    if (thisViewParent && thisViewParent instanceof android.view.ViewGroup) {
                        thisViewParent.removeView(thisView);
                    }
                }
            }

            super.onDestroyView();
        }

        public onPause(): void {
            const hasRemovingParent = this.getRemovingParentFragment();

            // Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
            // TODO: Consider removing it when update to androidx.fragment:1.2.0
            if (hasRemovingParent && this.owner.selectedIndex === this.index) {
                this.backgroundBitmap = this.loadBitmapFromView(this.owner.nativeViewProtected);
            }

            super.onPause();
        }

        private loadBitmapFromView(view: android.view.View): android.graphics.Bitmap {
            // Another way to get view bitmap. Test performance vs setDrawingCacheEnabled
            // const width = view.getWidth();
            // const height = view.getHeight();
            // const bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888);
            // const canvas = new android.graphics.Canvas(bitmap);
            // view.layout(0, 0, width, height);
            // view.draw(canvas);

            view.setDrawingCacheEnabled(true);
            const bitmap = android.graphics.Bitmap.createBitmap(view.getDrawingCache());
            view.setDrawingCacheEnabled(false);

            return bitmap;
        }
    }

    class BottomNavigationBarImplementation extends org.nativescript.widgets.BottomNavigationBar {

        constructor(context: android.content.Context, public owner: BottomNavigation) {
            super(context);

            return global.__native(this);
        }

        public onSelectedPositionChange(position: number, prevPosition: number): void {
            const owner = this.owner;
            if (!owner) {
                return;
            }

            owner.changeTab(position);

            const tabStripItems = owner.tabStrip && owner.tabStrip.items;

            if (position >= 0 && tabStripItems && tabStripItems[position]) {
                tabStripItems[position]._emit(TabStripItem.selectEvent);
            }

            if (prevPosition >= 0 && tabStripItems && tabStripItems[prevPosition]) {
                tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
            }

            owner._setItemsColors(owner.tabStrip.items);
        }

        public onTap(position: number): boolean {
            const owner = this.owner;
            if (!owner) {
                return false;
            }

            const tabStrip = owner.tabStrip;
            const tabStripItems = tabStrip && tabStrip.items;

            if (position >= 0 && tabStripItems[position]) {
                tabStripItems[position]._emit(TabStripItem.tapEvent);
                tabStrip.notify({ eventName: TabStrip.itemTapEvent, object: tabStrip, index: position });
            }

            if (!owner.items[position]) {
                return false;
            }

            return true;
        }
    }

    @Interfaces([android.view.View.OnAttachStateChangeListener])
    class AttachListener extends java.lang.Object implements android.view.View.OnAttachStateChangeListener {
        constructor() {
            super();

            return global.__native(this);
        }

        onViewAttachedToWindow(view: android.view.View): void {
            const owner: View = view[ownerSymbol];
            if (owner) {
                owner._onAttachedToWindow();
            }
        }

        onViewDetachedFromWindow(view: android.view.View): void {
            const owner: View = view[ownerSymbol];
            if (owner) {
                owner._onDetachedFromWindow();
            }
        }
    }

    TabFragment = TabFragmentImplementation;
    BottomNavigationBar = BottomNavigationBarImplementation;
    AttachStateChangeListener = new AttachListener();
    appResources = application.android.context.getResources();
}

function setElevation(bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar) {
    const compat = <any>androidx.core.view.ViewCompat;
    if (compat.setElevation) {
        const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
        compat.setElevation(bottomNavigationBar, val);
    }
}

export const tabs = new Array<WeakRef<BottomNavigation>>();

@CSSType("BottomNavigation")
export class BottomNavigation extends TabbableComponent {
    private _contentView: org.nativescript.widgets.ContentLayout;
    private _currentFragment: androidx.fragment.app.Fragment;
    private _currentTransaction: androidx.fragment.app.FragmentTransaction;
    private _attachedToWindow = false;

    constructor() {
        super();
        this._textTransform = "none";
        tabs.push(new WeakRef(this));
    }

    get _hasFragments(): boolean {
        return true;
    }

    public getBottomNavigationBar(): org.nativescript.widgets.BottomNavigationBar {
        return <org.nativescript.widgets.BottomNavigationBar>this.nativeBar;
    }

    protected setNativeItems(items: Array<org.nativescript.widgets.TabItemSpec>) {
        this.getBottomNavigationBar().setItems(items);
    }

    public createNativeView() {
        initializeNativeClasses();
        const context: android.content.Context = this._context;
        const nativeView = new org.nativescript.widgets.GridLayout(context);

        nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));

        // CONTENT VIEW
        const contentView = new org.nativescript.widgets.ContentLayout(this._context);
        const contentViewLayoutParams = new org.nativescript.widgets.CommonLayoutParams();
        contentViewLayoutParams.row = 0;
        contentView.setLayoutParams(contentViewLayoutParams);
        nativeView.addView(contentView);
        (<any>nativeView).contentView = contentView;

        // TABSTRIP
        const bottomNavigationBar = new BottomNavigationBar(context, this);
        const bottomNavigationBarLayoutParams = new org.nativescript.widgets.CommonLayoutParams();
        bottomNavigationBarLayoutParams.row = 1;
        bottomNavigationBar.setLayoutParams(bottomNavigationBarLayoutParams);
        nativeView.addView(bottomNavigationBar);
        (<any>nativeView).bottomNavigationBar = bottomNavigationBar;

        setElevation(bottomNavigationBar);

        const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
        if (primaryColor) {
            bottomNavigationBar.setBackgroundColor(primaryColor);
        }

        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();

        this.nativeViewProtected.addOnAttachStateChangeListener(AttachStateChangeListener);
        this.nativeViewProtected[ownerSymbol] = this;

        this._contentView = (<any>this.nativeViewProtected).contentView;
        this._contentView.setId(this._contentViewId);

        if (this.tabStrip) {
            this.tabStrip.setNativeView(this.nativeBar);
        }
    }

    public onLoaded(): void {
        super.onLoaded();

        if (this.tabStrip) {
            this.setTabStripItems(this.tabStrip.items);
        } else {
            // manually set the visibility, so that the grid layout remeasures
            this.nativeBar.setVisibility(android.view.View.GONE);
        }

        this.changeTab(this.selectedIndex);
    }

    public onUnloaded(): void {
        super.onUnloaded();

        const fragmentToDetach = this._currentFragment;
        if (fragmentToDetach) {
            this.destroyItem((<any>fragmentToDetach).index, fragmentToDetach);
            this.commitCurrentTransaction();
        }
    }

    _onAttachedToWindow(): void {
        super._onAttachedToWindow();

        // _onAttachedToWindow called from OS again after it was detach
        // TODO: Consider testing and removing it when update to androidx.fragment:1.2.0
        if (this._manager && this._manager.isDestroyed()) {
            return;
        }

        this._attachedToWindow = true;
        this.changeTab(this.selectedIndex);
    }

    _onDetachedFromWindow(): void {
        super._onDetachedFromWindow();

        this._attachedToWindow = false;
    }

    public disposeNativeView() {
        this.setNativeItems(null);
        this.nativeBar = null;

        this.nativeViewProtected.removeOnAttachStateChangeListener(AttachStateChangeListener);
        this.nativeViewProtected[ownerSymbol] = null;

        super.disposeNativeView();
    }

    private get currentTransaction(): androidx.fragment.app.FragmentTransaction {
        if (!this._currentTransaction) {
            const fragmentManager = this._getFragmentManager();
            this._currentTransaction = fragmentManager.beginTransaction();
        }

        return this._currentTransaction;
    }

    private commitCurrentTransaction(): void {
        if (this._currentTransaction) {
            this._currentTransaction.commitNowAllowingStateLoss();
            this._currentTransaction = null;
        }
    }

    // TODO: Should we extract adapter-like class?
    // TODO: Rename this?
    public changeTab(index: number) {
        // index is -1 when there are no items
        // bot nav is not attached if you change the tab too early
        if (index === -1 || !this._attachedToWindow) {
            return;
        }

        const fragmentToDetach = this._currentFragment;
        if (fragmentToDetach) {
            this.destroyItem((<any>fragmentToDetach).index, fragmentToDetach);
        }

        const fragment = this.instantiateItem(this._contentView, index);
        this.setPrimaryItem(index, fragment);

        this.commitCurrentTransaction();
    }

    private instantiateItem(container: android.view.ViewGroup, position: number): androidx.fragment.app.Fragment {
        const name = makeFragmentName(container.getId(), position);

        const fragmentManager = this._getFragmentManager();
        let fragment: androidx.fragment.app.Fragment = fragmentManager.findFragmentByTag(name);
        if (fragment != null) {
            this.currentTransaction.attach(fragment);
        } else {
            fragment = TabFragment.newInstance(this._domId, position);
            this.currentTransaction.add(container.getId(), fragment, name);
        }

        if (fragment !== this._currentFragment) {
            fragment.setMenuVisibility(false);
            fragment.setUserVisibleHint(false);
        }

        return fragment;
    }

    private setPrimaryItem(position: number, fragment: androidx.fragment.app.Fragment): void {
        if (fragment !== this._currentFragment) {
            if (this._currentFragment != null) {
                this._currentFragment.setMenuVisibility(false);
                this._currentFragment.setUserVisibleHint(false);
            }

            if (fragment != null) {
                fragment.setMenuVisibility(true);
                fragment.setUserVisibleHint(true);
            }

            this._currentFragment = fragment;
            this.selectedIndex = position;

            const tabItems = this.items;
            const tabItem = tabItems ? tabItems[position] : null;
            if (tabItem) {
                tabItem.canBeLoaded = true;
                this._loadUnloadTabItems(position);
            }
        }
    }

    private destroyItem(position: number, fragment: androidx.fragment.app.Fragment): void {
        if (fragment) {
            this.currentTransaction.detach(fragment);
            if (this._currentFragment === fragment) {
                this._currentFragment = null;
            }
        }

        if (this.items && this.items[position]) {
            this.items[position].canBeLoaded = false;
        }
    }

    protected setSelectedItem(value: number) {
        if (this.tabStrip) {
            this.getBottomNavigationBar().setSelectedPosition(value);
        } else {
            this.changeTab(value);
        }
    }
}
