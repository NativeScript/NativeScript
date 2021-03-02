
export interface Stylesheet {
	rules: Rule[];
}
export type Rule = QualifiedRule | AtRule;

export interface AtRule {
	type: 'at-rule';
	name: string;
	prelude: InputToken[];
	block: SimpleBlock;
}
export interface QualifiedRule {
	type: 'qualified-rule';
	prelude: InputToken[];
	block: SimpleBlock;
}

// const nonQuoteURLRegEx = /(:?[^\)\s\t\n\r\f\'\"\(]|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*/gym; // TODO: non-printable code points omitted

export type InputToken = '(' | ')' | '{' | '}' | '[' | ']' | ':' | ';' | ',' | ' ' | '^=' | '|=' | '$=' | '*=' | '~=' | '<!--' | '-->' | undefined | /* <EOF-token> */ InputTokenObject | FunctionInputToken | FunctionToken | SimpleBlock | AtKeywordToken;

export const enum TokenObjectType {
	/**
	 * <string-token>
	 */
	string = 1,
	/**
	 * <delim-token>
	 */
	delim = 2,
	/**
	 * <number-token>
	 */
	number = 3,
	/**
	 * <percentage-token>
	 */
	percentage = 4,
	/**
	 * <dimension-token>
	 */
	dimension = 5,
	/**
	 * <ident-token>
	 */
	ident = 6,
	/**
	 * <url-token>
	 */
	url = 7,
	/**
	 * <function-token>
	 * This is a token indicating a function's leading: <ident-token>(
	 */
	functionToken = 8,
	/**
	 * <simple-block>
	 */
	simpleBlock = 9,
	/**
	 * <comment-token>
	 */
	comment = 10,
	/**
	 * <at-keyword-token>
	 */
	atKeyword = 11,
	/**
	 * <hash-token>
	 */
	hash = 12,
	/**
	 * <function>
	 * This is a complete consumed function: <function-token>([<component-value> [, <component-value>]*])")"
	 */
	function = 14,
}

export interface InputTokenObject {
	type: TokenObjectType;
	text: string;
}

/**
 * This is a "<ident>(" token.
 */
export interface FunctionInputToken extends InputTokenObject {
	name: string;
}

/**
 * This is a completely parsed function like "<ident>([component [, component]*])".
 */
export interface FunctionToken extends FunctionInputToken {
	components: any[];
}

export interface SimpleBlock extends InputTokenObject {
	associatedToken: InputToken;
	values: InputToken[];
}

export type AtKeywordToken = InputTokenObject;

const commentRegEx = /(\/\*(?:[^\*]|\*[^\/])*\*\/)/gmy;
// eslint-disable-next-line no-control-regex
const nameRegEx = /-?(?:(?:[a-zA-Z_]|[^\x00-\x7F]|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))(?:[a-zA-Z_0-9\-]*|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*)/gmy;
const numberRegEx = /[\+\-]?(?:\d+\.\d+|\d+|\.\d+)(?:[eE][\+\-]?\d+)?/gmy;
const doubleQuoteStringRegEx = /"((?:[^\n\r\f\"]|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*)(:?"|$)/gmy; // Besides $n, parse escape

const whitespaceRegEx = /[\s\t\n\r\f]*/gmy;

const singleQuoteStringRegEx = /'((?:[^\n\r\f\']|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*)(:?'|$)/gmy; // Besides $n, parse escape

/**
 * CSS parser following relatively close:
 * CSS Syntax Module Level 3
 * https://www.w3.org/TR/css-syntax-3/
 */

export class CSS3Parser {
	private nextInputCodePointIndex = 0;
	private reconsumedInputToken: InputToken;
	private topLevelFlag: boolean;

	constructor(private text: string) { }

	/**
	 * For testing purposes.
	 * This method allows us to run and assert the proper working of the tokenizer.
	 */
	tokenize(): InputToken[] {
		const tokens: InputToken[] = [];
		let inputToken: InputToken;
		do {
			inputToken = this.consumeAToken();
			tokens.push(inputToken);
		} while (inputToken);

		return tokens;
	}

