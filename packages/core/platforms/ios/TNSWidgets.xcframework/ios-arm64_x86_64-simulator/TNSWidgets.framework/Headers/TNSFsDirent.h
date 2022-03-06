//
//  TNSFsDirent.h
//  TNSWidgets
//
//  Created by Osei Fortune on 18/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsDirent_h
#define TNSFsDirent_h
#import <Foundation/Foundation.h>
@interface TNSFsDirent: NSObject
-(BOOL)isBlockDevice;
-(BOOL)isCharacterDevice;
-(BOOL)isDirectory;
-(BOOL)isFIFO;
-(BOOL)isFile;
-(BOOL)isSocket;
-(BOOL)isSymbolicLink;
-(NSString*)name;
@end

#endif /* TNSFsDirent_h */
