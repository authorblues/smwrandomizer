import sys

filename, addr, bcount = sys.argv[1:]
with open(filename, 'rb') as f:
	f.seek(int(addr, 16))
	print(", ".join("0x%02X" % b for b in f.read(int(bcount))))
