#pragma once
// Required BEFORE any C++/WinRT header so winrt::implements can implement classic COM
// interfaces (ClipHelper's GeoSource implements IGeometrySource2DInterop).
#include <unknwn.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
// xaml_typename<T>() (used to register attached DependencyProperties) returns the universal
// Windows.UI.Xaml.Interop.TypeName — Microsoft.UI.Xaml.DependencyProperty.RegisterAttached takes it.
#include <winrt/Windows.UI.Xaml.Interop.h>
#include <winrt/Microsoft.UI.Xaml.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>
// ClipHelper: composition clip-path via rounded-rectangle and D2D polygon geometry.
// <d2d1.h> is NOT included here: combaseapi.h (pulled in by d2d1.h) redeclares DllCanUnloadNow
// as HRESULT, conflicting with exports.cpp's int32_t declaration. Included locally in ClipHelper.cpp.
#include <winrt/Microsoft.UI.Composition.h>
#include <winrt/Microsoft.UI.Xaml.Hosting.h>
// ImageHelper: bitmap decode/encode/IO + UI-thread BitmapImage creation.
#include <winrt/Microsoft.UI.Xaml.Media.h>
#include <winrt/Microsoft.UI.Xaml.Media.Imaging.h>
#include <winrt/Microsoft.UI.Dispatching.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Graphics.Imaging.h>
#include <winrt/Windows.Web.Http.h>
#include <winrt/Windows.Security.Cryptography.h>
#include <sstream>
#include <vector>
