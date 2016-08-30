import styleModule = require("./style");
import stylePropertyModule = require("./style-property");
import convertersModule = require("./converters");

// Exports form style-property module.
export var Property = stylePropertyModule.Property;

// Exports form style module
export var Style = styleModule.Style;

export module properties {
    export var fontSizeProperty = styleModule.fontSizeProperty;
    export var colorProperty = styleModule.colorProperty;
    export var placeholderColorProperty = styleModule.placeholderColorProperty;
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
