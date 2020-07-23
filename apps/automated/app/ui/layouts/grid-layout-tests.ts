import { Page } from '@nativescript/core/ui/page';
import { GridLayout, ItemSpec } from '@nativescript/core/ui/layouts/grid-layout';
import { Button } from '@nativescript/core/ui/button';
import * as TKUnit from '../../tk-unit';
import * as view from '@nativescript/core/ui/core/view';
import { unsetValue } from '@nativescript/core';
import { Builder } from '@nativescript/core/ui/builder';
import * as testModule from '../../ui-test';
import * as layoutHelper from './layout-helper';
import * as platform from '@nativescript/core/platform';
import * as commonTests from './common-layout-tests';
import * as helper from '../../ui-helper';
var DELTA = 1;

class RemovalTrackingGridLayout extends GridLayout {
	public removedRows = 0;
	public removedCols = 0;

	public _onRowRemoved(itemSpec: ItemSpec, index: number) {
		this.removedRows++;
		super._onRowRemoved(itemSpec, index);
	}

	public _onColumnRemoved(itemSpec: ItemSpec, index: number) {
		this.removedCols++;
		super._onColumnRemoved(itemSpec, index);
	}
}

export class GridLayoutTest extends testModule.UITest<RemovalTrackingGridLayout> {
	public create(): RemovalTrackingGridLayout {
		return new RemovalTrackingGridLayout();
	}

	public test_recycling() {
		helper.nativeView_recycling_test(() => new GridLayout());
	}

	public test_item_recycling() {
		helper.nativeView_recycling_test(
			() => new Button(),
			() => new GridLayout()
		);
	}

	private row(view: view.View): number {
		return GridLayout.getRow(view);
	}

	private rowSpan(view: view.View): number {
		return GridLayout.getRowSpan(view);
	}

	private col(view: view.View): number {
		return GridLayout.getColumn(view);
	}

	private colSpan(view: view.View): number {
		return GridLayout.getColumnSpan(view);
	}

	private prepareGridLayout(wait?: boolean) {
		this.testView.addRow(new ItemSpec(1, 'star'));
		this.testView.addRow(new ItemSpec(2, 'star'));
		this.testView.addRow(new ItemSpec(layoutHelper.dp(50), 'pixel'));
		this.testView.addRow(new ItemSpec(50, 'auto'));

		this.testView.addColumn(new ItemSpec(1, 'star'));
		this.testView.addColumn(new ItemSpec(2, 'star'));
		this.testView.addColumn(new ItemSpec(layoutHelper.dp(50), 'pixel'));
		this.testView.addColumn(new ItemSpec(50, 'auto'));

		for (var r = 0; r < 4; r++) {
			for (var c = 0; c < 4; c++) {
				var btn = new layoutHelper.MyButton();
				btn.text = 'R' + r + 'C' + c;
				GridLayout.setColumn(btn, c);
				GridLayout.setRow(btn, r);
				if (c === 3) {
					btn.width = { value: 100, unit: 'px' }; // Auto column should take 100px for this test.
				}

				if (r === 3) {
					btn.height = { value: 100, unit: 'px' }; // Auto row should take 100px for this test.
				}

				this.testView.addChild(btn);
			}
		}

		this.testView.width = { value: 300, unit: 'px' };
		this.testView.height = { value: 300, unit: 'px' };

		if (wait) {
			this.waitUntilTestElementLayoutIsValid();
		}
	}

	public test_row_defaultValue() {
		var test = new Button();
		TKUnit.assert(test !== null);
		TKUnit.assertEqual(this.row(test), 0, "'row' property default value should be 0.");
	}

	public test_rowSpan_defaultValue() {
		var test = new Button();
		TKUnit.assert(test !== null);
		TKUnit.assertEqual(this.rowSpan(test), 1, "'rowSpan' property default value should be 1.");
	}

	public test_column_defaultValue() {
		var test = new Button();
		TKUnit.assert(test !== null);
		TKUnit.assertEqual(this.col(test), 0, "'column' property default value should be 0.");
	}

	public test_columnSpan_defaultValue() {
		var test = new Button();
		TKUnit.assert(test !== null);
		TKUnit.assertEqual(this.colSpan(test), 1, "'columnSpan' property default value should be 1.");
	}

