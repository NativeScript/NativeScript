// easysax 0.1.14, https://github.com/vflash/easysax
// Copyright (c) 2012 Vopilovskii Constantine, MIT License (see LICENSE in this folder).

export interface EasySAXPosition {
	line: number;
	column: number;
}

/** Resolves the line and column of the event's position when called. */
export type EasySAXPositionGetter = () => EasySAXPosition;

/** Decodes entity references in the given text. */
export type EasySAXUnEntities = (s: unknown) => string;

/**
 * The parsed attributes of a start tag: a hash of name to raw (entity-encoded) value,
 * `true` when the tag has none, `false` when they are malformed.
 */
export type EasySAXAttributes = Record<string, string> | boolean;

type ErrorHandler = (msg: string, position: EasySAXPositionGetter) => unknown;
type StartNodeHandler = (elem: string, attr: () => EasySAXAttributes, uq: EasySAXUnEntities, tagend: boolean, getStringNode: () => string, position: EasySAXPositionGetter) => unknown;
type EndNodeHandler = (elem: string, uq: EasySAXUnEntities, tagstart: boolean, getStringNode: () => string, position: EasySAXPositionGetter) => unknown;
type TextNodeHandler = (text: string, uq: EasySAXUnEntities, position: EasySAXPositionGetter) => unknown;
type CDATAHandler = (data: string, res: boolean, position: EasySAXPositionGetter) => unknown;
type CommentHandler = (text: string, uq: EasySAXUnEntities, position: EasySAXPositionGetter) => unknown;
type QuestionHandler = (text: string, position: EasySAXPositionGetter) => unknown;
type AttentionHandler = (text: string, uq: EasySAXUnEntities, position: EasySAXPositionGetter) => unknown;

// Prefix -> namespace alias; `xmlns` holds the default namespace. `false` masks an inherited prefix.
type NsMatrix = Record<string, string | false | null>;

function nullFunc(): void {}

// Clearing these handlers with `null` throws in easysax 0.1.14 (its fallback is out of scope there).
function handlerOrThrow(cb: Function | null): Function {
	if (!cb) {
		throw new ReferenceError('nullFunc is not defined');
	}
	return cb;
}

// Shadows Object.prototype's names so `&constructor;` and friends decode to '\x01' instead of a builtin.
const xharsQuot: Record<string, string> = {
	constructor: '',
	hasOwnProperty: '',
	isPrototypeOf: '',
	propertyIsEnumerable: '',
	toLocaleString: '',
	toString: '',
	valueOf: '',
	quot: '"',
	QUOT: '"',
	amp: '&',
	AMP: '&',
	nbsp: '\u00A0',
	apos: "'",
	lt: '<',
	LT: '<',
	gt: '>',
	GT: '>',
	copy: '\u00A9',
	laquo: '\u00AB',
	raquo: '\u00BB',
	reg: '\u00AE',
	deg: '\u00B0',
	plusmn: '\u00B1',
	sup2: '\u00B2',
	sup3: '\u00B3',
	micro: '\u00B5',
	para: '\u00B6',
};

function rpEntities(s: string, d: string | undefined, x: string | undefined, z: string | undefined): string {
	if (z) {
		return xharsQuot[z] || '\x01';
	}

	if (d) {
		return String.fromCodePoint(Number(d));
	}

	return String.fromCodePoint(parseInt(x as string, 16));
}

