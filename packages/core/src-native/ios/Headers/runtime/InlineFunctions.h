#ifndef InlineFunctions_h
#define InlineFunctions_h

#include "Common.h"

namespace tns {

class InlineFunctions {
public:
    static void Init(v8::Local<v8::Context> context);
    static bool IsGlobalFunction(std::string name);
};

}

#endif /* InlineFunctions_h */
