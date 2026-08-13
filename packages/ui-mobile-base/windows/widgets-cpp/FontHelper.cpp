#include "pch.h"
// DirectWrite font-set enumeration — included here (not in pch.h) to keep COM headers out of
// the shared PCH (see ClipHelper.cpp for the DllCanUnloadNow background).
#include <dwrite_3.h>
#pragma comment(lib, "dwrite.lib")
#include <filesystem>
#include <string>
#include "FontHelper.h"
#include "FontHelper.g.cpp"

namespace
{
    // Extracts the en-us (or first) string from an IDWriteLocalizedStrings.
    std::wstring LocalizedString(IDWriteLocalizedStrings* strings)
    {
        if (!strings || strings->GetCount() == 0) return L"";
        UINT32 index = 0;
        BOOL exists = FALSE;
        if (FAILED(strings->FindLocaleName(L"en-us", &index, &exists)) || !exists) index = 0;
        UINT32 length = 0;
        if (FAILED(strings->GetStringLength(index, &length)) || length == 0) return L"";
        std::wstring value;
        value.resize(static_cast<size_t>(length) + 1);
        if (FAILED(strings->GetString(index, value.data(), length + 1))) return L"";
        value.resize(length);
        return value;
    }

    std::wstring FontProperty(IDWriteFontSet* fontSet, UINT32 index, DWRITE_FONT_PROPERTY_ID prop)
    {
        BOOL exists = FALSE;
        winrt::com_ptr<IDWriteLocalizedStrings> strings;
        if (FAILED(fontSet->GetPropertyValues(index, prop, &exists, strings.put())) || !exists) return L"";
        return LocalizedString(strings.get());
    }

    // Resolves the backing file name (without directory) of a font-set entry.
    std::wstring FontFileName(IDWriteFontSet* fontSet, UINT32 index)
    {
        winrt::com_ptr<IDWriteFontFaceReference> faceRef;
        if (FAILED(fontSet->GetFontFaceReference(index, faceRef.put()))) return L"";
        winrt::com_ptr<IDWriteFontFile> file;
        if (FAILED(faceRef->GetFontFile(file.put()))) return L"";
        const void* refKey = nullptr;
        UINT32 refKeySize = 0;
        if (FAILED(file->GetReferenceKey(&refKey, &refKeySize))) return L"";
        winrt::com_ptr<IDWriteFontFileLoader> loader;
        if (FAILED(file->GetLoader(loader.put()))) return L"";
        auto localLoader = loader.try_as<IDWriteLocalFontFileLoader>();
        if (!localLoader) return L"";
        UINT32 pathLength = 0;
        if (FAILED(localLoader->GetFilePathLengthFromKey(refKey, refKeySize, &pathLength)) || pathLength == 0) return L"";
        std::wstring path;
        path.resize(static_cast<size_t>(pathLength) + 1);
        if (FAILED(localLoader->GetFilePathFromKey(refKey, refKeySize, path.data(), pathLength + 1))) return L"";
        path.resize(pathLength);
        return std::filesystem::path(path).filename().wstring();
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    winrt::hstring FontHelper::ScanFontsDirectory(winrt::hstring const& folderPath)
    {
        std::wstring result;
        try
        {
            winrt::com_ptr<IDWriteFactory5> factory;
            if (FAILED(DWriteCreateFactory(DWRITE_FACTORY_TYPE_SHARED, __uuidof(IDWriteFactory5),
                reinterpret_cast<IUnknown**>(factory.put()))))
            {
                return winrt::hstring{};
            }

            winrt::com_ptr<IDWriteFontSetBuilder1> builder;
            if (FAILED(factory->CreateFontSetBuilder(builder.put()))) return winrt::hstring{};

            std::error_code ec;
            std::filesystem::directory_iterator it(std::wstring(folderPath), ec);
            if (ec) return winrt::hstring{};
            for (auto const& entry : it)
            {
                if (!entry.is_regular_file(ec) || ec) continue;
                auto ext = entry.path().extension().wstring();
                for (auto& ch : ext) ch = towlower(ch);
                if (ext != L".ttf" && ext != L".otf" && ext != L".ttc") continue;
                winrt::com_ptr<IDWriteFontFile> fontFile;
                if (FAILED(factory->CreateFontFileReference(entry.path().c_str(), nullptr, fontFile.put()))) continue;
                builder->AddFontFile(fontFile.get()); // per-file failure just skips the file
            }

            winrt::com_ptr<IDWriteFontSet> fontSet;
            if (FAILED(builder->CreateFontSet(fontSet.put()))) return winrt::hstring{};

            const UINT32 count = fontSet->GetFontCount();
            for (UINT32 i = 0; i < count; i++)
            {
                auto fileName = FontFileName(fontSet.get(), i);
                if (fileName.empty()) continue;
                auto win32Family = FontProperty(fontSet.get(), i, DWRITE_FONT_PROPERTY_ID_WIN32_FAMILY_NAME);
                auto typoFamily = FontProperty(fontSet.get(), i, DWRITE_FONT_PROPERTY_ID_TYPOGRAPHIC_FAMILY_NAME);
                if (typoFamily.empty())
                {
                    typoFamily = FontProperty(fontSet.get(), i, DWRITE_FONT_PROPERTY_ID_WEIGHT_STRETCH_STYLE_FAMILY_NAME);
                }
                if (!result.empty()) result += L"\n";
                result += fileName;
                result += L"|";
                result += win32Family;
                result += L"|";
                result += typoFamily;
            }
        }
        catch (...)
        {
        }
        return winrt::hstring(result);
    }
}
