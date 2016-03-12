// thanks to MrCheeze for helping with rewriting the stage name lookup table

var TEXT_MAPPING =
{
	"A": 0x00,
	"B": 0x01,
	"C": 0x02,
	"D": 0x03,
	"E": 0x04,
	"F": 0x05,
	"G": 0x06,
	"H": 0x07,
	"I": 0x08,
	"J": 0x09,
	"K": 0x0a,
	"L": 0x0b,
	"M": 0x0c,
	"N": 0x0d,
	"O": 0x0e,
	"P": 0x0f,
	"Q": 0x10,
	"R": 0x11,
	"S": 0x12,
	"T": 0x13,
	"U": 0x14,
	"V": 0x15,
	"W": 0x16,
	"X": 0x17,
	"Y": 0x18,
	"Z": 0x19,
	"!": 0x1a,
	".": 0x1b,
	"-": 0x1c,
	",": 0x1d,
	"?": 0x1e,
	" ": 0x1f,
	"a": 0x40,
	"b": 0x41,
	"c": 0x42,
	"d": 0x43,
	"e": 0x44,
	"f": 0x45,
	"g": 0x46,
	"h": 0x47,
	"i": 0x48,
	"j": 0x49,
	"k": 0x4a,
	"l": 0x4b,
	"m": 0x4c,
	"n": 0x4d,
	"o": 0x4e,
	"p": 0x4f,
	"q": 0x50,
	"r": 0x51,
	"s": 0x52,
	"t": 0x53,
	"u": 0x54,
	"v": 0x55,
	"w": 0x56,
	"x": 0x57,
	"y": 0x58,
	"z": 0x59,
	"#": 0x5a,
	"(": 0x5b,
	")": 0x5c,
	"'": 0x5d,
	"·": 0x5e,
	"1": 0x64,
	"2": 0x65,
	"3": 0x66,
	"4": 0x67,
	"5": 0x68,
	"6": 0x69,
	"7": 0x6a,
	"0": 0x6b,

	"\uE032": 0x32,
	"\uE033": 0x33,
	"\uE034": 0x34,
	"\uE035": 0x35,
	"\uE036": 0x36,
	"\uE037": 0x37,

	"\uE038": 0x38,
	"\uE039": 0x39,
	"\uE03A": 0x3a,
	"\uE03B": 0x3b,
	"\uE03C": 0x3c,
};
 
