import UIKit

/// The window state NativeScript turns into root view classes and media
/// query values (application `setRootViewCSSClasses`, accessibility's
/// font scale and service classes).
enum Appearance {
    static weak var window: UIWindow?

    /// The window's traits change before its controllers' do.
    private static var traits: UITraitCollection { window?.traitCollection ?? UITraitCollection.current }

    static var systemAppearance: String { traits.userInterfaceStyle == .dark ? "dark" : "light" }

    static var layoutDirection: String { traits.layoutDirection == .rightToLeft ? "rtl" : "ltr" }

    static var orientation: String {
        switch window?.windowScene?.interfaceOrientation ?? .portrait {
        case .landscapeLeft, .landscapeRight: return "landscape"
        case .portrait, .portraitUpsideDown: return "portrait"
        default: return "unknown"
        }
    }

    /// `getClosestValidFontScale` of the content size category.
    static var fontScale: Double {
        let scales: [UIContentSizeCategory: Double] = [
            .extraSmall: 0.5, .small: 0.7, .medium: 0.85, .large: 1, .extraLarge: 1.15, .extraExtraLarge: 1.3,
            .extraExtraExtraLarge: 1.5, .accessibilityMedium: 2, .accessibilityLarge: 2.5, .accessibilityExtraLarge: 3,
            .accessibilityExtraExtraLarge: 3.5, .accessibilityExtraExtraExtraLarge: 4,
        ]
        return scales[UIApplication.shared.preferredContentSizeCategory] ?? 1
    }

    /// The classes of a root view, `ns-root` or `ns-modal` first.
    static func rootClasses(modal: Bool = false) -> Set<String> {
        let sdk = Int(floor(Double(UIDevice.current.systemVersion.split(separator: ".").prefix(2).joined(separator: ".")) ?? 0))
        let device = UIDevice.current.userInterfaceIdiom == .phone ? "phone" : "tablet"
        let scale = fontScale
        let category = scale < 0.85 ? "xs" : scale > 1.5 ? "xl" : "m"
        return [
            modal ? "ns-modal" : "ns-root", "ns-ios", "ns-ios-\(sdk)", "ns-\(device)",
            "ns-\(orientation)", "ns-\(systemAppearance)", "ns-\(layoutDirection)",
            UIAccessibility.isVoiceOverRunning ? "a11y-service-enabled" : "a11y-service-disabled",
            "a11y-fontscale-\(Int((scale * 100).rounded()))", "a11y-fontscale-\(category)",
        ]
    }

    /// `systemAppearanceChanged` and friends: the root's window-scoped classes follow the window.
    static func refresh(_ root: View) {
        let next = rootClasses()
        if root.rootClasses != next { root.rootClasses = next }
        let appearance = systemAppearance
        if appearance != lastAppearance {
            lastAppearance = appearance
            Application.appearanceChanged(appearance)
        }
    }
    private static var lastAppearance = systemAppearance
}
