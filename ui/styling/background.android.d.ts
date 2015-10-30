declare module "ui/styling/background" {
    // We are using "ad" here to avoid namespace collision with the global android object
    export module ad {
        export class BorderDrawable extends android.graphics.drawable.ColorDrawable {
            borderWidth: number;
            cornerRadius: number;
            borderColor: number;
            background: Background;
        }
    }
}
