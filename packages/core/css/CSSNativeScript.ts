import { InputToken, Stylesheet, Rule, AtRule, QualifiedRule } from './CSS3Parser';

/**
 * Consume a CSS3 parsed stylesheet and convert the rules and selectors to the
 * NativeScript internal JSON representation.
 */

export class CSSNativeScript {
	public parseStylesheet(stylesheet: Stylesheet): any {
		return {
			type: 'stylesheet',
			stylesheet: {
				rules: this.parseRules(stylesheet.rules),
			},
		};
	}

	private parseRules(rules: Rule[]): any {
		return rules.map((rule) => this.parseRule(rule));
	}

	private parseRule(rule: Rule): any {
		if (rule.type === 'at-rule') {
			return this.parseAtRule(rule);
		} else if (rule.type === 'qualified-rule') {
			return this.parseQualifiedRule(rule);
		}
	}

	private parseAtRule(rule: AtRule): any {
		if (rule.name === 'import') {
			// TODO: We have used an "@import { url('path somewhere'); }" at few places.
			return {
				import: rule.prelude
					.map((m) => (typeof m === 'string' ? m : m.text))
					.join('')
					.trim(),
				type: 'import',
			};
		}

		return;
	}

	private parseQualifiedRule(rule: QualifiedRule): any {
		return {
			type: 'rule',
			selectors: this.preludeToSelectorsStringArray(rule.prelude),
			declarations: this.ruleBlockToDeclarations(rule.block.values),
		};
	}

	private ruleBlockToDeclarations(declarationsInputTokens: InputToken[]): { type: 'declaration'; property: string; value: string; }[] {
		// return <any>declarationsInputTokens;
		const declarations: {
			type: 'declaration';
			property: string;
			value: string;
		}[] = [];

		let property = '';
		let value = '';
		let reading: 'property' | 'value' = 'property';

		for (let i = 0; i < declarationsInputTokens.length; i++) {
			const inputToken = declarationsInputTokens[i];
			if (reading === 'property') {
				if (inputToken === ':') {
					reading = 'value';
				} else if (typeof inputToken === 'string') {
					property += inputToken;
				} else {
					property += inputToken.text;
				}
			} else {
				if (inputToken === ';') {
					property = property.trim();
					value = value.trim();
					declarations.push({ type: 'declaration', property, value });
					property = '';
					value = '';
					reading = 'property';
				} else if (typeof inputToken === 'string') {
					value += inputToken;
				} else {
					value += inputToken.text;
				}
			}
		}
		property = property.trim();
		value = value.trim();
		if (property || value) {
			declarations.push({ type: 'declaration', property, value });
		}

		return declarations;
	}

	private preludeToSelectorsStringArray(prelude: InputToken[]): string[] {
		const selectors = [];
		let selector = '';
		prelude.forEach((inputToken) => {
			if (typeof inputToken === 'string') {
				if (inputToken === ',') {
					if (selector) {
						selectors.push(selector.trim());
					}
					selector = '';
				} else {
					selector += inputToken;
				}
			} else if (typeof inputToken === 'object') {
				selector += inputToken.text;
			}
		});
		if (selector) {
			selectors.push(selector.trim());
		}

		return selectors;
	}
}
