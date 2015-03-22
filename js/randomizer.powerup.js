function randomizePowerups(random, rom, stages)
{
	var powerups = [ 0x74, 0x75, 0x77 ];
	var blockmap = {
		0x28: [0x28, 0x29],
		0x29: [0x28, 0x29],
		
		0x30: [0x30, 0x31],
		0x31: [0x30, 0x31],
	};
	
	for (var id = 0; id < 0x200; ++id)
	{
		var sprites = getSpritesBySublevel(id, rom);
		for (var i = 0; i < sprites.length; ++i)
		{
			// if we find a bare powerup, replace it with a random powerup
			if (powerups.contains(sprites[i].spriteid))
				rom[sprites[i].addr+2] = random.from(powerups);
			
			// if we find a flying [?], adjust X value (to change its contents)
			if ([0x83, 0x84].contains(sprites[i].spriteid) && random.nextInt(2))
				rom[sprites[i].addr+1] ^= 0x30;
		}
	
		// FIND AND REPLACE ?/TURN BLOCKS
		
		var start = LAYER1_OFFSET + 3 * id;
		var snes = getPointer(start, 3, rom);
		
		var addr = snesAddressToOffset(snes) + 5;
		for (;; addr += 3)
		{
			// 0xFF sentinel represents end of level data
			if (rom[addr] === 0xFF) break;
			
			// pattern looks like the start of the screen exits list
			if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
			
			// pattern looks like a block we want to change
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] in blockmap)
			{
				var valid = blockmap[rom[addr+2]];
				rom[addr+2] = random.from(valid);
			}
		}
	}
	
	// speed up roulette sprite (remove 0xEAs to slow down)
	rom.set([0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA], 0x0C327);
	
	// yoshi can poop any powerup he wants to, don't judge him
	rom[0x0F0F6] = random.from(powerups);
	
	// randomize the powerup Peach throws
	rom[0x1A8EE] = random.from(powerups);
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
		var sprites = getSpritesBySublevel(id, rom);
		deleteSprites([0x77], sprites, rom);
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
		var sprites = getSpritesBySublevel(id, rom);
		deleteSprites(powerups, sprites, rom);
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
	rom[0x1A8EE] = 0x3E;
}

function removeYoshi(rom, stages)
{
	// change yoshi blocks to 1-up blocks
	for (var i = 0; i < 36; ++i)
		if (rom[0x07080+i] == 0x18) rom[0x07080+i] = 0x0A;
		
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
		var sprites = getSpritesBySublevel(sublevels[i], rom);
		for (var j = 0; j < sprites.length; ++j)
		{
			if (sprites[j].spriteid == 0x77) return true;
			if ([0x83, 0x84].contains(sprites[j].spriteid))
			{
				var x = (rom[sprites[j].addr+1] >> 4) % 4;
				if (rom[0x0AE88+x] == 0x77 || rom[0x0AE8C+x] == 0x77) return true;
			}
		}
		
		var start = LAYER1_OFFSET + 3 * sublevels[i];
		var snes = getPointer(start, 3, rom);
		
		var addr = snesAddressToOffset(snes) + 5;
		for (;; addr += 3)
		{
			// 0xFF sentinel represents end of level data
			if (rom[addr] === 0xFF) break;
			
			// pattern looks like the start of the screen exits list
			if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
			
			// pattern looks like a turn/? block containing a cape
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 
				&& [0x29, 0x31].contains(rom[addr+2])) return true;
			
			// pattern looks like a turn/? block containing a cape
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] == 0x23) return true;
			
			// pattern looks like a green switch block (and green switch blocks produce feathers still)
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 
				&& rom[addr+2] == 0x87 && [0x08, 0x09].contains(rom[0x070A2])) return true;
		}
	}
	
	return false;
}
