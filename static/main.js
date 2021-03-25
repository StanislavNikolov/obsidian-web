"use strict;"

import { Vec, Node, Renderer, Graph } from './Simulation.mjs';

// Setup
const fpsDOM = document.getElementById('fps');
const canvasDOM = document.getElementById('canvas');
canvasDOM.width = window.innerWidth;
canvasDOM.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const graph = new Graph();
const renderer = new Renderer(ctx, canvasDOM.width, canvasDOM.height, graph);


// Generate sample Nodes
const generateNodes = (nodes) => {
	console.log("main.js: generate nodes..")
	for(const node of nodes){
		const x = Math.random() * canvasDOM.width;
		const y = Math.random() * canvasDOM.height;
		const appearance = { color: "blue", options: { visibleTitle: false } };

		const _node = new Node(node.path, node.name, node.links, new Vec(x, y), appearance);
		graph.add(_node);
	}
	console.log(graph);
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

let lastUpdate = Date.now();
let c = 0;
const update = () => {

	const now = Date.now();
	const dt = now - lastUpdate;
	lastUpdate = now;

	if(c == 5){
		c = 0;
		fpsDOM.innerText = Math.floor(1000 / dt);
	}

	graph.calculateForces();
	renderer.updateMouse();
	renderer.draw();

	c++;
	window.requestAnimationFrame(update);
}
update();
