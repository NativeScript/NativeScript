declare module 'ns:module' {
	const api: import('./browser-runtime-contract.js').NsRuntimeDevHostApi;
	export default api;
}
