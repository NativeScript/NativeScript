#ifndef Metadata_h
#define Metadata_h

#include <stack>
#include <string>
#include <type_traits>
#include <thread>
#include <mutex>
#include "robin_hood.h"
#include <map>
#include <set>
#include <vector>
#include "KnownUnknownClassPair.h"
#include "SpinLock.h"

namespace tns {

static const int MetaTypeMask = 0b00000111;

template <typename V>
static const V& getProperFunctionFromContainer(const std::vector<V>& container, int argsCount, std::function<int(const V&)> paramsCounter) {
    const V* callee = nullptr;

    for (const V& func : container) {
        auto candidateArgs = paramsCounter(func);
        auto calleeArgs = 0;
        if (candidateArgs == argsCount) {
            callee = &func;
            break;
        } else if (!callee) {
            // no candidates so far, take it whatever it is
            callee = &func;
            calleeArgs = candidateArgs;
        } else if (argsCount < candidateArgs && (calleeArgs < argsCount || candidateArgs < calleeArgs)) {
            // better candidate - looking for the least number of arguments which is more than the amount actually passed
            callee = &func;
            calleeArgs = candidateArgs;
        } else if (calleeArgs < candidateArgs) {
            // better candidate - looking for the maximum number of arguments which less than the amount actually passed (if one with more cannot be found)
            callee = &func;
            calleeArgs = candidateArgs;
        }
    }

    return *callee;
}

inline uint8_t encodeVersion(uint8_t majorVersion, uint8_t minorVersion) {
    return (majorVersion << 3) | minorVersion;
}

inline uint8_t getMajorVersion(uint8_t encodedVersion) {
    return encodedVersion >> 3;
}

inline uint8_t getMinorVersion(uint8_t encodedVersion) {
    return encodedVersion & 0b111;
}

// Bit indices in flags section
enum MetaFlags {
    HasDemangledName = 8,
    HasName = 7,
    // IsIosAppExtensionAvailable = 6, the flag exists in metadata generator but we never use it in the runtime
    FunctionReturnsUnmanaged = 3,
    FunctionIsVariadic = 5,
    FunctionOwnsReturnedCocoaObject = 4,
    MemberIsOptional = 0, // Mustn't equal any Method or Property flag since it can be applicable to both
    MethodIsInitializer = 1,
    MethodIsVariadic = 2,
    MethodIsNullTerminatedVariadic = 3,
    MethodOwnsReturnedCocoaObject = 4,
    MethodHasErrorOutParameter = 5,
    PropertyHasGetter = 2,
    PropertyHasSetter = 3,

};

/// This enum describes the possible ObjectiveC entity types.
enum MetaType {
    Undefined = 0,
    Struct = 1,
    Union = 2,
    Function = 3,
    JsCode = 4,
    Var = 5,
    Interface = 6,
    ProtocolType = 7,
    Vector = 8
};

enum MemberType {
    InstanceMethod = 0,
    StaticMethod = 1,
    InstanceProperty = 2,
    StaticProperty = 3
};

enum BinaryTypeEncodingType : uint8_t {
    VoidEncoding,
    BoolEncoding,
    ShortEncoding,
    UShortEncoding,
    IntEncoding,
    UIntEncoding,
    LongEncoding,
    ULongEncoding,
    LongLongEncoding,
    ULongLongEncoding,
    CharEncoding,
    UCharEncoding,
    UnicharEncoding,
    CharSEncoding,
    CStringEncoding,
    FloatEncoding,
    DoubleEncoding,
    InterfaceDeclarationReference,
    StructDeclarationReference,
    UnionDeclarationReference,
    PointerEncoding,
    VaListEncoding,
    SelectorEncoding,
    ClassEncoding,
    ProtocolEncoding,
    InstanceTypeEncoding,
    IdEncoding,
    ConstantArrayEncoding,
    IncompleteArrayEncoding,
    FunctionPointerEncoding,
    BlockEncoding,
    AnonymousStructEncoding,
    AnonymousUnionEncoding,
    ExtVectorEncoding
};

#pragma pack(push, 1)

template <typename T>
struct PtrTo;
struct Meta;
struct InterfaceMeta;
struct ProtocolMeta;
struct ModuleMeta;
struct LibraryMeta;
struct TypeEncoding;

typedef std::vector<const ProtocolMeta*> ProtocolMetas;

typedef int32_t ArrayCount;

static const void* offset(const void* from, ptrdiff_t offset) {
    return reinterpret_cast<const char*>(from) + offset;
}

template <typename T>
struct Array {
    class iterator {
    private:
        const T* current;

