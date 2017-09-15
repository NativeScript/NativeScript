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

var network, java, android;

export function getNetwork(): domains.network.NetworkDomainDebugger {
    return network;
}
export function setNetwork(newNetwork: domains.network.NetworkDomainDebugger) {
    network = newNetwork;
}

export namespace NetworkAgent {
    export interface Request {
        url: string;
        method: string;
        headers: any;
        postData?: string;
    }

    export interface RequestData {
        requestId: string;
        url: string;
        request: Request;
        timestamp: number;
        type: string;
    }

    export interface Response {
        url: string;
        status: number;
        statusText: string;
        headers: any;
        headersText?: string;
        mimeType: string;
        fromDiskCache?: boolean;
    }

    export interface ResponseData {
        requestId: string;
        type: string;
        response: Response;
        timestamp: number;
    }

    export interface SuccessfulRequestData {
        requestId: string;
        data: string;
        hasTextContent: boolean;
    }

    export interface LoadingFinishedData {
        requestId: string;
        timestamp: number;
    }

    export function responseReceived(requestId: number, result: any /* org.nativescript.widgets.Async.Http.RequestResult */, headers: any) {
        const requestIdStr = requestId.toString();
        // Content-Type and content-type are both common in headers spelling
        const mimeType: string = <string>headers["Content-Type"] || <string>headers["content-type"] || "application/octet-stream";
        const response: NetworkAgent.Response = {
            url: result.url || "",
            status: result.statusCode,
            statusText: result.statusText || "",
            headers: headers,
            mimeType: mimeType,
            fromDiskCache: false
        }

        const responseData: NetworkAgent.ResponseData = {
            requestId: requestIdStr,
            type: mimeTypeToType(response.mimeType),
            response: response,
            timestamp: getTimeStamp()
        }

        global.__inspector.responseReceived(responseData);
        global.__inspector.loadingFinished({ requestId: requestIdStr, timestamp: getTimeStamp() });

        const hasTextContent = responseData.type === "Document" || responseData.type === "Script";
        let data;

        if (!hasTextContent) {
            if (responseData.type === "Image") {
                const bitmap = result.responseAsImage;
                if (bitmap) {
                    const outputStream = new java.io.ByteArrayOutputStream();
                    bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, outputStream);

                    const base64Image = android.util.Base64.encodeToString(outputStream.toByteArray(), android.util.Base64.DEFAULT);
                    data = base64Image;
                }
            }
        } else {
            data = result.responseAsString;
        }

        const successfulRequestData: NetworkAgent.SuccessfulRequestData = {
            requestId: requestIdStr,
            data: data,
            hasTextContent: hasTextContent
        }

        global.__inspector.dataForRequestId(successfulRequestData);
    }

    export function requestWillBeSent(requestId: number, options: any) {
        const request: NetworkAgent.Request = {
            url: options.url,
            method: options.method,
            headers: options.headers || {},
            postData: options.content ? options.content.toString() : ""
        }

        const requestData: NetworkAgent.RequestData = {
            requestId: requestId.toString(),
            url: request.url,
            request: request,
            timestamp: getTimeStamp(),
            type: "Document"
        }

        global.__inspector.requestWillBeSent(requestData);
    }

    function getTimeStamp(): number {
        var d = new Date();
        return Math.round(d.getTime() / 1000);
    }

    function mimeTypeToType(mimeType: string): string {
        let type: string = "Document";

        if (mimeType) {
            if (mimeType.indexOf("image") === 0) {
                type = "Image";
            } else if (mimeType.indexOf("javascript") !== -1 || mimeType.indexOf("json") !== -1) {
                type = "Script";
            }
        }

        return type;
    }
}