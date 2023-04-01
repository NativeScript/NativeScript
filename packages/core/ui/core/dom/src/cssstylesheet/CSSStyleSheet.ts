import { addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from '../../../../styling/style-scope';

class CSSRuleList extends Array {}

class CSSRule {
	constructor(public cssText: string) {}
}

export class CSSStyleSheet {
	/**
	 * Style Scope of the CSSStyleSheet is
	 * shared across the app.
	 */
	//_scope: StyleScope;
	timestampTag: number;
	cssRules: CSSRuleList;
	ownerRule: CSSRule;
	get rules(): CSSRuleList {
		return this.cssRules;
	}
	addRule(selector?: string, style?: string, index?: number): number {
		return this.insertRule(`${selector} {${style}}`, index);
	}
	deleteRule(index: number): void {
		this.removeRule(index);
	}
	insertRule(rule: string, index?: number): number {
		if (typeof index !== 'number') index = -1;
		this.cssRules.splice(index, 0, new CSSRule(rule));
		return 0;
	}
	removeRule(index?: number): void {
		this.cssRules.splice(index, 1);
	}
	replace(text: string): Promise<CSSStyleSheet> {
		return new Promise((resolve) => {
			this.replaceSync(text);
			resolve(this);
		});
	}
	replaceSync(text: string): void {
		this.cssRules = [new CSSRule(text)];
		this.adoptStyles();
	}
	disabled: boolean;
	href: string;
	media: MediaList;
	ownerNode: globalThis.Element | ProcessingInstruction;
	parentStyleSheet: CSSStyleSheet;
	title: string;
	type: string;

	// get styleScope() {
	// 	if (this._scope) return this._scope;
	// 	this._scope = new StyleScope();
	// 	const cssText = (this.cssRules as unknown as Array<CSSRule>).map((rule) => rule.cssText).join('');
	// 	this._scope.addCss(cssText);
	// 	return this._scope;
	// }

	adoptStyles() {
		this.timestampTag = this.timestampTag || Date.now();
		const cssText = (this.cssRules as unknown as Array<CSSRule>).map((rule) => rule.cssText).join('');
		removeTaggedAdditionalCSS(this.timestampTag);
		addTaggedAdditionalCSS(cssText, this.timestampTag);
	}
}
