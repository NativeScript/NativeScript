#ifndef OneByteStringResource_h
#define OneByteStringResource_h

#include "Common.h"

namespace tns {

class OneByteStringResource : public v8::String::ExternalOneByteStringResource {
public:
    OneByteStringResource(const char* data, size_t length);
    ~OneByteStringResource() override;
    const char* data() const override;
    size_t length() const override;
private:
    const char* data_;
    size_t length_;
};

}

#endif /* OneByteStringResource_h */
