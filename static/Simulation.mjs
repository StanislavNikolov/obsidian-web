"use strict;"

const canvasDOM = document.getElementById('canvas');


class Graph {
	nodes = [];

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

	calculateForces(){
		for(const node of this.nodes){
			const links = node.links;
			for(const link of links){
				const linkedNode = this.findNodeByPath(link);

				const distX = node.pos.x - linkedNode.pos.x;
				const distY = node.pos.y - linkedNode.pos.y;
				const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

				// force between linked nodes that are more than 200 apart
				if(dist > 200){
					linkedNode.vel_x += distX * (node.weight / 1000);
					linkedNode.vel_y += distY * (node.weight / 1000);
				}
				// repell linked nodes that are 150 apart
				else if(dist < 150) {
					linkedNode.vel_x -= (1000 / distX) * (node.weight / 1000);
					linkedNode.vel_y -= (1000 / distY) * (node.weight / 1000);
				}
			}
		}
		for(const node of this.nodes){
			for(const _node of this.nodes){
				if(node !== _node && !node.links.includes(_node.path) && !_node.links.includes(node.path)){
					const distX = node.pos.x - _node.pos.x;
					const distY = node.pos.y - _node.pos.y;
					const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
					
					// repell unlinked nodes that are 300 apart
					if(dist < 200){
						_node.vel_x -= (1000 / distX) * (node.weight / 1000);
						_node.vel_y -= (1000 / distY) * (node.weight / 1000);
					}
				}
			}
		}
		for(const node of this.nodes){
			
			node.pos.x += node.vel_x / node.weight;
			node.pos.y += node.vel_y / node.weight;

			// friction
			node.vel_x *= 0.9;
			node.vel_y *= 0.9;
		}
	}
}


/*
 * Every Node represents a file (not a folder). It can be linked
 * to other Nodes (all nodes and their links are represented in graph.json).
 */
class Node {
	links      = null;
	path       = null;
	name       = null;
	pos        = null;
	appearance = null;
	vel_x      = null;
	vel_y      = null;
	weight     = null;

	constructor({path, name}, links, pos, appearance) {
		this.path       = path;
		this.name       = name;
		this.links      = links;
		this.pos        = pos;
		this.pos.r      = 20 + links.length * 5;
		this.appearance = appearance;
		this.weight     = 100 + links.length * 20;
	}

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
	static graph = null;
	
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

	static Init(ctx, { width, height }, graph){
		Renderer.ctx = ctx;
		Renderer.width = width;
		Renderer.height = height;
		Renderer.graph = graph;

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

		// Render links
		for(const node of Renderer.graph.nodes){
			const ctx = Renderer.ctx;

			for(const link of node.links){
				ctx.beginPath();
				const linkedNode = Renderer.graph.findNodeByPath(link);
				ctx.moveTo(node.pos.x, node.pos.y);
				ctx.lineTo(linkedNode.pos.x, linkedNode.pos.y);
				ctx.stroke();
			}
		}

		// Render nodes
		for(const node of Renderer.graph.nodes){
			const ctx = Renderer.ctx;

			ctx.beginPath();
			ctx.fillStyle = node.appearance.color;

			ctx.arc(node.pos.x, node.pos.y, node.pos.r, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.font = "20px Georgia";
			ctx.fillStyle = "black";
			ctx.fillText(node.name, node.pos.x - node.name.length * 4, node.pos.y + Math.max(node.pos.r * 2, 30));

			ctx.closePath();
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
			for(const node of Renderer.graph.nodes){
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
				for(const node of Renderer.graph.nodes){
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
					for(const node of Renderer.graph.nodes){
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
				for(const node of Renderer.graph.nodes){
					node.scale(0.95);
				}
			} else {
				// zoom in
				// ctx.scale(1.05, 1.05);
				for(const node of Renderer.graph.nodes){
					node.scale(1.05);
				}
			}
		}, false);
	}
}

export { Node, Renderer, Graph }
