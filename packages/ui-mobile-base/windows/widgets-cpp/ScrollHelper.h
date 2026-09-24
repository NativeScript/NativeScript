#pragma once
#include "ScrollHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct ScrollHelper
    {
        ScrollHelper() = default;

        static bool ScrollToVerticalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element, double offset, bool disableAnimation);
        static bool ScrollToHorizontalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element, double offset, bool disableAnimation);
        static double GetVerticalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element);
        static double GetHorizontalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element);
        static double GetExtentHeight(winrt::Microsoft::UI::Xaml::UIElement const& element);
        static double GetExtentWidth(winrt::Microsoft::UI::Xaml::UIElement const& element);
        static double GetViewportHeight(winrt::Microsoft::UI::Xaml::UIElement const& element);
        static double GetViewportWidth(winrt::Microsoft::UI::Xaml::UIElement const& element);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct ScrollHelper : ScrollHelperT<ScrollHelper, implementation::ScrollHelper>
    {
    };
}
