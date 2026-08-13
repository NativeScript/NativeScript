export * from './segmented-bar-common';

import { SegmentedBarBase, SegmentedBarItemBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty, selectedTextColorProperty } from './segmented-bar-common';
import { Color } from '../../color';

export class SegmentedBarItem extends SegmentedBarItemBase {
	public _update(): void {
		(this.parent as SegmentedBar)?._rebuildSegments?.();
	}
}

// WinUI3 has no built-in segmented control — built as a horizontal row of ToggleButtons.
export class SegmentedBar extends SegmentedBarBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.StackPanel;
	private _buttons: Microsoft.UI.Xaml.Controls.Primitives.ToggleButton[] = [];
	private _clickDelegates: any[] = [];
	private _suppress = false;

	private _windows: Microsoft.UI.Xaml.Controls.StackPanel;

	public createNativeView(): Microsoft.UI.Xaml.Controls.StackPanel {
		this._windows = new Microsoft.UI.Xaml.Controls.StackPanel();
		this._windows.Orientation = Microsoft.UI.Xaml.Controls.Orientation.Horizontal;
		return this._windows;
	}

	public _rebuildSegments(): void {
		const panel = this._windows;
		if (!panel || !panel.Children) return;
		panel.Children.Clear();
		this._buttons = [];
		this._clickDelegates = [];
		const items = this.items || [];
		items.forEach((item, i) => {
			let btn: Microsoft.UI.Xaml.Controls.Primitives.ToggleButton;
			try {
				btn = new Microsoft.UI.Xaml.Controls.Primitives.ToggleButton();
			} catch (_e) {
				return;
			}
			btn.Content = (item as SegmentedBarItemBase).title ?? '';
			btn.MinWidth = 72;
			// MUST wire via asDelegate — a raw RoutedEventHandler assignment doesn't reliably subscribe
			// here; taps only toggle the native button without our handler running.
			try {
				const cb = () => {
					if (this._suppress) return;
					if (this.selectedIndex !== i) {
						this.selectedIndex = i;
					} else {
						this._applySelection(i);
					}
				};
				const del = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', cb);
				btn.Click = del;
				this._clickDelegates.push(del);
			} catch (_e) {}
			this._buttons.push(btn);
			panel.Children.Append(btn);
		});
		this._applySelection(this.selectedIndex);
	}

	private _applySelection(index: number): void {
		this._suppress = true;
		try {
			this._buttons.forEach((btn, i) => {
				btn.IsChecked = i === index;
				this._styleButton(btn, i === index);
			});
		} finally {
			this._suppress = false;
		}
	}

	private _styleButton(btn: Microsoft.UI.Xaml.Controls.Primitives.ToggleButton, checked: boolean): void {
		const Control = Microsoft.UI.Xaml.Controls.Control;
		if (checked) {
			const bg = this.selectedBackgroundColor;
			const fg = this.selectedTextColor;
			if (bg) btn.Background = new Microsoft.UI.Xaml.Media.SolidColorBrush(bg.windows);
			if (fg) btn.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush(fg.windows);
		} else {
			try { btn.ClearValue((Control as any).BackgroundProperty); } catch (_e) {}
			try { btn.ClearValue((Control as any).ForegroundProperty); } catch (_e) {}
		}
	}

	[selectedIndexProperty.getDefault](): number {
		return -1;
	}
	[selectedIndexProperty.setNative](value: number) {
		this._applySelection(value);
	}

	[itemsProperty.getDefault](): any {
		return null;
	}
	[itemsProperty.setNative](_value: any) {
		this._rebuildSegments();
		selectedIndexProperty.coerce(this);
	}

	//@ts-ignore
	[selectedBackgroundColorProperty.setNative](_value: Color) {
		this._applySelection(this.selectedIndex);
	}

	//@ts-ignore
	[selectedTextColorProperty.setNative](_value: Color) {
		this._applySelection(this.selectedIndex);
	}
}
