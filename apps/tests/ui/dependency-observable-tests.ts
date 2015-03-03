// <snippet module="ui/core/dependency-observable" title="dependency-observable">
// # DependencyObservable
// DependencyObservable is a fundamental building block in the NativeScript visual tree (DOM).
// It provides enhanced property system allowing for various value modifiers on a per property basis.
// This enables cascading values - e.g. default vs. inherited vs. local.
// Load the module using the following code:
// ``` JavaScript
import dependencyObservableModule = require("ui/core/dependency-observable");
// ```
// </snippet>

import TKUnit = require("../TKUnit");
import types = require("utils/types");
import observableModule = require("data/observable");

var currentChangeData: dependencyObservableModule.PropertyChangeData;
var propertyNameCount = 0;

function generatePropertyName() {
    var name = "test" + propertyNameCount++;
    return name;
}

function onTestPropertyChanged(data: dependencyObservableModule.PropertyChangeData) {
    currentChangeData = data;
}

function validateDOChangeData(obj: TestDO, property: dependencyObservableModule.Property, oldValue: any, newValue: any) {
    TKUnit.assert(types.isDefined(currentChangeData), "metadata.onValueChanged function not called.");
    TKUnit.assert(currentChangeData.object === obj, "metadata.onValueChanged function called with wrong object member.");
    TKUnit.assert(currentChangeData.property === property, "metadata.onValueChanged method called with wrong property member");
    TKUnit.assert(currentChangeData.newValue === newValue, "metadata.onValueChanged method called with wrong newValue member");
    TKUnit.assert(currentChangeData.oldValue === oldValue, "metadata.onValueChanged method called with wrong oldValue member");
    TKUnit.assert(currentChangeData.eventName === observableModule.knownEvents.propertyChange, "metadata.onValueChanged method called with wrong eventName member");
}

function validateChangeData(data: observableModule.PropertyChangeData, obj: observableModule.Observable, propertyName: string, newValue: any) {
    TKUnit.assert(types.isDefined(data), "DependencyObservable.on for propertyChange not called.");
    TKUnit.assert(data.object === obj, "DependencyObservable.on called with wrong object member.");
    TKUnit.assert(data.propertyName === propertyName, "DependencyObservable.on called with wrong propertyName member");
    TKUnit.assert(data.value === newValue, "DependencyObservable.on called with wrong value member");
    TKUnit.assert(data.eventName === observableModule.knownEvents.propertyChange, "DependencyObservable.on method called with wrong eventName member");
}

// <snippet module="ui/core/dependency-observable" title="dependency-observable">
// ### Creating a Property
// The property backing mechanism in each DependencyObservable instance is implemented via the Property class.
// Basically you create a new Property for a class (type):
// ``` JavaScript
var testProperty = new dependencyObservableModule.Property(
    "test",
    "TestDO",
    new dependencyObservableModule.PropertyMetadata(
        false,
        dependencyObservableModule.PropertyMetadataSettings.None /*0*/,
        onTestPropertyChanged
        )
    );
// ```
// </snippet>

var testProperty1 = new dependencyObservableModule.Property(
    "test1",
    "TestDO",
    new dependencyObservableModule.PropertyMetadata(
        0,
        dependencyObservableModule.PropertyMetadataSettings.None /*0*/,
        onTestPropertyChanged
        )
    );

function validateProperty(value: any): boolean {
    return types.isNumber(value) && value >= 0;
}
var testPropertyWithValidation = new dependencyObservableModule.Property(
    "testWithValidation",
    "TestDO",
    new dependencyObservableModule.PropertyMetadata(
        0,
        dependencyObservableModule.PropertyMetadataSettings.None /*0*/,
        onTestPropertyChanged,
        validateProperty
        )
    );

class TestDO extends dependencyObservableModule.DependencyObservable {
    get test(): boolean {
        return this._getValue(testProperty);
    }
    set test(value: boolean) {
        this._setValue(testProperty, value);
    }

    get test1(): number {
        return this._getValue(testProperty1);
    }
    set test1(value: number) {
        this._setValue(testProperty1, value);
    }

    get testWithValidation(): number {
        return this._getValue(testPropertyWithValidation);
    }
    set testWithValidation(value: number) {
        this._setValue(testPropertyWithValidation, value);
    }

    public _onPropertyChanged(property: dependencyObservableModule.Property, oldValue: any, newValue: any) {
        super._onPropertyChanged(property, oldValue, newValue);
    }
}

