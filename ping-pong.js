"use strict";

var gl;
var over = 0;
var speed = 10;
var saves = 0;
var label;
var lifes_label;
var level_label;
var reset = 1;
var level = 0;
var hit_bricks = 0;

var ballX = 0, ballY = 0, xVel = -.01, yVel = .013;
var dispX, dispY, dispXLoc, dispYLoc;
var padDir = 0;
var num_lifes = 3;

var ballVertices = [];
var brickVertices = [];
var paddleVertices = [];
var colorLoc;
var vPositionLoc;

var ballBuffer;
var brickBuffer;
var paddleBuffer;
var tBuffer;

var bricks_levels = [];
var numBricks = [];
var score = 0;
var power_ups = ["life","explode"];

var texCoord = [];
var textureCoordLoc;
var texture;
//var textureCoordAttribute;
//var textureCoordData = [];
var program;


function initTexture() {
    texture = gl.createTexture();
    texture.image = new Image();
    texture.image.src = "brick.jpg";
    texture.image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	
	//  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
	
	label = document.getElementById("saves" );
    lifes_label = document.getElementById("lifes");
	level_label = document.getElementById("level");

	
	//  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
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
            yVel = .015;
            reset = 0;
        }
	}
	
	
	//Level 1
	var levels = [];
	var level_1 = [];
	level_1.push([0,0,1,0]);
	level_1.push([1,0,1,0]);
	level_1.push([2,0,1,0]);
	level_1.push([3,0,1,0]);
	level_1.push([4,0,1,0]);
	level_1.push([5,0,1,0]);
	level_1.push([6,0,1,0]);
	level_1.push([7,0,1,0]);
	level_1.push([8,0,1,0]);
	level_1.push([9,0,1,0]);
	
	numBricks.push(level_1.length);
	levels.push(level_1);
	
	
	//level 2
	var level_2 = [];
	level_2.push([0,0,1,0]);
	level_2.push([1,1,1,0]);
	level_2.push([2,2,2,0]);
	level_2.push([3,3,2,0]);
	level_2.push([4,4,1,1]);
	level_2.push([5,3,2,0]);
	level_2.push([6,2,2,0]);
	level_2.push([7,1,1,0]);
	level_2.push([8,0,1,0]);
	level_2.push([9,1,1,0]);
	
	numBricks.push(level_2.length);
	levels.push(level_2);
	
	//level 3
	var level_3 = [];
	level_3.push([5,0,1,0]);
	level_3.push([4,1,1,0]);level_3.push([5,1,1,0]);level_3.push([6,1,1,0]);
	level_3.push([3,2,1,0]);level_3.push([4,2,1,0]);level_3.push([5,2,2,0]);
		level_3.push([6,2,1,0]);level_3.push([7,2,1,0]);
	level_3.push([2,3,1,0]);level_3.push([3,3,1,0]);level_3.push([4,3,2,0]);
		level_3.push([5,3,1,1]);level_3.push([6,3,2,0]);level_3.push([7,3,1,0]);
		level_3.push([8,3,1,0]);
	level_3.push([1,4,1,0]);level_3.push([2,4,1,0]);level_3.push([3,4,2,0]);
		level_3.push([4,4,2,0]);level_3.push([5,4,2,0]);level_3.push([6,4,2,0]);
		level_3.push([7,4,2,0]);level_3.push([8,4,1,0]);level_3.push([9,4,1,0]);
	level_3.push([1,5,1,0]);level_3.push([2,5,2,0]);level_3.push([3,5,3,0]);
		level_3.push([4,5,3,0]);level_3.push([5,5,3,0]);level_3.push([6,5,3,0]);
		level_3.push([7,5,3,0]);level_3.push([8,5,2,0]);level_3.push([9,5,1,0]);level_3.push([0,5,1,0]);
	
	numBricks.push(level_3.length);
	levels.push(level_3);
	
	var l, b;
	for(l = 0; l < levels.length; l++){
		var bricks= [];
		for(b = 0; b < levels[l].length; b ++){
			var brick = {'x': -.9, 'y':.95, 'hits': 1, 'powerup': 0.0}
			brick.x = brick.x + (.2)*levels[l][b][0];
			brick.y = brick.y + (-.1)*levels[l][b][1];
			brick.hits = levels[l][b][2];
			brick.powerup = levels[l][b][3]
			bricks.push(brick);
		}
		bricks_levels.push(bricks);
	}
	
	
   
	//Generating Bricks
//	var c, r, l;	
//    for (l = 1; l < 10; l++) {
//        var bricks = [];
//        for(c = 0; c < numBricks/5; c ++){
//            for(r = 0; r < 5; r++){
//                var brick = {
//                    'x': -.9, 'y':.95, 'hits': 1, 'powerup': 0.0
//                }
//				var pow = Math.random()*100;
//				if(pow > 97 ){
//					brick.powerup = 1.0;
//					brick.hits = 1;
//					}
//                brick.x = brick.x + (.20)*c;
//                brick.y = brick.y + (-.1)*r;
//                brick.hits = l;
//                bricks[c + (r*10)] = brick;
			
