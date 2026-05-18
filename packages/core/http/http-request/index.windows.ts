import type { HttpResponse, HttpRequestOptions, HttpContentHandler } from '../../http';
import { ImageSource } from '../../image-source';
import { File } from '../../file-system';
import type { HttpResponseEncoding } from '../http-interfaces';
import { BaseHttpContent, requestInternal } from '../http-request-internal';
import { getFilenameFromUrl, parseJSON } from './http-request-common';

const contentHandler: HttpContentHandler = {
	toArrayBuffer(this: BaseHttpContent) {
		if (this.raw instanceof ArrayBuffer) {
			return this.raw;
		}
		if (this.raw instanceof Uint8Array) {
			return this.raw.buffer;
		}
		return new ArrayBuffer(0);
	},
	toString(this: BaseHttpContent, _encoding?: HttpResponseEncoding) {
		const str = this.toNativeString(_encoding);
		if (typeof str === 'string') {
			return str;
		}
		throw new Error('Response content may not be converted to string');
	},
	toJSON(this: BaseHttpContent, encoding?: HttpResponseEncoding) {
		return parseJSON(this.toNativeString(encoding));
	},
	toImage(this: BaseHttpContent) {
		return this.toNativeImage().then((value) => new ImageSource(value));
	},
	toFile(this: BaseHttpContent, destinationFilePath?: string) {
		if (!destinationFilePath) {
			destinationFilePath = getFilenameFromUrl(this.requestURL);
		}
		const file = File.fromPath(destinationFilePath);
		const data = this.raw instanceof ArrayBuffer ? this.raw : (this.raw instanceof Uint8Array ? this.raw.buffer : new ArrayBuffer(0));
		file.writeSync(data);
		return file;
	},
};

export function request(options: HttpRequestOptions): Promise<HttpResponse> {
	return requestInternal(options, contentHandler);
}
