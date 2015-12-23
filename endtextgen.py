import sys

characters = {
	'M': 0xA1,
	'P': 0xA0,
	'Y': 0xB0,
	'W': 0xA1,
	'L': 0xBB,
	'Z': 0xBB,
	'a': 0x88,
	'b': 0x89,
	'c': 0x8A,
	'd': 0x8B,
	'e': 0x8C,
	'f': 0x8D,
	'g': 0x8E,
	'h': 0x98,
	'i': 0x99,
	'j': 0x9A,
	'k': 0x9B,
	'l': 0x9C,
	'm': 0x9D,
	'n': 0x9E,
	'o': 0xA8,
	'p': 0xA9,
	'q': 0xAA,
	'r': 0xAB,
	's': 0xAC,
	't': 0xAD,
	'u': 0xAE,
	'v': 0xAF,
	'w': 0xB8,
	'x': 0xB9,
	'y': 0xBA,
	'#': 0xBC,
	'.': 0xBD,
	',': 0xBE,
	"'": 0xBF,
}

entries, lines, maxlen = 0, 0, 0
bytes = []

def chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i+n]

y = 0x10
with open(sys.argv[1], 'r') as f:
	for line in f.readlines():
		x  = 0x10
		y += 0x10
		
		lines += 1
		line = line.strip('\r\n')
		maxlen = max(maxlen, len(line))
		for ch in line:
			x += 0x08
			if ch == ' ': continue
			if ch not in characters.keys():
				print("couldn't find character '{}'".format(ch))
				continue
			entries += 1
			if entries > 83: print('too many characters!')
			nx, ny, z = x, y, 0x0E
			if ch == 'W':
				z = z | 0xC0
				ny -= 1
			bytes[len(bytes):] = [nx, ny, characters[ch], z]
			
print('chars: {}, lines: {}, maxlen: {}'.format(entries, lines, maxlen))
for chunk in chunks(bytes, 8):
	print(' '.join(['0x{0:02X},'.format(x) for x in chunk]))