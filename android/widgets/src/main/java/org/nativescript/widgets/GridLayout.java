/**
 *
 */
package org.nativescript.widgets;

import java.util.ArrayList;
import java.util.HashMap;

import android.content.Context;
import android.view.Gravity;
import android.view.View;
import android.view.View.MeasureSpec;

/**
 * @author hhristov
 */
public class GridLayout extends LayoutBase {

    private MeasureHelper helper = new MeasureHelper(this);

    private ArrayList<ItemSpec> _rows = new ArrayList<ItemSpec>();
    private ArrayList<ItemSpec> _cols = new ArrayList<ItemSpec>();
    private ArrayList<Integer> columnOffsets = new ArrayList<Integer>();
    private ArrayList<Integer> rowOffsets = new ArrayList<Integer>();
    private HashMap<View, MeasureSpecs> map = new HashMap<View, MeasureSpecs>();

    public GridLayout(Context context) {
        super(context);
    }

    private static void validateItemSpec(ItemSpec itemSpec) {
        if (itemSpec == null) {
            throw new Error("itemSpec is null.");
        }

        if (itemSpec.owner != null) {
            throw new Error("itemSpec is already added to GridLayout.");
        }
    }

    public void addRow(ItemSpec itemSpec) {
        validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._rows.add(itemSpec);

        ItemGroup rowGroup = new ItemGroup(itemSpec);
        this.helper.rows.add(rowGroup);

        this.requestLayout();
    }

    public void addColumn(ItemSpec itemSpec) {
        validateItemSpec(itemSpec);
        itemSpec.owner = this;
        this._cols.add(itemSpec);

        ItemGroup columnGroup = new ItemGroup(itemSpec);
        this.helper.columns.add(columnGroup);

        this.requestLayout();
    }

    public void removeColumn(ItemSpec itemSpec) {
        if (itemSpec == null) {
            throw new Error("itemSpec is null.");
        }

        int index = this._cols.indexOf(itemSpec);
        if (itemSpec.owner != this || index < 0) {
            throw new Error("itemSpec is not child of this GridLayout");
        }

        this.removeColumnAt(index);
    }

    public void removeColumnAt(int index) {
        this._cols.remove(index);
        this.helper.columns.get(index).children.clear();
        this.helper.columns.remove(index);
        this.requestLayout();
    }

    public void removeRow(ItemSpec itemSpec) {
        if (itemSpec == null) {
            throw new Error("itemSpec is null.");
        }

        int index = this._rows.indexOf(itemSpec);
        if (itemSpec.owner != this || index < 0) {
            throw new Error("itemSpec is not child of this GridLayout");
        }

        this.removeRowAt(index);
    }

    public void removeRowAt(int index) {
        this._rows.remove(index);
        this.helper.rows.get(index).children.clear();
        this.helper.rows.remove(index);
        this.requestLayout();
    }

    public ItemSpec[] getColumns() {
        ItemSpec copy[] = new ItemSpec[this._cols.size()];
        copy = this._cols.toArray(copy);
        return copy;
    }

    public ItemSpec[] getRows() {
        ItemSpec copy[] = new ItemSpec[this._rows.size()];
        copy = this._rows.toArray(copy);
        return copy;
    }

    @Override
    public void addView(View child) {
        super.addView(child);
        this.addToMap(child);
    }

    @Override
    public void addView(View child, int index) {
        super.addView(child, index);
        this.addToMap(child);
    }

    @Override
    public void addView(View child, LayoutParams params) {
        super.addView(child, params);
        this.addToMap(child);
    }

    @Override
    public void removeView(View view) {
        this.removeFromMap(view);
        super.removeView(view);
    }

    @Override
    public void removeViewAt(int index) {
        View view = this.getChildAt(index);
        this.removeFromMap(view);
        super.removeViewAt(index);
    }

    @Override
    public void removeViews(int start, int count) {
        int end = start + count;
        for (int i = start; i < end; i++) {
            View view = this.getChildAt(i);
            this.removeFromMap(view);
        }

        super.removeViews(start, count);
    }

    private int getColumnIndex(CommonLayoutParams lp) {
        return Math.max(0, Math.min(lp.column, this._cols.size() - 1));
    }

    private int getRowIndex(CommonLayoutParams lp) {
        return Math.max(0, Math.min(lp.row, this._rows.size() - 1));
    }

    private ItemSpec getColumnSpec(CommonLayoutParams lp) {
        if (this._cols.size() == 0) {
            return this.helper.singleColumn;
        }

        int columnIndex = Math.min(lp.column, this._cols.size() - 1);
        return this._cols.get(columnIndex);
    }

