// imported for definition purposes only
import type { HttpResponse, HttpRequestOptions, HttpContentHandler } from '../../http';
import { ImageSource } from '../../image-source';
import { File } from '../../file-system';
import { HttpResponseEncoding } from '../http-interfaces';
import { BaseHttpContent, requestInternal } from '../http-request-internal';
import { getFilenameFromUrl, parseJSON } from './http-request-common';

const contentHandler: HttpContentHandler = {
	toArrayBuffer(this: BaseHttpContent) {
		return Uint8Array.from((this.raw as java.io.ByteArrayOutputStream).toByteArray()).buffer;
	},
	toString(this: BaseHttpContent, encoding?: HttpResponseEncoding) {
		let str: string;
		if (encoding) {
			str = decodeResponse(this.raw as java.io.ByteArrayOutputStream, encoding);
		} else {
			str = this.toNativeString(encoding);
		}
		if (typeof str === 'string') {
			return str;
		} else {
			throw new Error('Response content may not be converted to string');
		}
	},
	toJSON(this: BaseHttpContent, encoding?: HttpResponseEncoding) {
		let str: string;
		if (encoding) {
			str = decodeResponse(this.raw as java.io.ByteArrayOutputStream, encoding);
		} else {
			str = this.toNativeString(encoding);
		}

		return parseJSON(str);
	},
	toImage(this: BaseHttpContent) {
		return this.toNativeImage().then((value) => new ImageSource(value));
	},
	toFile(this: BaseHttpContent, destinationFilePath: string) {
		if (!destinationFilePath) {
			destinationFilePath = getFilenameFromUrl(this.requestURL);
		}
		let stream: java.io.FileOutputStream;
		try {
			// ensure destination path exists by creating any missing parent directories
			const file = File.fromPath(destinationFilePath);

			const javaFile = new java.io.File(destinationFilePath);
			stream = new java.io.FileOutputStream(javaFile);
			stream.write((this.raw as java.io.ByteArrayOutputStream).toByteArray());

			return file;
		} catch (exception) {
			throw new Error(`Cannot save file with path: ${destinationFilePath}.`);
		} finally {
			if (stream) {
				stream.close();
			}
		}
	},
};

export function request(options: HttpRequestOptions): Promise<HttpResponse> {
	return requestInternal(options, contentHandler);
}

function decodeResponse(raw: java.io.ByteArrayOutputStream, encoding?: HttpResponseEncoding) {
	const charsetName = encoding === HttpResponseEncoding.GBK ? 'GBK' : 'UTF-8';
	return raw.toString(charsetName);
}
