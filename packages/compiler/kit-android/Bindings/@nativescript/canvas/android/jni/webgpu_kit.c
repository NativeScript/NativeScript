// libcanvasnative's WebGPU C API as Kotlin calls it: static methods of org.nativescript.kit.canvas.GPUNative.
// Descriptors arrive flattened into primitive arrays (their layout is GPUNative's, per function); enums arrive
// as the C enums' values, texture formats as WebGPU's names.

#include <jni.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <android/log.h>
#include "canvas_native.h"

#define FN(ret, name) JNIEXPORT ret JNICALL Java_org_nativescript_kit_canvas_GPUNative_##name
#define P(type, value) ((const struct type *) (intptr_t) (value))
#define J(pointer) ((jlong) (intptr_t) (pointer))

static JavaVM *vm;

JNIEXPORT jint JNI_OnLoad(JavaVM *loaded, void *reserved) {
    vm = loaded;
    return JNI_VERSION_1_6;
}

static JNIEnv *attached(void) {
    JNIEnv *env = NULL;
    if ((*vm)->GetEnv(vm, (void **) &env, JNI_VERSION_1_6) == JNI_OK) return env;
    (*vm)->AttachCurrentThread(vm, &env, NULL);
    return env;
}

/** `callback.done(error, pointer)` of a GPUNative.Callback, on whichever thread the native side completes on. */
static void complete(jobject callback, const char *error, const void *pointer) {
    JNIEnv *env = attached();
    jclass cls = (*env)->GetObjectClass(env, callback);
    jmethodID done = (*env)->GetMethodID(env, cls, "done", "(Ljava/lang/String;J)V");
    jstring message = error ? (*env)->NewStringUTF(env, error) : NULL;
    (*env)->CallVoidMethod(env, callback, done, message, J(pointer));
    (*env)->DeleteGlobalRef(env, callback);
}

static char *utf(JNIEnv *env, jstring value) {
    if (value == NULL) return NULL;
    const char *chars = (*env)->GetStringUTFChars(env, value, NULL);
    char *copy = strdup(chars);
    (*env)->ReleaseStringUTFChars(env, value, chars);
    return copy;
}

static struct CanvasGPUTextureFormat format_named(JNIEnv *env, jstring name) {
    char *n = utf(env, name);
    struct CanvasOptionalGPUTextureFormat parsed = canvas_native_webgpu_enum_string_to_gpu_texture(n ? n : "rgba8unorm");
    free(n);
    if (parsed.tag == CanvasOptionalGPUTextureFormatSome) return parsed.some;
    struct CanvasGPUTextureFormat fallback = {.tag = CanvasGPUTextureFormatRgba8Unorm};
    return fallback;
}

// Instance and adapter

FN(jlong, instanceCreate)(JNIEnv *env, jclass cls) { return J(canvas_native_webgpu_instance_create()); }
FN(jlong, instancePointer)(JNIEnv *env, jclass cls, jlong instance) { return (jlong) canvas_native_webgpu_get_pointer_addr(P(CanvasWebGPUInstance, instance)); }

static void adapter_ready(const struct CanvasGPUAdapter *adapter, void *data) { complete((jobject) data, NULL, adapter); }

FN(void, requestAdapter)(JNIEnv *env, jclass cls, jlong instance, jint power, jboolean fallback, jobject callback) {
    struct CanvasGPURequestAdapterOptions options = {
        .power_preference = (enum CanvasGPUPowerPreference) power, .force_fallback_adapter = fallback, .feature_level = CanvasGPUFeatureLevelCore};
    canvas_native_webgpu_request_adapter(P(CanvasWebGPUInstance, instance), &options, adapter_ready, (*env)->NewGlobalRef(env, callback));
}

static void device_ready(char *error, const struct CanvasGPUDevice *device, void *data) {
    complete((jobject) data, error, device);
    if (error) canvas_native_string_destroy(error);
}

static void uncaptured(enum CanvasGPUErrorType type, char *message, void *data) {
    __android_log_print(ANDROID_LOG_ERROR, "WebGPU", "%s", message ? message : "error");
    if (message) canvas_native_string_destroy(message);
}

