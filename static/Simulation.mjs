"use strict;"

const canvasDOM = document.getElementById('canvas');

// Scene with static methods for managing bodies and the canvas
class Scene {

	// Arrays to render
	static nodes = [];
	static links = [];

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

	static ctx = null;

	static Init(ctx) {
		Scene.ctx = ctx;

		// setup canvas event listeners
		canvas.addEventListener('mousedown', (e) => { 
			Scene.mouse.held = true;
			Scene.mouse.pos_last.x = ctx.offsetX;
			Scene.mouse.pos_last.y = ctx.offsetY;
		}, false);

		canvas.addEventListener('dblclick', (e) => {
			Scene.mouse.pos.x = e.offsetX;
			Scene.mouse.pos.y = e.offsetY
			for(const node of Scene.nodes){
				const dist = Math.sqrt(Math.pow(Math.abs(node.pos.x - Scene.mouse.pos.x), 2) + Math.pow(Math.abs(node.pos.y - Scene.mouse.pos.y), 2));
				if(dist < node.pos.r){
					node.onclick();
				} 
			}
		});

		canvas.addEventListener('mouseup', (e) => { 
			Scene.mouse.held = false;
			Scene.mouse.pos = { x: null, y: null };
			Scene.mouse.pos_last = { x: null, y: null };
			Scene.mouse.attached = null;
		}, false);
		canvas.addEventListener('mousemove', (e) => {
			if (Scene.mouse.held) {
				Scene.mouse.pos.x = e.offsetX;
				Scene.mouse.pos.y = e.offsetY

				// Detect click on node
				for(const node of Scene.nodes){
					const dist = Math.sqrt(Math.pow(Math.abs(node.pos.x - Scene.mouse.pos.x), 2) + Math.pow(Math.abs(node.pos.y - Scene.mouse.pos.y), 2));
					if(dist < node.pos.r){
						node.attach();
					} 
				}

				if(!Scene.mouse.attached) {
					// move map
					const diffX = Scene.mouse.pos.x - Scene.mouse.pos_last.x;
					const diffY = Scene.mouse.pos.y - Scene.mouse.pos_last.y;

					// translate all elements
					for(const node of Scene.nodes){
						node.translate(diffX, diffY)
					}
				}

				Scene.mouse.pos_last.x = Scene.mouse.pos.x;
				Scene.mouse.pos_last.y = Scene.mouse.pos.y;
			}
		}, false);
		canvas.addEventListener('wheel', (e) => {
			e.preventDefault();
			if(e.deltaY > 0){
				// zoom out
				// ctx.scale(0.95, 0.95);
				for(const node of Scene.nodes){
					node.scale(0.95);
				}
			} else {
				// zoom in
				// ctx.scale(1.05, 1.05);
				for(const node of Scene.nodes){
					node.scale(1.05);
				}
			}


		}, false);
	}
	static add(node) {
		Scene.nodes.push(node);
	}
	static updateMouse() {
		if(Scene.mouse.attached) {
			Scene.mouse.attached.pos.x = Scene.mouse.pos.x;
			Scene.mouse.attached.pos.y = Scene.mouse.pos.y;
		}        
	}
	static findNodeByPath(path) {
		for(const node of Scene.nodes){
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
	name   = null;
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
		Scene.mouse.attached = this;
	}

	draw(ctx){
		ctx.beginPath();
		ctx.fillStyle = this.appearance.color;

		ctx.arc(this.pos.x, this.pos.y, this.pos.r, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		ctx.font = "20px Georgia";
		ctx.fillStyle = "black";
		ctx.fillText(this.name, this.pos.x - this.pos.r * 2, this.pos.y + this.pos.r * 2);

		ctx.closePath();
	}
	drawLinks(ctx){
		for(const link of this.links){
			ctx.beginPath();
			const node = Scene.findNodeByPath(link);
			ctx.moveTo(this.pos.x, this.pos.y);
			ctx.lineTo(node.pos.x, node.pos.y);
			ctx.stroke();
		}
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

/*
 * Params: [0] ctx object to draw to
 */
const Render = () => {
	const ctx = Scene.ctx;
	const width = canvasDOM.width;
	const height = canvasDOM.height;

	ctx.fillStyle = "gray";
	ctx.fillRect(0, 0, width, height);

	for(const node of Scene.nodes){
		node.draw(ctx);
		node.drawLinks(ctx);
	}
}

export default { Node, Render, Scene }
