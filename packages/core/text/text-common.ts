const Object_prototype_toString = {}.toString;
const ArrayBufferString = Object_prototype_toString.call(ArrayBuffer.prototype);

function decoderReplacer(encoded) {
	var codePoint = encoded.charCodeAt(0) << 24;
	var leadingOnes = Math.clz32(~codePoint) | 0;
	var endPos = 0,
		stringLen = encoded.length | 0;
	var result = '';
	if (leadingOnes < 5 && stringLen >= leadingOnes) {
		codePoint = (codePoint << leadingOnes) >>> (24 + leadingOnes);
		for (endPos = 1; endPos < leadingOnes; endPos = (endPos + 1) | 0) {
			codePoint = (codePoint << 6) | (encoded.charCodeAt(endPos) & 0x3f) /*0b00111111*/;
		}
		if (codePoint <= 0xffff) {
			// BMP code point
			result += String.fromCharCode(codePoint);
		} else if (codePoint <= 0x10ffff) {
			// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
			codePoint = (codePoint - 0x10000) | 0;
			result += String.fromCharCode(
				((codePoint >> 10) + 0xd800) | 0, // highSurrogate
				((codePoint & 0x3ff) + 0xdc00) | 0 // lowSurrogate
			);
		} else {
			endPos = 0;
		} // to fill it in with INVALIDs
	}
	for (; endPos < stringLen; endPos = (endPos + 1) | 0) {
		result += '\ufffd';
	}

	return result;
}

function encoderReplacer(nonAsciiChars) {
	// make the UTF string into a binary UTF-8 encoded string
	var point = nonAsciiChars.charCodeAt(0) | 0;
	if (point >= 0xd800 && point <= 0xdbff) {
		var nextcode = nonAsciiChars.charCodeAt(1) | 0;
		if (nextcode !== nextcode) {
			// NaN because string is 1 code point long
			return String.fromCharCode(0xef /*11101111*/, 0xbf /*10111111*/, 0xbd /*10111101*/);
		}
		// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
			point = (((point - 0xd800) << 10) + nextcode - 0xdc00 + 0x10000) | 0;
			if (point > 0xffff) {
				return String.fromCharCode((0x1e /*0b11110*/ << 3) | (point >>> 18), (0x2 /*0b10*/ << 6) | ((point >>> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
			}
		} else {
			return String.fromCharCode(0xef, 0xbf, 0xbd);
		}
	}
	if (point <= 0x007f) {
		return nonAsciiChars;
	} else if (point <= 0x07ff) {
		return String.fromCharCode((0x6 << 5) | (point >>> 6), (0x2 << 6) | (point & 0x3f));
	} else {
		return String.fromCharCode((0xe /*0b1110*/ << 4) | (point >>> 12), (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
	}
}

export class TextDecoder {
	public get encoding() {
		return 'utf-8';
	}

	public decode(input: BufferSource): string {
		const buffer = ArrayBuffer.isView(input) ? input.buffer : input;
		if (Object_prototype_toString.call(buffer) !== ArrayBufferString) {
			throw Error("Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
		}
		let inputAs8 = new Uint8Array(buffer);
		let resultingString = '';
		for (let index = 0, len = inputAs8.length | 0; index < len; index = (index + 32768) | 0) {
			resultingString += String.fromCharCode.apply(0, inputAs8.slice(index, (index + 32768) | 0));
		}

		return resultingString.replace(/[\xc0-\xff][\x80-\xbf]*/g, decoderReplacer);
	}

	public toString() {
		return '[object TextDecoder]';
	}

	[Symbol.toStringTag] = 'TextDecoder';
}

export class TextEncoder {
	public get encoding() {
		return 'utf-8';
	}

	public encode(input: string = ''): Uint8Array {
		// 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
		// 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
		const encodedString = input === undefined ? '' : ('' + input).replace(/[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g, encoderReplacer);
		const len = encodedString.length | 0,
			result = new Uint8Array(len);
		for (let i = 0; i < len; i = (i + 1) | 0) {
			result[i] = encodedString.charCodeAt(i);
		}

		return result;
	}

	public toString() {
		return '[object TextEncoder]';
	}

	[Symbol.toStringTag] = 'TextEncoder';
}
