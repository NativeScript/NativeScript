require('../native-helpers');
import { knownFolders, File as NSFile, isIOS, path, Folder, Application, Utils } from '@nativescript/core';
const BLOB_PATH = 'blob:nativescript/';
const BLOB_DIR = 'ns_blobs';
const BLOB_KEYS = 'org.nativescript.canvas.blob.keys';
declare const org;

const MIME_TO_EXT = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/gif': '.gif',
};

function get_mime_ext(value): string {
	return '.' + MIME_TO_EXT[value] ?? '';
}

let sharedPreferences;
interface BlobItem {
	blob: Blob;
	path?: string;
	type?: string;
	ext?: string;
}
const BLOB_STORE = new Map<string, BlobItem>();

import './url-search';

export class URL {
	_native;
	_isBlobURL = false;
	constructor(url: string, base?: string | URL) {
		if (url?.startsWith?.('blob:')) {
			this._isBlobURL = true;
		}
		let baseUrl: string;
		if (typeof url === 'string' && url.startsWith('blob:')) {
			this._native = new (<any>global).NativeScriptCoreModule.URL(url);
		} else {
			if (base instanceof URL) {
				baseUrl = base._native.toString();
			} else if (base) {
				try {
					baseUrl = base.toString();
				} catch (e) {
					throw new TypeError(`Failed to construct 'URL': Invalid base URL`);
				}
			}
			try {
				if (baseUrl) {
					this._native = new (<any>global).NativeScriptCoreModule.URL(url, baseUrl);
				} else {
					this._native = new (<any>global).NativeScriptCoreModule.URL(url);
				}
			} catch (e) {
				throw new TypeError(`Failed to construct 'URL': Invalid URL`);
			}
		}
	}

	get native() {
		return this._native;
	}

	get hash() {
		return this.native.hash;
	}

	set hash(value: string) {
		this.native.hash = value;
	}

	get host() {
		return this.native.host;
	}

	set host(value: string) {
		this.native.host = value;
	}

	get hostname() {
		return this.native.hostname;
	}

	set hostname(value: string) {
		this.native.hostname = value;
	}

	get href() {
		return this.native.href;
	}

	set href(value: string) {
		this.native.href = value;
	}

	get origin() {
		return this.native.origin;
	}

	get password() {
		return this.native.password;
	}

	set password(value: string) {
		this.native.password = value;
	}

	get pathname() {
		return this.native.pathname;
	}

	set pathname(value: string) {
		this.native.pathname = value;
	}

	get port() {
		return this.native.port;
	}

	set port(value: string) {
		this.native.port = value;
	}

	get protocol() {
		return this.native.protocol;
	}

	set protocol(value: string) {
		this.native.protocol = value;
	}

	get search() {
		return this.native.search;
	}

	set search(value: string) {
		this.native.search = value;
	}

	get searchParams() {
		return new URLSearchParams(this.native.toString());
	}

	get username() {
		return this.native.username;
	}

	set username(value: string) {
		this.native.username = value;
	}

	toJSON() {
		return this.native.toString();
	}

	toString() {
		return this.native.toString();
	}

	public static canParse(url, base) {
		let ret = false;
		if (url?.startsWith?.('blob:')) {
			ret = true;
		}
		let baseUrl: string;
		if (typeof url === 'string' && url.startsWith('blob:')) {
			ret = true;
		} else {
			if (base instanceof URL) {
				baseUrl = base._native.toString();
			} else if (base) {
				try {
					baseUrl = base.toString();
				} catch (e) {
					throw new TypeError(`Failed to construct 'URL': Invalid base URL`);
				}
			}
			try {
				if (baseUrl) {
					ret = (<any>global).NativeScriptCoreModule.URL.canParse(url, baseUrl);
				} else {
					ret = (<any>global).NativeScriptCoreModule.URL.canParse(url);
				}
			} catch (e) {}
		}

		return ret;
	}

	public static createObjectURL(object: any, options = null): string {
		if (object instanceof Blob || object instanceof File) {
			let id = '';

			if (global.isAndroid) {
				id = java.util.UUID.randomUUID().toString();
			}

			if (global.isIOS) {
				id = NSUUID.UUID().UUIDString;
			}

			const ret = `blob:nativescript/${id}`;
			BLOB_STORE.set(ret, {
				blob: object,
				type: object?.type,
				ext: options?.ext,
			});
			return ret;
		}
		return null;
	}

	public static revokeObjectURL(url: string) {
		BLOB_STORE.delete(url);
	}

	public static InternalAccessor = class {
		public static getData(url: string) {
			return BLOB_STORE.get(url);
		}
	};
}
