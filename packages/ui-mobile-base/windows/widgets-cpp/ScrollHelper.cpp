#include "pch.h"
#include <queue>
#include "ScrollHelper.h"
#include "ScrollHelper.g.cpp"

namespace
{
    winrt::Microsoft::UI::Xaml::Controls::ScrollViewer FindScrollViewer(
        winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        if (!element) return nullptr;
        if (auto self = element.try_as<winrt::Microsoft::UI::Xaml::Controls::ScrollViewer>()) return self;

        std::queue<winrt::Microsoft::UI::Xaml::DependencyObject> queue;
        queue.push(element);
        int visited = 0;
        while (!queue.empty() && visited < 500)
        {
            auto current = queue.front();
            queue.pop();
            visited++;
            const int count = winrt::Microsoft::UI::Xaml::Media::VisualTreeHelper::GetChildrenCount(current);
            for (int i = 0; i < count; i++)
            {
                auto child = winrt::Microsoft::UI::Xaml::Media::VisualTreeHelper::GetChild(current, i);
                if (auto sv = child.try_as<winrt::Microsoft::UI::Xaml::Controls::ScrollViewer>()) return sv;
                queue.push(child);
            }
        }
        return nullptr;
    }

    winrt::Windows::Foundation::IReference<double> Ref(double value)
    {
        return winrt::box_value(value).as<winrt::Windows::Foundation::IReference<double>>();
    }
}

namespace winrt::NativeScript::Widgets::implementation
{
    bool ScrollHelper::ScrollToVerticalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element, double offset, bool disableAnimation)
    {
        auto sv = FindScrollViewer(element);
        if (!sv) return false;
        // ChangeView can reject the request (returns false) when a layout pass is pending.
        sv.UpdateLayout();
        if (sv.ChangeView(nullptr, Ref(offset), nullptr, disableAnimation)) return true;
        // Deprecated but reliable immediate-jump fallback.
        sv.ScrollToVerticalOffset(offset);
        return true;
    }

    bool ScrollHelper::ScrollToHorizontalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element, double offset, bool disableAnimation)
    {
        auto sv = FindScrollViewer(element);
        if (!sv) return false;
        sv.UpdateLayout();
        if (sv.ChangeView(Ref(offset), nullptr, nullptr, disableAnimation)) return true;
        sv.ScrollToHorizontalOffset(offset);
        return true;
    }

    double ScrollHelper::GetVerticalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        auto sv = FindScrollViewer(element);
        return sv ? sv.VerticalOffset() : 0.0;
    }

    double ScrollHelper::GetHorizontalOffset(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        auto sv = FindScrollViewer(element);
        return sv ? sv.HorizontalOffset() : 0.0;
    }

    double ScrollHelper::GetExtentHeight(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        auto sv = FindScrollViewer(element);
        return sv ? sv.ExtentHeight() : 0.0;
    }

    double ScrollHelper::GetExtentWidth(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        auto sv = FindScrollViewer(element);
        return sv ? sv.ExtentWidth() : 0.0;
    }

    double ScrollHelper::GetViewportHeight(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        auto sv = FindScrollViewer(element);
        return sv ? sv.ViewportHeight() : 0.0;
    }

    double ScrollHelper::GetViewportWidth(winrt::Microsoft::UI::Xaml::UIElement const& element)
    {
        auto sv = FindScrollViewer(element);
        return sv ? sv.ViewportWidth() : 0.0;
    }
}
