import UIKit

/// What an event carries beyond its name and object, read through `EventData`
/// with NativeScript's names (`args.index`, `args.deltaX`, `args.state`).
open class EventPayload {
    public init() {}
}

/// `ItemEventData` (ListView `itemTap`, `itemLoading`) with the item a template rendered.
public final class ItemEventPayload: EventPayload {
    public let index: Double
    public let item: Any?
    public let view: View?

    public init(index: Double, item: Any?, view: View?) {
        self.index = index
        self.item = item
        self.view = view
    }
}

extension EventData {
    /// `ScrollEventData`: the scroll view's offsets when it scrolled.
    public var scrollX: Double { (object as? ScrollView)?.horizontalOffset ?? 0 }
    public var scrollY: Double { (object as? ScrollView)?.verticalOffset ?? (value as? Double ?? 0) }
    /// `SystemAppearanceChangedEventData.newValue` and other values a notifier names.
    public var newValue: Any? { self[jsKey: "newValue"] }

    public var index: Double { (value as? ItemEventPayload)?.index ?? 0 }
    public var item: Any? { (value as? ItemEventPayload)?.item }
    public var view: View? { (value as? ItemEventPayload)?.view ?? (value as? GestureEventPayload)?.view }
}
