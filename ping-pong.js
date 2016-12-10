"use strict";

var gl;
var over = 0;
var speed = 10;
var saves = 0;
var label;
var lifes_label;
var reset = 0;
var level = 0;
var hit_bricks = 0;

var ballX = 0, ballY = 0, xVel = -.01, yVel = .01;
var dispX, dispY, dispXLoc, dispYLoc;
var padDir = 0;
var num_lifes = 3;

var numVertices = 73;
var numPaddleVertices= 4;
var colorLoc;

var bufferId;

var bricks_levels = [];
var numBricks = 50;
var score = 0;
var power_ups = ["life","explode"];

//var brickTexture;
//var brickImage;
//hello there

//function initTextures() {
//  brickTexture = gl.createTexture();
//  brickImage = new Image();
//  brickImage.onload = function() { handleTextureLoaded(brickImage, brickTexture); }
//  brickImage.src = "brick.jpg";
//}

//function handleTextureLoaded(image, texture) {
//  gl.bindTexture(gl.TEXTURE_2D, texture);
//  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
//  gl.generateMipmap(gl.TEXTURE_2D);
//  gl.bindTexture(gl.TEXTURE_2D, null);
//}

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );
	label = document.getElementById("saves" );
    lifes_label = document.getElementById("lifes");
    
	
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	//Key listener for paddle control
	window.addEventListener("keydown", keydownHandler, false);
	function keydownHandler(e){
		if(e.keyCode == 37){
			if(padDir - .1 <= -.95){
				padDir = -.95;
			}
			else{
				padDir -= 0.1;
			}
		}
		else if(e.keyCode == 39){
			if(padDir + .1 >= .95){
				padDir = .95;
			}
			else{
				padDir += 0.1;
			}
		}
        else if(e.keyCode == 32 && reset == 1){
            xVel = 0;
            yVel = .01;
            reset = 0;
        }
        
        if (reset == 1) {
            ballX = padDir;
        }
	}
	
    //Texture
    //var cubeVerticesTextureCoordBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
  
	//var textureCoordinates = [0.0,  0.0, 1.0,  0.0,	1.0,  1.0,	0.0,  1.0];
	//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
	//var textureCoordAttribute = gl.getAttribLocation(program, "a_texCoord");
	//gl.enableVertexAttribArray(textureCoordAttribute);
	//gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
	
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, brickTexture);
	//gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
	
	//Generating Bricks
	var c, r, l;
    for (l = 1; l < 10; l++) {
        var bricks = [];
        for(c = 0; c < numBricks/5; c ++){
            for(r = 0; r < 5; r++){
                var brick = {
                    'x': -.9, 'y':.95, 'hits': 1
                }
                brick.x = brick.x + (.20)*c;
                brick.y = brick.y + (-.1)*r;
                brick.hits = l;
                bricks[c + (r*10)] = brick;
			
            }
        }
        bricks_levels.push(bricks);
    }
        //console.log(bricks_levels[2])
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

	
	
    render();
};

function p_up() {
    var x = Math.round(Math.random()*100);
    console.log(x);
    if ( x % 2 == 0) {
        var y = Math.round(Math.random()*1);
        console.log(y);
        if ( y == 0) {
            num_lifes = num_lifes + 1;
            lifes_label.innerHTML = "Lives: " + num_lifes;
        }
    }
};

