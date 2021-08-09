import { Observable, EventData, Page, Label } from '@nativescript/core';
import { addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from '@nativescript/core/ui/styling/style-scope';

let page: Page;
let playLabel: Label;
let CSSTag = 'css-playground';

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new CssPlaygroundModel();
	playLabel = page.getViewById('play');
}

export class CssPlaygroundModel extends Observable {
	currentCSS = [
		`width: 200;`,
		`font-size: 20;`,
		`background: #65adf1;`,
		`color: white;`,
		`box-shadow: 5 5;`,
		// `text-shadow: 2 2 red;`,
		`padding: 16;`,
	].join('\n');

	onTextChange(args) {
		this.currentCSS = args.value;
	}

	resetCSS() {
		console.log('reset css...');
		removeTaggedAdditionalCSS(CSSTag);

		playLabel._onCssStateChange();
		playLabel.requestLayout();
	}

	applyCSS(args) {
		this.resetCSS();
		addTaggedAdditionalCSS(`#play { ${this.currentCSS}`, CSSTag);
		playLabel._onCssStateChange();
		playLabel.requestLayout();
	}
}
