import page = require("ui/page");
import layout = require("ui/layouts/grid-layout");
import {Button} from "ui/button";
import TKUnit = require("../TKUnit");
import helper = require("./layout-helper");
import view = require("ui/core/view");
import navHelper = require("../ui/helper");
import utils = require("utils/utils");
import builder = require("ui/builder");
import enums = require("ui/enums");
import testModule = require("../ui-test");
import layoutHelper = require("./layout-helper");
import platform = require("platform");
import commonTests = require("./common-layout-tests");

var DELTA = 1;

export class MyGridLayout extends layout.GridLayout {
    public measureCount: number = 0;
    public layoutCount: number = 0;

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get layouted(): boolean {
        return this.layoutCount > 0;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.measureCount++;
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        this.layoutCount++;
    }
}

export class GridLayoutTest extends testModule.UITest<layout.GridLayout> {

    public create(): layout.GridLayout {
        return new MyGridLayout();
    }

    private row(view: view.View): number {
        return layout.GridLayout.getRow(view);
    }

    private rowSpan(view: view.View): number {
        return layout.GridLayout.getRowSpan(view);
    }

    private col(view: view.View): number {
        return layout.GridLayout.getColumn(view);
    }

    private colSpan(view: view.View): number {
        return layout.GridLayout.getColumnSpan(view);
    }

