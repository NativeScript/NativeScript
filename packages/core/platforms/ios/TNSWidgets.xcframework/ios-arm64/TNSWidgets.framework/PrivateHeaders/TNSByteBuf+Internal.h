//
//  TNSByteBuf+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 20/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSByteBuf_Internal_h
#define TNSByteBuf_Internal_h
#import "TNSByteBuf.h"
@interface TNSByteBuf()
@property ByteBuf *innerBuf;
-(instancetype)initWithByteBuf:(ByteBuf*)byteBuf;
@end

#endif /* TNSByteBuf_Internal_h */
