const _allColors = {};
function registerColor(name, value): string {
	_allColors[name.toLowerCase()] = value;

	return value;
}

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

export const Transparent = registerColor('Transparent', '#00000000');
export const AliceBlue = registerColor('AliceBlue', '#F0F8FF');
export const AntiqueWhite = registerColor('AntiqueWhite', '#FAEBD7');
export const Aqua = registerColor('Aqua', '#00FFFF');
export const Aquamarine = registerColor('Aquamarine', '#7FFFD4');
export const Azure = registerColor('Azure', '#F0FFFF');
export const Beige = registerColor('Beige', '#F5F5DC');
export const Bisque = registerColor('Bisque', '#FFE4C4');
export const Black = registerColor('Black', '#000000');
export const BlanchedAlmond = registerColor('BlanchedAlmond', '#FFEBCD');
export const Blue = registerColor('Blue', '#0000FF');
export const BlueViolet = registerColor('BlueViolet', '#8A2BE2');
export const Brown = registerColor('Brown', '#A52A2A');
export const BurlyWood = registerColor('BurlyWood', '#DEB887');
export const CadetBlue = registerColor('CadetBlue', '#5F9EA0');
export const Chartreuse = registerColor('Chartreuse', '#7FFF00');
export const Chocolate = registerColor('Chocolate', '#D2691E');
export const Coral = registerColor('Coral', '#FF7F50');
export const CornflowerBlue = registerColor('CornflowerBlue', '#6495ED');
export const Cornsilk = registerColor('Cornsilk', '#FFF8DC');
export const Crimson = registerColor('Crimson', '#DC143C');
export const Cyan = registerColor('Cyan', '#00FFFF');
export const DarkBlue = registerColor('DarkBlue', '#00008B');
export const DarkCyan = registerColor('DarkCyan', '#008B8B');
export const DarkGoldenRod = registerColor('DarkGoldenRod', '#B8860B');
export const DarkGray = registerColor('DarkGray', '#A9A9A9');
export const DarkGreen = registerColor('DarkGreen', '#006400');
export const DarkKhaki = registerColor('DarkKhaki', '#BDB76B');
export const DarkMagenta = registerColor('DarkMagenta', '#8B008B');
export const DarkOliveGreen = registerColor('DarkOliveGreen', '#556B2F');
export const DarkOrange = registerColor('DarkOrange', '#FF8C00');
export const DarkOrchid = registerColor('DarkOrchid', '#9932CC');
export const DarkRed = registerColor('DarkRed', '#8B0000');
export const DarkSalmon = registerColor('DarkSalmon', '#E9967A');
export const DarkSeaGreen = registerColor('DarkSeaGreen', '#8FBC8F');
export const DarkSlateBlue = registerColor('DarkSlateBlue', '#483D8B');
export const DarkSlateGray = registerColor('DarkSlateGray', '#2F4F4F');
export const DarkTurquoise = registerColor('DarkTurquoise', '#00CED1');
export const DarkViolet = registerColor('DarkViolet', '#9400D3');
export const DeepPink = registerColor('DeepPink', '#FF1493');
export const DeepSkyBlue = registerColor('DeepSkyBlue', '#00BFFF');
export const DimGray = registerColor('DimGray', '#696969');
export const DodgerBlue = registerColor('DodgerBlue', '#1E90FF');
export const FireBrick = registerColor('FireBrick', '#B22222');
export const FloralWhite = registerColor('FloralWhite', '#FFFAF0');
export const ForestGreen = registerColor('ForestGreen', '#228B22');
export const Fuchsia = registerColor('Fuchsia', '#FF00FF');
export const Gainsboro = registerColor('Gainsboro', '#DCDCDC');
export const GhostWhite = registerColor('GhostWhite', '#F8F8FF');
export const Gold = registerColor('Gold', '#FFD700');
export const GoldenRod = registerColor('GoldenRod', '#DAA520');
export const Gray = registerColor('Gray', '#808080');
export const Green = registerColor('Green', '#008000');
export const GreenYellow = registerColor('GreenYellow', '#ADFF2F');
export const HoneyDew = registerColor('HoneyDew', '#F0FFF0');
export const HotPink = registerColor('HotPink', '#FF69B4');
export const IndianRed = registerColor('IndianRed', '#CD5C5C');
export const Indigo = registerColor('Indigo', '#4B0082');
export const Ivory = registerColor('Ivory', '#FFFFF0');
export const Khaki = registerColor('Khaki', '#F0E68C');
export const Lavender = registerColor('Lavender', '#E6E6FA');
export const LavenderBlush = registerColor('LavenderBlush', '#FFF0F5');
export const LawnGreen = registerColor('LawnGreen', '#7CFC00');
export const LemonChiffon = registerColor('LemonChiffon', '#FFFACD');
export const LightBlue = registerColor('LightBlue', '#ADD8E6');
export const LightCoral = registerColor('LightCoral', '#F08080');
export const LightCyan = registerColor('LightCyan', '#E0FFFF');
export const LightGoldenRodYellow = registerColor('LightGoldenRodYellow', '#FAFAD2');
export const LightGray = registerColor('LightGray', '#D3D3D3');
export const LightGreen = registerColor('LightGreen', '#90EE90');
export const LightPink = registerColor('LightPink', '#FFB6C1');
export const LightSalmon = registerColor('LightSalmon', '#FFA07A');
export const LightSeaGreen = registerColor('LightSeaGreen', '#20B2AA');
export const LightSkyBlue = registerColor('LightSkyBlue', '#87CEFA');
export const LightSlateGray = registerColor('LightSlateGray', '#778899');
export const LightSteelBlue = registerColor('LightSteelBlue', '#B0C4DE');
export const LightYellow = registerColor('LightYellow', '#FFFFE0');
export const Lime = registerColor('Lime', '#00FF00');
export const LimeGreen = registerColor('LimeGreen', '#32CD32');
export const Linen = registerColor('Linen', '#FAF0E6');
export const Magenta = registerColor('Magenta', '#FF00FF');
export const Maroon = registerColor('Maroon', '#800000');
export const MediumAquaMarine = registerColor('MediumAquaMarine', '#66CDAA');
export const MediumBlue = registerColor('MediumBlue', '#0000CD');
export const MediumOrchid = registerColor('MediumOrchid', '#BA55D3');
export const MediumPurple = registerColor('MediumPurple', '#9370DB');
export const MediumSeaGreen = registerColor('MediumSeaGreen', '#3CB371');
export const MediumSlateBlue = registerColor('MediumSlateBlue', '#7B68EE');
export const MediumSpringGreen = registerColor('MediumSpringGreen', '#00FA9A');
export const MediumTurquoise = registerColor('MediumTurquoise', '#48D1CC');
export const MediumVioletRed = registerColor('MediumVioletRed', '#C71585');
export const MidnightBlue = registerColor('MidnightBlue', '#191970');
export const MintCream = registerColor('MintCream', '#F5FFFA');
export const MistyRose = registerColor('MistyRose', '#FFE4E1');
export const Moccasin = registerColor('Moccasin', '#FFE4B5');
export const NavajoWhite = registerColor('NavajoWhite', '#FFDEAD');
export const Navy = registerColor('Navy', '#000080');
export const OldLace = registerColor('OldLace', '#FDF5E6');
export const Olive = registerColor('Olive', '#808000');
export const OliveDrab = registerColor('OliveDrab', '#6B8E23');
export const Orange = registerColor('Orange', '#FFA500');
export const OrangeRed = registerColor('OrangeRed', '#FF4500');
export const Orchid = registerColor('Orchid', '#DA70D6');
export const PaleGoldenRod = registerColor('PaleGoldenRod', '#EEE8AA');
export const PaleGreen = registerColor('PaleGreen', '#98FB98');
export const PaleTurquoise = registerColor('PaleTurquoise', '#AFEEEE');
export const PaleVioletRed = registerColor('PaleVioletRed', '#DB7093');
export const PapayaWhip = registerColor('PapayaWhip', '#FFEFD5');
export const PeachPuff = registerColor('PeachPuff', '#FFDAB9');
export const Peru = registerColor('Peru', '#CD853F');
export const Pink = registerColor('Pink', '#FFC0CB');
export const Plum = registerColor('Plum', '#DDA0DD');
export const PowderBlue = registerColor('PowderBlue', '#B0E0E6');
export const Purple = registerColor('Purple', '#800080');
export const RebeccaPurple = registerColor('RebeccaPurple', '#663399');
export const Red = registerColor('Red', '#FF0000');
export const RosyBrown = registerColor('RosyBrown', '#BC8F8F');
export const RoyalBlue = registerColor('RoyalBlue', '#4169E1');
export const SaddleBrown = registerColor('SaddleBrown', '#8B4513');
export const Salmon = registerColor('Salmon', '#FA8072');
export const SandyBrown = registerColor('SandyBrown', '#F4A460');
export const SeaGreen = registerColor('SeaGreen', '#2E8B57');
export const SeaShell = registerColor('SeaShell', '#FFF5EE');
export const Sienna = registerColor('Sienna', '#A0522D');
export const Silver = registerColor('Silver', '#C0C0C0');
export const SkyBlue = registerColor('SkyBlue', '#87CEEB');
export const SlateBlue = registerColor('SlateBlue', '#6A5ACD');
export const SlateGray = registerColor('SlateGray', '#708090');
export const Snow = registerColor('Snow', '#FFFAFA');
export const SpringGreen = registerColor('SpringGreen', '#00FF7F');
export const SteelBlue = registerColor('SteelBlue', '#4682B4');
export const Tan = registerColor('Tan', '#D2B48C');
export const Teal = registerColor('Teal', '#008080');
export const Thistle = registerColor('Thistle', '#D8BFD8');
export const Tomato = registerColor('Tomato', '#FF6347');
export const Turquoise = registerColor('Turquoise', '#40E0D0');
export const Violet = registerColor('Violet', '#EE82EE');
export const Wheat = registerColor('Wheat', '#F5DEB3');
export const White = registerColor('White', '#FFFFFF');
export const WhiteSmoke = registerColor('WhiteSmoke', '#F5F5F5');
export const Yellow = registerColor('Yellow', '#FFFF00');
export const YellowGreen = registerColor('YellowGreen', '#9ACD32');