function unEntities(value: unknown): string {
	let s: string = String(value);
	if (s.length > 3 && s.indexOf('&') !== -1) {
		if (s.indexOf('&gt;') !== -1) s = s.replace(/&gt;/g, '>');
		if (s.indexOf('&lt;') !== -1) s = s.replace(/&lt;/g, '<');
		if (s.indexOf('&quot;') !== -1) s = s.replace(/&quot;/g, '"');

		if (s.indexOf('&') !== -1) {
			s = s.replace(/&#(\d+);|&#x([0123456789abcdef]+);|&(\w+);/gi, rpEntities);
		}
	}

	return s;
}

export class EasySAXParser {
	public angularSyntax: boolean = false;

	private onTextNode: TextNodeHandler = nullFunc;
	private onStartNode: StartNodeHandler = nullFunc;
	private onEndNode: EndNodeHandler = nullFunc;
	private onCDATA: CDATAHandler = nullFunc;
	private onError: ErrorHandler = nullFunc;
	private onComment: CommentHandler | null = null;
	private onQuestion: QuestionHandler | null = null;
	private onAttention: AttentionHandler | null = null;
	private is_onComment: boolean = false;
	private is_onQuestion: boolean = false;
	private is_onAttention: boolean = false;

	private isNamespace: boolean = false;
	private useNS: Record<string, string> | null = null;
	private default_xmlns: string | null = null;
	private xmlns: string | null = null;
	// Not reset between parse() calls: a parse that stops inside a namespaced element leaves its scope behind.
	private nsmatrix: NsMatrix = { xmlns: this.xmlns };
	// Set while the start tag is pre-scanned for xmlns declarations, so getAttrs() applies them first.
	private hasSurmiseNS: boolean = false;

	private attr_string: string = '';
	private attr_posstart: number = 0;
	// Cached getAttrs() result for the current tag; null means not parsed yet.
	private attr_res: EasySAXAttributes | null | undefined;

	public on(name: string, cb: Function | null): void {
		if (typeof cb !== 'function') {
			if (cb !== null) return;
		}

		switch (name) {
			case 'error':
				this.onError = handlerOrThrow(cb) as ErrorHandler;
				break;
			case 'startNode':
				this.onStartNode = handlerOrThrow(cb) as StartNodeHandler;
				break;
			case 'endNode':
				this.onEndNode = handlerOrThrow(cb) as EndNodeHandler;
				break;
			case 'textNode':
				this.onTextNode = handlerOrThrow(cb) as TextNodeHandler;
				break;
			case 'cdata':
				this.onCDATA = handlerOrThrow(cb) as CDATAHandler;
				break;

			case 'comment':
				this.onComment = cb as CommentHandler | null;
				this.is_onComment = !!cb;
				break;
			// <? ... ?>
			case 'question':
				this.onQuestion = cb as QuestionHandler | null;
				this.is_onQuestion = !!cb;
				break;
			// <!XXXXX zzzz="eeee">
			case 'attention':
				this.onAttention = cb as AttentionHandler | null;
				this.is_onAttention = !!cb;
				break;
		}
	}

	/**
	 * Enables namespace resolution. `ns` maps namespace URIs to aliases; `root` must be one of the aliases.
	 * Elements outside a known namespace, and everything inside them, emit no events.
	 */
	public ns(root: string, ns: Record<string, unknown>): void {
		if (!root || typeof root !== 'string' || !ns) {
			return;
		}

		const x: Record<string, string> = {};
		let ok: boolean = false;

		for (const i in ns) {
			const v: unknown = ns[i];
			if (typeof v === 'string') {
				if (root === v) ok = true;
				x[i] = v;
			}
		}

		if (ok) {
			this.isNamespace = true;
			this.default_xmlns = root;
			this.useNS = x;
		}
	}

	private allowedAngularAttributeChars(w: number): boolean {
		if (!this.angularSyntax) {
			return false;
		} else {
			return (
				w === 40 || // (
				w === 41 || // )
				w === 91 || // [
				w === 93 || // ]
				w === 94 || // ^
				w === 35 // #
			);
		}
	}

	private copyNsMatrix(): NsMatrix {
		const nn: NsMatrix = {};
		for (const n in this.nsmatrix) nn[n] = this.nsmatrix[n];
		return nn;
	}

	/**
	 * Parses the current tag's attributes on demand, caching the result. Never throws:
	 * returns false on a parse error, true when there are no attributes, otherwise the hash.
	 */
	private getAttrs(): EasySAXAttributes | null | undefined {
		if (this.attr_res !== null) {
			return this.attr_res;
		}

		const res: Record<string, string> = {};
		const s: string = this.attr_string;
		let i: number = this.attr_posstart;
		const l: number = s.length;
		const attr_list: string[] = [];
		let name: string = '';
		let value: string = '';
		let ok: boolean = false;
		let noValueAttribute: boolean = false;
		let j: number = 0;
		let w: number = 0;
		let c: number = 0;
		let prefixed: boolean = false;
		let hasNewMatrix: boolean = false;
		let alias: string | false | null = null;
		let newalias: string = '';

		for (; i < l; i++) {
			w = s.charCodeAt(i);

			if (w === 32 || (w < 14 && w > 8)) {
				// \f\n\r\t\v
				continue;
			}

			if ((w < 65 && !this.allowedAngularAttributeChars(w)) || w > 122 || (w > 90 && w < 97 && !this.allowedAngularAttributeChars(w))) {
				this.attr_res = false;
				return false;
			}

			for (j = i + 1; j < l; j++) {
				w = s.charCodeAt(j);

				if ((w > 96 && w < 123) || (w > 64 && w < 91) || (w > 47 && w < 59) || w === 45 || w === 95 || w === 46 /* https://github.com/telerik/xPlatCore/issues/179 */) {
					if (noValueAttribute) {
						// The next attribute has started: step back so the outer loop picks it up.
						j--;
						break;
					} else {
						continue;
					}
				}

				if (this.allowedAngularAttributeChars(w)) {
					continue;
				}

				if (w === 32 || (w > 8 && w < 14)) {
					noValueAttribute = true;
					continue;
				} else if (w === 61) {
					// "="
					noValueAttribute = false;
					break;
				} else {
					if (!noValueAttribute) {
						this.attr_res = false;
						return false;
					}
				}

				break;
			}

			name = s.substring(i, j).trim();
			ok = true;

			if (name === 'xmlns:xmlns') {
				this.attr_res = false;
				return false;
			}

			w = s.charCodeAt(j + 1);
			while (w === 32 || (w > 8 && w < 14)) {
				j++;
				w = s.charCodeAt(j + 1);
			}

			if (!noValueAttribute) {
				if (w === 34) {
					// '"'
					i = j + 2;
					j = s.indexOf('"', i);
				} else if (w === 39) {
					// "'"
					i = j + 2;
					j = s.indexOf("'", i);
				} else {
					this.attr_res = false;
					return false;
				}
			}

			if (j === -1) {
				this.attr_res = false;
				return false;
			}

			if (j + 1 < l && !noValueAttribute) {
				w = s.charCodeAt(j + 1);

				if (w > 32 || w < 9 || (w < 32 && w > 13)) {
					this.attr_res = false;
					return false;
				}
			}

			if (noValueAttribute) {
				value = '';
			} else {
				value = s.substring(i, j);
			}

			// The character after j was checked above, so the loop's i++ resumes past it.
			i = j;

			if (this.isNamespace) {
				if (this.hasSurmiseNS) {
					// Pre-scan: apply xmlns declarations first, resolve the other names after the loop.
					newalias = '';
					if (name === 'xmlns') {
						newalias = 'xmlns';
					} else if (name.charCodeAt(0) === 120 && name.substr(0, 6) === 'xmlns:') {
						newalias = name.substr(6);
					}

					if (newalias) {
						alias = (this.useNS as Record<string, string>)[unEntities(value)];

						if (alias) {
							if (this.nsmatrix[newalias] !== alias) {
								if (!hasNewMatrix) {
									hasNewMatrix = true;
									this.nsmatrix = this.copyNsMatrix();
								}

								this.nsmatrix[newalias] = alias;
							}
						} else {
							if (this.nsmatrix[newalias]) {
								if (!hasNewMatrix) {
									hasNewMatrix = true;
									this.nsmatrix = this.copyNsMatrix();
								}

								this.nsmatrix[newalias] = false;
							}
						}

						res[name] = value;
						continue;
					}

					attr_list.push(name, value);
					continue;
				}

				// Kept as `--c !== 0`: an empty name (possible only with ns()) never ends this loop, as in easysax 0.1.14.
				prefixed = false;
				c = name.length;
				while (--c !== 0) {
					if (name.charCodeAt(c) === 58) {
						// ':'
						alias = this.nsmatrix[name.substring(0, c)];
						if (alias) {
							// substr() coerces the alias to a number (NaN -> 0), so the key keeps the prefixed name.
							res[alias + name.substr(Number(alias))] = value;
						}
						prefixed = true;
						break;
					}
				}
				if (prefixed) {
					continue;
				}
			}

			res[name] = value;
			noValueAttribute = false;
		}

		if (!ok) {
			this.attr_res = true;
			return true;
		}

		if (this.hasSurmiseNS) {
			for (let k: number = 0, kl: number = attr_list.length; k < kl; k++) {
				name = attr_list[k++];

				prefixed = false;
				c = name.length;
				while (--c !== 0) {
					if (name.charCodeAt(c) === 58) {
						// ':'
						alias = this.nsmatrix[name.substring(0, c)];
						if (alias) {
							res[alias + name.substr(Number(alias))] = attr_list[k];
						}
						prefixed = true;
						break;
					}
				}
				if (prefixed) {
					continue;
				}

				res[name] = attr_list[k];
			}
		}

		this.attr_res = res;
		return res;
	}

	public parse(input: string): void {
		const xml: string = String(input);
		const nodestack: string[] = [];
		const stacknsmatrix: NsMatrix[] = [];
		let elem: string = '';
		let tagend: boolean = false;
		let tagstart: boolean = false;
		let j: number = 0;
		let i: number = 0;
		let k: number = 0;
		let x: string = '';
		let y: number = 0;
		let q: number = 0;
		let w: number = 0;
		let c: number = 0;
		let inside: number = 0;
		let xmlns: string | false | null = null;
		let stopIndex: number = 0;
		// Inside an element of an unknown namespace: no events until it closes.
		let stop: boolean = false;
		let _nsmatrix: NsMatrix = this.nsmatrix;
		let ok: unknown = undefined;
		let pos: number = 0;
		let ln: number = 0;
		let lnStart: number = -2;
		let lnEnd: number = -1;

		const len: number = xml.length;

		// Handlers may call these later; they read the parser's state at call time.
		const getStringNode = (): string => {
			return xml.substring(i, j + 1);
		};
		const findLineAndColumnFromPos = (): EasySAXPosition => {
			while (lnStart < lnEnd && lnEnd < pos) {
				lnStart = lnEnd;
				lnEnd = xml.indexOf('\n', lnEnd + 1);
				++ln;
			}
			return { line: ln, column: pos - lnStart };
		};
		const position = (p: number): EasySAXPositionGetter => {
			pos = p;
			return findLineAndColumnFromPos;
		};

		while (j !== -1) {
			stop = stopIndex > 0;

			if (xml.charCodeAt(j) === 60) {
				// "<"
				i = j;
			} else {
				i = xml.indexOf('<', j);
			}

			if (i === -1) {
				if (nodestack.length) {
					this.onError('end file', position(j));
					return;
				}

				return;
			}

			if (j !== i && !stop) {
				ok = this.onTextNode(xml.substring(j, i), unEntities, position(j));
				if (ok === false) return;
			}

			w = xml.charCodeAt(i + 1);

			if (w === 33) {
				// "!"
				w = xml.charCodeAt(i + 2);
				if (w === 91 && xml.substr(i + 3, 6) === 'CDATA[') {
					// "["
					j = xml.indexOf(']]>', i);
					if (j === -1) {
						this.onError('cdata', position(i));
						return;
					}

					if (!stop) {
						ok = this.onCDATA(xml.substring(i + 9, j), false, position(i));
						if (ok === false) return;
					}

					j += 3;
					continue;
				}

				if (w === 45 && xml.charCodeAt(i + 3) === 45) {
					// "-"
					j = xml.indexOf('-->', i);
					if (j === -1) {
						this.onError('expected -->', position(i));
						return;
					}

					if (this.is_onComment && !stop) {
						ok = this.onComment!(xml.substring(i + 4, j), unEntities, position(i));
						if (ok === false) return;
					}

					j += 3;
					continue;
				}

				j = xml.indexOf('>', i + 1);
				if (j === -1) {
					this.onError('expected ">"', position(i + 1));
					return;
				}

				if (this.is_onAttention && !stop) {
					ok = this.onAttention!(xml.substring(i, j + 1), unEntities, position(i));
					if (ok === false) return;
				}

				j += 1;
				continue;
			} else {
				if (w === 63) {
					// "?"
					j = xml.indexOf('?>', i);
					if (j === -1) {
						this.onError('...?>', position(i));
						return;
					}

					if (this.is_onQuestion) {
						ok = this.onQuestion!(xml.substring(i, j + 2), position(i));
						if (ok === false) return;
					}

					j += 2;
					continue;
				}
			}

			// The tag ends at the first '>' outside a quoted attribute value.
			inside = 0;
			for (k = i, j = -1; k < len; k++) {
				c = xml.charCodeAt(k);
				if (inside === 0) {
					if (c === 34) {
						// '"'
						inside = c;
					} else if (c === 39) {
						// "'"
						inside = c;
					} else if (c === 62) {
						// ">"
						j = k;
						break;
					}
				} else {
					if (c === inside) {
						inside = 0;
					}
				}
			}

			if (j === -1) {
				this.onError('...>', position(i + 1));
				return;
			}

			this.attr_res = true;

			if (w === 47) {
				// </...
				tagstart = false;
				tagend = true;

				const opened: string | undefined = nodestack.pop();
				if (opened === undefined) {
					// A close tag with nothing open throws in easysax 0.1.14.
					throw new TypeError("Cannot read properties of undefined (reading 'length')");
				}
				x = elem = opened;
				q = i + 2 + x.length;

				if (xml.substring(i + 2, q) !== x) {
					this.onError('close tagname', position(i + 2));
					return;
				}

				for (; q < j; q++) {
					w = xml.charCodeAt(q);

					if (w === 32 || (w > 8 && w < 14)) {
						continue;
					}

					this.onError('close tag', position(i + 2));
					return;
				}
			} else {
				if (xml.charCodeAt(j - 1) === 47) {
					// .../>
					x = elem = xml.substring(i + 1, j - 1);

					tagstart = true;
					tagend = true;
				} else {
					x = elem = xml.substring(i + 1, j);

					tagstart = true;
					tagend = false;
				}

				if (!((w > 96 && w < 123) || (w > 64 && w < 91))) {
					this.onError('first char nodeName', position(i + 1));
					return;
				}

				for (q = 1, y = x.length; q < y; q++) {
					w = x.charCodeAt(q);

					if ((w > 96 && w < 123) || (w > 64 && w < 91) || (w > 47 && w < 59) || w === 45 || w === 95 || w === 46 /* https://github.com/telerik/xPlatCore/issues/179 */) {
						continue;
					}

					if (w === 32 || (w < 14 && w > 8)) {
						elem = x.substring(0, q);
						// The tag may have attributes.
						this.attr_res = null;
						break;
					}

					this.onError('invalid nodeName', position(i + 1));
					return;
				}

				if (!tagend) {
					nodestack.push(elem);
				}
			}

			if (this.isNamespace) {
				if (stop) {
					if (tagend) {
						if (!tagstart) {
							if (--stopIndex === 0) {
								this.nsmatrix = stacknsmatrix.pop() as NsMatrix;
							}
						}
					} else {
						stopIndex += 1;
					}

					j += 1;
					continue;
				}

				_nsmatrix = this.nsmatrix;

				if (!tagend) {
					stacknsmatrix.push(this.nsmatrix);

					if (this.attr_res !== true) {
						this.hasSurmiseNS = x.indexOf('xmlns', q) !== -1;
						if (this.hasSurmiseNS) {
							this.attr_string = x;
							this.attr_posstart = q;

							this.getAttrs();

							this.hasSurmiseNS = false;
						}
					}
				}

				w = elem.indexOf(':');
				if (w !== -1) {
					xmlns = this.nsmatrix[elem.substring(0, w)];
					elem = elem.substr(w + 1);
				} else {
					xmlns = this.nsmatrix.xmlns;
				}

				if (!xmlns) {
					if (tagend) {
						if (tagstart) {
							this.nsmatrix = _nsmatrix;
						} else {
							this.nsmatrix = stacknsmatrix.pop() as NsMatrix;
						}
					} else {
						// The first element whose namespace is unknown.
						stopIndex = 1;
						this.attr_res = true;
					}

					j += 1;
					continue;
				}

				elem = xmlns + ':' + elem;
			}

			if (tagstart) {
				this.attr_string = x;
				this.attr_posstart = q;

				ok = this.onStartNode(elem, () => this.getAttrs() as EasySAXAttributes, unEntities, tagend, getStringNode, position(i));

				if (ok === false) {
					return;
				}

				this.attr_res = true;
			}

			if (tagend) {
				ok = this.onEndNode(elem, unEntities, tagstart, getStringNode, position(i));

				if (ok === false) {
					return;
				}

				if (this.isNamespace) {
					if (tagstart) {
						this.nsmatrix = _nsmatrix;
					} else {
						this.nsmatrix = stacknsmatrix.pop() as NsMatrix;
					}
				}
			}

			j += 1;
		}
	}
}
