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

ItemSpecBase.prototype.toJSON = function () {
	let result;
	switch (this.gridUnitType) {
		case GridUnitType.AUTO:
			result = { type: 0 /* org.nativescript.widgets.GridUnitType.auto */, value: this.value };
			break;
		case GridUnitType.PIXEL:
			result = { type: 1 /* org.nativescript.widgets.GridUnitType.pixel */, value: this.value * layout.getDisplayDensity() };
			break;
		case GridUnitType.STAR:
			result = { type: 2 /* org.nativescript.widgets.GridUnitType.star */, value: this.value };
			break;
		default:
			return null;
	}
	return result;
};

interface ItemSpec extends ItemSpecBase {
	toJSON(): { value: number; type: number };
}

export class GridLayout extends GridLayoutBase {
	nativeViewProtected: org.nativescript.widgets.GridLayout;

	public createNativeView() {
		return new org.nativescript.widgets.GridLayout(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		// Update native GridLayout
		const jsonRows = JSON.stringify(this.rowsInternal.map((itemSpec: ItemSpec) => itemSpec.toJSON()).filter((j) => !!j));
		const jsonColumns = JSON.stringify(this.columnsInternal.map((itemSpec: ItemSpec) => itemSpec.toJSON()).filter((j) => !!j));
		this.nativeViewProtected.addRowsAndColumnsFromJSON(jsonRows, jsonColumns);
	}

	public resetNativeView() {
		// Update native GridLayout
		this.nativeViewProtected.reset();
		super.resetNativeView();
	}

	public _onRowAdded(itemSpec: ItemSpec) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.addRowsFromJSON(JSON.stringify(itemSpec.toJSON()));
		}
	}

	public addRows(itemSpecs: ItemSpec[]) {
		let jsonArray = [];
		const nativeView = this.nativeViewProtected;
		const initialized = !!nativeView;
		for (let index = 0; index < itemSpecs.length; index++) {
			const itemSpec = itemSpecs[index];
			this._addRow(itemSpec);
			if (initialized) {
				jsonArray.push(itemSpec.toJSON());
			}
		}
		if (initialized) {
			nativeView.addRowsFromJSON(JSON.stringify(jsonArray.filter((s) => !!s)));
		}
	}

	public addColumns(itemSpecs: ItemSpec[]) {
		let jsonArray = [];
		const nativeView = this.nativeViewProtected;
		const initialized = !!nativeView;
		for (let index = 0; index < itemSpecs.length; index++) {
			const itemSpec = itemSpecs[index];
			this._addColumn(itemSpec);
			if (initialized) {
				jsonArray.push(itemSpec.toJSON());
			}
		}
		if (initialized) {
			nativeView.addColumnsFromJSON(JSON.stringify(jsonArray.filter((s) => !!s)));
		}
	}

	public _onColumnAdded(itemSpec: ItemSpec) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.addColumnsFromJSON(JSON.stringify(itemSpec.toJSON()));
		}
	}

	public removeColumns() {
		if (this._cols.length) {
			if (this.nativeViewProtected) {
				this.nativeViewProtected.clearColumns();
			}
			this._cols.length = 0;
		}
	}

	public removeRows() {
		if (this._rows.length) {
			if (this.nativeViewProtected) {
				this.nativeViewProtected.clearRows();
			}
			this._rows.length = 0;
		}
	}

	public _onRowRemoved(itemSpec: ItemSpec, index: number) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.removeRowAt(index);
		}
	}

	public _onColumnRemoved(itemSpec: ItemSpec, index: number) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.removeColumnAt(index);
		}
	}

	protected invalidate(): void {
		// No need to request layout for android because it will be done in the native call.
	}
}
