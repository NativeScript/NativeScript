import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';
/**
 * DocumentFragment.
 */
export default class DocumentFragment extends ParentNode {
	public nodeType = NodeTypeEnum.documentFragmentNode;
	public nodeName: string = '#document-fragment';
	public localName: string = '#document-fragment';
	isParentNode = true;
	// Set this to true if you want the
	// children of this fragment to render.
	// By default  native counerparts of the
	// elements inside a DocumentFragement are
	// not created.
	canRender = false;
	constructor() {
		super();
		this._rootNode = this;
	}
}
DocumentFragment.prototype['adoptedStyleSheets'] = [];