    private prepareGridLayout(wait?: boolean) {

        this.testView.addRow(new layout.ItemSpec(1, layout.GridUnitType.star));
        this.testView.addRow(new layout.ItemSpec(2, layout.GridUnitType.star));
        this.testView.addRow(new layout.ItemSpec(layoutHelper.dp(50), layout.GridUnitType.pixel));
        this.testView.addRow(new layout.ItemSpec(50, layout.GridUnitType.auto));

        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
        this.testView.addColumn(new layout.ItemSpec(2, layout.GridUnitType.star));
        this.testView.addColumn(new layout.ItemSpec(layoutHelper.dp(50), layout.GridUnitType.pixel));
        this.testView.addColumn(new layout.ItemSpec(50, layout.GridUnitType.auto));

        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                var btn = new helper.MyButton();
                btn.text = "R" + r + "C" + c;
                layout.GridLayout.setColumn(btn, c);
                layout.GridLayout.setRow(btn, r);
                if (c === 3) {
                    btn.width = layoutHelper.dp(100); // Auto column should take 100px for this test.
                }

                if (r === 3) {
                    btn.height = layoutHelper.dp(100); // Auto row should take 100px for this test.
                }

                this.testView.addChild(btn);
            }
        }

        this.testView.width = layoutHelper.dp(300);
        this.testView.height = layoutHelper.dp(300);

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

    public test_getRow_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.getRow(null);
        }, "getRow called with null should throw exception");
    }

    public test_getRowSpan_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.getRowSpan(null);
        }, "getRowSpan called with null should throw exception");
    }

    public test_getColumn_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.getColumn(null);
        }, "getColumn called with null should throw exception");
    }

    public test_getColumnSpan_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.getColumnSpan(null);
        }, "getColumnSpan called with null should throw exception");
    }

    public test_setRow_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setRow(null, 1);
        }, "setRow called with null should throw exception");
    }

    public test_setRowSpan_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setRowSpan(null, 1);
        }, "setRowSpan called with null should throw exception");
    }

    public test_setColumn_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setColumn(null, 1);
        }, "setColumn called with null should throw exception")
    }

    public test_setColumnSpan_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setColumnSpan(null, 1);
        }, "setColumnSpan called with null should throw exception");
    }

    public test_setRow_shouldThrow_onNegativeValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setRow(new Button(), -1);
        }, "setRow should throw when value < 0");
    }

    public test_setRowSpan_shouldThrow_onNotPositiveValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setRowSpan(new Button(), 0);
        }, "setRowSpan should throw when value <= 0");
    }

    public test_setColumn_shouldThrow_onNegativeValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setColumn(new Button(), -1);
        }, "setColumn should when value < 0");
    }

    public test_setColumnSpan_shouldThrow_onNotPositiveValues() {
        TKUnit.assertThrows(() => {
            layout.GridLayout.setColumnSpan(new Button(), 0);
        }, "setColumnSpan should throw when value <= 0");
    }

    public test_addRow_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            this.testView.addRow(null);
        }, "addRow called with null should throw exception");
    }

    public test_addColumn_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            this.testView.addColumn(null);
        }, "addColumn called with null should throw exception");
    }

    public test_removeRow_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            this.testView.removeRow(null);
        }, "removeRow called with null should throw exception");
    }

    public test_removeColumn_shouldThrow_onNullValues() {
        TKUnit.assertThrows(() => {
            this.testView.removeColumn(null);
        }, "removeColumn called with null should throw exception");
    }

    public test_removeColumns() {
        this.prepareGridLayout(false);
        TKUnit.assertTrue(this.testView.getColumns().length > 0, "There should be columns.");
        this.testView.removeColumns();
        TKUnit.assertTrue(this.testView.getColumns().length === 0, "Columns should be empty.");
    }

    public test_removeRows() {
        this.prepareGridLayout(false);
        TKUnit.assertTrue(this.testView.getRows().length > 0, "There should be rows.");
        this.testView.removeRows();
        TKUnit.assertTrue(this.testView.getRows().length === 0, "Rows should be empty.");
    }

    public test_removeChildren() {
        this.prepareGridLayout(false);
        TKUnit.assertTrue(this.testView.getChildrenCount() > 0, "There should be children.");
        this.testView.removeChildren();
        TKUnit.assertTrue(this.testView.getChildrenCount() === 0, "Childrens should be empty.");
    }

    public test_measuredWidth_when_not_stretched_single_column() {
        this.testView.horizontalAlignment = enums.HorizontalAlignment.center;
        let btn = new Button();
        btn.text = "A";
        this.testView.addChild(btn);

        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertTrue(btn.getMeasuredWidth() === this.testView.getMeasuredWidth());
        TKUnit.assertTrue(this.testView.getMeasuredWidth() < platform.screen.mainScreen.widthPixels);
    }

    public test_measuredWidth_when_not_stretched_two_columns() {
        this.testView.horizontalAlignment = enums.HorizontalAlignment.center;
        this.testView.addColumn(new layout.ItemSpec(layoutHelper.dp(80), layout.GridUnitType.pixel));
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));

        let btn = new Button();
        btn.text = "A";
        btn.width = layoutHelper.dp(100);
        MyGridLayout.setColumnSpan(btn, 2);
        this.testView.addChild(btn);

        this.waitUntilTestElementLayoutIsValid();

        var cols = this.testView.getColumns();
        TKUnit.assertAreClose(cols[0].actualLength, Math.round(layoutHelper.dp(80)), DELTA);
        TKUnit.assertAreClose(cols[1].actualLength, Math.round(layoutHelper.dp(20)), DELTA);
        TKUnit.assertAreClose(this.testView.getMeasuredWidth(), 100, DELTA);
    }

    public test_measuredWidth_when_not_stretched_three_columns() {
        this.testView.horizontalAlignment = enums.HorizontalAlignment.center;
        this.testView.addColumn(new layout.ItemSpec(layoutHelper.dp(80), layout.GridUnitType.pixel));
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.auto));

        for (let i = 1; i < 4; i++) {
            let btn = new Button();
            btn.text = "A";
            btn.width = layoutHelper.dp(i * 20);
            MyGridLayout.setColumn(btn, i - 1);
            this.testView.addChild(btn);
        }

        let btn = new Button();
        btn.text = "B";
        btn.width = layoutHelper.dp(100);
        MyGridLayout.setColumnSpan(btn, 3);
        this.testView.addChild(btn);

        this.waitUntilTestElementLayoutIsValid();

        var cols = this.testView.getColumns();
        TKUnit.assertAreClose(cols[0].actualLength, Math.round(layoutHelper.dp(80)), DELTA);
        TKUnit.assertAreClose(cols[1].actualLength, Math.round(layoutHelper.dp(40)), DELTA);
        TKUnit.assertAreClose(cols[2].actualLength, Math.round(layoutHelper.dp(60)), DELTA);
        TKUnit.assertAreClose(this.testView.getMeasuredWidth(), 180, DELTA);
    }

    public test_getRows_shouldNotReturnNULL() {
        var rows = this.testView.getRows();
        TKUnit.assert(rows, "getRows should not return null/undefinied");
    }

    public test_getColumns_shouldNotReturnNULL() {
        var cols = this.testView.getColumns();
        TKUnit.assert(cols, "getColumns should not return null/undefinied");
    }

    public test_ItemSpec_actualLength_defaultValue() {
        var def = new layout.ItemSpec(1, layout.GridUnitType.auto);
        TKUnit.assertEqual(def.actualLength, 0, "'actualLength' property default value should be 0.");
    }

    public test_ItemSpec_constructor_throws_onNegativeValue() {
        TKUnit.assertThrows(() => {
            new layout.ItemSpec(-1, layout.GridUnitType.auto);
        }, "'value' should be positive number.");
    }

    public test_ItemSpec_constructor_doesnt_throw_onCorrectType() {
        try {
            new layout.ItemSpec(1, layout.GridUnitType.auto);
            new layout.ItemSpec(1, layout.GridUnitType.star);
            new layout.ItemSpec(1, layout.GridUnitType.pixel);
        }
        catch (ex) {
            TKUnit.assert(false, "ItemSpec type should support auto, star and pixel.");
        }
    }

    public test_ItemSpec_constructor_throws_onWrongType() {
        TKUnit.assertThrows(() => {
            new layout.ItemSpec(1, "unsupported");
        }, "'ItemSpec type' incorrect value.");
    }

    public test_ItemSpec_auto() {
        var w = new layout.ItemSpec(1, layout.GridUnitType.auto);
        TKUnit.assertEqual(w.gridUnitType, layout.GridUnitType.auto, "'gridUnitType' property default value should be 'auto'");
        TKUnit.assertEqual(w.isAbsolute, false, "'isAbsolute' property default value should be 'false'");
        TKUnit.assertEqual(w.isAuto, true, "'isAuto' property default value should be 'false'");
        TKUnit.assertEqual(w.isStar, false, "'isAuto' property default value should be 'true'");
        TKUnit.assertEqual(w.value, 1, "'value' property default value should be '1'");
    }

    public test_ItemSpec_unitType_pixel() {
        var w = new layout.ItemSpec(6, layout.GridUnitType.pixel);
        TKUnit.assertEqual(w.gridUnitType, layout.GridUnitType.pixel, "'gridUnitType' property default value should be 'pixel'");
        TKUnit.assertEqual(w.isAbsolute, true, "'isAbsolute' property default value should be 'false'");
        TKUnit.assertEqual(w.isAuto, false, "'isAuto' property default value should be 'false'");
        TKUnit.assertEqual(w.isStar, false, "'isAuto' property default value should be 'true'");
        TKUnit.assertEqual(w.value, 6, "'value' property default value should be '1'");
    }

    public test_ItemSpec_unitType() {
        var w = new layout.ItemSpec(2, layout.GridUnitType.star);
        TKUnit.assertEqual(w.gridUnitType, layout.GridUnitType.star, "'gridUnitType' property default value should be 'star'");
        TKUnit.assertEqual(w.isAbsolute, false, "'isAbsolute' property default value should be 'false'");
        TKUnit.assertEqual(w.isAuto, false, "'isAuto' property default value should be 'false'");
        TKUnit.assertEqual(w.isStar, true, "'isAuto' property default value should be 'true'");
        TKUnit.assertEqual(w.value, 2, "'value' property default value should be '1'");
    }

    public test_desiredSize_isCorrect() {
        this.prepareGridLayout(false);

        this.testView.width = Number.NaN;
        this.testView.height = Number.NaN;

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
                var btn = <helper.MyButton>this.testView.getChildAt(i++);
                if (cols[c].isAbsolute) {
                    width += helper.dip(cols[c].actualLength);
                }
                else {
                    width += btn.getMeasuredWidth();
                }

                height = Math.max(height, btn.getMeasuredHeight());
            }

            maxWidth = Math.max(maxWidth, width);

            if (rows[r].isAbsolute) {
                maxHeight += helper.dip(rows[r].actualLength);
            }
            else {
                maxHeight += height;
            }
        }

        let measuredWidth = this.testView.getMeasuredWidth();
        let measuredHeight = this.testView.getMeasuredHeight();
        TKUnit.assertAreClose(measuredWidth, maxWidth, DELTA, "GridLayout incorrect measured width");
        TKUnit.assertAreClose(measuredHeight, maxHeight, DELTA, "GridLayout incorrect measured height");
    }

    public test_columnsActualWidth_isCorrect() {
        this.prepareGridLayout(true);

        var cols = this.testView.getColumns();
        TKUnit.assertEqual(cols[0].actualLength, Math.round(layoutHelper.dp(50)), "Star column should be 50px width");
        TKUnit.assertEqual(cols[1].actualLength, Math.round(layoutHelper.dp(100)), "2*Star column should be 100px width");
        TKUnit.assertEqual(cols[2].actualLength, Math.round(layoutHelper.dp(50)), "Absolute column should be 50px width");
        TKUnit.assertEqual(cols[3].actualLength, Math.round(layoutHelper.dp(100)), "Auto column should be 100px width");
    }

    public test_rowsActualHeight_isCorrect() {
        this.prepareGridLayout(true);

        var rows = this.testView.getRows();
        TKUnit.assertEqual(rows[0].actualLength, Math.round(layoutHelper.dp(50)), "Star row should be 50px width");
        TKUnit.assertEqual(rows[1].actualLength, Math.round(layoutHelper.dp(100)), "2*Star row should be 100px width");
        TKUnit.assertEqual(rows[2].actualLength, Math.round(layoutHelper.dp(50)), "Absolute row should be 50px width");
        TKUnit.assertEqual(rows[3].actualLength, Math.round(layoutHelper.dp(100)), "Auto row should be 100px width");
    }

    public test_Measure_and_Layout_Children_withCorrect_size() {

        this.prepareGridLayout(true);

        var rows = this.testView.getRows();
        var cols = this.testView.getColumns();
        var i = 0;

        for (var r = 0; r < 4; r++) {

            for (var c = 0; c < 4; c++) {
                var btn = <helper.MyButton>this.testView.getChildAt(i++);
                var col = cols[c];
                var row = rows[r];

                var h = r % 2 === 0 ? 50 : 100;
                var w = c % 2 === 0 ? 50 : 100;

                if (row.isAuto) {
                    TKUnit.assertAreClose(btn.layoutHeight, btn.getMeasuredHeight(), DELTA, "Auto rows should layout with measured height");
                }
                else if (row.isAbsolute) {
                    TKUnit.assertAreClose(btn.measureHeight, h, DELTA, "Absolute rows should measure with specific height");
                    TKUnit.assertAreClose(btn.layoutHeight, h, DELTA, "Absolute rows should layout with specific height");
                }
                else {
                    TKUnit.assertAreClose(btn.measureHeight, h, DELTA, "Star rows should measure with specific height");
                    TKUnit.assertAreClose(btn.layoutHeight, h, DELTA, "Star rows should layout with exact length");
                }

                if (col.isAuto) {
                    TKUnit.assertAreClose(btn.layoutWidth, btn.getMeasuredWidth(), DELTA, "Auto columns should layout with measured width");
                }
                else if (col.isAbsolute) {
                    TKUnit.assertAreClose(btn.measureWidth, w, DELTA, "Absolute columns should measure with specific width");
                    TKUnit.assertAreClose(btn.layoutWidth, w, DELTA, "Absolute columns should layout with specific width");
                }
                else {
                    TKUnit.assertAreClose(btn.measureWidth, w, DELTA, "Star columns should measure with specific width");
                    TKUnit.assertAreClose(btn.layoutWidth, w, DELTA, "Star columns should layout with exact length");
                }
            }
        }
    }

    public test_ColumnWidth_when_4stars_and_width_110() {

        this.testView.width = layoutHelper.dp(110);
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
        this.testView.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));

        this.waitUntilTestElementLayoutIsValid();

        var cols = this.testView.getColumns();

        TKUnit.assertAreClose(cols[0].actualLength, Math.round(layoutHelper.dp(28)), DELTA, "Column[0] actual length should be 28");
        TKUnit.assertAreClose(cols[1].actualLength, Math.round(layoutHelper.dp(27)), DELTA, "Column[1] actual length should be 27");
        TKUnit.assertAreClose(cols[2].actualLength, Math.round(layoutHelper.dp(28)), DELTA, "Column[2] actual length should be 28");
        TKUnit.assertAreClose(cols[3].actualLength, Math.round(layoutHelper.dp(27)), DELTA, "Column[3] actual length should be 27");
    }

    public test_margins_and_verticalAlignment_center() {

        this.testView.height = layoutHelper.dp(200);
        this.testView.width = layoutHelper.dp(200);
        var btn = new helper.MyButton();
        btn.text = "btn";
        btn.height = layoutHelper.dp(100);
        btn.width = layoutHelper.dp(100);
        btn.marginBottom = layoutHelper.dp(50);
        btn.marginRight = layoutHelper.dp(50);
        this.testView.addChild(btn);

        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertAreClose(btn.layoutTop, 25, DELTA, "vertical margins");
        TKUnit.assertAreClose(btn.layoutLeft, 25, DELTA, "horizontal margins");
    }

    public test_set_columns_in_XML() {
        var p = <page.Page>builder.parse("<Page><GridLayout columns=\"auto, *, 10*, 100 \"><Button/></GridLayout></Page>");
        var grid = <layout.GridLayout>p.content;

        var columns: Array<layout.ItemSpec> = grid.getColumns();

        TKUnit.assertEqual(columns.length, 4, "columns.length");
        TKUnit.assert(columns[0].isAuto, "columns[0].isAuto");

        TKUnit.assert(columns[1].isStar, "columns[1].isStar");
        TKUnit.assertEqual(columns[1].value, 1, "columns[1].value");

        TKUnit.assert(columns[2].isStar, "columns[2].isStar");
        TKUnit.assertEqual(columns[2].value, 10, "columns[2].value");

        TKUnit.assert(columns[3].isAbsolute, "columns[3].isAbsolute");
        TKUnit.assertEqual(columns[3].value, 100, "columns[3].value");
    }

    public test_set_rows_in_XML() {
        var p = <page.Page>builder.parse("<Page><GridLayout rows=\"auto, *, 10*, 100 \"><Button/></GridLayout></Page>");
        var grid = <layout.GridLayout>p.content;

        var rows: Array<layout.ItemSpec> = grid.getRows();

        TKUnit.assertEqual(rows.length, 4, "rows.length");
        TKUnit.assert(rows[0].isAuto, "rows[0].isAuto");

        TKUnit.assert(rows[1].isStar, "rows[1].isStar");
        TKUnit.assertEqual(rows[1].value, 1, "rows[1].value");

        TKUnit.assert(rows[2].isStar, "rows[2].isStar");
        TKUnit.assertEqual(rows[2].value, 10, "rows[2].value");

        TKUnit.assert(rows[3].isAbsolute, "rows[3].isAbsolute");
        TKUnit.assertEqual(rows[3].value, 100, "rows[3].value");
    }

    public test_padding() {
        this.testView.paddingLeft = layoutHelper.dp(10);
        this.testView.paddingTop = layoutHelper.dp(20);
        this.testView.paddingRight = layoutHelper.dp(30);
        this.testView.paddingBottom = layoutHelper.dp(40);

        this.testView.width = layoutHelper.dp(300);
        this.testView.height = layoutHelper.dp(300);

        var btn = new helper.MyButton();
        this.testView.addChild(btn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertMeasure(btn, 260, 240);
        helper.assertLayout(btn, 10, 20, 260, 240);
    }

    public test_codesnippets = function () {
        // <snippet module="ui/layouts/grid-layout" title="grid-layout">
        // ## GridLayout sample
        // ### Creating Grid Layout via code.
        // ``` JavaScript
        //var layout = require("ui/layouts/grid-layout");
        var gridLayout = new layout.GridLayout();
        //  ```

        // ### Create grid layout with an xml declaration
        // ``` XML
        // <GridLayout columns="80, *, auto" rows="auto, *" >
        //  <Button col="0" />
        //  <Button col="1" />
        //  <Button col="2" />
        //// by default column and row are set to 0
        //  <Button row="1" colSpan="3" />
        // </GridLayout>
        // ```

        // ### Add views to grid layout
        // ``` JavaScript
        var btn1 = new Button();
        var btn2 = new Button();
        var btn3 = new Button();
        var btn4 = new Button();
        gridLayout.addChild(btn1);
        gridLayout.addChild(btn2);
        gridLayout.addChild(btn3);
        gridLayout.addChild(btn4);
        //  ```

        // ### Set column property on views - btn1 in first column, btn2 is second and btn3 in third
        // ``` JavaScript
        layout.GridLayout.setColumn(btn1, 0);
        layout.GridLayout.setColumn(btn2, 1);
        layout.GridLayout.setColumn(btn3, 2);
        // ```

        // ### Set row property on btn4.
        // ``` JavaScript
        layout.GridLayout.setRow(btn4, 1);
        // ```

        // ### Set columnSpan property on btn4 to stretch into all columns
        // ``` JavaScript
        layout.GridLayout.setColumnSpan(btn4, 3);
        // ```

        // ### Create ItemSpec for columns and rows 3 columns - 80px, *, auto size and 2 rows - 100px and auto size
        // ``` JavaScript
        //// ItemSpec modes of the column refers to its width.
        //// Absolute size of the column
        var firstColumn = new layout.ItemSpec(80, layout.GridUnitType.pixel);
        //// Star width means that this column will expand to fill the gap left from other columns
        var secondColumn = new layout.ItemSpec(1, layout.GridUnitType.star);
        //// Auto size means that column will expand or shrink in order to give enough place for all child UI elements.
        var thirdColumn = new layout.ItemSpec(1, layout.GridUnitType.auto);

        //// Star and Auto modes for rows behave like corresponding setting for columns but refer to row height.
        var firstRow = new layout.ItemSpec(1, layout.GridUnitType.auto);
        var secondRow = new layout.ItemSpec(1, layout.GridUnitType.star);
        // ```

        // ### Add columns and rows to GridLayout
        // ``` JavaScript
        gridLayout.addColumn(firstColumn);
        gridLayout.addColumn(secondColumn);
        gridLayout.addColumn(thirdColumn);
        gridLayout.addRow(firstRow);
        gridLayout.addRow(secondRow);
        // ```
        // </snippet>
    }

    public test_percent_support() {
        commonTests.percent_support_test(this);
    }

    public test_percent_support_nativeLayoutParams_are_correct() {
        commonTests.percent_support_nativeLayoutParams_are_correct(this);
    }
}

export function createTestCase(): GridLayoutTest {
    return new GridLayoutTest();
}