#!/bin/bash

echo "convert-md.py.."
python3 convert-md.py ../md/ ../html/

echo "link.py.."
python3 link.py ../html/ ../html/ ../static/json/graph.json
