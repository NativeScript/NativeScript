#ifndef Reference_h
#define Reference_h

#include "DataWrapper.h"
#include "Common.h"

namespace tns {

class Reference {
public:
    static void Register(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static v8::Local<v8::Value> FromPointer(v8::Local<v8::Context> context, v8::Local<v8::Value> type, void* handle);
    static v8::Local<v8::Function> GetInteropReferenceCtorFunc(v8::Local<v8::Context> context);
    static void* GetWrappedPointer(v8::Local<v8::Context> context, v8::Local<v8::Value> reference, const TypeEncoding* typeEncoding);
private:
    struct DataPair {
        DataPair(const TypeEncoding* typeEncoding, void* data, size_t size): typeEncoding_(typeEncoding), data_(data), size_(size) {
        }

        const TypeEncoding* typeEncoding_;
        void* data_;
        size_t size_;
    };

    static v8::Local<v8::Value> GetReferredValue(v8::Local<v8::Context> context, v8::Local<v8::Value> value);
    static void ReferenceConstructorCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void IndexedPropertyGetCallback(uint32_t index, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void IndexedPropertySetCallback(uint32_t index, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<v8::Value>& info);

    static void GetValueCallback(v8::Local<v8::Name> name, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void SetValueCallback(v8::Local<v8::Name> name, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<void>& info);
    static void RegisterToStringMethod(v8::Local<v8::Context> context, v8::Local<v8::Object> prototype);
    static DataPair GetTypeEncodingDataPair(v8::Local<v8::Object> obj);
};

}

#endif /* Reference_h */
