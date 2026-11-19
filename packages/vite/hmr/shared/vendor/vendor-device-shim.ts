import { NS_DEV_EXPR } from '../runtime/dev-globals.js';

// Device-side require() shim bundled verbatim into the vendor module. Runs on
// device: normalizes specifiers, resolves `@nativescript/core` subpaths from the
// served core modules registered on the dev globals, and CJS-shapes ESM
// namespaces so vendor `install()` hooks don't crash. Kept as a string because
// esbuild emits it directly as the vendor shim's contents.
export const vendorModuleShim = `
const g = globalThis;
const nsDev = ${NS_DEV_EXPR};
const BACKSLASH = String.fromCharCode(92);

function toForwardSlashes(input) {
  return String(input ?? '').split(BACKSLASH).join('/');
}

function getNativeScriptRequire() {
  const nsRequire = typeof g.require === "function" ? g.require : null;
  if (nsRequire) {
    return nsRequire;
  }
  const legacy = g.__nsRequire;
  if (typeof legacy === "function") {
    return legacy;
  }
  return null;
}

function getDocumentsPath() {
  const cached = g.__NS_DOCUMENTS_PATH__;
  if (typeof cached === "string" && cached.length) {
    return toForwardSlashes(cached);
  }
  try {
    const core = g.require ? g.require("@nativescript/core") : null;
    const docsFolder = core?.knownFolders?.documents?.();
    const docPath = docsFolder?.path;
    if (docPath) {
      const normalized = toForwardSlashes(docPath);
      g.__NS_DOCUMENTS_PATH__ = normalized;
      return normalized;
    }
  } catch (_err) {
    // ignore - fallback to raw specifier
  }
  return null;
}

function collapseSegments(input) {
  const segments = [];
  const parts = input.split('/');
  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      if (segments.length && segments[segments.length - 1] !== "..") {
        segments.pop();
        continue;
      }
    }
    segments.push(part);
  }
  const leadingSlash = input.startsWith('/');
  return (leadingSlash ? '/' : '') + segments.join('/');
}

function normalizeSpecifier(spec) {
  let value = String(spec ?? "");
  value = toForwardSlashes(value);
  const docsPath = getDocumentsPath();
  if (value.startsWith("__NSDOC__/")) {
    if (docsPath) {
      value = docsPath + '/' + value.slice("__NSDOC__/".length);
    } else {
      value = value.slice("__NSDOC__/".length);
    }
  }
  if (value.startsWith("~/") && docsPath) {
    value = docsPath + '/' + value.slice(2);
  }
  if (value.startsWith("file://")) {
    const stripped = value.slice("file://".length);
    value = stripped.startsWith('/') ? stripped : '/' + stripped;
  }
  if (value.includes("/../") || value.includes("/./")) {
    value = collapseSegments(value);
  }
  return value;
}

function normalizeCoreSubLocal(s) {
  if (!s) return "";
  let t = String(s).split("?")[0].split("#")[0].trim();
  t = t.replace(/^\\/+/, "").replace(/\\/+$/, "");
  t = t.replace(/\\.(?:mjs|cjs|js)$/, "");
  if (t.length >= 6 && t.substring(t.length - 6) === "/index") {
    t = t.substring(0, t.length - 6);
  }
  if (!t || t === "index") return "";
  return t;
}

// Invariant D: shape ESM namespaces before returning to CJS callers.
//
// The main-entry require shim (see helpers/main-entry.ts) installs the shape
// function as the dev globals' cjsShape. The /ns/v core registration footer
// (see hmr/server/thin/thin-route.ts) can run before it, so registered core
// namespaces may be unshaped; shape them on read.
function shapeForCjs(value) {
  if (!value || typeof value !== "object") return value;
  const shape = nsDev.cjsShape;
  if (typeof shape === "function") {
    try { return shape(value); } catch (e) {}
  }
  return value;
}

function resolveCoreFromRegistry(normalizedId) {
  if (
    normalizedId !== "@nativescript/core" &&
    normalizedId.indexOf("@nativescript/core/") !== 0
  ) {
    return null;
  }
  const table = nsDev.coreModules;
  if (!table) return null;
  if (table[normalizedId]) return shapeForCjs(table[normalizedId]);
  const rawSub =
    normalizedId === "@nativescript/core"
      ? ""
      : normalizedId.slice("@nativescript/core/".length);
  const normSub = normalizeCoreSubLocal(rawSub);
  const bareKey = normSub ? "@nativescript/core/" + normSub : "@nativescript/core";
  if (table[bareKey]) return shapeForCjs(table[bareKey]);
  if (normSub && table[normSub]) return shapeForCjs(table[normSub]);
  if (!normSub && table[""]) return shapeForCjs(table[""]);
  return null;
}

export function createRequire(_url) {
  const nsRequire = getNativeScriptRequire();
  if (!nsRequire) {
    return function (id) {
      // Even without nsRequire, the @nativescript/core registry populated by
      // the /ns/core bridge may already have the module — return it so
      // vendor install() hooks that run against the HMR-served core don't
      // crash at module-instantiation time.
      const fromRegistry = resolveCoreFromRegistry(normalizeSpecifier(id));
      if (fromRegistry) return fromRegistry;
      throw new Error("NativeScript require() is not available in this context");
    };
  }
  const req = function (id) {
    const normalizedId = normalizeSpecifier(id);
    // Invariant C: @nativescript/core and its subpaths are served ONCE under
    // /ns/v, and each module registers its ESM namespace in the dev globals'
    // coreModules. CommonJS require() from
    // vendor packages (e.g. \`require('@nativescript/core/ui/core/view').View\`
    // in @nativescript-community/gesturehandler, or \`require('@nativescript/core').View\`
    // in @nativescript-community/ui-material-core) MUST resolve to that
    // same namespace; otherwise we re-trigger class identity splits and
    // applyMixins() crashes with "Cannot read properties of undefined".
    const fromRegistry = resolveCoreFromRegistry(normalizedId);
    if (fromRegistry) return fromRegistry;
    if (
      normalizedId.includes("../data/patch.json") ||
      normalizedId.includes("css-tree/lib/data/patch.json")
    ) {
      return {
        atrules: {},
        properties: {},
        types: {},
      };
    }
    if (normalizedId.includes("mdn-data/")) {
      return {};
    }
    if (
      normalizedId.endsWith("/package.json") ||
      normalizedId.includes("../package.json")
    ) {
      return { version: "0.0.0" };
    }
    if (normalizedId.endsWith(".json")) {
      return {};
    }
    // Shape the native require result too. The NativeScript CJS loader
    // may serve an @nativescript/core subpath over HTTP before the
    // /ns/core footer has run (e.g., during initial boot). In that
    // window, the result is a raw ESM namespace with null [[Prototype]]
    // and zone.js/vendor install() hooks crash on hasOwnProperty.
    return shapeForCjs(nsRequire(normalizedId));
  };
  req.resolve = nsRequire.resolve
    ? function (id) {
        return nsRequire.resolve(id);
      }
    : function (id) {
        return id;
      };
  return req;
}

export default { createRequire };
`;