    public:
        iterator(const T* item)
            : current(item) {
        }
        bool operator==(const iterator& other) const {
            return current == other.current;
        }
        bool operator!=(const iterator& other) const {
            return !(*this == other);
        }
        iterator& operator++() {
            current++;
            return *this;
        }
        iterator operator++(int) {
            iterator tmp(current);
            operator++();
            return tmp;
        }
        const T& operator*() const {
            return *current;
        }
    };

    ArrayCount count;

    const T* first() const {
        return reinterpret_cast<const T*>(&count + 1);
    }

    const T& operator[](int index) const {
        return *(first() + index);
    }

    Array<T>::iterator begin() const {
        return first();
    }

    Array<T>::iterator end() const {
        return first() + count;
    }

    template <typename V>
    const Array<V>& castTo() const {
        return *reinterpret_cast<const Array<V>*>(this);
    }

    int sizeInBytes() const {
        return sizeof(Array<T>) + sizeof(T) * count;
    }

    int binarySearch(std::function<int(const T&)> comparer) const {
        int left = 0, right = count - 1, mid;
        while (left <= right) {
            mid = (right + left) / 2;
            const T& current = (*this)[mid];
            int comparisonResult = comparer(current);
            if (comparisonResult < 0) {
                left = mid + 1;
            } else if (comparisonResult > 0) {
                right = mid - 1;
            } else {
                return mid;
            }
        }
        return -(left + 1);
    }

    int binarySearchLeftmost(std::function<int(const T&)> comparer) const {
        int mid = binarySearch(comparer);
        while (mid > 0 && comparer((*this)[mid - 1]) == 0) {
            mid -= 1;
        }
        return mid;
    }
};

template <typename T>
using ArrayOfPtrTo = Array<PtrTo<T>>;
using String = PtrTo<char>;

enum GlobalTableType {
    ByJsName,
    ByNativeName,
};

template <GlobalTableType TYPE>
struct GlobalTable {
    class iterator {
    private:
        const GlobalTable<TYPE>* _globalTable;
        int _topLevelIndex;
        int _bucketIndex;

        void findNext();

        const Meta* getCurrent();

    public:
        iterator(const GlobalTable<TYPE>* globalTable)
            : iterator(globalTable, 0, 0) {
            findNext();
        }

        iterator(const GlobalTable<TYPE>* globalTable, int32_t topLevelIndex, int32_t bucketIndex)
            : _globalTable(globalTable)
            , _topLevelIndex(topLevelIndex)
            , _bucketIndex(bucketIndex) {
            findNext();
        }

        bool operator==(const iterator& other) const;

        bool operator!=(const iterator& other) const;

        iterator& operator++();

        iterator operator++(int) {
            iterator tmp(_globalTable, _topLevelIndex, _bucketIndex);
            operator++();
            return tmp;
        }

        const Meta* operator*();
    };

    iterator begin() const {
        return iterator(this);
    }

    iterator end() const {
        return iterator(this, this->buckets.count, 0);
    }

    ArrayOfPtrTo<ArrayOfPtrTo<Meta>> buckets;

    const InterfaceMeta* findInterfaceMeta(const char* identifierString) const;

    const InterfaceMeta* findInterfaceMeta(const char* identifierString, size_t length, unsigned hash) const;

