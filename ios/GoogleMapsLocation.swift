//
//  GoogleMapsLocation.swift
//  Waataxi
//
//  Created by BONOU ULERICH on 01/08/2023.
//

import Foundation
import UIKit

@objc(GoogleMapsLocation)
class GoogleMapsLocation: NSObject, RCTBridgeModule{
  
  static func moduleName() -> String! {
    return "GoogleMapsLocation";
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
  @objc
  func ShowMessage(_ message: NSString, duration: Double) -> Void {
    let alert = UIAlertController(title:nil, message: message as String, preferredStyle: .alert);
    let seconds:Double = duration;
    alert.view.backgroundColor = .black
    alert.view.alpha = 0.5
    alert.view.layer.cornerRadius = 14
    
    DispatchQueue.main.async {
      (UIApplication.shared.delegate as? AppDelegate)?.window.rootViewController?.present(alert, animated: true, completion: nil);
    }
    
    DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + seconds, execute:{
      alert.dismiss(animated: true, completion: nil);
    })
  }
  
  @objc
  func CanOpenUrlGoogleMaps() -> Bool {
    if (UIApplication.shared.canOpenURL(URL(string: "comgooglemaps-x-callback://")!)) {
      return true;
    } else {
      return false;
    }
  }
  
  @objc
  func OpenUrlMaps() -> Void {
    let myUrl = "http://www.google.com"
    if let url = URL(string: "\(myUrl)"), !url.absoluteString.isEmpty {
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }

    // or outside scope use this
    guard let url = URL(string: "\(myUrl)"), !url.absoluteString.isEmpty else {
       return
    }
     UIApplication.shared.open(url, options: [:], completionHandler: nil)


    // UIApplication.shared.openURL(URL(string: 
    //   "comgooglemaps-x-callback://?center=40.765819,-73.975866&zoom=14&views=traffic")!)
    
    // let url = URL(string: "comgooglemaps-x-callback://?daddr=48.8566,2.3522)&directionsmode=driving&zoom=14&views=traffic")!
    // UIApplication.shared.open(url, options: [:], completionHandler: nil)
  }

  @objc
  func LatLng(message: String) -> String {
    return message;
  }
  
  @objc
  func present() {
          let actionSheet = UIAlertController(title: "Open Location", message: "Choose an app to open direction", preferredStyle: .actionSheet)
          actionSheet.addAction(UIAlertAction(title: "Google Maps", style: .default, handler: { _ in
              // Pass the coordinate inside this URL
              let url = URL(string: "comgooglemaps://?daddr=48.8566,2.3522)&directionsmode=driving&zoom=14&views=traffic")!
              UIApplication.shared.open(url, options: [:], completionHandler: nil)
          }))
          
          var sourceView = UIView()
          actionSheet.popoverPresentationController?.sourceRect = sourceView.bounds
          actionSheet.popoverPresentationController?.sourceView = sourceView
          actionSheet.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        var ui = UIViewController()
        ui.present(actionSheet, animated: true, completion: nil)
      }
}
