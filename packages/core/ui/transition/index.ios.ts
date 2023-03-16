import type { Transition as TransitionType } from '.';
import { Screen } from '../../platform';

let transitionId = 0;
export class Transition implements TransitionType {
	static AndroidTransitionType = {};
	id: number;
	private _duration: number;
	private _curve: UIViewAnimationCurve;

	constructor(duration: number = 350, nativeCurve: UIViewAnimationCurve = UIViewAnimationCurve.EaseInOut) {
		this._duration = duration ? duration / 1000 : 0.35;
		this._curve = nativeCurve;
		transitionId++;
		this.id = transitionId;
	}

	public getDuration(): number {
		return this._duration;
	}

	public getCurve(): UIViewAnimationCurve {
		return this._curve;
	}

	public animateIOSTransition(transitionContext: UIViewControllerContextTransitioning, fromViewCtrl: UIViewController, toViewCtrl: UIViewController, operation: UINavigationControllerOperation): void {
		throw new Error('Abstract method call');
	}

	public createAndroidAnimator(transitionType: string): any {
		throw new Error('Abstract method call');
	}

	public toString(): string {
		return `Transition@${this.id}`;
	}
}

export function iosSnapshotView(view: UIView): UIImage {
	if (view instanceof UIImageView) {
		return view.image;
	}
	// console.log('snapshotView view.frame:', printRect(view.frame));
	UIGraphicsBeginImageContextWithOptions(CGSizeMake(view.frame.size.width, view.frame.size.height), false, Screen.mainScreen.scale);
	view.layer.renderInContext(UIGraphicsGetCurrentContext());
	const image = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();
	return image;
}

// todo: figure out all the properties/layer properties that we want to transition automatically
// note: some need to be done at various stages of the animation and are not in here. (e.g. alpha)
export function iosMatchLayerProperties(view: UIView, toView: UIView) {
	const viewPropertiesToMatch: Array<keyof UIView> = ['backgroundColor'];
	const layerPropertiesToMatch: Array<keyof CALayer> = ['cornerRadius', 'borderWidth', 'borderColor'];

	viewPropertiesToMatch.forEach((property) => {
		if (view[property] !== toView[property]) {
			// console.log('|    -- matching view property:', property);
			view[property as any] = toView[property];
		}
	});

	layerPropertiesToMatch.forEach((property) => {
		if (view.layer[property] !== toView.layer[property]) {
			// console.log('|    -- matching layer property:', property);
			view.layer[property as any] = toView.layer[property];
		}
	});
}

export function iosPrintRect(r: CGRect) {
	return `CGRect(${r.origin.x} ${r.origin.y} ${r.size.width} ${r.size.height})`;
}
