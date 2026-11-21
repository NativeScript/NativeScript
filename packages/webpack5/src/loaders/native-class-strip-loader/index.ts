import { sources, type LoaderContext } from 'webpack';

// Extremely conservative textual pre-pass to neutralize any top-level '@NativeClass' decorator
// before TypeScript compilation while leaving a marker for the transformer to detect and
// downlevel to ES5. This guarantees no unresolved identifier at runtime and preserves our
// ability to transform the class.
// Only rewrites patterns that look like a decorator immediately preceding a class keyword.
// Does NOT attempt nested logic or other decorators.
// Example:
// @NativeClass\nclass Foo {} => /*__NativeClass__*/\nclass Foo {}
// @NativeClass()\nexport class Bar {} => /*__NativeClass__*/\nexport class Bar {}
// Multiple stacked decorators are handled (will remove just NativeClass among them).

// Matches a @NativeClass decorator that is followed by zero or more other decorator lines
// and then a class declaration. Replaces only the NativeClass decorator occurrence with a marker.
// Handles multi-line arguments to @NativeClass(...)
const DECORATOR_SINGLE_RE =
	/(^|\n)\s*@NativeClass(?:\([\s\S]*?\))?\s*\n(?=(\s*@[\w$][^\n]*\n)*\s*(?:export\s+)?class\s)/g;

export default function nativeClassStripLoader(
	this: LoaderContext<any>,
	content: string,
	map: any,
) {
	// Fast check: if 'NativeClass' not present at all, skip work.
	if (!/NativeClass/.test(content)) {
		this.callback(null, content, map);
		return;
	}

	// We only want to neutralize the decorator and leave a detectable marker for the transformer.
	// Every newline of the match is kept, so later lines keep their positions.
	const source = new sources.ReplaceSource(
		map
			? new sources.SourceMapSource(content, this.resourcePath, map)
			: new sources.OriginalSource(content, this.resourcePath),
	);
	let changed = false;
	for (const match of content.matchAll(DECORATOR_SINGLE_RE)) {
		const [m, prefix] = match;
		const newlines = m.slice(prefix.length).split('\n').length - 1;
		source.replace(
			match.index + prefix.length,
			match.index + m.length - 1,
			`/*__NativeClass__*/${'\n'.repeat(newlines)}`,
		);
		changed = true;
	}

	if (!changed) {
		this.callback(null, content, map);
		return;
	}
	const { source: stripped, map: strippedMap } = source.sourceAndMap();
	this.callback(null, stripped as string, strippedMap as any);
}
