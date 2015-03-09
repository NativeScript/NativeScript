import page = require("ui/page");
import layout = require("ui/layouts/grid-layout");
import button = require("ui/button");
import TKUnit = require("../TKUnit");
import helper = require("./layout-helper");
import view = require("ui/core/view");
import navHelper = require("../ui/helper");
import utils = require("utils/utils");
import builder = require("ui/builder");

var ASYNC = 2;

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

var tmp: button.Button;
var newPage: page.Page;
var rootLayout: MyGridLayout;

export function setUpModule() {
    var pageFactory = function (): page.Page {
        newPage = new page.Page;
        tmp = new button.Button();
        tmp.text = "Loading test";
        newPage.content = tmp;
        return newPage;
    };
    navHelper.navigate(pageFactory);
}

export function tearDownModule() {
    navHelper.goBack();

    delete tmp;
    delete newPage;
    delete rootLayout;
}

export function setUp() {
    rootLayout = new MyGridLayout();
    newPage.content = rootLayout;
}

export function tearDown() {
    newPage.content = tmp;
}

function row(view: view.View): number {
    return layout.GridLayout.getRow(view);
}

function rowSpan(view: view.View): number {
    return layout.GridLayout.getRowSpan(view);
}

function col(view: view.View): number {
    return layout.GridLayout.getColumn(view);
}

function colSpan(view: view.View): number {
    return layout.GridLayout.getColumnSpan(view);
}

export function test_GridLayout_row_defaultValue() {
    TKUnit.assert(tmp !== null);
    TKUnit.assertEqual(row(tmp), 0, "'row' property default value should be 0.");
}

export function test_GridLayout_rowSpan_defaultValue() {

    TKUnit.assert(tmp !== null);
    TKUnit.assertEqual(rowSpan(tmp), 1, "'rowSpan' property default value should be 1.");
}

export function test_GridLayout_column_defaultValue() {

    TKUnit.assert(tmp !== null);
    TKUnit.assertEqual(col(tmp), 0, "'column' property default value should be 0.");
}

export function test_GridLayout_columnSpan_defaultValue() {
    TKUnit.assert(tmp !== null);
    TKUnit.assertEqual(colSpan(tmp), 1, "'columnSpan' property default value should be 1.");
}

export function test_GridLayout_getRow_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.getRow(null);
    }, "getRow called with null should throw exception");
}

export function test_GridLayout_getRowSpan_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.getRowSpan(null);
    }, "getRowSpan called with null should throw exception");
}

export function test_GridLayout_getColumn_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.getColumn(null);
    }, "getColumn called with null should throw exception");
}

export function test_GridLayout_getColumnSpan_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.getColumnSpan(null);
    }, "getColumnSpan called with null should throw exception");
}

export function test_GridLayout_setRow_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setRow(null, 1);
    }, "setRow called with null should throw exception");
}

export function test_GridLayout_setRowSpan_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setRowSpan(null, 1);
    }, "setRowSpan called with null should throw exception");
}

export function test_GridLayout_setColumn_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setColumn(null, 1);
    }, "setColumn called with null should throw exception")
}

export function test_GridLayout_setColumnSpan_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setColumnSpan(null, 1);
    }, "setColumnSpan called with null should throw exception");
}

export function test_GridLayout_setRow_shouldThrow_onNegativeValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setRow(tmp, -1);
    }, "setRow should throw when value < 0");
}

export function test_GridLayout_setRowSpan_shouldThrow_onNotPositiveValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setRowSpan(tmp, 0);
    }, "setRowSpan should throw when value <= 0");
}

export function test_GridLayout_setColumn_shouldThrow_onNegativeValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setColumn(tmp, -1);
    }, "setColumn should when value < 0");
}

export function test_GridLayout_setColumnSpan_shouldThrow_onNotPositiveValues() {
    TKUnit.assertThrows(() => {
        layout.GridLayout.setColumnSpan(tmp, 0);
    }, "setColumnSpan should throw when value <= 0");
}

