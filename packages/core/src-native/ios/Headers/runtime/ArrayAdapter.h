#ifndef ArrayAdapter_h
#define ArrayAdapter_h

#import <Foundation/NSArray.h>
#include "Common.h"

@interface ArrayAdapter : NSArray

-(instancetype)initWithJSObject:(v8::Local<v8::Object>)jsObject isolate:(v8::Isolate*)isolate;

@end

#endif /* ArrayAdapter_h */
