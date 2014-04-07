
// iOS specific TypeScript declarations
// TODO: This is temporary, until we have the TS definitions for the native APIs

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
    export class NSUserDefaults {
        static standardUserDefaults(): any;
    }

    export class NSMutableArray {
        addObject(obj: any);
    }

    export class NSFileManager {
        static defaultManager(): NSFileManager;
        URLsForDirectoryInDomains(directory: number, mask: number): any;
    }

    export class NSString {
        static initWithString(s: string): NSString;
        static initWithDataEncoding(data: any, encoding: any): any;
        stringByDeletingLastPathComponent(): string;
        dataUsingEncoding(encoding: number): any;
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
        static URLWithString(url: string): any;
        path(): string;
        relativePath(): string;
        relativeString(): string;
    }

    export class NSDate {
        timeIntervalSince1970(): number;
    }

    export class NSMutableURLRequest {
        static requestWithURL(url: any): any;
    }
}

declare module QuartzCore {
    function CACurrentMediaTime(): number;
}
