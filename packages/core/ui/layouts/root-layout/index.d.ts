import { GridLayout } from '../grid-layout';
import { View } from '../../core/view';
import { AnimationCurve } from '../../enums';

export class RootLayout extends GridLayout {
	open(view: View, options?: RootLayoutOptions): Promise<void>;
	close(view: View, exitTo?: TransitionAnimation): Promise<void>;
	bringToFront(view: View, animated?: boolean): Promise<void>;
	closeAll(): Promise<void>;
	getShadeCover(): View;
}

export function getRootLayout(): RootLayout;

export interface RootLayoutOptions {
	shadeCover?: ShadeCoverOptions;
	animation?: {
		enterFrom?: TransitionAnimation;
		exitTo?: TransitionAnimation;
	};
}

export interface ShadeCoverOptions {
	opacity?: number;
	color?: string;
	tapToClose?: boolean;
	animation?: {
		enterFrom?: TransitionAnimation; // these will only be applied if its the first one to be opened
		exitTo?: TransitionAnimation; // these will only be applied if its the last one to be closed
	};
	ignoreShadeRestore?: boolean;
}

export interface TransitionAnimation {
	translateX?: number;
	translateY?: number;
	scaleX?: number;
	scaleY?: number;
	rotate?: number; // in degrees
	opacity?: number;
	duration?: number; // in milliseconds
	curve?: AnimationCurve;
}
