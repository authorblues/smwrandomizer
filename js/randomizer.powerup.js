function randomizePowerups(random, rom)
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
		var sprites = getSpritesBySublevel(id, rom);
		for (var i = 0; i < sprites.length; ++i)
		{
			// if we find a bare powerup, replace it with a random powerup
			if (powerups.contains(sprites[i].spriteid))
				rom[sprites[i].addr+2] = powerups[random.nextInt(powerups.length)];
		}
	
		// FIND AND REPLACE ?/TURN BLOCKS
		
		var start = LAYER1_OFFSET + 3 * id;
		var p = rom.slice(start, start + 3);
		var snes = (p[2] << 16) | (p[1] << 8) | p[0];
		
		var addr = snesAddressToOffset(snes) + 5;
		for (;; addr += 3)
		{
			// 0xFF sentinel represents end of level data
			if (rom[addr] === 0xFF) break;
			
			// pattern looks like the start of the screen exits list
			if ((rom[addr] & 0xE0) === 0x00 && (rom[addr+1] & 0xF5) === 0x00 && rom[addr+2] === 0x00) break;
			
			// pattern looks like an extended sprite that is a block we want to change
			if ((rom[addr] & 0x60) === 0x00 && (rom[addr+1] & 0xF0) === 0x00 && rom[addr+2] in blockmap)
			{
				var valid = blockmap[rom[addr+2]], prev = rom[addr+2];
				var newp = rom[addr+2] = valid[random.nextInt(valid.length)];
			}
		}
	}
	
	// yoshi can poop any powerup he wants to, don't judge him
	rom[0x0F0F6] = powerups[random.nextInt(powerups.length)];
	
	// randomize the powerup peach throws
	rom[0x1A8EE] = powerups[random.nextInt(powerups.length)];
}

function removeCape(rom)
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
}

function removeAllPowerups(rom)
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
			
	// remove invisible mushrooms (STZ $14C8,x : RTS)
	rom.set([0x9E, 0xC8, 0x14, 0x60], 0x1C30F);
	
	// midpoint shouldn't make you large
	rom[0x072E2] = 0x80;
	
	// yoshi berries (never produce mushroom)
	rom[0x0F0F0] = 0x80;
	
	// remove the powerup peach throws
	rom[0x1A8EE] = 0x3E;
}

function removeYoshi(rom)
{
	// change yoshi blocks to 1-up blocks
	for (var i = 0; i < 36; ++i)
		if (rom[0x07080+i] == 0x18) rom[0x07080+i] = 0x0A;
		
	// when baby yoshi grows, he loses all interaction with everything
	rom[0x0A2C1] = 0x02;
	rom[0x1C067] = 0x02;
	
	// fix the title screen demo so mario doesn't die >.<
	for (var i = 10; i < 34; ++i)
		rom[0x01C1F + i * 2] = 0x00;
	rom[0x01C1F + 34] = 0xFF;
}