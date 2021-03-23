#
# argv[1]: source
#
# Script that generates the links between files and stores
# them in an easily readable json for the graph. 
# Also creates hrefs inplace of those links
#
# pattern 1: [[***]]    link to other file
# pattern 2: [[#***]]   link to header of this file
# pattern 3: [***](URL) link to external resource
#

import sys
import os
import json

# constants
ROOT_PATH = sys.argv[1] if len(sys.argv) > 1 else "."
ROOT_STATIC = sys.argv[2] if len(sys.argv) > 2 else ROOT_PATH
OUTFILE = sys.argv[3] if len(sys.argv) > 3 else "graph.json"

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

def stripFilename(path):
    if path:
        return path.rsplit('/', 1)[-1]

nodes = []
for filename in files:
    links = []
    with fileinput.FileInput(filename, inplace=True) as file:
        for line in file:
            # search for pattern 1 [[***]]
            title_search = re.search('(\[\[)(.*)(\]\])', line)
            if title_search:
                title = title_search.group(2)
                title_src = seekFullSource(title)
                title_src = stripNonStatic(title_src)
                if title_src:
                    # line is link to outer file
                    line = re.sub('(\[\[)(.*)(\]\])', '<a href="{}">\\2</a>'.format(title_src), line)
                    links.append(title_src)
                else:
                    # line is link to header of itself
                    line = re.sub('(\[\[)(.*)(\]\])', '<a href="{}">\\2</a>'.format(title), line)

            print(line, '')

        node = {}
        node["path"] = stripNonStatic(filename)
        node["name"] = stripFilename(filename)
        node["links"] = links
        nodes.append(node)

with open(OUTFILE, "w") as outfile:
    json.dump(nodes, outfile)
