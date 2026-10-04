import UIKit

/// `UISearchBarImpl` from search-bar/index.ios: an unbounded width measures as none.
final class UISearchBarImpl: UISearchBar {
    override func sizeThatFits(_ size: CGSize) -> CGSize {
        var size = size
        if size.width == .infinity { size.width = 0 }
        return super.sizeThatFits(size)
    }
}

/// `SearchBar` from search-bar/index.ios: the text field's text, hint and
/// colors; `submit` from the search key, `clear` when the text empties.
open class SearchBar: View, UISearchBarDelegate {
    open override class var cssType: String { "SearchBar" }

    private var searchBar: UISearchBar? { nativeView as? UISearchBar }
    private lazy var textField: UITextField? = searchBar?.value(forKey: "searchField") as? UITextField
    private var defaultFont: UIFont?

    open override func createNativeView() -> UIView? { UISearchBarImpl() }

    open override func initNativeView() {
        if applied["text"] == nil { applied["text"] = "" }
        searchBar?.delegate = self
        defaultFont = textField?.font
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        guard let searchBar else { return super.setProperty(name, value) }
        switch name {
        case "text":
            searchBar.text = toText(value) ?? ""
            requestLayout()
        case "hint", "textFieldHintColor":
            updateAttributedPlaceholder()
        case "textFieldBackgroundColor":
            textField?.backgroundColor = toColor(value)
        case "clearButtonColor":
            (textField?.value(forKey: "clearButton") as? UIView)?.tintColor = toColor(value)
        case "color":
            let color = toColor(value)
            textField?.textColor = color
            textField?.tintColor = color
        case "backgroundColor":
            searchBar.barTintColor = toColor(value)
            super.setProperty(name, value)
        case "isEnabled":
            textField?.isEnabled = toBool(value) ?? true
        case "fontSize", "fontWeight", "fontStyle", "fontFamily":
            fontChanged()
        default:
            super.setProperty(name, value)
        }
    }

    /// `fontInternalProperty.setNative`: the text field's own font once nothing is styled.
    private func fontChanged() {
        guard let textField else { return }
        var font = Font()
        font.size = toDouble(applied["fontSize"])
        if let weight = applied["fontWeight"] {
            let v = toText(weight)?.trimmingCharacters(in: .whitespaces).lowercased() ?? "normal"
            font.weight = v == "400" ? "normal" : v
        }
        font.style = (applied["fontStyle"] as? String) ?? "normal"
        font.family = applied["fontFamily"] as? String
        textField.font = font.isDefault ? defaultFont : font.uiFont(default: textField.font)
        requestLayout()
    }

    private func updateAttributedPlaceholder() {
        var string = toText(applied["hint"]) ?? ""
        // An empty placeholder string gives no attributedPlaceholder at all.
        if string.isEmpty { string = " " }
        var attributes: [NSAttributedString.Key: Any] = [:]
        if let color = toColor(applied["textFieldHintColor"]) { attributes[.foregroundColor] = color }
        textField?.attributedPlaceholder = NSAttributedString(string: string, attributes: attributes)
    }

    /// The bar's own background is its bar tint; the view's background is not drawn.
    open override func backgroundInternalChanged() {}

    // MARK: UISearchBarDelegate

    public func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        nativeValueChange("text", searchText)
        requestLayout()
        if searchText.isEmpty { emit("clear", nil) }
    }

    public func searchBarCancelButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
        emit("clear", nil)
    }

    public func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
        emit("submit", nil)
    }
}