export function test_DO_Members_AreDefined() {
    var obj = new dependencyObservableModule.DependencyObservable();
    TKUnit.assert(types.isDefined(obj._setValue), "DependencyObservable._setValue is undefined.");
    TKUnit.assert(types.isDefined(obj._getValue), "DependencyObservable._getValue is undefined.");
    TKUnit.assert(types.isDefined(obj._getValueSource), "DependencyObservable._getValueSource is undefined.");
    TKUnit.assert(types.isDefined(obj._resetValue), "DependencyObservable._resetValue is undefined.");
    TKUnit.assert(types.isDefined(obj._onPropertyChanged), "DependencyObservable._resetValue is undefined.");
    TKUnit.assert(types.isDefined(obj._eachSetProperty), "DependencyObservable._resetValue is undefined.");
}

export function test_NewProperty_WillThrow_If_Name_IsInvalid() {
    var thrown = false;
    try {
        /* tslint:disable:no-unused-variable */
        var p = new dependencyObservableModule.Property("", "", undefined);
        /* tslint:enable:no-unused-variable */
    }
    catch (e) {
        thrown = true;
        TKUnit.assert(e.message === "Name should not be null or empty string.", "Invalid error message");
    }

    TKUnit.assert(thrown, "Should not create a Property with invalid name.");
}

export function test_NewProperty_WillThrow_If_OwnerType_IsInvalid() {
    var thrown = false;
    try {
        /* tslint:disable:no-unused-variable */
        var p = new dependencyObservableModule.Property(generatePropertyName(), "", undefined);
        /* tslint:enable:no-unused-variable */
    }
    catch (e) {
        thrown = true;
        TKUnit.assert(e.message === "OwnerType should not be null or empty string.", "Invalid error message");
    }

    TKUnit.assert(thrown, "Should not create a Property with invalid owner type.");
}

export function test_NewProperty_WillThrow_If_Metadata_IsInvalid() {
    var thrown = false;
    var p;

    try {
        // check for undefined
        p = new dependencyObservableModule.Property(generatePropertyName(), "testOwner", undefined);
    }
    catch (e) {
        thrown = true;
        TKUnit.assert(e.message === "Expected valid PropertyMetadata instance.", "Invalid error message");
    }

    TKUnit.assert(thrown, "Should not create a Property with undefined metadata.");

    thrown = false;
    try {
        // check for invalid type
        var metadata: any = {};
        p = new dependencyObservableModule.Property(generatePropertyName(), "testOwner", metadata);
    }
    catch (e) {
        thrown = true;
        TKUnit.assert(e.message === "Expected valid PropertyMetadata instance.", "Invalid error message");
    }

    TKUnit.assert(thrown, "Should not create a Property with invalid metadata type.");
}

export function test_NewProperty_WillThrow_If_Key_AlreadyRegistered() {
    var thrown = false;
    try {
        /* tslint:disable:no-unused-variable */
        var p = new dependencyObservableModule.Property("test", "testOwner", new dependencyObservableModule.PropertyMetadata(0));
        var p1 = new dependencyObservableModule.Property("test", "testOwner", new dependencyObservableModule.PropertyMetadata(0));
        /* tslint:enable:no-unused-variable */
    }
    catch (e) {
        thrown = true;
        TKUnit.assert(e.message === "Property test already registered for type testOwner.", "Invalid error message");
    }

    TKUnit.assert(thrown, "Should not create a Property with invalid name.");
}

export function test_Property_Id_IsUnique() {
    var p = new dependencyObservableModule.Property(generatePropertyName(), "testOwner", new dependencyObservableModule.PropertyMetadata(0));
    var p1 = new dependencyObservableModule.Property(generatePropertyName(), "testOwner", new dependencyObservableModule.PropertyMetadata(0));

    TKUnit.assert(p.id !== p1.id, "Property.id should be unique.");
}

export function test_PropertyMetadataSettings_HasValid_Memberes() {
    TKUnit.assert(dependencyObservableModule.PropertyMetadataSettings.None === 0, "PropertyMetadataSettings.None not defined correctly.");
    TKUnit.assert(dependencyObservableModule.PropertyMetadataSettings.AffectsLayout === 1, "PropertyMetadataSettings.AffectsLayout not defined correctly.");
    TKUnit.assert(dependencyObservableModule.PropertyMetadataSettings.AffectsStyle === 2, "PropertyMetadataSettings.AffectsStyle not defined correctly.");
    TKUnit.assert(dependencyObservableModule.PropertyMetadataSettings.Inheritable === 4, "PropertyMetadataSettings.Inheritable not defined correctly.");
}

