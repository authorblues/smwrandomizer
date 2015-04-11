var bowserentrances = [
	{"name": "frontdoor", "world": 10, "exits": -1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10D}, 
	{"name": "backdoor",  "world": 10, "exits": -1, "castle": 0, "palace": 0, "ghost": 0, "water": 0, "id": 0x10E}, 
];

var BOWSER_DARKROOM_ID = 0x1BD;

function randomizeBowserEntrances(random, map, rom)
{
	backupData(bowserentrances, rom);
	shuffle(bowserentrances, random);
	
	for (var i = 0; i < bowserentrances.length; ++i)
		performCopy(bowserentrances[i], map, rom);
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
		var exits = getScreenExits(id, rom);
		
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

function generateGauntlet(random, len, rom)
{
	if (len > bowser8doors.length) len = bowser8doors.length;
	
	// get a list of rooms
	var rooms = bowser8doors.slice(bowser8doors.length - len).shuffle(random), numrooms = rooms.length;
	rooms.push(BOWSER_DARKROOM_ID);
	
	// copy the first room into both castle entrances
	for (var i = 0; i < bowserentrances.length; ++i)
		copySublevel(bowserentrances[i].id, rooms[0], rom);
		
	// chain together all the rooms \("v")/
	for (var i = 0; i < numrooms; ++i)
	{
		var exits = getScreenExits(rooms[i], rom);
		for (var j = 0; j < exits.length; ++j)
			rom[exits[j].addr+3] = rooms[i+1] & 0xFF;
	}
