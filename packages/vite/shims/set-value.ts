/**
 * shim for set-value commonjs package export
 */
export default function setValue(obj, path, value) {
	if (!obj) return obj;
	const parts = Array.isArray(path)
		? path
		: String(path)
				.replace(/\[(\d+)\]/g, '.$1')
				.split('.')
				.filter(Boolean);

	let cur = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const k = parts[i];
		const next = parts[i + 1];
		if (cur[k] == null || typeof cur[k] !== 'object') {
			cur[k] = /^\d+$/.test(next) ? [] : {};
		}
		cur = cur[k];
	}
	cur[parts[parts.length - 1]] = value;
	return obj;
}
