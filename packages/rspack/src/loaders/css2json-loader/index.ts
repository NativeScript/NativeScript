import postcss, { Root, Rule, Declaration, AtRule } from 'postcss';
import { urlToRequest } from 'loader-utils';
import { dedent } from 'ts-dedent';

const betweenQuotesPattern = /('|")(.*?)\1/;
const unpackUrlPattern = /url\(([^\)]+)\)/;
const inlineLoader = '!css2json-loader?useForImports!';

export default function loader(content: string, map: any) {
	const options = this.getOptions() || {};
	const inline = !!options.useForImports;
	const requirePrefix = inline ? inlineLoader : '';

	const ast = postcss.parse(content);

	// todo: revise if this is necessary
	// todo: perhaps use postCSS and just build imports into a single file?
	let dependencies = [];

	getAndRemoveImportRules(ast)
		.map(extractUrlFromRule)
		.map(createRequireUri)
		.forEach(({ requireURI }) => {
			dependencies.push(`require("${requirePrefix}${requireURI}")`);
		});

	const cssCompatibleAST = transformPostcssASTtoCSS(ast);

	const str = JSON.stringify(cssCompatibleAST);

	const code = dedent`
	/* CSS2JSON */
	${dependencies.join('\n')}
	const ___CSS2JSON_LOADER_EXPORT___ = ${str}
	export default ___CSS2JSON_LOADER_EXPORT___
	`;

	this.callback(null, code, map);
}

/**
 * Extract @import and remove them from the AST
 */
function getAndRemoveImportRules(ast: Root): AtRule[] {
	const imports = ast.nodes.filter(
		(node) => node.type === 'atrule' && node.name === 'import',
	) as AtRule[];
	imports.forEach((rule) => rule.remove());
	return imports;
}

/**
 * Extracts the url from import rule (ex. `url("./platform.css")`)
 */
function extractUrlFromRule(importRule: AtRule): string {
	const params = importRule.params;

	const unpackedUrlMatch = params.match(unpackUrlPattern);
	const unpackedValue = unpackedUrlMatch ? unpackedUrlMatch[1] : params;

	const quotesMatch = unpackedValue.match(betweenQuotesPattern);
	return quotesMatch ? quotesMatch[2] : unpackedValue;
}

function createRequireUri(uri): { uri: string; requireURI: string } {
	return {
		uri,
		requireURI: urlToRequest(uri),
	};
}

/**
 * TRANSFORMING THE POSTCSS AST TO THE ORIGINAL CSS AST
 */
function transformPostcssASTtoCSS(ast: Root) {
	return {
		type: 'stylesheet',
		stylesheet: {
			rules: ast.nodes
				.filter((node) => node.type === 'rule') // Solo reglas CSS, no comentarios ni otros
				.map(transformRule),
			parsingErrors: [],
		},
	};
}

function transformRule(rule: Rule) {
	return {
		type: 'rule',
		selectors: rule.selectors,
		declarations: rule.nodes
			.filter((node) => node.type === 'decl')
			.map(transformDeclaration),
	};
}

function transformDeclaration(decl: Declaration) {
	return {
		type: 'declaration',
		property: decl.prop,
		value: decl.value,
	};
}
