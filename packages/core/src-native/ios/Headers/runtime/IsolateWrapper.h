//
//  IsolateWrapper.h
//  NativeScript
//
//  Created by Eduardo Speroni on 2/23/23.
//  Copyright © 2023 Progress. All rights reserved.
//

#ifndef IsolateWrapper_h
#define IsolateWrapper_h

#include "v8.h"
#include "Caches.h"
#include "Constants.h"

namespace tns {

class IsolateWrapper {
public:
    bool IsValid() const;
    inline std::shared_ptr<tns::Caches> GetCache() const {
        return tns::Caches::Get(isolate_);
    }
    inline v8::Isolate* Isolate() {
        return isolate_;
    }
    inline int IsolateId() {
        return isolateId_;
    }
    inline IsolateWrapper(v8::Isolate* isolate) {
        isolate_ = isolate;
        isolateId_ = tns::Caches::Get(isolate_)->getIsolateId();
    }
    
private:
    v8::Isolate* isolate_;
    int isolateId_;
    
    
};

}

#endif /* IsolateWrapper_h */
