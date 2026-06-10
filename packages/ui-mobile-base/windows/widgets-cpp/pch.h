#pragma once
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
// xaml_typename<T>() (used to register attached DependencyProperties) returns the universal
// Windows.UI.Xaml.Interop.TypeName — Microsoft.UI.Xaml.DependencyProperty.RegisterAttached takes it.
#include <winrt/Windows.UI.Xaml.Interop.h>
#include <winrt/Microsoft.UI.Xaml.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>
// ImageHelper: bitmap decode/encode/IO + UI-thread BitmapImage creation.
#include <winrt/Microsoft.UI.Xaml.Media.h>
#include <winrt/Microsoft.UI.Xaml.Media.Imaging.h>
#include <winrt/Microsoft.UI.Dispatching.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Graphics.Imaging.h>
#include <winrt/Windows.Web.Http.h>
#include <winrt/Windows.Security.Cryptography.h>
