import styleModule = require("ui/styling/style");
import stylePropertyModule = require("ui/styling/style-property");
import stylersCommonModule = require("ui/styling/stylers-common");
import visualStateConstatnsModule = require("ui/styling/visual-state-constants");
import convertersModule = require("ui/styling/converters");

// Exports form style-property module.
export var Property = stylePropertyModule.Property;

// Exports form style module
export var Style = styleModule.Style;

export module properties {
    export var fontSizeProperty = styleModule.fontSizeProperty;
    export var colorProperty = styleModule.colorProperty;
    export var backgroundColorProperty = styleModule.backgroundColorProperty;
    export var textAlignmentProperty = styleModule.textAlignmentProperty;

    export var getPropertyByName = stylePropertyModule.getPropertyByName;
    export var getPropertyByCssName = stylePropertyModule.getPropertyByCssName;
    export var eachProperty = stylePropertyModule.eachProperty;
    export var eachInheritableProperty = stylePropertyModule.eachInheritableProperty;
};

// Exports form style converters module
export module converters {
    export var colorConverter = convertersModule.colorConverter;
    export var fontSizeConverter = convertersModule.fontSizeConverter;
    export var textAlignConverter = convertersModule.textAlignConverter;
    export var numberConverter = convertersModule.numberConverter; 
    export var visibilityConverter = convertersModule.visibilityConverter; 

};

// Exports form visual states module
export module visualStates {
    export var Normal = visualStateConstatnsModule.Normal;
    export var Hovered = visualStateConstatnsModule.Hovered;
    export var Pressed = visualStateConstatnsModule.Pressed; 
};

export module stylers {
    export var StylePropertyChangedHandler = stylersCommonModule.StylePropertyChangedHandler;
    export var registerHandler = styleModule.registerHandler;
}