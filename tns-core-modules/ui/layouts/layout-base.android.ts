import common = require("./layout-base-common");

export class LayoutBase extends common.LayoutBase {
    public _onClipToBoundsChanged(oldValue: boolean, newValue: boolean) {
        // We can't implement this without calling setClipChildren(false) on every ancestor up in the visual tree, 
        // which will kill performance. It will also lead to unwanted side effects such as other totally unrelated 
        // views being affected by setting the parents' setClipChildren to false. 
        // The problem in Android is that a ViewGroup either clips ALL of its children or it does not. Unlike iOS, the clipping 
        // cannot be controlled on a per view basis. So clipToBounds=false will have to be somehow achieved with stacking different
        // views on top of one another in an AbsoluteLayout or GridLayout. There is always a workaround when playing with layouts.
        //
        // The following article explains this in detail:
        // http://stackoverflow.com/questions/25044085/when-drawing-outside-the-view-clip-bounds-with-android-how-do-i-prevent-underli
        console.warn(`clipToBounds with value false is not supported on Android. You can use this.android.getParent().setClipChildren(false) as an alternative`);
    }
}