/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

interface Event {
    bubbles: boolean;
    cancelBubble: boolean;
    cancelable: boolean;
    currentTarget: EventTarget;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    returnValue: boolean;
    srcElement: any /* Element */;
    target: EventTarget;
    timeStamp: number;
    type: string;
    initEvent(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean): void;
    preventDefault(): void;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
    AT_TARGET: number;
    BUBBLING_PHASE: number;
    CAPTURING_PHASE: number;
}

interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
}

interface ProgressEventInit extends EventInit {
    lengthComputable?: boolean;
    loaded?: number;
    total?: number;
}

interface ProgressEvent extends Event {
    lengthComputable: boolean;
    loaded: number;
    total: number;
    initProgressEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, lengthComputableArg: boolean, loadedArg: number, totalArg: number): void;
}

declare var ProgressEvent: {
    prototype: ProgressEvent;
    new(type: string, eventInitDict?: ProgressEventInit): ProgressEvent;
}

interface ErrorEvent extends Event {
    colno: number;
    error: any;
    filename: string;
    lineno: number;
    message: string;
    initErrorEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, messageArg: string, filenameArg: string, linenoArg: number): void;
}

declare var ErrorEvent: {
    prototype: ErrorEvent;
    new(): ErrorEvent;
}

interface EventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    dispatchEvent(evt: Event): boolean;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

declare var EventTarget: {
    prototype: EventTarget;
    new(): EventTarget;
}

interface EventListenerObject {
    handleEvent(evt: Event): void;
}

interface EventListener {
    (evt: Event): void;
}

declare type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

interface XMLHttpRequestEventTarget {
    onabort: (ev: Event) => any;
    onerror: (ev: Event) => any;
    onload: (ev: Event) => any;
    onloadend: (ev: ProgressEvent) => any;
    onloadstart: (ev: Event) => any;
    onprogress: (ev: ProgressEvent) => any;
    ontimeout: (ev: ProgressEvent) => any;
    addEventListener(type: "abort", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "error", listener: (ev: ErrorEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "load", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "loadend", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "loadstart", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "progress", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "timeout", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface XMLHttpRequest extends EventTarget, XMLHttpRequestEventTarget {
    msCaching: string;
    onreadystatechange: (ev: ProgressEvent) => any;
    readyState: number;
    response: any;
    responseBody: any;
    responseText: string;
    responseType: string;
    responseXML: any;
    status: number;
    statusText: string;
    timeout: number;
    upload: XMLHttpRequestUpload;
    withCredentials: boolean;
    abort(): void;
    getAllResponseHeaders(): string;
    getResponseHeader(header: string): string;
    msCachingEnabled(): boolean;
    open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
    overrideMimeType(mime: string): void;
    // send(data?: Document): void;
    send(data?: string): void;
    send(data?: any): void;
    setRequestHeader(header: string, value: string): void;
    DONE: number;
    HEADERS_RECEIVED: number;
    LOADING: number;
    OPENED: number;
    UNSENT: number;
    addEventListener(type: "abort", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "error", listener: (ev: ErrorEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "load", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "loadend", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "loadstart", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "progress", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "readystatechange", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "timeout", listener: (ev: ProgressEvent) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

declare var XMLHttpRequest: {
    prototype: XMLHttpRequest;
    new(): XMLHttpRequest;
    DONE: number;
    HEADERS_RECEIVED: number;
    LOADING: number;
    OPENED: number;
    UNSENT: number;
    create(): XMLHttpRequest;
}

interface XMLHttpRequestUpload extends EventTarget, XMLHttpRequestEventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

declare var XMLHttpRequestUpload: {
    prototype: XMLHttpRequestUpload;
    new(): XMLHttpRequestUpload;
}

interface FormData {
    append(name: any, value: any, blobName?: string): void;
}

declare var FormData: {
    prototype: FormData;
    new (/* form?: HTMLFormElement */): FormData;
}

interface BlobPropertyBag {
    type?: string;
    endings?: string;
}

interface Blob {
    size: number;
    type: string;
    msClose(): void;
    msDetachStream(): any;
    slice(start?: number, end?: number, contentType?: string): Blob;
}

declare var Blob: {
    prototype: Blob;
    new (blobParts?: any[], options?: BlobPropertyBag): Blob;
}

declare function alert(message?: any): void;
