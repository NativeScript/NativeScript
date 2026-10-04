import UIKit

/// `ListPicker` from list-picker/index.ios: one UIPickerView component whose
/// rows are the items as strings, drawn in the picker's tint color.
open class ListPicker: View, UIPickerViewDataSource, UIPickerViewDelegate {
    open override class var cssType: String { "ListPicker" }

    private var picker: UIPickerView? { nativeView as? UIPickerView }
    private var items: [Any]?
    /// The coerced value; `applied` keeps the one asked for.
    private var selectedIndex: Double = -1

    open override func createNativeView() -> UIView? { UIPickerView() }

    open override func initNativeView() {
        if applied["selectedIndex"] == nil { applied["selectedIndex"] = -1.0 }
        picker?.dataSource = self
        picker?.delegate = self
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "selectedIndex":
            coerceSelectedIndex()
            if selectedIndex >= 0 { picker?.selectRow(Int(selectedIndex), inComponent: 0, animated: false) }
        case "items":
            items = toArray(value)
            picker?.reloadAllComponents()
            coerceSelectedIndex()
        case "color":
            picker?.tintColor = toColor(value)
        default:
            super.setProperty(name, value)
        }
    }

    /// `selectedIndexProperty`'s coercion: -1 without items, otherwise within them.
    private func coerceSelectedIndex() {
        var next = ListPicker.parseInt(applied["selectedIndex"]) ?? -1
        if let items = toArray(applied["items"]) {
            if next < 0 { next = 0 }
            if next > Double(items.count - 1) { next = Double(items.count - 1) }
        } else {
            next = -1
        }
        guard next != selectedIndex else { return }
        selectedIndex = next
        emit("selectedIndexChange", next)
        if next >= 0 { picker?.selectRow(Int(next), inComponent: 0, animated: false) }
    }

    /// `_getItemAsString`.
    private func itemAsString(_ index: Int) -> String {
        guard let items else { return " " }
        return toText(items[index]) ?? String(index)
    }

    private static func parseInt(_ value: Any?) -> Double? {
        guard let string = value as? String else { return toDouble(value) }
        return parseFloat(string).map { $0.rounded(.towardZero) }
    }

    // MARK: UIPickerViewDataSource, UIPickerViewDelegate

    public func numberOfComponents(in pickerView: UIPickerView) -> Int { 1 }

    public func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int { items?.count ?? 0 }

    public func pickerView(_ pickerView: UIPickerView, attributedTitleForRow row: Int, forComponent component: Int) -> NSAttributedString? {
        NSAttributedString(string: itemAsString(row), attributes: [.foregroundColor: pickerView.tintColor as Any])
    }

    public func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        let index = Double(row)
        guard index != selectedIndex else { return }
        selectedIndex = index
        nativeValueChange("selectedIndex", index)
    }
}