    private ItemSpec getRowSpec(CommonLayoutParams lp) {
        if (this._rows.size() == 0) {
            return this.helper.singleRow;
        }

        int rowIndex = Math.min(lp.row, this._rows.size() - 1);
        return this._rows.get(rowIndex);
    }

    private int getColumnSpan(CommonLayoutParams lp, int columnIndex) {
        if (this._cols.size() == 0) {
            return 1;
        }

        return Math.min(lp.columnSpan, this._cols.size() - columnIndex);
    }

    private int getRowSpan(CommonLayoutParams lp, int rowIndex) {
        if (this._rows.size() == 0) {
            return 1;
        }

        return Math.min(lp.rowSpan, this._rows.size() - rowIndex);
    }

    private void updateMeasureSpecs(View child, MeasureSpecs measureSpec) {
        CommonLayoutParams lp = (CommonLayoutParams) child.getLayoutParams();
        int columnIndex = this.getColumnIndex(lp);
        ItemSpec column = this.getColumnSpec(lp);
        int rowIndex = this.getRowIndex(lp);
        ItemSpec row = this.getRowSpec(lp);
        int columnSpan = this.getColumnSpan(lp, columnIndex);
        int rowSpan = this.getRowSpan(lp, rowIndex);

        measureSpec.setColumn(column);
        measureSpec.setRow(row);
        measureSpec.setColumnIndex(columnIndex);
        measureSpec.setRowIndex(rowIndex);
        measureSpec.setColumnSpan(columnSpan);
        measureSpec.setRowSpan(rowSpan);
        measureSpec.autoColumnsCount = 0;
        measureSpec.autoRowsCount = 0;
        measureSpec.measured = false;
        measureSpec.pixelHeight = 0;
        measureSpec.pixelWidth = 0;
        measureSpec.starColumnsCount = 0;
        measureSpec.starRowsCount = 0;
    }

    private void addToMap(View child) {
        MeasureSpecs measureSpec = new MeasureSpecs(child);
        this.map.put(child, measureSpec);
    }

    private void removeFromMap(View child) {
        this.map.get(child).child = null;
        this.map.remove(child);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        int measureWidth = 0;
        int measureHeight = 0;

        int width = MeasureSpec.getSize(widthMeasureSpec);
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);

        int height = MeasureSpec.getSize(heightMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);

        int verticalPadding = this.getPaddingTop() + this.getPaddingBottom();
        int horizontalPadding = this.getPaddingLeft() + this.getPaddingRight();

        boolean infinityWidth = widthMode == MeasureSpec.UNSPECIFIED;
        boolean infinityHeight = heightMode == MeasureSpec.UNSPECIFIED;

        this.helper.width = Math.max(0, width - horizontalPadding);
        this.helper.height = Math.max(0, height - verticalPadding);

        int gravity = LayoutBase.getGravity(this);
        int verticalGravity = gravity & Gravity.VERTICAL_GRAVITY_MASK;
        final int layoutDirection = this.getLayoutDirection();
        final int horizontalGravity = Gravity.getAbsoluteGravity(gravity, layoutDirection) & Gravity.HORIZONTAL_GRAVITY_MASK;

        this.helper.stretchedHorizontally = widthMode == MeasureSpec.EXACTLY || (horizontalGravity == Gravity.FILL_HORIZONTAL && !infinityWidth);
        this.helper.stretchedVertically = heightMode == MeasureSpec.EXACTLY || (verticalGravity == Gravity.FILL_VERTICAL && !infinityHeight);

        this.helper.setInfinityWidth(infinityWidth);
        this.helper.setInfinityHeight(infinityHeight);

        this.helper.clearMeasureSpecs();
        this.helper.init();

        for (int i = 0, count = this.getChildCount(); i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            MeasureSpecs measureSpecs = this.map.get(child);
            this.updateMeasureSpecs(child, measureSpecs);
            this.helper.addMeasureSpec(measureSpecs);
        }

        this.helper.measure();

        // Add in our padding
        measureWidth = this.helper.measuredWidth + horizontalPadding;
        measureHeight = this.helper.measuredHeight + verticalPadding;

