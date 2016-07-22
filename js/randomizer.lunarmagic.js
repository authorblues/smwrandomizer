var PROP_MAJOR = { set: function(v) { this.major = v; }, get: function() { return this.major; } };
var PROP_MINOR = { set: function(v) { this.minor = v; }, get: function() { return this.minor; } };

/*
	Object Lists
	NBBYYYYY bbbbXXXX SSSSSSSS

	N = New screen (advance a screen)
	BBbbbb = Object id (Object 0 gets extended object id from SSSSSSSS)
	YYYYY = Minor Axis
	XXXX = Major Axis
	SSSSSSSS = Additional bits
*/
function parseLayerByAddr(addr, rom, /*optional*/ id)
{
	var mode = LEVEL_MODES[rom[addr+1] & 0x1F];
	var data = { sublevel: id, addr: addr, mode: mode, objs: [], exits: [] };
	var horiz = mode.horiz, screen, zindex = 0;

	data.header = rom.slice(addr, addr+5);
	for (addr += 5, screen = 0;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;

		// pattern looks like the start of the screen exits list
		if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] === 0x00) break;

		var obj = _decorateObject({ addr: addr, n: (rom[addr] & 0x80) }, horiz);
		obj.id = ((rom[addr] & 0x60) >> 1) | ((rom[addr+1] & 0xF0) >> 4);

		if (obj.n) ++screen;

		obj.major = screen * 16 + (rom[addr+1] & 0x0F);
		obj.minor = rom[addr] & 0x1F;
		obj.zindex = ++zindex;

		obj.extra = rom[addr+2];

		// extended object 01 updates screen to YYYYY value
		if (obj.extended && obj.extra == 0x01) screen = obj.minor;
		else data.objs.push(obj);
	}

	data.exits = parseExitsByAddr(addr, id, rom);
	addr += data.exits.length * 4;
	return _decorateLayer(data);
}

function _decorateLayer(data)
{
	Object.defineProperty(data, "length",
	{
		get: function()
		{
			var screens = $.map(this.objs, function(x){ return x.screen; }).sort();
			for (var i = 1, ex01 = 0; i < screens.length; ++i)
				if (screens[i] != screens[i-1] && screens[i] != screens[i-1] + 1) ++ex01;
			return this.header.length + 3 * (ex01 + this.objs.length) + 4 * this.exits.length + 1;
		}
	});

	return data;
}

function _decorateObject(obj, horiz)
{
	Object.defineProperty(obj, "screen", { get: function() { return Math.floor(this.major / 16); }});
	Object.defineProperty(obj, "x", horiz ? PROP_MAJOR : PROP_MINOR);
	Object.defineProperty(obj, "y", horiz ? PROP_MINOR : PROP_MAJOR);
	Object.defineProperty(obj, "extended", { get: function(){ return this.id == 0x00; } });

	return obj;
}

function parseLayer1(id, rom)
{
	var snes = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
	return parseLayerByAddr(snesAddressToOffset(snes), rom, id);
}

// these functions are shorthand that prevents us from
// parsing the entire layer1 list (which takes forever)
function getLayer1Header(id, rom)
{
	var snes = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
	var addr = snesAddressToOffset(snes);
	return rom.slice(addr, addr+5);
}

function parseExits(id, rom)
{
	var snes = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
	var addr = snesAddressToOffset(snes);

	for (addr += 5;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;

		// pattern looks like the start of the screen exits list
		if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] === 0x00) break;
	}

	return parseExitsByAddr(addr, id, rom);
}

function parseExitsByAddr(addr, id, rom)
{
	var exits = [];
	for (;; addr += 4)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;

		// screen exit info from the four bytes
		var x = { addr: addr };
		x.screen   = (rom[addr  ] & 0x1F);
		x.water    = (rom[addr+1] & 0x08);
		x.issecx   = (rom[addr+1] & 0x02);

		x._u       = (rom[addr+1] & 0x04);
		x._h       = (rom[addr+1] & 0x01);
		x.target   =  rom[addr+3] | (id & 0x100);

		// this is a piece of information that is useful to cache
		x.sublevel = getSublevelFromExit(x, rom);
		exits.push(x);
	}

	return exits;
}

