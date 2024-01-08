//
// Created by Osei Fortune on 25/02/2023.
//

#pragma once

#include <memory>
#include "Common.h"
#include "OneByteStringResource.h"

//#ifdef __APPLE__
//#ifdef __OBJC__
//#include <Foundation/Foundation.h>
//#else
//#include <CoreFoundation/CoreFoundation.h>
//extern "C" void NSLog(CFStringRef format, ...);
//#endif
//#endif



static const char *LOG_TAG = "JS";
static int m_maxLogcatObjectSize = 4096;

#ifdef __ANDROID__
static void sendToADBLogcat(const std::string &message, android_LogPriority logPriority) {
    // limit the size of the message that we send to logcat using the predefined value in package.json
    auto messageToLog = message;
    if (messageToLog.length() > m_maxLogcatObjectSize) {
        messageToLog = messageToLog.erase(m_maxLogcatObjectSize, std::string::npos);
        messageToLog = messageToLog + "...";
    }

    // split strings into chunks of 4000 characters
    // __android_log_write can't send more than 4000 to the stdout at a time
    auto messageLength = messageToLog.length();
    int maxStringLength = 4000;

    if (messageLength < maxStringLength) {
        __android_log_write(logPriority, LOG_TAG, messageToLog.c_str());
    } else {
        for (int i = 0; i < messageLength; i += maxStringLength) {
            auto messagePart = messageToLog.substr(i, maxStringLength);

            __android_log_write(logPriority, LOG_TAG, messagePart.c_str());
        }
    }
}
#endif

//#ifdef __APPLE__
//#ifndef __OBJC__
//#define Log(fmt, ...) NSLog(CFSTR(fmt), ##__VA_ARGS__)
//#else
//#define Log(...) NSLog(__VA_ARGS__)
//#endif
//#endif



static void LogToConsole(const std::string &message) {
#ifdef __ANDROID__
    sendToADBLogcat(message, android_LogPriority::ANDROID_LOG_INFO);
#endif

#ifdef __APPLE__
   // Log("%s", message.c_str());
#endif
}



enum class NativeType {
    None,
    CanvasGradient,
    CanvasPattern,
    ImageData,
    ImageAsset,
    CanvasRenderingContext2D,
    WebGLRenderingContextBase,
    Path2D,
    Matrix,
    ImageBitmap,
    TextMetrics,

    WebGLQuery,
    WebGLProgram,
    WebGLShader,
    WebGLBuffer,
    WebGLFramebuffer,
    WebGLRenderbuffer,
    WebGLTexture,
    WebGLActiveInfo,
    OES_fbo_render_mipmap,
    EXT_blend_minmax,
    EXT_color_buffer_half_float,
    EXT_disjoint_timer_query,
    EXT_sRGB,
    EXT_shader_texture_lod,
    EXT_texture_filter_anisotropic,
    OES_element_index_uint,
    OES_standard_derivatives,
    OES_texture_float,
    OES_texture_float_linear,
    OES_texture_half_float_linear,
    OES_texture_half_float,
    WEBGL_color_buffer_float,
    OES_vertex_array_object,
    WebGLVertexArrayObject,
    WEBGL_compressed_texture_atc,
    WEBGL_compressed_texture_etc1,
    WEBGL_compressed_texture_s3tc,
    WEBGL_compressed_texture_s3tc_srgb,
    WEBGL_compressed_texture_etc,
    WEBGL_compressed_texture_pvrtc,
    WEBGL_lose_context,
    ANGLE_instanced_arrays,
    WEBGL_depth_texture,
    WEBGL_draw_buffers,
    WebGLShaderPrecisionFormat,
    WebGLUniformLocation,
    WebGLSampler,
    WebGLTransformFeedback,
    WebGLSync
};


inline static v8::Local<v8::String>
ConvertToV8OneByteString(v8::Isolate *isolate, char* string) {
    auto value = new OneByteStringResource(string);
    auto ret = v8::String::NewExternalOneByte(isolate, value);
    return ret.ToLocalChecked();
}

inline static v8::Local<v8::String>
ConvertToV8String(v8::Isolate *isolate, const std::string &string) {
    return v8::String::NewFromUtf8(isolate, string.c_str()).ToLocalChecked();
}

inline static std::string
ConvertFromV8String(v8::Isolate *isolate, const v8::Local<v8::Value> &value) {
    if (value.IsEmpty()) {
        return {};
    }

    if (value->IsStringObject()) {
        v8::Local<v8::String> obj = value.As<v8::StringObject>()->ValueOf();
        return ConvertFromV8String(isolate, obj);
    }

    v8::String::Utf8Value result(isolate, value);

    const char *val = *result;

    if (val == nullptr) {
        return {};
    }

    return {*result};
}


static void SetPrivateValue(v8::Isolate *isolate, const v8::Local<v8::Object> &obj,
                            const v8::Local<v8::String> &propName,
                            const v8::Local<v8::Value> &value) {
    v8::Local<v8::Context> context;
    obj->GetCreationContext().ToLocal(&context);
    v8::Local<v8::Private> privateKey = v8::Private::ForApi(isolate, propName);
    obj->SetPrivate(context, privateKey, value);
}

static v8::Local<v8::Value>
GetPrivateValue(v8::Isolate *isolate, const v8::Local<v8::Object> &obj,
                const v8::Local<v8::String> &propName) {
    v8::Local<v8::Context> context;
    obj->GetCreationContext().ToLocal(&context);
    v8::Local<v8::Private> privateKey = v8::Private::ForApi(isolate, propName);

    v8::Maybe<bool> hasPrivate = obj->HasPrivate(context, privateKey);

    if (!hasPrivate.FromMaybe(false)) {
        return v8::Local<v8::Value>();
    }

    v8::Local<v8::Value> result;

    obj->GetPrivate(context, privateKey).ToLocal(&result);

    return result;
}

