#pragma once
#include "TileHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct TileHelper
    {
        TileHelper() = default;

        static winrt::Windows::Foundation::IAsyncOperation<winrt::Windows::Storage::Streams::IBuffer> CreateTiledImageAsync(
            winrt::Windows::Storage::Streams::IBuffer source,
            int32_t targetWidth,
            int32_t targetHeight,
            bool repeatX,
            bool repeatY);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct TileHelper : TileHelperT<TileHelper, implementation::TileHelper>
    {
    };
}
