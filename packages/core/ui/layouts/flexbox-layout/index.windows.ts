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

const flexDirectionMap: Record<FlexDirection, number> = {
    [FlexDirection.ROW]: 0,
    [FlexDirection.ROW_REVERSE]: 1,
    [FlexDirection.COLUMN]: 2,
    [FlexDirection.COLUMN_REVERSE]: 3,
};

const flexWrapMap: Record<FlexWrap, number> = {
    [FlexWrap.NOWRAP]: 0,
    [FlexWrap.WRAP]: 1,
    [FlexWrap.WRAP_REVERSE]: 2,
};

const justifyContentMap: Record<JustifyContent, number> = {
    [JustifyContent.FLEX_START]: 0,
    [JustifyContent.FLEX_END]: 1,
    [JustifyContent.CENTER]: 2,
    [JustifyContent.SPACE_BETWEEN]: 3,
    [JustifyContent.SPACE_AROUND]: 4,
};

const alignItemsMap: Record<AlignItems, number> = {
    [AlignItems.FLEX_START]: 0,
    [AlignItems.FLEX_END]: 1,
    [AlignItems.CENTER]: 2,
    [AlignItems.BASELINE]: 3,
    [AlignItems.STRETCH]: 4,
};

const alignContentMap: Record<AlignContent, number> = {
    [AlignContent.FLEX_START]: 0,
    [AlignContent.FLEX_END]: 1,
    [AlignContent.CENTER]: 2,
    [AlignContent.SPACE_BETWEEN]: 3,
    [AlignContent.SPACE_AROUND]: 4,
    [AlignContent.STRETCH]: 5,
};

const alignSelfMap: Record<AlignSelf, number> = {
    [AlignSelf.AUTO]: -1,
    [AlignSelf.FLEX_START]: 0,
    [AlignSelf.FLEX_END]: 1,
    [AlignSelf.CENTER]: 2,
    [AlignSelf.BASELINE]: 3,
    [AlignSelf.STRETCH]: 4,
};

function setAttached(setterName: string, native: any, value: any): void {
    try {
        const map: Record<string, string> = {
            SetOrder: '__ns_order',
            SetFlexGrow: '__ns_flexGrow',
            SetFlexShrink: '__ns_flexShrink',
            SetWrapBefore: '__ns_wrapBefore',
            SetAlignSelf: '__ns_alignSelf',
        };
        const key = map[setterName] ?? null;
        if (key && native) {
            try { native[key] = value; } catch (_e) { }
        }
    } catch (_e) { }
}

(View.prototype as any)[orderProperty.setNative] = function (value: Order) {
    const native = (this as any).nativeViewProtected;
    // store on the JS wrapper for later lookup
    try { (this as any).__ns_order = value; } catch (_e) { }
    if (native) {
        try { setAttached('SetOrder', native, value); } catch (_e) { }
        try { (native as any).__ns_order = value; } catch (_e) { }
        try { (native as any).__ns_view = this; } catch (_e) { }
    }
};

(View.prototype as any)[flexGrowProperty.setNative] = function (value: FlexGrow) {
    const native = (this as any).nativeViewProtected;
    try { (this as any).__ns_flexGrow = value; } catch (_e) { }
    if (native) {
        try { setAttached('SetFlexGrow', native, value); } catch (_e) { }
        try { (native as any).__ns_flexGrow = value; } catch (_e) { }
        try { (native as any).__ns_view = this; } catch (_e) { }
    }
};

(View.prototype as any)[flexShrinkProperty.setNative] = function (value: FlexShrink) {
    const native = (this as any).nativeViewProtected;
    try { (this as any).__ns_flexShrink = value; } catch (_e) { }
    if (native) {
        try { setAttached('SetFlexShrink', native, value); } catch (_e) { }
        try { (native as any).__ns_flexShrink = value; } catch (_e) { }
        try { (native as any).__ns_view = this; } catch (_e) { }
    }
};

(View.prototype as any)[flexWrapBeforeProperty.setNative] = function (value: FlexWrapBefore) {
    const native = (this as any).nativeViewProtected;
    try { (this as any).__ns_wrapBefore = value; } catch (_e) { }
    if (native) {
        try { setAttached('SetWrapBefore', native, value); } catch (_e) { }
        try { (native as any).__ns_wrapBefore = value; } catch (_e) { }
        try { (native as any).__ns_view = this; } catch (_e) { }
    }
};

