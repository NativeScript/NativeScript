#pragma once
#include "ClipHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct ClipHelper
    {
        ClipHelper() = default;

        static void ApplyRoundedRectClip(
            winrt::Microsoft::UI::Xaml::UIElement const& element,
            double offsetX, double offsetY,
            double width, double height,
            double cornerRadiusX, double cornerRadiusY);

        static void ApplyPolygonClip(
            winrt::Microsoft::UI::Xaml::UIElement const& element,
            double elementWidth, double elementHeight,
            winrt::hstring const& rule, double density);

        static void ClearClip(winrt::Microsoft::UI::Xaml::UIElement const& element);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct ClipHelper : ClipHelperT<ClipHelper, implementation::ClipHelper>
    {
    };
}
