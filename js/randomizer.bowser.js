var FRONTDOOR, BACKDOOR;

var BOWSER_ENTRANCES =
[
	FRONTDOOR = {"name": "frontdoor", "world": 10, "exits": -1, "castle": 8, "palace": 0, "ghost": 0, "water": 0, "id": 0x10D, "cpath": NORTH_CLEAR, "tile": [0x18, 0x23], "out": []},
	 BACKDOOR = {"name": "backdoor",  "world": 10, "exits": -1, "castle": 8, "palace": 0, "ghost": 0, "water": 0, "id": 0x10E, "cpath": NORTH_CLEAR, "tile": [0x1A, 0x23], "out": []},
];

var BOWSER_DARKROOM_ID = 0x1BD;

function randomizeBowserEntrances(random, rom)
{
	backupData(bowserentrances, rom);
	shuffle(bowserentrances, random);

	for (var i = 0; i < bowserentrances.length; ++i)
	{
		var b = bowserentrances[i];
		performCopy(b, rom);

		// reset the overworld tile
		rom[getOverworldOffset(b)] = b.data.owtile;
	}
}

var bowser8doors = [ 0x1D4, 0x1D3, 0x1D2, 0x1D1, 0x1CF, 0x1CE, 0x1CD, 0x1CC ];

function randomizeBowser8Doors(random, rom)
{
	// get a list of rooms
	var rooms = [];
	for (var i = 0; i < bowser8doors.length; ++i)
	{
		// get the location that this room exits to
		var id = bowser8doors[i];
		var exits = parseExits(id, rom);

		// save this information
		rooms.push({ out: exits[0], sublevel: id, data: backupSublevel(id, rom) });
	}

	rooms.shuffle(random);

	for (var i = 0; i < rooms.length; ++i)
	{
		rom[rooms[i].out.addr+3] = [ 0x1D0, 0x1BD ][(i/4)|0] & 0xFF;
		copyBackupToSublevel(bowser8doors[i], rooms[i].data, rom);
	}
}

function generateGauntlet(entrances, random, len, rom)
{
	if (len > bowser8doors.length) len = bowser8doors.length;

	// get a list of rooms
	var rooms = bowser8doors.slice(bowser8doors.length - len).shuffle(random), numrooms = rooms.length;
	rooms.push(BOWSER_DARKROOM_ID);

	// copy the first room into both castle entrances
	for (var i = 0; i < entrances.length; ++i)
	{
		copySublevel(entrances[i].id, rooms[0], rom);
		getSublevelData(entrances[i].id, rom).time = 0;
	}

	// chain together all the rooms \("v")/
	for (var i = 0; i < numrooms; ++i)
	{
		var exits = parseExits(rooms[i], rom);
		for (var j = 0; j < exits.length; ++j)
			rom[exits[j].addr+3] = rooms[i+1] & 0xFF;
	}
}