var TITLE_STRINGS =
[
	["YOSHI'S ", "MARIO'S ", "LUIGI'S ", "DEATHLY ", "LEMMY'S ", "LARRY'S ", "WENDY'S ", "KOOPA'S "],
	["STAR ", "HYPE ", "MOON ", "KUSO ", "EPIC "],
	"#1 IGGY'S ",
	"#2 MORTON'S ",
	"#3 LEMMY'S ",
	"#4 LUDWIG'S ",
	"#5 ROY'S ",
	"#6 WENDY'S ",
	"#7 LARRY'S ",
	["DONUT ", "PIZZA ", "KUSO! ", "KOOPA ", "KAIZO ", "SUSHI ", "HORSE "],
	"GREEN ",
	["TOP SECRET AREA ", "TAKE A BREAK ", "WHY THE RUSH? ", "KEEP YOUR CAPES "],
	["VANILLA ", "DIAMOND ", "CALZONE ", "EMERALD "],
	"\uE038\uE039\uE03A\uE03B\uE03C ", // YELLOW
	"RED ",
	"BLUE ",
	["BUTTER BRIDGE ", "CHEESE BRIDGE ", "APPLE ISTHMUS ", "ASIAGO CHEESE "],
	["CHEESE BRIDGE ", "BUTTER BRIDGE ", "PASTA PLATEAU ", "BOUNCING SAWS "],
	["SODA LAKE ", "POP OCEAN ", "INK SWAMP "],
	["COOKIE MOUNTAIN ", "GREEN HILL ZONE ", "WALUIGI LAND ", "PRINCESS VALLEY ", "DINO-RHINO LAND "],
	["FOREST ", "CANOPY ", "JUNGLE "],
	["CHOCOLATE ", "CHEEZCAKE ", "PEPPERONI "],
	["CHOCO-GHOST HOUSE ", "HAUNTED MANSION ", "HOUSE OF HORROR ", "HOUSE OF TERROR "],
	["SUNKEN GHOST SHIP ", "GHOSTS OF YOSHI ", "SMB3 AIRSHIP "],
	["VALLEY ", "SUMMIT ", "RIVERS ", "THREAT ", "WOUNDS ", "GALAXY "],
	["BACK DOOR ", "NO ENTRY ", "GO AWAY ", "LEAVE NOW "],
	["FRONT DOOR ", "GET READY ", "FINAL BOSS "],
	["GNARLY ", "WACKY ", "CRAZY ", "KOOKY ", "NUTTY "],
	["TUBULAR ", "(-.-) "],
	["WAY COOL ", "GLORIOUS ", "STYLISH ", "SUAVE "],
	["HOUSE ", "ABODE ", "CONDO ", "TOWER "],
	["ISLAND ", "MIRAGE ", "TUNNEL ", "CAVERN ", "BRIDGE ", "GALAXY "],
	"SWITCH PALACE ",
	["CASTLE ", "TEMPLE ", "DOMAIN "],
	["PLAINS ", "TUNDRA ", "MEADOW ", "CAVERN ", "BRIDGE "],
	["GHOST HOUSE ", "BOO'S HAUNT ", "GRAVEYARD "],
	["SECRET ", "TEMPLE "],
	["DOME ", "ZONE ", "CAVE "],
	["FORTRESS ", "DUNGEON ", "DUNGEONS ", "PANTHEON ", "CAPITAL ", "CENTRE ", "CENTER "],
	["OF\uE032\uE033\uE034\uE035\uE036\uE037ON ", "OF DISDAIN ", "OF VISIONS ", "HAPPY TIME "], // OF ILLUSION
	["OF BOWSER ", "OF KOOPAS ", "OF SORROW ", "OF CLOUDS ", "OF SPIKES "],
	["ROAD ", "WARP ", "PATH ", "ZONE ", "LINE "],
	"WORLD ",
	["AWESOME ", "SPOOKY ", "STRANGE ", "AMAZING ", "MYSTERY ", "TWITCHY ", "RADICAL "],
	["1", "0", "Z", "Y"],
	["2", "?", "!", "3"],
	["3", "X", "4", "6"],
	["4", "6", "2", "?"],
	["5", "7", "?", "Q"],
	["PALACE", "TEMPLE", "SHRINE"],
	["AREA", "ZONE", "SPOT", "HILL"],
	["GROOVY", "CRAZY", "DEATH!"],
	["MONDO", "Kappa", "GG!", "????", "OMG!"],
	["OUTRAGEOUS", "UNNATURAL", "MENTAL", "MADNESS", "TRY NOCAPE", "BibleThump", "FABULOUS"],
	["FUNKY", "GREAT", "WEIRD", "BINGO"],
	["HOUSE", "ABODE", "CONDO", "TOWER"],
	" ",
];

function randomizeLevelNames(random, rom)
{
	var ndx = 0x21AC5;
	for (var i = 0; i < TITLE_STRINGS.length; ++i)
	{
		var str = TITLE_STRINGS[i];
		if (str instanceof Array)
		{
			str = random.from(TITLE_STRINGS[i]);
			while (str.length < TITLE_STRINGS[i][0].length) str += ' ';
		}
		
		for (var j = 0; j < str.length; ++j, ++ndx)
			rom[ndx] = TEXT_MAPPING[str[j]];
		rom[ndx-1] |= 0x80;
	}
}

function charToTitleNum(chr)
{
	var chars =
	{
		'@': 0x76, // clock
		'$': 0x2E, // coin
		"'": 0x85,
		'"': 0x86,
		':': 0x78,
		' ': 0xFC,
	};
	
	var basechars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,*-!".split('');
	for (var i = 0; i < basechars.length; ++i) chars[basechars[i]] = i;
	
	if (chr in chars) return chars[chr];
	return 0xFC;
}

function centerPad(str, len)
{
	while (str.length < len)
		str = ((str.length & 1) ? (" " + str) : (str + " "));
	return str;
}

function leftPad(str, len)
{
	while (str.length < len) str = str + " ";
	return str;
}

function writeToTitle(title, color, rom)
{
	title = centerPad(title.toUpperCase(), 19).split('');
	for (var i = 0; i < 19; ++i)
	{
		var num = charToTitleNum(title[i]);
		
		rom[0x2B6D7 + i * 2 + 0]  = num & 0xFF;
		rom[0x2B6D7 + i * 2 + 1] &= 0xE0;
		rom[0x2B6D7 + i * 2 + 1] |= (color << 2) | ((num >> 8) & 0x3);
	}
}

