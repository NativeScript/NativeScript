#ifndef NativeScriptException_h
#define NativeScriptException_h

#include "Common.h"
#include <string>

namespace tns {

class NativeScriptException {
public:
    NativeScriptException(const std::string& message);
    NativeScriptException(v8::Isolate* isolate, v8::TryCatch& tc, const std::string& message);
    ~NativeScriptException();
    void ReThrowToV8(v8::Isolate* isolate);
    static void OnUncaughtError(v8::Local<v8::Message> message, v8::Local<v8::Value> error);
private:
    v8::Persistent<v8::Value>* javascriptException_;
    std::string message_;
    std::string stackTrace_;
    std::string fullMessage_;
    static std::string GetErrorStackTrace(v8::Isolate* isolate, const v8::Local<v8::StackTrace>& stackTrace);
    static std::string GetErrorMessage(v8::Isolate* isolate, v8::Local<v8::Value>& error, const std::string& prependMessage = "");
    static std::string GetFullMessage(v8::Isolate* isolate, const v8::TryCatch& tc, const std::string& jsExceptionMessage);
};

}

#endif /* NativeScriptException_h */