    const ProtocolMeta* findProtocol(const char* identifierString) const;

    const ProtocolMeta* findProtocol(const char* identifierString, size_t length, unsigned hash) const;

    const Meta* findMeta(const char* identifierString, bool onlyIfAvailable = true) const;

    const Meta* findMeta(const char* identifierString, size_t length, unsigned hash, bool onlyIfAvailable = true) const;

    int sizeInBytes() const {
        return buckets.sizeInBytes();
    }

    static bool compareName(const Meta& meta, const char* identifierString, size_t length);
};

struct ModuleTable {
    ArrayOfPtrTo<ModuleMeta> modules;

    int sizeInBytes() const {
        return modules.sizeInBytes();
    }
};

struct MetaFile {
private:
    GlobalTable<GlobalTableType::ByJsName> _globalTableJs;

public:
    static MetaFile* instance();

    static MetaFile* setInstance(void* metadataPtr);

    const GlobalTable<GlobalTableType::ByJsName>* globalTableJs() const {
        return &this->_globalTableJs;
    }

    const GlobalTable<GlobalTableType::ByNativeName>* globalTableNativeProtocols() const {
        const GlobalTable<GlobalTableType::ByJsName>* gt = this->globalTableJs();
        return reinterpret_cast<const GlobalTable<GlobalTableType::ByNativeName>*>(offset(gt, gt->sizeInBytes()));
    }

    const GlobalTable<GlobalTableType::ByNativeName>* globalTableNativeInterfaces() const {
        const GlobalTable<GlobalTableType::ByNativeName>* gt = this->globalTableNativeProtocols();
        return reinterpret_cast<const GlobalTable<GlobalTableType::ByNativeName>*>(offset(gt, gt->sizeInBytes()));
    }

    const ModuleTable* topLevelModulesTable() const {
        const GlobalTable<GlobalTableType::ByNativeName>* gt = this->globalTableNativeInterfaces();
        return reinterpret_cast<const ModuleTable*>(offset(gt, gt->sizeInBytes()));
    }

    const void* heap() const {
        const ModuleTable* mt = this->topLevelModulesTable();
        return offset(mt, mt->sizeInBytes());
    }
};

template <typename T>
struct PtrTo {
    int32_t offset;

    inline bool isNull() const {
        return offset == 0;
    }
    inline PtrTo<T> operator+(int value) const {
        return add(value);
    }
    inline const T* operator->() const {
        return valuePtr();
    }
    inline PtrTo<T> add(int value) const {
        return PtrTo<T>{ .offset = this->offset + value * sizeof(T) };
    }
    inline PtrTo<T> addBytes(int bytes) const {
        return PtrTo<T>{ .offset = this->offset + bytes };
    }
    template <typename V>
    inline PtrTo<V>& castTo() const {
        return reinterpret_cast<PtrTo<V>>(this);
    }
    inline const T* valuePtr() const {
        return isNull() ? nullptr : reinterpret_cast<const T*>(tns::offset(MetaFile::instance()->heap(), this->offset));
    }
    inline const T& value() const {
        return *valuePtr();
    }
};

template <typename T>
struct TypeEncodingsList {
    T count;

