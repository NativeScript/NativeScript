declare module 'ns:module' {
	const api: import('./browser-runtime-contract.js').NsRuntimeDevHostApi;
	export default api;
	export const createRequire: NonNullable<import('./browser-runtime-contract.js').NsRuntimeDevHostApi['createRequire']>;
}
