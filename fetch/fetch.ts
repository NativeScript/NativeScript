/// <reference path="webidl.d.ts" />
/// <reference path="headers.ts" />
/// <reference path="body.ts" />

// http://heycam.github.io/webidl/#common-BufferSource
class BufferSource {
}

// https://url.spec.whatwg.org/#urlsearchparams
class URLSearchParams {
}

// https://fetch.spec.whatwg.org/#concept-method
enum MethodEnum {
  OPTIONS,
  GET,
  HEAD,
  POST,
  PUT,
  DELETE,
  TRACE,
  CONNECT,
}

// https://fetch.spec.whatwg.org/#simple-method
enum SimpleMethodEnum {
  GET,
  HEAD,
  POST
}

function isSimpleMethod(method: ByteString): boolean {
  if (SimpleMethodEnum[method] !== undefined) {
    return true;
  }
  return false;
}

// https://fetch.spec.whatwg.org/#forbidden-method
enum ForbiddenMethodEnum {
  CONNECT,
  TRACE,
  TRACK
}

function isForbiddenMethod(method: ByteString): boolean {
  if (ForbiddenMethodEnum[method] !== undefined) {
    return true;
  }
  return false
}

// https://fetch.spec.whatwg.org/#requestcontext
type RequestContext = string;
enum RequestContextEnum {
  "audio",         "beacon",
  "cspreport",     "download",
  "embed",         "eventsource",
  "favicon",       "fetch",
  "font",          "form",
  "frame",         "hyperlink",
  "iframe",        "image",
  "imageset",      "import",
  "internal",      "location",
  "manifest",      "object",
  "ping",          "plugin",
  "prefetch",      "script",
  "serviceworker", "sharedworker",
  "subresource",   "style",
  "track",         "video",
  "worker",        "xmlhttprequest",
  "xslt"
};

// https://fetch.spec.whatwg.org/#concept-request-context-frame-type
enum ContextFrameTypeEnum {
  "auxiliary",
  "top-level",
  "nested",
  "none"
}

// https://fetch.spec.whatwg.org/#concept-request-mode
type RequestMode = string;
enum RequestModeEnum {
  "same-origin",
  "no-cors",
  "cors"
};

// https://fetch.spec.whatwg.org/#concept-request-credentials-mode
type RequestCredentials = string;
enum RequestCredentialsEnum {
  "omit",
  "same-origin",
  "include"
};

// https://fetch.spec.whatwg.org/#concept-request-cache-mode
type RequestCache = string;
enum RequestCacheEnum {
  "default",
  "bypass",
  "reload",
  "revalidate",
  "force-cache",
  "offline"
};

// https://fetch.spec.whatwg.org/#concept-response-type
type ResponseType = string;
enum ResponseTypeEnum {
  "basic",
  "cors",
  "default",
  "error",
  "opaque"
};

/////////////////////////////
/// Request
/////////////////////////////

// https://fetch.spec.whatwg.org/#requestinfo
type RequestInfo = Request | USVString;

// https://fetch.spec.whatwg.org/#request
interface IRequest extends IBody {
  // readonly property
  method:      ByteString;
  url:         USVString;
  headers:     Headers;
  context:     RequestContext;
  referrer:    DOMString;
  mode:        RequestMode;
  credentials: RequestCredentials;
  cache:       RequestCache;

  // method
  clone():     IRequest;
};

// https://fetch.spec.whatwg.org/#requestinit
// dictionary RequestInit
interface RequestInit {
  method:      ByteString;
  headers:     HeadersInit;
  body:        BodyInit;
  mode:        RequestMode;
  credentials: RequestCredentials;
  cache:       RequestCache;
};

type Client = Object;
type Referrer = Object;
type Context = Object;

type request = {
  method:                string;
  url:                   string;
  headerList:            Header[];
  unsafeRequestFlag:     boolean;
  body:                  body;
  //TODO: client:        Client;
  context:               Context;
  //TODO: origin:        string;
  forceOriginHeaderFlag: boolean;
  sameOriginDataURLFlag: boolean;
  //TODO: referrer:      Referrer;
  mode:                  string;
  credentialsMode:       string;
  cacheMode:             string;
}

class Request implements IRequest {
  // readonly property on IRequest
  private _method:      ByteString;
  private _url:         USVString;
  private _headers:     Headers;
  private _context:     RequestContext;
  private _referrer:    DOMString;
  private _mode:        ByteString;
  private _credentials: RequestCredentials;
  private _cache:       RequestCache;

  // readonly property on IBody
  private _bodyUsed:    boolean;

  // https://fetch.spec.whatwg.org/#dom-request-method
  get method(): ByteString {
    return this._method;
  }

  // https://fetch.spec.whatwg.org/#dom-request-url
  get url(): USVString {
    return this._url;
  }

  // https://fetch.spec.whatwg.org/#dom-request-headers
  get headers(): Headers {
    return this._headers;
  }

  // https://fetch.spec.whatwg.org/#dom-request-context
  get context(): RequestContext {
    return this._context;
  }

