var VERSION_STRING = 'v2.2';

function randomizeROM(buffer, seed)
{
	var rom = new Uint8Array(buffer);
	var ext = '.sfc';
	if (rom.length == 0x80200)
	{
		console.log('headered rom?');
		rom = rom.subarray(0x200);
		ext = '.smc';
	}

	var crc32rom = crc32(rom);
	if (crc32rom != BASE_CHECKSUM)
		throw new ValidationError(['Base rom incorrect. Expected checksum ' +
			BASE_CHECKSUM.toPrintHex(8) + ", got " + crc32rom.toPrintHex(8)]);

	var stages = $.map(deepClone(SMW_STAGES), decorateStage.bind(null, rom));
	var bowserentrances = $.map(deepClone(BOWSER_ENTRANCES), decorateStage.bind(null, rom));

	// if we aren't randomizing the warps, remove them from the stage list
	if (!$('#randomize_warps').is(':checked'))
		stages = $.grep(stages, function(x){ return !('warp' in x); });

	var random = new Random(seed);
	var vseed = random.seed.toHex(8);

	$('#custom-seed').val('');
	$('#used-seed').text(vseed);

	// patch the rom with necessary patches
	applyBasePatches(rom);

	replaceFileSelect(TITLE_TEXT_COLOR, rom);

	// in randomizer, "bonus star" counter shows completed exits instead
	rom.set([0xAD, 0x2E, 0x1F], 0x00F8F);

	// change switch palaces to use higher event numbers
	fixSwitchPalaceEventNumbers(stages, rom);

	// update sublevels and exits to canonical representation
	canonicalizeBaseRom([].concat(stages, bowserentrances), rom);

	// randomize all of the slippery/water flags
	randomizeFlags(random, rom);

	// randomize autoscroller sprites and update v-scroll, if checked
	if ($('#randomize_autoscrollers').is(':checked'))
		randomizeAutoscrollers(random, rom);

	if ($('#randomize_enemies').is(':checked'))
		randomizeEnemies(stages, random, rom);

	// (☆^O^☆)
	// (☆^O^☆) (☆^O^☆)
	// (☆^O^☆) (☆^O^☆) (☆^O^☆)
	if ($('#pogyo_mode').is(':checked')) pogyo(stages, random, rom);
	// (☆^O^☆) (☆^O^☆) (☆^O^☆)
	// (☆^O^☆) (☆^O^☆)
	// (☆^O^☆)

	if ($('#randomize_bossdiff').is(':checked'))
		randomizeBossDifficulty(random, rom);

	// randomize the sublevels inside each level
	if ($('#randomize_sublevels').is(':checked'))
		swapSublevels(stages, random, rom);

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
	var gauntletlen = 8;
	switch ($('input[name="bowser"]:checked').val())
	{
		case 'random': randomizeBowserEntrances(bowserentrances, random, rom); break;
		case 'minigauntlet': gauntletlen = random.nextIntRange(2,5); // intentional fall thru
		case 'gauntlet': generateGauntlet(bowserentrances, random, gauntletlen, rom); break;
		default: break;
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

	var saveprop = $('input[name="saving"]:checked').val();
	fixSaveLocations(saveprop, stages, rom);

	if ($('#randomize_noyoshi').is(':checked'))
		randomizeNoYoshi([].concat(stages, bowserentrances), random, rom);

	var enemyprop = $('input[name="enemyprop"]:checked').val();
	randomizeEnemyProperties(enemyprop, stages, random, rom);

	fixCastleDoors(rom);

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

	// mess with the overworld layer2 table
	updateOverworldLayer2(random, rom);

	// you asked for it!
	if ($('#randomize_music').is(':checked'))
		randomizeMusic(random.clone(), rom);

	// add all of the cheat options (if any)
	cheatOptions(rom);

	var preset = +$('#preset').val();
	if (!preset) preset = 'x' + getRandomizerSettings();

	// validate the rom before we spit it out
	var errors = validateROM([].concat(stages, [FRONTDOOR]), rom);
	if (errors.length) throw new ValidationError(errors, vseed, preset, rom);

	// write version number and the randomizer seed to the rom
	var checksum = getChecksum(rom).toHex(4);
	writeToTitle(VERSION_STRING + " @" + vseed + "-" + checksum, 0x2, rom);

	// update the credits
	rewriteCredits(random, rom);

	// force bg palette for intro to fix text colors
	rom[0x305B5] = (rom[0x305B5] & 0x1F) | (random.from([0, 2, 7]) << 5);

	// write metadata to the intro cutscene
	//updateIntroText(vseed, rom);

	updateFileSelect({
		start1p: "1P RANDOMIZER",
		start2p: "2P RANDOMIZER",
	},
	TITLE_TEXT_COLOR, rom);

	// fix the checksum (not necessary, but good to do!)
	fixChecksum(rom);

	return {
		// return the modified buffer
		buffer: buffer,
		type: ext || '.sfc',

		// all of the data needed to recreate (or validate) a ROM
		seed: vseed,
		checksum: checksum,
		preset: preset,
	};
}

function isPermanentTile(stage)
{
	// some specific tiles MUST be permanent tiles, since the game does not trigger the reveal
	var PERMANENT_TILES = [ 'sw1', 'sw2', 'sw3', 'sw4', 'sw5', 'sp1', 'yi1', 'yi2', 'foi1', 'ffort', 'cfort', 'yhouse' ];
	if (PERMANENT_TILES.contains(stage.name) || isCastle(stage) || isCastle(stage.copyfrom)) return true;

	var REVEALED_TILES = [ 'ci1', 'ci2', 'ci5', 'bb1', 'bb2' ];
	if (REVEALED_TILES.contains(stage.name)) return false;

	// if this is in FOI, try to grab unrevealed tiles
	if (getMapForStage(stage).name == 'FOI') return false;

	// otherwise, only permanent if special tile
	return stage.copyfrom.ghost == 1 || stage.copyfrom.castle;
}

function isCastle(stage)
{ return stage.castle > 0; }

function isSwitchPalace(stage, rom)
{ return [0x76, 0x77, 0x78, 0x79].contains(rom[getOverworldOffset(stage)]); }

function isSavePoint(stage)
{
	if (stage.castle || stage.ghost || stage.palace) return true;
	return [ 'sp2', 'sp4', 'sp6', 'sp8', 'sgs' ].contains(stage.name);
}

function getStage(stages, name)
{
	for (var i = 0; i < stages.length; ++i)
		if (stages[i].name == name) return stages[i];
	return null;
}

function getCopiedStage(stages, name)
{
	for (var i = 0; i < stages.length; ++i)
		if (stages[i].copyfrom.name == name) return stages[i];
	return null;
}

function shuffle(stages, random)
{
	var rndstages = stages.slice(0).shuffle(random);
	for (var i = 0; i < stages.length; ++i)
		stages[i].copyfrom = rndstages[i];
}

function getSublevelData(id, rom, header)
{
	function generateSubHeaderProperty(off, start, size)
	{
		var mask = (1 << size) - 1;
		return {
			enumerable: true,
			get: function( ){ return (rom[off+id] >> start) & mask; },
			set: function(x){ rom[off+id] = (((mask << start) ^ 0xFF) & rom[off+id]) | ((x & mask) << start); },
		}
	}

	// get address for layer 1 header
	var addr = snesAddressToOffset(getPointer(LAYER1_OFFSET + 3 * id, 3, rom));
	var data = getObjectHeaderData(header || rom.subarray(addr, addr+5));
	Object.defineProperties(data,
	{
		l2scroll:   generateSubHeaderProperty(HEADER1_OFFSET, 4, 4), // layer 2 scroll
		l3:         generateSubHeaderProperty(HEADER2_OFFSET, 6, 2), // layer 3 settings
		entrance:   generateSubHeaderProperty(HEADER2_OFFSET, 3, 3), // entrance type
		yoshi:      generateSubHeaderProperty(HEADER4_OFFSET, 7, 1), // disable no yoshi
		uvp:        generateSubHeaderProperty(HEADER4_OFFSET, 6, 1), // unknown vpos flag
		vpos:       generateSubHeaderProperty(HEADER4_OFFSET, 5, 1), // vertical pos flag

		fg:         generateSubHeaderProperty(HEADER3_OFFSET, 2, 2), // entrance fg pos
		bg:         generateSubHeaderProperty(HEADER3_OFFSET, 0, 2), // entrance bg pos
		mainscreen: generateSubHeaderProperty(HEADER4_OFFSET, 0, 5), // main entrance screen
		midscreen:  generateSubHeaderProperty(HEADER3_OFFSET, 4, 4), // midway entrance screen
		x:          generateSubHeaderProperty(HEADER2_OFFSET, 0, 3), // level entrance x
		y:          generateSubHeaderProperty(HEADER1_OFFSET, 0, 4), // level entrance y

		// pure getters for some properties
		layer3:  { get: function(){ return ['none', 'tide', 'mondo', '???'][this.l3]; } },
		tide:    { get: function(){ return this.l3 == 0x1 || this.l3 == 0x2; } },
	});

	return data;
}

function getObjectHeaderData(header)
{
	function generateHeaderProperty(byte, start, size)
	{
		var mask = (1 << size) - 1;
		return {
			enumerable: true,
			get: function( ){ return (this._data[byte] >> start) & mask; },
			set: function(x){ this._data[byte] = (((mask << start) ^ 0xFF) & this._data[byte]) | ((x & mask) << start); },
		}
	}

	var data = { _data: header, };
	Object.defineProperties(data,
	{
		bgp:      generateHeaderProperty(0, 5, 3), // BG palette
		screens:  generateHeaderProperty(0, 0, 5), // number of screens
		bgc:      generateHeaderProperty(1, 5, 3), // BG color
		lmode:    generateHeaderProperty(1, 0, 5), // level mode
		l3prio:   generateHeaderProperty(2, 7, 1), // layer 3 priority
		music:    generateHeaderProperty(2, 4, 3), // music settings
		sprite:   generateHeaderProperty(2, 0, 4), // sprite tileset
		time:     generateHeaderProperty(3, 6, 2), // time settings
		sp:       generateHeaderProperty(3, 3, 3), // sprite palette
		fgp:      generateHeaderProperty(3, 0, 3), // foreground palette
		imem:     generateHeaderProperty(4, 6, 2), // item memory
		_vscroll: generateHeaderProperty(4, 4, 2), // vertical scroll
		tileset:  generateHeaderProperty(4, 0, 4), // fg/bg tileset

		// pure getters for some properties
		seconds: { get: function(){ return [0, 200, 300, 400][this.time]; } },
		vscroll: { get: function(){ return ['no-v', 'always', 'locked', 'no-v/h'][this._vscroll]; } },

		// pure getters for sprite page metadata
		sp3: { get: function(){ return SP3_SETTINGS[this.sprite]; } },
		sp4: { get: function(){ return SP4_SETTINGS[this.sprite]; } },
	});

	return data;
}

function canonicalizeBaseRom(stages, rom)
{
	// fix some base tiles for consistency -- get your shit together Nintendo
	rom[0x679F1] = 0x78; // ysp - is green, but gets fixed by offscreen event
	rom[0x67D51] = 0x5A; // thanks for leaving an old switch just laying around

	// disable the forced no-yoshi intro on moved stages
	rom[0x2DA1D] = 0x60;

	// disable "TIME UP" screen when dying in a stage with a 0 second timer
	rom.set([0x22, 0xAC, 0xD6, 0x03, 0xEA], 0x00E21);
	rom.set([0xD0, 0x1E], 0x00E4F);
	rom.set([0xAD, 0x32, 0x0F, 0x0D, 0x33, 0x0F, 0xD0, 0x07, 0xA9, 0xFF, 0xEA, 0x22, 0xBE, 0xD6, 0x03], 0x00E60);
	rom.set([0x22, 0xC5, 0xD6, 0x03, 0xEA], 0x050E6);
	rom.set(
	[
		0xAD, 0x9B, 0x0D, 0xC9, 0xC1, 0xF0, 0x08, 0xAD,
		0x30, 0x0F, 0x30, 0x03, 0xA9, 0x01, 0x6B, 0xA9,
		0x00, 0x6B, 0x8D, 0x30, 0x0F, 0x5C, 0x06, 0xF6,
		0x00, 0xA0, 0x0B, 0xAD, 0x31, 0x0F, 0xAE, 0x30,
		0x0F, 0x30, 0x01, 0x1A, 0x6B
	],
	0x1D6AC);

	// set dsh translevel to 0 to make big boo act as the normal exit
	// copy DGH's secret goal tape sublevel into DSH's goaltape (to make secret exit)
	rom[0x04A0C] = 0;
	copySublevel(0xF0, 0xEB, rom);

	// stages with exits "backwards" by default, we should fix all the
	// associated exits since they have their exits unintuitively reversed
	var BASE_SWAP_EXITS = ['fgh', 'dgh', 'dsh'];
	for (var i = 0; i < stages.length; ++i)
		if (BASE_SWAP_EXITS.contains(stages[i].name))
			swapExits(stages[i], rom);

	// make WUSH format work for mixing primary and secondary exits
	rom.set([0x9D, 0xD8, 0x19, 0x60], 0x6A531);
	rom.set([0xAD, 0x93, 0x1B], 0x2D94C);
	rom.set([0x20, 0x67, 0x8E], 0x2D7D4);
	rom.set([0xBD, 0xD8, 0x19, 0x29, 0x02, 0x8D, 0x93, 0x1B, 0x60], 0x28E67);

	// repair U/H for all of the stages
	for (var id = 0; id < 0x200; ++id)
	{
		var exits = parseExits(id, rom);
		for (var i = 0; i < exits.length; ++i)
			writeExit(exits[i], rom);
	}

	// fix layer2 reset when changing rooms
	rom.set([0x20, 0x4D, 0xBA], 0x0170F);
	rom.set([0xEE, 0x04, 0x14, 0xA2, 0x03, 0x74, 0x26, 0xCA, 0x10, 0xFB, 0x9C, 0x12, 0x14, 0x60], 0x03A4D);

	// set fg position for horizontal levels to fix layer1 glitch caused by layer2 hijack
	for (var id = 0; id < 0x200; ++id)
	{
		var meta = getSublevelData(id, rom);
		if (meta.lmode in LEVEL_MODES && !LEVEL_MODES[meta.lmode].horiz) meta.fg = 0x0;
	}

	var stage109 = parseLayer1(0x109, rom);
	stage109.objs[55].major += 1; // fix vs1 pipe (move it down)
	stage109.objs[56].major += 1; // platform moved down
	stage109.objs[57].extra = combineNibbles(3, 0xE);
	stage109.objs[59].major += 1;
	stage109.exits.splice(1, 1); // remove the useless screen exit on vs1
	writeLayer(stage109, rom);

	// canonical version of CI1 is 0xF6
	var ci1 = backupSublevel(0xF6, rom);
	delete ci1['header1'];
	delete ci1['header2'];
	delete ci1['header3'];
	delete ci1['header4'];
	copyBackupToSublevel(0x22, ci1, rom);

	// remove sublevel duplicates
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i], sublevels = getRelatedSublevels(stage.id, rom);
		for (var j = 0; j < sublevels.length; ++j)
		{
			// rewrite the sublevel entrance as a secondary exit for the
			// "original" copy of the sublevel
			if (!(sublevels[j] in SUBLEVEL_DUPLICATES)) continue;
			var sec = getPrimaryEntrance(sublevels[j], rom);
			var orig = sec.target = SUBLEVEL_DUPLICATES[sublevels[j]];
			writeSecondaryExit(sec, rom);

			// redirect all screen exits to use this secondary exit
			for (var k = 0; k < sublevels.length; ++k)
			{
				var exits = parseExits(sublevels[k], rom);
				for (var z = 0; z < exits.length; ++z)
					if (exits[z].target == sublevels[j])
						writeExit(exits[z], rom, {issecx: true, target: sec.id});
			}

			// this room is unused now, so delete it
			clearSublevel(sublevels[j], rom);
		}
	}

	// remove unreachable sublevels
	var reachable = [0x000, 0x100, 0x0C5, 0x0C8, 0x1C8, 0x104, 0x0C7];
	for (var i = 0; i < stages.length; ++i)
	{
		var sub = getRelatedSublevels(stages[i].id, rom);
		for (var j = 0; j < sub.length; ++j)
			if (!reachable.contains(sub[j])) reachable.push(sub[j]);
	}

	for (var i = 0; i < 0x200; ++i)
		if (!reachable.contains(i)) clearSublevel(i, rom);
}