    const TypeEncoding* first() const {
        return reinterpret_cast<const TypeEncoding*>(this + 1);
    }
};

union TypeEncodingDetails {
    struct IdDetails {
        PtrTo<Array<String>> _protocols;
    } idDetails;
    struct IncompleteArrayDetails {
        const TypeEncoding* getInnerType() const {
            return reinterpret_cast<const TypeEncoding*>(this);
        }
    } incompleteArray;
    struct ConstantArrayDetails {
        int32_t size;
        const TypeEncoding* getInnerType() const {
            return reinterpret_cast<const TypeEncoding*>(this + 1);
        }
    } constantArray;
    struct ExtVectorDetails {
        int32_t size;
        const TypeEncoding* getInnerType() const {
            return reinterpret_cast<const TypeEncoding*>(this + 1);
        }
    } extVector;
    struct DeclarationReferenceDetails {
        String name;
    } declarationReference;
    struct InterfaceDeclarationReferenceDetails {
        String name;
        PtrTo<Array<String>> _protocols;
    } interfaceDeclarationReference;
    struct PointerDetails {
        const TypeEncoding* getInnerType() const {
            return reinterpret_cast<const TypeEncoding*>(this);
        }
    } pointer;
    struct BlockDetails {
        TypeEncodingsList<uint8_t> signature;
    } block;
    struct FunctionPointerDetails {
        TypeEncodingsList<uint8_t> signature;
    } functionPointer;
    struct AnonymousRecordDetails {
        uint8_t fieldsCount;
        const String* getFieldNames() const {
            return reinterpret_cast<const String*>(this + 1);
        }
        const TypeEncoding* getFieldsEncodings() const {
            return reinterpret_cast<const TypeEncoding*>(getFieldNames() + this->fieldsCount);
        }
    } anonymousRecord;
};

struct TypeEncoding {
    BinaryTypeEncodingType type;
    TypeEncodingDetails details;

    const TypeEncoding* next() const {
        const TypeEncoding* afterTypePtr = reinterpret_cast<const TypeEncoding*>(offset(this, sizeof(type)));

        switch (this->type) {
        case BinaryTypeEncodingType::IdEncoding: {
            return reinterpret_cast<const TypeEncoding*>(offset(afterTypePtr, sizeof(TypeEncodingDetails::IdDetails)));
        }
        case BinaryTypeEncodingType::ConstantArrayEncoding: {
            return this->details.constantArray.getInnerType()->next();
        }
        case BinaryTypeEncodingType::ExtVectorEncoding: {
            return this->details.extVector.getInnerType()->next();
        }
        case BinaryTypeEncodingType::IncompleteArrayEncoding: {
            return this->details.incompleteArray.getInnerType()->next();
        }
        case BinaryTypeEncodingType::PointerEncoding: {
            return this->details.pointer.getInnerType()->next();
        }
        case BinaryTypeEncodingType::BlockEncoding: {
            const TypeEncoding* current = this->details.block.signature.first();
            for (int i = 0; i < this->details.block.signature.count; i++) {
                current = current->next();
            }
            return current;
        }
        case BinaryTypeEncodingType::FunctionPointerEncoding: {
            const TypeEncoding* current = this->details.functionPointer.signature.first();
            for (int i = 0; i < this->details.functionPointer.signature.count; i++) {
                current = current->next();
            }
            return current;
        }
        case BinaryTypeEncodingType::InterfaceDeclarationReference: {
            return reinterpret_cast<const TypeEncoding*>(offset(afterTypePtr, sizeof(TypeEncodingDetails::InterfaceDeclarationReferenceDetails)));
        }
        case BinaryTypeEncodingType::StructDeclarationReference:
        case BinaryTypeEncodingType::UnionDeclarationReference: {
            return reinterpret_cast<const TypeEncoding*>(offset(afterTypePtr, sizeof(TypeEncodingDetails::DeclarationReferenceDetails)));
        }
        case BinaryTypeEncodingType::AnonymousStructEncoding:
        case BinaryTypeEncodingType::AnonymousUnionEncoding: {
            const TypeEncoding* current = this->details.anonymousRecord.getFieldsEncodings();
            for (int i = 0; i < this->details.anonymousRecord.fieldsCount; i++) {
                current = current->next();
            }
            return current;
        }
        default: {
            return afterTypePtr;
        }
        }
    }
};

struct ModuleMeta {
public:
    uint8_t flags;
    String name;
    PtrTo<ArrayOfPtrTo<LibraryMeta>> libraries;

    const char* getName() const {
        return name.valuePtr();
    }

    bool isFramework() const {
        return (flags & 1) > 0;
    }

    bool isSystem() const {
        return (flags & 2) > 0;
    }
};

struct LibraryMeta {
public:
    uint8_t flags;
    String name;

