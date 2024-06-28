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

- (void)setWindowScene:(UIWindowScene *)windowScene {
    NSLog(@"Found Window Scene!");
    _windowScene = windowScene;
}

// For backwards compatibility
// Allows usage of core with older runtimes since NativeScriptStart was first introduced in 8.7 runtimes
// avoids NativeScriptMainWindow compiler in scope errors when using 8.7 core with an older runtime
// Note: could consider removing in 9.0 or 10.0 and calling NativeScriptStart directly in NativeScriptMainWindow
+(void)setup {
    Class klass = NSClassFromString(@"NativeScriptStart");
    if (klass) {
        [klass setup];
    }
}

+(void)boot {
    Class klass = NSClassFromString(@"NativeScriptStart");
    if (klass) {
        [klass boot];
    }
}
// End backwards compat

@end
