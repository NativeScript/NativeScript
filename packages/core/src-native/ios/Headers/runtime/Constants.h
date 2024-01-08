#ifndef Constants_h
#define Constants_h

#include <string>

namespace tns {

class Constants {
public:
    static const std::string SwizzledPrefix;
    static const int CACHES_ISOLATE_SLOT = 0;
    static const int RUNTIME_SLOT = 1;
    
    enum ClassTypes{ DataWrapper = 100, ObjectManagedValue };
};

}

#endif /* Constants_h */
