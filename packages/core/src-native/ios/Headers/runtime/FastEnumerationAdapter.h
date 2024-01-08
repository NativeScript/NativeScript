#ifndef FastEnumerationAdapter_h
#define FastEnumerationAdapter_h

#import <Foundation/NSEnumerator.h>
#include "Common.h"

namespace tns {

NSUInteger FastEnumerationAdapter(v8::Isolate* isolate, id self, NSFastEnumerationState* state, __unsafe_unretained id buffer[], NSUInteger length, v8::Persistent<v8::Function>* poIteratorFunc);

}

#endif /* FastEnumerationAdapter_h */
