import NodeTypeEnum from '../nodes/node/NodeTypeEnum';
const selfClosingTags = {
	area: true,
	base: true,
	br: true,
	col: true,
	command: true,
	embed: true,
	hr: true,
	img: true,
	input: true,
	keygen: true,
	link: true,
	menuitem: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,
};

// const serializerRegexp = /[&'"<>\u00a0-\u00b6\u00b8-\u00ff\u0152\u0153\u0160\u0161\u0178\u0192\u02c6\u02dc\u0391-\u03a1\u03a3-\u03a9\u03b1-\u03c9\u03d1\u03d2\u03d6\u2002\u2003\u2009\u200c-\u200f\u2013\u2014\u2018-\u201a\u201c-\u201e\u2020-\u2022\u2026\u2030\u2032\u2033\u2039\u203a\u203e\u20ac\u2122\u2190-\u2194\u21b5\u2200\u2202\u2203\u2205\u2207-\u2209\u220b\u220f\u2211\u2212\u2217\u221a\u221d\u221e\u2220\u2227-\u222b\u2234\u223c\u2245\u2248\u2260\u2261\u2264\u2265\u2282-\u2284\u2286\u2287\u2295\u2297\u22a5\u22c5\u2308-\u230b\u25ca\u2660\u2663\u2665\u2666]/g
const serializerRegexp = /[&'"<>]/g;

const enc = (s: string) => `${s}`.replace(serializerRegexp, (a) => `&#${a.codePointAt(0)};`);

const attr = (a: { value: any; ns: string; name: string }) => {
	if (a.value) {
		if (a.ns) {
			return ` ${a.ns}:${a.name}="${enc(a.value)}"`;
		}
		return ` ${a.name}="${enc(a.value)}"`;
	}
	return ` ${a.name}`;
};

const serialize = (el: Node, useRawName?: boolean) => {
	switch (el.nodeType) {
		case NodeTypeEnum.textNode: {
			if ((el as Text).data) {
				if (el.parentNode && ['SCRIPT', 'STYLE'].indexOf(el.parentNode.nodeName) > -1) return (el as Text).data;
				return enc((el as Text).data);
			}
			return '';
		}

		case NodeTypeEnum.commentNode: {
			if ((el as Comment).data) return `<!--${(el as Comment).data}-->`;
			return '<!---->';
		}

		default: {
			if (!el.nodeName) return '';

			const { nodeName, localName, attributes, firstChild } = el as HTMLElement;
			const xmlStringFrags = [];

			let tag = nodeName;

			if (useRawName) tag = localName;
			else tag = nodeName.toLowerCase();

			if (tag && tag[0] === '#') tag = tag.substring(1);

			if (tag) xmlStringFrags.push(`<${tag}`);
			if (attributes) xmlStringFrags.push(...(attributes as unknown as any[]).map(attr));
			if (firstChild) {
				if (tag) xmlStringFrags.push('>');

				let currentNode = firstChild;
				while (currentNode) {
					xmlStringFrags.push(serialize(currentNode, useRawName));
					currentNode = currentNode.nextSibling;
				}

				if (tag) xmlStringFrags.push(`</${tag}>`);
			} else if (tag) {
				if (selfClosingTags[tag]) xmlStringFrags.push('/>');
				else xmlStringFrags.push(`></${tag}>`);
			}

			return ''.concat(...xmlStringFrags);
		}
	}
};

export default {
	serializeToString: serialize,
};
