"use strict;"

import Simulation from './Simulation.mjs';

// Setup
const canvasDOM = document.getElementById('canvas');
canvasDOM.width = window.innerWidth;
canvasDOM.height = window.innerHeight;
const ctx = canvas.getContext('2d');

Simulation.Scene.Init(ctx);

// Generate sample Nodes
const generateNodes = (nodes) => {
	console.log("main.js: generate nodes..")
	for(const node of nodes){
		const x = Math.floor(Math.random() * canvasDOM.width * 3);
		const y = Math.floor(Math.random() * canvasDOM.height * 3);
		const r = 30;

		const _node = new Simulation.Node({"path": node.path, "name": node.name}, node.links, { x, y, r }, { color:"green", options: { visibleTitle: false } } );
		Simulation.Scene.add(_node);
	}
}

(() => {
	$.ajax({
		url: "json/graph.json",
		dataType: "json",
		success: (res) => {
			console.log(res);
			generateNodes(res);
		}
	});

})();

const update = () => {
	Simulation.Render();
	Simulation.Scene.updateMouse();
	Simulation.Scene.updateGraphPhysics();

	window.requestAnimationFrame(update);
}
update();