	/**
	 * 4.3.1. Consume a token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-token
	 */
	private consumeAToken(): InputToken {
		if (this.reconsumedInputToken) {
			const result = this.reconsumedInputToken;
			this.reconsumedInputToken = null;

			return result;
		}
		const char = this.text[this.nextInputCodePointIndex];
		switch (char) {
			case '"':
				return this.consumeAStringToken();
			case "'":
				return this.consumeAStringToken();
			case '(':
			case ')':
			case ',':
			case ':':
			case ';':
			case '[':
			case ']':
			case '{':
			case '}':
				this.nextInputCodePointIndex++;

				return <any>char;
			case '#':
				return this.consumeAHashToken() || this.consumeADelimToken();
			case ' ':
			case '\t':
			case '\n':
			case '\r':
			case '\f':
				return this.consumeAWhitespace();
			case '@':
				return this.consumeAtKeyword() || this.consumeADelimToken();
			// TODO: Only if this is valid escape, otherwise it is a parse error
			case '\\':
				return this.consumeAnIdentLikeToken() || this.consumeADelimToken();
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				return this.consumeANumericToken();
			case 'u':
			case 'U':
				if (this.text[this.nextInputCodePointIndex + 1] === '+') {
					const thirdChar = this.text[this.nextInputCodePointIndex + 2];
					if ((thirdChar >= '0' && thirdChar <= '9') || thirdChar === '?') {
						// TODO: Handle unicode stuff such as U+002B
						throw new Error('Unicode tokens not supported!');
					}
				}

				return this.consumeAnIdentLikeToken() || this.consumeADelimToken();
			case '$':
			case '*':
			case '^':
			case '|':
			case '~':
				return this.consumeAMatchToken() || this.consumeADelimToken();
			case '-':
				return this.consumeANumericToken() || this.consumeAnIdentLikeToken() || this.consumeCDC() || this.consumeADelimToken();
			case '+':
			case '.':
				return this.consumeANumericToken() || this.consumeADelimToken();
			case '/':
				return this.consumeAComment() || this.consumeADelimToken();
			case '<':
				return this.consumeCDO() || this.consumeADelimToken();
			case undefined:
				return undefined;
			default:
				return this.consumeAnIdentLikeToken() || this.consumeADelimToken();
		}
	}

	private consumeADelimToken(): InputToken {
		return {
			type: TokenObjectType.delim,
			text: this.text[this.nextInputCodePointIndex++],
		};
	}

	private consumeAWhitespace(): InputToken {
		whitespaceRegEx.lastIndex = this.nextInputCodePointIndex;
		whitespaceRegEx.exec(this.text);
		this.nextInputCodePointIndex = whitespaceRegEx.lastIndex;

		return ' ';
	}

	private consumeAHashToken(): InputTokenObject {
		this.nextInputCodePointIndex++;
		const hashName = this.consumeAName();
		if (hashName) {
			return { type: TokenObjectType.hash, text: '#' + hashName.text };
		}
		this.nextInputCodePointIndex--;

		return null;
	}

	private consumeCDO(): '<!--' | null {
		if (this.text.substr(this.nextInputCodePointIndex, 4) === '<!--') {
			this.nextInputCodePointIndex += 4;

			return '<!--';
		}

		return null;
	}

	private consumeCDC(): '-->' | null {
		if (this.text.substr(this.nextInputCodePointIndex, 3) === '-->') {
			this.nextInputCodePointIndex += 3;

			return '-->';
		}

		return null;
	}

	private consumeAMatchToken(): '*=' | '$=' | '|=' | '~=' | '^=' | null {
		if (this.text[this.nextInputCodePointIndex + 1] === '=') {
			const token = this.text.substr(this.nextInputCodePointIndex, 2);
			this.nextInputCodePointIndex += 2;

			return <'*=' | '$=' | '|=' | '~=' | '^='>token;
		}

		return null;
	}

