"use strict";

var gl;
var over = 0;
var speed = 100;
var saves = 0;
var label;

var ballX = 0, ballY = 0, xVel = .005, yVel = -.005;
var dispX, dispY, dispXLoc, dispYLoc;
var padDir = 0;

var numVertices = 73;
var numPaddleVertices= 4;
var colorLoc;

var bufferId;

var bricks = [];
var numBricks = 10;

window.onload = function init()
{
	
	var c;
	for(c = 0; c < numBricks; c ++){
		var a = {
			'x': -.95, 'y':1.5, 'hits': 1
		}
		a.x = a.x + (.35)*c;
		console.log(a.x, c)
		a.y = 1.5;
		a.hits = 1;
		bricks[c] = a;
	}
	
    var canvas = document.getElementById( "gl-canvas" );
	label = document.getElementById("saves" );
    console.log(label);
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
	//variables used to generate vertecies
    var i, x, y;
	var rad = 0.05;
	var vertices = [];
	vertices.push(vec2(0,0));
	
	//Generate vertices for ball
	for(i=0;i<=360;i+=5){
		x = Math.cos(i*Math.PI/180)*rad;
		y = Math.sin(i*Math.PI/180)*rad;
		vertices.push(vec2(x,y));
	}
	
	//vertices for paddle
	vertices.push(vec2(.125, -1));
	vertices.push(vec2(-.125, -1));
	vertices.push(vec2(-.125, -.95));
	vertices.push(vec2(.125, -.95));
    
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU 
    bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	

	colorLoc = gl.getUniformLocation( program, "color" );
	dispXLoc = gl.getUniformLocation(program, "dispX");
	dispYLoc = gl.getUniformLocation(program, "dispY");

	//Ball Speed Up function
	document.getElementById("up").onclick = function(){
		if(xVel < 0){xVel-= .01;}
		else if(xVel > 0){xVel += .01;}
		if(yVel < 0){yVel -= .01;}
		else if(yVel > 0){yVel += .01;}
		console.log(xVel, ", ", yVel);
	}
	
	//Ball Speed Down function
	document.getElementById("down").onclick = function(){
		if(xVel < 0){
			if(xVel + .01 > -.005){
				xVel = -.005;
			}
			else{
				xVel+= .01;
			}
		}
		else if(xVel > 0){
			if(xVel - .01 < .005){
				xVel = .005;
			}
			else{
				xVel -= .01;
			}
		}
		if(yVel < 0){
			if(yVel + .01 > -.005){
				yVel = -.005;
			}
			else{
				yVel += .01;
			}
		}
		else if(yVel > 0){
			if(yVel - .01 < .005){
				yVel = .005
			}
			else{
				yVel -= .01;
			}
		}
		console.log(xVel, ", ", yVel);
	}
	
	document.getElementById("left").onclick = function(){
		if(padDir - .1 <= -.95){
			padDir = -.95;
		}
		else
			padDir -= 0.1;
	}
	
	document.getElementById("right").onclick = function(){
		if(padDir + .1 >= .95){
			padDir = .95;
		}
		else
			padDir += 0.1;
	}
	
    render();
};


function render() {
	if(over == 0){
		
		gl.clear( gl.COLOR_BUFFER_BIT );
		//Game over
		if(ballY <= -.98){
			xVel = 0;
			yVel = 0;
			over = 1;
			alert("Game Over!");
		}
	
		//Figure out ball displacement
		if(ballX + xVel >= .95){
			ballX = .95;
			xVel = xVel*(-1);
		}
		else if(ballX + xVel <= -.95){
			ballX = -.95;
			xVel = xVel*(-1);
		}
		else{
			ballX += xVel;
		}
		if(ballY + yVel >= .95){
			ballY = .95;
			yVel = yVel*(-1);
		}
		else if(ballY + yVel <= -.9){
			if(ballX >= padDir -.125 && ballX <= padDir + .125){
				console.log(saves);
				ballY = -.9;
				yVel = yVel*(-1);
				saves += 1;
				label.innerHTML = "Bounces: " + saves;
			}
			else{
				ballY += yVel;
			}
		}
		else{
			ballY += yVel;
		}
	
	
		//Ball
		gl.uniform4fv( colorLoc, vec4(0.4, 0.4, 1.0, 1.0) );
		dispX = ballX;
		dispY = ballY;
		gl.uniform1f(dispXLoc, dispX);
		gl.uniform1f(dispYLoc, dispY);
		gl.drawArrays( gl.TRIANGLE_FAN, 0, numVertices + 1);
	
		//Paddle
		gl.uniform4fv( colorLoc, vec4(1.0, 0.4, 0.4, 1.0) );
		dispX = padDir;
		dispY = 0;	
		gl.uniform1f(dispXLoc, dispX);
		gl.uniform1f(dispYLoc, dispY);
		gl.drawArrays( gl.TRIANGLE_FAN, numVertices + 1, numPaddleVertices);
	
		//Brick
		var i;
		for(i = 0; i < numBricks; i ++){
			//console.log(bricks[i]);
			gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
			gl.uniform1f(dispXLoc, bricks[i].x);
			gl.uniform1f(dispYLoc, bricks[i].y);
			gl.drawArrays( gl.TRIANGLE_FAN, numVertices + 1, numPaddleVertices);
		}
	
		setTimeout(
			function () {requestAnimFrame( render );},
			speed
		);
	}
}