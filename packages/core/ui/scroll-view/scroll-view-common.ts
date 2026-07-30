import { ContentView } from '../content-view';
import { Property, makeParser, makeValidator } from '../core/properties';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { EventData } from '../../data/observable';
import { CoreTypes } from '../../core-types';

@CSSType('ScrollView')
export abstract class ScrollViewBase extends ContentView {
	public static scrollEvent = 'scroll';

	public orientation: CoreTypes.OrientationType;
	public scrollBarIndicatorVisible: boolean;
	public isScrollEnabled: boolean;

	private _addedScrollEvent = false;

	public addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
		const hasExistingScrollListeners: boolean = this.hasListeners(ScrollViewBase.scrollEvent);

		super.addEventListener(eventName, callback, thisArg, once);

		// This indicates that a scroll listener was added for first time
		if (!hasExistingScrollListeners && this.hasListeners(ScrollViewBase.scrollEvent)) {
			this._addedScrollEvent = true;

			if (this.nativeViewProtected) {
				this.attachNative();
			}
		}
	}

	public removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		const hasExistingScrollListeners: boolean = this.hasListeners(ScrollViewBase.scrollEvent);

		super.removeEventListener(eventName, callback, thisArg);

		// This indicates that the final scroll listener was removed
		if (hasExistingScrollListeners && !this.hasListeners(ScrollViewBase.scrollEvent)) {
			this._addedScrollEvent = false;

			if (this.nativeViewProtected) {
				this.detachNative();
			}
		}
	}

	initNativeView() {
		super.initNativeView();
		if (this._addedScrollEvent) {
			this.attachNative();
		}
	}

	public disposeNativeView() {
		if (this._addedScrollEvent) {
			this.detachNative();
		}
		super.disposeNativeView();
	}

	protected attachNative() {
		//
	}

	protected detachNative() {
		//
	}

	get horizontalOffset(): number {
		return 0;
	}

	get verticalOffset(): number {
		return 0;
	}

	get scrollableWidth(): number {
		return 0;
	}

	get scrollableHeight(): number {
		return 0;
	}

	public abstract scrollToVerticalOffset(value: number, animated: boolean);
	public abstract scrollToHorizontalOffset(value: number, animated: boolean);
	public abstract _onOrientationChanged();
}

const converter = makeParser<CoreTypes.OrientationType>(makeValidator(CoreTypes.Orientation.horizontal, CoreTypes.Orientation.vertical));
export const orientationProperty = new Property<ScrollViewBase, CoreTypes.OrientationType>({
	name: 'orientation',
	defaultValue: CoreTypes.Orientation.vertical,
	affectsLayout: true,
	valueChanged: (target: ScrollViewBase, oldValue: CoreTypes.OrientationType, newValue: CoreTypes.OrientationType) => {
		target._onOrientationChanged();
	},
	valueConverter: converter,
});
orientationProperty.register(ScrollViewBase);

export const scrollBarIndicatorVisibleProperty = new Property<ScrollViewBase, boolean>({
	name: 'scrollBarIndicatorVisible',
	defaultValue: true,
	valueConverter: booleanConverter,
});
scrollBarIndicatorVisibleProperty.register(ScrollViewBase);

export const isScrollEnabledProperty = new Property<ScrollViewBase, boolean>({
	name: 'isScrollEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
isScrollEnabledProperty.register(ScrollViewBase);
