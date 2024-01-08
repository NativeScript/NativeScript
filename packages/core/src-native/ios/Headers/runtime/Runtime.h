#ifndef Runtime_h
#define Runtime_h

#include "libplatform/libplatform.h"
#include "Common.h"
#include "ModuleInternal.h"
#include "MetadataBuilder.h"
#include "SpinLock.h"
#include "Caches.h"

namespace tns {

class Runtime {
public:
    Runtime();
    ~Runtime();
    v8::Isolate* CreateIsolate();
    void Init(v8::Isolate* isolate, bool isWorker = false);
    void RunMainScript();
    v8::Isolate* GetIsolate();

    const int WorkerId();

    void SetWorkerId(int workerId);
    inline bool IsRuntimeWorker() {
        return workerId_ > 0;
    }
    
    inline CFRunLoopRef RuntimeLoop() {
        return runtimeLoop_;
    }

    void RunModule(const std::string moduleName);

    static void Initialize();

    static Runtime* GetCurrentRuntime() {
        return currentRuntime_;
    }
    
    static Runtime* GetRuntime(v8::Isolate* isolate);

    static bool IsWorker() {
        if (currentRuntime_ == nullptr) {
            return false;
        }

        return currentRuntime_->IsRuntimeWorker();
    }

    static std::shared_ptr<v8::Platform> GetPlatform() {
        return platform_;
    }

    static id GetAppConfigValue(std::string key);

    static bool IsAlive(const v8::Isolate* isolate);
private:
    static thread_local Runtime* currentRuntime_;
    static std::shared_ptr<v8::Platform> platform_;
    static std::vector<v8::Isolate*> isolates_;
    static SpinMutex isolatesMutex_;
    static bool v8Initialized_;
    static std::atomic<int> nextIsolateId;

    void DefineGlobalObject(v8::Local<v8::Context> context, bool isWorker);
    void DefineCollectFunction(v8::Local<v8::Context> context);
    void DefineNativeScriptVersion(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate);
    void DefinePerformanceObject(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate);
    void DefineTimeMethod(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate);
    void DefineDrainMicrotaskMethod(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate);
    static void PerformanceNowCallback(const v8::FunctionCallbackInfo<v8::Value>& args);
    v8::Isolate* isolate_;
    std::unique_ptr<ModuleInternal> moduleInternal_;
    int workerId_;
    CFRunLoopRef runtimeLoop_;
    // TODO: refactor this. This is only needed because, during program termination (UIApplicationMain not called)
    // the Cache::Workers is released (static initialization order fiasco https://en.cppreference.com/w/cpp/language/siof)
    // so it released the Cache::Workers shared_ptr and then releases the Runtime unique_ptr
    // eventually we just need to refactor so that Runtime::Initialize is responsible for its initalization
    // and lifecycle
    std::shared_ptr<ConcurrentMap<int, std::shared_ptr<Caches::WorkerState>>> workerCache_;
};

}

#endif /* Runtime_h */
