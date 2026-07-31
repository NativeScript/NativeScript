/**
 * NativeScript Platform Polyfills for Vendor Bundle
 *
 * Generates self-contained JavaScript that establishes Web API polyfills
 * required by common frameworks (TanStack Router, SolidJS, etc.) in the
 * NativeScript runtime.
 *
 * This code is prepended to the vendor bundle output so it executes BEFORE
 * any vendor module code. This is critical because:
 *
 *   1. The vendor bundle is the first JS that runs (before HTTP-served modules)
 *   2. Vendor modules (e.g., @tanstack/router-core) may use AbortController,
 *      self, etc. during initialization or first method calls
 *   3. Per-package polyfills in HTTP-served modules run too late and are fragile
 *
 * The generated code is entirely self-contained (no imports/requires) and
 * handles three cases for each global:
 *   - Undefined → install polyfill
 *   - Exists but broken (e.g., non-constructible) → replace with polyfill
 *   - Already works → preserve existing implementation
 */

/**
 * Returns a JavaScript code string that establishes platform polyfills.
 * The returned code is safe to prepend to any ES module bundle.
 */
export function generatePlatformPolyfills(): string {
	return `/* NativeScript platform polyfills — runs before vendor modules */
(function() {
${POLYFILL_SELF}
${POLYFILL_ABORT_CONTROLLER}
})();
`;
}

// ---------------------------------------------------------------------------
// Individual polyfill code blocks
// ---------------------------------------------------------------------------

/**
 * Ensures `self` is an alias for `globalThis`.
 * Many libraries (TanStack Router, service workers, etc.) check
 * `typeof self !== 'undefined'` to detect a browser-like environment.
 */
const POLYFILL_SELF = `
  // self — alias for globalThis
  if (typeof self === 'undefined') {
    globalThis.self = globalThis;
  }
`;

/**
 * Minimal AbortController / AbortSignal polyfill.
 *
 * The NativeScript runtime may expose a non-constructible AbortController
 * (typeof check passes but `new AbortController()` throws). This polyfill:
 *   - Tests actual constructibility, not just typeof
 *   - Only replaces if broken or missing
 *   - Provides enough of the spec for framework use:
 *     • new AbortController()
 *     • controller.signal  (AbortSignal instance)
 *     • controller.abort(reason?)
 *     • signal.aborted     (boolean)
 *     • signal.reason       (any)
 *     • signal.addEventListener('abort', handler)
 *     • signal.removeEventListener('abort', handler)
 *     • signal.throwIfAborted()
 */
const POLYFILL_ABORT_CONTROLLER = `
  // AbortController / AbortSignal
  var needsAbortPolyfill = true;
  try {
    var _ctrl = new AbortController();
    if (_ctrl && _ctrl.signal && _ctrl.signal.aborted === false) {
      needsAbortPolyfill = false;
    }
  } catch (_e) { /* missing or broken — will polyfill */ }

  if (needsAbortPolyfill) {
    var _NsAbortSignal = /** @constructor */ function NsAbortSignal() {
      this.aborted = false;
      this.reason = undefined;
      this._listeners = {};
    };
    _NsAbortSignal.prototype.addEventListener = function(type, listener) {
      if (!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(listener);
    };
    _NsAbortSignal.prototype.removeEventListener = function(type, listener) {
      var arr = this._listeners[type];
      if (!arr) return;
      var idx = arr.indexOf(listener);
      if (idx !== -1) arr.splice(idx, 1);
    };
    _NsAbortSignal.prototype.dispatchEvent = function(event) {
      var type = event && event.type || event;
      var arr = this._listeners[type];
      if (arr) {
        for (var i = 0; i < arr.length; i++) {
          try { arr[i].call(this, event); } catch (_e) { /* listener error */ }
        }
      }
      // Also call onabort handler if present
      if (typeof this.onabort === 'function') {
        try { this.onabort(event); } catch (_e) { /* handler error */ }
      }
    };
    _NsAbortSignal.prototype.throwIfAborted = function() {
      if (this.aborted) throw this.reason;
    };

    var _NsAbortController = /** @constructor */ function NsAbortController() {
      this.signal = new _NsAbortSignal();
    };
    _NsAbortController.prototype.abort = function(reason) {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      this.signal.reason = reason !== undefined ? reason : new DOMException('The operation was aborted.', 'AbortError');
      this.signal.dispatchEvent({ type: 'abort' });
    };

    globalThis.AbortController = _NsAbortController;
    globalThis.AbortSignal = _NsAbortSignal;
  }
`;
