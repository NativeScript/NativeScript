import Node from '../node/Node';
import ParentNode from '../parent-node/ParentNode';

/**
 * DocumentFragment.
 */
export default class DocumentFragment extends ParentNode {
	public nodeType = Node.DOCUMENT_FRAGMENT_NODE;
	public nodeName: string = '#document-fragment';
}
