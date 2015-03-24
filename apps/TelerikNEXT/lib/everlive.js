// This script will be executed in the context of a native script module
var window = window || {};
var isNativeScriptApplication = ((typeof android !== 'undefined' && android && android.widget && android.widget.Button)
    || (typeof UIButton !== 'undefined' && UIButton));
/*!
 * Reqwest! A general purpose XHR connection manager
 * (c) Dustin Diaz 2013
 * https://github.com/ded/reqwest
 * license MIT
 */
!function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(definition)
    else context[name] = definition()
}('reqwest', this, function () {

    // if we're in a nativescript application don't initialize this library
    if (typeof (isNativeScriptApplication) !== 'undefined' && isNativeScriptApplication) {
        return;
    }

    var win = window
        , doc = document
        , twoHundo = /^20\d$/
        , byTag = 'getElementsByTagName'
        , readyState = 'readyState'
        , contentType = 'Content-Type'
        , requestedWith = 'X-Requested-With'
        , head = doc[byTag]('head')[0]
        , uniqid = 0
        , callbackPrefix = 'reqwest_' + (+new Date())
        , lastValue // data stored by the most recent JSONP callback
        , xmlHttpRequest = 'XMLHttpRequest'
        , noop = function () { }

        , isArray = typeof Array.isArray == 'function'
            ? Array.isArray
            : function (a) {
                return a instanceof Array
            }

        , defaultHeaders = {
            contentType: 'application/x-www-form-urlencoded'
            , requestedWith: xmlHttpRequest
            , accept: {
                '*': 'text/javascript, text/html, application/xml, text/xml, */*'
                , xml: 'application/xml, text/xml'
                , html: 'text/html'
                , text: 'text/plain'
                , json: 'application/json, text/javascript'
                , js: 'application/javascript, text/javascript'
            }
        }

        , xhr = win[xmlHttpRequest]
            ? function () {
                return new XMLHttpRequest()
            }
            : function () {
                return new ActiveXObject('Microsoft.XMLHTTP')
            }
        , globalSetupOptions = {
            dataFilter: function (data) {
                return data
            }
        }

    function handleReadyState(r, success, error) {
        return function () {
            // use _aborted to mitigate against IE err c00c023f
            // (can't read props on aborted request objects)
            if (r._aborted) return error(r.request)
            if (r.request && r.request[readyState] == 4) {
                r.request.onreadystatechange = noop
                if (twoHundo.test(r.request.status))
                    success(r.request)
                else
                    error(r.request)
            }
        }
    }

    function setHeaders(http, o) {
        var headers = o.headers || {}
            , h

        headers.Accept = headers.Accept
            || defaultHeaders.accept[o.type]
            || defaultHeaders.accept['*']

        // breaks cross-origin requests with legacy browsers
        if (!o.crossOrigin && !headers[requestedWith]) headers[requestedWith] = defaultHeaders.requestedWith
        if (!headers[contentType]) headers[contentType] = o.contentType || defaultHeaders.contentType
        for (h in headers)
            headers.hasOwnProperty(h) && http.setRequestHeader(h, headers[h])
    }

    function setCredentials(http, o) {
        if (typeof o.withCredentials !== 'undefined' && typeof http.withCredentials !== 'undefined') {
            http.withCredentials = !!o.withCredentials
        }
    }

    function generalCallback(data) {
        lastValue = data
    }

    function urlappend(url, s) {
        return url + (/\?/.test(url) ? '&' : '?') + s
    }

    function handleJsonp(o, fn, err, url) {
        var reqId = uniqid++
            , cbkey = o.jsonpCallback || 'callback' // the 'callback' key
            , cbval = o.jsonpCallbackName || reqwest.getcallbackPrefix(reqId)
        // , cbval = o.jsonpCallbackName || ('reqwest_' + reqId) // the 'callback' value
            , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
            , match = url.match(cbreg)
            , script = doc.createElement('script')
            , loaded = 0
            , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1

        if (match) {
            if (match[3] === '?') {
                url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
            } else {
                cbval = match[3] // provided callback func name
            }
        } else {
            url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
        }

        win[cbval] = generalCallback

        script.type = 'text/javascript'
        script.src = url
        script.async = true
        if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
            // need this for IE due to out-of-order onreadystatechange(), binding script
            // execution to an event listener gives us control over when the script
            // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
            //
            // if this hack is used in IE10 jsonp callback are never called
            script.event = 'onclick'
            script.htmlFor = script.id = '_reqwest_' + reqId
        }

        script.onload = script.onreadystatechange = function () {
            if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
                return false
            }
            script.onload = script.onreadystatechange = null
            script.onclick && script.onclick()
            // Call the user callback with the last value stored and clean up values and scripts.
            o.success && o.success(lastValue)
            lastValue = undefined
            head.removeChild(script)
            loaded = 1
        }

        // Add the script to the DOM head
        head.appendChild(script)

        // Enable JSONP timeout
        return {
            abort: function () {
                script.onload = script.onreadystatechange = null
                o.error && o.error({}, 'Request is aborted: timeout', {})
                lastValue = undefined
                head.removeChild(script)
                loaded = 1
            }
        }
    }

    function getRequest(fn, err) {
        var o = this.o
            , method = (o.method || 'GET').toUpperCase()
            , url = typeof o === 'string' ? o : o.url
        // convert non-string objects to query-string form unless o.processData is false
            , data = (o.processData !== false && o.data && typeof o.data !== 'string')
                ? reqwest.toQueryString(o.data)
                : (o.data || null)
            , http

        // if we're working on a GET request and we have data then we should append
        // query string to end of URL and not post data
        if ((o.type == 'jsonp' || method == 'GET') && data) {
            url = urlappend(url, data)
            data = null
        }

        if (o.type == 'jsonp') return handleJsonp(o, fn, err, url)

        http = xhr()
        http.open(method, url, true)
        setHeaders(http, o)
        setCredentials(http, o)
        http.onreadystatechange = handleReadyState(this, fn, err)
        o.before && o.before(http)
        http.send(data)
        return http
    }

    function Reqwest(o, fn) {
        this.o = o
        this.fn = fn

        init.apply(this, arguments)
    }

    function setType(url) {
        var m = url.match(/\.(json|jsonp|html|xml)(\?|$)/)
        return m ? m[1] : 'js'
    }

    function init(o, fn) {

        this.url = typeof o == 'string' ? o : o.url
        this.timeout = null

        // whether request has been fulfilled for purpose
        // of tracking the Promises
        this._fulfilled = false
        // success handlers
        this._fulfillmentHandlers = []
        // error handlers
        this._errorHandlers = []
        // complete (both success and fail) handlers
        this._completeHandlers = []
        this._erred = false
        this._responseArgs = {}

        var self = this
            , type = o.type || setType(this.url)

        fn = fn || function () { }

        if (o.timeout) {
            this.timeout = setTimeout(function () {
                self.abort()
            }, o.timeout)
        }

        if (o.success) {
            this._fulfillmentHandlers.push(function () {
                o.success.apply(o, arguments)
            })
        }

        if (o.error) {
            this._errorHandlers.push(function () {
                o.error.apply(o, arguments)
            })
        }

        if (o.complete) {
            this._completeHandlers.push(function () {
                o.complete.apply(o, arguments)
            })
        }

        function complete(resp) {
            o.timeout && clearTimeout(self.timeout)
            self.timeout = null
            while (self._completeHandlers.length > 0) {
                self._completeHandlers.shift()(resp)
            }
        }

        function success(resp) {
            // use global data filter on response text
            var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type)
                , r = resp.responseText = filteredResponse
            if (r) {
                switch (type) {
                    case 'json':
                        try {
                            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')
                        } catch (err) {
                            return error(resp, 'Could not parse JSON in response', err)
                        }
                        break
                    case 'js':
                        resp = eval(r)
                        break
                    case 'html':
                        resp = r
                        break
                    case 'xml':
                        resp = resp.responseXML
                            && resp.responseXML.parseError // IE trololo
                            && resp.responseXML.parseError.errorCode
                            && resp.responseXML.parseError.reason
                            ? null
                            : resp.responseXML
                        break
                }
            }

            self._responseArgs.resp = resp
            self._fulfilled = true
            fn(resp)
            while (self._fulfillmentHandlers.length > 0) {
                self._fulfillmentHandlers.shift()(resp)
            }

            complete(resp)
        }

        function error(resp, msg, t) {
            self._responseArgs.resp = resp
            self._responseArgs.msg = msg
            self._responseArgs.t = t
            self._erred = true
            while (self._errorHandlers.length > 0) {
                self._errorHandlers.shift()(resp, msg, t)
            }
            complete(resp)
        }

        this.request = getRequest.call(this, success, error)
    }

    Reqwest.prototype = {
        abort: function () {
            this._aborted = true
            this.request.abort()
        }

        , retry: function () {
            init.call(this, this.o, this.fn)
        }

        /**
         * Small deviation from the Promises A CommonJs specification
         * http://wiki.commonjs.org/wiki/Promises/A
         */

        /**
         * `then` will execute upon successful requests
         */
        , then: function (success, fail) {
            if (this._fulfilled) {
                success(this._responseArgs.resp)
            } else if (this._erred) {
                fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
            } else {
                this._fulfillmentHandlers.push(success)
                this._errorHandlers.push(fail)
            }
            return this
        }

        /**
         * `always` will execute whether the request succeeds or fails
         */
        , always: function (fn) {
            if (this._fulfilled || this._erred) {
                fn(this._responseArgs.resp)
            } else {
                this._completeHandlers.push(fn)
            }
            return this
        }

        /**
         * `fail` will execute when the request fails
         */
        , fail: function (fn) {
            if (this._erred) {
                fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
            } else {
                this._errorHandlers.push(fn)
            }
            return this
        }
    }

    function reqwest(o, fn) {
        return new Reqwest(o, fn)
    }

    // normalize newline variants according to spec -> CRLF
    function normalize(s) {
        return s ? s.replace(/\r?\n/g, '\r\n') : ''
    }

    function serial(el, cb) {
        var n = el.name
            , t = el.tagName.toLowerCase()
            , optCb = function (o) {
                // IE gives value="" even where there is no value attribute
                // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
                if (o && !o.disabled)
                    cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text))
            }
            , ch, ra, val, i

        // don't serialize elements that are disabled or without a name
        if (el.disabled || !n) return

        switch (t) {
            case 'input':
                if (!/reset|button|image|file/i.test(el.type)) {
                    ch = /checkbox/i.test(el.type)
                    ra = /radio/i.test(el.type)
                    val = el.value
                    // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
                    ; (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
                }
                break
            case 'textarea':
                cb(n, normalize(el.value))
                break
            case 'select':
                if (el.type.toLowerCase() === 'select-one') {
                    optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
                } else {
                    for (i = 0; el.length && i < el.length; i++) {
                        el.options[i].selected && optCb(el.options[i])
                    }
                }
                break
        }
    }

    // collect up all form elements found from the passed argument elements all
    // the way down to child elements; pass a '<form>' or form fields.
    // called with 'this'=callback to use for serial() on each element
    function eachFormElement() {
        var cb = this
            , e, i
            , serializeSubtags = function (e, tags) {
                var i, j, fa
                for (i = 0; i < tags.length; i++) {
                    fa = e[byTag](tags[i])
                    for (j = 0; j < fa.length; j++) serial(fa[j], cb)
                }
            }

        for (i = 0; i < arguments.length; i++) {
            e = arguments[i]
            if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
            serializeSubtags(e, ['input', 'select', 'textarea'])
        }
    }

    // standard query string style serialization
    function serializeQueryString() {
        return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
    }

    // { 'name': 'value', ... } style serialization
    function serializeHash() {
        var hash = {}
        eachFormElement.apply(function (name, value) {
            if (name in hash) {
                hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
                hash[name].push(value)
            } else hash[name] = value
        }, arguments)
        return hash
    }

    // [ { name: 'name', value: 'value' }, ... ] style serialization
    reqwest.serializeArray = function () {
        var arr = []
        eachFormElement.apply(function (name, value) {
            arr.push({ name: name, value: value })
        }, arguments)
        return arr
    }

    reqwest.serialize = function () {
        if (arguments.length === 0) return ''
        var opt, fn
            , args = Array.prototype.slice.call(arguments, 0)

        opt = args.pop()
        opt && opt.nodeType && args.push(opt) && (opt = null)
        opt && (opt = opt.type)

        if (opt == 'map') fn = serializeHash
        else if (opt == 'array') fn = reqwest.serializeArray
        else fn = serializeQueryString

        return fn.apply(null, args)
    }

    reqwest.toQueryString = function (o) {
        var qs = '', i
            , enc = encodeURIComponent
            , push = function (k, v) {
                qs += enc(k) + '=' + enc(v) + '&'
            }
            , k, v

        if (isArray(o)) {
            for (i = 0; o && i < o.length; i++) push(o[i].name, o[i].value)
        } else {
            for (k in o) {
                if (!Object.hasOwnProperty.call(o, k)) continue
                v = o[k]
                if (isArray(v)) {
                    for (i = 0; i < v.length; i++) push(k, v[i])
                } else push(k, o[k])
            }
        }

        // spaces should be + according to spec
        return qs.replace(/&$/, '').replace(/%20/g, '+')
    }

    reqwest.getcallbackPrefix = function () {
        return callbackPrefix
    }

    // jQuery and Zepto compatibility, differences can be remapped here so you can call
    // .ajax.compat(options, callback)
    reqwest.compat = function (o, fn) {
        if (o) {
            o.type && (o.method = o.type) && delete o.type
            o.dataType && (o.type = o.dataType)
            o.jsonpCallback && (o.jsonpCallbackName = o.jsonpCallback) && delete o.jsonpCallback
            o.jsonp && (o.jsonpCallback = o.jsonp)
        }
        return new Reqwest(o, fn)
    }

    reqwest.ajaxSetup = function (options) {
        options = options || {}
        for (var k in options) {
            globalSetupOptions[k] = options[k]
        }
    }

    return reqwest
});
// RSVP.js provides simple tools for organizing asynchronous code.
// https://github.com/tildeio/rsvp.js
// Copyright (c) 2013 Yehuda Katz, Tom Dale, and contributors
(function () {

    // if we're in a nativescript application don't initialize this library
    if (typeof (isNativeScriptApplication) !== 'undefined' && isNativeScriptApplication) {
        return;
    }

    var define, requireModule;

    (function () {
        var registry = {}, seen = {};

        define = function (name, deps, callback) {
            registry[name] = { deps: deps, callback: callback };
        };

        requireModule = function (name) {
            if (seen[name]) { return seen[name]; }
            seen[name] = {};

            var mod = registry[name],
                deps = mod.deps,
                callback = mod.callback,
                reified = [],
                exports;

            for (var i = 0, l = deps.length; i < l; i++) {
                if (deps[i] === 'exports') {
                    reified.push(exports = {});
                } else {
                    reified.push(requireModule(deps[i]));
                }
            }

            var value = callback.apply(this, reified);
            return seen[name] = exports || value;
        };
    })();

    define("rsvp/all",
        ["rsvp/defer", "exports"],
        function (__dependency1__, __exports__) {
            "use strict";
            var defer = __dependency1__.defer;

            function all(promises) {
                var results = [], deferred = defer(), remaining = promises.length;

                if (remaining === 0) {
                    deferred.resolve([]);
                }

                var resolver = function (index) {
                    return function (value) {
                        resolveAll(index, value);
                    };
                };

                var resolveAll = function (index, value) {
                    results[index] = value;
                    if (--remaining === 0) {
                        deferred.resolve(results);
                    }
                };

                var rejectAll = function (error) {
                    deferred.reject(error);
                };

                for (var i = 0; i < promises.length; i++) {
                    if (promises[i] && typeof promises[i].then === 'function') {
                        promises[i].then(resolver(i), rejectAll);
                    } else {
                        resolveAll(i, promises[i]);
                    }
                }
                return deferred.promise;
            }

            __exports__.all = all;
        });

    define("rsvp/async",
        ["exports"],
        function (__exports__) {
            "use strict";
            var browserGlobal = (typeof window !== 'undefined') ? window : {};

            var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
            var async;

            if (typeof process !== 'undefined' &&
                {}.toString.call(process) === '[object process]') {
                async = function (callback, binding) {
                    process.nextTick(function () {
                        callback.call(binding);
                    });
                };
            } else if (BrowserMutationObserver) {
                var queue = [];

                var observer = new BrowserMutationObserver(function () {
                    var toProcess = queue.slice();
                    queue = [];

                    toProcess.forEach(function (tuple) {
                        var callback = tuple[0], binding = tuple[1];
                        callback.call(binding);
                    });
                });

                var element = document.createElement('div');
                observer.observe(element, { attributes: true });

                // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
                window.addEventListener('unload', function () {
                    observer.disconnect();
                    observer = null;
                });

                async = function (callback, binding) {
                    queue.push([callback, binding]);
                    element.setAttribute('drainQueue', 'drainQueue');
                };
            } else {
                async = function (callback, binding) {
                    setTimeout(function () {
                        callback.call(binding);
                    }, 1);
                };
            }


            __exports__.async = async;
        });

    define("rsvp/config",
        ["rsvp/async", "exports"],
        function (__dependency1__, __exports__) {
            "use strict";
            var async = __dependency1__.async;

            var config = {};
            config.async = async;

            __exports__.config = config;
        });

    define("rsvp/defer",
        ["rsvp/promise", "exports"],
        function (__dependency1__, __exports__) {
            "use strict";
            var Promise = __dependency1__.Promise;

            function defer() {
                var deferred = {};

                var promise = new Promise(function (resolve, reject) {
                    deferred.resolve = resolve;
                    deferred.reject = reject;
                });

                deferred.promise = promise;
                return deferred;
            }

            __exports__.defer = defer;
        });

    define("rsvp/events",
        ["exports"],
        function (__exports__) {
            "use strict";
            var Event = function (type, options) {
                this.type = type;

                for (var option in options) {
                    if (!options.hasOwnProperty(option)) { continue; }

                    this[option] = options[option];
                }
            };

            var indexOf = function (callbacks, callback) {
                for (var i = 0, l = callbacks.length; i < l; i++) {
                    if (callbacks[i][0] === callback) { return i; }
                }

                return -1;
            };

            var callbacksFor = function (object) {
                var callbacks = object._promiseCallbacks;

                if (!callbacks) {
                    callbacks = object._promiseCallbacks = {};
                }

                return callbacks;
            };

            var EventTarget = {
                mixin: function (object) {
                    object.on = this.on;
                    object.off = this.off;
                    object.trigger = this.trigger;
                    return object;
                },

                on: function (eventNames, callback, binding) {
                    var allCallbacks = callbacksFor(this), callbacks, eventName;
                    eventNames = eventNames.split(/\s+/);
                    binding = binding || this;

                    while (eventName = eventNames.shift()) {
                        callbacks = allCallbacks[eventName];

                        if (!callbacks) {
                            callbacks = allCallbacks[eventName] = [];
                        }

                        if (indexOf(callbacks, callback) === -1) {
                            callbacks.push([callback, binding]);
                        }
                    }
                },

                off: function (eventNames, callback) {
                    var allCallbacks = callbacksFor(this), callbacks, eventName, index;
                    eventNames = eventNames.split(/\s+/);

                    while (eventName = eventNames.shift()) {
                        if (!callback) {
                            allCallbacks[eventName] = [];
                            continue;
                        }

                        callbacks = allCallbacks[eventName];

                        index = indexOf(callbacks, callback);

                        if (index !== -1) { callbacks.splice(index, 1); }
                    }
                },

                trigger: function (eventName, options) {
                    var allCallbacks = callbacksFor(this),
                        callbacks, callbackTuple, callback, binding, event;

                    if (callbacks = allCallbacks[eventName]) {
                        // Don't cache the callbacks.length since it may grow
                        for (var i = 0; i < callbacks.length; i++) {
                            callbackTuple = callbacks[i];
                            callback = callbackTuple[0];
                            binding = callbackTuple[1];

                            if (typeof options !== 'object') {
                                options = { detail: options };
                            }

                            event = new Event(eventName, options);
                            callback.call(binding, event);
                        }
                    }
                }
            };


            __exports__.EventTarget = EventTarget;
        });

    define("rsvp/hash",
        ["rsvp/defer", "exports"],
        function (__dependency1__, __exports__) {
            "use strict";
            var defer = __dependency1__.defer;

            function size(object) {
                var size = 0;

                for (var prop in object) {
                    size++;
                }

                return size;
            }

            function hash(promises) {
                var results = {}, deferred = defer(), remaining = size(promises);

                if (remaining === 0) {
                    deferred.resolve({});
                }

                var resolver = function (prop) {
                    return function (value) {
                        resolveAll(prop, value);
                    };
                };

                var resolveAll = function (prop, value) {
                    results[prop] = value;
                    if (--remaining === 0) {
                        deferred.resolve(results);
                    }
                };

                var rejectAll = function (error) {
                    deferred.reject(error);
                };

                for (var prop in promises) {
                    if (promises[prop] && typeof promises[prop].then === 'function') {
                        promises[prop].then(resolver(prop), rejectAll);
                    } else {
                        resolveAll(prop, promises[prop]);
                    }
                }

                return deferred.promise;
            }

            __exports__.hash = hash;
        });

    define("rsvp/node",
        ["rsvp/promise", "rsvp/all", "exports"],
        function (__dependency1__, __dependency2__, __exports__) {
            "use strict";
            var Promise = __dependency1__.Promise;
            var all = __dependency2__.all;

            function makeNodeCallbackFor(resolve, reject) {
                return function (error, value) {
                    if (error) {
                        reject(error);
                    } else if (arguments.length > 2) {
                        resolve(Array.prototype.slice.call(arguments, 1));
                    } else {
                        resolve(value);
                    }
                };
            }

            function denodeify(nodeFunc) {
                return function () {
                    var nodeArgs = Array.prototype.slice.call(arguments), resolve, reject;

                    var promise = new Promise(function (nodeResolve, nodeReject) {
                        resolve = nodeResolve;
                        reject = nodeReject;
                    });

                    all(nodeArgs).then(function (nodeArgs) {
                        nodeArgs.push(makeNodeCallbackFor(resolve, reject));

                        try {
                            nodeFunc.apply(this, nodeArgs);
                        } catch (e) {
                            reject(e);
                        }
                    });

                    return promise;
                };
            }

            __exports__.denodeify = denodeify;
        });

    define("rsvp/promise",
        ["rsvp/config", "rsvp/events", "exports"],
        function (__dependency1__, __dependency2__, __exports__) {
            "use strict";
            var config = __dependency1__.config;
            var EventTarget = __dependency2__.EventTarget;

            function objectOrFunction(x) {
                return isFunction(x) || (typeof x === "object" && x !== null);
            }

            function isFunction(x) {
                return typeof x === "function";
            }

            var Promise = function (resolver) {
                var promise = this,
                    resolved = false;

                if (typeof resolver !== 'function') {
                    throw new TypeError('You must pass a resolver function as the sole argument to the promise constructor');
                }

                if (!(promise instanceof Promise)) {
                    return new Promise(resolver);
                }

                var resolvePromise = function (value) {
                    if (resolved) { return; }
                    resolved = true;
                    resolve(promise, value);
                };

                var rejectPromise = function (value) {
                    if (resolved) { return; }
                    resolved = true;
                    reject(promise, value);
                };

                this.on('promise:resolved', function (event) {
                    this.trigger('success', { detail: event.detail });
                }, this);

                this.on('promise:failed', function (event) {
                    this.trigger('error', { detail: event.detail });
                }, this);

                resolver(resolvePromise, rejectPromise);
            };

            var invokeCallback = function (type, promise, callback, event) {
                var hasCallback = isFunction(callback),
                    value, error, succeeded, failed;

                if (hasCallback) {
                    try {
                        value = callback(event.detail);
                        succeeded = true;
                    } catch (e) {
                        failed = true;
                        error = e;
                    }
                } else {
                    value = event.detail;
                    succeeded = true;
                }

                if (objectOrFunction(value) && isFunction(value.then)) {
                    value.then(function (value) {
                        resolve(promise, value);
                    }, function (error) {
                        reject(promise, error);
                    });
                } else if (hasCallback && succeeded) {
                    resolve(promise, value);
                } else if (failed) {
                    reject(promise, error);
                } else if (type === 'resolve') {
                    resolve(promise, value);
                } else if (type === 'reject') {
                    reject(promise, value);
                }
            };

            Promise.prototype = {
                constructor: Promise,

                then: function (done, fail) {
                    var thenPromise = new Promise(function () { });

                    if (this.isFulfilled) {
                        config.async(function () {
                            invokeCallback('resolve', thenPromise, done, { detail: this.fulfillmentValue });
                        }, this);
                    }

                    if (this.isRejected) {
                        config.async(function () {
                            invokeCallback('reject', thenPromise, fail, { detail: this.rejectedReason });
                        }, this);
                    }

                    this.on('promise:resolved', function (event) {
                        invokeCallback('resolve', thenPromise, done, event);
                    });

                    this.on('promise:failed', function (event) {
                        invokeCallback('reject', thenPromise, fail, event);
                    });

                    return thenPromise;
                }
            };

            EventTarget.mixin(Promise.prototype);

            function resolve(promise, value) {

                if (promise === value) {
                    fulfill(promise, value);
                } else if (objectOrFunction(value) && isFunction(value.then)) {
                    value.then(function (val) {
                        if (value !== val) {
                            resolve(promise, val);
                        } else {
                            fulfill(promise, val);
                        }
                    }, function (val) {
                        reject(promise, val);
                    });
                } else {
                    fulfill(promise, value);
                }
            }

            function fulfill(promise, value) {
                config.async(function () {
                    promise.trigger('promise:resolved', { detail: value });
                    promise.isFulfilled = true;
                    promise.fulfillmentValue = value;
                });
            }

            function reject(promise, value) {
                config.async(function () {
                    promise.trigger('promise:failed', { detail: value });
                    promise.isRejected = true;
                    promise.rejectedReason = value;
                });
            }


            __exports__.Promise = Promise;
        });

    define("rsvp/resolve",
        ["rsvp/promise", "exports"],
        function (__dependency1__, __exports__) {
            "use strict";
            var Promise = __dependency1__.Promise;


            function objectOrFunction(x) {
                return typeof x === "function" || (typeof x === "object" && x !== null);
            }

            function resolve(thenable) {
                var promise = new Promise(function (resolve, reject) {
                    var then;

                    try {
                        if (objectOrFunction(thenable)) {
                            then = thenable.then;

                            if (typeof then === "function") {
                                then.call(thenable, resolve, reject);
                            } else {
                                resolve(thenable);
                            }

                        } else {
                            resolve(thenable);
                        }

                    } catch (error) {
                        reject(error);
                    }
                });

                return promise;
            }


            __exports__.resolve = resolve;
        });

    define("rsvp",
        ["rsvp/events", "rsvp/promise", "rsvp/node", "rsvp/all", "rsvp/hash", "rsvp/defer", "rsvp/config", "rsvp/resolve", "exports"],
        function (__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __exports__) {
            "use strict";
            var EventTarget = __dependency1__.EventTarget;
            var Promise = __dependency2__.Promise;
            var denodeify = __dependency3__.denodeify;
            var all = __dependency4__.all;
            var hash = __dependency5__.hash;
            var defer = __dependency6__.defer;
            var config = __dependency7__.config;
            var resolve = __dependency8__.resolve;

            function configure(name, value) {
                config[name] = value;
            }


            __exports__.Promise = Promise;
            __exports__.EventTarget = EventTarget;
            __exports__.all = all;
            __exports__.hash = hash;
            __exports__.defer = defer;
            __exports__.denodeify = denodeify;
            __exports__.configure = configure;
            __exports__.resolve = resolve;
        });

    window.RSVP = requireModule('rsvp');
})();
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function () {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
        nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeReduce = ArrayProto.reduce,
        nativeReduceRight = ArrayProto.reduceRight,
        nativeFilter = ArrayProto.filter,
        nativeEvery = ArrayProto.every,
        nativeSome = ArrayProto.some,
        nativeIndexOf = ArrayProto.indexOf,
        nativeLastIndexOf = ArrayProto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function (obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // Current version.
    _.VERSION = '1.4.4';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function (obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function (value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };

    var reduceError = 'Reduce of empty array with no initial value';

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function (value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
            var keys = _.keys(obj);
            length = keys.length;
        }
        each(obj, function (value, index, list) {
            index = keys ? keys[--length] : --length;
            if (!initial) {
                memo = obj[index];
                initial = true;
            } else {
                memo = iterator.call(context, memo, obj[index], index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function (obj, iterator, context) {
        var result;
        any(obj, function (value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };

    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function (value, index, list) {
            if (iterator.call(context, value, index, list)) results.push(value);
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    _.reject = function (obj, iterator, context) {
        return _.filter(obj, function (value, index, list) {
            return !iterator.call(context, value, index, list);
        }, context);
    };

    // Determine whether all of the elements match a truth test.
    // Delegates to **ECMAScript 5**'s native `every` if available.
    // Aliased as `all`.
    _.every = _.all = function (obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function (value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function (obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function (value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if the array or object contains a given value (using `===`).
    // Aliased as `include`.
    _.contains = _.include = function (obj, target) {
        if (obj == null) return false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        return any(obj, function (value) {
            return value === target;
        });
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function (value) {
            return (isFunc ? method : value[method]).apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function (obj, key) {
        return _.map(obj, function (value) { return value[key]; });
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    _.where = function (obj, attrs, first) {
        if (_.isEmpty(attrs)) return first ? void 0 : [];
        return _[first ? 'find' : 'filter'](obj, function (value) {
            for (var key in attrs) {
                if (attrs[key] !== value[key]) return false;
            }
            return true;
        });
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    _.findWhere = function (obj, attrs) {
        return _.where(obj, attrs, true);
    };

    // Return the maximum element or (element-based computation).
    // Can't optimize arrays of integers longer than 65,535 elements.
    // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
    _.max = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.max.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return -Infinity;
        var result = { computed: -Infinity, value: -Infinity };
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = { value: value, computed: computed });
        });
        return result.value;
    };

    // Return the minimum element (or element-based computation).
    _.min = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.min.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = { computed: Infinity, value: Infinity };
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = { value: value, computed: computed });
        });
        return result.value;
    };

    // Shuffle an array.
    _.shuffle = function (obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function (value) {
            rand = _.random(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };

    // An internal function to generate lookup iterators.
    var lookupIterator = function (value) {
        return _.isFunction(value) ? value : function (obj) { return obj[value]; };
    };

    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function (obj, value, context) {
        var iterator = lookupIterator(value);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index < right.index ? -1 : 1;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    var group = function (obj, value, context, behavior) {
        var result = {};
        var iterator = lookupIterator(value == null ? _.identity : value);
        each(obj, function (value, index) {
            var key = iterator.call(context, value, index, obj);
            behavior(result, key, value);
        });
        return result;
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = function (obj, value, context) {
        return group(obj, value, context, function (result, key, value) {
            (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
        });
    };

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    _.countBy = function (obj, value, context) {
        return group(obj, value, context, function (result, key) {
            if (!_.has(result, key)) result[key] = 0;
            result[key]++;
        });
    };

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function (array, obj, iterator, context) {
        iterator = iterator == null ? _.identity : lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0, high = array.length;
        while (low < high) {
            var mid = (low + high) >>> 1;
            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    };

    // Safely convert anything iterable into a real, live array.
    _.toArray = function (obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return _.map(obj, _.identity);
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function (obj) {
        if (obj == null) return 0;
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null) return void 0;
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N. The **guard** check allows it to work with
    // `_.map`.
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array. The **guard** check allows it to work with `_.map`.
    _.last = function (array, n, guard) {
        if (array == null) return void 0;
        if ((n != null) && !guard) {
            return slice.call(array, Math.max(array.length - n, 0));
        } else {
            return array[array.length - 1];
        }
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array. The **guard**
    // check allows it to work with `_.map`.
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    _.compact = function (array) {
        return _.filter(array, _.identity);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function (input, shallow, output) {
        each(input, function (value) {
            if (_.isArray(value)) {
                shallow ? push.apply(output, value) : flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    };

    // Return a completely flattened version of an array.
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, []);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function (array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function (value, index) {
            if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function () {
        return _.uniq(concat.apply(ArrayProto, arguments));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    _.intersection = function (array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function (item) {
            return _.every(rest, function (other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function (array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function (value) { return !_.contains(rest, value); });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function () {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, 'length'));
        var results = new Array(length);
        for (var i = 0; i < length; i++) {
            results[i] = _.pluck(args, "" + i);
        }
        return results;
    };

    // The inverse operation to `_.zip`. If given an array of pairs it
    // returns an array of the paired elements split into two left and
    // right element arrays, if given an array of triples it returns a
    // three element array and so on. For example, `_.unzip` given
    // `[['a',1],['b',2],['c',3]]` returns the array
    // [['a','b','c'],[1,2,3]].
    _.unzip = function (tuples) {
        var maxLen = _.max(_.pluck(tuples, "length"))
        return _.times(maxLen, _.partial(_.pluck, tuples));
    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    _.object = function (list, values) {
        if (list == null) return {};
        var result = {};
        for (var i = 0, l = list.length; i < l; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    // Delegates to **ECMAScript 5**'s native `indexOf` if available.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = function (array, item, isSorted) {
        if (array == null) return -1;
        var i = 0, l = array.length;
        if (isSorted) {
            if (typeof isSorted == 'number') {
                i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
            } else {
                i = _.sortedIndex(array, item);
                return array[i] === item ? i : -1;
            }
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
        for (; i < l; i++) if (array[i] === item) return i;
        return -1;
    };

    // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
    _.lastIndexOf = function (array, item, from) {
        if (array == null) return -1;
        var hasIndex = from != null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
            return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--) if (array[i] === item) return i;
        return -1;
    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function (start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;

        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);

        while (idx < len) {
            range[idx++] = start;
            start += step;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Reusable constructor function for prototype setting.
    var ctor = function () { };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function (func, context) {
        var args, bound;
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError;
        args = slice.call(arguments, 2);
        return bound = function () {
            if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self;
        };
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context.
    _.partial = function (func) {
        var args = slice.call(arguments, 1);
        return function () {
            return func.apply(this, args.concat(slice.call(arguments)));
        };
    };

    // Bind all of an object's methods to that object. Useful for ensuring that
    // all callbacks defined on an object belong to it.
    _.bindAll = function (obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length === 0) throw new Error("bindAll must be passed function names");
        each(funcs, function (f) { obj[f] = _.bind(obj[f], obj); });
        return obj;
    };

    // Memoize an expensive function by storing its results.
    _.memoize = function (func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function () {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () { return func.apply(null, args); }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = function (func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time.
    _.throttle = function (func, wait, immediate) {
        var context, args, timeout, result;
        var previous = 0;
        var later = function () {
            previous = new Date;
            timeout = null;
            result = func.apply(context, args);
        };
        return function () {
            var now = new Date;
            if (!previous && immediate === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function (func, wait, immediate) {
        var timeout, result;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function (func) {
        var ran = false, memo;
        return function () {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function (func, wrapper) {
        return function () {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function () {
        var funcs = arguments;
        return function () {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };

    // Returns a function that will only be executed after being called N times.
    _.after = function (times, func) {
        if (times <= 0) return func();
        return function () {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Object Functions
    // ----------------

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = nativeKeys || function (obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys.push(key);
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function (obj) {
        var values = [];
        for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
        return values;
    };

    // Convert an object into a list of `[key, value]` pairs.
    _.pairs = function (obj) {
        var pairs = [];
        for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    _.invert = function (obj) {
        var result = {};
        for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function (key) {
            if (key in obj) copy[key] = obj[key];
        });
        return copy;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
            if (!_.contains(keys, key)) copy[key] = obj[key];
        }
        return copy;
    };

    // Fill in a given object with default properties.
    _.defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] === void 0) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function (obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Internal recursive comparison function for `isEqual`.
    var eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return a == String(b);
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                // other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;
                // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                    a.global == b.global &&
                    a.multiline == b.multiline &&
                    a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] == a) return bStack[length] == b;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
            // Compare array lengths to determine if a deep comparison is necessary.
            size = a.length;
            result = size == b.length;
            if (result) {
                // Deep compare the contents, ignoring non-numeric properties.
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                }
            }
        } else {
            // Objects with different constructors are not equivalent, but `Object`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
                return false;
            }
            // Deep compare objects.
            for (var key in a) {
                if (_.has(a, key)) {
                    // Count the expected number of properties.
                    size++;
                    // Deep compare each member.
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                }
            }
            // Ensure that both objects contain the same number of properties.
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) break;
                }
                result = !size;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function (a, b) {
        return eq(a, b, [], []);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function (obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (_.has(obj, key)) return false;
        return true;
    };

    // Is a given value a DOM element?
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) == '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function (obj) {
        return obj === Object(obj);
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
        _['is' + name] = function (obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return !!(obj && _.has(obj, 'callee'));
        };
    }

    // Optimize `isFunction` if appropriate.
    if (typeof (/./) !== 'function') {
        _.isFunction = function (obj) {
            return typeof obj === 'function';
        };
    }

    // Is a given object a finite number?
    _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    _.isNaN = function (obj) {
        return _.isNumber(obj) && obj != +obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function (obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function (obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iterators.
    _.identity = function (value) {
        return value;
    };

    // Run a function **n** times.
    _.times = function (n, iterator, context) {
        var accum = Array(Math.max(0, n));
        for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    _.random = function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // List of HTML entities for escaping.
    var entityMap = {
        escape: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        }
    };
    entityMap.unescape = _.invert(entityMap.escape);

    // Regexes containing the keys and values listed immediately above.
    var entityRegexes = {
        escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
        unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
    };

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    _.each(['escape', 'unescape'], function (method) {
        _[method] = function (string) {
            if (string == null) return '';
            return ('' + string).replace(entityRegexes[method], function (match) {
                return entityMap[method][match];
            });
        };
    });

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    _.result = function (object, property) {
        if (object == null) return void 0;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function (obj) {
        each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function (text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function (match) { return '\\' + escapes[match]; });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data, _);
        var template = function (data) {
            return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function, which will delegate to the wrapper.
    _.chain = function (obj) {
        return _(obj).chain();
    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function (obj) {
        return this._chain ? _(obj).chain() : obj;
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
            return result.call(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    each(['concat', 'join', 'slice'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });

    _.extend(_.prototype, {

        // Start chaining a wrapped Underscore object.
        chain: function () {
            this._chain = true;
            return this;
        },

        // Extracts the result from a wrapped and chained object.
        value: function () {
            return this._wrapped;
        }

    });

}).call(this);
/**
 * This script gives you the zone info key representing your device's time zone setting.
 *
 * @name jsTimezoneDetect
 * @version 1.0.5
 * @author Jon Nylander
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://pellepim.bitbucket.org/jstz/
 *
 * Copyright (c) Jon Nylander
 */

/*jslint undef: true */
/*global console, exports*/

(function (root) {
    /**
     * Namespace to hold all the code for timezone detection.
     */
    var jstz = (function () {
        'use strict';
        var HEMISPHERE_SOUTH = 's',

            /**
             * Gets the offset in minutes from UTC for a certain date.
             * @param {Date} date
             * @returns {Number}
             */
            get_date_offset = function (date) {
                var offset = -date.getTimezoneOffset();
                return (offset !== null ? offset : 0);
            },

            get_date = function (year, month, date) {
                var d = new Date();
                if (year !== undefined) {
                    d.setFullYear(year);
                }
                d.setMonth(month);
                d.setDate(date);
                return d;
            },

            get_january_offset = function (year) {
                return get_date_offset(get_date(year, 0, 2));
            },

            get_june_offset = function (year) {
                return get_date_offset(get_date(year, 5, 2));
            },

            /**
             * Private method.
             * Checks whether a given date is in daylight saving time.
             * If the date supplied is after august, we assume that we're checking
             * for southern hemisphere DST.
             * @param {Date} date
             * @returns {Boolean}
             */
            date_is_dst = function (date) {
                var is_southern = date.getMonth() > 7,
                    base_offset = is_southern ? get_june_offset(date.getFullYear()) :
                        get_january_offset(date.getFullYear()),
                    date_offset = get_date_offset(date),
                    is_west = base_offset < 0,
                    dst_offset = base_offset - date_offset;

                if (!is_west && !is_southern) {
                    return dst_offset < 0;
                }

                return dst_offset !== 0;
            },

            /**
             * This function does some basic calculations to create information about
             * the user's timezone. It uses REFERENCE_YEAR as a solid year for which
             * the script has been tested rather than depend on the year set by the
             * client device.
             *
             * Returns a key that can be used to do lookups in jstz.olson.timezones.
             * eg: "720,1,2".
             *
             * @returns {String}
             */

            lookup_key = function () {
                var january_offset = get_january_offset(),
                    june_offset = get_june_offset(),
                    diff = january_offset - june_offset;

                if (diff < 0) {
                    return january_offset + ",1";
                } else if (diff > 0) {
                    return june_offset + ",1," + HEMISPHERE_SOUTH;
                }

                return january_offset + ",0";
            },

            /**
             * Uses get_timezone_info() to formulate a key to use in the olson.timezones dictionary.
             *
             * Returns a primitive object on the format:
             * {'timezone': TimeZone, 'key' : 'the key used to find the TimeZone object'}
             *
             * @returns Object
             */
            determine = function () {
                var key = lookup_key();
                return new jstz.TimeZone(jstz.olson.timezones[key]);
            },

            /**
             * This object contains information on when daylight savings starts for
             * different timezones.
             *
             * The list is short for a reason. Often we do not have to be very specific
             * to single out the correct timezone. But when we do, this list comes in
             * handy.
             *
             * Each value is a date denoting when daylight savings starts for that timezone.
             */
            dst_start_for = function (tz_name) {

                var ru_pre_dst_change = new Date(2010, 6, 15, 1, 0, 0, 0), // In 2010 Russia had DST, this allows us to detect Russia :)
                    dst_starts = {
                        'America/Denver': new Date(2011, 2, 13, 3, 0, 0, 0),
                        'America/Mazatlan': new Date(2011, 3, 3, 3, 0, 0, 0),
                        'America/Chicago': new Date(2011, 2, 13, 3, 0, 0, 0),
                        'America/Mexico_City': new Date(2011, 3, 3, 3, 0, 0, 0),
                        'America/Asuncion': new Date(2012, 9, 7, 3, 0, 0, 0),
                        'America/Santiago': new Date(2012, 9, 3, 3, 0, 0, 0),
                        'America/Campo_Grande': new Date(2012, 9, 21, 5, 0, 0, 0),
                        'America/Montevideo': new Date(2011, 9, 2, 3, 0, 0, 0),
                        'America/Sao_Paulo': new Date(2011, 9, 16, 5, 0, 0, 0),
                        'America/Los_Angeles': new Date(2011, 2, 13, 8, 0, 0, 0),
                        'America/Santa_Isabel': new Date(2011, 3, 5, 8, 0, 0, 0),
                        'America/Havana': new Date(2012, 2, 10, 2, 0, 0, 0),
                        'America/New_York': new Date(2012, 2, 10, 7, 0, 0, 0),
                        'Europe/Helsinki': new Date(2013, 2, 31, 5, 0, 0, 0),
                        'Pacific/Auckland': new Date(2011, 8, 26, 7, 0, 0, 0),
                        'America/Halifax': new Date(2011, 2, 13, 6, 0, 0, 0),
                        'America/Goose_Bay': new Date(2011, 2, 13, 2, 1, 0, 0),
                        'America/Miquelon': new Date(2011, 2, 13, 5, 0, 0, 0),
                        'America/Godthab': new Date(2011, 2, 27, 1, 0, 0, 0),
                        'Europe/Moscow': ru_pre_dst_change,
                        'Asia/Amman': new Date(2013, 2, 29, 1, 0, 0, 0),
                        'Asia/Beirut': new Date(2013, 2, 31, 2, 0, 0, 0),
                        'Asia/Damascus': new Date(2013, 3, 6, 2, 0, 0, 0),
                        'Asia/Jerusalem': new Date(2013, 2, 29, 5, 0, 0, 0),
                        'Asia/Yekaterinburg': ru_pre_dst_change,
                        'Asia/Omsk': ru_pre_dst_change,
                        'Asia/Krasnoyarsk': ru_pre_dst_change,
                        'Asia/Irkutsk': ru_pre_dst_change,
                        'Asia/Yakutsk': ru_pre_dst_change,
                        'Asia/Vladivostok': ru_pre_dst_change,
                        'Asia/Baku': new Date(2013, 2, 31, 4, 0, 0),
                        'Asia/Yerevan': new Date(2013, 2, 31, 3, 0, 0),
                        'Asia/Kamchatka': ru_pre_dst_change,
                        'Asia/Gaza': new Date(2010, 2, 27, 4, 0, 0),
                        'Africa/Cairo': new Date(2010, 4, 1, 3, 0, 0),
                        'Europe/Minsk': ru_pre_dst_change,
                        'Pacific/Apia': new Date(2010, 10, 1, 1, 0, 0, 0),
                        'Pacific/Fiji': new Date(2010, 11, 1, 0, 0, 0),
                        'Australia/Perth': new Date(2008, 10, 1, 1, 0, 0, 0)
                    };

                return dst_starts[tz_name];
            };

        return {
            determine: determine,
            date_is_dst: date_is_dst,
            dst_start_for: dst_start_for
        };
    }());

    /**
     * Simple object to perform ambiguity check and to return name of time zone.
     */
    jstz.TimeZone = function (tz_name) {
        'use strict';
        /**
         * The keys in this object are timezones that we know may be ambiguous after
         * a preliminary scan through the olson_tz object.
         *
         * The array of timezones to compare must be in the order that daylight savings
         * starts for the regions.
         */
        var AMBIGUITIES = {
            'America/Denver': ['America/Denver', 'America/Mazatlan'],
            'America/Chicago': ['America/Chicago', 'America/Mexico_City'],
            'America/Santiago': ['America/Santiago', 'America/Asuncion', 'America/Campo_Grande'],
            'America/Montevideo': ['America/Montevideo', 'America/Sao_Paulo'],
            'Asia/Beirut': ['Asia/Amman', 'Asia/Jerusalem', 'Asia/Beirut', 'Europe/Helsinki', 'Asia/Damascus'],
            'Pacific/Auckland': ['Pacific/Auckland', 'Pacific/Fiji'],
            'America/Los_Angeles': ['America/Los_Angeles', 'America/Santa_Isabel'],
            'America/New_York': ['America/Havana', 'America/New_York'],
            'America/Halifax': ['America/Goose_Bay', 'America/Halifax'],
            'America/Godthab': ['America/Miquelon', 'America/Godthab'],
            'Asia/Dubai': ['Europe/Moscow'],
            'Asia/Dhaka': ['Asia/Yekaterinburg'],
            'Asia/Jakarta': ['Asia/Omsk'],
            'Asia/Shanghai': ['Asia/Krasnoyarsk', 'Australia/Perth'],
            'Asia/Tokyo': ['Asia/Irkutsk'],
            'Australia/Brisbane': ['Asia/Yakutsk'],
            'Pacific/Noumea': ['Asia/Vladivostok'],
            'Pacific/Tarawa': ['Asia/Kamchatka', 'Pacific/Fiji'],
            'Pacific/Tongatapu': ['Pacific/Apia'],
            'Asia/Baghdad': ['Europe/Minsk'],
            'Asia/Baku': ['Asia/Yerevan', 'Asia/Baku'],
            'Africa/Johannesburg': ['Asia/Gaza', 'Africa/Cairo']
        },

            timezone_name = tz_name,

            /**
             * Checks if a timezone has possible ambiguities. I.e timezones that are similar.
             *
             * For example, if the preliminary scan determines that we're in America/Denver.
             * We double check here that we're really there and not in America/Mazatlan.
             *
             * This is done by checking known dates for when daylight savings start for different
             * timezones during 2010 and 2011.
             */
            ambiguity_check = function () {
                var ambiguity_list = AMBIGUITIES[timezone_name],
                    length = ambiguity_list.length,
                    i = 0,
                    tz = ambiguity_list[0];

                for (; i < length; i += 1) {
                    tz = ambiguity_list[i];

                    if (jstz.date_is_dst(jstz.dst_start_for(tz))) {
                        timezone_name = tz;
                        return;
                    }
                }
            },

            /**
             * Checks if it is possible that the timezone is ambiguous.
             */
            is_ambiguous = function () {
                return typeof (AMBIGUITIES[timezone_name]) !== 'undefined';
            };

        if (is_ambiguous()) {
            ambiguity_check();
        }

        return {
            name: function () {
                return timezone_name;
            }
        };
    };

    jstz.olson = {};

    /*
     * The keys in this dictionary are comma separated as such:
     *
     * First the offset compared to UTC time in minutes.
     *
     * Then a flag which is 0 if the timezone does not take daylight savings into account and 1 if it
     * does.
     *
     * Thirdly an optional 's' signifies that the timezone is in the southern hemisphere,
     * only interesting for timezones with DST.
     *
     * The mapped arrays is used for constructing the jstz.TimeZone object from within
     * jstz.determine_timezone();
     */
    jstz.olson.timezones = {
        '-720,0': 'Pacific/Majuro',
        '-660,0': 'Pacific/Pago_Pago',
        '-600,1': 'America/Adak',
        '-600,0': 'Pacific/Honolulu',
        '-570,0': 'Pacific/Marquesas',
        '-540,0': 'Pacific/Gambier',
        '-540,1': 'America/Anchorage',
        '-480,1': 'America/Los_Angeles',
        '-480,0': 'Pacific/Pitcairn',
        '-420,0': 'America/Phoenix',
        '-420,1': 'America/Denver',
        '-360,0': 'America/Guatemala',
        '-360,1': 'America/Chicago',
        '-360,1,s': 'Pacific/Easter',
        '-300,0': 'America/Bogota',
        '-300,1': 'America/New_York',
        '-270,0': 'America/Caracas',
        '-240,1': 'America/Halifax',
        '-240,0': 'America/Santo_Domingo',
        '-240,1,s': 'America/Santiago',
        '-210,1': 'America/St_Johns',
        '-180,1': 'America/Godthab',
        '-180,0': 'America/Argentina/Buenos_Aires',
        '-180,1,s': 'America/Montevideo',
        '-120,0': 'America/Noronha',
        '-120,1': 'America/Noronha',
        '-60,1': 'Atlantic/Azores',
        '-60,0': 'Atlantic/Cape_Verde',
        '0,0': 'UTC',
        '0,1': 'Europe/London',
        '60,1': 'Europe/Berlin',
        '60,0': 'Africa/Lagos',
        '60,1,s': 'Africa/Windhoek',
        '120,1': 'Asia/Beirut',
        '120,0': 'Africa/Johannesburg',
        '180,0': 'Asia/Baghdad',
        '180,1': 'Europe/Moscow',
        '210,1': 'Asia/Tehran',
        '240,0': 'Asia/Dubai',
        '240,1': 'Asia/Baku',
        '270,0': 'Asia/Kabul',
        '300,1': 'Asia/Yekaterinburg',
        '300,0': 'Asia/Karachi',
        '330,0': 'Asia/Kolkata',
        '345,0': 'Asia/Kathmandu',
        '360,0': 'Asia/Dhaka',
        '360,1': 'Asia/Omsk',
        '390,0': 'Asia/Rangoon',
        '420,1': 'Asia/Krasnoyarsk',
        '420,0': 'Asia/Jakarta',
        '480,0': 'Asia/Shanghai',
        '480,1': 'Asia/Irkutsk',
        '525,0': 'Australia/Eucla',
        '525,1,s': 'Australia/Eucla',
        '540,1': 'Asia/Yakutsk',
        '540,0': 'Asia/Tokyo',
        '570,0': 'Australia/Darwin',
        '570,1,s': 'Australia/Adelaide',
        '600,0': 'Australia/Brisbane',
        '600,1': 'Asia/Vladivostok',
        '600,1,s': 'Australia/Sydney',
        '630,1,s': 'Australia/Lord_Howe',
        '660,1': 'Asia/Kamchatka',
        '660,0': 'Pacific/Noumea',
        '690,0': 'Pacific/Norfolk',
        '720,1,s': 'Pacific/Auckland',
        '720,0': 'Pacific/Tarawa',
        '765,1,s': 'Pacific/Chatham',
        '780,0': 'Pacific/Tongatapu',
        '780,1,s': 'Pacific/Apia',
        '840,0': 'Pacific/Kiritimati'
    };

    if (typeof exports !== 'undefined') {
        exports.jstz = jstz;
    } else {
        root.jstz = jstz;
    }
})(this);
/*!
 The MIT License (MIT)

 Copyright (c) 2013 Telerik AD

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.y distributed under the MIT license.
 */
/*!
 Everlive SDK
 Version 1.2.9
 */
/*global device, define, window, navigator*/
(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // with require.js
        define(['underscore', 'rsvp', 'reqwest', 'jstz'], function (_, rsvp, reqwest, jstz) {
            return (root.Everlive = factory(_, rsvp, reqwest, jstz));
        });
    } else if (typeof (isNativeScriptApplication) !== 'undefined' && isNativeScriptApplication) {
        // native script

        // wrap the native script Promise in a RSVP object
        var rsvp = {
            Promise: Promise
        };
        root.RSVP = rsvp;

        var http = require('http');
        var reqwest = function (options) {
            var httpRequestOptions = {
                url: options.url,
                method: options.method,
                headers: options.headers || {}
            };

            if (options.data) {
                httpRequestOptions.content = options.data; // NOTE: If we pass null/undefined, it will raise an exception in the http module.
            }

            httpRequestOptions.headers['Accept'] = 'application/json';
            httpRequestOptions.headers['Content-Type'] = 'application/json';

            var noop = function () { };
            var success = options.success || noop;
            var error = options.error || noop;
            http.request(httpRequestOptions).then(
                function (response) {
                    var contentString = response.content.toString();
                    if (response.statusCode < 400) {
                        // Success callback calls a custom parse function
                        success(contentString);
                    } else {
                        // Error callback relies on a JSON Object with ResponseText inside
                        error({
                            responseText: contentString
                        });
                    }
                },
                function (err) {
                    // error: function(jqXHR, textStatus, errorThrown)
                    // when timeouting for example (i.e. no internet connectivity), we get an err with content { message: "timeout...", stack: null }
                    error({
                        responseText: err
                    });
                });
        };
        root.reqwest = reqwest;

        module.exports = factory(exports._, root.RSVP, root.reqwest, exports.jstz);
    } else if (typeof exports === 'object') {
        // node js
        module.exports = factory(require('underscore'), require('rsvp'));
    } else {
        // web browser
        root.Everlive = factory(root._, root.RSVP, root.reqwest, root.jstz);
    }
}(this, function (_, rsvp, reqwest, jstz) {
    'use strict';
    var slice = Array.prototype.slice;
    var everliveUrl = '//api.everlive.com/v1/';
    var idField = 'Id';

    function guardUnset(value, name, message) {
        if (!message) {
            message = 'The ' + name + ' is required';
        }
        if (typeof value === 'undefined' || value === null) {
            throw new EverliveError(message);
        }
    }

    // An object that keeps information about an Everlive connection
    function Setup(options) {
        this.url = everliveUrl;
        this.apiKey = null;
        this.masterKey = null;
        this.token = null;
        this.tokenType = null;
        this.scheme = 'http'; // http or https
        this._emulatorMode = options.emulatorMode;
        this.parseOnlyCompleteDateTimeObjects = false;
        if (typeof options === 'string') {
            this.apiKey = options;
        } else {
            _.extend(this, options);
        }
    }

    // An array keeping initialization functions called by the Everlive constructor.
    // These functions will be used to extend the functionality of an Everlive instance.
    var initializations = [];
    // The constructor of Everlive instances.
    // The entry point for the SDK.
    function Everlive(options) {
        var self = this;
        this.setup = new Setup(options);
        _.each(initializations, function (init) {
            init.func.call(self, options);
        });
        if (Everlive.$ === null) {
            Everlive.$ = self;
        }
    }

    // A reference to the current Everlive instance
    Everlive.$ = null;
    Everlive.idField = idField;
    Everlive.initializations = initializations;
    // Creates a new Everlive instance and set it as the current one
    Everlive.init = function (options) {
        Everlive.$ = null;
        return new Everlive(options);
    };
    Everlive.buildUrl = function (setup) {
        var url = '';
        if (typeof setup.scheme === 'string') {
            url += setup.scheme + ':';
        }
        url += setup.url;
        if (setup.apiKey) {
            url += setup.apiKey + '/';
        }
        return url;
    };
    Everlive.prototype.data = function (collectionName) {
        return new Data(this.setup, collectionName);
    };
    Everlive.prototype.buildUrl = function () {
        return Everlive.buildUrl(this.setup);
    };
    var buildAuthHeader = function (setup, options) {
        var authHeaderValue = null;
        if (options && options.authHeaders === false) {
            return authHeaderValue;
        }
        if (setup.token) {
            authHeaderValue = (setup.tokenType || 'bearer') + ' ' + setup.token;
        }
        else if (setup.masterKey) {
            authHeaderValue = 'masterkey ' + setup.masterKey;
        }
        if (authHeaderValue) {
            return { Authorization: authHeaderValue };
        } else {
            return null;
        }
    };
    Everlive.prototype.buildAuthHeader = function () {
        return buildAuthHeader(this.setup);
    };

    // Everlive queries
    (function () {
        var OperatorType = {
            query: 1,

            where: 100,
            filter: 101,

            and: 110,
            or: 111,
            not: 112,

            equal: 120,
            not_equal: 121,
            lt: 122,
            lte: 123,
            gt: 124,
            gte: 125,
            isin: 126,
            notin: 127,
            all: 128,
            size: 129,
            regex: 130,
            contains: 131,
            startsWith: 132,
            endsWith: 133,

            nearShpere: 140,
            withinBox: 141,
            withinPolygon: 142,
            withinShpere: 143,

            select: 200,
            exclude: 201,

            order: 300,
            order_desc: 301,

            skip: 400,
            take: 401,
            expand: 402
        };

        function Expression(operator, operands) {
            this.operator = operator;
            this.operands = operands || [];
        }

        Expression.prototype = {
            addOperand: function (operand) {
                this.operands.push(operand);
            }
        };

        function Query(filter, fields, sort, skip, take, expand) {
            this.filter = filter;
            this.fields = fields;
            this.sort = sort;
            this.toskip = skip;
            this.totake = take;
            this.expandExpression = expand;
            this.expr = new Expression(OperatorType.query);
        }

        Query.prototype = {
            where: function (filter) {
                if (filter) {
                    return this._simple(OperatorType.filter, [filter]);
                }
                else {
                    return new WhereQuery(this);
                }
            },
            select: function () {
                return this._simple(OperatorType.select, arguments);
            },
            // TODO
            //exclude: function () {
            //    return this._simple(OperatorType.exclude, arguments);
            //},
            order: function (field) {
                return this._simple(OperatorType.order, [field]);
            },
            orderDesc: function (field) {
                return this._simple(OperatorType.order_desc, [field]);
            },
            skip: function (value) {
                return this._simple(OperatorType.skip, [value]);
            },
            take: function (value) {
                return this._simple(OperatorType.take, [value]);
            },
            expand: function (expandExpression) {
                return this._simple(OperatorType.expand, [expandExpression]);
            },
            build: function () {
                return new QueryBuilder(this).build();
            },
            _simple: function (op, oprs) {
                var args = slice.call(oprs);
                this.expr.addOperand(new Expression(op, args));
                return this;
            }
        };

        function WhereQuery(parentQuery, exprOp, singleOperand) {
            this.parent = parentQuery;
            this.single = singleOperand;
            this.expr = new Expression(exprOp || OperatorType.where);
            this.parent.expr.addOperand(this.expr);
        }

        WhereQuery.prototype = {
            and: function () {
                return new WhereQuery(this, OperatorType.and);
            },
            or: function () {
                return new WhereQuery(this, OperatorType.or);
            },
            not: function () {
                return new WhereQuery(this, OperatorType.not, true);
            },
            _simple: function (operator) {
                var args = slice.call(arguments, 1);
                this.expr.addOperand(new Expression(operator, args));
                return this._done();
            },
            eq: function (field, value) {
                return this._simple(OperatorType.equal, field, value);
            },
            ne: function (field, value) {
                return this._simple(OperatorType.not_equal, field, value);
            },
            gt: function (field, value) {
                return this._simple(OperatorType.gt, field, value);
            },
            gte: function (field, value) {
                return this._simple(OperatorType.gte, field, value);
            },
            lt: function (field, value) {
                return this._simple(OperatorType.lt, field, value);
            },
            lte: function (field, value) {
                return this._simple(OperatorType.lte, field, value);
            },
            isin: function (field, value) {
                return this._simple(OperatorType.isin, field, value);
            },
            notin: function (field, value) {
                return this._simple(OperatorType.notin, field, value);
            },
            all: function (field, value) {
                return this._simple(OperatorType.all, field, value);
            },
            size: function (field, value) {
                return this._simple(OperatorType.size, field, value);
            },
            regex: function (field, value, flags) {
                return this._simple(OperatorType.regex, field, value, flags);
            },
            startsWith: function (field, value, flags) {
                return this._simple(OperatorType.startsWith, field, value, flags);
            },
            endsWith: function (field, value, flags) {
                return this._simple(OperatorType.endsWith, field, value, flags);
            },
            nearSphere: function (field, point, distance, metrics) {
                return this._simple(OperatorType.nearShpere, field, point, distance, metrics);
            },
            withinBox: function (field, pointBottomLeft, pointUpperRight) {
                return this._simple(OperatorType.withinBox, field, pointBottomLeft, pointUpperRight);
            },
            withinPolygon: function (field, points) {
                return this._simple(OperatorType.withinPolygon, field, points);
            },
            withinCenterSphere: function (field, center, radius, metrics) {
                return this._simple(OperatorType.withinShpere, field, center, radius, metrics);
            },
            done: function () {
                if (this.parent instanceof WhereQuery) {
                    return this.parent._done();
                } else {
                    return this.parent;
                }
            },
            _done: function () {
                if (this.single) {
                    return this.parent;
                } else {
                    return this;
                }
            }
        };
        WhereQuery.prototype.equal = WhereQuery.prototype.eq;
        WhereQuery.prototype.notEqual = WhereQuery.prototype.ne;
        WhereQuery.prototype.greaterThan = WhereQuery.prototype.gt;
        WhereQuery.prototype.greaterThanEqual = WhereQuery.prototype.gte;
        WhereQuery.prototype.lessThan = WhereQuery.prototype.lt;
        WhereQuery.prototype.lessThanEqual = WhereQuery.prototype.lte;

        function QueryBuilder(query) {
            this.query = query;
            this.expr = query.expr;
        }

        var maxDistanceConsts = { 'radians': '$maxDistance', 'km': '$maxDistanceInKilometers', 'miles': '$maxDistanceInMiles' };
        var radiusConsts = { 'radians': 'radius', 'km': 'radiusInKilometers', 'miles': 'radiusInMiles' };
        QueryBuilder.prototype = {
            // TODO merge the two objects before returning them
            build: function () {
                var query = this.query;
                if (query.filter || query.fields || query.sort || query.toskip || query.totake || query.expandExpression) {
                    return {
                        $where: query.filter || null,
                        $select: query.fields || null,
                        $sort: query.sort || null,
                        $skip: query.toskip || null,
                        $take: query.totake || null,
                        $expand: query.expandExpression || null
                    };
                }
                return {
                    $where: this._buildWhere(),
                    $select: this._buildSelect(),
                    $sort: this._buildSort(),
                    $skip: this._getSkip(),
                    $take: this._getTake(),
                    $expand: this._getExpand()
                };
            },
            _getSkip: function () {
                var skipExpression = _.find(this.expr.operands, function (value, index, list) {
                    return value.operator === OperatorType.skip;
                });
                return skipExpression ? skipExpression.operands[0] : null;
            },
            _getTake: function () {
                var takeExpression = _.find(this.expr.operands, function (value, index, list) {
                    return value.operator === OperatorType.take;
                });
                return takeExpression ? takeExpression.operands[0] : null;
            },
            _getExpand: function () {
                var expandExpression = _.find(this.expr.operands, function (value, index, list) {
                    return value.operator === OperatorType.expand;
                });
                return expandExpression ? expandExpression.operands[0] : null;
            },
            _buildSelect: function () {
                var selectExpression = _.find(this.expr.operands, function (value, index, list) {
                    return value.operator === OperatorType.select;
                });
                var result = {};
                if (selectExpression) {
                    _.reduce(selectExpression.operands, function (memo, value) {
                        memo[value] = 1;
                        return memo;
                    }, result);
                    return result;
                }
                else {
                    return null;
                }
            },
            _buildSort: function () {
                var sortExpressions = _.filter(this.expr.operands, function (value, index, list) {
                    return value.operator === OperatorType.order || value.operator === OperatorType.order_desc;
                });
                var result = {};
                if (sortExpressions.length > 0) {
                    _.reduce(sortExpressions, function (memo, value) {
                        memo[value.operands[0]] = value.operator === OperatorType.order ? 1 : -1;
                        return memo;
                    }, result);
                    return result;
                }
                else {
                    return null;
                }
            },
            _buildWhere: function () {
                var whereExpression = _.find(this.expr.operands, function (value, index, list) {
                    return value.operator === OperatorType.where;
                });
                if (whereExpression) {
                    return this._build(new Expression(OperatorType.and, whereExpression.operands));
                }
                else {
                    var filterExpression = _.find(this.expr.operands, function (value, index, list) {
                        return value.operator === OperatorType.filter;
                    });
                    if (filterExpression) {
                        return filterExpression.operands[0];
                    }
                    return null;
                }
            },
            _build: function (expr) {
                if (this._isSimple(expr)) {
                    return this._simple(expr);
                }
                else if (this._isRegex(expr)) {
                    return this._regex(expr);
                }
                else if (this._isGeo(expr)) {
                    return this._geo(expr);
                }
                else if (this._isAnd(expr)) {
                    return this._and(expr);
                }
                else if (this._isOr(expr)) {
                    return this._or(expr);
                }
                else if (this._isNot(expr)) {
                    return this._not(expr);
                }
            },
            _isSimple: function (expr) {
                return expr.operator >= OperatorType.equal && expr.operator <= OperatorType.size;
            },
            _simple: function (expr) {
                var term = {}, fieldTerm = {};
                var operands = expr.operands;
                var operator = this._translateoperator(expr.operator);
                if (operator) {
                    term[operator] = operands[1];
                }
                else {
                    term = operands[1];
                }
                fieldTerm[operands[0]] = term;
                return fieldTerm;
            },
            _isRegex: function (expr) {
                return expr.operator >= OperatorType.regex && expr.operator <= OperatorType.endsWith;
            },
            _regex: function (expr) {
                var fieldTerm = {};
                var regex = this._getRegex(expr);
                var regexValue = this._getRegexValue(regex);
                var operands = expr.operands;
                fieldTerm[operands[0]] = regexValue;
                return fieldTerm;
            },
            _getRegex: function (expr) {
                var pattern = expr.operands[1];
                var flags = expr.operands[2] ? expr.operands[2] : '';
                switch (expr.operator) {
                    case OperatorType.regex:
                        return pattern instanceof RegExp ? pattern : new RegExp(pattern, flags);
                    case OperatorType.startsWith:
                        return new RegExp("^" + pattern, flags);
                    case OperatorType.endsWith:
                        return new RegExp(pattern + "$", flags);
                    default:
                        throw new EverliveError('Unknown operator type.');
                }
            },
            _getRegexValue: function (regex) {
                var options = '';
                if (regex.global) {
                    options += 'g';
                }
                if (regex.multiline) {
                    options += 'm';
                }
                if (regex.ignoreCase) {
                    options += 'i';
                }
                return { $regex: regex.source, $options: options };
            },
            _isGeo: function (expr) {
                return expr.operator >= OperatorType.nearShpere && expr.operator <= OperatorType.withinShpere;
            },
            _geo: function (expr) {
                var fieldTerm = {};
                var operands = expr.operands;
                fieldTerm[operands[0]] = this._getGeoTerm(expr);
                return fieldTerm;
            },
            _getGeoTerm: function (expr) {
                switch (expr.operator) {
                    case OperatorType.nearShpere:
                        return this._getNearSphereTerm(expr);
                    case OperatorType.withinBox:
                        return this._getWithinBox(expr);
                    case OperatorType.withinPolygon:
                        return this._getWithinPolygon(expr);
                    case OperatorType.withinShpere:
                        return this._getWithinCenterSphere(expr);
                    default:
                        throw new EverliveError('Unknown operator type.');
                }
            },
            _getNearSphereTerm: function (expr) {
                var operands = expr.operands;
                var center = this._getGeoPoint(operands[1]);
                var maxDistance = operands[2];
                var metrics = operands[3];
                var maxDistanceConst;
                var term = {
                    '$nearSphere': center
                };
                if (typeof maxDistance !== 'undefined') {
                    maxDistanceConst = maxDistanceConsts[metrics] || maxDistanceConsts.radians;
                    term[maxDistanceConst] = maxDistance;
                }
                return term;
            },
            _getWithinBox: function (expr) {
                var operands = expr.operands;
                var bottomLeft = this._getGeoPoint(operands[1]);
                var upperRight = this._getGeoPoint(operands[2]);
                return {
                    '$within': {
                        '$box': [bottomLeft, upperRight]
                    }
                };
            },
            _getWithinPolygon: function (expr) {
                var operands = expr.operands;
                var points = this._getGeoPoints(operands[1]);
                return {
                    '$within': {
                        '$polygon': points
                    }
                };
            },
            _getWithinCenterSphere: function (expr) {
                var operands = expr.operands;
                var center = this._getGeoPoint(operands[1]);
                var radius = operands[2];
                var metrics = operands[3];
                var radiusConst = radiusConsts[metrics] || radiusConsts.radians;
                var sphereInfo = {
                    'center': center
                };
                sphereInfo[radiusConst] = radius;
                return {
                    '$within': {
                        '$centerSphere': sphereInfo
                    }
                };
            },
            _getGeoPoint: function (point) {
                if (_.isArray(point)) {
                    return new GeoPoint(point[0], point[1]);
                }
                return point;
            },
            _getGeoPoints: function (points) {
                var self = this;
                return _.map(points, function (point) {
                    return self._getGeoPoint(point);
                });
            },
            _isAnd: function (expr) {
                return expr.operator === OperatorType.and;
            },
            _and: function (expr) {
                var i, l, term, result = {};
                var operands = expr.operands;
                for (i = 0, l = operands.length; i < l; i++) {
                    term = this._build(operands[i]);
                    result = this._andAppend(result, term);
                }
                return result;
            },
            _andAppend: function (andObj, newObj) {
                var i, l, key, value, newValue;
                var keys = _.keys(newObj);
                for (i = 0, l = keys.length; i < l; i++) {
                    key = keys[i];
                    value = andObj[key];
                    if (typeof value === 'undefined') {
                        andObj[key] = newObj[key];
                    }
                    else {
                        newValue = newObj[key];
                        if (typeof value === 'object' && typeof newValue === 'object') {
                            value = _.extend(value, newValue);
                        } else {
                            value = newValue;
                        }
                        andObj[key] = value;
                    }
                }
                return andObj;
            },
            _isOr: function (expr) {
                return expr.operator === OperatorType.or;
            },
            _or: function (expr) {
                var i, l, term, result = [];
                var operands = expr.operands;
                for (i = 0, l = operands.length; i < l; i++) {
                    term = this._build(operands[i]);
                    result.push(term);
                }
                return { $or: result };
            },
            _isNot: function (expr) {
                return expr.operator === OperatorType.not;
            },
            _not: function (expr) {
                return { $not: this._build(expr.operands[0]) };
            },
            _translateoperator: function (operator) {
                switch (operator) {
                    case OperatorType.equal:
                        return null;
                    case OperatorType.not_equal:
                        return '$ne';
                    case OperatorType.gt:
                        return '$gt';
                    case OperatorType.lt:
                        return '$lt';
                    case OperatorType.gte:
                        return '$gte';
                    case OperatorType.lte:
                        return '$lte';
                    case OperatorType.isin:
                        return '$in';
                    case OperatorType.notin:
                        return '$nin';
                    case OperatorType.all:
                        return '$all';
                    case OperatorType.size:
                        return '$size';
                }
                throw new EverliveError('Unknown operator type.');
            }
        };

        Everlive.Query = Query;
        Everlive.QueryBuilder = QueryBuilder;
    }());

    // Everlive requests
    var Request = (function () {
        // The headers used by the Everlive services
        var Headers = {
            filter: 'X-Everlive-Filter',
            select: 'X-Everlive-Fields',
            sort: 'X-Everlive-Sort',
            skip: 'X-Everlive-Skip',
            take: 'X-Everlive-Take',
            expand: 'X-Everlive-Expand'
        };

        var _self = null;

        // The Request type is an abstraction over Ajax libraries
        // A Request object needs information about the Everlive connection and initialization options
        function Request(setup, options) {
            guardUnset(setup, 'setup');
            guardUnset(options, 'options');
            this.setup = setup;
            this.method = null;
            this.endpoint = null;
            this.data = null;
            this.headers = {};
            // TODO success and error callbacks should be uniformed for all ajax libs
            this.success = null;
            this.error = null;
            this.parse = Request.parsers.simple;
            _.extend(this, options);
            this._init(options);
            _self = this;
        }

        Request.prototype = {
            // Calls the underlying Ajax library
            send: function () {
                Everlive.sendRequest(this);
            },
            // Returns an authorization header used by the request.
            // If there is a logged in user for the Everlive instance then her/his authentication will be used.
            buildAuthHeader: buildAuthHeader,
            // Builds the URL of the target Everlive service
            buildUrl: function buildUrl(setup) {
                return Everlive.buildUrl(setup);
            },
            // Processes the given query to return appropriate headers to be used by the request
            buildQueryHeaders: function buildQueryHeaders(query) {
                if (query) {
                    if (query instanceof Everlive.Query) {
                        return Request.prototype._buildQueryHeaders(query);
                    }
                    else {
                        return Request.prototype._buildFilterHeader(query);
                    }
                }
                else {
                    return {};
                }
            },
            // Initialize the Request object by using the passed options
            _init: function (options) {
                _.extend(this.headers, this.buildAuthHeader(this.setup, options), this.buildQueryHeaders(options.filter), options.headers);
            },
            // Translates an Everlive.Query to request headers
            _buildQueryHeaders: function (query) {
                query = query.build();
                var headers = {};
                if (query.$where !== null) {
                    headers[Headers.filter] = JSON.stringify(query.$where);
                }
                if (query.$select !== null) {
                    headers[Headers.select] = JSON.stringify(query.$select);
                }
                if (query.$sort !== null) {
                    headers[Headers.sort] = JSON.stringify(query.$sort);
                }
                if (query.$skip !== null) {
                    headers[Headers.skip] = query.$skip;
                }
                if (query.$take !== null) {
                    headers[Headers.take] = query.$take;
                }
                if (query.$expand !== null) {
                    headers[Headers.expand] = JSON.stringify(query.$expand);
                }
                return headers;
            },
            // Creates a header from a simple filter
            _buildFilterHeader: function (filter) {
                var headers = {};
                headers[Headers.filter] = JSON.stringify(filter);
                return headers;
            }
        };
        // Exposes the Request constructor
        Everlive.Request = Request;
        // A utility method for creating requests for the current Everlive instance
        Everlive.prototype.request = function (attrs) {
            return new Request(this.setup, attrs);
        };
        function parseIsoDateString(string) {
            if (_self && _self.setup && _self.setup.parseOnlyCompleteDateTimeObjects) {
                if (/^\d{4}-\d{2}-\d{2}$/.test(string)) {
                    // Date
                    return null;
                }

                if (/^(\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|((\+|-)(\d{2}):(\d{2})))?$/.test(string)) {
                    // Time
                    return null;
                }
            }

            var match;
            if (match = string.match(/^(\d{4})(-(\d{2})(-(\d{2})(T(\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|((\+|-)(\d{2}):(\d{2}))))?))$/)) {
                // DateTime
                var secondParts = match[12];
                if (secondParts) {
                    if (secondParts.length > 3) {
                        secondParts = Math.round(Number(secondParts.substr(0, 3) + '.' + secondParts.substr(3)));
                    }
                    else if (secondParts.length < 3) {
                        // if the secondParts are one or two characters then two or one zeros should be appended
                        // in order to have the correct number for milliseconds ('.67' means 670ms not 67ms)
                        secondParts += secondParts.length === 2 ? '0' : '00';
                    }
                }
                var date = new Date(
                    Date.UTC(
                        Number(match[1]), // year
                            (Number(match[3]) - 1) || 0, // month
                            Number(match[5]) || 0, // day
                            Number(match[7]) || 0, // hour
                            Number(match[8]) || 0, // minute
                            Number(match[10]) || 0, // second
                            Number(secondParts) || 0
                    )
                );

                if (match[13] && match[13] !== "Z") {
                    var h = Number(match[16]) || 0,
                        m = Number(match[17]) || 0;

                    h *= 3600000;
                    m *= 60000;

                    var offset = h + m;
                    if (match[15] === "+")
                        offset = -offset;

                    date = new Date(date.valueOf() + offset);
                }

                return date;
            } else {
                return null;
            }
        };

        function jsonDateReviver(key, value) {
            if (typeof value === 'string') {
                var date = parseIsoDateString(value);
                if (date) {
                    value = date;
                }
            }
            return value;
        }

        function traverse(obj, func) {
            var key, value, newValue;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    value = obj[key];
                    newValue = func(key, value);
                    obj[key] = newValue;
                    if (value === newValue && typeof value === 'object') {
                        traverse(value, func);
                    }
                }
            }
        }

        function traverseAndRevive(data) {
            traverse(data, jsonDateReviver);
        }

        Everlive._traverseAndRevive = traverseAndRevive;
        function parseResult(data) {
            if (typeof data === 'string' && data.length > 0) {
                data = JSON.parse(data, jsonDateReviver);
            }
            else if (typeof data === 'object') {
                traverseAndRevive(data);
            }
            if (data) {
                return { result: data.Result, count: data.Count };
            }
            else {
                return data;
            }
        }

        function parseError(error) {
            if (typeof error === 'string' && error.length > 0) {
                try {
                    error = JSON.parse(error);
                    return { message: error.message, code: error.errorCode };
                }
                catch (e) {
                    return error;
                }
            }
            else {
                return error;
            }
        }

        function parseSingleResult(data) {
            if (typeof data === 'string' && data.length > 0) {
                data = JSON.parse(data, jsonDateReviver);
            }
            else if (typeof data === 'object') {
                traverseAndRevive(data);
            }
            if (data) {
                return { result: data.Result };
            }
            else {
                return data;
            }
        }

        function parseUpdateResult(data) {
            if (typeof data === 'string' && data.length > 0) {
                data = JSON.parse(data, jsonDateReviver);
            }
            else if (typeof data === 'object') {
                traverseAndRevive(data);
            }
            if (data) {
                return { result: data.Result, ModifiedAt: data.ModifiedAt };
            }
            else {
                return data;
            }
        }

        Request.parsers = {
            simple: {
                result: parseResult,
                error: parseError
            },
            single: {
                result: parseSingleResult,
                error: parseError
            },
            update: {
                result: parseUpdateResult,
                error: parseError
            }
        };
        Everlive.disableRequestCache = function (url, method) {
            if (method === 'GET') {
                var timestamp = (new Date()).getTime();
                var separator = url.indexOf('?') > -1 ? '&' : '?';
                url += separator + '_el=' + timestamp;
            }
            return url;
        };
        // TODO built for reqwest
        if (typeof Everlive.sendRequest === 'undefined') {
            Everlive.sendRequest = function (request) {
                var url = request.buildUrl(request.setup) + request.endpoint;
                url = Everlive.disableRequestCache(url, request.method);
                //var data = request.method === 'GET' ? request.data : JSON.stringify(request.data);
                var data = (request.method === 'GET' || request.method === 'DELETE') ? request.data : JSON.stringify(request.data);

                //$.ajax(url, {
                reqwest({
                    url: url,
                    method: request.method,
                    data: data,
                    headers: request.headers,
                    type: 'json',
                    contentType: 'application/json',
                    crossOrigin: true,
                    //processData: request.method === "GET",
                    success: function (data, textStatus, jqXHR) {
                        request.success.call(request, request.parse.result(data));
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        request.error.call(request, request.parse.error(jqXHR.responseText));
                    }
                });
            };
        }
        return Request;
    }());

    // rsvp promises
    Everlive.getCallbacks = function (success, error) {
        var promise;
        if (typeof success !== 'function' && typeof error !== 'function') {
            promise = new rsvp.Promise(function (resolve, reject) {
                success = function (data) {
                    resolve(data);
                };
                error = function (error) {
                    reject(error);
                };
            });
        }
        return { promise: promise, success: success, error: error };
    };
    // whenjs promises
    //Everlive.getCallbacks = function (success, error) {
    //    var promise;
    //    if (typeof success !== "function" && typeof error !== "function") {
    //        promise = when.defer();
    //        success = function (data) {
    //            promise.resolve(data);
    //        };
    //        error = function (error) {
    //            promise.reject(error);
    //        };
    //    }
    //    return { promise: promise.promise, success: success, error: error };
    //};
    function buildPromise(operation, success, error) {
        var callbacks = Everlive.getCallbacks(success, error);
        operation(callbacks.success, callbacks.error);
        return callbacks.promise;
    }

    function mergeResultData(data, success) {
        return function (res, response) {
            var attrs = res.result;
            // support for kendo observable array
            if (_.isArray(data) || typeof data.length === 'number') {
                _.each(data, function (item, index) {
                    _.extend(item, attrs[index]);
                });
            }
            else {
                _.extend(data, attrs);
            }
            success(res, response);
        };
    }

    function mergeUpdateResultData(data, success) {
        return function (res) {
            var modifiedAt = res.ModifiedAt;
            data.ModifiedAt = modifiedAt;
            success(res);
        };
    }

    function Data(setup, collectionName) {
        this.setup = setup;
        this.collectionName = collectionName;
        this.options = null;
    }

    // Everlive base CRUD functions
    Data.prototype = {
        withHeaders: function (headers) {
            var options = this.options || {};
            options.headers = _.extend(options.headers || {}, headers);
            this.options = options;
            return this;
        },
        expand: function (expandExpression) {
            var expandHeader = {
                'X-Everlive-Expand': JSON.stringify(expandExpression)
            };
            return this.withHeaders(expandHeader);
        },
        _createRequest: function (options) {
            _.extend(options, this.options);
            this.options = null;
            return new Request(this.setup, options);
        },
        // TODO implement options: { requestSettings: { executeServerCode: false } }. power fields queries could be added to that options argument
        get: function (filter, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = self._createRequest({
                    method: 'GET',
                    endpoint: self.collectionName,
                    filter: filter,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        // TODO handle options
        // TODO think to pass the id as a filter
        getById: function (id, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = self._createRequest({
                    method: 'GET',
                    endpoint: self.collectionName + '/' + id,
                    parse: Request.parsers.single,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        count: function (filter, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = self._createRequest({
                    method: 'GET',
                    endpoint: self.collectionName + '/_count',
                    filter: filter,
                    parse: Request.parsers.single,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        create: function (data, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = self._createRequest({
                    method: 'POST',
                    endpoint: self.collectionName,
                    data: data,
                    parse: Request.parsers.single,
                    success: mergeResultData(data, success),
                    error: error
                });
                request.send();
            }, success, error);
        },
        rawUpdate: function (attrs, filter, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = self.collectionName;
                var ofilter = null; // request options filter
                // if filter is string than will update a single item using the filter as an identifier
                if (typeof filter === 'string') {
                    endpoint += '/' + filter;
                }
                    // else if it is an object than we will use it as a query filter
                else if (typeof filter === 'object') {
                    ofilter = filter;
                }
                var request = self._createRequest({
                    method: 'PUT',
                    endpoint: endpoint,
                    data: attrs,
                    filter: ofilter,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        _update: function (attrs, filter, single, replace, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = self.collectionName;
                var requestSuccess = success;
                if (single) {
                    endpoint += '/' + attrs[idField];
                    requestSuccess = mergeUpdateResultData(attrs, success);
                }
                var data = {};
                data[replace ? '$replace' : '$set'] = attrs;
                var request = self._createRequest({
                    method: 'PUT',
                    endpoint: endpoint,
                    parse: Request.parsers.update,
                    data: data,
                    filter: filter,
                    success: requestSuccess,
                    error: error
                });
                request.send();
            }, success, error);
        },
        updateSingle: function (model, success, error) {
            return this._update(model, null, true, false, success, error);
        },
        update: function (model, filter, success, error) {
            return this._update(model, filter, false, false, success, error);
        },
        //replaceSingle: function (model, success, error) {
        //    return this._update(model, null, true, true, success, error);
        //},
        _destroy: function (attrs, filter, single, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = self.collectionName;
                if (single) {
                    endpoint += '/' + attrs[idField];
                }
                var request = self._createRequest({
                    method: 'DELETE',
                    endpoint: endpoint,
                    filter: filter,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        destroySingle: function (model, success, error) {
            return this._destroy(model, null, true, success, error);
        },
        destroy: function (filter, success, error) {
            return this._destroy(null, filter, false, success, error);
        },
        setAcl: function (acl, filter, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = self.collectionName;

                if (typeof filter === 'string') { // if filter is string than will update a single item using the filter as an identifier
                    endpoint += '/' + filter;
                }
                else if (typeof filter === 'object') { // else if it is an object than we will use it's id property
                    endpoint += '/' + filter[idField];
                }
                endpoint += '/_acl';
                var method, data;
                if (acl === null) {
                    method = 'DELETE';
                } else {
                    method = 'PUT';
                    data = acl;
                }

                var request = self._createRequest({
                    method: method,
                    endpoint: endpoint,
                    data: data,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        setOwner: function (ownerId, filter, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = self.collectionName;

                if (typeof filter === 'string') { // if filter is string than will update a single item using the filter as an identifier
                    endpoint += '/' + filter;
                }
                else if (typeof filter === 'object') { // else if it is an object than we will use it's id property
                    endpoint += '/' + filter[idField];
                }
                endpoint += '/_owner';

                var request = self._createRequest({
                    method: 'PUT',
                    endpoint: endpoint,
                    data: {
                        Owner: ownerId
                    },
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        },
        save: function (model, success, error) {
            var self = this;
            var isNew = this.isNew(model);
            return buildPromise(function (success, error) {
                function saveSuccess(res) {
                    res.type = isNew ? 'create' : 'update';
                    success(res);
                }

                function saveError(err) {
                    err.type = isNew ? 'create' : 'update';
                    error(err);
                }

                if (isNew) {
                    return self.create(model, saveSuccess, saveError);
                }
                else {
                    return self.updateSingle(model, saveSuccess, saveError);
                }
            }, success, error);
        },
        isNew: function (model) {
            return typeof model[idField] === 'undefined';
        }
    };
    Everlive.Data = Data;

    //TODO add a function for calculating the distances in geospatial queries

    function GeoPoint(longitude, latitude) {
        this.longitude = longitude || 0;
        this.latitude = latitude || 0;
    }

    Everlive.GeoPoint = GeoPoint;

    var AuthStatus = {
        unauthenticated: 'unauthenticated',
        masterKey: 'masterKey',
        invalidAuthentication: 'invalidAuthentication',
        authenticated: 'authenticated'
    };
    Everlive.AuthStatus = AuthStatus;
    function getAuthInfo(setup, getUser, success, error) {
        if (setup.masterKey) {
            return buildPromise(function (success, error) {
                success({ status: AuthStatus.masterKey });
            }, success, error);
        }
        if (!setup.token) {
            return buildPromise(function (success, error) {
                success({ status: AuthStatus.unauthenticated });
            }, success, error);
        }

        var errorcb;
        if (success) {
            errorcb = function (err) {
                if (err && err.code === 601) { // invalid request, i.e. the access token is invalid or missing
                    success({ status: AuthStatus.invalidAuthentication });
                }
                else {
                    error(err);
                }
            };
        }
        var promise = getUser(success, errorcb);
        if (promise) {
            promise = promise.then(function (res) {
                return { status: AuthStatus.authenticated, user: res.result };
            }, function (err) {
                if (err && err.code === 601) { // invalid request, i.e. the access token is invalid or missing
                    return { status: AuthStatus.invalidAuthentication };
                }
                else {
                    throw err;
                }
            });
        }
        return promise;
    }

    Everlive.prototype.authInfo = function (success, error) {
        return getAuthInfo(this.setup, _.bind(this.Users.getById, this.Users, 'me'), success, error);
    };

    var addUsersFunctions = function (ns) {
        ns._loginSuccess = function (data) {
            var result = data.result;
            var setup = this.setup;
            setup.token = result.access_token;
            setup.tokenType = result.token_type;
        };
        ns._logoutSuccess = function () {
            var setup = this.setup;
            setup.token = null;
            setup.tokenType = null;
        };
        ns.register = function (username, password, attrs, success, error) {
            guardUnset(username, 'username');
            guardUnset(password, 'password');

            var user = {
                Username: username,
                Password: password
            };
            _.extend(user, attrs);
            return this.create(user, success, error);
        };
        ns.login = function (username, password, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = new Request(self.setup, {
                    method: 'POST',
                    endpoint: 'oauth/token',
                    data: {
                        username: username,
                        password: password,
                        grant_type: 'password'
                    },
                    authHeaders: false,
                    parse: Request.parsers.single,
                    success: function () {
                        self._loginSuccess.apply(self, arguments);
                        success.apply(null, arguments);
                    },
                    error: error
                });
                request.send();
            }, success, error);
        };
        ns.currentUser = function (success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                getAuthInfo(self.setup, _.bind(self.getById, self, 'me'))
                    .then(function (res) {
                        if (typeof res.user !== 'undefined') {
                            success({ result: res.user });
                        }
                        else {
                            success({ result: null });
                        }
                    }, function (err) {
                        error(err);
                    });
            }, success, error);
        };
        ns.changePassword = function (username, password, newPassword, keepTokens, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = 'Users/changepassword';
                if (keepTokens) {
                    endpoint += '?keepTokens=true';
                }
                var request = new Request(self.setup, {
                    method: 'POST',
                    endpoint: endpoint,
                    data: {
                        Username: username,
                        Password: password,
                        NewPassword: newPassword
                    },
                    authHeaders: false,
                    parse: Request.parsers.single,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        };
        ns.logout = function (success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = new Request(self.setup, {
                    method: 'GET',
                    endpoint: 'oauth/logout',
                    success: function () {
                        self._logoutSuccess.apply(self, arguments);
                        success.apply(null, arguments);
                    },
                    error: error
                });
                request.send();
            }, success, error);
        };

        ns._loginWithProvider = function (identity, success, error) {
            var user = {
                Identity: identity
            };
            var self = this;
            return buildPromise(function (success, error) {
                var request = new Request(self.setup, {
                    method: 'POST',
                    endpoint: 'Users',
                    data: user,
                    authHeaders: false,
                    parse: Request.parsers.single,
                    success: function () {
                        self._loginSuccess.apply(self, arguments);
                        success.apply(null, arguments);
                    },
                    error: error
                });
                request.send();
            }, success, error);
        };
        ns._linkWithProvider = function (identity, userId, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = new Request(self.setup, {
                    method: 'POST',
                    endpoint: 'Users/' + userId + '/link',
                    data: identity,
                    parse: Request.parsers.single,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        };
        ns._unlinkFromProvider = function (providerName, userId, success, error) {
            var identity = {
                Provider: providerName
            };
            var self = this;
            return buildPromise(function (success, error) {
                var request = new Request(self.setup, {
                    method: 'POST',
                    endpoint: 'Users/' + userId + '/unlink',
                    data: identity,
                    parse: Request.parsers.single,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        };

        ns.loginWithFacebook = function (accessToken, success, error) {
            var identity = {
                Provider: 'Facebook',
                Token: accessToken
            };
            return ns._loginWithProvider(identity, success, error);
        };

        ns.linkWithFacebook = function (userId, accessToken, success, error) {
            var identity = {
                Provider: 'Facebook',
                Token: accessToken
            };
            return ns._linkWithProvider(identity, userId, success, error);
        };

        ns.unlinkFromFacebook = function (userId, success, error) {
            return ns._unlinkFromProvider('Facebook', userId, success, error);
        };

        ns.loginWithADFS = function (accessToken, success, error) {
            var identity = {
                Provider: 'ADFS',
                Token: accessToken
            };
            return ns._loginWithProvider(identity, success, error);
        };

        ns.linkWithADFS = function (userId, accessToken, success, error) {
            var identity = {
                Provider: 'ADFS',
                Token: accessToken
            };
            return ns._linkWithProvider(identity, userId, success, error);
        };

        ns.unlinkFromADFS = function (userId, success, error) {
            return ns._unlinkFromProvider('ADFS', userId, success, error);
        };

        ns.loginWithLiveID = function (accessToken, success, error) {
            var identity = {
                Provider: 'LiveID',
                Token: accessToken
            };
            return ns._loginWithProvider(identity, success, error);
        };

        ns.linkWithLiveID = function (userId, accessToken, success, error) {
            var identity = {
                Provider: 'LiveID',
                Token: accessToken
            };
            return ns._linkWithProvider(identity, userId, success, error);
        };

        ns.unlinkFromLiveID = function (userId, success, error) {
            return ns._unlinkFromProvider('LiveID', userId, success, error);
        };

        ns.loginWithGoogle = function (accessToken, success, error) {
            var identity = {
                Provider: 'Google',
                Token: accessToken
            };

            return ns._loginWithProvider(identity, success, error);
        };

        ns.linkWithGoogle = function (userId, accessToken, success, error) {
            var identity = {
                Provider: 'Google',
                Token: accessToken
            };

            return ns._linkWithProvider(identity, userId, success, error);
        };

        ns.unlinkFromGoogle = function (userId, success, error) {
            return ns._unlinkFromProvider('Google', userId, success, error);
        };

        ns.loginWithTwitter = function (token, tokenSecret, success, error) {
            var identity = {
                Provider: 'Twitter',
                Token: token,
                TokenSecret: tokenSecret
            };

            return ns._loginWithProvider(identity, success, error);
        };

        ns.linkWithTwitter = function (userId, token, tokenSecret, success, error) {
            var identity = {
                Provider: 'Twitter',
                Token: token,
                TokenSecret: tokenSecret
            };

            return ns._linkWithProvider(identity, userId, success, error);
        };

        ns.unlinkFromTwitter = function (userId, success, error) {
            return ns._unlinkFromProvider('Twitter', userId, success, error);
        };
    };

    var addFilesFunctions = function (ns) {
        ns.getUploadUrl = function () {
            return Everlive.buildUrl(this.setup) + this.collectionName;
        };
        ns.getDownloadUrl = function (fileId) {
            return Everlive.buildUrl(this.setup) + this.collectionName + '/' + fileId + '/Download';
        };
        ns._getUpdateUrl = function (fileId) {
            return this.collectionName + '/' + fileId + '/Content';
        };
        ns.getUpdateUrl = function (fileId) {
            return Everlive.buildUrl(this.setup) + this._getUpdateUrl(fileId);
        };
        ns.updateContent = function (fileId, file, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var endpoint = self._getUpdateUrl(fileId);
                // the passed file content is base64 encoded
                var request = self._createRequest({
                    method: 'PUT',
                    endpoint: endpoint,
                    data: file,
                    success: success,
                    error: error
                });
                request.send();
            }, success, error);
        };
        ns.getDownloadUrlById = function (fileId, success, error) {
            var self = this;
            return buildPromise(function (success, error) {
                var request = self._createRequest({
                    method: 'GET',
                    endpoint: self.collectionName + '/' + fileId,
                    parse: Request.parsers.single,
                    success: function (data) {
                        success(data.result.Uri);
                    },
                    error: error
                });
                request.send();
            }, success, error);
        };
    };

    //#region Push

    //Constants for different platforms in Everlive
    var Platform = {
        WindowsPhone: 1,
        Windows: 2,
        Android: 3,
        iOS: 4,
        OSX: 5,
        Blackberry: 6,
        Nokia: 7,
        Unknown: 100
    };

    //Global event handlers for push notification events. Required by the cordova PushNotifications plugin that we use.
    Everlive.PushCallbacks = {};

    var Push = function (el) {
        this._el = el;
        this.notifications = el.data('Push/Notifications');
        this.devices = el.data('Push/Devices');
    };
    Push.prototype = {
        /**
         * Ensures that the Push Plugin has been loaded and is ready to use.
         */
        ensurePushIsAvailable: function () {
            var isPushNotificationPluginAvailable = (typeof window !== 'undefined' && window.plugins && window.plugins.pushNotification);

            if (!isPushNotificationPluginAvailable) {
                throw new EverliveError("The push notification plugin is not available. Ensure that the pushNotification plugin is included " +
                    "and use after `\deviceready\` event has been fired.");
            }
        },

        /**
         * @deprecated since version 1.2.7
         * Returns the current device for sending push
         * @param [emulatorMode] {Boolean}
         *   A flag whether the application is in emulator mode
         * @returns {CurrentDevice}
         *   Return an instance of the CurrentDevice
         */
        currentDevice: function (emulatorMode) {
            this.ensurePushIsAvailable();

            if (arguments.length === 0) {
                emulatorMode = this._el.setup._emulatorMode;
            }

            if (!window.cordova) {
                throw new EverliveError('Error: currentDevice() can only be called from within a hybrid mobile app, after \'deviceready\' event has been fired.');
            }

            if (!this._currentDevice) {
                this._currentDevice = new CurrentDevice(this);
            }

            this._currentDevice.emulatorMode = emulatorMode;

            return this._currentDevice;
        },

        /**
         * Enables the notifications on the device and registers it for push with Telerik Backend Services if it hasn't
         * already been registered. If it was registered the registration details are updated.
         * @param settings {Object}
         *   Settings for the registration. Can include custom parameters to be saved in backend services.
         * @param success
         *   Callback to invoke on success.
         * @param error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if succes/error are supplied.
         */
        register: function (settings, success, error) {
            this.ensurePushIsAvailable();

            var currentDevice = this.currentDevice();
            if (settings && settings.android) {
                settings.android.senderID = settings.android.projectNumber || settings.android.senderID;
            }

            var successCallback = function (token, callback) {
                return function () {
                    var result = new DeviceRegistrationResult(token);
                    callback(result);
                };
            };

            var everliveErrorCallback = function (err, callback) {
                var registrationError = DeviceRegistrationError.fromEverliveError(err);
                callback(registrationError);
            };

            return buildPromise(function (successCb, errorCb) {
                currentDevice.enableNotifications(settings, function (response) {
                    var token = response.token;
                    var customParameters = settings ? settings.customParameters : undefined;
                    currentDevice.getRegistration()
                        .then(function () {
                            currentDevice.updateRegistration(customParameters, successCallback(token, successCb), function (err) {
                                everliveErrorCallback(err, errorCb);
                            });
                        }, function (err) {
                            if (err.code === 801) {
                                currentDevice.register(customParameters, successCallback(token, successCb), errorCb);
                            } else {
                                everliveErrorCallback(err, errorCb);
                            }
                        });
                }, function (err) {
                    var deviceRegistrationError = DeviceRegistrationError.fromPluginError(err);
                    errorCb(deviceRegistrationError);
                });
            }, success, error);
        },

        /**
         * Disables push notifications for the current device. This method invalidates any push tokens
         * that were obtained for the device from the current application. The device will also be unregistered from
         * Telerik Backend Services.
         *
         * @param onSuccess
         *   Callback to invoke on success.
         * @param onError
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if succes/error are supplied.
         */
        unregister: function (onSuccess, onError) {
            this.ensurePushIsAvailable();

            var currentDevice = this.currentDevice();
            return currentDevice.disableNotifications.apply(currentDevice, arguments);
        },

        /**
         * Updates the registration for the current device.
         *
         * @param {Object} customParameters
         *   Custom parameters for the registration. If undefined, customParameters are not updated.
         * @param {Function} onSuccess
         *   Callback to invoke on success.
         * @param {Function} onError
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        updateRegistration: function (customParameters, onSuccess, onError) {
            this.ensurePushIsAvailable();

            var currentDevice = this.currentDevice();
            return currentDevice.updateRegistration.apply(currentDevice, arguments);
        },

        /**
         * Sets the badge number on the server
         *
         * @param {(number|string)} badge
         *   The number to be set as a badge.
         * @param {Function} onSuccess
         *   Callback to invoke on success.
         * @param {Function} onError
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        setBadgeNumber: function (badge, onSuccess, onError) {
            this.ensurePushIsAvailable();

            badge = Number(badge);
            if (isNaN(badge)) {
                return buildPromise(function (success, error) {
                    error(new EverliveError('The badge must have a numeric value'));
                }, onSuccess, onError);
            }

            var deviceRegistration = {};
            var currentDevice = this.currentDevice();
            var deviceId = currentDevice._getDeviceId();
            deviceRegistration.Id = 'HardwareId/' + encodeURIComponent(deviceId);
            deviceRegistration.BadgeCounter = badge;
            return buildPromise(function (successCb, errorCb) {
                currentDevice._pushHandler.devices.updateSingle(deviceRegistration).then(
                    function () {
                        if (window.plugins && window.plugins.pushNotification) {
                            return window.plugins.pushNotification.setApplicationIconBadgeNumber(successCb, errorCb, badge);
                        } else {
                            return successCb();
                        }
                    }, errorCb)
            }, onSuccess, onError);
        },

        /**
         * Clears the badge number on the server by setting it to 0
         *
         * @param {Function} onSuccess
         *   Callback to invoke on success.
         * @param {Function} onError
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        clearBadgeNumber: function (onSuccess, onError) {
            this.ensurePushIsAvailable();

            return this.setBadgeNumber(0, onSuccess, onError);
        },

        /**
         * Returns the push registration for the current device.
         *
         * @param {Function} onSuccess
         *   Callback to invoke on success.
         * @param {Function} onError
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        getRegistration: function (onSuccess, onError) {
            this.ensurePushIsAvailable();

            var currentDevice = this.currentDevice();
            return currentDevice.getRegistration.apply(currentDevice, arguments);
        },

        /**
         * Sends a push message
         * @param notification {Object}
         *   The push notification object
         * @param onSuccess
         *   Callback to invoke on success.
         * @param onError
         *   Callback to invoke on error.
         */
        send: function (notification, onSuccess, onError) {
            this.ensurePushIsAvailable();

            return this.notifications.create.apply(this.notifications, arguments);
        },

        /**
         * iOS: Checks if the Notifications are enabled for this Application in the Device's Notification Center
         * Windows Phone: Checks if the Application has an active opened Channel for communication with the Notification Service. Not relying on the device notification settings.
         * Android: Checks if the Application has established connection with the Notification Service. Not relying on the device notification settings.
         * @param onSuccess
         *   Callback to invoke on successful check - passes one boolean value - true or false
         * @param onError
         *   Callback to invoke when an error in the push plugin has occured.
         * @returns {*}
         *   A promise for the operation, or void if success/error are supplied.
         */
        areNotificationsEnabled: function (options, onSuccess, onError) {
            this.ensurePushIsAvailable();

            options = options || {};
            var pushNotification = window.plugins.pushNotification;

            return buildPromise(function (successCb, errorCb) {
                pushNotification.areNotificationsEnabled(successCb, errorCb, options);
            }, onSuccess, onError);
        }
    };

    var PushSettings = {
        iOS: {
            badge: true,
            sound: true,
            alert: true
        },
        android: {
            senderID: null
        },
        notificationCallbackAndroid: null,
        notificationCallbackIOS: null
    };

    var CurrentDevice = function (pushHandler) {
        this._pushHandler = pushHandler;
        this._initSuccessCallback = null;
        this._initErrorCallback = null;

        //Suffix for the global callback functions
        this._globalFunctionSuffix = null;

        this.pushSettings = null;
        this.pushToken = null;
        this.isInitialized = false;
        this.isInitializing = false;

        this.emulatorMode = false;
    };

    CurrentDevice.prototype = {

        /**
         * Initializes the current device for push notifications. This method requests a push token
         * from the device vendor and enables the push notification functionality on the device.
         * Once this is done, you can register the device in Everlive using the register() method.
         *
         * @param {PushSettings} pushSettings
         *   An object specifying various settings for the initialization.
         * @param {Function} success
         *   Callback to invoke on success.
         * @param {Function} error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        enableNotifications: function (pushSettings, success, error) {
            this.pushSettings = pushSettings;
            return buildPromise(_.bind(this._initialize, this), success, error);
        },

        /**
         * Disables push notifications for the current device. This method invalidates any push tokens
         * that were obtained for the device from the current application.
         *
         * @param {Function} success
         *   Callback to invoke on success.
         * @param {Function} error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        disableNotifications: function (success, error) {
            var self = this;

            return this.unregister().then(
                function () {
                    return buildPromise(
                        function (success, error) {
                            if (self.emulatorMode) {
                                success();
                            } else {
                                var pushNotification = window.plugins.pushNotification;
                                var unregisterOptions;
                                var platformType = self._getPlatformType(device.platform);
                                if (platformType === Platform.WindowsPhone) {
                                    unregisterOptions = { 'channelName': self.pushSettings.wp8.channelName };
                                }
                                pushNotification.unregister(
                                    function () {
                                        self.isInitialized = false;
                                        success();
                                    },
                                    error,
                                    unregisterOptions
                                );
                            }
                        },
                        success,
                        error
                    );
                },
                error
            );
        },

        /**
         * Returns the push registration for the current device.
         *
         * @param {Function} success
         *   Callback to invoke on success.
         * @param {Function} error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        getRegistration: function (success, error) {
            var deviceId = encodeURIComponent(this._getDeviceId());
            return this._pushHandler.devices.getById('HardwareId/' + deviceId, success, error);
        },

        /**
         * Registers the current device for push notifications in Everlive. This method can be called
         * only after enableNotifications() has completed successfully.
         *
         * @param {Object} customParameters
         *   Custom parameters for the registration.
         * @param {Function} success
         *   Callback to invoke on success.
         * @param {Function} error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        register: function (customParameters, success, error) {
            var self = this;

            var deviceRegistration = {};
            if (customParameters !== undefined) {
                deviceRegistration.Parameters = customParameters;
            }

            return this._populateRegistrationObject(deviceRegistration).then(
                function () {
                    return self._pushHandler.devices.create(deviceRegistration, success, error);
                },
                error
            );
        },

        /**
         * Unregisters the current device from push notifications in Everlive. After this call completes
         * successfully, Everlive will no longer send notifications to this device. Note that this does
         * not prevent the device from receiving notifications and does not invalidate push tokens.
         *
         * @param {Function} success
         *   Callback to invoke on success.
         * @param {Function} error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        unregister: function (success, error) {
            var deviceId = encodeURIComponent(device.uuid);
            return this._pushHandler.devices.destroySingle({ Id: 'HardwareId/' + deviceId }, success, error);
        },

        /**
         * Updates the registration for the current device.
         *
         * @param {Object} customParameters
         *   Custom parameters for the registration. If undefined, customParameters are not updated.
         * @param {Function} success
         *   Callback to invoke on success.
         * @param {Function} error
         *   Callback to invoke on error.
         * @returns {Object}
         *   A promise for the operation, or void if success/error are supplied.
         */
        updateRegistration: function (customParameters, success, error) {
            var self = this;

            var deviceRegistration = {};
            if (customParameters !== undefined) {
                deviceRegistration.Parameters = customParameters;
            }

            return this._populateRegistrationObject(deviceRegistration).then(
                function () {
                    deviceRegistration.Id = 'HardwareId/' + encodeURIComponent(deviceRegistration.HardwareId);
                    return self._pushHandler.devices.updateSingle(deviceRegistration, success, error);
                },
                error
            );
        },

        //Initializes the push functionality on the device.
        _initialize: function (success, error) {
            var self = this;

            if (this.isInitializing) {
                error(new EverliveError('Push notifications are currently initializing.'));
                return;
            }

            if (!this.emulatorMode && (!window.navigator || !window.navigator.globalization)) {
                error(new EverliveError('The globalization plugin is not initialized.'));
                return;
            }

            if (!this.emulatorMode && (!window.plugins || !window.plugins.pushNotification)) {
                error(new EverliveError('The push notifications plugin is not initialized.'));
                return;
            }

            this._initSuccessCallback = success;
            this._initErrorCallback = error;

            if (this.isInitialized) {
                this._deviceRegistrationSuccess(this.pushToken);
                return;
            }

            if (this.emulatorMode) {
                setTimeout(
                    function () {
                        self._deviceRegistrationSuccess('fake_push_token');
                    },
                    1000
                );
                return;
            }

            this.isInitializing = true;

            var suffix = this._globalFunctionSuffix;
            if (!suffix) {
                suffix = Date.now().toString();
                this._globalFunctionSuffix = suffix;
            }

            var pushNotification = window.plugins.pushNotification;

            var platformType = this._getPlatformType(device.platform);
            if (platformType === Platform.iOS) {
                //Initialize global APN callback
                var apnCallbackName = 'apnCallback_' + suffix;
                Everlive.PushCallbacks[apnCallbackName] = _.bind(this._onNotificationAPN, this);

                //Construct registration options object and validate iOS settings
                var apnRegistrationOptions = this.pushSettings.iOS;
                this._validateIOSSettings(apnRegistrationOptions);
                apnRegistrationOptions.ecb = 'Everlive.PushCallbacks.' + apnCallbackName;

                //Register for APN
                pushNotification.register(
                    _.bind(this._successfulRegistrationAPN, this),
                    _.bind(this._failedRegistrationAPN, this),
                    apnRegistrationOptions
                );
            } else if (platformType === Platform.Android) {
                //Initialize global GCM callback
                var gcmCallbackName = 'gcmCallback_' + suffix;
                Everlive.PushCallbacks[gcmCallbackName] = _.bind(this._onNotificationGCM, this);

                //Construct registration options object and validate the Android settings
                var gcmRegistrationOptions = this.pushSettings.android;
                this._validateAndroidSettings(gcmRegistrationOptions);
                gcmRegistrationOptions.ecb = 'Everlive.PushCallbacks.' + gcmCallbackName;

                //Register for GCM
                pushNotification.register(
                    _.bind(this._successSentRegistrationGCM, this),
                    _.bind(this._errorSentRegistrationGCM, this),
                    gcmRegistrationOptions
                );
            } else if (platformType === Platform.WindowsPhone) {
                //Initialize global WP8 callbacks.
                var wp8CallbackName = 'wp8Callback_' + suffix;
                var wp8RegistrationSuccessCallbackName = 'wp8RegistrationSuccessCallback_' + suffix;
                var wp8RegistrationErrorCallbackName = 'wp8RegistrationErrorCallback_' + suffix;

                Everlive.PushCallbacks[wp8CallbackName] = _.bind(this._onNotificationWP8, this);
                Everlive.PushCallbacks[wp8RegistrationSuccessCallbackName] = _.bind(this._deviceRegistrationSuccessWP, this);
                Everlive.PushCallbacks[wp8RegistrationErrorCallbackName] = _.bind(this._deviceRegistrationFailed, this);

                //Construct registration options object and validate the WP8  settings
                var wp8RegistrationOptions = this.pushSettings.wp8;
                this._validateWP8Settings(wp8RegistrationOptions);
                wp8RegistrationOptions.ecb = 'Everlive.PushCallbacks.' + wp8CallbackName;
                wp8RegistrationOptions.uccb = 'Everlive.PushCallbacks.' + wp8RegistrationSuccessCallbackName;
                wp8RegistrationOptions.errcb = 'Everlive.PushCallbacks.' + wp8RegistrationErrorCallbackName;


                pushNotification.register(
                    _.bind(this._successSentRegistrationWP8, this),
                    _.bind(this._errorSentRegistrationWP8, this),
                    wp8RegistrationOptions
                );

            } else {
                throw new EverliveError('The current platform is not supported: ' + device.platform);
            }
        },

        _deviceRegistrationSuccessWP: function (result) {
            this._deviceRegistrationSuccess(result.uri);
        },

        _validateAndroidSettings: function (androidSettings) {
            if (!androidSettings.senderID) {
                throw new EverliveError('Sender ID (project number) is not set in the android settings.');
            }
        },
        _validateWP8Settings: function (settings) {
            if (!settings.channelName) {
                throw new EverliveError('channelName is not set in the WP8 settings.');
            }
        },

        _validateIOSSettings: function (iOSSettings) {

        },

        _populateRegistrationObject: function (deviceRegistration, success, error) {
            var self = this;

            return buildPromise(
                function (success, error) {
                    if (!self.pushToken) {
                        throw new EverliveError('Push token is not available.');
                    }

                    self._getLocaleName(
                        function (locale) {
                            var deviceId = self._getDeviceId();
                            var hardwareModel = device.model;
                            var platformType = self._getPlatformType(device.platform);
                            var timeZone = jstz.determine().name();
                            var pushToken = self.pushToken;
                            var language = locale.value;
                            var platformVersion = device.version;

                            deviceRegistration.HardwareId = deviceId;
                            deviceRegistration.HardwareModel = hardwareModel;
                            deviceRegistration.PlatformType = platformType;
                            deviceRegistration.PlatformVersion = platformVersion;
                            deviceRegistration.TimeZone = timeZone;
                            deviceRegistration.PushToken = pushToken;
                            deviceRegistration.Locale = language;

                            success();
                        },
                        error
                    );
                },
                success,
                error
            );
        },

        _getLocaleName: function (success, error) {
            if (this.emulatorMode) {
                success({ value: 'en_US' });
            } else {
                navigator.globalization.getLocaleName(
                    function (locale) {
                        success(locale);
                    },
                    error
                );
                navigator.globalization.getLocaleName(
                    function (locale) {
                    },
                    error
                );
            }
        },

        _getDeviceId: function () {
            return device.uuid;
        },

        //Returns the Everlive device platform constant given a value aquired from cordova's device.platform.
        _getPlatformType: function (platformString) {
            var psLower = platformString.toLowerCase();
            switch (psLower) {
                case 'ios':
                case 'iphone':
                case 'ipad':
                    return Platform.iOS;
                case 'android':
                    return Platform.Android;
                case 'wince':
                    return Platform.WindowsPhone;
                case 'win32nt': // real wp8 devices return this string as platform identifier.
                    return Platform.WindowsPhone;
                default:
                    return Platform.Unknown;
            }
        },

        _deviceRegistrationFailed: function (error) {
            this.pushToken = null;
            this.isInitializing = false;
            this.isInitialized = false;

            if (this._initErrorCallback) {
                this._initErrorCallback({ error: error });
            }
        },

        _deviceRegistrationSuccess: function (token) {
            this.pushToken = token;
            this.isInitializing = false;
            this.isInitialized = true;

            if (this._initSuccessCallback) {
                this._initSuccessCallback({ token: token });
            }
        },

        //Occurs when the device registration in APN succeeds
        _successfulRegistrationAPN: function (token) {
            this._deviceRegistrationSuccess(token);
        },

        //Occurs if the device registration in APN fails
        _failedRegistrationAPN: function (error) {
            this._deviceRegistrationFailed(error);
        },

        //Occurs when device registration has been successfully sent to GCM
        _successSentRegistrationGCM: function (id) {
            //console.log("Successfully sent request for registering with GCM.");
        },
        //Occurs when device registration has been successfully sent for WP8
        _successSentRegistrationWP8: function (id) {
            //console.log("Successfully sent request for registering WP8 .");
        },
        //Occurs when an error occured when sending registration request for WP8
        _errorSentRegistrationWP8: function (error) {
            this._deviceRegistrationFailed(error);
        },

        //Occurs when an error occured when sending registration request to GCM
        _errorSentRegistrationGCM: function (error) {
            this._deviceRegistrationFailed(error);
        },

        //This function receives all notification events from APN
        _onNotificationAPN: function (e) {
            this._raiseNotificationEventIOS(e);
        },
        //This function receives all notification events for WP8
        _onNotificationWP8: function (e) {
            this._raiseNotificationEventWP8(e);
        },

        //This function receives all notification events from GCM
        _onNotificationGCM: function onNotificationGCM(e) {
            switch (e.event) {
                case 'registered':
                    if (e.regid.length > 0) {
                        this._deviceRegistrationSuccess(e.regid);
                    }
                    break;
                case 'message':
                    this._raiseNotificationEventAndroid(e);
                    break;
                case 'error':
                    if (!this.pushToken) {
                        this._deviceRegistrationFailed(e);
                    } else {
                        this._raiseNotificationEventAndroid(e);
                    }
                    break;
                default:
                    this._raiseNotificationEventAndroid(e);
                    break;
            }
        },

        _raiseNotificationEventAndroid: function (e) {
            if (this.pushSettings.notificationCallbackAndroid) {
                this.pushSettings.notificationCallbackAndroid(e);
            }
        },
        _raiseNotificationEventIOS: function (e) {
            if (this.pushSettings.notificationCallbackIOS) {
                this.pushSettings.notificationCallbackIOS(e);
            }
        },
        _raiseNotificationEventWP8: function (e) {
            if (this.pushSettings.notificationCallbackWP8) {
                this.pushSettings.notificationCallbackWP8(e);
            }
        }
    };

    function EverliveError() {
        var tmp = Error.apply(this, arguments);

        tmp.name = this.name = 'EverliveError';

        this.message = tmp.message;

        Object.defineProperty(this, 'stack', {
            get: function () {
                return tmp.stack
            }
        });

        return this;
    }

    EverliveError.prototype = Object.create(Error.prototype);
    EverliveError.prototype.toJSON = function () {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack
        };
    };

    var DeviceRegistrationError = function (errorType, message, additionalInformation) {
        EverliveError.call(this, message);
        this.errorType = errorType;
        this.message = message;
        if (additionalInformation !== undefined) {
            this.additionalInformation = additionalInformation;
        }
    };

    DeviceRegistrationError.prototype = Object.create(EverliveError.prototype);

    DeviceRegistrationError.fromEverliveError = function (everliveError) {
        var deviceRegistrationError = new DeviceRegistrationError(DeviceRegistrationErrorTypes.EverliveError, everliveError.message, everliveError);
        return deviceRegistrationError;
    };

    DeviceRegistrationError.fromPluginError = function (errorObj) {
        var message = 'A plugin error occurred';
        if (errorObj) {
            if (typeof errorObj.error === 'string') {
                message = errorObj.error;
            } else if (typeof errorObj.message === 'string') {
                message = errorObj.message;
            }
        }

        var deviceRegistrationError = new DeviceRegistrationError(DeviceRegistrationErrorTypes.PluginError, message, errorObj);
        return deviceRegistrationError;
    };

    var DeviceRegistrationErrorTypes = {
        EverliveError: 1,
        PluginError: 2
    };

    var DeviceRegistrationResult = function (token) {
        this.token = token;
    };

    //#endregion

    var initDefault = function () {
        this.Users = this.data('Users');
        addUsersFunctions(this.Users);
        this.Files = this.data('Files');
        addFilesFunctions(this.Files);

        this.push = new Push(this);
    };

    initializations.push({ name: 'default', func: initDefault });

    return Everlive;
}));

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Everlive'], function (Everlive) {
            factory(Everlive);
        });
    }
    else {
        factory(root.Everlive);
    }
}(this, function (Everlive) {
    var $ = window.jQuery,
        kendo = window.kendo;
    if ($ === undefined || kendo === undefined)
        return;
    var extend = $.extend;

    extend(true, kendo.data, {
        schemas: {
            everlive: {
                type: "json",
                data: function (data) {
                    // update
                    if (typeof data.ModifiedAt !== 'undefined') {
                        return { ModifiedAt: data.ModifiedAt };
                    }
                    else {
                        return data.Result || data;
                    }
                },
                total: "Count",
                model: {
                    id: "Id"
                }
            }
        },
        transports: {
            everlive: {
                read: {
                    dataType: "json",
                    type: "GET",
                    cache: false
                },
                update: {
                    dataType: "json",
                    contentType: "application/json",
                    type: "PUT",
                    cache: false
                },
                create: {
                    dataType: "json",
                    contentType: "application/json",
                    type: "POST",
                    cache: false
                },
                destroy: {
                    dataType: "json",
                    type: "DELETE",
                    cache: false
                },
                parameterMap: function (data, operation) {
                    if (operation === "destroy") {
                        return {};
                    }

                    if (operation === "create" || operation === "update") {
                        return JSON.stringify(data);
                    }

                    if (operation === "read") {
                        return null;
                    }
                }
            }
        }
    });

    function translateKendoQuery(data) {
        var result = {};
        if (data) {
            if (data.skip) {
                result.$skip = data.skip;
                delete data.skip;
            }
            if (data.take) {
                result.$take = data.take;
                delete data.take;
            }
            if (data.sort) {
                var sortExpressions = data.sort;
                var sort = {}
                if (!$.isArray(sortExpressions)) {
                    sortExpressions = [sortExpressions];
                }
                $.each(sortExpressions, function (idx, value) {
                    sort[value.field] = value.dir === 'asc' ? 1 : -1;
                });
                result.$sort = sort;
                delete data.sort;
            }
            if (data.filter) {
                var filter = new FilterBuilder().build(data.filter);
                result.$where = filter;
                delete data.filter;
            }
        }
        return result;
    }

    var regexOperations = ['startswith', 'startsWith', 'endswith', 'endsWith', 'contains'];
    function FilterBuilder() {
    }
    FilterBuilder.prototype = {
        build: function (filter) {
            return this._build(filter);
        },
        _build: function (filter) {
            if (this._isRaw(filter)) {
                return this._raw(filter);
            }
            else if (this._isSimple(filter)) {
                return this._simple(filter);
            }
            else if (this._isRegex(filter)) {
                return this._regex(filter);
            }
            else if (this._isAnd(filter)) {
                return this._and(filter);
            }
            else if (this._isOr(filter)) {
                return this._or(filter);
            }
        },
        _isRaw: function (filter) {
            return filter.operator === '_raw';
        },
        _raw: function (filter) {
            var fieldTerm = {};
            fieldTerm[filter.field] = filter.value;
            return fieldTerm;
        },
        _isSimple: function (filter) {
            return typeof filter.logic === 'undefined' && !this._isRegex(filter);
        },
        _simple: function (filter) {
            var term = {}, fieldTerm = {};
            var operator = this._translateoperator(filter.operator);
            if (operator) {
                term[operator] = filter.value;
            }
            else {
                term = filter.value;
            }
            fieldTerm[filter.field] = term;
            return fieldTerm;
        },
        _isRegex: function (filter) {
            return $.inArray(filter.operator, regexOperations) !== -1;
        },
        _regex: function (filter) {
            var fieldTerm = {};
            var regex = this._getRegex(filter);
            var regexValue = this._getRegexValue(regex);
            fieldTerm[filter.field] = regexValue;
            return fieldTerm;
        },
        _getRegex: function (filter) {
            var pattern = filter.value;
            var filterOperator = filter.operator;
            switch (filterOperator) {
                case 'contains':
                    return new RegExp(".*" + pattern + ".*", "i");
                case 'startsWith': // removing the camel case operators will be a breaking change
                case 'startswith': // the Kendo UI operators are in lower case
                    return new RegExp("^" + pattern, "i");
                case 'endsWith':
                case 'endswith':
                    return new RegExp(pattern + "$", "i");
            }
            throw new Error("Unknown operator type.");
        },
        _getRegexValue: function (regex) {
            return Everlive.QueryBuilder.prototype._getRegexValue.call(this, regex);
        },
        _isAnd: function (filter) {
            return filter.logic === 'and';
        },
        _and: function (filter) {
            var i, l, term, result = {};
            var operands = filter.filters;
            for (i = 0, l = operands.length; i < l; i++) {
                term = this._build(operands[i]);
                result = this._andAppend(result, term);
            }
            return result;
        },
        _andAppend: function (andObj, newObj) {
            return Everlive.QueryBuilder.prototype._andAppend.call(this, andObj, newObj);
        },
        _isOr: function (filter) {
            return filter.logic === 'or';
        },
        _or: function (filter) {
            var i, l, term, result = [];
            var operands = filter.filters;
            for (i = 0, l = operands.length; i < l; i++) {
                term = this._build(operands[i]);
                result.push(term);
            }
            return { $or: result };
        },
        _translateoperator: function (operator) {
            switch (operator) {
                case 'eq':
                    return null;
                case 'neq':
                    return "$ne";
                case 'gt':
                    return "$gt";
                case 'lt':
                    return "$lt";
                case 'gte':
                    return "$gte";
                case 'lte':
                    return "$lte";
            }
            throw new Error("Unknown operator type.");
        }
    };

    function createEverliveQuery(query) {
        return new Everlive.Query(query.$where, null, query.$sort, query.$skip, query.$take);
    }

    // replace the setup method of RemoteTransport in order to inject options
    // the setup method is called on all crud operations
    var RemoteTransport_setup = kendo.data.RemoteTransport.prototype.setup;
    kendo.data.RemoteTransport.prototype.setup = function (options, type) {
        if (!options.url && !this.options[type].url && this.options.typeName) {
            if (!Everlive.$) {
                throw new Error("You should either specify a url for this transport method, or instantiate an Everlive instance.");
            }
            options.url = Everlive.Request.prototype.buildUrl(Everlive.$.setup) + this.options.typeName;
            if (type === 'update' || type === 'destroy')
                options.url += '/' + options.data[Everlive.idField];
        }
        if (Everlive.$) {
            options.headers = Everlive.Request.prototype.buildAuthHeader(Everlive.$.setup);
        }
        if (type === 'read' && options.data) {
            var query = translateKendoQuery(options.data);
            var everliveQuery = createEverliveQuery(query);
            options.headers = $.extend(options.headers, Everlive.Request.prototype.buildQueryHeaders(everliveQuery));
        }
        if (type === 'create' || type === 'read' || type === 'update') {
            var success = options.success;
            options.success = function (result) {
                // convert date strings into dates
                Everlive._traverseAndRevive(result);
                if (success)
                    success(result);
            };
        }
        return RemoteTransport_setup.call(this, options, type);
    };

    // kendo merges the rest service result with the original data
    // but Everlive does not return the whole objects on update and create
    // so replace the accept method of Model in order to merge the response
    // from the request for creating a new item to the client model item
    var createRequestFields = [Everlive.idField, 'CreatedAt'];
    var Model_accept = kendo.data.Model.prototype.accept;
    kendo.data.Model.prototype.accept = function (data) {
        var that = this, field, value;
        Everlive._traverseAndRevive(data);
        // create
        if (data && that.isNew() && data[Everlive.idField]) {
            for (field in that.fields) {
                if ($.inArray(field, createRequestFields) === -1) {
                    value = that.get(field);
                    data[field] = value;
                }
            }
        }
            // update
        else if (data && typeof data.ModifiedAt !== 'undefined') {
            for (field in that.fields) {
                if (field !== 'ModifiedAt') {
                    value = that.get(field);
                    data[field] = value;
                }
            }
        }
        Model_accept.call(this, data);
    };

    var getUrlGeneratorForNode = function (baseUrl, expandArray) {
        var expandField = getRelationFieldForExpandNode(expandArray[expandArray.length - 1]);
        var pathArray = expandArray.slice(0, expandArray.length - 1);
        var pathUrl = '/_expand';
        for (var i = 0; i < pathArray.length; i++) {
            pathUrl += '/' + getRelationFieldForExpandNode(pathArray[i]);
        }
        return (function (pathUrl, expandField) {
            return function (options) {
                var url = baseUrl + '';
                if (options.Id && expandField) {//if we are expanding
                    url += pathUrl + '/' + options.Id + '/' + expandField;
                }
                return url;
            }
        }(pathUrl, expandField));
    }

    var getHeadersForExpandNode = function (expandNode) {
        if (typeof expandNode === "string") {
            return {};
        } else {
            return {
                'X-Everlive-Filter': JSON.stringify(expandNode.filter),
                'X-Everlive-Sort': JSON.stringify(expandNode.sort),
                'X-Everlive-Single-Field': expandNode.singleField,
                'X-Everlive-Skip': expandNode.skip,
                'X-Everlive-Take': expandNode.take,
                'X-Everlive-Fields': JSON.stringify(expandNode.fields),
            }
        }
    }

    var getRelationFieldForExpandNode = function (expandNode) {
        if (typeof expandNode === "string") {
            return expandNode;
        } else {
            if (expandNode.relation) {
                return expandNode.relation;
            } else {
                throw new Error("You need to specify a 'relation' for an expand node when using the object notation");
            }
        }
    }

    Everlive.createHierarchicalDataSource = function (options) {
        options = options || {};
        var expand = options.expand;
        var typeName = options.typeName;
        delete options.expand;
        delete options.typeName;
        var baseUrl;
        if (options.url) {
            baseUrl = options.url;
        } else if (Everlive.$ && typeName) {
            baseUrl = Everlive.Request.prototype.buildUrl(Everlive.$.setup) + typeName;
        } else {
            if (!Everlive.$) {
                throw new Error("You need to instantiate an Everlive instance in order to create a kendo HierarchicalDataSource.");
            }
            if (!typeName) {
                throw new Error("You need to specify a 'typeName' in order to create a kendo HierarchicalDataSource.");
            }
        }

        var expandSchema;
        if (expand) {
            for (var i = expand.length - 1; i >= 0; i--) {
                var expandSchema = {
                    model: {
                        hasChildren: getRelationFieldForExpandNode(expand[i]),
                        children: {
                            type: "everlive",
                            transport: {
                                read: {
                                    url: getUrlGeneratorForNode(baseUrl, expand.slice(0, i + 1)),
                                    headers: getHeadersForExpandNode(expand[i])
                                }
                            },
                            schema: expandSchema
                        }
                    }
                }
            }
        }
        var dataSourceOptions = {};
        dataSourceOptions.type = 'everlive';
        dataSourceOptions.transport = {
            typeName: typeName
        },
            dataSourceOptions.schema = expandSchema;
        extend(true, dataSourceOptions, options);
        return new kendo.data.HierarchicalDataSource(dataSourceOptions);
    }

    Everlive.createDataSource = function (options) {
        options = options || {};
        var typeName = options.typeName;
        if (!typeName) {
            throw new Error("You need to specify a 'typeName' in order to create a kendo DataSource.");
        }
        delete options.typeName;

        var dataSourceOptions = {};
        dataSourceOptions.type = 'everlive';
        dataSourceOptions.transport = {
            typeName: typeName
        },
            extend(true, dataSourceOptions, options);
        return new kendo.data.DataSource(dataSourceOptions);
    }
}));