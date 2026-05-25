using System;
using System.Runtime.InteropServices;

namespace NativeScript.Widgets
{
    public sealed partial class FlexboxLayout : IDisposable
    {
        private IntPtr __native_ccw = IntPtr.Zero;
        private bool __native_ccw_released = false;
        private readonly object __native_ccw_lock = new object();

        public FlexboxLayout()
        {
            try
            {
                __native_ccw = Marshal.GetIUnknownForObject(this);
            }
            catch
            {
                __native_ccw = IntPtr.Zero;
            }
        }

        public IntPtr GetNativePtr() => __native_ccw;

        public void ReleaseNativePtr()
        {
            IntPtr old = IntPtr.Zero;
            lock (__native_ccw_lock)
            {
                if (!__native_ccw_released && __native_ccw != IntPtr.Zero)
                {
                    old = __native_ccw;
                    __native_ccw = IntPtr.Zero;
                    __native_ccw_released = true;
                }
            }
            if (old != IntPtr.Zero)
            {
                try { Marshal.Release(old); } catch { }
            }
        }

        ~FlexboxLayout() => ReleaseNativePtr();

        public void Dispose() { ReleaseNativePtr(); GC.SuppressFinalize(this); }
    }
}
