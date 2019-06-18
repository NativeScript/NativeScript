export const Transparent = "#00000000";
export const AliceBlue = "#F0F8FF";
export const AntiqueWhite = "#FAEBD7";
export const Aqua = "#00FFFF";
export const Aquamarine = "#7FFFD4";
export const Azure = "#F0FFFF";
export const Beige = "#F5F5DC";
export const Bisque = "#FFE4C4";
export const Black = "#000000";
export const BlanchedAlmond = "#FFEBCD";
export const Blue = "#0000FF";
export const BlueViolet = "#8A2BE2";
export const Brown = "#A52A2A";
export const BurlyWood = "#DEB887";
export const CadetBlue = "#5F9EA0";
export const Chartreuse = "#7FFF00";
export const Chocolate = "#D2691E";
export const Coral = "#FF7F50";
export const CornflowerBlue = "#6495ED";
export const Cornsilk = "#FFF8DC";
export const Crimson = "#DC143C";
export const Cyan = "#00FFFF";
export const DarkBlue = "#00008B";
export const DarkCyan = "#008B8B";
export const DarkGoldenRod = "#B8860B";
export const DarkGray = "#A9A9A9";
export const DarkGreen = "#006400";
export const DarkKhaki = "#BDB76B";
export const DarkMagenta = "#8B008B";
export const DarkOliveGreen = "#556B2F";
export const DarkOrange = "#FF8C00";
export const DarkOrchid = "#9932CC";
export const DarkRed = "#8B0000";
export const DarkSalmon = "#E9967A";
export const DarkSeaGreen = "#8FBC8F";
export const DarkSlateBlue = "#483D8B";
export const DarkSlateGray = "#2F4F4F";
export const DarkTurquoise = "#00CED1";
export const DarkViolet = "#9400D3";
export const DeepPink = "#FF1493";
export const DeepSkyBlue = "#00BFFF";
export const DimGray = "#696969";
export const DodgerBlue = "#1E90FF";
export const FireBrick = "#B22222";
export const FloralWhite = "#FFFAF0";
export const ForestGreen = "#228B22";
export const Fuchsia = "#FF00FF";
export const Gainsboro = "#DCDCDC";
export const GhostWhite = "#F8F8FF";
export const Gold = "#FFD700";
export const GoldenRod = "#DAA520";
export const Gray = "#808080";
export const Green = "#008000";
export const GreenYellow = "#ADFF2F";
export const HoneyDew = "#F0FFF0";
export const HotPink = "#FF69B4";
export const IndianRed = "#CD5C5C";
export const Indigo = "#4B0082";
export const Ivory = "#FFFFF0";
export const Khaki = "#F0E68C";
export const Lavender = "#E6E6FA";
export const LavenderBlush = "#FFF0F5";
export const LawnGreen = "#7CFC00";
export const LemonChiffon = "#FFFACD";
export const LightBlue = "#ADD8E6";
export const LightCoral = "#F08080";
export const LightCyan = "#E0FFFF";
export const LightGoldenRodYellow = "#FAFAD2";
export const LightGray = "#D3D3D3";
export const LightGreen = "#90EE90";
export const LightPink = "#FFB6C1";
export const LightSalmon = "#FFA07A";
export const LightSeaGreen = "#20B2AA";
export const LightSkyBlue = "#87CEFA";
export const LightSlateGray = "#778899";
export const LightSteelBlue = "#B0C4DE";
export const LightYellow = "#FFFFE0";
export const Lime = "#00FF00";
export const LimeGreen = "#32CD32";
export const Linen = "#FAF0E6";
export const Magenta = "#FF00FF";
export const Maroon = "#800000";
export const MediumAquaMarine = "#66CDAA";
export const MediumBlue = "#0000CD";
export const MediumOrchid = "#BA55D3";
export const MediumPurple = "#9370DB";
export const MediumSeaGreen = "#3CB371";
export const MediumSlateBlue = "#7B68EE";
export const MediumSpringGreen = "#00FA9A";
export const MediumTurquoise = "#48D1CC";
export const MediumVioletRed = "#C71585";
export const MidnightBlue = "#191970";
export const MintCream = "#F5FFFA";
export const MistyRose = "#FFE4E1";
export const Moccasin = "#FFE4B5";
export const NavajoWhite = "#FFDEAD";
export const Navy = "#000080";
export const OldLace = "#FDF5E6";
export const Olive = "#808000";
export const OliveDrab = "#6B8E23";
export const Orange = "#FFA500";
export const OrangeRed = "#FF4500";
export const Orchid = "#DA70D6";
export const PaleGoldenRod = "#EEE8AA";
export const PaleGreen = "#98FB98";
export const PaleTurquoise = "#AFEEEE";
export const PaleVioletRed = "#DB7093";
export const PapayaWhip = "#FFEFD5";
export const PeachPuff = "#FFDAB9";
export const Peru = "#CD853F";
export const Pink = "#FFC0CB";
export const Plum = "#DDA0DD";
export const PowderBlue = "#B0E0E6";
export const Purple = "#800080";
export const RebeccaPurple = "#663399";
export const Red = "#FF0000";
export const RosyBrown = "#BC8F8F";
export const RoyalBlue = "#4169E1";
export const SaddleBrown = "#8B4513";
export const Salmon = "#FA8072";
export const SandyBrown = "#F4A460";
export const SeaGreen = "#2E8B57";
export const SeaShell = "#FFF5EE";
export const Sienna = "#A0522D";
export const Silver = "#C0C0C0";
export const SkyBlue = "#87CEEB";
export const SlateBlue = "#6A5ACD";
export const SlateGray = "#708090";
export const Snow = "#FFFAFA";
export const SpringGreen = "#00FF7F";
export const SteelBlue = "#4682B4";
export const Tan = "#D2B48C";
export const Teal = "#008080";
export const Thistle = "#D8BFD8";
export const Tomato = "#FF6347";
export const Turquoise = "#40E0D0";
export const Violet = "#EE82EE";
export const Wheat = "#F5DEB3";
export const White = "#FFFFFF";
export const WhiteSmoke = "#F5F5F5";
export const Yellow = "#FFFF00";
export const YellowGreen = "#9ACD32";

declare var exports;

const _allColors = {};

// populate all the declared colors in the _allColors object with name to lower case for faster lookup.
(function () {    
    let name: string;
    const underscore = "_";
    for (let p in exports) {
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
