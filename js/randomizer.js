// this is the md5 of the only rom that we will accept
var ORIGINAL_MD5 = "dbe1f3c8f3a0b2db52b7d59417891117";

var level_offsets = [
	// layer data
	{"name":"layer1", "bytes":3, "offset":0x2E000},
	{"name":"layer2", "bytes":3, "offset":0x2E600},
	{"name":"sprite", "bytes":2, "offset":0x2EC00},
	
	// secondary header data
	{"name":"header1", "bytes":1, "offset":0x2F000},
	{"name":"header2", "bytes":1, "offset":0x2F200},
	{"name":"header3", "bytes":1, "offset":0x2F400},
	{"name":"header4", "bytes":1, "offset":0x2F600},
];

var smw_stages = processStages([
	{"name":"yi1","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"105"},
	{"name":"yi2","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"106"},
	{"name":"yi3","exits":1,"castle":0,"palace":0,"ghost":0,"water":1,"id":"103"},
	{"name":"yi4","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"102"},
	{"name":"dp1","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"15"},
	{"name":"dp2","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"9"},
	{"name":"dp3","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"5"},
	{"name":"dp4","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"6"},
	{"name":"ds1","exits":2,"castle":0,"palace":0,"ghost":0,"water":1,"id":"A"},
	{"name":"ds2","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"10B"},
	{"name":"vd1","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"11A"},
	{"name":"vd2","exits":2,"castle":0,"palace":0,"ghost":0,"water":1,"id":"118"},
	{"name":"vd3","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"10A"},
	{"name":"vd4","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"119"},
	{"name":"vs1","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"109"},
	{"name":"vs2","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"1"},
	{"name":"vs3","exits":1,"castle":0,"palace":0,"ghost":0,"water":1,"id":"2"},
	{"name":"cba","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"F"},
	{"name":"soda","exits":1,"castle":0,"palace":0,"ghost":0,"water":1,"id":"11"},
	{"name":"cookie","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"10"},
	{"name":"bb1","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"C"},
	{"name":"bb2","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"D"},
	{"name":"foi1","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"11E"},
	{"name":"foi2","exits":2,"castle":0,"palace":0,"ghost":0,"water":1,"id":"120"},
	{"name":"foi3","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"123"},
	{"name":"foi4","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"11F"},
	{"name":"fsecret","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"122"},
	{"name":"ci1","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"22"},
	{"name":"ci2","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"24"},
	{"name":"ci3","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"23"},
	{"name":"ci4","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"1D"},
	{"name":"ci5","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"1C"},
	{"name":"csecret","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"117"},
	{"name":"vob1","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"116"},
	{"name":"vob2","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"115"},
	{"name":"vob3","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"113"},
	{"name":"vob4","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"10F"},
	{"name":"c1","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"101"},
	{"name":"c2","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"7"},
	{"name":"c3","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"11C"},
	{"name":"c4","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"E"},
	{"name":"c5","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"20"},
	{"name":"c6","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"1A"},
	{"name":"c7","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"110"},
	{"name":"vfort","exits":1,"castle":1,"palace":0,"ghost":0,"water":1,"id":"B"},
	{"name":"ffort","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"1F"},
	{"name":"cfort","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"1B"},
	{"name":"bfort","exits":1,"castle":1,"palace":0,"ghost":0,"water":0,"id":"111"},
	{"name":"dgh","exits":2,"castle":0,"palace":0,"ghost":1,"water":0,"id":"4"},
	{"name":"dsh","exits":2,"castle":0,"palace":0,"ghost":1,"water":0,"id":"13"},
	{"name":"vgh","exits":1,"castle":0,"palace":0,"ghost":1,"water":0,"id":"107"},
	{"name":"fgh","exits":2,"castle":0,"palace":0,"ghost":1,"water":0,"id":"11D"},
	{"name":"cgh","exits":1,"castle":0,"palace":0,"ghost":1,"water":0,"id":"21"},
	{"name":"sgs","exits":1,"castle":0,"palace":0,"ghost":1,"water":1,"id":"18"},
	{"name":"bgh","exits":2,"castle":0,"palace":0,"ghost":1,"water":0,"id":"114"},
	{"name":"sw1","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"134"},
	{"name":"sw2","exits":2,"castle":0,"palace":0,"ghost":0,"water":1,"id":"130"},
	{"name":"sw3","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"132"},
	{"name":"sw4","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"135"},
	{"name":"sw5","exits":2,"castle":0,"palace":0,"ghost":0,"water":0,"id":"136"},
	{"name":"sp1","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"12A"},
	{"name":"sp2","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"12B"},
	{"name":"sp3","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"12C"},
	{"name":"sp4","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"12D"},
	{"name":"sp5","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"128"},
	{"name":"sp6","exits":1,"castle":0,"palace":0,"ghost":0,"water":1,"id":"127"},
	{"name":"sp7","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"126"},
	{"name":"sp8","exits":1,"castle":0,"palace":0,"ghost":0,"water":0,"id":"125"},
	{"name":"yswitch","exits":1,"castle":0,"palace":1,"ghost":0,"water":0,"id":"14"},
	{"name":"gswitch","exits":1,"castle":0,"palace":1,"ghost":0,"water":0,"id":"8"},
	{"name":"rswitch","exits":1,"castle":0,"palace":1,"ghost":0,"water":0,"id":"11B"},
	{"name":"bswitch","exits":1,"castle":0,"palace":1,"ghost":0,"water":0,"id":"121"},
]);

var ROM;
function randomizeROM(buffer, seed)
{
	var random = new Random(seed);
	var rom = ROM = new Uint8Array(buffer);
	backupData(smw_stages, rom);
	
	// put all the stages into buckets (any stage in same bucket can be swapped)
	var buckets = makeBuckets(smw_stages);
	
	// decide which stages will be swapped with which others
	for (var i = 0; i < buckets.length; ++i) shuffle(buckets[i], random);
	
	for (var i = 0; i < smw_stages.length; ++i)
		performCopy(smw_stages[i], rom);
	
	saveAs(new Blob([buffer], {type: "octet/stream"}), 'smw-randomizer.sfc');
}

function shuffle(stages, random)
{
	var rndstages = stages.slice(0).shuffle(random);
	for (var i = 0; i < stages.length; ++i)
		stages[i].copyfrom = rndstages[i];
}

function performCopy(stage, rom)
{
	// console.log(stage.copyfrom.name + ' --> ' + stage.name);
	for (var j = 0; j < level_offsets.length; ++j)
	{
		var o = level_offsets[j], start = o.offset + o.bytes * stage.id;
		rom.set(stage.copyfrom.data[o.name], start);
	}
}

function processStages(stages)
{
	for (var i = 0; i < stages.length; ++i)
	{
		var stage = stages[i];
		stage.id = parseInt(stage.id, 16);
		
		// translevel should fit in a single byte
		stage.translevel = getTranslevel(stage.id);
	}
	
	return stages;
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
	
	// can't swap castle with non-castle -- TODO
	if (a.castle !== b.castle) return false;
	
	// can't swap switch with non-switch -- TODO
	if (a.palace !== b.palace) return false;
	
	return true;
}