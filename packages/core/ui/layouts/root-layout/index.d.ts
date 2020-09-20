import { GridLayout } from '../grid-layout';
import { View } from 'ui/core/view';

export class RootLayout extends GridLayout {
	open(view: View, options?: RootLayoutOptions): Promise<void>;
	close(view: View, exitAnimation?: AnimationDefinition): Promise<void>;
	bringToFront(view: View): Promise<void>;
}

export function getRootLayout(): RootLayout;

export interface RootLayoutOptions {
	shadeCover?: ShadeCoverOptions;
	enterAnimation?: AnimationDefinition;
	exitAnimation?: AnimationDefinition;
}

export interface ShadeCoverOptions {
	opacity?: number;
	color?: string;
	tapToClose?: boolean;
	height?: number; // shade will be vertically aligned at bottom with the height specified
	enterAnimation?: ShadeCoverEnterAnimation; // these will only be applied if its the first one to be opened
	exitAnimation?: ShadeCoverExitAnimation; // these will only be applied if its the last one to be closed
	ignoreShadeRestore?: boolean;
}

export interface ShadeCoverEnterAnimation {
	translateXFrom?: number;
	translateYFrom?: number;
	scaleXFrom?: number;
	scaleYFrom?: number;
	rotateFrom?: number;
	opacityFrom?: number;
	duration?: number; // in seconds
}

export interface ShadeCoverExitAnimation {
	translateXTo?: number;
	translateYTo?: number;
	scaleXTo?: number;
	scaleYTo?: number;
	rotateTo?: number;
	opacityTo?: number;
	duration?: number; // in seconds
}
