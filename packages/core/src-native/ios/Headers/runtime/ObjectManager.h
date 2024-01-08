#ifndef ObjectManager_h
#define ObjectManager_h

#include "Common.h"

namespace tns {

class ObjectManager;

struct ObjectWeakCallbackState {
    ObjectWeakCallbackState(std::shared_ptr<v8::Persistent<v8::Value>> target) : target_(target) {
    }

    std::shared_ptr<v8::Persistent<v8::Value>> target_;
};

class ObjectManager {
public:
    static void Init(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate);
    static std::shared_ptr<v8::Persistent<v8::Value>> Register(v8::Local<v8::Context> context, const v8::Local<v8::Value> obj);
    static void FinalizerCallback(const v8::WeakCallbackInfo<ObjectWeakCallbackState>& data);
    static bool DisposeValue(v8::Isolate* isolate, v8::Local<v8::Value> value, bool isFinalDisposal = false);
private:
    static void ReleaseNativeCounterpartCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static long GetRetainCount(id obj);
    static bool IsInstanceOf(id obj, Class clazz);
};

}

#endif /* ObjectManager_h */
