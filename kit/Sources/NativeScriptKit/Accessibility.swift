import UIKit

// The accessibility properties of core's view/index.ios and its
// `updateAccessibilityProperties` (application.ios): roles and states as
// UIAccessibility traits, recomputed whenever one of them changes.

private let roleTraits: [String: UIAccessibilityTraits] = [
    "adjustable": .adjustable, "button": .button, "checkbox": .button, "header": .header, "keyboardKey": .keyboardKey,
    "image": .image, "imageButton": [.image, .button], "link": .link, "none": [], "playsSound": .playsSound,
    "radioButton": .button, "search": .searchField, "text": .staticText, "startsMediaSession": .startsMediaSession,
    "summary": .summaryElement, "switch": .button,
]

extension View {
    /// Applies an accessibility property; false for any other name.
    func setAccessibilityProperty(_ name: String, _ value: Any?) -> Bool {
        guard let nativeView else { return name.hasPrefix("accessib") }
        let text = { (v: Any?) -> String? in jsFlat(v) == nil ? nil : jsToString(v) }
        switch name {
        case "accessible":
            nativeView.isAccessibilityElement = toBool(value) ?? false
            updateAccessibilityTraits()
        case "accessibilityIdentifier": nativeView.accessibilityIdentifier = text(value)
        case "accessibilityRole", "accessibilityState", "accessibilityLiveRegion", "accessibilityMediaSession": updateAccessibilityTraits()
        case "accessibilityValue": nativeView.accessibilityValue = text(value)
        case "accessibilityLabel": nativeView.accessibilityLabel = text(value)
        case "accessibilityHint": nativeView.accessibilityHint = text(value)
        case "accessibilityIgnoresInvertColors": nativeView.accessibilityIgnoresInvertColors = toBool(value) ?? false
        case "accessibilityLanguage": nativeView.accessibilityLanguage = text(value)
        case "accessibilityHidden":
            nativeView.accessibilityElementsHidden = toBool(value) ?? false
            updateAccessibilityTraits()
        default: return false
        }
        return true
    }

    private func updateAccessibilityTraits() {
        guard let nativeView else { return }
        let role = toText(applied["accessibilityRole"])
        let state = toText(applied["accessibilityState"])
        guard toBool(applied["accessible"]) == true, toBool(applied["accessibilityHidden"]) != true else {
            nativeView.accessibilityTraits = []
            return
        }
        var traits: UIAccessibilityTraits = role.flatMap { roleTraits[$0] } ?? []
        switch role {
        case "checkbox", "radioButton", "switch":
            if state == "checked" { traits.insert(.selected) }
        default:
            if state == "selected" { traits.insert(.selected) }
            if state == "disabled" { traits.insert(.notEnabled) }
        }
        switch toText(applied["accessibilityLiveRegion"]) {
        case "polite", "assertive": traits.insert(.updatesFrequently)
        default: traits.remove(.updatesFrequently)
        }
        if toBool(applied["accessibilityMediaSession"]) == true { traits.insert(.startsMediaSession) }
        nativeView.accessibilityTraits = traits
    }
}
