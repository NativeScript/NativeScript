#ifndef WeakRef_h
#define WeakRef_h

#include "Common.h"

namespace tns {

class WeakRef {
public:
    static void Init(v8::Local<v8::Context> context);
};

}

#endif /* WeakRef_h */
