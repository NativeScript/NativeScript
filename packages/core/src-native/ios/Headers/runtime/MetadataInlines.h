#ifndef MetadataInlines_h
#define MetadataInlines_h

#include <objc/runtime.h>
#include "StringHasher.h"

namespace tns {

void LogMetadataUnavailable(const char* identifierString, uint8_t majorVersion, uint8_t minorVersion, const char* baseName);

inline size_t compareIdentifiers(const char* nullTerminated, const char* notNullTerminated, size_t length) {
    int result = strncmp(nullTerminated, notNullTerminated, length);
    return (result == 0) ? strlen(nullTerminated) - length : result;
}

// GlobalTable

template <GlobalTableType TYPE>
const InterfaceMeta* GlobalTable<TYPE>::findInterfaceMeta(const char* identifierString) const {
    unsigned hash = WTF::StringHasher::computeHashAndMaskTop8Bits<LChar>(reinterpret_cast<const LChar*>(identifierString));
    return this->findInterfaceMeta(identifierString, strlen(identifierString), hash);
}

template <GlobalTableType TYPE>
const InterfaceMeta* GlobalTable<TYPE>::findInterfaceMeta(const char* identifierString, size_t length, unsigned hash) const {
    const Meta* meta = this->findMeta(identifierString, length, hash, /*onlyIfAvailable*/ false);
    if (meta == nullptr) {
        return nullptr;
    }

    // Meta should be an interface, but it could also be a protocol in case of a
    // private interface having the same name as a public protocol
    ASSERT(meta->type() == MetaType::Interface || (meta->type() == MetaType::ProtocolType && objc_getClass(meta->name()) != nullptr && objc_getProtocol(meta->name()) != nullptr));

    if (meta->type() != MetaType::Interface) {
        return nullptr;
    }

    const InterfaceMeta* interfaceMeta = static_cast<const InterfaceMeta*>(meta);
    if (interfaceMeta->isAvailable()) {
        return interfaceMeta;
    } else {
        const char* baseName = interfaceMeta->baseName();

        tns::LogMetadataUnavailable(
            std::string(identifierString, length).c_str(),
            getMajorVersion(interfaceMeta->introducedIn()),
            getMinorVersion(interfaceMeta->introducedIn()),
            baseName
        );

        return this->findInterfaceMeta(baseName);
    }
}

template <GlobalTableType TYPE>
const ProtocolMeta* GlobalTable<TYPE>::findProtocol(const char* identifierString) const {
    unsigned hash = WTF::StringHasher::computeHashAndMaskTop8Bits<LChar>(reinterpret_cast<const LChar*>(identifierString));
    return this->findProtocol(identifierString, strlen(identifierString), hash);
}

template <GlobalTableType TYPE>
const ProtocolMeta* GlobalTable<TYPE>::findProtocol(const char* identifierString, size_t length, unsigned hash) const {
    // Do not check for availability when returning a protocol. Apple regularly create new protocols and move
    // existing interface members there (e.g. iOS 12.0 introduced the UIFocusItemScrollableContainer protocol
    // in UIKit which contained members that have existed in UIScrollView since iOS 2.0)

    auto meta = this->findMeta(identifierString, length, hash, /*onlyIfAvailable*/ false);
    ASSERT(!meta || meta->type() == ProtocolType);
    return static_cast<const ProtocolMeta*>(meta);
}

template <GlobalTableType TYPE>
const Meta* GlobalTable<TYPE>::findMeta(const char* identifierString, bool onlyIfAvailable) const {
    unsigned hash = WTF::StringHasher::computeHashAndMaskTop8Bits<LChar>(reinterpret_cast<const LChar*>(identifierString));
    return this->findMeta(identifierString, strlen(identifierString), hash, onlyIfAvailable);
}

template <GlobalTableType TYPE>
const Meta* GlobalTable<TYPE>::findMeta(const char* identifierString, size_t length, unsigned hash, bool onlyIfAvailable) const {
    int bucketIndex = hash % buckets.count;
    if (this->buckets[bucketIndex].isNull()) {
        return nullptr;
    }
    const ArrayOfPtrTo<Meta>& bucketContent = buckets[bucketIndex].value();
    for (ArrayOfPtrTo<Meta>::iterator it = bucketContent.begin(); it != bucketContent.end(); it++) {
        const Meta* meta = (*it).valuePtr();
        if (this->compareName(*meta, identifierString, length)) {
            return onlyIfAvailable ? (meta->isAvailable() ? meta : nullptr) : meta;
        }
    }
    return nullptr;
}

template <>
inline bool GlobalTable<ByJsName>::compareName(const Meta& meta, const char* identifierString, size_t length) {
    return compareIdentifiers(meta.jsName(), identifierString, length) == 0;
}

template <>
inline bool GlobalTable<ByNativeName>::compareName(const Meta& meta, const char* identifierString, size_t length) {
    return compareIdentifiers(meta.name(), identifierString, length) == 0 || (meta.hasDemangledName() && compareIdentifiers(meta.demangledName(), identifierString, length) == 0);
}

// GlobalTable::iterator

template <GlobalTableType TYPE>
const Meta* GlobalTable<TYPE>::iterator::getCurrent() {
    return this->_globalTable->buckets[_topLevelIndex].value()[_bucketIndex].valuePtr();
}

template <GlobalTableType TYPE>
typename GlobalTable<TYPE>::iterator& GlobalTable<TYPE>::iterator::operator++() {
    this->_bucketIndex++;
    this->findNext();
    return *this;
}

template <GlobalTableType TYPE>
const Meta* GlobalTable<TYPE>::iterator::operator*() {
    return this->getCurrent();
}

template <GlobalTableType TYPE>
bool GlobalTable<TYPE>::iterator::operator==(const iterator& other) const {
    return _globalTable == other._globalTable && _topLevelIndex == other._topLevelIndex && _bucketIndex == other._bucketIndex;
}

template <GlobalTableType TYPE>
bool GlobalTable<TYPE>::iterator::operator!=(const iterator& other) const {
    return !(*this == other);
}

template <GlobalTableType TYPE>
void GlobalTable<TYPE>::iterator::findNext() {
    if (this->_topLevelIndex == this->_globalTable->buckets.count) {
        return;
    }

    do {
        if (!this->_globalTable->buckets[_topLevelIndex].isNull()) {
            int bucketLength = this->_globalTable->buckets[_topLevelIndex].value().count;
            while (this->_bucketIndex < bucketLength) {
                if (this->getCurrent() != nullptr) {
                    return;
                }
                this->_bucketIndex++;
            }
        }
        this->_bucketIndex = 0;
        this->_topLevelIndex++;
    } while (this->_topLevelIndex < this->_globalTable->buckets.count);
}

} // namespace tns

#endif /* MetadataInlines_h */
