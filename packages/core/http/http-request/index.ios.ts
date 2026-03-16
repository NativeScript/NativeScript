import { ImageSource } from '../../image-source';
import { File } from '../../file-system';
import type { HttpRequestOptions, HttpResponse, HttpContentHandler } from '../http-interfaces';
import type { HttpResponseEncoding } from '../http-interfaces';
import { requestInternal, BaseHttpContent } from '../http-request-internal';
import { getFilenameFromUrl, parseJSON } from './http-request-common';

const contentHandler: HttpContentHandler = {
	toArrayBuffer(this: BaseHttpContent) {
		return interop.bufferFromData(this.raw);
	},
	toString(this: BaseHttpContent, encoding?: HttpResponseEncoding) {
		const str = this.toNativeString(encoding);
		if (typeof str === 'string') {
			return str;
		} else {
			throw new Error('Response content may not be converted to string');
		}
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
		if (this.raw instanceof NSData) {
			// ensure destination path exists by creating any missing parent directories
			const file = File.fromPath(destinationFilePath);

			this.raw.writeToFileAtomically(destinationFilePath, true);

			return file;
		} else {
			throw new Error(`Cannot save file with path: ${destinationFilePath}.`);
		}
	},
};

export function request(options: HttpRequestOptions): Promise<HttpResponse> {
	return requestInternal(options, contentHandler);
}
