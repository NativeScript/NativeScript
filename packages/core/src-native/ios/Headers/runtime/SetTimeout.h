#ifndef SetTimeout_h
#define SetTimeout_h

#include "Common.h"
#include "robin_hood.h"

namespace tns {

class SetTimeout {
public:
    static void Init(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate);
private:
    static void SetTimeoutCallback(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void ClearTimeoutCallback(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Elapsed(const uint32_t key);
    static void RemoveKey(const uint32_t key);
    static uint32_t count_;

    struct CacheEntry {
        CacheEntry(v8::Isolate* isolate, v8::Persistent<v8::Function>* callback)
            : isolate_(isolate),
              callback_(callback) {
        }

        v8::Isolate* isolate_;
        v8::Persistent<v8::Function>* callback_;
    };

    static robin_hood::unordered_map<uint32_t, CacheEntry> cache_;
};

}

#endif /* SetTimeout_h */