export function test_ValueSource_HasValid_Memberes() {
    TKUnit.assert(dependencyObservableModule.ValueSource.Default === 0, "ValueSource.None not defined correctly.");
    TKUnit.assert(dependencyObservableModule.ValueSource.Inherited === 1, "ValueSource.Inherited not defined correctly.");
    TKUnit.assert(dependencyObservableModule.ValueSource.Css === 2, "ValueSource.Css not defined correctly.");
    TKUnit.assert(dependencyObservableModule.ValueSource.Local === 3, "ValueSource.Local not defined correctly.");
    TKUnit.assert(dependencyObservableModule.ValueSource.VisualState === 4, "ValueSource.VisualState not defined correctly.");
}

export function test_PropertyMetadata_Options() {
    var options =
        dependencyObservableModule.PropertyMetadataSettings.AffectsLayout |
        dependencyObservableModule.PropertyMetadataSettings.AffectsStyle |
        dependencyObservableModule.PropertyMetadataSettings.Inheritable;

    var p = new dependencyObservableModule.Property(generatePropertyName(), "testOwner", new dependencyObservableModule.PropertyMetadata(0, options));

    TKUnit.assert(p.metadata.affectsLayout === true, "PropertyMetadata.affectsLayout not working as expected.");
    TKUnit.assert(p.metadata.affectsStyle === true, "PropertyMetadata.affectsStyle not working as expected.");
    TKUnit.assert(p.metadata.inheritable === true, "PropertyMetadata.inheritable not working as expected.");
    TKUnit.assert(p.metadata.options === options, "PropertyMetadata.options not properly set.");
}

export function test_PropertyEntry_effectiveValue() {
    var p = new dependencyObservableModule.Property(generatePropertyName(), "testOwner", new dependencyObservableModule.PropertyMetadata(0));
    var entry = new dependencyObservableModule.PropertyEntry(p);

    // default value
    TKUnit.assert(entry.effectiveValue === p.metadata.defaultValue, "ValueSource.Default not working as expected.");
    TKUnit.assert(entry.valueSource === dependencyObservableModule.ValueSource.Default, "ValueSource.Default not working as expected.");

    // inherited value
    entry.inheritedValue = 5;
    TKUnit.assert(entry.effectiveValue === 5, "PropertyEntry.inheritedValue not working as expected.");
    TKUnit.assert(entry.valueSource === dependencyObservableModule.ValueSource.Inherited, "ValueSource.Inherited not working as expected.");

    // local value
    entry.localValue = 10;
    TKUnit.assert(entry.effectiveValue === 10, "PropertyEntry.localValue not working as expected.");
    TKUnit.assert(entry.valueSource === dependencyObservableModule.ValueSource.Local, "ValueSource.Local not working as expected.");

    // the default Property implementation counts the above three modifier ONLY, it should skip the Css and VisualState ones
    // css value
    entry.cssValue = 20;
    TKUnit.assert(entry.effectiveValue === 10, "PropertyEntry.cssValue should work for Style properties ONLY.");
    TKUnit.assert(entry.valueSource === dependencyObservableModule.ValueSource.Local, "ValueSource.Local not working as expected.");

    // visual state value
    entry.visualStateValue = 30;
    TKUnit.assert(entry.effectiveValue === 10, "PropertyEntry.visualStateValue should work for Style properties ONLY.");
    TKUnit.assert(entry.valueSource === dependencyObservableModule.ValueSource.Local, "ValueSource.Local not working as expected.");

    entry.resetValue();
    // default value
    TKUnit.assert(entry.effectiveValue === p.metadata.defaultValue, "ValueSource.Default not working as expected.");
    TKUnit.assert(entry.valueSource === dependencyObservableModule.ValueSource.Default, "ValueSource.Default not working as expected.");
}

export function test_DependencyObservable_get_set_AreOverriden() {
    var dO = new TestDO();

    dO.test = true;
    TKUnit.assert(dO.get("test") === true, "DependencyObservable should override Observable.get");

    dO.set("test", false);
    TKUnit.assert(dO.test === false, "DependencyObservable should override Observable.set");
}

