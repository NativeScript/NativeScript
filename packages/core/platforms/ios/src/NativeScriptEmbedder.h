//
//  NativeScriptEmbedder.h
//  NativeScript
//
//  Created by Teodor Dermendzhiev on 6/19/18.
//
#include <UIKit/UIKit.h>

// When embedding NativeScript application embedder needs to conform to this protocol
// in order to have control over the NativeScript UIViewController
// otherwise NativeScript application is presented over the topmost UIViewController.
@protocol NativeScriptEmbedderDelegate
- (id)presentNativeScriptApp:(UIViewController*)vc;
@end

@interface NativeScriptEmbedder : NSObject

@property(nonatomic, retain, readonly) id<NativeScriptEmbedderDelegate> delegate;

+ (NativeScriptEmbedder *)sharedInstance;

- (void)setDelegate:(id <NativeScriptEmbedderDelegate>)aDelegate;


@end

