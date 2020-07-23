import { DockLayout as DockLayoutDefinition, Dock } from '.';
import { LayoutBase } from '../layout-base';
import { View, CSSType } from '../../core/view';
import { Property, makeValidator, makeParser } from '../../core/properties';
import { booleanConverter } from '../../core/view-base';

function validateArgs(element: View): View {
	if (!element) {
		throw new Error('element cannot be null or undefinied.');
	}

	return element;
}

export * from '../layout-base';

@CSSType('DockLayout')
export class DockLayoutBase extends LayoutBase implements DockLayoutDefinition {
	public static getDock(element: View): Dock {
		return validateArgs(element).dock;
	}

	public static setDock(element: View, value: Dock): void {
		validateArgs(element).dock = value;
	}

	public stretchLastChild: boolean;

	public onDockChanged(view: View, oldValue: Dock, newValue: Dock) {
		//
	}
}

DockLayoutBase.prototype.recycleNativeView = 'auto';

const dockConverter = makeParser<Dock>(makeValidator<Dock>('left', 'top', 'right', 'bottom'));
export const dockProperty = new Property<View, Dock>({
	name: 'dock',
	defaultValue: 'left',
	valueChanged: (target, oldValue, newValue) => {
		if (target instanceof View) {
			const layout = target.parent;
			if (layout instanceof DockLayoutBase) {
				layout.onDockChanged(target, oldValue, newValue);
			}
		}
	},
	valueConverter: dockConverter,
});
dockProperty.register(View);

export const stretchLastChildProperty = new Property<DockLayoutBase, boolean>({
	name: 'stretchLastChild',
	defaultValue: true,
	affectsLayout: global.isIOS,
	valueConverter: booleanConverter,
});
stretchLastChildProperty.register(DockLayoutBase);