FN(void, requestDevice)(JNIEnv *env, jclass cls, jlong adapter, jstring label, jobject callback) {
    char *l = utf(env, label);
    canvas_native_webgpu_adapter_request_device(P(CanvasGPUAdapter, adapter), l, NULL, 0, NULL, device_ready, (*env)->NewGlobalRef(env, callback));
    free(l);
}

FN(void, deviceLogErrors)(JNIEnv *env, jclass cls, jlong device) {
    canvas_native_webgpu_device_set_uncaptured_error_callback(P(CanvasGPUDevice, device), uncaptured, NULL);
}

FN(jlong, deviceQueue)(JNIEnv *env, jclass cls, jlong device) { return J(canvas_native_webgpu_device_get_queue(P(CanvasGPUDevice, device))); }

// Device

FN(jlong, createShaderModule)(JNIEnv *env, jclass cls, jlong device, jstring label, jstring code) {
    char *l = utf(env, label), *c = utf(env, code);
    const struct CanvasGPUShaderModule *module = canvas_native_webgpu_device_create_shader_module(P(CanvasGPUDevice, device), l, c);
    free(l);
    free(c);
    return J(module);
}

FN(jlong, createBuffer)(JNIEnv *env, jclass cls, jlong device, jstring label, jlong size, jint usage, jboolean mapped) {
    char *l = utf(env, label);
    const struct CanvasGPUBuffer *buffer = canvas_native_webgpu_device_create_buffer(P(CanvasGPUDevice, device), l, (uint64_t) size, (uint32_t) usage, mapped);
    free(l);
    return J(buffer);
}

/** Entries as 6 ints each: binding, visibility, kind (0 buffer, 1 sampler, 2 texture), then the kind's three fields. */
FN(jlong, createBindGroupLayout)(JNIEnv *env, jclass cls, jlong device, jstring label, jintArray entries, jlongArray minSizes) {
    jsize count = (*env)->GetArrayLength(env, entries) / 6;
    jint *e = (*env)->GetIntArrayElements(env, entries, NULL);
    jlong *sizes = (*env)->GetLongArrayElements(env, minSizes, NULL);
    struct CanvasBindGroupLayoutEntry *out = calloc(count ? count : 1, sizeof *out);
    for (jsize i = 0; i < count; i++) {
        jint *f = e + i * 6;
        out[i].binding = (uint32_t) f[0];
        out[i].visibility = (uint32_t) f[1];
        switch (f[2]) {
            case 1:
                out[i].binding_type.tag = CanvasBindingTypeSampler;
                out[i].binding_type.sampler.type_ = (enum CanvasSamplerBindingType) f[3];
                break;
            case 2:
                out[i].binding_type.tag = CanvasBindingTypeTexture;
                out[i].binding_type.texture.sample_type = (enum CanvasTextureSampleType) f[3];
                out[i].binding_type.texture.view_dimension = (enum CanvasTextureViewDimension) f[4];
                out[i].binding_type.texture.multisampled = f[5] != 0;
                break;
            default:
                out[i].binding_type.tag = CanvasBindingTypeBuffer;
                out[i].binding_type.buffer.type_ = (enum CanvasBufferBindingType) f[3];
                out[i].binding_type.buffer.has_dynamic_offset = f[4] != 0;
                out[i].binding_type.buffer.min_binding_size = sizes[i];
        }
    }
    char *l = utf(env, label);
    const struct CanvasGPUBindGroupLayout *layout = canvas_native_webgpu_device_create_bind_group_layout(P(CanvasGPUDevice, device), l, out, (uintptr_t) count);
    free(l);
    free(out);
    (*env)->ReleaseIntArrayElements(env, entries, e, JNI_ABORT);
    (*env)->ReleaseLongArrayElements(env, minSizes, sizes, JNI_ABORT);
    return J(layout);
}

FN(jlong, createPipelineLayout)(JNIEnv *env, jclass cls, jlong device, jstring label, jlongArray layouts) {
    jsize count = (*env)->GetArrayLength(env, layouts);
    jlong *handles = (*env)->GetLongArrayElements(env, layouts, NULL);
    const struct CanvasGPUBindGroupLayout **list = calloc(count ? count : 1, sizeof *list);
    for (jsize i = 0; i < count; i++) list[i] = P(CanvasGPUBindGroupLayout, handles[i]);
    char *l = utf(env, label);
    const struct CanvasGPUPipelineLayout *layout = canvas_native_webgpu_device_create_pipeline_layout(P(CanvasGPUDevice, device), l, list, (uintptr_t) count);
    free(l);
    free(list);
    (*env)->ReleaseLongArrayElements(env, layouts, handles, JNI_ABORT);
    return J(layout);
}