	public test_synonym_property_setting_column_changes_col() {
		const test = new Button();

		test.column = 3;

		TKUnit.assertEqual(test.column, 3, 'Setting column should work.');
		TKUnit.assertEqual(test.col, 3, 'Setting column property should affect col property.');
	}

	public test_synonym_property_setting_col_changes_column() {
		const test = new Button();

		test.col = 3;

		TKUnit.assertEqual(test.col, 3, 'Setting col should work.');
		TKUnit.assertEqual(test.column, 3, 'Setting col property should affect column property.');
	}

	public test_synonym_property_setColumn_should_set_col_and_column() {
		const test = new Button();

		GridLayout.setColumn(test, 3);

		TKUnit.assertEqual(test.col, 3, 'setColumn should set col');
		TKUnit.assertEqual(test.column, 3, 'setColumn should set column');
	}

	public test_synonym_property_setting_columnSpan_changes_colSpan() {
		const test = new Button();

		test.columnSpan = 3;

		TKUnit.assertEqual(test.columnSpan, 3, 'Setting columnSpan should work.');
		TKUnit.assertEqual(test.colSpan, 3, 'Setting columnSpan property should affect colSpan property.');
	}

	public test_synonym_property_setting_colSpan_changes_columnSpan() {
		const test = new Button();

		test.colSpan = 3;

		TKUnit.assertEqual(test.colSpan, 3, 'Setting colSpan should work.');
		TKUnit.assertEqual(test.columnSpan, 3, 'Setting colSpan property should affect columnSpan property.');
	}

	public test_synonym_property_setColumnSpan_should_set_colSpan_and_columnSpan() {
		const test = new Button();

		GridLayout.setColumnSpan(test, 3);

		TKUnit.assertEqual(test.colSpan, 3, 'setColumnSpan should set colSpan');
		TKUnit.assertEqual(test.columnSpan, 3, 'setColumnSpan should set columnSpan');
	}