static void SetNativeType(v8::Isolate *isolate, const v8::Local<v8::Object> &obj, NativeType type) {
    v8::Local<v8::String> name = ConvertToV8String(isolate, "__type");
    v8::Local<v8::Value> typeValue = v8::Number::New(isolate, (double) type).As<v8::Value>();
    SetPrivateValue(isolate, obj, name, typeValue);
}

inline static NativeType GetNativeType(v8::Isolate *isolate, const v8::Local<v8::Value> &obj) {
    if (!obj->IsNullOrUndefined() && obj->IsObject()) {
        v8::Local<v8::String> name = ConvertToV8String(isolate, "__type");
        auto ret = GetPrivateValue(isolate, obj.As<v8::Object>(), name);
        auto context = isolate->GetCurrentContext();

        if (!ret.IsEmpty() && ret->IsNumber()) {
            auto value = (int) ret->NumberValue(context).ToChecked();
            if (value >= (int) NativeType::CanvasGradient &&
                value <= (int) NativeType::WebGLSync) {
                return (NativeType) value;
            }
        }
    }

    return NativeType::None;
}


//template<typename T>
//inline static rust::Slice<T>
//GetArrayBufferData(v8::Local<v8::ArrayBuffer> &array) {
//    auto buf = array->GetBackingStore()->Data();
//    auto size = array->ByteLength();
//
//    rust::Slice<T> slice(reinterpret_cast<T *>(buf), size);
//    return std::move(slice);
//}


//template<typename T>
//inline static rust::Slice<T>
//GetTypedArrayData(v8::Local<v8::TypedArray> &array) {
//    auto buf = array->Buffer();
//    auto offset = array->ByteOffset();
//    auto size = buf->ByteLength();
//    rust::Slice<T> slice(reinterpret_cast<T *>(buf->GetBackingStore()->Data()) + offset,
//                         (size / sizeof(T)));
//    return std::move(slice);
//}



static void SetFastMethod(v8::Isolate* isolate,
                   v8::Local<v8::Template> that,
                   const char* name,
                   v8::FunctionCallback slow_callback,
                   const v8::CFunction* c_function,
                   v8::Local<v8::Value> data) {
    v8::Local<v8::FunctionTemplate> t =
            v8::FunctionTemplate::New(isolate,
                                slow_callback,
                                data,
                                v8::Local<v8::Signature>(),
                                        0,
                                v8::ConstructorBehavior::kThrow,
                                v8::SideEffectType::kHasSideEffect,
                                c_function);
    // kInternalized strings are created in the old space.
    const v8::NewStringType type = v8::NewStringType::kInternalized;
    v8::Local<v8::String> name_string =
            v8::String::NewFromUtf8(isolate, name, type).ToLocalChecked();
    that->Set(name_string, t);
}
static void SetFastMethod(v8::Local<v8::Context> context,
                          v8::Local<v8::Object> that,
                   const char* name,
                   v8::FunctionCallback slow_callback,
                   const v8::CFunction* c_function,
                          v8::Local<v8::Value> data = v8::Local<v8::Value>()) {
    v8::Isolate* isolate = context->GetIsolate();
    v8::Local<v8::Function> function =
            v8::FunctionTemplate::New(isolate,
                                slow_callback,
                                data,
                                v8::Local<v8::Signature>(),
                                        0,
                                v8::ConstructorBehavior::kThrow,
                                v8::SideEffectType::kHasSideEffect,
                                c_function)
                    ->GetFunction(context)
                    .ToLocalChecked();
    const v8::NewStringType type = v8::NewStringType::kInternalized;
    v8::Local<v8::String> name_string =
            v8::String::NewFromUtf8(isolate, name, type).ToLocalChecked();
    that->Set(context, name_string, function).Check();
}

static void SetFastMethodNoSideEffect(v8::Local<v8::Context> context,
                               v8::Local<v8::Object> that,
                               const char* name,
                               v8::FunctionCallback slow_callback,
                               const v8::CFunction* c_function,
                               v8::Local<v8::Value> data) {
    v8::Isolate* isolate = context->GetIsolate();
    v8::Local<v8::Function> function =
            v8::FunctionTemplate::New(isolate,
                                slow_callback,
                                data,
                                v8::Local<v8::Signature>(),
                                        0,
                                v8::ConstructorBehavior::kThrow,
                                v8::SideEffectType::kHasNoSideEffect,
                                c_function)
                    ->GetFunction(context)
                    .ToLocalChecked();
    const v8::NewStringType type = v8::NewStringType::kInternalized;
    v8::Local<v8::String> name_string =
            v8::String::NewFromUtf8(isolate, name, type).ToLocalChecked();
    that->Set(context, name_string, function).Check();
}
static void SetFastMethodNoSideEffect(v8::Isolate* isolate,
                               v8::Local<v8::Template> that,
                               const char* name,
                               v8::FunctionCallback slow_callback,
                               const v8::CFunction* c_function,
                               v8::Local<v8::Value> data) {
    v8::Local<v8::FunctionTemplate> t =
            v8::FunctionTemplate::New(isolate,
                                slow_callback,
                                data,
                                v8::Local<v8::Signature>(),
                                        0,
                                v8::ConstructorBehavior::kThrow,
                                v8::SideEffectType::kHasNoSideEffect,
                                c_function);
    // kInternalized strings are created in the old space.
    const v8::NewStringType type = v8::NewStringType::kInternalized;
    v8::Local<v8::String> name_string =
            v8::String::NewFromUtf8(isolate, name, type).ToLocalChecked();
    that->Set(name_string, t);
}
