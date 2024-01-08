#ifndef SymbolIterator_h
#define SymbolIterator_h

#include "Common.h"

namespace tns {

class SymbolIterator {
public:
    static void Set(v8::Local<v8::Context> context, v8::Local<v8::Value> object);
private:
    static v8::Local<v8::Object> CreateIteratorObject(v8::Local<v8::Context> context, v8::Local<v8::Value> object);
    static void NextCallback(const v8::FunctionCallbackInfo<v8::Value>& args);
};

}

#endif /* SymbolIterator_h */
