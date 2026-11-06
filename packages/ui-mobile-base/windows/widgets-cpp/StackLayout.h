#pragma once
#include "StackLayout.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct StackLayout : StackLayoutT<StackLayout>
    {
        StackLayout() = default;

        int32_t Orientation() const noexcept { return m_orientation; }
        void Orientation(int32_t value)
        {
            if (m_orientation != value)
            {
                m_orientation = value;
                InvalidateMeasure();
            }
        }

        winrt::Windows::Foundation::Size MeasureOverride(winrt::Windows::Foundation::Size const& availableSize);
        winrt::Windows::Foundation::Size ArrangeOverride(winrt::Windows::Foundation::Size const& finalSize);

    private:
        int32_t m_orientation{ 0 }; // 0 = Vertical, 1 = Horizontal
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct StackLayout : StackLayoutT<StackLayout, implementation::StackLayout>
    {
    };
}
