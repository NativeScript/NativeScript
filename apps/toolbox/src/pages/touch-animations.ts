import { Observable, EventData, Page, CoreTypes, TouchManager, TouchAnimationOptions, Color, View } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new TouchAnimationsModel(page);
}

export class TouchAnimationsModel extends Observable {
	touchAnimation: TouchAnimationOptions = {
		down: {
			scale: { x: 0.95, y: 0.95 },
			backgroundColor: new Color('purple'),
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
		up: {
			scale: { x: 1, y: 1 },
			backgroundColor: new Color('#30bcff'),
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
	};

	touchAnimationLabel: TouchAnimationOptions = {
		down: {
			scale: { x: 0.85, y: 0.85 },
			duration: 150,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
		up: {
			scale: { x: 1, y: 1 },
			duration: 150,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
	};

	touchAnimationLayout: TouchAnimationOptions = {
		down: {
			scale: { x: 0.85, y: 0.85 },
			opacity: 0.7,
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
		up: {
			scale: { x: 1, y: 1 },
			opacity: 1,
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
	};

	touchAnimationNative: TouchAnimationOptions = {
		down: (view: View) => {
			if (global.isIOS) {
				// (<UIButton>view.ios).setTitleColorForState(new Color('white').ios, UIControlState.Selected | UIControlState.Normal | UIControlState.Highlighted);
				// 		(<UIButton>view.ios).titleLabel.textColor = new Color('white').ios;
				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					0.4,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut,
					() => {
						view.ios.transform = CGAffineTransformMakeScale(0.95, 0.95);
						view.opacity = 0.5;
						view.ios.backgroundColor = new Color('red').ios;
						view.color = new Color('white');
					},
					() => {
						// shake when all the way down
						view
							.animate({ translate: { x: -20, y: 0 }, scale: { x: 0.95, y: 0.95 }, duration: 60, curve: CoreTypes.AnimationCurve.linear })
							.then(function () {
								return view.animate({ translate: { x: 20, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: -20, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: 20, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: -10, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: 10, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: -5, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: 5, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {
								return view.animate({ translate: { x: 0, y: 0 }, duration: 60, curve: CoreTypes.AnimationCurve.linear });
							})
							.then(function () {});
					}
				);
			} else {
			}
		},
		up: (view: View) => {
			if (global.isIOS) {
				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					0.4,
					0,
					0.5,
					3,
					UIViewAnimationOptions.CurveEaseInOut,
					() => {
						view.ios.transform = CGAffineTransformMakeScale(1.2, 1.2);
					},
					() => {
						UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
							0.2,
							0,
							0.5,
							3,
							UIViewAnimationOptions.CurveEaseInOut,
							() => {
								view.ios.transform = CGAffineTransformIdentity;
								view.opacity = 1;
								view.ios.backgroundColor = new Color('#aee406').ios;
								view.color = new Color('black');
							},
							() => {
								// complete
							}
						);
					}
				);
			} else {
			}
		},
	};

	touchAnimationRotate: TouchAnimationOptions = {
		down: {
			scale: { x: 0.85, y: 0.85 },
			rotate: 6,
			opacity: 0.7,
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
		up: {
			scale: { x: 1, y: 1 },
			rotate: 0,
			opacity: 1,
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
	};

	touchAnimationGrow: TouchAnimationOptions = {
		down: {
			scale: { x: 1.2, y: 1.2 },
			backgroundColor: new Color('#325279'),
			rotate: -4,
			duration: 250,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
		up: {
			scale: { x: 1, y: 1 },
			backgroundColor: new Color('#006968'),
			rotate: 0,
			duration: 900,
			curve: CoreTypes.AnimationCurve.easeInOut,
		},
	};

	constructor(private page: Page) {
		super();
		TouchManager.enableGlobalTapAnimations = true;
		this.page.on('navigatingFrom', () => {
			TouchManager.enableGlobalTapAnimations = false;
		});

		// reuse instance level animations but customize to ensure they are different
		TouchManager.animations = {
			down: {
				...this.touchAnimation.down,
				backgroundColor: new Color('rgba(48, 188, 255, .7)'),
				duration: 150,
			},
			up: {
				...this.touchAnimation.up,
				duration: 150,
			},
		};
	}

	onTapAnything() {
		console.log('onTapAnything');
	}
}
