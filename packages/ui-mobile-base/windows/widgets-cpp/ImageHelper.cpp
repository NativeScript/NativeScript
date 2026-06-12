#include "pch.h"
#include "ImageResult.h"
#include "ImageHelper.h"
#include "ImageResult.g.cpp"
#include "ImageHelper.g.cpp"

#include <algorithm>
#include <cmath>

using namespace winrt;
using namespace winrt::Windows::Foundation;
using namespace winrt::Windows::Storage;
using namespace winrt::Windows::Storage::Streams;
using namespace winrt::Windows::Graphics::Imaging;
using BitmapImage = winrt::Microsoft::UI::Xaml::Media::Imaging::BitmapImage;

// THREADING: these deliberately do NOT resume_background(). The NativeScript Windows
// runtime hosts V8 on the UI thread and only marshals WinRT async `Completed` callbacks back into
// JS when they fire on that (UI) apartment. WinRT async operations started on the UI apartment
// marshal their completion back to it automatically, so awaiting them inline keeps every resume on
// the UI thread — which is also where the UI-affine BitmapImage must be created. Hopping to a
// background thread (resume_background) would make the final completion fire on a pool thread where
// the runtime's thread-local isolate pointer is null, so the JS promise would silently never settle.
// The awaited ops are themselves async (non-blocking), so the UI thread is not stalled.

namespace
{
    // Copy an IBuffer into a fresh in-memory stream, rewound to the start.
    IAsyncOperation<InMemoryRandomAccessStream> WriteToStreamAsync(IBuffer buffer)
    {
        InMemoryRandomAccessStream stream;
        co_await stream.WriteAsync(buffer);
        stream.Seek(0);
        co_return stream;
    }

    IAsyncOperation<BitmapImage> BitmapFromStreamAsync(IRandomAccessStream stream)
    {
        try { stream.Seek(0); }
        catch (...) {}
        BitmapImage bmp;
        co_await bmp.SetSourceAsync(stream);
        co_return bmp;
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    IAsyncOperation<winrt::NativeScript::Widgets::ImageResult> ImageHelper::LoadFromBufferAsync(IBuffer buffer)
    {
        auto stream = co_await WriteToStreamAsync(buffer);
        auto bmp = co_await BitmapFromStreamAsync(stream);
        co_return winrt::make<ImageResult>(bmp, buffer, bmp.PixelWidth(), bmp.PixelHeight());
    }

    IAsyncOperation<winrt::NativeScript::Widgets::ImageResult> ImageHelper::LoadFromUrlAsync(hstring url)
    {
        winrt::Windows::Web::Http::HttpClient client;
        auto buffer = co_await client.GetBufferAsync(Uri{ url });
        auto stream = co_await WriteToStreamAsync(buffer);
        auto bmp = co_await BitmapFromStreamAsync(stream);
        co_return winrt::make<ImageResult>(bmp, buffer, bmp.PixelWidth(), bmp.PixelHeight());
    }

    IAsyncOperation<winrt::NativeScript::Widgets::ImageResult> ImageHelper::LoadFromFileAsync(hstring path)
    {
        auto buffer = co_await PathIO::ReadBufferAsync(path);
        auto stream = co_await WriteToStreamAsync(buffer);
        auto bmp = co_await BitmapFromStreamAsync(stream);
        co_return winrt::make<ImageResult>(bmp, buffer, bmp.PixelWidth(), bmp.PixelHeight());
    }

    IAsyncOperation<winrt::NativeScript::Widgets::ImageResult> ImageHelper::ResizeAsync(IBuffer buffer, int32_t maxSize)
    {
        auto inStream = co_await WriteToStreamAsync(buffer);
        auto decoder = co_await BitmapDecoder::CreateAsync(inStream);

        const uint32_t srcW = decoder.PixelWidth();
        const uint32_t srcH = decoder.PixelHeight();
        const double scale = static_cast<double>(maxSize) / (std::max)(srcW, srcH);
        const uint32_t dstW = static_cast<uint32_t>(std::lround(srcW * scale));
        const uint32_t dstH = static_cast<uint32_t>(std::lround(srcH * scale));

        InMemoryRandomAccessStream outStream;
        auto encoder = co_await BitmapEncoder::CreateForTranscodingAsync(outStream, decoder);
        encoder.BitmapTransform().ScaledWidth(dstW);
        encoder.BitmapTransform().ScaledHeight(dstH);
        co_await encoder.FlushAsync();

        outStream.Seek(0);
        auto bmp = co_await BitmapFromStreamAsync(outStream);

        outStream.Seek(0);
        DataReader reader{ outStream };
        co_await reader.LoadAsync(static_cast<uint32_t>(outStream.Size()));
        auto outBuffer = reader.DetachBuffer();

        co_return winrt::make<ImageResult>(bmp, outBuffer, static_cast<int32_t>(dstW), static_cast<int32_t>(dstH));
    }

    IAsyncOperation<bool> ImageHelper::SaveToFileAsync(IBuffer buffer, hstring path)
    {
        co_await PathIO::WriteBufferAsync(path, buffer);
        co_return true;
    }

    IAsyncOperation<IBuffer> ImageHelper::ReadFileAsync(hstring path)
    {
        // Single native call — return the operation directly.
        return PathIO::ReadBufferAsync(path);
    }

    hstring ImageHelper::BufferToBase64(IBuffer buffer)
    {
        return winrt::Windows::Security::Cryptography::CryptographicBuffer::EncodeToBase64String(buffer);
    }
}
