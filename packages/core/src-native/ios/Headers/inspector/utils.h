#ifndef utils_h
#define utils_h

#include "include/v8-inspector.h"

namespace v8_inspector {

std::string GetMIMEType(std::string filePath);
std::string ToStdString(const v8_inspector::StringView& value);
v8::Local<v8::Function> GetDebuggerFunction(v8::Local<v8::Context> context, std::string domain, std::string functionName, v8::Local<v8::Object>& domainDebugger);
v8::Local<v8::Function> GetDebuggerFunctionFromObject(v8::Local<v8::Context> context, const v8::Local<v8::Object>& object, v8::Local<v8::Object>& domainDebugger);

class NetworkRequestData {
public:
    NetworkRequestData(std::u16string data, bool hasTextContent): data_(data), hasTextContent_(hasTextContent) {
    }

    const char16_t* GetData() {
        return this->data_.data();
    }

    const bool HasTextContent() {
        return this->hasTextContent_;
    }
private:
    std::u16string data_;
    bool hasTextContent_;
};

}

#endif /* utils_h */
