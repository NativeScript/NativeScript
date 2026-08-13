#include "pch.h"
// IBufferByteAccess (raw byte pointer into an IBuffer) — included here, not in pch.h.
#include <robuffer.h>
#include <cstring>
#include "TileHelper.h"
#include "TileHelper.g.cpp"

using namespace winrt;
using namespace winrt::Windows::Foundation;
using namespace winrt::Windows::Storage::Streams;
using namespace winrt::Windows::Graphics::Imaging;

namespace
{
    // Raw pointer into an IBuffer's backing store (length() bytes valid).
    uint8_t* BufferData(IBuffer const& buf)
    {
        uint8_t* data = nullptr;
        auto access = buf.as<::Windows::Storage::Streams::IBufferByteAccess>();
        winrt::check_hresult(access->Buffer(&data));
        return data;
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    IAsyncOperation<IBuffer> TileHelper::CreateTiledImageAsync(IBuffer source, int32_t targetWidth, int32_t targetHeight, bool repeatX, bool repeatY)
    {
        if (targetWidth <= 0 || targetHeight <= 0 || !source) {
            co_return nullptr;
        }
        // Cap to a sane maximum so a giant element can't request a multi-hundred-MB bitmap.
        const int32_t maxDim = 8192;
        if (targetWidth > maxDim) targetWidth = maxDim;
        if (targetHeight > maxDim) targetHeight = maxDim;

        InMemoryRandomAccessStream inStream;
        co_await inStream.WriteAsync(source);
        inStream.Seek(0);

        auto decoder = co_await BitmapDecoder::CreateAsync(inStream);
        auto src = co_await decoder.GetSoftwareBitmapAsync(BitmapPixelFormat::Bgra8, BitmapAlphaMode::Premultiplied);
        const int tw = static_cast<int>(src.PixelWidth());
        const int th = static_cast<int>(src.PixelHeight());
        if (tw <= 0 || th <= 0) {
            co_return nullptr;
        }

        // Pull the source pixels into a contiguous BGRA8 buffer.
        const uint32_t srcLen = static_cast<uint32_t>(tw) * static_cast<uint32_t>(th) * 4u;
        Buffer srcBuf{ srcLen };
        srcBuf.Length(srcLen);
        src.CopyToBuffer(srcBuf);
        const uint8_t* sp = BufferData(srcBuf);

        // Compose the tiled target. For a non-repeating axis the image appears once (offset 0) and
        // the rest stays transparent — this is exactly CSS repeat-x / repeat-y / no-repeat.
        const uint32_t dstLen = static_cast<uint32_t>(targetWidth) * static_cast<uint32_t>(targetHeight) * 4u;
        Buffer dstBuf{ dstLen };
        dstBuf.Length(dstLen);
        uint8_t* dp = BufferData(dstBuf);

        for (int y = 0; y < targetHeight; y++) {
            const int sy = repeatY ? (y % th) : y;
            const bool yIn = sy < th;
            uint8_t* row = dp + static_cast<size_t>(y) * targetWidth * 4;
            if (!yIn) {
                std::memset(row, 0, static_cast<size_t>(targetWidth) * 4);
                continue;
            }
            const uint8_t* srcRow = sp + static_cast<size_t>(sy) * tw * 4;
            for (int x = 0; x < targetWidth; x++) {
                const int sx = repeatX ? (x % tw) : x;
                uint8_t* d = row + static_cast<size_t>(x) * 4;
                if (sx < tw) {
                    const uint8_t* s = srcRow + static_cast<size_t>(sx) * 4;
                    d[0] = s[0]; d[1] = s[1]; d[2] = s[2]; d[3] = s[3];
                } else {
                    d[0] = 0; d[1] = 0; d[2] = 0; d[3] = 0;
                }
            }
        }

        SoftwareBitmap target{ BitmapPixelFormat::Bgra8, targetWidth, targetHeight, BitmapAlphaMode::Premultiplied };
        target.CopyFromBuffer(dstBuf);

        InMemoryRandomAccessStream outStream;
        auto encoder = co_await BitmapEncoder::CreateAsync(BitmapEncoder::PngEncoderId(), outStream);
        encoder.SetSoftwareBitmap(target);
        co_await encoder.FlushAsync();

        outStream.Seek(0);
        DataReader reader{ outStream };
        co_await reader.LoadAsync(static_cast<uint32_t>(outStream.Size()));
        co_return reader.DetachBuffer();
    }
}
