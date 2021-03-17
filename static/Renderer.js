"use strict;"

// Arrays to render (Note: not the same as the once in main.js)
const nodes = []; // all nodes objects are stored here
const links = []; // all links are stored here

/*
 * Every Node represents a file (NOT a folder). It can be linked
 * to other Nodes (all links are represented in a json file somewhere).
 * 
 * 
 * params: [0] String: absolute path to the file the node represents, 
 *         [1] Object: pos { x, y, r }
 *         [2] Object: appearance { color, options { visibleTitle: boolean } }
 *
 */
class Node {
    path       = null;
    filename   = null;
    pos        = null;
    appearance = null;

    constructor(path, pos, appearance) {
        console.log("renderer: node created");

        this.path       = this.tokenizePath(path).path;
        this.filename   = this.tokenizePath(path).filename;
        this.pos        = pos;
        this.appearance = appearance;

        nodes.push(this);
    }

    /* 
     * Responsible for disecting the different pieces of the path
     * Returns an object containing the path to the file and the filename
     */
    tokenizePath(path) {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        
        return { path, filename };
    }

    /*
     * The onclick event for the Node
     */
    onclick() {
        console.log("test");
    }
}

/*
 * Params: [0] ctx object to draw to
 */
const Render = ({width, height}, ctx) => {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, width, height);

    for(const node of nodes){
        ctx.beginPath();
        ctx.fillStyle = "green";

        ctx.arc(node.pos.x, node.pos.y, node.pos.r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        ctx.closePath();
    }
}

export default { Node, Render }