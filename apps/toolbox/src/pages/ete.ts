import { Page, Observable, EventData, Dialogs, Button, View } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new ETEData();
}

export class ETEData extends Observable {
	showActionBar: boolean = true;
	color = 'white';
	viewColor = 'white';
	overflowTopBottom: boolean = false;
	overflowManual = false;
	overflowPage: boolean = false;

	togglePageOverflow(args) {
		const button = args.object as Button;
		const page = button.page;
		this.overflowPage = !this.overflowPage;
		page.frame.androidOverflowEdge = this.overflowPage ? 'dont-apply' : 'none';
	}

	toggleActionBar() {
		this.showActionBar = !this.showActionBar;
		this.notifyPropertyChange('showActionBar', this.showActionBar);
	}

	randomColor() {
		const letters = '0123456789ABCDEF';
		let color = '#';
		let viewColor = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
			viewColor += letters[Math.floor(Math.random() * 16)];
		}
		this.set('color', color);
		this.set('viewColor', viewColor);
	}

	toggleOverflowTopBottom(args) {
		const button = args.object as Button;
		const page = button.page;
		this.overflowTopBottom = !this.overflowTopBottom;
		page.androidOverflowEdge = this.overflowTopBottom ? 'top,bottom' : 'none';
	}

	padding = '0';

	inset = {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		ime: {
			//keyboard insets
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
		},
	};

	onInset(args) {
		this.inset.top = args.inset.top;
		this.inset.left = args.inset.left;
		this.inset.right = args.inset.right;
		this.inset.bottom = args.inset.bottom;
		this.padding = `${this.inset.top}px ${this.inset.right}px ${this.inset.bottom}px ${this.inset.left}px`;
		this.set('padding', this.padding);
	}

	toggleManualInsets(args) {
		const button = args.object as Button;
		const page = button.page;
		this.overflowManual = !this.overflowManual;
		page.off(View.androidOverflowInsetEvent, this.onInset, this);
		page.on(View.androidOverflowInsetEvent, this.onInset, this);
		this.overflowManual ? (this.padding = '0') : (this.padding = `${this.inset.top}px ${this.inset.right}px ${this.inset.bottom}px ${this.inset.left}px`);
		page.androidOverflowEdge = this.overflowManual ? 'dont-apply' : 'none';
	}
}
