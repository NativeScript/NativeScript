import * as inspectorCommands from './InspectorBackendCommands';
import { File, knownFolders } from '../file-system';

import * as debuggerDomains from '.';

declare let __inspectorSendEvent;

declare let __inspectorTimestamp;

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

    constructor(
        private _networkDomainDebugger: NetworkDomainDebugger,
        private _requestID: string,
    ) {}

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

    public responseReceived(response: inspectorCommands.NetworkDomain.Response): void {
        if (this._networkDomainDebugger.enabled) {
            this._networkDomainDebugger.events.responseReceived(this.requestID, frameId, loaderId, __inspectorTimestamp(), <any>this.resourceType, response);
        }
    }

    public loadingFinished(): void {
        if (this._networkDomainDebugger.enabled) {
            this._networkDomainDebugger.events.loadingFinished(this.requestID, __inspectorTimestamp());
        }
    }

    public requestWillBeSent(request: inspectorCommands.NetworkDomain.Request): void {
        if (this._networkDomainDebugger.enabled) {
            this._networkDomainDebugger.events.requestWillBeSent(this.requestID, frameId, loaderId, request.url, request, __inspectorTimestamp(), { type: 'Script' });
        }
    }
}

function arrayBufferToString(buf: ArrayBuffer | Uint8Array): string {
    try {
        if (typeof Buffer !== 'undefined' && Buffer.from) {
            if (buf instanceof ArrayBuffer) {
                return Buffer.from(new Uint8Array(buf)).toString('utf8');
            }
            return Buffer.from(buf as Uint8Array).toString('utf8');
        }

        if (typeof TextDecoder !== 'undefined') {
            return new TextDecoder('utf-8').decode(buf instanceof ArrayBuffer ? new Uint8Array(buf) : (buf as Uint8Array));
        }

        // Fallback manual decode
        const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : (buf as Uint8Array);
        let str = '';
        for (let i = 0; i < bytes.length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    } catch (e) {
        return '';
    }
}

function arrayBufferToBase64(buf: ArrayBuffer | Uint8Array): string {
    try {
        if (typeof Buffer !== 'undefined' && Buffer.from) {
            if (buf instanceof ArrayBuffer) {
                return Buffer.from(new Uint8Array(buf)).toString('base64');
            }
            return Buffer.from(buf as Uint8Array).toString('base64');
        }

        // Use Windows API if available
        try {
            if (typeof Windows !== 'undefined' && Windows.Security && Windows.Security.Cryptography) {
                const writer = new Windows.Storage.Streams.DataWriter();
                if (buf instanceof ArrayBuffer) {
                    writer.WriteBytes(new Uint8Array(buf) as never);
                } else {
                    writer.WriteBytes(buf as never);
                }
                const iBuf = writer.DetachBuffer();
                return Windows.Security.Cryptography.CryptographicBuffer.EncodeToBase64String(iBuf as any);
            }
        } catch (e) {}

        // Fallback to btoa over chunks
        const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : (buf as Uint8Array);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.prototype.slice.call(chunk));
        }
        if (typeof btoa !== 'undefined') {
            return btoa(binary);
        }
        return '';
    } catch (e) {
        return '';
    }
}

@inspectorCommands.DomainDispatcher('Network')
export class NetworkDomainDebugger implements inspectorCommands.NetworkDomain.NetworkDomainDispatcher {
    private _enabled: boolean;
    public events: inspectorCommands.NetworkDomain.NetworkFrontend;

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
    setExtraHTTPHeaders(params: inspectorCommands.NetworkDomain.SetExtraHTTPHeadersMethodArguments): void {
        //
    }

    /**
     * Returns content served for the given request.
     */
    getResponseBody(params: inspectorCommands.NetworkDomain.GetResponseBodyMethodArguments): { body: string; base64Encoded: boolean } {
        const resource_data = resources_datas[params.requestId];
        if (!resource_data) {
            return { body: '', base64Encoded: false };
        }

        // Try to handle multiple data shapes across platforms/runtimes
        // Prefer text decoding for text-like resources
        try {
            if (resource_data.hasTextContent) {
                if (typeof resource_data.data === 'string') {
                    return { body: resource_data.data, base64Encoded: false };
                }
                if (resource_data.data instanceof ArrayBuffer || resource_data.data instanceof Uint8Array) {
                    return { body: arrayBufferToString(resource_data.data), base64Encoded: false };
                }
                // Fallback: attempt toString
                return { body: resource_data.data?.toString() ?? '', base64Encoded: false };
            } else {
                if (resource_data.data instanceof ArrayBuffer || resource_data.data instanceof Uint8Array) {
                    return { body: arrayBufferToBase64(resource_data.data), base64Encoded: true };
                }

                // If underlying platform produced a Windows IBuffer or similar, try Windows API
                try {
                    if (typeof Windows !== 'undefined' && Windows.Security && Windows.Security.Cryptography && resource_data.data && (resource_data.data as any).Length !== undefined) {
                        // resource_data.data is likely an IBuffer-like object
                        return { body: Windows.Security.Cryptography.CryptographicBuffer.EncodeToBase64String(resource_data.data as any), base64Encoded: true };
                    }
                } catch (e) {}

                // Last-ditch: attempt Buffer or btoa
                if (typeof Buffer !== 'undefined' && Buffer.from) {
                    try {
                        return { body: Buffer.from(resource_data.data as any).toString('base64'), base64Encoded: true };
                    } catch (e) {}
                }
                // fallback empty
                return { body: '', base64Encoded: true };
            }
        } catch (e) {
            return { body: '', base64Encoded: !resource_data.hasTextContent };
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
    setCacheDisabled(params: inspectorCommands.NetworkDomain.SetCacheDisabledMethodArguments): void {
        //
    }

    /**
     * Loads a resource in the context of a frame on the inspected page without cross origin checks.
     */
    loadResource(params: inspectorCommands.NetworkDomain.LoadResourceMethodArguments): { content: string; mimeType: string; status: number } {
        const appPath = knownFolders.currentApp().path;
        // Normalize incoming url like: file:// or file:///app/...
        let rel = params.url.replace(/^file:\/\/?/, '');
        if (rel.startsWith('app/')) {
            rel = rel.substr(4);
        }
        const pathUrl = `${appPath}/${rel}`;
        const file = File.exists(pathUrl) ? File.fromPath(pathUrl) : undefined;
        let content = '';
        try {
            if (file) {
                // Prefer text read for resources; binary consumers will request via getResponseBody
                content = file.readTextSync();
            }
        } catch (e) {
            content = '';
        }

        return {
            content: content.toString(),
            mimeType: 'application/octet-stream',
            status: 200,
        };
    }

    public static idSequence = 0;
    create(): Request {
        const id = (++NetworkDomainDebugger.idSequence).toString();
        const resourceData = new Request(this, id);
        resources_datas[id] = resourceData;

        return resourceData;
    }
}
