import { ScrollView as ScrollViewDefinition, ScrollEventData } from '.';
import { ContentView } from '../content-view';
import { profile } from '../../profiling';
import { Property, makeParser, makeValidator } from '../core/properties';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { EventData } from '../../data/observable';
import { CoreTypes } from '../../core-types';

@CSSType('ScrollView')
export abstract class ScrollViewBase extends ContentView implements ScrollViewDefinition {
	private _scrollChangeCount = 0;
	public static scrollEvent = 'scroll';

	public orientation: CoreTypes.OrientationType;
	public scrollBarIndicatorVisible: boolean;
	public isScrollEnabled: boolean;

	public addEventListener(arg: string, callback: any, thisArg?: any) {
		super.addEventListener(arg, callback, thisArg);

		if (arg === ScrollViewBase.scrollEvent) {
			this._scrollChangeCount++;
			this.attach();
		}
	}

	public removeEventListener(arg: string, callback: any, thisArg?: any) {
		super.removeEventListener(arg, callback, thisArg);

		if (arg === ScrollViewBase.scrollEvent) {
			this._scrollChangeCount--;
			this.dettach();
		}
	}

	@profile
	public onLoaded() {
		super.onLoaded();

		this.attach();
	}

	public onUnloaded() {
		super.onUnloaded();

		this.dettach();
	}

	private attach() {
		if (this._scrollChangeCount > 0 && this.isLoaded) {
			this.attachNative();
		}
	}

	private dettach() {
		if (this._scrollChangeCount === 0 && this.isLoaded) {
			this.dettachNative();
		}
	}

	protected attachNative() {
		//
	}

	protected dettachNative() {
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
export interface ScrollViewBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
	on(event: 'scroll', callback: (args: ScrollEventData) => void, thisArg?: any);
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
