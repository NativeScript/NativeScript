import TKUnit = require("../TKUnit");
import fs = require("file-system");
import enums = require("ui/enums");
import resolver = require("file-system/file-name-resolver");

var androidPhonePortraitContext: resolver.PlatformContext = {
    width: 360,
    height: 640,
    deviceType: enums.DeviceType.Phone,
    os: "android"
}

var androidPhoneLandsacpeContext: resolver.PlatformContext = {
    width: 640,
    height: 360,
    deviceType: enums.DeviceType.Phone,
    os: "android"
}

var androidTabletPortraitContext: resolver.PlatformContext = {
    width: 600,
    height: 960,
    deviceType: enums.DeviceType.Tablet,
    os: "android"
}

var iPhonePortraitContext: resolver.PlatformContext = {
    width: 320,
    height: 480,
    deviceType: enums.DeviceType.Phone,
    os: "ios"
}

var iPhoneLandscapeContext: resolver.PlatformContext = {
    width: 480,
    height: 320,
    deviceType: enums.DeviceType.Phone,
    os: "ios"
}

export function test_findFileMatch_fileName() {
    var candidates: Array<string> = [
        "test.xml",
        "test2.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.xml")
};

export function test_findFileMatch_os_android() {
    var candidates: Array<string> = [
        "test.xml",
        "test.ios.xml",
        "test.android.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.android.xml")
};

export function test_findFileMatch_os_ios() {
    var candidates: Array<string> = [
        "test.xml",
        "test.ios.xml",
        "test.android.xml",
        "other.xml"
    ];

    testTemplate(candidates, iPhonePortraitContext, "test.ios.xml")
};

export function test_findFileMatch_os_fallback() {
    var candidates: Array<string> = [
        "test.xml",
        "test.ios.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.xml")
};

export function test_findFileMatch_minWH_fallback() {
    var candidates: Array<string> = [
        "test.xml",
        "test.minWH600.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.xml")
}

export function test_findFileMatch_minWH_best_value() {
    var candidates: Array<string> = [
        "test.xml",
        "test.minWH400.xml",
        "test.minWH500.xml",
        "test.minWH600.xml",
        "test.minWH700.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidTabletPortraitContext, "test.minWH600.xml")
}

export function test_findFileMatch_minW_fallback() {
    var candidates: Array<string> = [
        "test.xml",
        "test.minW600.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.xml")
}

export function test_findFileMatch_minW_best_value() {
    var candidates: Array<string> = [
        "test.xml",
        "test.minW400.xml",
        "test.minW500.xml",
        "test.minW600.xml",
        "test.minW700.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidTabletPortraitContext, "test.minW600.xml")
}

export function test_findFileMatch_minH_fallback() {
    var candidates: Array<string> = [
        "test.xml",
        "test.minH600.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhoneLandsacpeContext, "test.xml")
}

export function test_findFileMatch_minH_best_value() {
    var candidates: Array<string> = [
        "test.xml",
        "test.minH400.xml",
        "test.minH500.xml",
        "test.minH600.xml",
        "test.minH700.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.minH600.xml")
}

export function test_findFileMatch_orienation_fallback() {
    var candidates: Array<string> = [
        "test.xml",
        "test.land.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidTabletPortraitContext, "test.xml")
}

export function test_findFileMatch_orienation_portrait() {
    var candidates: Array<string> = [
        "test.xml",
        "test.land.xml",
        "test.port.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidTabletPortraitContext, "test.port.xml")
}

export function test_findFileMatch_orienation_landscape() {
    var candidates: Array<string> = [
        "test.xml",
        "test.land.xml",
        "test.port.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhoneLandsacpeContext, "test.land.xml")
}

export function test_findFileMatch_choose_most_specific_file() {
    var candidates: Array<string> = [
        "test.xml",
        "test.android.xml",
        "test.android.port.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidPhonePortraitContext, "test.android.port.xml")
}

export function test_findFileMatch_with_multiple_matches_loads_by_priority() {
    var candidates: Array<string> = [
        "test.xml",
        "test.android.xml",
        "test.tablet.xml",
        "test.land.xml",
        "test.minH600.xml",
        "test.minW600.xml",
        "test.minWH600.xml",
        "other.xml"
    ];

    testTemplate(candidates, androidTabletPortraitContext, "test.minWH600.xml")
}

function testTemplate(candidates: Array<string>, context: resolver.PlatformContext, expected: string) {
    var result = resolver.findFileMatch("test", ".xml", candidates, context);
    TKUnit.assertEqual(result, expected, "File path");
}

var testFilePath = "~/file-name-resolver-tests/files/test".replace("~", fs.knownFolders.currentApp().path);

export function test_file_resolver_with_andorid_phone_portratit() {
    var fileResolver = new resolver.FileNameResolver(androidPhonePortraitContext);
    var result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".xml", "File path");
}

export function test_file_resolver_with_andorid_phone_landscape() {
    var fileResolver = new resolver.FileNameResolver(androidPhoneLandsacpeContext);
    var result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".land.xml", "File path");
}

export function test_file_resolver_with_andorid_tablet_portrait() {
    var fileResolver = new resolver.FileNameResolver(androidTabletPortraitContext);
    var result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".minWH600.xml", "File path");
}

export function test_file_resolver_with_ios_phone_landscape() {
    var fileResolver = new resolver.FileNameResolver(iPhoneLandscapeContext);
    var result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".land.xml", "File path");
}

export function test_file_resolver_with_ios_phone_portrait() {
    var fileResolver = new resolver.FileNameResolver(iPhonePortraitContext);
    var result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".xml", "File path");
}
