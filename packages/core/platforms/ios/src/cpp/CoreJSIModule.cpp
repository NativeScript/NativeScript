//
// Created by Osei Fortune on 25/02/2023.
//

#include "CoreJSIModule.h"
#include "Helpers.h"

void CoreJSIModule::install(v8::Isolate *isolate) {

    auto context = isolate->GetCurrentContext();
    auto global = context->Global();

    if (!global->
            HasOwnProperty(context, ConvertToV8String(isolate, "NativeScriptCoreModule")).FromMaybe(
            false)) {


        v8::Locker locker(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);


        auto coreMod = v8::Object::New(isolate);
        TextDecoderImpl::Init(coreMod, isolate);
        TextEncoderImpl::Init(coreMod, isolate);
        URLImpl::Init(coreMod, isolate);

        coreMod->Set(context, ConvertToV8String(isolate, "atob"),
                     v8::FunctionTemplate::New(isolate, &Atob)->GetFunction(
                             context).ToLocalChecked());
        coreMod->Set(context, ConvertToV8String(isolate, "btoa"),
                     v8::FunctionTemplate::New(isolate, &Btoa)->GetFunction(
                             context).ToLocalChecked());

        global->Set(context,
                    ConvertToV8String(isolate, "NativeScriptCoreModule"), coreMod);

    }
}

void CoreJSIModule::Atob(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto value = args[0];
    auto string = ConvertFromV8String(isolate, value);
    auto buffer = nativescript_core_atob(string.c_str());
    auto returnValue = new OneByteStringResource(buffer);
    auto ret = v8::String::NewExternalOneByte(isolate, returnValue);
    args.GetReturnValue().Set(ret.ToLocalChecked());
}

void CoreJSIModule::Btoa(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto value = ConvertFromV8String(isolate, args[0]);
    auto returnValue = new OneByteStringResource(nativescript_core_btoa(value.c_str()));
    auto ret = v8::String::NewExternalOneByte(isolate, returnValue);
    args.GetReturnValue().Set(ret.ToLocalChecked());
}
