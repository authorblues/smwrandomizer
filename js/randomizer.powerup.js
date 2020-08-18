var POWERUP_FIRE = { tweaker: 0x10 };
var POWERUP_snow = { tweaker: 0x20 };

function randomizePowerups(random, rom, stages)
{
	var powerups = [ 0x74, 0x75, 0x77 ];
	var blockmap =
	{
		0x28: [0x28, 0x29],
		0x29: [0x28, 0x29],

		0x30: [0x30, 0x31],
		0x31: [0x30, 0x31],
	};

	for (var id = 0; id < 0x200; ++id)
	{
		var data = getSprites(id, rom);
		var sprites = data.sprites;

		for (var i = 0; i < sprites.length; ++i)
		{
			// if we find a bare powerup, replace it with a random powerup
			if (powerups.contains(sprites[i].spriteid))
				writeSprite(sprites[i], rom, { spriteid: random.from(powerups) });

			// if we find a flying [?], adjust X value (to change its contents)
			if ([0x83, 0x84].contains(sprites[i].spriteid) &&
				[1, 2].contains(sprites[i].x % 4) && random.nextInt(2))
					writeSprite(sprites[i], rom, { x: sprites[i].x ^ 3 })
		}

		// FIND AND REPLACE ?/TURN BLOCKS
		var objects = parseLayer1(id, rom).objs;
		for (var i = 0; i < objects.length; ++i)
			if (objects[i].extended && objects[i].extra in blockmap)
				writeObject(objects[i], rom, { extra: random.from(blockmap[objects[i].extra]) });
	}

	// speed up roulette sprite (remove 0xEAs to slow down)
	rom.set([0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA], 0x0C327);

	// yoshi can poop any powerup he wants to, don't judge him
	rom[0x0F0F6] = random.from(powerups);

	// randomize the powerup Peach throws
	rom[0x1A8EE] = random.from(powerups);

	// maybe change fire mario to hammer mario?
	if (random.flipCoin(0.5)) addHammerSuit(rom);
}

function powerupCanKill(id, powerup, rom)
{
	// ensure that the tweaker bit for the sprite is off
	// (bit represents "sprite cannot be killed")
	rom[0x3F4C7+id] &= 0xFF ^ 0x02;

	// ensure that the tweaker bit for the powerup is off
	// (bit represents "sprite immune to powerup")
	rom[0x3F3FE+id] &= 0xFF ^ powerup.tweaker;
}

function addHammerSuit(rom)
{
	// initial Y speed
	rom[0x07EC5] = 0xC0;

	// initial X speeds
	var xspd = 0x10;
	rom.set([0x100-xspd, xspd], 0x07E94);

	// max speed and gravity
	var mspd = 0x78;
	var grav = 0x03;

	rom.set(
	[
		0xBD, 0x3D, 0x17, 0x30, 0x04, 0xC9, mspd, 0x10,
		0x07, 0x18, 0x69, grav, 0x9D, 0x3D, 0x17, 0xEA,
		0x80, 0x39
	],
	0x11FC8);

	// adjust hammer velocity to incorporate mario's speed
	rom.set(
	[
		0x18, 0x65, 0x7B, 0x4A, 0x4A, 0x4A, 0x4A, 0xC9,
		0x08, 0x90, 0x02, 0x49, 0xF0, 0x9D, 0x47, 0x17,
		0x60
	],
	0x07F97);

	rom.set([0x20, 0x97, 0xFF], 0x07ECE);

	// don't erase on sprite contact
	rom[0x120E6] = 0x80;

	// change graphics
	rom[0x120A1] = 0x02;

	rom.set([0xA9, 0x26, 0xEA], 0x12081);
	rom.set([0x20, 0xDA, 0x9F], 0x1203E);

	rom.set(
	[
		0x20, 0xA7, 0xA1, 0xA9, 0x02, 0x99, 0x20, 0x04,
		0x98, 0x0A, 0x0A, 0xA8, 0xA9, 0x26, 0x99, 0x02,
		0x02, 0xA5, 0x14, 0x4A, 0x4A, 0x29, 0x03, 0xAA,
		0xBD, 0x0B, 0xA0, 0x45, 0x00, 0x05, 0x64, 0x99,
		0x03, 0x02, 0xA6, 0x01, 0xF0, 0x07, 0x29, 0xCF,
		0x09, 0x10, 0x99, 0x03, 0x02, 0xAE, 0xE9, 0x15,
		0x60, 0x04, 0x44, 0xC4, 0x84
	],
	0x11FDA);

	// modify hammer graphics
	applyPatch(ROM_PATCHES['hammergfx'], rom);

	// make mario/luigi color palette grey
	rom.set([0x84, 0x10, 0x8C, 0x31, 0x10, 0x42], 0x032F0+8);
	rom.set([0x84, 0x10, 0x8C, 0x31, 0x10, 0x42], 0x03304+8);

	// sprites to make killable via hammer
	for (var i = 0; i < HAMMER_CAN_KILL.length; ++i)
		powerupCanKill(HAMMER_CAN_KILL[i], POWERUP_FIRE, rom);
}

