
/* Notes:

 1. all test function names should begin with 'test'
 2. (if exists) at the beginning of module test setUpModule() module function is called
 3. (if exists) at the beginning of each test setUp() module function is called
 4. tests should use TKUnit.assert(condition, message) to mark error. If no assert fails test is successful
 5. (if exists) at the end of each test tearDown() module function is called
 6. (if exists) at the end of module test tearDownModule() module function is called
 
*/

var Application = require("Application");

var runTest = function(test, testName) {
    test();
    console.info("--- [" + testName + "] OK");
}

export var runTestModule = function(module, moduleName){
    console.info("--- " + moduleName + " TESTS BEGIN ---");
    console.time(moduleName);
    
    try {
        if (module.setUpModule) {
            module.setUpModule();
        }
    }
    catch (e) {
        console.error("--- [" + moduleName + ".setUpModule()] FAILED: " + e.message);
    }

    var totalTests = 0;
    var totalSuccess = 0;
    for (var testName in module) {
        var testFunction = module[testName];
        if ((typeof(testFunction) === "function") && (testName.substring(0, 4) == "test")) {
            try {
                if (module.setUp) {
                    module.setUp();
                }
            }
            catch (e) {
                console.error("--- [" + moduleName + ".setUp()] FAILED: " + e.message);
            }
            try {
                totalTests++;
                runTest(testFunction, testName);
                totalSuccess++;
            }
            catch (e) {
                console.error("--- [" + testName + "] FAILED: " + e.message);
            }
            try {
                if (module.tearDown) {
                    module.tearDown();
                }
            }
            catch (e) {
                console.error("--- [" + moduleName + ".tearDown()] FAILED: " + e.message);
            }
        }
    }

    try {
        if (module.tearDownModule) {
            module.tearDownModule();
        }
    }
    catch (e) {
        console.error("--- [" + moduleName + ".tearDownModule()] FAILED: " + e.message);
    }
    
    console.timeEnd(moduleName);
    console.info("--- " + moduleName + " TESTS COMPLETE --- (" + totalSuccess + " of " + totalTests + ") OK, " + (totalTests - totalSuccess) + " failed");
}

export var assert = function(test: boolean, message?: string)
{
    //console.assert(test, message);
    if (!test) {
        throw new Error(message);
    }
}

export var wait = function(ms)
{
    if (Application.ios) {
        Foundation.NSRunLoop.currentRunLoop().runUntilDate(Foundation.NSDate.dateWithTimeIntervalSinceNow(ms / 1000));
    }
    else if (Application.android) {
        // java.lang.Thread.sleep(long(ms));
        // java.lang.Thread.yield();
        // TODO: Not yet fully implemented
        // doModal();
    }
}

var doModal = function () {
    var clsMsgQueue = java.lang.Class.forName("android.os.MessageQueue");
    var clsMsg = java.lang.Class.forName("android.os.Message");

    var nextMethod: java.lang.reflect.Method;
    var methods = clsMsgQueue.getDeclaredMethods();
    var i;
    for (i = 0; i < methods.length; i++) {
        if (methods[i].getName() === "next") {
            nextMethod = methods[i];
            break;
        }
    }

    nextMethod.setAccessible(true);

    var targetField;
    var fields = clsMsg.getDeclaredFields();
    for (i = 0; i < fields.length; i++) {
        if (fields[i].getName() === "target") {
            targetField = fields[i];
            break;
        }
    }

    targetField.setAccessible(true);

    var quitModal = false;
    var queue = android.os.Looper.myQueue();

    var msg;
    var obj = new Array(0);
    while (!quitModal) {
        msg = nextMethod.invoke(queue, [{}]);
        if (msg) {
            var target = targetField.get(msg);
            if (!target) {
                // No target is a magic identifier for the quit message.
                quitModal = true;
            } else {
                target.dispatchMessage(msg);
            }
            msg.recycle();
        }
    }
}
 