package org.nativescript.kit

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Paint
import android.graphics.Typeface
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.InputFilter
import android.text.InputType
import android.text.TextUtils
import android.text.TextWatcher
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.TextView as NativeTextView
import org.nativescript.widgets.StyleableTextView
import org.nativescript.widgets.ViewHelper

/** `Font` from styling/font.android: the typeface core builds from family, weight and style. */
internal class Font(val family: String?, val size: Double?, val style: String, val weight: String) {
    /** `Font.equals(Font.default, font)`: such a font is unset and the native default stays. */
    val isDefault: Boolean get() = family == null && size == null && style == "normal" && weight == "normal"

    private val isItalic: Boolean get() = style == "italic"

    private val numericWeight: Int
        get() = when (weight) {
            "normal" -> 400
            "bold" -> 700
            else -> parseIntOrNull(weight) ?: 400
        }

    fun typeface(): Typeface {
        val families = parseFontFamily(family)
        if (Build.VERSION.SDK_INT >= 28) {
            for (f in families) {
                val base = when (f.lowercase()) {
                    "serif" -> Typeface.SERIF
                    "sans-serif", "system" -> Typeface.SANS_SERIF
                    "monospace" -> Typeface.MONOSPACE
                    else -> null
                }
                if (base != null) return Typeface.create(base, numericWeight, isItalic)
            }
            return Typeface.create(Typeface.SANS_SERIF, numericWeight, isItalic)
        }
        var style = 0
        if (weight == "bold" || weight == "700" || weight == "800" || weight == "900") style = style or Typeface.BOLD
        if (isItalic) style = style or Typeface.ITALIC
        val suffix = when (weight) {
            "100" -> "-thin"
            "200", "300" -> "-light"
            "500", "600" -> "-medium"
            "900" -> "-black"
            else -> ""
        }
        for (f in families) {
            val name = when (f.lowercase()) {
                "serif" -> "serif"
                "sans-serif", "system" -> "sans-serif"
                "monospace" -> "monospace"
                else -> null
            }
            if (name != null) return Typeface.create(name + suffix, style)
        }
        return Typeface.create("sans-serif$suffix", style)
    }

    companion object {
        fun of(values: Map<String, Any>): Font = Font(
            family = toText(values["fontFamily"])?.takeIf { it.isNotBlank() },
            size = toDouble(values["fontSize"]),
            style = toText(values["fontStyle"])?.trim()?.lowercase() ?: "normal",
            weight = toText(values["fontWeight"])?.trim()?.lowercase() ?: "normal",
        )

        private fun parseFontFamily(value: String?): List<String> =
            value?.split(',')?.map { it.trim().trim('"', '\'') }?.filter { it.isNotEmpty() } ?: emptyList()
    }
}

/** `TextBase` from text-base/index.android. */
abstract class TextBase : View() {
    protected val textView: NativeTextView get() = nativeView as NativeTextView

    private var defaultTypeface: Typeface? = null
    private var defaultTextSize = 0f
    private var defaultTextColors: ColorStateList? = null
    private var defaultLineSpacingExtra = 0f
    private var defaultLetterSpacing = 0f
    private var defaultGravity = 0
    private var defaultShadowRadius = 0f
    private var defaultShadowDx = 0f
    private var defaultShadowDy = 0f
    private var defaultShadowColor = 0
    private var defaultMovementMethod: android.text.method.MovementMethod? = null
    private var defaultTransformationMethod: android.text.method.TransformationMethod? = null
    private var tappable = false

    /** The `formattedText` child, whose spans are the text when it is set. */
    internal var formattedString: FormattedString? = null
        private set

    override fun addChild(child: View) {
        val formatted = child as? FormattedString ?: return
        formattedString?.let { removeView(it) }
        formattedString = formatted
        addView(formatted)
        formattedTextChanged()
    }

    override fun eachChildView(body: (View) -> Unit) {
        formattedString?.let(body)
    }

    /** `_onFormattedTextContentsChanged`: the spannable text is rebuilt. */
    internal fun formattedTextChanged() {
        if (isLoaded) setFormattedNative()
    }

