//
// Created by Osei Fortune on 07/01/2024.
//

#pragma once

#include <vector>
#include "Common.h"

class URLImpl {
public:
    URLImpl(URL *url);

    ~URLImpl() {
        nativescript_core_url_destroy(this->GetURL());
        this->url_ = nullptr;
    }

    URL *GetURL();

    static void Init(const v8::Local<v8::Object> &canvasModule, v8::Isolate *isolate);

    static URLImpl *GetPointer(v8::Local<v8::Object> object);

    static v8::Local<v8::FunctionTemplate> GetCtor(v8::Isolate *isolate);

    static void Ctor(const v8::FunctionCallbackInfo<v8::Value> &args);


    static void
    GetHash(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetHash(v8::Local<v8::String> property,
                        v8::Local<v8::Value> value,
                        const v8::PropertyCallbackInfo<void> &info);


    static void
    GetHost(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetHost(v8::Local<v8::String> property,
                        v8::Local<v8::Value> value,
                        const v8::PropertyCallbackInfo<void> &info);


    static void
    GetHostName(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetHostName(v8::Local<v8::String> property,
                            v8::Local<v8::Value> value,
                            const v8::PropertyCallbackInfo<void> &info);


    static void
    GetHref(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetHref(v8::Local<v8::String> property,
                        v8::Local<v8::Value> value,
                        const v8::PropertyCallbackInfo<void> &info);


    static void
    GetOrigin(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);


    static void
    GetPassword(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetPassword(v8::Local<v8::String> property,
                            v8::Local<v8::Value> value,
                            const v8::PropertyCallbackInfo<void> &info);


    static void
    GetPathName(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetPathName(v8::Local<v8::String> property,
                            v8::Local<v8::Value> value,
                            const v8::PropertyCallbackInfo<void> &info);


    static void
    GetPort(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetPort(v8::Local<v8::String> property,
                        v8::Local<v8::Value> value,
                        const v8::PropertyCallbackInfo<void> &info);


    static void
    GetProtocol(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetProtocol(v8::Local<v8::String> property,
                            v8::Local<v8::Value> value,
                            const v8::PropertyCallbackInfo<void> &info);


    static void
    GetSearch(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetSearch(v8::Local<v8::String> property,
                          v8::Local<v8::Value> value,
                          const v8::PropertyCallbackInfo<void> &info);


    static void
    GetUserName(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value> &info);

    static void SetUserName(v8::Local<v8::String> property,
                            v8::Local<v8::Value> value,
                            const v8::PropertyCallbackInfo<void> &info);

    static void ToString(const v8::FunctionCallbackInfo<v8::Value> &args);

    static void CanParse(const v8::FunctionCallbackInfo<v8::Value> &args);

private:
    URL *url_;
};
