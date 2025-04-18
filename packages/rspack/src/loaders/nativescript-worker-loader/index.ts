const NEW_WORKER_WITH_STRING_RE = /new\s+Worker\((['"`].+['"`])\)/g;

// TODO: remove this
export default function loader(content: string, map: any) {
	const source = content.replace(
		NEW_WORKER_WITH_STRING_RE,
		'new Worker(new URL($1, import.meta.url))',
	);
	this.callback(null, source, map);
}