    const char* getName() const {
        return name.valuePtr();
    }

    bool isFramework() const {
        return (flags & 1) > 0;
    }
};

enum NameIndex {
    JsName,
    Name,
    DemangledName,
    NameIndexCount,
};

struct JsNameAndNativeNames {
    String strings[NameIndexCount];
};

union MetaNames {
    String name;
    PtrTo<JsNameAndNativeNames> names;
};

struct Meta {

private:
    MetaNames _names;
    PtrTo<ModuleMeta> _topLevelModule;
    uint16_t _flags;
    uint8_t _introduced;

public:
    inline MetaType type() const {
        return (MetaType)(this->_flags & MetaTypeMask);
    }

    const char* typeName() const {
        switch (type()) {
            case Undefined:
                return "Undefined";
            case Struct:
                return "Struct";
            case Union:
                return "Union";
            case Function:
                return "Function";
            case JsCode:
                return "JsCode";
            case Var:
                return "Var";
            case Interface:
                return "Interface";
            case ProtocolType:
                return "ProtocolType";
            case Vector:
                return "Vector";
            default:
                return "Unknown";
        }
    }
    
    inline const ModuleMeta* topLevelModule() const {
        return this->_topLevelModule.valuePtr();
    }

    inline bool hasName() const {
        return this->flag(MetaFlags::HasName);
    }

    inline bool hasDemangledName() const {
        return this->flag(MetaFlags::HasDemangledName);
    }

    inline bool flag(int index) const {
        return (this->_flags & (1 << index)) > 0;
    }

    inline const char* jsName() const {
        return this->getNameByIndex(JsName);
    }

    inline const char* name() const {
        return this->getNameByIndex(Name);
    }

    inline const char* demangledName() const {
        return this->getNameByIndex(DemangledName);
    }

    /**
     * \brief The version number in which this entity was introduced.
     */
    inline uint8_t introducedIn() const {
        return this->_introduced;
    }

    /**
    * \brief Checks if the specified object is callable
    * from the current device.
    *
    * To be callable, an object must either:
    * > not have platform availability specified;
    * > have been introduced in this or prior version;
    */
    bool isAvailable() const;

private:
    inline const char* getNameByIndex(enum NameIndex index) const {
        int i = index;
        if (!this->hasName() && !this->hasDemangledName()) {
            return this->_names.name.valuePtr();
        }

        if (!this->hasDemangledName() && i >= DemangledName) {
            i--;
        }

        if (!this->hasName() && i >= Name) {
            i--;
        }

        return this->_names.names.value().strings[i].valuePtr();
    }
};

struct RecordMeta : Meta {

private:
    PtrTo<Array<String>> _fieldsNames;
    PtrTo<TypeEncodingsList<ArrayCount>> _fieldsEncodings;

public:
    inline const Array<String>& fieldNames() const {
        return _fieldsNames.value();
    }

    inline size_t fieldsCount() const {
        return fieldNames().count;
    }

    inline const TypeEncodingsList<ArrayCount>* fieldsEncodings() const {
        return _fieldsEncodings.valuePtr();
    }
};

struct StructMeta : RecordMeta {
};

struct UnionMeta : RecordMeta {
};

struct FunctionMeta : Meta {

private:
    PtrTo<TypeEncodingsList<ArrayCount>> _encoding;

public:
    bool isVariadic() const {
        return this->flag(MetaFlags::FunctionIsVariadic);
    }

    const TypeEncodingsList<ArrayCount>* encodings() const {
        return _encoding.valuePtr();
    }

    bool ownsReturnedCocoaObject() const {
        return this->flag(MetaFlags::FunctionOwnsReturnedCocoaObject);
    }