(View.prototype as any)[alignSelfProperty.setNative] = function (value: AlignSelf) {
    const native = (this as any).nativeViewProtected;
    try { (this as any).__ns_alignSelf = alignSelfMap[value]; } catch (_e) { }
    if (native) {
        try { setAttached('SetAlignSelf', native, alignSelfMap[value]); } catch (_e) { }
        try { (native as any).__ns_alignSelf = alignSelfMap[value]; } catch (_e) { }
        try { (native as any).__ns_view = this; } catch (_e) { }
    }
};

@NativeClass()
class FlexboxLayoutImpl extends Windows.UI.Xaml.Controls.Panel {
    private _lines: any[] = [];
    private __owner: WeakRef<FlexboxLayout> | null = null;
    constructor(owner: WeakRef<FlexboxLayout>) {
        super();
        this.__owner = owner;
    }
    MeasureOverride(availableSize: Windows.Foundation.Size): Windows.Foundation.Size {
        try {
            const children = this.Children;
            const count = (children && typeof children.Size === 'number') ? children.Size : 0;
            console.log('[FlexboxLayout] MeasureOverride children:', count, 'available:', availableSize?.Width, 'x', availableSize?.Height);
            if (count === 0) return Windows.UI.Xaml.SizeHelper.FromDimensions(0, 0);

            const owner = this.getOwner();
            const flexDirection = owner?.flexDirection ?? 'row';
            const flexWrap = owner?.flexWrap ?? 'nowrap';
            const alignItems = owner?.alignItems ?? 'stretch';
            const alignContent = owner?.alignContent ?? 'stretch';

            const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
            const doWrap = flexWrap !== 'nowrap';
            const mainAv = isRow ? availableSize.Width : availableSize.Height;
            const crossAv = isRow ? availableSize.Height : availableSize.Width;
            const mainInf = !Number.isFinite(mainAv);
            const crossInf = !Number.isFinite(crossAv);

            const items: any[] = [];
            let idx = 0;
            for (let i = 0; i < count; i++) {
                const child = children.GetAt(i);
                try { if (child.Visibility === Windows.UI.Xaml.Visibility.Collapsed) continue; } catch (_e) { }
                const item: any = {
                    Element: child,
                    OriginalIndex: idx++,
                    FlexGrow: 0.0,
                    FlexShrink: 1.0,
                    FlexBasisPercent: -1.0,
                    AlignSelf: -1,
                    WrapBefore: false,
                    MainSize: 0,
                    CrossSize: 0,
                };
                try {
                    const nv = child as any;
                    if (nv) {
                        if (nv.__ns_flexGrow !== undefined) item.FlexGrow = Number(nv.__ns_flexGrow);
                        if (nv.__ns_flexShrink !== undefined) item.FlexShrink = Number(nv.__ns_flexShrink);
                        if (nv.__ns_flexBasisPercent !== undefined) item.FlexBasisPercent = Number(nv.__ns_flexBasisPercent);
                        if (nv.__ns_alignSelf !== undefined) item.AlignSelf = Number(nv.__ns_alignSelf);
                        if (nv.__ns_wrapBefore !== undefined) item.WrapBefore = !!nv.__ns_wrapBefore;
                    }
                } catch (_e) { }
                items.push(item);
            }
            try {
                items.sort((a, b) => {
                    const ao = Number(((a.Element as any)?.__ns_order) ?? 1);
                    const bo = Number(((b.Element as any)?.__ns_order) ?? 1);
                    if (ao !== bo) return ao - bo;
                    return a.OriginalIndex - b.OriginalIndex;
                });
            } catch (_e) { }

            for (const item of items) {
                const basisMain = (!mainInf && item.FlexBasisPercent >= 0) ? mainAv * item.FlexBasisPercent / 100.0 : NaN;
                const constraint = isRow
                    ? Windows.UI.Xaml.SizeHelper.FromDimensions(Number.isNaN(basisMain) ? Number.POSITIVE_INFINITY : basisMain, crossInf ? Number.POSITIVE_INFINITY : crossAv)
                    : Windows.UI.Xaml.SizeHelper.FromDimensions(crossInf ? Number.POSITIVE_INFINITY : crossAv, Number.isNaN(basisMain) ? Number.POSITIVE_INFINITY : basisMain);
                try { item.Element.Measure(constraint); } catch (_e) { }
                try {
                    item.MainSize = Number.isNaN(basisMain) ? (isRow ? item.Element.DesiredSize.Width : item.Element.DesiredSize.Height) : basisMain;
                    item.CrossSize = isRow ? item.Element.DesiredSize.Height : item.Element.DesiredSize.Width;
                } catch (_e) {
                    item.MainSize = Number.isNaN(basisMain) ? 0 : basisMain;
                    item.CrossSize = 0;
                }
            }

            const lines: any[] = [];
            let cur: any = { Items: [], MainSize: 0, CrossSize: 0 };
            for (const item of items) {
                const forceBreak = doWrap && item.WrapBefore && cur.Items.length > 0;
                const overflow = doWrap && !mainInf && cur.Items.length > 0 && cur.MainSize + item.MainSize > mainAv + 0.001;
                if (forceBreak || overflow) {
                    lines.push(cur);
                    cur = { Items: [], MainSize: 0, CrossSize: 0 };
                }
                cur.Items.push(item);
                cur.MainSize += item.MainSize;
                if (item.CrossSize > cur.CrossSize) cur.CrossSize = item.CrossSize;
            }
            if (cur.Items.length > 0) lines.push(cur);

            if (!mainInf) {
                for (const line of lines) {
                    const free = mainAv - line.MainSize;
                    if (free > 0.001) this.applyGrow(line, free, crossAv, crossInf, isRow);
                    else if (free < -0.001) this.applyShrink(line, free, crossAv, crossInf, isRow);
                }
            }

            (this as any)._lines = lines;

            const totalMain = mainInf ? this.maxLineMain(lines) : mainAv;
            const totalCross = this.sumLineCross(lines);
            return isRow ? Windows.UI.Xaml.SizeHelper.FromDimensions(totalMain, totalCross) : Windows.UI.Xaml.SizeHelper.FromDimensions(totalCross, totalMain);
        } catch (err) {
            console.error('[FlexboxLayout] MeasureOverride failed', err);
            try { return super.MeasureOverride(availableSize); } catch (_e) { return availableSize; }
        }
    }