	/**
	 * 4.3.2. Consume a numeric token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-numeric-token
	 */
	private consumeANumericToken(): InputToken {
		numberRegEx.lastIndex = this.nextInputCodePointIndex;
		const result = numberRegEx.exec(this.text);
		if (!result) {
			return null;
		}
		this.nextInputCodePointIndex = numberRegEx.lastIndex;
		if (this.text[this.nextInputCodePointIndex] === '%') {
			return { type: TokenObjectType.percentage, text: result[0] }; // TODO: Push the actual number and unit here...
		}

		const name = this.consumeAName();
		if (name) {
			return {
				type: TokenObjectType.dimension,
				text: result[0] + name.text,
			};
		}

		return { type: TokenObjectType.number, text: result[0] };
	}

	/**
	 * 4.3.3. Consume an ident-like token
	 * https://www.w3.org/TR/css-syntax-3/#consume-an-ident-like-token
	 */
	private consumeAnIdentLikeToken(): InputToken {
		const name = this.consumeAName();
		if (!name) {
			return null;
		}
		if (this.text[this.nextInputCodePointIndex] === '(') {
			this.nextInputCodePointIndex++;
			if (name.text.toLowerCase() === 'url') {
				return this.consumeAURLToken();
			}

			return <FunctionInputToken>{
				type: TokenObjectType.functionToken,
				name: name.text,
				text: name.text + '(',
			};
		}

		return name;
	}

	/**
	 * 4.3.4. Consume a string token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-string-token
	 */
	private consumeAStringToken(): InputTokenObject {
		const char = this.text[this.nextInputCodePointIndex];
		let result: RegExpExecArray;
		if (char === "'") {
			singleQuoteStringRegEx.lastIndex = this.nextInputCodePointIndex;
			result = singleQuoteStringRegEx.exec(this.text);
			if (!result) {
				return null;
			}
			this.nextInputCodePointIndex = singleQuoteStringRegEx.lastIndex;
		} else if (char === '"') {
			doubleQuoteStringRegEx.lastIndex = this.nextInputCodePointIndex;
			result = doubleQuoteStringRegEx.exec(this.text);
			if (!result) {
				return null;
			}
			this.nextInputCodePointIndex = doubleQuoteStringRegEx.lastIndex;
		}

		// TODO: Handle bad-string.
		// TODO: Perform string escaping.
		return { type: TokenObjectType.string, text: result[0] };
	}

	/**
	 * 4.3.5. Consume a url token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-url-token
	 */
	private consumeAURLToken(): InputToken {
		const start = this.nextInputCodePointIndex - 3 /* url */ - 1; /* ( */
		const urlToken: InputToken = {
			type: TokenObjectType.url,
			text: undefined,
		};
		this.consumeAWhitespace();
		if (this.nextInputCodePointIndex >= this.text.length) {
			return urlToken;
		}
		const nextInputCodePoint = this.text[this.nextInputCodePointIndex];
		if (nextInputCodePoint === '"' || nextInputCodePoint === "'") {
			const stringToken = this.consumeAStringToken();
			// TODO: Handle bad-string.
			// TODO: Set value instead.
			urlToken.text = stringToken.text;
			this.consumeAWhitespace();
			if (this.text[this.nextInputCodePointIndex] === ')' || this.nextInputCodePointIndex >= this.text.length) {
				this.nextInputCodePointIndex++;
				const end = this.nextInputCodePointIndex;
				urlToken.text = this.text.substring(start, end);

				return urlToken;
			} else {
				// TODO: Handle bad-url.
				return null;
			}
		}

		while (this.nextInputCodePointIndex < this.text.length) {
			const char = this.text[this.nextInputCodePointIndex++];
			switch (char) {
				case ')':
					return urlToken;
				case ' ':
				case '\t':
				case '\n':
				case '\r':
				case '\f':
					this.consumeAWhitespace();
					if (this.text[this.nextInputCodePointIndex] === ')') {
						this.nextInputCodePointIndex++;

						return urlToken;
					} else {
						// TODO: Bar url! Consume remnants.
						return null;
					}
				case '"':
				case "'":
					// TODO: Parse error! Bar url! Consume remnants.
					return null;
				case '\\':
					// TODO: Escape!
					throw new Error('Escaping not yet supported!');
				default:
					// TODO: Non-printable chars - error.
					urlToken.text += char;
			}
		}

		return urlToken;
	}

