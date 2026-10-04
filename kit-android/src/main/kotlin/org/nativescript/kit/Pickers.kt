package org.nativescript.kit

import android.text.InputFilter
import android.widget.EditText
import android.widget.NumberPicker
import java.util.Calendar

/** `parseInt`, the value converter of the pickers' numeric properties, for values written as text. */
private fun parsedInt(value: Any?): Any? = if (value is String) parseIntOrNull(value.trim())?.toDouble() ?: Double.NaN else value

private val today = JSDate()

/**
 * `DatePicker` from date-picker/index.android: the platform spinner picker,
 * whose year, month (from 1) and day each follow the date it shows.
 */
open class DatePicker : View() {
    override val cssType: String get() = "DatePicker"

    private val picker: android.widget.DatePicker get() = nativeView as android.widget.DatePicker

    private val year: Double get() = toDouble(applied["year"]) ?: today.getFullYear()
    private val month: Double get() = toDouble(applied["month"]) ?: (today.getMonth() + 1)
    private val day: Double get() = toDouble(applied["day"]) ?: today.getDate()

    override fun defaultValue(name: String): Any? = when (name) {
        "year" -> today.getFullYear()
        "month" -> today.getMonth() + 1
        "day" -> today.getDate()
        else -> null
    }

    @Suppress("DEPRECATION")
    override fun createNativeView(): NativeView = android.widget.DatePicker(context).also { it.calendarViewShown = false }

    override fun initNativeView() {
        super.initNativeView()
        picker.init(year.toInt(), month.toInt() - 1, day.toInt()) { _, y, m, d ->
            var changed = false
            if (y.toDouble() != year) {
                nativeValueChange("year", y.toDouble())
                changed = true
            }
            if (m.toDouble() != month - 1) {
                nativeValueChange("month", m + 1.0)
                changed = true
            }
            if (d.toDouble() != day) {
                nativeValueChange("day", d.toDouble())
                changed = true
            }
            if (changed) nativeValueChange("date", JSDate(y.toDouble(), m.toDouble(), d.toDouble()))
        }
    }

    override fun coerce(name: String, value: Any?): Any? = when (name) {
        "year", "month", "day" -> parsedInt(value)
        "date", "minDate", "maxDate" -> if (value is String) JSDate(value) else value
        else -> value
    }

    /** `updateNativeDate`: the date the year, month and day make, set as the `date` property. */
    private fun updateNativeDate() {
        val y = toDouble(applied["year"]) ?: picker.year.toDouble()
        val m = toDouble(applied["month"])?.minus(1) ?: picker.month.toDouble()
        val d = toDouble(applied["day"]) ?: picker.dayOfMonth.toDouble()
        set("date", JSDate(y, m, d))
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "year" -> if (picker.year.toDouble() != toDouble(value)) updateNativeDate()
            "month" -> if (picker.month.toDouble() != (toDouble(value) ?: Double.NaN) - 1) updateNativeDate()
            "day" -> if (picker.dayOfMonth.toDouble() != toDouble(value)) updateNativeDate()
            "date" -> {
                val date = value as? JSDate ?: return
                if (picker.dayOfMonth.toDouble() != date.getDate() || picker.month.toDouble() != date.getMonth() || picker.year.toDouble() != date.getFullYear()) {
                    picker.updateDate(date.getFullYear().toInt(), date.getMonth().toInt(), date.getDate().toInt())
                }
            }
            "maxDate" -> (value as? JSDate)?.let { picker.maxDate = it.getTime().toLong() }
            "minDate" -> (value as? JSDate)?.let { picker.minDate = it.getTime().toLong() }
            else -> super.setProperty(name, value)
        }
    }
}

/**
 * `TimePicker` from time-picker/index.android: hour and minute each follow
 * `time`, kept within the minimum, maximum and minute interval.
 */
open class TimePicker : View() {
    override val cssType: String get() = "TimePicker"

    private var updatingNativeValue = false
    private val picker: android.widget.TimePicker get() = nativeView as android.widget.TimePicker

    private val minuteInterval: Int get() = toInt(applied["minuteInterval"]) ?: 1

    override fun createNativeView(): NativeView = android.widget.TimePicker(context)

    override fun initNativeView() {
        super.initNativeView()
        picker.setOnTimeChangedListener { _, h, m ->
            if (updatingNativeValue) return@setOnTimeChangedListener
            val (hour, minute) = validTime(h, m)
            nativeValueChange("time", JSDate(0.0, 0.0, 0.0, hour.toDouble(), minute.toDouble()))
        }
        val calendar = Calendar.getInstance()
        val hour = toInt(applied["hour"]) ?: calendar.get(Calendar.HOUR_OF_DAY)
        val minute = toInt(applied["minute"]) ?: calendar.get(Calendar.MINUTE)
        val (h, m) = validTime(hour, minute)
        if (!isSet("time")) set("time", JSDate(0.0, 0.0, 0.0, h.toDouble(), m.toDouble()))
    }

