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
	/*for (var id = 0; id < 0x200; ++id)
	{
		var sprites = getSpritesBySublevel(id, rom);
		for (var i = 0; i < sprites.length; ++i)
			if (sprites[i].spriteid == 0x77)
				rom.set([0xF3, 0xFF, 0x00], sprites[i].addr);
	}*/
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
	/*for (var id = 0; id < 0x200; ++id)
	{
		var sprites = getSpritesBySublevel(id, rom);
		for (var i = 0; i < sprites.length; ++i)
			if (powerups.contains(sprites[i].spriteid))
				rom.set([0xF3, 0xFF, 0x00], sprites[i].addr);
	}*/
			
	// remove invisible mushrooms (STZ $14C8,x : RTS)
	rom.set([0x9E, 0xC8, 0x14, 0x60], 0x1C30F);
	
	// midpoint shouldn't make you large
	rom[0x072E2] = 0x80;
}

function removeYoshi(rom)
{
	// change yoshi blocks to 1-up blocks
	for (var i = 0; i < 36; ++i)
		if (rom[0x07080+i] == 0x18) rom[0x07080+i] = 0x0A;
		
	// baby yoshi will never grow
	rom.set([0x80, 0x45], 0x0A2AD);
	rom[0x0A2FC] = 0x80;
	
	// fix the title screen demo so mario doesn't die >.<
	for (var i = 10; i < 34; ++i)
		rom[0x01C1F + i * 2] = 0x00;
	rom[0x01C1F + 34] = 0xFF;
}