#ifndef PromiseProxy_h
#define PromiseProxy_h

#include "Common.h"

namespace tns {

class PromiseProxy {
public:
    static void Init(v8::Local<v8::Context> context);
};

}

#endif /* PromiseProxy_h */
