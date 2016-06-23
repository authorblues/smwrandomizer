var CI2_TEST_3WAY_COUNT = 6;
var CI2_TEST_2WAY_COUNT = 3;

function getTestsCI2(random)
{
    var t3way = __range(CI2_TEST_3WAY_COUNT).shuffle(random);
    var a = t3way[0], b = t3way[1];
    var c = random.nextInt(CI2_TEST_2WAY_COUNT);

    return [
        get3TestCI2(random, a),
        get3TestCI2(random, b),
        get2TestCI2(random, c),
    ];
}

function get3TestCI2(random, ndx)
{
    switch (ndx)
    {
        case 0: // default room 1 - coins
            var cns1 = random.nextIntRange(  12, 22);
            var cns2 = random.nextIntRange(cns1, 28);

            cns1 = 0x1E - cns1;
            cns2 = 0x1E - cns2;
            return [
                0xA2, 0x0A, 0xAD, 0xC0, 0x0D, 0xC9, cns1, 0x10,
                0x08, 0xA2, 0x08, 0xC9, cns2, 0x10, 0x02, 0xA2,
                0x06
            ];

        case 1: // default room 2 - time
            var tim1 = 0x02; // hundreds (less goes to A)
            var tim2 = 0x03; // tens (less goes to A, equal checks A+B, greater checks B+C)
            var tim3 = 0x05; // ones (less goes to A, otherwise B)
            var tim4 = 0x05; // tens (less goes to B, otherwise C)

            tim2 = random.from([2, 3]);
            tim3 = random.nextIntRange(3, 9);
            tim4 = random.from([4, 5]);

            return [
                0xA2, 0x0C, 0xAD, 0x31, 0x0F, 0xC9, tim1, 0x30,
                0x1B, 0xAD, 0x32, 0x0F, 0xC9, tim2, 0x30, 0x14,
                0xD0, 0x07, 0xAD, 0x33, 0x0F, 0xC9, tim3, 0x30,
                0x0B, 0xA2, 0x0E, 0xAD, 0x32, 0x0F, 0xC9, tim4,
                0x30, 0x02, 0xA2, 0x10
            ];

        case 2: return [];
        case 3: return [];
        case 4: return [];
        case 5: return [];
    }
}

function get2TestCI2(random, ndx)
{
    switch (ndx)
    {
        case 0: // default room 3 - yoshi coins
            var ycns = random.nextIntRange(1, 5);
            return [0xA2, 0x00, 0xAD, 0x22, 0x14, 0xC9, ycns, 0xF0, 0x02, 0xA2, 0x02, 0xC2];
    }
}

function randomizeCI2(random, rom)
{
	for (var i = 0; i < CI2_ROOM_OFFSETS.length; ++i)
	{
		var roomset = CI2_ROOM_OFFSETS[i], backups = {};
		for (var j = 0; j < roomset.length; ++j)
		{
			var data = backups[roomset[j]] = {};
			for (var k in CI2_LAYER_OFFSETS) if (CI2_LAYER_OFFSETS.hasOwnProperty(k))
			{
				var start = CI2_LAYER_OFFSETS[k] + roomset[j];
				data[k] = rom.slice(start, start+2);
			}
		}

		var newrooms = roomset.slice(0).shuffle(random);
		for (var j = 0; j < roomset.length; ++j)
		{
			for (var k in CI2_LAYER_OFFSETS) if (CI2_LAYER_OFFSETS.hasOwnProperty(k))
				rom.set(backups[newrooms[j]][k], CI2_LAYER_OFFSETS[k] + roomset[j]);
		}
	}
}
