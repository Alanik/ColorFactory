function drawPattern() {
    var ctx = document.getElementById('mapCanvas').getContext('2d');
    ctx.fillStyle = "rgb(188, 222, 178)";
    ctx.fillRect(0, 0, 400, 400);
}

/**
* Draws a rounded rectangle using the current state of the canvas. 
* If you omit the last three params, it will draw a rectangle 
* outline with a 5 pixel border radius 
* @param {CanvasRenderingContext2D} ctx
* @param {Number} x The top left x coordinate
* @param {Number} y The top left y coordinate 
* @param {Number} width The width of the rectangle 
* @param {Number} height The height of the rectangle
* @param {Number} radius The corner radius. Defaults to 5;
* @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
* @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
*/
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 255, 255,.1)"; 
    ctx.fill();
}

function drawMapTiles(ctx,numHorizontalTiles,numVerticalTiles,size) {
    var radius = 5;
    var x;
    var y;
    for (var i = 0; i < numHorizontalTiles; i++ ) {
        for (var j = 0; j < numVerticalTiles; j++) {
            x = i * size +i +4;
            y = j * size + j+4;
         roundRect(ctx, x + 1, y + 1, size, size, radius); 
        }
    }
}


