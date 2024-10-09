
import Foundation
import UIKit

@objcMembers
@objc(NSApplicationSettings)
class NSApplicationSettings : NSObject {

    static func userDefaultsToJSONString(ignoreRegexp: String?) -> String? {
        let userDefaults = UserDefaults.standard
        let nsDictionary = userDefaults.dictionaryRepresentation()
        let jsonDictionary = NSMutableDictionary()

        var regex: NSRegularExpression?
        if let ignoreRegexp = ignoreRegexp {
            do {
                regex = try NSRegularExpression(pattern: ignoreRegexp)
            } catch {
                print("Invalid regular expression: \(error.localizedDescription)")
                return nil
            }
        }
        
        nsDictionary.forEach { (key, value) in
            guard let key = key as? String else { return }
            
            // Filter out keys that match the ignore criteria
            if key.hasPrefix("AK") || key.hasPrefix("Apple") || key.hasPrefix("NS") || key.hasPrefix("PK") {
                return
            }
            
            // If regex is provided, filter keys that match the regex          
             if let regex = regex {
                let range = NSRange(location: 0, length: key.utf16.count)
                if regex.firstMatch(in: key, options: [], range: range) != nil {
                    return
                }
            }
            
            var valueClassString: String?
            
            // Obtain the class of the value
            if let valueClass = object_getClass(value) {
                valueClassString = NSStringFromClass(valueClass)
            }
            
            if let valueClassString = valueClassString {
                var formattedValueClassString = valueClassString
                
                // Remove '__' prefix if present
                if formattedValueClassString.hasPrefix("__") {
                    formattedValueClassString.removeFirst(2)
                }
                
                switch formattedValueClassString {
                case "NSDate":
                    if let dateValue = value as? Date {
                        let dateFormatter = ISO8601DateFormatter()
                        jsonDictionary.setObject(dateFormatter.string(from: dateValue), forKey: key as NSString)
                    }
                case "NSURL":
                    if let urlValue = value as? URL {
                        jsonDictionary.setObject(urlValue.absoluteString, forKey: key as NSString)
                    }
                default:
                    if (JSONSerialization.isValidJSONObject(value)) {
                        jsonDictionary.setObject(value, forKey: key as NSString)
                    }
                }
            } else if (JSONSerialization.isValidJSONObject(value)) {
                jsonDictionary.setObject(value, forKey: key as NSString)
            }
        }
        
        // Convert the dictionary to JSON data
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: jsonDictionary, options: .prettyPrinted)
            
            // Convert JSON data to string
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                return jsonString
            }
        } catch {
            print("Failed to serialize dictionary to JSON: \(error.localizedDescription)")
        }
        
        return nil
    }
}