/** Entries as 2 ints each (binding, kind: 0 buffer, 1 sampler, 2 texture view) and 3 longs each (handle, offset, size). */
FN(jlong, createBindGroup)(JNIEnv *env, jclass cls, jlong device, jstring label, jlong layout, jintArray entries, jlongArray resources) {
    jsize count = (*env)->GetArrayLength(env, entries) / 2;
    jint *e = (*env)->GetIntArrayElements(env, entries, NULL);
    jlong *r = (*env)->GetLongArrayElements(env, resources, NULL);
    struct CanvasBindGroupEntry *out = calloc(count ? count : 1, sizeof *out);
    for (jsize i = 0; i < count; i++) {
        out[i].binding = (uint32_t) e[i * 2];
        jlong *res = r + i * 3;
        switch (e[i * 2 + 1]) {
            case 1:
                out[i].resource.tag = CanvasBindGroupEntryResourceSampler;
                out[i].resource.sampler = P(CanvasGPUSampler, res[0]);
                break;
            case 2:
                out[i].resource.tag = CanvasBindGroupEntryResourceTextureView;
                out[i].resource.texture_view = P(CanvasGPUTextureView, res[0]);
                break;
            default:
                out[i].resource.tag = CanvasBindGroupEntryResourceBuffer;
                out[i].resource.buffer.buffer = P(CanvasGPUBuffer, res[0]);
                out[i].resource.buffer.offset = res[1];
                out[i].resource.buffer.size = res[2];
        }
    }
    char *l = utf(env, label);
    const struct CanvasGPUBindGroup *group = canvas_native_webgpu_device_create_bind_group(P(CanvasGPUDevice, device), l, P(CanvasGPUBindGroupLayout, layout), out, (uintptr_t) count);
    free(l);
    free(out);
    (*env)->ReleaseIntArrayElements(env, entries, e, JNI_ABORT);
    (*env)->ReleaseLongArrayElements(env, resources, r, JNI_ABORT);
    return J(group);
}

/**
 * A render pipeline. `stages` holds the vertex module and the fragment module (0 for none); `targets` 8 ints per
 * color target (has blend, color src/dst/op, alpha src/dst/op, write mask); `primitive` the topology, strip index
 * format (-1 for none), front face and cull mode; `buffers` 2 longs per vertex buffer (stride, step mode, attribute
 * count packed as step << 32 | count) and `attributes` 3 longs each (format, offset, shader location).
 */
