// this is the md5 of the only rom that we will accept
var ORIGINAL_MD5 =
{
	"cdd3c8c37322978ca8669b34bc89c804": 0x80000,
	"519284ab26396a84ab0c2db86e50121c": 0x80200,
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

var SEC_EXIT_OFFSET_LO = 0x2F800;
var SEC_EXIT_OFFSET_HI = 0x2FE00;
var SEC_EXIT_OFFSET_X1 = 0x2FA00;
var SEC_EXIT_OFFSET_X2 = 0x2FC00;

/*
	Primary header - first five bytes of level data
	BBBLLLLL CCCOOOOO 3MMMSSSS TTPPPFFF IIVVZZZZ

	BBB   = BG palette
	LLLLL = Length of level (amount of screens)
	CCC   = BG color
	OOOOO = Level mode (ignore this, can be used to randomly make levels dark or transparent though)
	3     = Layer 3 Priority
	MMM   = Music
	SSSS  = Sprite tileset
	TT    = Time (00 = 0, 01 = 200, 10 = 300, 11 = 400)
	PPP   = Sprite palette
	FFF   = FG palette
	II    = Item memory (ignore this)
	VV    = Vertical scroll (00 = no v-scroll, 01 = v-scroll, 10 = v-scroll only if sprinting/flying/climbing, 11 = no v or h-scroll)
	ZZZZ  = FG/BG tileset

	Secondary header
	SSSSYYYY 33TTTXXX MMMMFFBB IUVEEEEE

	SSSS = Layer 2 scroll settings (see LM)
	YYYY = Level entrance Y position (ignore this)
	33 = Layer 3 settings (00 = none, 01 = tide, 10 = mondo tide, 11 = tileset specific)
	TTT = Level entrance type (ignore this and pretty much all the below ones too)
	XXX = Level entrance X position
	MMMM = Level entrance midway screen
	FF = Level entrance FG init position
	BB = Level entrance BG init position
	I = Disable no-Yoshi intro flag
	U = Unknown vertical positioning flag
	V = Vertical positioning flag
	EEEEE = Level entrance screen number
*/

var trans_offsets = [
	// name pointer
	{"name": "nameptr", "bytes": 2, "offset": 0x220FC},
];

var NORMAL_EXIT = 1<<0,
    SECRET_EXIT = 1<<1,
	        KEY = 1<<2,
	    KEYHOLE = 1<<3;

var NO_CASTLE   = 0,
    NORTH_CLEAR = 1,
    NORTH_PATH  = 2;

var NO_GHOST    = 0,
    GHOST_HOUSE = 1,
	GHOST_SHIP  = 2;

/*
	0x0 = Beige/White
	0x1 = White/Gold
	0x2 = DkBlue/Black*
	0x3 = Brown/Gold
	0x4 = Black/White (Palette-specific?)
	0x5 = LtBlue/DkBlue
	0x6 = Gold/Brown*
	0x7 = Green/Black*
*/
var TITLE_TEXT_COLOR = 0x4;

var SMW_STAGES =
[
	// stages
	{"name": "yi1", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x105, "cpath": NO_CASTLE, "tile": [0x04, 0x28], "out": ["yswitch"]},
	{"name": "yi2", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x106, "cpath": NORTH_PATH, "tile": [0x0A, 0x28], "out": ["yi3"]},
	{"name": "yi3", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x103, "cpath": NORTH_CLEAR, "tile": [0x0A, 0x26], "out": ["yi4"]},
	{"name": "yi4", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x102, "cpath": NO_CASTLE, "tile": [0x0C, 0x24], "out": ["c1"]},
	{"name": "dp1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x015, "cpath": NORTH_PATH, "tile": [0x05, 0x11], "out": ["dp2", "ds1"]},
	{"name": "dp2", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x009, "cpath": NORTH_PATH, "tile": [0x03, 0x0D], "out": ["dgh", "gswitch"]},
	{"name": "dp3", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x005, "cpath": NORTH_CLEAR, "tile": [0x09, 0x0A], "out": ["dp4"]},
	{"name": "dp4", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x006, "cpath": NO_CASTLE, "tile": [0x0B, 0x0C], "out": ["c2"]},
	{"name": "ds1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 2, "id": 0x00A, "cpath": NO_CASTLE, "tile": [0x05, 0x0E], "out": ["dgh", "dsh"]},
	{"name": "ds2", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x10B, "cpath": NORTH_CLEAR, "tile": [0x11, 0x21], "out": ["dp3"]},
	{"name": "vd1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x11A, "cpath": NORTH_CLEAR, "tile": [0x06, 0x32], "out": ["vd2", "vs1"]},
	{"name": "vd2", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x118, "cpath": NO_CASTLE, "tile": [0x09, 0x30], "out": ["vgh", "rswitch"]},
	{"name": "vd3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x10A, "cpath": NO_CASTLE, "tile": [0x0D, 0x2E], "out": ["vd4"]},
	{"name": "vd4", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x119, "cpath": NORTH_PATH, "tile": [0x0D, 0x30], "out": ["c3"]},
	{"name": "vs1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x109, "cpath": NO_CASTLE, "tile": [0x04, 0x2E], "out": ["vs2", "sw2"]},
	{"name": "vs2", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x001, "cpath": NORTH_CLEAR, "tile": [0x0C, 0x03], "out": ["vs3"]},
	{"name": "vs3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x002, "cpath": NORTH_CLEAR, "tile": [0x0E, 0x03], "out": ["vfort"]},
	{"name": "cba", "world": 4, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x00F, "cpath": NORTH_CLEAR, "tile": [0x14, 0x05], "out": ["cookie", "soda"]},
	{"name": "soda", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 2, "id": 0x011, "cpath": NO_CASTLE, "tile": [0x14, 0x08], "out": ["sw3"]},
	{"name": "cookie", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x010, "cpath": NORTH_CLEAR, "tile": [0x17, 0x05], "out": ["c4"]},
	{"name": "bb1", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x00C, "cpath": NO_CASTLE, "tile": [0x14, 0x03], "out": ["bb2"]},
	{"name": "bb2", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x00D, "cpath": NO_CASTLE, "tile": [0x16, 0x03], "out": ["c4"]},
	{"name": "foi1", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x11E, "cpath": NORTH_PATH, "tile": [0x09, 0x37], "out": ["foi2", "fgh"]},
	{"name": "foi2", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x120, "cpath": NO_CASTLE, "tile": [0x0B, 0x3A], "out": ["foi3", "bswitch"]},
	{"name": "foi3", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x123, "cpath": NORTH_CLEAR, "tile": [0x09, 0x3C], "out": ["fgh", "c5"]},
	{"name": "foi4", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x11F, "cpath": NORTH_PATH, "tile": [0x05, 0x3A, ], "out": ["foi2", "fsecret"]},
	{"name": "fsecret", "world": 5, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x122, "cpath": NORTH_PATH, "tile": [0x05, 0x3C], "out": ["ffort"]},
	{"name": "ci1", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x022, "cpath": NO_CASTLE, "tile": [0x18, 0x16], "out": ["cgh"]},
	{"name": "ci2", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x024, "cpath": NORTH_PATH, "tile": [0x15, 0x1B], "out": ["ci3", "csecret"]},
	{"name": "ci3", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x023, "cpath": NO_CASTLE, "tile": [0x13, 0x1B], "out": ["ci3", "cfort"]},
	{"name": "ci4", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x01D, "cpath": NORTH_PATH, "tile": [0x0F, 0x1D], "out": ["ci5"]},
	{"name": "ci5", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x01C, "cpath": NORTH_PATH, "tile": [0x0C, 0x1D], "out": ["c6"]},
	{"name": "csecret", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x117, "cpath": NORTH_CLEAR, "tile": [0x18, 0x29], "out": ["c6"]},
	{"name": "vob1", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x116, "cpath": NORTH_CLEAR, "tile": [0x1C, 0x27], "out": ["vob2"]},
	{"name": "vob2", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x115, "cpath": NORTH_PATH, "tile": [0x1A, 0x27], "out": ["bgh", "bfort"]},
	{"name": "vob3", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x113, "cpath": NORTH_PATH, "tile": [0x15, 0x27], "out": ["vob4"]},
	{"name": "vob4", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x10F, "cpath": NORTH_PATH, "tile": [0x15, 0x25], "out": ["sw5", "c7"]},
	{"name": "c1", "world": 1, "exits": 1, "castle": 1, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x101, "cpath": NORTH_PATH, "tile": [0x0A, 0x22], "out": ["dp1"]},
	{"name": "c2", "world": 2, "exits": 1, "castle": 2, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x007, "cpath": NORTH_PATH, "tile": [0x0D, 0x0C], "out": ["vd1"]},
	{"name": "c3", "world": 3, "exits": 1, "castle": 3, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x11C, "cpath": NORTH_PATH, "tile": [0x0D, 0x32], "out": ["cba"]},
	{"name": "c4", "world": 4, "exits": 1, "castle": 4, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x00E, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x03], "out": ["foi1"]},
	{"name": "c5", "world": 5, "exits": 1, "castle": 5, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x020, "cpath": NORTH_CLEAR, "tile": [0x18, 0x12], "out": ["ci1"]},
	{"name": "c6", "world": 6, "exits": 1, "castle": 6, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x01A, "cpath": NORTH_PATH, "tile": [0x0C, 0x1B], "out": ["sgs"]},
	{"name": "c7", "world": 7, "exits": 1, "castle": 7, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x110, "cpath": NORTH_PATH, "tile": [0x18, 0x25], "out": ["frontdoor"]},
	{"name": "vfort", "world": 3, "exits": 1, "castle": -1, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x00B, "cpath": NORTH_CLEAR, "tile": [0x10, 0x03], "out": ["bb1"]},
	{"name": "ffort", "world": 5, "exits": 1, "castle": -1, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x01F, "cpath": NORTH_CLEAR, "tile": [0x16, 0x10], "out": ["sw4"]},
	{"name": "cfort", "world": 6, "exits": 1, "castle": -1, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x01B, "cpath": NORTH_CLEAR, "tile": [0x0F, 0x1B], "out": ["ci4"]},
	{"name": "bfort", "world": 7, "exits": 1, "castle": -1, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x111, "cpath": NORTH_PATH, "tile": [0x1A, 0x25], "out": ["backdoor"]},
	{"name": "dgh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": GHOST_HOUSE, "water": 0, "id": 0x004, "cpath": NO_CASTLE, "tile": [0x05, 0x0A], "out": ["topsecret", "dp3"]},
	{"name": "dsh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": GHOST_HOUSE, "water": 0, "id": 0x013, "cpath": NO_CASTLE, "tile": [0x07, 0x10], "out": ["ds2", "sw1"]},
	{"name": "vgh", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": GHOST_HOUSE, "water": 0, "id": 0x107, "cpath": NORTH_CLEAR, "tile": [0x09, 0x2C], "out": ["vd3"]},
	{"name": "fgh", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": GHOST_HOUSE, "water": 0, "id": 0x11D, "cpath": NORTH_CLEAR, "tile": [0x07, 0x37], "out": ["foi1", "foi4"]},
	{"name": "cgh", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": GHOST_HOUSE, "water": 0, "id": 0x021, "cpath": NORTH_CLEAR, "tile": [0x15, 0x16], "out": ["ci2"]},
	{"name": "sgs", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": GHOST_SHIP, "water": 1, "id": 0x018, "cpath": NORTH_PATH, "tile": [0x0E, 0x17], "out": ["vob1"]},
	{"name": "bgh", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": GHOST_HOUSE, "water": 0, "id": 0x114, "cpath": NORTH_PATH, "tile": [0x18, 0x27], "out": ["vob3", "c7"]},
	{"name": "sw1", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x134, "cpath": NO_CASTLE, "tile": [0x15, 0x3A], "out": ["sw1", "sw2"]},
	{"name": "sw2", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x130, "cpath": NO_CASTLE, "tile": [0x16, 0x38], "out": ["sw2", "sw3"]},
	{"name": "sw3", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x132, "cpath": NO_CASTLE, "tile": [0x1A, 0x38], "out": ["sw3", "sw4"]},
	{"name": "sw4", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x135, "cpath": NO_CASTLE, "tile": [0x1B, 0x3A], "out": ["sw4", "sw5"]},
	{"name": "sw5", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x136, "cpath": NO_CASTLE, "tile": [0x18, 0x3B], "out": ["sw1", "sp1"]},
	{"name": "sp1", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x12A, "cpath": NORTH_CLEAR, "tile": [0x14, 0x33], "out": ["sp2"]},
	{"name": "sp2", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x12B, "cpath": NORTH_CLEAR, "tile": [0x17, 0x33], "out": ["sp3"]},
	{"name": "sp3", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x12C, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x33], "out": ["sp4"]},
	{"name": "sp4", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x12D, "cpath": NORTH_CLEAR, "tile": [0x1D, 0x33], "out": ["sp5"]},
	{"name": "sp5", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x128, "cpath": NORTH_CLEAR, "tile": [0x1D, 0x31], "out": ["sp6"]},
	{"name": "sp6", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 1, "id": 0x127, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x31], "out": ["sp7"]},
	{"name": "sp7", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x126, "cpath": NORTH_CLEAR, "tile": [0x17, 0x31], "out": ["sp8"]},
	{"name": "sp8", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": NO_GHOST, "water": 0, "id": 0x125, "cpath": NORTH_CLEAR, "tile": [0x14, 0x31], "out": ["yi2"]},

	// switches
	{"name": "yswitch", "world": 1, "exits": 0, "castle": 0, "palace": 1, "ghost": NO_GHOST, "water": 0, "id": 0x014, "cpath": NO_CASTLE, "tile": [0x02, 0x11], "out": []},
	{"name": "gswitch", "world": 2, "exits": 0, "castle": 0, "palace": 4, "ghost": NO_GHOST, "water": 0, "id": 0x008, "cpath": NO_CASTLE, "tile": [0x01, 0x0D], "out": []},
	{"name": "rswitch", "world": 3, "exits": 0, "castle": 0, "palace": 3, "ghost": NO_GHOST, "water": 0, "id": 0x11B, "cpath": NO_CASTLE, "tile": [0x0B, 0x32], "out": []},
	{"name": "bswitch", "world": 5, "exits": 0, "castle": 0, "palace": 2, "ghost": NO_GHOST, "water": 0, "id": 0x121, "cpath": NO_CASTLE, "tile": [0x0D, 0x3A], "out": []},

	// warps
	{"name": "warp-sw1", "exits": 0, "id": 0x016, "tile": [0x07, 0x12], "warp": 0x06, "rwarp": 0x0D, "events": [{"stageid": 0x136, "secret": 0}]},
	{"name": "warp-sw2", "exits": 0, "id": 0x108, "tile": [0x01, 0x2E], "warp": 0x0E, "rwarp": 0x0F, "events": [{"stageid": 0x134, "secret": 0}, {"stageid": 0x134, "secret": 1}]},
	{"name": "warp-sw3", "exits": 0, "id": 0x012, "tile": [0x10, 0x0F], "warp": 0x10, "rwarp": 0x11, "events": [{"stageid": 0x130, "secret": 0}, {"stageid": 0x130, "secret": 1}]},
	{"name": "warp-sw4", "exits": 0, "id": 0x01E, "tile": [0x14, 0x10], "warp": 0x12, "rwarp": 0x13, "events": [{"stageid": 0x132, "secret": 0}, {"stageid": 0x132, "secret": 1}]},
	{"name": "warp-sw5", "exits": 0, "id": 0x10C, "tile": [0x15, 0x23], "warp": 0x19, "rwarp": 0x15, "events": [{"stageid": 0x135, "secret": 0}, {"stageid": 0x135, "secret": 1}]},
	{"name": "warp-sp",  "exits": 0, "id": 0x131, "tile": [0x18, 0x38], "warp": 0x16, "rwarp": 0x17, "events": []},

	// other
	{"name": "topsecret", "exits": 0, "id": 0x003, "tile": [0x05, 0x08]},
//	{"name": "yhouse", "exits": 0, "id": 0x104, "tile": [0x07, 0x27]},
];

var PRIMARY_SUBLEVEL_IDS = $.map(SMW_STAGES, function(x){ return x.id });

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
var TRANSLEVEL_EVENTS       = 0x2D608;

var DESTRUCTION_EVENT_NUMBERS = 0x265D6;
var DESTRUCTION_EVENT_COORDS  = 0x265B6;
var DESTRUCTION_EVENT_VRAM    = 0x26587;

// koopa kid boss room sublevels, indexed by castle #
var KOOPA_KID_SUBLEVELS = [ 0x1F6, 0x0E5, 0x1F2, 0x0D9, 0x0CC, 0x0D3, 0x1EB ];

var NO_YOSHI_GHOST = 0,
	NO_YOSHI_CASTLE_DAY = 1,
	NO_YOSHI_PLAINS = 2,
	NO_YOSHI_STARS = 3,
	NO_YOSHI_ICE = 4,
	NO_YOSHI_CASTLE_NIGHT = 5,
	NO_YOSHI_DISABLED = 6;

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

var KOOPA_SETS =
[
	[0x00, 0x01, 0x02, 0x03], // shell-less
	[0x04, 0x05, 0x06, 0x07], // shelled
	[0x08, 0x0A, 0x0B],       // flying
	[0x09, 0x0C],             // winged, not flying
	[0x22, 0x23, 0x24, 0x25], // net koopas
];

// when koopa type K is jumped on,
// the result is koopa type V
var KOOPA_STOMP =
{
	0x04: 0x00,
	0x05: 0x01,
	0x06: 0x02,
	0x07: 0x03,
	0x08: 0x04,
	0x09: 0x04,
	0x0A: 0x05,
	0x0B: 0x05,
	0x0C: 0x07,
};

var LAYER2_NONE = 0,
    LAYER2_BACKGROUND = 1,
	LAYER2_INTERACT = 2;

var LEVEL_MODES =
{
	0x00: { maxscreens: 0x20, horiz: 1, layer2: LAYER2_BACKGROUND },
	0x01: { maxscreens: 0x10, horiz: 1, layer2: LAYER2_NONE },
	0x02: { maxscreens: 0x10, horiz: 1, layer2: LAYER2_INTERACT },
//	0x03: { maxscreens: 0x0D, horiz: 0, layer2: LAYER2_INTERACT },
//	0x04: { maxscreens: 0x0D, horiz: 0, layer2: LAYER2_INTERACT },
//	0x05: { maxscreens: 0x0E, horiz: 1, layer2: LAYER2_INTERACT },
//	0x06: { maxscreens: 0x0E, horiz: 1, layer2: LAYER2_INTERACT },
	0x07: { maxscreens: 0x0E, horiz: 0, layer2: LAYER2_NONE },
	0x08: { maxscreens: 0x0E, horiz: 0, layer2: LAYER2_INTERACT },
	0x09: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_BACKGROUND },
	0x0A: { maxscreens: 0x1C, horiz: 0, layer2: LAYER2_BACKGROUND },
	0x0B: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_BACKGROUND },
	0x0C: { maxscreens: 0x20, horiz: 1, layer2: LAYER2_BACKGROUND },
	0x0D: { maxscreens: 0x1C, horiz: 0, layer2: LAYER2_BACKGROUND }, // dark bg vert
	0x0E: { maxscreens: 0x20, horiz: 1, layer2: LAYER2_BACKGROUND }, // dark bg horiz
	0x0F: { maxscreens: 0x10, horiz: 1, layer2: LAYER2_NONE },
	0x10: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_BACKGROUND },
	0x11: { maxscreens: 0x20, horiz: 1, layer2: LAYER2_BACKGROUND }, // "weird" horiz
//	0x12: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x13: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x14: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x15: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x16: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x17: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x18: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x19: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x1A: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x1B: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x1C: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
//	0x1D: { maxscreens: 0x00, horiz: 1, layer2: LAYER2_INTERACT },
	0x1E: { maxscreens: 0x20, horiz: 1, layer2: LAYER2_BACKGROUND }, // trans (layer1) horiz
	0x1F: { maxscreens: 0x10, horiz: 1, layer2: LAYER2_NONE }, // trans (layer2) horiz
};

var VALID_FGP_BY_TILESET =
{
	0x0: [0, 1,    3, 4, 5,    7], // Normal 1
	0x1: [         3, 4, 5,    7], // Castle 1
	0x2: [   1, 2, 3, 4, 5,    7], // Rope 1
	0x3: [      2, 3, 4, 5,    7], // Underground 1
	0x4: [   1, 2, 3, 4, 5,    7], // Switch Palace 1
	0x5: [            4, 5,     ], // Ghost House 1
	0x6: [   1, 2, 3, 4, 5,    7], // Rope 2
	0x7: [0, 1,    3, 4, 5,    7], // Normal 2
	0x8: [   1, 2, 3, 4, 5,    7], // Rope 3
	0x9: [   1, 2, 3, 4, 5,    7], // Underground 2
	0xA: [   1, 2, 3, 4, 5,    7], // Switch Palace 2
	0xB: [         3, 4, 5,    7], // Castle 2
	0xC: [                      ], // Cloud/Forest
	0xD: [            4, 5,     ], // Ghost House 2
	0xE: [      2, 3, 4, 5,    7], // Underground 3
};

var VALID_BGP_BY_LAYER2 =
{
	0xFFDD44: [0, 1, 2, 3,    5, 6, 7], // Clouds
	0xFFEC82: [0,    2, 3,    5, 6, 7], // Bushes
	0xFFEF80: [   1,    3,    5, 6   ], // Ghost House
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
	0xFFF175: [0, 1, 2, 3,    5, 6   ], // Ghost Ship
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
//	0xFFE674: [1, 0x1B, null], // Bonus
	0xFFDAB9: [0, 0x0D,    3], // Water
//	0xFFE8EE: null,            // Empty/Layer 2
	0xFFE7C0: [0, 0x19, null], // Mountains
	0xFFE103: [1, 0x1B,    1], // Castle Pillars
	0xFFDF59: [0, 0x19, null], // Mountains & Clouds
	0xFFE8FE: [1, 0x0C,    3], // Cave
	0xFFD900: [0, 0x1B, null], // P. Hills
	0xFFE472: [0, 0x19, null], // Big Hills
	0xFFE684: [0, 0x0C,    2], // Stars
//	0xFFF175: [1, 0x0C, null], // Ghost Ship
	0xFFDC71: [0, 0x19, null], // Hills & Clouds
//	0x06861B: null,            // Ghost House Exit
};

var BG_CAN_VSCROLL =
{
	0xFFDD44: true,
	0xFFEF80: true,
	0xFFF45A: true,
	0xFFE7C0: true,
	0xFFDF59: true,
	0xFFE8FE: true,
	0xFFE684: true,
	0xFFF175: true,
};

var SWITCH_OBJECTS = [ null, 0x8B, 0x8C, 0x8D, 0x8A ];

var SP4_SPRITES =
[
	{ id: 0x09, sp4: null, mem: null, water: 0, tide: 0, name: 'Green Parakoopa', pos: [[43, 21], [30, 22], [20, 22]], },
	{ id: 0x1C, sp4: null, mem: null, water: 0, tide: 0, name: 'Bullet Bill', pos: [[32, 23], [32, 22], [32, 21]], },
	{ id: 0x0D, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Bob-omb', pos: [[32, 23]], },
	{ id: 0x13, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Spiny', pos: [[32, 23]], },
	{ id: 0x1B, sp4: 0x04, mem: null, water: 0, tide: 0, name: 'Football', pos: [[32, 23]], },
	{ id: 0x1D, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Bouncing Fire', pos: [[32, 23], [22, 23], [12, 23]], },
	{ id: 0x1F, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Magikoopa', pos: [[7, 22]], },
	{ id: 0x26, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Thwomp', pos: [[33, 14], [36, 14], [39, 14]], },
	{ id: 0x27, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Thwimp', pos: [[14, 21], [33, 14]], },
	{ id: 0x28, sp4: 0x11, mem: 0x09, water: 0, tide: 0, name: 'Big Boo', pos: [[38, 21]], },
	{ id: 0x37, sp4: 0x11, mem: null, water: 0, tide: 0, name: 'Boo', pos: [[35, 21], [14, 21], [38, 19]], },
	{ id: 0x3A, sp4: 0x06, mem: null, water: 1, tide: 0, name: 'Urchin (Short)', pos: [[29, 21], [34, 21]], },
	{ id: 0x3B, sp4: 0x06, mem: null, water: 1, tide: 0, name: 'Urchin (Full)', pos: [[39, 19], [34, 22]], },
	{ id: 0x3D, sp4: 0x06, mem: null, water: 1, tide: 0, name: 'Rip Van Fish', pos: [[14, 23], [39, 21]], },
	{ id: 0x3F, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Para-Goomba', pos: [[33, 14], [35, 15], [37, 14], [37, 15]], },
	{ id: 0x40, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Para-Bomb', pos: [[33, 14], [35, 15], [37, 14], [37, 15]], },
	{ id: 0x4B, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Pipe Lakitu', pos: [[35, 23]], },
	{ id: 0x4D, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Ground Mole', pos: [[24, 23], [28, 23], [32, 23], [36, 23]], },
//	{ id: 0x4E, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Wall Mole', pos: [[24, 25], [28, 25], [32, 25], [36, 25]], },
	{ id: 0x51, sp4: 0x0E, mem: null, water: 0, tide: 0, name: 'Ninji', pos: [[34, 23], [35, 23], [36, 23], [37, 23]], },
//	{ id: 0x52, sp4: 0x11, mem: null, water: 0, tide: 0, name: 'Moving Hole', pos: [[12, 24], [12, 24], [24, 24]], },
	{ id: 0x6E, sp4: 0x23, mem: null, water: 0, tide: 0, name: 'Dino Rhino (Big)', pos: [[28, 22], [36, 22]], },
	{ id: 0x6F, sp4: 0x23, mem: null, water: 0, tide: 0, name: 'Dino Torch (Small)', pos: [[37, 23], [34, 23], [31, 23]], },
	{ id: 0x70, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Pokey', pos: [[37, 19], [35, 19]], },
	{ id: 0x71, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Super Koopa (Red)', pos: [[34, 18], [24, 18]], },
	{ id: 0x72, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Super Koopa (Yellow)', pos: [[34, 18], [24, 18]], },
	{ id: 0x73, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Super Koopa (Feather)', pos: [[32, 23], [30, 23], [30, 23], [31, 23]], },
	{ id: 0x86, sp4: 0x02, mem: 0x0A, water: 0, tide: 0, name: 'Wiggler', pos: [[29, 23], [27, 23], [25, 23]], },
	{ id: 0x90, sp4: 0x11, mem: 0x0D, water: 0, tide: 0, name: 'Green Gas Bubble', pos: [[35, 18]], },
	{ id: 0x99, sp4: 0x0E, mem: null, water: 0, tide: 0, name: 'Volcano Lotus', pos: [[36, 23], [37, 23]], },
	{ id: 0x9E, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Ball n Chain', pos: [[32, 19]], },
	{ id: 0x9F, sp4: 0x20, mem: 0x04, water: 0, tide: 0, name: 'Banzai Bill', pos: [[38, 19], [41, 19]], },
	{ id: 0xA4, sp4: 0x05, mem: null, water: 0, tide: 1, name: 'Floating Spike Ball', pos: [[36, 23], [35, 23]], },
	{ id: 0xA8, sp4: 0x04, mem: null, water: 0, tide: 0, name: 'Blargg', pos: [[33, 24], [31, 24]], },
	{ id: 0xAA, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Fishbone', pos: [[30, 21], [30, 22], [30, 23]], },
	{ id: 0xAB, sp4: 0x20, mem: null, water: 0, tide: 0, name: 'Rex', pos: [[27, 22], [29, 22], [37, 22]], },
	{ id: 0xB0, sp4: 0x11, mem: null, water: 0, tide: 0, name: 'Buddy Boo Line', pos: [[31, 21]], },
	{ id: 0xB2, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Falling Spike', pos: [[33, 14], [35, 14], [37, 14]], },
	{ id: 0xBB, sp4: 0x03, mem: null, water: 0, tide: 0, name: 'Moving Grey Block', pos: [[14, 24], [30, 24]], }, // SPECIAL
	{ id: 0xBE, sp4: 0x04, mem: null, water: 0, tide: 0, name: 'Swoop', pos: [[29, 21], [31, 21], [37, 14]], },
	{ id: 0xBF, sp4: 0x20, mem: null, water: 0, tide: 0, name: 'Mega Mole', pos: [[24, 22], [30, 22], [36, 22]], },
	{ id: 0xC3, sp4: 0x06, mem: null, water: 0, tide: 1, name: 'Porcu-Puffer', pos: [[14, 24], [30, 24], [37, 24]], },
	{ id: 0xC9, sp4: null, mem: null, water: 0, tide: 0, name: 'Bullet Bill Generator', pos: [[39, 22], [39, 23]], },
	{ id: 0xCA, sp4: 0x06, mem: null, water: 0, tide: 0, name: 'Torpedo Ted Generator', pos: [[30, 20]], },
	{ id: 0xCB, sp4: 0x11, mem: null, water: 0, tide: 0, name: 'Eerie Generator', pos: [[1, 0]], },
	{ id: 0xCF, sp4: 0x06, mem: null, water: 0, tide: 1, name: 'Dolphin Left Generator', pos: [[1, 0]], },
	{ id: 0xD0, sp4: 0x06, mem: null, water: 0, tide: 1, name: 'Dolphin Right Generator', pos: [[1, 0]], },
	{ id: 0xD3, sp4: 0x09, mem: null, water: 0, tide: 0, name: 'Super Koopa Generator', pos: [[1, 0]], },
//	{ id: 0xD4, sp4: 0x02, mem: null, water: 0, tide: 0, name: 'Bubble Generator', pos: [[1, 0]], },
	{ id: 0xD5, sp4: 0x05, mem: null, water: 0, tide: 0, name: 'Bullet Bill L/R Generator', pos: [[1, 0]], },
	{ id: 0xD6, sp4: null, mem: null, water: 0, tide: 0, name: 'Multi Bullet Generator', pos: [[1, 0]], },
	{ id: 0xD7, sp4: 0x05, mem: null, water: 0, tide: 0, name: 'Diagonal Bullet Generator', pos: [[1, 0]], },
	{ id: 0xE1, sp4: 0x11, mem: 0x07, water: 0, tide: 0, name: 'Boo Ceiling', pos: [[1, 0]], },
	{ id: 0xE5, sp4: 0x11, mem: 0x07, water: 0, tide: 0, name: 'Boo Cloud (SGS room2)', pos: [[1, 0]], },
	{ id: 0xE2, sp4: 0x11, mem: null, water: 0, tide: 0, name: 'Boo Ring CCW', pos: [[26, 20], [10, 20], [39, 21]], },
	{ id: 0xE3, sp4: 0x11, mem: null, water: 0, tide: 0, name: 'Boo Ring CW', pos: [[26, 20], [10, 20], [39, 21]], },
];

var QUESTION_BLOCK_IDS = [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38];

var HAMMER_CAN_KILL =
[
	// castle enemies
	0x26, 0x27,

	// water enemies
	0xC3, 0x44, 0x3A, 0x3B, 0x3C, 0x41, 0x42, 0x43,

	// ghost enemies
	0x37, 0x38, 0x39, 0x28,

	// bone enemies
	0xAA, 0x30, 0x31, 0x32,

	// other
	0xBF,
];

var CI2_ROOM_OFFSETS =
[
	[0x06, 0x08, 0x0A], // room 1
	[0x0C, 0x0E, 0x10], // room 2
	[0x00, 0x02], // room 3
];

var CI2_ALL_OFFSETS = $.map(CI2_ROOM_OFFSETS, function(x){ return x; });

var CI2_LAYER_OFFSETS =
{
	'layer1': snesAddressToOffset(0x05DB08),
//	'layer2': snesAddressToOffset(0x05DB2C),
	'sprite': snesAddressToOffset(0x05DB1A),
};

var SUBLEVEL_DUPLICATES =
{
	0x0DE: 0x0F9, // dgh room 2
	0x0E1: 0x0E0, // vfort room 2
	0x0EC: 0x013, // dsh room 1
	0x0EE: 0x013,
	0x0F2: 0x0ED, // dsh room 2
	0x0F6: 0x022, // ci1 copies
	0x0F5: 0x022,
	0x0D1: 0x022,
	0x0D0: 0x022,
	0x1FB: 0x107, // vgh room 1
	0x1D9: 0x114, // bgh room 1
	0x1DB: 0x1DC, // bgh left room
	0x1E8: 0x11D, // fgh room 1
	0x1E9: 0x11D,
	0x1C5: 0x1C4, // gnarly room 2
};

var DONT_SHUFFLE_EXITS = [ 0x11D, ];

var STAR_PATTERNS =
[
	[ // credit: Dotsarecool
		" x  xxxx        xxxx  x  ",
		"x  x x  x  x   x x  x  x ",
		"x   xx     x    xx     x ",
		"x           x          x ",
		"x          xx          x ",
		"x       x      x       x ",
		" x       xxxxxx       x  ",
	],
	[ // credit: Dotsarecool
		"                         ",
		"  xx                  xx ",
		"xx  x  xx       xx  xx  x",
		"    x xx x     xx x     x",
		"   x  xxxx     xxxx    x ",
		" xx    xx       xx   xx  ",
		"          xxxxx          ",
	],
	[ // credit: Dotsarecool
		"   x x  x  xx  xx   x    ",
		"   x x x x x x x x x x   ",
		"   x x x x x x x x x x   ",
		"   xx  xxx xx  xx  xxx   ",
		"   x x x x x   x   x x   ",
		"   x x x x x   x   x x   ",
		"   x x x x x   x   x x   ",
	],
	[ // credit: Dotsarecool
		"    x x       xxxxxxxx   ",
		"   x x xxx      x  x     ",
		"   xxxx   x    xxx x     ",
		"  xx    x x   x  x xxx   ",
		"   x      x     xx x     ",
		"  xx      x      x x x   ",
		"   x  xxxx    xxx   xx   ",
	],
	[ // credit: Dotsarecool
		" x       x     x       x ",
		"x   x   x x   x x   x   x",
		"x xxxxx    xxx    xxxxx x",
		"x  xxx    x   x    xxx  x",
		"x  xxx    x   x    xxx  x",
		"x x   x   x   x   x   x x",
		" x         xxx         x ",
	],
	[
		"         x   xxxx        ",
		"        x      x         ",
		"       x      x          ",
		"      x     xxxxxx       ",
		"       x      xx         ",
		"        x    x           ",
		"         x    xxx        ",
	],
];

var KEY_CAN_REPLACE = [
	// koopas and goombas (not flying to avoid dropping in a pit)
	0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x09, 0x0C, 0xBD, 0x0F, 0x10,
	0xDA, 0xDB, 0xDC, 0xDD, 0xDF,

	// chucks
	0x91, 0x92, 0x93, 0x94, 0x95, 0x97, 0x98,

	// other enemies (some tileset specific)
	0x0D, 0x11, 0x13, 0x26, 0x27, 0x46, 0x4E, 0x51, 0x6E, 0x6F, 0x70, 0x71, 0x72, 0x73,
	0x86, 0x99, 0x9F, 0xAB, 0xBE, 0xBF, 0x3D,

	// powerups
	0x74, 0x75, 0x76, 0x77, 0x78,

	// special case - bubbles and exploding blocks
	0x9D, 0x4C,

	// other
	0x2C, 0x2D, 0x2F,
];

var KEY_REPLACEMENTS = [
	// koopas and goombas
	0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x09, 0x0C, 0xBD, 0x0F, 0x10,
	0xDA, 0xDB, 0xDC, 0xDD, 0xDF,

	// powerups
	0x78,

	// other
	0x21,
];

var AUTOSCROLL_ROOMS =
[
	// good rooms
	0x011, 0x111, 0x12D, 0x1CD,

	// maybe less good rooms?
	0x126, 0x1CC, 0x01B, 0x11C,
];

// priority from greatest (most likely to be replaced) to least
var REPLACEABLE_SPRITES =
[
	0x02, 0x03, 0x04, 0x05, 0x07, 0x06, 0xAB, 0x1D, 0x4F, 0x50, 0x48,

	0x22, 0x23, 0x24, 0x25,

	0x11, 0x13, 0x15, 0x16, 0x27, 0x31, 0x38, 0x3D, 0x68, 0x6F, 0x71, 0x72,

	0x4C, 0x33, 0xBC, 0x93, 0xB3, 0xAA, 0xAB, 0xC2, 0x6D,
];

var NO_WATER_STAGES = [
	// do not add water to these stages
	0x01A, 0x0DC, 0x111, 0x1CF, 0x134, 0x1F8, 0x0C7, 0x1E3, 0x1E2, 0x1F2, 0x0D3, 0x0CC,

	// this is blacklisted in the first pass (water bowser)
	0x1C7,

	// do not remove water from these stages

];

var TIME_VALUES = [0, 200, 300, 400];
var VSCROLL_TYPE = ['no-v', 'always', 'locked', 'no-v/h'];
var LAYER3_TYPE = ['none', 'tide', 'mondo', '???'];
