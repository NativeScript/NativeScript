import { parse, join } from 'path';
import { promisify } from 'util';
import { loader } from 'webpack';
import { parser, QualifiedTag } from 'sax';

import { convertSlashesInPath } from './projectHelpers';

interface NamespaceEntry {
	name: string;
	path: string;
}

const loader: loader.Loader = function (source: string, map) {
	const { ignore } = this.query;

	let callbackCalled = false;
	const callback = this.async();
	const callbackWrapper = (error?: Error, content?: string, map?: any) => {
		if (!callbackCalled) {
			callbackCalled = true;
			callback(error, content, map);
		}
	};

	const resolvePromise = promisify(this.resolve);
	const promises: Promise<any>[] = [];
	const namespaces: NamespaceEntry[] = [];

	const handleOpenTag = (namespace: string, elementName: string) => {
		const moduleName = `${namespace}/${elementName}`;
		if (namespace && !namespace.startsWith('http') && !namespaces.some((n) => n.name === moduleName) && (!ignore || !moduleName.match(ignore))) {
			const localNamespacePath = join(this.rootContext, namespace);
			const localModulePath = join(localNamespacePath, elementName);

			const pathResolved = (resolvedPath) => {
				this.addDependency(resolvedPath);

				namespaces.push({ name: namespace, path: resolvedPath });
				namespaces.push({ name: moduleName, path: resolvedPath });

				const { dir, name } = parse(resolvedPath);
				const noExtFilename = join(dir, name);

				return Promise.all([
					resolvePromise(this.context, `${noExtFilename}.xml`)
						.then((xml) => {
							this.addDependency(xml);
							namespaces.push({ name: `${moduleName}.xml`, path: xml });
						})
						.catch((err) => {}),

					resolvePromise(this.context, `${noExtFilename}.css`)
						.then((css) => {
							this.addDependency(css);
							namespaces.push({ name: `${moduleName}.css`, path: css });
						})
						.catch((err) => {}),
				]);
			};

			promises.push(
				resolvePromise(this.context, localNamespacePath)
					.then((path) => pathResolved(path))
					.catch(() => {
						return resolvePromise(this.context, localModulePath)
							.then((path) => pathResolved(path))
							.catch(() => {
								return Promise.all([
									resolvePromise(this.context, `${localModulePath}.xml`)
										.then((xml) => {
											namespaces.push({ name: `${moduleName}.xml`, path: xml });
											this.addDependency(xml);
										})
										.catch(() => {
											namespaces.push({ name: namespace, path: namespace });
											namespaces.push({ name: moduleName, path: namespace });
										}),

									resolvePromise(this.context, `${localModulePath}.css`)
										.then((css) => {
											namespaces.push({ name: `${moduleName}.css`, path: css });
											this.addDependency(css);
										})
										.catch(() => {}),
								]);
							});
					})
			);
		}
	};

	const saxParser = parser(true, { xmlns: true });

	// Register ios and android prefixes as namespaces to avoid "unbound xml namespace" errors
	(<any>saxParser).ns['ios'] = 'http://schemas.nativescript.org/tns.xsd';
	(<any>saxParser).ns['android'] = 'http://schemas.nativescript.org/tns.xsd';
	(<any>saxParser).ns['desktop'] = 'http://schemas.nativescript.org/tns.xsd';
	(<any>saxParser).ns['web'] = 'http://schemas.nativescript.org/tns.xsd';

	saxParser.onopentag = (node: QualifiedTag) => {
		handleOpenTag(node.uri, node.local);
	};
	saxParser.onerror = (err) => {
		// Do only warning about invalid character "&"" for back-compatibility
		// as it is common to use it in a binding expression
		if (err && err.message.indexOf('Invalid character') >= 0 && err.message.indexOf('Char: &') >= 0) {
			this.emitWarning(err);
		} else {
			callbackWrapper(err);
		}

		saxParser.error = null;
	};
	saxParser.write(source).close();

	Promise.all(promises)
		.then(() => {
			const distinctNamespaces = new Map<string, string>();
			namespaces.forEach(({ name, path }) => distinctNamespaces.set(name, convertSlashesInPath(path)));

			const moduleRegisters: string[] = [];
			distinctNamespaces.forEach((path, name) => {
				moduleRegisters.push(`global.registerModule("${name}", function() { return require("${path}"); });\n`);
			});

			// escape special whitespace characters
			// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_plain_JSON.stringify_for_use_as_JavaScript
			const json = JSON.stringify(source)
				.replace(/\u2028/g, '\\u2028')
				.replace(/\u2029/g, '\\u2029');

			const wrapped = `${moduleRegisters.join('')}\nmodule.exports = ${json}`;

			callbackWrapper(null, wrapped, map);
		})
		.catch((err) => {
			callbackWrapper(err);
		});
};

export default loader;
