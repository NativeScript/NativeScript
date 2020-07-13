import { GridLayoutBase, ItemSpec as ItemSpecBase, rowProperty, columnProperty, rowSpanProperty, columnSpanProperty, GridUnitType } from './grid-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

export * from './grid-layout-common';

function makeNativeSetter<T>(setter: (lp: org.nativescript.widgets.CommonLayoutParams, value: T) => void) {
	return function (this: View, value: T) {
		const nativeView: android.view.View = this.nativeViewProtected;
		const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
		if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
			setter(lp, value);
			nativeView.setLayoutParams(lp);
		}
	};
}

View.prototype[rowProperty.setNative] = makeNativeSetter<number>((lp, value) => (lp.row = value));
View.prototype[columnProperty.setNative] = makeNativeSetter<number>((lp, value) => (lp.column = value));
View.prototype[rowSpanProperty.setNative] = makeNativeSetter<number>((lp, value) => (lp.rowSpan = value));
View.prototype[columnSpanProperty.setNative] = makeNativeSetter<number>((lp, value) => (lp.columnSpan = value));

function createNativeSpec(itemSpec: ItemSpec): org.nativescript.widgets.ItemSpec {
	switch (itemSpec.gridUnitType) {
		case GridUnitType.AUTO:
			return new org.nativescript.widgets.ItemSpec(itemSpec.value, org.nativescript.widgets.GridUnitType.auto);

		case GridUnitType.STAR:
			return new org.nativescript.widgets.ItemSpec(itemSpec.value, org.nativescript.widgets.GridUnitType.star);

		case GridUnitType.PIXEL:
			return new org.nativescript.widgets.ItemSpec(itemSpec.value * layout.getDisplayDensity(), org.nativescript.widgets.GridUnitType.pixel);

		default:
			throw new Error('Invalid gridUnitType: ' + itemSpec.gridUnitType);
	}
}

export class ItemSpec extends ItemSpecBase {
	nativeSpec: org.nativescript.widgets.ItemSpec;

	public get actualLength(): number {
		if (this.nativeSpec) {
			return Math.round(this.nativeSpec.getActualLength() / layout.getDisplayDensity());
		}

		return 0;
	}
}

export class GridLayout extends GridLayoutBase {
	nativeViewProtected: org.nativescript.widgets.GridLayout;

	public createNativeView() {
		return new org.nativescript.widgets.GridLayout(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		// Update native GridLayout
		this.rowsInternal.forEach((itemSpec: ItemSpec, index, rows) => {
			this._onRowAdded(itemSpec);
		}, this);
		this.columnsInternal.forEach((itemSpec: ItemSpec, index, rows) => {
			this._onColumnAdded(itemSpec);
		}, this);
	}

	public resetNativeView() {
		// Update native GridLayout
		for (let i = this.rowsInternal.length; i--; i >= 0) {
			const itemSpec = <ItemSpec>this.rowsInternal[i];
			this._onRowRemoved(itemSpec, i);
		}

		for (let i = this.columnsInternal.length; i--; i >= 0) {
			const itemSpec = <ItemSpec>this.columnsInternal[i];
			this._onColumnRemoved(itemSpec, i);
		}

		super.resetNativeView();
	}

	public _onRowAdded(itemSpec: ItemSpec) {
		if (this.nativeViewProtected) {
			const nativeSpec = createNativeSpec(itemSpec);
			itemSpec.nativeSpec = nativeSpec;
			this.nativeViewProtected.addRow(nativeSpec);
		}
	}

	public _onColumnAdded(itemSpec: ItemSpec) {
		if (this.nativeViewProtected) {
			const nativeSpec = createNativeSpec(itemSpec);
			itemSpec.nativeSpec = nativeSpec;
			this.nativeViewProtected.addColumn(nativeSpec);
		}
	}

	public _onRowRemoved(itemSpec: ItemSpec, index: number) {
		itemSpec.nativeSpec = null;
		if (this.nativeViewProtected) {
			this.nativeViewProtected.removeRowAt(index);
		}
	}

	public _onColumnRemoved(itemSpec: ItemSpec, index: number) {
		itemSpec.nativeSpec = null;
		if (this.nativeViewProtected) {
			this.nativeViewProtected.removeColumnAt(index);
		}
	}

	protected invalidate(): void {
		// No need to request layout for android because it will be done in the native call.
	}
}
