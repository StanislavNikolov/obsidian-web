"use strict;"

const canvasDOM = document.getElementById('canvas');

// Scene with static methods for managing bodies and the canvas
class Scene {
    // Arrays to render (Note: not the same as the once in main.js)
    static nodes = [];
    static links = [];

    // pos: obj {x, y}, attached: obj (Node), held: boolean
    static mouse = { pos: { x: null, y: null }, attached: null, held: false };

    static ctx = null;

    constructor(ctx) {
        Scene.ctx = ctx;
        // setup canvas event listeners
        canvas.addEventListener('mousedown', (e) => { 
            Scene.mouse.held = true;
         }, false);

        canvas.addEventListener('mouseup', (e) => { 
            Scene.mouse.held = false;
            Scene.mouse.pos = { x: null, y: null };
            Scene.mouse.attached = null;
        }, false);
        canvas.addEventListener('mousemove', (e) => {
            Scene.mouse.pos.x = e.offsetX;
            Scene.mouse.pos.y = e.offsetY

            if (Scene.mouse.held && !Scene.mouse.attached) {
                // Detect click on node
                for(const node of Scene.nodes){
                    const dist = Math.sqrt(Math.pow(Math.abs(node.pos.x - Scene.mouse.pos.x), 2) + Math.pow(Math.abs(node.pos.y - Scene.mouse.pos.y), 2));
                    if(dist < node.pos.r){
                        node.onclick();
                    } 
                }
            }
        }, false);
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if(e.deltaY > 0){
                // zoom out
                ctx.scale(0.95, 0.95);
            } else {
                // zoom in
                ctx.scale(1.05, 1.05);
            }
            

        }, false);
    }
    add(node) {
        Scene.nodes.push(node);
    }
    updateMouse() {
        if(Scene.mouse.attached) {
            Scene.mouse.attached.pos.x = Scene.mouse.pos.x;
            Scene.mouse.attached.pos.y = Scene.mouse.pos.y;
        }        
    }
}

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
        this.path       = this.tokenizePath(path).path;
        this.filename   = this.tokenizePath(path).filename;
        this.pos        = pos;
        this.appearance = appearance;
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
        Scene.mouse.attached = this;
    }
}

/*
 * Params: [0] ctx object to draw to
 */
const Render = () => {
    const ctx = Scene.ctx;
    const width = canvasDOM.width;
    const height = canvasDOM.height;

    ctx.fillStyle = "#424242";
    ctx.fillRect(0, 0, width, height);

    for(const node of Scene.nodes){
        ctx.beginPath();

        ctx.fillStyle = node.appearance.color.basic;
        ctx.strokeStyle = node.appearance.color.basic;
        if(Scene.mouse.attached == node){
            ctx.strokeStyle = node.appearance.color.selected;
            ctx.fillStyle = node.appearance.color.selectedFill;
        }

        ctx.arc(node.pos.x, node.pos.y, node.pos.r, 0, 2 * Math.PI);
        ctx.font = "20px Arial";
        ctx.fillText(node.filename, node.pos.x - 20, node.pos.y + node.pos.r * 2);
        
        ctx.stroke();
        ctx.fill();

        ctx.closePath();
    }
}

export default { Node, Render, Scene }