//
//  TNSByteBuf.m
//  TNSWidgets
//
//  Created by Osei Fortune on 18/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#import "TNSByteBuf+Internal.h"
@implementation TNSByteBuf
- (instancetype)initWithByteBuf:(ByteBuf *)byteBuf {
    if (byteBuf == nil) {
        return nil;
    }
    // cast to make happy
    self = [super initWithBytesNoCopy:(uint8_t*)byteBuf->data length:byteBuf->len freeWhenDone:NO];
    if (self) {
        self.innerBuf = byteBuf;
    }
    return self;
}


- (void)dealloc {
    if (self.innerBuf) {
        native_dispose_byte_buf(self.innerBuf);
        self.innerBuf = nil;
    }
}
@end
