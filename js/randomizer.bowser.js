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
		rooms.push({ out: exits[0], sublevel: id });
	}
	
	rooms.shuffle(random);
	
	var hold0 = findOpenSublevel(0x100, rom);
	moveSublevel(hold0, rooms[0].sublevel, rom);
	
	for (var i = 1; i < rooms.length; ++i)
	{
		moveSublevel(rooms[i-1].sublevel, rooms[i].sublevel, rom);
		rom[rooms[i-1].out.addr+3] = rooms[i].out.target & 0xFF;
	}
	moveSublevel(rooms[rooms.length-1].sublevel, hold0, rom);
	rom[rooms[rooms.length-1].out.addr+3] = rooms[0].out.target & 0xFF;
}

function generateGauntlet(random, rom)
{
	// get a list of rooms
	var rooms = bowser8doors.slice(0).shuffle(random), numrooms = rooms.length;
	rooms.push(BOWSER_DARKROOM_ID);
	
	// copy the first room into both castle entrances
	for (var i = 0; i < bowserentrances.length; ++i)
		copySublevel(bowserentrances[i].id, rooms[0], rom);
		
	// chain together all 8 rooms \("v")/
	for (var i = 0; i < numrooms; ++i)
	{
		var exits = getScreenExits(rooms[i], rom);
		for (var j = 0; j < exits.length; ++j)
			rom[exits[j].addr+3] = rooms[i+1] & 0xFF;
	}
}