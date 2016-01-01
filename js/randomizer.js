var VERSION_STRING = 'v1.3';

// this is the md5 of the only rom that we will accept
var ORIGINAL_MD5 =
{
	"cdd3c8c37322978ca8669b34bc89c804": 0x80000,
	"dbe1f3c8f3a0b2db52b7d59417891117": 0x80200,
};

var LAYER1_OFFSET;
var LAYER2_OFFSET;
var SPRITE_OFFSET;

var HEADER1_OFFSET;
var HEADER2_OFFSET;
var HEADER3_OFFSET;
var HEADER4_OFFSET;

var FLAGBASE;

var LEVEL_OFFSETS = [
	// layer data
	{"name": "layer1", "bytes": 3, "offset": LAYER1_OFFSET = 0x2E000},
	{"name": "layer2", "bytes": 3, "offset": LAYER2_OFFSET = 0x2E600},
	{"name": "sprite", "bytes": 2, "offset": SPRITE_OFFSET = 0x2EC00},
	
	// secondary header data
	{"name": "header1", "bytes": 1, "offset": HEADER1_OFFSET = 0x2F000},
	{"name": "header2", "bytes": 1, "offset": HEADER2_OFFSET = 0x2F200},
	{"name": "header3", "bytes": 1, "offset": HEADER3_OFFSET = 0x2F400},
	{"name": "header4", "bytes": 1, "offset": HEADER4_OFFSET = 0x2F600},
	
	// custom data
	{"name": "lvflags", "bytes": 1, "offset": FLAGBASE = 0x1FDE0},
];

var trans_offsets = [
	// name pointer
	{"name": "nameptr", "bytes": 2, "offset": 0x220FC},
];

var NORMAL_EXIT = 1<<0,
    SECRET_EXIT = 1<<1;
	
var NO_CASTLE   = 0,
    NORTH_CLEAR = 1,
    NORTH_PATH  = 2;

/*
	0x0 = Beige/White
	0x1 = White/Gold
	0x2 = DkBlue/Black
	0x3 = Brown/Gold
	0x4 = Black/White (Palette-specific?)
	0x5 = LtBlue/DkBlue
	0x6 = Gold/Brown
	0x7 = Green/Black
*/	
var TITLE_TEXT_COLOR = 0x4;

