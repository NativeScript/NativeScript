export namespace domains {
    export namespace network {
        export interface NetworkDomainDebugger {
            create(): domains.network.NetworkRequest;
        }
        
        export interface Headers {
        }

        export interface Request {
            url: string;
            method: string;
            headers: domains.network.Headers;
            postData?: string;
        }

        export interface Response {
            url: string;
            status: number;
            statusText: string;
            headers: Headers;
            headersText?: string;
            mimeType: string;
            requestHeaders?: domains.network.Headers;
            requestHeadersText?: string;
            fromDiskCache?: boolean;
        }

        export interface NetworkRequest {
            mimeType: string;
            data: any;
            responseReceived(response: domains.network.Response);
            loadingFinished();
            requestWillBeSent(request: domains.network.Request);
        }
    }
}

export var network: domains.network.NetworkDomainDebugger;
