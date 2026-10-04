package org.nativescript.kit

import android.text.TextPaint
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.AbsoluteSizeSpan
import android.text.style.BackgroundColorSpan
import android.text.style.ClickableSpan
import android.text.style.ForegroundColorSpan
import android.text.style.MetricAffectingSpan
import android.text.style.StrikethroughSpan
import android.text.style.UnderlineSpan

/**
 * `FormattedString` from text/formatted-string: a text view's spans. Its
 * style reaches the spans by inheritance; a change to any span re-renders
 * the text view's spannable text.
 */
open class FormattedString : View() {
    override val cssType: String get() = "FormattedString"

    internal val spans = mutableListOf<Span>()

    internal val textBase: TextBase? get() = parent as? TextBase

    override fun addChild(child: View) {
        val span = child as? Span ?: return
        spans.add(span)
        addView(span)
        changed()
    }

    override fun eachChildView(body: (View) -> Unit) {
        spans.forEach(body)
    }

    internal fun changed() {
        textBase?.formattedTextChanged()
    }

    override fun setProperty(name: String, value: Any?) {
        changed()
    }

    /** `toString`: the spans' text, as `textProperty.nativeValueChange` reports it. */
    override fun toString(): String = spans.joinToString("") { toText(it.applied["text"]) ?: "" }
}

/** `Span` from text/span: a run of text with its own style. */
open class Span : View() {
    override val cssType: String get() = "Span"

    internal val formattedString: FormattedString? get() = parent as? FormattedString

    /** `tappable`: a span with a `linkTap` handler is clickable. */
    internal val tappable: Boolean get() = hasHandlers("linkTap")

    override fun setProperty(name: String, value: Any?) {
        formattedString?.changed()
    }

    override fun eventSubscribed(event: String) {
        if (event == "linkTap") formattedString?.changed()
    }

    internal fun linkTapped() = emit("linkTap", null)
}

/** `createSpannableStringBuilder`: each span's text with its modifiers, or null without a parent. */
internal fun createSpannableStringBuilder(formatted: FormattedString, defaultFontSize: Double?): SpannableStringBuilder? {
    val parent = formatted.textBase ?: return null
    val ssb = SpannableStringBuilder()
    var start = 0
    val transform = toText(parent.applied["textTransform"])
    for (span in formatted.spans) {
        var text = toText(span.applied["text"]) ?: ""
        if (transform != null && transform != "none") text = TextBase.transformedText(text, transform)
        if (text.isEmpty()) continue
        ssb.insert(start, text)
        setSpanModifiers(ssb, span, start, start + text.length, defaultFontSize)
        start += text.length
    }
    return ssb
}

private fun setSpanModifiers(ssb: SpannableStringBuilder, span: Span, start: Int, end: Int, defaultFontSize: Double?) {
    val style = span.applied
    val flags = Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
    val font = Font.of(style)
    ssb.setSpan(org.nativescript.widgets.CustomTypefaceSpan(font.typeface()), start, end, flags)
    toDouble(style["fontSize"])?.let { if (it != 0.0) ssb.setSpan(AbsoluteSizeSpan(Layout.toDevicePixels(it).toInt()), start, end, flags) }
    toColor(style["color"])?.let { ssb.setSpan(ForegroundColorSpan(it.argb), start, end, flags) }
    val background = toColor(style["backgroundColor"]) ?: toColor(span.formattedString?.applied?.get("backgroundColor"))
    background?.let { ssb.setSpan(BackgroundColorSpan(it.argb), start, end, flags) }
    val decoration = toText(style["textDecoration"]) ?: toText(span.formattedString?.applied?.get("textDecoration")) ?: toText(span.formattedString?.textBase?.applied?.get("textDecoration"))
    if (decoration != null) {
        if (decoration.contains("underline")) ssb.setSpan(UnderlineSpan(), start, end, flags)
        if (decoration.contains("line-through")) ssb.setSpan(StrikethroughSpan(), start, end, flags)
    }
    val align = toText(style["verticalAlignment"])
    if (align != null) ssb.setSpan(BaselineAdjustedSpan(Layout.toDevicePixels(defaultFontSize ?: 0.0).toFloat(), align), start, end, flags)
    if (span.tappable) ssb.setSpan(SpanClick(span), start, end, flags)
}

/** `ClickableSpanImpl`: the span's `linkTap`, drawn without the platform's link styling. */
private class SpanClick(private val span: Span) : ClickableSpan() {
    override fun onClick(widget: android.view.View) {
        span.linkTapped()
        widget.clearFocus()
        widget.invalidate()
    }

    override fun updateDrawState(ds: TextPaint) {}
}

/** `BaselineAdjustedSpanImpl`: a span's `vertical-align`. */
private class BaselineAdjustedSpan(private val fontSize: Float, private val align: String) : MetricAffectingSpan() {
    override fun updateDrawState(tp: TextPaint) = updateState(tp)
    override fun updateMeasureState(tp: TextPaint) = updateState(tp)

    private fun updateState(paint: TextPaint) {
        val metrics = paint.fontMetrics
        paint.baselineShift = when (align) {
            "top" -> (-fontSize - metrics.bottom - metrics.top).toInt()
            "bottom" -> metrics.bottom.toInt()
            "text-top" -> (-fontSize - metrics.descent - metrics.ascent).toInt()
            "text-bottom" -> (metrics.bottom - metrics.descent).toInt()
            "middle" -> ((metrics.descent - metrics.ascent) / 2 - metrics.descent).toInt()
            "sup" -> (-fontSize * 0.4).toInt()
            "sub" -> ((metrics.descent - metrics.ascent) * 0.4).toInt()
            else -> return
        }
    }
}
