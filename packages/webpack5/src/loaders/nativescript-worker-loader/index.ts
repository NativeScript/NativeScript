const WorkerDependency = require('webpack/lib/dependencies/WorkerDependency');
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');

/**
 * Patch WorkerDependency to change:
 *
 * new Worker(new URL(workerPath, baseUrl))
 *            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * to.
 *
 * new Worker('~/' + workerPath)
 *
 * Note: we are changing source **outside** of the dependency range, and this may
 * break when the dependency range changes, for example if this PR is merged:
 *  - https://github.com/webpack/webpack/pull/12750
 */
WorkerDependency.Template.prototype.apply = function apply(
	dependency,
	source,
	templateContext
) {
	const { chunkGraph, moduleGraph, runtimeRequirements } = templateContext;
	const dep = /** @type {WorkerDependency} */ dependency;
	const block = /** @type {AsyncDependenciesBlock} */ moduleGraph.getParentBlock(
		dependency
	);
	const entrypoint = /** @type {Entrypoint} */ chunkGraph.getBlockChunkGroup(
		block
	);
	const chunk = entrypoint.getEntrypointChunk();

	// runtimeRequirements.add(RuntimeGlobals.publicPath);
	// runtimeRequirements.add(RuntimeGlobals.baseURI);
	runtimeRequirements.add(RuntimeGlobals.getChunkScriptFilename);

	/**
	 * new URL(
	 * ^^^^^^^^ = 8 characters, we subtract it from the dep.range[0]
	 */
	source.replace(
		dep.range[0] - 8,
		dep.range[1],
		`/* worker import */ /* patched by nativescript-worker-loader */ '~/' + ${
			RuntimeGlobals.getChunkScriptFilename
		}(${JSON.stringify(chunk.id)})`
	);
};

const NEW_WORKER_WITH_STRING_RE = /new\s+Worker\((['"`].+['"`])\)/g;

/**
 * Replaces
 * new Worker('./somePath')
 * with
 * new Worker(new URL('./somePath', import.meta.url))
 */
export default function loader(content: string, map: any) {
	const source = content.replace(
		NEW_WORKER_WITH_STRING_RE,
		'new Worker(new URL($1, import.meta.url))'
	);
	this.callback(null, source, map);
}
