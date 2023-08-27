//
//  GoogleMapsLocation.m
//  Waataxi
//
//  Created by BONOU ULERICH on 01/08/2023.
//

#import <Foundation/Foundation.h>

#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(GoogleMapsLocation,NSObject)

RCT_EXTERN_METHOD(ShowMessage:(NSString *)message duration:(double *)duration)
RCT_EXTERN_METHOD(LatLng:(String *)message)
RCT_EXTERN_METHOD(CanOpenUrlGoogleMaps)
RCT_EXTERN_METHOD(OpenUrlMaps)
RCT_EXTERN_METHOD(present)

@end
