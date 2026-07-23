#include "pch.h"
#include "ShadowImageResult.h"
#include "ShadowHelper.h"
#include "ShadowImageResult.g.cpp"
#include "ShadowHelper.g.cpp"

#include <algorithm>
#include <cmath>
#include <vector>
#include <cstdint>

using namespace winrt;
using namespace winrt::Windows::Graphics::Imaging;
using namespace winrt::Microsoft::UI::Xaml::Controls;
using namespace winrt::Microsoft::UI::Xaml::Media;
using namespace winrt::Microsoft::UI::Xaml::Media::Imaging;

// THREADING: synchronous by design. JS calls these on the UI/V8 thread, so the SoftwareBitmap /
// SoftwareBitmapSource / Image are created inline on that thread. The blur is a small element-sized
// buffer and the result is cached by the caller, so the on-thread cost is negligible. (The C#
// version offloaded the blur with Parallel.For; here it's a plain serial loop — same output.)

namespace
{
    inline int iround(double v) { return static_cast<int>(std::lround(v)); }
    inline int iclamp(int v, int lo, int hi) { return v < lo ? lo : (v > hi ? hi : v); }

    // True when (px,py) lies inside the rounded rect [x0,y0]-[x1,y1] with corner radius r.
    bool inside_rounded_rect(float px, float py, float x0, float y0, float x1, float y1, float r)
    {
        if (px < x0 || px > x1 || py < y0 || py > y1) return false;
        if (r <= 0) return true;
        float cx = px < x0 + r ? x0 + r : (px > x1 - r ? x1 - r : px);
        float cy = py < y0 + r ? y0 + r : (py > y1 - r ? y1 - r : py);
        float dx = px - cx, dy = py - cy;
        return dx * dx + dy * dy <= r * r;
    }

    void blur_h(const std::vector<float>& src, std::vector<float>& dst, int w, int h, int radius)
    {
        const float norm = 1.0f / (radius * 2 + 1);
        for (int y = 0; y < h; y++)
        {
            const int row = y * w;
            float acc = 0;
            for (int i = -radius; i <= radius; i++) acc += src[row + iclamp(i, 0, w - 1)];
            for (int x = 0; x < w; x++)
            {
                dst[row + x] = acc * norm;
                acc += src[row + iclamp(x + radius + 1, 0, w - 1)] - src[row + iclamp(x - radius, 0, w - 1)];
            }
        }
    }

    void blur_v(const std::vector<float>& src, std::vector<float>& dst, int w, int h, int radius)
    {
        const float norm = 1.0f / (radius * 2 + 1);
        for (int x = 0; x < w; x++)
        {
            float acc = 0;
            for (int i = -radius; i <= radius; i++) acc += src[iclamp(i, 0, h - 1) * w + x];
            for (int y = 0; y < h; y++)
            {
                dst[y * w + x] = acc * norm;
                acc += src[iclamp(y + radius + 1, 0, h - 1) * w + x] - src[iclamp(y - radius, 0, h - 1) * w + x];
            }
        }
    }

    // Separable box blur, `passes` times (≈ Gaussian).
    void box_blur(std::vector<float>& buf, int w, int h, int radius, int passes)
    {
        if (radius < 1) return;
        std::vector<float> tmp(buf.size());
        for (int p = 0; p < passes; p++)
        {
            blur_h(buf, tmp, w, h, radius);
            blur_v(tmp, buf, w, h, radius);
        }
    }

