export * from './flexbox-layout-common';

import {
    FlexboxLayoutBase,
    FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent, AlignSelf,
    flexDirectionProperty, flexWrapProperty, justifyContentProperty,
    alignItemsProperty, alignContentProperty,
    orderProperty, Order,
    flexGrowProperty, FlexGrow,
    flexShrinkProperty, FlexShrink,
    flexWrapBeforeProperty, FlexWrapBefore,
    alignSelfProperty,
} from './flexbox-layout-common';
import { View } from '../../core/view';

const alignSelfMap: Record<AlignSelf, number> = {
    [AlignSelf.AUTO]: -1,
    [AlignSelf.FLEX_START]: 0,
    [AlignSelf.FLEX_END]: 1,
    [AlignSelf.CENTER]: 2,
    [AlignSelf.BASELINE]: 3,
    [AlignSelf.STRETCH]: 4,
};

(View.prototype as any)[orderProperty.setNative] = function (value: Order) {
    try { (this as any).__ns_order = value; } catch (_e) { }
};
(View.prototype as any)[flexGrowProperty.setNative] = function (value: FlexGrow) {
    try { (this as any).__ns_flexGrow = value; } catch (_e) { }
};
(View.prototype as any)[flexShrinkProperty.setNative] = function (value: FlexShrink) {
    try { (this as any).__ns_flexShrink = value; } catch (_e) { }
};
(View.prototype as any)[flexWrapBeforeProperty.setNative] = function (value: FlexWrapBefore) {
    try { (this as any).__ns_wrapBefore = value; } catch (_e) { }
};
(View.prototype as any)[alignSelfProperty.setNative] = function (value: AlignSelf) {
    try { (this as any).__ns_alignSelf = alignSelfMap[value]; } catch (_e) { }
};

export class FlexboxLayout extends FlexboxLayoutBase {
    nativeViewProtected!: Windows.UI.Xaml.Controls.Canvas;
    private _canvas!: Windows.UI.Xaml.Controls.Canvas;
    private _layoutBusy = false;
    // Tracks the canvas height we set ourselves so we can distinguish it from user-set heights.
    private _ownHeight = NaN;

    constructor() {
        super();
        this._canvas = new Windows.UI.Xaml.Controls.Canvas();
    }

    createNativeView(): Windows.UI.Xaml.Controls.Canvas {
        return this._canvas;
    }

    initNativeView(): void {
        super.initNativeView(); // keeps LayoutUpdated = _onSizeChanged (background, clip, etc.)
        const canvas = this.nativeViewProtected as any;
        const ref = new WeakRef(this);
        // SizeChanged fires during XAML's layout pass (before render). Using the typed
        // SizeChangedEventHandler constructor avoids the delegate-type mismatch crash.
        try {
            canvas.SizeChanged = new (Windows.UI.Xaml as any).SizeChangedEventHandler((_sender: any, _args: any) => {
                const owner = ref.deref();
                if (!owner) return;
                owner._runFlexLayout();
            });
        } catch (_e) {
            // Fallback: override LayoutUpdated (fires after layout, same convergence with one extra pass).
            canvas.LayoutUpdated = () => {
                const owner = ref.deref();
                if (!owner) return;
                try { (owner as any)._onSizeChanged(); } catch (_e2) { }
                owner._runFlexLayout();
            };
        }
    }

