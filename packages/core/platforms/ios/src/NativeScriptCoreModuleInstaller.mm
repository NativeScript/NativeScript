#import "NativeScriptCoreModuleInstaller.h"
#import <NativeScript/runtime/Runtime.h>
#import "CoreJSIModule.h"

using namespace std;

@implementation NativeScriptCoreModuleInstaller

- (void )install {
    v8::Isolate* isolate = tns::Runtime::GetCurrentRuntime()->GetIsolate();
    CoreJSIModule::install(isolate);
}

@end
