#ifndef ExtVector_h
#define ExtVector_h

#include "Common.h"
#include "libffi.h"
#include "Metadata.h"

namespace tns {

class ExtVector {
public:
    static v8::Local<v8::Value> NewInstance(v8::Isolate* isolate, void* data, ffi_type* ffiType, const TypeEncoding* innerTypeEncoding, const TypeEncoding* typeEncoding);
private:
    static void RegisterToStringMethod(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> prototypeTemplate);
    static void IndexedPropertyGetCallback(uint32_t index, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void IndexedPropertySetCallback(uint32_t index, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<v8::Value>& info);
};

}

#endif /* ExtVector_h */
