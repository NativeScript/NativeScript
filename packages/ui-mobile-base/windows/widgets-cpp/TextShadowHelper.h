#pragma once
#include "TextShadowHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    // Static-class implementation (same `static runtimeclass` codegen pattern as ShadowHelper):
    // the implementation struct is plain; the *T template lives only in factory_implementation.
    struct TextShadowHelper
    {
        TextShadowHelper() = default;

        static void Apply(winrt::Microsoft::UI::Xaml::UIElement const& element, uint32_t argb, float blurRadius, float offsetX, float offsetY);
        static void Clear(winrt::Microsoft::UI::Xaml::UIElement const& element);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct TextShadowHelper : TextShadowHelperT<TextShadowHelper, implementation::TextShadowHelper>
    {
    };
}
