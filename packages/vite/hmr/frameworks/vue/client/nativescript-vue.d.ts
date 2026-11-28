// nativescript-vue is the app's dependency, not this package's; only what the reboot module reads.
declare module 'nativescript-vue' {
	export const ELEMENT_REF: unique symbol;
}
