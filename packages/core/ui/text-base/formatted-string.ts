import { FormattedString as FormattedStringDefinition } from './formatted-string';
import { Span } from './span';
import { Observable, PropertyChangeData } from '../../data/observable';
import { ObservableArray, ChangedData } from '../../data/observable-array';
import { AddArrayFromBuilder, AddChildFromBuilder } from '../core/view';
import { ViewBase } from '../core/view-base';
import { Color } from '../../color';
import { FontStyleType, FontWeightType } from '../styling/font';
import { CoreTypes } from '../../core-types';

export class FormattedString extends ViewBase implements FormattedStringDefinition, AddArrayFromBuilder, AddChildFromBuilder {
	private _spans: ObservableArray<Span>;

	constructor() {
		super();
		this._spans = new ObservableArray<Span>();
		this._spans.addEventListener(ObservableArray.changeEvent, this.onSpansCollectionChanged, this);
	}

	get fontFamily(): string {
		return this.style.fontFamily;
	}
	set fontFamily(value: string) {
		this.style.fontFamily = value;
	}

	get fontSize(): number {
		return this.style.fontSize;
	}
	set fontSize(value: number) {
		this.style.fontSize = value;
	}

	get fontStyle(): FontStyleType {
		return this.style.fontStyle;
	}
	set fontStyle(value: FontStyleType) {
		this.style.fontStyle = value;
	}

	get fontWeight(): FontWeightType {
		return this.style.fontWeight;
	}
	set fontWeight(value: FontWeightType) {
		this.style.fontWeight = value;
	}

	get textDecoration(): CoreTypes.TextDecorationType {
		return this.style.textDecoration;
	}
	set textDecoration(value: CoreTypes.TextDecorationType) {
		this.style.textDecoration = value;
	}

	get color(): Color {
		return this.style.color;
	}
	set color(value: Color) {
		this.style.color = value;
	}

	get backgroundColor(): Color {
		return this.style.backgroundColor;
	}
	set backgroundColor(value: Color) {
		this.style.backgroundColor = value;
	}

	get spans(): ObservableArray<Span> {
		if (!this._spans) {
			this._spans = new ObservableArray<Span>();
		}

		return this._spans;
	}

	public toString(): string {
		let result = '';
		for (let i = 0, length = this.spans.length; i < length; i++) {
			result += this.spans.getItem(i).text;
		}

		return result;
	}

	public _addArrayFromBuilder(name: string, value: Array<any>) {
		if (name === 'spans') {
			this.spans.push(...value);
		}
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof Span) {
			this.spans.push(value);
		}
	}

	private onSpansCollectionChanged(eventData: ChangedData<Span>) {
		if (eventData.addedCount > 0) {
			for (let i = 0; i < eventData.addedCount; i++) {
				const span = (<ObservableArray<Span>>eventData.object).getItem(eventData.index + i);

				// First add to logical tree so that inherited properties are set.
				this._addView(<any>span);

				// Then attach handlers - we skip the first notification because
				// we raise change for the whole instance.
				this.addPropertyChangeHandler(span);
			}
		}

		if (eventData.removed && eventData.removed.length > 0) {
			for (let p = 0; p < eventData.removed.length; p++) {
				const span = eventData.removed[p];

				// First remove handlers so that we don't listen for changes
				// on inherited properties.
				this.removePropertyChangeHandler(span);

				// Then remove the element.
				this._removeView(span);
			}
		}

		this.notifyPropertyChange('.', this);
	}

	private addPropertyChangeHandler(span: Span) {
		const style = span.style;
		span.on(Observable.propertyChangeEvent, this.onPropertyChange, this);
		style.on('fontFamilyChange', this.onPropertyChange, this);
		style.on('fontSizeChange', this.onPropertyChange, this);
		style.on('fontStyleChange', this.onPropertyChange, this);
		style.on('fontWeightChange', this.onPropertyChange, this);
		style.on('textDecorationChange', this.onPropertyChange, this);
		style.on('colorChange', this.onPropertyChange, this);
		style.on('backgroundColorChange', this.onPropertyChange, this);
	}

	private removePropertyChangeHandler(span: Span) {
		const style = span.style;
		span.off(Observable.propertyChangeEvent, this.onPropertyChange, this);
		style.off('fontFamilyChange', this.onPropertyChange, this);
		style.off('fontSizeChange', this.onPropertyChange, this);
		style.off('fontStyleChange', this.onPropertyChange, this);
		style.off('fontWeightChange', this.onPropertyChange, this);
		style.off('textDecorationChange', this.onPropertyChange, this);
		style.off('colorChange', this.onPropertyChange, this);
		style.off('backgroundColorChange', this.onPropertyChange, this);
	}

	private onPropertyChange(data: PropertyChangeData) {
		this.notifyPropertyChange(data.propertyName, this);
	}

	eachChild(callback: (child: ViewBase) => boolean): void {
		this.spans.forEach((v, i, arr) => callback(v));
	}
}
