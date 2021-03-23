#
# argv[1]: source, argv[2]: target, argv[3]: log
#
# Script to modify md files and convert them to html including a js
# lib to render MD & LaTeX
#

import sys
import os
import os.path
import shutil

# contants
EXTENSION = ".md"
TARGET_EXTENSION = ".html"
ROOT_PATH = sys.argv[1] if len(sys.argv) > 1 else "."
DEST_PATH = sys.argv[2] if len(sys.argv) > 2 else "."
LOG       = sys.argv[3] if len(sys.argv) > 3 else False

TEXME = "<!DOCTYPE html><script src='https://cdn.jsdelivr.net/npm/texme@0.9.0'></script><textarea>"

# grab all files for conversion
md_files = []
for dirpath, dirnames, filenames in os.walk(ROOT_PATH):
	for filename in [f for f in filenames if f.endswith(EXTENSION)]:
# print os.path.join(dirpath, filename)
		md_files.append(os.path.join(dirpath, filename))


# convert names and root
def reformat(f):
	f = f.replace(ROOT_PATH, DEST_PATH)
	f = f.replace(EXTENSION, TARGET_EXTENSION)
	return f

html_files = [reformat(f) for f in md_files ]


for i in range(len(md_files)):
	os.makedirs(os.path.dirname(html_files[i]), exist_ok=True) # create dir if doesnt exist
	shutil.copyfile(md_files[i], html_files[i]) # copy file

	# append to beginning of file
	with open(html_files[i], "r+") as f:
		content = f.read()
		f.seek(0, 0)
		f.write(TEXME + "\n" + content)