var SMW_STAGES =
[
	// stages
	{"name": "yi1", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x105, "cpath": NO_CASTLE, "tile": [0x04, 0x28], "out": ["yswitch"]}, 
	{"name": "yi2", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x106, "cpath": NORTH_PATH, "tile": [0x0A, 0x28], "out": ["yi3"]}, 
	{"name": "yi3", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x103, "cpath": NORTH_CLEAR, "tile": [0x0A, 0x26], "out": ["yi4"]}, 
	{"name": "yi4", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x102, "cpath": NO_CASTLE, "tile": [0x0C, 0x24], "out": ["c1"]}, 
	{"name": "dp1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x015, "cpath": NORTH_PATH, "tile": [0x05, 0x11], "out": ["dp2", "ds1"]}, 
	{"name": "dp2", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x009, "cpath": NORTH_PATH, "tile": [0x03, 0x0D], "out": ["dgh", "gswitch"]}, 
	{"name": "dp3", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x005, "cpath": NORTH_CLEAR, "tile": [0x09, 0x0A], "out": ["dp4"]}, 
	{"name": "dp4", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x006, "cpath": NO_CASTLE, "tile": [0x0B, 0x0C], "out": ["c2"]}, 
	{"name": "ds1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x00A, "cpath": NO_CASTLE, "tile": [0x05, 0x0E], "out": ["dgh", "dsh"]}, 
	{"name": "ds2", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10B, "cpath": NORTH_CLEAR, "tile": [0x11, 0x21], "out": ["dp3"]}, 
	{"name": "vd1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11A, "cpath": NORTH_CLEAR, "tile": [0x06, 0x32], "out": ["vd2", "vs1"]}, 
	{"name": "vd2", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x118, "cpath": NO_CASTLE, "tile": [0x09, 0x30], "out": ["vgh", "rswitch"]}, 
	{"name": "vd3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10A, "cpath": NO_CASTLE, "tile": [0x0D, 0x2E], "out": ["vd4"]}, 
	{"name": "vd4", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x119, "cpath": NORTH_PATH, "tile": [0x0D, 0x30], "out": ["c3"]}, 
	{"name": "vs1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x109, "cpath": NO_CASTLE, "tile": [0x04, 0x2E], "out": ["vs2", "sw2"]}, 
	{"name": "vs2", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x001, "cpath": NORTH_CLEAR, "tile": [0x0C, 0x03], "out": ["vs3"]}, 
	{"name": "vs3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x002, "cpath": NORTH_CLEAR, "tile": [0x0E, 0x03], "out": ["vfort"]}, 
	{"name": "cba", "world": 4, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00F, "cpath": NORTH_CLEAR, "tile": [0x14, 0x05], "out": ["cookie", "soda"]}, 
	{"name": "soda", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x011, "cpath": NO_CASTLE, "tile": [0x14, 0x08], "out": ["sw3"]}, 
	{"name": "cookie", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x010, "cpath": NORTH_CLEAR, "tile": [0x17, 0x05], "out": ["c4"]}, 
	{"name": "bb1", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00C, "cpath": NO_CASTLE, "tile": [0x14, 0x03], "out": ["bb2"]}, 
	{"name": "bb2", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00D, "cpath": NO_CASTLE, "tile": [0x16, 0x03], "out": ["c4"]}, 
	{"name": "foi1", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11E, "cpath": NORTH_PATH, "tile": [0x09, 0x37], "out": ["foi2", "fgh"]}, 
	{"name": "foi2", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x120, "cpath": NO_CASTLE, "tile": [0x0B, 0x3A], "out": ["foi3", "bswitch"]}, 
	{"name": "foi3", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x123, "cpath": NORTH_CLEAR, "tile": [0x09, 0x3C], "out": ["fgh", "c5"]}, 
	{"name": "foi4", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11F, "cpath": NORTH_PATH, "tile": [0x05, 0x3A, ], "out": ["foi2", "fsecret"]}, 
	{"name": "fsecret", "world": 5, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x122, "cpath": NORTH_PATH, "tile": [0x05, 0x3C], "out": ["ffort"]}, 
	{"name": "ci1", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x022, "cpath": NO_CASTLE, "tile": [0x18, 0x16], "out": ["cgh"]}, 
	{"name": "ci2", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x024, "cpath": NORTH_PATH, "tile": [0x15, 0x1B], "out": ["ci3", "csecret"]}, 
	{"name": "ci3", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x023, "cpath": NO_CASTLE, "tile": [0x13, 0x1B], "out": ["ci3", "cfort"]}, 
	{"name": "ci4", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x01D, "cpath": NORTH_PATH, "tile": [0x0F, 0x1D], "out": ["ci5"]}, 
	{"name": "ci5", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x01C, "cpath": NORTH_PATH, "tile": [0x0C, 0x1D], "out": ["c6"]}, 
	{"name": "csecret", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x117, "cpath": NORTH_CLEAR, "tile": [0x18, 0x29], "out": ["c6"]}, 
	{"name": "vob1", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x116, "cpath": NORTH_CLEAR, "tile": [0x1C, 0x27], "out": ["vob2"]}, 
	{"name": "vob2", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x115, "cpath": NORTH_PATH, "tile": [0x1A, 0x27], "out": ["bgh", "bfort"]}, 
	{"name": "vob3", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x113, "cpath": NORTH_PATH, "tile": [0x15, 0x27], "out": ["vob4"]}, 
	{"name": "vob4", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10F, "cpath": NORTH_PATH, "tile": [0x15, 0x25], "out": ["sw5", "c7"]}, 
	{"name": "c1", "world": 1, "exits": 1, "castle": 1, "palace": 0, "ghost": 0, "water": 0, "id": 0x101, "cpath": NORTH_PATH, "tile": [0x0A, 0x22], "out": ["dp1"]}, 
	{"name": "c2", "world": 2, "exits": 1, "castle": 2, "palace": 0, "ghost": 0, "water": 0, "id": 0x007, "cpath": NORTH_PATH, "tile": [0x0D, 0x0C], "out": ["vd1"]}, 
	{"name": "c3", "world": 3, "exits": 1, "castle": 3, "palace": 0, "ghost": 0, "water": 0, "id": 0x11C, "cpath": NORTH_PATH, "tile": [0x0D, 0x32], "out": ["cba"]}, 
	{"name": "c4", "world": 4, "exits": 1, "castle": 4, "palace": 0, "ghost": 0, "water": 0, "id": 0x00E, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x03], "out": ["foi1"]}, 
	{"name": "c5", "world": 5, "exits": 1, "castle": 5, "palace": 0, "ghost": 0, "water": 0, "id": 0x020, "cpath": NORTH_CLEAR, "tile": [0x18, 0x12], "out": ["ci1"]}, 
	{"name": "c6", "world": 6, "exits": 1, "castle": 6, "palace": 0, "ghost": 0, "water": 0, "id": 0x01A, "cpath": NORTH_PATH, "tile": [0x0C, 0x1B], "out": ["sgs"]}, 
	{"name": "c7", "world": 7, "exits": 1, "castle": 7, "palace": 0, "ghost": 0, "water": 0, "id": 0x110, "cpath": NORTH_PATH, "tile": [0x18, 0x25], "out": ["frontdoor"]}, 
	{"name": "vfort", "world": 3, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 1, "id": 0x00B, "cpath": NORTH_CLEAR, "tile": [0x10, 0x03], "out": ["bb1"]}, 
	{"name": "ffort", "world": 5, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x01F, "cpath": NORTH_CLEAR, "tile": [0x16, 0x10], "out": ["sw4"]}, 
	{"name": "cfort", "world": 6, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x01B, "cpath": NORTH_CLEAR, "tile": [0x0F, 0x1B], "out": ["ci4"]}, 
	{"name": "bfort", "world": 7, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x111, "cpath": NORTH_PATH, "tile": [0x1A, 0x25], "out": ["backdoor"]}, 
	{"name": "dgh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x004, "cpath": NO_CASTLE, "tile": [0x05, 0x0A], "out": ["topsecret", "dp3"]}, 
	{"name": "dsh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x013, "cpath": NO_CASTLE, "tile": [0x07, 0x10], "out": ["ds2", "sw1"]}, 
	{"name": "vgh", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x107, "cpath": NORTH_CLEAR, "tile": [0x09, 0x2C], "out": ["vd3"]}, 
	{"name": "fgh", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x11D, "cpath": NORTH_CLEAR, "tile": [0x07, 0x37], "out": ["foi1", "foi4"]}, 
	{"name": "cgh", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x021, "cpath": NORTH_CLEAR, "tile": [0x15, 0x16], "out": ["ci2"]}, 
	{"name": "sgs", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 2, "water": 1, "id": 0x018, "cpath": NORTH_PATH, "tile": [0x0E, 0x17], "out": ["vob1"]}, 
	{"name": "bgh", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x114, "cpath": NORTH_PATH, "tile": [0x18, 0x27], "out": ["vob3", "c7"]}, 
	{"name": "sw1", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x134, "cpath": NO_CASTLE, "tile": [0x15, 0x3A], "out": ["sw1", "sw2"]}, 
	{"name": "sw2", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x130, "cpath": NO_CASTLE, "tile": [0x16, 0x38], "out": ["sw2", "sw3"]}, 
	{"name": "sw3", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x132, "cpath": NO_CASTLE, "tile": [0x1A, 0x38], "out": ["sw3", "sw4"]}, 
	{"name": "sw4", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x135, "cpath": NO_CASTLE, "tile": [0x1B, 0x3A], "out": ["sw4", "sw5"]}, 
	{"name": "sw5", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x136, "cpath": NO_CASTLE, "tile": [0x18, 0x3B], "out": ["sw1", "sp1"]}, 
	{"name": "sp1", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12A, "cpath": NORTH_CLEAR, "tile": [0x14, 0x33], "out": ["sp2"]}, 
	{"name": "sp2", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12B, "cpath": NORTH_CLEAR, "tile": [0x17, 0x33], "out": ["sp3"]}, 
	{"name": "sp3", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12C, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x33], "out": ["sp4"]}, 
	{"name": "sp4", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12D, "cpath": NORTH_CLEAR, "tile": [0x1D, 0x33], "out": ["sp5"]}, 
	{"name": "sp5", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x128, "cpath": NORTH_CLEAR, "tile": [0x1D, 0x31], "out": ["sp6"]}, 
	{"name": "sp6", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x127, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x31], "out": ["sp7"]}, 
	{"name": "sp7", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x126, "cpath": NORTH_CLEAR, "tile": [0x17, 0x31], "out": ["sp8"]}, 
	{"name": "sp8", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x125, "cpath": NORTH_CLEAR, "tile": [0x14, 0x31], "out": ["yi2"]},
	
	// switches
	{"name": "yswitch", "world": 1, "exits": 0, "castle": 0, "palace": 1, "ghost": 0, "water": 0, "id": 0x014, "cpath": NO_CASTLE, "tile": [0x02, 0x11], "out": []}, 
	{"name": "gswitch", "world": 2, "exits": 0, "castle": 0, "palace": 4, "ghost": 0, "water": 0, "id": 0x008, "cpath": NO_CASTLE, "tile": [0x01, 0x0D], "out": []}, 
	{"name": "rswitch", "world": 3, "exits": 0, "castle": 0, "palace": 3, "ghost": 0, "water": 0, "id": 0x11B, "cpath": NO_CASTLE, "tile": [0x0B, 0x32], "out": []}, 
	{"name": "bswitch", "world": 5, "exits": 0, "castle": 0, "palace": 2, "ghost": 0, "water": 0, "id": 0x121, "cpath": NO_CASTLE, "tile": [0x0D, 0x3A], "out": []}, 
	
	// warps
	{"name": "warp-sw1", "exits": 0, "id": 0x016, "tile": [0x07, 0x12], "warp": 0x06, "rwarp": 0x0D, "events": [{"stageid": 0x136, "secret": 0}]}, 
	{"name": "warp-sw2", "exits": 0, "id": 0x108, "tile": [0x01, 0x2E], "warp": 0x0E, "rwarp": 0x0F, "events": [{"stageid": 0x134, "secret": 0}, {"stageid": 0x134, "secret": 1}]}, 
	{"name": "warp-sw3", "exits": 0, "id": 0x012, "tile": [0x10, 0x0F], "warp": 0x10, "rwarp": 0x11, "events": [{"stageid": 0x130, "secret": 0}, {"stageid": 0x130, "secret": 1}]}, 
	{"name": "warp-sw4", "exits": 0, "id": 0x01E, "tile": [0x14, 0x10], "warp": 0x12, "rwarp": 0x13, "events": [{"stageid": 0x132, "secret": 0}, {"stageid": 0x132, "secret": 1}]}, 
	{"name": "warp-sw5", "exits": 0, "id": 0x10C, "tile": [0x15, 0x23], "warp": 0x19, "rwarp": 0x15, "events": [{"stageid": 0x135, "secret": 0}, {"stageid": 0x135, "secret": 1}]}, 
	{"name": "warp-sp",  "exits": 0, "id": 0x131, "tile": [0x18, 0x38], "warp": 0x16, "rwarp": 0x17, "events": [{"stageid": 0x136, "secret": 1}]}, 
	
	// other
	{"name": "topsecret", "exits": 0, "id": 0x003, "tile": [0x05, 0x08]}, 
];

var SUBMAP_LINKS = [
	// pipes
	{ 'pipe': true,  'from': 'dsh',     'to': 'ds2' },
	{ 'pipe': true,  'from': 'ds2',     'to': 'dp3' },
	{ 'pipe': true,  'from': 'vs1',     'to': 'vs2' },
	{ 'pipe': true,  'from': 'c3',      'to': 'cba' },
	{ 'pipe': true,  'from': 'ci2',     'to': 'csecret' },
	{ 'pipe': true,  'from': 'csecret', 'to': 'c6' },
	
	// screen exits
	{ 'pipe': false, 'from': 'yi1',     'to': 'yswitch' },
	{ 'pipe': false, 'from': 'c1',      'to': 'dp1' },
	{ 'pipe': false, 'from': 'c2',      'to': 'vd1' },
	{ 'pipe': false, 'from': 'c4',      'to': 'foi1' },
	{ 'pipe': false, 'from': 'fsecret', 'to': 'ffort' },
	{ 'pipe': false, 'from': 'foi3',    'to': 'c5' },
	{ 'pipe': false, 'from': 'sgs',     'to': 'vob1' },
];

var OFFSCREEN_EVENT_NUMBERS = 0x268E4;
var OFFSCREEN_LOCATIONS     = 0x2693C;
var LAYER1_EVENT_LOCATIONS  = 0x2585D;

function isPermanentTile(stage)
{
	// some specific tiles MUST be permanent tiles, since the game does not trigger the reveal
	var PERMANENT_TILES = [ 'sw1', 'sw2', 'sw3', 'sw4', 'sw5', 'sp1', 'yi1', 'yi2', 'foi1', 'ffort' ];
	if (PERMANENT_TILES.contains(stage.name) || isCastle(stage) || isCastle(stage.copyfrom)) return true;
	
	var REVEALED_TILES = [ 'ci1', 'ci2', 'ci5', 'bb1', 'bb2' ];
	if (REVEALED_TILES.contains(stage.name)) return false;
	
	// if this is in FOI, try to grab unrevealed tiles
	if (stage.tile[0] >= 0x00 && stage.tile[0] < 0x10 && 
	    stage.tile[1] >= 0x35 && stage.tile[1] < 0x40) return false;
	
	// otherwise, only permanent if special tile
	return stage.copyfrom.ghost == 1 || stage.copyfrom.castle;
}

function isCastle(stage)
{ return stage.castle > 0; }

function isSwitchPalace(stage, rom)
{ return [0x76, 0x77, 0x78, 0x79].contains(rom[getOverworldOffset(stage)]); }

function getCopiedStage(stages, name)
{
	for (var i = 0; i < stages.length; ++i) 
		if (stages[i].copyfrom.name == name) return stages[i];
	return null;
}

// koopa kid boss room sublevels, indexed by castle #
var koopa_kids = [0x1F6, 0x0E5, 0x1F2, 0x0D9, 0x0CC, 0x0D3, 0x1EB];

var SEC_EXIT_OFFSET_LO = 0x2F800;
var SEC_EXIT_OFFSET_HI = 0x2FE00;
var SEC_EXIT_OFFSET_X1 = 0x2FA00;
var SEC_EXIT_OFFSET_X2 = 0x2FC00;

var TRANSLEVEL_EVENTS = 0x2D608;

// bind `this` to null to disable downloading the ROM
function randomizeROM(buffer, seed)
{
	var stages = deepClone(SMW_STAGES);
	if ($('#randomize_95exit').is(':checked'))
	{
		// remove dgh and topsecret from rotation
		var toremove = [0x003, 0x004];
		stages = $.grep(stages, function(x){ return !toremove.contains(x.id); });
	}
	
	// if we aren't randomizing the warps, remove them from the stage list
	if (!$('#randomize_warps').is(':checked'))
		stages = $.grep(stages, function(x){ return !('warp' in x); });
	
	var random = new Random(seed);
	var vseed = random.seed.toHex(8);
	
	$('#custom-seed').val('');
	$('#used-seed').text(vseed);
	
	var rom = new Uint8Array(buffer);
	if (rom.length == 0x80200)
		rom = new Uint8Array(rom.buffer, 0x200, 0x80000);
	
	// patch the rom with necessary patches
	applyPatches(ROM_PATCHES, rom);
	
	replaceFileSelect(TITLE_TEXT_COLOR, rom);
	
	// fix some base tiles for consistency -- get your shit together Nintendo
	rom[0x679F1] = 0x78; // ysp - is green, but gets fixed by offscreen event
	rom[0x67D51] = 0x5A; // thanks for leaving an old switch just laying around
	
	// change switch palaces to use higher event numbers
	fixSwitchPalaceEventNumbers(stages, rom);
	
	// randomize all of the slippery/water flags
	randomizeFlags(random, rom);
	
	// NOTE: MAKE SURE ANY TABLES BACKED UP BY THIS ROUTINE ARE GENERATED *BEFORE*
	// THIS POINT. OTHERWISE, WE ARE BACKING UP UNINITIALIZED MEMORY!
	backupData(stages, rom);
	
	if ($('#randomize_stages').is(':checked'))
	{
		// randomize the zero-exit stages
		var zeroes = $.grep(stages, function(x){ return x.exits == 0; });
		randomizeZeroes(zeroes, random, rom);
		
		// put all the stages into buckets (any stage in same bucket can be swapped)
		var buckets = makeBuckets($.grep(stages, function(x){ return !x.copyfrom; }), sameStageBucket);
		
		// decide which stages will be swapped with which others
		for (var i = 0; i < buckets.length; ++i) shuffle(buckets[i], random);
	}
	
	
	// this is a quick fix for cases where we don't do any swaps
	for (var i = 0; i < stages.length; ++i)
		if (!stages[i].copyfrom) stages[i].copyfrom = stages[i];
	
	if ($('#randomize_koopakids').is(':checked'))
		randomizeKoopaKids(random, rom);
	
	if ($('#randomize_bowserdoors').is(':checked'))
		randomizeBowser8Doors(random, rom);
	
	if ($('#randomize_levelexits').is(':checked'))
	{
		randomizeYoshiWings(stages, random, rom);
		randomizeKeyLocations(stages, random, rom);
		randomizeCI2(random, rom);
	}
		
	// randomize bowser's castle
	switch ($('input[name="bowser"]:checked').val())
	{
		case 'random': randomizeBowserEntrances(random, rom); break;
		case 'gauntlet': generateGauntlet(random, 8, rom); break;
		case 'minigauntlet': generateGauntlet(random, random.nextIntRange(2,5), rom); break;
	}
		
	// how should powerups be affected
	switch ($('input[name="powerups"]:checked').val())
	{
		case 'random': randomizePowerups(random, rom, stages); break;
		case 'nocape': removeCape(rom, stages); break;
		case 'smallonly': removeAllPowerups(rom, stages); break;
	}
	
	if ($('#noyoshi').is(':checked')) removeYoshi(rom, stages);
	
	// remove all autoscroller sprites and update v-scroll, if checked
	if ($('#remove_autoscrollers').is(':checked')) removeAutoscrollers(rom);
	
	// update level names if randomized
	if ($('#customnames').is(':checked')) randomizeLevelNames(random.clone(), rom);
	
	// swap all the level name pointers RIGHT before we perform the copy
	if ('random_stage' == $('input[name="levelnames"]:checked').val())
		shuffleLevelNames(stages, random);
	
	for (var i = 0; i < stages.length; ++i)
	{
		performCopy(stages[i], rom);
		
		// randomly swap the normal/secret exits
		if ($('#randomize_exits').is(':checked') && random.nextFloat() > 0.5)
			swapExits(stages[i], rom);
	}
	
	// fix castle/fort/switch overworld tile events
	fixOverworldEvents(stages, rom);
	
	// fix Roy/Larry castle block paths
	fixBlockPaths(stages, rom);
	
	// fix message box messages
	fixMessageBoxes(stages, rom);
	
	if ($('#randomize_bossdiff').is(':checked'))
		randomizeBossDifficulty(random, rom);
	
	// disable the forced no-yoshi intro on moved stages
	rom[0x2DA1D] = 0x60;
	
	if ($('#randomize_noyoshi').is(':checked'))
		randomizeNoYoshi([].concat(stages, bowserentrances), random, rom);
	
	if ($('#randomize_enemies').is(':checked'))
		randomizeEnemyProperties(stages, random, rom);
	
	if ($('#randomize_colors').is(':checked'))
	{
		randomizeBackgrounds(random, rom);
		randomizeColorPalettes(stages, random, rom);
	}
	
	// update other text in the game if randomized
	if ($('#customtext').is(':checked'))
	{
		var newrandom = random.clone();
		randomizeEndGameText(newrandom, rom);
	}
	
	// (☆^O^☆)
	// (☆^O^☆) (☆^O^☆)
	// (☆^O^☆) (☆^O^☆) (☆^O^☆)
	// (☆^O^☆) (☆^O^☆)
	// (☆^O^☆)
	if ($('#pogyo_mode').is(':checked')) pogyo(stages, random, rom);
	
	// add all of the cheat options (if any)
	cheatOptions(rom);
	
	// validate the rom before we spit it out
	validateROM(stages, rom);

	// write version number and the randomizer seed to the rom
	var checksum = getChecksum(rom).toHex(4);
	writeToTitle(VERSION_STRING + " @" + vseed + "-" + checksum, 0x2, rom);
	
	// update the credits
	rewriteCredits(random, rom);
	
	// write metadata to the intro cutscene
	//updateIntroText(vseed, rom);
	
	updateFileSelect({
		start1p: "1P " + (EN_US ? 'RANDOMIZER' : 'RANDOMISER'),
		start2p: "2P " + (EN_US ? 'RANDOMIZER' : 'RANDOMISER'),
	},
	TITLE_TEXT_COLOR, rom);
	
	// fix the checksum (not necessary, but good to do!)
	fixChecksum(rom);
	
	// update the location.hash
	var preset = +$('#preset').val();
	if (preset)
	{
		var newstate = '#!/' + vseed + '/' + $('#preset').val();
		// TODO: put this link into the alert element
	}
	
	// return the modified buffer
	return { seed: vseed, preset: preset, buffer: rom.buffer };
}

function shuffle(stages, random)
{
	var rndstages = stages.slice(0).shuffle(random);
	for (var i = 0; i < stages.length; ++i)
		stages[i].copyfrom = rndstages[i];
}

function fixSwitchPalaceEventNumbers(stages, rom)
{
	var switches = $.grep(stages, function(x){ return x.palace; });
	for (var z = 0; z < switches.length; ++z)
	{
		var stage = switches[z], newevent = 0x70 + stage.palace;
		var trans = getTranslevel(stage.id);
		
		var oldevent = rom[TRANSLEVEL_EVENTS + trans];
		rom[TRANSLEVEL_EVENTS + trans] = newevent;
		
		// fix destruction event table
		for (var i = 0; i < 16; ++i)
			if (rom[DESTRUCTION_EVENT_NUMBERS+i] == oldevent)
				rom[DESTRUCTION_EVENT_NUMBERS+i]  = newevent;
		
		// fix no-walk translevel table
		for (var i = 0; i < 6; ++i)
			if (rom[0x2106C + i * 2] == oldevent)
				rom[0x2106C + i * 2]  = newevent;
	}
	
	// update event number max
	rom[0x25859] = 0x75;
}

/*
	$00B3D8: Yoshi's Island palettes 4-7, colors 1-7.
	$00B410: Main map palettes 4-7, colors 1-7.
	$00B448: Star World palettes 4-7, colors 1-7.
	$00B480: Vanilla Dome / Valley of Bowser palettes 4-7, colors 1-7.
	$00B4B8: Forest of Illusion palettes 4-7, colors 1-7.
	$00B4F0: Special World palettes 4-7, colors 1-7.
	
	$00B732: Yoshi's Island [special] palettes 4-7, colors 1-7.
    $00B76A: Main map [special] palettes 4-7, colors 1-7.
    $00B7A2: Star World [special] palettes 4-7, colors 1-7.
    $00B7DA: Vanilla Dome / Valley of Bowser [special] palettes 4-7, colors 1-7.
	$00B812: Forest of Illusion [special] palettes 4-7, colors 1-7.
    $00B84A: Special World [special] palettes 4-7, colors 1-7.
*/
var OVERWORLD_MAPS = 
[
	{submapid: 0, palette: 0, ug: 0, palette_addr: [0x3410, 0x376A], xmin: 0x00, xmax: 0x1F, ymin: 0x00, ymax: 0x1F, name: 'MAIN'},
	{submapid: 1, palette: 1, ug: 0, palette_addr: [0x33D8, 0x3732], xmin: 0x00, xmax: 0x0F, ymin: 0x20, ymax: 0x29, name: 'YI'},
	{submapid: 2, palette: 2, ug: 1, palette_addr: [0x3480, 0x37DA], xmin: 0x00, xmax: 0x0F, ymin: 0x2B, ymax: 0x34, name: 'VD'},
	{submapid: 3, palette: 3, ug: 0, palette_addr: [0x34B8, 0x3812], xmin: 0x00, xmax: 0x0F, ymin: 0x35, ymax: 0x3F, name: 'FOI'},
	{submapid: 4, palette: 2, ug: 1, palette_addr: [0x3480, 0x37DA], xmin: 0x10, xmax: 0x1F, ymin: 0x20, ymax: 0x29, name: 'VOB'},
	{submapid: 5, palette: 4, ug: 1, palette_addr: [0x34F0, 0x384A], xmin: 0x10, xmax: 0x1F, ymin: 0x2B, ymax: 0x34, name: 'SP'},
	{submapid: 6, palette: 5, ug: 1, palette_addr: [0x3448, 0x37A2], xmin: 0x10, xmax: 0x1F, ymin: 0x35, ymax: 0x3F, name: 'SW'},
];

// returns a value from the OVERWORLD_MAPS map
function getMapForStage(stage)
{
	var x = stage.tile[0], y = stage.tile[1];
	for (var i = 0; i < OVERWORLD_MAPS.length; ++i)
	{
		var m = OVERWORLD_MAPS[i];
		if (x >= m.xmin && x <= m.xmax && 
		    y >= m.ymin && y <= m.ymax) return m;
	}
	
	// what madness would have us reach this point?
	throw new Error("Stage " + stage.name + " doesn't seem to correspond to any map/submap.");
}

var OFFSCREEN_EVENT_TILES =
{
	'dp1': 0x00,
	'c1': 0x05,
	'dp3': 0x08,
	'vs2': 0x10,
	'ds2': 0x13,
	'cba': 0x14,
	'csecret': 0x1D,
	'vob1': 0x1F,
	'yswitch': 0x20,
	'vd1': 0x26,
};

function performCopy(stage, rom)
{
	// copy it back in place if needed
	if (!stage.copyfrom || !stage.copyfrom.data) return;
	
	// console.log(stage.copyfrom.name + ' --> ' + stage.name);
	
	// nothing needs to be done for warps
	if (!stage.copyfrom.warp)
	{
		for (var j = 0; j < LEVEL_OFFSETS.length; ++j)
		{
			var o = LEVEL_OFFSETS[j], start = o.offset + o.bytes * stage.id;
			rom.set(stage.copyfrom.data[o.name], start);
		}
	
		// if we move a stage between 0x100 banks, we need to move sublevels
		// screen exits as well might need to be fixed, even if we don't change banks
		fixSublevels(stage, rom);
	}
	
	var skiprename = $('input[name="levelnames"]:checked').val() == 'same_overworld';
	for (var j = 0; j < trans_offsets.length; ++j)
	{
		var o = trans_offsets[j], start = o.offset + o.bytes * stage.translevel;
		if (skiprename && o.name == 'nameptr') continue;
		rom.set(stage.copyfrom.data[o.name], start);
	}
	
	// castle destruction sequence translevels
	if (stage.copyfrom.castle > 0 && stage.copyfrom.castle < 8)
		rom[0x049A7 + stage.copyfrom.castle - 1] = stage.translevel;
	
	if (stage.copyfrom.id == 0x013) rom[0x04A0C] = stage.translevel; // dsh translevel
	if (stage.copyfrom.id == 0x024) rom[0x2DAE5] = stage.translevel; // ci2 translevel
	if (stage.copyfrom.id == 0x018) rom[0x20DD8] = stage.translevel; // sgs translevel
	
	// moles appear slower in yi2
	if (stage.copyfrom.id == 0x106)
	{
		rom.set([0xAC, 0xBF, 0x13, 0xEA], 0x0E2F6);
		rom[0x0E2FD] = stage.translevel;
	}
	
	// if the stage we are copying from is default "backwards", we should fix all the
	// associated exits since they have their exits unintuitively reversed
	if ([0x004, 0x11D].contains(stage.copyfrom.id))
	{
		swapExits(stage.copyfrom, rom);
		swapExits(stage, rom);
	}
	
	// update the overworld tile
	if (stage.copyfrom.data.owtile)
	{
		var ow = getRevealedTile(stage.copyfrom.data.owtile);
		if (stage.copyfrom.palace) ow = getFreeSwitchTile(stage, rom);
		
		if (isPermanentTile(stage)) ow = getPermanentTile(ow);
		rom[getOverworldOffset(stage)] = ow;
		
		// try to update switch palace colors
		if (stage.copyfrom.palace) setSwitchColor(stage, stage.copyfrom.palace, rom);
		
		// castle 1 is copied into the small version of YI on the main map,
		// which means that whatever stage ends up at c1 needs to be copied there as well
		if (stage.name == 'c1')
		{
			rom[0x67A54] = ow;
			if (!isCastle(stage.copyfrom))
				rom[0x67A44] = 0x00;
		}
		
		// moving a castle here, need to add a castle top
		if (isCastle(stage.copyfrom) && !isCastle(stage))
			rom[getOverworldOffset(stage, true)] = [0x00, 0xA6, 0x4C][stage.cpath];
			
		// moving a castle away, need to fix the top tile
		if (!isCastle(stage.copyfrom) && isCastle(stage))
			rom[getOverworldOffset(stage, true)] = [0x00, 0x00, 0x10][stage.cpath];
	
		// fix offscreen event tiles
		if (stage.name in OFFSCREEN_EVENT_TILES)
		{
			var x = OFFSCREEN_EVENT_TILES[stage.name];
			var tile = getPermanentTile(ow);
			
			if (stage.name == 'c1' && stage.copyfrom.castle) tile = 0x81;
			rom.writeBytes(2, 0x26994+x*2, tile);
			
			// if this is a tile that should always be revealed anyways,
			// disable the event for the offscreen events table
			if (stage.name != 'c1' && isPermanentTile(stage))
				rom[OFFSCREEN_EVENT_NUMBERS+x] = 0xFF;
			
			// if this is the dp3 offscreen event and the tile is permanent,
			// prevent the event from triggering (weird special case) (event x77 is unused)
			if (stage.name == 'dp3' && isPermanentTile(stage)) rom[0x268EC] = 0x77;
		}
	}
}

function setSwitchColor(stage, newcolor, rom)
{
	if (!isSwitchPalace(stage, rom)) 
		throw new Error('Stage "' + stage.name + '" is not a switch palace.');
	
	var tcolor = [null, 0x03FF, 0x7E09, 0x2D7F, 0x1348][newcolor];
	var tile = rom[getOverworldOffset(stage)];
	
	var map = getMapForStage(stage);
	
	// if this is the 0x76/0x77 tile on FOI, swap with 0x78/0x79 to make the color work
	if (map.name == 'FOI' && (tile & 0xFE) == 0x76)
		tile = rom[getOverworldOffset(stage)] = 0x78 | (tile & 0x01);
	
	var offset = ((tile & 0xFE) == 0x76 ? 0x36 : 0x1A);
	for (var i = 0; i < map.palette_addr.length; ++i)
		rom.writeBytes(2, map.palette_addr[i] + offset, tcolor);
}

function getFreeSwitchTile(stage, rom)
{
	var tiles = [0x78, 0x76];
	var map = getMapForStage(stage);
	
	var maps = $.grep(OVERWORLD_MAPS, 
		function(x){ return x.palette == map.palette; });

	for (var k = 0; k < maps.length; ++k)
	{
		map = maps[k];
		for (var y = map.ymin; y <= map.ymax; ++y)
		for (var x = map.xmin; x <= map.xmax; ++x)
		{
			var ndx = tiles.indexOf(rom[getOverworldOffsetByCoords(x, y)]);
			if (ndx != -1) tiles.splice(ndx, 1);
		}
	}
	
	if (tiles.length) return tiles[0];
	throw new Error('No free switch tiles remaining for this location.');
}
	
var KOOPA_SETS = [
	[0x00, 0x01, 0x02, 0x03], // shell-less
	[0x04, 0x05, 0x06, 0x07], // shelled
	[0x08, 0x0A, 0x0B], // flying
	[0x09, 0x0C], // winged, not flying
	[0x23, 0x24, 0x25], // net koopas
];

function randomizeEnemyProperties(stages, random, rom)
{
	// randomize color palettes for koopas
	for (var i = 0; i < KOOPA_SETS.length; ++i)
	{
		var koopaset = KOOPA_SETS[i];
		var kooprand = koopaset.slice(0).shuffle(random);
		
		var palettes = {};
		for (var j = 0; j < koopaset.length; ++j)
			palettes[koopaset[j]] = rom[0x3F3FE + koopaset[j]] & 0x0E;
		
		for (var j = 0; j < koopaset.length; ++j)
		{
			rom[0x3F3FE + koopaset[j]] &= 0xF1;
			rom[0x3F3FE + koopaset[j]] |= palettes[kooprand[j]];
		}
	}
	
	// randomize the table of yoshi+shell color actions
	// hijack to allow information about yoshi/shell fire to be in table
	rom.set([0x20, 0xBF, 0xFF, 0xEA, 0xEA, 0xA5, 0x60      ], 0x0F195);
	rom.set([0x85, 0x60, 0x29, 0x02, 0x8D, 0x1E, 0x14, 0x60], 0x0FFBF);
	rom.set([0xA5, 0x60, 0x29, 0x04, 0xF0, 0x6F, 0x80, 0x0A], 0x0F26A);
	
	// get table (add fire information for red yoshi)
	// table is format (Y * 4 + S) where Y/S are both color for yoshi/shell in order GRYB
	var table = rom.slice(0x0F137, 0x0F137+16);
	for (var i = 0; i < 4; ++i)
	{
		table[1 * 4 + i] |= 0x4; // red yoshi always spits fire
		table[i * 4 + 1] |= 0x4; // red shell always spits fire
	}
	
	// this is going to cause a lot of chaos...
	// write the table back to the rom shuffled
	rom.set(Array.prototype.shuffle.call(table, random), 0x0F137);
}

var VALID_FGP_BY_TILESET = 
{
	0x0: [0, 1,    3, 4, 5, 6, 7], // Normal 1
	0x1: [         3, 4, 5, 6, 7], // Castle 1
	0x2: [   1, 2, 3, 4, 5,    7], // Rope 1
	0x3: [      2, 3, 4, 5, 6, 7], // Underground 1
	0x4: [   1, 2, 3, 4, 5, 6, 7], // Switch Palace 1
	0x5: [            4, 5,     ], // Ghost House 1
	0x6: [   1, 2, 3, 4, 5,    7], // Rope 2
	0x7: [0, 1,    3, 4, 5, 6, 7], // Normal 2
	0x8: [   1, 2, 3, 4, 5,    7], // Rope 3
	0x9: [   1, 2, 3, 4, 5, 6, 7], // Underground 2
	0xA: [   1, 2, 3, 4, 5, 6, 7], // Switch Palace 2
	0xB: [         3, 4, 5, 6, 7], // Castle 2
	0xC: [                      ], // Cloud/Forest
	0xD: [            4, 5,     ], // Ghost House 2
	0xE: [      2, 3, 4, 5, 6, 7], // Underground 3
};

var VALID_BGP_BY_LAYER2 = 
{
	0xFFDD44: [0, 1, 2, 3, 4, 5, 6, 7], // Clouds
	0xFFEC82: [0,    2, 3,    5, 6, 7], // Bushes
	0xFFEF80: [   1,    3,    5, 6, 7], // Ghost House
	0xFFDE54: [0, 1, 2, 3,    5, 6, 7], // Small Hills
	0xFFF45A: [   1,    3,       6,  ], // Castle
	0xFFE674: [0, 1, 2, 3,    5, 6, 7], // Bonus
	0xFFDAB9: [            4,        ], // Water
	0xFFE8EE: [0, 1, 2, 3, 4, 5, 6, 7], // Empty/Layer 2
	0xFFE7C0: [0, 1, 2, 3,    5, 6, 7], // Mountains
	0xFFE103: [0, 1, 2, 3,    5, 6, 7], // Castle Pillars
	0xFFDF59: [0, 1, 2, 3,    5, 6, 7], // Mountains & Clouds
	0xFFE8FE: [   1,             6,  ], // Cave
	0xFFD900: [   1,                 ], // P. Hills
	0xFFE472: [0, 1, 2, 3,    5, 6, 7], // Big Hills
	0xFFE684: [   1,    3,    5, 6,  ], // Stars
	0xFFF175: [0, 1, 2, 3,    5, 6, 7], // Ghost Ship
	0xFFDC71: [0, 1, 2, 3,    5, 6, 7], // Hills & Clouds
	0x06861B: [0, 1, 2, 3, 4, 5, 6, 7], // Ghost House Exit
};

var VALID_BGC_BY_LAYER2 = 
{
	0xFFDD44: [0, 1, 2, 3, 4, 5, 6, 7], // Clouds
	0xFFEC82: [0, 1, 2, 3, 4, 5, 6, 7], // Bushes
	0xFFEF80: [         3, 4,        ], // Ghost House
	0xFFDE54: [0, 1, 2, 3, 4, 5, 6, 7], // Small Hills
	0xFFF45A: [0, 1, 2, 3, 4, 5, 6, 7], // Castle
	0xFFE674: [0, 1, 2, 3, 4, 5, 6, 7], // Bonus
	0xFFDAB9: [      2, 3,    5,     ], // Water
	0xFFE8EE: [         3,    5,     ], // Empty/Layer 2
	0xFFE7C0: [0, 1, 2, 3, 4, 5, 6, 7], // Mountains
	0xFFE103: [0, 1, 2, 3, 4, 5, 6, 7], // Castle Pillars
	0xFFDF59: [0, 1, 2, 3, 4, 5, 6, 7], // Mountains & Clouds
	0xFFE8FE: [0, 1, 2, 3, 4, 5, 6, 7], // Cave
	0xFFD900: [0, 1, 2, 3, 4, 5, 6, 7], // P. Hills
	0xFFE472: [0, 1, 2, 3, 4, 5, 6, 7], // Big Hills
	0xFFE684: [      2, 3, 4, 5,     ], // Stars
	0xFFF175: [      2, 3, 4, 5,     ], // Ghost Ship
	0xFFDC71: [0, 1, 2, 3, 4, 5, 6, 7], // Hills & Clouds
	0x06861B: [0, 1, 2, 3, 4, 5, 6, 7], // Ghost House Exit
};

// first element is a simple indoors/outdoors bool to
// make sure indoor and outdoor bgs aren't swapped
var GFX_REQ_BY_LAYER2 = 
{
	0xFFDD44: [0, 0x19, null], // Clouds
	0xFFEC82: [0, 0x19, null], // Bushes
	0xFFEF80: [1, 0x0C,    4], // Ghost House
	0xFFDE54: [0, 0x19, null], // Small Hills
	0xFFF45A: [1, 0x1B, 0x18], // Castle (Blocks)
	0xFFE674: [1, 0x1B, null], // Bonus
	0xFFDAB9: [0, 0x0D,    3], // Water
//	0xFFE8EE: null,         // Empty/Layer 2
	0xFFE7C0: [0, 0x19, null], // Mountains
	0xFFE103: [1, 0x1B,    1], // Castle Pillars
	0xFFDF59: [0, 0x19, null], // Mountains & Clouds
	0xFFE8FE: [1, 0x0C,    3], // Cave
	0xFFD900: [0, 0x1B, null], // P. Hills
	0xFFE472: [0, 0x19, null], // Big Hills
	0xFFE684: [0, 0x0C,    2], // Stars
	0xFFF175: [1, 0x0C, null], // Ghost Ship
	0xFFDC71: [0, 0x19, null], // Hills & Clouds
//	0x06861B: null,         // Ghost House Exit
};

function randomizeColorPalettes(stages, random, rom)
{
	// random swap mario/luigi
	if (0 == random.nextInt(4))
	{
		var palettes = {
			'normal':    { addr: [0x032C8, 0x032DC], size: 20 },
			'fire':      { addr: [0x032F0, 0x03304], size: 20 },
			'overworld': { addr: [0x0359C, 0x035AA], size:  4 },
		};
		
		for (var k in palettes) if (palettes.hasOwnProperty(k))
		{
			var backup = {}, addr = palettes[k].addr, size = palettes[k].size;
			for (var i = 0; i < addr.length; ++i)
				backup[i] = rom.slice(addr[i], addr[i] + size);
			
			rom.set(backup[1], addr[0]);
			rom.set(backup[0], addr[1]);
		}
		
		// since swapping red/green on overworld swaps yoshi colors as well,
		// this remaps yoshi colors to fix the new irregularity
		rom.set([0x22, 0xCF, 0xFF, 0x01], 0x20D4D);
		rom.set(
		[
			0xC9, 0x08, 0x00, 0x90, 0x0D, 0xC9, 0x08, 0x00, 0xD0, 0x05, 0xA9, 0x0A, 
			0x00, 0x80, 0x03, 0xA9, 0x08, 0x00, 0x38, 0xE9, 0x04, 0x00, 0x6B
		], 
		0x0FFC7);
		
		// flip names
		rom[0x00FCB] = 0xD0; // player name in on-screen display
		rom[0x011DB] = 0xD0; // player name in start
		rom[0x2CCB4] = 0xD0; // player name in course clear
		
		// change title screen names
		updateFileSelect({
			marioA: "LUIGI",
			marioB: "LUIGI",
			marioC: "LUIGI",
		},
		TITLE_TEXT_COLOR, rom);
		
		// update endgame text
		updateEndGameText(
		[
			"Luigi's adventure is over.",
			"Luigi,the Princess,Yoshi,",
			"and his friends are going",
			"to take a vacation.",
		],
		rom);
	}
	
	// randomize all standard sublevels
	for (var id = 0; id < 0x200; ++id)
	{
		var layer1 = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
		var layer2 = getPointer(LAYER2_OFFSET + 3 * id, 3, rom);
		randomizeColorPaletteByAddr(random, layer1, layer2, rom);
	}
	
	// randomize all the CI2 sublevels as well
	randomizeColorPaletteByAddr(random, 0x06E9FB, null, rom);
	randomizeColorPaletteByAddr(random, 0x06EAB0, null, rom);
	randomizeColorPaletteByAddr(random, 0x06EB72, null, rom);
	randomizeColorPaletteByAddr(random, 0x06EBBE, null, rom);
	randomizeColorPaletteByAddr(random, 0x06EC7E, null, rom);
}

function randomizeColorPaletteByAddr(random, layer1, layer2, rom)
{
	var addr = snesAddressToOffset(layer1);
	
	var tileset =  rom[addr+4]       & 0xF;
	var fgp     =  rom[addr+3]       & 0x7;
	var bgp     = (rom[addr+0] >> 5) & 0x7;
	var bgc     = (rom[addr+1] >> 5) & 0x7;
	
	if (tileset != 0xC && !(tileset == 0x4 && fgp == 0))
	{
		fgp = random.from(VALID_FGP_BY_TILESET[tileset]);
		rom[addr+3] = (rom[addr+3] & 0xF8) | (fgp & 0x7);
	}
	
	if (layer2 !== null && layer2 in VALID_BGP_BY_LAYER2)
	{
		bgp = random.from(VALID_BGP_BY_LAYER2[layer2]);
		bgc = random.from(VALID_BGC_BY_LAYER2[layer2]);
		
		rom[addr+0] = (rom[addr+0] & 0x1F) | (bgp << 5);
		rom[addr+1] = (rom[addr+1] & 0x1F) | (bgc << 5);
	}
}

function randomizeBackgrounds(random, rom)
{
	var swaps = {}, keys = Object.keys(GFX_REQ_BY_LAYER2);
	
	// build the swaps table (which backgrounds are valid to swap into
	// a level with a given background)
	for (var i = 0; i < keys.length; ++i)
	{
		var ki = keys[i], s = swaps[+ki] = [];
		var check = GFX_REQ_BY_LAYER2[ki];
		
		for (var j = 0; j < keys.length; ++j)
		{
			var kj = keys[j], jreq = GFX_REQ_BY_LAYER2[kj];
			if (!jreq) continue;
			
			var match = true;
			for (var k = 0; k < jreq.length; ++k)
			{
				if (jreq[k] === null) break;
				match &= (jreq[k] == check[k]);
				if (!match) break;
			}
			
			if (match) s.push(+kj);
		}
	}
	
	// randomly assign all backgrounds for levels using standard layer2 pointers
	for (var id = 0; id < 0x200; ++id)
	{
		var layer2 = getPointer(LAYER2_OFFSET + 3 * id, 3, rom);
		if (!swaps[layer2] || !swaps[layer2].length) continue;
		
		var newlayer2 = random.from(swaps[layer2]) || layer2;
		rom.writeBytes(3, LAYER2_OFFSET + 3 * id, newlayer2);
		
		if (layer2 == 0xFFE103 && newlayer2 != 0xFFE103)
		{
			var sprites = getSpritesBySublevel(id, rom);
			deleteSprites([0xE6], sprites, rom);
		}
	}
}

function randomizeZeroes(stages, random, rom)
{
	var zeroes = $.grep(stages, function(x){ return x.exits == 0; }).shuffle(random);
	var switches = $.grep(stages, function(x){ return x.palace; }).shuffle(random);
	
	// the list of stages that can accept switch palace tiles
	var accept = zeroes.slice(0);
	var palettes = {};
	
	// just backup the palette information
	for (var i = 0; i < accept.length; ++i)
		accept[i].palette = getMapForStage(accept[i]).palette;
	
	var _accept = accept.slice(0);
	for (var i = 0; i < switches.length; ++i)
	{
		var x = random.nextInt(_accept.length);
		var which = _accept[x], p = which.palette;
		
		which.copyfrom = switches[i];
		_accept.splice(x, 1);
		
		if ((palettes[p] = 1 + (palettes[p] | 0)) == 2)
			_accept = $.grep(_accept, function(z){ return z.palette != p; });
	}
	
	var rem_a = $.grep(accept, function(x){ return !x.copyfrom; });
	var rem_b = $.grep(stages, function(x){ return !x.palace; }).shuffle(random);
	
	for (var i = 0, j = 0; i < rem_a.length; ++i)
		rem_a[i].copyfrom = rem_b[i];
	
	var STAR_FM_X = 0x20431, STAR_FM_Y = 0x20467;
	var STAR_TO_X = 0x2049D, STAR_TO_Y = 0x204D3;
	
	for (var i = 0; i < accept.length; ++i)
	{
		var stage = accept[i];
		if (stage.copyfrom.warp)
		{
			var map = getMapForStage(stage)
			var x = stage.tile[0], y = stage.tile[1];
			
			// event associated with revealing this moved star tile, if it hasn't been yet revealed
			for (var z = 0; z < stage.copyfrom.events.length; ++z)
			{
				var tlvl = getTranslevel(stage.copyfrom.events[z].stageid);
				var event = rom[TRANSLEVEL_EVENTS + tlvl] + stage.copyfrom.events[z].secret;
				
				// #$0SYX format data
				var s = (y >> 4) * 2 + (x >> 4);
				var pos = (((y & 0xF) << 4) | (x & 0xF)) - (s >= 0x4);
				
				// fix offscreen events
				for (var j = 0; j < 44; ++j)
					if (rom[OFFSCREEN_EVENT_NUMBERS + j] == event)
						rom.set([pos, s], OFFSCREEN_LOCATIONS + j*2);
					
				// if this is a proper layer 1 event, change star location
				var roffset = LAYER1_EVENT_LOCATIONS + event * 2;
				if (rom[roffset] || rom[roffset+1]) rom.set([pos, s], roffset);
			}
			
			if (map.submapid){ y -= 0x20; --x; }
			
			// fix outgoing (ow -> star) warp star tile position
			rom.set([x, map.submapid], STAR_FM_X + 2*stage.copyfrom.warp);
			rom.set([y, 0x00],         STAR_FM_Y + 2*stage.copyfrom.warp);
			
			x = x * 0x10 + 0x08;
			y = y * 0x10 + 0x08;
			
			// fix incoming (star -> ow) warp destination
			rom.set([x & 0xFF, ((x >> 8) & 0x01) | (map.submapid << 1)], STAR_TO_X + 2*stage.copyfrom.rwarp);
			rom.set([y & 0xFF, ((y >> 8) & 0x01)],                       STAR_TO_Y + 2*stage.copyfrom.rwarp);
			rom.set([y & 0xFF, ((y >> 8) & 0x01)],                       STAR_TO_Y + 2*stage.copyfrom.rwarp);
		}
	}
}

function pogyo(stages, random, rom)
{
	// enaqbzvmr unzzre oeb guebja vgrz
	rom[0x15AC4] = random.from([0x02, 0x04, 0x0A, 0x0A, 0x0B, 0x0B, 0x0D, 0x0E]);
	
	// frg crnpu'f guebja vgrz gb "fbzrguvat ryfr"
	rom[0x1A8EE] = 0xA2; // 0xB1;

	// change some sound effects, because fun...
	changeSound(SOUND_EFFECT_TRIGGER.NINTENDO_PRESENTS, SOUND_EFFECT.YOSHI_OW, rom);
	changeSound(SOUND_EFFECT_TRIGGER.OVERWORLD_MOVE, SOUND_EFFECT.YOSHI_OW, rom);
}

function getSecondaryExitTarget(xid, rom)
{
//	return rom[SEC_EXIT_OFFSET_LO + xid] | ((rom[SEC_EXIT_OFFSET_HI + xid] & 0x08) << 5);
	return rom[SEC_EXIT_OFFSET_LO + xid] | (xid & 0x100);
}

// @deprecated
function fixSecondaryExits(stages, rom)
{
	var id, mapping = {};
	for (var i = 0; i < stages.length; ++i)
		mapping[stages[i].copyfrom.id] = stages[i].id;
		
	for (var i = 0; i < 0x1FF; ++i)
	{
		var curr = getSecondaryExitTarget(i, rom);
		if (!(id = mapping[curr])) continue;
		
		// fix secondary exit target since the stage was moved
		rom[SEC_EXIT_OFFSET_LO + i]  = id & 0xFF;
		rom[SEC_EXIT_OFFSET_HI + i] &= 0xF7;
		rom[SEC_EXIT_OFFSET_HI + i] |= (id & 0x100) >> 5;
	}
}

function fixBlockPaths(stages, rom)
{
	var c5 = getCopiedStage(stages, 'c5');
	var c7 = getCopiedStage(stages, 'c7');
	var hitrans = Math.max(c5.translevel, c7.translevel);
	
	// swap some values if roy and larry end up in the wrong order
	if (c7.translevel < c5.translevel)
	{
		rom.set([0xEF, 0x93], 0x19307);
		rom.set([0xA4, 0x93], 0x1930C);
	}
	
	/*
	org $0392F8
		LDA $13BF
		NOP #3
		CMP #$xx
	*/
	rom.set([0xAD, 0xBF, 0x13, 0xEA, 0xEA, 0xEA, 0xC9, hitrans], 0x192F8);
}

function fixMessageBoxes(stages, rom)
{
	var transmap = {};
	
	// mapping for where translevels moved
	for (var i = 0; i < stages.length; ++i)
		transmap[stages[i].copyfrom.translevel] = stages[i].translevel;
	
	// 23 bytes in table at 0x2A590
	for (var i = 0; i < 23; ++i)
	{
		var val = rom[0x2A590+i], t = val & 0x7F;
		if (t in transmap) rom[0x2A590+i] = transmap[t] | (val & 0x80);
	}
}

var DESTRUCTION_EVENT_NUMBERS = 0x265D6;
var DESTRUCTION_EVENT_COORDS  = 0x265B6;
var DESTRUCTION_EVENT_VRAM    = 0x26587;

function fixOverworldEvents(stages, rom)
{
	var map = {};
	for (var i = 0; i < stages.length; ++i)
		map[rom[TRANSLEVEL_EVENTS+stages[i].copyfrom.translevel]] = stages[i];

	// size of the event table needs fixing
	rom[0x2667A] = 0x0F;
	
	for (var i = 0; i < 16; ++i)
	{
		var event = rom[DESTRUCTION_EVENT_NUMBERS+i], stage = map[event];
		if (!stage || !stage.copyfrom) continue;
		
		// we need to actually just reassign the event number entirely
		if (stage.exits == 0)
		{
			stage.data.transevent = stage.copyfrom.data._transevent;
			rom[TRANSLEVEL_EVENTS+stage.translevel] = stage.data.transevent;
		}
		
		rom[DESTRUCTION_EVENT_NUMBERS+i] = rom[TRANSLEVEL_EVENTS+stage.translevel];
		var x = stage.tile[0], y = stage.tile[1] - (stage.copyfrom.castle > 0)
		var s = rom[DESTRUCTION_EVENT_COORDS+i*2+1] = (y >> 4) * 2 + (x >> 4);
		
		// update vram values for overworld updates
		var vx = x << 1, vy = y << 1;
		
		// there is an easier way to write this only if we don't have to update VRAM
		// as well. heed my warning -- better left alone. not worth code golfing!
		if (s >= 0x4)
		{
			if (x == 0) --y;
			x = (x + 0xF) & 0xF;
			vx -= 2;
		}
		
		var pos = ((y & 0xF) << 4) | (x & 0xF);
		rom[DESTRUCTION_EVENT_COORDS+i*2] = pos;
		
		rom[DESTRUCTION_EVENT_VRAM+i*2  ] = 0x20 | ((vy & 0x20) >> 2) | ((vx & 0x20) >> 3) | ((vy & 0x18) >> 3);
		rom[DESTRUCTION_EVENT_VRAM+i*2+1] = ((vy & 0x07) << 5) | (vx & 0x1F);
	}
	
	// fix no-walk 0-exit stages
	var nowalk_translevels = [0x112, 0x104];
	for (var i = 0; i < stages.length; ++i)
		if (stages[i].copyfrom.palace)
			nowalk_translevels.push(stages[i].translevel);
	
	for (var i = 0; i < nowalk_translevels.length; ++i)
		rom.writeBytes(2, 0x2106C + i * 2, nowalk_translevels[i]);
	
	// always play bgm after a stage
	rom[0x20E2E] = 0x80;
	
	// fix castle crush for castles crossing section boundaries
	rom.set([0x20, 0x35, 0xA2, 0xEA], 0x266C5);
	rom.set([0x20, 0x35, 0xA2, 0xEA], 0x26F22);
	rom.set([0x20, 0x35, 0xA2, 0xEA], 0x26E26);
	
	rom.set(
	[
		0x48, 0x29, 0xFF, 0x00, 0xC9, 0xF0, 0x00, 0x68, 0x90, 
		0x03, 0x69, 0xFF, 0x00, 0x69, 0x10, 0x00, 0x60
	],
	0x22235);
	
	// the remainder of this method is dedicated to moving the overworld ghost sprites to the locations
	// where the ghost houses have been moved. shoutouts to Nintendo for being kinda shitty at programming
	// shoutouts to Kaizoman for being better by comparison
	rom.set(
	[
		0x00, 0x00, 0x01, 0xE0, 0x00, 
		0x03, 0x00, 0x00, 0x00, 0x00, 
		0x06, 0x70, 0x01, 0x20, 0x00, 
		0x07, 0x38, 0x00, 0x8A, 0x01, 
		0x00, 0x58, 0x00, 0x7A, 0x00, 
		0x08, 0x88, 0x01, 0x18, 0x00, 
		0x09, 0x48, 0x01, 0xFC, 0xFF
	],
	0x27625);
	
	var ghostspritebase = 0x27625 + 35, ghostsubmapbase = 0x27666;
	for (var i = 0; i < stages.length; ++i)
		if (stages[i].copyfrom.ghost == 1)
		{
			var s = stages[i].tile[1] >= 0x20;
			
			var x = stages[i].tile[0] * 0x10 - 0x10 - (s ? 0x0010 : 0);
			var y = stages[i].tile[1] * 0x10 - 0x08 - (s ? 0x0200 : 0);
			
			rom.set([0x0A, x & 0xFF, (x >> 8) & 0xFF, y & 0xFF, (y >> 8) & 0xFF], ghostspritebase);
			ghostspritebase += 5;
			
			rom[ghostsubmapbase] = s;
			ghostsubmapbase += 1;
		}
		
	rom.set([0x01, 0x20, 0x40, 0x60, 0x80, 0xA0], 0x2766F);
	rom.set(
	[
		0xF0, 0x02, 0xA9, 0x01, 0x5D, 0x5C, 0xF6, 0xD0, 0x2C, 0x9B, 0x8A, 0x85, 0x0A, 0x0A, 0x0A, 
		0x18, 0x65, 0x0A, 0xAA, 0xC2, 0x20, 0xBD, 0x17, 0xF6, 0x18, 0x69, 0x10, 0x00, 0x20, 0xB9, 
		0xFF, 0xE2, 0x30, 0xC9, 0x7A, 0xF0, 0x10, 0xBB, 0xA9, 0x34, 0xBC, 0x95, 0x0E, 0x30, 0x02, 
		0xA9, 0x44, 0xEB, 0xA9, 0x60, 0x20, 0x06, 0xFB
	],
	0x27D7F);
	
	rom.set(
	[
		0x22, 0x75, 0xF6, 0x04, 0x5C, 0x00, 0x80, 0x7F, 0x85, 0x0A, 0xE2, 0x20, 0x4A, 0x4A, 0x4A, 
		0x4A, 0x85, 0x0A, 0xC2, 0x20, 0xBD, 0x19, 0xF6, 0x18, 0x69, 0x08, 0x00, 0x85, 0x0C, 0xE2, 
		0x20, 0x29, 0xF0, 0x18, 0x65, 0x0A, 0xEB, 0xA5, 0x0D, 0x0A, 0x65, 0x0B, 0xEB, 0xC2, 0x30, 
		0xAA, 0xBF, 0x00, 0xC8, 0x7E, 0x85, 0x58, 0x60
	],
	0x27FB1);
	
	rom[0x276B0] = 0x0A;
	rom[0x27802] = 0x0A;
	
	rom.set([0x22, 0xB1, 0xFF, 0x04], 0x01AA4);
}

function backupData(stages, rom)
{
	for (var i = 0; i < stages.length; ++i)
		backupStage(stages[i], rom);
}

function backupStage(stage, rom)
{
	stage.data = {};
	
	for (var j = 0; j < LEVEL_OFFSETS.length; ++j)
	{
		var o = LEVEL_OFFSETS[j], start = o.offset + o.bytes * stage.id;
		stage.data[o.name] = rom.slice(start, start + o.bytes);
	}
	
	// translevel should fit in a single byte
	stage.translevel = getTranslevel(stage.id);
	stage.data.transevent = rom[TRANSLEVEL_EVENTS + stage.translevel];
	stage.data._transevent = stage.data.transevent;
	
	for (var j = 0; j < trans_offsets.length; ++j)
	{
		var o = trans_offsets[j], start = o.offset + o.bytes * stage.translevel;
		stage.data[o.name] = rom.slice(start, start + o.bytes);
	}
	
	// get a list of sublevels
	stage.sublevels = getRelatedSublevels(stage.id, rom);
	stage.allexits = Array.prototype.concat.apply([], 
		$.map(stage.sublevels, function(x){ return getScreenExits(x, rom); }));
	
	// ci2 - need to add the exits from the additional tables
	if (stage.id === 0x024)
	{
		// coins - room 2
		Array.prototype.push.apply(stage.allexits, getScreenExitsByAddr(0x06E9FB, rom));
		Array.prototype.push.apply(stage.allexits, getScreenExitsByAddr(0x06EAB0, rom));
		
		// time - room 3
		Array.prototype.push.apply(stage.allexits, getScreenExitsByAddr(0x06EB72, rom));
		Array.prototype.push.apply(stage.allexits, getScreenExitsByAddr(0x06EBBE, rom));
	
		// yoshi coins - room 4
		Array.prototype.push.apply(stage.allexits, getScreenExitsByAddr(0x06EC7E, rom));
	}
	
	// store the overworld tile
	if (stage.tile)
	{
		stage.data.owtile = rom[getOverworldOffset(stage)];
		rom[getOverworldOffset(stage)] = 0x00;
	}
}

function getOverworldOffset(stage, castletop)
{
	var tile = stage.tile, x = tile[0], y = tile[1] - !!castletop;
	return getOverworldOffsetByCoords(x, y);
}

function getOverworldOffsetByCoords(x, y)
{
	var section = (y >> 4) * 2 + (x >> 4);
	
	// $0CF7DF + section * 100 + (row % #$10) * #$10 + column % #$10
	return 0x0677DF + section * 0x100 + (y & 0xF) * 0x010 + (x & 0xF) - (y >= 0x20);
}

var INVIS_TO_PERMANENT =
{
	0x7B: 0x7C, 0x7D: 0x7E, 0x76: 0x77, 0x78: 0x79, 
	0x7F: 0x80, 0x59: 0x58, 0x57: 0x5E, 0x7A: 0x63,
	0x5A: 0x5F,
};

// construct PERMANENT_TO_INVIS from the above table
var PERMANENT_TO_INVIS = {};
for (var i = 0, k = Object.keys(INVIS_TO_PERMANENT); i < k.length; ++i)
	PERMANENT_TO_INVIS[+INVIS_TO_PERMANENT[+k[i]]] = +k[i];

function getPermanentTile(x)
{
	var lookup = INVIS_TO_PERMANENT;
	return x in lookup ? lookup[x] : (x >= 0x6E && x <= 0x75 ? (x - 8) : x);
}

function getRevealedTile(x)
{
	var lookup = PERMANENT_TO_INVIS;
	return x in lookup ? lookup[x] : (x >= 0x66 && x <= 0x6D ? (x + 8) : x);
}

function getTranslevel(id)
{
	if (id < 0x100) return id;
	else return id - 0xDC;
}

function makeBuckets(items, func)
{
	var buckets = [];
	for (var x = 0; x < items.length; ++x)
	{
		var item = items[x], i;
		for (i = 0; i < buckets.length; ++i)
			if (func(item, buckets[i][0]))
				{ buckets[i].push(item); break; }
		
		// if we didn't put in a bucket, new bucket
		if (i == buckets.length) buckets.push([item]);
	}
	
	return buckets;
}

function sameStageBucket(a, b)
{
	// a different number of exits, different bucket
	if (a.exits !== b.exits) return false;
	
	// can only put castles where there is room for them
	if ((b.cpath != NO_CASTLE) !== (a.cpath != NO_CASTLE)) return false;
	
	// if same-type, most both be castle/non-castle for same bucket
	if ($('#randomize_sametype').is(':checked')
		&& Math.sign(a.castle) !== Math.sign(b.castle)) return false;
	
	// if same-type, most both be ghost/non-ghost for same bucket
	if ($('#randomize_sametype').is(':checked') && a.ghost !== b.ghost) return false;
	
	// if same-type, most both be water/non-water for same bucket
	if ($('#randomize_sametype').is(':checked') && a.water !== b.water) return false;
	
	// if same-type, most both be palace/non-palace for same bucket
	if ($('#randomize_sametype').is(':checked') 
		&& Math.sign(a.palace) !== Math.sign(b.palace)) return false;
	
	// option: randomize only within worlds
	if ($('#randomize_sameworld').is(':checked') && a.world !== b.world) return false;
	
	return true;
}

// ASSUMES the layer1 pointer has already been copied to this stage
function fixSublevels(stage, rom)
{
	var sublevels = stage.copyfrom.sublevels.slice(0), map = {};
	sublevels[0] = stage.id;
	
	map[stage.copyfrom.id] = stage.id;
	for (var i = 1; i < sublevels.length; ++i)
	{
		var id = sublevels[i];
		if ((id & 0x100) !== (stage.id & 0x100))
		{
			var newid = map[id] = findOpenSublevel(stage.id & 0x100, rom);
			moveSublevel(newid, id, rom);
		}
	}
	
	// fix all screen exits
	var secid, secexitcleanup = [];
	for (var i = 0; i < stage.copyfrom.allexits.length; ++i)
	{
		var x = stage.copyfrom.allexits[i], target = getSublevelFromExit(x, rom);
		if (target in map)
		{
			var newtarget = map[target];
			if (!x.issecx) rom[x.addr+3] = newtarget;
			else
			{
				secexitcleanup.push(secid = x.target);
				var newsecid = findOpenSecondaryExit(stage.id & 0x100, rom);
				rom[x.addr+3] = newsecid & 0xFF;
				
				// copy all secondary exit tables
				rom[SEC_EXIT_OFFSET_LO + newsecid] = rom[SEC_EXIT_OFFSET_LO + secid];
				rom[SEC_EXIT_OFFSET_HI + newsecid] = rom[SEC_EXIT_OFFSET_HI + secid];
				rom[SEC_EXIT_OFFSET_X1 + newsecid] = rom[SEC_EXIT_OFFSET_X1 + secid];
				rom[SEC_EXIT_OFFSET_X2 + newsecid] = rom[SEC_EXIT_OFFSET_X2 + secid];
				
				// fix secondary exit target
				rom[SEC_EXIT_OFFSET_LO + newsecid]  = newtarget & 0xFF;
				rom[SEC_EXIT_OFFSET_HI + newsecid] &= 0xF7;
				rom[SEC_EXIT_OFFSET_HI + newsecid] |= (newtarget & 0x100) >> 5;
			}
		}
	}
	
	for (var i = 0; i < secexitcleanup.length; ++i)
	{
		// clear old secondary exit target
		var secid = secexitcleanup[i];
		rom[SEC_EXIT_OFFSET_LO + secid]  = 0x00;
		rom[SEC_EXIT_OFFSET_HI + secid] &= 0xF7;
	}
}

function swapExits(stage, rom)
{
	if (stage.exits !== 2) return;
	
	// swap output stages
	var outa     = stage.out[0];
	stage.out[0] = stage.out[1];
	stage.out[1] = outa;
	
	// secret exit triggers event+1
	var ndxa = rom[TRANSLEVEL_EVENTS + stage.translevel];
	var ndxb = ndxa + 1, ndxc = ndxa + 2;
	
	// swap the exit directions (nnss----)
	var dirs = rom[0x25678 + stage.translevel];
	var dhi = dirs & 0xC0, dlo = dirs & 0x30;
	rom[0x25678 + stage.translevel] = 
		(dirs & 0x0F) | (dhi >> 2) | (dlo << 2);
	
	// LAYER 1 ------------------------------
	
	// "flash" data
	var r1flasha = rom.slice(LAYER1_EVENT_LOCATIONS + ndxa * 2, LAYER1_EVENT_LOCATIONS + ndxa * 2 + 2);
	var r1flashb = rom.slice(LAYER1_EVENT_LOCATIONS + ndxb * 2, LAYER1_EVENT_LOCATIONS + ndxb * 2 + 2);
	
	rom.set(r1flasha, LAYER1_EVENT_LOCATIONS + ndxb * 2);
	rom.set(r1flashb, LAYER1_EVENT_LOCATIONS + ndxa * 2);
	
	// reveal data
	var r1reveala = rom.slice(0x2593D + ndxa * 2, 0x2593D + ndxa * 2 + 2);
	var r1revealb = rom.slice(0x2593D + ndxb * 2, 0x2593D + ndxb * 2 + 2);
	
	rom.set(r1reveala, 0x2593D + ndxb * 2);
	rom.set(r1revealb, 0x2593D + ndxa * 2);
	
	// update offscreen event map
	for (var i = 0, xor = ndxa ^ ndxb; i < 44; ++i) 
		if ([ndxa, ndxb].contains(rom[OFFSCREEN_EVENT_NUMBERS + i]))
			rom[OFFSCREEN_EVENT_NUMBERS + i] ^= xor;
	
	// LAYER 2 ------------------------------
	
	// get offsets into the event data table
	var offseta = rom[0x26359 + ndxa * 2] | (rom[0x26359 + ndxa * 2 + 1] << 8);
	var offsetb = rom[0x26359 + ndxb * 2] | (rom[0x26359 + ndxb * 2 + 1] << 8);
	var offsetc = rom[0x26359 + ndxc * 2] | (rom[0x26359 + ndxc * 2 + 1] << 8);
	
	// get the size of each event
	var asz = offsetb - offseta;
	var bsz = offsetc - offsetb;
	
	// copy the event data to temporary storage
	var eventa = rom.slice(0x25D8D + offseta * 4, 0x25D8D + offsetb * 4);
	var eventb = rom.slice(0x25D8D + offsetb * 4, 0x25D8D + offsetc * 4);
	
	// update the new offset for where event+1 should go
	offsetb = offseta + bsz;
	
	// copy the event data back into the event table
	rom.set(eventb, 0x25D8D + offseta * 4);
	rom.set(eventa, 0x25D8D + offsetb * 4);
	
	// update the offset for event+1 back into the table
	rom.writeBytes(2, 0x26359 + ndxb * 2, offsetb);
}

var primarySublevelIds = $.map(SMW_STAGES, function(x){ return x.id });

function isSublevelFree(id, rom)
{
	var x = LAYER1_OFFSET + 3 * id;
	return rom[x] == 0x00 && rom[x+1] == 0x80 && rom[x+2] == 0x06;
}

function backupSublevel(id, rom)
{
	// copy all of the level pointers
	var data = {};
	for (var i = 0; i < LEVEL_OFFSETS.length; ++i)
	{
		var o = LEVEL_OFFSETS[i], x = o.offset + id * o.bytes;
		data[o.name] = rom.slice(x, x + o.bytes);
	}
	
	return data;
}

function copyBackupToSublevel(id, data, rom)
{
	for (var i = 0; i < LEVEL_OFFSETS.length; ++i)
	{
		var o = LEVEL_OFFSETS[i];
		rom.set(data[o.name], o.offset + id * o.bytes);
	}
}

function copySublevel(to, fm, rom)
{
	// if copying from TEST, that is slightly suspicious
	if (isSublevelFree(fm, rom)) console.log('Suspicious copy: ' + fm.toHex(3, '0x') + ' was TEST');
	
	// slower than doing it directly, but better for code maintenance
	copyBackupToSublevel(to, backupSublevel(fm, rom), rom);
}

function moveSublevel(to, fm, rom)
{
	// copy the sublevel data first
	copySublevel(to, fm, rom);
	
	// copy the TEST level into the now-freed sublevel slot
	rom.set([0x00, 0x80, 0x06], LAYER1_OFFSET + 3 * fm);
}

function findOpenSublevel(bank, rom)
{
	bank &= 0x100;
	
	var start = [0x025, 0x13C][bank >> 16], x;
	for (var i = start; i <= 0xFF; ++i)
		if (isSublevelFree(x = bank | i, rom))
			if (!primarySublevelIds.contains(x)) return x;
	
	// please god, this should never happen!
	throw new Error('No free sublevels in bank ' + bank.toHex(3));
}

function findOpenSecondaryExit(bank, rom)
{
	bank &= 0x100;
	for (var i = 0x01; i <= 0xFF; ++i)
		if (rom[SEC_EXIT_OFFSET_LO + (bank | i)] == 0x00)
			return (bank | i);
	
	// please god, this should never happen!
	throw new Error('No free secondary exits in bank ' + bank.toHex(3));
}

function getScreenExits(id, rom)
{
	var start = LAYER1_OFFSET + 3 * id;
	var snes = getPointer(start, 3, rom);
	return getScreenExitsByAddr(snes, rom, id);
}

function getScreenExitsByAddr(snes, rom, /*optional*/ id)
{
	var exits = [];
	var addr = snesAddressToOffset(snes) + 5;
	for (;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;
		
		// pattern looks like the start of the screen exits list
		if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) 
		{
			for (;; addr += 4)
			{
				// 0xFF sentinel represents end of level data
				if (rom[addr] === 0xFF) break;
				
				// screen exit info from the four bytes
				var x = { from: id, addr: addr };
				x.screen =   (rom[addr  ] & 0x1F);
				x.water  = !!(rom[addr+1] & 0x08);
				x.issecx = !!(rom[addr+1] & 0x02);
				x.target =    rom[addr+3] | (id & 0x100);
				
				x.data = rom.slice(addr, addr+3);
				exits.push(x);
			}
			break;
		}
	}
	
	return exits;
}

function getSublevelFromExit(exit, rom)
{
	if (!exit.issecx) return exit.target;
	return getSecondaryExitTarget(exit.target, rom);
}

function getRelatedSublevels(baseid, rom)
{
	var id, ids = [], todo = [baseid];
	while (todo.length)
	{
		var id = todo.shift();
		if (ids.contains(id)) continue;
		
		ids.push(id);
		var exits = getScreenExits(id, rom);
		
		for (var i = 0; i < exits.length; ++i)
		{
			var x = exits[i], next = getSublevelFromExit(x, rom);
			if (!ids.contains(next)) todo.push(next);
		}
	}
	
	return ids;
}

function getSpritesBySublevel(id, rom)
{
	var start = SPRITE_OFFSET + 2 * id;
	var snes = 0x070000 | getPointer(start, 2, rom);
	
	var addr = snesAddressToOffset(snes) + 1;
	var sprites = [];
	
	for (;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;
		
		var s = { stage: id, addr: addr };
		s.spriteid = rom[addr+2];
		
		sprites.push(s);
	}
	
	return sprites;
}

function deleteSprites(todelete, sprites, rom)
{
	if (!sprites.length) return 0;
	var deleted = 0;
	
	var len = sprites.length, base = sprites[0].addr;
	for (var i = len - 1; i >= 0; --i)
		if (todelete.contains(sprites[i].spriteid))
		{
			for (var j = i + 1; j < len; ++j)
			{
				var addr = base + j * 3;
				rom.set(rom.slice(addr, addr + 3), addr - 3);
				sprites[j].addr -= 3; // not needed, but correct
			}
				
			// remove the sprite object from the list
			sprites.splice(i, 1); --len; ++deleted;
		}
		
	// end of list marker
	rom[base + len * 3] = 0xFF;
	return deleted;
}

function removeAutoscrollers(rom)
{
	for (var id = 0; id < 0x200; ++id)
	{
		// don't remove autoscroller for DP2 due to issues with the
		// layer 2 movement. sorry, but this is a wontfix issue.
		if (id == 0x009) continue;
	
		var snes = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
		var addr = snesAddressToOffset(snes) + 4;
		
		var sprites = getSpritesBySublevel(id, rom);
		
		// fix the v-scroll if we find autoscroller sprites
		for (var i = 0; i < sprites.length; ++i)
			switch (sprites[i].spriteid)
			{
				case 0xE8:
					rom[addr] &= 0xCF;
					rom[addr] |= 0x10;
					break;
				
				case 0xF3:
					rom[addr] &= 0xCF;
					rom[addr] |= 0x00;
					break;
			}
			
		// remove the actual autoscroller sprites
		deleteSprites([0xE8, 0xF3], sprites, rom);
	}
}

// assumes little-endian
function getPointer(off, len, rom)
{
	for (var i = 0, x = 0; i < len; ++i)
		x |= (rom[off+i] << (i*8));
	return x;
}

function getBigEndian(off, len, rom)
{
	for (var i = 0, x = 0; i < len; ++i)
		x = (x << 8) | rom[off+i];
	return x;
}

function snesAddressToOffset(addr)
{
	// bank (high byte) * 0x8000 + addr (low 2 bytes) - 0x8000
	return ((addr & 0xFF0000) >> 16) * 0x8000 + (addr & 0x00FFFF) - 0x8000;
}

function shuffleLevelNames(stages, random)
{
	var ptrs = $.map(stages, function(x){ return x.data['nameptr']; }).shuffle(random);
	for (var i = 0; i < ptrs.length; ++i) stages[i].data['nameptr'] = ptrs[i];
}

var NO_YOSHI_GHOST = 0,
	NO_YOSHI_CASTLE_DAY = 1,
	NO_YOSHI_PLAINS = 2,
	NO_YOSHI_STARS = 3,
	NO_YOSHI_ICE = 4,
	NO_YOSHI_CASTLE_NIGHT = 5,
	NO_YOSHI_DISABLED = 6;

function randomizeNoYoshi(stages, random, rom)
{
	rom.set([0x20, 0x19, 0x8E, 0xAA, 0xE0, 0x06, 0x90, 0x04, 0xEA], 0x2DA2C);
	rom.set(
	[
		0xAD, 0xBF, 0x13, 0x4A, 0xAA, 0xBD, 0x2E, 0x8E, 
		0xB0, 0x04, 0x29, 0x0F, 0x80, 0x06, 0x29, 0xF0, 
		0x4A, 0x4A, 0x4A, 0x4A, 0x60
	],
	0x28E19);
	
	var TABLE_BASE = 0x28E2E;
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i], trans = getTranslevel(stage.id);
		var ug = getMapForStage(stage).ug, flag = NO_YOSHI_DISABLED;
		var from = stage.copyfrom ? stage.copyfrom : stage;
		
		// pick the appropriate flag
		if (from.ghost == 1) flag = NO_YOSHI_GHOST;
		else if (from.castle) flag = ug ? NO_YOSHI_CASTLE_NIGHT : NO_YOSHI_CASTLE_DAY;
		else if (0 == random.nextInt(8)) flag = ug ? NO_YOSHI_STARS : NO_YOSHI_PLAINS;
		
		// set "disable no-yoshi intro" to 0 for hijack
		rom[HEADER4_OFFSET + trans] &= 0x7F;
		
		// populate table with entry
		var shift = (trans & 1) ? 4 : 0;
		rom[TABLE_BASE + (trans>>1)] &= ~(0xF << shift);
		rom[TABLE_BASE + (trans>>1)] |= (flag << shift);
	}
	
	// handle special translevels (code copied from above)
	var NO_INTRO_TRANSLEVELS = [0x00, 0x25];
	for (var i = 0; i < NO_INTRO_TRANSLEVELS.length; ++i)
	{
		var trans = NO_INTRO_TRANSLEVELS[i];
		rom[HEADER4_OFFSET + trans] &= 0x7F;
		
		var shift = (trans & 1) ? 4 : 0;
		rom[TABLE_BASE + (trans>>1)] &= ~(0xF << shift);
		rom[TABLE_BASE + (trans>>1)] |= 6 << shift;
	}
}

function randomizeBossDifficulty(random, rom)
{
	// health of ludwig+morton+roy
	var jhp = random.nextIntRange(2,9);
	rom[0x0CFCD] = jhp;
	rom[0x0D3FF] = jhp + 9;
	
	// health of big boo
	rom[0x181A2] = random.nextIntRange(2,7);
	
	// health of wendy+lemmy
	var whp = random.nextIntRange(2,6)
	rom[0x1CE1A] = whp;
	rom[0x1CED4] = whp - 1;
	
	// health of bowser phase1, and phases2+3
	var bhp = random.nextIntRange(1,6);
	rom[0x1A10B] = bhp;
	rom[0x1A683] = bhp;
	
	// distance iggy+larry slides when hit (jump, fireball)
	rom[0x0FD00] = random.nextIntRange(0x08, 0x30);
	rom[0x0FD46] = random.nextIntRange(0x08, 0x28);
	
	// randomize reznor
	if (0 == random.nextInt(3)) rom.set([0x38, 0xE9], 0x198C7);
	rom[0x198C9] = random.nextIntRange(0x01, 0x04);
}

function randomizeKoopaKids(random, rom)
{
	var bossrooms = koopa_kids.slice(0).shuffle(random);
	var hold0 = findOpenSublevel(0x000, rom);
	moveSublevel(hold0, bossrooms[0], rom);
	
	for (var i = 1; i < bossrooms.length; ++i)
		moveSublevel(bossrooms[i-1], bossrooms[i], rom);
	moveSublevel(bossrooms[bossrooms.length-1], hold0, rom);
		
	if ($('input[name="levelnames"]:checked').val() == 'match_stage')
		; // TODO: fix castle names
}

var DOOR_IDS = [0x10, 0x15, 0x47, 0x48, 0x90]

function hasDoors(id, rom)
{
	var start = LAYER1_OFFSET + 3 * id;
	var snes = getPointer(start, 3, rom);
	
	var addr = snesAddressToOffset(snes);
	for (addr += 5;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;
		
		// pattern looks like the start of the screen exits list
		if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
		
		// check door ids if we have found a standard-object 0x00 (EXTENDED OBJECT)
		if ((rom[addr] & 0x60) === 0x00 && DOOR_IDS.contains(rom[addr+2])) return true;
	}
	
	return false;
}

var CI2_ROOM_OFFSETS = 
[
	[0x06, 0x08, 0x0A], // room 1
	[0x0C, 0x0E, 0x10], // room 2
	[0x00, 0x02], // room 3
];

var CI2_LAYER_OFFSETS = 
{
	'layer1': snesAddressToOffset(0x05DB08),
	'layer2': snesAddressToOffset(0x05DB1C),
	'sprite': snesAddressToOffset(0x05DB1A),
};

function randomizeCI2(random, rom)
{
	for (var i = 0; i < CI2_ROOM_OFFSETS.length; ++i)
	{
		var roomset = CI2_ROOM_OFFSETS[i], backups = {};
		for (var j = 0; j < roomset.length; ++j)
		{
			var data = backups[roomset[j]] = {};
			for (var k in CI2_LAYER_OFFSETS) if (CI2_LAYER_OFFSETS.hasOwnProperty(k))
			{
				var start = CI2_LAYER_OFFSETS[k] + roomset[j];
				data[k] = rom.slice(start, start+2);
			}
		}
		
		var newrooms = roomset.slice(0).shuffle(random);
		for (var j = 0; j < roomset.length; ++j)
		{
			for (var k in CI2_LAYER_OFFSETS) if (CI2_LAYER_OFFSETS.hasOwnProperty(k))
				rom.set(backups[newrooms[j]][k], CI2_LAYER_OFFSETS[k] + roomset[j]);
		}
	}
}

function findWings(rom, stage)
{
	for (var i = 0; i < stage.sublevels.length; ++i)
	{
		var start = LAYER1_OFFSET + 3 * stage.sublevels[i];
		var snes = getPointer(start, 3, rom);
		
		var addr = snesAddressToOffset(snes);
		var vertical = [0x7, 0x8, 0xA, 0xD].contains(rom[addr+1] & 0x1F);
		
		for (addr += 5;; addr += 3)
		{
			// 0xFF sentinel represents end of level data
			if (rom[addr] === 0xFF) break;
			
			// pattern looks like the start of the screen exits list
			if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
			
			// pattern looks like a block we want to change (x = 1 mod 4 means 0x35 contains wings)
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] == 0x35)
			{
				var iswings = (vertical ? (rom[addr] & 0x03) : (rom[addr+1] & 0x03)) == 0x01;
				if (iswings) return { sublevel: stage.sublevels[i], addr: addr };
			}
		}
	}
	
	// found no wings
	return null;
}

