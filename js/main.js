var ORIGINAL_ROM = null;
var BASEURL = window.location.origin + window.location.pathname;

var EN_US = false;

function doRandomize(buffer, seed)
{
	try
	{
		var result = randomizeROM(buffer, seed);
		var url = BASEURL + '#!/' + result.seed + '/' + result.preset;
		$('#setgoal-text').val('.setgoal Randomizer ' + VERSION_STRING + ' - ' + url);
		saveAs(new Blob([result.buffer], {type: "octet/stream"}), 'smw-' + result.seed + '.sfc');
	}
	catch (e)
	{
		$('#modal-error-win #modal-error-text').text(e.name + ': ' + e.message);
		$('#modal-error-win #modal-error-list').empty();
		
		if (e instanceof ValidationError)
			for (var i = 0; i < e.errors.length; ++i)
				$('#modal-error-win #modal-error-list').append($('<li>').text(e.errors[i]).addClass('mono'));
		
		$('#modal-error-win').modal('show');
		throw e;
	}
}

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
		
		xhr.onload = function(e){ doRandomize(xhr.response, seed); }
		xhr.send();
	}
	else
	{
		var reader = new FileReader();
		reader.onloadend = function(e){ doRandomize(reader.result, seed); };
		reader.readAsArrayBuffer(ORIGINAL_ROM);
	}
});

$('#generate-param-rom').click(function(e)
{
	// maybe this will be a NaN?
	var seed = parseInt($('#custom-seed').val(), 16);
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'smw.sfc', true);
	xhr.responseType = 'arraybuffer';
	
	xhr.onload = function(e){ doRandomize(xhr.response, seed); }
	xhr.send();
});

function _validateRandomizer(buffer, maxiter, iter, errors)
{
	for (var i = 0; i < 100 && iter > 0; ++i, --iter)
	{
		var copy = new ArrayBuffer(buffer.byteLength);
		new Uint8Array(copy).set(new Uint8Array(buffer));
		try { randomizeROM(copy); } catch (e) { ++errors; }
	}
	
	if (iter) setTimeout(_validateRandomizer.bind(this, buffer, maxiter, iter, errors), 100);
	else console.log('Validation complete: ' + errors + ' errors (' + Math.round(errors*100/maxiter) + '%)'); // FIXME
}

function validateRandomizer(iter)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'smw.sfc', true);
	xhr.responseType = 'arraybuffer';
	
	iter = iter || 10000;
	xhr.onload = function(e) 
	{
		console.log('Starting ' + iter + ' iterations of the randomizer...');
		_validateRandomizer(xhr.response, iter, iter, 0);
	};
	xhr.send();
}

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

function checkHash()
{
	if (!location.hash || location.hash.indexOf("#!/") !== 0) return;
	var parts = location.hash.split('/').slice(1);
	
	var seed = cleanCustomSeed(parts[0]);
	if (parts.length > 0) $('#custom-seed').val(seed);
	
	var preset = parts.length > 1 ? +parts[1] : 0;
	$('#preset').val(preset); updatePreset();
	
	if (preset > 0)
	{
		$('#modal-download-win .modal-body .seed').text(seed);
		$('#modal-download-win .modal-body .preset').text(getPresetName());
		$('#modal-download-win').modal('show');
	}
}

function deepClone(obj)
{
	if (obj.constructor == Array)
	{
		var x = [], i;
		for (i = 0; i < obj.length; ++i)
			x.push(deepClone(obj[i]));
		return x;
	}
	else if (obj.constructor == Object)
	{
		var x = {};
		for (var k in obj)
			if (obj.hasOwnProperty(k))
				x[k] = deepClone(obj[k]);
		return x;
	}
	else return obj;
}

window.onhashchange = checkHash;
checkHash();

Uint8Array.prototype.slice = Uint8Array.prototype.slice || function(start, end)
{
	var src = this.subarray(start, end);
	var dst = new Uint8Array(src.byteLength);
	dst.set(src); return dst;
}

Uint8Array.prototype.writeBytes = function(b, addr, val)
{ var _b = b; for (; b--; val >>= 8) this[addr++] = val & 0xFF; return _b; }

//Uint8Array.prototype.readBytes = function(b, addr)
//{ var x = 0, s = 0; for (; b--; s += 8, addr++) x |= (this[addr] & 0xFF) << s; return x; }

function Random(seed)
{ this.seed = Math.floor(seed || (Math.random() * 0xFFFFFFFF)) % 0xFFFFFFFF; }

Random.prototype.clone = function()
{ return new Random(this.seed); }

Random.prototype.pull = function(n)
{ this.seed += (n === undefined ? 1 : n); }

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

Random.prototype.draw = function(arr)
{
	var which = this.nextInt(arr.length);
	return arr.splice(which, 1)[0];
}

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

function ROMLogger(rom)
{ this.rom = rom; }

ROMLogger.prototype.start = function()
{
	this.orig = new Uint8Array(this.rom.byteLength);
	this.orig.set(this.rom);
}

ROMLogger.prototype.print = function()
{
	for (var i = 0; i < this.rom.length; ++i)
	{
		if (this.rom[i] !== this.orig[i]) continue;
		console.log(i.toHex(6, '0x') + ' - ' + this.orig[i].toHex(2) + '->' + this.rom[i].toHex(2));
	}
}

$(document).ready(function()
{
	// use RANDOMIZER if language is set to en_US
	var language = window.navigator.userLanguage || window.navigator.language || "";
	EN_US = (language.indexOf('US') != -1);
	
	$('.en_us').each(function()
	{
		var s = $(this);
		s.text(EN_US ? s.attr('data-en_us') : s.attr('data-en_gb'));
	});
});

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

$('.version-number').text(VERSION_STRING);
