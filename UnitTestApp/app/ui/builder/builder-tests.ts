import { path } from "tns-core-modules/file-system";
import { loadPage } from "tns-core-modules/ui/builder";
import { assertEqual, assertNull, assertThrows } from "../../tk-unit";

const COMPONENT_MODULE = "component-module";
const MISSING_MODULE = "missing-module";
const LABEL = "label";

const testDir = "ui/builder";
function getViewComponent(componentModule: string) {
    const moduleNamePath = path.join(testDir, componentModule);
    const fileName = path.join(testDir, `${componentModule}.xml`);
    const view = loadPage(moduleNamePath, fileName);
    return view;
}

export function test_view_is_module_root_component() {
    const view = getViewComponent(COMPONENT_MODULE);
    const actualModule = view._moduleName;
    assertEqual(actualModule, COMPONENT_MODULE, `View<${view}> is NOT root component of module <${COMPONENT_MODULE}>.`);
}

export function test_view_is_NOT_module_root_component() {
    const view = getViewComponent(COMPONENT_MODULE);
    const nestedView = view.getViewById(`${LABEL}`);
    const undefinedModule = nestedView._moduleName;
    assertNull(undefinedModule, `View<${nestedView}> should NOT be a root component of a module.`);
}

export function test_load_component_from_missing_module_throws() {
    assertThrows(() => getViewComponent(MISSING_MODULE),
        "Loading component from a missing module SHOULD throw an error.")
}