export function test_GridLayout_addRow_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        rootLayout.addRow(null);
    }, "addRow called with null should throw exception");
}

export function test_GridLayout_addColumn_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        rootLayout.addColumn(null);
    }, "addColumn called with null should throw exception");
}

export function test_GridLayout_removeRow_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        rootLayout.removeRow(null);
    }, "removeRow called with null should throw exception");
}

export function test_GridLayout_removeColumn_shouldThrow_onNullValues() {
    TKUnit.assertThrows(() => {
        rootLayout.removeColumn(null);
    }, "removeColumn called with null should throw exception");
}

export function test_GridLayout_getRows_shouldNotReturnNULL() {
    var rows = rootLayout.getRows();
    TKUnit.assert(rows, "getRows should not return null/undefinied");
}

export function test_GridLayout_getColumns_shouldNotReturnNULL() {
    var cols = rootLayout.getColumns();
    TKUnit.assert(cols, "getColumns should not return null/undefinied");
}

export function test_ItemSpec_actualLength_defaultValue() {
    var def = new layout.ItemSpec(1, layout.GridUnitType.auto);
    TKUnit.assertEqual(def.actualLength, 0, "'actualLength' property default value should be 0.");
}

export function test_ItemSpec_constructor_throws_onNegativeValue() {
    TKUnit.assertThrows(() => {
        new layout.ItemSpec(-1, layout.GridUnitType.auto);
    }, "'value' should be positive number.");
}

export function test_ItemSpec_constructor_doesnt_throw_onCorrectType() {
    try {
        new layout.ItemSpec(1, layout.GridUnitType.auto);
        new layout.ItemSpec(1, layout.GridUnitType.star);
        new layout.ItemSpec(1, layout.GridUnitType.pixel);
    }
    catch (ex) {
        TKUnit.assert(false, "ItemSpec type should support auto, star and pixel.");
    }
}

export function test_ItemSpec_constructor_throws_onWrongType() {
    TKUnit.assertThrows(() => {
        new layout.ItemSpec(1, "unsupported");
    }, "'ItemSpec type' incorrect value.");
}

export function test_ItemSpec_auto() {
    var w = new layout.ItemSpec(1, layout.GridUnitType.auto);
    TKUnit.assertEqual(w.gridUnitType, layout.GridUnitType.auto, "'gridUnitType' property default value should be 'auto'");
    TKUnit.assertEqual(w.isAbsolute, false, "'isAbsolute' property default value should be 'false'");
    TKUnit.assertEqual(w.isAuto, true, "'isAuto' property default value should be 'false'");
    TKUnit.assertEqual(w.isStar, false, "'isAuto' property default value should be 'true'");
    TKUnit.assertEqual(w.value, 1, "'value' property default value should be '1'");
}

export function test_ItemSpec_unitType_pixel() {
    var w = new layout.ItemSpec(6, layout.GridUnitType.pixel);
    TKUnit.assertEqual(w.gridUnitType, layout.GridUnitType.pixel, "'gridUnitType' property default value should be 'pixel'");
    TKUnit.assertEqual(w.isAbsolute, true, "'isAbsolute' property default value should be 'false'");
    TKUnit.assertEqual(w.isAuto, false, "'isAuto' property default value should be 'false'");
    TKUnit.assertEqual(w.isStar, false, "'isAuto' property default value should be 'true'");
    TKUnit.assertEqual(w.value, 6, "'value' property default value should be '1'");
}

export function test_ItemSpec_unitType() {
    var w = new layout.ItemSpec(2, layout.GridUnitType.star);
    TKUnit.assertEqual(w.gridUnitType, layout.GridUnitType.star, "'gridUnitType' property default value should be 'star'");
    TKUnit.assertEqual(w.isAbsolute, false, "'isAbsolute' property default value should be 'false'");
    TKUnit.assertEqual(w.isAuto, false, "'isAuto' property default value should be 'false'");
    TKUnit.assertEqual(w.isStar, true, "'isAuto' property default value should be 'true'");
    TKUnit.assertEqual(w.value, 2, "'value' property default value should be '1'");
}

