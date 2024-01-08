#ifndef DataWrapper_h
#define DataWrapper_h

#include <thread>
#include <functional>
#include "Metadata.h"
#include "libffi.h"
#include "ConcurrentQueue.h"
#include "Common.h"

namespace tns {

class PrimitiveDataWrapper;

enum class WrapperType {
    Base = 1 << 0,
    Primitive = 1 << 1,
    Enum = 1 << 2,
    Struct = 1 << 3,
    StructType = 1 << 4,
    ObjCAllocObject = 1 << 5,
    ObjCObject = 1 << 6,
    ObjCClass = 1 << 7,
    ObjCProtocol = 1 << 8,
    Function = 1 << 9,
    AnonymousFunction = 1 << 10,
    Block = 1 << 11,
    Reference = 1 << 12,
    ReferenceType = 1 << 13,
    Pointer = 1 << 14,
    PointerType = 1 << 15,
    FunctionReference = 1 << 16,
    FunctionReferenceType = 1 << 17,
    ExtVector = 1 << 18,
    Worker = 1 << 19,
    UnmanagedType = 1 << 20,
};

struct V8Args {
public:
    virtual v8::Local<v8::Value> operator[](int i) const = 0;
    virtual size_t Length() const = 0;
};

struct V8FunctionCallbackArgs: public V8Args {
public:
    V8FunctionCallbackArgs(const v8::FunctionCallbackInfo<v8::Value>& info)
        : info_(info) {
    }

    v8::Local<v8::Value> operator[](int i) const override {
        return this->info_[i];
    }

    size_t Length() const override {
        return this->info_.Length();
    }
private:
    const v8::FunctionCallbackInfo<v8::Value>& info_;
};

struct V8VectorArgs: public V8Args {
public:
    V8VectorArgs(const std::vector<v8::Local<v8::Value>>& args)
        : args_(args) {
    }

    v8::Local<v8::Value> operator[](int i) const override {
        return this->args_[i];
    }

    size_t Length() const override {
        return this->args_.size();
    }
private:
    const std::vector<v8::Local<v8::Value>>& args_;
};

struct V8SimpleValueArgs: public V8Args {
public:
    V8SimpleValueArgs(v8::Local<v8::Value>& value)
        : value_(value) {
    }

    v8::Local<v8::Value> operator[](int i) const override {
        return this->value_;
    }

    size_t Length() const override {
        return 1;
    }
private:
    v8::Local<v8::Value>& value_;
};

struct V8EmptyValueArgs: public V8Args {
public:
    v8::Local<v8::Value> operator[](int i) const override {
        return v8::Local<v8::Value>();
    }

    size_t Length() const override {
        return 0;
    }
};

struct StructField {
public:
    StructField(ptrdiff_t offset, ffi_type* ffiType, std::string name, const TypeEncoding* encoding)
        : offset_(offset),
          ffiType_(ffiType),
          name_(name),
          encoding_(encoding) {
    }

    ptrdiff_t Offset() {
        return this->offset_;
    }

    ffi_type* FFIType() {
        return this->ffiType_;
    }

    std::string Name() {
        return this->name_;
    }

    const TypeEncoding* Encoding() {
        return this->encoding_;
    }
private:
    ptrdiff_t offset_;
    ffi_type* ffiType_;
    std::string name_;
    const TypeEncoding* encoding_;
};

struct StructInfo {
public:
    StructInfo(std::string name, ffi_type* ffiType, std::vector<StructField> fields)
        : name_(name),
          ffiType_(ffiType),
          fields_(fields) {
    }

    std::string Name() const {
        return this->name_;
    }

    ffi_type* FFIType() const {
        return this->ffiType_;
    }

    std::vector<StructField> Fields() {
        return this->fields_;
    }
private:
    std::string name_;
    ffi_type* ffiType_;
    std::vector<StructField> fields_;
};

class BaseDataWrapper {
public:
    BaseDataWrapper()
        : gcProtected_(false) {
    }

    virtual ~BaseDataWrapper() = default;

    const virtual WrapperType Type() {
        return WrapperType::Base;
    }

    bool IsGcProtected() {
        return this->gcProtected_;
    }

    void GcProtect() {
        this->gcProtected_ = true;
    }

