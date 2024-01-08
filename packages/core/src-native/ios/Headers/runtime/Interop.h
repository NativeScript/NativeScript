#ifndef Interop_h
#define Interop_h

#include <CoreFoundation/CFBase.h>
#include <objc/message.h>
#include "libffi.h"
#include "Common.h"
#include "Metadata.h"
#include "DataWrapper.h"
#include "FFICall.h"

namespace tns {

typedef void (*FFIMethodCallback)(ffi_cif* cif, void* retValue, void** argValues, void* userData);

struct MethodCall {
    MethodCall(v8::Local<v8::Context> context,
        bool isPrimitiveFunction,
        void* functionPointer,
        const TypeEncoding* typeEncoding,
        V8Args& args,
        id target,
        Class clazz,
        SEL selector,
        bool callSuper,
        MetaType metaType,
        bool provideErrorOutParameter,
        bool ownsReturnedObject,
        bool returnsUnmanaged,
        bool isInitializer)
        : context_(context),
          isPrimitiveFunction_(isPrimitiveFunction),
          functionPointer_(functionPointer),
          typeEncoding_(typeEncoding),
          args_(args),
          target_(target),
          clazz_(clazz),
          selector_(selector),
          callSuper_(callSuper),
          metaType_(metaType),
          provideErrorOutParameter_(provideErrorOutParameter),
          ownsReturnedObject_(ownsReturnedObject),
          returnsUnmanaged_(returnsUnmanaged),
          isInitializer_(isInitializer) {
    }

