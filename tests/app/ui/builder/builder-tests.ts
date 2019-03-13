import { path } from "tns-core-modules/file-system";
import { loadPage } from "tns-core-modules/ui/builder";
import { assertEqual, assertNull } from "../../TKUnit";

const COMPONENT_MODULE = "component-module";
const LABEL = "label";

function getViewComponent() {
    const moduleNamePath = path.join(__dirname, COMPONENT_MODULE);
    const fileName = path.join(__dirname, `${COMPONENT_MODULE}.xml`);
    const view = loadPage(moduleNamePath, fileName);
    return view;
}

export function test_view_is_module_root_component() {
    const view = getViewComponent();
    const actualModule = view._moduleName;
    assertEqual(actualModule, COMPONENT_MODULE, `View<${view}> is NOT root component of module <${COMPONENT_MODULE}>.`);
}

export function test_view_is_NOT_module_root_component() {
    const view = getViewComponent();
    const nestedView = view.getViewById(`${LABEL}`);
    const undefinedModule = nestedView._moduleName;
    assertNull(undefinedModule, `View<${nestedView}> should NOT be a root component of a module.`);
}
