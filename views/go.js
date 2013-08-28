//code for grid from: http://jsfiddle.net/alnitak/xN45K/
//firefox mouse event fix from: http://stackoverflow.com/questions/12704686/html5-with-jquery-e-offsetx-is-undefined-in-firefox

function loadGame() {
	// block size
	var size = 32;

	// get some info about the canvas
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	// load go board
	//var imageObj = new Image();
	
	//imageObj.onload = function() {
	//	ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
	//}

	//imageObj.src = 'http://www.mashbout.com/wp-content/uploads/2013/06/Blank_Go_board.png';
	//imageObj.src = 'Blank_Go_board.png';

	// State of a grid
	var gState = {	"EMPTY" : 0,
					"BLACK" : 1,
					"WHITE" : 2 };

	// how many cells fit on the canvas
	var w = ~~ (canvas.width / size);
	var h = ~~ (canvas.height / size);

	//var w = 19;
	//var h = 19;

	// create empty state array
	var state = new Array();
	//var state = [];
	//state.length = 0;	

	for (var y = 0; y < h; ++y) {
	    state[y] = new Array(w);
		//state[y] = [];
		//state[y].length[w]
	}

	function Cell(state, x, y) {
		this.state = state;
		this.x = x;
		this.y = y;	
	}

	// Helper Functions
	function clearBoard() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function clearCell(x, y) {
		ctx.clearRect((x*size), (y*size), size, size);
		//state[y][x] = gState.EMPTY;
	}

	function isAdjCell(p, x, y) {
		// If this cell is in this grid state
		if(state[y][x] == p)
			return true;

		return false;
	}

	function adjCell(q, x, y) {
		//check if adjacent cell is inbound
		if(x > 0)
			q.push(new Cell(state[y][x-1], x-1, y));
		if(y > 0) 
			q.push(new Cell(state[y-1][x], x, y-1));	
		if(x < w-1)
			q.push(new Cell(state[y][x+1], x+1, y));
		if(y < h-1) 
			q.push(new Cell(state[y+1][x], x, y+1));
	}
		
	function isCaptured(x, y) {
		var queue = [];
		var mark = {}; // A hashtable will keep track
		queue.push(new Cell(state[y][x], x, y));
		
		//mark this state somehow
		mark[x.toString()+y.toString()] = true;

		//alert(mark[gx.toString()+gy.toString()]);
		//alert(mark['00']); //if not in hashtable, returns undefined

		//queue.length==0 is similar to queue.empty()
		while(queue.length!=0) {
			var t = queue.shift();

			if((t.state == gState.EMPTY) || (t.state == undefined))
				return false;

			// Find adjacent cells of current cell
			var tmp = [];

			if(t.state == gState.BLACK)
				adjCell(tmp, t.x, t.y);

			//alert(tmp.length);
		
			var u;
			while (tmp.length > 0) {

				// If u is not marked
				u = tmp.shift();
				var key = u.x.toString()+u.y.toString();
				if(mark[key] == undefined) {
					mark[key] = true;
					queue.push(new Cell(state[u.y][u.x], u.x, u.y)); 
				}
			}
	
		}
		alert("Captured");
		return true;
	}

	function clearCaptured() {
		var queue = [];
		var mark = {}; // A hashtable will keep track
		//queue.push(new Cell(state[y][x], x, y));
		
		//mark this state somehow
		mark[x.toString()+y.toString()] = true;

		//alert(mark[gx.toString()+gy.toString()]);
		//alert(mark['00']); //if not in hashtable, returns undefined

		//queue.length==0 is similar to queue.empty()
		while(queue.length!=0) {
			var t = queue.shift();

			// Find adjacent cells of current cell
			var tmp = [];

			if(t.state == gState.BLACK) {
				adjCell(tmp, t.x, t.y);
				clearCell(t.x, t.y);
			}

			//alert(tmp.length);
		
			var u;
			while (tmp.length > 0) {

				// If u is not marked
				u = tmp.shift();
				var key = u.x.toString()+u.y.toString();
				if(mark[key] == undefined) {
					mark[key] = true;
					queue.push(new Cell(state[u.y][u.x], u.x, u.y)); 
				}
			}
	
		}
	}

	// keyboard event, testing purposes
	//$(document).keydown(function(e) {
	//	if(e.which == 76) {
	//		clearBoard();
	//});

	// click event, using jQuery for cross-browser convenience
	$(canvas).click(function(e) {

	    // quick fill function to save repeating myself later
	    function fill(oc, ic, gx, gy) {
			
			// Gradient offset
			var grdOffset = (size/4)+1;

			// Create gradient
			var grd = ctx.createRadialGradient((gx * size)+grdOffset, (gy * size)+grdOffset, 1, (gx * size)+grdOffset, (gy * size)+grdOffset, 20)
			grd.addColorStop(0, ic);
			grd.addColorStop(1, oc);

			ctx.beginPath();
			//ctx.fillRect(gx * size, gy * size, size, size);
	   		ctx.arc((gx * size)+16, (gy * size)+16, (size/2)-1, 0, 2 * Math.PI, false);
			ctx.fillStyle = grd;
			//ctx.fillStyle = s;
			ctx.fill();
			ctx.closePath(); 
		}

	    // get mouse click position
	    var mx = e.offsetX;
	    var my = e.offsetY;

		// if this browser firefox, define these
		if( (e.offsetX || e.offsetY) == undefined) {
			mx = e.pageX-$('canvas').offset().left;
			my = e.pageY-$('canvas').offset().top;
		}

	    // calculate grid square numbers
	    var gx = ~~ (mx / size);
	    var gy = ~~ (my / size);
	    
	    // make sure we're in bounds
	    if (gx < 0 || gx >= w || gy < 0 || gy >= h) {
		return;
	    }

	    if (state[gy][gx] == gState.BLACK) {
			state[gy][gx] = gState.WHITE;
			fill('grey', 'white', gx, gy);

			//Checking Adjacent Tiles for black pieces 
			if(isAdjCell(gState.BLACK, gx-1, gy) && isCaptured(gx-1, gy))
				clearCaptured(gx-1, gy);
			
			if(isAdjCell(gState.BLACK, gx, gy-1) && isCaptured(gx, gy-1))
				clearCaptured(gx, gy-1);
			
			if(isAdjCell(gState.BLACK, gx+1, gy) &&	isCaptured(gx+1, gy))
				clearCaptured(gx+1, gy);
			
			if(isAdjCell(gState.BLACK, gx, gy+1) && isCaptured(gx, gy+1))
				clearCaptured(gx, gy+1);

			//ctx.clearRect((gx * size), (gy * size), size, size);			
			//clearCell(gx, gy);

			//ctx.clearRect(gx, gy, (gx * size)-1, (gy * size)-1);
			//setTimeout(function() {
		    //	fill('black', 'grey', gx, gy)
				//ctx.clearRect(gx, gy, (gx*size), (gy*size));
			//}, 1000);
		} else if(state[gy][gx] == gState.WHITE) {
			state[gy][gx] = gState.EMPTY;
			clearCell(gx, gy);
	    } else {
			state[gy][gx] = true;
			fill('black', 'grey', gx, gy);
	    	//isCaptured(gx, gy);
		}
	});
}

window.addEventListener("load", loadGame, false);
