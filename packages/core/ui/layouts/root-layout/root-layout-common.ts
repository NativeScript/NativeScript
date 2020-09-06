import { Color } from '../../../color';
import { CSSType, View } from '../../core/view';
import { GridLayout } from '../grid-layout';
import { RootLayout } from '.';

@CSSType('RootLayout')
export class RootLayoutBase extends GridLayout {
	private shadeCover: View;
	private staticChildCount: number;

	constructor() {
		super();
		global.rootLayout = this;
		this.addEventListener('loaded', () => {
			// get actual content count of rootLayout (elements between the <RootLayout> tags in the template).
			// All popups will be inserted dynamically at a higher index
			this.staticChildCount = this.getChildrenCount();
		});
	}

	// ability to add any view instance to compositie views like layers
	open(view: View, options?: RootLayoutOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				if (this.hasChild(view)) {
					reject(`View ${view} has already been added`);
				} else {
					// only insert 1 layer of shade cover (don't insert another one if already present)
					if (options?.shade && !this.shadeCover) {
						const shade = options.shade;
						// insert shade cover at index right above the first layout
						this.shadeCover = this.getShadeCover(shade.color, shade.opacity);
						if (shade.tapToClose) {
							this.shadeCover.addEventListener('tap', () => {
								this.closeAll();
							});
						}
						this.insertChild(this.shadeCover, this.staticChildCount + 1);
					}
					this.insertChild(view, this.getChildrenCount() + 1);
					resolve();
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	// ability to remove any view instance from composite views
	close(view: View): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.hasChild(view)) {
				try {
					this.removeChild(view);

					// if shade cover is displayed and the last popup is closed, also close the shade cover
					if (this.shadeCover && this.getChildrenCount() === this.staticChildCount + 1) {
						this.removeChild(this.shadeCover);
						this.shadeCover = null;
					}
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
				// remove all children accpet the ones that aren't inserted dynamically
				while (this.getChildrenCount() > this.staticChildCount) {
					this.close(this.getChildAt(this.getChildrenCount() - 1));
				}
				resolve();
			} catch (ex) {
				reject(ex);
			}
		});
	}

	// bring any view instance open on the rootlayout to front of all the children visually
	bringToFront(view: View): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				if (this.hasChild(view)) {
					this.removeChild(view);
					this.addChild(view);
					resolve();
				} else {
					reject(`View ${view} not found`);
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	private hasChild(view: View): boolean {
		return this.getChildIndex(view) >= 0;
	}

	private getShadeCover(color: string, opacity: number): View {
		const shadeCover = new GridLayout();
		shadeCover.height = this.getMeasuredHeight();
		shadeCover.width = this.getMeasuredWidth();
		shadeCover.backgroundColor = new Color(color);
		shadeCover.opacity = opacity;
		return shadeCover;
	}
}

export interface RootLayoutOptions {
	shadeCoverOpacity?: number;
	shade: {
		opacity?: number;
		color?: string;
		tapToClose?: boolean;
	};
}

export function getRootLayout(): RootLayout {
	return <RootLayout>global.rootLayout;
}
