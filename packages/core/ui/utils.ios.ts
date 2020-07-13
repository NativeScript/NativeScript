import * as utils from '../utils';

export module ios {
	export function getActualHeight(view: UIView): number {
		if (view.window && !view.hidden) {
			return utils.layout.toDevicePixels(view.frame.size.height);
		}

		return 0;
	}

	export function getStatusBarHeight(viewController?: UIViewController): number {
		const app = UIApplication.sharedApplication;
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
}