var QUESTION_BLOCK_IDS = [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38];

function findCandidateWings(rom, stage)
{
	var candidates = [];
	for (var i = 0; i < stage.sublevels.length; ++i)
	{
		var start = LAYER1_OFFSET + 3 * stage.sublevels[i];
		var snes = getPointer(start, 3, rom);
		
		var hassecx = false;
		var exits = getScreenExitsByAddr(snes, rom, stage.sublevels[i]);
		for (var j = 0; j < exits.length; ++j) hassecx |= exits[j].issecx;
		
		// wings will break if a sublevel has secondary exits
		if (hassecx) continue;
		
		var addr = snesAddressToOffset(snes);
		var vertical = [0x7, 0x8, 0xA, 0xD].contains(rom[addr+1] & 0x1F);
		
		for (addr += 5;; addr += 3)
		{
			// 0xFF sentinel represents end of level data
			if (rom[addr] === 0xFF) break;
			
			// pattern looks like the start of the screen exits list
			if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
			
			// pattern looks like a block we want to change (x = 1 mod 4 means 0x35 contains wings)
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && QUESTION_BLOCK_IDS.contains(rom[addr+2]))
			{
				var iswings = (vertical ? (rom[addr] & 0x03) : (rom[addr+1] & 0x03)) == 0x01;
				if (iswings) candidates.push({ sublevel: stage.sublevels[i], addr: addr, type: rom[addr+2] });
			}
		}
	}
	
	return candidates;
}

