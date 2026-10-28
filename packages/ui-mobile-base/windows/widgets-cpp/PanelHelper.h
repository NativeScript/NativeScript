#pragma once
#include "PanelHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct PanelHelper
    {
        PanelHelper() = default;

        static int32_t IndexOf(
            winrt::Microsoft::UI::Xaml::Controls::UIElementCollection const& children,
            winrt::Microsoft::UI::Xaml::UIElement const& child);

        static bool Remove(
            winrt::Microsoft::UI::Xaml::Controls::UIElementCollection const& children,
            winrt::Microsoft::UI::Xaml::UIElement const& child);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct PanelHelper : PanelHelperT<PanelHelper, implementation::PanelHelper>
    {
    };
}