        // Check against our minimum sizes
        measureWidth = Math.max(measureWidth, this.getSuggestedMinimumWidth());
        measureHeight = Math.max(measureHeight, this.getSuggestedMinimumHeight());

        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, 0);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int paddingLeft = this.getPaddingLeft();
        int paddingTop = this.getPaddingTop();

        this.columnOffsets.clear();
        this.rowOffsets.clear();

        this.columnOffsets.add(paddingLeft);
        this.rowOffsets.add(paddingTop);

        float offset = this.columnOffsets.get(0);
        int roundedOffset = paddingLeft;
        int roundedLength = 0;
        float actualLength = 0;
        int size = this.helper.columns.size();
        for (int i = 0; i < size; i++) {
            ItemGroup columnGroup = this.helper.columns.get(i);
            offset += columnGroup.length;

            actualLength = offset - roundedOffset;
            roundedLength = Math.round(actualLength);
            columnGroup.rowOrColumn._actualLength = roundedLength;
            roundedOffset += roundedLength;

            this.columnOffsets.add(roundedOffset);
        }

        offset = this.rowOffsets.get(0);
        roundedOffset = this.getPaddingTop();
        roundedLength = 0;
        actualLength = 0;
        size = this.helper.rows.size();
        for (int i = 0; i < size; i++) {
            ItemGroup rowGroup = this.helper.rows.get(i);
            offset += rowGroup.length;

            actualLength = offset - roundedOffset;
            roundedLength = Math.round(actualLength);
            rowGroup.rowOrColumn._actualLength = roundedLength;
            roundedOffset += roundedLength;

            this.rowOffsets.add(roundedOffset);
        }

        int columns = this.helper.columns.size();
        for (int i = 0; i < columns; i++) {
            ItemGroup columnGroup = this.helper.columns.get(i);
            int children = columnGroup.children.size();
            for (int j = 0; j < children; j++) {

                MeasureSpecs measureSpec = columnGroup.children.get(j);
                int childLeft = this.columnOffsets.get(measureSpec.getColumnIndex());
                int childRight = this.columnOffsets.get(measureSpec.getColumnIndex() + measureSpec.getColumnSpan());
                int childTop = this.rowOffsets.get(measureSpec.getRowIndex());
                int childBottom = this.rowOffsets.get(measureSpec.getRowIndex() + measureSpec.getRowSpan());

                // No need to include margins in the width, height
                CommonLayoutParams.layoutChild(measureSpec.child, childLeft, childTop, childRight, childBottom);
            }
        }

        CommonLayoutParams.restoreOriginalParams(this);
    }
}

class MeasureSpecs {

    private int _columnSpan = 1;
    private int _rowSpan = 1;

    public int pixelWidth = 0;
    public int pixelHeight = 0;

    public int starColumnsCount = 0;
    public int starRowsCount = 0;

    public int autoColumnsCount = 0;
    public int autoRowsCount = 0;

    public boolean measured = false;

    public View child;
    private ItemSpec column;
    private ItemSpec row;
    private int columnIndex;
    private int rowIndex;

    MeasureSpecs(View child) {
        this.child = child;
    }

    public boolean getSpanned() {
        return this._columnSpan > 1 || this._rowSpan > 1;
    }

    public boolean getIsStar() {
        return this.starRowsCount > 0 || this.starColumnsCount > 0;
    }

    public int getColumnSpan() {
        return this._columnSpan;
    }

    public int getRowSpan() {
        return this._rowSpan;
    }

    public void setRowSpan(int value) {
        // cannot have zero rowSpan.
        this._rowSpan = Math.max(1, value);
    }

    public void setColumnSpan(int value) {
        // cannot have zero colSpan.
        this._columnSpan = Math.max(1, value);
    }

    public int getRowIndex() {
        return this.rowIndex;
    }

    public int getColumnIndex() {
        return this.columnIndex;
    }

    public void setRowIndex(int value) {
        this.rowIndex = value;
    }

    public void setColumnIndex(int value) {
        this.columnIndex = value;
    }

    public ItemSpec getRow() {
        return this.row;
    }

    public ItemSpec getColumn() {
        return this.column;
    }

    public void setRow(ItemSpec value) {
        this.row = value;
    }

    public void setColumn(ItemSpec value) {
        this.column = value;
    }
}

class ItemGroup {
    int length = 0;
    int measuredCount = 0;
    ItemSpec rowOrColumn;
    ArrayList<MeasureSpecs> children = new ArrayList<MeasureSpecs>();

    public int measureToFix = 0;
    public int currentMeasureToFixCount = 0;
    private boolean infinityLength = false;

    ItemGroup(ItemSpec spec) {
        this.rowOrColumn = spec;
    }

    public void setIsLengthInfinity(boolean infinityLength) {
        this.infinityLength = infinityLength;
    }

    public void init() {
        this.measuredCount = 0;
        this.currentMeasureToFixCount = 0;
        this.length = this.rowOrColumn.getIsAbsolute() ? this.rowOrColumn.getValue() : 0;
    }

    public boolean getAllMeasured() {
        return this.measuredCount == this.children.size();
    }

