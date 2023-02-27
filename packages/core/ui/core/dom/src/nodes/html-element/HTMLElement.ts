import Element from '../element/Element';
import NodeTypeEnum from '../node/NodeTypeEnum';

export default class HTMLElement extends Element {
	constructor(nodeType: NodeTypeEnum, type: string) {
		super(nodeType, type);
	}
}