function writeLayer(data, rom)
{
	rom.set(data.header, data.addr);
	var addr = data.addr + data.header.length;

	data.objs  = data.objs  || [];
	data.exits = data.exits || [];

	data.objs.sort(function(a,b)
	{
		if (a.zindex != b.zindex)
			return a.zindex - b.zindex;
		return a.major - b.major;
	});

	var screen = 0;
	for (var i = 0; i < data.objs.length; ++i, addr += 3)
	{
		var obj = data.objs[i];
		obj.n = (obj.screen == screen ? 0x00 : 0x80);

		// need to add an extended-01 object
		if (obj.screen != screen && obj.screen != screen + 1)
		{
			writeObject({ id: 0x00, minor: obj.screen, major: 0, extra: 0x01, addr: addr }, rom);
			obj.n = 0x00; addr += 3;
		}

		obj.addr = addr;
		writeObject(obj, rom);
		screen = obj.screen;
	}

	data.exits.sort(function(a,b){ return a.screen - b.screen; });
	for (var i = 0; i < data.exits.length; ++i, addr += 4)
	{
		data.exits[i].addr = addr;
		writeExit(data.exits[i], rom);
	}

	rom[addr++] = 0xFF;
}

function writeObject(obj, rom, changes)
{
	changes = changes || {};
	for (var k in changes) if (changes.hasOwnProperty(k))
		obj[k] = changes[k];

	rom.set(
	[	obj.n | ((obj.id & 0x30) << 1) | obj.minor
	,	((obj.id & 0x0F) << 4) | (obj.major & 0x0F)
	,	obj.extra
	],
	obj.addr);
	return obj;
}

function combineNibbles(a, b)
{ return ((a & 0xF) << 4) | (b & 0xF); }

function writeExit(x, rom, changes)
{
	changes = changes || {};
	for (var k in changes) if (changes.hasOwnProperty(k))
		x[k] = changes[k];

	// set u/h correctly even though vanilla smw doesn't
	x._u = 1;
	x._h = (x.target & 0x100) >> 8;

	rom.set(
	[	x.screen & 0x1F
	,	(x.water ? 0x08 : 0x00) | (x._u ? 0x04 : 0x00) | (x.issecx ? 0x02 : 0x00) | (x._h ? 0x01 : 0x00)
	,	0
	,	x.target & 0xFF
	],
	x.addr);
	return x;
}

function getExitTargetData(x)
{
	return {
		// do we even use this anymore?
		water: x.water,

		// this is the important data
		issecx: x.issecx,
		target: x.target,

        // this is cached, but useful
        sublevel: x.sublevel,
	};
}

function updateExitTarget(x, target, rom, map)
{
	map = map || {};
	if (x.issecx)
	{
		var sec = getSecondaryExit(x.target, rom);
		var previd = sec.id;

		// this secondary exit already got remapped once
		if (previd in map)
			x.target = map[previd];
		else
		{
			// change the target and write out (might change sec exit id)
			x.target = writeSecondaryExit(sec, rom, {target: target});

			// if this changed the sec exit id, record the change
			if (sec.id != previd) map[previd] = sec.id;
		}
	}
	else x.target = target;
	writeExit(x, rom);
}

function getSublevelFromExit(exit, rom)
{
	if (!exit.issecx) return exit.target;
	return getSecondaryExit(exit.target, rom).target;
}

/*
	Sprite header - 1 byte
	bbMMMMMM

	    bb = Sprite buoyancy
	MMMMMM = Sprite memory


	Entries - 2 bytes per sprite
	YYYYEEsy XXXXSSSS

	yYYYY - minor axis
	sSSSS - screen number
	 XXXX - major axis
*/
function getSpritesByAddr(addr, horiz, rom, id)
{
	var data = { sublevel: id, addr: addr, sprites: [] };

	data.header = rom.slice(addr, addr+1);
	for (addr += 1;; addr += 3)
	{
		// 0xFF sentinel represents end of level data
		if (rom[addr] === 0xFF) break;

		var s = { addr: addr, id: rom[addr+2] };
		var screen = (rom[addr+1] & 0xF) | ((rom[addr] & 0x2) << 3);

		s.minor  = ((rom[addr  ] >> 4) & 0xF) | ((rom[addr] & 0x1) << 4);
		s.major  = ((rom[addr+1] >> 4) & 0xF) + screen * 16;
		s.extend = ((rom[addr  ] >> 2) & 0x3);

		Object.defineProperty(s, "screen", { get: function() { return Math.floor(this.major / 16); }});
		Object.defineProperty(s, "x", horiz ? PROP_MAJOR : PROP_MINOR);
		Object.defineProperty(s, "y", horiz ? PROP_MINOR : PROP_MAJOR);

		data.sprites.push(s);
	}

	Object.defineProperty(data, "length",
	{
		get: function(){ return this.header.length + 3 * this.sprites.length + 1; }
	});
	return data;
}

