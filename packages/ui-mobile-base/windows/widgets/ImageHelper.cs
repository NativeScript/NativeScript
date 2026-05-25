using System;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Graphics.Imaging;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.UI.Xaml.Media.Imaging;
using Windows.Web.Http;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace NativeScript.Widgets
{
    public sealed class ImageResult
    {
        internal ImageResult(BitmapImage bitmap, IBuffer rawBuffer, int width, int height)
        {
            Bitmap    = bitmap;
            RawBuffer = rawBuffer;
            Width     = width;
            Height    = height;
        }

        public BitmapImage Bitmap    { get; }
        public IBuffer     RawBuffer { get; }
        public int         Width     { get; }
        public int         Height    { get; }
    }

    public sealed class ImageHelper
    {
        // ── Public API ────────────────────────────────────────────────────────

        public static IAsyncOperation<ImageResult> LoadFromBufferAsync(IBuffer buffer)
            => LoadFromBufferInternalAsync(buffer).AsAsyncOperation();

        public static IAsyncOperation<ImageResult> LoadFromUrlAsync(string url)
            => LoadFromUrlInternalAsync(url).AsAsyncOperation();

        public static IAsyncOperation<ImageResult> LoadFromFileAsync(string path)
            => LoadFromFileInternalAsync(path).AsAsyncOperation();

        public static IAsyncOperation<ImageResult> ResizeAsync(IBuffer buffer, int maxSize)
            => ResizeInternalAsync(buffer, maxSize).AsAsyncOperation();

        public static IAsyncOperation<bool> SaveToFileAsync(IBuffer buffer, string path)
            => SaveToFileInternalAsync(buffer, path).AsAsyncOperation();

        // Single native WinRT call — returns IAsyncOperation<IBuffer> directly.
        public static IAsyncOperation<IBuffer> ReadFileAsync(string path)
            => PathIO.ReadBufferAsync(path);

        public static string BufferToBase64(IBuffer buffer)
            => Convert.ToBase64String(buffer.ToArray());

        // ── Private async implementations ────────────────────────────────────

        private static async Task<ImageResult> LoadFromBufferInternalAsync(IBuffer buffer)
        {
            var stream = await WriteToStreamAsync(buffer);
            var bmp    = await BitmapFromStreamAsync(stream);
            return new ImageResult(bmp, buffer, bmp.PixelWidth, bmp.PixelHeight);
        }

        private static async Task<ImageResult> LoadFromUrlInternalAsync(string url)
        {
            var client = new HttpClient();
            var buffer = await client.GetBufferAsync(new Uri(url));
            var stream = await WriteToStreamAsync(buffer);
            var bmp    = await BitmapFromStreamAsync(stream);
            return new ImageResult(bmp, buffer, bmp.PixelWidth, bmp.PixelHeight);
        }

        private static async Task<ImageResult> LoadFromFileInternalAsync(string path)
        {
            var buffer = await PathIO.ReadBufferAsync(path);
            var stream = await WriteToStreamAsync(buffer);
            var bmp    = await BitmapFromStreamAsync(stream);
            return new ImageResult(bmp, buffer, bmp.PixelWidth, bmp.PixelHeight);
        }

        private static async Task<ImageResult> ResizeInternalAsync(IBuffer buffer, int maxSize)
        {
            var inStream = await WriteToStreamAsync(buffer);
            var decoder  = await BitmapDecoder.CreateAsync(inStream);

            uint srcW  = decoder.PixelWidth;
            uint srcH  = decoder.PixelHeight;
            double scale = (double)maxSize / Math.Max(srcW, srcH);
            uint dstW  = (uint)Math.Round(srcW * scale);
            uint dstH  = (uint)Math.Round(srcH * scale);

            var outStream = new InMemoryRandomAccessStream();
            var encoder   = await BitmapEncoder.CreateForTranscodingAsync(outStream, decoder);
            encoder.BitmapTransform.ScaledWidth  = dstW;
            encoder.BitmapTransform.ScaledHeight = dstH;
            await encoder.FlushAsync();

            outStream.Seek(0);
            var bmp = await BitmapFromStreamAsync(outStream);

            outStream.Seek(0);
            var reader = new DataReader(outStream);
            await reader.LoadAsync((uint)outStream.Size);
            var outBuffer = reader.DetachBuffer();

            return new ImageResult(bmp, outBuffer, (int)dstW, (int)dstH);
        }

        private static async Task<bool> SaveToFileInternalAsync(IBuffer buffer, string path)
        {
            await PathIO.WriteBufferAsync(path, buffer);
            return true;
        }

        // ── Stream utilities ─────────────────────────────────────────────────

        private static async Task<InMemoryRandomAccessStream> WriteToStreamAsync(IBuffer buffer)
        {
            var stream = new InMemoryRandomAccessStream();
            await stream.WriteAsync(buffer);
            stream.Seek(0);
            return stream;
        }

        private static async Task<BitmapImage> BitmapFromStreamAsync(IRandomAccessStream stream)
        {
            // Ensure the stream is positioned at the start.
            try { stream.Seek(0); } catch { }

            // Prefer creating and setting the BitmapImage on the UI dispatcher
            // because XAML BitmapImage is an object that must be touched from
            // the UI thread on many Windows platforms.
            var dispatcher = CoreApplication.MainView?.CoreWindow?.Dispatcher;
            if (dispatcher != null)
            {
                var tcs = new TaskCompletionSource<BitmapImage>();

                try
                {
                    await dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
                    {
                        try
                        {
                            var bmp = new BitmapImage();
                            // SetSourceAsync returns IAsyncAction; convert it to a Task
                            // and continue to set the TaskCompletionSource when done.
                            var action = bmp.SetSourceAsync(stream);
                            var task = action.AsTask();
                            task.ContinueWith(t =>
                            {
                                if (t.IsFaulted) tcs.TrySetException(t.Exception?.InnerException ?? t.Exception);
                                else if (t.IsCanceled) tcs.TrySetCanceled();
                                else tcs.TrySetResult(bmp);
                            }, TaskScheduler.Default);
                        }
                        catch (Exception ex)
                        {
                            tcs.TrySetException(ex);
                        }
                    });
                }
                catch
                {
                    // Dispatcher invocation failed; fall back to attempting creation
                    // on the current thread below.
                }

                return await tcs.Task;
            }

            // Fallback: try creating on current thread. This may fail if called
            // from a non-UI thread (caller should prefer the async API to be
            // invoked from appropriate context), but we catch and rethrow so
            // callers can handle errors.
            var fallbackBmp = new BitmapImage();
            await fallbackBmp.SetSourceAsync(stream);
            return fallbackBmp;
        }
    }
}
