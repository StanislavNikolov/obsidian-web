"use strict;"

const canvasDOM = document.getElementById('canvas');


class Scene {
	nodes = [];
	links = [];

	constructor(){
	}

	add(node) {
		this.nodes.push(node);
	}

	findNodeByPath(path) {
		for(const node of this.nodes){
			if(node.path === path)
				return node
		}
	}

}


/*
 * Every Node represents a file (not a folder). It can be linked
 * to other Nodes (all nodes and their links are represented in graph.json).
 * 
 * params: [0] String: absolute path to the file the node represents, 
 *         [1] Object: pos { x, y, r }
 *         [2] Object: appearance { color, options { visibleTitle: boolean } }
 *
 */
class Node {
	path       = null;
	name       = null;
	pos        = null;
	appearance = null;

	constructor({path, name}, links, pos, appearance) {
		this.path       = path;
		this.name       = name;
		this.links      = links;
		this.pos        = pos;
		this.appearance = appearance;
	}

	/* 
	 * Responsible for disecting the different pieces of the path
	 * Returns an object containing the path to the file and the name
	 */
	tokenizePath(path) {
		const parts = path.split('/');
		const name = parts[parts.length - 1];

		return { path, name };
	}

	/*
	 * The onclick event for the Node
	 */
	onclick() {
		console.log("dblclick");
		this.open();
	}
	attach() {
		Renderer.mouse.attached = this;
	}


	open() {
		window.location.href = this.path;
	}

	translate(x, y) {
		if(!isNaN(x))
			this.pos.x += x;

		if(!isNaN(y))
			this.pos.y += y;
	}

	scale(val) {
		if (!isNaN(val)){
			this.pos.r *= val;
			this.pos.x *= val;
			this.pos.y *= val;
		}
	}
}

class Renderer {

	static ctx = null;
    static width = null;
    static height = null;
	static scene = null;
	
	// pos: obj {x, y}, attached: obj (Node), held: boolean
	static mouse = {
		pos: {
			x: null,
			y: null,
		},
		pos_last: {
			x: 0,
			y: 0
		},
		attached: null,
		held: false,
	};

	static Init(ctx, { width, height }, scene){
		Renderer.ctx = ctx;
		Renderer.width = width;
		Renderer.height = height;
		Renderer.scene = scene;

		Renderer.InitEventListeners();
	}

	static updateMouse() {
		if(Renderer.mouse.attached) {
			Renderer.mouse.attached.pos.x = Renderer.mouse.pos.x;
			Renderer.mouse.attached.pos.y = Renderer.mouse.pos.y;
		}        
	}
	
	static draw() {
		Renderer.ctx.fillStyle = "gray";
		Renderer.ctx.fillRect(0, 0, Renderer.width, Renderer.height);

		for(const node of Renderer.scene.nodes){
			const ctx = Renderer.ctx;

			ctx.beginPath();
			ctx.fillStyle = node.appearance.color;

			ctx.arc(node.pos.x, node.pos.y, node.pos.r, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.font = "20px Georgia";
			ctx.fillStyle = "black";
			ctx.fillText(node.name, node.pos.x - node.pos.r * 2, node.pos.y + node.pos.r * 2);

			ctx.closePath();
		}
		for(const node of Renderer.scene.nodes){
			const ctx = Renderer.ctx;

			for(const link of node.links){
				ctx.beginPath();
				const linkedNode = Renderer.scene.findNodeByPath(link);
				ctx.moveTo(node.pos.x, node.pos.y);
				ctx.lineTo(linkedNode.pos.x, linkedNode.pos.y);
				ctx.stroke();
			}
		}
	}

	static InitEventListeners() {
		// setup canvas event listeners
		canvas.addEventListener('mousedown', (e) => { 
			Renderer.mouse.held = true;
			Renderer.mouse.pos_last.x = Renderer.ctx.offsetX;
			Renderer.mouse.pos_last.y = Renderer.ctx.offsetY;
		}, false);

		canvas.addEventListener('dblclick', (e) => {
			Renderer.mouse.pos.x = e.offsetX;
			Renderer.mouse.pos.y = e.offsetY
			for(const node of Renderer.scene.nodes){
				const dist = Math.sqrt(Math.pow(Math.abs(node.pos.x - this.mouse.pos.x), 2) + Math.pow(Math.abs(node.pos.y - this.mouse.pos.y), 2));
				if(dist < node.pos.r){
					node.onclick();
				} 
			}
		});

		canvas.addEventListener('mouseup', (e) => { 
			Renderer.mouse.held = false;
			Renderer.mouse.pos = { x: null, y: null };
			Renderer.mouse.pos_last = { x: null, y: null };
			Renderer.mouse.attached = null;
		}, false);

		canvas.addEventListener('mousemove', (e) => {
			if (Renderer.mouse.held) {
				Renderer.mouse.pos.x = e.offsetX;
				Renderer.mouse.pos.y = e.offsetY

				// Detect click on node
				for(const node of Renderer.scene.nodes){
					const dist = Math.sqrt(Math.pow(Math.abs(node.pos.x - Renderer.mouse.pos.x), 2) + Math.pow(Math.abs(node.pos.y - Renderer.mouse.pos.y), 2));
					if(dist < node.pos.r){
						node.attach();
					} 
				}

				if(!Renderer.mouse.attached) {
					// move map
					const diffX = Renderer.mouse.pos.x - Renderer.mouse.pos_last.x;
					const diffY = Renderer.mouse.pos.y - Renderer.mouse.pos_last.y;

					// translate all elements
					for(const node of Renderer.scene.nodes){
						node.translate(diffX, diffY)
					}
				}

				Renderer.mouse.pos_last.x = Renderer.mouse.pos.x;
				Renderer.mouse.pos_last.y = Renderer.mouse.pos.y;
			}
		}, false);
		canvas.addEventListener('wheel', (e) => {
			e.preventDefault();
			if(e.deltaY > 0){
				// zoom out
				// ctx.scale(0.95, 0.95);
				for(const node of Renderer.scene.nodes){
					node.scale(0.95);
				}
			} else {
				// zoom in
				// ctx.scale(1.05, 1.05);
				for(const node of Renderer.scene.nodes){
					node.scale(1.05);
				}
			}
		}, false);
	}
}

export { Node, Renderer, Scene }