function updateIntroText(vseed, rom)
{
	// 7*18 + 1*15
	var lines = 
	[
	];
	
	var ndx = 0x2A5D9, off = 0;
	for (var i = 0; i < 8; ++i)
	{
		var line = i < lines.length ? lines[i] : "";
		for (var j = 0; j < line.length; ++j, ++off)
		{
			if (!(line[j] in TEXT_MAPPING))
				throw new Error('Character not found in charset: ' + line[j]);
			rom[ndx+off] = TEXT_MAPPING[line[j]];
		}
		rom[ndx+off-1] |= 0x80;
	}
	
	if (off != 141) throw new Error('Invalid length for intro text cutscene: ' + off);
}

var fileSelectOffsets =
{
	marioA: { text: "MARIO A ...EMPTY", addr: [0x2b722, 0x2b7ed] },
	marioB: { text: "MARIO B ...EMPTY", addr: [0x2b746, 0x2b811] },
	marioC: { text: "MARIO C ...EMPTY", addr: [0x2b76a, 0x2b835] },
	erase: { text: "ERASE DATA", addr: [0x2b859] },
	
	eraseA: { text: "ERASE", addr: [0x2b78e] },
	eraseB: { text: "ERASE", addr: [0x2b79e] },
	eraseC: { text: "ERASE", addr: [0x2b7ae] },
	end: { text: "END", addr: [0x2b7be] },
	
	start1p: { text: "1 PLAYER GAME", addr: [0x2b88a] },
	start2p: { text: "2 PLAYER GAME", addr: [0x2b8a8] },
};

function replaceFileSelect(color, rom)
{
	var texts = {};
	for (var k in fileSelectOffsets)
		texts[k] = fileSelectOffsets[k].text;
	updateFileSelect(texts, color, rom);
}

function updateFileSelect(texts, color, rom)
{
	for (var k in texts)
	{
		var text = texts[k], odata = fileSelectOffsets[k];
		if (!odata) continue;
		
		if (text.length > odata.text.length)
			throw new Error('Text "' + text + '" too long for location: ' + k)
		
		for (var i = 0; i < text.length; ++i)
		{
			var num = charToTitleNum(text[i]);
			for (var j = 0; j < odata.addr.length; ++j)
			{
				var addr = odata.addr[j] + 4 + i * 2;
				rom[addr + 0]  = num & 0xFF;
				rom[addr + 1] &= 0xE0;
				rom[addr + 1] |= (color << 2) | ((num >> 8) & 0x3);
			}
		}
	}
}

var EGTEXT_CHARACTERS =
{
	'M': 0xA1,
	'P': 0xA0,
	'Y': 0xB0,
	'W': 0xA1,
	'L': 0xB1,
	'F': 0xE0,
	'G': 0xE1,
	'I': 0xE2,
	'T': 0xE5,
	'A': 0xF0,
	'S': 0xF1,
	'R': 0xF2,
	'H': 0xF5,
	'B': 0xDE,
	'C': 0xFF,
	'a': 0x88,
	'b': 0x89,
	'c': 0x8A,
	'd': 0x8B,
	'e': 0x8C,
	'f': 0x8D,
	'g': 0x8E,
	'h': 0x98,
	'i': 0x99,
	'j': 0x9A,
	'k': 0x9B,
	'l': 0x9C,
	'm': 0x9D,
	'n': 0x9E,
	'o': 0xA8,
	'p': 0xA9,
	'q': 0xAA,
	'r': 0xAB,
	's': 0xAC,
	't': 0xAD,
	'u': 0xAE,
	'v': 0xAF,
	'w': 0xB8,
	'x': 0xB9,
	'y': 0xBA,
	'z': 0xBB,
	'!': 0xBC,
	'.': 0xBD,
	',': 0xBE,
	"'": 0xBF,
}

var ENDGAME_TEXTS = 
[
	[
		"You could start learning",
		"a new language, start",
		"growing a garden,",
		"volunteer, or read a book.",
	],
	[
		"PangaeaPanga leaped out of",
		"Mike Foss' arms and tried",
		"to speed away, but Foss",
		"   threw him on the bed...",
	],
	[
		"I just want to tell you",
		"both good luck. We're all",
		"counting on you.",
	],
	[
		"Wow, I log on to twitch.tv",
		"to chat and watch a good",
		"streamer, and u guys fkin",
		"spam ur dumb fkin memes...",
	],
	[
		"Stiv I hope you see this",
		"message now that chat has",
		"died down. Great job! I'm",
		"rooting for you always.",
	],
	[
		"At long last,Mario revived",
		"the demoness Peach and",
		"sentenced the kingdom to",
		"generations of torture.",
	],
];