function fixSwitchPalaceEventNumbers(stages, rom)
{
	var switches = $.grep(stages, function(x){ return x.palace; });
	for (var z = 0; z < switches.length; ++z)
	{
		var stage = switches[z];
		var oldevent = stage.transevent;
		stage.transevent = 0x70 + stage.palace;

		// fix destruction event table
		for (var i = 0; i < 16; ++i)
			if (rom[DESTRUCTION_EVENT_NUMBERS+i] == oldevent)
				rom[DESTRUCTION_EVENT_NUMBERS+i] = stage.transevent;

		// fix no-walk translevel table
		for (var i = 0; i < 6; ++i)
			if (rom[0x2106C + i * 2] == oldevent)
				rom[0x2106C + i * 2] = stage.transevent;
	}

	// update event number max
	rom[0x25859] = 0x75;
}

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

function getTranslevel(id)
{
	return id < 0x100 ? id : (id - 0xDC);
}

function decorateStage(rom, stage)
{
	Object.defineProperty(stage, "translevel", { get: function() { return getTranslevel(this.id); }});
	Object.defineProperty(stage, "transevent",
	{
		get: function( ) { return rom[TRANSLEVEL_EVENTS+this.translevel];     },
		set: function(x) {        rom[TRANSLEVEL_EVENTS+this.translevel] = x; },
	});

	return stage;
}

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

	if (stage.copyfrom.id == 0x024) rom[0x2DAE5] = stage.translevel; // ci2 translevel
	if (stage.copyfrom.id == 0x018) rom[0x20DD8] = stage.translevel; // sgs translevel

	// moles appear slower in yi2
	if (stage.copyfrom.id == 0x106)
	{
		rom.set([0xAC, 0xBF, 0x13, 0xEA], 0x0E2F6);
		rom[0x0E2FD] = stage.translevel;
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

		// yoshi's island is copied into the small version of YI on the main map
		// if it's a switch palace, we just remove it because of stupid color shit
		if (stage.name == 'yhouse')
		{
			var yhtile = stage.copyfrom.palace ? 0x00 : ow;
			rom[getOverworldOffsetByCoords(0x03, 0x19)] = yhtile;
		}

		// need to move the yoshi's house smoke sprite
		if (stage.copyfrom.name == 'yhouse' && stage.name != 'yhouse')
		{
			var s = stage.tile[1] >= 0x20;

			var x = stage.tile[0] * 0x10 + 0x08;
			var y = stage.tile[1] * 0x10 - 0x0A;

			var xarr = [x & 0xFF, (x >> 8) & 0xFF, 0x00, 0x00];
			var yarr = [y & 0xFF, (y >> 8) & 0xFF, 0x00, 0x00];

			if (stage.tile[1] >= 0x20)
			{
				x -= 0x010;
				y -= 0x200;

				xarr = [0x00, 0x00, x & 0xFF, (x >> 8) & 0xFF];
				yarr = [0x00, 0x00, y & 0xFF, (y >> 8) & 0xFF];
			}

			rom.set(xarr, snesAddressToOffset(0x04FC1E));
			rom.set(yarr, snesAddressToOffset(0x04FC22));
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

var FORCE_SAVE = ['c7', 'bfort'];
function fixSaveLocations(mode, stages, rom)
{
	// all or nothing options
	     if (mode == 'all' ) { rom[0x20F93] = 0x00; }
	else if (mode == 'none') { rom[0x20F92] = 0x80; }

	// move the save points :(
	else
	{
		var savestages = [];
		for (var i = 0; i < stages.length; ++i)
		{
			var stage = stages[i], c = mode == 'default' ? stage.copyfrom : stage;
			if (isSavePoint(c) || FORCE_SAVE.contains(stage.name)) savestages.push(stage);
		}

		var hijack = [
			0xCA, 0x30, 0x1B, 0xBD, 0x15, 0xA2, 0xCD, 0x11, 0x1F, 0xD0, 0xF5, 0xAC, 0xD6, 0x0D, 0xBD, 0xD5,
			0xA1, 0xD9, 0x1F, 0x1F, 0xD0, 0xEA, 0xBD, 0xF5, 0xA1, 0xD9, 0x21, 0x1F, 0xD0, 0xE2, 0x60
		];
		rom.set(hijack, 0x221B6);

		var z = 0;
		for (var i = 0; i < savestages.length; ++i)
		{
			var stage = savestages[i];
			var map = getMapForStage(stage);

			var x = stage.tile[0];
			var y = stage.tile[1];

			if (map.name !== 'MAIN') { --x; y -= 0x20; }

			rom[0x221B6 + hijack.length            + z] = x;
			rom[0x221B6 + hijack.length + 1 * 0x20 + z] = y;
			rom[0x221B6 + hijack.length + 2 * 0x20 + z] = map.submapid;
			++z;
		}

		rom.set([0xA2, z, 0x20, 0xB9, 0xA1, 0xE0, z, 0xB0, 0x70, 0xEA], 0x20F8A);
	}
}

function randomizeEnemies(stages, random, rom)
{
	var spritemap = {}, spritedata = {};
	for (var i = 0; i < SPRITE_SETS.length; ++i)
	{
		var set = [];
		for (var k in SPRITE_SETS[i])
		{
			spritemap[+k] = set;
			set.push(spritedata[+k] = SPRITE_SETS[i][k])
			SPRITE_SETS[i][k].id = +k;
		}
	}

	var FIXED_SPRITE_MEM = $.grep(TILESET_SPECIFIC_SPRITES,
		function(x){ return x in SPRITE_MEMORY && !(x in spritemap); });

	for (var i = 0; i < stages.length; ++i)
	{
		var sub = getRelatedSublevels(stages[i].id, rom);
		for (var j = 0; j < sub.length; ++j)
		{
			var sprites = getSprites(sub[j], rom);
			var meta = getSublevelData(sub[j], rom);

			// if this is a switch palace room, leave it alone
			if (sprites.sprites.length == 1 && sprites.sprites[0].id == 0x6D) continue;

			// if this is a boss room, leave it alone
			if (sprites.sprites.some(function(s){ return s.id in BOSSES; })) continue;

			var fixed = $.grep(sprites.sprites, function(x){ return FIXED_SPRITE_MEM.contains(x.id); })
			var smem = fixed.length ? SPRITE_MEMORY[fixed[0].id] : null;

			if (random.flipCoin(0.6) && !sprites.sprites.some(function(x)
			{
				if (x.id in spritemap) return false;
				return TILESET_SPECIFIC_SPRITES.contains(x.id);
			}))
			{
				var usprites = $.map(sprites.sprites, function(x){ return x.id; }).uniq();
				var valid_sprite_sets = $.grep(GOOD_SPRITE_TILESETS, function(x)
				{
					for (var k = 0; k < usprites.length; ++k)
					{
						var sid = usprites[k].id;
						for (var z = 0; z < SPRITE_SETS.length; ++z)
						{
							if (sid in SPRITE_SETS[z])
							{
								if (!$.map(SPRITE_SETS[z], function(v,k){ return v.sp3 || []; }).contains(SP3_SETTINGS[x])) return false;
								if (!$.map(SPRITE_SETS[z], function(v,k){ return v.sp4 || []; }).contains(SP4_SETTINGS[x])) return false;
							}
						}

						return true;
					}
				});

				if (valid_sprite_sets.length)
					meta.sprite = random.from(valid_sprite_sets);
			}

			var remap = {};
			for (var k = 0; k < sprites.sprites.length; ++k)
			{
				var sprite = sprites.sprites[k];
				if (sprite.id in spritemap)
				{
					var orig = spritedata[sprite.id];
					if (!(orig.id in remap))
					{
						var candidates = $.grep(spritemap[sprite.id], function(x)
						{
							// sprite needs to match the sp3 settings
							if (x.sp3 && !x.sp3.contains(meta.sp3)) return false;
							if (x.sp4 && !x.sp4.contains(meta.sp4)) return false;

							// sprite might need water or tide of some
							if (x.water == 1 && !(rom[FLAGBASE+sub[j]] & 0x01)) return false;
							if (x.water == 2 && !meta.tide) return false;

							// if we have changed the item memory and this sprite requires a different one, incompatible
							if (smem && x.id in SPRITE_MEMORY && SPRITE_MEMORY[x.id] !== smem) return false;

							return true;
						});

						// store this so that future sprites can use this same sprite
						if (candidates.length) remap[orig.id] = random.fromWeighted(candidates);
					}

					if (orig.id in remap)
					{
						var newsprite = remap[orig.id];
						sprite.x += orig.origin[0] - newsprite.origin[0];
						sprite.y += orig.origin[1] - newsprite.origin[1];
						sprite.id = newsprite.id;

						if (newsprite.id in SPRITE_MEMORY)
							smem = SPRITE_MEMORY[newsprite.id];
					}
				}
			}

			var lastx = -1000; remap = {};
			for (var k = 0; k < sprites.sprites.length; ++k)
			{
				var sprite = sprites.sprites[k];
				if (sprite.id in SPRITE_MEMORY)
				{
					// if the sprite is spaced far enough, no change needed
					if (sprite.x - lastx > 16 || !(sprite.id in spritemap))
					{ lastx = sprite.x; continue; }

					// delete the sprite
					sprites.sprites[k] = null;
				}
			}

			// complete the deletion of sprites from the list
			sprites.sprites = $.grep(sprites.sprites, function(x){ return x; });

			// try adding a lakitu?
			if (LEVEL_MODES[meta.lmode].horiz && random.flipCoin(0.25))
			{
				// pick a lakitu (or fishin boo)
				var lakiut, lakid = null;
				     if (meta.sp3 == 0x06 && meta.sp4 == 0x11) lakid = 0xAE;
				else if (meta.sp3 == 0x13 && meta.sp4 == 0x02) lakid = 0x1E;
				else continue;

				// make sure sprite memory settings are ready for this new sprite
				if (SPRITE_MEMORY[lakid] && smem != SPRITE_MEMORY[lakid]) continue;

				// give up if there is already a lakitu (we only need one lakitu, dummy!)
				if (sprites.sprites.some(function(x){ return [0xAE, 0x1E].contains(x.id); })) continue;

				// find a sprite to replace with the lakitu
				if (lakitu = random.from(sprites.sprites.filter(function(x){ return x.id in spritemap; })))
				{
					lakitu.id = lakid;
					lakitu.y = Y_ENTRANCES[meta.y] - random.nextIntRange(8, 11);
					lakitu.x %= 64;
				}
			}

			// if we use sprite 0x33 (vertical podaboos), buoyancy MUST be on
			if (sprites.sprites.some(function(x){ return x.id == 0x33; }))
			{
				// get address of sprite table and setup buoyancy default
				var buoyancy = getLevelMode(sub[j], rom).layer2 == LAYER2_INTERACT ? 0x80 : 0x40;

				// if buoyancy was already set, just leave it as it was
				if (sprites.header[0] & 0xC0) buoyancy = (sprites.header[0] & 0xC0);
				sprites.header[0] = (sprites.header[0] & 0x3F) | buoyancy;
			}

			// if we require a new sprite memory, set it
			if (smem)
			{
				sprites.header[0] &= 0xC0;
				sprites.header[0] |= smem;
			}

			writeSprites(sprites, rom);
		}
	}

	// randomize sprite thrown by lakitus -- http://twitter.com/Aetyate/status/764974787974213632
	rom[0x0EA32] = random.from([0x14, 0x15, 0x91, 0x92, 0x93, 0x0D, 0x1D, 0x3F, 0x40, 0x09, 0x0C, 0x10, 0x74]);
}

function randomizeEnemyProperties(mode, stages, random, rom)
{
	// hijack for custom shell powerups
	// ; 16-byte table. If arranged in a square, X coord is Yoshi color, Y coord is shell (ordered GRBY).
	// ; Powers are bitwise: --fr cjfs
	// ;; f = fire, r = run fast, c = coin factory, j = jump high, f = fly, s = stomp
	rom.set(
	[
		0x48, 0x29, 0x02, 0x8D, 0x1E, 0x14, 0x68, 0x48,
		0x29, 0x01, 0x8D, 0xE7, 0x18, 0x68, 0x8D, 0xF6,
		0x18, 0x6B, 0x9C, 0x1E, 0x14, 0x9C, 0xE7, 0x18,
		0x9C, 0xF6, 0x18, 0x6B, 0xBF, 0xBD, 0xD2, 0x00,
		0x85, 0x7D, 0xAD, 0xF6, 0x18, 0x29, 0x04, 0xF0,
		0x11, 0xAD, 0x7A, 0x18, 0xF0, 0x0C, 0xA5, 0x7D,
		0x38, 0xE9, 0x18, 0x85, 0x7D, 0xA9, 0x08, 0x8D,
		0xFC, 0x1D, 0x6B, 0xAD, 0xF6, 0x18, 0x29, 0x08,
		0xF0, 0x10, 0x22, 0x62, 0xC0, 0x01, 0xA5, 0x14,
		0x29, 0x07, 0xD0, 0x06, 0xA9, 0x01, 0x22, 0x29,
		0xB3, 0x05, 0x6B, 0xDA, 0x5A, 0xBB, 0x48, 0xBF,
		0x35, 0xD5, 0x00, 0x85, 0x0F, 0xAD, 0xF6, 0x18,
		0x29, 0x10, 0xF0, 0x17, 0xAD, 0x7A, 0x18, 0xF0,
		0x12, 0xA5, 0x0F, 0x30, 0x05, 0x18, 0x69, 0x0E,
		0x80, 0x03, 0x38, 0xE9, 0x0E, 0x85, 0x0F, 0x22,
		0x93, 0xFF, 0x00, 0x68, 0x38, 0xE5, 0x0F, 0xF0,
		0x07, 0x45, 0x0F, 0x10, 0x03, 0x38, 0x80, 0x01,
		0x18, 0x7A, 0xFA, 0x6B
	],
	0x2D665);

	rom.set([0xAD, 0xF6, 0x18, 0x29, 0x20, 0xF0, 0x6E, 0x80, 0x09], 0x0F26A);
	rom.set([0x22, 0x65, 0xD6, 0x05, 0x22, 0xA0, 0xD6, 0x05, 0x4C, 0xA1, 0xF1], 0x0F195);
	rom.set([0x22, 0x77, 0xD6, 0x05, 0xEA, 0xEA], 0x0EBD3);
	rom.set([0x22, 0x81, 0xD6, 0x05, 0xEA], 0x05663);
	rom.set([0x22, 0xB8, 0xD6, 0x05, 0xB0, 0x05, 0x4C, 0x6B, 0xD7, 0xEA, 0xEA], 0x05744);
	rom.set([0x20, 0x4E, 0xB1, 0x6B], 0x0C062);
	rom.set([0x20, 0x4A, 0xFE, 0x6B], 0x07F93);

	// disco shell powers
	rom[0x0F172] = 0xFF;

	// get table (add fire information for red yoshi)
	// table is format (Y * 4 + S) where Y/S are both color for yoshi/shell in order GRYB
	var table = rom.slice(0x0F137, 0x0F137+16);
	for (var i = 0; i < 4; ++i)
	{
		table[1 * 4 + i] |= 0x20; // red yoshi always spits fire
		table[i * 4 + 1] |= 0x20; // red shell always spits fire
	}

	// add custom yoshi powers
	if ($('#customyoshipowers').is(':checked'))
	{
		var powers = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20].shuffle(random);
		for (var i = 0; i < 4; ++i) for (var j = 0; j < 4; ++j)
			table[i * 4 + j] = powers[i] | powers[j];
	}

	// write the table back to the rom shuffled
	if (mode == 'normal')
	{
		var c = [0,1,2,3].shuffle(random);
		var oldtable = table.slice(0);

		for (var x = 0; x < 4; ++x)
		for (var y = 0; y < 4; ++y)
			table[x * 4 + y] = oldtable[c[x] * 4 + c[y]];
	}
	else if (mode == 'chaos') [].shuffle.call(table, random);
	rom.set(table, 0x0F137);
}

/*
	Entrance types:
		0 - nothing (door, stage)
		1 - horiz left (pipe)
		2 - horiz right (pipe)
		3 - vert up (pipe)
		4 - vert down (pipe)
		5 - nothing, slippery (door, stage)
		6 - slanted cannon right (pipe)
		7 - vert down, water (pipe)
*/
function isDoorEntrance(id, rom)
{
	var entr = getSublevelData(id, rom).entrance;
	return (entr == 0x0 || entr == 0x5);
}

function getLevelMode(id, rom)
{
	// this code used to be so much more complicated :\
	var lmode = getSublevelData(id, rom).lmode;
	return LEVEL_MODES[lmode in LEVEL_MODES ? lmode : 0x00];
}

function randomizeColorPalettes(stages, random, rom)
{
	// random swap mario/luigi
	if (random.flipCoin(0.5))
	{
		var palettes = {
			'normal':    { addr: [0x032C8, 0x032DC], size: 20 },
			'fire':      { addr: [0x032F0, 0x03304], size: 20 },
			'overworld': { addr: [0x0359C, 0x035AA], size:  4 },

			// not strictly a "palette", but this code works well :^)
			'lifeswap':  { addr: [0x274B6, 0x274C4], size: 10 },
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

		// and this remaps the switch palace colors to fix that irregularity
		rom.set([0xDA, 0x20, 0xA6, 0xBB, 0xFA], 0x2B1C9);
		rom.set(
		[
			0xE0, 0x03, 0xF0, 0x06, 0xE0, 0x02, 0xD0, 0x01, 0xE8, 0xE8, 0x8E, 0xD2,
			0x13, 0x60
		],
		0x2BBA6);

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

	// randomize bowser statue colors
	rom[0x08321] = 0x01 | (random.from([0,2,4,7]) << 1);

	// randomize all standard sublevels
	for (var id = 0; id < 0x200; ++id)
	{
		if (isSublevelFree(id, rom)) continue;
		var layer1 = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
		var layer2 = getPointer(LAYER2_OFFSET + 3 * id, 3, rom);
		randomizeColorPaletteByAddr(random, layer1, layer2, rom);
	}

	// randomize all the CI2 sublevels as well
	randomizeColorPaletteByAddr(random, 0x06E985, null, rom); // 1A
	randomizeColorPaletteByAddr(random, 0x06E9FB, null, rom); // 1B
	randomizeColorPaletteByAddr(random, 0x06EAB0, null, rom); // 1C

	randomizeColorPaletteByAddr(random, 0x06EB0B, null, rom); // 2A
	randomizeColorPaletteByAddr(random, 0x06EB72, null, rom); // 2B
	randomizeColorPaletteByAddr(random, 0x06EBBE, null, rom); // 2C

	randomizeColorPaletteByAddr(random, 0x06EC24, null, rom); // 3A
	randomizeColorPaletteByAddr(random, 0x06EC7E, null, rom); // 3B
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
			var sprites = getSprites(id, rom);
			deleteSprites(sprites, function(x){ return x.id == 0xE6; }, rom);
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

	// swap switch palace colors around
	var c2t = {}, transmap = {};
	for (var i = 0; i < switches.length; ++i)
		c2t[switches[i].palace] = switches[i].translevel;

	var newswitch = [1,2,3,4].shuffle(random);
	for (var i = 0; i < switches.length; ++i)
	{
		var stage = switches[i];
		for (var j = 0; j < stage.sublevels.length; ++j)
		{
			var layer = parseLayer1(stage.sublevels[j], rom);
			for (var k = 0; k < layer.objs.length; ++k)
			{
				if (layer.objs[k].extended && layer.objs[k].extra == SWITCH_OBJECTS[stage.palace])
					layer.objs[k].extra = SWITCH_OBJECTS[newswitch[i]];;
			}
			writeLayer(layer, rom);
		}

		// fix the tile color as well
		stage.palace = newswitch[i];
		transmap[c2t[stage.palace]] = stage.translevel;
	}

	// correct the message box / cutscene data
	_fixMessageBoxes(transmap, rom);
}

function randomizeSwitchRooms(stages, random, rom)
{
	var switches = $.grep(stages, function(x){ return x.palace; });
	var sp4 = random.from($.grep(SP4_SPRITES, function(x){ return x.sp4 !== null; })).sp4;
	var candidates = $.grep(SP4_SPRITES, function(x){ return [null, sp4].contains(x.sp4); });

	rom[0x028F2] = sp4;
	for (var i = 0; i < switches.length; ++i)
	{
		var id = getRelatedSublevels(switches[i].id, rom)[1];
		var sprites = getSprites(id, rom);

		if (sprites.sprites.length !== 1 || sprites.sprites[0].id !== 0x6D)
			throw new Error('Trying to modify a non-switch room like a switch room.');

		var oldsprite = sprites.sprites[0];
		var newsprite = random.from(candidates);
		var pos = random.from(newsprite.pos);

		oldsprite.x = pos[0];
		oldsprite.y = pos[1];
		oldsprite.id = newsprite.id;

		// if the new sprite requires water
		if (newsprite.water)
		{
			// setup water (using the hijack found in randomizeFlags)
			rom[FLAGBASE+id] = (rom[FLAGBASE+id] & 0xF0) | newsprite.water;
		}

		// water and tide both require buoyancy
		if (newsprite.water || newsprite.tide)
		{
			// get address of sprite table and setup buoyancy default
			var buoyancy = getLevelMode(id, rom).layer2 == LAYER2_INTERACT ? 0x80 : 0x40;

			// if buoyancy was already set, just leave it as it was
			if (sprites.header[0] & 0xC0) buoyancy = (sprites.header[0] & 0xC0);
			sprites.header[0] = (sprites.header[0] & 0x3F) | buoyancy;
		}

		// if the new sprite needs a different sprite memory setting
		if (newsprite.id in SPRITE_MEMORY)
			sprites.header[0] = (sprites.header[0] & 0xC0) | SPRITE_MEMORY[newsprite.id];
		writeSprites(sprites, rom);

		// setup tide if needed
		var layer = parseLayer1(id, rom);
		if (newsprite.tide)
		{
			// add layer 3 priority to make tide appear over the ground
			layer.header[2] = (layer.header[2] & 0x7F) | 0x80;

			// set the tide object to (01 = low tide)
			rom[HEADER2_OFFSET+id] = (rom[HEADER2_OFFSET+id] & 0x3F) | 0x40;
		}

		// special case handling
		switch (newsprite.id)
		{
			case 0xBB: // Moving Grey Block
				for (var j = 0; j < layer.objs.length; ++j)
					if (layer.objs[j].id == 0x3D && layer.objs[j].x == pos[0]-14)
						layer.objs[j].extra -= 7;
				break;
		}

		writeLayer(layer, rom);
	}
}

var PIPE_DATA =
[
	{ h: 0, extra: 0x21, minor: 20, spawn: 0x50 },
	{ h: 1, extra: 0x31, minor: 19, spawn: 0x40 },
	{ h: 2, extra: 0x41, minor: 18, spawn: 0x30 },
	{ h: 3, extra: 0x51, minor: 17, spawn: 0x20 },
];

function randomizePipeBosses(random, rom)
{
	rom.set(
	[
		0x20, 0x08, 0xAA, 0xA9, 0x35, 0x20, 0x5B, 0xA9,
		0x20, 0x08, 0xAA, 0xA9, 0x36,
	],
	0x6C5F7);

	var LEMMY_ROOM = KOOPA_KID_SUBLEVELS[2];
	var WENDY_ROOM = KOOPA_KID_SUBLEVELS[5];

	var pipes = [0,0,0,0,0,0,0];
	for (var x = 0; x < pipes.length * 2; ++x)
	{
		var i = random.nextInt(pipes.length);
		pipes[i] = Math.min(pipes[i] + 1, 3);
	}

	var highest = Math.max.apply(null, pipes);
	var position = pipes.indexOf(highest);

	for (var i = 0; i < pipes.length; ++i)
		pipes[i] = PIPE_DATA[pipes[i]];

	pipes.push(pipes[3]);
	rom.set($.map(pipes, function(x){ return x.spawn; }),
		snesAddressToOffset(0x03CC40));

	var layer = parseLayer1(LEMMY_ROOM, rom);
	for (var i = 0, a = 0; i < layer.objs.length; ++i)
	{
		if (layer.objs[i].id != 0x34) continue;

		var p = pipes[a++];
		layer.objs[i].extra = p.extra;
		layer.objs[i].minor = p.minor;
	}

	// add moving lava to the lemmy fight
	if (random.flipCoin(0.5))
	{
		var snes = 0x0780ED;
		var meta = getSublevelData(LEMMY_ROOM, rom, layer.header);

		meta.l3 = 0x03;
		meta.lmode = 0x02;

		meta.x = 0x2;
		meta.y = 0x7;

		// dynamically change the low X value for x-entrance setting 2
		rom[0x2D752] = (position * 2 + random.from([1,2])) * 0x10;

		// the main object here is just the lava, which will be scrolling
		// up and down thanks to the layer2 scroll sprite added to the room
		var layer2objs = [{
			id: 0x1A,
			major: 0x01,
			minor: PIPE_DATA[highest].minor + 1,
			extra: combineNibbles(highest + 5, 13),
		}];

		// add spikes to the layer2 ceiling (these are a little bit mean...)
		if (random.flipCoin(0.25)) layer2objs.push({ id: 0x3E, major: 0x01, minor: 0x09, extra: 13, });

		writeLayer(_decorateLayer(
		{
			addr: snesAddressToOffset(snes),
			header: new Uint8Array(5),
			objs: $.map(layer2objs, function(x){ return _decorateObject(x, true); }),
		}), rom);

		rom.set(littleEndianToBytes(snes, 3), LAYER2_OFFSET + 3 * LEMMY_ROOM);

		// remove lava object from the layer1 data
		layer.objs = $.grep(layer.objs, function(x){ return x.id != 0x1A });

		// add layer2 scroll sprite
		var sprites = getSprites(LEMMY_ROOM, rom);
		sprites.sprites[0].id = 0xEA;
		sprites.sprites[0].x = 0;
		sprites.sprites[0].y = 0;
		sprites.sprites[0].extend = 0x02;
		writeSprites(sprites, rom);
	}

	writeLayer(layer, rom);
}

function randomizeStageEffects(stages, random, rom)
{
	var can_vscroll = [];
	for (var id = 0; id < 0x200; ++id)
	{
		if (isSublevelFree(id, rom)) continue;
		var l2 = getPointer(LAYER2_OFFSET + 3 * id, 3, rom);
		if (BG_CAN_VSCROLL[l2]) can_vscroll.push(id);
	}

	can_vscroll.shuffle(random);
	var c = random.nextIntRange(1,4);

	var prio = REPLACEABLE_SPRITES.slice(0).reverse();
	for (var i = 0; c && i < can_vscroll.length; ++i)
	{
		var id = can_vscroll[i];
		if (id == TITLE_DEMO_LEVEL) continue;

		var data = getSublevelData(id, rom);
		var mode = getLevelMode(id, rom);

		// don't take vertical levels, dummy
		if (!mode.horiz) continue;

		// bg setting 00 requires 12-tile scroll, which is fucky
		if (data.bg == 0x3) continue;

		var sprdata = getSprites(id, rom), sprites = sprdata.sprites;
		var best = sprites.slice(0).sort(function(a,b){ return prio.indexOf(b.id) - prio.indexOf(a.id); })[0];

		if (best && REPLACEABLE_SPRITES.contains(best.id)) --c;
		else continue;

		best.x = data.mainscreen * 16;
		best.y = 0;
		best.id = 0xEA;
		best.extend = random.from([0x1, 0x2, 0x2, 0x2, 0x3, 0x3]);
		writeSprites(sprdata, rom);
	}

	// random layer3 effects
	for (var id = 0; id < 0x200; ++id)
	{
		var meta = getSublevelData(id, rom);

		// random mist in ghost houses
		if ([0x5, 0xD].contains(meta.tileset) && random.flipCoin(0.25)) meta.l3 = 0x3;

		// random fish underwater
		if (meta.tileset == 0x9 && (rom[FLAGBASE+id] & 0x01) && random.flipCoin(0.25)) meta.l3 = 0x3;
	}
}

function pogyo(stages, random, rom)
{
	// randomize hammer bro thrown item
	rom[0x15AC4] = random.from([0x02, 0x04, 0x0A, 0x0A, 0x0B, 0x0B, 0x0D, 0x0E]);

	if (random.flipCoin(0.5))
	{
		// modify fishin lakitu
		rom[0x166AD] = 0x0E;
		rom[0x166B7] = (rom[0x166B7] & 0xFE) | 1;

		rom.set([0x54, 0xF1],       0x166E8);
		rom.set([0xEA, 0xEA, 0xEA], 0x166E4);
	}

	// randomize ball and chain speed
	rom[0x15634] =         random.nextIntRange(1,6);
	rom[0x1563A] = 0x100 - random.nextIntRange(1,6);

	// randomize sprite in switch room
	randomizeSwitchRooms(stages, random, rom);

	// change some sound effects, because fun...
	changeSound(SOUND_EFFECT_TRIGGER.NINTENDO_PRESENTS, SOUND_EFFECT.YOSHI_OW, rom);
	changeSound(SOUND_EFFECT_TRIGGER.OVERWORLD_MOVE, SOUND_EFFECT.YOSHI_OW, rom);

	// add random stage effects
	randomizeStageEffects(stages, random, rom);

	// https://twitter.com/Dotsarecool/status/714639606696771589
	detuneMusic(rom, random);
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
	_fixMessageBoxes(transmap, rom);
}

function _fixMessageBoxes(transmap, rom)
{
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
		map[stages[i].copyfrom.transevent] = stages[i];

	// size of the event table needs fixing
	rom[0x2667A] = 0x0F;

	for (var i = 0; i < 16; ++i)
	{
		var event = rom[DESTRUCTION_EVENT_NUMBERS+i], stage = map[event];
		if (!stage || !stage.copyfrom) continue;

		// we need to actually just reassign the event number entirely
		if (stage.exits == 0) stage.transevent = stage.copyfrom.data._transevent;

		rom[DESTRUCTION_EVENT_NUMBERS+i] = stage.transevent;
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
	stage.data._transevent = stage.transevent;

	for (var j = 0; j < trans_offsets.length; ++j)
	{
		var o = trans_offsets[j], start = o.offset + o.bytes * stage.translevel;
		stage.data[o.name] = rom.slice(start, start + o.bytes);
	}

	// get a list of sublevels
	stage.sublevels = getRelatedSublevels(stage.id, rom);
	stage.allexits = Array.prototype.concat.apply([],
		$.map(stage.sublevels, function(x){ return parseExits(x, rom); }));

	// ci2 - need to add the exits from the additional tables
	if (stage.id === 0x024) for (var j = 0; j < CI2_ALL_OFFSETS.length; ++j)
	{
		var addr = 0x060000 | getPointer(CI2_LAYER_OFFSETS.layer1 + CI2_ALL_OFFSETS[j], 2, rom);
		var exits = parseLayerByAddr(snesAddressToOffset(addr), rom, 0x024).exits;

		for (var k = 0; k < exits.length; ++k)
			if (!$.map(stage.allexits, function(x){ return x.addr; }).contains(addr))
				stage.allexits.push(exits[k]);
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

function getPrimaryEntrance(id, rom)
{
	var meta = getSublevelData(id, rom);

	// add a few details to help combine this
	// with secondary exits (identifiably)
	meta.target = id;
	meta.primary = true;

	meta.screen = meta.mainscreen;
	return meta;
}

/*
	Secondary entrance table
	VVVVVVVV ----LAAA BBFFYYYY XXXSSSSS

	LVVVVVVVV = sublevel
	AAA = entrance type
	BB = initial BG position
	FF = initial FG position
	YYYY = Mario's entrance Y position
	XXX = Mario's entrance X position
	SSSSS = Mario's entrance screen number
*/

function getSecondaryExit(id, rom)
{
	var sec = { id: id, };
//	sec.target = rom[SEC_EXIT_OFFSET_LO + id] | ((rom[SEC_EXIT_OFFSET_HI + id] & 0x08) << 5);
	sec.target = rom[SEC_EXIT_OFFSET_LO + id] | (id & 0x100);

	sec.entrance = rom[SEC_EXIT_OFFSET_HI + id] & 0x07;
	sec.bg = (rom[SEC_EXIT_OFFSET_X1 + id] >> 6) & 0x03;
	sec.fg = (rom[SEC_EXIT_OFFSET_X1 + id] >> 4) & 0x03;

	sec.y = rom[SEC_EXIT_OFFSET_X1 + id] & 0x0F;
	sec.x = (rom[SEC_EXIT_OFFSET_X2 + id] >> 5) & 0x07;
	sec.screen = rom[SEC_EXIT_OFFSET_X2 + id] & 0x1F;

	return sec;
}

// @param ext if true, only get entrances from other sublevels
function getIncomingSecondaryExits(id, rom, ext)
{
	var exits = [], bank = id & 0x100;
	for (var x = 0; x < 0x100; ++x)
	{
		if (ext && (x | bank) == id) continue;
		var sec = getSecondaryExit(x | bank, rom);
		if (sec.target == id) exits.push(sec);
	}

	return exits;
}

function writeSecondaryExit(sec, rom, changes)
{
	changes = changes || {};
	for (var k in changes) if (changes.hasOwnProperty(k))
		sec[k] = changes[k];

	// if the target is in the wrong location, get a better slot
	if (!sec.id || (sec.target & 0x100) != (sec.id & 0x100))
	{
		var previd;
		deleteSecondaryExit(previd = sec.id || 0, rom);
		sec.id = findOpenSecondaryExit(sec.target & 0x100, rom);
	}

	// write secondary exit tables
	rom[SEC_EXIT_OFFSET_LO + sec.id] = sec.target & 0xFF;
	rom[SEC_EXIT_OFFSET_HI + sec.id] = ((sec.target & 0x100) >> 5) | sec.entrance;
	rom[SEC_EXIT_OFFSET_X1 + sec.id] = ((sec.bg & 0x03) << 6) | ((sec.fg & 0x03) << 4) | (sec.y & 0x0F);
	rom[SEC_EXIT_OFFSET_X2 + sec.id] = ((sec.x & 0x07) << 5) | (sec.screen & 0x1F);

	return sec.id;
}

function deleteSecondaryExit(id, rom)
{
	rom[SEC_EXIT_OFFSET_LO + id] = 0x00;
	rom[SEC_EXIT_OFFSET_HI + id] = 0x00;
	rom[SEC_EXIT_OFFSET_X1 + id] = 0x00;
	rom[SEC_EXIT_OFFSET_X2 + id] = 0x00;
}

function isSecondaryExitOpen(id, rom)
{
	return !(rom[SEC_EXIT_OFFSET_LO + id] || rom[SEC_EXIT_OFFSET_HI + id]
	      || rom[SEC_EXIT_OFFSET_X1 + id] || rom[SEC_EXIT_OFFSET_X2 + id]);
}

function validateSecondaryExits(rom)
{
	for (var i = 0; i < 0x200; ++i)
	{
		if (isSecondaryExitOpen(i, rom)) continue;
		var sec = getSecondaryExit(i, rom);

		if (isSublevelFree(sec.target, rom))
			console.log('Secondary exit ' + i.toPrintHex(3) + ' appears to be pointing to a TEST level');
		else if (sec.target & 0xFF == 0x00)
			console.log('Secondary exit ' + i.toPrintHex(3) + ' appears to be pointing to ' + sec.target.toPrintHex(3));
	}
}

function fixSecondaryExits(to, fm, rom)
{ return fixAllSecondaryExits({fm: to}, rom); }

function fixAllSecondaryExits(roommap, rom)
{
	var secmap = {}, fm, to;
	for (var id = 0; id < 0x200; ++id)
	{
		var sec = getSecondaryExit(id, rom);
		if (sec.target in roommap)
		{
			to = sec.target = roommap[fm = sec.target];
			if ((fm & 0x100) != (to & 0x100))
			{
				var oldsecid = sec.id;
				deleteSecondaryExit(sec.id, rom);
				sec.id = findOpenSecondaryExit(to & 0x100, rom);
				secmap[oldsecid] = sec.id;
			}

			writeSecondaryExit(sec, rom);
		}
	}

	for (var id = 0; id < 0x200; ++id)
	{
		var exits = parseExits(id, rom);
		for (var k = 0; k < exits.length; ++k)
			if (exits[k].issecx && exits[k].target in secmap)
				writeExit(exits[k], rom, {target: secmap[exits[k].target]});
	}
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
	var secmap = {};
	for (var i = 0; i < stage.copyfrom.allexits.length; ++i)
	{
		var x = stage.copyfrom.allexits[i];
		if (x.sublevel in map) updateExitTarget(x, map[x.sublevel], rom, secmap);
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
	var ndxa = stage.transevent;
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

function isTestPointer(p)
{
	return p[0] == 0x00 &&
	       p[1] == 0x80 &&
		   p[2] == 0x06;
}

function isSublevelFree(id, rom)
{
	var x = LAYER1_OFFSET + 3 * id;
	return isTestPointer(rom.slice(x, x+3));
}

function clearSublevel(id, rom)
{
	rom.set([0x00, 0x80, 0x06], LAYER1_OFFSET + 3 * id);
	rom.set([0x00, 0xD9, 0xFF], LAYER2_OFFSET + 3 * id);
	rom.set([0x6D, 0xE7],       SPRITE_OFFSET + 2 * id);
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
		if (!(o.name in data)) continue;
		rom.set(data[o.name], o.offset + id * o.bytes);
	}
}

function copySublevel(to, fm, rom)
{
	// slower than doing it directly, but better for code maintenance
	copyBackupToSublevel(to, backupSublevel(fm, rom), rom);
}

function moveSublevel(to, fm, rom)
{
	// copy the sublevel data first
	copySublevel(to, fm, rom);

	// copy the TEST level into the now-freed sublevel slot
	clearSublevel(fm, rom);

	// fix all associated secondary exits
	fixSecondaryExits(to, fm, rom);
}

function findOpenSublevel(bank, rom)
{
	bank &= 0x100;

	var start = [0x025, 0x13C][bank >> 16];
	for (var i = start, x; i <= 0xFF; ++i)
		if (isSublevelFree(x = bank | i, rom))
			if (!PRIMARY_SUBLEVEL_IDS.contains(x)) return x;

	// please god, this should never happen!
	throw new Error('No free sublevels in bank ' + bank.toHex(3));
}

function findOpenSecondaryExit(bank, rom)
{
	bank &= 0x100;

	for (var i = 0x01, x; i <= 0xFF; ++i)
		if (isSecondaryExitOpen(x = bank | i, rom)) return x;

	// please god, this should never happen!
	throw new Error('No free secondary exits in bank ' + bank.toHex(3));
}

function getRelatedSublevels(baseid, rom)
{
	// probably not a real level we are checking here
	if (isSublevelFree(baseid, rom)) return [];

	var id, ids = [], todo = [baseid];
	while (todo.length)
	{
		var id = todo.shift();
		if (ids.contains(id)) continue;

		ids.push(id);
		var exits = parseExits(id, rom);

		for (var i = 0; i < exits.length; ++i)
			if (!ids.contains(exits[i].sublevel))
				todo.push(exits[i].sublevel);
	}

	return ids;
}

function randomizeAutoscrollers(random, rom)
{
	for (var id = 0; id < 0x200; ++id)
	{
		// don't ALWAYS remove autoscrollers :^)
		if (!random.flipCoin(0.8)) continue;

		// temporary FIXME FIXME FIXME
		if (id == 0x009) continue;

		var snes = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
		var addr = snesAddressToOffset(snes);

		// fix the v-scroll if we find autoscroller sprites
		var sprdata = getSprites(id, rom), sprites = sprdata.sprites;
		for (var i = 0; i < sprites.length; ++i)
			switch (sprites[i].id)
			{
				case 0xE8:
					rom[addr+4] &= 0xCF;
					rom[addr+4] |= 0x10;
					break;

				case 0xF3:
					rom[addr+4] &= 0xCF;
					rom[addr+4] |= 0x00;
					break;
			}

		// remove the actual autoscroller sprites
		if (id == 0x009) rewriteDP2(rom);
		else deleteSprites(sprdata, function(x){ return [0xE8, 0xF3].contains(x.id); }, rom);
	}

	var newauto = AUTOSCROLL_ROOMS.slice(0).shuffle(random);
	var prio = REPLACEABLE_SPRITES.slice(0).reverse();

	var numAutoscrollers = random.nextIntRange(0,3);
	for (var i = 0; i < numAutoscrollers && i < newauto.length; ++i)
	{
		var sprdata = getSprites(newauto[i], rom), sprites = sprdata.sprites;
		var best = sprites.slice(0).sort(function(a,b){ return prio.indexOf(b.id) - prio.indexOf(a.id); })[0];

		if (!best || !REPLACEABLE_SPRITES.contains(best.id))
			throw new Error('Could not find a sprite in ' + newauto[i].toHex(3) + ' to mutate for autoscroller');

		// speed of the autoscroller is dictated by Y (0 = slow, 1 = medium, 2 = fast)
		best.x = 8;
		best.y = random.from([0,1,1,1]);

		best.id = 0xF3;
		best.extend = 0;
		writeSprites(sprdata, rom);
	}
}

function rewriteDP2(rom)
{
	return;
	var id = 0x009;

	var sprdata = getSprites(id, rom);
	for (var i = 0; i < sprdata.sprites.length; ++i)
		if (sprdata.sprites[i].id === 0xE8)
		{
			sprdata.sprites[i].id = 0xEA;
			sprdata.sprites[i].extend = 0x03;
		}
	writeSprites(sprdata, rom);

	var layer = parseLayer1(id, rom);
	layer.objs[5].extra = combineNibbles(3, 0);

	writeLayer(layer, rom);
}

function bytesToLittleEndian(arr)
{
	for (var i = 0, x = 0; i < arr.length; ++i)
		x |= (arr[i] << (i*8));
	return x;
}

function littleEndianToBytes(x, k)
{
	var arr = [];
	for (var i = 0; i < k; ++i, x >>= 8)
		arr.push(x & 0xFF);
	return arr;
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
	return ((addr & 0xFF0000) >> 1) + (addr & 0x00FFFF) - 0x8000;
}

function offsetToSnesAddress(x)
{
	// thank kaizoman for this because i had no idea how to write this
	return ((x & 0xFF8000) << 1) + (x & 0xFFFF) + ((x & 0x8000) ? 0 : 0x8000);
}

function shuffleLevelNames(stages, random)
{
	// don't swap level names for non levels
	stages = $.grep(stages, function(x){ return x.exits > 0; });

	var ptrs = $.map(stages, function(x){ return x.data['nameptr']; }).shuffle(random);
	for (var i = 0; i < ptrs.length; ++i) stages[i].data['nameptr'] = ptrs[i];
}

// x is number of frames (not guaranteed to be exact)
function setYoshiSwallowTimer(x, rom)
{
	var z = 0;
	while ((x >> z) > 0x100) ++z;

	rom[0x0F1A5] = (1 << z) - 1;
	rom[0x0F35C] = ((x >> z) - 1) & 0xFF;
}

function getYoshiEntranceType(stage, force)
{
	var ug = getMapForStage(stage).ug;
	if (stage.copyfrom) stage = stage.copyfrom;

	// pick the appropriate flag
	if (stage.ghost == 1) return NO_YOSHI_GHOST;
	else if (stage.castle) return ug ? NO_YOSHI_CASTLE_NIGHT : NO_YOSHI_CASTLE_DAY;
	else if (force) return ug ? NO_YOSHI_STARS : NO_YOSHI_PLAINS;
	else return NO_YOSHI_DISABLED;
}

function randomizeNoYoshi(stages, random, rom)
{
	rom.set([0x20, 0x19, 0x8E, 0xAA, 0xE0, 0x06, 0x90, 0x04, 0xEA], 0x2DA2C);
	rom.set(
	[
		0x5A, 0xA9, 0x06, 0xAC, 0x00, 0x01, 0xC0, 0x1B,
		0xB0, 0x14, 0xAD, 0xBF, 0x13, 0x4A, 0xAA, 0xBD,
		0x39, 0x8E, 0xB0, 0x04, 0x29, 0x0F, 0x80, 0x06,
		0x29, 0xF0, 0x4A, 0x4A, 0x4A, 0x4A, 0x7A, 0x60,
	],
	0x28E19);

	var TABLE_BASE = 0x28E39;
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i], trans = stage.translevel;
		var noyoshi = getYoshiEntranceType(stage, random.flipCoin(0.035));

		// set "disable no-yoshi intro" to 0 for hijack
		rom[HEADER4_OFFSET + stage.id] &= 0x7F;

		// populate table with entry
		var shift = (trans & 1) ? 4 : 0;
		rom[TABLE_BASE + (trans>>1)] &= ~(0xF << shift);
		rom[TABLE_BASE + (trans>>1)] |= (noyoshi << shift);
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

	// update helper sprites in big boo room :^)
	var spritesE4 = getSprites(0xE4, rom);
	var newsprites = BIG_BOO_SPRITES.slice(0).shuffle(random);
	for (var i = 0; i < spritesE4.sprites.length; ++i)
	{
		if (spritesE4.sprites[i].id == 0x37)
			for (var k in newsprites[i]) if (newsprites[i].hasOwnProperty(k))
				spritesE4.sprites[i][k] = newsprites[i][k];
	}
	writeSprites(spritesE4, rom);

	// health of wendy+lemmy
	var whp = random.nextIntRange(2,6)
	rom[0x1CE1A] = whp;
	rom[0x1CED4] = whp - 1;

	// randomize lemmy/wendy room
	randomizePipeBosses(random, rom);

	// health of bowser phase1, and phases2+3
	var bhp = random.nextIntRange(1,6);
	rom[0x1A10B] = bhp;
	rom[0x1A683] = bhp;

	// distance iggy+larry slides when hit (jump, fireball)
	rom[0x0FD00] = random.nextIntRange(0x08, 0x30);
	rom[0x0FD46] = random.nextIntRange(0x08, 0x28);

	// randomize reznor
	if (random.flipCoin(0.33)) rom.set([0x38, 0xE9], 0x198C7);
	rom[0x198C9] = random.nextIntRange(0x01, 0x04);
}

function getBossType(id, rom)
{
	var sprites = getSprites(id, rom).sprites;
	for (var i = 0; i < sprites.length; ++i)
	{
		if (sprites[i].id == 0x29 && sprites[i].x == 12)
			return ['morton', 'roy', 'ludwig', 'iggy', 'larry', 'lemmy', 'wendy'][sprites[i].y];
		else if (sprites[i].id in BOSSES) return BOSSES[sprites[i].id];
	}
	return false;
}

function randomizeKoopaKids(random, rom)
{
	var bossrooms = KOOPA_KID_SUBLEVELS.slice(0).shuffle(random);
	var hold0 = findOpenSublevel(0x000, rom);
	moveSublevel(hold0, bossrooms[0], rom);

	for (var i = 1; i < bossrooms.length; ++i)
		moveSublevel(bossrooms[i-1], bossrooms[i], rom);
	moveSublevel(bossrooms[bossrooms.length-1], hold0, rom);

	if ($('input[name="levelnames"]:checked').val() == 'match_stage')
		; // TODO: fix castle names
}

function hasDoors(id, rom)
{
	var layer = parseLayer1(id, rom);

	var DOOR_IDS = [0x10, 0x15, 0x47, 0x48, 0x90];
	for (var i = 0; i < layer.objs.length; ++i)
		if (layer.objs[i].extended && DOOR_IDS.contains(layer.objs[i].extra)) return true;
	return false;
}

function findWings(rom, stage)
{
	for (var i = 0; i < stage.sublevels.length; ++i)
	{
		var objects = parseLayer1(stage.sublevels[i], rom).objs;
		for (var j = 0; j < objects.length; ++j)
		{
			if (objects[j].extended && objects[j].extra == 0x35 && objects[j].x % 4 == 1)
				return { sublevel: stage.sublevels[i], object: objects[j] };
		}
	}

	// found no wings
	return null;
}

function findWingsCandidates(rom, stage)
{
	var candidates = [];
	for (var i = 0; i < stage.sublevels.length; ++i)
	{
		var layer = parseLayer1(stage.sublevels[i], rom);

		var hassecx = false;
		for (var j = 0; j < layer.exits.length; ++j)
			hassecx |= layer.exits[j].issecx;

		// wings will break if a sublevel has secondary exits
		if (hassecx) continue;

		var objects = layer.objs;
		for (var j = 0; j < objects.length; ++j) if (objects[j].x % 4 == 1)
		{
			// any extended-object question mark block
			if (objects[j].extended && QUESTION_BLOCK_IDS.contains(objects[j].extra))
				candidates.push({ sublevel: stage.sublevels[i], object: objects[j] });

			// any 1x1 coin block should work as well
			if (objects[j].id == 0x0A && objects[j].extra == combineNibbles(0, 0))
				candidates.push({ sublevel: stage.sublevels[i], object: objects[j] });
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

		// if stage has no exits, or randomly otherwise, skip
		if (!stages[i].exits || random.flipCoin(0.8)) continue;

		// if wings are already present, remove them
		var wings = findWings(rom, stages[i]);
		if (wings) writeObject(wings.object, rom, {id: 0x00, extra: 0x34});
		else
		{
			// otherwise, if wings are not, maybe add them
			var candidateWings = findWingsCandidates(rom, stages[i]);
			if (candidateWings.length)
			{
				var candidate = random.from(candidateWings);
				writeObject(candidate.object, rom, {id: 0x00, extra: 0x35});
			}
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
	var sprites = getSprites(id, rom).sprites;
	for (var i = 0; i < sprites.length; ++i)
	{
		// just a normal key
		if (sprites[i].id == 0x80)
			return { sublevel: id, sprite: sprites[i] };

		// bubble/exploding block with extra bits set (contains key)
		if ([0x9D, 0x4C].contains(sprites[i].id) && sprites[i].extend)
			return { sublevel: id, sprite: sprites[i] };
	}

	// ...otherwise, look for key block
	var objects = parseLayer1(id, rom).objs;
	for (var i = 0; i < objects.length; ++i)
	{
		if (objects[i].extended && objects[i].extra == 0x35 && objects[i].x % 4 == 0)
			return { sublevel: id, block: objects[i] };
	}

	// nothing
	return null;
}

function findKeyCandidates(stage, random, rom)
{
	// find the keyhole first
	var keyholesub = null, stagegraph = {};
	for (var i = 0; i < stage.sublevels.length; ++i)
	{
		var sprites = getSprites(stage.sublevels[i], rom).sprites;
		if (sprites.some(function(x){ return x.id == 0x0E; }))
			keyholesub = stage.sublevels[i];

		var exits = parseExits(stage.sublevels[i], rom);
		stagegraph[stage.sublevels[i]] = $.map(exits, function(x){ return x.sublevel; }).uniq();
	}

	// there's no keyhole???
	if (!keyholesub) return [];

	// get a list of all sublevels that can reach the keyhole room
	var canreachhole = [keyholesub], sz;
	while (canreachhole.length !== sz)
	{
		sz = canreachhole.length;
		for (var keys = Object.keys(stagegraph), i = 0; i < keys.length; ++i)
		{
			var fm = +keys[i], to = stagegraph[keys[i]];
			for (var j = 0; j < to.length; ++j)
			{
				if (canreachhole.indexOf(to[j]) != -1)
					canreachhole.push(fm);
			}
		}

		canreachhole = canreachhole.uniq();
	}

	var candidates = [];
	for (var i = 0; i < canreachhole.length; ++i)
	{
		var sub = canreachhole[i];

		// sprites
		var sprites = getSprites(sub, rom).sprites;
		for (var j = 0; j < sprites.length; ++j)
			if (KEY_CAN_REPLACE.contains(sprites[j].id))
			{
				// if this is block/bubble, don't allow it in a vertical level
				if ([0x9D, 0x4C].contains(sprites[j].id) && !getLevelMode(sub, rom).horiz) continue;

				// add the sprite to the list of candidates otherwise
				candidates.push({ sublevel: sub, sprite: sprites[j] });
			}

		// ...otherwise, look for key block
		var objects = parseLayer1(sub, rom).objs;
		for (var j = 0; j < objects.length; ++j) if (objects[j].x % 4 == 0)
		{
			// any extended-object question mark block
			if (objects[j].extended && QUESTION_BLOCK_IDS.contains(objects[j].extra))
				candidates.push({ sublevel: sub, block: objects[j] });

			// any 1x1 coin block should work as well
			if (objects[j].id == 0x0A && objects[j].extra == combineNibbles(0, 0))
				candidates.push({ sublevel: sub, block: objects[j] });
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

		// 80% of the time, and if we find a key we can move...
		if (random.flipCoin(0.8) && (key = findKey(stages[i], rom)))
		{
			var candidates = findKeyCandidates(stages[i], random, rom);
			if (!candidates.length) continue;

			// replace the key with a valid replacement
			if (key.sprite) writeSprite(key.sprite, rom, {id: random.from(KEY_REPLACEMENTS)});
			else if (key.block) writeObject(key.block, rom, {id: 0x00, extra: 0x34});

			// find a place to put the key
			key = random.from(candidates);

			if (key.sprite)
			{
				// bubbles and exploding blocks only need their extra bits set
				if ([0x9D, 0x4C].contains(key.sprite.id))
					writeSprite(key.sprite, rom, {extend: 0x1});

				// otherwise, rewrite the sprite id
				else writeSprite(key.sprite, rom, {id: 0x80});
			}
			else if (key.block) writeObject(key.block, rom, {id: 0x00, extra: 0x35});
		}
	}

	// hijack for keys appearing in bubbles / exploding blocks
	rom.set([
		0x0F, 0x0D, 0x15, 0x74, 0x80, // sprite ids
		0x84, 0x85, 0x05, 0x08, 0x00, // YXPPCCCT
		0xA8, 0xCA, 0x67, 0x24, 0xEC, // Tile (1)
		0xAA, 0xCC, 0x69, 0x24, 0xEC, // Tile (2)

		0xA5, 0x5B, 0x4A, 0xB0, 0x12, 0xBD, 0xD4, 0x14,
		0x29, 0x0C, 0xF0, 0x0B, 0xBD, 0xD4, 0x14, 0x29,
		0x01, 0x9D, 0xD4, 0x14, 0xA0, 0x04, 0x6B, 0xB5,
		0xE4, 0x4A, 0x4A, 0x4A, 0x4A, 0x29, 0x03, 0xA8,
		0x6B, 0xC9, 0x80, 0xD0, 0x05, 0xA9, 0x09, 0x9D,
		0xC8, 0x14, 0x22, 0xD2, 0xF7, 0x07, 0x6B, 0xB5,
		0xE4, 0x85, 0x00, 0xBD, 0xE0, 0x14,
	],
	0x14BFE);

	// repoint tables
	rom.set([0xB9, 0xFE, 0xCB], 0x1597A);
	rom.set([0xBD, 0x08, 0xCC], 0x158DC);
	rom.set([0xBD, 0x0D, 0xCC], 0x158E1);
	rom.set([0xBD, 0x03, 0xCC], 0x158CF);

	rom.set([
		0x22, 0x12, 0xCC, 0x02, 0xB9, 0xAE, 0x83, 0x95,
		0xC2, 0x60, 0x15, 0x0F, 0x00, 0x04, 0x80,
	],
	0x083A4);

	rom.set([0x22, 0x33, 0xCC, 0x02], 0x16467);
	rom.set([0x22, 0x33, 0xCC, 0x02], 0x15980);

	// prevent key despawning
	rom.set([0x20, 0xEC, 0xB5, 0xEA], 0x12922);
	rom.set([0xA5, 0x05, 0xC9, 0x7B, 0xF0, 0x02, 0xC9, 0x80, 0x60], 0x135EC);
}

function checkExits(stage, rom)
{
	var sub = getRelatedSublevels(stage.id, rom), exits = 0;
	for (var i = 0; i < sub.length; ++i)
		exits |= providesExits(sub[i], rom);

	// if the stage is ci2, it provides a secret exit, trust me :^)
	if (stage.translevel == rom[0x2DAE5]) exits |= SECRET_EXIT;

	// if this stage provides both a key and keyhole
	if (bitset(exits, KEY|KEYHOLE))
		exits = (exits ^ (KEY|KEYHOLE)) | SECRET_EXIT;

	// what types and how many exits does this stage provide
	exits &= 0x3;
	return { types: exits, count: [0, 1, 'invalid', 2][exits] };
}

function providesExits(id, rom)
{
	// returned exits
	var exits = 0;

	// look for a key
	if (findKeyBySublevel(id, rom)) exits |= KEY;

	var sprites = getSprites(id, rom).sprites;
	for (var i = 0; i < sprites.length; ++i)
	{
		// orb always provides the normal exit
		if (sprites[i].id == 0x4A) exits |= NORMAL_EXIT;

		// big boo boss usually counts as the stage's secret exit in vanilla
		// SMW, but we use it for normal exit here
		if ([0xC5, 0x29, 0xA9].contains(sprites[i].id)) exits |= NORMAL_EXIT;

		// get the extra bits if we find a goal tape
		if (sprites[i].id == 0x7B)
			exits |= (sprites[i].extend ? SECRET_EXIT : NORMAL_EXIT);

		if (sprites[i].id == 0x0E) exits |= KEYHOLE; // found keyhole
	}

	// if this room provides both a key and keyhole
	if (bitset(exits, KEY|KEYHOLE))
		exits = (exits ^ (KEY|KEYHOLE)) | SECRET_EXIT;

	return exits;
}

function hasStaticWater(id, rom)
{
	var objects = parseLayer1(id, rom).objs;
	for (var i = 0; i < objects.length; ++i)
		if (STATIC_WATER_TILES.contains(objects[i].id)) return true;
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

function setSublevelWater(id, val, rom)
{
	// set water flag
	rom[FLAGBASE+id] &= 0xF0;
	rom[FLAGBASE+id] |= val ? 0x01 : 0x00;

	// get address of sprite table and setup buoyancy default
	var addr = snesAddressToOffset(0x70000 | getPointer(SPRITE_OFFSET + 2 * id, 2, rom));
	var buoyancy = val ? (getLevelMode(id, rom).layer2 == LAYER2_INTERACT ? 0x80 : 0x40) : 0x00;

	// if full-stage water is being added, remove static water tiles
	if (val)
	{
		var layer1 = parseLayer1(id, rom);
		layer1.objs = layer1.objs.filter(function(x){ return !STATIC_WATER_TILES.contains(x.id); });
		writeLayer(layer1, rom);
	}

	// if buoyancy was already set, just leave it as it was
	if (rom[addr] & 0xC0) buoyancy = (rom[addr] & 0xC0);
	rom[addr] = (rom[addr] & 0x3F) | buoyancy;

	return rom[FLAGBASE+id];
}

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
		var meta = getSublevelData(id, rom);

		// get default flag setting for the sublevel
		var flag = (meta.entrance == 5 ? 0x80 : 0) | (meta.entrance == 7 ? 0x01 : 0);

		// base water on how many screens the stage has
		if (0 == random.nextInt(Math.max(meta.screens*1.5, 8)|0) && !NO_WATER_STAGES.contains(id)
			&& $((flag & 0x01) ? '#delwater' : '#addwater').is(':checked'))
				flag = setSublevelWater(id, !(flag & 0x01), rom);

		// force certain stages to not have water
		if (meta.tide) flag &= 0xF0;

		if ($('#slippery').is(':checked'))
		{
			// 12.5% of stages will have slippery flag swapped
			if (random.flipCoin(0.125)) flag ^= 0x80;

			// if the stage is slippery, 33% of the time, changed to "half-slippery"
			if ((flag & 0x80) && random.flipCoin(0.33)) flag ^= 0x90;

			// fix intro if slippery
			if (id == TITLE_DEMO_LEVEL && (flag & 0xF0)) fixDemo(rom);
		}

		rom[FLAGBASE+id] = flag;
	}

	// transfer the buoyancy info to the secret CI2 sublevels as well
	for (var i = 0; i < CI2_ROOM_OFFSETS.length; ++i)
	{
		var rooms = CI2_ROOM_OFFSETS[i];
		var addr = snesAddressToOffset(0x70000 | getPointer(CI2_LAYER_OFFSETS.sprite + rooms[0], 2, rom));
		var buoyancy = rom[addr] & 0xC0;

		for (var j = 1; j < rooms.length; ++j)
		{
			addr = snesAddressToOffset(0x70000 | getPointer(CI2_LAYER_OFFSETS.sprite + rooms[j], 2, rom));
			// rom[addr] = (rom[addr] & 0x3F) | buoyancy;
		}
	}
}

function coordsToLayer2Position(x, y)
{
	if (y >= 0x40)
	{
		y = 0x40 + (y + 0x3F) % 0x40;
		x =        (x + 0x3E) % 0x40;
	}

	var bx = Math.floor(x / 0x20);
	var by = Math.floor(y / 0x20);
	var bn = by * 2 + bx;

	var ox = x & 0x1F;
	var oy = y & 0x1F;

	return bn * 0x400 + oy * 0x20 + ox;
}

function updateOverworldLayer2(random, rom)
{
	// decompress the layer2 map
	var layer2mapA = decompressRLE2(rom.slice(0x22533, 0x22533+6904));
	var layer2mapB = decompressRLE2(rom.slice(0x2402B, 0x2402B+5709));

	var stars = random.from(STAR_PATTERNS).slice(0);
	for (var y = 0; y <    stars.length; ++y)
	for (var x = 0; x < stars[y].length; ++x)
	{
		var pos = coordsToLayer2Position(0x24 + x, 0x5B + y);
		layer2mapA[pos] = (stars[y][x] == ' ' ? 0x71 : 0x7C);

		layer2mapB[pos] &= 0xE3;
		layer2mapB[pos] |= (stars[y][x] == ' ' ? 0x4 : 0x5) << 2;
	}

	// write the compressed layer2 map back to the rom
	rom.set(compressRLE2(layer2mapA), 0x22533);
	rom.set(compressRLE2(layer2mapB), 0x2402B);
}

function cheatOptions(rom)
{
	// infinite lives?
	if ($('#cheat_infinitelives').is(':checked'))
	{
		rom.set([0xEA, 0xEA, 0xEA], 0x050D8);
		rom[0x01E25] = 98;
	}

	// developer mode
	if ($('#cheat_devmode').is(':checked'))
	{
		// S+s for normal exit, S+A+s for secret exit
		rom[snesAddressToOffset(0x00A273)] = 0x00;
		rom[snesAddressToOffset(0x00A268)] = 0x00;

		// L+AA to make Mario fly, L+A again to disable
		rom[snesAddressToOffset(0x00CC84)] = 0xF0;

		// free roam overworld
		rom.set([0x4C, 0xAF, 0x92], snesAddressToOffset(0x049291));

		// enable paths
		rom.set([0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA], 0x25A5C);
		rom.set([0x80, 0x08], 0x26460);
		rom.set([0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA], 0x26611);
		rom.set([0xEA, 0xEA, 0xEA], 0x25A9F);
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

function ValidationError(errors, vseed, preset, rom)
{
	this.name = 'ValidationError';
	this.message = 'Randomized ROM did not pass validation.';
	this.stack = (new Error()).stack;

	this.seed = vseed;
	this.preset = preset;

	this.errors = errors;
	this.data = rom;
}

ValidationError.prototype = new Error();

function validateROM(stages, rom)
{
	var errors = [];
	var reachable = new Array(0x200);

	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i];

		// skip warp entries
		var copyfrom = stage.copyfrom ? stage.copyfrom : stage;
		if (copyfrom && copyfrom.warp) continue;

		var location = copyfrom.name + '(@' + stage.name + ')';

		var exitinfo = checkExits(stage, rom);
		if (stage.castle !== 8 && exitinfo.count != stage.exits)
			errors.push(location + ' has ' + exitinfo.count + ' exit(s) (' + stage.exits + ' expected)');
		if (exitinfo.types == SECRET_EXIT)
			errors.push(location + ' has only secret exit ???');

		var stage = stages[i], sub = getRelatedSublevels(stage.id, rom);
		for (var j = 0; j < sub.length; ++j)
		{
			if (isSublevelFree(sub[j], rom))
				errors.push('Sublevel ' + sub[j].toPrintHex(3) + ' of ' + location + ' is empty');

			var meta = getSublevelData(sub[j], rom);

			var exits = parseExits(sub[j], rom);
			for (var k = 0; k < exits.length; ++k)
			{
				var dest = exits[k].sublevel;
				if (dest & 0xFF == 0) errors.push('Exit in ' + sub[j].toPrintHex(3) + ' of ' + location + ' is ' + dest.toPrintHex(3));
			}

			if (!reachable[sub[j]])
				reachable[sub[j]] = [];
			reachable[sub[j]].push(location);
		}
	}

	/*for (var i = 0; i < 0x200; ++i)
	{
		var boss = getBossType(i, rom);
		if (boss) console.log(boss, i.toPrintHex(3));
	}*/

	for (var i = 0; i < 0x200; ++i) if (reachable[i] && reachable[i].length > 1)
		errors.push('Sublevel ' + i.toPrintHex(3) + ' reachable from ' + reachable[i].length + ' stages: ' + reachable[i].join(', '));
	return errors;
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

function sameSublevelBucket(rom, a, b)
{
	// if the sublevels don't provide the same types of stage exits
	if (providesExits(a.id, rom) != providesExits(b.id, rom)) return false;

	// if the stage doesn't provide the same number of exits
	if (a.exits.length != b.exits.length) return false;

	// check to see if the entrances are the same "type"
//	if (isDoorEntrance(a.id, rom) != isDoorEntrance(b.id, rom)) return false;

	// don't swap non-ghost with ghost
	if ((a.stage.ghost == GHOST_HOUSE) !== (b.stage.ghost == GHOST_HOUSE)) return false;

	// don't swap non-castles with castles
	if (!!a.stage.castle !== !!b.stage.castle) return false;

	// don't swap palace rooms
	if (Math.sign(a.stage.palace) || Math.sign(b.stage.palace)) return false;

	// short room vs long room
	if (a.long !== b.long) return false;

	// TODO FIXME match on gfx set, no-yoshi entrance, entrance type?
	return true;
}

function makeSublevelObject(stage, id, random, rom, n)
{
	var rdata = { id: id, stage: stage, n: n };
	rdata.exits = parseExits(id, rom).shuffle(random);
	rdata.links = $.map(rdata.exits, function(x){ return x.sublevel; }).uniq();

    rdata.entrs = getIncomingSecondaryExits(id, rom, true);
	rdata.entrx = 0;

	rdata.copyfrom = rdata;
	rdata.ptrs = backupSublevel(id, rom);
	rdata.long = getSublevelData(id, rom).screens > 4;

	rdata.msgboxes = [];

	// all this just to get the message boxes and their ids...
	var trans = stage.translevel;
	var sprites = getSprites(id, rom).sprites;
	for (var i = 0; i < sprites.length; ++i)
		if (sprites[i].id == 0xB9)
		{
			var ident = trans | ((sprites[i].x & 1) << 7);
			for (var j = 0; j < 23; ++j)
				if (rom[0x2A590+j] == ident)
					sprites[i].msgboxid = j;
			rdata.msgboxes.push(sprites[i]);
		}

	return rdata;
}

function swapSublevels(stages, random, rom)
{
	var _stages = stages.slice(0);
	var subleveldata = $.map(stages, function(stage)
	{
		// don't include stages with no exits
		if (!stage.exits) return;

		// don't include ci2 sublevels
		if (stage.name == 'ci2') return;

		// get metadata for every sublevel
		return $.map(getRelatedSublevels(stage.id, rom),
			function(x, i){ return makeSublevelObject(stage, x, random, rom, i); });
	});

	// add the 8 bowser doors to the rotation :^)
	_stages.push(FRONTDOOR);
	for (var i = 0; i < bowser8doors.length; ++i)
	{
		// saving the sublevel object for the bowser rooms so we can tinker
		var subdata = makeSublevelObject(FRONTDOOR, bowser8doors[i], random, rom, i+1);

		// consider these rooms to be "long" rooms, even though many don't qualify conventionally
		subdata.long = true;
		subleveldata.push(subdata);
	}

	// make a list of just the swappable levels
	var swappable = $.grep(subleveldata, function(x)
	{
		// delete the first room of the stage
		if (x.n == 0) return true;

		// delete boss rooms for castles
		if (x.stage.castle && !x.exits.length) return true;
	},
	true);

	var sublevelmap = {}, msgboxes = {};
	for (var i = 0; i < subleveldata.length; ++i)
	{
		var data = subleveldata[i], id = data.id;
		sublevelmap[id] = subleveldata[i];

		if (!DONT_SHUFFLE_EXITS.contains(id))
		{
            var meta = getSublevelData(id, rom);
			var exits1 = $.grep(data.exits, function(x){ return x.sublevel !== id && x.screen !== meta.mainscreen; });
			var exits2 = $.map(exits1, getExitTargetData).shuffle(random);

			for (var j = 0; j < exits1.length; ++j)
				writeExit(exits1[j], rom, exits2[j]);
		}

		// backup exit data
		data.exitdata = $.map(data.exits, getExitTargetData);
	}

	// this should get overwritten when the actual backup routine is run
	for (var i = 0; i < stages.length; ++i)
		stages[i].sublevels = getRelatedSublevels(stages[i].id, rom);

	var buckets = makeBuckets(swappable, sameSublevelBucket.bind(null, rom));
	for (var i = 0; i < buckets.length; ++i)
	{
		var b1 = buckets[i], b2 = b1.slice(0).shuffle(random);
		for (var j = 0; j < b1.length; ++j)
		{
			b1[j].copyfrom = b2[j];

			// copy level data over and redirect all secondary entrances
			copyBackupToSublevel(b1[j].id, b2[j].ptrs, rom);
			for (var k = 0; k < b2[j].entrs.length; ++k)
				writeSecondaryExit(b2[j].entrs[k], rom, { target: b1[j].id });

			for (var k = 0; k < b2[j].msgboxes.length; ++k)
				rom[0x2A590+b2[j].msgboxes[k].msgboxid] = b1[j].stage.translevel | ((b2[j].msgboxes[k].x & 1) << 7);
		}
	}

	for (var i = 0; i < _stages.length; ++i)
	{
		// get all associated sublevels for this stage
		var stage = _stages[i], sublevelid;
		var sublevels = stage.sublevels || [];

		// for each sublevel
		for (var j = 0; j < sublevels.length; ++j)
		{
			var sublevelid = sublevels[j];
			var sub = sublevelmap[sublevelid];

			if (!sub || !sub.copyfrom) continue;

			var oldexits = sub.exitdata;
			var newexits = sub.copyfrom.exits;

			var x = 0;
			for (var k = 0; k < newexits.length; ++k)
			{
				// if this exit goes to the same stage, don't change it (usually only for "cannons")
				if (oldexits[k].sublevel == sublevelid) continue;

				// if the exit is a secondary exit, link it to a random
				// secondary entrance in the new sublevel. otherwise, primary entrance
				var estage = sublevelmap[oldexits[k].sublevel].copyfrom;
				if (newexits[k].issecx = (estage.entrs.length && oldexits[k].issecx))
					newexits[k].target = estage.entrs[estage.entrx++ % estage.entrs.length].id;
				else newexits[k].target = oldexits[k].sublevel;

				// write the exit back out
				writeExit(newexits[k], rom);
			}
		}
	}
}

// fix castle doors (cosmetic only)
function fixCastleDoors(rom)
{
	for (var id = 0; id < 0x200; ++id)
	{
		// we only care about castle rooms
		var meta = getSublevelData(id, rom);
		if (meta.tileset !== 1) continue;

		var layer = parseLayer1(id, rom), bossmap = {};
		for (var i = 0; i < layer.exits.length; ++i)
			bossmap[layer.exits[i].screen] = getBossType(layer.exits[i].sublevel, rom);

		for (var i = 0; i < layer.objs.length; ++i)
		{
			// all doors are extended objects
			var obj = layer.objs[i];
			if (!obj.extended) continue;

			// make a big door for a boss fight
			if (obj.extra == 0x47 && bossmap[obj.screen])
			{
				if (obj.x % 16 > 13)
					obj.x = (obj.x & 0xFFF0) + 13;
				obj.y -= 1;
				obj.extra = 0x90;
			}

			// make a small door for non boss fights
			else if (obj.extra == 0x90 && !bossmap[obj.screen])
			{
				obj.y += 1;
				obj.extra = 0x47;
			}
		}

		// write all changes
		writeLayer(layer, rom);
	}
}
