#ifndef Caches_h
#define Caches_h

#include <string>
#include <vector>
#include "ConcurrentMap.h"
#include "robin_hood.h"
#include "Common.h"
#include "Metadata.h"

namespace tns {

struct StructInfo;

struct pair_hash {
    template <class T1, class T2>
    std::size_t operator() (const std::pair<T1, T2> &pair) const {
        return std::hash<T1>()(pair.first) ^ std::hash<T2>()(pair.second);
    }
};

class Caches {
public:
    class WorkerState {
    public:
        WorkerState(v8::Isolate* isolate, std::shared_ptr<v8::Persistent<v8::Value>> poWorker, void* userData)
        : isolate_(isolate),
        poWorker_(poWorker),
        userData_(userData) {
        }

        v8::Isolate* GetIsolate() {
            return this->isolate_;
        }

        std::shared_ptr<v8::Persistent<v8::Value>> GetWorker() {
            return this->poWorker_;
        }

        void* UserData() {
            return this->userData_;
        }
    private:
        v8::Isolate* isolate_;
        std::shared_ptr<v8::Persistent<v8::Value>> poWorker_;
        void* userData_;
    };

    Caches(v8::Isolate* isolate, const int& isolateId_ = -1);
    ~Caches();
    
    bool isWorker = false;

    static std::shared_ptr<ConcurrentMap<std::string, const Meta*>> Metadata;
    static std::shared_ptr<ConcurrentMap<int, std::shared_ptr<Caches::WorkerState>>> Workers;

    inline static std::shared_ptr<Caches> Init(v8::Isolate* isolate, const int& isolateId) {
        auto cache = std::make_shared<Caches>(isolate, isolateId);
        // create a new shared_ptr that will live until Remove is called
        isolate->SetData(0, static_cast<void*>(new std::shared_ptr<Caches>(cache)));
        return cache;
    }
    inline static std::shared_ptr<Caches> Get(v8::Isolate* isolate) {
        auto cache = isolate->GetData(0);
        if (cache != nullptr) {
            return *reinterpret_cast<std::shared_ptr<Caches>*>(cache);
        }
        // this should only happen when an isolate is accessed after disposal
        // so we return a dummy cache
        return std::make_shared<Caches>(isolate);
    }
    static void Remove(v8::Isolate* isolate);
    
    inline int getIsolateId() {
        return isolateId_;
    }

    inline void InvalidateIsolate() {
        isolateId_ = -1;
    }

    inline bool IsValid() {
        return isolateId_ != -1;
    }

    void SetContext(v8::Local<v8::Context> context);
    v8::Local<v8::Context> GetContext();

    robin_hood::unordered_map<const Meta*, std::unique_ptr<v8::Persistent<v8::Value>>> Prototypes;
    robin_hood::unordered_map<std::string, std::unique_ptr<v8::Persistent<v8::Object>>> ClassPrototypes;
    robin_hood::unordered_map<const BaseClassMeta*, std::unique_ptr<v8::Persistent<v8::FunctionTemplate>>> CtorFuncTemplates;
    robin_hood::unordered_map<std::string, std::unique_ptr<v8::Persistent<v8::Function>>> CtorFuncs;
    robin_hood::unordered_map<std::string, std::unique_ptr<v8::Persistent<v8::Function>>> ProtocolCtorFuncs;
    robin_hood::unordered_map<std::string, std::unique_ptr<v8::Persistent<v8::Function>>> StructConstructorFunctions;
    robin_hood::unordered_map<BinaryTypeEncodingType, std::unique_ptr<v8::Persistent<v8::Object>>> PrimitiveInteropTypes;
    robin_hood::unordered_map<std::string, std::unique_ptr<v8::Persistent<v8::Function>>> CFunctions;

    robin_hood::unordered_map<id, std::shared_ptr<v8::Persistent<v8::Value>>> Instances;
    robin_hood::unordered_map<std::pair<void*, std::string>, std::shared_ptr<v8::Persistent<v8::Value>>, pair_hash> StructInstances;
    robin_hood::unordered_map<const void*, std::shared_ptr<v8::Persistent<v8::Object>>> PointerInstances;

    std::function<v8::Local<v8::FunctionTemplate>(v8::Local<v8::Context>, const BaseClassMeta*, KnownUnknownClassPair, const std::vector<std::string>&)> ObjectCtorInitializer;
    std::function<v8::Local<v8::Function>(v8::Local<v8::Context>, StructInfo)> StructCtorInitializer;
    robin_hood::unordered_map<std::string, double> Timers;
    robin_hood::unordered_map<const InterfaceMeta*, std::vector<const MethodMeta*>> Initializers;

    std::unique_ptr<v8::Persistent<v8::Function>> EmptyObjCtorFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> EmptyStructCtorFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> SliceFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> OriginalExtendsFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> WeakRefGetterFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> WeakRefClearFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> SmartJSONStringifyFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> InteropReferenceCtorFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> PointerCtorFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> FunctionReferenceCtorFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    std::unique_ptr<v8::Persistent<v8::Function>> UnmanagedTypeCtorFunc = std::unique_ptr<v8::Persistent<v8::Function>>(nullptr);
    
    
    using unique_void_ptr = std::unique_ptr<void, void(*)(void const*)>;
    template<typename T>
    auto unique_void(T * ptr) -> unique_void_ptr
    {
        return unique_void_ptr(ptr, [](void const * data) {
             T const * p = static_cast<T const*>(data);
             delete p;
        });
    }
    std::vector<unique_void_ptr> cacheBoundObjects_;
    template<typename T>
    void registerCacheBoundObject(T *ptr) {
        this->cacheBoundObjects_.push_back(unique_void(ptr));
    }
private:
    v8::Isolate* isolate_;
    std::shared_ptr<v8::Persistent<v8::Context>> context_;
    int isolateId_;
};

}

#endif /* Caches_h */