function randomizeYoshiWings(stages, random, rom)
{
	for (var i = 0; i < stages.length; ++i)
	{
		// shouldn't be able to bring yoshi in anyways, dummy
		if (stages[i].castle || stages[i].ghost) continue;
		
		// if stage has no exits, or 90% of the time otherwise, skip
		if (!stages[i].exits || random.nextInt(12) != 0) continue;
		
		// if wings are already present, remove them
		var wings = findWings(rom, stages[i]);
		if (wings) rom[wings.addr+2] = 0x34;
		else
		{
			// otherwise, if wings are not, maybe add them
			var candidateWings = findCandidateWings(rom, stages[i]);
			if (candidateWings.length) rom[random.from(candidateWings).addr+2] = 0x35;
		}
	}
}

function findKey(stage, rom)
{
	for (var key, i = 0; i < stage.sublevels.length; ++i)
		if (key = findKeyBySublevel(stage.sublevels[i], rom)) return key;
	
	// found no key
	return null;
}

function findKeyBySublevel(id, rom)
{
	// find key sprite
	var sprites = getSpritesBySublevel(id, rom);
	for (var j = 0; j < sprites.length; ++j) if (sprites[j].spriteid == 0x80)
		return { sublevel: id, sprite: sprites[j] };
	
	// ...otherwise, look for key block
	var start = LAYER1_OFFSET + 3 * id;
	var snes = getPointer(start, 3, rom);
	
	var addr = snesAddressToOffset(snes);
	var vertical = [0x7, 0x8, 0xA, 0xD].contains(rom[addr+1] & 0x1F);
	
	for (addr += 5;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;
		
		// pattern looks like the start of the screen exits list
		if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
		
		// pattern looks like a key block (x = 0 mod 4 means 0x35 contains key)
		if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] == 0x35)
		{
			var iswings = (vertical ? (rom[addr] & 0x03) : (rom[addr+1] & 0x03)) == 0x00;
			if (iswings) return { sublevel: id, block: addr };
		}
	}
	
	// nothing
	return null;
}