	/**
	 * 4.3.11. Consume a name
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-name
	 */
	private consumeAName(): InputTokenObject {
		nameRegEx.lastIndex = this.nextInputCodePointIndex;
		const result = nameRegEx.exec(this.text);
		if (!result) {
			return null;
		}
		this.nextInputCodePointIndex = nameRegEx.lastIndex;

		// TODO: Perform string escaping.
		return { type: TokenObjectType.ident, text: result[0] };
	}

	private consumeAtKeyword(): InputTokenObject {
		this.nextInputCodePointIndex++;
		const name = this.consumeAName();
		if (name) {
			return { type: TokenObjectType.atKeyword, text: name.text };
		}
		this.nextInputCodePointIndex--;

		return null;
	}

	private consumeAComment(): InputToken {
		if (this.text[this.nextInputCodePointIndex + 1] === '*') {
			commentRegEx.lastIndex = this.nextInputCodePointIndex;
			const result = commentRegEx.exec(this.text);
			if (!result) {
				return null; // TODO: Handle <bad-comment>
			}
			this.nextInputCodePointIndex = commentRegEx.lastIndex;

			// The CSS spec tokenizer does not emmit comment tokens
			return this.consumeAToken();
		}

		return null;
	}

	private reconsumeTheCurrentInputToken(currentInputToken: InputToken) {
		this.reconsumedInputToken = currentInputToken;
	}

	/**
	 * 5.3.1. Parse a stylesheet
	 * https://www.w3.org/TR/css-syntax-3/#parse-a-stylesheet
	 */
	public parseAStylesheet(): Stylesheet {
		this.topLevelFlag = true;
		return {
			rules: this.consumeAListOfRules(),
		};
	}

	/**
	 * 5.4.1. Consume a list of rules
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-list-of-rules
	 */
	public consumeAListOfRules(): Rule[] {
		const rules: Rule[] = [];
		let inputToken: InputToken;
		while ((inputToken = this.consumeAToken())) {
			switch (inputToken) {
				case ' ':
					continue;
				case '<!--':
				case '-->': {
					if (this.topLevelFlag) {
						continue;
					}
					this.reconsumeTheCurrentInputToken(inputToken);
					const atRule = this.consumeAnAtRule();
					if (atRule) {
						rules.push(atRule);
					}
					continue;
				}
			}
			if ((<InputTokenObject>inputToken).type === TokenObjectType.atKeyword) {
				this.reconsumeTheCurrentInputToken(inputToken);
				const atRule = this.consumeAnAtRule();
				if (atRule) {
					rules.push(atRule);
				}
				continue;
			}
			this.reconsumeTheCurrentInputToken(inputToken);
			const qualifiedRule = this.consumeAQualifiedRule();
			if (qualifiedRule) {
				rules.push(qualifiedRule);
			}
		}

		return rules;
	}

	/**
	 * 5.4.2. Consume an at-rule
	 * https://www.w3.org/TR/css-syntax-3/#consume-an-at-rule
	 */
	public consumeAnAtRule(): AtRule {
		let inputToken = this.consumeAToken();
		const atRule: AtRule = {
			type: 'at-rule',
			name: (<AtKeywordToken>inputToken).text,
			prelude: [],
			block: undefined,
		};
		while ((inputToken = this.consumeAToken())) {
			if (inputToken === ';') {
				return atRule;
			} else if (inputToken === '{') {
				atRule.block = this.consumeASimpleBlock(inputToken);

				return atRule;
			} else if ((<InputTokenObject>inputToken).type === TokenObjectType.simpleBlock && (<SimpleBlock>inputToken).associatedToken === '{') {
				atRule.block = <SimpleBlock>inputToken;

				return atRule;
			}
			this.reconsumeTheCurrentInputToken(inputToken);
			const component = this.consumeAComponentValue();
			if (component) {
				atRule.prelude.push(component);
			}
		}

		return atRule;
	}

