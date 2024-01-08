//
// Created by Osei Fortune on 19/04/2022.
//

#pragma once

#include <vector>
#include "Common.h"


class TextEncoderImpl {

public:
    TextEncoderImpl(TextEncoder* encoder);
    ~TextEncoderImpl() {
        nativescript_core_text_encoder_destroy(this->GetTextEncoder());
        this->encoder_ = nullptr;
    }

    TextEncoder* GetTextEncoder();

    static void Init(const v8::Local<v8::Object>& canvasModule, v8::Isolate *isolate);

    static TextEncoderImpl *GetPointer(v8::Local<v8::Object> object);

    static v8::Local<v8::FunctionTemplate> GetCtor(v8::Isolate *isolate);

    static void Ctor(const v8::FunctionCallbackInfo<v8::Value> &args);

    static void Encode(const v8::FunctionCallbackInfo<v8::Value> &args);

    static void
    Encoding(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

private:
    TextEncoder* encoder_;
};
