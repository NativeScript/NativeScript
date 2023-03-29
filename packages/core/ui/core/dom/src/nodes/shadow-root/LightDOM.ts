interface LightNodeRef {
	node: any;
	previousSibling?: LightNodeRef;
	nextSibling?: LightNodeRef;
}

function createLightNodeRef(node: any, dom?: LightDOM, previousSibling?: LightNodeRef, nextSibling?: LightNodeRef) {
	return {
		node,
		previousSibling,
		nextSibling,
		dom,
	};
}
/**
 * This is the part of the Shadow DOM that is **not** rendered
 * in the DOM tree but only used by Shadow DOM to reference
 * and find nodes.
 */
export class LightDOM {
	firstChild: LightNodeRef | undefined;
	lastChild: LightNodeRef | undefined;
	childrenCount: number = 0;
	/**
	 * A unique key to track childern nodes.
	 */
	private ref: string;
	public parent: any;
	constructor(ref: string = '__lightRef', parent?: any) {
		this.ref = ref;
		this.parent = parent;
	}

	appendChild(node: any) {
		if (node[this.ref]) return;
		const ref = createLightNodeRef(node, this);
		if (!this.firstChild) {
			this.firstChild = ref;
			this.lastChild = ref;
			node[this.ref] = ref;
			this.childrenCount++;
			return;
		}

		ref.previousSibling = this.lastChild;
		if (this.lastChild) this.lastChild.nextSibling = ref;
		this.lastChild = ref;
		node[this.ref] = ref;
		this.childrenCount++;
	}

	insertBefore(newNode: any, refNode: any) {
		if (refNode && !refNode[this.ref]) return;
		if (newNode === refNode) return;
		if (!refNode) {
			this.appendChild(newNode);
			return;
		}

		const referencedRef = refNode[this.ref] as LightNodeRef;
		const ref = createLightNodeRef(newNode, this, referencedRef.previousSibling, referencedRef);
		if (referencedRef.previousSibling) {
			referencedRef.previousSibling.nextSibling = ref;
		} else {
			this.firstChild = ref;
		}
		referencedRef.previousSibling = ref;

		if (!referencedRef.nextSibling) {
			this.lastChild = referencedRef;
		}

		newNode[this.ref] = ref;
		this.childrenCount++;
	}

	replaceChild(newChild: any, oldChild: any) {
		const oldRef = oldChild[this.ref] as LightNodeRef;
		const ref = createLightNodeRef(newChild, this, oldRef.previousSibling, oldRef.nextSibling);
		if (ref.nextSibling) {
			ref.nextSibling.previousSibling = ref;
		} else {
			// if old child has no next siblings, it's the last child
			this.lastChild = ref;
		}

		if (ref.previousSibling) {
			ref.previousSibling.nextSibling = ref;
		} else {
			// if old child has no previous siblings, it's the first child
			this.firstChild = ref;
		}

		oldChild[this.ref] = undefined;
	}

	removeChild(node: any) {
		if (!node[this.ref]) return;
		const ref = node[this.ref] as LightNodeRef;
		const previousSibling = ref.previousSibling;
		const nextSibling = ref.nextSibling;
		// One node, the dom becomes empty.
		if (!previousSibling && !nextSibling) {
			this.firstChild = undefined;
			this.lastChild = undefined;
		}
		// Node is at start, nextSibling becomes the firstChild.
		else if (!previousSibling && nextSibling) {
			this.firstChild = nextSibling;
		}
		// Node is at end,  previousSibling becomes lastChild
		else if (previousSibling && !nextSibling) {
			previousSibling.nextSibling = undefined;
			this.lastChild = previousSibling;
		}
		// Node is in between some where, link prev & next siblings with each other.
		else if (previousSibling && nextSibling) {
			nextSibling.previousSibling = previousSibling;
			previousSibling.nextSibling = nextSibling;
		}

		node[this.ref] = undefined;
		this.childrenCount--;
	}

	get childNodes() {
		const childNodes = [];
		let currentChild: LightNodeRef | undefined = this.firstChild;
		while (currentChild) {
			childNodes.push(currentChild.node);
			currentChild = currentChild.nextSibling;
		}
		return childNodes;
	}
}
