export interface CSSValue {
	type: string;
	string: string;
	unit?: string;
	value?: number;
}

export interface CommaToken {
	type: 'comma';
	string: ',';
}

export interface IdentToken {
	type: 'ident';
	string: string;
}

export interface NumberToken {
	type: 'number';
	string: string;
	unit: string;
	value: number;
}

export interface StringToken {
	type: 'string';
	quote: '"' | "'";
	string: string;
	value: string;
}

export type Token = CommaToken | IdentToken | NumberToken | StringToken;

/**
 * Parse a string into an array of tokens.
 */
export function parse(str: string): Token[] {
	return new Parser(str).parse();
}

class Parser {
	private str: string;

	constructor(str: string) {
		this.str = str;
	}

	private skip(match: RegExpExecArray): void {
		this.str = this.str.slice(match[0].length);
	}

	/** Comma tokens: "," */
	private comma(): CommaToken | undefined {
		const m = /^, */.exec(this.str);
		if (!m) return;
		this.skip(m);
		return { type: 'comma', string: ',' };
	}

	/** Identifier tokens: word or dash sequences */
	private ident(): IdentToken | undefined {
		const m = /^([\w-]+) */.exec(this.str);
		if (!m) return;
		this.skip(m);
		return { type: 'ident', string: m[1] };
	}

	/** Integer tokens, possibly with unit */
	private int(): NumberToken | undefined {
		const m = /^(([-+]?\d+)(\S+)?) */.exec(this.str);
		if (!m) return;
		this.skip(m);
		const n = parseInt(m[2], 10);
		const u = m[3] || '';
		return { type: 'number', string: m[1], unit: u, value: n };
	}

	/** Float tokens, possibly with unit */
	private float(): NumberToken | undefined {
		const m = /^(((?:[-+]?\d+)?\.\d+)(\S+)?) */.exec(this.str);
		if (!m) return;
		this.skip(m);
		const n = parseFloat(m[2]);
		const u = m[3] || '';
		return { type: 'number', string: m[1], unit: u, value: n };
	}

	/** Number tokens, either float or int */
	private number(): NumberToken | undefined {
		return this.float() || this.int();
	}

	/** Double-quoted strings */
	private double(): StringToken | undefined {
		const m = /^"([^"]*)" */.exec(this.str);
		if (!m) return;
		this.skip(m);
		return { type: 'string', quote: '"', string: `"${m[1]}"`, value: m[1] };
	}

	/** Single-quoted strings */
	private single(): StringToken | undefined {
		const m = /^'([^']*)' */.exec(this.str);
		if (!m) return;
		this.skip(m);
		return { type: 'string', quote: "'", string: `'${m[1]}'`, value: m[1] };
	}

	/** String tokens: single or double quoted */
	private string(): StringToken | undefined {
		return this.single() || this.double();
	}

	/** Attempt to parse any token */
	private value(): Token | undefined {
		return this.number() || this.ident() || this.string() || this.comma();
	}

	/** Run the full parse loop */
	public parse(): Token[] {
		const vals: Token[] = [];
		while (this.str.length > 0) {
			const obj = this.value();
			if (!obj) {
				throw new Error(`failed to parse near \`${this.str.slice(0, 10)}...\``);
			}
			vals.push(obj);
		}
		return vals;
	}
}
