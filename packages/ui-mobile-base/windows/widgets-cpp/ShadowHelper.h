#pragma once
#include "ShadowHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    // Static-class implementation (see ImageHelper.h for the `static runtimeclass` codegen pattern).
    struct ShadowHelper
    {
        ShadowHelper() = default;

        static winrt::NativeScript::Widgets::ShadowImageResult CreateShadow(
            double width, double height, double blurRadius, double spread, double cornerRadius,
            double offsetX, double offsetY, uint32_t argb);

        static winrt::NativeScript::Widgets::ShadowImageResult CreateBorder(
            double width, double height,
            double topW, double rightW, double bottomW, double leftW,
            uint32_t topArgb, uint32_t rightArgb, uint32_t bottomArgb, uint32_t leftArgb,
            double cornerRadius);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct ShadowHelper : ShadowHelperT<ShadowHelper, implementation::ShadowHelper>
    {
    };
}
