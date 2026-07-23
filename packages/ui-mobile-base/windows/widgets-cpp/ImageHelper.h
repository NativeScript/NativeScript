#pragma once
#include "ImageHelper.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    // Static-class implementation: the generated projected statics + the factory both call these
    // static methods. (For a `static runtimeclass`, cppwinrt only emits a base in
    // factory_implementation, so this implementation type is a plain struct of static methods.)
    struct ImageHelper
    {
        ImageHelper() = default;

        static winrt::Windows::Foundation::IAsyncOperation<winrt::NativeScript::Widgets::ImageResult>
            LoadFromBufferAsync(winrt::Windows::Storage::Streams::IBuffer buffer);
        static winrt::Windows::Foundation::IAsyncOperation<winrt::NativeScript::Widgets::ImageResult>
            LoadFromUrlAsync(winrt::hstring url);
        static winrt::Windows::Foundation::IAsyncOperation<winrt::NativeScript::Widgets::ImageResult>
            LoadFromFileAsync(winrt::hstring path);
        static winrt::Windows::Foundation::IAsyncOperation<winrt::NativeScript::Widgets::ImageResult>
            ResizeAsync(winrt::Windows::Storage::Streams::IBuffer buffer, int32_t maxSize);
        static winrt::Windows::Foundation::IAsyncOperation<bool>
            SaveToFileAsync(winrt::Windows::Storage::Streams::IBuffer buffer, winrt::hstring path);
        static winrt::Windows::Foundation::IAsyncOperation<winrt::Windows::Storage::Streams::IBuffer>
            ReadFileAsync(winrt::hstring path);
        static winrt::hstring BufferToBase64(winrt::Windows::Storage::Streams::IBuffer buffer);
    };
}

namespace winrt::NativeScript::Widgets::factory_implementation
{
    struct ImageHelper : ImageHelperT<ImageHelper, implementation::ImageHelper>
    {
    };
}