function getSprites(id, rom)
{
	var snes = getPointer(SPRITE_OFFSET + 2 * id, 2, rom);
	var addr = snesAddressToOffset(0x070000 | snes);

	var horiz = getLevelMode(id, rom).horiz;
	return getSpritesByAddr(addr, horiz, rom, id);
}

function writeSprites(data, rom)
{
	rom.set(data.header, data.addr);
	var addr = data.addr + data.header.length;

	data.sprites.sort(function(a,b){ return a.major - b.major; });
	for (var i = 0; i < data.sprites.length; ++i, addr += 3)
	{
		data.sprites[i].addr = addr;
		writeSprite(data.sprites[i], rom);
	}

	rom[addr++] = 0xFF;
}

function writeSprite(s, rom, changes)
{
	changes = changes || {};
	for (var k in changes) if (changes.hasOwnProperty(k))
		s[k] = changes[k];

	rom.set(
	[	((s.minor & 0x0F) << 4) | (s.extend << 2) | ((s.screen & 0x10) >> 3) | ((s.minor & 0x10) >> 4)
	,	((s.major & 0x0F) << 4) | (s.screen & 0x0F)
	,	s.id & 0xFF
	],
	s.addr);
}

function deleteSprites(data, pred, rom)
{
	data.sprites = $.grep(data.sprites, pred, true);
	writeSprites(data, rom);
}

// ################### LUNAR MAGIC

var __LM_EXTRA_HI_NIBBLE =
{
	get: function( ){ return 1 + ((this.extra & 0xF0) >> 4); },
	set: function(x){ --x; this.extra = (this.extra & 0x0F) | ((x & 0x0F) << 4); },
};

var __LM_EXTRA_LO_NIBBLE =
{
	get: function( ){ return 1 + (this.extra & 0x0F); },
	set: function(x){ --x; this.extra = (this.extra & 0xF0) | (x & 0x0F); },
};

var __LM_EXTRA_BYTE =
{
	get: function( ){ return 1 + (this.extra & 0xFF); },
	set: function(x){ --x; this.extra = x & 0xFF; },
};

var __LUNAR_MAGIC_STANDARD =
[
	{ id: 0x01, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Water Tiles 1" },
	{ id: 0x02, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Invisible Coin Blocks" },
	{ id: 0x03, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Invisible Note Blocks" },
	{ id: 0x04, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Invisible POW Coins" },
	{ id: 0x05, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Coins" },
	{ id: 0x06, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Non-Solid Dirt" },
	{ id: 0x07, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Water Tiles 2" },
	{ id: 0x08, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Note Blocks" },
	{ id: 0x09, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Turn Blocks" },
	{ id: 0x0A, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Coin Blocks" },
	{ id: 0x0B, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Throw Blocks" },
	{ id: 0x0C, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Munchers" },
	{ id: 0x0D, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Grey Cement Blocks" },
	{ id: 0x0E, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Used (Brown) Blocks" },
	{ id: 0x0F, w: 2, h: __LM_EXTRA_HI_NIBBLE, name: "Vertical Pipe" },
	{ id: 0x10, w: __LM_EXTRA_HI_NIBBLE, h: 2, name: "Horizontal Pipe" },
	{ id: 0x11, w: 1, h: __LM_EXTRA_HI_NIBBLE, name: "Bullet Shooter" },
	{ id: 0x13, w: 1, h: __LM_EXTRA_HI_NIBBLE, name: "Wall/Vine" },
	{ id: 0x14, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Ledge" },
	{ id: 0x15, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Ledge" },
	{ id: 0x16, w: __LM_EXTRA_HI_NIBBLE, h: __LM_EXTRA_LO_NIBBLE, name: "Ledge" },
];
