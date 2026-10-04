import UIKit

/// `DatePicker` from date-picker/index.ios: a UIDatePicker whose date is set
/// from `year`, `month` (1-based), `day` and the time of day, each defaulting to now.
open class DatePicker: View {
    open override class var cssType: String { "DatePicker" }

    private var picker: UIDatePicker? { nativeView as? UIDatePicker }
    private static let components: [(name: String, unit: Calendar.Component)] = [
        ("year", .year), ("month", .month), ("day", .day), ("hour", .hour), ("minute", .minute), ("second", .second),
    ]
    private var date: Date?

    open override func createNativeView() -> UIView? { UIDatePicker() }

    open override func initNativeView() {
        let now = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: Date())
        for (name, unit) in DatePicker.components { if applied[name] == nil { applied[name] = Double(now.value(for: unit) ?? 0) } }
        if applied["showTime"] == nil { applied["showTime"] = false }
        if applied["iosPreferredDatePickerStyle"] == nil { applied["iosPreferredDatePickerStyle"] = 0.0 }
        picker?.addTarget(self, action: #selector(valueChanged(_:)), for: .valueChanged)
    }

    /// `createNativeView` reads the mode and style the template has set by then.
    override func load() {
        if !isLoaded, let picker {
            picker.datePickerMode = (toBool(applied["showTime"]) ?? false) ? .dateAndTime : .date
            picker.preferredDatePickerStyle = DatePicker.style(applied["iosPreferredDatePickerStyle"])
        }
        super.load()
    }

    private func component(_ name: String) -> Int { Int(DatePicker.parseInt(applied[name]) ?? 0) }

    open override func setProperty(_ name: String, _ value: Any?) {
        guard let picker else { return super.setProperty(name, value) }
        switch name {
        case "year", "month", "day", "hour", "minute", "second":
            // `new Date(year, month - 1, day, hour || 0, minute || 0, second || 0)`, overflow rolling over.
            var parts = DateComponents()
            parts.year = component("year")
            parts.month = component("month")
            parts.day = component("day")
            parts.hour = component("hour")
            parts.minute = component("minute")
            parts.second = component("second")
            if let next = Calendar.current.date(from: parts) { setDate(next) }
        case "showTime":
            picker.datePickerMode = (toBool(value) ?? false) ? .dateAndTime : .date
        case "iosPreferredDatePickerStyle":
            picker.preferredDatePickerStyle = DatePicker.style(value)
        case "minDate":
            picker.minimumDate = DatePicker.parseDate(value)
        case "maxDate":
            picker.maximumDate = DatePicker.parseDate(value)
        default:
            super.setProperty(name, value)
        }
    }

    /// `dateProperty.setNative`: the components follow the date, which the picker shows.
    private func setDate(_ next: Date) {
        guard next != date else { return }
        date = next
        let parts = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: next)
        for (name, unit) in DatePicker.components where Double(parts.value(for: unit) ?? 0) != DatePicker.parseInt(applied[name]) {
            set(name, Double(parts.value(for: unit) ?? 0))
        }
        picker?.setDate(Calendar.current.date(from: parts) ?? next, animated: false)
    }

    @objc private func valueChanged(_ sender: UIDatePicker) {
        let parts = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: sender.date)
        var changed = false
        for (name, unit) in DatePicker.components {
            let value = Double(parts.value(for: unit) ?? 0)
            if value != DatePicker.parseInt(applied[name]) {
                nativeValueChange(name, value)
                changed = true
            }
        }
        if changed {
            date = Calendar.current.date(from: parts)
            emit("dateChange", date)
        }
    }

    static func style(_ value: Any?) -> UIDatePickerStyle {
        UIDatePickerStyle(rawValue: Int(parseInt(value) ?? 0)) ?? .automatic
    }

    static func parseInt(_ value: Any?) -> Double? {
        guard let string = value as? String else { return toDouble(value) }
        return parseFloat(string).map { $0.rounded(.towardZero) }
    }

    /// `new Date(string)` for an ISO date, which JavaScript reads as UTC midnight.
    private static func parseDate(_ value: Any?) -> Date? {
        guard let string = toText(value) else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return formatter.date(from: string)
    }
}

/// `TimePicker` from time-picker/index.ios: a UIDatePicker in time mode whose
/// date is the hour and minute alone, starting at the current time.
open class TimePicker: View {
    open override class var cssType: String { "TimePicker" }

    private var picker: UIDatePicker? { nativeView as? UIDatePicker }

    open override func createNativeView() -> UIView? {
        let picker = UIDatePicker()
        picker.datePickerMode = .time
        return picker
    }

    public override init() {
        super.init()
        let now = Calendar.current.dateComponents([.hour, .minute], from: Date())
        set("hour", Double(now.hour ?? 0))
        set("minute", Double(now.minute ?? 0))
    }

    open override func initNativeView() {
        if applied["iosPreferredDatePickerStyle"] == nil { applied["iosPreferredDatePickerStyle"] = 0.0 }
        if applied["minuteInterval"] == nil { applied["minuteInterval"] = 1.0 }
        picker?.addTarget(self, action: #selector(valueChanged(_:)), for: .valueChanged)
    }

    override func load() {
        if !isLoaded { picker?.preferredDatePickerStyle = DatePicker.style(applied["iosPreferredDatePickerStyle"]) }
        super.load()
    }

    private var hour: Int { Int(DatePicker.parseInt(applied["hour"]) ?? 0) }
    private var minute: Int { Int(DatePicker.parseInt(applied["minute"]) ?? 0) }

    /// `getDate`: a date of only an hour and a minute.
    private static func date(_ hour: Int, _ minute: Int) -> Date? {
        var parts = DateComponents()
        parts.hour = hour
        parts.minute = minute
        return Calendar.current.date(from: parts)
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        guard let picker else { return super.setProperty(name, value) }
        let number = Int(DatePicker.parseInt(value) ?? 0)
        switch name {
        case "hour":
            if let date = TimePicker.date(number, minute) { picker.date = date }
        case "minute":
            if let date = TimePicker.date(hour, number) { picker.date = date }
        case "minHour":
            picker.minimumDate = TimePicker.date(number, minute)
        case "maxHour":
            picker.maximumDate = TimePicker.date(number, minute)
        case "minMinute":
            picker.minimumDate = TimePicker.date(hour, number)
        case "maxMinute":
            picker.maximumDate = TimePicker.date(hour, number)
        case "minuteInterval":
            picker.minuteInterval = number
        case "iosPreferredDatePickerStyle":
            picker.preferredDatePickerStyle = DatePicker.style(value)
        default:
            super.setProperty(name, value)
        }
    }

    @objc private func valueChanged(_ sender: UIDatePicker) {
        let parts = Calendar.current.dateComponents([.hour, .minute], from: sender.date)
        let hour = Double(parts.hour ?? 0), minute = Double(parts.minute ?? 0)
        var changed = false
        if hour != DatePicker.parseInt(applied["hour"]) {
            nativeValueChange("hour", hour)
            changed = true
        }
        if minute != DatePicker.parseInt(applied["minute"]) {
            nativeValueChange("minute", minute)
            changed = true
        }
        if changed { emit("timeChange", nil) }
    }
}