function prepareGridLayout(wait?: boolean) {

    rootLayout.addRow(new layout.ItemSpec(1, layout.GridUnitType.star));
    rootLayout.addRow(new layout.ItemSpec(2, layout.GridUnitType.star));
    rootLayout.addRow(new layout.ItemSpec(50, layout.GridUnitType.pixel));
    rootLayout.addRow(new layout.ItemSpec(50, layout.GridUnitType.auto));

    rootLayout.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
    rootLayout.addColumn(new layout.ItemSpec(2, layout.GridUnitType.star));
    rootLayout.addColumn(new layout.ItemSpec(50, layout.GridUnitType.pixel));
    rootLayout.addColumn(new layout.ItemSpec(50, layout.GridUnitType.auto));

    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
            var btn = new helper.MyButton();
            btn.text = "R" + r + "C" + c;
            layout.GridLayout.setColumn(btn, c);
            layout.GridLayout.setRow(btn, r);
            if (c === 3) {
                btn.width = 100; // Auto column should take 100px for this test.
            }

            if (r === 3) {
                btn.height = 100; // Auto row should take 100px for this test.
            }

            rootLayout.addChild(btn);
        }
    }

    rootLayout.width = 300;
    rootLayout.height = 300;

    if (wait) {
        TKUnit.waitUntilReady(function () {
            return (rootLayout.getChildAt(rootLayout.getChildrenCount() - 1)).isLayoutValid;
        }, ASYNC);
    }
}

export function test_GridLayout_desiredSize_isCorrect() {
    prepareGridLayout(false);

    rootLayout.width = Number.NaN;
    rootLayout.height = Number.NaN;

    TKUnit.waitUntilReady(function () {
        return rootLayout.getChildAt(rootLayout.getChildrenCount() - 1).isLayoutValid;
    }, ASYNC);

    var maxWidth = 0;
    var maxHeight = 0;
    var width = 0;
    var height = 0;
    var i = 0;
    var cols = rootLayout.getColumns();
    var rows = rootLayout.getRows();

    for (var r = 0; r < 4; r++) {
        width = 0;
        height = 0;
        for (var c = 0; c < 4; c++) {
            var btn = <helper.MyButton>rootLayout.getChildAt(i++);
            if (cols[c].isAbsolute) {
                width += cols[c].actualLength * utils.layout.getDisplayDensity();
            }
            else {
                width += btn.getMeasuredWidth();
            }

            height = Math.max(height, btn.getMeasuredHeight());
        }

        maxWidth = Math.max(maxWidth, width);

        if (rows[r].isAbsolute) {
            maxHeight += rows[r].actualLength * utils.layout.getDisplayDensity();
        }
        else {
            maxHeight += height;
        }
    }

    TKUnit.assertEqual(rootLayout.getMeasuredWidth(), Math.round(maxWidth), "GridLayout incorrect measured width");
    TKUnit.assertEqual(rootLayout.getMeasuredHeight(), Math.round(maxHeight), "GridLayout incorrect measured height");
}

export function test_GridLayout_columnsActualWidth_isCorrect() {
    prepareGridLayout(true);

    var cols = rootLayout.getColumns();
    TKUnit.assertEqual(cols[0].actualLength, 50, "Star column should be 50px width");
    TKUnit.assertEqual(cols[1].actualLength, 100, "2*Star column should be 100px width");
    TKUnit.assertEqual(cols[2].actualLength, 50, "Absolute column should be 50px width");
    TKUnit.assertEqual(cols[3].actualLength, 100, "Auto column should be 100px width");
}

