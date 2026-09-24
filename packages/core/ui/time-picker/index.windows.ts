export * from './time-picker-common';

import { TimePickerBase, hourProperty, minuteProperty, timeProperty } from './time-picker-common';

export class TimePicker extends TimePickerBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.TimePicker;
	private _windows: Microsoft.UI.Xaml.Controls.TimePicker;
	private _timeChangedHandler: any = null;
	// Guards the SelectedTimeChanged feedback loop when we set the value programmatically.
	private _suppressChange = false;

	public createNativeView(): Microsoft.UI.Xaml.Controls.TimePicker {
		this._windows = new Microsoft.UI.Xaml.Controls.TimePicker();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.TimePicker {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		const handler = (_sender: Microsoft.UI.Xaml.Controls.TimePicker, args: Microsoft.UI.Xaml.Controls.TimePickerSelectedValueChangedEventArgs) => {
			const owner = that.deref();
			if (!owner || owner._suppressChange) return;
			const raw = args.NewTime as any; // System.Nullable<System.TimeSpan>
			if (!raw) return;
			// System.TimeSpan.Duration is 100-nanosecond ticks
			const ticks = typeof raw.Duration === 'bigint' ? Number(raw.Duration) : (raw.Duration as number) ?? 0;
			const totalSeconds = Math.round(ticks / 10_000_000);
			const hour = Math.floor(totalSeconds / 3600);
			const minute = Math.floor((totalSeconds % 3600) / 60);
			hourProperty.nativeValueChange(owner, hour);
			minuteProperty.nativeValueChange(owner, minute);
			timeProperty.nativeValueChange(owner, new Date(0, 0, 0, hour, minute));
			owner.notify({ eventName: TimePickerBase.timeChangeEvent, object: owner, value: { hour, minute } });
		};
		this._timeChangedHandler = NSWinRT.asDelegate(
			'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.TimePicker,Microsoft.UI.Xaml.Controls.TimePickerSelectedValueChangedEventArgs>',
			handler
		);
		this._windows.SelectedTimeChanged = this._timeChangedHandler;
	}

	public disposeNativeView(): void {
		if (this._windows && this._timeChangedHandler) {
			this._windows.SelectedTimeChanged = null;
			this._timeChangedHandler = null;
		}
		super.disposeNativeView();
	}

	private _setTime(ms: number): void {
		// SelectedTime (IReference<TimeSpan>) drives the display; Duration is 100ns ticks.
		const ts = { Duration: BigInt(Math.max(0, Math.round(ms)) * 10000) } as never;
		this._suppressChange = true;
		try {
			this._windows.SelectedTime = Windows.Foundation.PropertyValue.CreateTimeSpan(ts) as never;
		} finally {
			this._suppressChange = false;
		}
	}

	[hourProperty.getDefault](): number {
		return 0;
	}
	//@ts-ignore
	[hourProperty.setNative](value: number) {
		this._setTime((value * 3600 + (this.minute ?? 0) * 60) * 1000);
	}

	[minuteProperty.getDefault](): number {
		return 0;
	}
	//@ts-ignore
	[minuteProperty.setNative](value: number) {
		this._setTime(((this.hour ?? 0) * 3600 + value * 60) * 1000);
	}

	//@ts-ignore
	[timeProperty.setNative](value: Date) {
		this._setTime((value.getHours() * 3600 + value.getMinutes() * 60) * 1000);
	}
}
