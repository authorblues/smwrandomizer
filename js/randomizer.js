var VERSION_STRING = 'v0.4';

// this is the md5 of the only rom that we will accept
var ORIGINAL_MD5 = "cdd3c8c37322978ca8669b34bc89c804";

var LAYER1_OFFSET;
var LAYER2_OFFSET;
var SPRITE_OFFSET;
var FLAGBASE;

var level_offsets = [
	// layer data
	{"name": "layer1", "bytes": 3, "offset": LAYER1_OFFSET = 0x2E000},
	{"name": "layer2", "bytes": 3, "offset": LAYER2_OFFSET = 0x2E600},
	{"name": "sprite", "bytes": 2, "offset": SPRITE_OFFSET = 0x2EC00},
	
	// secondary header data
	{"name": "header1", "bytes": 1, "offset": 0x2F000},
	{"name": "header2", "bytes": 1, "offset": 0x2F200},
	{"name": "header3", "bytes": 1, "offset": 0x2F400},
	{"name": "header4", "bytes": 1, "offset": 0x2F600},
	
	// custom data
	{"name": "lvflags", "bytes": 1, "offset": FLAGBASE = 0x1FDE0},
];

var trans_offsets = [
	// name pointer
	{"name": "nameptr", "bytes": 2, "offset": 0x220FC},
];

var NORMAL = 0,
    SECRET = 1;