	public test_getRow_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.getRow(null);
		}, 'getRow called with null should throw exception');
	}

	public test_getRowSpan_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.getRowSpan(null);
		}, 'getRowSpan called with null should throw exception');
	}

	public test_getColumn_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.getColumn(null);
		}, 'getColumn called with null should throw exception');
	}

	public test_getColumnSpan_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.getColumnSpan(null);
		}, 'getColumnSpan called with null should throw exception');
	}

	public test_setRow_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.setRow(null, 1);
		}, 'setRow called with null should throw exception');
	}

	public test_setRowSpan_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.setRowSpan(null, 1);
		}, 'setRowSpan called with null should throw exception');
	}

	public test_setColumn_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.setColumn(null, 1);
		}, 'setColumn called with null should throw exception');
	}

	public test_setColumnSpan_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			GridLayout.setColumnSpan(null, 1);
		}, 'setColumnSpan called with null should throw exception');
	}

	public test_setRow_shouldNotThrow_onNegativeValues() {
		GridLayout.setRow(new Button(), -1);
	}

	public test_setRowSpan_shouldNotThrow_onNotPositiveValues() {
		GridLayout.setRowSpan(new Button(), 0);
	}

	public test_setColumn_shouldNotThrow_onNegativeValues() {
		GridLayout.setColumn(new Button(), -1);
	}

	public test_setColumnSpan_shouldNotThrow_onNotPositiveValues() {
		GridLayout.setColumnSpan(new Button(), 0);
	}

	public test_addChildAtCell_with_all_params() {
		let btn = new Button();
		let row: number = 1;
		let column: number = 2;
		let rowSpan: number = 3;
		let columnSpan: number = 4;
		this.testView.addChildAtCell(btn, row, column, rowSpan, columnSpan);
		TKUnit.assertEqual(this.row(btn), row, "'row' property not applied For GridLayout addChildAtCell.");
		TKUnit.assertEqual(this.col(btn), column, "'column' property not applied For GridLayout addChildAtCell.");
		TKUnit.assertEqual(this.rowSpan(btn), rowSpan, "'rowSpan' property not applied For GridLayout addChildAtCell.");
		TKUnit.assertEqual(this.colSpan(btn), columnSpan, "'columnSpan' property not applied For GridLayout addChildAtCell.");
	}

	public test_addChildAtCell_without_optional_params() {
		let btn = new Button();
		let row: number = 1;
		let column: number = 2;
		let defaultSpanValue: number = 1;
		this.testView.addChildAtCell(btn, row, column);
		TKUnit.assertEqual(this.row(btn), row, "'row' property not applied For GridLayout addChildAtCell.");
		TKUnit.assertEqual(this.col(btn), column, "'column' property not applied For GridLayout addChildAtCell.");
		TKUnit.assertEqual(this.rowSpan(btn), defaultSpanValue, "'rowSpan' property not applied For GridLayout addChildAtCell without optional params.");
		TKUnit.assertEqual(this.colSpan(btn), defaultSpanValue, "'colSpan' property not applied For GridLayout addChildAtCell without optional params.");
	}

	public test_addChildAtCell_without_rowSpan() {
		let btn = new Button();
		let row: number = 1;
		let column: number = 2;
		let columnSpan: number = 2;
		let defaultSpanValue: number = 1;
		this.testView.addChildAtCell(btn, row, column, undefined, columnSpan);
		TKUnit.assertEqual(this.row(btn), row, "'row' property not applied For GridLayout addChildAtCell without rowSpan.");
		TKUnit.assertEqual(this.col(btn), column, "'column' property not applied For GridLayout addChildAtCell without rowSpan.");
		TKUnit.assertEqual(this.rowSpan(btn), defaultSpanValue, "'rowSpan' property not applied For GridLayout addChildAtCell without rowSpan.");
		TKUnit.assertEqual(this.colSpan(btn), columnSpan, "'columnSpan' property not applied For GridLayout addChildAtCell without rowspan.");
	}

	public test_addChildAtCell_without_columnSpan() {
		let btn = new Button();
		let row: number = 1;
		let column: number = 2;
		let rowSpan: number = 2;
		let defaultSpanValue: number = 1;
		this.testView.addChildAtCell(btn, row, column, rowSpan);
		TKUnit.assertEqual(this.row(btn), row, "'row' property not applied For GridLayout addChildAtCell without columnSpan.");
		TKUnit.assertEqual(this.col(btn), column, "'column' property not applied For GridLayout addChildAtCell without columnSpan.");
		TKUnit.assertEqual(this.rowSpan(btn), rowSpan, "'rowSpan' property not applied For GridLayout addChildAtCell without columnSpan.");
		TKUnit.assertEqual(this.colSpan(btn), defaultSpanValue, "'columnSpan' property not applied For GridLayout addChildAtCell without columnSpan.");
	}

	public test_addRow_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			this.testView.addRow(null);
		}, 'addRow called with null should throw exception');
	}

	public test_addColumn_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			this.testView.addColumn(null);
		}, 'addColumn called with null should throw exception');
	}

	public test_removeRow_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			this.testView.removeRow(null);
		}, 'removeRow called with null should throw exception');
	}

	public test_removeColumn_shouldThrow_onNullValues() {
		TKUnit.assertThrows(() => {
			this.testView.removeColumn(null);
		}, 'removeColumn called with null should throw exception');
	}

	public test_removeColumns() {
		this.prepareGridLayout(false);
		const colsBefore = this.testView.getColumns().length;
		TKUnit.assertTrue(colsBefore > 0, 'There should be columns.');
		this.testView.removeColumns();
		TKUnit.assertTrue(this.testView.getColumns().length === 0, 'Columns should be empty.');
		TKUnit.assertTrue(this.testView.removedCols === colsBefore, '_onColumnRemoved called for each column.');
	}

	public test_removeRows() {
		this.prepareGridLayout(false);
		const rowsBefore = this.testView.getRows().length;
		TKUnit.assertTrue(rowsBefore > 0, 'There should be rows.');
		this.testView.removeRows();
		TKUnit.assertTrue(this.testView.getRows().length === 0, 'Rows should be empty.');
		TKUnit.assertTrue(this.testView.removedRows === rowsBefore, '_onRowRemoved called for each row.');
	}

	public test_removeChildren() {
		this.prepareGridLayout(false);
		TKUnit.assertTrue(this.testView.getChildrenCount() > 0, 'There should be children.');
		this.testView.removeChildren();
		TKUnit.assertTrue(this.testView.getChildrenCount() === 0, 'Childrens should be empty.');
	}

	public test_measuredWidth_when_not_stretched_single_column() {
		this.testView.horizontalAlignment = 'center';
		let btn = new Button();
		btn.text = 'A';
		this.testView.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertTrue(btn.getMeasuredWidth() === this.testView.getMeasuredWidth());
		TKUnit.assertTrue(this.testView.getMeasuredWidth() < platform.Screen.mainScreen.widthPixels);
	}

	public test_measuredWidth_when_not_stretched_two_columns() {
		this.testView.horizontalAlignment = 'center';
		this.testView.addColumn(new ItemSpec(layoutHelper.dp(80), 'pixel'));
		this.testView.addColumn(new ItemSpec(1, 'star'));

		let btn = new Button();
		btn.text = 'A';
		btn.width = { value: 100, unit: 'px' };
		GridLayout.setColumnSpan(btn, 2);
		this.testView.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		var cols = this.testView.getColumns();
		TKUnit.assertAreClose(cols[0].actualLength, Math.round(layoutHelper.dp(80)), DELTA, 'column 0');
		TKUnit.assertAreClose(cols[1].actualLength, Math.round(layoutHelper.dp(20)), DELTA, 'column 1');
		TKUnit.assertAreClose(this.testView.getMeasuredWidth(), 100, DELTA, 'measured width');
	}

	public test_measuredWidth_when_not_stretched_three_columns() {
		this.testView.horizontalAlignment = 'center';
		this.testView.addColumn(new ItemSpec(layoutHelper.dp(80), 'pixel'));
		this.testView.addColumn(new ItemSpec(1, 'star'));
		this.testView.addColumn(new ItemSpec(1, 'auto'));

		for (let i = 1; i < 4; i++) {
			let btn = new Button();
			btn.text = 'A';
			btn.width = { value: i * 20, unit: 'px' };
			GridLayout.setColumn(btn, i - 1);
			this.testView.addChild(btn);
		}

		let btn = new Button();
		btn.text = 'B';
		btn.width = { value: 100, unit: 'px' };
		GridLayout.setColumnSpan(btn, 3);
		this.testView.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		var cols = this.testView.getColumns();
		TKUnit.assertAreClose(cols[0].actualLength, Math.round(layoutHelper.dp(80)), DELTA, 'column 0');
		TKUnit.assertAreClose(cols[1].actualLength, Math.round(layoutHelper.dp(40)), DELTA, 'column 1');
		TKUnit.assertAreClose(cols[2].actualLength, Math.round(layoutHelper.dp(60)), DELTA, 'column 2');
		TKUnit.assertAreClose(this.testView.getMeasuredWidth(), 180, DELTA, 'measured width');
	}

	public test_getRows_shouldNotReturnNULL() {
		var rows = this.testView.getRows();
		TKUnit.assert(rows, 'getRows should not return null/undefinied');
	}

	public test_getColumns_shouldNotReturnNULL() {
		var cols = this.testView.getColumns();
		TKUnit.assert(cols, 'getColumns should not return null/undefinied');
	}

	public test_ItemSpec_actualLength_defaultValue() {
		var def = new ItemSpec(1, 'auto');
		TKUnit.assertEqual(def.actualLength, 0, "'actualLength' property default value should be 0.");
	}

	public test_ItemSpec_constructor_throws_onNegativeValue() {
		TKUnit.assertThrows(() => {
			return new ItemSpec(-1, 'auto');
		}, "'value' should be positive number.");
	}

	public test_ItemSpec_constructor_doesnt_throw_onCorrectType() {
		try {
			var dummy = new ItemSpec(1, 'auto');
			dummy = new ItemSpec(1, 'star');
			dummy = new ItemSpec(1, 'pixel');
		} catch (ex) {
			TKUnit.assert(false, 'ItemSpec type should support auto, star and pixel.');
		}
	}

	public test_ItemSpec_constructor_throws_onWrongType() {
		TKUnit.assertThrows(() => {
			return new ItemSpec(1, <any>'unsupported');
		}, 'Invalid value: unsupported');
	}

	public test_ItemSpec_auto() {
		var w = new ItemSpec(1, 'auto');
		TKUnit.assertEqual(w.gridUnitType, 'auto', "'gridUnitType' property default value should be 'auto'");
		TKUnit.assertEqual(w.isAbsolute, false, "'isAbsolute' property default value should be 'false'");
		TKUnit.assertEqual(w.isAuto, true, "'isAuto' property default value should be 'false'");
		TKUnit.assertEqual(w.isStar, false, "'isAuto' property default value should be 'true'");
		TKUnit.assertEqual(w.value, 1, "'value' property default value should be '1'");
	}

	public test_ItemSpec_unitType_pixel() {
		var w = new ItemSpec(6, 'pixel');
		TKUnit.assertEqual(w.gridUnitType, 'pixel', "'gridUnitType' property default value should be 'pixel'");
		TKUnit.assertEqual(w.isAbsolute, true, "'isAbsolute' property default value should be 'false'");
		TKUnit.assertEqual(w.isAuto, false, "'isAuto' property default value should be 'false'");
		TKUnit.assertEqual(w.isStar, false, "'isAuto' property default value should be 'true'");
		TKUnit.assertEqual(w.value, 6, "'value' property default value should be '1'");
	}

	public test_ItemSpec_unitType() {
		var w = new ItemSpec(2, 'star');
		TKUnit.assertEqual(w.gridUnitType, 'star', "'gridUnitType' property default value should be 'star'");
		TKUnit.assertEqual(w.isAbsolute, false, "'isAbsolute' property default value should be 'false'");
		TKUnit.assertEqual(w.isAuto, false, "'isAuto' property default value should be 'false'");
		TKUnit.assertEqual(w.isStar, true, "'isAuto' property default value should be 'true'");
		TKUnit.assertEqual(w.value, 2, "'value' property default value should be '1'");
	}

	public test_desiredSize_isCorrect() {
		this.prepareGridLayout(false);

		this.testView.width = unsetValue;
		this.testView.height = unsetValue;

		this.waitUntilTestElementLayoutIsValid();

		var maxWidth = 0;
		var maxHeight = 0;
		var width = 0;
		var height = 0;
		var i = 0;
		var cols = this.testView.getColumns();
		var rows = this.testView.getRows();

		for (var r = 0; r < 4; r++) {
			width = 0;
			height = 0;
			for (var c = 0; c < 4; c++) {
				var btn = <layoutHelper.MyButton>this.testView.getChildAt(i++);
				if (cols[c].isAbsolute) {
					width += layoutHelper.dip(cols[c].actualLength);
				} else {
					width += btn.getMeasuredWidth();
				}

				height = Math.max(height, btn.getMeasuredHeight());
			}

			maxWidth = Math.max(maxWidth, width);

			if (rows[r].isAbsolute) {
				maxHeight += layoutHelper.dip(rows[r].actualLength);
			} else {
				maxHeight += height;
			}
		}

		let measuredWidth = this.testView.getMeasuredWidth();
		let measuredHeight = this.testView.getMeasuredHeight();
		TKUnit.assertAreClose(measuredWidth, maxWidth, DELTA, 'GridLayout incorrect measured width');
		TKUnit.assertAreClose(measuredHeight, maxHeight, DELTA, 'GridLayout incorrect measured height');
	}

	public test_columnsActualWidth_isCorrect() {
		this.prepareGridLayout(true);

		var cols = this.testView.getColumns();
		TKUnit.assertEqual(cols[0].actualLength, Math.round(layoutHelper.dp(50)), 'Star column should be 50px width');
		TKUnit.assertEqual(cols[1].actualLength, Math.round(layoutHelper.dp(100)), '2*Star column should be 100px width');
		TKUnit.assertEqual(cols[2].actualLength, Math.round(layoutHelper.dp(50)), 'Absolute column should be 50px width');
		TKUnit.assertEqual(cols[3].actualLength, Math.round(layoutHelper.dp(100)), 'Auto column should be 100px width');
	}

	public test_rowsActualHeight_isCorrect() {
		this.prepareGridLayout(true);

		var rows = this.testView.getRows();
		TKUnit.assertEqual(rows[0].actualLength, Math.round(layoutHelper.dp(50)), 'Star row should be 50px width');
		TKUnit.assertEqual(rows[1].actualLength, Math.round(layoutHelper.dp(100)), '2*Star row should be 100px width');
		TKUnit.assertEqual(rows[2].actualLength, Math.round(layoutHelper.dp(50)), 'Absolute row should be 50px width');
		TKUnit.assertEqual(rows[3].actualLength, Math.round(layoutHelper.dp(100)), 'Auto row should be 100px width');
	}

	public test_Measure_and_Layout_Children_withCorrect_size() {
		this.prepareGridLayout(true);

		var rows = this.testView.getRows();
		var cols = this.testView.getColumns();
		var i = 0;

		for (var r = 0; r < 4; r++) {
			for (var c = 0; c < 4; c++) {
				var btn = <layoutHelper.MyButton>this.testView.getChildAt(i++);
				var col = cols[c];
				var row = rows[r];

				var h = r % 2 === 0 ? 50 : 100;
				var w = c % 2 === 0 ? 50 : 100;

				if (row.isAuto) {
					TKUnit.assertAreClose(btn.layoutHeight, btn.getMeasuredHeight(), DELTA, 'Auto rows should layout with measured height');
				} else if (row.isAbsolute) {
					TKUnit.assertAreClose(btn.measureHeight, h, DELTA, 'Absolute rows should measure with specific height');
					TKUnit.assertAreClose(btn.layoutHeight, h, DELTA, 'Absolute rows should layout with specific height');
				} else {
					TKUnit.assertAreClose(btn.measureHeight, h, DELTA, 'Star rows should measure with specific height');
					TKUnit.assertAreClose(btn.layoutHeight, h, DELTA, 'Star rows should layout with exact length');
				}

				if (col.isAuto) {
					TKUnit.assertAreClose(btn.layoutWidth, btn.getMeasuredWidth(), DELTA, 'Auto columns should layout with measured width');
				} else if (col.isAbsolute) {
					TKUnit.assertAreClose(btn.measureWidth, w, DELTA, 'Absolute columns should measure with specific width');
					TKUnit.assertAreClose(btn.layoutWidth, w, DELTA, 'Absolute columns should layout with specific width');
				} else {
					TKUnit.assertAreClose(btn.measureWidth, w, DELTA, 'Star columns should measure with specific width');
					TKUnit.assertAreClose(btn.layoutWidth, w, DELTA, 'Star columns should layout with exact length');
				}
			}
		}
	}

	public test_ColumnWidth_when_4stars_and_width_110() {
		this.testView.width = { value: 110, unit: 'px' };
		this.testView.addColumn(new ItemSpec(1, 'star'));
		this.testView.addColumn(new ItemSpec(1, 'star'));
		this.testView.addColumn(new ItemSpec(1, 'star'));
		this.testView.addColumn(new ItemSpec(1, 'star'));

		this.waitUntilTestElementLayoutIsValid();

		var cols = this.testView.getColumns();

		TKUnit.assertAreClose(cols[0].actualLength, Math.round(layoutHelper.dp(28)), DELTA, 'Column[0] actual length should be 28');
		TKUnit.assertAreClose(cols[1].actualLength, Math.round(layoutHelper.dp(27)), DELTA, 'Column[1] actual length should be 27');
		TKUnit.assertAreClose(cols[2].actualLength, Math.round(layoutHelper.dp(28)), DELTA, 'Column[2] actual length should be 28');
		TKUnit.assertAreClose(cols[3].actualLength, Math.round(layoutHelper.dp(27)), DELTA, 'Column[3] actual length should be 27');
	}

	public test_margins_and_verticalAlignment_center() {
		this.testView.height = { value: 200, unit: 'px' };
		this.testView.width = { value: 200, unit: 'px' };
		var btn = new layoutHelper.MyButton();
		btn.text = 'btn';
		btn.height = { value: 100, unit: 'px' };
		btn.width = { value: 100, unit: 'px' };
		btn.marginBottom = { value: 50, unit: 'px' };
		btn.marginRight = { value: 50, unit: 'px' };
		this.testView.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		TKUnit.assertAreClose(btn.layoutTop, 25, DELTA, 'vertical margins');
		TKUnit.assertAreClose(btn.layoutLeft, 25, DELTA, 'horizontal margins');
	}

	public test_set_columns_in_XML_comma_separator() {
		var p = <Page>Builder.parse('<Page><GridLayout columns="auto, *, 10*, 100 "><Button/></GridLayout></Page>');
		var grid = <GridLayout>p.content;
		this.assertColumns(grid);
	}

	public test_set_columns_in_XML_space_separator() {
		var p = <Page>Builder.parse('<Page><GridLayout columns="auto * 10* 100 "><Button/></GridLayout></Page>');
		var grid = <GridLayout>p.content;
		this.assertColumns(grid);
	}

	private assertColumns(grid: GridLayout) {
		var columns: Array<ItemSpec> = grid.getColumns();

		TKUnit.assertEqual(columns.length, 4, 'columns.length');
		TKUnit.assert(columns[0].isAuto, 'columns[0].isAuto');

		TKUnit.assert(columns[1].isStar, 'columns[1].isStar');
		TKUnit.assertEqual(columns[1].value, 1, 'columns[1].value');

		TKUnit.assert(columns[2].isStar, 'columns[2].isStar');
		TKUnit.assertEqual(columns[2].value, 10, 'columns[2].value');

		TKUnit.assert(columns[3].isAbsolute, 'columns[3].isAbsolute');
		TKUnit.assertEqual(columns[3].value, 100, 'columns[3].value');
	}

	public test_set_rows_in_XML_comma_separator() {
		var p = <Page>Builder.parse('<Page><GridLayout rows="auto, *, 10*, 100 "><Button/></GridLayout></Page>');
		var grid = <GridLayout>p.content;
		this.assertRows(grid);
	}

	public test_set_rows_in_XML_space_separator() {
		var p = <Page>Builder.parse('<Page><GridLayout rows="auto * 10* 100 "><Button/></GridLayout></Page>');
		var grid = <GridLayout>p.content;
		this.assertRows(grid);
	}

	private assertRows(grid: GridLayout) {
		var rows: Array<ItemSpec> = grid.getRows();

		TKUnit.assertEqual(rows.length, 4, 'rows.length');
		TKUnit.assert(rows[0].isAuto, 'rows[0].isAuto');

		TKUnit.assert(rows[1].isStar, 'rows[1].isStar');
		TKUnit.assertEqual(rows[1].value, 1, 'rows[1].value');

		TKUnit.assert(rows[2].isStar, 'rows[2].isStar');
		TKUnit.assertEqual(rows[2].value, 10, 'rows[2].value');

		TKUnit.assert(rows[3].isAbsolute, 'rows[3].isAbsolute');
		TKUnit.assertEqual(rows[3].value, 100, 'rows[3].value');
	}

	public test_padding() {
		this.testView.style.paddingLeft = { value: 10, unit: 'px' };
		this.testView.style.paddingTop = { value: 20, unit: 'px' };
		this.testView.style.paddingRight = { value: 30, unit: 'px' };
		this.testView.style.paddingBottom = { value: 40, unit: 'px' };

		this.testView.width = { value: 300, unit: 'px' };
		this.testView.height = { value: 300, unit: 'px' };

		var btn = new layoutHelper.MyButton();
		this.testView.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertMeasure(btn, 260, 240);
		layoutHelper.assertLayout(btn, 10, 20, 260, 240);
	}

	public test_codesnippets = function () {
		// >> grid-layout-require
		//var layout = require("ui/layouts/grid-layout");
		var gridLayout = new GridLayout();
		//  << grid-layout-require

		// >> grid-layout-addviews
		var btn1 = new Button();
		var btn2 = new Button();
		var btn3 = new Button();
		var btn4 = new Button();
		gridLayout.addChild(btn1);
		gridLayout.addChild(btn2);
		gridLayout.addChild(btn3);
		gridLayout.addChild(btn4);
		//  << grid-layout-addviews

		// >> grid-layout-setcolumn
		GridLayout.setColumn(btn1, 0);
		GridLayout.setColumn(btn2, 1);
		GridLayout.setColumn(btn3, 2);
		// << grid-layout-setcolumn

		// >> grid-layout-setrow
		GridLayout.setRow(btn4, 1);
		// << grid-layout-setrow

		// >> grid-layout-columnspan
		GridLayout.setColumnSpan(btn4, 3);
		// << grid-layout-columnspan

		// >> grid-layout-itemspec
		// ItemSpec modes of the column refers to its width.
		// Absolute size of the column
		var firstColumn = new ItemSpec(80, 'pixel');
		// Star width means that this column will expand to fill the gap left from other columns
		var secondColumn = new ItemSpec(1, 'star');
		// Auto size means that column will expand or shrink in order to give enough place for all child UI elements.
		var thirdColumn = new ItemSpec(1, 'auto');

		// Star and Auto modes for rows behave like corresponding setting for columns but refer to row height.
		var firstRow = new ItemSpec(1, 'auto');
		var secondRow = new ItemSpec(1, 'star');
		// << grid-layout-itemspec

		// >> grid-layout-add-rowscols
		gridLayout.addColumn(firstColumn);
		gridLayout.addColumn(secondColumn);
		gridLayout.addColumn(thirdColumn);
		gridLayout.addRow(firstRow);
		gridLayout.addRow(secondRow);
		// << grid-layout-add-rowscols
	};

	public test_percent_support_nativeLayoutParams_are_correct() {
		commonTests.percent_support_nativeLayoutParams_are_correct(this);
	}

	public test_layout_correctnes() {
		this.testView.width = { value: 300, unit: 'px' };
		this.testView.height = { value: 300, unit: 'px' };

		let grid = new layoutHelper.MyGridLayout();
		grid.width = { value: 150, unit: 'px' };
		grid.height = { value: 150, unit: 'px' };
		grid.horizontalAlignment = 'right';
		grid.verticalAlignment = 'bottom';

		this.testView.addChild(grid);

		let btn = new layoutHelper.MyButton();
		btn.width = { value: 75, unit: 'px' };
		btn.height = { value: 75, unit: 'px' };
		btn.horizontalAlignment = 'left';
		btn.verticalAlignment = 'bottom';
		grid.addChild(btn);

		this.waitUntilTestElementLayoutIsValid();

		layoutHelper.assertMeasure(grid, 150, 150);
		layoutHelper.assertLayout(grid, 150, 150, 150, 150);

		layoutHelper.assertMeasure(btn, 75, 75);
		layoutHelper.assertLayout(btn, 0, 75, 75, 75);
	}

	public test_parse_should_call_protected_methods() {
		let grid = <GridLayout>Builder.parse("<GridLayout rows='*, 100'/>");
		TKUnit.assertNotNull(grid);

		this.testView.addChild(grid);
		this.waitUntilTestElementLayoutIsValid();

		let rows = grid.getRows();
		TKUnit.assertEqual(rows.length, 2, 'Should have 2 rows.');

		TKUnit.assertTrue(rows[0].isStar, 'First row should be *');
		TKUnit.assertTrue(rows[1].isAbsolute, 'Second row should be Absolute');
	}

	public test_columns_widths() {
		this.testView.width = { value: 300, unit: 'px' };
		this.testView.height = { value: 400, unit: 'px' };

		const grid = new GridLayout();
		this.testView.addChild(grid);
		grid.horizontalAlignment = 'left';
		grid.verticalAlignment = 'top';

		grid.addColumn(new ItemSpec(1, 'star'));
		grid.addColumn(new ItemSpec(layoutHelper.dp(100), 'pixel'));
		grid.addColumn(new ItemSpec(2, 'star'));

		grid.addRow(new ItemSpec(1, 'star'));
		grid.addRow(new ItemSpec(layoutHelper.dp(100), 'pixel'));
		grid.addRow(new ItemSpec(2, 'star'));

		const btn = new Button();
		btn.width = { value: 200, unit: 'px' };
		btn.height = { value: 300, unit: 'px' };
		grid.addChild(btn);
		GridLayout.setColumnSpan(btn, 3);
		GridLayout.setRowSpan(btn, 3);
		this.waitUntilTestElementLayoutIsValid();

		var cols = grid.getColumns();
		TKUnit.assertAreClose(cols[0].actualLength, layoutHelper.dp(33), DELTA, 'Column[0] actual length should be 67');
		TKUnit.assertAreClose(cols[1].actualLength, layoutHelper.dp(100), DELTA, 'Column[1] actual length should be 100');
		TKUnit.assertAreClose(cols[2].actualLength, layoutHelper.dp(67), DELTA, 'Column[2] actual length should be 133');

		var rows = grid.getRows();
		TKUnit.assertAreClose(rows[0].actualLength, layoutHelper.dp(67), DELTA, 'Row[0] actual length should be 133');
		TKUnit.assertAreClose(rows[1].actualLength, layoutHelper.dp(100), DELTA, 'Row[1] actual length should be 100');
		TKUnit.assertAreClose(rows[2].actualLength, layoutHelper.dp(133), DELTA, 'Row[2] actual length should be 267');
	}
}

export function createTestCase(): GridLayoutTest {
	return new GridLayoutTest();
}
