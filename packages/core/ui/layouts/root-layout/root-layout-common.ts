import { Color } from '../../../color';
import { CSSType, View } from '../../core/view';
import { GridLayout } from '../grid-layout';
import { RootLayout, RootLayoutOptions, ShadeCoverOptions, ShadeCoverEnterAnimation, ShadeCoverExitAnimation } from '.';
import { Animation, AnimationDefinition } from '../../animation';
import { LinearGradient } from '../../styling/linear-gradient';

@CSSType('RootLayout')
export class RootLayoutBase extends GridLayout {
	private shadeCover: View;
	private staticChildCount: number;
	private popupViews: { view: View; options: RootLayoutOptions }[] = [];

	constructor() {
		super();
		global.rootLayout = this;
		this.on('loaded', () => {
			// get actual content count of rootLayout (elements between the <RootLayout> tags in the template).
			// All popups will be inserted dynamically at a higher index
			this.staticChildCount = this.getChildrenCount();
		});
	}

	// TODO: add both enter and exit animations here so if close is triggered by clicking on shadecover
	// it will also play the close animation
	// ability to add any view instance to compositie views like layers
	open(view: View, options?: RootLayoutOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				if (this.hasChild(view)) {
					// TODO: add trace
					console.log(`View ${view} has already been added`);
					// reject(`View ${view} has already been added`);
				} else {
					// keep track of the views locally to be able to use their options later
					this.popupViews.push({ view: view, options: options });

					// only insert 1 layer of shade cover (don't insert another one if already present)
					if (options?.shadeCover && !this.shadeCover) {
						this.shadeCover = this.createShadeCover(options.shadeCover);
						// insert shade cover at index right above the first layout
						this.insertChild(this.shadeCover, this.staticChildCount + 1);
					}

					// overwrite current shadeCover options if topmost popupview has additional shadeCover configurations
					else if (options?.shadeCover && this.shadeCover) {
						this.updateShadeCover(this.shadeCover, options.shadeCover);
					}

					this.insertChild(view, this.getChildrenCount() + 1);

					if (options?.enterAnimation) {
						const enterAnimation = new Animation([{ ...options.enterAnimation, target: view }]);
						enterAnimation
							.play()
							.then(() => resolve())
							.catch((ex) => reject(ex));
					} else {
						resolve();
					}
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	// optional animation parameter to overwrite close animation declared when opening popup
	// ability to remove any view instance from composite views
	close(view: View, exitAnimation?: AnimationDefinition): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.hasChild(view)) {
				try {
					const popupIndex = this.getPopupIndex(view);
					// use exitAnimation that is passed in and fallback to the exitAnimation passed in when opening
					const exitAnimationDefinition = exitAnimation || this.popupViews[popupIndex]?.options?.exitAnimation;

					// Remove view from local array
					const poppedView = this.popupViews[popupIndex];
					this.popupViews.splice(popupIndex, 1);

					// update shade cover with the topmost popupView options (if not specifically told to ignore)
					const shadeCoverOptions = this.popupViews[this.popupViews.length - 1]?.options?.shadeCover;
					if (shadeCoverOptions && !poppedView?.options?.shadeCover.ignoreShadeRestore) {
						this.updateShadeCover(this.shadeCover, shadeCoverOptions);
					}

					if (exitAnimationDefinition) {
						const exitAnimation = new Animation([{ ...exitAnimationDefinition, target: view }]);
						const exitAnimations: Promise<any>[] = [exitAnimation.play()];

						// also remove shade cover if this is the last opened popup view
						if (this.popupViews.length === 0) {
							exitAnimations.push(this.closeShadeCover(poppedView.options.shadeCover));
						}
						return Promise.all(exitAnimations)
							.then(() => {
								this.removeChild(view);
								resolve();
							})
							.catch((ex) => reject(ex));
					}
					this.removeChild(view);
					this.closeShadeCover(poppedView.options.shadeCover);
					resolve();
				} catch (ex) {
					reject(ex);
				}
			} else {
				console.log(`View ${view} not found`);
			}
		});
	}

	closeAll(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				while (this.popupViews.length > 0) {
					// remove all children in the popupViews array
					this.close(this.popupViews[this.popupViews.length - 1].view);
				}
				resolve();
			} catch (ex) {
				reject(ex);
			}
		});
	}

	// bring any view instance open on the rootlayout to front of all the children visually
	bringToFront(view: View, animated: boolean = false): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				const popupIndex = this.getPopupIndex(view);
				// popupview should be present and not already the topmost view
				if (popupIndex > -1 && popupIndex !== this.popupViews.length - 1) {
					// keep the popupViews array in sync with the stacking of the views
					const currentView = this.popupViews[this.getPopupIndex(view)];
					this.popupViews.splice(this.getPopupIndex(view), 1);
					this.popupViews.push(currentView);

					if (this.hasChild(view)) {
						if (animated) {
							const exitAnimation = this.getViewExitAnimation(view);
							if (exitAnimation) {
								exitAnimation.play().then(() => {
									this._bringToFront(view);
									const enterAnimation = this.getViewEnterAnimation(currentView.view);
									if (enterAnimation) {
										enterAnimation.play();
									}
								});
							}
						} else {
							this._bringToFront(view);
						}
					}

					// update shadeCover to reflect topmost's shadeCover options
					const shadeCoverOptions = currentView?.options?.shadeCover;
					if (shadeCoverOptions) {
						this.updateShadeCover(this.shadeCover, shadeCoverOptions);
					}

					resolve();
				} else {
					console.log(`View ${view} not found or already at topmost`);
				}
			} catch (ex) {
				// TODO: replace rejects with trace
				reject(ex);
			}
		});
	}

	private getViewEnterAnimation(view: View): Animation {
		const popupIndex = this.getPopupIndex(view);
		if (popupIndex === -1) {
			return;
		}
		const enterAnimation = this.popupViews[popupIndex]?.options?.enterAnimation;
		if (!enterAnimation) {
			return;
		}
		return new Animation([{ ...enterAnimation, target: view }]);
	}

	private getViewExitAnimation(view: View): Animation {
		const popupIndex = this.getPopupIndex(view);
		if (popupIndex === -1) {
			return;
		}
		const exitAnimation = this.popupViews[popupIndex]?.options?.exitAnimation;
		if (!exitAnimation) {
			return;
		}
		return new Animation([{ ...exitAnimation, target: view }]);
	}

	protected _bringToFront(view: View) {}

	private hasChild(view: View): boolean {
		return this.getChildIndex(view) >= 0;
	}

	private closeShadeCover(shadeCoverOptions?: ShadeCoverOptions): Promise<void> {
		// if shade cover is displayed and the last popup is closed, also close the shade cover
		if (this.shadeCover) {
			return this._closeShadeCover(this.shadeCover, shadeCoverOptions).then(() => {
				this.removeChild(this.shadeCover);
				this.shadeCover.off('loaded');
				this.shadeCover = null;
			});
		}
	}

	protected _closeShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		return new Promise(() => {});
	}

	private createShadeCover(shadeOptions: ShadeCoverOptions): View {
		const shadeCover = new GridLayout();
		shadeCover.verticalAlignment = 'bottom';
		shadeCover.on('loaded', () => {
			this._initShadeCover(shadeCover, shadeOptions);
			this.updateShadeCover(shadeCover, shadeOptions);
		});
		return shadeCover;
	}

	private updateShadeCover(shade: View, shadeOptions: ShadeCoverOptions): void {
		if (shadeOptions.tapToClose !== undefined && shadeOptions.tapToClose !== null) {
			shade.off('tap');
			if (shadeOptions.tapToClose) {
				shade.on('tap', () => {
					this.closeAll();
				});
			}
		}
		this._updateShadeCover(shade, shadeOptions);
	}

	protected _initShadeCover(view: View, shadeOption: ShadeCoverOptions): void {}

	protected _updateShadeCover(view: View, shadeOption: ShadeCoverOptions): Promise<void> {
		return new Promise(() => {});
	}

	private getPopupIndex(view: View): number {
		return this.popupViews.findIndex((popupView) => popupView.view === view);
	}
}

export function getRootLayout(): RootLayout {
	return <RootLayout>global.rootLayout;
}

export const defaultShadeCoverOptions: ShadeCoverOptions = {
	opacity: 0.5,
	color: '#000000',
	tapToClose: true,
	enterAnimation: {
		translateXFrom: 0,
		translateYFrom: 1000,
		scaleXFrom: 1,
		scaleYFrom: 1,
		rotateFrom: 0,
		opacityFrom: 0,
		duration: 0.5,
	},
	exitAnimation: {
		translateXTo: 0,
		translateYTo: 1000,
		scaleXTo: 1,
		scaleYTo: 1,
		rotateTo: 0,
		opacityTo: 0,
		duration: 0.5,
	},
	ignoreShadeRestore: false,
};
