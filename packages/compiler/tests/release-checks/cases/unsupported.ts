// Each line ending in an expect comment must be reported by preflight with its text in the message; no other line may be.
declare const __API_URL__: string;
declare const APP_BUILD_ID: string;
declare const __SET_AT_RUNTIME__: string;
declare const NativeHelper: any;

const handler: ProxyHandler<object> = {};
export const proxied = new Proxy({}, handler); // expect: Proxy
export const keys = Reflect.ownKeys({ a: 1 }); // expect: Reflect
export const evaluated = eval('1 + 1'); // expect: eval
export const made = new Function('a', 'return a'); // expect: Function
export const registry = new FinalizationRegistry(() => {}); // expect: FinalizationRegistry
export const shared = new SharedArrayBuffer(8); // expect: SharedArrayBuffer
export const url = __API_URL__; // expect: __API_URL__
export const build = `${APP_BUILD_ID}`; // expect: APP_BUILD_ID
(globalThis as any).__SET_AT_RUNTIME__ = 'x';
export const set = __SET_AT_RUNTIME__;
export const native = NativeHelper.make();
export function load(name: string) {
  return import(name); // expect: import() of a computed specifier
}
export function loadLiteral() {
  return import('./other');
}
export function callee() {
  return arguments.callee; // expect: arguments.callee
}
export const proto = ({} as any).__proto__; // expect: __proto__
export type NotAValue = typeof Proxy;
export const typed: WeakRef<object> | null = null;
export const fine = new WeakRef({});
