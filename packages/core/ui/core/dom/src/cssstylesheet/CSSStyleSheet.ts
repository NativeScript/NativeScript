import { addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from '../../../../styling/style-scope';

class CSSRuleList extends Array {}

class CSSRule {
	constructor(public cssText: string) {}
}

export class CSSStyleSheet {
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

	adoptStyles() {
		this.timestampTag = this.timestampTag || Date.now();
		const cssText = (this.cssRules as unknown as Array<CSSRule>).map((rule) => rule.cssText).join('');
		removeTaggedAdditionalCSS(this.timestampTag);
		addTaggedAdditionalCSS(cssText, this.timestampTag);
	}

	// Todo
	// Parse the ast
	// prefix with element tag so it becomes scoped.
	// private parseCSSAst() {
	// 	const cssText = (this.cssRules as unknown as Array<CSSRule>).map((rule) => rule.cssText).join('');
	// 	let ast;
	// 	if (cssText) {
	// 		if (__CSS_PARSER__ === 'css-tree') {
	// 			const cssTreeParse = require('../../../../../css/css-tree-parser').cssTreeParse;
	// 			ast = cssTreeParse(cssText);
	// 		} else if (__CSS_PARSER__ === 'nativescript') {
	// 			const CSS3Parser = require('../../../../../css/CSS3Parser').CSS3Parser;
	// 			const CSSNativeScript = require('../../../../../css/CSSNativeScript').CSSNativeScript;
	// 			const cssparser = new CSS3Parser(cssText);
	// 			const stylesheet = cssparser.parseAStylesheet();
	// 			const cssNS = new CSSNativeScript();
	// 			ast = cssNS.parseStylesheet(stylesheet);
	// 		} else if (__CSS_PARSER__ === 'rework') {
	// 			const parseCss = require('../../../../../css').parse;
	// 			ast = parseCss(cssText, { source: undefined });
	// 		}
	// 	}
	// 	return ast;
	// }
}
