//
// Created by Osei Fortune on 25/02/2023.
//

#pragma once

#include <memory>
#include <array>
#include "Helpers.h"

#include "TextDecoderImpl.h"
#include "TextEncoderImpl.h"

#include "URLImpl.h"

class CoreJSIModule {
public:
    static void install(v8::Isolate *isolate);

    static void Atob(const v8::FunctionCallbackInfo<v8::Value> &args);

    static void Btoa(const v8::FunctionCallbackInfo<v8::Value> &args);
};

