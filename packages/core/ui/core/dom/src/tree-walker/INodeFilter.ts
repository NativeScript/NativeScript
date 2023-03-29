import Node from '../nodes/node/Node';

export default interface INodeFilter {
	acceptNode(node: Node): number;
}