//            }
//        }
//        bricks_levels.push(bricks);
//    }
     
	//variables used to generate vertecies
    var i, x, y;
	var rad = 0.03;
	//var vertices = [];
	ballVertices.push(vec2(0,0));
	
	//Generate vertices for ball
	for(i=0;i<=360;i+=5){
		x = Math.cos(i*Math.PI/180)*rad;
		y = Math.sin(i*Math.PI/180)*rad;
		ballVertices.push(vec2(x,y));
	}
    
	//vertices for paddle
	paddleVertices.push(vec2(.125, -1));
	paddleVertices.push(vec2(-.125, -1));
	paddleVertices.push(vec2(-.125, -.95));
	paddleVertices.push(vec2(.125, -.95));
    
	//vertecies for brick
	brickVertices.push(vec2(-.1, -.05));
	brickVertices.push(vec2(-.1, .05));
	brickVertices.push(vec2(.1, .05));
	brickVertices.push(vec2(.1, -.05));
	
	
    // texture 
    texCoord = [
	vec2(0.0, 0.0),
	vec2(0.0, 1.0),
    vec2(1.0, 1.0),
	vec2(1.0, 0.0) ];
	
    
    // Load the data into the GPU 
    ballBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, ballBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ballVertices), gl.STATIC_DRAW );

    brickBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, brickBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(brickVertices), gl.STATIC_DRAW );
    
    paddleBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, paddleBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(paddleVertices), gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer
    vPositionLoc = gl.getAttribLocation( program, "vPosition" );
    //gl.vertexAttribPointer( vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vPositionLoc );
	
	colorLoc = gl.getUniformLocation( program, "color" );
	dispXLoc = gl.getUniformLocation(program, "dispX");
	dispYLoc = gl.getUniformLocation(program, "dispY");
	
	tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    textureCoordLoc = gl.getAttribLocation(program, "aTextureCoord");
    //gl.vertexAttribPointer(textureCoordLoc, 2, gl.FLOAT, false, 0, 0);
    //gl.enableVertexAttribArray(textureCoordLoc);

	initTexture();
	gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
	
    render();
};

function colide(){
	var i;
	var radius = .03;
	var len = .1;
	var height = .05;
	for(i = 0; i < numBricks[level]; i++){
		//hit from below
        if( bricks_levels[level][i].hits >=1 && ballY + yVel >= bricks_levels[level][i].y - .08
			&& ballX > bricks_levels[level][i].x - .103 && ballX < bricks_levels[level][i].x + .103
			&& ballY < bricks_levels[level][i].y - .08){
				ballY = bricks_levels[level][i].y - .08;
				yVel = yVel*-1;
				bricks_levels[level][i].hits --;
				score += 10;
				label.innerHTML = "Score: " + score;
 
                if(bricks_levels[level][i].hits == 0){
					if ( bricks_levels[level][i].powerup == 1) {
						console.log("HERE");
						num_lifes = num_lifes + 1;
						lifes_label.innerHTML = "Lives: " + num_lifes;
					}
                    hit_bricks = hit_bricks + 1;
                }
                    
		}
		//hit from top
		if( bricks_levels[level][i].hits >=1 && ballY - radius > bricks_levels[level][i].y + height
			&& ballY - radius + yVel <= bricks_levels[level][i].y + height
			&& ballX + radius + xVel >= bricks_levels[level][i].x - len
			&& ballX - radius + xVel <= bricks_levels[level][i].x + len){height;
				yVel = yVel*-1;
				bricks_levels[level][i].hits--;
				score += 10;
				label.innerHTML = "Score: " + score;
             
                if(bricks_levels[level][i].hits == 0){
					if ( bricks_levels[level][i].powerup == 1) {
						console.log("HERE");
						num_lifes = num_lifes + 1;
						lifes_label.innerHTML = "Lives: " + num_lifes;
					}
                    hit_bricks = hit_bricks + 1;
                }

            
		}
	
		//hit from right
		if( bricks_levels[level][i].hits >=1
			&& ballX - radius > bricks_levels[level][i].x + len
			&& ballX - radius + xVel <= bricks_levels[level][i].x + len
			&& ballY + radius + yVel >= bricks_levels[level][i].y - height
			&& ballY - radius + yVel <= bricks_levels[level][i].y + height){
				ballX = bricks_levels[level][i].x + len + radius;
				xVel = xVel*-1;
				bricks_levels[level][i].hits--;
				score += 10;
				label.innerHTML = "Score: " + score;
                       
                if(bricks_levels[level][i].hits == 0){
					if ( bricks_levels[level][i].powerup == 1) {
						console.log("HERE");
						num_lifes = num_lifes + 1;
						lifes_label.innerHTML = "Lives: " + num_lifes;
					}
                    hit_bricks = hit_bricks + 1;
                }

		}
		//hit from left
		if( bricks_levels[level][i].hits >=1
			&& ballX + radius < bricks_levels[level][i].x - len
			&& ballX + radius + xVel >= bricks_levels[level][i].x - len
			&& ballY + radius + yVel >= bricks_levels[level][i].y - height
			&& ballY - radius + yVel <= bricks_levels[level][i].y + height){
				ballX = bricks_levels[level][i].x - len - radius;
				xVel = xVel*-1;
				bricks_levels[level][i].hits--;
				score += 10;
				label.innerHTML = "Score: " + score;
                          
                if(bricks_levels[level][i].hits == 0){
					if ( bricks_levels[level][i].powerup == 1) {
						console.log("HERE");
						num_lifes = num_lifes + 1;
						lifes_label.innerHTML = "Lives: " + num_lifes;
					}
                    hit_bricks = hit_bricks + 1;
                }

		}
	}
}