    /** `formattedTextProperty.setNative`. */
    private fun setFormattedNative() {
        val formatted = formattedString ?: return
        val tv = textView
        if (toBool(applied["secure"]) == true) return
        val ssb = createSpannableStringBuilder(formatted, toDouble(applied["fontSize"]))
        tv.text = ssb
        setTappableState(formatted.spans.any { it.tappable })
        nativeValueChange("text", formatted.toString())
        if (ssb != null && tv is android.widget.Button && tv.transformationMethod !is FormattedTransformation) {
            tv.transformationMethod = FormattedTransformation(this)
        }
    }

    private fun setTappableState(value: Boolean) {
        if (tappable == value) return
        tappable = value
        val tv = textView
        if (value) {
            tv.setSingleLine(false)
            tv.movementMethod = android.text.method.LinkMovementMethod.getInstance()
            tv.highlightColor = 0
        } else tv.movementMethod = defaultMovementMethod
    }

    /** `TextTransformationImpl`: the formatted text, or the text as `text-transform` shows it. */
    private class FormattedTransformation(private val owner: TextBase) : android.text.method.TransformationMethod {
        override fun getTransformation(source: CharSequence?, view: android.view.View?): CharSequence? {
            val formatted = owner.formattedString
            if (formatted != null) return createSpannableStringBuilder(formatted, toDouble(owner.applied["fontSize"]))
            return transformedText(toText(owner.applied["text"]) ?: "", toText(owner.applied["textTransform"]))
        }

        override fun onFocusChanged(view: android.view.View?, sourceText: CharSequence?, focused: Boolean, direction: Int, previouslyFocusedRect: android.graphics.Rect?) {}
    }

    override fun initNativeView() {
        super.initNativeView()
        val tv = textView
        tv.includeFontPadding = false
        defaultTypeface = tv.typeface
        defaultTextSize = tv.textSize
        defaultTextColors = tv.textColors
        defaultLineSpacingExtra = tv.lineSpacingExtra
        defaultLetterSpacing = ViewHelper.getLetterspacing(tv)
        defaultShadowRadius = tv.shadowRadius
        defaultShadowDx = tv.shadowDx
        defaultShadowDy = tv.shadowDy
        defaultShadowColor = tv.shadowColor
        defaultMovementMethod = tv.movementMethod
        defaultTransformationMethod = tv.transformationMethod
    }

    override fun onLoaded() {
        super.onLoaded()
        if (formattedString != null) setFormattedNative()
    }

    /** The alignment an unset `text-align` means for this view. */
    protected open val initialTextAlignment: String get() = "initial"

