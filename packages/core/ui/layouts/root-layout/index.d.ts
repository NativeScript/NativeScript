import { GridLayout } from '../grid-layout';
import { View } from 'ui/core/view';

export class RootLayout extends GridLayout {
	open(view: View, options?: any): Promise<void>;
	close(view: View): Promise<void>;
	bringToFront(view: View): void;
}

export function getRootLayout(): RootLayout;
