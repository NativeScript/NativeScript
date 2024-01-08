#ifndef UnmanagedType_h
#define UnmanagedType_h

#include "Common.h"
#include "DataWrapper.h"

namespace tns {

class UnmanagedType {
public:
    static v8::Local<v8::Value> Create(v8::Local<v8::Context> context, UnmanagedTypeWrapper* wrapper);
private:
    static void ConstructorCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void TakeUnretainedValueCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void TakeRetainedValueCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static v8::Local<v8::Value> TakeValue(const v8::FunctionCallbackInfo<v8::Value>& info, bool retained);
};

}

#endif /* UnmanagedType_h */
