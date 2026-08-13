#include "pch.h"
// Direct3D11 + Direct2D + DirectWrite for GPU glyph rasterization onto a Composition surface.
// Included here (not pch.h) to avoid combaseapi.h redeclaring DllCanUnloadNow as HRESULT in
// exports.cpp (same reason as ClipHelper).
#include <d3d11.h>
#include <dxgi.h>
#include <dwrite.h>
#include <dwrite_3.h> // IDWriteTextFormat3 + DWRITE_AUTOMATIC_FONT_AXES (variable-font optical sizing)
#include <string>
#include <algorithm>
// <winuser.h> (pulled in by d3d11.h) #defines DrawText → DrawTextW. Undefine it BEFORE d2d1 is
// parsed so ID2D1RenderTarget::DrawText keeps its real method name (and again below for the call
// site) — otherwise the call rewrites to a nonexistent ID2D1DeviceContext::DrawTextW.
#undef DrawText
#include <d2d1_1.h>
#include <d2d1helper.h>
#pragma comment(lib, "d3d11.lib")
#pragma comment(lib, "d2d1.lib")
#pragma comment(lib, "dwrite.lib")
#include "TextShadowHelper.h"
#include "TextShadowHelper.g.cpp"
#undef DrawText

// Composition interop interfaces, declared by hand. The SDK's Microsoft.UI.Composition.Interop.h
// can't be used here — it includes the MIDL ABI header Microsoft.ui.composition.h, which this
// C++/WinRT (projection-only) project doesn't generate. The IIDs + full vtable order match the SDK
// header exactly (only the methods we call are bodied; the rest reserve their vtable slots).
struct __declspec(uuid("FAB19398-6D19-4D8A-B752-8F096C396069")) ICompositorInterop : ::IUnknown
{
    virtual HRESULT __stdcall CreateGraphicsDevice(::IUnknown* renderingDevice, ::IUnknown** result) = 0;
};
struct __declspec(uuid("2D6355C2-AD57-4EAE-92E4-4C3EFF65D578")) ICompositionDrawingSurfaceInterop : ::IUnknown
{
    virtual HRESULT __stdcall BeginDraw(const RECT* updateRect, REFIID iid, void** updateObject, POINT* updateOffset) = 0;
    virtual HRESULT __stdcall EndDraw() = 0;
    virtual HRESULT __stdcall Resize(SIZE sizePixels) = 0;
    virtual HRESULT __stdcall Scroll(const RECT* scrollRect, const RECT* clipRect, int offsetX, int offsetY) = 0;
    virtual HRESULT __stdcall ResumeDraw() = 0;
    virtual HRESULT __stdcall SuspendDraw() = 0;
};

using namespace winrt;
namespace MUC = winrt::Microsoft::UI::Composition;
namespace MUX = winrt::Microsoft::UI::Xaml;
namespace MUXC = winrt::Microsoft::UI::Xaml::Controls;
// CompositionGraphicsDevice.CreateDrawingSurface takes Microsoft.Graphics.DirectX enums (NOT the
// Windows.Graphics.DirectX ones); available transitively via Microsoft.UI.Composition.h (pch).
namespace WGDX = winrt::Microsoft::Graphics::DirectX;

namespace
{
    winrt::Windows::UI::Color ColorFromArgb(uint32_t argb)
    {
        return winrt::Windows::UI::Color{
            static_cast<uint8_t>((argb >> 24) & 0xFF),
            static_cast<uint8_t>((argb >> 16) & 0xFF),
            static_cast<uint8_t>((argb >> 8) & 0xFF),
            static_cast<uint8_t>(argb & 0xFF) };
    }