    bool returnsUnmanaged() const {
        return this->flag(MetaFlags::FunctionReturnsUnmanaged);
    }
};

struct JsCodeMeta : Meta {

private:
    String _jsCode;

public:
    inline const char* jsCode() const {
        return _jsCode.valuePtr();
    }
};

struct VarMeta : Meta {

private:
    PtrTo<TypeEncoding> _encoding;

public:
    inline const TypeEncoding* encoding() const {
        return _encoding.valuePtr();
    }
};

struct MemberMeta : Meta {
    inline bool isOptional() const {
        return this->flag(MetaFlags::MemberIsOptional);
    }
};

struct MethodMeta : MemberMeta {

private:
    PtrTo<TypeEncodingsList<ArrayCount>> _encodings;
    String _constructorTokens;

public:
    inline bool isVariadic() const {
        return this->flag(MetaFlags::MethodIsVariadic);
    }

    inline bool isVariadicNullTerminated() const {
        return this->flag(MetaFlags::MethodIsNullTerminatedVariadic);
    }

    inline bool hasErrorOutParameter() const {
        return this->flag(MetaFlags::MethodHasErrorOutParameter);
    }

    inline bool isInitializer() const {
        return this->flag(MetaFlags::MethodIsInitializer);
    }

    inline bool ownsReturnedCocoaObject() const {
        return this->flag(MetaFlags::MethodOwnsReturnedCocoaObject);
    }

    inline SEL selector() const {
        static robin_hood::unordered_map<const MethodMeta*, SEL> methodMetaSelectorCache;
        // this method takes a few ns to run and is almost never called by another thread
        // this means that locking a mutex is almost always unecessary so we use a spinlock
        // that will most likely never spin
        static SpinMutex p;
        SpinLock lock(p);
        SEL ret = nullptr;
        auto it = methodMetaSelectorCache.find(this);
        if(it != methodMetaSelectorCache.end()) {
            return it->second;
        }
        auto selectorAsStr = this->selectorAsString();
        ret = sel_registerName(selectorAsStr);
        // save to cache
        methodMetaSelectorCache.emplace(this, ret);
        
        return ret;
    }

    // just a more convenient way to get the selector of method
    inline const char* selectorAsString() const {
        return this->name();
    }

    inline const TypeEncodingsList<ArrayCount>* encodings() const {
        return this->_encodings.valuePtr();
    }

    inline const char* constructorTokens() const {
        return this->_constructorTokens.valuePtr();
    }

    bool isImplementedInClass(Class klass, bool isStatic) const;
    inline bool isAvailableInClass(Class klass, bool isStatic) const {
        return this->isAvailable() && this->isImplementedInClass(klass, isStatic);
    }
    inline bool isAvailableInClasses(KnownUnknownClassPair klasses, bool isStatic) const {
        return this->isAvailableInClass(klasses.known, isStatic) || (klasses.unknown != nullptr && this->isAvailableInClass(klasses.unknown, isStatic));
    }
};

typedef std::set<const MemberMeta*> MembersCollection;

robin_hood::unordered_map<std::string, MembersCollection> getMetasByJSNames(MembersCollection methods);

struct PropertyMeta : MemberMeta {
    PtrTo<MethodMeta> method1;
    PtrTo<MethodMeta> method2;

public:
    inline bool hasGetter() const {
        return this->flag(MetaFlags::PropertyHasGetter);
    }

    inline bool hasSetter() const {
        return this->flag(MetaFlags::PropertyHasSetter);
    }

    inline const MethodMeta* getter() const {
        return this->hasGetter() ? method1.valuePtr() : nullptr;
    }

    inline const MethodMeta* setter() const {
        return (this->hasSetter()) ? (this->hasGetter() ? method2.valuePtr() : method1.valuePtr()) : nullptr;
    }

    inline bool isImplementedInClass(Class klass, bool isStatic) const {
        bool getterAvailable = this->hasGetter() && this->getter()->isImplementedInClass(klass, isStatic);
        bool setterAvailable = this->hasSetter() && this->setter()->isImplementedInClass(klass, isStatic);
        return getterAvailable || setterAvailable;
    }

