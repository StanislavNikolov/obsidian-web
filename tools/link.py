#
# argv[1]: source
#
# Script that generates the links between files and stores
# them in an easily readable json for the graph. 
# Also creates hrefs inplace of those links
#
# pattern 1: [[#***]]   link to header of this file
# pattern 2: [[***]]    link to other file
# pattern 3: [***](URL) link to external resource
#

import sys
import os
import json

# constants
ROOT_PATH = sys.argv[1] if len(sys.argv) > 1 else "."
ROOT_STATIC = sys.argv[2] if len(sys.argv) > 2 else ROOT_PATH

# Stores links between files
links = []

# grab all files for linking
files = []
for dirpath, dirnames, filenames in os.walk(ROOT_PATH):
    for filename in [f for f in filenames if f.endswith(".html")]:
        # print os.path.join(dirpath, filename)
        files.append(os.path.join(dirpath, filename))

# go through all files and search for patterns
import fileinput
import re

def seekFullSource(name):
	print(name)
	for fn in files:
		if fn.find("/{}.html".format(name)) != -1:
			return fn

def stripNonStatic(name):
	if name:
		name = name.replace(ROOT_STATIC, "/")
		return name

for filename in files:
	with fileinput.FileInput(filename, inplace=True) as file:
		for line in file:
			title_search = re.search('(\[\[)(.*)(\]\])', line)
			if title_search:
				title = title_search.group(2)
				title_src = seekFullSource(title)
				title_src = stripNonStatic(title_src)
				if title_src:
					line = re.sub('(\[\[)(.*)(\]\])', '<a href="{}">\\2</a>'.format(title_src), line)
				else:
					line = re.sub('(\[\[)(.*)(\]\])', '<a href="{}">\\2</a>'.format(title), line)

			print(line, '')

	# filename complete src
	# filename title
	# file links []
