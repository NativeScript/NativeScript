declare module "ui/styling/background" {
    export module ad {
        export class BorderDrawable extends android.graphics.drawable.ColorDrawable {
            borderWidth: number;
            cornerRadius: number;
            borderColor: number;
            background: Background;
        }
    }
}
