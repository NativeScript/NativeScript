declare module "ui/core/view" {
    //@private
    export class NativeViewGroup extends android.view.ViewGroup {
        constructor(context: android.content.Context);
        public setOwner(view: View);
    }
}
