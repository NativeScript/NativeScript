import { ShownModallyData } from "tns-core-modules/ui/core/view/view";

export function onShownModally(args: ShownModallyData) {
    args.context.childPage = args.object;
    args.context.close = args.closeCallback;

    setTimeout(() => {
        (<any>args.object).bindingContext = [0, 1];
    }, 200);
}