var KEY_CAN_REPLACE = [
	// koopas and goombas
	0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x09, 0x0C, 0xBD, 0x0F, 0x10,
	0xDA, 0xDB, 0xDC, 0xDD, 0xDF,
	
	// chucks
	0x91, 0x92, 0x93, 0x94, 0x95, 0x97, 0x98,
	
	// other enemies (some tileset specific)
	0x0D, 0x11, 0x13, 0x26, 0x27, 0x46, 0x4E, 0x51, 0x6E, 0x6F, 0x70, 0x71, 0x72, 0x73,
	0x86, 0x99, 0x9F, 0xAB, 
	
	// powerups
	0x74, 0x75, 0x76, 0x77, 0x78,
	
	// other
	0x2C, 0x2D, 0x2F, 
];

var KEY_REPLACEMENTS = [
	// koopas and goombas
	0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x09, 0x0C, 0xBD, 0x0F, 0x10,
	0xDA, 0xDB, 0xDC, 0xDD, 0xDF,
	
	// powerups
	0x78,
];

function findKeyCandidates(stage, random, rom)
{
	var candidates = [];
	for (var i = 0; i < stage.sublevels.length; ++i)
	{
		// sprites
		var sprites = getSpritesBySublevel(stage.sublevels[i], rom);
		for (var j = 0; j < sprites.length; ++j)
			if (KEY_CAN_REPLACE.contains(sprites[j].spriteid))
				candidates.push({ sublevel: stage.sublevels[i], sprite: sprites[j] });
		
		// ...otherwise, look for key block
		var start = LAYER1_OFFSET + 3 * stage.sublevels[i];
		var snes = getPointer(start, 3, rom);
		
		var addr = snesAddressToOffset(snes);
		var vertical = [0x7, 0x8, 0xA, 0xD].contains(rom[addr+1] & 0x1F);
		
		for (addr += 5;; addr += 3)
		{
			// 0xFF sentinel represents end of level data
			if (rom[addr] === 0xFF) break;
			
			// pattern looks like the start of the screen exits list
			if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
			
			// pattern looks like a block we want to change (x = 0 mod 4 means 0x35 contains key)
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && QUESTION_BLOCK_IDS.contains(rom[addr+2]))
			{
				var iswings = (vertical ? (rom[addr] & 0x03) : (rom[addr+1] & 0x03)) == 0x00;
				if (iswings) candidates.push({ sublevel: stage.sublevels[i], block: addr });
			}
		}
	}
	
	// found no key
	return candidates;
}