    void GcUnprotect() {
        this->gcProtected_ = false;
    }
private:
    bool gcProtected_;
};

class EnumDataWrapper: public BaseDataWrapper {
public:
    EnumDataWrapper(std::string jsCode)
        : jsCode_(jsCode) {
    }

    const WrapperType Type() {
        return WrapperType::Enum;
    }

    std::string JSCode() {
        return jsCode_;
    }
private:
    std::string jsCode_;
};

class PointerTypeWrapper: public BaseDataWrapper {
public:
    const WrapperType Type() {
        return WrapperType::PointerType;
    }
};

class PointerWrapper: public BaseDataWrapper {
public:
    PointerWrapper(void* data)
        : data_(data),
          isAdopted_(false) {
    }

    const WrapperType Type() {
        return WrapperType::Pointer;
    }

    void* Data() const {
        return this->data_;
    }

    void SetData(void* data) {
        this->data_ = data;
    }

    bool IsAdopted() const {
        return this->isAdopted_;
    }

    void SetAdopted(bool value) {
        this->isAdopted_ = value;
    }
private:
    void* data_;
    bool isAdopted_;
};

class ReferenceTypeWrapper: public BaseDataWrapper {
public:
    const WrapperType Type() {
        return WrapperType::ReferenceType;
    }
};

class ReferenceWrapper: public BaseDataWrapper {
public:
    ReferenceWrapper(BaseDataWrapper* typeWrapper, v8::Persistent<v8::Value>* value)
        : typeWrapper_(typeWrapper),
          value_(value),
          encoding_(nullptr),
          data_(nullptr),
          disposeData_(false) {
    }

    ~ReferenceWrapper() {
        if(this->value_ != nullptr) {
            value_->Reset();
            delete value_;
        }
        
        if (this->data_ != nullptr) {
            std::free(this->data_);
        }
    }

    const WrapperType Type() {
        return WrapperType::Reference;
    }

    BaseDataWrapper* TypeWrapper() {
        return this->typeWrapper_;
    }

    v8::Persistent<v8::Value>* Value() {
        return this->value_;
    }

    void SetValue(v8::Persistent<v8::Value>* value) {
        if (this->value_ != nullptr) {
            this->value_->Reset();
        }
        this->value_ = value;
    }

    const TypeEncoding* Encoding() {
        return this->encoding_;
    }

    void SetEncoding(const TypeEncoding* encoding) {
        this->encoding_ = encoding;
    }

    void* Data() const {
        return this->data_;
    }

    void SetData(void* data, bool disposeData = false) {
        if (this->data_ != nullptr && this->disposeData_) {
            std::free(this->data_);
        }
        this->data_ = data;
        this->disposeData_ = disposeData;
    }
private:
    BaseDataWrapper* typeWrapper_;
    v8::Persistent<v8::Value>* value_;
    const TypeEncoding* encoding_;
    void* data_;
    bool disposeData_;
};

class PrimitiveDataWrapper: public BaseDataWrapper {
public:
    PrimitiveDataWrapper(size_t size,const TypeEncoding* typeEncoding, bool autoDeleteEncoding)
        : size_(size),
          typeEncoding_(typeEncoding),
          autoDeleteEncoding_(autoDeleteEncoding) {
    }
    ~PrimitiveDataWrapper() {
        if (autoDeleteEncoding_) {
            std::free((struct TypeEncoding*)typeEncoding_);
        }
    }

    const WrapperType Type() {
        return WrapperType::Primitive;
    }

    size_t Size() {
        return this->size_;
    }

    const TypeEncoding* TypeEncoding() {
        return this->typeEncoding_;
    }
private:
    size_t size_;
    const struct TypeEncoding* typeEncoding_;
    bool autoDeleteEncoding_;
};

class StructTypeWrapper: public BaseDataWrapper {
public:
    StructTypeWrapper(StructInfo structInfo)
        : structInfo_(structInfo) {
    }

    const WrapperType Type() {
        return WrapperType::StructType;
    }

    const StructInfo StructInfo() {
        return this->structInfo_;
    }
private:
    struct StructInfo structInfo_;
};

class StructWrapper: public StructTypeWrapper {
public:
    StructWrapper(struct StructInfo structInfo, void* data, std::shared_ptr<v8::Persistent<v8::Value>> parent)
        : StructTypeWrapper(structInfo),
          data_(data),
          childCount_(0),
          parent_(parent) {
    }

