#include "pch.h"
// Direct2D for polygon clip geometry — included here (not in pch.h) to avoid
// combaseapi.h redeclaring DllCanUnloadNow as HRESULT in exports.cpp.
#include <d2d1.h>
#pragma comment(lib, "d2d1.lib")
#include <winrt/Windows.Graphics.h>
// ABI::Windows::Graphics::IGeometrySource2DInterop — the bridge CompositionPath uses to pull an
// ID2D1Geometry out of a WinRT IGeometrySource2D.
#include <windows.graphics.interop.h>
#include "ClipHelper.h"
#include "ClipHelper.g.cpp"

namespace
{
    // Raw D2D geometry objects are plain COM and do NOT implement the WinRT IGeometrySource2D
    // interface (QI fails with E_NOINTERFACE). This wrapper is the documented no-Win2D pattern:
    // implement IGeometrySource2D + IGeometrySource2DInterop and hand the D2D geometry to the
    // compositor through GetGeometry.
    struct GeoSource : winrt::implements<GeoSource,
        winrt::Windows::Graphics::IGeometrySource2D,
        ABI::Windows::Graphics::IGeometrySource2DInterop>
    {
        explicit GeoSource(winrt::com_ptr<ID2D1Geometry> geo) : m_geo(std::move(geo)) {}

        IFACEMETHODIMP GetGeometry(ID2D1Geometry** value) noexcept override
        {
            m_geo.copy_to(value);
            return S_OK;
        }

        IFACEMETHODIMP TryGetGeometryUsingFactory(ID2D1Factory*, ID2D1Geometry** value) noexcept override
        {
            *value = nullptr;
            return E_NOTIMPL;
        }

    private:
        winrt::com_ptr<ID2D1Geometry> m_geo;
    };
}

namespace winrt::NativeScript::Widgets::implementation
{
    void ClipHelper::ApplyRoundedRectClip(
        winrt::Microsoft::UI::Xaml::UIElement const& element,
        double offsetX, double offsetY,
        double width, double height,
        double cornerRadiusX, double cornerRadiusY)
    {
        if (!element) return;
        auto visual = winrt::Microsoft::UI::Xaml::Hosting::ElementCompositionPreview::GetElementVisual(element);
        if (!visual) return;

        auto compositor = visual.Compositor();
        auto geometry = compositor.CreateRoundedRectangleGeometry();
        geometry.Offset({ static_cast<float>(offsetX), static_cast<float>(offsetY) });
        geometry.Size({ static_cast<float>(width), static_cast<float>(height) });
        geometry.CornerRadius({ static_cast<float>(cornerRadiusX), static_cast<float>(cornerRadiusY) });

        auto clip = compositor.CreateGeometricClip(geometry);
        visual.Clip(clip);
    }

    // Parse a single CSS dimension token against a reference total (in DIPs).
    // "50%" → fraction of total; "10px" → px / density; "10" → raw DIP.
    static float ParseClipDim(std::wstring_view token, float total, float density) noexcept
    {
        if (token.empty()) return 0.0f;
        try {
            if (token.back() == L'%') {
                return (std::stof(std::wstring(token.substr(0, token.size() - 1))) / 100.0f) * total;
            }
            if (token.size() >= 2 && token[token.size() - 2] == L'p' && token.back() == L'x') {
                return std::stof(std::wstring(token.substr(0, token.size() - 2))) / density;
            }
            return std::stof(std::wstring(token));
        }
        catch (...) { return 0.0f; }
    }

    // Parse "x0 y0, x1 y1, x2 y2, ..." into D2D1_POINT_2F pairs.
    static std::vector<D2D1_POINT_2F> ParsePolygonRule(
        winrt::hstring const& rule, float w, float h, float density) noexcept
    {
        std::vector<D2D1_POINT_2F> pts;
        try {
            std::wstringstream ss(std::wstring(rule.c_str()));
            std::wstring pair;
            while (std::getline(ss, pair, L',')) {
                // Trim leading/trailing whitespace from each "x y" pair.
                auto l = pair.find_first_not_of(L" \t\r\n");
                if (l == std::wstring::npos) continue;
                auto r = pair.find_last_not_of(L" \t\r\n");
                pair = pair.substr(l, r - l + 1);

                std::wstringstream pss(pair);
                std::wstring xStr, yStr;
                if (!(pss >> xStr >> yStr)) continue;

                pts.push_back({
                    ParseClipDim(xStr, w, density),
                    ParseClipDim(yStr, h, density)
                });
            }
        }
        catch (...) {}
        return pts;
    }

    void ClipHelper::ApplyPolygonClip(
        winrt::Microsoft::UI::Xaml::UIElement const& element,
        double elementWidth, double elementHeight,
        winrt::hstring const& rule, double density)
    {
        if (!element) return;
        auto visual = winrt::Microsoft::UI::Xaml::Hosting::ElementCompositionPreview::GetElementVisual(element);
        if (!visual) return;

        auto pts = ParsePolygonRule(rule,
            static_cast<float>(elementWidth),
            static_cast<float>(elementHeight),
            static_cast<float>(density));

        if (pts.size() < 3) {
            visual.Clip(nullptr);
            return;
        }

        // Build a Direct2D path geometry. Multi-threaded factory: the compositor may pull the
        // geometry (via IGeometrySource2DInterop::GetGeometry) from its own thread.
        winrt::com_ptr<ID2D1Factory> factory;
        if (FAILED(D2D1CreateFactory(D2D1_FACTORY_TYPE_MULTI_THREADED, factory.put()))) return;

        winrt::com_ptr<ID2D1PathGeometry> path;
        if (FAILED(factory->CreatePathGeometry(path.put()))) return;

        winrt::com_ptr<ID2D1GeometrySink> sink;
        if (FAILED(path->Open(sink.put()))) return;
        sink->BeginFigure(pts[0], D2D1_FIGURE_BEGIN_FILLED);
        for (size_t i = 1; i < pts.size(); i++) {
            sink->AddLine(pts[i]);
        }
        sink->EndFigure(D2D1_FIGURE_END_CLOSED);
        if (FAILED(sink->Close())) return;

        // Wrap the D2D geometry in the WinRT interop shim and hand it to CompositionPath.
        auto geoSrc = winrt::make<GeoSource>(path.as<ID2D1Geometry>());
        auto compositor = visual.Compositor();
        auto compPath = winrt::Microsoft::UI::Composition::CompositionPath(geoSrc);
        auto geometry = compositor.CreatePathGeometry(compPath);
        auto clip = compositor.CreateGeometricClip(geometry);
        visual.Clip(clip);
    }

    void ClipHelper::ClearClip(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        if (!element) return;
        auto visual = winrt::Microsoft::UI::Xaml::Hosting::ElementCompositionPreview::GetElementVisual(element);
        if (!visual) return;
        visual.Clip(nullptr);
    }
}
