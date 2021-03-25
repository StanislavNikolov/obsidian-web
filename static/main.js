"use strict;"

import { Node, Renderer, Scene } from './Simulation.mjs';

// Setup
const canvasDOM = document.getElementById('canvas');

canvasDOM.width = window.innerWidth;
canvasDOM.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const scene = new Scene();
Renderer.Init(ctx, { width: canvasDOM.width, height: canvasDOM.height }, scene);

// Generate sample Nodes
const generateNodes = (nodes) => {
	console.log("main.js: generate nodes..")
	for(const node of nodes){
		const x = Math.floor(Math.random() * canvasDOM.width * 3);
		const y = Math.floor(Math.random() * canvasDOM.height * 3);
		const r = 30;

		const _node = new Node({"path": node.path, "name": node.name}, node.links, { x, y, r }, { color:"green", options: { visibleTitle: false } } );
		scene.add(_node);
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
	Renderer.draw();
	Renderer.updateMouse();

	window.requestAnimationFrame(update);
}
update();
