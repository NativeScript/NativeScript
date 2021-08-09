const _allColors: { [k: string]: number } = {};
function registerColor(name: string | string[], value: number): number {
	if (Array.isArray(name)) {
		name.forEach((n) => (_allColors[n.toLowerCase()] = value));
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
export const AliceBlue = registerColor('AliceBlue', 0xfff0f8ff);
export const AntiqueWhite = registerColor('AntiqueWhite', 0xfffaebd7);
export const Aqua = registerColor('Aqua', 0xff00ffff);
export const Aquamarine = registerColor('Aquamarine', 0xff7fffd4);
export const Azure = registerColor('Azure', 0xfff0ffff);
export const Beige = registerColor('Beige', 0xfff5f5dc);
export const Bisque = registerColor('Bisque', 0xffffe4c4);
export const Black = registerColor('Black', 0xff000000);
export const BlanchedAlmond = registerColor('BlanchedAlmond', 0xffffebcd);
export const Blue = registerColor('Blue', 0xff0000ff);
export const BlueViolet = registerColor('BlueViolet', 0xff8a2be2);
export const Brown = registerColor('Brown', 0xffa52a2a);
export const BurlyWood = registerColor('BurlyWood', 0xffdeb887);
export const CadetBlue = registerColor('CadetBlue', 0xff5f9ea0);
export const Chartreuse = registerColor('Chartreuse', 0xff7fff00);
export const Chocolate = registerColor('Chocolate', 0xffd2691e);
export const Coral = registerColor('Coral', 0xffff7f50);
export const CornflowerBlue = registerColor('CornflowerBlue', 0xff6495ed);
export const Cornsilk = registerColor('Cornsilk', 0xfffff8dc);
export const Crimson = registerColor('Crimson', 0xffdc143c);
export const Cyan = registerColor('Cyan', 0xff00ffff);
export const DarkBlue = registerColor('DarkBlue', 0xff00008b);
export const DarkCyan = registerColor('DarkCyan', 0xff008b8b);
export const DarkGoldenRod = registerColor('DarkGoldenRod', 0xffb8860b);
export const DarkGray = registerColor(['DarkGray', 'DarkGrey'], 0xffa9a9a9);
export const DarkGreen = registerColor('DarkGreen', 0xff006400);
export const DarkKhaki = registerColor('DarkKhaki', 0xffbdb76b);
export const DarkMagenta = registerColor('DarkMagenta', 0xff8b008b);
export const DarkOliveGreen = registerColor('DarkOliveGreen', 0xff556b2f);
export const DarkOrange = registerColor('DarkOrange', 0xffff8c00);
export const DarkOrchid = registerColor('DarkOrchid', 0xff9932cc);
export const DarkRed = registerColor('DarkRed', 0xff8b0000);
export const DarkSalmon = registerColor('DarkSalmon', 0xffe9967a);
export const DarkSeaGreen = registerColor('DarkSeaGreen', 0xff8fbc8f);
export const DarkSlateBlue = registerColor('DarkSlateBlue', 0xff483d8b);
export const DarkSlateGray = registerColor(['DarkSlateGray', 'DarkSlateGrey'], 0xff2f4f4f);
export const DarkTurquoise = registerColor('DarkTurquoise', 0xff00ced1);
export const DarkViolet = registerColor('DarkViolet', 0xff9400d3);
export const DeepPink = registerColor('DeepPink', 0xffff1493);
export const DeepSkyBlue = registerColor('DeepSkyBlue', 0xff00bfff);
export const DimGray = registerColor(['DimGray', 'DimGrey'], 0xff696969);
export const DodgerBlue = registerColor('DodgerBlue', 0xff1e90ff);
export const FireBrick = registerColor('FireBrick', 0xffb22222);
export const FloralWhite = registerColor('FloralWhite', 0xfffffaf0);
export const ForestGreen = registerColor('ForestGreen', 0xff228b22);
export const Fuchsia = registerColor('Fuchsia', 0xffff00ff);
export const Gainsboro = registerColor('Gainsboro', 0xffdcdcdc);
export const GhostWhite = registerColor('GhostWhite', 0xfff8f8ff);
export const Gold = registerColor('Gold', 0xffffd700);
export const GoldenRod = registerColor('GoldenRod', 0xffdaa520);
export const Gray = registerColor(['Gray', 'Grey'], 0xff808080);
export const Green = registerColor('Green', 0xff008000);
export const GreenYellow = registerColor('GreenYellow', 0xffadff2f);
export const HoneyDew = registerColor('HoneyDew', 0xfff0fff0);
export const HotPink = registerColor('HotPink', 0xffff69b4);
export const IndianRed = registerColor('IndianRed', 0xffcd5c5c);
export const Indigo = registerColor('Indigo', 0xff4b0082);
export const Ivory = registerColor('Ivory', 0xfffffff0);
export const Khaki = registerColor('Khaki', 0xfff0e68c);
export const Lavender = registerColor('Lavender', 0xffe6e6fa);
export const LavenderBlush = registerColor('LavenderBlush', 0xfffff0f5);
export const LawnGreen = registerColor('LawnGreen', 0xff7cfc00);
export const LemonChiffon = registerColor('LemonChiffon', 0xfffffacd);
export const LightBlue = registerColor('LightBlue', 0xffadd8e6);
export const LightCoral = registerColor('LightCoral', 0xfff08080);
export const LightCyan = registerColor('LightCyan', 0xffe0ffff);
export const LightGoldenRodYellow = registerColor('LightGoldenRodYellow', 0xfffafad2);
export const LightGray = registerColor(['LightGray', 'LightGrey'], 0xffd3d3d3);
export const LightGreen = registerColor('LightGreen', 0xff90ee90);
export const LightPink = registerColor('LightPink', 0xffffb6c1);
export const LightSalmon = registerColor('LightSalmon', 0xffffa07a);
export const LightSeaGreen = registerColor('LightSeaGreen', 0xff20b2aa);
export const LightSkyBlue = registerColor('LightSkyBlue', 0xff87cefa);
export const LightSlateGray = registerColor(['LightSlateGray', 'LightSlateGrey'], 0xff778899);
export const LightSteelBlue = registerColor('LightSteelBlue', 0xffb0c4de);
export const LightYellow = registerColor('LightYellow', 0xffffffe0);
export const Lime = registerColor('Lime', 0xff00ff00);
export const LimeGreen = registerColor('LimeGreen', 0xff32cd32);
export const Linen = registerColor('Linen', 0xfffaf0e6);
export const Magenta = registerColor('Magenta', 0xffff00ff);
export const Maroon = registerColor('Maroon', 0xff800000);
export const MediumAquaMarine = registerColor('MediumAquaMarine', 0xff66cdaa);
export const MediumBlue = registerColor('MediumBlue', 0xff0000cd);
export const MediumOrchid = registerColor('MediumOrchid', 0xffba55d3);
export const MediumPurple = registerColor('MediumPurple', 0xff9370db);
export const MediumSeaGreen = registerColor('MediumSeaGreen', 0xff3cb371);
export const MediumSlateBlue = registerColor('MediumSlateBlue', 0xff7b68ee);
export const MediumSpringGreen = registerColor('MediumSpringGreen', 0xff00fa9a);
export const MediumTurquoise = registerColor('MediumTurquoise', 0xff48d1cc);
export const MediumVioletRed = registerColor('MediumVioletRed', 0xffc71585);
export const MidnightBlue = registerColor('MidnightBlue', 0xff191970);
export const MintCream = registerColor('MintCream', 0xfff5fffa);
export const MistyRose = registerColor('MistyRose', 0xffffe4e1);
export const Moccasin = registerColor('Moccasin', 0xffffe4b5);
export const NavajoWhite = registerColor('NavajoWhite', 0xffffdead);
export const Navy = registerColor('Navy', 0xff000080);
export const OldLace = registerColor('OldLace', 0xfffdf5e6);
export const Olive = registerColor('Olive', 0xff808000);
export const OliveDrab = registerColor('OliveDrab', 0xff6b8e23);
export const Orange = registerColor('Orange', 0xffffa500);
export const OrangeRed = registerColor('OrangeRed', 0xffff4500);
export const Orchid = registerColor('Orchid', 0xffda70d6);
export const PaleGoldenRod = registerColor('PaleGoldenRod', 0xffeee8aa);
export const PaleGreen = registerColor('PaleGreen', 0xff98fb98);
export const PaleTurquoise = registerColor('PaleTurquoise', 0xffafeeee);
export const PaleVioletRed = registerColor('PaleVioletRed', 0xffdb7093);
export const PapayaWhip = registerColor('PapayaWhip', 0xffffefd5);
export const PeachPuff = registerColor('PeachPuff', 0xffffdab9);
export const Peru = registerColor('Peru', 0xffcd853f);
export const Pink = registerColor('Pink', 0xffffc0cb);
export const Plum = registerColor('Plum', 0xffdda0dd);
export const PowderBlue = registerColor('PowderBlue', 0xffb0e0e6);
export const Purple = registerColor('Purple', 0xff800080);
export const RebeccaPurple = registerColor('RebeccaPurple', 0xff663399);
export const Red = registerColor('Red', 0xffff0000);
export const RosyBrown = registerColor('RosyBrown', 0xffbc8f8f);
export const RoyalBlue = registerColor('RoyalBlue', 0xff4169e1);
export const SaddleBrown = registerColor('SaddleBrown', 0xff8b4513);
export const Salmon = registerColor('Salmon', 0xfffa8072);
export const SandyBrown = registerColor('SandyBrown', 0xfff4a460);
export const SeaGreen = registerColor('SeaGreen', 0xff2e8b57);
export const SeaShell = registerColor('SeaShell', 0xfffff5ee);
export const Sienna = registerColor('Sienna', 0xffa0522d);
export const Silver = registerColor('Silver', 0xffc0c0c0);
export const SkyBlue = registerColor('SkyBlue', 0xff87ceeb);
export const SlateBlue = registerColor('SlateBlue', 0xff6a5acd);
export const SlateGray = registerColor(['SlateGray', 'SlateGrey'], 0xff708090);
export const Snow = registerColor('Snow', 0xfffffafa);
export const SpringGreen = registerColor('SpringGreen', 0xff00ff7f);
export const SteelBlue = registerColor('SteelBlue', 0xff4682b4);
export const Tan = registerColor('Tan', 0xffd2b48c);
export const Teal = registerColor('Teal', 0xff008080);
export const Thistle = registerColor('Thistle', 0xffd8bfd8);
export const Tomato = registerColor('Tomato', 0xffff6347);
export const Turquoise = registerColor('Turquoise', 0xff40e0d0);
export const Violet = registerColor('Violet', 0xffee82ee);
export const Wheat = registerColor('Wheat', 0xfff5deb3);
export const White = registerColor('White', 0xffffffff);
export const WhiteSmoke = registerColor('WhiteSmoke', 0xfff5f5f5);
export const Yellow = registerColor('Yellow', 0xffffff00);
export const YellowGreen = registerColor('YellowGreen', 0xff9acd32);
