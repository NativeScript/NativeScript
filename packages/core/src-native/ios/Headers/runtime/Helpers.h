#ifndef Helpers_h
#define Helpers_h

#include <functional>
#include <string>
#include "Common.h"
#include "DataWrapper.h"
#include "ArcMacro.h"

#ifdef __OBJC__
#include <Foundation/Foundation.h>
#else
#include <CoreFoundation/CoreFoundation.h>
extern "C" void NSLog(CFStringRef format, ...);
#endif

namespace tns {

inline v8::Local<v8::String> ToV8String(v8::Isolate* isolate,const std::string& value) {
    return v8::String::NewFromUtf8(isolate, value.c_str(), v8::NewStringType::kNormal, (int)value.length()).ToLocalChecked();
}
#ifdef __OBJC__
inline v8::Local<v8::String> ToV8String(v8::Isolate* isolate,const NSString* value) {
    /*
     // TODO: profile if this is faster
     // maybe have multiple conversion
     if([value fastestEncoding] == NSUTF16StringEncoding) {
        uint16_t static_buffer[256];
        uint16_t* targetBuffer = static_buffer;
        bool isDynamic = false;
        auto length = [value maximumLengthOfBytesUsingEncoding:NSUTF16StringEncoding];
        auto numberOfBytes = length * sizeof(uint16_t);
        if (length > 256) {
            targetBuffer = (uint16_t*)malloc(numberOfBytes);
            isDynamic = true;
        }
        NSUInteger usedLength = 0;
        NSRange range = NSMakeRange(0, [value length]);
        [value getBytes:targetBuffer maxLength:numberOfBytes usedLength:&usedLength encoding:NSUTF16StringEncoding options:0 range:range remainingRange:NULL];
        
        auto result = v8::String::NewFromTwoByte(isolate, targetBuffer, v8::NewStringType::kNormal, (int)[value length]).ToLocalChecked();
        if (isDynamic) {
            free(targetBuffer);
        }
        return result;
    }
     */
    return v8::String::NewFromUtf8(isolate, [value UTF8String], v8::NewStringType::kNormal, (int)[value lengthOfBytesUsingEncoding:NSUTF8StringEncoding]).ToLocalChecked();
}
#endif
inline std::string ToString(v8::Isolate* isolate, const v8::Local<v8::Value>& value) {
    if (value.IsEmpty()) {
        return std::string();
    }

    if (value->IsStringObject()) {
        v8::Local<v8::String> obj = value.As<v8::StringObject>()->ValueOf();
        return tns::ToString(isolate, obj);
    }

    v8::String::Utf8Value result(isolate, value);

    const char* val = *result;
    if (val == nullptr) {
        return std::string();
    }

    return std::string(*result, result.length());
}

#ifdef __OBJC__
inline NSString* ToNSString(const std::string& v) {
    return [[[NSString alloc] initWithBytes:v.c_str() length:v.length() encoding:NSUTF8StringEncoding] S_AUTORELEASE];
}
// this method is a copy of ToString to avoid needless std::string<->NSString conversions
inline NSString* ToNSString(v8::Isolate* isolate, const v8::Local<v8::Value>& value) {
    if (value.IsEmpty()) {
        return @"";
    }

    if (value->IsStringObject()) {
        v8::Local<v8::String> obj = value.As<v8::StringObject>()->ValueOf();
        return ToNSString(isolate, obj);
    }

    v8::String::Utf8Value result(isolate, value);

    const char* val = *result;
    if (val == nullptr) {
        return @"";
    }

    return [[[NSString alloc] initWithBytes:*result length:result.length() encoding:NSUTF8StringEncoding] S_AUTORELEASE];
    
}
#endif
std::u16string ToUtf16String(v8::Isolate* isolate, const v8::Local<v8::Value>& value);
inline double ToNumber(v8::Isolate* isolate, const v8::Local<v8::Value>& value) {
    double result = NAN;

    if (value.IsEmpty()) {
        return result;
    }

    if (value->IsNumberObject()) {
        result = value.As<v8::NumberObject>()->ValueOf();
    } else if (value->IsNumber()) {
        result = value.As<v8::Number>()->Value();
    } else {
        v8::Local<v8::Number> number;
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        bool success = value->ToNumber(context).ToLocal(&number);
        if (success) {
            result = number->Value();
        }
    }

    return result;
}
inline bool ToBool(const v8::Local<v8::Value>& value) {
    bool result = false;

    if (value.IsEmpty()) {
        return result;
    }

    if (value->IsBooleanObject()) {
        result = value.As<v8::BooleanObject>()->ValueOf();
    } else if (value->IsBoolean()) {
        result = value.As<v8::Boolean>()->Value();
    }

    return result;
}
std::vector<uint16_t> ToVector(const std::string& value);

bool Exists(const char* fullPath);
v8::Local<v8::String> ReadModule(v8::Isolate* isolate, const std::string &filePath);
const char* ReadText(const std::string& filePath, long& length, bool& isNew);
std::string ReadText(const std::string& file);
uint8_t* ReadBinary(const std::string path, long& length, bool& isNew);
bool WriteBinary(const std::string& path, const void* data, long length);

void SetPrivateValue(const v8::Local<v8::Object>& obj, const v8::Local<v8::String>& propName, const v8::Local<v8::Value>& value);
v8::Local<v8::Value> GetPrivateValue(const v8::Local<v8::Object>& obj, const v8::Local<v8::String>& propName);

void SetValue(v8::Isolate* isolate, const v8::Local<v8::Object>& obj, BaseDataWrapper* value);
BaseDataWrapper* GetValue(v8::Isolate* isolate, const v8::Local<v8::Value>& val);
void DeleteValue(v8::Isolate* isolate, const v8::Local<v8::Value>& val);
bool DeleteWrapperIfUnused(v8::Isolate* isolate, const v8::Local<v8::Value>& obj, BaseDataWrapper* value);
std::vector<v8::Local<v8::Value>> ArgsToVector(const v8::FunctionCallbackInfo<v8::Value>& info);

inline bool IsString(const v8::Local<v8::Value>& value) {
    return !value.IsEmpty() && (value->IsString() || value->IsStringObject());
}

inline bool IsNumber(const v8::Local<v8::Value>& value) {
    return !value.IsEmpty() && (value->IsNumber() || value->IsNumberObject());
}

inline bool IsBigInt(const v8::Local<v8::Value>& value) {
    return !value.IsEmpty() && (value->IsBigInt() || value->IsBigIntObject());
}

inline bool IsBool(const v8::Local<v8::Value>& value) {
    return !value.IsEmpty() && (value->IsBoolean() || value->IsBooleanObject());
}


bool IsArrayOrArrayLike(v8::Isolate* isolate, const v8::Local<v8::Value>& value);
void* TryGetBufferFromArrayBuffer(const v8::Local<v8::Value>& value, bool& isArrayBuffer);

void ExecuteOnRunLoop(CFRunLoopRef queue, std::function<void ()> func, bool async = true);
void ExecuteOnDispatchQueue(dispatch_queue_t queue, std::function<void ()> func, bool async = true);
void ExecuteOnMainThread(std::function<void ()> func, bool async = true);

void LogError(v8::Isolate* isolate, v8::TryCatch& tc);
void LogBacktrace(int skip = 1);
#ifndef __OBJC__
#define Log(fmt, ...) NSLog(CFSTR(fmt), ##__VA_ARGS__)
#else
#define Log(...) NSLog(__VA_ARGS__)
#endif

v8::Local<v8::String> JsonStringifyObject(v8::Local<v8::Context> context, v8::Local<v8::Value> value, bool handleCircularReferences = true);
v8::Local<v8::Function> GetSmartJSONStringifyFunction(v8::Isolate* isolate);

std::string ReplaceAll(const std::string source, std::string find, std::string replacement);

const std::string BuildStacktraceFrameLocationPart(v8::Isolate* isolate, v8::Local<v8::StackFrame> frame);
const std::string BuildStacktraceFrameMessage(v8::Isolate* isolate, v8::Local<v8::StackFrame> frame);
const std::string GetStackTrace(v8::Isolate* isolate);
const std::string GetCurrentScriptUrl(v8::Isolate* isolate);

bool LiveSync(v8::Isolate* isolate);

void Assert(bool condition, v8::Isolate* isolate = nullptr, std::string const &reason = std::string());

void StopExecutionAndLogStackTrace(v8::Isolate* isolate);




// Helpers from Node
inline v8::Local<v8::String> OneByteString(v8::Isolate* isolate,
                                           const char* data,
                                           int length) {
    return v8::String::NewFromOneByte(isolate,
                                      reinterpret_cast<const uint8_t*>(data),
                                      v8::NewStringType::kNormal,
                                      length).ToLocalChecked();
}
inline v8::Local<v8::String> OneByteString(v8::Isolate* isolate,
                                           const signed char* data,
                                           int length) {
    return v8::String::NewFromOneByte(isolate,
                                      reinterpret_cast<const uint8_t*>(data),
                                      v8::NewStringType::kNormal,
                                      length).ToLocalChecked();
}
inline v8::Local<v8::String> OneByteString(v8::Isolate* isolate,
                                           const unsigned char* data,
                                           int length) {
    return v8::String::NewFromOneByte(
                                      isolate, data, v8::NewStringType::kNormal, length)
    .ToLocalChecked();
}

// Convenience wrapper around v8::String::NewFromOneByte().
inline v8::Local<v8::String> OneByteString(v8::Isolate* isolate,
                                           const char* data,
                                           int length = -1);
// For the people that compile with -funsigned-char.
inline v8::Local<v8::String> OneByteString(v8::Isolate* isolate,
                                           const signed char* data,
                                           int length = -1);
inline v8::Local<v8::String> OneByteString(v8::Isolate* isolate,
                                           const unsigned char* data,
                                           int length = -1);



v8::Local<v8::FunctionTemplate> NewFunctionTemplate(
                                                    v8::Isolate* isolate,
                                                    v8::FunctionCallback callback,
                                                    v8::Local<v8::Value> data = v8::Local<v8::Value>(),
                                                    v8::Local<v8::Signature> signature = v8::Local<v8::Signature>(),
                                                    v8::ConstructorBehavior behavior = v8::ConstructorBehavior::kAllow,
                                                    v8::SideEffectType side_effect = v8::SideEffectType::kHasSideEffect,
                                                    const v8::CFunction* c_function = nullptr);
// Convenience methods for NewFunctionTemplate().
void SetMethod(v8::Local<v8::Context> context,
               v8::Local<v8::Object> that,
               const char* name,
               v8::FunctionCallback callback,
               v8::Local<v8::Value> data = v8::Local<v8::Value>());
// Similar to SetProtoMethod but without receiver signature checks.
void SetMethod(v8::Isolate* isolate,
               v8::Local<v8::Template> that,
               const char* name,
               v8::FunctionCallback callback,
               v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetFastMethod(v8::Isolate* isolate,
                   v8::Local<v8::Template> that,
                   const char* name,
                   v8::FunctionCallback slow_callback,
                   const v8::CFunction* c_function,
                   v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetFastMethod(v8::Local<v8::Context> context,
                   v8::Local<v8::Object> that,
                   const char* name,
                   v8::FunctionCallback slow_callback,
                   const v8::CFunction* c_function,
                   v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetFastMethodNoSideEffect(v8::Isolate* isolate,
                               v8::Local<v8::Template> that,
                               const char* name,
                               v8::FunctionCallback slow_callback,
                               const v8::CFunction* c_function,
                               v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetFastMethodNoSideEffect(v8::Local<v8::Context> context,
                               v8::Local<v8::Object> that,
                               const char* name,
                               v8::FunctionCallback slow_callback,
                               const v8::CFunction* c_function,
                               v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetProtoMethod(v8::Isolate* isolate,
                    v8::Local<v8::FunctionTemplate> that,
                    const char* name,
                    v8::FunctionCallback callback,
                    v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetInstanceMethod(v8::Isolate* isolate,
                       v8::Local<v8::FunctionTemplate> that,
                       const char* name,
                       v8::FunctionCallback callback,
                       v8::Local<v8::Value> data = v8::Local<v8::Value>());
// Safe variants denote the function has no side effects.
void SetMethodNoSideEffect(v8::Local<v8::Context> context,
                           v8::Local<v8::Object> that,
                           const char* name,
                           v8::FunctionCallback callback,
                           v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetProtoMethodNoSideEffect(v8::Isolate* isolate,
                                v8::Local<v8::FunctionTemplate> that,
                                const char* name,
                                v8::FunctionCallback callback,
                                v8::Local<v8::Value> data = v8::Local<v8::Value>());
void SetMethodNoSideEffect(v8::Isolate* isolate,
                           v8::Local<v8::Template> that,
                           const char* name,
                           v8::FunctionCallback callback,
                           v8::Local<v8::Value> data = v8::Local<v8::Value>());
enum class SetConstructorFunctionFlag {
    NONE,
    SET_CLASS_NAME,
};
void SetConstructorFunction(v8::Local<v8::Context> context,
                            v8::Local<v8::Object> that,
                            const char* name,
                            v8::Local<v8::FunctionTemplate> tmpl,
                            SetConstructorFunctionFlag flag =
                            SetConstructorFunctionFlag::SET_CLASS_NAME);
void SetConstructorFunction(v8::Local<v8::Context> context,
                            v8::Local<v8::Object> that,
                            v8::Local<v8::String> name,
                            v8::Local<v8::FunctionTemplate> tmpl,
                            SetConstructorFunctionFlag flag =
                            SetConstructorFunctionFlag::SET_CLASS_NAME);
void SetConstructorFunction(v8::Isolate* isolate,
                            v8::Local<v8::Template> that,
                            const char* name,
                            v8::Local<v8::FunctionTemplate> tmpl,
                            SetConstructorFunctionFlag flag =
                            SetConstructorFunctionFlag::SET_CLASS_NAME);
void SetConstructorFunction(v8::Isolate* isolate,
                            v8::Local<v8::Template> that,
                            v8::Local<v8::String> name,
                            v8::Local<v8::FunctionTemplate> tmpl,
                            SetConstructorFunctionFlag flag =
                            SetConstructorFunctionFlag::SET_CLASS_NAME);


}

#endif /* Helpers_h */
