import UIKit

// @nativescript/core's API outside the view tree, and the view members
// translated code reads and writes by name: what an app imports from
// '@nativescript/core' that is not an element in its templates.

private var loadedKey: UInt8 = 0

extension View {
    /// A property's current value by its NativeScript name (`label.text`).
    public func get(_ name: String) -> Any? { applied[name] }

    public var isViewLoaded: Bool { objc_getAssociatedObject(self, &loadedKey) != nil }

    /// `onLoaded`: children first, then this view's `loaded` event, as ViewBase does.
    public func callLoaded() {
        guard !isViewLoaded else { return }
        objc_setAssociatedObject(self, &loadedKey, true, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        eachChildView { $0.callLoaded() }
        emit("loaded", nil)
    }

    /// A child added to a loaded parent loads with it.
    func loadIfParentLoaded() {
        if parent?.isViewLoaded == true { callLoaded() }
    }
}

/// `ApplicationSettings` from application-settings/index.ios: NSUserDefaults.
public enum ApplicationSettings {
    private static var defaults: UserDefaults { .standard }

    public static func hasKey(_ key: String) -> Bool { defaults.object(forKey: key) != nil }
    public static func getBoolean(_ key: String, _ defaultValue: Bool? = nil) -> Bool {
        hasKey(key) ? defaults.bool(forKey: key) : defaultValue ?? false
    }
    public static func getString(_ key: String, _ defaultValue: String? = nil) -> String? {
        hasKey(key) ? defaults.string(forKey: key) : defaultValue
    }
    public static func getNumber(_ key: String, _ defaultValue: Double? = nil) -> Double {
        hasKey(key) ? defaults.double(forKey: key) : defaultValue ?? 0
    }
    public static func setBoolean(_ key: String, _ value: Bool) { defaults.set(value, forKey: key) }
    public static func setString(_ key: String, _ value: String) { defaults.set(value, forKey: key) }
    public static func setNumber(_ key: String, _ value: Double) { defaults.set(value, forKey: key) }
    public static func remove(_ key: String) { defaults.removeObject(forKey: key) }
    public static func clear() {
        if let id = Bundle.main.bundleIdentifier { defaults.removePersistentDomain(forName: id) }
    }
    @discardableResult public static func flush() -> Bool { defaults.synchronize() }
    public static func getAllKeys() -> JSArray<String> {
        JSArray(Array(defaults.dictionaryRepresentation().keys))
    }
}

/// `Device` from platform/device (iOS).
public enum Device {
    public static var manufacturer: String { "Apple" }
    public static var model: String { UIDevice.current.model }
    public static var os: String { "iOS" }
    public static var osVersion: String { UIDevice.current.systemVersion }
    public static var sdkVersion: String { UIDevice.current.systemVersion }
    public static var deviceType: String { UIDevice.current.userInterfaceIdiom == .pad ? "Tablet" : "Phone" }
    public static var uuid: String { UIDevice.current.identifierForVendor?.uuidString ?? "" }
    public static var language: String { Locale.preferredLanguages.first ?? "en" }
    public static var region: String { Locale.current.region?.identifier ?? "" }
}

/// `Screen.mainScreen` from platform/screen (iOS).
public struct ScreenMetrics {
    public var screen: UIScreen { UIScreen.main }
    public var scale: Double { Double(UIScreen.main.scale) }
    public var widthDIPs: Double { Double(UIScreen.main.bounds.width) }
    public var heightDIPs: Double { Double(UIScreen.main.bounds.height) }
    public var widthPixels: Double { widthDIPs * scale }
    public var heightPixels: Double { heightDIPs * scale }
}

public enum Screen {
    public static var mainScreen: ScreenMetrics { ScreenMetrics() }
}

extension Color {
    /// `new Color(value)` as core reads it; an unparsable string is transparent black there too.
    public init(js value: String) { self = Color(value) ?? Color(argb: 0) }
    public init(_ a: Double, _ r: Double, _ g: Double, _ b: Double) {
        func c(_ v: Double) -> UInt32 { UInt32(max(0, min(255, Int(v)))) }
        self.init(argb: c(a) << 24 | c(r) << 16 | c(g) << 8 | c(b))
    }
    /// `#RRGGBB`, or `#RRGGBBAA` when not opaque, as core's `hex` reports it.
    public var hex: String {
        let rgb = String(format: "#%02X%02X%02X", r, g, b)
        return a == 255 ? rgb : rgb + String(format: "%02X", a)
    }
    public var name: String? { nil }
    public func equals(_ other: Color) -> Bool { self == other }
    public var isDark: Bool { (Double(r) * 299 + Double(g) * 587 + Double(b) * 114) / 1000 < 128 }
    public var isLight: Bool { !isDark }
}
