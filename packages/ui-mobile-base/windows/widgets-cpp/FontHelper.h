#pragma once
#include "FontHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct FontHelper
    {
        FontHelper() = default;

        static winrt::hstring ScanFontsDirectory(winrt::hstring const& folderPath);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct FontHelper : FontHelperT<FontHelper, implementation::FontHelper>
    {
    };
}