    v8::Local<v8::Context> context_;
    bool isPrimitiveFunction_;
    void* functionPointer_;
    const TypeEncoding* typeEncoding_;
    V8Args& args_;
    id target_;
    Class clazz_;
    SEL selector_;
    bool callSuper_;
    MetaType metaType_;
    bool provideErrorOutParameter_;
    bool ownsReturnedObject_;
    bool returnsUnmanaged_;
    bool isInitializer_;
};

struct CMethodCall: MethodCall {
    CMethodCall(
        v8::Local<v8::Context> context,
        void* functionPointer,
        const TypeEncoding* typeEncoding,
        V8Args& args,
        bool ownsReturnedObject,
        bool returnsUnmanaged)
        : MethodCall(
            context,
            true,
            functionPointer,
            typeEncoding,
            args,
            nil,
            nil,
            nil,
            false,
            MetaType::Undefined,
            false,
            ownsReturnedObject,
            returnsUnmanaged,
            false) {
    }
};

struct ObjCMethodCall: public MethodCall {
    ObjCMethodCall(
        v8::Local<v8::Context> context,
        const MethodMeta* meta,
        id target,
        Class clazz,
        V8Args& args,
        bool callSuper)
        : MethodCall(
            context,
            false,
            callSuper ? (void*)objc_msgSendSuper : (void*)objc_msgSend,
            meta->encodings()->first(),
            args,
            target,
            clazz,
            meta->selector(),
            callSuper,
            meta->type(),
            meta->hasErrorOutParameter() && args.Length() < meta->encodings()->count - 1,
            meta->ownsReturnedCocoaObject(),
            false,
            meta->isInitializer()) {
        }
};

class Interop {
public:
    static void RegisterInteropTypes(v8::Local<v8::Context> context);
    static IMP CreateMethod(const uint8_t initialParamIndex, const uint8_t argsCount, const TypeEncoding* typeEncoding, FFIMethodCallback callback, void* userData);
    static id CallInitializer(v8::Local<v8::Context> context, const MethodMeta* methodMeta, id target, Class clazz, V8Args& args);
    static v8::Local<v8::Value> CallFunction(ObjCMethodCall& methodCall);
    static v8::Local<v8::Value> CallFunction(CMethodCall& methodCall);
    static v8::Local<v8::Value> GetResult(v8::Local<v8::Context> context, const TypeEncoding* typeEncoding, BaseCall* call, bool marshalToPrimitive, std::shared_ptr<v8::Persistent<v8::Value>> parentStruct = nullptr, bool isStructMember = false, bool ownsReturnedObject = false, bool returnsUnmanaged = false, bool isInitializer = false);
    static void SetStructPropertyValue(v8::Local<v8::Context> context, StructWrapper* wrapper, StructField field, v8::Local<v8::Value> value);
    static void InitializeStruct(v8::Local<v8::Context> context, void* destBuffer, std::vector<StructField> fields, v8::Local<v8::Value> inititalizer);
    static void WriteValue(v8::Local<v8::Context> context, const TypeEncoding* typeEncoding, void* dest, v8::Local<v8::Value> arg);
    static id ToObject(v8::Local<v8::Context> context, v8::Local<v8::Value> arg);
    static v8::Local<v8::Value> GetPrimitiveReturnType(v8::Local<v8::Context> context, BinaryTypeEncodingType type, BaseCall* call);
private:
    static void ExecuteWriteValueDebugValidationsIfInDebug(v8::Local<v8::Context> context, const TypeEncoding* typeEncoding, void* dest, v8::Local<v8::Value> arg);
    static std::pair<IMP, ffi_closure*> CreateMethodInternal(const uint8_t initialParamIndex, const uint8_t argsCount, const TypeEncoding* typeEncoding, FFIMethodCallback callback, void* userData);
    static CFTypeRef CreateBlock(const uint8_t initialParamIndex, const uint8_t argsCount, const TypeEncoding* typeEncoding, FFIMethodCallback callback, void* userData);
    template <typename T>
    static void SetStructValue(v8::Local<v8::Value> value, void* destBuffer, ptrdiff_t position);
    static void InitializeStruct(v8::Local<v8::Context> context, void* destBuffer, std::vector<StructField> fields, v8::Local<v8::Value> inititalizer, ptrdiff_t& position);
    static void RegisterInteropType(v8::Local<v8::Context> context, v8::Local<v8::Object> types, std::string name, PrimitiveDataWrapper* wrapper, bool autoDelete = true);
    static void RegisterBufferFromDataFunction(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void RegisterStringFromCString(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void RegisterHandleOfFunction(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void RegisterAllocFunction(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void RegisterFreeFunction(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void RegisterAdoptFunction(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void RegisterSizeOfFunction(v8::Local<v8::Context> context, v8::Local<v8::Object> interop);
    static void SetFFIParams(v8::Local<v8::Context> context, const TypeEncoding* typeEncoding, FFICall* call, const int argsCount, const int initialParameterIndex, V8Args& args);
    static bool isRefTypeEqual(const TypeEncoding* typeEncoding,const char* clazz);
    static v8::Local<v8::Array> ToArray(v8::Local<v8::Object> object);
    static v8::Local<v8::Value> StructToValue(v8::Local<v8::Context> context, void* result, StructInfo structInfo, std::shared_ptr<v8::Persistent<v8::Value>> parentStruct);
    static const TypeEncoding* CreateEncoding(BinaryTypeEncodingType type);
    static v8::Local<v8::Value> HandleOf(v8::Local<v8::Context> context, v8::Local<v8::Value> value);
    static v8::Local<v8::Value> CallFunctionInternal(MethodCall& methodCall);
    static bool IsNumbericType(BinaryTypeEncodingType type);
    static v8::Local<v8::Object> GetInteropType(v8::Local<v8::Context> context, BinaryTypeEncodingType type);
    static std::vector<std::string> GetAdditionalProtocols(const TypeEncoding* typeEncoding);
    static SEL GetSwizzledMethodSelector(SEL selector);

    template <typename T>
    static inline void SetValue(void* dest, T value) {
        if (std::is_same<T, SEL>::value) {
            memcpy(dest, &value, sizeof(SEL*));
        } else {
            *static_cast<T*>(dest) = value;
        }
    }

    template <typename T>
    static void SetNumericValue(void* dest, double value) {
        if (value < std::numeric_limits<T>::lowest()) {
            Interop::SetValue(dest, std::numeric_limits<T>::lowest());
        } else if (value > std::numeric_limits<T>::max()) {
            Interop::SetValue(dest, std::numeric_limits<T>::max());
        } else {
            Interop::SetValue(dest, (T)value);
        }
    }

    typedef struct JSBlock {
        typedef struct {
            uintptr_t reserved;
            uintptr_t size;
            void (*copy)(struct JSBlock*, const struct JSBlock*);
            void (*dispose)(struct JSBlock*);
        } JSBlockDescriptor;

        enum {
            BLOCK_NEEDS_FREE = (1 << 24), // runtime
            BLOCK_HAS_COPY_DISPOSE = (1 << 25), // compiler
        };

        void* isa;
        volatile int32_t flags; // contains ref count
        int32_t reserved;
        const void* invoke;
        JSBlockDescriptor* descriptor;
        void* userData;
        ffi_closure* ffiClosure;
        
        static JSBlockDescriptor kJSBlockDescriptor;
    } JSBlock;
    
};

}

#endif /* Interop_h */
