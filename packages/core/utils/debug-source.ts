import { getNativeApp } from '../application/helpers-common';

// console.log('__dirname:', global.__dirname);

function getCurrentAppPath(): string {
	if (__APPLE__) {
		const currentDir = global.__dirname;
		const tnsModulesIndex = currentDir.indexOf('/tns_modules');

		// Module not hosted in ~/tns_modules when bundled. Use current dir.
		let appPath = currentDir;
		if (tnsModulesIndex !== -1) {
			// Strip part after tns_modules to obtain app root
			appPath = currentDir.substring(0, tnsModulesIndex);
		}

		return appPath;
	} else {
		const dir = getNativeApp<android.app.Application>().getApplicationContext().getFilesDir();

		return `${dir.getCanonicalPath()}/app`;
	}
}

let applicationRootPath: string;
function ensureAppRootPath() {
	if (!applicationRootPath) {
		applicationRootPath = getCurrentAppPath();
		applicationRootPath = applicationRootPath.substring(0, applicationRootPath.length - 'app/'.length);
	}
}

export class Source {
	private _uri: string;
	private _line: number;
	private _column: number;

	private static _source = Symbol('source');

	constructor(uri: string, line: number, column: number) {
		ensureAppRootPath();

		if (uri.length > applicationRootPath.length && uri.substring(0, applicationRootPath.length) === applicationRootPath) {
			this._uri = 'file://' + uri.substring(applicationRootPath.length);
		} else {
			this._uri = uri;
		}
		this._line = line;
		this._column = column;
	}

	get uri(): string {
		return this._uri;
	}
	get line(): number {
		return this._line;
	}
	get column(): number {
		return this._column;
	}

	public toString() {
		return this._uri + ':' + this._line + ':' + this._column;
	}

	public static get(object: any): Source {
		return object[Source._source];
	}

	public static set(object: any, src: Source) {
		object[Source._source] = src;
	}
}

export class ScopeError extends Error {
	constructor(inner: Error, message?: string) {
		let formattedMessage;
		if (message && inner.message) {
			formattedMessage = message + '\n > ' + inner.message.replace('\n', '\n  ');
		} else {
			formattedMessage = message || inner.message || undefined;
		}
		super(formattedMessage);
		this.stack = __ANDROID__ ? 'Error: ' + this.message + '\n' + inner.stack.substr(inner.stack.indexOf('\n') + 1) : inner.stack;
		this.message = formattedMessage;
	}
}

export class SourceError extends ScopeError {
	constructor(child: Error, source: Source, message?: string) {
		super(child, message ? message + ' @' + source + '' : source + '');
	}
}
