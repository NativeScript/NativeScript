
// iOS specific TypeScript declarations
// TODO: This is temporary, until we have the TS definitions for the native APIs

/*
declare module UIKit {

    export class UIResponder {
        static extends(param1: any, param2: any): any;
    }

    export class UIWindow {
        constructor(frame: any);
    }

    export class UIScreen {
        static mainScreen(): any;
    }

    export class UIColor {
        static whiteColor: any;
    }

    export class UINavigationController {
        constructor(rootController: any);
    }

    export class UIImageView {
        constructor();
        setImage(image: any);
    }

    export class UILabel {
        constructor();
        setText(text: string);
        sizeToFit();
    }

    export class UIImage {
        static imageNamed(name: string): UIImage;
        static imageWithContentsOfFile(path: string): UIImage;
        static imageWithData(data: any): UIImage;
    }

    function UIImagePNGRepresentation(image: UIImage);
    function UIImageJPEGRepresentation(image: UIImage, compressionQuality: number);
}

declare module Foundation {
    export class NSError extends NSObject {
    }

    export class NSObject {
        static extends(...optionalParams: any[]): any;
    }

    export class NSUserDefaults {
        static standardUserDefaults(): any;
    }

    export class NSMutableArray {
        addObject(obj: any);
    }

    export class NSFileManager {
        static defaultManager(): NSFileManager;
        URLsForDirectoryInDomains(directory: number, mask: number): any;
        attributesOfItemAtPathError(path: string, error: any): any;
        fileExistsAtPath(path: string): boolean;
        fileExistsAtPathIsDirectory(path: string, isDir: boolean): boolean;
        createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path: string, intermediateDirs: boolean, attributes: any, error: any): boolean;
        displayNameAtPath(path: string): string;
        createFileAtPathContentsAttributes(path: string, data: any, attributes: any): boolean;
        enumeratorAtPath(path: string): any;
        contentsOfDirectoryAtPathError(path: string, error: any);
        removeItemAtPathError(path: string, error: any): boolean;
        moveItemAtPathToPathError(sourcePath: string, destPath: string, error: any);
        contentsAtPath(path: string): NSData;
    }

    export class NSData extends NSObject {

    }

    export class NSString {
        static initWithString(s: string): NSString;
        static initWithDataEncoding(data: any, encoding: any): any;
        static pathWithComponents(paths: NSArray): NSString;
        static stringWithContentsOfFileEncodingError(path: string, encoding: number, error: any): NSString;
        stringByDeletingLastPathComponent(): string;
        stringByDeletingPathExtension(): string;
        dataUsingEncoding(encoding: number): any;
        writeToFileAtomicallyEncodingError(path: string, atomically: boolean, encoding: number, error: any): boolean;
    }

    export class NSArray extends NSObject {
        static arrayWithObjectsWithArguments(...params: any[]): NSArray;
    }

    export class NSURLSessionConfiguration {
        static defaultSessionConfiguration(): any;
    }

    export class NSOperationQueue {
        static mainQueue(): any;
    }

    export class NSURLSession {
        static sessionWithConfigurationDelegateDelegateQueue(config: any, param: any, queue : any): any;
    }

    export class NSURL {
        static URLWithString(url: string): NSURL;
        static fileURLWithPathIsDirectory(path: string, isDirectory: boolean): NSURL;
        path(): string;
        relativePath(): string;
        relativeString(): string;
        pathExtension(): string;
    }

    export class NSDate {
        static dateWithTimeIntervalSince1970(datetime: number);
        timeIntervalSince1970(): number;
    }

    export class NSMutableURLRequest {
        static requestWithURL(url: any): any;
    }
}

declare module QuartzCore {
    function CACurrentMediaTime(): number;
}

declare module CoreLocation {
    export class CLLocationManager {
        static locationServicesEnabled(): boolean;
        delegate: any;
        distanceFilter: number;
        desiredAccuracy: number;
        startUpdatingLocation(): void;
        stopUpdatingLocation(): void;
        location: CLLocation;
    }

    export class CLLocation {
        static initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseSpeedTimestamp(coordinate: any, altitude: number, horizontalAccuracy: number, verticalAccuracy: number, course: number, speed: number, timestamp: Foundation.NSDate);
        coordinate: any;
        altitude: number;
        horizontalAccuracy: number;
        verticalAccuracy: number;
        timestamp: Foundation.NSDate;
        speed: number;
        course: number;
    }

    function CLLocationCoordinate2DMake(latitude: number, longitude: number) : any;
}

declare var NativePointer: any;
declare var PrimitiveType: any;
declare var RefValue: any;
