import { BottomNavigation } from '@nativescript/core/ui/bottom-navigation';

export function getNativeTabCount(tabView: BottomNavigation): number {
	// there is no native tab content view implementation for Android Bottom Navigation
	return tabView.items.length;
}

export function selectNativeTab(tabView: BottomNavigation, index: number): void {
	const bottomNavigationBar = <org.nativescript.widgets.BottomNavigationBar>(<any>tabView)._bottomNavigationBar;

	if (bottomNavigationBar) {
		bottomNavigationBar.setSelectedPosition(index);
	}
}

export function getNativeSelectedIndex(tabView: BottomNavigation): number {
	// there is no native tab content view implementation for Android Bottom Navigation
	return tabView.selectedIndex;
}

export function getNativeFont(tabView: BottomNavigation): any {
	const tv: android.widget.TextView = (<org.nativescript.widgets.BottomNavigationBar>(<any>tabView)._bottomNavigationBar).getTextViewForItemAt(0);
	if (tv) {
		return {
			typeface: tv.getTypeface(),
			size: tv.getTextSize(),
		};
	}

	return null;
}

export function getOriginalFont(tabView: BottomNavigation): any {
	const tv: android.widget.TextView = (<org.nativescript.widgets.BottomNavigationBar>(<any>tabView)._bottomNavigationBar).getTextViewForItemAt(0);

	return {
		typeface: tv.getTypeface(),
		size: tv.getTextSize(),
	};
}
