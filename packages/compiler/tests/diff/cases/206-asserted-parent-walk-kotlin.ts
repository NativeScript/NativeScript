// @lenient-kotlin
// A view tree where a parent may be a ViewBase that is no View (a TabViewItem): core asserts each
// parent to its own class as it walks up, which in JavaScript never fails.
class ViewBase {
	parent: ViewBase;
	name: string;
	constructor(name: string, parent?: ViewBase) {
		this.name = name;
		this.parent = parent;
	}
}

class ViewCommon extends ViewBase {
	hasAncestorView(ancestorView: ViewCommon): boolean {
		const matcher = (view: ViewCommon) => view === ancestorView;
		for (let parent = this.parent; parent != null; parent = parent.parent) {
			if (matcher(<ViewCommon>parent)) {
				return true;
			}
		}
		return false;
	}

	get frame(): Frame {
		return <Frame>this.parent;
	}

	parentKind(): string {
		const layout = <Frame>this.parent;
		return layout instanceof Frame ? 'in a frame' : 'not in a frame';
	}
}

class Frame extends ViewCommon {}
class Item extends ViewBase {}

const root = new ViewCommon('root');
const frame = new Frame('frame', root);
const tabs = new ViewCommon('tabs', frame);
const item = new Item('item', tabs);
const page = new ViewCommon('page', item);
const button = new ViewCommon('button', page);

console.log(button.hasAncestorView(page), button.hasAncestorView(tabs), button.hasAncestorView(root), page.hasAncestorView(button));
console.log(tabs.frame === frame, tabs.frame.name);
console.log(tabs.parentKind(), page.parentKind(), button.parentKind());