    disposeNativeView(): void {
        const nativeView = this.nativeViewProtected as any;
        if (nativeView) {
            try { nativeView.SizeChanged = null; } catch (_e) { }
            try { nativeView.LayoutUpdated = null; } catch (_e) { }
        }
        super.disposeNativeView();
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        const res = super._addViewToNativeVisualTree(child, atIndex);
        if (res) this._runFlexLayout();
        return res;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);
        this._runFlexLayout();
    }

    private _runFlexLayout(): void {
        if (this._layoutBusy) return;
        const canvas = this.nativeViewProtected as any;
        if (!canvas) return;
        const w = canvas.ActualWidth as number;
        const h = canvas.ActualHeight as number;
        if (!w) return;

        this._layoutBusy = true;
        try {
            const contentH = this._doFlexLayout(w, h, canvas);
            // Canvas doesn't self-size. If parent gave us 0 height (auto-height context like
            // StackLayout), set canvas.Height to the computed content height so the parent
            // re-measures and allocates the correct space.
            const canvasH = canvas.Height as number;
            const inAutoMode = isNaN(canvasH) || (!isNaN(this._ownHeight) && Math.abs(canvasH - this._ownHeight) < 0.5);
            if (inAutoMode && contentH > 0 && Math.abs(h - contentH) > 0.5) {
                this._ownHeight = contentH;
                canvas.Height = contentH;
            }
        } finally {
            this._layoutBusy = false;
        }
    }

    // Returns total content height (for row direction) or width (column direction).
    private _doFlexLayout(availW: number, availH: number, canvas: any): number {
        const children = canvas.Children;
        const count: number = children?.Size ?? 0;
        if (count === 0) return 0;

        const flexDir = this.flexDirection ?? FlexDirection.ROW;
        const flexWrapVal = this.flexWrap ?? FlexWrap.NOWRAP;
        const isRow = flexDir === FlexDirection.ROW || flexDir === FlexDirection.ROW_REVERSE;
        const doWrap = flexWrapVal !== FlexWrap.NOWRAP;
        const mainAv = isRow ? availW : availH;
        const crossAv = isRow ? availH : availW;
        // Treat 0 as unconstrained: Canvas in auto-height StackLayout has ActualHeight=0.
        const mainInf = !Number.isFinite(mainAv) || mainAv === 0;
        const crossInf = !Number.isFinite(crossAv) || crossAv === 0;

        const items: any[] = [];
        let origIdx = 0;
        for (let i = 0; i < count; i++) {
            const nc = children.GetAt(i);
            try { if (nc.Visibility === Windows.UI.Xaml.Visibility.Collapsed) continue; } catch (_e) { }
            items.push({
                nc,
                origIdx: origIdx++,
                flexGrow: Number((nc as any).__ns_flexGrow ?? 0),
                flexShrink: Number((nc as any).__ns_flexShrink ?? 1),
                flexBasisPercent: Number((nc as any).__ns_flexBasisPercent ?? -1),
                alignSelf: Number((nc as any).__ns_alignSelf ?? -1),
                wrapBefore: !!((nc as any).__ns_wrapBefore),
                mainSize: 0,
                crossSize: 0,
            });
        }

        items.sort((a, b) => {
            const ao = Number((a.nc as any).__ns_order ?? 1);
            const bo = Number((b.nc as any).__ns_order ?? 1);
            return ao !== bo ? ao - bo : a.origIdx - b.origIdx;
        });

        for (const item of items) {
            this._measureItem(item, mainAv, crossAv, mainInf, crossInf, isRow);
        }

        const lines: any[] = [];
        let cur: any = { items: [], mainSize: 0, crossSize: 0 };
        for (const item of items) {
            const forceBreak = doWrap && item.wrapBefore && cur.items.length > 0;
            const overflow = doWrap && !mainInf && cur.items.length > 0 && cur.mainSize + item.mainSize > mainAv + 0.001;
            if (forceBreak || overflow) { lines.push(cur); cur = { items: [], mainSize: 0, crossSize: 0 }; }
            cur.items.push(item);
            cur.mainSize += item.mainSize;
            if (item.crossSize > cur.crossSize) cur.crossSize = item.crossSize;
        }
        if (cur.items.length > 0) lines.push(cur);

        if (!mainInf) {
            for (const line of lines) {
                const free = mainAv - line.mainSize;
                if (free > 0.001) this._applyGrow(line, free, crossAv, crossInf, isRow);
                else if (free < -0.001) this._applyShrink(line, free, crossAv, crossInf, isRow);
            }
        }

        const lineCount = lines.length;
        const totalCross = lines.reduce((s, l) => s + l.crossSize, 0);
        const effectiveCross = crossInf ? totalCross : crossAv;
        const freeCross = effectiveCross - totalCross;
        const alignCont = this.alignContent ?? AlignContent.STRETCH;
        const stretchExtra = alignCont === AlignContent.STRETCH && freeCross > 0 && lineCount > 0 ? freeCross / lineCount : 0;
        const revWrap = flexWrapVal === FlexWrap.WRAP_REVERSE;
        const revMain = flexDir === FlexDirection.ROW_REVERSE || flexDir === FlexDirection.COLUMN_REVERSE;
        const mainFn = mainInf ? lines.reduce((m, l) => Math.max(m, l.mainSize), 0) : mainAv;
        const justify = this.justifyContent ?? JustifyContent.FLEX_START;
        const alignItemsVal = this.alignItems ?? AlignItems.STRETCH;

        const lineStarts: number[] = new Array(lineCount).fill(0);
        const lineSizes: number[] = new Array(lineCount).fill(0);
        {
            let p = 0, g = 0;
            switch (alignCont) {
                case AlignContent.FLEX_END: p = freeCross; break;
                case AlignContent.CENTER: p = freeCross / 2; break;
                case AlignContent.SPACE_BETWEEN: g = lineCount > 1 ? freeCross / (lineCount - 1) : 0; break;
                case AlignContent.SPACE_AROUND: g = lineCount > 0 ? freeCross / lineCount : 0; p = g / 2; break;
            }
            for (let vi = 0; vi < lineCount; vi++) {
                const li = revWrap ? (lineCount - 1 - vi) : vi;
                const sz = lines[li].crossSize + stretchExtra;
                lineStarts[vi] = p; lineSizes[vi] = sz; p += sz + g;
            }
        }

        for (let vi = 0; vi < lineCount; vi++) {
            const li = revWrap ? (lineCount - 1 - vi) : vi;
            const line = lines[li];
            const crossStart = lineStarts[vi];
            const lineCross = lineSizes[vi];
            const n = line.items.length;

            const mainPos: number[] = new Array(n).fill(0);
            {
                const free = mainFn - line.mainSize;
                let mc = 0, mg = 0;
                switch (justify) {
                    case JustifyContent.FLEX_END: mc = free; break;
                    case JustifyContent.CENTER: mc = free / 2; break;
                    case JustifyContent.SPACE_BETWEEN: mg = n > 1 ? free / (n - 1) : 0; break;
                    case JustifyContent.SPACE_AROUND: mg = n > 0 ? free / n : 0; mc = mg / 2; break;
                }
                for (let vj = 0; vj < n; vj++) {
                    const lj = revMain ? (n - 1 - vj) : vj;
                    mainPos[vj] = mc; mc += line.items[lj].mainSize + mg;
                }
            }

            for (let vj = 0; vj < n; vj++) {
                const lj = revMain ? (n - 1 - vj) : vj;
                const item = line.items[lj];

                let alignStr = alignItemsVal;
                if (item.alignSelf !== -1) {
                    switch (item.alignSelf) {
                        case 0: alignStr = AlignItems.FLEX_START; break;
                        case 1: alignStr = AlignItems.FLEX_END; break;
                        case 2: alignStr = AlignItems.CENTER; break;
                        case 3: alignStr = AlignItems.BASELINE; break;
                        case 4: alignStr = AlignItems.STRETCH; break;
                    }
                }

                let itemCross = item.crossSize;
                let crossPos = crossStart;
                if (alignStr === AlignItems.STRETCH) {
                    itemCross = lineCross;
                } else if (alignStr === AlignItems.FLEX_END) {
                    crossPos = crossStart + lineCross - item.crossSize;
                } else if (alignStr === AlignItems.CENTER) {
                    crossPos = crossStart + (lineCross - item.crossSize) / 2;
                }

                const ms = mainPos[vj];
                try {
                    Windows.UI.Xaml.Controls.Canvas.SetLeft(item.nc, isRow ? ms : crossPos);
                    Windows.UI.Xaml.Controls.Canvas.SetTop(item.nc, isRow ? crossPos : ms);
                    item.nc.Width = isRow ? item.mainSize : itemCross;
                    item.nc.Height = isRow ? itemCross : item.mainSize;
                } catch (_e) { }
            }
        }

        return isRow ? totalCross : mainFn;
    }

    private _measureItem(item: any, mainAv: number, crossAv: number, mainInf: boolean, crossInf: boolean, isRow: boolean): void {
        const basisMain = (!mainInf && item.flexBasisPercent >= 0) ? mainAv * item.flexBasisPercent / 100 : NaN;
        const mainW = Number.isNaN(basisMain) ? (mainInf ? Infinity : mainAv) : basisMain;
        const crossW = crossInf ? Infinity : crossAv;
        try {
            item.nc.Measure(Windows.UI.Xaml.SizeHelper.FromDimensions(isRow ? mainW : crossW, isRow ? crossW : mainW));
            const d = item.nc.DesiredSize;
            item.mainSize = Number.isNaN(basisMain) ? (isRow ? d.Width : d.Height) : basisMain;
            item.crossSize = isRow ? d.Height : d.Width;
        } catch (_e) {
            item.mainSize = Number.isNaN(basisMain) ? 0 : basisMain;
            item.crossSize = 0;
        }
    }

    private _remeasure(item: any, crossAv: number, crossInf: boolean, isRow: boolean): void {
        const crossW = crossInf ? Infinity : crossAv;
        try {
            item.nc.Measure(Windows.UI.Xaml.SizeHelper.FromDimensions(isRow ? item.mainSize : crossW, isRow ? crossW : item.mainSize));
            const d = item.nc.DesiredSize;
            item.crossSize = isRow ? d.Height : d.Width;
        } catch (_e) { item.crossSize = 0; }
    }

    private _applyGrow(line: any, free: number, crossAv: number, crossInf: boolean, isRow: boolean): void {
        let totalGrow = 0;
        for (const it of line.items) totalGrow += it.flexGrow;
        if (totalGrow <= 0) return;
        const perUnit = free / totalGrow;
        let maxCross = 0;
        for (const it of line.items) {
            if (it.flexGrow > 0) { it.mainSize += it.flexGrow * perUnit; this._remeasure(it, crossAv, crossInf, isRow); }
            if (it.crossSize > maxCross) maxCross = it.crossSize;
        }
        line.crossSize = maxCross;
        line.mainSize += free;
    }

    private _applyShrink(line: any, free: number, crossAv: number, crossInf: boolean, isRow: boolean): void {
        let totalShrink = 0;
        for (const it of line.items) totalShrink += it.flexShrink * it.mainSize;
        if (totalShrink <= 0) return;
        let maxCross = 0;
        for (const it of line.items) {
            if (it.flexShrink > 0) {
                const ratio = (it.flexShrink * it.mainSize) / totalShrink;
                it.mainSize = Math.max(0, it.mainSize + free * ratio);
                this._remeasure(it, crossAv, crossInf, isRow);
            }
            if (it.crossSize > maxCross) maxCross = it.crossSize;
        }
        line.crossSize = maxCross;
    }

    [flexDirectionProperty.getDefault](): FlexDirection { return flexDirectionProperty.defaultValue; }
    [flexDirectionProperty.setNative](_v: FlexDirection) { }

    [flexWrapProperty.getDefault](): FlexWrap { return flexWrapProperty.defaultValue; }
    [flexWrapProperty.setNative](_v: FlexWrap) { }

    [justifyContentProperty.getDefault](): JustifyContent { return justifyContentProperty.defaultValue; }
    [justifyContentProperty.setNative](_v: JustifyContent) { }

    [alignItemsProperty.getDefault](): AlignItems { return alignItemsProperty.defaultValue; }
    [alignItemsProperty.setNative](_v: AlignItems) { }

    [alignContentProperty.getDefault](): AlignContent { return alignContentProperty.defaultValue; }
    [alignContentProperty.setNative](_v: AlignContent) { }
}
