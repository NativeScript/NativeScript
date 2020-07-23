import { Page, View, Trace, TraceWriter } from '@nativescript/core';

import * as TKUnit from './tk-unit';
import * as navHelper from './ui-helper';

export class UITest<T extends View> implements TraceWriter {
	private _testPage: Page;
	private _testView: T;
	private _errorMessage;

	public get errorMessage(): string {
		return this._errorMessage;
	}

	public get testPage(): Page {
		return this._testPage;
	}

	public get testView(): T {
		return this._testView;
	}

	public waitUntilTestElementIsLoaded(timeoutSec: number = 1): void {
		TKUnit.waitUntilReady(() => this.testView.isLoaded, timeoutSec);
	}

	public waitUntilTestElementLayoutIsValid(timeoutSec: number = 1): void {
		TKUnit.waitUntilReady(() => this.testView.isLayoutValid, timeoutSec);
	}

	public create(): T {
		throw new Error(this + ' should implement Create method.');
	}

	public setUpModule(): void {
		const pageFactory = () => {
			const page = new Page();
			this._testPage = page;

			return page;
		};

		Trace.addWriter(this);
		navHelper.navigate(pageFactory);
	}

	public tearDownModule() {
		this._testPage = null;
		this._testView = null;
		Trace.removeWriter(this);
	}

	public setUp() {
		this._testView = this.create();
		this._testPage.content = this._testView;
	}

	public tearDown() {
		this._testPage.content = null;
		this._testPage.bindingContext = null;
		this._testPage.css = '';
		this._testView = null;
		this._errorMessage = undefined;
	}

	public write(message: any, category: string, type?: number): void {
		if (category === Trace.categories.Error) {
			this._errorMessage = message;
		}
	}
}

export function createTestCase(): UITest<View> {
	return null;
}
