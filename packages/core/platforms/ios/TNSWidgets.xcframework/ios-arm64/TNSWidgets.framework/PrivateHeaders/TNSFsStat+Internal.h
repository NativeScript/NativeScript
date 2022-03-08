//
//  TNSFsStat+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 20/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsStat_Internal_h
#define TNSFsStat_Internal_h
#import "TNSFsStat.h"
@interface TNSFsStat()
@property FileStat* fileStat;
-(instancetype)initWithFileStat:(FileStat*)fileStat;
@end

#endif /* TNSFsStat_Internal_h */
