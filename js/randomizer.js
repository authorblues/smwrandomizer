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
	{"name": "dp1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x15}, 
	{"name": "dp2", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x9}, 
	{"name": "dp3", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x5}, 
	{"name": "dp4", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x6}, 
	{"name": "ds1", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0xA}, 
	{"name": "ds2", "world": 2, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10B}, 
	{"name": "vd1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11A}, 
	{"name": "vd2", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x118}, 
	{"name": "vd3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10A}, 
	{"name": "vd4", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x119}, 
	{"name": "vs1", "world": 3, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x109}, 
	{"name": "vs2", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x1}, 
	{"name": "vs3", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x2}, 
	{"name": "cba", "world": 4, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0xF}, 
	{"name": "soda", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 2, "id": 0x11}, 
	{"name": "cookie", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10}, 
	{"name": "bb1", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0xC}, 
	{"name": "bb2", "world": 4, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0xD}, 
	{"name": "foi1", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11E}, 
	{"name": "foi2", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 1, "id": 0x120}, 
	{"name": "foi3", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x123}, 
	{"name": "foi4", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x11F}, 
	{"name": "fsecret", "world": 5, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x122}, 
	{"name": "ci1", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x22}, 
	{"name": "ci2", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x24}, 
	{"name": "ci3", "world": 6, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x23}, 
	{"name": "ci4", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x1D}, 
	{"name": "ci5", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x1C}, 
	{"name": "csecret", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x117}, 
	{"name": "vob1", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x116}, 
	{"name": "vob2", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x115}, 
	{"name": "vob3", "world": 7, "exits": 1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x113}, 
	{"name": "vob4", "world": 7, "exits": 2, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10F}, 
	{"name": "c1", "world": 1, "exits": 1, "castle": 1, "palace": 0, "ghost": 0, "water": 0, "id": 0x101}, 
	{"name": "c2", "world": 2, "exits": 1, "castle": 2, "palace": 0, "ghost": 0, "water": 0, "id": 0x7}, 
	{"name": "c3", "world": 3, "exits": 1, "castle": 3, "palace": 0, "ghost": 0, "water": 0, "id": 0x11C}, 
	{"name": "c4", "world": 4, "exits": 1, "castle": 4, "palace": 0, "ghost": 0, "water": 0, "id": 0xE}, 
	{"name": "c5", "world": 5, "exits": 1, "castle": 5, "palace": 0, "ghost": 0, "water": 0, "id": 0x20}, 
	{"name": "c6", "world": 6, "exits": 1, "castle": 6, "palace": 0, "ghost": 0, "water": 0, "id": 0x1A}, 
	{"name": "c7", "world": 7, "exits": 1, "castle": 7, "palace": 0, "ghost": 0, "water": 0, "id": 0x110}, 
	{"name": "vfort", "world": 3, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 1, "id": 0xB}, 
	{"name": "ffort", "world": 5, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x1F}, 
	{"name": "cfort", "world": 6, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x1B}, 
	{"name": "bfort", "world": 7, "exits": 1, "castle": -1, "palace": 0, "ghost": 0, "water": 0, "id": 0x111}, 
	{"name": "dgh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x4}, 
	{"name": "dsh", "world": 2, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x13}, 
	{"name": "vgh", "world": 3, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x107}, 
	{"name": "fgh", "world": 5, "exits": 2, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x11D}, 
	{"name": "cgh", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 0, "id": 0x21}, 
	{"name": "sgs", "world": 6, "exits": 1, "castle": 0, "palace": 0, "ghost": 1, "water": 1, "id": 0x18}, 
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
	{"name": "yswitch", "world": 1, "exits": 0, "castle": 0, "palace": 1, "ghost": 0, "water": 0, "id": 0x14}, 
	{"name": "gswitch", "world": 2, "exits": 0, "castle": 0, "palace": 4, "ghost": 0, "water": 0, "id": 0x8}, 
	{"name": "rswitch", "world": 3, "exits": 0, "castle": 0, "palace": 3, "ghost": 0, "water": 0, "id": 0x11B}, 
	{"name": "bswitch", "world": 5, "exits": 0, "castle": 0, "palace": 2, "ghost": 0, "water": 0, "id": 0x121}, 
//	{"name": "topsecret", "world": 2, "exits": 0, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x3}, 
];

var SEC_EXIT_OFFSET_LO = 0x2F800;
var SEC_EXIT_OFFSET_HI = 0x2FE00;

function randomizeROM(buffer, seed)
{
	var stages = smw_stages.slice(0);
	if ($('#randomize_95exit').is(':checked'))
	{
		// remove dgh and topsecret from rotation
		for (var i = stages.length - 1; i >= 0; --i)
			if ([0x3, 0x4].indexOf(stages[i].id) != -1)
				stages.splice(i, 1);
	}
	
	var random = new Random(seed);
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
	
	if ($('input[name="levelnames"]:checked').val() == 'random')
		shuffleLevelNames(stages, random);
	
	for (var i = 0; i < stages.length; ++i)
		performCopy(stages[i], rom);
	fixSecondaryExits(stages, rom);
	
	// fix Roy/Larry castle block paths
	fixBlockPaths(stagelookup, rom);
	
	// disable the forced no-yoshi intro on moved stages
	rom[0x2DA1D] = 0x60;

	//saveAs(new Blob([buffer], {type: "octet/stream"}), 'smw-randomizer.sfc');
}

function shuffle(stages, random)
{
	var rndstages = stages.slice(0).shuffle(random);
	for (var i = 0; i < stages.length; ++i)
		stages[i].copyfrom = rndstages[i];
}

function performCopy(stage, rom)
{
	//console.log(stage.copyfrom.name + ' --> ' + stage.name);
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
	
	if (stage.copyfrom.id == 0x13) rom[0x04A0C] = stage.translevel; // dsh translevel
	if (stage.copyfrom.id == 0x24) rom[0x2DAE5] = stage.translevel; // ci2 translevel
}

function getSecondaryExitTarget(xid, rom)
{
//	return rom[SEC_EXIT_OFFSET_LO + xid] | ((rom[SEC_EXIT_OFFSET_HI + xid] & 0x08) << 5);
	return rom[SEC_EXIT_OFFSET_LO + xid] | (xid & 0x100);
}

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
		rom[SEC_EXIT_OFFSET_LO + i] = id & 0xFF;
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
		var EF = rom.slice(0x195EF, 0x195EF + 52);
		var A4 = rom.slice(0x195A4, 0x195A4 + 74);
		
		rom.set(EF, 0x195A4);
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
		
		console.log(stage.name, $.map(getRelatedSublevels(stage.id, rom), function(x){ return '0x' + x.toString(16); }).toString());
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
	
	// FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME FIXME 
	if ((a.id & 0x100) !== (b.id & 0x100)) return false;
	
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

function getScreenExits(id, rom)
{
	var exits = [], start = LAYER1_OFFSET + 3 * id;
	var p = rom.slice(start, start + 3);
	var snes = (p[2] << 16) | (p[1] << 8) | p[0];
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
				var x = { offset: addr };
				x.screen =   (rom[addr  ] & 0x1F);
				x.water  = !!(rom[addr+1] & 0x80);
				x.issecx = !!(rom[addr+1] & 0x20);
				x.target =    rom[addr+3];
				
				exits.push(x);
			}
			break;
		}
	}
	
	return exits;
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
			var x = exits[i], next = x.target | (baseid & 0x100);
			if (x.issecx) next = getSecondaryExitTarget(tt = next, rom);
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
