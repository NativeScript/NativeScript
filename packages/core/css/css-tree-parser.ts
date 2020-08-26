import { parse } from 'css-tree';

function mapSelectors(selector: string): string[] {
	if (!selector) {
		return [];
	}

	return selector.split(/\s*(?![^(]*\)),\s*/).map((s) => s.replace(/\u200C/g, ','));
}

function mapPosition(node, css) {
	let res: any = {
		start: {
			line: node.loc.start.line,
			column: node.loc.start.column,
		},
		end: {
			line: node.loc.end.line,
			column: node.loc.end.column,
		},
		content: css,
	};

	if (node.loc.source && node.loc.source !== '<unknown>') {
		res.source = node.loc.source;
	}

	return res;
}

function transformAst(node, css, type = null) {
	if (!node) {
		return;
	}

	if (node.type === 'StyleSheet') {
		return {
			type: 'stylesheet',
			stylesheet: {
				rules: node.children
					.map((child) => transformAst(child, css))
					.filter((child) => child !== null)
					.toArray(),
				parsingErrors: [],
			},
		};
	}

	if (node.type === 'Atrule') {
		let atrule: any = {
			type: node.name,
		};

		if (node.name === 'supports' || node.name === 'media') {
			atrule[node.name] = node.prelude.value;
			atrule.rules = transformAst(node.block, css);
		} else if (node.name === 'page') {
			atrule.selectors = node.prelude ? mapSelectors(node.prelude.value) : [];
			atrule.declarations = transformAst(node.block, css);
		} else if (node.name === 'document') {
			atrule.document = node.prelude ? node.prelude.value : '';
			atrule.vendor = '';
			atrule.rules = transformAst(node.block, css);
		} else if (node.name === 'font-face') {
			atrule.declarations = transformAst(node.block, css);
		} else if (node.name === 'import' || node.name === 'charset' || node.name === 'namespace') {
			atrule[node.name] = node.prelude ? node.prelude.value : '';
		} else if (node.name === 'keyframes') {
			atrule.name = node.prelude ? node.prelude.value : '';
			atrule.keyframes = transformAst(node.block, css, 'keyframe');
			atrule.vendor = undefined;
		} else {
			atrule.rules = transformAst(node.block, css);
		}

		atrule.position = mapPosition(node, css);

		return atrule;
	}

	if (node.type === 'Block') {
		return node.children
			.map((child) => transformAst(child, css, type))
			.filter((child) => child !== null)
			.toArray();
	}

	if (node.type === 'Rule') {
		let value = node.prelude.value;

		let res: any = {
			type: type != null ? type : 'rule',
			declarations: transformAst(node.block, css),
			position: mapPosition(node, css),
		};

		if (type === 'keyframe') {
			res.values = mapSelectors(value);
		} else {
			res.selectors = mapSelectors(value);
		}

		return res;
	}

	if (node.type === 'Comment') {
		return {
			type: 'comment',
			comment: node.value,
			position: mapPosition(node, css),
		};
	}

	if (node.type === 'Declaration') {
		return {
			type: 'declaration',
			property: node.property,
			value: node.value.value ? node.value.value.trim() : '',
			position: mapPosition(node, css),
		};
	}

	if (node.type === 'Raw') {
		return null;
	}

	throw Error(`Unknown node type ${node.type}`);
}

export function cssTreeParse(css, source): any {
	let errors = [];
	let ast = parse(css, {
		parseValue: false,
		parseAtrulePrelude: false,
		parseRulePrelude: false,
		positions: true,
		filename: source,
		onParseError: (error) => {
			errors.push(`${source}:${error.line}:${error.column}: ${error.formattedMessage}`);
		},
	});

	if (errors.length > 0) {
		throw new Error(errors[0]);
	}

	return transformAst(ast, css);
}
