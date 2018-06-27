#import "NativeScriptEmbedder.h"

@implementation NativeScriptEmbedder

+ (NativeScriptEmbedder *)sharedInstance {
    static NativeScriptEmbedder *sharedInstance = nil;
    static dispatch_once_t onceToken; 
    dispatch_once(&onceToken, ^{
        sharedInstance = [[NativeScriptEmbedder alloc] init];
    });

     return sharedInstance;
}

- (void)setDelegate:(id <NativeScriptEmbedderDelegate>)aDelegate {
    _delegate = aDelegate;
}

@end