FN(jlong, createRenderPipeline)(JNIEnv *env, jclass cls, jlong device, jstring label, jlong layout, jlongArray stages, jstring vertexEntry,
                                jstring fragmentEntry, jobjectArray formats, jintArray targets, jintArray primitive, jint sampleCount,
                                jlongArray buffers, jlongArray attributes) {
    jlong *s = (*env)->GetLongArrayElements(env, stages, NULL);
    jint *t = (*env)->GetIntArrayElements(env, targets, NULL);
    jint *p = (*env)->GetIntArrayElements(env, primitive, NULL);
    jlong *b = (*env)->GetLongArrayElements(env, buffers, NULL);
    jlong *a = (*env)->GetLongArrayElements(env, attributes, NULL);
    jsize targetCount = (*env)->GetArrayLength(env, formats);
    jsize bufferCount = (*env)->GetArrayLength(env, buffers) / 2;
    jsize attributeCount = (*env)->GetArrayLength(env, attributes) / 3;

    struct CanvasVertexAttribute *attrs = calloc(attributeCount ? attributeCount : 1, sizeof *attrs);
    for (jsize i = 0; i < attributeCount; i++) {
        attrs[i].format = (enum CanvasVertexFormat) a[i * 3];
        attrs[i].offset = (uint64_t) a[i * 3 + 1];
        attrs[i].shader_location = (uint32_t) a[i * 3 + 2];
    }
    struct CanvasVertexBufferLayout *layouts = calloc(bufferCount ? bufferCount : 1, sizeof *layouts);
    jsize next = 0;
    for (jsize i = 0; i < bufferCount; i++) {
        layouts[i].array_stride = (uint64_t) b[i * 2];
        layouts[i].step_mode = (enum CanvasVertexStepMode) (b[i * 2 + 1] >> 32);
        layouts[i].attributes_size = (uintptr_t) (b[i * 2 + 1] & 0xffffffff);
        layouts[i].attributes = attrs + next;
        next += (jsize) layouts[i].attributes_size;
    }

    struct CanvasColorTargetState *colorTargets = calloc(targetCount ? targetCount : 1, sizeof *colorTargets);
    for (jsize i = 0; i < targetCount; i++) {
        jint *f = t + i * 8;
        jstring name = (*env)->GetObjectArrayElement(env, formats, i);
        colorTargets[i].format = format_named(env, name);
        (*env)->DeleteLocalRef(env, name);
        colorTargets[i].blend.tag = f[0] ? CanvasOptionalBlendStateSome : CanvasOptionalBlendStateNone;
        if (f[0]) {
            colorTargets[i].blend.some.color = (struct CanvasBlendComponent){(enum CanvasBlendFactor) f[1], (enum CanvasBlendFactor) f[2], (enum CanvasBlendOperation) f[3]};
            colorTargets[i].blend.some.alpha = (struct CanvasBlendComponent){(enum CanvasBlendFactor) f[4], (enum CanvasBlendFactor) f[5], (enum CanvasBlendOperation) f[6]};
        }
        colorTargets[i].write_mask = (uint32_t) f[7];
    }

    char *vEntry = utf(env, vertexEntry), *fEntry = utf(env, fragmentEntry), *l = utf(env, label);
    struct CanvasVertexState vertex = {.module = P(CanvasGPUShaderModule, s[0]), .entry_point = vEntry, .constants = NULL, .buffers = layouts, .buffers_size = (uintptr_t) bufferCount};
    struct CanvasFragmentState fragment = {.targets = colorTargets, .targets_size = (uintptr_t) targetCount, .module = P(CanvasGPUShaderModule, s[1]), .entry_point = fEntry, .constants = NULL};
    struct CanvasPrimitiveState prim = {0};
    prim.topology.tag = CanvasOptionalPrimitiveTopologySome;
    prim.topology.some = (enum CanvasPrimitiveTopology) p[0];
    prim.strip_index_format.tag = p[1] < 0 ? CanvasOptionalIndexFormatNone : CanvasOptionalIndexFormatSome;
    if (p[1] >= 0) prim.strip_index_format.some = (enum CanvasIndexFormat) p[1];
    prim.front_face = (enum CanvasFrontFace) p[2];
    prim.cull_mode = (enum CanvasCullMode) p[3];
    struct CanvasMultisampleState multisample = {.count = (uint32_t) sampleCount, .mask = 0xffffffff, .alpha_to_coverage_enabled = false};
    struct CanvasCreateRenderPipelineDescriptor descriptor = {
        .label = l, .vertex = &vertex, .primitive = &prim, .depth_stencil = NULL, .multisample = &multisample, .fragment = s[1] ? &fragment : NULL};
    if (layout) {
        descriptor.layout.tag = CanvasGPUPipelineLayoutOrGPUAutoLayoutModeLayout;
        descriptor.layout.layout = P(CanvasGPUPipelineLayout, layout);
    } else {
        descriptor.layout.tag = CanvasGPUPipelineLayoutOrGPUAutoLayoutModeAuto;
        descriptor.layout.auto_ = CanvasGPUAutoLayoutModeAuto;
    }
    const struct CanvasGPURenderPipeline *pipeline = canvas_native_webgpu_device_create_render_pipeline(P(CanvasGPUDevice, device), &descriptor);

    free(vEntry);
    free(fEntry);
    free(l);
    free(colorTargets);
    free(layouts);
    free(attrs);
    (*env)->ReleaseLongArrayElements(env, stages, s, JNI_ABORT);
    (*env)->ReleaseIntArrayElements(env, targets, t, JNI_ABORT);
    (*env)->ReleaseIntArrayElements(env, primitive, p, JNI_ABORT);
    (*env)->ReleaseLongArrayElements(env, buffers, b, JNI_ABORT);
    (*env)->ReleaseLongArrayElements(env, attributes, a, JNI_ABORT);
    return J(pipeline);
}