    override fun setProperty(name: String, value: Any?) {
        val tv = textView
        when (name) {
            "text" -> if (formattedString == null) {
                setTappableState(false)
                setNativeText()
            }
            "textTransform" -> {
                val transform = toText(value)?.trim()
                if (transform == null || transform == "initial") tv.transformationMethod = defaultTransformationMethod
                else if (toBool(applied["secure"]) != true) tv.transformationMethod = FormattedTransformation(this)
                if (formattedString != null) setFormattedNative() else setNativeText()
            }
            "textStroke" -> if (formattedString == null) setNativeText()
            "color" -> if (formattedString == null) {
                val color = toColor(value)
                if (color != null) tv.setTextColor(color.argb) else defaultTextColors?.let { tv.setTextColor(it) }
                if (applied["textStroke"] != null) setNativeText()
            }
            "fontSize" -> {
                val size = toDouble(value)
                if (formattedString == null) {
                    if (size != null) tv.textSize = size.toFloat() else tv.setTextSize(TypedValue.COMPLEX_UNIT_PX, defaultTextSize)
                }
                fontChanged()
                if (formattedString != null) setFormattedNative()
            }
            "fontFamily", "fontStyle", "fontWeight" -> fontChanged()
            "textAlignment" -> setTextAlignment((value as? String)?.trim() ?: initialTextAlignment)
            "textDecoration" -> tv.paintFlags = when ((value as? String)?.trim()) {
                "underline" -> Paint.UNDERLINE_TEXT_FLAG
                "line-through" -> Paint.STRIKE_THRU_TEXT_FLAG
                "underline line-through" -> Paint.UNDERLINE_TEXT_FLAG or Paint.STRIKE_THRU_TEXT_FLAG
                else -> 0
            }
            "textShadow" -> {
                val shadow = toText(value)?.let { CSSShadow.parse(it) }
                if (shadow == null) tv.setShadowLayer(defaultShadowRadius, defaultShadowDx, defaultShadowDy, defaultShadowColor)
                else tv.setShadowLayer(
                    shadow.blurRadius.toDevicePixels(java.lang.Float.MIN_VALUE.toDouble()).toFloat(),
                    shadow.offsetX.toDevicePixels(0.0).toFloat(), shadow.offsetY.toDevicePixels(0.0).toFloat(),
                    shadow.color?.argb ?: 0,
                )
            }
            "direction" -> {
                if (effectiveWhiteSpace == "nowrap" || (toInt(applied["maxLines"]) ?: 0) > 0) {
                    tv.ellipsize = if (toText(value)?.trim() == "rtl") TextUtils.TruncateAt.START else TextUtils.TruncateAt.END
                }
                super.setProperty(name, value)
            }
            "whiteSpace", "textOverflow" -> adjustLineBreak()
            "letterSpacing" -> ViewHelper.setLetterspacing(tv, toDouble(value)?.toFloat() ?: defaultLetterSpacing)
            "lineHeight" -> {
                val height = toDouble(value)
                tv.setLineSpacing(if (height != null) (height * Layout.density).toFloat() else defaultLineSpacingExtra, 1f)
            }
            "maxLines" -> {
                val lines = toInt(value) ?: 0
                if (lines <= 0) {
                    tv.maxLines = Int.MAX_VALUE
                } else {
                    tv.maxLines = lines
                    tv.ellipsize = TextUtils.TruncateAt.END
                }
            }
            else -> super.setProperty(name, value)
        }
    }

    private fun fontChanged() {
        if (formattedString != null) return
        val font = Font.of(applied)
        textView.typeface = if (font.isDefault) defaultTypeface else font.typeface()
    }

    /** `_setNativeText`: the text as `text-transform` shows it. */
    protected open fun setNativeText() {
        val tv = textView
        val text = toText(applied["text"])
        if (text == null) {
            tv.text = null
            return
        }
        if (tv is StyleableTextView) {
            val stroke = toText(applied["textStroke"])?.let { CSSShadow.parse(it) }
            if (stroke != null) tv.setTextStroke(stroke.offsetX.toDevicePixels(0.0).toInt(), stroke.color?.argb ?: 0, toColor(applied["color"])?.argb ?: 0)
            else tv.setTextStroke(0, 0, 0)
        }
        tv.text = transformedText(text, toText(applied["textTransform"]))
    }

    private fun setTextAlignment(value: String) {
        val tv = textView
        val vertical = tv.gravity and Gravity.VERTICAL_GRAVITY_MASK
        val resolved = if (value == "initial") initialTextAlignment else value
        tv.gravity = when (resolved) {
            "left", "justify" -> Gravity.LEFT or vertical
            "center" -> Gravity.CENTER_HORIZONTAL or vertical
            "right" -> Gravity.RIGHT or vertical
            else -> Gravity.START or vertical
        }
        if (Build.VERSION.SDK_INT >= 26) {
            tv.justificationMode = if (resolved == "justify") android.text.Layout.JUSTIFICATION_MODE_INTER_WORD else android.text.Layout.JUSTIFICATION_MODE_NONE
        }
    }

