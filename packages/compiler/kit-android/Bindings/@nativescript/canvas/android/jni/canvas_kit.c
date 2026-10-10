// The C API of @nativescript/canvas's libcanvasnative.so as Kotlin calls it: each function a static
// method of org.nativescript.kit.canvas.CanvasNative, native pointers passed as jlong.

#include <jni.h>
#include <stdint.h>
#include "canvas_native.h"

#define FN(ret, name) JNIEXPORT ret JNICALL Java_org_nativescript_kit_canvas_CanvasNative_##name
#define CTX ((struct CanvasRenderingContext2D *) (intptr_t) context)

static jstring take_string(JNIEnv *env, const char *value) {
    if (value == NULL) return NULL;
    jstring result = (*env)->NewStringUTF(env, value);
    canvas_native_string_destroy((char *) value);
    return result;
}

#define WITH_UTF(str, body)                                     \
    do {                                                        \
        const char *utf = (*env)->GetStringUTFChars(env, str, NULL); \
        body;                                                   \
        (*env)->ReleaseStringUTFChars(env, str, utf);           \
    } while (0)

FN(jlong, contextCreateWithPointer)(JNIEnv *env, jclass cls, jlong pointer) {
    return (jlong) (intptr_t) canvas_native_context_create_with_pointer((int64_t) pointer);
}

FN(void, contextRelease)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_release(CTX); }
FN(void, contextRender)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_render(CTX); }
FN(void, contextResize)(JNIEnv *env, jclass cls, jlong context, jfloat width, jfloat height) { canvas_native_context_resize(CTX, width, height); }

// State

FN(void, setFillColor)(JNIEnv *env, jclass cls, jlong context, jstring color) { WITH_UTF(color, canvas_native_paint_style_set_fill_color_with_c_string(CTX, utf)); }
FN(void, setStrokeColor)(JNIEnv *env, jclass cls, jlong context, jstring color) { WITH_UTF(color, canvas_native_paint_style_set_stroke_color_with_c_string(CTX, utf)); }
FN(jstring, getFillColor)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_paint_style_get_current_fill_color_string(CTX)); }
FN(jstring, getStrokeColor)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_paint_style_get_current_stroke_color_string(CTX)); }
FN(void, setFillStyle)(JNIEnv *env, jclass cls, jlong context, jlong style) { canvas_native_context_set_fill_style(CTX, (const struct PaintStyle *) (intptr_t) style); }
FN(void, setStrokeStyle)(JNIEnv *env, jclass cls, jlong context, jlong style) { canvas_native_context_set_stroke_style(CTX, (const struct PaintStyle *) (intptr_t) style); }

