import * as TKUnit from "../tk-unit";
import * as fs from "@nativescript/core/file-system";
import { FileNameResolver } from "@nativescript/core/file-system/file-name-resolver";
import {
    androidPhonePortraitContext,
    androidPhoneLandscapeContext,
    androidTabletPortraitContext,
    iPhoneLandscapeContext,
    iPhonePortraitContext
} from "./qualifier-matcher-tests";

const testFilePath = "~/name-resolvers-tests/files/test".replace("~", fs.knownFolders.currentApp().path);

export function test_file_resolver_with_android_phone_portrait() {
    const fileResolver = new FileNameResolver(androidPhonePortraitContext);
    const result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".xml", "File path");
}

export function test_file_resolver_with_android_phone_landscape() {
    const fileResolver = new FileNameResolver(androidPhoneLandscapeContext);
    const result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".land.xml", "File path");
}

export function test_file_resolver_with_android_tablet_portrait() {
    const fileResolver = new FileNameResolver(androidTabletPortraitContext);
    const result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".minWH600.xml", "File path");
}

export function test_file_resolver_with_ios_phone_landscape() {
    const fileResolver = new FileNameResolver(iPhoneLandscapeContext);
    const result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".land.xml", "File path");
}

export function test_file_resolver_with_ios_phone_portrait() {
    const fileResolver = new FileNameResolver(iPhonePortraitContext);
    const result = fileResolver.resolveFileName(testFilePath, "xml");
    TKUnit.assertEqual(result, testFilePath + ".xml", "File path");
}
