#pragma once
#include "ImageResult.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct ImageResult : ImageResultT<ImageResult>
    {
        ImageResult() = default;
        ImageResult(winrt::Microsoft::UI::Xaml::Media::Imaging::BitmapImage const& bitmap,
                    winrt::Windows::Storage::Streams::IBuffer const& rawBuffer,
                    int32_t width, int32_t height)
            : m_bitmap(bitmap), m_rawBuffer(rawBuffer), m_width(width), m_height(height) {}

        winrt::Microsoft::UI::Xaml::Media::Imaging::BitmapImage Bitmap() const { return m_bitmap; }
        winrt::Windows::Storage::Streams::IBuffer RawBuffer() const { return m_rawBuffer; }
        int32_t Width() const { return m_width; }
        int32_t Height() const { return m_height; }

    private:
        winrt::Microsoft::UI::Xaml::Media::Imaging::BitmapImage m_bitmap{ nullptr };
        winrt::Windows::Storage::Streams::IBuffer m_rawBuffer{ nullptr };
        int32_t m_width{ 0 };
        int32_t m_height{ 0 };
    };
}
