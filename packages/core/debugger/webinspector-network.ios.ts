import * as inspectorCommandTypes from './InspectorBackendCommands.ios';
const inspectorCommands: typeof inspectorCommandTypes = require('./InspectorBackendCommands');

import * as debuggerDomains from '.';

declare var __inspectorSendEvent;

declare var __inspectorTimestamp;

const frameId = 'NativeScriptMainFrameIdentifier';
const loaderId = 'Loader Identifier';

const resources_datas = [];

const documentTypeByMimeType = {
	'text/xml': 'Document',
	'text/plain': 'Document',
	'text/html': 'Document',
	'application/xml': 'Document',
	'application/xhtml+xml': 'Document',
	'text/css': 'Stylesheet',
	'text/javascript': 'Script',
	'text/ecmascript': 'Script',
	'application/javascript': 'Script',
	'application/ecmascript': 'Script',
	'application/x-javascript': 'Script',
	'application/json': 'Script',
	'application/x-json': 'Script',
	'text/x-javascript': 'Script',
	'text/x-json': 'Script',
	'text/typescript': 'Script',
};

export class Request {
	private _resourceType: string;
	private _data: any;
	private _mimeType: string;

	constructor(private _networkDomainDebugger: NetworkDomainDebugger, private _requestID: string) {}

	get mimeType(): string {
		return this._mimeType;
	}

	set mimeType(value: string) {
		if (this._mimeType !== value) {
			if (!value) {
				this._mimeType = 'text/plain';
				this._resourceType = 'Other';

				return;
			}

			this._mimeType = value;

			let resourceType = 'Other';

			if (this._mimeType in documentTypeByMimeType) {
				resourceType = documentTypeByMimeType[this._mimeType];
			}

			if (this._mimeType.indexOf('image/') !== -1) {
				resourceType = 'Image';
			}

			if (this._mimeType.indexOf('font/') !== -1) {
				resourceType = 'Font';
			}

			this._resourceType = resourceType;
		}
	}

	get requestID(): string {
		return this._requestID;
	}

	get hasTextContent(): boolean {
		return ['Document', 'Stylesheet', 'Script', 'XHR'].indexOf(this._resourceType) !== -1;
	}

	get data(): any {
		return this._data;
	}

	set data(value: any) {
		if (this._data !== value) {
			this._data = value;
		}
	}

	get resourceType() {
		return this._resourceType;
	}

	set resourceType(value: string) {
		if (this._resourceType !== value) {
			this._resourceType = value;
		}
	}

	public responseReceived(response: inspectorCommandTypes.NetworkDomain.Response): void {
		if (this._networkDomainDebugger.enabled) {
			this._networkDomainDebugger.events.responseReceived(this.requestID, frameId, loaderId, __inspectorTimestamp(), <any>this.resourceType, response);
		}
	}

	public loadingFinished(): void {
		if (this._networkDomainDebugger.enabled) {
			this._networkDomainDebugger.events.loadingFinished(this.requestID, __inspectorTimestamp());
		}
	}

	public requestWillBeSent(request: inspectorCommandTypes.NetworkDomain.Request): void {
		if (this._networkDomainDebugger.enabled) {
			this._networkDomainDebugger.events.requestWillBeSent(this.requestID, frameId, loaderId, request.url, request, __inspectorTimestamp(), { type: 'Script' });
		}
	}
}

@inspectorCommands.DomainDispatcher('Network')
export class NetworkDomainDebugger implements inspectorCommandTypes.NetworkDomain.NetworkDomainDispatcher {
	private _enabled: boolean;
	public events: inspectorCommandTypes.NetworkDomain.NetworkFrontend;

	constructor() {
		this.events = new inspectorCommands.NetworkDomain.NetworkFrontend();

		// By default start enabled because we can miss the "enable" event when
		// running with `--debug-brk` -- the frontend will send it before we've been created
		this.enable();
	}

	get enabled(): boolean {
		return this._enabled;
	}

	/**
	 * Enables network tracking, network events will now be delivered to the client.
	 */
	enable(): void {
		if (debuggerDomains.getNetwork()) {
			throw new Error('One NetworkDomainDebugger may be enabled at a time.');
		} else {
			debuggerDomains.setNetwork(this);
		}
		this._enabled = true;
	}

	/**
	 * Disables network tracking, prevents network events from being sent to the client.
	 */
	disable(): void {
		if (debuggerDomains.getNetwork() === this) {
			debuggerDomains.setNetwork(null);
		}
		this._enabled = false;
	}

	/**
	 * Specifies whether to always send extra HTTP headers with the requests from this page.
	 */
	setExtraHTTPHeaders(params: inspectorCommandTypes.NetworkDomain.SetExtraHTTPHeadersMethodArguments): void {
		//
	}

	/**
	 * Returns content served for the given request.
	 */
	getResponseBody(params: inspectorCommandTypes.NetworkDomain.GetResponseBodyMethodArguments): { body: string; base64Encoded: boolean } {
		const resource_data = resources_datas[params.requestId];
		const body = resource_data.hasTextContent ? NSString.alloc().initWithDataEncoding(resource_data.data, 4).toString() : resource_data.data.base64EncodedStringWithOptions(0);

		if (resource_data) {
			return {
				body: body,
				base64Encoded: !resource_data.hasTextContent,
			};
		}
	}

	/**
	 * Tells whether clearing browser cache is supported.
	 */
	canClearBrowserCache(): { result: boolean } {
		return {
			result: false,
		};
	}

	/**
	 * Clears browser cache.
	 */
	clearBrowserCache(): void {
		//
	}

	/**
	 * Tells whether clearing browser cookies is supported.
	 */
	canClearBrowserCookies(): { result: boolean } {
		return {
			result: false,
		};
	}

	/**
	 * Clears browser cookies.
	 */
	clearBrowserCookies(): void {
		//
	}

	/**
	 * Toggles ignoring cache for each request. If <code>true</code>, cache will not be used.
	 */
	setCacheDisabled(params: inspectorCommandTypes.NetworkDomain.SetCacheDisabledMethodArguments): void {
		//
	}

	/**
	 * Loads a resource in the context of a frame on the inspected page without cross origin checks.
	 */
	loadResource(params: inspectorCommandTypes.NetworkDomain.LoadResourceMethodArguments): { content: string; mimeType: string; status: number } {
		let appPath = NSBundle.mainBundle.bundlePath;
		let pathUrl = params.url.replace('file://', appPath);
		let fileManager = NSFileManager.defaultManager;
		let data = fileManager.fileExistsAtPath(pathUrl) ? fileManager.contentsAtPath(pathUrl) : undefined;
		let content = data ? NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding) : '';

		return {
			content: content.toString(), // Not sure why however we need to call toString() for NSString
			mimeType: 'application/octet-stream',
			status: 200,
		};
	}

	public static idSequence: number = 0;
	create(): Request {
		let id = (++NetworkDomainDebugger.idSequence).toString();
		let resourceData = new Request(this, id);
		resources_datas[id] = resourceData;

		return resourceData;
	}
}