    public boolean getCanBeFixed() {
        return this.currentMeasureToFixCount == this.measureToFix;
    }

    public boolean getIsAuto() {
        return this.rowOrColumn.getIsAuto() || (this.rowOrColumn.getIsStar() && this.infinityLength);
    }

    public boolean getIsStar() {
        return this.rowOrColumn.getIsStar() && !this.infinityLength;
    }

    public boolean getIsAbsolute() {
        return this.rowOrColumn.getIsAbsolute();
    }
}

class MeasureHelper {
    public final ItemSpec singleRow = new ItemSpec();
    public final ItemSpec singleColumn = new ItemSpec();
    public final GridLayout grid;

    static int infinity = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
    ArrayList<ItemGroup> rows = new ArrayList<ItemGroup>();
    ArrayList<ItemGroup> columns = new ArrayList<ItemGroup>();

    public int width;
    public int height;
    public boolean stretchedHorizontally = false;
    public boolean stretchedVertically = false;

    private boolean infinityWidth = false;
    private boolean infinityHeight = false;

    private float minColumnStarValue;
    private float maxColumnStarValue;

    private float minRowStarValue;
    private float maxRowStarValue;

    int measuredWidth;
    int measuredHeight;

    private boolean fakeRowAdded = false;
    private boolean fakeColumnAdded = false;

    MeasureHelper(GridLayout grid) {
        this.grid = grid;
    }

    public void setInfinityWidth(boolean value) {
        this.infinityWidth = value;

        for (int i = 0, size = this.columns.size(); i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            columnGroup.setIsLengthInfinity(value);
        }
    }

    public void setInfinityHeight(boolean value) {
        this.infinityHeight = value;

        for (int i = 0, size = this.rows.size(); i < size; i++) {
            ItemGroup rowGroup = this.rows.get(i);
            rowGroup.setIsLengthInfinity(value);
        }
    }

    public void addMeasureSpec(MeasureSpecs measureSpec) {
        // Get column stats
        int size = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
        for (int i = measureSpec.getColumnIndex(); i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            if (columnGroup.getIsAuto()) {
                measureSpec.autoColumnsCount++;
            } else if (columnGroup.getIsStar()) {
                measureSpec.starColumnsCount += columnGroup.rowOrColumn.getValue();
            } else if (columnGroup.getIsAbsolute()) {
                measureSpec.pixelWidth += columnGroup.rowOrColumn.getValue();
            }
        }

        if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount == 0) {
            // Determine which auto columns are affected by this element
            for (int i = measureSpec.getColumnIndex(); i < size; i++) {
                ItemGroup columnGroup = this.columns.get(i);
                if (columnGroup.getIsAuto()) {
                    columnGroup.measureToFix++;
                }
            }
        }

        // Get row stats
        size = measureSpec.getRowIndex() + measureSpec.getRowSpan();
        for (int i = measureSpec.getRowIndex(); i < size; i++) {
            ItemGroup rowGroup = this.rows.get(i);
            if (rowGroup.getIsAuto()) {
                measureSpec.autoRowsCount++;
            } else if (rowGroup.getIsStar()) {
                measureSpec.starRowsCount += rowGroup.rowOrColumn.getValue();
            } else if (rowGroup.getIsAbsolute()) {
                measureSpec.pixelHeight += rowGroup.rowOrColumn.getValue();
            }
        }