function render() {
	if(over == 0){
		gl.clear( gl.COLOR_BUFFER_BIT );
		
		//Handle reset
		if (reset == 1) {
            ballX = padDir;
			xVel = 0;
			yVel = 0;
			ballY = -.92;
        }
		
		colide();
		
		//Losing a life
		if(ballY <= -.98){
			xVel = 0;
			yVel = 0;
            num_lifes = num_lifes - 1
            lifes_label.innerHTML = "Lives: " + num_lifes;
            if (num_lifes == 0) {
                over = 1;
                alert("Game Over! Your Score: " + score);
            }
            else {
                reset = 1;
            }
		}
        
        //new level
        if (hit_bricks == numBricks[level]) {
            level = level + 1;
            hit_bricks = 0;
			reset = 1;
			alert("Level " + level + " complete!");
			level_label.innerHTML = "Level: " + (level + 1);
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
        
        // added by Chaoli
        gl.enableVertexAttribArray( vPositionLoc );
        gl.bindBuffer( gl.ARRAY_BUFFER, paddleBuffer );
        gl.vertexAttribPointer( vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
        
		//Paddle
		gl.uniform4fv( colorLoc, vec4(1.0, 0.4, 0.4, 1.0) );
		dispX = padDir;
		dispY = 0;	
		gl.uniform1f(dispXLoc, dispX);
		gl.uniform1f(dispYLoc, dispY);
		gl.drawArrays( gl.TRIANGLE_FAN, 0, paddleVertices.length);
	
        // added by Chaoli
        gl.enableVertexAttribArray( vPositionLoc );
        gl.bindBuffer( gl.ARRAY_BUFFER, brickBuffer );
        gl.vertexAttribPointer( vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(textureCoordLoc);
        gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
        gl.vertexAttribPointer(textureCoordLoc, 2, gl.FLOAT, false, 0, 0);
        
		//Brick
		var i;
		for(i = 0; i < numBricks[level]; i ++){
            if(bricks_levels[level][i].hits >= 1){
				if(bricks_levels[level][i].powerup == 1){
					gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 0.0, 1.0) );
				}
				else{
					gl.uniform4fv( colorLoc, vec4(bricks_levels[level][i].hits*.4, bricks_levels[level][i].hits*.4, bricks_levels[level][i].hits*.4, 1.0) );
				}
				
				gl.uniform1f(dispXLoc, bricks_levels[level][i].x);
				gl.uniform1f(dispYLoc, bricks_levels[level][i].y);
				gl.drawArrays( gl.TRIANGLE_FAN, 0, brickVertices.length);
                gl.uniform4fv(colorLoc, vec4(0,0,0,1));
                gl.drawArrays(gl.LINE_LOOP,0, brickVertices.length);
			}
		}
		
        // added by Chaoli
        gl.disableVertexAttribArray(textureCoordLoc);
        
        // added by Chaoli
        gl.enableVertexAttribArray( vPositionLoc );
        gl.bindBuffer( gl.ARRAY_BUFFER, ballBuffer );
        gl.vertexAttribPointer( vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
        
		//Ball
		gl.uniform4fv( colorLoc, vec4(0.4, 0.4, 1.0, 1.0) );
		dispX = ballX;
		dispY = ballY;
		gl.uniform1f(dispXLoc, dispX);
		gl.uniform1f(dispYLoc, dispY);
		gl.drawArrays( gl.TRIANGLE_FAN, 0, ballVertices.length);
	
        
		setTimeout(
			function () {requestAnimFrame( render );},
			speed
		);
	}
}