FN(void, setLineWidth)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_line_width(CTX, value); }
FN(jfloat, getLineWidth)(JNIEnv *env, jclass cls, jlong context) { return canvas_native_context_get_line_width(CTX); }
FN(void, setLineCap)(JNIEnv *env, jclass cls, jlong context, jstring value) { WITH_UTF(value, canvas_native_context_set_line_cap(CTX, utf)); }
FN(jstring, getLineCap)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_context_get_line_cap(CTX)); }
FN(void, setLineJoin)(JNIEnv *env, jclass cls, jlong context, jstring value) { WITH_UTF(value, canvas_native_context_set_line_join(CTX, utf)); }
FN(jstring, getLineJoin)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_context_get_line_join(CTX)); }
FN(void, setMiterLimit)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_miter_limit(CTX, value); }
FN(void, setLineDash)(JNIEnv *env, jclass cls, jlong context, jfloatArray dash) {
    jsize size = (*env)->GetArrayLength(env, dash);
    jfloat *values = (*env)->GetFloatArrayElements(env, dash, NULL);
    canvas_native_context_set_line_dash(CTX, values, (uintptr_t) size);
    (*env)->ReleaseFloatArrayElements(env, dash, values, JNI_ABORT);
}
FN(void, setLineDashOffset)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_line_dash_offset(CTX, value); }
FN(jboolean, setFont)(JNIEnv *env, jclass cls, jlong context, jstring value) {
    jboolean ok = JNI_FALSE;
    WITH_UTF(value, ok = canvas_native_context_set_font(CTX, utf) ? JNI_TRUE : JNI_FALSE);
    return ok;
}
FN(jstring, getFont)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_context_get_font(CTX)); }
FN(void, setTextAlign)(JNIEnv *env, jclass cls, jlong context, jstring value) { WITH_UTF(value, canvas_native_context_set_text_align(CTX, utf)); }
FN(jstring, getTextAlign)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_context_get_text_align(CTX)); }
FN(void, setTextBaseline)(JNIEnv *env, jclass cls, jlong context, jstring value) { WITH_UTF(value, canvas_native_context_set_text_baseline_str(CTX, utf)); }
FN(jstring, getTextBaseline)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_context_get_text_baseline_str(CTX)); }
FN(void, setShadowBlur)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_shadow_blur(CTX, value); }
FN(jfloat, getShadowBlur)(JNIEnv *env, jclass cls, jlong context) { return canvas_native_context_get_shadow_blur(CTX); }
FN(void, setShadowColor)(JNIEnv *env, jclass cls, jlong context, jstring value) { WITH_UTF(value, canvas_native_context_set_shadow_color(CTX, utf)); }
FN(jstring, getShadowColor)(JNIEnv *env, jclass cls, jlong context) { return take_string(env, canvas_native_context_get_shadow_color(CTX)); }
FN(void, setShadowOffsetX)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_shadow_offset_x(CTX, value); }
FN(void, setShadowOffsetY)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_shadow_offset_y(CTX, value); }
FN(void, setGlobalAlpha)(JNIEnv *env, jclass cls, jlong context, jfloat value) { canvas_native_context_set_global_alpha(CTX, value); }
FN(jfloat, getGlobalAlpha)(JNIEnv *env, jclass cls, jlong context) { return canvas_native_context_get_global_alpha(CTX); }

// Paths and drawing

FN(void, beginPath)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_begin_path(CTX); }
FN(void, closePath)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_close_path(CTX); }
FN(void, moveTo)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y) { canvas_native_context_move_to(CTX, x, y); }
FN(void, lineTo)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y) { canvas_native_context_line_to(CTX, x, y); }
FN(void, quadraticCurveTo)(JNIEnv *env, jclass cls, jlong context, jfloat cpx, jfloat cpy, jfloat x, jfloat y) { canvas_native_context_quadratic_curve_to(CTX, cpx, cpy, x, y); }
FN(void, bezierCurveTo)(JNIEnv *env, jclass cls, jlong context, jfloat a, jfloat b, jfloat c, jfloat d, jfloat x, jfloat y) { canvas_native_context_bezier_curve_to(CTX, a, b, c, d, x, y); }
FN(void, arc)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat radius, jfloat start, jfloat end, jboolean anticlockwise) { canvas_native_context_arc(CTX, x, y, radius, start, end, anticlockwise); }
FN(void, ellipse)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat rx, jfloat ry, jfloat rotation, jfloat start, jfloat end, jboolean anticlockwise) { canvas_native_context_ellipse(CTX, x, y, rx, ry, rotation, start, end, anticlockwise); }
FN(void, rect)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat w, jfloat h) { canvas_native_context_rect(CTX, x, y, w, h); }
FN(void, roundRect)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat w, jfloat h, jfloatArray radii) {
    jsize size = (*env)->GetArrayLength(env, radii);
    jfloat *values = (*env)->GetFloatArrayElements(env, radii, NULL);
    canvas_native_context_round_rect(CTX, x, y, w, h, values, (uintptr_t) size);
    (*env)->ReleaseFloatArrayElements(env, radii, values, JNI_ABORT);
}
FN(void, fill)(JNIEnv *env, jclass cls, jlong context, jint rule) { canvas_native_context_fill(CTX, (enum CanvasFillRule) rule); }
FN(void, stroke)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_stroke(CTX); }
FN(void, clip)(JNIEnv *env, jclass cls, jlong context, jint rule) { canvas_native_context_clip_rule(CTX, (enum CanvasFillRule) rule); }
FN(void, clearRect)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat w, jfloat h) { canvas_native_context_clear_rect(CTX, x, y, w, h); }
FN(void, fillRect)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat w, jfloat h) { canvas_native_context_fill_rect(CTX, x, y, w, h); }
FN(void, strokeRect)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y, jfloat w, jfloat h) { canvas_native_context_stroke_rect(CTX, x, y, w, h); }
FN(void, fillText)(JNIEnv *env, jclass cls, jlong context, jstring text, jfloat x, jfloat y) { WITH_UTF(text, canvas_native_context_fill_text(CTX, utf, x, y)); }
FN(void, strokeText)(JNIEnv *env, jclass cls, jlong context, jstring text, jfloat x, jfloat y) { WITH_UTF(text, canvas_native_context_stroke_text(CTX, utf, x, y)); }
FN(jfloat, measureTextWidth)(JNIEnv *env, jclass cls, jlong context, jstring text) {
    jfloat width = 0;
    WITH_UTF(text, {
        struct TextMetrics *metrics = canvas_native_context_measure_text(CTX, utf);
        if (metrics != NULL) {
            width = canvas_native_text_metrics_get_width(metrics);
            canvas_native_text_metrics_release(metrics);
        }
    });
    return width;
}