    // Wrap a premultiplied-BGRA8 buffer in a SoftwareBitmap → SoftwareBitmapSource → Image.
    Image make_image(const std::vector<uint8_t>& bgra, int w, int h)
    {
        auto buffer = winrt::Windows::Security::Cryptography::CryptographicBuffer::CreateFromByteArray(
            winrt::array_view<uint8_t const>(bgra.data(), bgra.data() + bgra.size()));
        auto sb = SoftwareBitmap::CreateCopyFromBuffer(buffer, BitmapPixelFormat::Bgra8, w, h, BitmapAlphaMode::Premultiplied);

        SoftwareBitmapSource source;
        Image img;
        img.Source(source);
        img.Width(static_cast<double>(w));
        img.Height(static_cast<double>(h));
        img.Stretch(Stretch::Fill);
        img.IsHitTestVisible(false);
        source.SetBitmapAsync(sb); // fire-and-forget; Image repaints when the bitmap is ready
        return img;
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    winrt::NativeScript::Widgets::ShadowImageResult ShadowHelper::CreateShadow(
        double width, double height, double blurRadius, double spread, double cornerRadius,
        double offsetX, double offsetY, uint32_t argb)
    {
        const int sw = (std::max)(1, iround(width + spread * 2));
        const int sh = (std::max)(1, iround(height + spread * 2));

        const int boxRadius = (std::max)(1, iround(blurRadius * 0.5));
        const int passes = 3;
        const int overhang = boxRadius * passes + 1;

        const int ox = iround(offsetX);
        const int oy = iround(offsetY);
        const int bw = sw + (overhang + std::abs(ox)) * 2;
        const int bh = sh + (overhang + std::abs(oy)) * 2;

        const float radius = static_cast<float>((std::max)(0.0, cornerRadius + spread));

        const uint8_t a = static_cast<uint8_t>((argb >> 24) & 0xFF);
        const uint8_t r = static_cast<uint8_t>((argb >> 16) & 0xFF);
        const uint8_t g = static_cast<uint8_t>((argb >> 8) & 0xFF);
        const uint8_t b = static_cast<uint8_t>(argb & 0xFF);

        const int n = bw * bh;
        std::vector<float> cov(n, 0.0f);
        const float x0 = (bw - sw) / 2.0f + ox, y0 = (bh - sh) / 2.0f + oy, x1 = x0 + sw, y1 = y0 + sh;
        const float rr = (std::min)(radius, (std::min)(sw / 2.0f, sh / 2.0f));

        for (int y = 0; y < bh; y++)
        {
            const int row = y * bw;
            for (int x = 0; x < bw; x++)
                cov[row + x] = inside_rounded_rect(x + 0.5f, y + 0.5f, x0, y0, x1, y1, rr) ? 1.0f : 0.0f;
        }

        box_blur(cov, bw, bh, boxRadius, passes);

        std::vector<uint8_t> bgra(static_cast<size_t>(n) * 4);
        const float ca = a / 255.0f;
        for (int i = 0; i < n; i++)
        {
            float alpha = cov[i] * ca;
            alpha = alpha < 0.0f ? 0.0f : (alpha > 1.0f ? 1.0f : alpha);
            const int o = i * 4;
            bgra[o + 0] = static_cast<uint8_t>(b * alpha);
            bgra[o + 1] = static_cast<uint8_t>(g * alpha);
            bgra[o + 2] = static_cast<uint8_t>(r * alpha);
            bgra[o + 3] = static_cast<uint8_t>(alpha * 255.0f);
        }

        auto img = make_image(bgra, bw, bh);
        return winrt::make<ShadowImageResult>(img, static_cast<double>(bw), static_cast<double>(bh), static_cast<double>(overhang));
    }

    winrt::NativeScript::Widgets::ShadowImageResult ShadowHelper::CreateBorder(
        double width, double height,
        double topW, double rightW, double bottomW, double leftW,
        uint32_t topArgb, uint32_t rightArgb, uint32_t bottomArgb, uint32_t leftArgb,
        double cornerRadius)
    {
        const int w = (std::max)(1, iround(width));
        const int h = (std::max)(1, iround(height));
        const float tW = static_cast<float>((std::max)(0.0, topW));
        const float rW = static_cast<float>((std::max)(0.0, rightW));
        const float bW = static_cast<float>((std::max)(0.0, bottomW));
        const float lW = static_cast<float>((std::max)(0.0, leftW));
        const float r = static_cast<float>((std::max)(0.0, cornerRadius));
        const float innerR = (std::max)(0.0f, r - (std::max)((std::max)(tW, bW), (std::max)(lW, rW)));

        const int n = w * h;
        std::vector<uint8_t> bgra(static_cast<size_t>(n) * 4, 0);

        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                const float px = x + 0.5f, py = y + 0.5f;
                const bool insideOuter = inside_rounded_rect(px, py, 0, 0, static_cast<float>(w), static_cast<float>(h), r);
                const bool insideInner = inside_rounded_rect(px, py, lW, tW, w - rW, h - bW, innerR);
                if (!insideOuter || insideInner) continue; // transparent (centre + outside)

                // Nearest edge → 45° mitred corners (matches CSS for uniform widths).
                const float dT = py, dB = h - py, dL = px, dR = w - px;
                uint32_t c;
                if (dT <= dB && dT <= dL && dT <= dR) c = topArgb;
                else if (dB <= dL && dB <= dR) c = bottomArgb;
                else if (dL <= dR) c = leftArgb;
                else c = rightArgb;

                const uint8_t a = static_cast<uint8_t>((c >> 24) & 0xFF);
                const uint8_t rr = static_cast<uint8_t>((c >> 16) & 0xFF);
                const uint8_t gg = static_cast<uint8_t>((c >> 8) & 0xFF);
                const uint8_t bb = static_cast<uint8_t>(c & 0xFF);
                const float af = a / 255.0f;
                const int o = (y * w + x) * 4;
                bgra[o + 0] = static_cast<uint8_t>(bb * af);
                bgra[o + 1] = static_cast<uint8_t>(gg * af);
                bgra[o + 2] = static_cast<uint8_t>(rr * af);
                bgra[o + 3] = a;
            }
        }

        auto img = make_image(bgra, w, h);
        return winrt::make<ShadowImageResult>(img, static_cast<double>(w), static_cast<double>(h), 0.0);
    }
}
