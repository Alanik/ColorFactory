
var mouseX;
var mouseY;
var tileRadius = 5;
var col;
var row;
var tileSize = 40;
var tileSheet = new Image();
tileSheet.src = "/Images/tilesheet/tileSheetPlayer3.png";
var playerAnimationCounter = 0;
var centerPointInitialPlayerPosition = getTileRectangleCenter(2, 2);

var player = {
    "center": { "x": 0, "y": 0 },
    "currentTile": { "x": 0, "y": 0}
};

////////////////////////////////////////////////////////////////////////////////
//FUNCTIONS
////////////////////////////////////////////////////////////////////////////////
function initialize() {
    tileSheet.addEventListener('load', eventPlayerLoaded, false);
    drawMapTiles(window.ctx, 12, 12, tileSize);

    function eventPlayerLoaded() {
        startUp();
    }

    function startUp() {
        setInterval(drawPlayerRunning, 100);
    }
}

function drawPlayerRunning() {


    // Store the current transformation matrix
    window.ctx.save();
    // Use the identity matrix while clearing the canvas
    window.ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Clear canvas of the previous animation frames
    window.ctx.clearRect(0, 0, window.mapCanvas.width, window.mapCanvas.height);
    // Restore the transform
    window.ctx.restore();

    drawMapTiles(window.ctx, 12, 12, tileSize);
   
    window.ctx.drawImage(tileSheet, 0, 48 * playerAnimationCounter, 48, 48, centerPointInitialPlayerPosition.x, centerPointInitialPlayerPosition.y, 48, 48);
   
    playerAnimationCounter++;
    //centerPointInitialPlayerPosition.x += 2;
    
    centerPointInitialPlayerPosition.y += 3;
    if (playerAnimationCounter > 3) {
        playerAnimationCounter = 0;
    }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillStyle) {

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
        //ctx.strokeStyle = "#0000ff";
        ctx.stroke();
    }
    //var random = Math.floor((Math.random() * 256));
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

function drawMapTiles(ctx, numHorizontalTiles, numVerticalTiles, size) {
    var x;
    var y;
    for (var i = 0; i < numHorizontalTiles; i++) {
        for (var j = 0; j < numVerticalTiles; j++) {
            x = i * size + i + 4;
            y = j * size + j + 4;
            roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(255,255,255,.1)");
        }
    }
}

function getMousePositionInTileMap(e) {
    mouseX = e.clientX - window.mapCanvas.offsetLeft - 5;
    mouseY = e.clientY - window.mapCanvas.offsetTop - 5;

}

function getTileRectanglePoint(row, col) {
    var x = col * tileSize + col;
    var y = row * tileSize + row;
    var tilePoint = { "x": x, "y": y };
    return tilePoint;
}

function getTileRectangleCenter(row, col) {
    var point = getTileRectanglePoint(row, col);
    var center = { "x": point.x / 2, "y": point.y / 2 };
    return center;
}

function movePlayerTo(x, y) {
    drawPlayerRunning(x,y);

}