    ArrangeOverride(finalSize: Windows.Foundation.Size): Windows.Foundation.Size {
        try {
            const lines = (this as any)._lines as any[] || [];
            if (!lines || lines.length === 0) return finalSize;

            const owner = this.getOwner();
            const flexDirection = owner?.flexDirection ?? 'row';
            const flexWrap = owner?.flexWrap ?? 'nowrap';
            const justifyContent = owner?.justifyContent ?? 'flex-start';
            const alignItems = owner?.alignItems ?? 'stretch';
            const alignContent = owner?.alignContent ?? 'stretch';

            const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
            const revMain = flexDirection === 'row-reverse' || flexDirection === 'column-reverse';
            const revWrap = flexWrap === 'wrap-reverse';
            const mainFn = isRow ? finalSize.Width : finalSize.Height;
            const crossFn = isRow ? finalSize.Height : finalSize.Width;

            const lineCount = lines.length;
            const totalCross = this.sumLineCross(lines);
            const freeCross = crossFn - totalCross;
            const stretchExtra = (alignContent === 'stretch' && freeCross > 0 && lineCount > 0) ? freeCross / lineCount : 0;

            const lineStart = new Array(lineCount).fill(0);
            const lineSize = new Array(lineCount).fill(0);
            this.computeLineOffsets(lineCount, freeCross, stretchExtra, revWrap, lineStart, lineSize, owner, lines);

            for (let vi = 0; vi < lineCount; vi++) {
                const li = revWrap ? (lineCount - 1 - vi) : vi;
                const line = lines[li];
                const crossStart = lineStart[vi];
                const lineCross = lineSize[vi];

                const mainPos = this.computeMainPositions(line, mainFn, revMain, owner?.justifyContent ?? justifyContent);
                const n = line.Items.length;

                for (let vj = 0; vj < n; vj++) {
                    const lj = revMain ? (n - 1 - vj) : vj;
                    const item = line.Items[lj];

                    let align = (typeof item.AlignSelf === 'number' && item.AlignSelf !== -1) ? item.AlignSelf : undefined;
                    let alignStr = owner?.alignItems ?? 'stretch';
                    if (typeof align === 'number') {
                        switch (align) {
                            case 0: alignStr = 'flex-start'; break;
                            case 1: alignStr = 'flex-end'; break;
                            case 2: alignStr = 'center'; break;
                            case 3: alignStr = 'baseline'; break;
                            case 4: alignStr = 'stretch'; break;
                            default: alignStr = owner?.alignItems ?? 'stretch';
                        }
                    }

                    let crossPos = crossStart;
                    let itemCross = item.CrossSize;
                    switch (alignStr) {
                        case 'flex-end':
                            itemCross = item.CrossSize;
                            crossPos = crossStart + lineCross - itemCross;
                            break;
                        case 'center':
                            itemCross = item.CrossSize;
                            crossPos = crossStart + (lineCross - itemCross) / 2.0;
                            break;
                        case 'stretch':
                            itemCross = lineCross;
                            try { item.Element.Measure(isRow ? Windows.UI.Xaml.SizeHelper.FromDimensions(item.MainSize, lineCross) : Windows.UI.Xaml.SizeHelper.FromDimensions(lineCross, item.MainSize)); } catch (_e) { }
                            break;
                        default:
                            itemCross = item.CrossSize;
                            crossPos = crossStart;
                    }

                    try {
                        const rect = isRow
                            ? Windows.UI.Xaml.RectHelper.FromCoordinatesAndDimensions(mainPos[vj], crossPos, item.MainSize, itemCross)
                            : Windows.UI.Xaml.RectHelper.FromCoordinatesAndDimensions(crossPos, mainPos[vj], itemCross, item.MainSize);
                        try { item.Element.Arrange(rect); } catch (_e) { }
                    } catch (_e) { }
                }
            }

            return finalSize;
        } catch (err) {
            console.error('[FlexboxLayout] ArrangeOverride failed', err);
            try { return super.ArrangeOverride(finalSize); } catch (_e) { return finalSize; }
        }
    }

