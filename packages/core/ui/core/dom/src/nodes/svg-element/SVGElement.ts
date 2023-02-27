import Element from '../element/Element';
import NodeTypeEnum from '../node/NodeTypeEnum';

export default class SVGElement extends Element {
	constructor(nodeType: NodeTypeEnum, localName: string) {
		super(nodeType, localName);
		this.namespaceURI = 'http://www.w3.org/2000/svg';
	}
}
