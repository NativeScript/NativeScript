#pragma once
#include "FlexboxLayout.g.h"
#include <vector>

namespace winrt::NativeScript::Widgets::implementation
{
    struct FlexboxLayout : FlexboxLayoutT<FlexboxLayout>
    {
        FlexboxLayout() = default;

        // ── Container properties (changing any re-measures) ──────────────────
        int32_t FlexDirection() const noexcept { return m_flexDirection; }
        void FlexDirection(int32_t v) { if (m_flexDirection != v) { m_flexDirection = v; InvalidateMeasure(); } }

        int32_t FlexWrap() const noexcept { return m_flexWrap; }
        void FlexWrap(int32_t v) { if (m_flexWrap != v) { m_flexWrap = v; InvalidateMeasure(); } }

        int32_t JustifyContent() const noexcept { return m_justifyContent; }
        void JustifyContent(int32_t v) { if (m_justifyContent != v) { m_justifyContent = v; InvalidateMeasure(); } }

        int32_t AlignItems() const noexcept { return m_alignItems; }
        void AlignItems(int32_t v) { if (m_alignItems != v) { m_alignItems = v; InvalidateMeasure(); } }

        int32_t AlignContent() const noexcept { return m_alignContent; }
        void AlignContent(int32_t v) { if (m_alignContent != v) { m_alignContent = v; InvalidateMeasure(); } }

        double ColumnGap() const noexcept { return m_columnGap; }
        void ColumnGap(double v) { if (m_columnGap != v) { m_columnGap = v; InvalidateMeasure(); } }

        double RowGap() const noexcept { return m_rowGap; }
        void RowGap(double v) { if (m_rowGap != v) { m_rowGap = v; InvalidateMeasure(); } }

        // ── Layout ───────────────────────────────────────────────────────────
        winrt::Windows::Foundation::Size MeasureOverride(winrt::Windows::Foundation::Size const& availableSize);
        winrt::Windows::Foundation::Size ArrangeOverride(winrt::Windows::Foundation::Size const& finalSize);

        // ── Attached properties (per child) — static accessors used by JS ────
        static int32_t GetOrder(winrt::Microsoft::UI::Xaml::UIElement const& e);
        static void SetOrder(winrt::Microsoft::UI::Xaml::UIElement const& e, int32_t v);
        static double GetFlexGrow(winrt::Microsoft::UI::Xaml::UIElement const& e);
        static void SetFlexGrow(winrt::Microsoft::UI::Xaml::UIElement const& e, double v);
        static double GetFlexShrink(winrt::Microsoft::UI::Xaml::UIElement const& e);
        static void SetFlexShrink(winrt::Microsoft::UI::Xaml::UIElement const& e, double v);
        static int32_t GetAlignSelf(winrt::Microsoft::UI::Xaml::UIElement const& e);
        static void SetAlignSelf(winrt::Microsoft::UI::Xaml::UIElement const& e, int32_t v);
        static double GetFlexBasisPercent(winrt::Microsoft::UI::Xaml::UIElement const& e);
        static void SetFlexBasisPercent(winrt::Microsoft::UI::Xaml::UIElement const& e, double v);
        static bool GetWrapBefore(winrt::Microsoft::UI::Xaml::UIElement const& e);
        static void SetWrapBefore(winrt::Microsoft::UI::Xaml::UIElement const& e, bool v);

    private:
        // Lazily-registered attached DependencyProperties (one-time, thread-safe via function-local
        // statics). Not projected — internal storage + change notification only.
        static winrt::Microsoft::UI::Xaml::DependencyProperty OrderProperty();
        static winrt::Microsoft::UI::Xaml::DependencyProperty FlexGrowProperty();
        static winrt::Microsoft::UI::Xaml::DependencyProperty FlexShrinkProperty();
        static winrt::Microsoft::UI::Xaml::DependencyProperty AlignSelfProperty();
        static winrt::Microsoft::UI::Xaml::DependencyProperty FlexBasisPercentProperty();
        static winrt::Microsoft::UI::Xaml::DependencyProperty WrapBeforeProperty();

        // When a child's flex attached property changes, re-measure the owning FlexboxLayout.
        static void OnChildPropertyChanged(winrt::Microsoft::UI::Xaml::DependencyObject const& d,
                                           winrt::Microsoft::UI::Xaml::DependencyPropertyChangedEventArgs const& e);

        int32_t m_flexDirection{ 0 };  // row
        int32_t m_flexWrap{ 0 };       // nowrap
        int32_t m_justifyContent{ 0 }; // flex-start
        int32_t m_alignItems{ 4 };     // stretch
        int32_t m_alignContent{ 5 };   // stretch
        double  m_columnGap{ 0.0 };    // gap between items along the main axis (CSS column-gap)
        double  m_rowGap{ 0.0 };       // gap between flex lines along the cross axis (CSS row-gap)

        bool IsRow() const noexcept { return m_flexDirection == 0 || m_flexDirection == 1; }

        struct FlexItem
        {
            winrt::Microsoft::UI::Xaml::UIElement Element{ nullptr };
            int32_t OriginalIndex{ 0 };
            int32_t Order{ 1 };            // cached from DependencyProperty — avoids per-comparison WinRT reads
            double FlexGrow{ 0.0 };
            double FlexShrink{ 1.0 };
            double FlexBasisPercent{ -1.0 };
            int32_t AlignSelf{ -1 };
            bool WrapBefore{ false };
            double MainSize{ 0.0 };
            double CrossSize{ 0.0 };
        };

        struct FlexLine
        {
            std::vector<FlexItem> Items;
            double MainSize{ 0.0 };
            double CrossSize{ 0.0 };
        };

        // Cached between Measure and Arrange (XAML layout is single-threaded).
        std::vector<FlexLine> m_lines;
        // Reused scratch buffer for ArrangeOverride main-axis positions (avoids per-line heap allocation).
        std::vector<double> m_scratchMainPos;
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct FlexboxLayout : FlexboxLayoutT<FlexboxLayout, implementation::FlexboxLayout>
    {
    };
}
