const _allColors:{[k:string]:number} = {};
function registerColor(name: string | string[], value: number): number {
	if (Array.isArray(name)) {
		name.forEach(n=>_allColors[n.toLowerCase()] = value)
	} else {
		_allColors[name.toLowerCase()] = value;
	}

	return value;
}

export function isKnownName(name: string) {
	if (!name) {
		return undefined;
	}

	return name.toLowerCase() in _allColors;
}

export function getKnownColor(name: string): number {
	if (!name) {
		return undefined;
	}

	return _allColors[name.toLowerCase()];
}

export const Transparent = registerColor('Transparent', 0x00000000);
export const AliceBlue = registerColor('AliceBlue', 0xffF0F8FF);
export const AntiqueWhite = registerColor('AntiqueWhite', 0xffFAEBD7);
export const Aqua = registerColor('Aqua', 0xff00FFFF);
export const Aquamarine = registerColor('Aquamarine', 0xff7FFFD4);
export const Azure = registerColor('Azure', 0xffF0FFFF);
export const Beige = registerColor('Beige', 0xffF5F5DC);
export const Bisque = registerColor('Bisque', 0xffFFE4C4);
export const Black = registerColor('Black', 0xff000000);
export const BlanchedAlmond = registerColor('BlanchedAlmond', 0xffFFEBCD);
export const Blue = registerColor('Blue', 0xff0000FF);
export const BlueViolet = registerColor('BlueViolet', 0xff8A2BE2);
export const Brown = registerColor('Brown', 0xffA52A2A);
export const BurlyWood = registerColor('BurlyWood', 0xffDEB887);
export const CadetBlue = registerColor('CadetBlue', 0xff5F9EA0);
export const Chartreuse = registerColor('Chartreuse', 0xff7FFF00);
export const Chocolate = registerColor('Chocolate', 0xffD2691E);
export const Coral = registerColor('Coral', 0xffFF7F50);
export const CornflowerBlue = registerColor('CornflowerBlue', 0xff6495ED);
export const Cornsilk = registerColor('Cornsilk', 0xffFFF8DC);
export const Crimson = registerColor('Crimson', 0xffDC143C);
export const Cyan = registerColor('Cyan', 0xff00FFFF);
export const DarkBlue = registerColor('DarkBlue', 0xff00008B);
export const DarkCyan = registerColor('DarkCyan', 0xff008B8B);
export const DarkGoldenRod = registerColor('DarkGoldenRod', 0xffB8860B);
export const DarkGray = registerColor(['DarkGray', 'DarkGrey'], 0xffA9A9A9);
export const DarkGreen = registerColor('DarkGreen', 0xff006400);
export const DarkKhaki = registerColor('DarkKhaki', 0xffBDB76B);
export const DarkMagenta = registerColor('DarkMagenta', 0xff8B008B);
export const DarkOliveGreen = registerColor('DarkOliveGreen', 0xff556B2F);
export const DarkOrange = registerColor('DarkOrange', 0xffFF8C00);
export const DarkOrchid = registerColor('DarkOrchid', 0xff9932CC);
export const DarkRed = registerColor('DarkRed', 0xff8B0000);
export const DarkSalmon = registerColor('DarkSalmon', 0xffE9967A);
export const DarkSeaGreen = registerColor('DarkSeaGreen', 0xff8FBC8F);
export const DarkSlateBlue = registerColor('DarkSlateBlue', 0xff483D8B);
export const DarkSlateGray = registerColor(['DarkSlateGray', 'DarkSlateGrey'], 0xff2F4F4F);
export const DarkTurquoise = registerColor('DarkTurquoise', 0xff00CED1);
export const DarkViolet = registerColor('DarkViolet', 0xff9400D3);
export const DeepPink = registerColor('DeepPink', 0xffFF1493);
export const DeepSkyBlue = registerColor('DeepSkyBlue', 0xff00BFFF);
export const DimGray = registerColor(['DimGray', 'DimGrey'], 0xff696969);
export const DodgerBlue = registerColor('DodgerBlue', 0xff1E90FF);
export const FireBrick = registerColor('FireBrick', 0xffB22222);
export const FloralWhite = registerColor('FloralWhite', 0xffFFFAF0);
export const ForestGreen = registerColor('ForestGreen', 0xff228B22);
export const Fuchsia = registerColor('Fuchsia', 0xffFF00FF);
export const Gainsboro = registerColor('Gainsboro', 0xffDCDCDC);
export const GhostWhite = registerColor('GhostWhite', 0xffF8F8FF);
export const Gold = registerColor('Gold', 0xffFFD700);
export const GoldenRod = registerColor('GoldenRod', 0xffDAA520);
export const Gray = registerColor(['Gray', 'Grey'], 0xff808080);
export const Green = registerColor('Green', 0xff008000);
export const GreenYellow = registerColor('GreenYellow', 0xffADFF2F);
export const HoneyDew = registerColor('HoneyDew', 0xffF0FFF0);
export const HotPink = registerColor('HotPink', 0xffFF69B4);
export const IndianRed = registerColor('IndianRed', 0xffCD5C5C);
export const Indigo = registerColor('Indigo', 0xff4B0082);
export const Ivory = registerColor('Ivory', 0xffFFFFF0);
export const Khaki = registerColor('Khaki', 0xffF0E68C);
export const Lavender = registerColor('Lavender', 0xffE6E6FA);
export const LavenderBlush = registerColor('LavenderBlush', 0xffFFF0F5);
export const LawnGreen = registerColor('LawnGreen', 0xff7CFC00);
export const LemonChiffon = registerColor('LemonChiffon', 0xffFFFACD);
export const LightBlue = registerColor('LightBlue', 0xffADD8E6);
export const LightCoral = registerColor('LightCoral', 0xffF08080);
export const LightCyan = registerColor('LightCyan', 0xffE0FFFF);
export const LightGoldenRodYellow = registerColor('LightGoldenRodYellow', 0xffFAFAD2);
export const LightGray = registerColor(['LightGray', 'LightGrey'], 0xffD3D3D3);
export const LightGreen = registerColor('LightGreen', 0xff90EE90);
export const LightPink = registerColor('LightPink', 0xffFFB6C1);
export const LightSalmon = registerColor('LightSalmon', 0xffFFA07A);
export const LightSeaGreen = registerColor('LightSeaGreen', 0xff20B2AA);
export const LightSkyBlue = registerColor('LightSkyBlue', 0xff87CEFA);
export const LightSlateGray = registerColor(['LightSlateGray', 'LightSlateGrey'], 0xff778899);
export const LightSteelBlue = registerColor('LightSteelBlue', 0xffB0C4DE);
export const LightYellow = registerColor('LightYellow', 0xffFFFFE0);
export const Lime = registerColor('Lime', 0xff00FF00);
export const LimeGreen = registerColor('LimeGreen', 0xff32CD32);
export const Linen = registerColor('Linen', 0xffFAF0E6);
export const Magenta = registerColor('Magenta', 0xffFF00FF);
export const Maroon = registerColor('Maroon', 0xff800000);
export const MediumAquaMarine = registerColor('MediumAquaMarine', 0xff66CDAA);
export const MediumBlue = registerColor('MediumBlue', 0xff0000CD);
export const MediumOrchid = registerColor('MediumOrchid', 0xffBA55D3);
export const MediumPurple = registerColor('MediumPurple', 0xff9370DB);
export const MediumSeaGreen = registerColor('MediumSeaGreen', 0xff3CB371);
export const MediumSlateBlue = registerColor('MediumSlateBlue', 0xff7B68EE);
export const MediumSpringGreen = registerColor('MediumSpringGreen', 0xff00FA9A);
export const MediumTurquoise = registerColor('MediumTurquoise', 0xff48D1CC);
export const MediumVioletRed = registerColor('MediumVioletRed', 0xffC71585);
export const MidnightBlue = registerColor('MidnightBlue', 0xff191970);
export const MintCream = registerColor('MintCream', 0xffF5FFFA);
export const MistyRose = registerColor('MistyRose', 0xffFFE4E1);
export const Moccasin = registerColor('Moccasin', 0xffFFE4B5);
export const NavajoWhite = registerColor('NavajoWhite', 0xffFFDEAD);
export const Navy = registerColor('Navy', 0xff000080);
export const OldLace = registerColor('OldLace', 0xffFDF5E6);
export const Olive = registerColor('Olive', 0xff808000);
export const OliveDrab = registerColor('OliveDrab', 0xff6B8E23);
export const Orange = registerColor('Orange', 0xffFFA500);
export const OrangeRed = registerColor('OrangeRed', 0xffFF4500);
export const Orchid = registerColor('Orchid', 0xffDA70D6);
export const PaleGoldenRod = registerColor('PaleGoldenRod', 0xffEEE8AA);
export const PaleGreen = registerColor('PaleGreen', 0xff98FB98);
export const PaleTurquoise = registerColor('PaleTurquoise', 0xffAFEEEE);
export const PaleVioletRed = registerColor('PaleVioletRed', 0xffDB7093);
export const PapayaWhip = registerColor('PapayaWhip', 0xffFFEFD5);
export const PeachPuff = registerColor('PeachPuff', 0xffFFDAB9);
export const Peru = registerColor('Peru', 0xffCD853F);
export const Pink = registerColor('Pink', 0xffFFC0CB);
export const Plum = registerColor('Plum', 0xffDDA0DD);
export const PowderBlue = registerColor('PowderBlue', 0xffB0E0E6);
export const Purple = registerColor('Purple', 0xff800080);
export const RebeccaPurple = registerColor('RebeccaPurple', 0xff663399);
export const Red = registerColor('Red', 0xffFF0000);
export const RosyBrown = registerColor('RosyBrown', 0xffBC8F8F);
export const RoyalBlue = registerColor('RoyalBlue', 0xff4169E1);
export const SaddleBrown = registerColor('SaddleBrown', 0xff8B4513);
export const Salmon = registerColor('Salmon', 0xffFA8072);
export const SandyBrown = registerColor('SandyBrown', 0xffF4A460);
export const SeaGreen = registerColor('SeaGreen', 0xff2E8B57);
export const SeaShell = registerColor('SeaShell', 0xffFFF5EE);
export const Sienna = registerColor('Sienna', 0xffA0522D);
export const Silver = registerColor('Silver', 0xffC0C0C0);
export const SkyBlue = registerColor('SkyBlue', 0xff87CEEB);
export const SlateBlue = registerColor('SlateBlue', 0xff6A5ACD);
export const SlateGray = registerColor(['SlateGray', 'SlateGrey'], 0xff708090);
export const Snow = registerColor('Snow', 0xffFFFAFA);
export const SpringGreen = registerColor('SpringGreen', 0xff00FF7F);
export const SteelBlue = registerColor('SteelBlue', 0xff4682B4);
export const Tan = registerColor('Tan', 0xffD2B48C);
export const Teal = registerColor('Teal', 0xff008080);
export const Thistle = registerColor('Thistle', 0xffD8BFD8);
export const Tomato = registerColor('Tomato', 0xffFF6347);
export const Turquoise = registerColor('Turquoise', 0xff40E0D0);
export const Violet = registerColor('Violet', 0xffEE82EE);
export const Wheat = registerColor('Wheat', 0xffF5DEB3);
export const White = registerColor('White', 0xffFFFFFF);
export const WhiteSmoke = registerColor('WhiteSmoke', 0xffF5F5F5);
export const Yellow = registerColor('Yellow', 0xffFFFF00);
export const YellowGreen = registerColor('YellowGreen', 0xff9ACD32);
