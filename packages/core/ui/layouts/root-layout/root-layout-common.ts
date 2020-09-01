import { CSSType, View } from '../../core/view';
import { GridLayout } from '../grid-layout';
import { RootLayout } from '.';

@CSSType('RootLayout')
export class RootLayoutBase extends GridLayout {
	constructor() {
		super();
		global.rootLayout = this;
	}

	// ability to add any view instance to compositie views like layers
	open(view: View, options?: any): Promise<void> {
		return new Promise((resolve) => {
			this.insertChild(view, this.getChildrenCount() + 1);
		});
	}

	// ability to remove any view instance from composite views
	close(view: View): Promise<void> {
		if (this.hasChild(view)) {
			return new Promise((resolve) => {
				this.removeChild(view);
			});
		}
	}

	// bring any view instance open on the rootlayout to front of all the children visually
	bringToFront(view: View) {
		if (this.hasChild(view)) {
			this.removeChild(view);
			this.addChild(view);
		} else {
			console.log('not found');
		}
	}

	private hasChild(view: View): boolean {
		return this.getChildIndex(view) >= 0;
	}
}

export function getRootLayout(): RootLayout {
	return <RootLayout>global.rootLayout;
}
