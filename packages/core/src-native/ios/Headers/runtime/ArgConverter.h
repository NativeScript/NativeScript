#ifndef ArgConverter_h
#define ArgConverter_h

#include <vector>
#include "libffi.h"
#include "Common.h"
#include "Caches.h"
#include "DataWrapper.h"
#include "IsolateWrapper.h"

namespace tns {

class ArgConverter;

struct MethodCallbackWrapper {
public:
    MethodCallbackWrapper(v8::Isolate* isolate, std::shared_ptr<v8::Persistent<v8::Value>> callback, const uint8_t initialParamIndex, const uint8_t paramsCount, const TypeEncoding* typeEncoding)
        : isolateWrapper_(isolate),
          callback_(callback),
          initialParamIndex_(initialParamIndex),
          paramsCount_(paramsCount),
          typeEncoding_(typeEncoding) {
    }
    IsolateWrapper isolateWrapper_;
    std::shared_ptr<v8::Persistent<v8::Value>> callback_;
    const uint8_t initialParamIndex_;
    const uint8_t paramsCount_;
    const TypeEncoding* typeEncoding_;
};

class ArgConverter {
public:
    static void Init(v8::Local<v8::Context> context, v8::GenericNamedPropertyGetterCallback structPropertyGetter, v8::GenericNamedPropertySetterCallback structPropertySetter);
    static v8::Local<v8::Value> Invoke(v8::Local<v8::Context> context, Class klass, v8::Local<v8::Object> receiver, V8Args& args, const MethodMeta* meta, bool isMethodCallback);
    static v8::Local<v8::Value> ConvertArgument(v8::Local<v8::Context> context, BaseDataWrapper* wrapper, bool skipGCRegistration = false, const std::vector<std::string>& additionalProtocols = std::vector<std::string>());
    static v8::Local<v8::Value> CreateJsWrapper(v8::Local<v8::Context> context, BaseDataWrapper* wrapper, v8::Local<v8::Object> receiver, bool skipGCRegistration = false, const std::vector<std::string>& additionalProtocols = std::vector<std::string>());
    static std::shared_ptr<v8::Persistent<v8::Value>> CreateEmptyObject(v8::Local<v8::Context> context, bool skipGCRegistration = false);
    static std::shared_ptr<v8::Persistent<v8::Value>> CreateEmptyStruct(v8::Local<v8::Context> context);
    static const Meta* FindMeta(Class klass, const TypeEncoding* typeEncoding = nullptr);
    static const Meta* GetMeta(std::string name);
    static const ProtocolMeta* FindProtocolMeta(Protocol* protocol);
    static void MethodCallback(ffi_cif* cif, void* retValue, void** argValues, void* userData);
    static void SetValue(v8::Local<v8::Context> context, void* retValue, v8::Local<v8::Value> value, const TypeEncoding* typeEncoding);
    static void ConstructObject(v8::Local<v8::Context> context, const v8::FunctionCallbackInfo<v8::Value>& info, Class klass, const InterfaceMeta* interfaceMeta = nullptr);
private:
    static v8::Local<v8::Function> CreateEmptyInstanceFunction(v8::Local<v8::Context> context, v8::GenericNamedPropertyGetterCallback propertyGetter = nullptr, v8::GenericNamedPropertySetterCallback propertySetter = nullptr);
    static std::shared_ptr<v8::Persistent<v8::Value>> CreateEmptyInstance(v8::Local<v8::Context> context, v8::Persistent<v8::Function>* ctorFunc, bool skipGCRegistration = false);
    static void FindMethodOverloads(Class klass, std::string methodName, MemberType type, std::vector<const MethodMeta*>& overloads);
    static const MethodMeta* FindInitializer(v8::Local<v8::Context> context, Class klass, const InterfaceMeta* interfaceMeta, const v8::FunctionCallbackInfo<v8::Value>& info, std::vector<v8::Local<v8::Value>>& args);
    static bool CanInvoke(v8::Local<v8::Context> context, const TypeEncoding* typeEncoding, v8::Local<v8::Value> arg);
    static bool CanInvoke(v8::Local<v8::Context> context, const MethodMeta* candidate, const v8::FunctionCallbackInfo<v8::Value>& info);
    static std::vector<v8::Local<v8::Value>> GetInitializerArgs(v8::Local<v8::Object> obj, std::string& constructorTokens);
    static void IndexedPropertyGetterCallback(uint32_t index, const v8::PropertyCallbackInfo<v8::Value>& args);
    static void IndexedPropertySetterCallback(uint32_t index, v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<v8::Value>& args);
    static bool IsErrorOutParameter(const TypeEncoding* typeEncoding);
    static std::vector<const MethodMeta*> GetInitializers(Caches* cache, Class klass, const InterfaceMeta* interfaceMeta);
    static void MethodCallbackInternal(ffi_cif* cif, void* retValue, void** argValues, void* userData);
};

}

#endif /* ArgConverter_h */
