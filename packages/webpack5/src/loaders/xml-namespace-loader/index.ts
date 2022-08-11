import { parse, join } from 'path';
import { promisify } from 'util';
import dedent from 'ts-dedent';
import { parser } from 'sax';

const noop = () => {};

const DEBUG = false;

interface NamespaceEntry {
	name: string;
	path: string;
}

interface ParseResult {
	code: string;
}

export default function loader(content: string, map: any) {
	const callback = this.async();

	// parse content and dependencies async
	parseXML
		.bind(this)(content)
		.then((res) => {
			DEBUG && console.log({ res });
			callback(null, res.code, map);
		})
		.catch((err) => {
			DEBUG && console.log({ err });
			callback(err);
		});
}

async function parseXML(content: string): Promise<ParseResult> {
	// wrap this.resolve into a promise
	const resolveAsync = promisify(this.resolve);
	const promises: Promise<any>[] = [];
	const namespaces: NamespaceEntry[] = [];
	const distinctNamespaces = new Map<string, string>();
	const moduleRegisters: string[] = [];
	const { ignore } = this.query;
	const errors = [];

	const saxParser = parser(true, { xmlns: true });

	// // Register ios and android prefixes as namespaces to avoid "unbound xml namespace" errors
	(saxParser as any).ns['ios'] = 'http://schemas.nativescript.org/tns.xsd';
	(saxParser as any).ns['android'] = 'http://schemas.nativescript.org/tns.xsd';
	(saxParser as any).ns['desktop'] = 'http://schemas.nativescript.org/tns.xsd';
	(saxParser as any).ns['web'] = 'http://schemas.nativescript.org/tns.xsd';

	const handleOpenTag = async (namespace: string, elementName: string) => {
		if (!namespace) {
			return;
		}

		if (namespace.startsWith('http')) {
			return;
		}

		const moduleName = `${namespace}/${elementName}`;

		if (namespaces.some((n) => n.name === moduleName)) {
			return;
		}

		if (ignore && moduleName.match(ignore)) {
			return;
		}

		const localNamespacePath = join(this.rootContext, namespace);
		const localModulePath = join(localNamespacePath, elementName);

		const resolvePaths = [
			localNamespacePath,
			localModulePath,
			moduleName,
			namespace,
			`~/${moduleName}`,
			`~/${namespace}`,
		];

		// fallbacks for codeless namespaces
		const fallbackResolvePaths = [
			`${localModulePath}.xml`,
			`${moduleName}.xml`,
			`~/${moduleName}.xml`,
		];

		DEBUG && console.log({ resolvePaths, fallbackResolvePaths });
		let resolvedPath;
		let isFallbackPath = false;

		for (const p of resolvePaths) {
			resolvedPath = await resolveAsync(this.context, p).catch(noop);

			// break on first match
			if (resolvedPath) {
				break;
			}
		}

		if (!resolvedPath) {
			for (const p of fallbackResolvePaths) {
				resolvedPath = await resolveAsync(this.context, p).catch(noop);

				// break on first match
				if (resolvedPath) {
					isFallbackPath = true;
					break;
				}
			}
		}

		DEBUG &&
			console.log({
				resolvedPath,
				isFallbackPath,
			});

		// bail if we haven't resolved a path
		if (!resolvedPath) {
			return;
		}

		const { dir, name } = parse(resolvedPath);

		DEBUG && console.log({ namespace, moduleName });

		// check if we are not in a fallback path, in which case we shouldn't register it as a namespace
		if (!isFallbackPath) {
			// register resolved path + short name
			namespaces.push({ name: namespace, path: resolvedPath });
			namespaces.push({ name: moduleName, path: resolvedPath });
			this.addDependency(resolvedPath);
		}

		const noExtFilename = join(dir, name);

		DEBUG &&
			console.log({
				noExtFilename,
			});

		// finally try resolving an XML file
		await resolveAsync(this.context, `${noExtFilename}.xml`)
			.then((xml) => {
				this.addDependency(xml);
				namespaces.push({ name: `${moduleName}.xml`, path: xml });
			})
			.catch(noop);
		// .catch(() => {
		// 	// if there is no XML file, fall back to namespace as the path
		// 	// will become require(<namespace>)
		// 	namespaces.push({ name: namespace, path: namespace });
		// 	namespaces.push({ name: moduleName, path: namespace });
		// });

		// look for css files with the same name
		await resolveAsync(this.context, `${noExtFilename}.css`)
			.then((css) => {
				this.addDependency(css);
				namespaces.push({ name: `${moduleName}.css`, path: css });
			})
			.catch(noop);
	};

	saxParser.onopentag = (node) => {
		if ('uri' in node) {
			promises.push(handleOpenTag(node.uri, node.local));
		}
	};
	saxParser.onerror = (error) => {
		saxParser.error = null;

		// Do only warning about invalid character "&"" for back-compatibility
		// as it is common to use it in a binding expression
		if (
			error.message.includes('Invalid character') &&
			error.message.includes('Char: &')
		) {
			return this.emitWarning(error);
		}
		errors.push(error);
	};

	saxParser.write(content).close();

	await Promise.all(promises);

	DEBUG && console.log({ namespaces });

	namespaces.forEach(({ name, path }) => {
		distinctNamespaces.set(name, path.replace(/\\/g, '/'));
	});

	DEBUG && console.log({ distinctNamespaces });

	distinctNamespaces.forEach((path, name) => {
		moduleRegisters.push(dedent`
			global.registerModule(
				'${name}',
				() => require("${path}")
			)
		`);
	});

	// escape special whitespace characters
	// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_plain_JSON.stringify_for_use_as_JavaScript
	const xml = JSON.stringify(content)
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');

	const hmrCode = this.hot
		? dedent`
			if(module.hot) {
				module.hot.accept()
				// module.hot.dispose(() => {})
			}
		`
		: ``;

	const code = dedent`
		${moduleRegisters.join('\n')}
		/* XML-NAMESPACE-LOADER */
		const ___XML_NAMESPACE_LOADER_EXPORT___ = ${xml}
		export default ___XML_NAMESPACE_LOADER_EXPORT___
		${hmrCode}
	`;

	if (errors.length) {
		errors.map(this.emitError);

		// finally throw the first one
		throw errors[0];
	}

	return {
		code,
	};
}

//
//
//
// function parseXML(xml: string) {
// 	const saxParser = parser(true, { xmlns: true });
//
// 	saxParser.onopentag = (node) => {
// 		if('ns' in node) {
// 			const uri = node.uri
// 			const tag = node.local
//
// 			DEBUG && console.log({
// 				uri,
// 				tag
// 			})
// 		}
// 	}
//
// 	saxParser.onerror = (err) => {
// 		DEBUG && console.log(err)
// 	}
//
// 	// Register ios and android prefixes as namespaces to avoid "unbound xml namespace" errors
// 	// saxParser.ns['ios'] = 'http://schemas.nativescript.org/tns.xsd';
// 	// saxParser.ns['android'] = 'http://schemas.nativescript.org/tns.xsd';
// 	// saxParser.ns['desktop'] = 'http://schemas.nativescript.org/tns.xsd';
// 	// saxParser.ns['web'] = 'http://schemas.nativescript.org/tns.xsd';
// 	saxParser.write(xml).close()
// }