FN(jlong, createCommandEncoder)(JNIEnv *env, jclass cls, jlong device, jstring label) {
    char *l = utf(env, label);
    const struct CanvasGPUCommandEncoder *encoder = canvas_native_webgpu_device_create_command_encoder(P(CanvasGPUDevice, device), l);
    free(l);
    return J(encoder);
}

FN(void, bufferDestroy)(JNIEnv *env, jclass cls, jlong buffer) { canvas_native_webgpu_buffer_destroy(P(CanvasGPUBuffer, buffer)); }

// Queue

static void write_buffer(jlong queue, jlong buffer, jlong offset, const uint8_t *data, jint length, jlong dataOffset, jlong size) {
    if (size >= 0)
        canvas_native_webgpu_queue_write_buffer_size(P(CanvasGPUQueue, queue), P(CanvasGPUBuffer, buffer), (uint64_t) offset, data, (uintptr_t) length, (uintptr_t) dataOffset, (uintptr_t) size);
    else
        canvas_native_webgpu_queue_write_buffer(P(CanvasGPUQueue, queue), P(CanvasGPUBuffer, buffer), (uint64_t) offset, data, (uintptr_t) length, (uintptr_t) dataOffset);
}

FN(void, writeBufferDirect)(JNIEnv *env, jclass cls, jlong queue, jlong buffer, jlong offset, jobject data, jint position, jint length, jlong dataOffset, jlong size) {
    uint8_t *bytes = (*env)->GetDirectBufferAddress(env, data);
    write_buffer(queue, buffer, offset, bytes + position, length, dataOffset, size);
}

FN(void, writeBufferArray)(JNIEnv *env, jclass cls, jlong queue, jlong buffer, jlong offset, jbyteArray data, jint position, jint length, jlong dataOffset, jlong size) {
    jbyte *bytes = (*env)->GetPrimitiveArrayCritical(env, data, NULL);
    write_buffer(queue, buffer, offset, (const uint8_t *) bytes + position, length, dataOffset, size);
    (*env)->ReleasePrimitiveArrayCritical(env, data, bytes, JNI_ABORT);
}

FN(void, submit)(JNIEnv *env, jclass cls, jlong queue, jlongArray commandBuffers) {
    jsize count = (*env)->GetArrayLength(env, commandBuffers);
    jlong *handles = (*env)->GetLongArrayElements(env, commandBuffers, NULL);
    const struct CanvasGPUCommandBuffer **list = calloc(count ? count : 1, sizeof *list);
    for (jsize i = 0; i < count; i++) list[i] = P(CanvasGPUCommandBuffer, handles[i]);
    canvas_native_webgpu_queue_submit(P(CanvasGPUQueue, queue), list, (uintptr_t) count);
    for (jsize i = 0; i < count; i++) canvas_native_webgpu_command_buffer_release(list[i]);
    free(list);
    (*env)->ReleaseLongArrayElements(env, commandBuffers, handles, JNI_ABORT);
}

// Encoders

