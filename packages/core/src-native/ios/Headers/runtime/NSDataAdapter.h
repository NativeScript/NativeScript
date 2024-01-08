#ifndef NSDataAdapter_h
#define NSDataAdapter_h

#import <Foundation/NSData.h>
#include "Common.h"

@interface NSDataAdapter : NSMutableData

- (instancetype)initWithJSObject:(v8::Local<v8::Object>)jsObject isolate:(v8::Isolate*)isolate;

@end

#endif /* NSDataAdapter_h */
