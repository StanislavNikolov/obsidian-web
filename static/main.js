"use strict;"

import Renderer from './Renderer.js';

// Setup
const canvasDOM = document.getElementById('canvas');
canvasDOM.width = window.innerWidth;
canvasDOM.height = window.innerHeight;
const ctx = canvas.getContext('2d');

// Generate sample Nodes
(() => {
  console.log("main.js: generate sample nodes..")
  for( let i = 0; i < 5; i ++ ){
    const x = Math.floor(Math.random() * canvasDOM.width);
    const y = Math.floor(Math.random() * canvasDOM.height);
    const r = 30;

    const node = new Renderer.Node("test/nice", { x, y, r }, { color:"green", options: { visibleTitle: false } } );
  }
})();

Renderer.Render({ width: canvasDOM.width, height: canvasDOM.height }, ctx);