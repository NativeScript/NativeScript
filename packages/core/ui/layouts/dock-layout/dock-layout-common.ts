import { DockLayout as DockLayoutDefinition } from '.';
import { CoreTypes } from '../../../core-types';
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
	public static getDock(element: View): CoreTypes.DockType {
		return validateArgs(element).dock;
	}

	public static setDock(element: View, value: CoreTypes.DockType): void {
		validateArgs(element).dock = value;
	}

	public stretchLastChild: boolean;

	public onDockChanged(view: View, oldValue: CoreTypes.DockType, newValue: CoreTypes.DockType) {
		//
	}
}

DockLayoutBase.prototype.recycleNativeView = 'auto';

const dockConverter = makeParser<CoreTypes.DockType>(makeValidator<CoreTypes.DockType>(CoreTypes.Dock.left, CoreTypes.Dock.top, CoreTypes.Dock.right, CoreTypes.Dock.bottom));
export const dockProperty = new Property<View, CoreTypes.DockType>({
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
