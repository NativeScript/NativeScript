import definition = require("./InspectorBackendCommands");
import http_request = require("http/http-request");

var resources_datas = [];

@definition.DomainDispatcher("Network")
export class NetworkDomainDebugger implements definition.NetworkDomain.NetworkDomainDispatcher {
    private events: definition.NetworkDomain.NetworkFrontend;

    constructor(dispatchMessage: (message: String) => void) {
        this.events = new definition.NetworkDomain.NetworkFrontend(dispatchMessage);
    }

    /**
     * Enables network tracking, network events will now be delivered to the client.
     */
    enable(): void {
        http_request.domainDebugger = {
                "events": this.events,
                "resource_datas": resources_datas
            }
    }
    
    /**
     * Disables network tracking, prevents network events from being sent to the client.
     */
    disable(): void {
        //
    }
    
    /**
     * Specifies whether to always send extra HTTP headers with the requests from this page.
     */
    setExtraHTTPHeaders(params: definition.NetworkDomain.SetExtraHTTPHeadersMethodArguments): void {
        //
    }
    
    /**
     * Returns content served for the given request.
     */
    getResponseBody(params: definition.NetworkDomain.GetResponseBodyMethodArguments): { body: string, base64Encoded: boolean } {
        var resource_data = resources_datas[params.requestId];
        var body = resource_data.hasTextContent ? NSString.alloc().initWithDataEncoding(resource_data.data, 4).toString() :
                    resource_data.data.base64EncodedStringWithOptions(0);

        if(resource_data) {
             return {
                 body: body,
                 base64Encoded: !resource_data.hasTextContent
             };
        } 
    }
    
    /**
     * Tells whether clearing browser cache is supported.
     */
    canClearBrowserCache(): { result: boolean } {
        return {
            result: false
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
            result: false
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
    setCacheDisabled(params: definition.NetworkDomain.SetCacheDisabledMethodArguments): void {
        //
    }
    
    /**
     * Loads a resource in the context of a frame on the inspected page without cross origin checks.
     */
    loadResource(params: definition.NetworkDomain.LoadResourceMethodArguments): { content: string, mimeType: string, status: number } {
        return {
            content: "",
            mimeType: "",
            status: 200
        }
    }
}