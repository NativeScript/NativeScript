#ifndef MetadataBuilder_h
#define MetadataBuilder_h

#include "robin_hood.h"
#include "libffi.h"
#include "Common.h"
#include "Metadata.h"
#include "ClassBuilder.h"
#include "DataWrapper.h"

namespace tns {

class MetadataBuilder {
public:
    static void RegisterConstantsOnGlobalObject(v8::Isolate* isolate, v8::Local<v8::ObjectTemplate> globalTemplate, bool isWorkerThread);
    static v8::Local<v8::FunctionTemplate> GetOrCreateConstructorFunctionTemplate(v8::Local<v8::Context> context, const BaseClassMeta* meta, KnownUnknownClassPair pair, const std::vector<std::string>& additionalProtocols = std::vector<std::string>());
    static v8::Local<v8::Function> GetOrCreateStructCtorFunction(v8::Local<v8::Context> context, StructInfo structInfo);
    static void StructPropertyGetterCallback(v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void StructPropertySetterCallback(v8::Local<v8::Name> property, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<v8::Value>& info);
private:
    static v8::Local<v8::FunctionTemplate> GetOrCreateConstructorFunctionTemplateInternal(v8::Local<v8::Context> context, const BaseClassMeta* meta, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& instanceMembers, robin_hood::unordered_map<std::string, uint8_t>& staticMembers, const std::vector<std::string>& additionalProtocols = std::vector<std::string>());
    static void GlobalPropertyGetter(v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void ClassConstructorCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void AllocCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void MethodCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void CFunctionCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void PropertyGetterCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void PropertySetterCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void PropertyNameGetterCallback(v8::Local<v8::Name> name, const v8::PropertyCallbackInfo<v8::Value> &info);
    static void PropertyNameSetterCallback(v8::Local<v8::Name> name, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<void> &info);
    static void StructConstructorCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void StructEqualsCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void ToStringFunctionCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static std::pair<ffi_type*, void*> GetStructData(v8::Local<v8::Context> context, v8::Local<v8::Object> initializer, StructInfo structInfo);

    static v8::Local<v8::Value> InvokeMethod(v8::Local<v8::Context> context, const MethodMeta* meta, v8::Local<v8::Object> receiver, V8Args& args, std::string containingClass, bool isMethodCallback);
    static void RegisterAllocMethod(v8::Isolate* isolate, v8::Local<v8::FunctionTemplate> ctorFuncTemplate, const InterfaceMeta* interfaceMeta);
    static void RegisterInstanceMethods(v8::Local<v8::Context> context, v8::Local<v8::FunctionTemplate> ctorFuncTemplate, const BaseClassMeta* meta, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void RegisterInstanceProperties(v8::Local<v8::Context> context, v8::Local<v8::FunctionTemplate> ctorFuncTemplate, const BaseClassMeta* meta, std::string className, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void RegisterInstanceProtocols(v8::Local<v8::Context> context, v8::Local<v8::FunctionTemplate> ctorFuncTemplate, const BaseClassMeta* meta, std::string className, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void RegisterAdditionalProtocols(v8::Local<v8::Context> context, v8::Local<v8::FunctionTemplate> ctorFuncTemplate, KnownUnknownClassPair pair, const std::vector<std::string>& additionalProtocols, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void RegisterStaticMethods(v8::Local<v8::Context> context, v8::Local<v8::Function> ctorFunc, const BaseClassMeta* meta, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void RegisterStaticProperties(v8::Local<v8::Context> context, v8::Local<v8::Function> ctorFunc, const BaseClassMeta* meta, const std::string className, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void RegisterStaticProtocols(v8::Local<v8::Context> context, v8::Local<v8::Function> ctorFunc, const BaseClassMeta* meta, const std::string className, KnownUnknownClassPair pair, robin_hood::unordered_map<std::string, uint8_t>& names);
    static void DefineFunctionLengthProperty(v8::Local<v8::Context> context, const TypeEncodingsList<ArrayCount>* encodings, v8::Local<v8::Function> func);

    static void SwizzledInstanceMethodCallback(v8::Local<v8::Name> property, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void SwizzledPropertyCallback(v8::Local<v8::Name> property, const v8::PropertyDescriptor& desc, const v8::PropertyCallbackInfo<v8::Value>& info);

    struct GlobalHandlerContext {
        GlobalHandlerContext(bool isWorkerThread): isWorkerThread_(isWorkerThread) {
        }
        bool isWorkerThread_;
    };

    template<class T>
    struct CacheItem {
        CacheItem(const T* meta, const std::string className, void* userData = nullptr)
        : meta_(meta),
          className_(className),
          userData_(userData) {
            static_assert(std::is_base_of<Meta, T>::value, "Derived not derived from Meta");
        }
        const T* meta_;
        const std::string className_;
        void* userData_;
    };
};

}

#endif /* MetadataBuilder_h */