    // Process-wide (single UI thread) cache of the D3D/D2D device + Composition graphics device +
    // DirectWrite factory. Created once on first use so each text-shadow rebuild is a cheap GPU draw
    // (no per-call device creation, no PNG encode/decode) — fast enough to redraw on every keystroke.
    struct GfxCache
    {
        com_ptr<ID3D11Device> d3d;
        com_ptr<ID2D1Device> d2dDevice;
        com_ptr<IDWriteFactory> dwrite;
        com_ptr<IDWriteFontCollection> systemCollection;       // legacy GDI-family-model system fonts
        com_ptr<IDWriteFontCollection> typographicCollection;  // typographic-family-model (DWrite 3+); may be null
        MUC::CompositionGraphicsDevice graphicsDevice{ nullptr };
        MUC::Compositor compositor{ nullptr };
    };

    GfxCache& Cache()
    {
        static GfxCache c;
        return c;
    }

    bool EnsureDevice(MUC::Compositor const& compositor)
    {
        auto& c = Cache();
        if (c.graphicsDevice && c.compositor == compositor) return true;

        com_ptr<ID3D11Device> d3d;
        D3D_FEATURE_LEVEL fl{};
        HRESULT hr = D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr,
            D3D11_CREATE_DEVICE_BGRA_SUPPORT, nullptr, 0, D3D11_SDK_VERSION, d3d.put(), &fl, nullptr);
        if (FAILED(hr))
        {
            hr = D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_WARP, nullptr,
                D3D11_CREATE_DEVICE_BGRA_SUPPORT, nullptr, 0, D3D11_SDK_VERSION, d3d.put(), &fl, nullptr);
        }
        if (FAILED(hr)) return false;

        auto dxgi = d3d.try_as<IDXGIDevice>();
        if (!dxgi) return false;

        com_ptr<ID2D1Factory1> d2dFactory;
        D2D1_FACTORY_OPTIONS fo{};
        if (FAILED(D2D1CreateFactory(D2D1_FACTORY_TYPE_SINGLE_THREADED, __uuidof(ID2D1Factory1), &fo, d2dFactory.put_void()))) return false;
        com_ptr<ID2D1Device> d2dDevice;
        if (FAILED(d2dFactory->CreateDevice(dxgi.get(), d2dDevice.put()))) return false;

        com_ptr<IDWriteFactory> dwrite;
        if (FAILED(DWriteCreateFactory(DWRITE_FACTORY_TYPE_SHARED, __uuidof(IDWriteFactory), reinterpret_cast<::IUnknown**>(dwrite.put())))) return false;

        // Legacy (GDI-family) system collection + the typographic-family collection (DWrite 3+). Used to
        // resolve a font name against the right family model — see BuildTextBoxGlyphMask.
        com_ptr<IDWriteFontCollection> systemCollection;
        dwrite->GetSystemFontCollection(systemCollection.put(), FALSE);
        com_ptr<IDWriteFontCollection> typographicCollection;
        if (auto factory6 = dwrite.try_as<IDWriteFactory6>())
        {
            com_ptr<IDWriteFontCollection2> typo2;
            if (SUCCEEDED(factory6->GetSystemFontCollection(FALSE, DWRITE_FONT_FAMILY_MODEL_TYPOGRAPHIC, typo2.put())))
            {
                typographicCollection = typo2.try_as<IDWriteFontCollection>();
            }
        }

        auto interop = compositor.as<ICompositorInterop>();
        com_ptr<::IUnknown> gdUnknown;
        if (FAILED(interop->CreateGraphicsDevice(d2dDevice.get(), gdUnknown.put()))) return false;
        auto graphicsDevice = gdUnknown.as<MUC::CompositionGraphicsDevice>();

        c.d3d = d3d;
        c.d2dDevice = d2dDevice;
        c.dwrite = dwrite;
        c.systemCollection = systemCollection;
        c.typographicCollection = typographicCollection;
        c.graphicsDevice = graphicsDevice;
        c.compositor = compositor;
        return true;
    }

    // Rasterize a TextBox's glyphs (white on transparent) straight onto a GPU CompositionDrawingSurface
    // via D2D, and wrap it as a CompositionSurfaceBrush. Its alpha channel is the glyph coverage — what
    // DropShadow.Mask wants. No PNG/encode/decode, so it can be redrawn cheaply (e.g. on every
    // keystroke) for realtime text shadows. (TextBlock uses the live GetAlphaMask() instead.)
    MUC::CompositionBrush BuildTextBoxGlyphMask(MUC::Compositor const& compositor, MUXC::TextBox const& box)
    {
        const double wd = box.ActualWidth();
        const double hd = box.ActualHeight();
        if (wd < 1.0 || hd < 1.0) return nullptr;

        auto htext = box.Text();
        if (htext.empty()) return nullptr;
        if (!EnsureDevice(compositor)) return nullptr;
        auto& c = Cache();

        const int pw = static_cast<int>(std::ceil(wd));
        const int ph = static_cast<int>(std::ceil(hd));

        // Font family — first family if the Source lists several.
        std::wstring family = L"Segoe UI";
        if (auto ff = box.FontFamily())
        {
            std::wstring src{ ff.Source() };
            auto comma = src.find(L',');
            if (comma != std::wstring::npos) src.resize(comma);
            while (!src.empty() && (src.front() == L' ' || src.front() == L'\'' || src.front() == L'"')) src.erase(src.begin());
            while (!src.empty() && (src.back() == L' ' || src.back() == L'\'' || src.back() == L'"')) src.pop_back();
            if (!src.empty()) family = src;
        }

        const float fontSize = static_cast<float>(box.FontSize() > 0 ? box.FontSize() : 14.0);

        const auto weight = static_cast<DWRITE_FONT_WEIGHT>(box.FontWeight().Weight);
        const auto style = static_cast<DWRITE_FONT_STYLE>(static_cast<int>(box.FontStyle()));
        const auto pad = box.Padding();

        DWRITE_TEXT_ALIGNMENT align = DWRITE_TEXT_ALIGNMENT_LEADING;
        switch (box.TextAlignment())
        {
            case MUX::TextAlignment::Center: align = DWRITE_TEXT_ALIGNMENT_CENTER; break;
            case MUX::TextAlignment::Right:  align = DWRITE_TEXT_ALIGNMENT_TRAILING; break;
            case MUX::TextAlignment::Justify: align = DWRITE_TEXT_ALIGNMENT_JUSTIFIED; break;
            default: break;
        }
        const bool wrap = box.TextWrapping() != MUX::TextWrapping::NoWrap;
        const auto border = box.BorderThickness();

        // Resolve the font name against the right family model. Prefer the legacy GDI collection (most
        // fontFamily strings are GDI names — "Arial Black", "Segoe UI Variable Text", …); fall back to
        // the typographic collection only when the name isn't a GDI family. That's where typographic-only
        // names like "Segoe UI Variable" live, so this resolves ANY variable font (combined with the
        // optical-size axis below). Bundled ms-appx fonts remain a gap — the system factory can't see them.
        IDWriteFontCollection* collection = nullptr; // null → legacy system collection
        {
            BOOL exists = FALSE; UINT32 famIdx = 0;
            if (c.systemCollection) c.systemCollection->FindFamilyName(family.c_str(), &famIdx, &exists);
            if (!exists && c.typographicCollection)
            {
                BOOL typoExists = FALSE;
                c.typographicCollection->FindFamilyName(family.c_str(), &famIdx, &typoExists);
                if (typoExists) collection = c.typographicCollection.get();
            }
        }

        com_ptr<IDWriteTextFormat> fmt;
        if (FAILED(c.dwrite->CreateTextFormat(family.c_str(), collection, weight, style, DWRITE_FONT_STRETCH_NORMAL, fontSize, L"", fmt.put()))) return nullptr;
        fmt->SetTextAlignment(align);
        fmt->SetWordWrapping(wrap ? DWRITE_WORD_WRAPPING_WRAP : DWRITE_WORD_WRAPPING_NO_WRAP);
        // Apply the optical-size axis from the font size (as XAML does) so a variable font's glyph
        // advances match the control's text. No-op on static fonts / pre-IDWriteTextFormat3.
        if (auto fmt3 = fmt.try_as<IDWriteTextFormat3>())
        {
            fmt3->SetAutomaticFontAxes(DWRITE_AUTOMATIC_FONT_AXES_OPTICAL_SIZE);
        }

        auto drawingSurface = c.graphicsDevice.CreateDrawingSurface(
            winrt::Windows::Foundation::Size{ static_cast<float>(pw), static_cast<float>(ph) },
            WGDX::DirectXPixelFormat::B8G8R8A8UIntNormalized,
            WGDX::DirectXAlphaMode::Premultiplied);

        auto surfaceInterop = drawingSurface.as<ICompositionDrawingSurfaceInterop>();
        POINT offset{};
        com_ptr<ID2D1DeviceContext> dc;
        if (FAILED(surfaceInterop->BeginDraw(nullptr, __uuidof(ID2D1DeviceContext), dc.put_void(), &offset))) return nullptr;
        // The atlas offset returned by BeginDraw is applied via the transform so we can draw in
        // element-local coordinates (0,0)-(pw,ph).
        dc->SetTransform(D2D1::Matrix3x2F::Translation(static_cast<float>(offset.x), static_cast<float>(offset.y)));
        dc->Clear(D2D1::ColorF(0, 0, 0, 0));
        dc->SetTextAntialiasMode(D2D1_TEXT_ANTIALIAS_MODE_GRAYSCALE);
        com_ptr<ID2D1SolidColorBrush> white;
        dc->CreateSolidColorBrush(D2D1::ColorF(1.0f, 1.0f, 1.0f, 1.0f), white.put());
        // Inset by border + padding so the mask aligns with the TextBox's text origin.
        D2D1_RECT_F layoutRect = D2D1::RectF(
            static_cast<float>(pad.Left + border.Left), static_cast<float>(pad.Top + border.Top),
            static_cast<float>(pw - pad.Right - border.Right), static_cast<float>(ph - pad.Bottom - border.Bottom));
        dc->DrawText(htext.c_str(), static_cast<UINT32>(htext.size()), fmt.get(), layoutRect, white.get(),
            D2D1_DRAW_TEXT_OPTIONS_NONE, DWRITE_MEASURING_MODE_NATURAL);
        surfaceInterop->EndDraw();

        return compositor.CreateSurfaceBrush(drawingSurface);
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    void TextShadowHelper::Apply(MUX::UIElement const& element, uint32_t argb, float blurRadius, float offsetX, float offsetY)
    {
        if (!element) return;
        try
        {
            auto visual = MUX::Hosting::ElementCompositionPreview::GetElementVisual(element);
            auto compositor = visual.Compositor();
            MUX::Hosting::ElementCompositionPreview::SetElementChildVisual(element, nullptr);
            if (((argb >> 24) & 0xFF) == 0) return; // fully transparent → just clear

            MUC::CompositionBrush mask{ nullptr };
            if (auto tb = element.try_as<MUXC::TextBlock>())
            {
                mask = tb.GetAlphaMask(); // live brush — tracks the TextBlock's text automatically
            }
            else if (auto box = element.try_as<MUXC::TextBox>())
            {
                mask = BuildTextBoxGlyphMask(compositor, box);
            }
            if (!mask) return;

            auto sprite = compositor.CreateSpriteVisual();
            sprite.RelativeSizeAdjustment(winrt::Windows::Foundation::Numerics::float2{ 1.0f, 1.0f });
            auto drop = compositor.CreateDropShadow();
            drop.Mask(mask);
            drop.Color(ColorFromArgb(argb));
            drop.BlurRadius(blurRadius);
            drop.Offset(winrt::Windows::Foundation::Numerics::float3{ offsetX, offsetY, 0.0f });
            sprite.Shadow(drop);
            MUX::Hosting::ElementCompositionPreview::SetElementChildVisual(element, sprite);
        }
        catch (...) {}
    }

    void TextShadowHelper::Clear(MUX::UIElement const& element)
    {
        if (!element) return;
        try
        {
            MUX::Hosting::ElementCompositionPreview::SetElementChildVisual(element, nullptr);
        }
        catch (...) {}
    }
}