    inline bool isAvailableInClass(Class klass, bool isStatic) const {
        return this->isAvailable() && this->isImplementedInClass(klass, isStatic);
    }

    inline bool isAvailableInClasses(KnownUnknownClassPair klasses, bool isStatic) const {
        return this->isAvailableInClass(klasses.known, isStatic) || (klasses.unknown != nullptr && this->isAvailableInClass(klasses.unknown, isStatic));
    }
};

struct BaseClassMeta : Meta {

    PtrTo<ArrayOfPtrTo<MethodMeta>> instanceMethods;
    PtrTo<ArrayOfPtrTo<MethodMeta>> staticMethods;
    PtrTo<ArrayOfPtrTo<PropertyMeta>> instanceProps;
    PtrTo<ArrayOfPtrTo<PropertyMeta>> staticProps;
    PtrTo<Array<String>> protocols;
    int16_t initializersStartIndex;

    template <typename T>
    void forEachProtocol(const T& fun, const ProtocolMetas* additionalProtocols) const {
        for (Array<String>::iterator it = this->protocols->begin(); it != this->protocols->end(); ++it) {
            if (const ProtocolMeta* protocolMeta = MetaFile::instance()->globalTableJs()->findProtocol((*it).valuePtr())) {
                fun(protocolMeta);
            }
        }

        if (additionalProtocols) {
            for (const ProtocolMeta* protocolMeta : *additionalProtocols) {
                fun(protocolMeta);
            }
        }
    }

    std::set<const ProtocolMeta*> protocolsSet() const;

    std::set<const ProtocolMeta*> deepProtocolsSet() const;

    void deepProtocolsSet(std::set<const ProtocolMeta*>& protocols) const;

    const MemberMeta* member(const char* identifier, size_t length, MemberType type, bool includeProtocols, bool onlyIfAvailable, const ProtocolMetas& additionalProtocols) const;

    const MethodMeta* member(const char* identifier, size_t length, MemberType type, size_t paramsCount, bool includeProtocols, bool onlyIfAvailable, const ProtocolMetas& additionalProtocols) const;

    const MembersCollection members(const char* identifier, size_t length, MemberType type, bool includeProtocols, bool onlyIfAvailable, const ProtocolMetas& additionalProtocols) const;

    const MemberMeta* member(const char* identifier, MemberType type, bool includeProtocols, const ProtocolMetas& additionalProtocols) const {
        return this->member(identifier, strlen(identifier), type, includeProtocols, /*onlyIfAvailable*/ true, additionalProtocols);
    }

    /// instance methods

    // Remove all optional methods/properties which are not implemented in the class
    template <typename TMemberMeta>
    static void filterUnavailableMembers(MembersCollection& members, KnownUnknownClassPair klasses, bool isStatic) {
        for (auto it{members.begin()}, end{members.end()}; it != end;) {
            const MemberMeta* memberMeta = *it;
            bool isAvailable = static_cast<const TMemberMeta*>(memberMeta)->isAvailableInClasses(klasses, isStatic);
            if (!isAvailable) {
                it = members.erase(it);
            }
            else {
                ++it;
            }
        }
    }

    /// instance properties
    const PropertyMeta* instanceProperty(const char* identifier, KnownUnknownClassPair klasses, bool includeProtocols, const ProtocolMetas& additionalProtocols) const {
        auto propMeta = static_cast<const PropertyMeta*>(this->member(identifier, MemberType::InstanceProperty, includeProtocols, additionalProtocols));
        return propMeta && propMeta->isAvailableInClasses(klasses, /*isStatic*/ false) ? propMeta : nullptr;
    }

    /// static properties
    const PropertyMeta* staticProperty(const char* identifier, KnownUnknownClassPair klasses, bool includeProtocols, const ProtocolMetas& additionalProtocols) const {
        auto propMeta = static_cast<const PropertyMeta*>(this->member(identifier, MemberType::StaticProperty, includeProtocols, additionalProtocols));
        return propMeta && propMeta->isAvailableInClasses(klasses, /*isStatic*/ true) ? propMeta : nullptr;
    }

