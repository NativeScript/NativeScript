#include "pch.h"
#include <cstdint>

// cppwinrt's generated module.g.cpp defines the module entry points as WINRT_GetActivationFactory /
// WINRT_CanUnloadNow. The OS WinRT activator (RoGetActivationFactory) loads the in-proc server and
// calls the classic export names DllGetActivationFactory / DllCanUnloadNow. The cppwinrt NuGet does
// not emit these exports by itself (the VS template normally provides them), so a hand-authored
// component must surface them. Forward to the generated implementation.
//
// These extern declarations must match module.g.cpp's definitions exactly so the linker resolves
// them to the generated symbols.
int32_t __stdcall WINRT_GetActivationFactory(void* classId, void** factory) noexcept;
int32_t __stdcall WINRT_CanUnloadNow() noexcept;

extern "C" __declspec(dllexport) int32_t __stdcall DllGetActivationFactory(void* classId, void** factory) noexcept
{
    return WINRT_GetActivationFactory(classId, factory);
}

// pch.h's <unknwn.h> exposes the system combaseapi declaration of DllCanUnloadNow
// (HRESULT, no dllexport), so this definition must match it exactly — the export is added
// via the linker pragma instead of __declspec(dllexport). PRIVATE keeps it out of the
// import library (LNK4104), matching COM in-proc server convention.
#pragma comment(linker, "/export:DllCanUnloadNow,PRIVATE")
extern "C" HRESULT __stdcall DllCanUnloadNow()
{
    return WINRT_CanUnloadNow();
}
