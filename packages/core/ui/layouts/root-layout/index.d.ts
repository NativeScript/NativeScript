import { GridLayout } from '../grid-layout';
import { View } from '../../core/view';

export class RootLayout extends GridLayout {
	open(view: View, options: RootLayoutOptions = {}): Promise<void>;
	close(view: View, exitTo?: TransitionAnimation): Promise<void>;
	topmost(): View;
	bringToFront(view: View, animated?: boolean): Promise<void>;
	closeAll(): Promise<void[]>;
	getShadeCover(): View;
	openShadeCover(options: ShadeCoverOptions = {}): Promise<void>;
	closeShadeCover(shadeCoverOptions: ShadeCoverOptions = {}): Promise<void>;
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
		enterFrom?: TransitionAnimation; // only applied if first one to be opened
		exitTo?: TransitionAnimation; // only applied if last one to be closed
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
	curve?: any; // CoreTypes.AnimationCurve (string, cubicBezier, etc.)
}