function randomizeKeyLocations(stages, random, rom)
{
	var key;
	for (var i = 0; i < stages.length; ++i)
	{
		// stages that could potentially cause problems when moving the key
		if (['dp2', 'vd1', 'ci2', 'bgh'].contains(stages[i].name)) continue;
		
		// 25% of the time, and if we find a key we can move...
		if (random.nextInt(4) == 0 && (key = findKey(stages[i], rom)))
		{
			var candidates = findKeyCandidates(stages[i], random, rom);
			if (!candidates.length) continue;
			
			// replace the key with a valid replacement
			if (key.sprite) rom[key.sprite.addr+2] = random.from(KEY_REPLACEMENTS);
			else if (key.block) rom[key.block.addr+2] = 0x34;
			
			// find a place to put the key
			key = random.from(candidates);
			
			if (key.sprite) rom[key.sprite.addr+2] = 0x80;
			else if (key.block) rom[key.block.addr+2] = 0x35;
		}
	}
}

function providesExits(id, rom)
{
	// returned exits
	var exits = 0, keyhole = false;
	
	var sprites = getSpritesBySublevel(id, rom);
	for (var i = 0; i < sprites.length; ++i)
	{
		// orb always provides the normal exit
		if (sprites[i].spriteid == 0x4A) exits |= NORMAL_EXIT;
		
		// get the extra bits if we find a goal tape
		if (sprites[i].spriteid == 0x7B)
			exits |= (rom[sprites[i].addr+0] & 0x0C) ? SECRET_EXIT : NORMAL_EXIT;
		
		if (sprites[i].spriteid == 0x0E) keyhole = true; // found keyhole
	}
	
	// if this room provides both a key and keyhole
	if (findKeyBySublevel(id, rom) && keyhole) exits |= SECRET_EXIT;
	
	return exits;
}

