
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
        static initWithDataEncoding(data: any, encoding: any) : any;
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
        static URLWithString(url : string): any;
    }
}
