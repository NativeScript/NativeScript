import { Color } from '../../../color';
import { CSSType, View } from '../../core/view';
import { GridLayout } from '../grid-layout';
import { RootLayout } from '.';
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
					if (options?.shadeCover && this.shadeCover) {
						console.log('options?.shadeCover', options?.shadeCover);
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

	// TODO: pass in optional animation parameter here to overwrite close animation declared when opening popup
	// ability to remove any view instance from composite views
	close(view: View, exitAnimation?: AnimationDefinition): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.hasChild(view)) {
				try {
					const popupIndex = this.getPopupIndex(view);
					// use exitAnimation that is passed in and fallback to the exitAnimation passed in when opening
					const exitAnimationDefinition = exitAnimation || this.popupViews[popupIndex]?.options?.exitAnimation;

					if (exitAnimationDefinition) {
						const exitAnimation = new Animation([{ ...exitAnimationDefinition, target: view }]);
						return exitAnimation
							.play()
							.then(() => {
								// Remove view from local array
								const poppedView = this.popupViews[popupIndex];
								this.popupViews.splice(popupIndex, 1);

								// update shade cover with the topmost popupView options (if not specifically told to ignore)
								const shadeCoverOptions = this.popupViews[this.popupViews.length - 1]?.options?.shadeCover;
								if (shadeCoverOptions && !poppedView?.options?.shadeCover.ignoreShadeRestore) {
									this.updateShadeCover(this.shadeCover, shadeCoverOptions);
								}

								this.removeChild(view);
								this.removeShadeCover();
								resolve();
							})
							.catch((ex) => reject(ex));
					}
					this.removeChild(view);
					this.removeShadeCover();
					resolve();
				} catch (ex) {
					reject(ex);
				}
			} else {
				reject(`View ${view} not found`);
			}
		});
	}

	closeAll(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// remove all children in the popupViews array
				const closePopupViews = [];
				this.popupViews.forEach((popupView) => {
					closePopupViews.push(this.close(popupView.view));
				});
				return Promise.all(closePopupViews);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	// bring any view instance open on the rootlayout to front of all the children visually
	bringToFront(view: View): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				if (this.getPopupIndex(view) > -1) {
					// TODO: try to modify subview without using removeChild and addChild
					// for better performance
					if (this.hasChild(view)) {
						this.removeChild(view);
						this.addChild(view);
					}

					// keep the popupViews array in sync with the stacking of the views
					const currentView = this.popupViews[this.getPopupIndex(view)];
					this.popupViews.splice(this.getPopupIndex(view), 1);
					this.popupViews.push(currentView);

					// update shadeCover to reflect topmost's shadeCover options
					const shadeCoverOptions = currentView?.options?.shadeCover;
					if (shadeCoverOptions) {
						this.updateShadeCover(this.shadeCover, shadeCoverOptions);
					}

					resolve();
				} else {
					reject(`View ${view} not found`);
				}
			} catch (ex) {
				// TODO: replace rejects with trace
				reject(ex);
			}
		});
	}

	private hasChild(view: View): boolean {
		return this.getChildIndex(view) >= 0;
	}

	private removeShadeCover(): void {
		// if shade cover is displayed and the last popup is closed, also close the shade cover
		if (this.shadeCover && this.getChildrenCount() === this.staticChildCount + 1) {
			this.removeChild(this.shadeCover);
			this.shadeCover = null;
		}
	}

	private createShadeCover(shadeOptions: ShadeCoverOptions): View {
		const shadeCover = new GridLayout();
		shadeCover.width = this.getMeasuredWidth();
		shadeCover.verticalAlignment = 'bottom';
		this.updateShadeCover(shadeCover, shadeOptions);
		return shadeCover;
	}

	private updateShadeCover(shade: View, shadeOptions: ShadeCoverOptions): void {
		shade.height = shadeOptions.height || this.getMeasuredHeight();
		if (shadeOptions.opacity !== undefined && shadeOptions.opacity !== null) {
			shade.opacity = shadeOptions.opacity;
		}
		if (shadeOptions.color !== undefined && shadeOptions.color !== null) {
			// TODO: pass in gradient color (see core implementation)
			shade.backgroundColor = new Color(shadeOptions.color);
		}
		if (shadeOptions.tapToClose !== undefined && shadeOptions.tapToClose !== null) {
			shade.off('tap');
			if (shadeOptions.tapToClose) {
				shade.on('tap', () => {
					this.closeAll();
				});
			}
		}
	}

	private getPopupIndex(view: View): number {
		return this.popupViews.findIndex((popupView) => popupView.view === view);
	}
}

export class RootLayoutOptions {
	// TODO: default to having a shade cover
	shadeCover?: ShadeCoverOptions;
	enterAnimation?: AnimationDefinition;
	exitAnimation?: AnimationDefinition;
}

export class ShadeCoverOptions {
	opacity?: number;
	color?: string;
	tapToClose?: boolean;
	height?: number; // shade will be vertically aligned at bottom with the height specified
	enterAnimation?: AnimationDefinition; // TODO: should these be a set of predefined animations? how do you handle the styles set before the animation to do the transitions
	exitAnimation?: AnimationDefinition;
	ignoreShadeRestore?: boolean; // overwrite default shade behavior
}

export function getRootLayout(): RootLayout {
	return <RootLayout>global.rootLayout;
}
