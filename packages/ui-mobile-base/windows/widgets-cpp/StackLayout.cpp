#include "pch.h"
#include "StackLayout.h"
#include "StackLayout.g.cpp"

#include <algorithm>
#include <limits>
#include <vector>

using namespace winrt;
using namespace winrt::Windows::Foundation;
using namespace winrt::Microsoft::UI::Xaml;

namespace winrt::NativeScript::Widgets::implementation
{
    // A child "fills" the main axis when its main-axis alignment is Stretch (e.g. a ScrollView with
    // height:100% in a vertical stack — the Windows View maps 100% → Stretch). Such a child is sized
    // to the space the stack actually has left, which is what gives a ScrollView a bounded, scrollable
    // viewport — no JS clamp needed.
    static bool IsMainStretch(UIElement const& child, bool vertical)
    {
        if (auto fe = child.try_as<FrameworkElement>())
        {
            return vertical ? (fe.VerticalAlignment() == VerticalAlignment::Stretch)
                            : (fe.HorizontalAlignment() == HorizontalAlignment::Stretch);
        }
        return false;
    }

    Size StackLayout::MeasureOverride(Size const& availableSize)
    {
        const bool vertical = (m_orientation == 0);
        const float inf = std::numeric_limits<float>::infinity();
        const float mainAvail = vertical ? availableSize.Height : availableSize.Width;
        const float crossAvail = vertical ? availableSize.Width : availableSize.Height;
        const bool mainBounded = std::isfinite(mainAvail);

        float usedMain = 0.0f;
        float maxCross = 0.0f;
        std::vector<UIElement> fillChildren;

        // Pass 1: content children take their natural main size (measured with unbounded main).
        // Main-axis fill children are deferred — they only make sense when the main axis is bounded.
        for (auto const& child : Children())
        {
            if (child.Visibility() == Visibility::Collapsed)
            {
                continue;
            }
            if (mainBounded && IsMainStretch(child, vertical))
            {
                fillChildren.push_back(child);
                continue;
            }
            const Size childAvail = vertical ? Size{ crossAvail, inf } : Size{ inf, crossAvail };
            child.Measure(childAvail);
            const Size d = child.DesiredSize();
            usedMain += (vertical ? d.Height : d.Width);
            maxCross = (std::max)(maxCross, vertical ? d.Width : d.Height);
        }

        // Pass 2: split the remaining bounded main extent among the fill children.
        if (!fillChildren.empty())
        {
            const float remaining = (std::max)(0.0f, mainAvail - usedMain);
            const float per = remaining / static_cast<float>(fillChildren.size());
            for (auto const& child : fillChildren)
            {
                const Size childAvail = vertical ? Size{ crossAvail, per } : Size{ per, crossAvail };
                child.Measure(childAvail);
                const Size d = child.DesiredSize();
                usedMain += (vertical ? d.Height : d.Width);
                maxCross = (std::max)(maxCross, vertical ? d.Width : d.Height);
            }
        }

        return vertical ? Size{ maxCross, usedMain } : Size{ usedMain, maxCross };
    }

    Size StackLayout::ArrangeOverride(Size const& finalSize)
    {
        const bool vertical = (m_orientation == 0);
        const float cross = vertical ? finalSize.Width : finalSize.Height;

        float offset = 0.0f;
        for (auto const& child : Children())
        {
            if (child.Visibility() == Visibility::Collapsed)
            {
                continue;
            }
            const Size d = child.DesiredSize();
            const float childMain = vertical ? d.Height : d.Width;
            const Rect slot = vertical ? Rect{ 0.0f, offset, cross, childMain }
                                       : Rect{ offset, 0.0f, childMain, cross };
            child.Arrange(slot);
            offset += childMain;
        }

        return finalSize;
    }
}
