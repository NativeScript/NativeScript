import { setGetImageRequest, type ImageSourceLike } from './http-shared';
import { request } from './http-request';
export { request } from './http-request';
export * from './http-interfaces';

export function getString(arg: any): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const str = r.content.toString();
					resolve(str);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e),
		);
	});
}

export function getJSON<T>(arg: any): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const json = r.content.toJSON();
					resolve(json);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e),
		);
	});
}

export function getImage(arg: any): Promise<ImageSourceLike> {
	return new Promise<any>((resolve, reject) => {
		request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					resolve(r.content.toImage());
				} catch (err) {
					reject(err);
				}
			},
			(err) => {
				reject(err);
			},
		);
	});
}
setGetImageRequest(getImage);

export function getFile(arg: any, destinationFilePath?: string): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const file = r.content.toFile(destinationFilePath);
					resolve(file);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e),
		);
	});
}

export function getBinary(arg: any): Promise<ArrayBuffer> {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const arrayBuffer = r.content.toArrayBuffer();
					resolve(arrayBuffer);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e),
		);
	});
}