    /** `adjustLineBreak`, with the white-space an unset value means for this view. */
    protected open fun adjustLineBreak() {
        val tv = textView
        when (effectiveWhiteSpace) {
            "initial", "normal", "wrap" -> {
                tv.setSingleLine(false)
                tv.ellipsize = null
            }
            "nowrap" -> {
                when (toText(applied["textOverflow"])?.trim() ?: "initial") {
                    "initial", "ellipsis" -> tv.setSingleLine(true)
                    else -> tv.setSingleLine(false)
                }
                tv.ellipsize = TextUtils.TruncateAt.END
            }
        }
    }

    protected open val effectiveWhiteSpace: String get() = toText(applied["whiteSpace"])?.trim() ?: "initial"

    override fun applyPadding() {
        textView.setPadding(
            effectivePaddingLeft + effectiveBorderLeftWidth,
            effectivePaddingTop + effectiveBorderTopWidth,
            effectivePaddingRight + effectiveBorderRightWidth,
            effectivePaddingBottom + effectiveBorderBottomWidth,
        )
    }

    companion object {
        internal fun transformedText(text: String, transform: String?): String = when (transform?.trim()) {
            "uppercase" -> org.nativescript.widgets.Utils.stringToUpperCase(text)
            "lowercase" -> org.nativescript.widgets.Utils.stringToLowerCase(text)
            "capitalize" -> org.nativescript.widgets.Utils.capitalizeString(text)
            else -> text
        }
    }
}

/** `Label` from label/index.android: a single-line, vertically centered styleable text view by default. */
open class Label : TextBase() {
    override val cssType: String get() = "Label"

    override fun createNativeView(): NativeView = StyleableTextView(context)

    override fun initNativeView() {
        super.initNativeView()
        val tv = textView
        tv.setSingleLine(true)
        tv.ellipsize = TextUtils.TruncateAt.END
        tv.gravity = Gravity.CENTER_VERTICAL
    }

    override val effectiveWhiteSpace: String
        get() = super.effectiveWhiteSpace.let { if (it == "initial") "nowrap" else it }

    override fun setProperty(name: String, value: Any?) {
        if (name == "textWrap") {
            set("whiteSpace", if (toBool(value) == true) "normal" else "nowrap")
        } else {
            super.setProperty(name, value)
        }
    }
}

/** `Button` from button/index.android: taps come from its click listener, not a gesture observer. */
open class Button : TextBase() {
    override val cssType: String get() = "Button"

    override val needsNativeDrawableFill: Boolean get() = true

    override val initialTextAlignment: String get() = "center"

    override fun createNativeView(): NativeView = android.widget.Button(context)

    override fun initNativeView() {
        super.initNativeView()
        val button = nativeView as android.widget.Button
        button.isAllCaps = false
        button.setOnClickListener { emit("tap", null) }
    }

    override val ownEvents: Set<String> get() = setOf("tap")
}

/** `EditableTextBase` from editable-text-base/index.android: an EditText reporting its text, focus and return key. */
abstract class EditableTextBase : TextBase() {
    private var changeFromCode = false
    protected val editText: EditText get() = nativeView as EditText

    override fun createNativeView(): NativeView = EditText(context)

    /** `_configureEditText`: the input type and lines a TextField or TextView starts with. */
    protected abstract fun configureEditText(edit: EditText)

