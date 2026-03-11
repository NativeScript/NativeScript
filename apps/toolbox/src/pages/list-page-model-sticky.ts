import { Observable, Dialogs, DialogStrings, View, EventData, SearchEventData, Color } from '@nativescript/core';
import { getItemCallbacks } from '../split-view/split-view-root';
type CountryListType = Array<{ title: string; items: Array<{ name: string; code: string; flag: string; isVisible?: boolean }> }>;
export class ListPageModelSticky extends Observable {
	countries: CountryListType = [
		{
			title: 'A',
			items: [
				{
					name: 'Afghanistan',
					code: '(AF)',
					flag: '🇦🇫',
				},
				{
					name: 'Albania',
					code: '(AL)',
					flag: '🇦🇱',
				},
				{
					name: 'Algeria',
					code: '(DZ)',
					flag: '🇩🇿',
				},
				{
					name: 'American Samoa',
					code: '(AS)',
					flag: '🇦🇸',
				},
				{
					name: 'Andorra',
					code: '(AD)',
					flag: '🇦🇩',
				},
				{
					name: 'Angola',
					code: '(AO)',
					flag: '🇦🇴',
				},
				{
					name: 'Anguilla',
					code: '(AI)',
					flag: '🇦🇮',
				},
				{
					name: 'Antarctica',
					code: '(AQ)',
					flag: '🇦🇶',
				},
				{
					name: 'Antigua and Barbuda',
					code: '(AG)',
					flag: '🇦🇬',
				},
				{
					name: 'Argentina',
					code: '(AR)',
					flag: '🇦🇷',
				},
				{
					name: 'Armenia',
					code: '(AM)',
					flag: '🇦🇲',
				},
				{
					name: 'Aruba',
					code: '(AW)',
					flag: '🇦🇼',
				},
				{
					name: 'Australia',
					code: '(AU)',
					flag: '🇦🇺',
				},
				{
					name: 'Austria',
					code: '(AT)',
					flag: '🇦🇹',
				},
				{
					name: 'Azerbaijan',
					code: '(AZ)',
					flag: '🇦🇿',
				},
			],
		},
		{
			title: 'B',
			items: [
				{
					name: 'Bahamas',
					code: '(BS)',
					flag: '🇧🇸',
				},
				{
					name: 'Bahrain',
					code: '(BH)',
					flag: '🇧🇭',
				},
				{
					name: 'Bangladesh',
					code: '(BD)',
					flag: '🇧🇩',
				},
				{
					name: 'Barbados',
					code: '(BB)',
					flag: '🇧🇧',
				},
				{
					name: 'Belarus',
					code: '(BY)',
					flag: '🇧🇾',
				},
				{
					name: 'Belgium',
					code: '(BE)',
					flag: '🇧🇪',
				},
				{
					name: 'Belize',
					code: '(BZ)',
					flag: '🇧🇿',
				},
				{
					name: 'Benin',
					code: '(BJ)',
					flag: '🇧🇯',
				},
				{
					name: 'Bermuda',
					code: '(BM)',
					flag: '🇧🇲',
				},
				{
					name: 'Bhutan',
					code: '(BT)',
					flag: '🇧🇹',
				},
				{
					name: 'Bolivia',
					code: '(BO)',
					flag: '🇧🇴',
				},
				{
					name: 'Bonaire, Sint Eustatius and Saba',
					code: '(BQ)',
					flag: '🇧🇶',
				},
				{
					name: 'Bosnia and Herzegovina',
					code: '(BA)',
					flag: '🇧🇦',
				},
				{
					name: 'Botswana',
					code: '(BW)',
					flag: '🇧🇼',
				},
				{
					name: 'Bouvet Island',
					code: '(BV)',
					flag: '🇧🇻',
				},
				{
					name: 'Brazil',
					code: '(BR)',
					flag: '🇧🇷',
				},
				{
					name: 'British Indian Ocean Territory',
					code: '(IO)',
					flag: '🇮🇴',
				},
				{
					name: 'Brunei Darussalam',
					code: '(BN)',
					flag: '🇧🇳',
				},
				{
					name: 'Bulgaria',
					code: '(BG)',
					flag: '🇧🇬',
				},
				{
					name: 'Burkina Faso',
					code: '(BF)',
					flag: '🇧🇫',
				},
				{
					name: 'Burundi',
					code: '(BI)',
					flag: '🇧🇮',
				},
			],
		},
		{
			title: 'C',
			items: [
				{
					name: 'Cambodia',
					code: '(KH)',
					flag: '🇰🇭',
				},
				{
					name: 'Cameroon',
					code: '(CM)',
					flag: '🇨🇲',
				},
				{
					name: 'Canada',
					code: '(CA)',
					flag: '🇨🇦',
				},
				{
					name: 'Cape Verde',
					code: '(CV)',
					flag: '🇨🇻',
				},
				{
					name: 'Cayman Islands',
					code: '(KY)',
					flag: '🇰🇾',
				},
				{
					name: 'Central African Republic',
					code: '(CF)',
					flag: '🇨🇫',
				},
				{
					name: 'Chad',
					code: '(TD)',
					flag: '🇹🇩',
				},
				{
					name: 'Chile',
					code: '(CL)',
					flag: '🇨🇱',
				},
				{
					name: 'Christmas Island',
					code: '(CX)',
					flag: '🇨🇽',
				},
				{
					name: 'Cocos (Keeling) Islands',
					code: '(CC)',
					flag: '🇨🇨',
				},
				{
					name: 'Colombia',
					code: '(CO)',
					flag: '🇨🇴',
				},
				{
					name: 'Comoros',
					code: '(KM)',
					flag: '🇰🇲',
				},
				{
					name: 'Cook Islands',
					code: '(CK)',
					flag: '🇨🇰',
				},
				{
					name: 'Costa Rica',
					code: '(CR)',
					flag: '🇨🇷',
				},
				{
					name: "Cote d'Ivoire",
					code: '(CI)',
					flag: '🇨🇮',
				},
				{
					name: 'Croatia',
					code: '(HR)',
					flag: '🇭🇷',
				},
				{
					name: 'Cuba',
					code: '(CU)',
					flag: '🇨🇺',
				},
				{
					name: 'Curaçao',
					code: '(CW)',
					flag: '🇨🇼',
				},
				{
					name: 'Cyprus',
					code: '(CY)',
					flag: '🇨🇾',
				},
				{
					name: 'Czech Republic',
					code: '(CZ)',
					flag: '🇨🇿',
				},
			],
		},
		{
			title: 'D',
			items: [
				{
					name: 'Democratic Republic of the Congo',
					code: '(CD)',
					flag: '🇨🇩',
				},
				{
					name: 'Denmark',
					code: '(DK)',
					flag: '🇩🇰',
				},
				{
					name: 'Djibouti',
					code: '(DJ)',
					flag: '🇩🇯',
				},
				{
					name: 'Dominica',
					code: '(DM)',
					flag: '🇩🇲',
				},
				{
					name: 'Dominican Republic',
					code: '(DO)',
					flag: '🇩🇴',
				},
			],
		},
		{
			title: 'E',
			items: [
				{
					name: 'Ecuador',
					code: '(EC)',
					flag: '🇪🇨',
				},
				{
					name: 'Egypt',
					code: '(EG)',
					flag: '🇪🇬',
				},
				{
					name: 'El Salvador',
					code: '(SV)',
					flag: '🇸🇻',
				},
				{
					name: 'Equatorial Guinea',
					code: '(GQ)',
					flag: '🇬🇶',
				},
				{
					name: 'Eritrea',
					code: '(ER)',
					flag: '🇪🇷',
				},
				{
					name: 'Estonia',
					code: '(EE)',
					flag: '🇪🇪',
				},
				{
					name: 'Eswatini',
					code: '(SZ)',
					flag: '🇸🇿',
				},
				{
					name: 'Ethiopia',
					code: '(ET)',
					flag: '🇪🇹',
				},
			],
		},
		{
			title: 'F',
			items: [
				{
					name: 'Falkland Islands (Malvinas)',
					code: '(FK)',
					flag: '🇫🇰',
				},
				{
					name: 'Faroe Islands',
					code: '(FO)',
					flag: '🇫🇴',
				},
				{
					name: 'Fiji',
					code: '(FJ)',
					flag: '🇫🇯',
				},
				{
					name: 'Finland',
					code: '(FI)',
					flag: '🇫🇮',
				},
				{
					name: 'France',
					code: '(FR)',
					flag: '🇫🇷',
				},
				{
					name: 'French Guiana',
					code: '(GF)',
					flag: '🇬🇫',
				},
				{
					name: 'French Polynesia',
					code: '(PF)',
					flag: '🇵🇫',
				},
				{
					name: 'French Southern Territories',
					code: '(TF)',
					flag: '🇹🇫',
				},
			],
		},
		{
			title: 'G',
			items: [
				{
					name: 'Gabon',
					code: '(GA)',
					flag: '🇬🇦',
				},
				{
					name: 'Georgia',
					code: '(GE)',
					flag: '🇬🇪',
				},
				{
					name: 'Germany',
					code: '(DE)',
					flag: '🇩🇪',
				},
				{
					name: 'Ghana',
					code: '(GH)',
					flag: '🇬🇭',
				},
				{
					name: 'Gibraltar',
					code: '(GI)',
					flag: '🇬🇮',
				},
				{
					name: 'Greece',
					code: '(GR)',
					flag: '🇬🇷',
				},
				{
					name: 'Greenland',
					code: '(GL)',
					flag: '🇬🇱',
				},
				{
					name: 'Grenada',
					code: '(GD)',
					flag: '🇬🇩',
				},
				{
					name: 'Guadeloupe',
					code: '(GP)',
					flag: '🇬🇵',
				},
				{
					name: 'Guam',
					code: '(GU)',
					flag: '🇬🇺',
				},
				{
					name: 'Guatemala',
					code: '(GT)',
					flag: '🇬🇹',
				},
				{
					name: 'Guernsey',
					code: '(GG)',
					flag: '🇬🇬',
				},
				{
					name: 'Guinea',
					code: '(GN)',
					flag: '🇬🇳',
				},
				{
					name: 'Guinea-Bissau',
					code: '(GW)',
					flag: '🇬🇼',
				},
				{
					name: 'Guyana',
					code: '(GY)',
					flag: '🇬🇾',
				},
			],
		},
		{
			title: 'H',
			items: [
				{
					name: 'Haiti',
					code: '(HT)',
					flag: '🇭🇹',
				},
				{
					name: 'Heard Island and McDonald Islands',
					code: '(HM)',
					flag: '🇭🇲',
				},
				{
					name: 'Holy See (Vatican City State)',
					code: '(VA)',
					flag: '🇻🇦',
				},
				{
					name: 'Honduras',
					code: '(HN)',
					flag: '🇭🇳',
				},
				{
					name: 'Hong Kong',
					code: '(HK)',
					flag: '🇭🇰',
				},
				{
					name: 'Hungary',
					code: '(HU)',
					flag: '🇭🇺',
				},
			],
		},
		{
			title: 'I',
			items: [
				{
					name: 'Iceland',
					code: '(IS)',
					flag: '🇮🇸',
				},
				{
					name: 'India',
					code: '(IN)',
					flag: '🇮🇳',
				},
				{
					name: 'Indonesia',
					code: '(ID)',
					flag: '🇮🇩',
				},
				{
					name: 'Iraq',
					code: '(IQ)',
					flag: '🇮🇶',
				},
				{
					name: 'Ireland',
					code: '(IE)',
					flag: '🇮🇪',
				},
				{
					name: 'Islamic Republic of Iran',
					code: '(IR)',
					flag: '🇮🇷',
				},
				{
					name: 'Isle of Man',
					code: '(IM)',
					flag: '🇮🇲',
				},
				{
					name: 'Israel',
					code: '(IL)',
					flag: '🇮🇱',
				},
				{
					name: 'Italy',
					code: '(IT)',
					flag: '🇮🇹',
				},
			],
		},
		{
			title: 'J',
			items: [
				{
					name: 'Jamaica',
					code: '(JM)',
					flag: '🇯🇲',
				},
				{
					name: 'Japan',
					code: '(JP)',
					flag: '🇯🇵',
				},
				{
					name: 'Jersey',
					code: '(JE)',
					flag: '🇯🇪',
				},
				{
					name: 'Jordan',
					code: '(JO)',
					flag: '🇯🇴',
				},
			],
		},
		{
			title: 'K',
			items: [
				{
					name: 'Kazakhstan',
					code: '(KZ)',
					flag: '🇰🇿',
				},
				{
					name: 'Kenya',
					code: '(KE)',
					flag: '🇰🇪',
				},
				{
					name: 'Kiribati',
					code: '(KI)',
					flag: '🇰🇮',
				},
				{
					name: 'Kosovo',
					code: '(XK)',
					flag: '🇽🇰',
				},
				{
					name: 'Kuwait',
					code: '(KW)',
					flag: '🇰🇼',
				},
				{
					name: 'Kyrgyzstan',
					code: '(KG)',
					flag: '🇰🇬',
				},
			],
		},
		{
			title: 'L',
			items: [
				{
					name: "Lao People's Democratic Republic",
					code: '(LA)',
					flag: '🇱🇦',
				},
				{
					name: 'Latvia',
					code: '(LV)',
					flag: '🇱🇻',
				},
				{
					name: 'Lebanon',
					code: '(LB)',
					flag: '🇱🇧',
				},
				{
					name: 'Lesotho',
					code: '(LS)',
					flag: '🇱🇸',
				},
				{
					name: 'Liberia',
					code: '(LR)',
					flag: '🇱🇷',
				},
				{
					name: 'Libya',
					code: '(LY)',
					flag: '🇱🇾',
				},
				{
					name: 'Liechtenstein',
					code: '(LI)',
					flag: '🇱🇮',
				},
				{
					name: 'Lithuania',
					code: '(LT)',
					flag: '🇱🇹',
				},
				{
					name: 'Luxembourg',
					code: '(LU)',
					flag: '🇱🇺',
				},
			],
		},
		{
			title: 'M',
			items: [
				{
					name: 'Macao',
					code: '(MO)',
					flag: '🇲🇴',
				},
				{
					name: 'Madagascar',
					code: '(MG)',
					flag: '🇲🇬',
				},
				{
					name: 'Malawi',
					code: '(MW)',
					flag: '🇲🇼',
				},
				{
					name: 'Malaysia',
					code: '(MY)',
					flag: '🇲🇾',
				},
				{
					name: 'Maldives',
					code: '(MV)',
					flag: '🇲🇻',
				},
				{
					name: 'Mali',
					code: '(ML)',
					flag: '🇲🇱',
				},
				{
					name: 'Malta',
					code: '(MT)',
					flag: '🇲🇹',
				},
				{
					name: 'Marshall Islands',
					code: '(MH)',
					flag: '🇲🇭',
				},
				{
					name: 'Martinique',
					code: '(MQ)',
					flag: '🇲🇶',
				},
				{
					name: 'Mauritania',
					code: '(MR)',
					flag: '🇲🇷',
				},
				{
					name: 'Mauritius',
					code: '(MU)',
					flag: '🇲🇺',
				},
				{
					name: 'Mayotte',
					code: '(YT)',
					flag: '🇾🇹',
				},
				{
					name: 'Mexico',
					code: '(MX)',
					flag: '🇲🇽',
				},
				{
					name: 'Micronesia, Federated States of',
					code: '(FM)',
					flag: '🇫🇲',
				},
				{
					name: 'Moldova, Republic of',
					code: '(MD)',
					flag: '🇲🇩',
				},
				{
					name: 'Monaco',
					code: '(MC)',
					flag: '🇲🇨',
				},
				{
					name: 'Mongolia',
					code: '(MN)',
					flag: '🇲🇳',
				},
				{
					name: 'Montenegro',
					code: '(ME)',
					flag: '🇲🇪',
				},
				{
					name: 'Montserrat',
					code: '(MS)',
					flag: '🇲🇸',
				},
				{
					name: 'Morocco',
					code: '(MA)',
					flag: '🇲🇦',
				},
				{
					name: 'Mozambique',
					code: '(MZ)',
					flag: '🇲🇿',
				},
				{
					name: 'Myanmar',
					code: '(MM)',
					flag: '🇲🇲',
				},
			],
		},
		{
			title: 'N',
			items: [
				{
					name: 'Namibia',
					code: '(NA)',
					flag: '🇳🇦',
				},
				{
					name: 'Nauru',
					code: '(NR)',
					flag: '🇳🇷',
				},
				{
					name: 'Nepal',
					code: '(NP)',
					flag: '🇳🇵',
				},
				{
					name: 'Netherlands',
					code: '(NL)',
					flag: '🇳🇱',
				},
				{
					name: 'New Caledonia',
					code: '(NC)',
					flag: '🇳🇨',
				},
				{
					name: 'New Zealand',
					code: '(NZ)',
					flag: '🇳🇿',
				},
				{
					name: 'Nicaragua',
					code: '(NI)',
					flag: '🇳🇮',
				},
				{
					name: 'Niger',
					code: '(NE)',
					flag: '🇳🇪',
				},
				{
					name: 'Nigeria',
					code: '(NG)',
					flag: '🇳🇬',
				},
				{
					name: 'Niue',
					code: '(NU)',
					flag: '🇳🇺',
				},
				{
					name: 'Norfolk Island',
					code: '(NF)',
					flag: '🇳🇫',
				},
				{
					name: 'North Korea',
					code: '(KP)',
					flag: '🇰🇵',
				},
				{
					name: 'Northern Mariana Islands',
					code: '(MP)',
					flag: '🇲🇵',
				},
				{
					name: 'Norway',
					code: '(NO)',
					flag: '🇳🇴',
				},
			],
		},
		{
			title: 'O',
			items: [
				{
					name: 'Oman',
					code: '(OM)',
					flag: '🇴🇲',
				},
			],
		},
		{
			title: 'P',
			items: [
				{
					name: 'Pakistan',
					code: '(PK)',
					flag: '🇵🇰',
				},
				{
					name: 'Palau',
					code: '(PW)',
					flag: '🇵🇼',
				},
				{
					name: 'Panama',
					code: '(PA)',
					flag: '🇵🇦',
				},
				{
					name: 'Papua New Guinea',
					code: '(PG)',
					flag: '🇵🇬',
				},
				{
					name: 'Paraguay',
					code: '(PY)',
					flag: '🇵🇾',
				},
				{
					name: "People's Republic of China",
					code: '(CN)',
					flag: '🇨🇳',
				},
				{
					name: 'Peru',
					code: '(PE)',
					flag: '🇵🇪',
				},
				{
					name: 'Philippines',
					code: '(PH)',
					flag: '🇵🇭',
				},
				{
					name: 'Pitcairn',
					code: '(PN)',
					flag: '🇵🇳',
				},
				{
					name: 'Poland',
					code: '(PL)',
					flag: '🇵🇱',
				},
				{
					name: 'Portugal',
					code: '(PT)',
					flag: '🇵🇹',
				},
				{
					name: 'Puerto Rico',
					code: '(PR)',
					flag: '🇵🇷',
				},
			],
		},
		{
			title: 'Q',
			items: [
				{
					name: 'Qatar',
					code: '(QA)',
					flag: '🇶🇦',
				},
			],
		},
		{
			title: 'R',
			items: [
				{
					name: 'Republic of the Congo',
					code: '(CG)',
					flag: '🇨🇬',
				},
				{
					name: 'Republic of The Gambia',
					code: '(GM)',
					flag: '🇬🇲',
				},
				{
					name: 'Reunion',
					code: '(RE)',
					flag: '🇷🇪',
				},
				{
					name: 'Romania',
					code: '(RO)',
					flag: '🇷🇴',
				},
				{
					name: 'Russian Federation',
					code: '(RU)',
					flag: '🇷🇺',
				},
				{
					name: 'Rwanda',
					code: '(RW)',
					flag: '🇷🇼',
				},
			],
		},
		{
			title: 'S',
			items: [
				{
					name: 'Saint Barthélemy',
					code: '(BL)',
					flag: '🇧🇱',
				},
				{
					name: 'Saint Helena',
					code: '(SH)',
					flag: '🇸🇭',
				},
				{
					name: 'Saint Kitts and Nevis',
					code: '(KN)',
					flag: '🇰🇳',
				},
				{
					name: 'Saint Lucia',
					code: '(LC)',
					flag: '🇱🇨',
				},
				{
					name: 'Saint Martin (French part)',
					code: '(MF)',
					flag: '🇲🇫',
				},
				{
					name: 'Saint Pierre and Miquelon',
					code: '(PM)',
					flag: '🇵🇲',
				},
				{
					name: 'Saint Vincent and the Grenadines',
					code: '(VC)',
					flag: '🇻🇨',
				},
				{
					name: 'Samoa',
					code: '(WS)',
					flag: '🇼🇸',
				},
				{
					name: 'San Marino',
					code: '(SM)',
					flag: '🇸🇲',
				},
				{
					name: 'Sao Tome and Principe',
					code: '(ST)',
					flag: '🇸🇹',
				},
				{
					name: 'Saudi Arabia',
					code: '(SA)',
					flag: '🇸🇦',
				},
				{
					name: 'Senegal',
					code: '(SN)',
					flag: '🇸🇳',
				},
				{
					name: 'Serbia',
					code: '(RS)',
					flag: '🇷🇸',
				},
				{
					name: 'Seychelles',
					code: '(SC)',
					flag: '🇸🇨',
				},
				{
					name: 'Sierra Leone',
					code: '(SL)',
					flag: '🇸🇱',
				},
				{
					name: 'Singapore',
					code: '(SG)',
					flag: '🇸🇬',
				},
				{
					name: 'Sint Maarten (Dutch part)',
					code: '(SX)',
					flag: '🇸🇽',
				},
				{
					name: 'Slovakia',
					code: '(SK)',
					flag: '🇸🇰',
				},
				{
					name: 'Slovenia',
					code: '(SI)',
					flag: '🇸🇮',
				},
				{
					name: 'Solomon Islands',
					code: '(SB)',
					flag: '🇸🇧',
				},
				{
					name: 'Somalia',
					code: '(SO)',
					flag: '🇸🇴',
				},
				{
					name: 'South Africa',
					code: '(ZA)',
					flag: '🇿🇦',
				},
				{
					name: 'South Georgia and the South Sandwich Islands',
					code: '(GS)',
					flag: '🇬🇸',
				},
				{
					name: 'South Korea',
					code: '(KR)',
					flag: '🇰🇷',
				},
				{
					name: 'South Sudan',
					code: '(SS)',
					flag: '🇸🇸',
				},
				{
					name: 'Spain',
					code: '(ES)',
					flag: '🇪🇸',
				},
				{
					name: 'Sri Lanka',
					code: '(LK)',
					flag: '🇱🇰',
				},
				{
					name: 'State of Palestine',
					code: '(PS)',
					flag: '🇵🇸',
				},
				{
					name: 'Sudan',
					code: '(SD)',
					flag: '🇸🇩',
				},
				{
					name: 'Suriname',
					code: '(SR)',
					flag: '🇸🇷',
				},
				{
					name: 'Svalbard and Jan Mayen',
					code: '(SJ)',
					flag: '🇸🇯',
				},
				{
					name: 'Sweden',
					code: '(SE)',
					flag: '🇸🇪',
				},
				{
					name: 'Switzerland',
					code: '(CH)',
					flag: '🇨🇭',
				},
				{
					name: 'Syrian Arab Republic',
					code: '(SY)',
					flag: '🇸🇾',
				},
			],
		},
		{
			title: 'T',
			items: [
				{
					name: 'Taiwan, Province of China',
					code: '(TW)',
					flag: '🇹🇼',
				},
				{
					name: 'Tajikistan',
					code: '(TJ)',
					flag: '🇹🇯',
				},
				{
					name: 'Thailand',
					code: '(TH)',
					flag: '🇹🇭',
				},
				{
					name: 'The Republic of North Macedonia',
					code: '(MK)',
					flag: '🇲🇰',
				},
				{
					name: 'Timor-Leste',
					code: '(TL)',
					flag: '🇹🇱',
				},
				{
					name: 'Togo',
					code: '(TG)',
					flag: '🇹🇬',
				},
				{
					name: 'Tokelau',
					code: '(TK)',
					flag: '🇹🇰',
				},
				{
					name: 'Tonga',
					code: '(TO)',
					flag: '🇹🇴',
				},
				{
					name: 'Trinidad and Tobago',
					code: '(TT)',
					flag: '🇹🇹',
				},
				{
					name: 'Tunisia',
					code: '(TN)',
					flag: '🇹🇳',
				},
				{
					name: 'Türkiye',
					code: '(TR)',
					flag: '🇹🇷',
				},
				{
					name: 'Turkmenistan',
					code: '(TM)',
					flag: '🇹🇲',
				},
				{
					name: 'Turks and Caicos Islands',
					code: '(TC)',
					flag: '🇹🇨',
				},
				{
					name: 'Tuvalu',
					code: '(TV)',
					flag: '🇹🇻',
				},
			],
		},
		{
			title: 'U',
			items: [
				{
					name: 'Uganda',
					code: '(UG)',
					flag: '🇺🇬',
				},
				{
					name: 'Ukraine',
					code: '(UA)',
					flag: '🇺🇦',
				},
				{
					name: 'United Arab Emirates',
					code: '(AE)',
					flag: '🇦🇪',
				},
				{
					name: 'United Kingdom',
					code: '(GB)',
					flag: '🇬🇧',
				},
				{
					name: 'United Republic of Tanzania',
					code: '(TZ)',
					flag: '🇹🇿',
				},
				{
					name: 'United States Minor Outlying Islands',
					code: '(UM)',
					flag: '🇺🇲',
				},
				{
					name: 'United States of America',
					code: '(US)',
					flag: '🇺🇸',
				},
				{
					name: 'Uruguay',
					code: '(UY)',
					flag: '🇺🇾',
				},
				{
					name: 'Uzbekistan',
					code: '(UZ)',
					flag: '🇺🇿',
				},
			],
		},
		{
			title: 'V',
			items: [
				{
					name: 'Vanuatu',
					code: '(VU)',
					flag: '🇻🇺',
				},
				{
					name: 'Venezuela',
					code: '(VE)',
					flag: '🇻🇪',
				},
				{
					name: 'Vietnam',
					code: '(VN)',
					flag: '🇻🇳',
				},
				{
					name: 'Virgin Islands, British',
					code: '(VG)',
					flag: '🇻🇬',
				},
				{
					name: 'Virgin Islands, U.S.',
					code: '(VI)',
					flag: '🇻🇮',
				},
			],
		},
		{
			title: 'W',
			items: [
				{
					name: 'Wallis and Futuna',
					code: '(WF)',
					flag: '🇼🇫',
				},
				{
					name: 'Western Sahara',
					code: '(EH)',
					flag: '🇪🇭',
				},
			],
		},
		{
			title: 'Y',
			items: [
				{
					name: 'Yemen',
					code: '(YE)',
					flag: '🇾🇪',
				},
			],
		},
		{
			title: 'Z',
			items: [
				{
					name: 'Zambia',
					code: '(ZM)',
					flag: '🇿🇲',
				},
				{
					name: 'Zimbabwe',
					code: '(ZW)',
					flag: '🇿🇼',
				},
			],
		},
	];
	private _originalCountries: CountryListType;

