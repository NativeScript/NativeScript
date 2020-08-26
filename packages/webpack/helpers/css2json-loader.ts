import { parse, Import, Stylesheet } from 'css';
import { loader } from 'webpack';
import { getOptions, urlToRequest } from 'loader-utils';

const betweenQuotesPattern = /('|")(.*?)\1/;
const unpackUrlPattern = /url\(([^\)]+)\)/;
const inlineLoader = '!@nativescript/webpack/helpers/css2json-loader?useForImports!';

const loader: loader.Loader = function (content: string, map) {
	const options = getOptions(this) || {};
	const inline = !!options.useForImports;
	const requirePrefix = inline ? inlineLoader : '';

	const ast = parse(content, undefined);

	let dependencies = [];
	getImportRules(ast)
		.map(extractUrlFromRule)
		.map(createRequireUri)
		.forEach(({ uri, requireURI }) => {
			dependencies.push(`global.registerModule("${uri}", () => require("${requirePrefix}${requireURI}"));`);

			// Call registerModule with requireURI to handle cases like @import "~@nativescript/theme/css/blue.css";
			if (uri !== requireURI) {
				dependencies.push(`global.registerModule("${requireURI}", () => require("${requirePrefix}${requireURI}"));`);
			}
		});
	const str = JSON.stringify(ast, (k, v) => (k === 'position' ? undefined : v));
	this.callback(null, `${dependencies.join('\n')}module.exports = ${str};`);
};

function getImportRules(ast: Stylesheet): Import[] {
	if (!ast || (<any>ast).type !== 'stylesheet' || !ast.stylesheet) {
		return [];
	}
	return <Import[]>ast.stylesheet.rules.filter((rule) => rule.type === 'import' && (<any>rule).import);
}

/**
 * Extracts the url from import rule (ex. `url("./platform.css")`)
 */
function extractUrlFromRule(importRule: Import): string {
	const urlValue = importRule.import;

	const unpackedUrlMatch = urlValue.match(unpackUrlPattern);
	const unpackedValue = unpackedUrlMatch ? unpackedUrlMatch[1] : urlValue;

	const quotesMatch = unpackedValue.match(betweenQuotesPattern);
	return quotesMatch ? quotesMatch[2] : unpackedValue;
}

function createRequireUri(uri): { uri: string; requireURI: string } {
	return {
		uri: uri,
		requireURI: urlToRequest(uri),
	};
}

export default loader;
