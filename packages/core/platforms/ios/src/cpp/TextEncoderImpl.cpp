//
// Created by Osei Fortune on 19/04/2022.
//

#include "TextEncoderImpl.h"
#include "Caches.h"
#include "Helpers.h"
#include "Common.h"

TextEncoderImpl::TextEncoderImpl(TextEncoder* encoder) : encoder_(encoder) {}

void TextEncoderImpl::Init(const v8::Local<v8::Object>& canvasModule, v8::Isolate *isolate) {
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    v8::HandleScope handle_scope(isolate);

    auto ctor = GetCtor(isolate);
    auto context = isolate->GetCurrentContext();
    auto func = ctor->GetFunction(context).ToLocalChecked();

    canvasModule->Set(context, ConvertToV8String(isolate, "TextEncoder"), func);
}


TextEncoderImpl *TextEncoderImpl::GetPointer(v8::Local<v8::Object> object) {
    auto ptr = object->GetInternalField(0).As<v8::External>()->Value();
    if (ptr == nullptr) {
        return nullptr;
    }
    return static_cast<TextEncoderImpl *>(ptr);
}


v8::Local<v8::FunctionTemplate> TextEncoderImpl::GetCtor(v8::Isolate *isolate) {
    auto cache = Caches::Get(isolate);
    auto ctor = cache->TextEncoderTmpl.get();
    if (ctor != nullptr) {
        return ctor->Get(isolate);
    }

    v8::Local<v8::FunctionTemplate> ctorTmpl = v8::FunctionTemplate::New(isolate, Ctor);
    ctorTmpl->InstanceTemplate()->SetInternalFieldCount(1);
    ctorTmpl->SetClassName(ConvertToV8String(isolate, "TextEncoder"));

    auto tmpl = ctorTmpl->InstanceTemplate();
    tmpl->SetInternalFieldCount(1);
    tmpl->SetAccessor(
            ConvertToV8String(isolate, "encoding"),
            Encoding);
    tmpl->Set(
            ConvertToV8String(isolate, "encode"),
            v8::FunctionTemplate::New(isolate, &Encode));
    cache->TextEncoderTmpl =
            std::make_unique<v8::Persistent<v8::FunctionTemplate>>(isolate, ctorTmpl);
    return ctorTmpl;
}


void TextEncoderImpl::Ctor(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto count = args.Length();
    auto value = args[0];
    auto isolate = args.GetIsolate();
    if (count == 1 && !value->IsString()) {
        auto label = value->ToString(isolate->GetCurrentContext()).ToLocalChecked();
        auto arg = ConvertFromV8String(isolate, label);
        auto error = "Failed to construct 'TextEncoder': The encoding label provided (" +
                     arg + "') is invalid";
        isolate->ThrowError(ConvertToV8String(isolate, error));
        return;
    }

    std::string encoding("utf-8");
    if (count == 1) {
        encoding = ConvertFromV8String(isolate, value);
    }
    auto encoder =nativescript_core_text_encoder_create(encoding.c_str());

    auto ret = args.This();

    auto txtEncoder = new TextEncoderImpl(encoder);

    auto ext = v8::External::New(isolate, txtEncoder);

    ret->SetInternalField(0, ext);

    args.GetReturnValue().Set(ret);

}


void
TextEncoderImpl::Encoding(v8::Local<v8::String> name,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    auto ptr = GetPointer(info.This());
    if (ptr != nullptr) {
        auto isolate = info.GetIsolate();
        auto encoding = nativescript_core_text_encoder_get_encoding(ptr->GetTextEncoder());
        info.GetReturnValue().Set(ConvertToV8String(isolate, encoding));
       nativescript_core_string_destroy((char*)encoding);
        return;
    }
    info.GetReturnValue().SetEmptyString();
}

void TextEncoderImpl::Encode(const v8::FunctionCallbackInfo<v8::Value> &args) {
    TextEncoderImpl *ptr = GetPointer(args.This());
    if (ptr == nullptr) {
        args.GetReturnValue().SetUndefined();
        return;
    }
    auto isolate = args.GetIsolate();

    auto text = args[0];

    auto encoded =nativescript_core_text_encoder_encode(ptr->GetTextEncoder(), ConvertFromV8String(isolate, text).c_str());

    auto data =nativescript_core_u8_buffer_get_bytes_mut(encoded);

    auto length =nativescript_core_u8_buffer_get_length(encoded);

    auto store = v8::ArrayBuffer::NewBackingStore(data, length,
                                                  [](void *data, size_t length,
                                                     void *deleter_data) {
                                                      if (deleter_data != nullptr) {
                                                         nativescript_core_u8_buffer_destroy((U8Buffer *)deleter_data);
                                                      }
                                                  },
                                                  encoded);

    auto buf = v8::ArrayBuffer::New(isolate, std::move(store));

    auto ret = v8::Uint8ClampedArray::New(buf, 0, length);

    args.GetReturnValue().Set(ret);
}

TextEncoder* TextEncoderImpl::GetTextEncoder() {
    return this->encoder_;
}
