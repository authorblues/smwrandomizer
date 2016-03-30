// actual sound effect ids
var SOUND_EFFECT =
{
	YOSHI_OW: { id: 0x20, bank: 0xF9 },
};

// snes offsets for where different sound effects are loaded to be played
// must call snesAddressToOffset() on these to convert them to rom offsets
var SOUND_EFFECT_TRIGGER = 
{
	NINTENDO_PRESENTS: 0x0093C1,
	
	SCREEN_SCROLL: 0x00CE40,
	BONUS_WRONG: 0x00F237,
	BONUS_RIGHT: 0x03CE34,
	
	GET_1UP: 0x028ACE,
	GET_MUSHROOM_FLOWER: 0x01C57B,
	GET_FEATHER: 0x01C59D,
	
	MARIO_CAPE_SPIN: 0x00D07C,
	MARIO_SWIM: 0x00DAAA,
	MARIO_PUNCH_NET: 0x00DBB3,
	MARIO_ENTER_DOOR: 0x00EC11,
	MARIO_FIREBALL: 0x00FEB6,
	MARIO_STOMP_ENEMY: 0x01A940,
	MARIO_SPRINGBOARD: 0x01E6AA,
	
	MARIO_MIDWAY_TAPE: 0x00F2E9,
	MARIO_GOAL_TAPE: 0x01C10A,
	
	YOSHI_TONGUE: 0x01F30F,
	YOSHI_HURT: 0x01F71E,
	
	ENEMY_THWOMP: 0x01AF18,
	ENEMY_THWIMP: 0x01AFFD,
	ENEMY_DRYBONES_CRUMBLE: 0x01E5F3,
	ENEMY_CHUCK_WHISTLE: 0x02C382,
	ENEMY_BLARGG: 0x039FFB,
	
	BOSS_DEATH: 0x01CFD1,
	BOSS_STOMP: 0x01D29A,
	BOSS_BOO_APPEAR: 0x0380EA,
	BOSS_BOO_DEATH: 0x0381DF,
	BOSS_REZNOR_FIREBALL: 0x039B04,
	BOSS_BOWSER_HURT: 0x03B12A,
	
	BLOCK_TURNBLOCK_DESTROY: 0x028680,
	BLOCK_NOTEBLOCK: 0x02917E,
	
	OVERWORLD_MOVE: 0x0496A0,
	OVERWORLD_STAR_WARP: 0x049171,
	OVERWORLD_CASTLE_DESTROY: 0x04E670,
	OVERWORLD_VOB_THUNDER: 0x04F737,
	
	CUTSCENE_BOMB: 0x0CD296,
	CUTSCENE_CASTLE_DESTROY: 0x0CD2B3,
	CUTSCENE_MARIO_HAMMER: 0x0CD3E8,
	CUTSCENE_MARIO_PAINT: 0x0CD7D9,
};

function changeSound(trigger, sound, rom)
{
	var offset = snesAddressToOffset(trigger);
	rom[offset] = sound.id;
	
	// find the bank load operation 
	// (STA $1Dyy, which looks like 8D yy 1D in memory)
	// so we find the x1D, and insert the lower byte
	while (rom[offset+1] != 0x1D) ++offset;
	rom[offset] = sound.bank;
}

function detuneMusic(rom)
{
	// copy music timer to tuning byte
	rom.set([0x84, 0x45, 0x00], 0x700EF);
}

// if you use this feature, i hope you run into the road and get hit by a car going just
// fast enough to cause you bruising and mild discomfort, but proving otherwise non-fatal
function randomizeMusic(random, rom)
{
	for (var id = 0; id < 0x200; ++id)
	{
		var snes = getPointer(LAYER1_OFFSET + 3 * id, 3, rom);
		var addr = snesAddressToOffset(snes) + 2;
		rom[addr] = (rom[addr] & 0x8F) | (random.nextInt(8) << 4);
	}
}