"use strict;"

import { Node, Renderer, Graph } from './Simulation.mjs';

// Setup
const fpsDOM = document.getElementById('fps');
const canvasDOM = document.getElementById('canvas');
canvasDOM.width = window.innerWidth;
canvasDOM.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const graph = new Graph();
Renderer.Init(ctx, { width: canvasDOM.width, height: canvasDOM.height }, graph);

// Generate sample Nodes
const generateNodes = (nodes) => {
	console.log("main.js: generate nodes..")
	for(const node of nodes){
		const x = Math.floor(Math.random() * canvasDOM.width);
		const y = Math.floor(Math.random() * canvasDOM.height);
		const r = 30;

		const _node = new Node({path: node.path, name: node.name}, node.links, { x, y, r }, { color:"green", options: { visibleTitle: false } } );
		graph.add(_node);
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
	Renderer.updateMouse();
	Renderer.draw();

	c++;
	window.requestAnimationFrame(update);
}
update();
