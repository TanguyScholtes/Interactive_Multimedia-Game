/*
* Multimédia Interactif
* HEPL 2014 - 2015
* Cours de Pierre-Antoine Delnatte
*
* Game - Space Invaders
* By Tanguy SCHOLTES, 3ième Infographie 2384
*
* game.js
*/

(function() {

    "use strict";

    var app = {
    	"elt": null, //the canvas element
    	"context": null, //the drawing context of canvas
    	"width": 0,
    	"height": 0,
        "utils": {},
    };

    app.utils.isCanvasSupported = function($canvasElt){
    	return !!$canvasElt.getContext;
    };

    app.setup = function(){

    	this.canvas = document.querySelector("#game");

    	//detect support
    	if(!app.utils.isCanvasSupported(this.canvas)){
    		return console.error("Canvas isn't supported");
    	}
    	console.log("Canvas supported");

    	//app.source setup
    	this.context = this.canvas.getContext("2d");
    	this.width = this.canvas.width;
    	this.height = this.canvas.height;

        var game = new window.Invaders(this);
    };

    app.setup();
    
}) ();