    private computeLineOffsets(count: number, freeCross: number, stretchExtra: number, revWrap: boolean, startOut: number[], sizeOut: number[], owner: any, lines: any[]) {
        let pos = 0, gap = 0;
        const alignContentLocal = (owner?.alignContent) ?? 'stretch';
        switch (alignContentLocal) {
            case 'flex-end': pos = freeCross; break;
            case 'center': pos = freeCross / 2.0; break;
            case 'space-between': gap = count > 1 ? freeCross / (count - 1) : 0.0; break;
            case 'space-around': gap = count > 0 ? freeCross / count : 0.0; pos = gap / 2.0; break;
        }

        for (let vi = 0; vi < count; vi++) {
            const li = revWrap ? (count - 1 - vi) : vi;
            const sz = (lines[li].CrossSize ?? 0) + stretchExtra;
            startOut[vi] = pos;
            sizeOut[vi] = sz;
            pos += sz + gap;
        }
    }

    private computeMainPositions(line: any, mainFinal: number, revMain: boolean, justify: string) {
        const n = line.Items.length;
        const pos: number[] = new Array(n).fill(0);
        const free = mainFinal - line.MainSize;
        let cur = 0, gap = 0;
        switch (justify) {
            case 'flex-end': cur = free; break;
            case 'center': cur = free / 2.0; break;
            case 'space-between': gap = n > 1 ? free / (n - 1) : 0.0; break;
            case 'space-around': gap = n > 0 ? free / n : 0.0; cur = gap / 2.0; break;
        }
        for (let vi = 0; vi < n; vi++) {
            const li = revMain ? (n - 1 - vi) : vi;
            pos[vi] = cur;
            cur += line.Items[li].MainSize + gap;
        }
        return pos;
    }

    private sumLineCross(linesArr: any[]) { let s = 0; for (const l of linesArr) s += l.CrossSize; return s; }

    private applyGrow(line: any, free: number, crossAv: number, crossInf: boolean, isRow: boolean) {
        let totalGrow = 0;
        for (const it of line.Items) totalGrow += Number(it.FlexGrow || 0);
        if (totalGrow <= 0) return;
        const perUnit = free / totalGrow;
        let maxCross = 0;
        for (const it of line.Items) {
            if ((it.FlexGrow || 0) > 0) {
                it.MainSize += it.FlexGrow * perUnit;
                this.remeasure(it, crossAv, crossInf, isRow);
            }
            if (it.CrossSize > maxCross) maxCross = it.CrossSize;
        }
        line.CrossSize = maxCross;
        line.MainSize += free;
    }

