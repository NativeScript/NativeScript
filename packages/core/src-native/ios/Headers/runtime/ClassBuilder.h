#ifndef ClassBuilder_h
#define ClassBuilder_h

#include "Common.h"
#include "Metadata.h"

namespace tns {

struct PropertyCallbackContext {
public:
    PropertyCallbackContext(v8::Isolate* isolate, std::shared_ptr<v8::Persistent<v8::Function>> callback, std::shared_ptr<v8::Persistent<v8::Object>> implementationObject, const PropertyMeta* meta)
        : isolate_(isolate),
          callback_(callback),
          implementationObject_(implementationObject),
          meta_(meta) {
        }
    v8::Isolate* isolate_;
    std::shared_ptr<v8::Persistent<v8::Function>> callback_;
    std::shared_ptr<v8::Persistent<v8::Object>> implementationObject_;
    const PropertyMeta* meta_;
};

class ClassBuilder {
public:
    static v8::Local<v8::FunctionTemplate> GetExtendFunction(v8::Isolate* isolate, const InterfaceMeta* interfaceMeta);
    static Class GetExtendedClass(std::string baseClassName, std::string staticClassName);

    static void RegisterBaseTypeScriptExtendsFunction(v8::Local<v8::Context> context);
    static void RegisterNativeTypeScriptExtendsFunction(v8::Local<v8::Context> context);
    static std::string GetTypeEncoding(const TypeEncoding* typeEncoding, int argsCount);
private:
    static unsigned long long classNameCounter_;

    static void ExtendCallback(const v8::FunctionCallbackInfo<v8::Value>& info);
    static void SuperAccessorGetterCallback(v8::Local<v8::Name> name, const v8::PropertyCallbackInfo<v8::Value>& info);
    static void ExtendedClassConstructorCallback(const v8::FunctionCallbackInfo<v8::Value>& info);

    static void ExposeDynamicMethods(v8::Local<v8::Context> context, Class extendedClass, v8::Local<v8::Value> exposedMethods, v8::Local<v8::Value> exposedProtocols, v8::Local<v8::Object> implementationObject);
    static void ExposeDynamicMembers(v8::Local<v8::Context> context, Class extendedClass, v8::Local<v8::Object> implementationObject, v8::Local<v8::Object> nativeSignature);
    static void VisitMethods(Class extendedClass, std::string methodName, const BaseClassMeta* meta, std::vector<const MethodMeta*>& methodMetas, std::vector<const ProtocolMeta*> exposedProtocols);
    static void VisitProperties(std::string propertyName, const BaseClassMeta* meta, std::vector<const PropertyMeta*>& propertyMetas, std::vector<const ProtocolMeta*> exposedProtocols);
    static void ExposeProperties(v8::Isolate* isolate, Class extendedClass, std::vector<const PropertyMeta*> propertyMetas, v8::Local<v8::Object> implementationObject, v8::Local<v8::Value> getter, v8::Local<v8::Value> setter);
    static std::string GetTypeEncoding(const TypeEncoding* typeEncoding);
    static BinaryTypeEncodingType GetTypeEncodingType(v8::Isolate* isolate, v8::Local<v8::Value> value);
    static IMP FindNotOverridenMethod(Class klass, SEL method);


    struct CacheItem {
    public:
        CacheItem(const InterfaceMeta* meta, id data)
            : meta_(meta),
              data_(data) {
        }
        const InterfaceMeta* meta_;
        id data_;
    };
};

}

#endif /* ClassBuilder_h */