    override fun initNativeView() {
        super.initNativeView()
        val edit = editText
        configureEditText(edit)
        edit.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                if (!changeFromCode) nativeValueChange("text", s?.toString() ?: "")
            }
        })
        edit.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                emit("focus", null)
            } else {
                emit("blur", null)
                dismissSoftInputLater()
            }
        }
        edit.setOnEditorActionListener { view, actionId, event ->
            val isDone = actionId == EditorInfo.IME_ACTION_DONE || actionId == EditorInfo.IME_ACTION_UNSPECIFIED ||
                (event != null && event.keyCode == KeyEvent.KEYCODE_ENTER)
            if (isDone) {
                if (view.maxLines == 1) dismissSoftInput()
                emit("returnPress", null)
            } else if (actionId == EditorInfo.IME_ACTION_NEXT || actionId == EditorInfo.IME_ACTION_PREVIOUS) {
                emit("returnPress", null)
            }
            false
        }
    }

    override fun setProperty(name: String, value: Any?) {
        val edit = editText
        when (name) {
            "text" -> {
                changeFromCode = true
                try {
                    setNativeText()
                } finally {
                    changeFromCode = false
                }
            }
            "textTransform" -> {}
            "hint" -> edit.hint = toText(value)
            "placeholderColor" -> {
                val color = toColor(value)
                if (color != null) edit.setHintTextColor(color.argb)
            }
            "secure", "keyboardType" -> if (this is TextField) setInputType(inputTypeFor(toBool(applied["secure"]) == true, toText(applied["keyboardType"])))
            "editable" -> {
                val editable = toBool(value) ?: true
                edit.isFocusable = editable
                edit.isFocusableInTouchMode = editable
                edit.isLongClickable = editable
                edit.isClickable = editable
            }
            "returnKeyType" -> edit.imeOptions = when (toText(value)?.trim()) {
                "done" -> EditorInfo.IME_ACTION_DONE
                "go" -> EditorInfo.IME_ACTION_GO
                "next" -> EditorInfo.IME_ACTION_NEXT
                "search" -> EditorInfo.IME_ACTION_SEARCH
                "send" -> EditorInfo.IME_ACTION_SEND
                else -> toInt(value) ?: EditorInfo.IME_ACTION_UNSPECIFIED
            }
            "maxLength" -> {
                val max = toInt(value)
                val others = edit.filters.filter { it !is InputFilter.LengthFilter }
                edit.filters = (if (max == null) others else others + InputFilter.LengthFilter(max)).toTypedArray()
            }
            else -> super.setProperty(name, value)
        }
    }

    private fun setInputType(type: Int) {
        changeFromCode = true
        try {
            editText.inputType = type
        } finally {
            changeFromCode = false
        }
    }

    /** `setSecureAndKeyboardType`. */
    private fun inputTypeFor(secure: Boolean, keyboardType: String?): Int {
        keyboardType?.trim()?.toIntOrNull()?.let { return it }
        if (secure) {
            return if (keyboardType == "number") InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_VARIATION_PASSWORD
            else InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        return when (keyboardType?.trim()) {
            "datetime" -> InputType.TYPE_CLASS_DATETIME or InputType.TYPE_DATETIME_VARIATION_NORMAL
            "phone" -> InputType.TYPE_CLASS_PHONE
            "number" -> InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_VARIATION_NORMAL or InputType.TYPE_NUMBER_FLAG_SIGNED or InputType.TYPE_NUMBER_FLAG_DECIMAL
            "decimal" -> InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL or InputType.TYPE_NUMBER_FLAG_SIGNED
            "url" -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI
            "email" -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
            "integer" -> InputType.TYPE_CLASS_NUMBER
            else -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_NORMAL
        }
    }

    private fun dismissSoftInput() {
        val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(editText.windowToken, 0)
    }

    /** A blur not followed by focus on another text field closes the keyboard. */
    private fun dismissSoftInputLater() {
        Handler(Looper.getMainLooper()).postDelayed({
            val focused = NativeScriptActivity.current.currentFocus
            if (focused != null && focused !is EditText) {
                val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imm.hideSoftInputFromWindow(focused.windowToken, 0)
            }
        }, 10)
    }
}

/** `TextField` from text-field/index.android: one line, scrolling horizontally. */
open class TextField : EditableTextBase() {
    override val cssType: String get() = "TextField"

    override fun configureEditText(edit: EditText) {
        edit.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_NORMAL or
            InputType.TYPE_TEXT_FLAG_CAP_SENTENCES or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
        edit.setLines(1)
        edit.maxLines = 1
        edit.setHorizontallyScrolling(true)
    }
}

/** `TextView` from text-view/index.android: multi-line text, top-aligned. */
open class TextView : EditableTextBase() {
    override val cssType: String get() = "TextView"

    override fun configureEditText(edit: EditText) {
        edit.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_NORMAL or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES or
            InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
        edit.gravity = Gravity.TOP or Gravity.START
    }
}
