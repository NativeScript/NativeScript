import UIKit

// The members of core's View that script calls, with JavaScript's types:
// measure specs and sizes in device pixels as numbers, insets as objects.

extension View {
    public func getMeasuredWidth() -> Double { Double(measuredWidth) }
    public func getMeasuredHeight() -> Double { Double(measuredHeight) }

    /// `measure(widthMeasureSpec, heightMeasureSpec)` from script.
    public func measure(_ widthMeasureSpec: Double, _ heightMeasureSpec: Double) {
        measure(Int(widthMeasureSpec), Int(heightMeasureSpec))
    }

    /// `layout(left, top, right, bottom)` from script, in device pixels.
    public func layout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        layout(left, top, right, bottom, setFrame: true)
    }

    /// `getSafeAreaInsets()`: `{ left, top, right, bottom }` in device pixels.
    public func getSafeAreaInsets() -> Any? {
        let p = safeAreaInsetsPosition()
        return JSObject([("left", p.left), ("top", p.top), ("right", p.right), ("bottom", p.bottom)])
    }

    /// `getActualSize()`: the native frame's size in DIPs, its edges rounded to device pixels as core rounds them; zero when collapsed.
    public func getActualSize() -> Size {
        guard let frame = nativeView?.frame, !isCollapsed else { return Size(width: 0, height: 0) }
        let px = { (v: CGFloat) in (LayoutHelper.toDevicePixels(Double(v))).rounded() }
        return Size(width: LayoutHelper.toDeviceIndependentPixels(px(frame.maxX) - px(frame.minX)),
                    height: LayoutHelper.toDeviceIndependentPixels(px(frame.maxY) - px(frame.minY)))
    }

    /// `focus()`: the native view becomes first responder.
    @discardableResult
    public func focus() -> Bool { nativeView?.becomeFirstResponder() ?? false }

    /// `page`: the page this view is in.
    public var page: Page? {
        var current: View? = self
        while let view = current {
            if let page = view as? Page { return page }
            current = view.parent
        }
        return nil
    }

    /// `eachChild(callback)`: stops when the callback returns false.
    public func eachChild(_ callback: (View) throws -> Bool) {
        var stop = false
        eachChildView { child in
            if stop { return }
            if !(jsReported { try callback(child) } ?? true) { stop = true }
        }
    }

    /// `getViewById(id)`: this view or a descendant with that `id`, depth first.
    public func getViewById(_ id: String) -> View? {
        if (get("id") as? String) == id { return self }
        var found: View?
        eachChildView { child in
            if found == nil { found = child.getViewById(id) }
        }
        return found
    }

    /// `style`: the view's style properties by name.
    public var style: Style { Style(self) }

    /// `_onCssStateChange()`: CSS matched again for this view.
    public func _onCssStateChange() { onCssStateChange() }
}

/// `Style`: a view's style properties, read and written by name.
public final class Style: JSDynamic {
    weak var view: View?

    init(_ view: View) { self.view = view }

    public func get(_ name: String) -> Any? { view?.get(name) }
    public func set(_ name: String, _ value: Any?) { view?.set(name, value) }

    public subscript(jsKey key: String) -> Any? {
        get { get(key) }
        set { set(key, newValue) }
    }

    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Style" }
}

/// `Size` from core: a width and a height in DIPs.
public final class Size: JSDynamic {
    public var width: Double
    public var height: Double
    public init(width: Double, height: Double) { self.width = width; self.height = height }

    public subscript(jsKey key: String) -> Any? {
        get { key == "width" ? width : key == "height" ? height : nil }
        set {
            if key == "width" { width = jsToNumber(newValue) }
            if key == "height" { height = jsToNumber(newValue) }
        }
    }
    public var jsKeys: [String] { ["width", "height"] }
    public var jsClassName: String? { "Object" }
}