	/**
	 * 5.4.3. Consume a qualified rule
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-qualified-rule
	 */
	public consumeAQualifiedRule(): QualifiedRule {
		const qualifiedRule: QualifiedRule = {
			type: 'qualified-rule',
			prelude: [],
			block: undefined,
		};
		let inputToken: InputToken;
		while ((inputToken = this.consumeAToken())) {
			if (inputToken === '{') {
				qualifiedRule.block = this.consumeASimpleBlock(inputToken);

				return qualifiedRule;
			} else if ((<InputTokenObject>inputToken).type === TokenObjectType.simpleBlock) {
				const simpleBlock: SimpleBlock = <SimpleBlock>inputToken;
				if (simpleBlock.associatedToken === '{') {
					qualifiedRule.block = simpleBlock;

					return qualifiedRule;
				}
			}
			this.reconsumeTheCurrentInputToken(inputToken);
			const componentValue = this.consumeAComponentValue();
			if (componentValue) {
				qualifiedRule.prelude.push(componentValue);
			}
		}

		// TODO: This is a parse error, log parse errors!
		return null;
	}

	/**
	 * 5.4.6. Consume a component value
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-component-value
	 */
	private consumeAComponentValue(): InputToken {
		// const inputToken = this.consumeAToken();
		const inputToken = this.consumeAToken();
		switch (inputToken) {
			case '{':
			case '[':
			case '(':
				this.nextInputCodePointIndex++;

				return this.consumeASimpleBlock(inputToken);
		}
		if (typeof inputToken === 'object' && inputToken.type === TokenObjectType.functionToken) {
			return this.consumeAFunction((<FunctionInputToken>inputToken).name);
		}

		return inputToken;
	}

	/**
	 * 5.4.7. Consume a simple block
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-simple-block
	 */
	private consumeASimpleBlock(associatedToken: InputToken): SimpleBlock {
		const endianToken: ']' | '}' | ')' = {
			'[': ']',
			'{': '}',
			'(': ')',
		}[<any>associatedToken];
		const start = this.nextInputCodePointIndex - 1;
		const block: SimpleBlock = {
			type: TokenObjectType.simpleBlock,
			text: undefined,
			associatedToken,
			values: [],
		};
		let nextInputToken;
		while ((nextInputToken = this.text[this.nextInputCodePointIndex])) {
			if (nextInputToken === endianToken) {
				this.nextInputCodePointIndex++;
				const end = this.nextInputCodePointIndex;
				block.text = this.text.substring(start, end);

				return block;
			}
			const value = this.consumeAComponentValue();
			if (value) {
				block.values.push(value);
			}
		}
		block.text = this.text.substring(start);

		return block;
	}

	/**
	 * 5.4.8. Consume a function
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-function
	 */
	private consumeAFunction(name: string): InputToken {
		const start = this.nextInputCodePointIndex;
		const funcToken: FunctionToken = {
			type: TokenObjectType.function,
			name,
			text: undefined,
			components: [],
		};
		do {
			if (this.nextInputCodePointIndex >= this.text.length) {
				funcToken.text = name + '(' + this.text.substring(start);

				return funcToken;
			}
			const nextInputToken = this.text[this.nextInputCodePointIndex];
			switch (nextInputToken) {
				case ')': {
					this.nextInputCodePointIndex++;
					const end = this.nextInputCodePointIndex;
					funcToken.text = name + '(' + this.text.substring(start, end);

					return funcToken;
				}
				default: {
					const component = this.consumeAComponentValue();
					if (component) {
						funcToken.components.push(component);
					}
				}
				// TODO: Else we won't advance
			}
		} while (true);
	}
}