export function test_DependencyObservable_getValue_setValue() {
    var dO = new TestDO();

    // implicitly use ValueSource.Local when not specified
    dO._setValue(testProperty1, 5);
    TKUnit.assert(dO.test1 === 5, "expected true after _setValue.");
    TKUnit.assert(dO._getValueSource(testProperty1) === dependencyObservableModule.ValueSource.Local, "_setValue without third parameter should use ValueSource.Local");

    dO._setValue(testProperty1, 10, dependencyObservableModule.ValueSource.Inherited);
    TKUnit.assert(dO.test1 === 5, "ValueSource.Local should have higher priority than Inherited.");

    // revert to default value
    dO._resetValue(testProperty1);
    TKUnit.assert(dO.test1 === testProperty1.metadata.defaultValue, "_resetValue should revert to metadata.defaultValue");

    // test the ValueSource parameter
    dO._setValue(testProperty1, 10, dependencyObservableModule.ValueSource.Inherited);
    TKUnit.assert(dO.test1 === 10, "_setValue with three parameters not working as expected.");
    TKUnit.assert(dO._getValueSource(testProperty1) === dependencyObservableModule.ValueSource.Inherited, "expected ValueSource.Inherited");

    dO._setValue(testProperty1, 20, dependencyObservableModule.ValueSource.Local);
    TKUnit.assert(dO.test1 === 20, "_setValue with three parameters not working as expected.");
    TKUnit.assert(dO._getValueSource(testProperty1) === dependencyObservableModule.ValueSource.Local, "expected ValueSource.Local");

    // reset the Local value and verify the effectiveValue will be reverted to the Inherited one.
    dO._resetValue(testProperty1, dependencyObservableModule.ValueSource.Local);
    TKUnit.assert(dO.test1 === 10, "_resetValue for ValueSource not working as expected.");
    TKUnit.assert(dO._getValueSource(testProperty1) === dependencyObservableModule.ValueSource.Inherited, "expected ValueSource.Inherited");
}

export function test_PropertyMetadata_onValueChanged_Callback_IsInvoked() {
    currentChangeData = undefined;

    var dO = new TestDO();
    dO.test = true;

    validateDOChangeData(dO, testProperty, false, true);

    currentChangeData = undefined;
    var dO1 = new TestDO();
    dO1.test1 = 10;

    validateDOChangeData(dO1, testProperty1, 0, 10);

    // reset value
    currentChangeData = undefined;
    dO1._resetValue(testProperty1);
    validateDOChangeData(dO1, testProperty1, 10, 0);

    currentChangeData = undefined;
    dO1._setValue(testProperty1, 10, dependencyObservableModule.ValueSource.Inherited);
    validateDOChangeData(dO1, testProperty1, 0, 10);

    currentChangeData = undefined;
    dO1._setValue(testProperty1, 20, dependencyObservableModule.ValueSource.Local);
    validateDOChangeData(dO1, testProperty1, 10, 20);

    currentChangeData = undefined;
    dO1._resetValue(testProperty1, dependencyObservableModule.ValueSource.Local);
    validateDOChangeData(dO1, testProperty1, 20, 10);
}

export function test_Observable_on_propertyChange_IsRaised() {
    var dO1 = new TestDO();

    var changeData: observableModule.PropertyChangeData;
    dO1.on(observableModule.knownEvents.propertyChange, function (data: observableModule.PropertyChangeData) {
        changeData = data;
    });

    dO1.test1 = 10;
    validateChangeData(changeData, dO1, "test1", 10);

    // reset value
    changeData = undefined;
    dO1._resetValue(testProperty1);
    validateChangeData(changeData, dO1, "test1", 0);

    changeData = undefined;
    dO1._setValue(testProperty1, 10, dependencyObservableModule.ValueSource.Inherited);
    validateChangeData(changeData, dO1, "test1", 10);

    changeData = undefined;
    dO1._setValue(testProperty1, 20, dependencyObservableModule.ValueSource.Local);
    validateChangeData(changeData, dO1, "test1", 20);

    changeData = undefined;
    dO1._resetValue(testProperty1, dependencyObservableModule.ValueSource.Local);
    validateChangeData(changeData, dO1, "test1", 10);
}

export function test_setValue_WillThrow_If_ValueIsInvalid() {
    var dO = new TestDO();

    TKUnit.assertThrows(
        () => {
            dO.testWithValidation = -1;
        },
        "Set invalid value should throw",
        "Invalid value -1 for property testWithValidation");

}

export function test_setValue_WillNotThrow_If_ValueIsValid() {
    var dO = new TestDO();
    // This should not throw.
    dO.testWithValidation = 1;
}