/** Color attachments as 2 longs each (view, resolve target), 4 doubles each (clear color), 3 ints each (has clear, load op, store op). */
FN(jlong, beginRenderPass)(JNIEnv *env, jclass cls, jlong encoder, jstring label, jlongArray views, jdoubleArray clears, jintArray ops) {
    jsize count = (*env)->GetArrayLength(env, views) / 2;
    jlong *v = (*env)->GetLongArrayElements(env, views, NULL);
    jdouble *c = (*env)->GetDoubleArrayElements(env, clears, NULL);
    jint *o = (*env)->GetIntArrayElements(env, ops, NULL);
    struct CanvasRenderPassColorAttachment *attachments = calloc(count ? count : 1, sizeof *attachments);
    for (jsize i = 0; i < count; i++) {
        attachments[i].view = P(CanvasGPUTextureView, v[i * 2]);
        attachments[i].resolve_target = P(CanvasGPUTextureView, v[i * 2 + 1]);
        attachments[i].channel.clear_value.tag = o[i * 3] ? CanvasOptionalColorSome : CanvasOptionalColorNone;
        attachments[i].channel.clear_value.some = (struct CanvasColor){c[i * 4], c[i * 4 + 1], c[i * 4 + 2], c[i * 4 + 3]};
        attachments[i].channel.load_op = (enum CanvasLoadOp) o[i * 3 + 1];
        attachments[i].channel.store_op = (enum CanvasStoreOp) o[i * 3 + 2];
        attachments[i].channel.read_only = false;
    }
    char *l = utf(env, label);
    const struct CanvasGPURenderPassEncoder *pass = canvas_native_webgpu_command_encoder_begin_render_pass(
        P(CanvasGPUCommandEncoder, encoder), l, attachments, (uintptr_t) count, NULL, NULL, NULL, -1, -1);
    free(l);
    free(attachments);
    (*env)->ReleaseLongArrayElements(env, views, v, JNI_ABORT);
    (*env)->ReleaseDoubleArrayElements(env, clears, c, JNI_ABORT);
    (*env)->ReleaseIntArrayElements(env, ops, o, JNI_ABORT);
    return J(pass);
}

FN(jlong, finish)(JNIEnv *env, jclass cls, jlong encoder, jstring label) {
    char *l = utf(env, label);
    const struct CanvasGPUCommandBuffer *buffer = canvas_native_webgpu_command_encoder_finish(P(CanvasGPUCommandEncoder, encoder), l);
    free(l);
    canvas_native_webgpu_command_encoder_release(P(CanvasGPUCommandEncoder, encoder));
    return J(buffer);
}

FN(void, setPipeline)(JNIEnv *env, jclass cls, jlong pass, jlong pipeline) {
    canvas_native_webgpu_render_pass_encoder_set_pipeline(P(CanvasGPURenderPassEncoder, pass), P(CanvasGPURenderPipeline, pipeline));
}

FN(void, setBindGroup)(JNIEnv *env, jclass cls, jlong pass, jint index, jlong group, jintArray offsets) {
    jsize count = (*env)->GetArrayLength(env, offsets);
    jint *values = (*env)->GetIntArrayElements(env, offsets, NULL);
    canvas_native_webgpu_render_pass_encoder_set_bind_group(P(CanvasGPURenderPassEncoder, pass), (uint32_t) index, P(CanvasGPUBindGroup, group),
                                                            (const uint32_t *) values, (uintptr_t) count, 0, (uintptr_t) count);
    (*env)->ReleaseIntArrayElements(env, offsets, values, JNI_ABORT);
}

FN(void, setVertexBuffer)(JNIEnv *env, jclass cls, jlong pass, jint slot, jlong buffer, jlong offset, jlong size) {
    canvas_native_webgpu_render_pass_encoder_set_vertex_buffer(P(CanvasGPURenderPassEncoder, pass), (uint32_t) slot, P(CanvasGPUBuffer, buffer), offset, size);
}

FN(void, setIndexBuffer)(JNIEnv *env, jclass cls, jlong pass, jlong buffer, jint format, jlong offset, jlong size) {
    canvas_native_webgpu_render_pass_encoder_set_index_buffer(P(CanvasGPURenderPassEncoder, pass), P(CanvasGPUBuffer, buffer), (enum CanvasIndexFormat) format, offset, size);
}

FN(void, setViewport)(JNIEnv *env, jclass cls, jlong pass, jfloat x, jfloat y, jfloat width, jfloat height, jfloat minDepth, jfloat maxDepth) {
    canvas_native_webgpu_render_pass_encoder_set_viewport(P(CanvasGPURenderPassEncoder, pass), x, y, width, height, minDepth, maxDepth);
}

FN(void, setScissorRect)(JNIEnv *env, jclass cls, jlong pass, jint x, jint y, jint width, jint height) {
    canvas_native_webgpu_render_pass_encoder_set_scissor_rect(P(CanvasGPURenderPassEncoder, pass), (uint32_t) x, (uint32_t) y, (uint32_t) width, (uint32_t) height);
}

