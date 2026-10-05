import UIKit

// @nativescript/core's API outside the view tree, and the view members
// translated code reads and writes by name: what an app imports from
// '@nativescript/core' that is not an element in its templates.

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
