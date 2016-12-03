"use strict";

var gl;
var over = 0;
var speed = 50;
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
var numBricks = 50;


window.onload = function init()
{
	
	var c, r;
	for(c = 0; c < numBricks/5; c ++){
		for(r = 0; r < 5; r++){
			var brick = {
				'x': -.9, 'y':.95, 'hits': 1
			}
			brick.x = brick.x + (.20)*c;
			brick.y = brick.y + (-.1)*r;
			brick.hits = 1;
			bricks[c + (r*10)] = brick;
		}
	}
	
    var canvas = document.getElementById( "gl-canvas" );
	label = document.getElementById("saves" );
 
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
	//variables used to generate vertecies
    var i, x, y;
	var rad = 0.03;
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
    
	//vertecies for brick
	vertices.push(vec2(.1, .05));
	vertices.push(vec2(-.1, .05));
	vertices.push(vec2(-.1, -.05));
	vertices.push(vec2(.1, -.05));
	
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

function colide(){
	var i;
	for(i = 0; i < numBricks; i++){
		if( bricks[i].hits >=1 && ballY + yVel >= bricks[i].y - .075 && ballX > bricks[i].x - .075 && ballX < bricks[i].x + .075){
			console.log("Ball(x,y): ("+ballX+","+ballY+")");
			console.log("Brick(x,y): ("+bricks[i].x+","+bricks[i].y+")");
			ballY = bricks[i].y - .075;
			yVel = yVel*-1;
			bricks[i].hits --;
		}
	}
}

function render() {
	if(over == 0){
		
		gl.clear( gl.COLOR_BUFFER_BIT );
		
		colide();
		//Game over
		if(ballY <= -.98){
			xVel = 0;
			yVel = 0;
			over = 1;
			alert("Game Over!");
		}
	
		//Figure out ball displacement
		if(ballX + xVel >= .97){
			ballX = .97;
			xVel = xVel*(-1);
		}
		else if(ballX + xVel <= -.97){
			ballX = -.97;
			xVel = xVel*(-1);
		}
		else{
			ballX += xVel;
		}
		if(ballY + yVel >= .97){
			ballY = .97;
			yVel = yVel*(-1);
		}
		else if(ballY + yVel <= -.92){
			if(ballX >= padDir -.125 && ballX <= padDir + .125){
				ballY = -.92;
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
			if(bricks[i].hits >= 1){
				//console.log(bricks[i].x - .1);
				//gl.uniform4fv( colorLoc, vec4(Math.random(), Math.random(), Math.random(), 1.0) );
				gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
		
				gl.uniform1f(dispXLoc, bricks[i].x);
				gl.uniform1f(dispYLoc, bricks[i].y);
				gl.drawArrays( gl.TRIANGLE_FAN, numVertices +5, 4);
			}
		}
		
		//Ball
		gl.uniform4fv( colorLoc, vec4(0.4, 0.4, 1.0, 1.0) );
		dispX = ballX;
		dispY = ballY;
		gl.uniform1f(dispXLoc, dispX);
		gl.uniform1f(dispYLoc, dispY);
		gl.drawArrays( gl.TRIANGLE_FAN, 0, numVertices + 1);
	
		setTimeout(
			function () {requestAnimFrame( render );},
			speed
		);
	}
}