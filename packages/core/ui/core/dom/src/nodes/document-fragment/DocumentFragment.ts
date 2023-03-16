import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';
/**
 * DocumentFragment.
 */
export default class DocumentFragment extends ParentNode {
	public nodeType = NodeTypeEnum.documentFragmentNode;
	public nodeName: string = '#document-fragment';
	public localName: string = '#document-fragment';
	constructor() {
		super();
		this._rootNode = this;
	}
}