        if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount == 0) {
            // Determine which auto rows are affected by this element
            for (int i = measureSpec.getRowIndex(); i < size; i++) {
                ItemGroup rowGroup = this.rows.get(i);
                if (rowGroup.getIsAuto()) {
                    rowGroup.measureToFix++;
                }
            }
        }

        this.columns.get(measureSpec.getColumnIndex()).children.add(measureSpec);
        this.rows.get(measureSpec.getRowIndex()).children.add(measureSpec);
    }

    public void clearMeasureSpecs() {
        for (int i = 0, size = this.columns.size(); i < size; i++) {
            this.columns.get(i).children.clear();
        }

        for (int i = 0, size = this.rows.size(); i < size; i++) {
            this.rows.get(i).children.clear();
        }
    }

    private static void initList(ArrayList<ItemGroup> list) {
        for (int i = 0, size = list.size(); i < size; i++) {
            ItemGroup item = list.get(i);
            item.init();
        }
    }

    private ItemGroup singleRowGroup = new ItemGroup(singleRow);
    private ItemGroup singleColumnGroup = new ItemGroup(singleColumn);

    void init() {

        int rows = this.rows.size();
        if (rows == 0) {
            singleRowGroup.setIsLengthInfinity(this.infinityHeight);
            this.rows.add(singleRowGroup);
            this.fakeRowAdded = true;
        } else if (rows > 1 && this.fakeRowAdded) {
            this.rows.remove(0);
            this.fakeRowAdded = false;
        }

        int cols = this.columns.size();
        if (cols == 0) {
            this.fakeColumnAdded = true;
            singleColumnGroup.setIsLengthInfinity(this.infinityWidth);
            this.columns.add(singleColumnGroup);
        } else if (cols > 1 && this.fakeColumnAdded) {
            this.columns.remove(0);
            this.fakeColumnAdded = false;
        }

        initList(this.rows);
        initList(this.columns);

        this.minColumnStarValue = -1;
        this.minRowStarValue = -1;
        this.maxColumnStarValue = -1;
        this.maxRowStarValue = -1;
    }

    private void itemMeasured(MeasureSpecs measureSpec, boolean isFakeMeasure) {
        if (!isFakeMeasure) {
            this.columns.get(measureSpec.getColumnIndex()).measuredCount++;
            this.rows.get(measureSpec.getRowIndex()).measuredCount++;
            measureSpec.measured = true;
        }

        if (measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount == 0) {
            int size = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
            for (int i = measureSpec.getColumnIndex(); i < size; i++) {
                ItemGroup columnGroup = this.columns.get(i);
                if (columnGroup.getIsAuto()) {
                    columnGroup.currentMeasureToFixCount++;
                }
            }
        }

        if (measureSpec.autoRowsCount > 0 && measureSpec.starRowsCount == 0) {
            int size = measureSpec.getRowIndex() + measureSpec.getRowSpan();
            for (int i = measureSpec.getRowIndex(); i < size; i++) {
                ItemGroup rowGroup = this.rows.get(i);
                if (rowGroup.getIsAuto()) {
                    rowGroup.currentMeasureToFixCount++;
                }
            }
        }
    }

    private void fixColumns() {
        int currentColumnWidth = 0;
        int columnStarCount = 0;

        int columnCount = this.columns.size();
        for (int i = 0; i < columnCount; i++) {
            ItemGroup item = this.columns.get(i);
            if (item.rowOrColumn.getIsStar()) {
                columnStarCount += item.rowOrColumn.getValue();
            } else {
                // Star columns are still zeros (not calculated).
                currentColumnWidth += item.length;
            }
        }

        float widthForStarColumns = Math.max(0, this.width - currentColumnWidth);
        this.maxColumnStarValue = columnStarCount > 0 ? widthForStarColumns / columnStarCount : 0;

        updateStarLength(this.columns, this.maxColumnStarValue);
    }

    private void fixRows() {
        int currentRowHeight = 0;
        int rowStarCount = 0;

        int rowCount = this.rows.size();
        for (int i = 0; i < rowCount; i++) {
            ItemGroup item = this.rows.get(i);
            if (item.rowOrColumn.getIsStar()) {
                rowStarCount += item.rowOrColumn.getValue();
            } else {
                // Star rows are still zeros (not calculated).
                currentRowHeight += item.length;
            }
        }

        float heightForStarRows = Math.max(0, this.height - currentRowHeight);
        this.maxRowStarValue = rowStarCount > 0 ? heightForStarRows / rowStarCount : 0;

        updateStarLength(this.rows, this.maxRowStarValue);
    }

    private static void updateStarLength(ArrayList<ItemGroup> list, float starValue) {
        float offset = 0;
        int roundedOffset = 0;
        for (int i = 0, rowCount = list.size(); i < rowCount; i++) {
            ItemGroup item = list.get(i);
            if (item.getIsStar()) {
                offset += item.rowOrColumn.getValue() * starValue;

                float actualLength = offset - roundedOffset;
                int roundedLength = Math.round(actualLength);
                item.length = roundedLength;
                roundedOffset += roundedLength;
            }
        }
    }

    private void fakeMeasure() {
        // Fake measure - measure all elements that have star rows and auto columns - with infinity Width and infinity Height
        for (int i = 0, size = this.columns.size(); i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            if (columnGroup.getAllMeasured()) {
                continue;
            }

            for (int j = 0, childrenCount = columnGroup.children.size(); j < childrenCount; j++) {
                MeasureSpecs measureSpec = columnGroup.children.get(j);
                if (measureSpec.starRowsCount > 0 && measureSpec.autoColumnsCount > 0 && measureSpec.starColumnsCount == 0) {
                    this.measureChild(measureSpec, true);
                }
            }
        }
    }

    private void measureFixedColumnsNoStarRows() {
        for (int i = 0, size = this.columns.size(); i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            for (int j = 0, childrenCount = columnGroup.children.size(); j < childrenCount; j++) {
                MeasureSpecs measureSpec = columnGroup.children.get(j);
                if (measureSpec.starColumnsCount > 0 && measureSpec.starRowsCount == 0) {
                    this.measureChildFixedColumns(measureSpec);
                }
            }
        }
    }

    private void measureNoStarColumnsFixedRows() {
        for (int i = 0, size = this.columns.size(); i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            for (int j = 0, childrenCount = columnGroup.children.size(); j < childrenCount; j++) {
                MeasureSpecs measureSpec = columnGroup.children.get(j);
                if (measureSpec.starRowsCount > 0 && measureSpec.starColumnsCount == 0) {
                    this.measureChildFixedRows(measureSpec);
                }
            }
        }
    }

    private static boolean canFix(ArrayList<ItemGroup> list) {
        for (int i = 0, size = list.size(); i < size; i++) {
            ItemGroup item = list.get(i);
            if (!item.getCanBeFixed()) {
                return false;
            }
        }

        return true;
    }

    private static int getMeasureLength(ArrayList<ItemGroup> list) {
        int result = 0;
        for (int i = 0, size = list.size(); i < size; i++) {
            ItemGroup item = list.get(i);
            result += item.length;
        }

        return result;
    }

    public void measure() {

        // Measure auto & pixel columns and rows (no spans).
        int size = this.columns.size();
        for (int i = 0; i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            for (int j = 0, childrenCount = columnGroup.children.size(); j < childrenCount; j++) {
                MeasureSpecs measureSpec = columnGroup.children.get(j);
                if (measureSpec.getIsStar() || measureSpec.getSpanned()) {
                    continue;
                }

                this.measureChild(measureSpec, false);
            }
        }

        // Measure auto & pixel columns and rows (with spans).
        for (int i = 0; i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            for (int j = 0, childrenCount = columnGroup.children.size(); j < childrenCount; j++) {
                MeasureSpecs measureSpec = columnGroup.children.get(j);
                if (measureSpec.getIsStar() || !measureSpec.getSpanned()) {
                    continue;
                }

                this.measureChild(measureSpec, false);
            }
        }

        // try fix stars!
        boolean fixColumns = canFix(this.columns);
        boolean fixRows = canFix(this.rows);

        if (fixColumns) {
            this.fixColumns();
        }

        if (fixRows) {
            this.fixRows();
        }

        if (!fixColumns && !fixRows) {
            // Fake measure - measure all elements that have star rows and auto columns - with infinity Width and infinity Height
            // should be able to fix rows after that
            this.fakeMeasure();

            this.fixColumns();

            // Measure all elements that have star columns(already fixed), but no stars at the rows
            this.measureFixedColumnsNoStarRows();

            this.fixRows();
        } else if (fixColumns && !fixRows) {
            // Measure all elements that have star columns(already fixed) but no stars at the rows
            this.measureFixedColumnsNoStarRows();

            // Then
            this.fixRows();
        } else if (!fixColumns && fixRows) {
            // Measure all elements that have star rows(already fixed) but no star at the columns
            this.measureNoStarColumnsFixedRows();

            // Then
            this.fixColumns();
        }

        // Rows and columns are fixed here - measure remaining elements
        size = this.columns.size();
        for (int i = 0; i < size; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            for (int j = 0, childCount = columnGroup.children.size(); j < childCount; j++) {
                MeasureSpecs measureSpec = columnGroup.children.get(j);
                if (!measureSpec.measured) {
                    this.measureChildFixedColumnsAndRows(measureSpec);
                }
            }
        }

        // If we are not stretched and minColumnStarValue is less than maxColumnStarValue
        // we need to reduce the length of star columns.
        if (!this.stretchedHorizontally && this.minColumnStarValue != -1 && this.minColumnStarValue < this.maxColumnStarValue) {
            updateStarLength(this.columns, this.minColumnStarValue);
        }

        // If we are not stretched and minRowStarValue is less than maxRowStarValue
        // we need to reduce the height of star maxRowStarValue.
        if (!this.stretchedVertically && this.minRowStarValue != -1 && this.minRowStarValue < this.maxRowStarValue) {
            updateStarLength(this.rows, this.minRowStarValue);
        }

        this.measuredWidth = getMeasureLength(this.columns);
        this.measuredHeight = getMeasureLength(this.rows);
    }

    private void measureChild(MeasureSpecs measureSpec, boolean isFakeMeasure) {
        int widthMeasureSpec = (measureSpec.autoColumnsCount > 0) ? infinity : MeasureSpec.makeMeasureSpec(measureSpec.pixelWidth, MeasureSpec.EXACTLY);
        int heightMeasureSpec = (isFakeMeasure || measureSpec.autoRowsCount > 0) ? infinity : MeasureSpec.makeMeasureSpec(measureSpec.pixelHeight, MeasureSpec.EXACTLY);

        CommonLayoutParams.measureChild(measureSpec.child, widthMeasureSpec, heightMeasureSpec);
        final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(measureSpec.child);
        final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(measureSpec.child);

        int columnSpanEnd = measureSpec.getColumnIndex() + measureSpec.getColumnSpan();
        int rowSpanEnd = measureSpec.getRowIndex() + measureSpec.getRowSpan();

        if (measureSpec.autoColumnsCount > 0) {
            int remainingSpace = childMeasuredWidth;

            for (int i = measureSpec.getColumnIndex(); i < columnSpanEnd; i++) {
                ItemGroup columnGroup = this.columns.get(i);
                remainingSpace -= columnGroup.length;
            }

            if (remainingSpace > 0) {
                int growSize = remainingSpace / measureSpec.autoColumnsCount;
                for (int i = measureSpec.getColumnIndex(); i < columnSpanEnd; i++) {
                    ItemGroup columnGroup = this.columns.get(i);
                    if (columnGroup.getIsAuto()) {
                        columnGroup.length += growSize;
                    }
                }
            }
        }

        if (!isFakeMeasure && measureSpec.autoRowsCount > 0) {
            int remainingSpace = childMeasuredHeight;

            for (int i = measureSpec.getRowIndex(); i < rowSpanEnd; i++) {
                ItemGroup rowGroup = this.rows.get(i);
                remainingSpace -= rowGroup.length;
            }

            if (remainingSpace > 0) {
                int growSize = remainingSpace / measureSpec.autoRowsCount;
                for (int i = measureSpec.getRowIndex(); i < rowSpanEnd; i++) {
                    ItemGroup rowGroup = this.rows.get(i);
                    if (rowGroup.getIsAuto()) {
                        rowGroup.length += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec, isFakeMeasure);
    }

    private void measureChildFixedColumns(MeasureSpecs measureSpec) {
        int columnIndex = measureSpec.getColumnIndex();
        int columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
        int rowIndex = measureSpec.getRowIndex();
        int rowSpanEnd = rowIndex + measureSpec.getRowSpan();

        int measureWidth = 0;
        int growSize = 0;

        for (int i = columnIndex; i < columnSpanEnd; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            measureWidth += columnGroup.length;
        }

        int widthMeasureSpec = MeasureSpec.makeMeasureSpec(measureWidth, this.stretchedHorizontally ? MeasureSpec.EXACTLY : MeasureSpec.AT_MOST);
        int heightMeasureSpec = (measureSpec.autoRowsCount > 0) ? infinity : MeasureSpec.makeMeasureSpec(measureSpec.pixelHeight, MeasureSpec.EXACTLY);

        CommonLayoutParams.measureChild(measureSpec.child, widthMeasureSpec, heightMeasureSpec);
        final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(measureSpec.child);
        final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(measureSpec.child);

        this.updateMinColumnStarValueIfNeeded(measureSpec, childMeasuredWidth);

        // Distribute height over auto rows
        if (measureSpec.autoRowsCount > 0) {
            int remainingSpace = childMeasuredHeight;

            for (int i = rowIndex; i < rowSpanEnd; i++) {
                ItemGroup rowGroup = this.rows.get(i);
                remainingSpace -= rowGroup.length;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.autoRowsCount;
                for (int i = rowIndex; i < rowSpanEnd; i++) {
                    ItemGroup rowGroup = this.rows.get(i);
                    if (rowGroup.getIsAuto()) {
                        rowGroup.length += growSize;
                    }
                }
            }
        }

        this.itemMeasured(measureSpec, false);
    }

    private void measureChildFixedRows(MeasureSpecs measureSpec) {
        int columnIndex = measureSpec.getColumnIndex();
        int columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
        int rowIndex = measureSpec.getRowIndex();
        int rowSpanEnd = rowIndex + measureSpec.getRowSpan();
        int measureHeight = 0;

        for (int i = rowIndex; i < rowSpanEnd; i++) {
            ItemGroup rowGroup = this.rows.get(i);
            measureHeight += rowGroup.length;
        }

        int widthMeasureSpec = (measureSpec.autoColumnsCount > 0) ? infinity : MeasureSpec.makeMeasureSpec(measureSpec.pixelWidth, MeasureSpec.EXACTLY);
        int heightMeasureSpec = MeasureSpec.makeMeasureSpec(measureHeight, this.stretchedVertically ? MeasureSpec.EXACTLY : MeasureSpec.AT_MOST);

        CommonLayoutParams.measureChild(measureSpec.child, widthMeasureSpec, heightMeasureSpec);
        final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(measureSpec.child);
        final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(measureSpec.child);

        int remainingSpace = 0;
        int growSize = 0;

        // Distribute width over auto columns
        if (measureSpec.autoColumnsCount > 0) {
            remainingSpace = childMeasuredWidth;

            for (int i = columnIndex; i < columnSpanEnd; i++) {
                ItemGroup columnGroup = this.columns.get(i);
                remainingSpace -= columnGroup.length;
            }

            if (remainingSpace > 0) {
                growSize = remainingSpace / measureSpec.autoColumnsCount;
                for (int i = columnIndex; i < columnSpanEnd; i++) {
                    ItemGroup columnGroup = this.columns.get(i);
                    if (columnGroup.getIsAuto()) {
                        columnGroup.length += growSize;
                    }
                }
            }
        }

        this.updateMinRowStarValueIfNeeded(measureSpec, childMeasuredHeight);
        this.itemMeasured(measureSpec, false);
    }

    private void measureChildFixedColumnsAndRows(MeasureSpecs measureSpec) {
        int columnIndex = measureSpec.getColumnIndex();
        int columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
        int rowIndex = measureSpec.getRowIndex();
        int rowSpanEnd = rowIndex + measureSpec.getRowSpan();

        int measureWidth = 0;
        for (int i = columnIndex; i < columnSpanEnd; i++) {
            ItemGroup columnGroup = this.columns.get(i);
            measureWidth += columnGroup.length;
        }

        int measureHeight = 0;
        for (int i = rowIndex; i < rowSpanEnd; i++) {
            ItemGroup rowGroup = this.rows.get(i);
            measureHeight += rowGroup.length;
        }

        // if (have stars) & (not stretch) - at most
        int widthMeasureSpec = MeasureSpec.makeMeasureSpec(measureWidth,
                (measureSpec.starColumnsCount > 0 && !this.stretchedHorizontally) ? MeasureSpec.AT_MOST : MeasureSpec.EXACTLY);

        int heightMeasureSpec = MeasureSpec.makeMeasureSpec(measureHeight,
                (measureSpec.starRowsCount > 0 && !this.stretchedVertically) ? MeasureSpec.AT_MOST : MeasureSpec.EXACTLY);

        CommonLayoutParams.measureChild(measureSpec.child, widthMeasureSpec, heightMeasureSpec);
        final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(measureSpec.child);
        final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(measureSpec.child);

        this.updateMinColumnStarValueIfNeeded(measureSpec, childMeasuredWidth);
        this.updateMinRowStarValueIfNeeded(measureSpec, childMeasuredHeight);
        this.itemMeasured(measureSpec, false);
    }

    private void updateMinRowStarValueIfNeeded(MeasureSpecs measureSpec, int childMeasuredHeight) {
        if (!this.stretchedVertically && measureSpec.starRowsCount > 0) {
            int remainingSpace = childMeasuredHeight;
            int rowIndex = measureSpec.getRowIndex();
            int rowSpanEnd = rowIndex + measureSpec.getRowSpan();
            for (int i = rowIndex; i < rowSpanEnd; i++) {
                ItemGroup rowGroup = this.rows.get(i);
                if (!rowGroup.getIsStar()) {
                    remainingSpace -= rowGroup.length;
                }
            }

            if (remainingSpace > 0) {
                this.minRowStarValue = Math.max(remainingSpace / measureSpec.starRowsCount, this.minRowStarValue);
            }
        }
    }

    private void updateMinColumnStarValueIfNeeded(MeasureSpecs measureSpec, int childMeasuredWidth) {
        // When not stretched star columns are not fixed so we may grow them here
        // if there is an element that spans on multiple columns
        if (!this.stretchedHorizontally && measureSpec.starColumnsCount > 0) {
            int remainingSpace = childMeasuredWidth;
            int columnIndex = measureSpec.getColumnIndex();
            int columnSpanEnd = columnIndex + measureSpec.getColumnSpan();
            for (int i = columnIndex; i < columnSpanEnd; i++) {
                ItemGroup columnGroup = this.columns.get(i);
                if (!columnGroup.getIsStar()) {
                    remainingSpace -= columnGroup.length;
                }
            }

            if (remainingSpace > 0) {
                this.minColumnStarValue = Math.max(remainingSpace / measureSpec.starColumnsCount, this.minColumnStarValue);
            }
        }
    }
}