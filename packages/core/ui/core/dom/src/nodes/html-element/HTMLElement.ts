import Element from '../element/Element';
import NodeTypeEnum from '../node/NodeTypeEnum';

export default class HTMLElement extends Element {
	isElement: boolean = true;
	isNativeELement: boolean = false;
	constructor(nodeType: NodeTypeEnum, type: string) {
		super(nodeType, type);
	}
}
