var ORIGINAL_ROM = null;

$('#generate-randomized-rom').click(function(e)
{
	if (!ORIGINAL_ROM) return;
	
	// maybe this will be a NaN?
	var seed = parseInt($('#custom-seed').val(), 16);
	
	if (ORIGINAL_ROM === true)
	{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'smw.sfc', true);
		xhr.responseType = 'arraybuffer';
		
		xhr.onload = function(e){ randomizeROM(xhr.response, seed); }
		xhr.send();
	}
	else
	{
		var reader = new FileReader();
		reader.onloadend = function(e){ randomizeROM(reader.result, seed); };
		reader.readAsArrayBuffer(ORIGINAL_ROM);
	}
});

function getMD5(file, callback)
{
	var w = new Worker('js/md5.worker.js');
	w.onmessage = function(e){ callback(e.data); };
	w.postMessage(file);
}

$('#select-original-rom').click(
	function(e){ $('#original-rom').click(); });

$('#original-rom').change(function(e)
{
	getMD5(e.target.files[0], function(x)
		{ checkRomResult(x in ORIGINAL_MD5, e.target.files[0]); });
});

$('form').submit(function(e)
{
	e.preventDefault();
	return false;
});

$('#authorblues').click(function(e)
{
	checkRomResult(true, true);
	$('#select-original-rom').prop('disabled', true);
});

function cleanCustomSeed(seed)
{ return seed.replace(/[^a-fA-F0-9]+/g, '').substr(0, 8); }

$('#custom-seed').bind("keypress paste", function(e)
{
	var self = $(this);
	setTimeout(function(){ self.val(cleanCustomSeed(self.val())); }, 1);
});

function checkRomResult(valid, file)
{
	$('#original-rom-result').removeClass('glyphicon-question-sign');
	$('#original-rom-result').toggleClass('glyphicon-ok', valid);
	$('#original-rom-result').toggleClass('glyphicon-remove', !valid);
	
	$('#generate-randomized-rom').prop('disabled', !valid);
	
	if (valid) ORIGINAL_ROM = file;
}

function updateHash()
{
	if (!location.hash || location.hash.indexOf("#!/") !== 0) return;
	var parts = location.hash.split('/').slice(1);
	
	if (parts.length > 0) $('#custom-seed').val(cleanCustomSeed(parts[0]));
	$('#preset').val(parts.length > 1 ? +parts[1] : 2); updatePreset();
}

window.onhashchange = updateHash;
updateHash();

Uint8Array.prototype.slice = Uint8Array.prototype.slice || function(start, end)
{
	var src = this.subarray(start, end);
	var dst = new Uint8Array(src.byteLength);
	dst.set(src); return dst;
}

function Random(seed)
{ this.seed = Math.floor(seed || (Math.random() * 0xFFFFFFFF)) % 0xFFFFFFFF; }

Random.prototype.pull = function(n)
{ this.seed += (n == undefined ? 1 : n); }

Random.prototype.nextFloat = function()
{ var x = Math.sin(this.seed++) * 10000; return x - Math.floor(x); }

// Box-Muller transform, converts uniform distribution to normal distribution
// depends on uniformity of nextFloat(), which I'm not confident of
Random.prototype.nextGaussian = function()
{
	var u = this.nextFloat(), v = this.nextFloat();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

Random.prototype.nextInt = function(z)
{ return (this.nextFloat() * z)|0; }

Random.prototype.nextIntRange = function(a, b)
{ return a + this.nextInt(b - a); }

Random.prototype.from = function(arr)
{ return arr[this.nextInt(arr.length)]; }

Array.prototype.shuffle = function(random)
{
	if (!random) random = new Random();
	for (var t, i = 1, j; i < this.length; ++i)
	{
		j = random.nextInt(i);
		t = this[j]; this[j] = this[i]; this[i] = t;
	}

	return this;
}

Array.prototype.contains = function(x)
{ return this.indexOf(x) != -1; }

Number.prototype.toHex = function(n, p)
{
	var hex = this.toString(16);
	while (hex.length < n) hex = '0' + hex;
	return (p != null ? p : '') + hex;
}

var TESTERS =
{
	'Akisto': 'se7endeadlysins',
	'LiamPiper': 'liampiper',
	'Bramz': 'mibramz',
	'daniplayerone': 'daniplayerone',
	'Skybilz': 'skybilz',
	'dotsarecool': 'dotsarecoolp',
	'truman': 'truman',
	'prawclaw': 'prawclaw',
	'Sweetyt': 'sweetyt',
	'yunakitten': 'yunakitten',
	'princessproto': 'protomagicalgirl',
	'radioactiverat': 'radioactive_rat',
	'rezephos': 'rezephos',
	'marc765': 'marc765',
}

$('#tester-list').html(
	$.map(TESTERS, function(twitch, name)
	{
		var str = twitch ? '<a href="http://twitch.tv/' + twitch + '">' + name + '</a>' : name;
		return '<span class="tester-' + name + '">' + str + '</span>';
	}).shuffle().join(', ')
);

$('#title-version-number').text(VERSION_STRING);
