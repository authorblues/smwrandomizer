// this is the md5 of the only rom that we will accept
var ORIGINAL_MD5 = "cdd3c8c37322978ca8669b34bc89c804";

var LAYER1_OFFSET;
var level_offsets = [
	// layer data
	{"name": "layer1", "bytes": 3, "offset": LAYER1_OFFSET = 0x2E000},
	{"name": "layer2", "bytes": 3, "offset": 0x2E600},
	{"name": "sprite", "bytes": 2, "offset": 0x2EC00},
	
	// secondary header data
	{"name": "header1", "bytes": 1, "offset": 0x2F000},
	{"name": "header2", "bytes": 1, "offset": 0x2F200},
	{"name": "header3", "bytes": 1, "offset": 0x2F400},
	{"name": "header4", "bytes": 1, "offset": 0x2F600},
];

var trans_offsets = [
	// name pointer
	{"name": "nameptr", "bytes": 2, "offset": 0x220FC},
];

var smw_stages = [
	{"name": "yi1", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x105}, 
	{"name": "yi2", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x106}, 
	{"name": "yi3", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x103}, 
	{"name": "yi4", "world": 1, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x102}, 
	{"name": "dp1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x015}, 
	{"name": "dp2", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x009}, 
	{"name": "dp3", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x005}, 
	{"name": "dp4", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x006}, 
	{"name": "ds1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x00A}, 
	{"name": "ds2", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10B}, 
	{"name": "vd1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11A}, 
	{"name": "vd2", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x118}, 
	{"name": "vd3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10A}, 
	{"name": "vd4", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x119}, 
	{"name": "vs1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x109}, 
	{"name": "vs2", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x001}, 
	{"name": "vs3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x002}, 
	{"name": "cba", "world": 4, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00F}, 
	{"name": "soda", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x011}, 
	{"name": "cookie", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x010}, 
	{"name": "bb1", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00C}, 
	{"name": "bb2", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x00D}, 
	{"name": "foi1", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11E}, 
	{"name": "foi2", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x120}, 
	{"name": "foi3", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x123}, 
	{"name": "foi4", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11F}, 
	{"name": "fsecret", "world": 5, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x122}, 
	{"name": "ci1", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x022}, 
	{"name": "ci2", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x024}, 
	{"name": "ci3", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x023}, 
	{"name": "ci4", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x01D}, 
	{"name": "ci5", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10C}, 
	{"name": "csecret", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x117}, 
	{"name": "vob1", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x116}, 
	{"name": "vob2", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x115}, 
	{"name": "vob3", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x113}, 
	{"name": "vob4", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10F}, 
	{"name": "c1", "world": 1, "exits": 1, "castle": 1, "palace": 0, "ghost": 0, "water": 0, "id": 0x101}, 
	{"name": "c2", "world": 2, "exits": 1, "castle": 2, "palace": 0, "ghost": 0, "water": 0, "id": 0x007}, 
	{"name": "c3", "world": 3, "exits": 1, "castle": 3, "palace": 0, "ghost": 0, "water": 0, "id": 0x11C}, 
	{"name": "c4", "world": 4, "exits": 1, "castle": 4, "palace": 0, "ghost": 0, "water": 0, "id": 0x00E}, 
	{"name": "c5", "world": 5, "exits": 1, "castle": 5, "palace": 0, "ghost": 0, "water": 0, "id": 0x020}, 
	{"name": "c6", "world": 6, "exits": 1, "castle": 6, "palace": 0, "ghost": 0, "water": 0, "id": 0x01A}, 
	{"name": "c7", "world": 7, "exits": 1, "castle": 7, "palace": 0, "ghost": 0, "water": 0, "id": 0x110}, 
	{"name": "vfort", "world": 3, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 1, "id": 0x00B}, 
	{"name": "ffort", "world": 5, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x01F}, 
	{"name": "cfort", "world": 6, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x01B}, 
	{"name": "bfort", "world": 7, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x111}, 
	{"name": "dgh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x004}, 
	{"name": "dsh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x013}, 
	{"name": "vgh", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x107}, 
	{"name": "fgh", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x11D}, 
	{"name": "cgh", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x021}, 
	{"name": "sgs", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 1, "id": 0x018}, 
	{"name": "bgh", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x114}, 
	{"name": "sw1", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x134}, 
	{"name": "sw2", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x130}, 
	{"name": "sw3", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x132}, 
	{"name": "sw4", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x135}, 
	{"name": "sw5", "world": 8, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x136}, 
	{"name": "sp1", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12A}, 
	{"name": "sp2", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12B}, 
	{"name": "sp3", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12C}, 
	{"name": "sp4", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x12D}, 
	{"name": "sp5", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x128}, 
	{"name": "sp6", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x127}, 
	{"name": "sp7", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x126}, 
	{"name": "sp8", "world": 9, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x125}, 
	{"name": "yswitch", "world": 1, "exits": 0, "castle": 0, "palace": 1, "ghost": 0, "water": 0, "id": 0x014}, 
	{"name": "gswitch", "world": 2, "exits": 0, "castle": 0, "palace": 4, "ghost": 0, "water": 0, "id": 0x008}, 
	{"name": "rswitch", "world": 3, "exits": 0, "castle": 0, "palace": 3, "ghost": 0, "water": 0, "id": 0x11B}, 
	{"name": "bswitch", "world": 5, "exits": 0, "castle": 0, "palace": 2, "ghost": 0, "water": 0, "id": 0x121}, 
//	{"name": "topsecret", "world": 2, "exits": 0, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x003}, 
];

var SEC_EXIT_OFFSET_LO = 0x2F800;
var SEC_EXIT_OFFSET_HI = 0x2FE00;
var SEC_EXIT_OFFSET_X1 = 0x2FA00;
var SEC_EXIT_OFFSET_X2 = 0x2FC00;

function randomizeROM(buffer, seed)
{
	var stages = smw_stages.slice(0);
	if ($('#randomize_95exit').is(':checked'))
	{
		// remove dgh and topsecret from rotation
		for (var i = stages.length - 1; i >= 0; --i)
			if ([0x003, 0x004].indexOf(stages[i].id) != -1)
				stages.splice(i, 1);
	}
	
	var random = new Random(seed);
	var vseed = random.seed.toHex(8, '');
	
	$('#custom-seed').val('');
	$('#use-custom-seed').removeAttr('checked');
	$('#used-seed').text(vseed);
	
	var rom = new Uint8Array(buffer);
	backupData(stages, rom);
	
	// put all the stages into buckets (any stage in same bucket can be swapped)
	var buckets = makeBuckets(stages);
	
	// decide which stages will be swapped with which others
	for (var i = 0; i < buckets.length; ++i) shuffle(buckets[i], random);
	
	// quick stage lookup table
	var stagelookup = {};
	for (var i = 0; i < stages.length; ++i)
		stagelookup[stages[i].copyfrom.name] = stages[i];
	
	if ($('input[name="levelnames"]:checked').val() == 'random_stage')
		shuffleLevelNames(stages, random);
	
	for (var i = 0; i < stages.length; ++i)
	{
		performCopy(stages[i], rom);
		
		// randomly swap the normal/secret exits
		if ($('#randomize_exits').is(':checked') && random.nextFloat() > 0.5)
			swapExits(stages[i], rom);
	}
	
	// fix Roy/Larry castle block paths
	fixBlockPaths(stagelookup, rom);
	
	// disable the forced no-yoshi intro on moved stages
	rom[0x2DA1D] = 0x60;

	saveAs(new Blob([buffer], {type: "octet/stream"}), 'smw-' + vseed + '.sfc');
}

function shuffle(stages, random)
{
	var rndstages = stages.slice(0).shuffle(random);
	for (var i = 0; i < stages.length; ++i)
		stages[i].copyfrom = rndstages[i];
}

function performCopy(stage, rom)
{
	for (var j = 0; j < level_offsets.length; ++j)
	{
		var o = level_offsets[j], start = o.offset + o.bytes * stage.id;
		rom.set(stage.copyfrom.data[o.name], start);
	}
	
	var skiprename = $('input[name="levelnames"]:checked').val() == 'same_overworld';
	for (var j = 0; j < trans_offsets.length; ++j)
	{
		if (skiprename && o.name == 'nameptr') continue;
		var o = trans_offsets[j], start = o.offset + o.bytes * stage.translevel;
		rom.set(stage.copyfrom.data[o.name], start);
	}
	
	// castle destruction sequence translevels
	if (stage.copyfrom.castle > 0)
		rom[0x049A7 + stage.copyfrom.castle - 1] = stage.translevel;
	
	// switch palace translevels
	if (stage.copyfrom.palace > 0)
		rom[0x2A590 + stage.copyfrom.palace - 1] = stage.translevel;
	
	if (stage.copyfrom.id == 0x013) rom[0x04A0C] = stage.translevel; // dsh translevel
	if (stage.copyfrom.id == 0x024) rom[0x2DAE5] = stage.translevel; // ci2 translevel
	
	// if the stage we are copying from is dgh, we should fix all the associated exits
	// since dgh has its exits unintuitively reversed
	if (stage.copyfrom.id == 0x004)
	{
		swapExits(stage.copyfrom, rom);
		swapExits(stage, rom);
	}
	
	// if we move a stage between 0x100 banks, we need to move sublevels
	// screen exits as well might need to be fixed, even if we don't change banks
	fixSublevels(stage, rom);
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
		var EF = rom.slice(0x193EF, 0x193EF + 52);
		var A4 = rom.slice(0x193A4, 0x193A4 + 74);
		
		rom.set(EF, 0x193A4);
		rom.set(A4, 0x193D8);
		rom.set([0xD8, 0x93], 0x19306);
		rom.set([0xA4, 0x95], 0x1930B);
	}
	
	rom.set([0xAD, 0xBF, 0x13, 0xEA, 0xEA, 0xEA, 0xC9, hitrans], 0x192F8);
}

function backupData(stages, rom)
{
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i];
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
	}
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
	if (Math.sign(a.castle) !== Math.sign(b.castle)) return false;
	
	// if same-type, most both be ghost/non-ghost for same bucket
	if ($('#randomize_sametype').is(':checked') && a.ghost !== b.ghost) return false;
	
	// if same-type, most both be water/non-water for same bucket
	if ($('#randomize_sametype').is(':checked') && a.water !== b.water) return false;
	
	// option: randomize only within worlds
	if ($('#randomize_sameworld').is(':checked') && a.world !== b.world) return false;
	
	return true;
}

// ASSUMES the layer1 pointer has already been copied to this stage
function fixSublevels(stage, rom)
{
	var sublevels = stage.copyfrom.sublevels.slice(0);
	sublevels[0] = stage.id;

	var remap = {}; remap[stage.copyfrom.id] = stage.id;
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
	for (var i = 0; i < stage.copyfrom.allexits.length; ++i)
	{
		var x = stage.copyfrom.allexits[i], target = getSublevelFromExit(x, rom);
		if (target in remap)
		{
			var newtarget = remap[target];
			if (!x.issecx) rom[x.addr+3] = newtarget;
			else
			{
				var secid = x.target;
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
				
				// clear old secondary exit target
				rom[SEC_EXIT_OFFSET_LO + secid]  = 0x00;
				rom[SEC_EXIT_OFFSET_HI + secid] &= 0xF7;
			}
		}
	}
}

function swapExits(stage, rom)
{
	if (stage.exits !== 2) return;
	
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
	
	// LAYER 2 ------------------------------
	
	// secret exit triggers event+1
	var ndxa = rom[0x2D608 + stage.translevel];
	var ndxb = ndxa + 1, ndxc = ndxa + 2;
	
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

function moveSublevel(to, fm, rom)
{
	// copy all of the level pointers
	for (var i = 0; i < level_offsets.length; ++i)
	{
		var o = level_offsets[i];
		
		var fmx = o.offset + fm * o.bytes;
		var tox = o.offset + to * o.bytes;
		
		rom.set(rom.slice(fmx, fmx + o.bytes), tox);
	}
	
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
	var p = rom.slice(start, start + 3);
	var snes = (p[2] << 16) | (p[1] << 8) | p[0];
	return getScreenExitsByAddr(snes, rom, id);
}

function getScreenExitsByAddr(snes, rom, id)
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
		if (ids.indexOf(id) != -1) continue;
		
		ids.push(id);
		var exits = getScreenExits(id, rom);
		
		for (var i = 0; i < exits.length; ++i)
		{
			var x = exits[i], next = getSublevelFromExit(x, rom);
			if (ids.indexOf(next) == -1) todo.push(next);
		}
	}
	
	return ids;
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