function processEndGameText(text)
{
	var textlength = 0, textdata = [];
	if (text.length > 4) throw "updateEndGameText: too many lines";
	
	// for each line
	for (var i = 0; i < text.length; ++i)
	{
		if (text[i].length > 26)
			throw "updateEndGameText: line " + (i + 1) + " too long";
		
		// for each character in the line
		for (var j = 0; j < text[i].length; ++j)
		{
			var ch = text[i][j], cc = 0x0E;
			var nx = 0x18 + (j * 0x08), ny = 0x20 + (i * 0x10);
			
			// skip spaces
			if (ch == ' ') continue;
			
			// W is a modified, flipped M
			if (ch == 'W') { cc |= 0xC0; ny--; }
			
			// gentle alert if we get an invalid character
			if (ch in EGTEXT_CHARACTERS)
			{
				textdata.push(nx, ny, EGTEXT_CHARACTERS[ch], cc);
				++textlength;
			}
			else console.log("updateEndGameText: char not found: " + ch);
		}
	}
	
	// only a max of 83 characters available
	if (textlength > 84) throw "updateEndGameText: too many characters";
	return { len: textlength, data: textdata };
}

function updateEndGameText(text, rom)
{
	// this is factored out so that processEndGameText can
	// be run exclusively as a validator for the text files
	var res = processEndGameText(text);
	
	rom[0x1AEBB] = res.len;
	rom.set(res.data, 0x1D524);
}

function randomizeEndGameText(random, rom)
{ updateEndGameText(random.from(ENDGAME_TEXTS), rom); }

function charToUpperNum(ch)
{
	var chars = {};
	var basechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-.".split('');
	
	for (var i = 0; i < basechars.length; ++i)
		chars[basechars[i]] = i + (i < 0x10 ? 0xC0 : 0xD0);
	
	// adding the numbers to the upper list only (small numbers)
	for (var i = 0; i < 10; ++i) chars[""+i] = i;
	
	if (ch in chars) return chars[ch];
	return 0xFC;
}

function charToLowerNum(ch)
{
	var chars = {};
	var basechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-.".split('');
	
	for (var i = 0; i < basechars.length; ++i)
		chars[basechars[i]] = i + (i < 0x10 ? 0xD0 : 0xE0);
	
	if (ch in chars) return chars[ch];
	return 0xFC;
}

function writeCreditLine(str, meta, map, rom, ptr, x)
{
	// only deal with uppercase
	str = str.toUpperCase();
	
	// x, len
	rom[ptr++] = x || Math.round((0x20 - str.length) / 2);
	rom[ptr++] = (str.length * 2) - 1;
	
	for (var i = 0; i < str.length; ++i)
	{
		var ch = str.charAt(i);
		var c = map ? map(ch) : 0xFC;
		
		rom[ptr++] = c;
		rom[ptr++] = c == 0xFC ? 0x00 : meta;
	}
	
	return ptr;
}
	
var DEVELOPERS = ['authorblues', 'Kaizoman666'];
var SPECIAL_THANKS = ['Dotsarecool', 'MrCheeze'];

var LONG_COPYPASTAS = 
[
	// SMW copypastas
	"Hello, Mr. Lakitu here. I was just wondering what the hell you thought you were doing taking my cloud. Us Lakitus work day in and day out on these clouds, and since you had the cojones to think you could just take a cloud out of thin air one of my brethren is out of a job. Now they'll have to find work buttering bridges or filming go-karters. Thanks again LinkdeadxStalin",
	"His YouTube name is PangaeaPanga. I assume this isn't his real name, but maybe it is. Whatever the case, PangaeaPanga is an accomplished video game speedrunner, and we should all hope to one day lack the responsibilities he does, so we too can successfully play video games blindfolded.",
	"Our menboo in Japan, hallowed be your name. your kingdom come, your will be done, on nicovideo, as it is in heaven. Give us this day our WRs, and forgive us our game saving, as we also have forgiven our debtors. And lead us not into splicing, but deliver us from Volpe. Amen.",
	"Aaron packed a bag with his Super Nintendo, SMW, and his greasy red shell before setting out on his journey on his majestic steed, Yoshi, which was the name he gave to his bicycle. He rode to the end of his driveway and fell over on his bike. \"Oh my god.\" He said as he reset. This repeated for the next few hours because he wanted green splits for the beginning of his adventure.",
	
	// general copypastas
	"Hey guys, Reggie from Nintendo here. I'm glad to see that you are enjoying one of our finer games, Super Mario World, but I'm going to have to ask you to refrain from breaking it like you are. You are NOT playing it the way we wanted you to, and you are having a lot less fun than you could. Please consider or your body won't be ready for the Nintendo Lawyers. Thank you Mr. Randomizer, and Game on! - Regginator",
	"This is rather impressive, even with cheats, however, in my opinion, I believe that a true \"speedrun\" should be done without cheats. I mean, I could no-clip through the entire game and call it speedrunning, but that wouldn't be fair. I am not saying I hate the game. The game is still awesome, I just believe that speedruns should be kept cheat-free and fair.﻿",
];

