#include "pch.h"
#include "PanelHelper.h"
#include "PanelHelper.g.cpp"

namespace winrt::NativeScript::Widgets::implementation
{
    int32_t PanelHelper::IndexOf(
        winrt::Microsoft::UI::Xaml::Controls::UIElementCollection const& children,
        winrt::Microsoft::UI::Xaml::UIElement const& child)
    {
        if (!children || !child) return -1;
        uint32_t index = 0;
        return children.IndexOf(child, index) ? static_cast<int32_t>(index) : -1;
    }

    bool PanelHelper::Remove(
        winrt::Microsoft::UI::Xaml::Controls::UIElementCollection const& children,
        winrt::Microsoft::UI::Xaml::UIElement const& child)
    {
        if (!children || !child) return false;
        uint32_t index = 0;
        if (!children.IndexOf(child, index)) return false;
        children.RemoveAt(index);
        return true;
    }
}
