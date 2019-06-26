import { createViewFromEntry } from "tns-core-modules/ui/builder";
import { assertEqual, assertNull, assertThrows } from "../../tk-unit";

const COMPONENT_MODULE = "ui/builder/component-module";
const MISSING_MODULE = "ui/builder/missing-module";
const labelId = "label";

function getViewComponent(moduleName: string) {
    return createViewFromEntry({ moduleName });
}

export function test_view_is_module_root_component() {
    const view = getViewComponent(COMPONENT_MODULE);
    const actualModule = view._moduleName;
    assertEqual(actualModule, COMPONENT_MODULE, `View<${view}> is NOT root component of module <${COMPONENT_MODULE}>.`);
}

export function test_view_is_NOT_module_root_component() {
    const view = getViewComponent(COMPONENT_MODULE);
    const nestedView = view.getViewById(`${labelId}`);
    const undefinedModule = nestedView._moduleName;
    assertNull(undefinedModule, `View<${nestedView}> should NOT be a root component of a module.`);
}

export function test_load_component_from_missing_module_throws() {
    assertThrows(() => getViewComponent(MISSING_MODULE),
        "Loading component from a missing module SHOULD throw an error.");
}
