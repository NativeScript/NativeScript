//
//  TNSByteBufMut.m
//  TNSWidgets
//
//  Created by Osei Fortune on 22/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSByteBufMut+Internal.h"
@implementation TNSByteBufMut
- (instancetype)initWithByteBufMut:(ByteBufMut *)byteBuf {
    if (byteBuf == nil) {
        return nil;
    }
    self = [super initWithBytesNoCopy:byteBuf->data length:byteBuf->len freeWhenDone:NO];
    if (self) {
        self.innerBuf = byteBuf;
    }
    return self;
}

- (instancetype)initWithBytesNoCopy:(nonnull void *)bytes length:(NSUInteger)length {
    return [super initWithBytesNoCopy:bytes length:length];
}

- (void)dealloc {
    if (self.innerBuf) {
        native_dispose_byte_buf_mut(self.innerBuf);
        self.innerBuf = nil;
    }
}

@end

