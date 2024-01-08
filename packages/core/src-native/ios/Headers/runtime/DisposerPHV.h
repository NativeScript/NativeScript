//
//  DisposerPHV.hpp
//  NativeScript
//
//  Created by Eduardo Speroni on 2/25/23.
//  Copyright © 2023 Progress. All rights reserved.
//

#ifndef DisposerPHV_h
#define DisposerPHV_h
#include "v8.h"

namespace tns {

class DisposerPHV : public v8::PersistentHandleVisitor {
public:
    
    v8::Isolate* isolate_;
    
    DisposerPHV(v8::Isolate* isolate) : isolate_(isolate) {}
    virtual ~DisposerPHV() {}
    
    virtual void VisitPersistentHandle(v8::Persistent<v8::Value>* value, uint16_t class_id);
};


}


#endif /* DisposerPHV_h */
