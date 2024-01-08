#ifndef SimpleAllocator_h
#define SimpleAllocator_h

#include "Common.h"

namespace tns {

class SimpleAllocator: public v8::ArrayBuffer::Allocator {
public:
    SimpleAllocator();

    ~SimpleAllocator() override;

    void* Allocate(size_t length) override;

    void* AllocateUninitialized(size_t length) override;

    void Free(void* data, size_t length) override;
};

}

#endif /* SimpleAllocator_h */