    const WrapperType Type() {
        return WrapperType::Struct;
    }

    void* Data() const {
        return this->data_;
    }

    std::shared_ptr<v8::Persistent<v8::Value>> Parent() {
        return this->parent_;
    }

    void IncrementChildren() {
        this->childCount_++;
    }

    void DecrementChildren() {
        this->childCount_--;
    }

    int ChildCount() {
        return this->childCount_;
    }
private:
    void* data_;
    int childCount_;
    std::shared_ptr<v8::Persistent<v8::Value>> parent_;
};

class ObjCAllocDataWrapper: public BaseDataWrapper {
public:
    ObjCAllocDataWrapper(Class klass)
        : klass_(klass) {
    }

    const WrapperType Type() {
        return WrapperType::ObjCAllocObject;
    }

    Class Klass() {
        return this->klass_;
    }
private:
    Class klass_;
};

class UnmanagedTypeWrapper: public BaseDataWrapper {
public:
    UnmanagedTypeWrapper(uint8_t* data, const TypeEncoding* typeEncoding)
        : data_(data), typeEncoding_(typeEncoding), valueTaken_(false) {
    }
    
    const WrapperType Type() {
        return WrapperType::UnmanagedType;
    }
    
    uint8_t* Data() {
        this->valueTaken_ = true;
        return this->data_;
    }
    
    const TypeEncoding* TypeEncoding() {
        return this->typeEncoding_;
    }
    
    bool ValueTaken() {
        return this->valueTaken_;
    }
private:
    uint8_t* data_;
    const tns::TypeEncoding* typeEncoding_;
    bool valueTaken_;
};

class ObjCDataWrapper: public BaseDataWrapper {
public:
    ObjCDataWrapper(id data, const TypeEncoding* typeEncoding = nullptr)
        : data_(data), typeEncoding_(typeEncoding) {
    }

    const WrapperType Type() {
        return WrapperType::ObjCObject;
    }

    id Data() {
        return this->data_;
    }

    const TypeEncoding* TypeEncoding() {
        return this->typeEncoding_;
    }
private:
    id data_;
    const tns::TypeEncoding* typeEncoding_;
};

class ObjCClassWrapper: public BaseDataWrapper {
public:
    ObjCClassWrapper(Class klazz, bool extendedClass = false)
        : klass_(klazz),
          extendedClass_(extendedClass) {
    }

    const WrapperType Type() {
        return WrapperType::ObjCClass;
    }

    Class Klass() {
        return this->klass_;
    }

    bool ExtendedClass() {
        return this->extendedClass_;
    }
private:
    Class klass_;
    bool extendedClass_;
};

class ObjCProtocolWrapper: public BaseDataWrapper {
public:
    ObjCProtocolWrapper(Protocol* proto, const ProtocolMeta* protoMeta)
        : proto_(proto),
          protoMeta_(protoMeta) {
    }

    const WrapperType Type() {
        return WrapperType::ObjCProtocol;
    }

    Protocol* Proto() {
        return this->proto_;
    }

    const ProtocolMeta* ProtoMeta() {
        return this->protoMeta_;
    }
private:
    Protocol* proto_;
    const ProtocolMeta* protoMeta_;
};

class FunctionWrapper: public BaseDataWrapper {
public:
    FunctionWrapper(const FunctionMeta* meta)
        : meta_(meta) {
    }

    const WrapperType Type() {
        return WrapperType::Function;
    }

    const FunctionMeta* Meta() {
        return this->meta_;
    }
private:
    const FunctionMeta* meta_;
};

class AnonymousFunctionWrapper: public BaseDataWrapper {
public:
    AnonymousFunctionWrapper(void* functionPointer, const TypeEncoding* parametersEncoding, size_t parametersCount)
        : data_(functionPointer),
          parametersEncoding_(parametersEncoding) {
    }

    const WrapperType Type() {
        return WrapperType::AnonymousFunction;
    }

    void* Data() {
        return this->data_;
    }

    const TypeEncoding* ParametersEncoding() {
        return this->parametersEncoding_;
    }
private:
    void* data_;
    const TypeEncoding* parametersEncoding_;
};

class BlockWrapper: public BaseDataWrapper {
public:
    BlockWrapper(void* block, const TypeEncoding* typeEncoding, bool ownsBlock)
        : block_(block),
          typeEncoding_(typeEncoding),
          ownsBlock_(ownsBlock) {
    }
    
