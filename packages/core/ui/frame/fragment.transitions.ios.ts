import { NavigationTransition } from '.';
import { Transition } from '../transition';
import { SlideTransition } from '../transition/slide-transition';
import { FadeTransition } from '../transition/fade-transition';

import { Trace } from '../../trace';

@NativeClass
class AnimatedTransitioning extends NSObject implements UIViewControllerAnimatedTransitioning {
	public static ObjCProtocols = [UIViewControllerAnimatedTransitioning];

	private _transition: Transition;
	private _operation: UINavigationControllerOperation;
	private _fromVC: UIViewController;
	private _toVC: UIViewController;
	private _transitionType: string;

	public static init(transition: Transition, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): AnimatedTransitioning {
		const impl = <AnimatedTransitioning>AnimatedTransitioning.new();
		impl._transition = transition;
		impl._operation = operation;
		impl._fromVC = fromVC;
		impl._toVC = toVC;

		return impl;
	}

	public animateTransition(transitionContext: UIViewControllerContextTransitioning): void {
		switch (this._operation) {
			case UINavigationControllerOperation.Push:
				this._transitionType = 'push';
				break;
			case UINavigationControllerOperation.Pop:
				this._transitionType = 'pop';
				break;
			case UINavigationControllerOperation.None:
				this._transitionType = 'none';
				break;
		}

		if (Trace.isEnabled()) {
			Trace.write(`START ${this._transition} ${this._transitionType}`, Trace.categories.Transition);
		}
		this._transition.animateIOSTransition(transitionContext, this._fromVC, this._toVC, this._operation);
	}

	public transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
		return this._transition.getDuration();
	}

	public animationEnded(transitionCompleted: boolean): void {
		if (transitionCompleted) {
			if (Trace.isEnabled()) {
				Trace.write(`END ${this._transition} ${this._transitionType}`, Trace.categories.Transition);
			}
		} else {
			if (Trace.isEnabled()) {
				Trace.write(`CANCEL ${this._transition} ${this._transitionType}`, Trace.categories.Transition);
			}
		}
	}
}

export function _createIOSAnimatedTransitioning(navigationTransition: NavigationTransition, nativeCurve: UIViewAnimationCurve, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
	const instance = <Transition>navigationTransition.instance;
	let transition: Transition;

	if (instance) {
		// Instance transition should take precedence even if the given name match existing transition.
		transition = instance;
	} else if (navigationTransition.name) {
		const name = navigationTransition.name.toLowerCase();
		if (name.indexOf('slide') === 0) {
			const direction = name.substring('slide'.length) || 'left'; //Extract the direction from the string
			transition = new SlideTransition(direction, navigationTransition.duration, nativeCurve);
		} else if (name === 'fade') {
			transition = new FadeTransition(navigationTransition.duration, nativeCurve);
		}
	}

	return transition ? AnimatedTransitioning.init(transition, operation, fromVC, toVC) : undefined;
}
