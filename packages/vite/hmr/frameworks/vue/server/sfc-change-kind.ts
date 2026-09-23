/**
 * Classifies an SFC save as render-only or full, so the device client can pick
 * the right Vue HMR entry point.
 *
 * Vue's runtime offers two, and they are not interchangeable on a native
 * runtime. `rerender` swaps the render function on every live instance and
 * updates it in place. `reload` re-instantiates instead, and for an instance
 * with no parent — a page pushed with `$navigateTo`, a sheet shown with
 * `$showModal`; both are manually-mounted roots — Vue delegates that to
 * `appContext.reload()`, which tears the hosted view down and rebuilds it. A
 * presented sheet does not survive that, and a save that only touched the
 * template never needed it.
 *
 * So the server answers the one question the client cannot: did any script
 * block actually change? When none did, the client takes `rerender` and the
 * update lands inside pushed pages and presented modals without a remount.
 *
 * The compiler is reached through a dynamic import, not a static one: this
 * module is pulled in by the Vue server strategy, which loads for every flavor,
 * and `@vue/compiler-sfc` must not be resolved in an Angular or Solid project
 * (see websocket-framework-isolation.spec.ts).
 */

export type SfcChangeKind = 'render-only' | 'full';

/** Per-path script signatures from the last time each SFC was seen. */
export type SfcSignatureStore = Map<string, string>;

type ParseSfc = typeof import('./compiler.js').parseSfc;

let parseSfcPromise: Promise<ParseSfc | null> | null = null;

function loadParseSfc(): Promise<ParseSfc | null> {
	if (!parseSfcPromise) {
		parseSfcPromise = import('./compiler.js').then((mod) => mod.parseSfc).catch(() => null);
	}
	return parseSfcPromise;
}

/**
 * A stable fingerprint of everything that would change a component's behavior
 * rather than only its rendered output: both script blocks, their content and
 * the attributes that alter how they compile.
 *
 * Returns `null` when the SFC cannot be parsed — an unparseable save is never
 * classified as render-only, because we cannot know what changed in it.
 */
export async function sfcScriptSignature(source: string, filename: string): Promise<string | null> {
	try {
		const parse = await loadParseSfc();
		if (!parse) return null;
		const { descriptor, errors } = parse(source, { filename });
		// `parse` is lenient — a malformed SFC comes back as a descriptor plus a
		// non-empty error list rather than a throw. Treat that as unknown: a
		// half-parsed file's script blocks are not evidence of anything.
		if (errors && errors.length) return null;
		const blocks = [descriptor.script, descriptor.scriptSetup].map((block) => {
			if (!block) return null;
			// `lang` and `setup` change the compiled output for identical text.
			return { lang: block.lang ?? '', setup: !!(block as { setup?: unknown }).setup, content: block.content };
		});
		return JSON.stringify(blocks);
	} catch {
		return null;
	}
}

/**
 * Compare this save's script signature against the one recorded for the same
 * path and record the new one.
 *
 * Answers `'full'` whenever we cannot prove the scripts are untouched: an
 * unparseable file, or the first time a path is seen. The registry walk at
 * startup seeds every SFC (see `seedSfcSignature`), so in a live session the
 * unseeded case only covers files created after boot — where a full update is
 * the right answer anyway.
 */
export async function classifySfcChange(path: string, source: string, filename: string, signatures: SfcSignatureStore): Promise<SfcChangeKind> {
	const next = await sfcScriptSignature(source, filename);
	if (next === null) {
		signatures.delete(path);
		return 'full';
	}
	const previous = signatures.get(path);
	signatures.set(path, next);
	return previous !== undefined && previous === next ? 'render-only' : 'full';
}

/**
 * Record a signature without classifying, for the startup registry walk. A path
 * already recorded is left alone so seeding can never overwrite a live edit.
 */
export async function seedSfcSignature(path: string, source: string, filename: string, signatures: SfcSignatureStore): Promise<void> {
	if (signatures.has(path)) return;
	const signature = await sfcScriptSignature(source, filename);
	if (signature !== null && !signatures.has(path)) signatures.set(path, signature);
}