function hasStaticWater(id, rom)
{
	var start = LAYER1_OFFSET + 3 * id;
	var snes = getPointer(start, 3, rom);
	
	var addr = snesAddressToOffset(snes) + 5;
	for (;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;
		
		// pattern looks like the start of the screen exits list
		if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
		
		// get object id, if it's water, return true
		var objectid = ((rom[addr] & 0x60) >> 1) | ((rom[addr+1] & 0xF0) >> 4);
		if ([0x18, 0x19].contains(objectid)) return true;
	}
}

// end the demo after 10 inputs. this is a safe place to stop both for
// the no-yoshi intro and for slippery/water intros
function fixDemo(rom)
{	
	// fix the title screen demo so mario doesn't die >.<
	for (var i = 10; i < 34; ++i)
		rom[0x01C1F + i * 2] = 0x00;
	rom[0x01C1F + 34] = 0xFF;
}

var NO_WATER_STAGES = [
	// do not add water to these stages
	0x01A, 0x0DC, 0x111, 0x1CF, 0x134, 0x1F8, 0x0C7, 0x1E3, 0x1E2, 0x1F2, 0x0CC,
	
	// do not remove water from these stages
	0x1CE, 
];

// randomizes slippery/water/tide flags
function randomizeFlags(random, rom)
{
	rom.set(
	[
		0xA5, 0x0E, 0x8D, 0x0B, 0x01, 0x0A, 0x18, 0x65, 0x0E, 0xA8, 
		0xB9, 0x00, 0xE0, 0x85, 0x65, 0xB9, 0x01, 0xE0, 0x85, 0x66, 
		0xB9, 0x00, 0xE6, 0x85, 0x68, 0xB9, 0x01, 0xE6, 0x85, 0x69, 
		0x80, 0x07
	], 
	0x2D8B9);
	
	rom.set([ 0x20, 0xF5, 0xF9, 0xC9, 0x00, 0xF0, 0x04, 0xC9, 0x05, 0xD0, 0x36 ], 0x026D5);
	rom.set([ 0xEA, 0xEA ], 0x02734);
	
	rom.set(
	[
		0xC2, 0x10, 0xAE, 0x0B, 0x01, 0xBF, 0xE0, 0xFD, 0x03, 0x29, 
		0xF0, 0x85, 0x86, 0xBF, 0xE0, 0xFD, 0x03, 0x29, 0x01, 0x85, 
		0x85, 0xE2, 0x10, 0xAD, 0x2A, 0x19, 0x60
	],
	0x079F5);
	
	// fix cutscenes - sorry Dani :)
	// http://www.youtube.com/watch?v=n9LssVHB1VY
	rom.set([0x20, 0x91, 0xB0], 0x01501);
	rom.set([0x64, 0x85, 0x64, 0x86, 0xAD, 0xC6, 0x13, 0x60], 0x03091);
	
	for (var id = 0; id < 0x200; ++id)
	{
		var start = LAYER1_OFFSET + 3 * id;
		var snes = getPointer(start, 3, rom);
		var addr = snesAddressToOffset(snes);
		
		var numscreens = rom[addr] & 0x1F;
		var entr = (rom[0x2F200+id] >> 3) & 0x7;
		var tide = (rom[0x2F200+id] >> 6) & 0x3;
		
		// get default flag setting for the sublevel
		var flag = (entr == 5 ? 0x80 : 0) | (entr == 7 ? 0x01 : 0);
		
		// base water on how many screens the stage has
		if (0 == random.nextInt(Math.max(numscreens, 4) * 2) && !NO_WATER_STAGES.contains(id)
			&& $((flag & 0x01) ? '#delwater' : '#addwater').is(':checked')) flag ^= 0x01;
		
		// force certain stages to not have water
		if ([0x1, 0x2].contains(tide)) flag &= 0xF0;
		
		if ($('#slippery').is(':checked'))
		{
			// 12.5% of stages will have slippery flag swapped
			if (0 == random.nextInt(8)) flag ^= 0x80;
			
			// if the stage is slippery, 33% of the time, changed to "half-slippery"
			if ((flag & 0x80) && 0 == random.nextInt(3)) flag ^= 0x90;
			
			// fix intro if slippery
			if (id == 0xC7 && (flag & 0xF0)) fixDemo(rom);
		}
		
		rom[FLAGBASE+id] = flag;
	}
}