function removeCape(rom, stages)
{
	// change feather blockcodes to flower blockcodes
	var blockcodes = { 0x08: 0x04, 0x09: 0x05 };
	for (var i = 0; i < 36; ++i)
		if (rom[0x07080+i] in blockcodes)
			rom[0x07080+i] = blockcodes[rom[0x07080+i]];

	// change the cape in the roulette block to flower
	rom[0x0C313+2] = 0x75;

	// remove capes from super koopas
	rom.set([0xEA, 0xEA, 0xEA, 0xEA], 0x16AF2);
	rom.set([0xEA, 0xEA, 0xEA, 0xEA], 0x16B19);

	// change item codes for taking an item through the goal
	for (var i = 0; i < 28; ++i)
		if (rom[0x07ADF+i] == 0x77) rom[0x07ADF+i] = 0x75;

	// remove all fixed capes in every sublevel
	for (var id = 0; id < 0x200; ++id)
	{
		var sprites = getSprites(id, rom);
		deleteSprites(sprites, function(x){ return x.spriteid == 0x77; }, rom);
	}

	// change contents of flying [?]s
	rom.set([0x06, 0x02, 0x02, 0x05, 0x06, 0x01, 0x01, 0x05], 0x0AE88);
}

function removeAllPowerups(rom, stages)
{
	var powerups = [ 0x74, 0x75, 0x77 ];
	removeCape(rom);

	// change powerup blockcodes to multicoins
	var blockcodes = [ 0x02, 0x04, 0x05, 0x08, 0x09 ];
	for (var i = 0; i < 36; ++i)
		if (blockcodes.contains(rom[0x07080+i]))
			rom[0x07080+i] = 0x0E;

	// change roulette block exclusively to star
	rom.set([0x76, 0x76, 0x76, 0x76], 0x0C313);

	// change item codes for taking an item through the goal to moving coin
	for (var i = 0; i < 28; ++i)
		if (powerups.contains(rom[0x07ADF+i]))
			rom[0x07ADF+i] = 0x21;

	// remove all fixed powerups in every sublevel
	for (var id = 0; id < 0x200; ++id)
	{
		var sprites = getSprites(id, rom);
		deleteSprites(sprites, function(x){ return powerups.contains(x.spriteid); }, rom);
	}

	// change contents of flying [?]s
	rom.set([0x06, 0x06, 0x06, 0x05, 0x06, 0x06, 0x06, 0x05], 0x0AE88);

	// remove invisible mushrooms (STZ $14C8,x : RTS)
	rom.set([0x9E, 0xC8, 0x14, 0x60], 0x1C30F);

	// midpoint shouldn't make you large
	rom[0x072E2] = 0x80;

	// yoshi berries (never produce mushroom)
	rom[0x0F0F0] = 0x80;

	// remove the powerup peach throws
	rom[0x1A8E9] = 0x00;
	rom[0x1A8E4] = 0x00;
}

function removeYoshi(rom, stages)
{
	// change yoshi blocks to 1-up blocks
	rom[0x108A1] = 0x78;

	// when baby yoshi grows, he loses all interaction with everything
	rom[0x0A2C1] = 0x02;
	rom[0x1C067] = 0x02;

	fixDemo(rom);
}

function hasCape(baseid, rom)
{
	var sublevels = getRelatedSublevels(baseid, rom);
	for (var i = 0; i < sublevels.length; ++i)
	{
		var sprites = getSprites(sublevels[i], rom).sprites;
		for (var j = 0; j < sprites.length; ++j)
		{
			if (sprites[j].spriteid == 0x77) return true;
			if ([0x83, 0x84].contains(sprites[j].spriteid))
			{
				var x = sprites[j].x % 4;
				if (rom[0x0AE88+x] == 0x77 || rom[0x0AE8C+x] == 0x77) return true;
			}
		}

		var objects = parseLayer1(sublevels[i], rom).objs;
		for (var j = 0; j < objects.length; ++j)
		{
			// turn/? block containing a cape
			if (objects[j].extended && [0x29, 0x31].contains(objects[j].extra)) return true;

			// note block containing a cape
			if (objects[j].extended && objects[j].extra == 0x23 && (objects[j].x % 3) == 1) return true;

			// green switch block (and green switch blocks provide a cape)
			if (objects[j].extended && objects[j].extra == 0x87 && [0x08, 0x09].contains(rom[0x070A2])) return true;
		}
	}

	return false;
}
