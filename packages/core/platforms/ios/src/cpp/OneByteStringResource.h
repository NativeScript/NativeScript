//
// Created by Osei Fortune on 07/01/2024.
//

#pragma once

#include "Common.h"

class OneByteStringResource : public v8::String::ExternalOneByteStringResource {
public:
    OneByteStringResource(char *string);

    OneByteStringResource(U8Buffer *buffer);

    OneByteStringResource(CCow *cow);

    ~OneByteStringResource();

    const char *data() const override;

    size_t length() const override;

private:
    const char *string_;
    size_t length_;
    U8Buffer *buffer_ = nullptr;
    CCow *cow_ = nullptr;
    // todo enum
    bool usingBuffer_ = false;
    bool usingCow_ = false;
};