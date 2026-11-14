import * as inspectorCommands from './InspectorBackendCommands';

export class Request {
	constructor(networkDomainDebugger: NetworkDomainDebugger, requestID: string);
	mimeType: string;
	readonly requestID: string;
	readonly hasTextContent: boolean;
	data: any;
	resourceType: string;
	responseReceived(response: inspectorCommands.NetworkDomain.Response): void;
	loadingFinished(): void;
	requestWillBeSent(request: inspectorCommands.NetworkDomain.Request): void;
}

export class NetworkDomainDebugger implements inspectorCommands.NetworkDomain.NetworkDomainDispatcher {
	events: inspectorCommands.NetworkDomain.NetworkFrontend;
	readonly enabled: boolean;
	enable(): void;
	disable(): void;
	setExtraHTTPHeaders(params: inspectorCommands.NetworkDomain.SetExtraHTTPHeadersMethodArguments): void;
	getResponseBody(params: inspectorCommands.NetworkDomain.GetResponseBodyMethodArguments): { body: string; base64Encoded: boolean };
	canClearBrowserCache(): { result: boolean };
	clearBrowserCache(): void;
	canClearBrowserCookies(): { result: boolean };
	clearBrowserCookies(): void;
	setCacheDisabled(params: inspectorCommands.NetworkDomain.SetCacheDisabledMethodArguments): void;
	loadResource(params: inspectorCommands.NetworkDomain.LoadResourceMethodArguments): { content: string; mimeType: string; status: number };
	create(): Request;
}
