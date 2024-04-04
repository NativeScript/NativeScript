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

@end