function cheatOptions(rom)
{
	// infinite lives?
	if ($('#cheat_infinitelives').is(':checked'))
	{
		rom.set([0xEA, 0xEA, 0xEA], 0x050D8);
		rom[0x01E25] = 99;
	}
	
	// developer mode
	if ($('#cheat_devmode').is(':checked'))
	{
		// S+s for normal exit, S+A+s for secret exit
		rom[snesAddressToOffset(0x00A273)] = 0x00;
		rom[snesAddressToOffset(0x00A268)] = 0x00;
		
		// L+AA to make Mario fly, L+A again to disable
		rom[snesAddressToOffset(0x00CC84)] = 0xF0;
	}
	
	// if any of the cheat options are set, update file select
	if ($('.cheat').is(':checked'))
	{
		updateFileSelect({
			marioA: "CHEAT",
			marioB: "CHEAT",
			marioC: "CHEAT",
		},
		TITLE_TEXT_COLOR, rom);
	}
}

function ValidationError(errors)
{
	this.name = 'ValidationError';
	this.message = 'Randomized ROM did not pass validation.';
	this.stack = (new Error()).stack;
	
	this.errors = errors;
}

ValidationError.prototype = new Error();

function validateROM(stages, rom)
{
	var e = new ValidationError([]);
	for (var i = 0; i < stages.length; ++i)
	{
		// skip warp entries
		if (stages[i].copyfrom.warp) continue;
		
		var stage = stages[i], sub = getRelatedSublevels(stage.id, rom);
		for (var j = 0; j < sub.length; ++j)
		{
			if (isSublevelFree(sub[j], rom))
				e.errors.push('Sublevel ' + sub[j].toHex(3, 'x') + ' of ' + stage.copyfrom.name + ' (was ' + stage.name + ') is empty');
		}
	}
	
	if (e.errors.length) throw e;
}

function expandROM(rom)
{
	// upgrade to next rom size
	var size = rom[0x7FD7] += 1;
	var newrom = new Uint8Array(0x400 * (1 << size));
	
	newrom.set(rom, 0);
	return newrom;
}

function getChecksum(rom)
{
	var checksum = 0;
	for (var i = 0; i < rom.length; ++i)
	{
		checksum += rom[i];
		checksum &= 0xFFFF;
	}
	return checksum;
}

function fixChecksum(rom)
{
	var checksum = getChecksum(rom);
	
	// checksum
	rom.writeBytes(2, 0x7FDE, checksum);
	rom.writeBytes(2, 0x7FDC, checksum ^ 0xFFFF);
}

function remapScreenExits(stages, random, rom)
{
	var smap = {};
	for (var i = 0; i < stages.length; ++i)
		smap[stages[i].name] = stages[i];
	
	var exits = deepClone(SUBMAP_LINKS), xmap = {};
	for (var i = 0; i < exits.length; ++i)
		xmap[exits[i].from] = exits[i];
	
	var worlds = [], xworld = {};
	for (var i = 0; i < exits.length; ++i)
	{
		var queue = [exits[i].to], done = {}, wexits = {};
		while (queue.length)
		{
			var x = queue.shift(), node = smap[x]; 
			if (!node || !node.out || done[x]) continue;
			done[x] = true;
			
			// this is a world exit, so save it in the list
			if (xmap.hasOwnProperty(x)) wexits[x] = xmap[x];
			
			// don't consider star world in reachability
			if (node.world >= 8) continue;
			
			for (var j = 0; j < node.out.length; ++j)
			{
				var out = node.out[j];
				if (out in done) continue;
				
				// if this spans an exit, just skip it
				if (xmap[x] && xmap[x].to == out) continue;
				queue.push(out);
			}
		}
		
		var world = null;
		for (var k in wexits) if (wexits.hasOwnProperty(k))
			if (xworld[k]) world = xworld[k];
		
		if (!world) worlds.push(world = { entr: {}, exit: {} });
		world.entr[exits[i].from] = exits[i];
		
		for (var k in wexits) if (wexits.hasOwnProperty(k))
		{ world.exit[k] = wexits[k]; xworld[k] = world; }
	}
	
	var worldentr = {};
	for (var i = 0; i < worlds.length; ++i)
		for (var k in worlds[i].entr) if (worlds[i].entr.hasOwnProperty(k))
			worldentr[worlds[i].entr[k].to] = worlds[i];
		
	var unused = { true: [], false: [] };
	for (var i = 0; i < exits.length; ++i)
		unused[exits[i].pipe].push(exits[i]);
	
	var queue = ['c1', 'yi1'], done = {};
	while (queue.length)
	{
		var which = random.draw(queue), xwhich = xmap[which];
		var candidates = $.grep(unused[xwhich.pipe], function(x)
		{
			var worldexits = Object.keys(worldentr[x.to].exit);
			return (worldexits.length || queue.length);
		});
		
		console.log('screen exit from', xwhich.from, 'to', xwhich.to);
		
		var newdest = candidates.length ? random.from(candidates) : unused[xwhich.pipe][0];
		if (!newdest) throw 'Cannot find an outgoing path for screen exit: ' + which;
		
		console.log('exit will now go to', newdest.to);
		
		xwhich.newto = newdest.to; done[which] = { pipe: xwhich.pipe };
		unused[xwhich.pipe] = $.grep(unused[xwhich.pipe], function(x){ return x.to != newdest.to; });
		
		var world = worldentr[newdest.to];
		for (var k in world.exit) if (world.exit.hasOwnProperty(k))
			if (!done[k] && !queue.contains(k)) queue.push(k);
	}
}

function sameSublevelBucket(rom, a, b)
{
	// if the sublevels don't provide the same types of stage exits
	if (providesExits(a, rom) != providesExits(b, rom)) return false;
	
	// if the stage doesn't provide the same number of exits
	if (getScreenExits(a, rom).length != getScreenExits(b, rom).length) return false;
	
	// check to see if the entrances are the same "type"
	var entra = (rom[0x2F200+a] >> 3) & 0x7, entrb = (rom[0x2F200+b] >> 3) & 0x7;
	if ((entra == 0x0 || entra == 0x5) != (entrb == 0x0 || entrb == 0x5)) return false;
	
	// TODO FIXME match on gfx set, no-yoshi entrance, entrance type?
	return true;
}

function swapSublevels(stages, random, rom)
{
	var sublevels = [];
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i];
		if (stage.exits == 0) continue;
		
		// remove problem stages from the swapping
		if (['ci1', 'ci2'].contains(stage.name)) continue;
		
		var sub = getRelatedSublevels(stage.id, rom);
		sublevels = sublevels.concat(sub.slice(1));
	}
	
	var buckets = makeBuckets(sublevels, sameSublevelBucket.bind(null, rom));
	var backupdata = {}, remap = {};
	
	for (var i = 0; i < buckets.length; ++i)
	{
		var b1 = buckets[i], b2 = b1.slice(0).shuffle(random);
		for (var j = 0; j < b1.length; ++j)
		{
			var b = backupdata[b1[j]] = {}; 
			b.ptrs = backupSublevel(b1[j], rom);
			b.exits = getScreenExits(b1[j], rom);
			
			remap[b1[j]] = b2[j];
		}
	}
	
	var secid, secexitcleanup = [];
	for (var oldx in remap) if (remap.hasOwnProperty(oldx))
	{
		var newx = remap[oldx], data = backupdata[oldx];
		copyBackupToSublevel(newx, data.ptrs, rom);
		
		for (var i = 0; i < backupdata[oldx].exits.length; ++i)
		{
			var oldexit = backupdata[oldx].exits[i];
			var newexit = backupdata[newx].exits[i];
			
			var target = newexit.target;
			if (target in remap) target = remap[target];
			
			rom.set(newexit.data, oldexit.addr);
			if (oldexit.issecx)
			{
				secexitcleanup.push(secid = oldexit.target);
				var newsecid = findOpenSecondaryExit(newx & 0x100, rom);
				rom[newx.addr+3] = newsecid & 0xFF;
				
				// copy all secondary exit tables
				rom[SEC_EXIT_OFFSET_LO + newsecid] = rom[SEC_EXIT_OFFSET_LO + secid];
				rom[SEC_EXIT_OFFSET_HI + newsecid] = rom[SEC_EXIT_OFFSET_HI + secid];
				rom[SEC_EXIT_OFFSET_X1 + newsecid] = rom[SEC_EXIT_OFFSET_X1 + secid];
				rom[SEC_EXIT_OFFSET_X2 + newsecid] = rom[SEC_EXIT_OFFSET_X2 + secid];
				
				// fix secondary exit target
				rom[SEC_EXIT_OFFSET_LO + newsecid]  = target & 0xFF;
				rom[SEC_EXIT_OFFSET_HI + newsecid] &= 0xF7;
				rom[SEC_EXIT_OFFSET_HI + newsecid] |= (target & 0x100) >> 5;
			}
			else rom[oldexit.addr+3] = target & 0xFF;
		}
	}
	
	for (var i = 0; i < secexitcleanup.length; ++i)
	{
		// clear old secondary exit target
		var secid = secexitcleanup[i];
		rom[SEC_EXIT_OFFSET_LO + secid]  = 0x00;
		rom[SEC_EXIT_OFFSET_HI + secid] &= 0xF7;
	}
}
