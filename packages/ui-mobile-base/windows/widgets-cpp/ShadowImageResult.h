#pragma once
#include "ShadowImageResult.g.h"

namespace winrt::NativeScript::Widgets::implementation
{
    struct ShadowImageResult : ShadowImageResultT<ShadowImageResult>
    {
        ShadowImageResult() = default;
        ShadowImageResult(winrt::Microsoft::UI::Xaml::Controls::Image const& image,
                          double width, double height, double overhang)
            : m_image(image), m_width(width), m_height(height), m_overhang(overhang) {}

        winrt::Microsoft::UI::Xaml::Controls::Image Image() const { return m_image; }
        double Width() const { return m_width; }
        double Height() const { return m_height; }
        double Overhang() const { return m_overhang; }

    private:
        winrt::Microsoft::UI::Xaml::Controls::Image m_image{ nullptr };
        double m_width{ 0 };
        double m_height{ 0 };
        double m_overhang{ 0 };
    };
}