var smw_stages = [
	{"name": "yi1", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x105, "tile": [0x04, 0x28], "out": ["yswitch"]}, 
	{"name": "yi2", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x106, "tile": [0x0A, 0x28], "out": ["yi3"]}, 
	{"name": "yi3", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x103, "tile": [0x0A, 0x26], "out": ["yi4"]}, 
	{"name": "yi4", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x102, "tile": [0x0C, 0x24], "out": ["c1"]}, 
	{"name": "dp1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x015, "tile": [0x05, 0x11], "out": ["dp2", "ds1"]}, 
	{"name": "dp2", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x009, "tile": [0x03, 0x0D], "out": ["dgh", "gswitch"]}, 
	{"name": "dp3", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x005, "tile": [0x09, 0x0A], "out": ["dp4"]}, 
	{"name": "dp4", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x006, "tile": [0x0B, 0x0C], "out": ["c2"]}, 
	{"name": "ds1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x00A, "tile": [0x05, 0x0E], "out": ["dgh", "dsh"]}, 
	{"name": "ds2", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10B, "tile": [0x11, 0x21], "out": ["dp3"]}, 
	{"name": "vd1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11A, "tile": [0x06, 0x32], "out": ["vd2", "vs1"]}, 
	{"name": "vd2", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x118, "tile": [0x09, 0x30], "out": ["vgh", "rswitch"]}, 
	{"name": "vd3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10A, "tile": [0x0D, 0x2E], "out": ["vd4"]}, 
	{"name": "vd4", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x119, "tile": [0x0D, 0x30], "out": ["c3"]}, 
	{"name": "vs1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x109, "tile": [0x04, 0x2E], "out": ["vs2", "sw2"]}, 
	{"name": "vs2", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x001, "tile": [0x0C, 0x03], "out": ["vs3"]}, 
	{"name": "vs3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x002, "tile": [0x0E, 0x03], "out": ["vfort"]}, 
	{"name": "cba", "world": 4, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00F, "tile": [0x14, 0x05], "out": ["cookie", "soda"]}, 
	{"name": "soda", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x011, "tile": [0x14, 0x08], "out": ["sw3"]}, 
	{"name": "cookie", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x010, "tile": [0x17, 0x05], "out": ["c4"]}, 
	{"name": "bb1", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00C, "tile": [0x14, 0x03], "out": ["bb2"]}, 
	{"name": "bb2", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00D, "tile": [0x16, 0x03], "out": ["c4"]}, 
	{"name": "foi1", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11E, "tile": [0x09, 0x37], "out": ["foi2", "fgh"]}, 
	{"name": "foi2", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x120, "tile": [0x0B, 0x3A], "out": ["foi3", "bswitch"]}, 
	{"name": "foi3", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x123, "tile": [0x09, 0x3C], "out": ["fgh", "c5"]}, 
	{"name": "foi4", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11F, "tile": [0x05, 0x3A, ], "out": ["foi2", "fsecret"]}, 
	{"name": "fsecret", "world": 5, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x122, "tile": [0x05, 0x3C], "out": ["ffort"]}, 
	{"name": "ci1", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x022, "tile": [0x18, 0x16], "out": ["cgh"]}, 
	{"name": "ci2", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x024, "tile": [0x15, 0x1B], "out": ["ci3", "csecret"]}, 
	{"name": "ci3", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x023, "tile": [0x13, 0x1B], "out": ["ci3", "cfort"]}, 
	{"name": "ci4", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x01D, "tile": [0x0F, 0x1D], "out": ["ci5"]}, 
	{"name": "ci5", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x01C, "tile": [0x0C, 0x1D], "out": ["c6"]}, 
	{"name": "csecret", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x117, "tile": [0x18, 0x29], "out": ["c6"]}, 
	{"name": "vob1", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x116, "tile": [0x1C, 0x27], "out": ["vob2"]}, 
	{"name": "vob2", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x115, "tile": [0x1A, 0x27], "out": ["bgh", "bfort"]}, 
	{"name": "vob3", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x113, "tile": [0x15, 0x27], "out": ["vob4"]}, 
	{"name": "vob4", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10F, "tile": [0x15, 0x25], "out": ["sw5"]}, 
	{"name": "c1", "world": 1, "exits": 1, "castle": 1, "palace": 0, "ghost": 0, "water": 0, "id": 0x101, "tile": [0x0A, 0x22], "out": ["dp1"]}, 
	{"name": "c2", "world": 2, "exits": 1, "castle": 2, "palace": 0, "ghost": 0, "water": 0, "id": 0x007, "tile": [0x0D, 0x0C], "out": ["vd1"]}, 
	{"name": "c3", "world": 3, "exits": 1, "castle": 3, "palace": 0, "ghost": 0, "water": 0, "id": 0x11C, "tile": [0x0D, 0x32], "out": ["cba"]}, 
	{"name": "c4", "world": 4, "exits": 1, "castle": 4, "palace": 0, "ghost": 0, "water": 0, "id": 0x00E, "tile": [0x1A, 0x03], "out": ["foi1"]}, 
	{"name": "c5", "world": 5, "exits": 1, "castle": 5, "palace": 0, "ghost": 0, "water": 0, "id": 0x020, "tile": [0x18, 0x12], "out": ["ci1"]}, 
	{"name": "c6", "world": 6, "exits": 1, "castle": 6, "palace": 0, "ghost": 0, "water": 0, "id": 0x01A, "tile": [0x0C, 0x1B], "out": ["sgs"]}, 
	{"name": "c7", "world": 7, "exits": 1, "castle": 7, "palace": 0, "ghost": 0, "water": 0, "id": 0x110, "tile": [0x18, 0x25], "out": ["BOWSER"]}, 
	{"name": "vfort", "world": 3, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 1, "id": 0x00B, "tile": [0x10, 0x03], "out": ["bb1"]}, 
	{"name": "ffort", "world": 5, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x01F, "tile": [0x16, 0x10], "out": ["sw4"]}, 
	{"name": "cfort", "world": 6, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x01B, "tile": [0x0F, 0x1B], "out": ["ci4"]}, 
	{"name": "bfort", "world": 7, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x111, "tile": [0x1A, 0x25], "out": ["BOWSER"]}, 
	{"name": "dgh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x004, "tile": [0x05, 0x0A], "out": ["topsecret", "dp3"]}, 
	{"name": "dsh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x013, "tile": [0x07, 0x10], "out": ["ds2", "sw1"]}, 
	{"name": "vgh", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x107, "tile": [0x09, 0x2C], "out": ["vd3"]}, 
	{"name": "fgh", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x11D, "tile": [0x07, 0x37], "out": ["foi1", "foi4"]}, 
	{"name": "cgh", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x021, "tile": [0x15, 0x16], "out": ["ci2"]}, 
	{"name": "sgs", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 2, "water": 1, "id": 0x018, "tile": [0x0E, 0x17], "out": ["vob1"]}, 
	{"name": "bgh", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x114, "tile": [0x18, 0x27], "out": ["vob3", "c7"]}, 
	{"name": "sw1", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x134, "tile": [0x15, 0x3A], "out": ["sw1", "sw2"]}, 
	{"name": "sw2", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x130, "tile": [0x16, 0x38], "out": ["sw2", "sw3"]}, 
	{"name": "sw3", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x132, "tile": [0x1A, 0x38], "out": ["sw3", "sw4"]}, 
	{"name": "sw4", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x135, "tile": [0x1B, 0x3A], "out": ["sw4", "sw5"]}, 
	{"name": "sw5", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x136, "tile": [0x18, 0x3B], "out": ["sw1", "sp1"]}, 
	{"name": "sp1", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12A, "tile": [0x14, 0x33], "out": ["sp2"]}, 
	{"name": "sp2", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12B, "tile": [0x17, 0x33], "out": ["sp3"]}, 
	{"name": "sp3", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12C, "tile": [0x1A, 0x33], "out": ["sp4"]}, 
	{"name": "sp4", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12D, "tile": [0x1D, 0x33], "out": ["sp5"]}, 
	{"name": "sp5", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x128, "tile": [0x1D, 0x31], "out": ["sp6"]}, 
	{"name": "sp6", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x127, "tile": [0x1A, 0x31], "out": ["sp7"]}, 
	{"name": "sp7", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x126, "tile": [0x17, 0x31], "out": ["sp8"]}, 
	{"name": "sp8", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x125, "tile": [0x14, 0x31], "out": ["yi2"]}, 
	{"name": "yswitch", "world": 1, "exits": 0, "castle": 0, "palace": 1, "ghost": 0, "water": 0, "id": 0x014, "tile": [0x02, 0x11], "out": []}, 
	{"name": "gswitch", "world": 2, "exits": 0, "castle": 0, "palace": 4, "ghost": 0, "water": 0, "id": 0x008, "tile": [0x01, 0x0D], "out": []}, 
	{"name": "rswitch", "world": 3, "exits": 0, "castle": 0, "palace": 3, "ghost": 0, "water": 0, "id": 0x11B, "tile": [0x0B, 0x32], "out": []}, 
	{"name": "bswitch", "world": 5, "exits": 0, "castle": 0, "palace": 2, "ghost": 0, "water": 0, "id": 0x121, "tile": [0x0D, 0x3A], "out": []}, 
//	{"name": "topsecret", "world": 2, "exits": 0, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x003, "tile": [0x05, 0x08], "out": []}, 
];

function isPermanentTile(stage)
{
	var PERMANENT_TILES = [ 'sw1', 'sw2', 'sw3', 'sw4', 'sw5', 'sp1', 'yi1', 'yi2', 'foi1' ];
	return stage.palace || stage.ghost || stage.castle || PERMANENT_TILES.contains(stage.name);
}

// koopa kid boss room sublevels, indexed by castle #
var koopa_kids = [0x1F6, 0x0E5, 0x1F2, 0x0D9, 0x0CC, 0x0D3, 0x1EB];

var SEC_EXIT_OFFSET_LO = 0x2F800;
var SEC_EXIT_OFFSET_HI = 0x2FE00;
var SEC_EXIT_OFFSET_X1 = 0x2FA00;
var SEC_EXIT_OFFSET_X2 = 0x2FC00;

var TRANSLEVEL_EVENTS = 0x2D608;

function randomizeROM(buffer, seed)
{
	var stages = smw_stages.slice(0);
	if ($('#randomize_95exit').is(':checked'))
	{
		// remove dgh and topsecret from rotation
		for (var i = stages.length - 1; i >= 0; --i)
			if ([0x003, 0x004].contains(stages[i].id))
				stages.splice(i, 1);
	}
	
	var random = new Random(seed);
	var vseed = random.seed.toHex(8, '');
	var globalremapping = {};
	
	$('#custom-seed').val('');
	$('#used-seed').text(vseed);
	
	var rom = new Uint8Array(buffer);
	
	// randomize all of the slippery/water flags
	randomizeFlags(random, stages, rom);
	
	// NOTE: MAKE SURE ANY TABLES BACKED UP BY THIS ROUTINE ARE GENERATED *BEFORE*
	// THIS POINT. OTHERWISE, WE ARE BACKING UP UNINITIALIZED MEMORY!
	backupData(stages, rom);
	
	// put all the stages into buckets (any stage in same bucket can be swapped)
	var buckets = makeBuckets(stages);
	
	// decide which stages will be swapped with which others
	for (var i = 0; i < buckets.length; ++i) shuffle(buckets[i], random);
	
	// quick stage lookup table
	var stagelookup = {};
	for (var i = 0; i < stages.length; ++i)
		stagelookup[stages[i].copyfrom.name] = stages[i];
	
	if ($('#randomize_bowserdoors').is(':checked'))
		randomizeBowser8Doors(random, rom);
		
	// randomize bowser's castle
	switch ($('input[name="bowser"]:checked').val())
	{
		case 'random': randomizeBowserEntrances(random, globalremapping, rom); break;
		case 'gauntlet': generateGauntlet(random, 8, rom); break;
		case 'minigauntlet': generateGauntlet(random, random.nextIntRange(3,6), rom); break;
	}
		
	// how should powerups be affected
	switch ($('input[name="powerups"]:checked').val())
	{
		case 'random': randomizePowerups(random, rom, stages); break;
		case 'nocape': removeCape(rom, stages); break;
		case 'smallonly': removeAllPowerups(rom, stages); break;
	}
	
	if ($('#noyoshi').is(':checked')) removeYoshi(rom, stages);
	
	// update level names if randomized
	if ($('#customnames').is(':checked')) randomizeLevelNames(random, rom);
	
	// swap all the level name pointers RIGHT before we perform the copy
	if ('random_stage' == $('input[name="levelnames"]:checked').val())
		shuffleLevelNames(stages, random);
	
	for (var i = 0; i < stages.length; ++i)
	{
		performCopy(stages[i], globalremapping, rom);
		
		// randomly swap the normal/secret exits
		if ($('#randomize_exits').is(':checked') && random.nextFloat() > 0.5)
			swapExits(stages[i], rom);
	}
	
	// fix castle/fort/switch overworld tile events
	fixOverworldEvents(stages, rom);
	
	// fix Roy/Larry castle block paths
	fixBlockPaths(stagelookup, rom);
	
	// fix message box messages
	fixMessageBoxes(stages, rom);
	
	if ($('#randomize_koopakids').is(':checked'))
		randomizeKoopaKids(globalremapping, random, rom);
	
	// disable the forced no-yoshi intro on moved stages
	rom[0x2DA1D] = 0x60;

	// write version number and the randomizer seed to the rom
	writeToTitle(VERSION_STRING + " @" + vseed, 0x2, rom);
	
	// write metadata to the intro cutscene
	updateIntroText(
	[
		centerPad("SMW Randomizer", 18),
		centerPad(VERSION_STRING, 18),
		"",
		"Seed    " + vseed,
		"Preset  " + getPresetName(),
		"",
		centerPad("Good Luck", 18),
		centerPad("and Enjoy!", 18),
	],
	rom);
	
	// fix the checksum (not necessary, but good to do!)
	fixChecksum(rom);
	
	// force the download for the user
	saveAs(new Blob([rom.buffer], {type: "octet/stream"}), 'smw-' + vseed + '.sfc');
}

function shuffle(stages, random)
{
	var rndstages = stages.slice(0);
	if ($('#randomize_stages').is(':checked')) rndstages.shuffle(random);
	for (var i = 0; i < stages.length; ++i)
		stages[i].copyfrom = rndstages[i];
}

function performCopy(stage, map, rom)
{
	map[stage.copyfrom.id] = stage.id;
	for (var j = 0; j < level_offsets.length; ++j)
	{
		var o = level_offsets[j], start = o.offset + o.bytes * stage.id;
		rom.set(stage.copyfrom.data[o.name], start);
	}
	
	var skiprename = $('input[name="levelnames"]:checked').val() == 'same_overworld';
	for (var j = 0; j < trans_offsets.length; ++j)
	{
		var o = trans_offsets[j], start = o.offset + o.bytes * stage.translevel;
		if (skiprename && o.name == 'nameptr') continue;
		rom.set(stage.copyfrom.data[o.name], start);
	}
	
	// castle destruction sequence translevels
	if (stage.copyfrom.castle > 0)
		rom[0x049A7 + stage.copyfrom.castle - 1] = stage.translevel;
	
	if (stage.copyfrom.id == 0x013) rom[0x04A0C] = stage.translevel; // dsh translevel
	if (stage.copyfrom.id == 0x024) rom[0x2DAE5] = stage.translevel; // ci2 translevel
	
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
	
	// if we move a stage between 0x100 banks, we need to move sublevels
	// screen exits as well might need to be fixed, even if we don't change banks
	fixSublevels(stage, map, rom);
	
	// update the overworld tile
	if (stage.copyfrom.data.owtile)
	{
		var ow = getRevealedTile(stage.copyfrom.data.owtile);
		if (isPermanentTile(stage)) ow = getPermanentTile(ow);
		rom[getOverworldOffset(stage)] = ow;
	}
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

function fixBlockPaths(lookup, rom)
{
	var c5 = lookup['c5'], c7 = lookup['c7'];
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
	// mapping for where translevels moved
	for (var transmap = {}, i = 0; i < stages.length; ++i)
		transmap[stages[i].copyfrom.translevel] = stages[i].translevel;
	
	// 23 bytes in table at 0x2A590
	for (var i = 0; i < 23; ++i)
	{
		var val = rom[0x2A590+i], t = val & 0x7F;
		if (t in transmap) rom[0x2A590+i] = transmap[t] | (val & 0x80);
	}
}

function fixOverworldEvents(stages, rom)
{
	var map = {};
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i].copyfrom ? stages[i].copyfrom : stages[i];
		if (stage.copyfrom.palace || stage.copyfrom.castle)
			map[rom[TRANSLEVEL_EVENTS+stage.copyfrom.translevel]] = stage;
	}
		
	var EVENTS = 0x265D6, COORDS = 0x265B6, VRAM = 0x26587;
	for (var i = 0; i < 16; ++i)
	{
		var stage = map[rom[EVENTS+i]];
		if (!stage || !stage.copyfrom) continue;
		
		rom[EVENTS+i] = rom[TRANSLEVEL_EVENTS+stage.translevel];
		var tile = stage.tile, x = tile[0], y = tile[1];
		var s = rom[COORDS+i*2+1] = (y >> 4) * 2 + (x >> 4);
		
		// this technically should wrap if x=0
		// dirty, but no stage is at x=0, so it's safe
		if (s >= 0x4) --x;
		
		if (stage.copyfrom.castle > 0) --y;
		var pos = ((y & 0xF) << 4) | (x & 0xF);
		rom[COORDS+i*2] = pos;
		
		// update vram values for overworld updates
		rom[VRAM+i*2  ] = 0x20 | ((y & 0x10) >> 1) | ((x & 0x10) >> 2) | ((y & 0x0C) >> 2);
		rom[VRAM+i*2+1] = ((y & 0x03) << 6) | ((x & 0x0F) << 1);
	}
	
	// always play bgm after a stage
	rom[0x20E2E] = 0x80;
	
	// the remainder of this method is dedicated to moving the overworld ghost sprites to the locations
	// where the ghost houses have been moved. shoutouts to Nintendo for being kinda shitty at programming
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
			var x = stages[i].tile[0] * 2 - 0x10;
			var y = stages[i].tile[1] * 2 - 0x08;
			
			rom.set([0x0A, x & 0xFF, (x >> 8) & 0xFF, y & 0xFF, (y >> 8) & 0xFF], ghostspritebase);
			ghostspritebase += 5;
			
			rom[ghostsubmapbase] = (stages[i].tile[1] >= 0x20);
			ghostsubmapbase += 1;
		}
		
	rom.set([0x01, 0x20, 0x40, 0x60, 0x80, 0xA0], 0x2766F);
	rom.set(
	[
		0xAD, 0x11, 0x1F, 0x29, 0x01, 0x5D, 0x5C, 0xF6, 0xD0, 0x2E, 0xA9, 0x34, 0xBC, 0x95, 0x0E, 
		0x30, 0x02, 0xA9, 0x44, 0xEB, 0xA9, 0x60, 0x20, 0x06, 0xFB, 0x80, 0x1D
	],
	0x27D7C);
	
	rom[0x276B0] = 0x0A;
	rom[0x27802] = 0x0A;
	
	rom.set([0x22, 0x97, 0xFD, 0x04], 0x01AA4);
	rom.set([0x22, 0x75, 0xF6, 0x04, 0x5C, 0x00, 0x80, 0x7F], 0x27D97);
}

function backupStage(stage, rom)
{
	stage.data = {};
	
	for (var j = 0; j < level_offsets.length; ++j)
	{
		var o = level_offsets[j], start = o.offset + o.bytes * stage.id;
		stage.data[o.name] = rom.slice(start, start + o.bytes);
	}
	
	// translevel should fit in a single byte
	stage.translevel = getTranslevel(stage.id);
	
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
	if (stage.tile) stage.data.owtile = rom[getOverworldOffset(stage)];
}

function getOverworldOffset(stage)
{
	var tile = stage.tile, x = tile[0], y = tile[1];
	var section = (y >> 4) * 2 + (x >> 4);
	
	// $0CF7DF + section * 100 + (row % #$10) * #$10 + column % #$10
	return 0x0677DF + section * 0x100 + (y & 0xF) * 0x010 + (x & 0xF) - (y >= 0x20);
}

function getPermanentTile(x)
{
	var lookup = { 0x7B: 0x7C, 0x7D: 0x7E, 0x7F: 0x80, 0x57: 0x5E, 0x7A: 0x63 };
	return x in lookup ? lookup[x] : (x >= 0x6E && x <= 0x75 ? (x - 8) : x);
}

function getRevealedTile(x)
{
	var lookup = { 0x7C: 0x7B, 0x7E: 0x7D, 0x80: 0x7F, 0x5E: 0x57, 0x63: 0x7A };
	return x in lookup ? lookup[x] : (x >= 0x66 && x <= 0x6D ? (x + 8) : x);
}

function backupData(stages, rom)
{
	for (var i = 0; i < stages.length; ++i)
		backupStage(stages[i], rom);
}

function getTranslevel(id)
{
	if (id < 0x100) return id;
	else return id - 0xDC;
}

function makeBuckets(stages)
{
	var buckets = [];
	for (var x = 0; x < stages.length; ++x)
	{
		var stage = stages[x], i;
		for (i = 0; i < buckets.length; ++i)
			if (same_bucket(stage, buckets[i][0]))
				{ buckets[i].push(stage); break; }
		
		// if we didn't put a stage in a bucket, new bucket
		if (i == buckets.length) buckets.push([stage]);
	}
	
	return buckets;
}

function same_bucket(a, b)
{
	// a different number of exits, different bucket
	if (a.exits !== b.exits) return false;
	
	// can't swap castle with non-castle -- TODO
	if ((a.castle > 0) !== (b.castle > 0)) return false;
	
	// if same-type, most both be ghost/non-ghost for same bucket
	if ($('#randomize_sametype').is(':checked') && a.ghost !== b.ghost) return false;
	
	// if same-type, most both be water/non-water for same bucket
	if ($('#randomize_sametype').is(':checked') && a.water !== b.water) return false;
	
	// option: randomize only within worlds
	if ($('#randomize_sameworld').is(':checked') && a.world !== b.world) return false;
	
	return true;
}

// ASSUMES the layer1 pointer has already been copied to this stage
function fixSublevels(stage, remap, rom)
{
	var sublevels = stage.copyfrom.sublevels.slice(0);
	sublevels[0] = stage.id;

	for (var i = 1; i < sublevels.length; ++i)
	{
		var id = sublevels[i];
		if ((id & 0x100) !== (stage.id & 0x100))
		{
			var newid = remap[id] = findOpenSublevel(stage.id & 0x100, rom);
			moveSublevel(newid, id, rom);
		}
	}
	
	// fix all screen exits
	var secid, secexitcleanup = [];
	for (var i = 0; i < stage.copyfrom.allexits.length; ++i)
	{
		var x = stage.copyfrom.allexits[i], target = getSublevelFromExit(x, rom);
		if (target in remap)
		{
			var newtarget = remap[target];
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
	var r1flasha = rom.slice(0x2585D + ndxa * 2, 0x2585D + ndxa * 2 + 2);
	var r1flashb = rom.slice(0x2585D + ndxb * 2, 0x2585D + ndxb * 2 + 2);
	
	rom.set(r1flasha, 0x2585D + ndxb * 2);
	rom.set(r1flashb, 0x2585D + ndxa * 2);
	
	// reveal data
	var r1reveala = rom.slice(0x2593D + ndxa * 2, 0x2593D + ndxa * 2 + 2);
	var r1revealb = rom.slice(0x2593D + ndxb * 2, 0x2593D + ndxb * 2 + 2);
	
	rom.set(r1reveala, 0x2593D + ndxb * 2);
	rom.set(r1revealb, 0x2593D + ndxa * 2);
	
	// update offscreen event map
	for (var i = 0, xor = ndxa ^ ndxb; i < 44; ++i) 
		if ([ndxa, ndxb].contains(rom[0x268E4 + i]))
			rom[0x268E4 + i] ^= xor;
	
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
	rom.set([offsetb & 0xFF, (offsetb >> 8) & 0xFF], 0x26359 + ndxb * 2);
}

function backupSublevel(id, rom)
{
	// copy all of the level pointers
	var data = {};
	for (var i = 0; i < level_offsets.length; ++i)
	{
		var o = level_offsets[i], x = o.offset + id * o.bytes;
		data[o.name] = rom.slice(x, x + o.bytes);
	}
	
	return data;
}

function copyBackupToSublevel(id, data, rom)
{
	for (var i = 0; i < level_offsets.length; ++i)
	{
		var o = level_offsets[i];
		rom.set(data[o.name], o.offset + id * o.bytes);
	}
}

function copySublevel(to, fm, rom)
{
	// copy all of the level pointers
	for (var i = 0; i < level_offsets.length; ++i)
	{
		var o = level_offsets[i];
		
		var fmx = o.offset + fm * o.bytes;
		var tox = o.offset + to * o.bytes;
		
		rom.set(rom.slice(fmx, fmx + o.bytes), tox);
	}
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
	
	var start = [0x025, 0x13C][bank >> 16];
	for (var i = start; i <= 0xFF; ++i)
	{
		var x = bank | i, os = LAYER1_OFFSET + 3 * x;
		var p = rom.slice(os, os + 3);
		
		// check for TEST level pointer
		if (p[0] == 0x00 && p[1] == 0x80 && p[2] == 0x06) return x;
	}
	
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
	if (!sprites.length) return;
	
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
			sprites.splice(i, 1); --len;
		}
		
	// end of list marker
	rom[base + len * 3] = 0xFF;
}

function getPointer(off, len, rom)
{
	for (var i = 0, x = 0; i < len; ++i)
		x |= (rom[off+i] << (i*8));
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

function randomizeKoopaKids(map, random, rom)
{
	var bossrooms = [];
	for (var i = 0; i < koopa_kids.length; ++i)
	{
		// find the actual sublevel holding this boss fight
		var oldbr = koopa_kids[i];
		var newbr = (oldbr in map) ? map[oldbr] : oldbr;
		
		// save this information
		bossrooms.push({ cfm: i+1, sublevel: newbr });
	}
		
	bossrooms.shuffle(random);
	for (var i = 0; i < bossrooms.length; ++i)
		bossrooms[i].cto = i+1;
		
	var hold0 = findOpenSublevel(0x000, rom);
	moveSublevel(hold0, bossrooms[0].sublevel, rom);
	
	for (var i = 1; i < bossrooms.length; ++i)
		moveSublevel(bossrooms[i-1].sublevel, bossrooms[i].sublevel, rom);
	moveSublevel(bossrooms[bossrooms.length-1].sublevel, hold0, rom);
		
	if ($('input[name="levelnames"]:checked').val() == 'match_stage')
		; // TODO: fix castle names
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

var NO_WATER_STAGES = [ 0x01A, 0x0DC, 0x111, 0x1CF, 0x134, 0x0C7 ];

// randomizes slippery/water/tide flags
function randomizeFlags(random, stages, rom)
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
		if (0 == random.nextInt(Math.max(numscreens, 4))
			&& $((flag & 0x01) ? '#delwater' : '#addwater').is(':checked')) flag ^= 0x01;
		
		// force certain stages to not have water
		var hastide = [0x1, 0x2].contains(tide);
		if (NO_WATER_STAGES.contains(id) || hastide) flag &= 0xF0;
		
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

function expandROM(rom)
{
	// upgrade to next rom size
	var size = rom[0x7FD7] += 1;
	var newrom = new Uint8Array(0x400 * (1 << size));
	
	newrom.set(rom, 0);
	return newrom;
}

function fixChecksum(rom)
{
	var checksum = 0;
	for (var i = 0; i < rom.length; ++i)
	{
		checksum += rom[i];
		checksum &= 0xFFFF;
	}
	
	// checksum
	rom[0x7FDE] = (checksum     ) & 0xFF;
	rom[0x7FDF] = (checksum >> 8) & 0xFF;
	
	// checksum ^ 0xFFFF
	rom[0x7FDC] = (rom[0x7FDE] & 0xFF) ^ 0xFF;
	rom[0x7FDD] = (rom[0x7FDF] & 0xFF) ^ 0xFF;
}

var Category =
{
	ANY:         { goals: ['BOWSER'] },
	NOSTARWORLD: { goals: ['BOWSER'], exclude: ['sw1', 'sw2', 'sw3', 'sw4', 'sw5'] },
	ALLCASTLES:  { goals: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'BOWSER'] },
	BEATSPECIAL: { goals: ['sp8'] },
	ALLSWITCHES: { goals: ['yswitch', 'gswitch', 'rswitch', 'bswitch'] },
	ALLGHOST:    { goals: ['dgh', 'dsh', 'vgh', 'fgh', 'cgh', 'sgs', 'bgh'] },
};

function validate(stages, goals, exclude)
{
	for (var i = 0, smap = {}; i < stages.length; ++i)
		smap[stages[i].name] = stages[i];
	var goalsleft = goals.slice(0);
	
	// work queue and existing graph nodes
	// outgoing edges can be found in nodes[x].stage.out
	var queue = ['yi1', 'yi2'];
	var nodes = {
		'yi1': { distance: 0, stage: smap['yi1'] },
		'yi2': { distance: 0, stage: smap['yi2'] },
	};
	
	while (queue.length)
	{
		var x = queue.shift(), node = nodes[x], g;
		var vname = smap[x] && smap[x].copyfrom ? smap[x].copyfrom.name : x;
		
		// if this stage is one of our goals, remove it from the list
		if ((g = goalsleft.indexOf(vname)) != -1) goalsleft.splice(g, 1);
		
		// skip if this "stage" lacks the metadata needed to act as a viable node
		if (!smap[x] || !smap[x].copyfrom || !node || !node.stage) continue;
		
		for (var out, i = 0; i < node.stage.out.length; ++i)
		{
			// this exit has been removed, perhaps due to powerup restrictions
			if (!(out = node.stage.out[i])) continue;
			
			// already been processed, with the lowest possible distance
			if (out in nodes) continue;
			
			// this stage is not allowed in this rom, so we remove it
			if (exclude.contains(out)) continue;
			
			// add the stage to the work queue...
			queue.push(out);
			
			// ...and add metadata for it
			var k = nodes[out] = {};
			k.stage = (out in smap) ? smap[out] : null;
			k.distance = node.distance + 1;
		}
	}
	
	// if no goals remain
	return !goalsleft.length;
}