    private applyShrink(line: any, free: number, crossAv: number, crossInf: boolean, isRow: boolean) {
        let totalShrink = 0;
        for (const it of line.Items) totalShrink += (it.FlexShrink || 0) * it.MainSize;
        if (totalShrink <= 0) return;
        let maxCross = 0;
        for (const it of line.Items) {
            if ((it.FlexShrink || 0) > 0) {
                const ratio = ((it.FlexShrink || 0) * it.MainSize) / totalShrink;
                it.MainSize = Math.max(0, it.MainSize + free * ratio);
                this.remeasure(it, crossAv, crossInf, isRow);
            }
            if (it.CrossSize > maxCross) maxCross = it.CrossSize;
        }
        line.CrossSize = maxCross;
    }

    private remeasure(item: any, crossAv: number, crossInf: boolean, isRow: boolean) {
        const s = isRow
            ? Windows.UI.Xaml.SizeHelper.FromDimensions(item.MainSize, crossInf ? Number.POSITIVE_INFINITY : crossAv)
            : Windows.UI.Xaml.SizeHelper.FromDimensions(crossInf ? Number.POSITIVE_INFINITY : crossAv, item.MainSize);
        try { item.Element.Measure(s); } catch (_e) { }
        try {
            const d = item.Element.DesiredSize;
            item.CrossSize = isRow ? d.Height : d.Width;
        } catch (_e) { item.CrossSize = 0; }
    }

    private getOwner(): any {
        try {
            const maybe = this.__owner;
            if (!maybe) return null;
            if (typeof maybe.deref === 'function') {
                try { return maybe.deref(); } catch (_e) { return maybe; }
            }
            return maybe;
        } catch (_e) { return null; }
    }

    private maxLineMain(lines: any[]) {
        let max = 0;
        for (const l of lines) if (l.MainSize > max) max = l.MainSize;
        return max;
    }
}

export class FlexboxLayout extends FlexboxLayoutBase {
    nativeViewProtected!: FlexboxLayoutImpl;
    private _windows: FlexboxLayoutImpl;
    constructor() {
        super();
        this._windows = new Windows.UI.Xaml.Controls.StackPanel(); //new FlexboxLayoutImpl(new WeakRef(this));
    }

    public createNativeView() {
        return this._windows;
    }

    public _addViewToNativeVisualTree(child: any, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
        const nativeParent = this.nativeViewProtected as any;
        const nativeChild = (child as any).nativeViewProtected as any;
        console.log('[FlexboxLayout] _addViewToNativeVisualTree called: nativeParent=', !!nativeParent, 'nativeChild=', !!nativeChild, 'atIndex=', atIndex);
        const result = super._addViewToNativeVisualTree(child, atIndex);
        console.log('[FlexboxLayout] _addViewToNativeVisualTree result=', result, 'children now=', nativeParent?.Children?.Size);
        return result;
    }

    [flexDirectionProperty.getDefault](): FlexDirection {
        return flexDirectionProperty.defaultValue;
    }
    [flexDirectionProperty.setNative](value: FlexDirection) {
        //  this.nativeViewProtected.FlexDirection = flexDirectionMap[value];
    }

    [flexWrapProperty.getDefault](): FlexWrap {
        return flexWrapProperty.defaultValue;
    }
    [flexWrapProperty.setNative](value: FlexWrap) {
        //     this.nativeViewProtected.FlexWrap = flexWrapMap[value]; 
    }

    [justifyContentProperty.getDefault](): JustifyContent {
        return justifyContentProperty.defaultValue;
    }
    [justifyContentProperty.setNative](value: JustifyContent) {
        //     this.nativeViewProtected.JustifyContent = justifyContentMap[value];
    }

    [alignItemsProperty.getDefault](): AlignItems {
        return alignItemsProperty.defaultValue;
    }
    [alignItemsProperty.setNative](value: AlignItems) {
        //   this.nativeViewProtected.AlignItems = alignItemsMap[value];
    }

    [alignContentProperty.getDefault](): AlignContent {
        return alignContentProperty.defaultValue;
    }
    [alignContentProperty.setNative](value: AlignContent) {
        // this.nativeViewProtected.AlignContent = alignContentMap[value];
    }

}