    const WrapperType Type() {
        return WrapperType::Block;
    }

    void* Block() {
        return this->block_;
    }
    
    const TypeEncoding* Encodings() {
        return this->typeEncoding_;
    }
    
    bool OwnsBlock() {
        return this->ownsBlock_;
    }

private:
    void* block_;
    const TypeEncoding* typeEncoding_;
    bool ownsBlock_;
};

class FunctionReferenceTypeWrapper: public BaseDataWrapper {
public:
    const WrapperType Type() {
        return WrapperType::FunctionReferenceType;
    }
};

class FunctionReferenceWrapper: public BaseDataWrapper {
public:
    FunctionReferenceWrapper(std::shared_ptr<v8::Persistent<v8::Value>> function)
        : function_(function),
          data_(nullptr) {
    }

    const WrapperType Type() {
        return WrapperType::FunctionReference;
    }

    std::shared_ptr<v8::Persistent<v8::Value>> Function() {
        return this->function_;
    }

    void* Data() const {
        return this->data_;
    }

    void SetData(void* data) {
        this->data_ = data;
    }
private:
    std::shared_ptr<v8::Persistent<v8::Value>> function_;
    void* data_;
};

class ExtVectorWrapper: public BaseDataWrapper {
public:
    ExtVectorWrapper(void* data, ffi_type* ffiType, const TypeEncoding* innerTypeEncoding, const TypeEncoding* typeEncoding)
        : data_(data),
          ffiType_(ffiType),
          innerTypeEncoding_(innerTypeEncoding),
          typeEncoding_(typeEncoding) {
    }

    const WrapperType Type() {
        return WrapperType::ExtVector;
    }

    void* Data() {
        return this->data_;
    }

    ffi_type* FFIType() {
        return this->ffiType_;
    }

    const TypeEncoding* InnerTypeEncoding() {
        return this->innerTypeEncoding_;
    }
    const TypeEncoding* TypeEncoding() {
        return this->typeEncoding_;
    }
private:
    void* data_;
    ffi_type* ffiType_;
    const struct TypeEncoding* innerTypeEncoding_;
    const struct TypeEncoding* typeEncoding_;
};

class WorkerWrapper: public BaseDataWrapper {
public:
    WorkerWrapper(v8::Isolate* mainIsolate, std::function<void (v8::Isolate*, v8::Local<v8::Object> thiz, std::string)> onMessage);

    void Start(std::shared_ptr<v8::Persistent<v8::Value>> poWorker, std::function<v8::Isolate* ()> func);
    void CallOnErrorHandlers(v8::TryCatch& tc);
    void PassUncaughtExceptionFromWorkerToMain(v8::Local<v8::Context> context, v8::TryCatch& tc, bool async = true);
    void PostMessage(std::string message);
    void Close();
    void Terminate();

    const WrapperType Type();
    const int Id();
    const inline bool isDisposed() {
        return isDisposed_;
    }
    const bool IsRunning();
    const bool IsClosing();
    const int WorkerId();
    const inline v8::Isolate* GetMainIsolate() {
        return mainIsolate_;
    }
    const inline v8::Isolate* GetWorkerIsolate() {
        return workerIsolate_;
    }
    const inline void MakeWeak() {
        isWeak_ = true;
    }
    const inline bool IsWeak() {
        return isWeak_;
    }
private:
    v8::Isolate* mainIsolate_;
    v8::Isolate* workerIsolate_;
    bool isRunning_;
    bool isClosing_;
    std::atomic<bool> isTerminating_;
    bool isDisposed_;
    bool isWeak_;
    std::function<void (v8::Isolate*, v8::Local<v8::Object> thiz, std::string)> onMessage_;
    std::shared_ptr<v8::Persistent<v8::Value>> poWorker_;
    ConcurrentQueue queue_;
    static std::atomic<int> nextId_;
    int workerId_;

    void BackgroundLooper(std::function<v8::Isolate* ()> func);
    void DrainPendingTasks();
    v8::Local<v8::Object> ConstructErrorObject(v8::Local<v8::Context> context, std::string message, std::string source, std::string stackTrace, int lineNumber);
};

}

#endif /* DataWrapper_h */