    /// vectors
    std::vector<const PropertyMeta*> instanceProperties(KnownUnknownClassPair klasses) const {
        std::vector<const PropertyMeta*> properties;
        return this->instanceProperties(properties, klasses);
    }

    std::vector<const PropertyMeta*> instancePropertiesWithProtocols(KnownUnknownClassPair klasses, const ProtocolMetas& additionalProtocols) const {
        std::vector<const PropertyMeta*> properties;
        return this->instancePropertiesWithProtocols(properties, klasses, additionalProtocols);
    }

    std::vector<const PropertyMeta*> instanceProperties(std::vector<const PropertyMeta*>& container, KnownUnknownClassPair klasses) const {
        for (Array<PtrTo<PropertyMeta>>::iterator it = this->instanceProps->begin(); it != this->instanceProps->end(); it++) {
            if ((*it)->isAvailableInClasses(klasses, /*isStatic*/ false)) {
                container.push_back((*it).valuePtr());
            }
        }
        return container;
    }

    std::vector<const PropertyMeta*> instancePropertiesWithProtocols(std::vector<const PropertyMeta*>& container, KnownUnknownClassPair klasses, const ProtocolMetas& additionalProtocols) const;

    std::vector<const PropertyMeta*> staticProperties(KnownUnknownClassPair klasses) const {
        std::vector<const PropertyMeta*> properties;
        return this->staticProperties(properties, klasses);
    }

    std::vector<const PropertyMeta*> staticPropertiesWithProtocols(KnownUnknownClassPair klasses, const ProtocolMetas& additionalProtocols) const {
        std::vector<const PropertyMeta*> properties;
        return this->staticPropertiesWithProtocols(properties, klasses, additionalProtocols);
    }

    std::vector<const PropertyMeta*> staticProperties(std::vector<const PropertyMeta*>& container, KnownUnknownClassPair klasses) const {
        for (Array<PtrTo<PropertyMeta>>::iterator it = this->staticProps->begin(); it != this->staticProps->end(); it++) {
            if ((*it)->isAvailableInClasses(klasses, /*isStatic*/ true)) {
                container.push_back((*it).valuePtr());
            }
        }
        return container;
    }

    std::vector<const PropertyMeta*> staticPropertiesWithProtocols(std::vector<const PropertyMeta*>& container, KnownUnknownClassPair klasses, const ProtocolMetas& additionalProtocols) const;

    std::vector<const MethodMeta*> initializers(KnownUnknownClassPair klasses) const {
        std::vector<const MethodMeta*> initializers;
        return this->initializers(initializers, klasses);
    }

    std::vector<const MethodMeta*> initializersWithProtocols(KnownUnknownClassPair klasses, const ProtocolMetas& additionalProtocols) const {
        std::vector<const MethodMeta*> initializers;
        return this->initializersWithProtocols(initializers, klasses, additionalProtocols);
    }

    std::vector<const MethodMeta*> initializers(std::vector<const MethodMeta*>& container, KnownUnknownClassPair klasses) const;

    std::vector<const MethodMeta*> initializersWithProtocols(std::vector<const MethodMeta*>& container, KnownUnknownClassPair klasses, const ProtocolMetas& additionalProtocols) const;
};

struct ProtocolMeta : BaseClassMeta {
};

struct InterfaceMeta : BaseClassMeta {

private:
    String _baseName;

public:
    const char* baseName() const {
        return _baseName.valuePtr();
    }

    const InterfaceMeta* baseMeta() const {
        if (this->baseName() != nullptr) {
            const InterfaceMeta* baseMeta = MetaFile::instance()->globalTableJs()->findInterfaceMeta(this->baseName());
            return baseMeta;
        }

        return nullptr;
    }
};

#pragma pack(pop)

} // namespace tns

#include "MetadataInlines.h"

#endif /* Metadata_h */