// Transforms

FN(void, save)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_save(CTX); }
FN(void, restore)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_restore(CTX); }
FN(void, setTransform)(JNIEnv *env, jclass cls, jlong context, jfloat a, jfloat b, jfloat c, jfloat d, jfloat e, jfloat f) { canvas_native_context_set_transform(CTX, a, b, c, d, e, f); }
FN(void, transform)(JNIEnv *env, jclass cls, jlong context, jfloat a, jfloat b, jfloat c, jfloat d, jfloat e, jfloat f) { canvas_native_context_transform(CTX, a, b, c, d, e, f); }
FN(void, resetTransform)(JNIEnv *env, jclass cls, jlong context) { canvas_native_context_reset_transform(CTX); }
FN(void, translate)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y) { canvas_native_context_translate(CTX, x, y); }
FN(void, scale)(JNIEnv *env, jclass cls, jlong context, jfloat x, jfloat y) { canvas_native_context_scale(CTX, x, y); }
FN(void, rotate)(JNIEnv *env, jclass cls, jlong context, jfloat angle) { canvas_native_context_rotate(CTX, angle); }

// Gradients

FN(jlong, createLinearGradient)(JNIEnv *env, jclass cls, jlong context, jfloat x0, jfloat y0, jfloat x1, jfloat y1) {
    return (jlong) (intptr_t) canvas_native_context_create_linear_gradient(CTX, x0, y0, x1, y1);
}
FN(jlong, createRadialGradient)(JNIEnv *env, jclass cls, jlong context, jfloat x0, jfloat y0, jfloat r0, jfloat x1, jfloat y1, jfloat r1) {
    return (jlong) (intptr_t) canvas_native_context_create_radial_gradient(CTX, x0, y0, r0, x1, y1, r1);
}
FN(void, gradientAddColorStop)(JNIEnv *env, jclass cls, jlong style, jfloat stop, jstring color) {
    WITH_UTF(color, canvas_native_gradient_add_color_stop((struct PaintStyle *) (intptr_t) style, stop, utf));
}
FN(void, paintStyleRelease)(JNIEnv *env, jclass cls, jlong style) { canvas_native_paint_style_release((struct PaintStyle *) (intptr_t) style); }
