//
//  NSObject+PropertyBag.h
//  TNSWidgets
//
//  Created by Manol Donev on 21.08.18.
//  Copyright © 2018 Telerik A D. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface NSObject (PropertyBag)

- (id) propertyValueForKey:(NSString*) key;
- (void) setPropertyValue:(id) value forKey:(NSString*) key;

@end
