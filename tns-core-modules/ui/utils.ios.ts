import { View } from "./core/view";
import * as utils from "../utils/utils";
import getter = utils.ios.getter;

export module ios {
    export function getActualHeight(view: UIView): number {
        if (view.window && !view.hidden) {
            return utils.layout.toDevicePixels(view.frame.size.height);
        }

        return 0;
    }

    export function getStatusBarHeight(viewController?: UIViewController): number {
        const app = getter(UIApplication, UIApplication.sharedApplication);
        if (!app || app.statusBarHidden) {
            return 0;
        }

        if (viewController && viewController.prefersStatusBarHidden) {
            return 0;
        }

        const statusFrame = app.statusBarFrame;
        const min = Math.min(statusFrame.size.width, statusFrame.size.height);
        return utils.layout.toDevicePixels(min);
    }

    export function _layoutRootView(rootView: View, parentBounds: CGRect) {
        if (!rootView || !parentBounds) {
            return;
        }

        const size = parentBounds.size;
        const width = utils.layout.toDevicePixels(size.width);
        const height = utils.layout.toDevicePixels(size.height);

        const widthSpec = utils.layout.makeMeasureSpec(width, utils.layout.EXACTLY);
        const heightSpec = utils.layout.makeMeasureSpec(height, utils.layout.EXACTLY);
        
        rootView.measure(widthSpec, heightSpec);

        const origin = parentBounds.origin;
        const left = origin.x;
        const top = origin.y;

        rootView.layout(left, top, width, height);
    }
}