FN(void, draw)(JNIEnv *env, jclass cls, jlong pass, jint vertexCount, jint instanceCount, jint firstVertex, jint firstInstance) {
    canvas_native_webgpu_render_pass_encoder_draw(P(CanvasGPURenderPassEncoder, pass), (uint32_t) vertexCount, (uint32_t) instanceCount, (uint32_t) firstVertex, (uint32_t) firstInstance);
}

FN(void, drawIndexed)(JNIEnv *env, jclass cls, jlong pass, jint indexCount, jint instanceCount, jint firstIndex, jint baseVertex, jint firstInstance) {
    canvas_native_webgpu_render_pass_encoder_draw_indexed(P(CanvasGPURenderPassEncoder, pass), (uint32_t) indexCount, (uint32_t) instanceCount, (uint32_t) firstIndex, baseVertex, (uint32_t) firstInstance);
}

FN(void, end)(JNIEnv *env, jclass cls, jlong pass) {
    canvas_native_webgpu_render_pass_encoder_end(P(CanvasGPURenderPassEncoder, pass));
    canvas_native_webgpu_render_pass_encoder_release(P(CanvasGPURenderPassEncoder, pass));
}

// Canvas context and textures

FN(void, configure)(JNIEnv *env, jclass cls, jlong context, jlong device, jstring format, jint usage, jint presentMode, jint alphaMode, jint width, jint height) {
    struct CanvasGPUSurfaceConfiguration config = {0};
    config.alphaMode = (enum CanvasGPUSurfaceAlphaMode) alphaMode;
    config.usage = (uint32_t) usage;
    config.presentMode = (enum CanvasGPUPresentMode) presentMode;
    config.format.tag = CanvasOptionalGPUTextureFormatSome;
    config.format.some = format_named(env, format);
    struct CanvasExtent3d size = {(uint32_t) width, (uint32_t) height, 1};
    config.size = width > 0 ? &size : NULL;
    canvas_native_webgpu_context_configure(P(CanvasGPUCanvasContext, context), P(CanvasGPUDevice, device), &config);
}

FN(void, unconfigure)(JNIEnv *env, jclass cls, jlong context) { canvas_native_webgpu_context_unconfigure(P(CanvasGPUCanvasContext, context)); }

/** The surface's texture this frame, or 0 where the surface has none to give. */
FN(jlong, currentTexture)(JNIEnv *env, jclass cls, jlong context) {
    const struct CanvasGPUTexture *texture = canvas_native_webgpu_context_get_current_texture(P(CanvasGPUCanvasContext, context));
    if (texture == NULL) return 0;
    if (canvas_native_webgpu_texture_get_status(texture) != SurfaceGetCurrentTextureStatusSuccess) {
        canvas_native_webgpu_texture_release(texture);
        return 0;
    }
    return J(texture);
}

/** Presents the texture taken this frame unless it was presented already. */
FN(void, present)(JNIEnv *env, jclass cls, jlong context) {
    const struct CanvasGPUCanvasContext *ctx = P(CanvasGPUCanvasContext, context);
    const struct CanvasGPUTexture *texture = canvas_native_webgpu_context_has_current_texture(ctx);
    if (texture == NULL) return;
    if (!canvas_native_webgpu_context_has_surface_presented(ctx))
        canvas_native_webgpu_context_present_surface(ctx, texture);
    else
        canvas_native_webgpu_texture_release(texture);
}

FN(jlong, createView)(JNIEnv *env, jclass cls, jlong texture) { return J(canvas_native_webgpu_texture_create_texture_view(P(CanvasGPUTexture, texture), NULL)); }
FN(jint, textureWidth)(JNIEnv *env, jclass cls, jlong texture) { return (jint) canvas_native_webgpu_texture_get_width(P(CanvasGPUTexture, texture)); }
FN(jint, textureHeight)(JNIEnv *env, jclass cls, jlong texture) { return (jint) canvas_native_webgpu_texture_get_height(P(CanvasGPUTexture, texture)); }
FN(void, textureRelease)(JNIEnv *env, jclass cls, jlong texture) { canvas_native_webgpu_texture_release(P(CanvasGPUTexture, texture)); }
FN(void, viewRelease)(JNIEnv *env, jclass cls, jlong view) { canvas_native_webgpu_texture_view_release(P(CanvasGPUTextureView, view)); }
