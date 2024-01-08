/**!
 * url-search-params-polyfill
 *
 * @author Jerry Bendy (https://github.com/jerrybendy)
 * @licence MIT
 */
//@ts-nocheck
(function (self) {
	'use strict';

	const nativeURLSearchParams = (function () {
			// #41 Fix issue in RN
			try {
				if (self.URLSearchParams && new self.URLSearchParams('foo=bar').get('foo') === 'bar') {
					return self.URLSearchParams;
				}
			} catch (e) {}
			return null;
		})(),
		isSupportObjectConstructor = nativeURLSearchParams && new nativeURLSearchParams({ a: 1 }).toString() === 'a=1',
		// There is a bug in safari 10.1 (and earlier) that incorrectly decodes `%2B` as an empty space and not a plus.
		decodesPlusesCorrectly = nativeURLSearchParams && new nativeURLSearchParams('s=%2B').get('s') === '+',
		isSupportSize = nativeURLSearchParams && 'size' in nativeURLSearchParams.prototype,
		__URLSearchParams__ = '__URLSearchParams__',
		// Fix bug in Edge which cannot encode ' &' correctly
		encodesAmpersandsCorrectly = nativeURLSearchParams
			? (function () {
					const ampersandTest = new nativeURLSearchParams();
					ampersandTest.append('s', ' &');

					return ampersandTest.toString() === 's=+%26';
			  })()
			: true,
		prototype = URLSearchParamsPolyfill.prototype,
		iterable = !!(self.Symbol && self.Symbol.iterator);

	if (nativeURLSearchParams && isSupportObjectConstructor && decodesPlusesCorrectly && encodesAmpersandsCorrectly && isSupportSize) {
		return;
	}

	/**
	 * Make a URLSearchParams instance
	 *
	 * @param {object|string|URLSearchParams} search
	 * @constructor
	 */
	function URLSearchParamsPolyfill(search) {
		search = search || '';

		// support construct object with another URLSearchParams instance
		if (search instanceof URLSearchParams || search instanceof URLSearchParamsPolyfill) {
			search = search.toString();
		}

		if (search.indexOf('%') > -1 || search.indexOf('%20') > -1) {
			search = decodeURIComponent(search);
		}
		this[__URLSearchParams__] = parseToDict(search);
	}

	/**
	 * Appends a specified key/value pair as a new search parameter.
	 *
	 * @param {string} name
	 * @param {string} value
	 */
	prototype.append = function (name, value) {
		appendTo(this[__URLSearchParams__], name, value);
	};

	/**
	 * Deletes the given search parameter, and its associated value,
	 * from the list of all search parameters.
	 *
	 * @param {string} name
	 */
	prototype['delete'] = function (name) {
		delete this[__URLSearchParams__][name];
	};

	/**
	 * Returns the first value associated to the given search parameter.
	 *
	 * @param {string} name
	 * @returns {string|null}
	 */
	prototype.get = function (name) {
		const dict = this[__URLSearchParams__];
		return this.has(name) ? dict[name][0] : null;
	};

	/**
	 * Returns all the values association with a given search parameter.
	 *
	 * @param {string} name
	 * @returns {Array}
	 */
	prototype.getAll = function (name) {
		const dict = this[__URLSearchParams__];
		return this.has(name) ? dict[name].slice(0) : [];
	};

	/**
	 * Returns a Boolean indicating if such a search parameter exists.
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	prototype.has = function (name) {
		return hasOwnProperty(this[__URLSearchParams__], name);
	};

	/**
	 * Sets the value associated to a given search parameter to
	 * the given value. If there were several values, delete the
	 * others.
	 *
	 * @param {string} name
	 * @param {string} value
	 */
	prototype.set = function set(name, value) {
		this[__URLSearchParams__][name] = ['' + value];
	};

	/**
	 * Returns a string containg a query string suitable for use in a URL.
	 *
	 * @returns {string}
	 */
	prototype.toString = function () {
		// eslint-disable-next-line prefer-const
		let dict = this[__URLSearchParams__],
			query = [],
			i,
			key,
			name,
			value;
		for (key in dict) {
			name = encode(key);
			for (i = 0, value = dict[key]; i < value.length; i++) {
				query.push(name + '=' + encode(value[i]));
			}
		}
		return query.join('&');
	};

	// There is a bug in Safari 10.1 and `Proxy`ing it is not enough.
	const useProxy = self.Proxy && nativeURLSearchParams && (!decodesPlusesCorrectly || !encodesAmpersandsCorrectly || !isSupportObjectConstructor || !isSupportSize);
	let propValue;
	if (useProxy) {
		// Safari 10.0 doesn't support Proxy, so it won't extend URLSearchParams on safari 10.0
		propValue = new Proxy(nativeURLSearchParams, {
			construct: function (target, args) {
				return new target(new URLSearchParamsPolyfill(args[0]).toString());
			},
		});
		// Chrome <=60 .toString() on a function proxy got error "Function.prototype.toString is not generic"
		propValue.toString = Function.prototype.toString.bind(URLSearchParamsPolyfill);
	} else {
		propValue = URLSearchParamsPolyfill;
	}

	/*
	 * Apply polyfill to global object and append other prototype into it
	 */
	Object.defineProperty(self, 'URLSearchParams', {
		value: propValue,
	});

	const USPProto = self.URLSearchParams.prototype;

	USPProto.polyfill = true;

	// Fix #54, `toString.call(new URLSearchParams)` will return correct value when Proxy not used
	if (!useProxy && self.Symbol) {
		USPProto[self.Symbol.toStringTag] = 'URLSearchParams';
	}

	/**
	 *
	 * @param {function} callback
	 * @param {object} thisArg
	 */
	if (!('forEach' in USPProto)) {
		USPProto.forEach = function (callback, thisArg) {
			const dict = parseToDict(this.toString());
			Object.getOwnPropertyNames(dict).forEach(function (name) {
				dict[name].forEach(function (value) {
					callback.call(thisArg, value, name, this);
				}, this);
			}, this);
		};
	}

	/**
	 * Sort all name-value pairs
	 */
	if (!('sort' in USPProto)) {
		USPProto.sort = function () {
			// eslint-disable-next-line prefer-const
			let dict = parseToDict(this.toString()),
				keys = [],
				k,
				i,
				j;
			for (k in dict) {
				keys.push(k);
			}
			keys.sort();

			for (i = 0; i < keys.length; i++) {
				this['delete'](keys[i]);
			}
			for (i = 0; i < keys.length; i++) {
				const key = keys[i],
					values = dict[key];
				for (j = 0; j < values.length; j++) {
					this.append(key, values[j]);
				}
			}
		};
	}

	/**
	 * Returns an iterator allowing to go through all keys of
	 * the key/value pairs contained in this object.
	 *
	 * @returns {function}
	 */
	if (!('keys' in USPProto)) {
		USPProto.keys = function () {
			const items = [];
			this.forEach(function (item, name) {
				items.push(name);
			});
			return makeIterator(items);
		};
	}

	/**
	 * Returns an iterator allowing to go through all values of
	 * the key/value pairs contained in this object.
	 *
	 * @returns {function}
	 */
	if (!('values' in USPProto)) {
		USPProto.values = function () {
			const items = [];
			this.forEach(function (item) {
				items.push(item);
			});
			return makeIterator(items);
		};
	}

	/**
	 * Returns an iterator allowing to go through all key/value
	 * pairs contained in this object.
	 *
	 * @returns {function}
	 */
	if (!('entries' in USPProto)) {
		USPProto.entries = function () {
			const items = [];
			this.forEach(function (item, name) {
				items.push([name, item]);
			});
			return makeIterator(items);
		};
	}

	if (iterable) {
		USPProto[self.Symbol.iterator] = USPProto[self.Symbol.iterator] || USPProto.entries;
	}

	if (!('size' in USPProto)) {
		Object.defineProperty(USPProto, 'size', {
			get: function () {
				const dict = parseToDict(this.toString());
				if (USPProto === this) {
					throw new TypeError('Illegal invocation at URLSearchParams.invokeGetter');
				}
				return Object.keys(dict).reduce(function (prev, cur) {
					return prev + dict[cur].length;
				}, 0);
			},
		});
	}

	function encode(str) {
		const replace = {
			'!': '%21',
			"'": '%27',
			'(': '%28',
			')': '%29',
			'~': '%7E',
			'%20': '+',
			'%00': '\x00',
		};
		return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function (match) {
			return replace[match];
		});
	}

	function decode(str) {
		return str.replace(/[ +]/g, '%20').replace(/(%[a-f0-9]{2})+/gi, function (match) {
			return decodeURIComponent(match);
		});
	}

	function makeIterator(arr) {
		const iterator = {
			next: function () {
				const value = arr.shift();
				return { done: value === undefined, value: value };
			},
		};

		if (iterable) {
			iterator[self.Symbol.iterator] = function () {
				return iterator;
			};
		}

		return iterator;
	}

	function parseToDict(search) {
		const dict = {};

		if (typeof search === 'object') {
			// if `search` is an array, treat it as a sequence
			if (isArray(search)) {
				for (let i = 0; i < search.length; i++) {
					const item = search[i];
					if (isArray(item) && item.length === 2) {
						appendTo(dict, item[0], item[1]);
					} else {
						throw new TypeError("Failed to construct 'URLSearchParams': Sequence initializer must only contain pair elements");
					}
				}
			} else {
				for (const key in search) {
					if (search.hasOwnProperty(key)) {
						appendTo(dict, key, search[key]);
					}
				}
			}
		} else {
			// remove first '?'
			if (search.indexOf('?') === 0) {
				search = search.slice(1);
			}

			const pairs = search.split('&');
			for (let j = 0; j < pairs.length; j++) {
				const value = pairs[j],
					index = value.indexOf('=');

				if (-1 < index) {
					appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));
				} else {
					if (value) {
						appendTo(dict, decode(value), '');
					}
				}
			}
		}

		return dict;
	}

	function appendTo(dict, name, value) {
		const val = typeof value === 'string' ? value : value !== null && value !== undefined && typeof value.toString === 'function' ? value.toString() : JSON.stringify(value);

		// #47 Prevent using `hasOwnProperty` as a property name
		if (hasOwnProperty(dict, name)) {
			dict[name].push(val);
		} else {
			dict[name] = [val];
		}
	}

	function isArray(val) {
		return !!val && '[object Array]' === Object.prototype.toString.call(val);
	}

	function hasOwnProperty(obj, prop) {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
