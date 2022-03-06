//
//  TNSByteBufMut+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 22/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSByteBufMut_Internal_h
#define TNSByteBufMut_Internal_h
#import "TNSByteBufMut.h"
@interface TNSByteBufMut()
@property (nullable) ByteBufMut *innerBuf;
- (instancetype)initWithByteBufMut:(ByteBufMut *)byteBuf;
- (instancetype)initWithBytesNoCopy:(void *)bytes length:(NSUInteger)length;
@end

#endif /* TNSByteBufMut_Internal_h */
