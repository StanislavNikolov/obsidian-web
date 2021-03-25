"use strict;"

const canvasDOM = document.getElementById('canvas');


class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	// all function below return this so that they can be chained together
	// for example, a.add(b).mul(0.97)

	add(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	sub(other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	mul(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	len = () => Math.sqrt(this.x*this.x + this.y*this.y);

	norm() {
		const len = this.len();
		this.x /= len;
		this.y /= len;
		return this;
	}

	isShit() { // TODO find a better name that means "either null or NaN"
		return this.x == null || this.y == null || isNaN(this.x) || isNaN(this.y);
	}

	static dist(a, b) {
		return Math.sqrt((a.x-b.x) * (a.x-b.x) + (a.y-b.y) * (a.y-b.y));
	}
}


/*
 * Every Node represents a file (not a folder). It can be linked
 * to other Nodes (all nodes and their links are represented in graph.json).
 */
class Node {
	constructor(path, name, links, pos, appearance) {
		// TODO links should be a property of the graph, not the node
		this.path   = path;
		this.name   = name;
		this.links  = links;

		this.vel    = new Vec(0, 0);
		this.pos    = pos;
		this.area   = 20 + links.length * 150; // area grows as the node gets more "important"
		this.radius = Math.sqrt(this.area / Math.PI);

		this.appearance = appearance;
	}

	onclick() {
		console.log("dblclick");
		window.location.href = this.path;
	}
}


class Graph {
	//static G = 0.00000001;
	//static K = 1.0;
	static G = 0.000000001; // converge force
	static K = 0.5; // repell force

	nodes = [];

	add(node) {
		this.nodes.push(node);
	}

	findNodeByPath(path) {
		// TODO O(n) complexity, do it in O(1) with maps
		for(const node of this.nodes) {
			if(node.path === path) return node;
		}
	}

	// O(n^2) complexity, can be done faster with smarter space partitioning
	calculateForces() {
		for(const node of this.nodes) {
			node.vel.mul(0);
		}

		// make nodes converge if connected
		for(const node of this.nodes) {
			const neighbours = node.links.map(l => this.findNodeByPath(l));

			for(const nei of neighbours) {
				const dist = Vec.dist(node.pos, nei.pos);
				const neiPosCopy = new Vec(nei.pos.x, nei.pos.y);

				const force = neiPosCopy.sub(node.pos).norm(); // normalized, |force| = 1
				force.mul(Graph.G * node.area * nei.area * (dist*dist));

				node.vel.add(force);
			}
		}

		// make nodes repell each other
		for(const A of this.nodes) {
			// A is the node to be changed
			for(const B of this.nodes) {
				if(A === B) continue;

				const dist = Vec.dist(A.pos, B.pos);
				const BPosCopy = new Vec(B.pos.x, B.pos.y);

				const force = BPosCopy.sub(A.pos).norm(); // normalized, |force| = 1
				force.mul(-Graph.K * A.area * B.area / Math.pow(dist, 2.2));

				A.vel.add(force);
			}
		}

		for(const node of this.nodes) {
			if(node.vel.len() > 100) node.vel.norm().mul(100);
			node.pos.add(node.vel);
		}
	}
}



class Mouse {
	pos = new Vec(null, null);
	lastPos = new Vec(null, null);
	attached = null;
	held = false;
}



class Renderer {
	translation = new Vec(0, 0);

	scale = 1;
	scaleDelta = 0;

	mouse = new Mouse();

	constructor(ctx, width, height, graph) {
		this.ctx = ctx;
		this.width = width;
		this.height = height;
		this.graph = graph;

		this.InitEventListeners();
	}

	updateMouse() {
		this.scale += this.scaleDelta;
		this.scaleDelta *= 0.7;

		if(this.mouse.attached) {
			const m = this.mouseAfterPixTrans();
			this.mouse.attached.pos.x = m.x;
			this.mouse.attached.pos.y = m.y;
		}

	}

	// returns translated coors from simulation to after-transformation pixel space
	mouseAfterPixTrans() {
		//console.log(this.translation);
		const simMousePos = new Vec(this.mouse.pos.x, this.mouse.pos.y);
		//simMousePos.add(this.translation).mul(this.scale);
		//simMousePos.add(this.translation).mul(1/this.scale);
		//simMousePos.mul(1/this.scale).add(this.translation);
		//simMousePos.mul(this.scale).add(this.translation);
		//console.log(this.scale);
		simMousePos.x -= this.translation.x;
		simMousePos.y -= this.translation.y;
		simMousePos.mul(1/this.scale);
		return simMousePos;
	}

	draw() {
		const ctx = this.ctx;

		// clear screen
		ctx.fillStyle = "gray";
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.save();
		ctx.translate(this.translation.x, this.translation.y);
		ctx.scale(this.scale, this.scale);

		// Render links
		ctx.strokeStyle = "black";
		for(const node of this.graph.nodes){
			for(const link of node.links){
				ctx.beginPath();
				const linkedNode = this.graph.findNodeByPath(link);
				ctx.moveTo(node.pos.x, node.pos.y);
				ctx.lineTo(linkedNode.pos.x, linkedNode.pos.y);
				ctx.stroke();
			}
		}

		// Render nodes
		ctx.font = "20px Georgia";
		for(const node of this.graph.nodes){

			ctx.beginPath();
			ctx.arc(node.pos.x, node.pos.y, node.radius, 0, 2 * Math.PI);
			ctx.fillStyle = node.appearance.color;
			ctx.fill();

			ctx.beginPath();
			ctx.fillStyle = "black";
			ctx.fillText(node.name, node.pos.x - node.name.length * 4, node.pos.y + Math.max(node.radius * 2, 30));
		}

		// Debug; render velocities
		ctx.strokeStyle = "red";
		for(const node of this.graph.nodes){
			ctx.beginPath();
			ctx.moveTo(node.pos.x, node.pos.y);
			ctx.lineTo(node.pos.x + node.vel.x * 10, node.pos.y + node.vel.y * 10);
			ctx.stroke();
		}

		ctx.restore();
	}

	InitEventListeners() {
		// setup canvas event listeners
		canvas.addEventListener('mousedown', (e) => {
			this.mouse.held = true;
			this.mouse.lastPos.x = this.ctx.offsetX;
			this.mouse.lastPos.y = this.ctx.offsetY;
		}, false);

		canvas.addEventListener('dblclick', (e) => {
			this.mouse.pos.x = e.offsetX;
			this.mouse.pos.y = e.offsetY
			for(const node of this.graph.nodes) {
				const dist = Vec.dist(node.pos, this.mouseAfterPixTrans());
				if(dist < node.radius){
					node.onclick();
				}
			}
		});

		canvas.addEventListener('mouseup', (e) => {
			this.mouse.held = false;
			this.mouse.pos.mul(0);
			this.mouse.lastPos.mul(0);
			this.mouse.attached = null;
		}, false);

		canvas.addEventListener('mousemove', (e) => {
			this.mouse.pos.x = e.offsetX;
			this.mouse.pos.y = e.offsetY;

			if (this.mouse.held) {
				// Detect click on node
				for(const node of this.graph.nodes){
					const dist = Vec.dist(node.pos, this.mouseAfterPixTrans());
					if(dist < node.radius){
						this.mouse.attached = node;
					}
				}

				if(!this.mouse.attached && !this.mouse.lastPos.isShit()) { // move map
					const diff = new Vec(
						this.mouse.pos.x - this.mouse.lastPos.x,
						this.mouse.pos.y - this.mouse.lastPos.y
					);
					this.translation.add(diff);
				}
			}

			this.mouse.lastPos.x = this.mouse.pos.x;
			this.mouse.lastPos.y = this.mouse.pos.y;
		}, false);

		canvas.addEventListener('wheel', (e) => {
			e.preventDefault();
			if(e.deltaY > 0){ // zoom out
				this.scaleDelta -= 0.02;
			} else { // zoom in
				this.scaleDelta += 0.02;
			}
		}, false);
	}
}

export { Vec, Node, Renderer, Graph };