    /** `getValidTime`: the minute snapped to the interval, the time clamped to the range. */
    private fun validTime(hour: Int, minute: Int): Pair<Int, Int> {
        var h = hour
        var m = minute
        val interval = minuteInterval
        if (interval > 1) {
            val floor = m - (m % interval)
            m = floor + (if (m == floor + 1) interval else 0)
            if (m == 60) {
                h++
                m = 0
            }
        }
        val total = h * 60 + m
        val maxHour = toInt(applied["maxHour"]) ?: 23
        val maxMinute = toInt(applied["maxMinute"]) ?: 59
        val minHour = toInt(applied["minHour"]) ?: 0
        val minMinute = toInt(applied["minMinute"]) ?: 0
        var time = Pair(h, m)
        if (total > maxHour * 60 + maxMinute) time = Pair(maxHour, maxMinute)
        if (total < minHour * 60 + minMinute) time = Pair(minHour, minMinute)
        return time
    }

    override fun coerce(name: String, value: Any?): Any? = when (name) {
        "hour", "minute", "minHour", "maxHour", "minMinute", "maxMinute", "minuteInterval" -> parsedInt(value)
        else -> value
    }

    override fun propertyValueChanged(name: String, value: Any?) {
        super.propertyValueChanged(name, value)
        when (name) {
            "hour", "minute" -> {
                val hour = toDouble(applied["hour"]) ?: 0.0
                val minute = toDouble(applied["minute"]) ?: 0.0
                set("time", JSDate(0.0, 0.0, 0.0, hour, minute))
            }
            "time" -> {
                val time = value as? JSDate ?: return
                set("hour", time.getHours())
                set("minute", time.getMinutes())
            }
        }
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "hour" -> withoutNativeChange { picker.hour = toInt(value) ?: 0 }
            "minute" -> withoutNativeChange { picker.minute = toInt(value) ?: 0 }
            else -> super.setProperty(name, value)
        }
    }

    private fun withoutNativeChange(body: () -> Unit) {
        updatingNativeValue = true
        try {
            body()
        } finally {
            updatingNativeValue = false
        }
    }
}

/**
 * `ListPicker` from list-picker/index.android: a NumberPicker over the
 * items' indexes, formatted as the items' text.
 */
open class ListPicker : View() {
    override val cssType: String get() = "ListPicker"

    private val picker: NumberPicker get() = nativeView as NumberPicker
    private var editText: EditText? = null
    private var formatter: NumberPicker.Formatter? = null
    private var defaultTextColor: Int? = null

    private val items: List<Any?>? get() = toList(applied["items"])

    override fun defaultValue(name: String): Any? = if (name == "selectedIndex") -1.0 else null

    override fun createNativeView(): NativeView = NumberPicker(context).also {
        it.descendantFocusability = NumberPicker.FOCUS_BLOCK_DESCENDANTS
        it.minValue = 0
        it.maxValue = 0
        it.value = 0
        it.wrapSelectorWheel = false
    }

    override fun initNativeView() {
        super.initNativeView()
        val picker = picker
        val formatter = NumberPicker.Formatter { itemAsString(it) }
        this.formatter = formatter
        picker.setFormatter(formatter)
        picker.setOnValueChangedListener { _, _, index ->
            nativeValueChange("selectedIndex", index.toDouble())
            updateSelectedValue(index)
        }
        editText = (0 until picker.childCount).map { picker.getChildAt(it) }.firstOrNull { it is EditText } as EditText?
        editText?.let {
            // A formatter's text shows on first render only without the input filters.
            it.filters = arrayOf<InputFilter>()
            // A picker always has an item; with no items it shows a blank one.
            it.setText(" ", android.widget.TextView.BufferType.NORMAL)
        }
        defaultTextColor = picker.textColor
    }

    /** `_getItemAsString`. */
    private fun itemAsString(index: Int): String {
        val items = items ?: return " "
        val item = items.getOrNull(index)
        if (item == null || item === JSNull) return jsToString(index.toDouble())
        val field = toText(applied["textField"])
        return if (!field.isNullOrEmpty()) jsToString(jsGet(item, field)) else jsToString(item)
    }

    private fun updateSelectedValue(index: Int) {
        var value: Any? = null
        if (index >= 0) {
            val item = items?.getOrNull(index)
            val field = toText(applied["valueField"])
            value = if (!field.isNullOrEmpty()) jsGet(item, field) else item
        }
        if (!sameValue(applied["selectedValue"], value)) set("selectedValue", value)
    }

    override fun coerce(name: String, value: Any?): Any? {
        if (name != "selectedIndex") return value
        var index = toDouble(parsedInt(value)) ?: -1.0
        val items = items
        if (items != null) {
            val max = items.size - 1.0
            if (index < 0) index = 0.0
            if (index > max) index = max
        } else {
            index = -1.0
        }
        updateSelectedValue(index.toInt())
        return index
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "selectedIndex" -> {
                val index = toInt(value) ?: -1
                if (index >= 0) picker.value = index
            }
            "items" -> {
                val size = toList(value)?.size ?: 0
                picker.maxValue = if (size > 0) size - 1 else 0
                fixNumberPickerRendering()
                refresh("selectedIndex")
            }
            "color" -> {
                val color = toColor(value)?.argb ?: defaultTextColor
                if (color != null) picker.textColor = color
            }
            else -> super.setProperty(name, value)
        }
    }

    /** `_fixNumberPickerRendering`: the picker formats 0 or 1 items only once its formatter is set again. */
    private fun fixNumberPickerRendering() {
        val picker = picker
        picker.setFormatter(null)
        picker.setFormatter(formatter)
        editText?.let {
            it.filters = arrayOf<InputFilter>()
            it.invalidate()
        }
        picker.invalidate()
    }
}
