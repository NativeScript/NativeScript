#include "pch.h"
#include "FlexboxLayout.h"
#include "FlexboxLayout.g.cpp"

#include <algorithm>
#include <cmath>
#include <limits>

using namespace winrt;
using namespace winrt::Windows::Foundation;
using namespace winrt::Microsoft::UI::Xaml;

namespace
{
    // Integer constants (kept in sync with the TS maps in flexbox-layout/index.windows.ts).
    constexpr int32_t DIR_ROW = 0, DIR_ROW_REV = 1 /*, DIR_COL = 2 */, DIR_COL_REV = 3;
    constexpr int32_t WRAP_NO = 0, /* WRAP_YES = 1, */ WRAP_REV = 2;
    constexpr int32_t JUSTIFY_END = 1, JUSTIFY_CENTER = 2, JUSTIFY_SPACE_BETWEEN = 3, JUSTIFY_SPACE_AROUND = 4, JUSTIFY_SPACE_EVENLY = 5;
    constexpr int32_t ALIGN_AUTO = -1, /* ALIGN_START = 0, */ ALIGN_END = 1, ALIGN_CENTER = 2, /* ALIGN_BASELINE = 3, */ ALIGN_STRETCH = 4;
    constexpr int32_t CONTENT_END = 1, CONTENT_CENTER = 2, CONTENT_SPACE_BETWEEN = 3, CONTENT_SPACE_AROUND = 4, CONTENT_STRETCH = 5, CONTENT_SPACE_EVENLY = 6;

    constexpr float fInf = std::numeric_limits<float>::infinity();
    constexpr double dInf = std::numeric_limits<double>::infinity();
    constexpr double dNaN = std::numeric_limits<double>::quiet_NaN();

    inline double MainOf(Size const& s, bool isRow) { return isRow ? s.Width : s.Height; }
    inline double CrossOf(Size const& s, bool isRow) { return isRow ? s.Height : s.Width; }

    inline Size AsSize(double main, double cross, bool isRow)
    {
        return isRow ? Size{ static_cast<float>(main), static_cast<float>(cross) }
                     : Size{ static_cast<float>(cross), static_cast<float>(main) };
    }

