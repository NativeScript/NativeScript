// ESM shims served when the device requests a bare framework module (`vue`,
// `nativescript-vue`, `pinia`). Each re-exports the vendor-bundled runtime from
// the device vendor registry so app code and the vendor bundle share one realm.

/** Shim for a bare `vue`/`nativescript-vue` import. */
export function buildVueVendorShim(pkg: 'vue' | 'nativescript-vue'): string {
	const vueFallback = pkg === 'vue' ? "if (!mod) { try { mod = req('vue'); } catch {} }" : '';
	return `
const g = globalThis;
const reg = g.__nsVendorRegistry;
const req = reg && g.__nsVendorRequire ? g.__nsVendorRequire : (g.__nsRequire || g.require);
let mod = reg && reg.get('nativescript-vue');
if (!mod && req) {
  try { mod = req('nativescript-vue'); } catch {}
  ${vueFallback}
}
mod = mod || {};
const v = (mod.default ?? mod);
export default v;
export const defineComponent = v.defineComponent;
export const resolveComponent = v.resolveComponent;
export const createVNode = v.createVNode;
export const createTextVNode = v.createTextVNode;
export const createCommentVNode = v.createCommentVNode;
export const Fragment = v.Fragment;
export const withCtx = v.withCtx;
export const openBlock = v.openBlock;
export const createBlock = v.createBlock;
export const createElementVNode = v.createElementVNode || v.createVNode;
export const createElementBlock = v.createElementBlock || v.createBlock;
export const renderSlot = v.renderSlot;
export const mergeProps = v.mergeProps;
export const toHandlers = v.toHandlers;
export const renderList = v.renderList;
export const normalizeProps = v.normalizeProps;
export const guardReactiveProps = v.guardReactiveProps;
export const withDirectives = v.withDirectives;
export const resolveDirective = v.resolveDirective;
export const withModifiers = v.withModifiers;
export const withKeys = v.withKeys;
export const ref = v.ref;
export const shallowRef = v.shallowRef;
export const unref = v.unref;
export const computed = v.computed;
export const onMounted = v.onMounted;
export const onBeforeUnmount = v.onBeforeUnmount;
export const onUnmounted = v.onUnmounted;
export const watch = v.watch;
export const nextTick = v.nextTick;
export const createApp = v.createApp;
export const registerElement = v.registerElement;
export const normalizeClass = v.normalizeClass;
export const normalizeStyle = v.normalizeStyle;
export const toDisplayString = v.toDisplayString;
`;
}

/** Shim for a bare `pinia` import. */
export function buildPiniaVendorShim(): string {
	return `
const g = globalThis;
const reg = g.__nsVendorRegistry;
const req = reg && g.__nsVendorRequire ? g.__nsVendorRequire : (g.__nsRequire || g.require);
let mod = reg && reg.get('pinia');
if (!mod && req) { try { mod = req('pinia'); } catch {} }
mod = mod || {};
const p = (mod.default ?? mod);
export default p;
export const createPinia = p.createPinia;
export const defineStore = p.defineStore;
export const storeToRefs = p.storeToRefs;
export const setActivePinia = p.setActivePinia;
export const getActivePinia = p.getActivePinia;
export const mapStores = p.mapStores;
export const mapState = p.mapState;
export const mapGetters = p.mapGetters;
export const mapActions = p.mapActions;
export const mapWritableState = p.mapWritableState;
export const piniaSymbol = p.piniaSymbol;
`;
}
