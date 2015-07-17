export module KeyboardType {
    export var datetime = "datetime";
    export var phone = "phone";
    export var number = "number";
    export var url = "url";
    export var email = "email";
}

export module ReturnKeyType {
    export var done = "done";
    export var next = "next";
    export var go = "go";
    export var search = "search";
    export var send = "send";
}

export module TextAlignment {
    export var left = "left";
    export var center = "center";
    export var right = "right";
}

export module Orientation {
    export var horizontal = "horizontal";
    export var vertical = "vertical";
}

export module HorizontalAlignment {
    export var left = "left";
    export var center = "center";
    export var right = "right";
    export var stretch = "stretch";
}

export module VerticalAlignment {
    export var top = "top";
    export var center = "center";
    export var bottom = "bottom";
    export var stretch = "stretch";
}

export module Stretch {
    export var none: string = "none";
    export var aspectFill: string = "aspectFill";
    export var aspectFit: string = "aspectFit";
    export var fill: string = "fill";
}

export module Visibility {
    export var visible: string = "visible";
    export var collapse: string = "collapse";
    export var collapsed: string = "collapsed";
}

export module FontAttributes {
    export var Normal = 0;
    export var Bold = 1;
    export var Italic = 1 << 1;
}

export module DeviceType {
    export var Phone: string = "Phone";
    export var Tablet: string = "Tablet";
}

export module UpdateTextTrigger {
    export var focusLost: string = "focusLost";
    export var textChanged: string = "textChanged";
}

export module Accuracy {
    export var any: number = 300;
    export var high: number = 3;
}

export module Dock {
    export var left: string = "left";
    export var top: string = "top";
    export var right: string = "right";
    export var bottom: string = "bottom";
}

export module AutocapitalizationType {
    export var none: string = "none";
    export var words: string = "words";
    export var sentences: string = "sentences";
    export var allCharacters: string = "allCharacters";
}

export module NavigationBarVisibility {
    export var auto: string = "auto";
    export var never: string = "never";
    export var always: string = "always";
}

export module AndroidActionBarIconVisibility {
    export var auto: string = "auto";
    export var never: string = "never";
    export var always: string = "always";
}

export module AndroidActionItemPosition {
    export var actionBar: string = "actionBar";
    export var actionBarIfRoom: string = "actionBarIfRoom";
    export var popup: string = "popup";
}

export module IOSActionItemPosition {
    export var left: string = "left";
    export var right: string = "right";
}

export module ImageFormat {
    export var png: string = "png";
    export var jpeg: string = "jpeg";
}

export module FontStyle {
    export var normal: string = "normal";
    export var italic: string = "italic";
}

export module FontWeight {
    export var normal: string = "normal";
    export var bold: string = "bold";
}

export module BackgroundRepeat {
    export var repeat: string = "repeat";
    export var repeatX: string = "repeat-x";
    export var repeatY: string = "repeat-y";
    export var noRepeat: string = "no-repeat";
}
