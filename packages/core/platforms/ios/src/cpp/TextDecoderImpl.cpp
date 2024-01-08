//
// Created by Osei Fortune on 19/04/2022.
//

#include "TextDecoderImpl.h"
#include "Caches.h"
#include "Helpers.h"
#include "OneByteStringResource.h"

TextDecoderImpl::TextDecoderImpl(TextDecoder* decoder) : decoder_(decoder) {}

void TextDecoderImpl::Init(const v8::Local<v8::Object> &canvasModule, v8::Isolate *isolate) {
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    v8::HandleScope handle_scope(isolate);

    auto ctor = GetCtor(isolate);
    auto context = isolate->GetCurrentContext();
    auto func = ctor->GetFunction(context).ToLocalChecked();

    canvasModule->Set(context, ConvertToV8String(isolate, "TextDecoder"), func);
}

TextDecoderImpl *TextDecoderImpl::GetPointer(v8::Local<v8::Object> object) {
    auto ptr = object->GetInternalField(0).As<v8::External>()->Value();
    if (ptr == nullptr) {
        return nullptr;
    }
    return static_cast<TextDecoderImpl *>(ptr);
}

TextDecoder* TextDecoderImpl::GetTextDecoder() {
    return this->decoder_;
}

v8::Local<v8::FunctionTemplate> TextDecoderImpl::GetCtor(v8::Isolate *isolate) {
    auto cache = Caches::Get(isolate);
    auto ctor = cache->TextDecoderTmpl.get();
    if (ctor != nullptr) {
        return ctor->Get(isolate);
    }

    v8::Local<v8::FunctionTemplate> ctorTmpl = v8::FunctionTemplate::New(isolate, Ctor);
    ctorTmpl->InstanceTemplate()->SetInternalFieldCount(1);
    ctorTmpl->SetClassName(ConvertToV8String(isolate, "TextDecoder"));

    auto tmpl = ctorTmpl->InstanceTemplate();
    tmpl->SetInternalFieldCount(1);
    tmpl->SetAccessor(
            ConvertToV8String(isolate, "encoding"),
            Encoding);
    tmpl->Set(
            ConvertToV8String(isolate, "decode"),
            v8::FunctionTemplate::New(isolate, &Decode));
    cache->TextDecoderTmpl =
            std::make_unique<v8::Persistent<v8::FunctionTemplate>>(isolate, ctorTmpl);
    return ctorTmpl;
}

void TextDecoderImpl::Ctor(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto count = args.Length();
    auto value = args[0];
    auto isolate = args.GetIsolate();
    if (count == 1 && !value->IsString()) {
        auto label = value->ToString(isolate->GetCurrentContext()).ToLocalChecked();
        auto arg = ConvertFromV8String(isolate, label);
        auto error = "Failed to construct 'TextDecoder': The encoding label provided (" +
                     arg + "') is invalid";
        isolate->ThrowError(ConvertToV8String(isolate, error));
        return;
    }

    std::string encoding("utf-8");
    if (count == 1) {
        encoding = ConvertFromV8String(isolate, value);
    }
    auto encoder = nativescript_core_text_decoder_create(encoding.c_str());

    auto ret = args.This();

    auto decoder = new TextDecoderImpl(encoder);

    auto ext = v8::External::New(isolate, decoder);

    ret->SetInternalField(0, ext);

    args.GetReturnValue().Set(ret);

}

void
TextDecoderImpl::Encoding(v8::Local<v8::String> name,
                          const v8::PropertyCallbackInfo<v8::Value> &info) {
    auto ptr = GetPointer(info.This());
    if (ptr != nullptr) {
        auto isolate = info.GetIsolate();
        auto encoding = nativescript_core_text_decoder_get_encoding(ptr->GetTextDecoder());
        info.GetReturnValue().Set(ConvertToV8String(isolate, encoding));
        nativescript_core_string_destroy((char*)encoding);
        return;
    }
    info.GetReturnValue().SetEmptyString();
}

void TextDecoderImpl::Decode(const v8::FunctionCallbackInfo<v8::Value> &args) {
    TextDecoderImpl *ptr = GetPointer(args.This());
    if (ptr == nullptr) {
        args.GetReturnValue().SetEmptyString();
        return;
    }
    auto isolate = args.GetIsolate();

    if (args.Length() == 1) {
        auto value = args[0];
        if (value->IsNull() ||
            value->IsUndefined() ||
            !value->IsObject()) {

            args.GetIsolate()->ThrowError(
                    "Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'"
            );
            return;
        }

        auto buf = value.As<v8::Object>();

        if (buf->IsArrayBuffer()) {

            auto buffer = buf.As<v8::ArrayBuffer>();

            auto data = static_cast<u_int8_t *>(buffer->GetBackingStore()->Data());
            auto size = buffer->ByteLength();
            auto decoded = nativescript_core_text_decoder_decode(
                    ptr->GetTextDecoder(),
                    data, size);
            //args.GetReturnValue().Set(ConvertToV8String(isolate, decoded.c_str()));
            auto returnValue = new OneByteStringResource((char *)decoded);
            auto ret = v8::String::NewExternalOneByte(isolate, returnValue);
            args.GetReturnValue().Set(ret.ToLocalChecked());

            return;
        }


        if (buf->IsArrayBufferView()) {

            auto buffer = buf.As<v8::ArrayBufferView>();


            auto store = buffer->Buffer()->GetBackingStore();
            auto buffer_data = static_cast<uint8_t *>(store->Data()) + buffer->ByteOffset();

            auto len = buffer->ByteLength();

//            v8::Local<v8::Value> size;
//
//            buf->Get(context, ConvertToV8String(isolate, "BYTES_PER_ELEMENT")).ToLocal(&size);
//
//            size_t len = 0;
//
//            if(!size.IsEmpty()){
//                len =  buffer->Length() * (size_t)size->NumberValue(context).FromMaybe(0);
//            }

          //  auto len = buffer->ByteLength();

            auto decoded = nativescript_core_text_decoder_decode_as_cow(
                    ptr->GetTextDecoder(),
                                                             buffer_data, len);


            // args.GetReturnValue().Set(ConvertToV8String(isolate, decoded.c_str()));
            auto returnValue = new OneByteStringResource(decoded);
            auto ret = v8::String::NewExternalOneByte(isolate, returnValue);
            args.GetReturnValue().Set(ret.ToLocalChecked());
            return;
        }


        args.GetIsolate()->ThrowError(
                "Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");


    }

    args.GetReturnValue().SetEmptyString();
}
