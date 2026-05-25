using System;
using System.Collections.Generic;
using Windows.Foundation;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace NativeScript.Widgets
{
    /// <summary>
    /// A XAML Panel that implements CSS Flexible Box Layout (flexbox).
    /// </summary>
    public sealed partial class FlexboxLayout : Panel
    {
        // ── Container dependency properties ──────────────────────────────────

        public static readonly DependencyProperty FlexDirectionProperty =
            DependencyProperty.Register(nameof(FlexDirection), typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(0 /* row */, OnContainerPropertyChanged));

        /// <summary>0=row  1=row-reverse  2=column  3=column-reverse</summary>
        public int FlexDirection
        {
            get => (int)GetValue(FlexDirectionProperty);
            set => SetValue(FlexDirectionProperty, value);
        }

        public static readonly DependencyProperty FlexWrapProperty =
            DependencyProperty.Register(nameof(FlexWrap), typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(0 /* nowrap */, OnContainerPropertyChanged));

        /// <summary>0=nowrap  1=wrap  2=wrap-reverse</summary>
        public int FlexWrap
        {
            get => (int)GetValue(FlexWrapProperty);
            set => SetValue(FlexWrapProperty, value);
        }

        public static readonly DependencyProperty JustifyContentProperty =
            DependencyProperty.Register(nameof(JustifyContent), typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(0 /* flex-start */, OnContainerPropertyChanged));

        /// <summary>0=flex-start  1=flex-end  2=center  3=space-between  4=space-around</summary>
        public int JustifyContent
        {
            get => (int)GetValue(JustifyContentProperty);
            set => SetValue(JustifyContentProperty, value);
        }

        public static readonly DependencyProperty AlignItemsProperty =
            DependencyProperty.Register(nameof(AlignItems), typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(4 /* stretch */, OnContainerPropertyChanged));

        /// <summary>0=flex-start  1=flex-end  2=center  3=baseline  4=stretch</summary>
        public int AlignItems
        {
            get => (int)GetValue(AlignItemsProperty);
            set => SetValue(AlignItemsProperty, value);
        }

        public static readonly DependencyProperty AlignContentProperty =
            DependencyProperty.Register(nameof(AlignContent), typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(5 /* stretch */, OnContainerPropertyChanged));

        /// <summary>0=flex-start  1=flex-end  2=center  3=space-between  4=space-around  5=stretch</summary>
        public int AlignContent
        {
            get => (int)GetValue(AlignContentProperty);
            set => SetValue(AlignContentProperty, value);
        }

        private static void OnContainerPropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
            => ((FlexboxLayout)d).InvalidateMeasure();

        // ── Attached dependency properties (per child) ───────────────────────

        public static readonly DependencyProperty OrderProperty =
            DependencyProperty.RegisterAttached("Order", typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(1, OnChildPropertyChanged));

        public static int GetOrder(UIElement e) => (int)e.GetValue(OrderProperty);
        public static void SetOrder(UIElement e, int v) => e.SetValue(OrderProperty, v);

        public static readonly DependencyProperty FlexGrowProperty =
            DependencyProperty.RegisterAttached("FlexGrow", typeof(double), typeof(FlexboxLayout),
                new PropertyMetadata(0.0, OnChildPropertyChanged));

        public static double GetFlexGrow(UIElement e) => (double)e.GetValue(FlexGrowProperty);
        public static void SetFlexGrow(UIElement e, double v) => e.SetValue(FlexGrowProperty, v);

        public static readonly DependencyProperty FlexShrinkProperty =
            DependencyProperty.RegisterAttached("FlexShrink", typeof(double), typeof(FlexboxLayout),
                new PropertyMetadata(1.0, OnChildPropertyChanged));

        public static double GetFlexShrink(UIElement e) => (double)e.GetValue(FlexShrinkProperty);
        public static void SetFlexShrink(UIElement e, double v) => e.SetValue(FlexShrinkProperty, v);

        public static readonly DependencyProperty AlignSelfProperty =
            DependencyProperty.RegisterAttached("AlignSelf", typeof(int), typeof(FlexboxLayout),
                new PropertyMetadata(-1 /* auto */, OnChildPropertyChanged));

        /// <summary>-1=auto  0=flex-start  1=flex-end  2=center  3=baseline  4=stretch</summary>
        public static int GetAlignSelf(UIElement e) => (int)e.GetValue(AlignSelfProperty);
        public static void SetAlignSelf(UIElement e, int v) => e.SetValue(AlignSelfProperty, v);

        public static readonly DependencyProperty FlexBasisPercentProperty =
            DependencyProperty.RegisterAttached("FlexBasisPercent", typeof(double), typeof(FlexboxLayout),
                new PropertyMetadata(-1.0 /* unset */, OnChildPropertyChanged));

        /// <summary>-1 = unset (use content size).  0-100 = percentage of container main axis.</summary>
        public static double GetFlexBasisPercent(UIElement e) => (double)e.GetValue(FlexBasisPercentProperty);
        public static void SetFlexBasisPercent(UIElement e, double v) => e.SetValue(FlexBasisPercentProperty, v);

        public static readonly DependencyProperty WrapBeforeProperty =
            DependencyProperty.RegisterAttached("WrapBefore", typeof(bool), typeof(FlexboxLayout),
                new PropertyMetadata(false, OnChildPropertyChanged));

        public static bool GetWrapBefore(UIElement e) => (bool)e.GetValue(WrapBeforeProperty);
        public static void SetWrapBefore(UIElement e, bool v) => e.SetValue(WrapBeforeProperty, v);

        private static void OnChildPropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
            => ((d as FrameworkElement)?.Parent as FlexboxLayout)?.InvalidateMeasure();

        // ── Integer constants (kept in sync with TS maps) ────────────────────

        private const int DIR_ROW = 0, DIR_ROW_REV = 1, DIR_COL = 2, DIR_COL_REV = 3;
        private const int WRAP_NO = 0, WRAP_YES = 1, WRAP_REV = 2;
        private const int JUSTIFY_START = 0, JUSTIFY_END = 1, JUSTIFY_CENTER = 2, JUSTIFY_SPACE_BETWEEN = 3, JUSTIFY_SPACE_AROUND = 4;
        private const int ALIGN_AUTO = -1, ALIGN_START = 0, ALIGN_END = 1, ALIGN_CENTER = 2, ALIGN_BASELINE = 3, ALIGN_STRETCH = 4;
        private const int CONTENT_START = 0, CONTENT_END = 1, CONTENT_CENTER = 2, CONTENT_SPACE_BETWEEN = 3, CONTENT_SPACE_AROUND = 4, CONTENT_STRETCH = 5;

        // ── Internal data structures ─────────────────────────────────────────

        private sealed class FlexItem
        {
            public UIElement Element = null!;
            public int OriginalIndex;
            public double FlexGrow, FlexShrink, FlexBasisPercent;
            public int AlignSelf;
            public bool WrapBefore;
            public double MainSize, CrossSize;
        }

        private sealed class FlexLine
        {
            public readonly List<FlexItem> Items = new List<FlexItem>();
            public double MainSize, CrossSize;
        }

        // Cached between Measure and Arrange — XAML layout is always single-threaded.
        private List<FlexLine> _lines = new List<FlexLine>();

        // ── Layout helpers ───────────────────────────────────────────────────

        private bool IsRow => FlexDirection is DIR_ROW or DIR_ROW_REV;

        private double MainOf(Size s) => IsRow ? s.Width : s.Height;
        private double CrossOf(Size s) => IsRow ? s.Height : s.Width;

        private Size AsSize(double main, double cross)
            => IsRow ? new Size(main, cross) : new Size(cross, main);

        private Rect AsRect(double mainPos, double crossPos, double main, double cross)
            => IsRow ? new Rect(mainPos, crossPos, main, cross)
                     : new Rect(crossPos, mainPos, cross, main);

        // ── MeasureOverride ──────────────────────────────────────────────────

        protected override Size MeasureOverride(Size avail)
        {
            if (Children.Count == 0) return new Size(0, 0);

            bool isRow    = IsRow;
            bool doWrap   = FlexWrap is not WRAP_NO;
            double mainAv = MainOf(avail);
            double crossAv = CrossOf(avail);
            bool mainInf  = double.IsInfinity(mainAv);
            bool crossInf = double.IsInfinity(crossAv);

            var items = CollectItems();
            MeasureInitial(items, mainAv, crossAv, mainInf, crossInf, isRow);
            var lines = BuildLines(items, mainAv, mainInf, doWrap);
            ResolveFlexFactors(lines, mainAv, crossAv, mainInf, crossInf, isRow);

            _lines = lines;

            double totalMain  = mainInf ? MaxLineMain(lines) : mainAv;
            double totalCross = SumLineCross(lines);
            return AsSize(totalMain, totalCross);
        }

        private List<FlexItem> CollectItems()
        {
            var items = new List<FlexItem>(Children.Count);
            int idx = 0;
            foreach (UIElement child in Children)
            {
                if (child.Visibility == Visibility.Collapsed) continue;
                items.Add(new FlexItem
                {
                    Element          = child,
                    OriginalIndex    = idx++,
                    FlexGrow         = GetFlexGrow(child),
                    FlexShrink       = GetFlexShrink(child),
                    FlexBasisPercent = GetFlexBasisPercent(child),
                    AlignSelf        = GetAlignSelf(child),
                    WrapBefore       = GetWrapBefore(child),
                });
            }
            // Stable sort: primary = Order, secondary = DOM insertion order.
            items.Sort((a, b) =>
            {
                int cmp = GetOrder(a.Element).CompareTo(GetOrder(b.Element));
                return cmp != 0 ? cmp : a.OriginalIndex.CompareTo(b.OriginalIndex);
            });
            return items;
        }

        private void MeasureInitial(List<FlexItem> items,
                                    double mainAv, double crossAv,
                                    bool mainInf, bool crossInf, bool isRow)
        {
            foreach (var item in items)
            {
                double basisMain = (!mainInf && item.FlexBasisPercent >= 0)
                    ? mainAv * item.FlexBasisPercent / 100.0
                    : double.NaN;

                var constraint = AsSize(
                    double.IsNaN(basisMain) ? double.PositiveInfinity : basisMain,
                    crossInf ? double.PositiveInfinity : crossAv);

                item.Element.Measure(constraint);
                item.MainSize  = double.IsNaN(basisMain) ? MainOf(item.Element.DesiredSize) : basisMain;
                item.CrossSize = CrossOf(item.Element.DesiredSize);
            }
        }

        private static List<FlexLine> BuildLines(List<FlexItem> items,
                                                  double mainAv, bool mainInf, bool doWrap)
        {
            var lines = new List<FlexLine>();
            var cur   = new FlexLine();

            foreach (var item in items)
            {
                bool forceBreak = doWrap && item.WrapBefore && cur.Items.Count > 0;
                bool overflow   = doWrap && !mainInf && cur.Items.Count > 0
                                  && cur.MainSize + item.MainSize > mainAv + 0.001;

                if (forceBreak || overflow)
                {
                    lines.Add(cur);
                    cur = new FlexLine();
                }

                cur.Items.Add(item);
                cur.MainSize += item.MainSize;
                if (item.CrossSize > cur.CrossSize) cur.CrossSize = item.CrossSize;
            }

            if (cur.Items.Count > 0) lines.Add(cur);
            return lines;
        }

        private static void ResolveFlexFactors(List<FlexLine> lines,
                                                double mainAv, double crossAv,
                                                bool mainInf, bool crossInf, bool isRow)
        {
            if (mainInf) return;
            foreach (var line in lines)
            {
                double free = mainAv - line.MainSize;
                if      (free >  0.001) ApplyGrow  (line, free, crossAv, crossInf, isRow);
                else if (free < -0.001) ApplyShrink(line, free, crossAv, crossInf, isRow);
            }
        }

        private static void ApplyGrow(FlexLine line, double free,
                                       double crossAv, bool crossInf, bool isRow)
        {
            double totalGrow = 0;
            foreach (var item in line.Items) totalGrow += item.FlexGrow;
            if (totalGrow <= 0) return;

            double perUnit   = free / totalGrow;
            double maxCross  = 0;
            foreach (var item in line.Items)
            {
                if (item.FlexGrow > 0)
                {
                    item.MainSize += item.FlexGrow * perUnit;
                    Remeasure(item, crossAv, crossInf, isRow);
                }
                if (item.CrossSize > maxCross) maxCross = item.CrossSize;
            }
            line.CrossSize = maxCross;
            line.MainSize += free;
        }

        private static void ApplyShrink(FlexLine line, double free,
                                         double crossAv, bool crossInf, bool isRow)
        {
            double totalShrink = 0;
            foreach (var item in line.Items) totalShrink += item.FlexShrink * item.MainSize;
            if (totalShrink <= 0) return;

            double maxCross = 0;
            foreach (var item in line.Items)
            {
                if (item.FlexShrink > 0)
                {
                    double ratio  = (item.FlexShrink * item.MainSize) / totalShrink;
                    item.MainSize = Math.Max(0, item.MainSize + free * ratio);
                    Remeasure(item, crossAv, crossInf, isRow);
                }
                if (item.CrossSize > maxCross) maxCross = item.CrossSize;
            }
            line.CrossSize = maxCross;
        }

        private static void Remeasure(FlexItem item, double crossAv, bool crossInf, bool isRow)
        {
            var s = isRow
                ? new Size(item.MainSize, crossInf ? double.PositiveInfinity : crossAv)
                : new Size(crossInf ? double.PositiveInfinity : crossAv, item.MainSize);
            item.Element.Measure(s);
            var d = item.Element.DesiredSize;
            item.CrossSize = isRow ? d.Height : d.Width;
        }

        private static double MaxLineMain(List<FlexLine> lines)
        {
            double max = 0;
            foreach (var l in lines) if (l.MainSize > max) max = l.MainSize;
            return max;
        }

        private static double SumLineCross(List<FlexLine> lines)
        {
            double sum = 0;
            foreach (var l in lines) sum += l.CrossSize;
            return sum;
        }

        // ── ArrangeOverride ──────────────────────────────────────────────────

        protected override Size ArrangeOverride(Size final)
        {
            if (_lines.Count == 0) return final;

            bool isRow    = IsRow;
            bool revMain  = FlexDirection is DIR_ROW_REV or DIR_COL_REV;
            bool revWrap  = FlexWrap is WRAP_REV;
            double mainFn = MainOf(final);
            double crossFn = CrossOf(final);

            int    lineCount    = _lines.Count;
            double totalCross   = SumLineCross(_lines);
            double freeCross    = crossFn - totalCross;
            double stretchExtra = (AlignContent == CONTENT_STRETCH && freeCross > 0 && lineCount > 0)
                                  ? freeCross / lineCount
                                  : 0.0;

            double[] lineStart = new double[lineCount];
            double[] lineSize  = new double[lineCount];
            ComputeLineOffsets(lineCount, freeCross, stretchExtra, revWrap, lineStart, lineSize);

            for (int vi = 0; vi < lineCount; vi++)
            {
                // wrap-reverse: first visual slot shows the last logical line
                int li   = revWrap ? (lineCount - 1 - vi) : vi;
                var line = _lines[li];
                double crossStart = lineStart[vi];
                double lineCross  = lineSize[vi];

                double[] mainPos = ComputeMainPositions(line, mainFn, revMain);
                int n = line.Items.Count;

                for (int vj = 0; vj < n; vj++)
                {
                    // row-reverse / column-reverse: last logical item appears first visually
                    int lj   = revMain ? (n - 1 - vj) : vj;
                    var item = line.Items[lj];

                    int align = item.AlignSelf == ALIGN_AUTO ? AlignItems : item.AlignSelf;
                    double crossPos, itemCross;

                    switch (align)
                    {
                        case ALIGN_END:
                            itemCross = item.CrossSize;
                            crossPos  = crossStart + lineCross - itemCross;
                            break;
                        case ALIGN_CENTER:
                            itemCross = item.CrossSize;
                            crossPos  = crossStart + (lineCross - itemCross) / 2.0;
                            break;
                        case ALIGN_STRETCH:
                            itemCross = lineCross;
                            crossPos  = crossStart;
                            // Must re-measure at the stretched cross size before arranging.
                            item.Element.Measure(AsSize(item.MainSize, lineCross));
                            break;
                        default: // ALIGN_START, ALIGN_BASELINE
                            itemCross = item.CrossSize;
                            crossPos  = crossStart;
                            break;
                    }

                    item.Element.Arrange(AsRect(mainPos[vj], crossPos, item.MainSize, itemCross));
                }
            }

            return final;
        }

        private void ComputeLineOffsets(int count, double freeCross, double stretchExtra,
                                         bool revWrap, double[] startOut, double[] sizeOut)
        {
            double pos = 0, gap = 0;

            switch (AlignContent)
            {
                case CONTENT_END:          pos = freeCross;                                   break;
                case CONTENT_CENTER:       pos = freeCross / 2.0;                             break;
                case CONTENT_SPACE_BETWEEN: gap = count > 1 ? freeCross / (count - 1) : 0.0; break;
                case CONTENT_SPACE_AROUND:  gap = count > 0 ? freeCross / count : 0.0;
                                            pos = gap / 2.0;                                  break;
            }

            for (int vi = 0; vi < count; vi++)
            {
                // Map visual slot to logical line for cross-size lookup
                int li         = revWrap ? (count - 1 - vi) : vi;
                double sz      = _lines[li].CrossSize + stretchExtra;
                startOut[vi]   = pos;
                sizeOut[vi]    = sz;
                pos           += sz + gap;
            }
        }

        private double[] ComputeMainPositions(FlexLine line, double mainFinal, bool revMain)
        {
            int n = line.Items.Count;
            double[] pos = new double[n];
            double free = mainFinal - line.MainSize;
            double cur = 0, gap = 0;

            switch (JustifyContent)
            {
                case JUSTIFY_END:          cur = free;                                      break;
                case JUSTIFY_CENTER:       cur = free / 2.0;                                break;
                case JUSTIFY_SPACE_BETWEEN: gap = n > 1 ? free / (n - 1) : 0.0;            break;
                case JUSTIFY_SPACE_AROUND:  gap = n > 0 ? free / n : 0.0; cur = gap / 2.0; break;
            }

            for (int vi = 0; vi < n; vi++)
            {
                // The item at visual slot vi is logical item (n-1-vi) when reversed
                int li    = revMain ? (n - 1 - vi) : vi;
                pos[vi]   = cur;
                cur      += line.Items[li].MainSize + gap;
            }
            return pos;
        }
    }
}