function colide(){
	var i;
	var radius = .03;
	var len = .1;
	var height = .05;
	for(i = 0; i < numBricks; i++){
		//hit from below
        if( bricks_levels[level][i].hits >=1 && ballY + yVel >= bricks_levels[level][i].y - .08
			&& ballX > bricks_levels[level][i].x - .103 && ballX < bricks_levels[level][i].x + .103
			&& ballY < bricks_levels[level][i].y - .08){
				ballY = bricks_levels[level][i].y - .08;
				yVel = yVel*-1;
				bricks_levels[level][i].hits --;
				score += 10;
				label.innerHTML = "Score: " + score;
                p_up();
            
                //counting the number of hit bricks
                if(bricks_levels[level][i].hits == 0){
                    hit_bricks = hit_bricks + 1;
                }
                    
		}
		//hit from top
		if( bricks_levels[level][i].hits >=1 && ballY - radius > bricks_levels[level][i].y + height
			&& ballY - radius + yVel <= bricks_levels[level][i].y + height
			&& ballX + radius + xVel >= bricks_levels[level][i].x - len
			&& ballX - radius + xVel <= bricks_levels[level][i].x + len){
				//console.log("Top hit, Brick #" + i);
				ballY = bricks_levels[level][i].y + radius + height;
				yVel = yVel*-1;
				bricks_levels[level][i].hits--;
				score += 10;
				label.innerHTML = "Score: " + score;
                p_up();
            
                if(bricks_levels[level][i].hits == 0){
                    hit_bricks = hit_bricks + 1;
                }

            
		}
	
		//hit from right
		if( bricks_levels[level][i].hits >=1
			&& ballX - radius > bricks_levels[level][i].x + len
			&& ballX - radius + xVel <= bricks_levels[level][i].x + len
			&& ballY + radius + yVel >= bricks_levels[level][i].y - height
			&& ballY - radius + yVel <= bricks_levels[level][i].y + height){
				//console.log("Right side hit, Brick #" + i);
				ballX = bricks_levels[level][i].x + len + radius;
				xVel = xVel*-1;
				bricks_levels[level][i].hits--;
				score += 10;
				label.innerHTML = "Score: " + score;
                p_up();
            
                if(bricks_levels[level][i].hits == 0){
                    hit_bricks = hit_bricks + 1;
                }

		}
		//hit from left
		if( bricks_levels[level][i].hits >=1
			&& ballX + radius < bricks_levels[level][i].x - len
			&& ballX + radius + xVel >= bricks_levels[level][i].x - len
			&& ballY + radius + yVel >= bricks_levels[level][i].y - height
			&& ballY - radius + yVel <= bricks_levels[level][i].y + height){
				//console.log("Left side hit, Brick #" + i);
				ballX = bricks_levels[level][i].x - len - radius;
				xVel = xVel*-1;
				bricks_levels[level][i].hits--;
				score += 10;
				label.innerHTML = "Score: " + score;
                p_up();
            
                if(bricks_levels[level][i].hits == 0){
                    hit_bricks = hit_bricks + 1;
                }

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
            num_lifes = num_lifes - 1
            lifes_label.innerHTML = "Lives: " + num_lifes;
            if (num_lifes == 0) {
                over = 1;
                alert("Game Over!");
            }
            else {
                ballY = -.9;
                ballX = padDir;
                xVel = 0;
                yVel = 0;
                reset = 1;
            }
		}
        
        //new level
        if (hit_bricks == numBricks) {
            level = level + 1;
            hit_bricks = 0;
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
		//Hitting Paddle
		else if(ballY + yVel <= -.92){
			if(ballX + xVel>= padDir -.125 && ballX <= padDir + .125){
				ballY = -.92;
				yVel = yVel*(-1);
				saves += 1;
				//Right Side of paddle
				if(ballX + xVel< padDir - .1){xVel = -.025;}
				else if(ballX + xVel< padDir - .05){xVel = -.015;}
				else if(ballX + xVel< padDir ){xVel = -.01;}
				else if(ballX + xVel> padDir + .1){xVel = .025;}
				else if(ballX + xVel> padDir + .05){xVel = .015;}
				else{xVel = .01};
    
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
            if(bricks_levels[level][i].hits >= 1){
				gl.uniform4fv( colorLoc, vec4(bricks_levels[level][i].hits*.2, bricks_levels[level][i].hits*.2, 0, 1.0) );
				
				gl.uniform1f(dispXLoc, bricks_levels[level][i].x);
				gl.uniform1f(dispYLoc, bricks_levels[level][i].y);
				gl.drawArrays( gl.TRIANGLE_FAN, numVertices +5, 4);
                gl.uniform4fv(colorLoc, vec4(0,0,0,1));
                gl.drawArrays(gl.LINE_LOOP,numVertices+5,4);
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