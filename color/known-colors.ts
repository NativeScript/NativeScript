export var Transparent = "#00000000";
export var AliceBlue = "#F0F8FF";
export var AntiqueWhite = "#FAEBD7";
export var Aqua = "#00FFFF";
export var Aquamarine = "#7FFFD4";
export var Azure = "#F0FFFF";
export var Beige = "#F5F5DC";
export var Bisque = "#FFE4C4";
export var Black = "#000000";
export var BlanchedAlmond = "#FFEBCD";
export var Blue = "#0000FF";
export var BlueViolet = "#8A2BE2";
export var Brown = "#A52A2A";
export var BurlyWood = "#DEB887";
export var CadetBlue = "#5F9EA0";
export var Chartreuse = "#7FFF00";
export var Chocolate = "#D2691E";
export var Coral = "#FF7F50";
export var CornflowerBlue = "#6495ED";
export var Cornsilk = "#FFF8DC";
export var Crimson = "#DC143C";
export var Cyan = "#00FFFF";
export var DarkBlue = "#00008B";
export var DarkCyan = "#008B8B";
export var DarkGoldenRod = "#B8860B";
export var DarkGray = "#A9A9A9";
export var DarkGreen = "#006400";
export var DarkKhaki = "#BDB76B";
export var DarkMagenta = "#8B008B";
export var DarkOliveGreen = "#556B2F";
export var DarkOrange = "#FF8C00";
export var DarkOrchid = "#9932CC";
export var DarkRed = "#8B0000";
export var DarkSalmon = "#E9967A";
export var DarkSeaGreen = "#8FBC8F";
export var DarkSlateBlue = "#483D8B";
export var DarkSlateGray = "#2F4F4F";
export var DarkTurquoise = "#00CED1";
export var DarkViolet = "#9400D3";
export var DeepPink = "#FF1493";
export var DeepSkyBlue = "#00BFFF";
export var DimGray = "#696969";
export var DodgerBlue = "#1E90FF";
export var FireBrick = "#B22222";
export var FloralWhite = "#FFFAF0";
export var ForestGreen = "#228B22";
export var Fuchsia = "#FF00FF";
export var Gainsboro = "#DCDCDC";
export var GhostWhite = "#F8F8FF";
export var Gold = "#FFD700";
export var GoldenRod = "#DAA520";
export var Gray = "#808080";
export var Green = "#008000";
export var GreenYellow = "#ADFF2F";
export var HoneyDew = "#F0FFF0";
export var HotPink = "#FF69B4";
export var IndianRed = "#CD5C5C";
export var Indigo = "#4B0082";
export var Ivory = "#FFFFF0";
export var Khaki = "#F0E68C";
export var Lavender = "#E6E6FA";
export var LavenderBlush = "#FFF0F5";
export var LawnGreen = "#7CFC00";
export var LemonChiffon = "#FFFACD";
export var LightBlue = "#ADD8E6";
export var LightCoral = "#F08080";
export var LightCyan = "#E0FFFF";
export var LightGoldenRodYellow = "#FAFAD2";
export var LightGray = "#D3D3D3";
export var LightGreen = "#90EE90";
export var LightPink = "#FFB6C1";
export var LightSalmon = "#FFA07A";
export var LightSeaGreen = "#20B2AA";
export var LightSkyBlue = "#87CEFA";
export var LightSlateGray = "#778899";
export var LightSteelBlue = "#B0C4DE";
export var LightYellow = "#FFFFE0";
export var Lime = "#00FF00";
export var LimeGreen = "#32CD32";
export var Linen = "#FAF0E6";
export var Magenta = "#FF00FF";
export var Maroon = "#800000";
export var MediumAquaMarine = "#66CDAA";
export var MediumBlue = "#0000CD";
export var MediumOrchid = "#BA55D3";
export var MediumPurple = "#9370DB";
export var MediumSeaGreen = "#3CB371";
export var MediumSlateBlue = "#7B68EE";
export var MediumSpringGreen = "#00FA9A";
export var MediumTurquoise = "#48D1CC";
export var MediumVioletRed = "#C71585";
export var MidnightBlue = "#191970";
export var MintCream = "#F5FFFA";
export var MistyRose = "#FFE4E1";
export var Moccasin = "#FFE4B5";
export var NavajoWhite = "#FFDEAD";
export var Navy = "#000080";
export var OldLace = "#FDF5E6";
export var Olive = "#808000";
export var OliveDrab = "#6B8E23";
export var Orange = "#FFA500";
export var OrangeRed = "#FF4500";
export var Orchid = "#DA70D6";
export var PaleGoldenRod = "#EEE8AA";
export var PaleGreen = "#98FB98";
export var PaleTurquoise = "#AFEEEE";
export var PaleVioletRed = "#DB7093";
export var PapayaWhip = "#FFEFD5";
export var PeachPuff = "#FFDAB9";
export var Peru = "#CD853F";
export var Pink = "#FFC0CB";
export var Plum = "#DDA0DD";
export var PowderBlue = "#B0E0E6";
export var Purple = "#800080";
export var Red = "#FF0000";
export var RosyBrown = "#BC8F8F";
export var RoyalBlue = "#4169E1";
export var SaddleBrown = "#8B4513";
export var Salmon = "#FA8072";
export var SandyBrown = "#F4A460";
export var SeaGreen = "#2E8B57";
export var SeaShell = "#FFF5EE";
export var Sienna = "#A0522D";
export var Silver = "#C0C0C0";
export var SkyBlue = "#87CEEB";
export var SlateBlue = "#6A5ACD";
export var SlateGray = "#708090";
export var Snow = "#FFFAFA";
export var SpringGreen = "#00FF7F";
export var SteelBlue = "#4682B4";
export var Tan = "#D2B48C";
export var Teal = "#008080";
export var Thistle = "#D8BFD8";
export var Tomato = "#FF6347";
export var Turquoise = "#40E0D0";
export var Violet = "#EE82EE";
export var Wheat = "#F5DEB3";
export var White = "#FFFFFF";
export var WhiteSmoke = "#F5F5F5";
export var Yellow = "#FFFF00";
export var YellowGreen = "#9ACD32";

var _allColors = {};

// populate all the declared colors in the _allColors object with name to lower case for faster lookup.
declare var exports;
(function () {    
    var name: string;
    var underscore = "_";
    for (var p in exports) {
        name = p;
        if (name.charAt(0) !== underscore) {
            _allColors[name.toLowerCase()] = exports[p];
        }
    } 
})();

export function isKnownName(name: string) {
    if (!name) {
        return undefined;
    }

    return name.toLowerCase() in _allColors;
}

export function getKnownColor(name: string): string {
    if (!name) {
        return undefined;
    }

    return _allColors[name.toLowerCase()];
}