  // https://fetch.spec.whatwg.org/#dom-request-referrer
  get referrer(): DOMString {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-request-mode
  get mode(): RequestMode {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-request-credentials
  get credentials(): RequestCredentials {
    return this._credentials;
  }

  // https://fetch.spec.whatwg.org/#dom-request-cache
  get cache(): RequestCache {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-body-bodyused
  get bodyUsed(): boolean {
    return this._bodyUsed;
  }

  // https://fetch.spec.whatwg.org/#dom-request-clone
  // method on IRequest
  public clone(): IRequest {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-body-arraybuffer
  // method on IBody
  public arrayBuffer(): Promise<ArrayBuffer> {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-body-blob
  public blob(): Promise<Blob> {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-body-formdata
  public formData(): Promise<FormData> {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-body-json
  public json(): Promise<JSON> {
    return null;
  }

  // https://fetch.spec.whatwg.org/#dom-body-text
  public text(): Promise<USVString> {
    return null;
  }

  // Request
  public request:  request;
  public body:     body;
  public usedFlag: boolean;
  public mimeType: string;

  // https://fetch.spec.whatwg.org/#dom-request
  constructor(input: RequestInfo, init?: RequestInit) {
    // can't detect class by instanceof
    // if (input instanceof Request) { }

    var request: request;
    // step 1
    if (typeof input === "object" && input.body !== null) { // Request
      // step 1-1
      if (input.usedFlag) {
        throw new TypeError("Request already used");
      }
      // step 1-2
      input.usedFlag = true;

      // step 2
      request = input.request;
    } else {
      // step 2
      // new request otherwise
      request = {
        url:                   null,
        method:                MethodEnum[MethodEnum.GET],
        headerList:            [],
        unsafeRequestFlag:     false,
        body:                  null,
        //TODO: client:        entry settings object,
        //TODO: origin:        entry settings object.origin,
        forceOriginHeaderFlag: false,
        sameOriginDataURLFlag: false,
        referrer:              null,
        context:               null,
        mode:                  RequestModeEnum[RequestModeEnum["no-cors"]],
        credentialsMode:       RequestCredentialsEnum[RequestCredentialsEnum.omit],
        cacheMode:             RequestCacheEnum[RequestCacheEnum.default],
      }
    }

    // step 3
    request = {
      url:                   request.url,
      method:                request.method,
      headerList:            request.headerList,
      unsafeRequestFlag:     true,
      body:                  request.body,
      //TODO: client: entry settings object,
      //TODO: origin: entry settings object.origin,
      forceOriginHeaderFlag: true,
      sameOriginDataURLFlag: true,
      //TODO: referrer : request.client,
      context:               'fetch',
      mode:                  request.mode,
      credentialsMode:       request.credentialsMode,
      cacheMode:             request.cacheMode
    }

    // step 4, 5, 6
    var fallbackMode: RequestMode = null;
    var fallbackCredentials: RequestCredentials = null;
    var fallbackCache: RequestCache = null;

    //TODO:
    function parseURL(url: string): string {
      return url;
    }
    // step 7
    if (typeof input === "string") {
      // step 7-1
      var parsedURL;

      try {
        parsedURL = parseURL(input);
      } catch(err) {
        // step 7-2
        throw new TypeError(err);
      }

      // step 7-3
      request.url = parsedURL;

      // step 7-4, 7-5, 7-6
      fallbackMode = RequestModeEnum[RequestModeEnum.cors];
      fallbackCredentials = RequestCredentialsEnum[RequestCredentialsEnum.omit];
      fallbackCache = RequestCacheEnum[RequestCacheEnum.default];
    }

    // step 8
    var mode = init.mode? init.mode: fallbackMode;

    // step 9
    if (mode !== null) request.mode = mode;

    // step 10
    var credentials = init.credentials? init.credentials: fallbackCredentials;

    // step 11
    if (credentials !== null) request.credentialsMode = credentials;

    // step 12
    var cache = init.cache? init.cache: fallbackCache;

    // step 13
    if (cache !== null) request.cacheMode = cache;

    // step 14
    if (init.method) {
      var method = init.method;

      // step 14-1
      if(isForbiddenMethod(method)) {
        throw new TypeError("forbidden method " + method);
      }

      // step 14-2
      method = method.toUpperCase();

      // step 14-3
      request.method = method;
    }

    // step 15
    var r = this;
    r.request = request;
    r._headers = new Headers();

    // step 16
    var headers = r.headers;

    // step 17
    if (init.headers) {
      headers = <Headers>init.headers;
    }

    // step 18
    r.request.headerList = [];

    // step 19
    if (r.request.mode === "no-cors") {
      // 19-1
      if (!isSimpleMethod(this.request.method)) {
        throw new TypeError("not simple method" + method);
      }
      // 19-2
      r.headers.guard = "request-no-CORS";
    }

    // step 20
    r._headers = headers;

    // step 21
    if (init.body) {
      // step 21-1
      var result = extract(init.body);

      // step 21-2
      r.request.body = result.stream;

      // step 21-3
      if (result.contentType !== null) {
        var hasContentType = request.headerList.some((header) => {
          return header.name === "Content-Type";
        });

        if (!hasContentType) {
          r._headers.append("Content-Type", result.contentType);
        }
      }
    }

    // step 22
    // FIXME implement mime type extract
    r.mimeType = null;
  }
}

// https://fetch.spec.whatwg.org/#concept-bodyinit-extract
function extract(object: any): any {
  // step 1
  var stream = [];

  // step 2
  var contentType = null;

  // step 3
  switch(object.constructor) {
    // Blob
    case Blob:
      stream = object.contents;

      if (object.type) {
        contentType = object.type;
      }
    case BufferSource:
      // TODO: stream = copy(object);
    case FormData:
      // TODO:
    case URLSearchParams:
      stream = object.list.toString();
      contentType = "application/x-www-form-urlencoded;charset=UTF-8";
    case String: // USVString
      // stream = encode(object);
      contentType = "text/plain;charset=UTF-8";
  }

  // step 4
  return { stream: stream, contentType: contentType };
}



// https://fetch.spec.whatwg.org/#response
interface IResponse extends IBody { // Response implements Body;
  // static Response error();
  // static Response redirect(USVString url, optional unsigned short status = 302);

  type:       ResponseType; // readonly
  url:        USVString;    // readonly
  status:     number;       // readonly
  statusText: ByteString;   // readonly
  headers:    Headers;      // readonly
  // Response clone();
};

// https://fetch.spec.whatwg.org/#responseinit
class ResponseInit {
  status:     number = 200;
  statusText: ByteString  = "OK";
  headers:    HeadersInit;
};

class response {
  type:              string;
  terminationReason: string;
  url:               string;
  status:            number;
  statusMessage:     string;
  headerList:        Header[];
  body:              Body;
  cacheState:        string;
  TLSState:          string;

  constructor() {
    this.type              = "default";
    this.terminationReason = "timeout";
    this.url               = null;
    this.status            = 200;
    this.statusMessage     = "OK";
    this.headerList        = [];
    this.body              = null;
    this.cacheState        = "none";
    this.TLSState          = "unauthenticated";
  }
}

// https://fetch.spec.whatwg.org/#response
class Response implements IResponse {
  // implements body
  _bodyUsed: boolean;

  _type:       ResponseType; // readonly
  _url:        USVString;    // readonly
  _status:     number;       // readonly
  _statusText: ByteString;   // readonly
  _headers:    Headers;      // readonly

  _response:   response;

  // https://fetch.spec.whatwg.org/#dom-response
  // [Constructor(optional BodyInit body, optional ResponseInit init), Exposed=(Window,Worker)]
  constructor(body?: BodyInit, init?: ResponseInit) {
    if (init !== undefined) {
      // step 1
      if (init.status < 200 && init.status > 599) {
        throw new RangeError("status is not in the range 200 to 599");
      }

      // step 2
      if (init.statusText.indexOf("\r") < 0 || init.statusText.indexOf("\n") < 0) {
        throw new TypeError("Invalid Reason-Phrase token production");
      }
    }

    // step 3
    var r = this;
    r._response = new response();
    r._headers = new Headers();

    if (init !== undefined) {
      // step 4
      r._response.status = init.status;
      // step 5
      r._response.statusMessage = init.statusText;
    }

    // step 6
    if (init.headers) {
      // step 6-1
      r._response.headerList = [];

      // step 6-2
      // TODO: implements fill
      // r._response.headerList =;
    }

    // step 7
    if (body) {
      // step 7-1
      var extracted = extract(body);
      var stream = extracted.stream;
      var contentType = extracted.contentType;

      // step 7-2
      r._response.body = stream;

      // step 7-3
      if (contentType !== null) {
        var hasContentType = r._response.headerList.some((header) => {
          return header.name === "Content-Type";
        });

        if (!hasContentType) {
          // TODO: append
          // r._response.headerList.append(Header("Content-Type", contentType));
        }
      }

      // step 8
      // TODO: extracting MIME type

      // step 9
      // TODO: TLS state

      // step 10
      return r;
    }
  }

  get bodyUsed(): boolean {
    return this._bodyUsed;
  }

  get type(): ResponseType {
    return this._type;
  }

  get url(): USVString {
    return this._url;
  }

  get status(): number {
    return this._status;
  }

  get statusText(): ByteString {
    return this._statusText;
  }

  get headers(): Headers {
    return this._headers;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return null;
  }

  blob(): Promise<Blob> {
    return null;
  }

  formData(): Promise<FormData> {
    return null;
  }

  json(): Promise<JSON> {
    return null;
  }

  text(): Promise<USVString> {
    return null;
  }
}


// https://fetch.spec.whatwg.org/#globalfetch
// Window implements GlobalFetch;
interface Window {
  fetch(input: RequestInfo, init?: RequestInit): Promise<IResponse>;
};

// WorkerGlobalScope implements GlobalFetch;
this.fetch = function(input: RequestInfo, init?: RequestInit): Promise<IResponse> {
  // step 1
  var p = new Promise<IResponse>((resolve, reject) => {
    try {
      // step 2
      var r = (new Request(input, init)).request;
    } catch(e) {
      reject(e);
    }
  });

  // step 4
  return p
}

// WorkerGlobalScope implements GlobalFetch;