	selectItemTemplate(item: any, index: number, items: Array<any>) {
		return 'main'; // index == items.length - 1 ? 'last' : 'not-last';
	}

	componentsItemTap(args): void {
		const letter = this.countries[args.section];
		console.log('Tapped on category: ' + letter.title);
		if (letter.items?.length) {
			const country = letter.items[args.index];
			console.log('Tapped on country: ' + country.name);
			// used in splitview demo
			getItemCallbacks().forEach((callback) => callback(`${country.name} was selected.`));
		}
	}

	itemLoading(args: EventData): void {
		(args.object as View).backgroundColor = new Color('transparent');
	}

	onSearchTextChange(evt: SearchEventData): void {
		if (!this._originalCountries) {
			this._originalCountries = this.countries;
		}
		const searchText = evt.text.toLowerCase();
		console.log('Search text:', searchText);
		if (searchText) {
			this.countries = this.filterCountryGroups(this._originalCountries, searchText);
		} else {
			this.countries = this._originalCountries; // reset to original if no search text
		}
		this.notifyPropertyChange('countries', this.countries);
	}

	/**
	 * Filter a grouped array of countries by search query.
	 * @param {Array<{ title: string; items: { name: string; code: string; flag: string; }[] }>} groups
	 * @param {string} query
	 * @returns Filtered groups with the same shape, omitting any with no matches.
	 */
	filterCountryGroups(groups: CountryListType, query: string): CountryListType {
		const q = query.trim().toLowerCase();
		if (!q) return groups; // no query → all groups

		return (
			groups
				.map((group) => {
					// keep only items whose name includes the query
					const items = group.items.filter((item) => item.name.toLowerCase().includes(q));
					return { ...group, items };
				})
				// drop any group that ended up with 0 items
				.filter((group) => group.items.length > 0)
		);
	}
}
