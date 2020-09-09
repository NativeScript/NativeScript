import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import * as observable from '@nativescript/core/data/observable';

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new ActionItemPostitionView();
}

export class ActionItemPostitionView extends observable.Observable {
	private _values = ['-i---', '---i---', '---i-'];
	private _count: number;
	private _text: string;

	constructor() {
		super();
		this._count = 0;
	}

	get text(): string {
		return this._text;
	}

	set text(value: string) {
		if (this._text !== value) {
			this._text = value;
			this.notifyPropertyChange('text', value);
		}
	}

	public onTap() {
		this.change();
	}

	public change() {
		let index = this._count++ % 3;
		this.text = this._values[index];
	}
}