    inline Rect AsRect(double mainPos, double crossPos, double main, double cross, bool isRow)
    {
        return isRow
            ? Rect{ static_cast<float>(mainPos), static_cast<float>(crossPos), static_cast<float>(main), static_cast<float>(cross) }
            : Rect{ static_cast<float>(crossPos), static_cast<float>(mainPos), static_cast<float>(cross), static_cast<float>(main) };
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    // ── Attached DependencyProperties ────────────────────────────────────────
    DependencyProperty FlexboxLayout::OrderProperty()
    {
        static DependencyProperty const prop = DependencyProperty::RegisterAttached(
            L"Order", winrt::xaml_typename<int32_t>(), winrt::xaml_typename<winrt::NativeScript::Widgets::FlexboxLayout>(),
            PropertyMetadata{ winrt::box_value<int32_t>(1), PropertyChangedCallback{ &FlexboxLayout::OnChildPropertyChanged } });
        return prop;
    }
    DependencyProperty FlexboxLayout::FlexGrowProperty()
    {
        static DependencyProperty const prop = DependencyProperty::RegisterAttached(
            L"FlexGrow", winrt::xaml_typename<double>(), winrt::xaml_typename<winrt::NativeScript::Widgets::FlexboxLayout>(),
            PropertyMetadata{ winrt::box_value(0.0), PropertyChangedCallback{ &FlexboxLayout::OnChildPropertyChanged } });
        return prop;
    }
    DependencyProperty FlexboxLayout::FlexShrinkProperty()
    {
        static DependencyProperty const prop = DependencyProperty::RegisterAttached(
            L"FlexShrink", winrt::xaml_typename<double>(), winrt::xaml_typename<winrt::NativeScript::Widgets::FlexboxLayout>(),
            PropertyMetadata{ winrt::box_value(1.0), PropertyChangedCallback{ &FlexboxLayout::OnChildPropertyChanged } });
        return prop;
    }
    DependencyProperty FlexboxLayout::AlignSelfProperty()
    {
        static DependencyProperty const prop = DependencyProperty::RegisterAttached(
            L"AlignSelf", winrt::xaml_typename<int32_t>(), winrt::xaml_typename<winrt::NativeScript::Widgets::FlexboxLayout>(),
            PropertyMetadata{ winrt::box_value<int32_t>(-1), PropertyChangedCallback{ &FlexboxLayout::OnChildPropertyChanged } });
        return prop;
    }
    DependencyProperty FlexboxLayout::FlexBasisPercentProperty()
    {
        static DependencyProperty const prop = DependencyProperty::RegisterAttached(
            L"FlexBasisPercent", winrt::xaml_typename<double>(), winrt::xaml_typename<winrt::NativeScript::Widgets::FlexboxLayout>(),
            PropertyMetadata{ winrt::box_value(-1.0), PropertyChangedCallback{ &FlexboxLayout::OnChildPropertyChanged } });
        return prop;
    }
    DependencyProperty FlexboxLayout::WrapBeforeProperty()
    {
        static DependencyProperty const prop = DependencyProperty::RegisterAttached(
            L"WrapBefore", winrt::xaml_typename<bool>(), winrt::xaml_typename<winrt::NativeScript::Widgets::FlexboxLayout>(),
            PropertyMetadata{ winrt::box_value(false), PropertyChangedCallback{ &FlexboxLayout::OnChildPropertyChanged } });
        return prop;
    }

    int32_t FlexboxLayout::GetOrder(UIElement const& e) { return winrt::unbox_value_or<int32_t>(e.GetValue(OrderProperty()), 1); }
    void FlexboxLayout::SetOrder(UIElement const& e, int32_t v) { e.SetValue(OrderProperty(), winrt::box_value<int32_t>(v)); }
    double FlexboxLayout::GetFlexGrow(UIElement const& e) { return winrt::unbox_value_or<double>(e.GetValue(FlexGrowProperty()), 0.0); }
    void FlexboxLayout::SetFlexGrow(UIElement const& e, double v) { e.SetValue(FlexGrowProperty(), winrt::box_value(v)); }
    double FlexboxLayout::GetFlexShrink(UIElement const& e) { return winrt::unbox_value_or<double>(e.GetValue(FlexShrinkProperty()), 1.0); }
    void FlexboxLayout::SetFlexShrink(UIElement const& e, double v) { e.SetValue(FlexShrinkProperty(), winrt::box_value(v)); }
    int32_t FlexboxLayout::GetAlignSelf(UIElement const& e) { return winrt::unbox_value_or<int32_t>(e.GetValue(AlignSelfProperty()), -1); }
    void FlexboxLayout::SetAlignSelf(UIElement const& e, int32_t v) { e.SetValue(AlignSelfProperty(), winrt::box_value<int32_t>(v)); }
    double FlexboxLayout::GetFlexBasisPercent(UIElement const& e) { return winrt::unbox_value_or<double>(e.GetValue(FlexBasisPercentProperty()), -1.0); }
    void FlexboxLayout::SetFlexBasisPercent(UIElement const& e, double v) { e.SetValue(FlexBasisPercentProperty(), winrt::box_value(v)); }
    bool FlexboxLayout::GetWrapBefore(UIElement const& e) { return winrt::unbox_value_or<bool>(e.GetValue(WrapBeforeProperty()), false); }
    void FlexboxLayout::SetWrapBefore(UIElement const& e, bool v) { e.SetValue(WrapBeforeProperty(), winrt::box_value(v)); }

    void FlexboxLayout::OnChildPropertyChanged(DependencyObject const& d, DependencyPropertyChangedEventArgs const&)
    {
        if (auto fe = d.try_as<FrameworkElement>())
        {
            if (auto parent = fe.Parent().try_as<winrt::NativeScript::Widgets::FlexboxLayout>())
            {
                parent.InvalidateMeasure();
            }
        }
    }

    // ── MeasureOverride ──────────────────────────────────────────────────────
    Size FlexboxLayout::MeasureOverride(Size const& avail)
    {
        m_lines.clear();
        auto children = Children();
        if (children.Size() == 0)
        {
            return Size{ 0, 0 };
        }

        const bool isRow = IsRow();
        const bool doWrap = (m_flexWrap != WRAP_NO);
        const double mainAv = MainOf(avail, isRow);
        const double crossAv = CrossOf(avail, isRow);
        const bool mainInf = std::isinf(mainAv);
        const bool crossInf = std::isinf(crossAv);

        // CollectItems — gather visible children with their flex props, then stable-sort by Order.
        // Order is cached in FlexItem to avoid O(N log N) WinRT DependencyProperty reads in the comparator.
        std::vector<FlexItem> items;
        items.reserve(children.Size());
        int32_t idx = 0;
        for (auto const& child : children)
        {
            if (child.Visibility() == Visibility::Collapsed)
            {
                continue;
            }
            FlexItem fi;
            fi.Element = child;
            fi.OriginalIndex = idx++;
            fi.Order = GetOrder(child);
            fi.FlexGrow = GetFlexGrow(child);
            fi.FlexShrink = GetFlexShrink(child);
            fi.FlexBasisPercent = GetFlexBasisPercent(child);
            fi.AlignSelf = GetAlignSelf(child);
            fi.WrapBefore = GetWrapBefore(child);
            items.push_back(std::move(fi));
        }
        // Stable sort: primary = Order (cached — no WinRT per comparison), secondary = insertion order.
        std::stable_sort(items.begin(), items.end(), [](FlexItem const& a, FlexItem const& b) {
            if (a.Order != b.Order) return a.Order < b.Order;
            return a.OriginalIndex < b.OriginalIndex;
        });

        // MeasureInitial — each item at its flex-basis (or natural) main size.
        for (auto& item : items)
        {
            const double basisMain = (!mainInf && item.FlexBasisPercent >= 0)
                ? mainAv * item.FlexBasisPercent / 100.0
                : dNaN;

            const Size constraint = AsSize(
                std::isnan(basisMain) ? static_cast<double>(fInf) : basisMain,
                crossInf ? static_cast<double>(fInf) : crossAv,
                isRow);

            item.Element.Measure(constraint);
            const Size d = item.Element.DesiredSize();
            item.MainSize = std::isnan(basisMain) ? MainOf(d, isRow) : basisMain;
            item.CrossSize = CrossOf(d, isRow);
        }

        // BuildLines — wrap into flex lines.
        // mainGap = CSS column-gap (row direction) or row-gap (column direction): gap between items.
        // crossGap = CSS row-gap (row direction) or column-gap (column direction): gap between lines.
        const double mainGap = isRow ? m_columnGap : m_rowGap;
        const double crossGap = isRow ? m_rowGap : m_columnGap;

        std::vector<FlexLine> lines;
        {
            FlexLine cur;
            for (auto& item : items)
            {
                const bool forceBreak = doWrap && item.WrapBefore && !cur.Items.empty();
                // Include the inter-item gap in the overflow check.
                const double addedMain = cur.Items.empty() ? item.MainSize : mainGap + item.MainSize;
                const bool overflow = doWrap && !mainInf && !cur.Items.empty()
                    && (cur.MainSize + addedMain > mainAv + 0.001);

                if (forceBreak || overflow)
                {
                    lines.push_back(std::move(cur));
                    cur = FlexLine{};
                }
                cur.MainSize += cur.Items.empty() ? item.MainSize : mainGap + item.MainSize;
                if (item.CrossSize > cur.CrossSize) cur.CrossSize = item.CrossSize;
                cur.Items.push_back(std::move(item));
            }
            if (!cur.Items.empty()) lines.push_back(std::move(cur));
        }

        // ResolveFlexFactors — grow/shrink each line to the available main extent.
        if (!mainInf)
        {
            for (auto& line : lines)
            {
                const double free = mainAv - line.MainSize;
                if (free > 0.001)
                {
                    double totalGrow = 0;
                    for (auto const& it : line.Items) totalGrow += it.FlexGrow;
                    if (totalGrow > 0)
                    {
                        const double perUnit = free / totalGrow;
                        double maxCross = 0;
                        for (auto& it : line.Items)
                        {
                            if (it.FlexGrow > 0)
                            {
                                it.MainSize += it.FlexGrow * perUnit;
                                const Size s = AsSize(it.MainSize, crossInf ? static_cast<double>(fInf) : crossAv, isRow);
                                it.Element.Measure(s);
                                it.CrossSize = CrossOf(it.Element.DesiredSize(), isRow);
                            }
                            if (it.CrossSize > maxCross) maxCross = it.CrossSize;
                        }
                        line.CrossSize = maxCross;
                        line.MainSize += free;
                    }
                }
                else if (free < -0.001)
                {
                    double totalShrink = 0;
                    for (auto const& it : line.Items) totalShrink += it.FlexShrink * it.MainSize;
                    if (totalShrink > 0)
                    {
                        double maxCross = 0;
                        for (auto& it : line.Items)
                        {
                            if (it.FlexShrink > 0)
                            {
                                const double ratio = (it.FlexShrink * it.MainSize) / totalShrink;
                                it.MainSize = (std::max)(0.0, it.MainSize + free * ratio);
                                const Size s = AsSize(it.MainSize, crossInf ? static_cast<double>(fInf) : crossAv, isRow);
                                it.Element.Measure(s);
                                it.CrossSize = CrossOf(it.Element.DesiredSize(), isRow);
                            }
                            if (it.CrossSize > maxCross) maxCross = it.CrossSize;
                        }
                        line.CrossSize = maxCross;
                    }
                }
            }
        }

        m_lines = std::move(lines);

        double totalCross = 0;
        for (auto const& l : m_lines) totalCross += l.CrossSize;
        if (m_lines.size() > 1) totalCross += (m_lines.size() - 1) * crossGap;

        double totalMain;
        if (mainInf)
        {
            totalMain = 0;
            for (auto const& l : m_lines) if (l.MainSize > totalMain) totalMain = l.MainSize;
        }
        else
        {
            totalMain = mainAv;
        }

        return AsSize(totalMain, totalCross, isRow);
    }

    // ── ArrangeOverride ──────────────────────────────────────────────────────
    Size FlexboxLayout::ArrangeOverride(Size const& final)
    {
        if (m_lines.empty())
        {
            return final;
        }

        const bool isRow = IsRow();
        const bool revMain = (m_flexDirection == DIR_ROW_REV || m_flexDirection == DIR_COL_REV);
        const bool revWrap = (m_flexWrap == WRAP_REV);
        const double mainFn = MainOf(final, isRow);
        const double crossFn = CrossOf(final, isRow);

        // Gaps: main-axis between items, cross-axis between lines.
        const double mainGap  = isRow ? m_columnGap : m_rowGap;
        const double crossGap = isRow ? m_rowGap    : m_columnGap;

        const int lineCount = static_cast<int>(m_lines.size());
        double totalCross = 0;
        for (auto const& l : m_lines) totalCross += l.CrossSize;
        if (lineCount > 1) totalCross += (lineCount - 1) * crossGap;
        const double freeCross = crossFn - totalCross;
        const double stretchExtra = (m_alignContent == CONTENT_STRETCH && freeCross > 0 && lineCount > 0)
            ? freeCross / lineCount
            : 0.0;

        // ComputeLineOffsets — cross-axis position/size of each visual line slot.
        std::vector<double> lineStart(lineCount, 0.0);
        std::vector<double> lineSize(lineCount, 0.0);
        {
            // acGap = extra space per slot from align-content (on top of fixed crossGap).
            double pos = 0, acGap = 0;
            switch (m_alignContent)
            {
            case CONTENT_END:           pos = freeCross; break;
            case CONTENT_CENTER:        pos = freeCross / 2.0; break;
            case CONTENT_SPACE_BETWEEN: acGap = lineCount > 1 ? freeCross / (lineCount - 1) : 0.0; break;
            case CONTENT_SPACE_AROUND:  acGap = lineCount > 0 ? freeCross / lineCount : 0.0; pos = acGap / 2.0; break;
            case CONTENT_SPACE_EVENLY:  acGap = lineCount > 0 ? freeCross / (lineCount + 1) : 0.0; pos = acGap; break;
            default: break;
            }
            for (int vi = 0; vi < lineCount; vi++)
            {
                const int li = revWrap ? (lineCount - 1 - vi) : vi;
                const double sz = m_lines[li].CrossSize + stretchExtra;
                lineStart[vi] = pos;
                lineSize[vi] = sz;
                pos += sz + crossGap + acGap;
            }
        }

        for (int vi = 0; vi < lineCount; vi++)
        {
            const int li = revWrap ? (lineCount - 1 - vi) : vi;
            FlexLine& line = m_lines[li];
            const double crossStart = lineStart[vi];
            const double lineCross = lineSize[vi];

            // ComputeMainPositions — main-axis position of each visual item slot.
            // Reuse scratch buffer to avoid per-line heap allocation.
            const int n = static_cast<int>(line.Items.size());
            m_scratchMainPos.resize(n);
            {
                // line.MainSize already includes (n-1)*mainGap from MeasureOverride.
                // free is what remains for justify-content to distribute.
                const double free = mainFn - line.MainSize;
                // jcGap = extra space per inter-item slot from justify-content (adds to fixed mainGap).
                double cur = 0, jcGap = 0;
                switch (m_justifyContent)
                {
                case JUSTIFY_END:           cur = free; break;
                case JUSTIFY_CENTER:        cur = free / 2.0; break;
                case JUSTIFY_SPACE_BETWEEN: jcGap = n > 1 ? free / (n - 1) : 0.0; break;
                case JUSTIFY_SPACE_AROUND:  jcGap = n > 0 ? free / n : 0.0; cur = jcGap / 2.0; break;
                case JUSTIFY_SPACE_EVENLY:  jcGap = n > 0 ? free / (n + 1) : 0.0; cur = jcGap; break;
                default: break;
                }
                for (int vj = 0; vj < n; vj++)
                {
                    const int lj = revMain ? (n - 1 - vj) : vj;
                    m_scratchMainPos[vj] = cur;
                    cur += line.Items[lj].MainSize + mainGap + jcGap;
                }
            }

            for (int vj = 0; vj < n; vj++)
            {
                const int lj = revMain ? (n - 1 - vj) : vj;
                FlexItem& item = line.Items[lj];

                const int align = (item.AlignSelf == ALIGN_AUTO) ? m_alignItems : item.AlignSelf;
                double crossPos, itemCross;

                switch (align)
                {
                case ALIGN_END:
                    itemCross = item.CrossSize;
                    crossPos = crossStart + lineCross - itemCross;
                    break;
                case ALIGN_CENTER:
                    itemCross = item.CrossSize;
                    crossPos = crossStart + (lineCross - itemCross) / 2.0;
                    break;
                case ALIGN_STRETCH:
                    itemCross = lineCross;
                    crossPos = crossStart;
                    // Re-measure at the stretched cross size only if it changed to avoid redundant WinRT calls.
                    if (std::abs(item.CrossSize - lineCross) > 0.5)
                    {
                        item.Element.Measure(AsSize(item.MainSize, lineCross, isRow));
                    }
                    break;
                default: // ALIGN_START, ALIGN_BASELINE
                    itemCross = item.CrossSize;
                    crossPos = crossStart;
                    break;
                }

                item.Element.Arrange(AsRect(m_scratchMainPos[vj], crossPos, item.MainSize, itemCross, isRow));
            }
        }

        return final;
    }
}
