import { GridLayout } from '../grid-layout';
import { View } from 'ui/core/view';

export class RootLayout extends GridLayout {
	open(view: View, options?: any): Promise<void>;
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
	enterAnimation?: AnimationDefinition;
	exitAnimation?: AnimationDefinition;
	ignoreShadeRestore?: boolean;
}