function chunkCreditsText(str)
{
	var words = str.split(' ');
	var lines = [], line = words[0];
	
	for (var i = 1; i < words.length; ++i)
	{
		if (line.length + words[i].length + 1 > 28)
		{
			lines.push(line);
			line = words[i];
		}
		else line += ' ' + words[i];
	}
	
	lines.push(line);
	return lines;
}

function rewriteCredits(random, rom)
{
	// thanks BrunoValads for the suggested PI value #199
	rom[0x61FF9] = random.from([0, 1, 2, 3, 199]);
	
	var CREDITS_TABLE_SIZE = 1873;
	var CREDITS_TABLE_BASE = 0x615C7;
	
	var LINE_POINTER_BASE = 0x61D18;
	var LINE_POINTER_END = LINE_POINTER_BASE + 404;
	
	var lineptr = LINE_POINTER_BASE;
	var tblptr = CREDITS_TABLE_BASE;
	
	// setting up a blank line to be reused
	var BLANK_LINE = 0x00;
	rom[tblptr++] = 0xFF;
	
	var message = 
	[
		"SMW " + (EN_US ? 'Randomizer' : 'Randomiser') + " " + VERSION_STRING,
		"Thanks so much for playing!",
	];
	
	for (var i = 0; i < message.length; ++i)
	{
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(message[i], 0x38, charToTitleNum, rom, tblptr);
		
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	}
	
	for (var i = 0; i < 2; ++i)
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	
	lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
	tblptr = writeCreditLine("DEVELOPERS", 0x3C, charToTitleNum, rom, tblptr);
	
	for (var i = 0; i < DEVELOPERS.length; ++i)
	{
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
		
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(DEVELOPERS[i], 0x38, charToUpperNum, rom, tblptr);
		
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(DEVELOPERS[i], 0x38, charToLowerNum, rom, tblptr);
	}
	
	for (var i = 0; i < 3; ++i)
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	
	lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
	tblptr = writeCreditLine("SPECIAL THANKS TO", 0x28, charToTitleNum, rom, tblptr);
	
	for (var i = 0; i < SPECIAL_THANKS.length; ++i)
	{
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
		
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(SPECIAL_THANKS[i], 0x38, charToUpperNum, rom, tblptr);
		
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(SPECIAL_THANKS[i], 0x38, charToLowerNum, rom, tblptr);
	}
	
	for (var i = 0; i < 8; ++i)
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	
	lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
	tblptr = writeCreditLine("TESTERS", 0x2C, charToTitleNum, rom, tblptr);
	
	var TESTER_NAMES = Object.keys(TESTERS).shuffle(random);
	for (var i = 0; i < TESTER_NAMES.length; ++i)
	{
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
		
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(TESTER_NAMES[i], 0x38, charToUpperNum, rom, tblptr);
		
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(TESTER_NAMES[i], 0x38, charToLowerNum, rom, tblptr);
	}
	for (var i = 0; i < 8; ++i)
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	
	var copypasta = random.from(LONG_COPYPASTAS);
	message = chunkCreditsText(copypasta);
	
	for (var i = 0; i < message.length; ++i)
	{
		lineptr += rom.writeBytes(2, lineptr, tblptr - CREDITS_TABLE_BASE);
		tblptr = writeCreditLine(message[i], 0x38, charToTitleNum, rom, tblptr, 2);
		
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	}
	
	while (lineptr < LINE_POINTER_END)
		lineptr += rom.writeBytes(2, lineptr, BLANK_LINE);
	
	if (tblptr > CREDITS_TABLE_BASE + CREDITS_TABLE_SIZE)
		throw new Error('credits table pointer exceeded available size');
}
