export default function lazy<T>(action: () => T): () => T {
	let _value: T;

	return () => _value || (_value = action());
}