export function test_GridLayout_rowsActualHeight_isCorrect() {
    prepareGridLayout(true);

    var rows = rootLayout.getRows();
    TKUnit.assertEqual(rows[0].actualLength, 50, "Star row should be 50px width");
    TKUnit.assertEqual(rows[1].actualLength, 100, "2*Star row should be 100px width");
    TKUnit.assertEqual(rows[2].actualLength, 50, "Absolute row should be 50px width");
    TKUnit.assertEqual(rows[3].actualLength, 100, "Auto row should be 100px width");
}

export function test_GridLayout_Measure_and_Layout_Children_withCorrect_size() {

    prepareGridLayout(true);

    var rows = rootLayout.getRows();
    var cols = rootLayout.getColumns();
    var i = 0;
    var density = utils.layout.getDisplayDensity();

    for (var r = 0; r < 4; r++) {

        for (var c = 0; c < 4; c++) {
            var btn = <helper.MyButton>rootLayout.getChildAt(i++);
            var col = cols[c];
            var row = rows[r];

            var h = r % 2 === 0 ? 50 : 100;
            var w = c % 2 === 0 ? 50 : 100;

            h = Math.round(h * density);
            w = Math.round(w * density);

            if (row.isAuto) {
                TKUnit.assertEqual(btn.layoutHeight, btn.getMeasuredHeight(), "Auto rows should layout with measured height");
            }
            else if (row.isAbsolute) {
                TKUnit.assertEqual(btn.measureHeight, h, "Absolute rows should measure with specific height");
                TKUnit.assertEqual(btn.layoutHeight, h, "Absolute rows should layout with specific height");
            }
            else {
                TKUnit.assertEqual(btn.measureHeight, h, "Auto rows should measure with specific height");
                TKUnit.assertEqual(btn.layoutHeight, h, "Star rows should layout with exact length");
            }

            if (col.isAuto) {
                TKUnit.assertEqual(btn.layoutWidth, btn.getMeasuredWidth(), "Auto columns should layout with measured width");
            }
            else if (col.isAbsolute) {
                TKUnit.assertEqual(btn.measureWidth, w, "Absolute columns should measure with specific width");
                TKUnit.assertEqual(btn.layoutWidth, w, "Absolute columns should layout with specific width");
            }
            else {
                TKUnit.assertEqual(btn.measureWidth, w, "Auto columns should should measure with specific width");
                TKUnit.assertEqual(btn.layoutWidth, w, "Star columns should layout with exact length");
            }
        }
    }
}

export function test_GridLayout_ColumnWidth_when_4stars_and_width_110() {

    rootLayout.width = 110;
    rootLayout.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
    rootLayout.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
    rootLayout.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));
    rootLayout.addColumn(new layout.ItemSpec(1, layout.GridUnitType.star));

    TKUnit.waitUntilReady(function () {
        return rootLayout.isLayoutValid;
    }, ASYNC);

    var cols = rootLayout.getColumns();

    TKUnit.assertEqual(cols[0].actualLength, 28, "Column actual length should be 28");
    TKUnit.assertEqual(cols[1].actualLength, 27, "Column actual length should be 27");
    TKUnit.assertEqual(cols[2].actualLength, 28, "Column actual length should be 28");
    TKUnit.assertEqual(cols[3].actualLength, 27, "Column actual length should be 27");
}

export function test_GridLayout_set_columns_in_XML() {
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
};

export function test_GridLayout_set_rows_in_XML() {
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
};

export function test_GridLayout_padding() {
    rootLayout.paddingLeft = 10;
    rootLayout.paddingTop = 20;
    rootLayout.paddingRight = 30;
    rootLayout.paddingBottom = 40;

    rootLayout.width = 300;
    rootLayout.height = 300;

    var btn = new helper.MyButton();
    rootLayout.addChild(btn);

    TKUnit.waitUntilReady(() => { return btn.isLayoutValid });

    helper.assertMeasure(btn, 260, 240);
    helper.assertLayout(btn, 10, 20, 260, 240);
}

export var test_codesnippets = function () {
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
    var btn1 = new button.Button();
    var btn2 = new button.Button();
    var btn3 = new button.Button();
    var btn4 = new button.Button();
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
};
