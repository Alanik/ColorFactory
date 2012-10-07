
var canvasPadding = 5;
var tileRadius = 5;
var tileSize = 40;
var numberOfTiles = 12;

var tileSheet = new Image();
tileSheet.src = "/Images/tilesheet/tileSheetPlayer2.png";

var playerAnimationCounter = 0;

var player = {
    "cornerPoint": { "x": 0, "y": 0 },
    "setCornerPoint": function (x, y) {
        player.cornerPoint.x = x;
        player.cornerPoint.y = y;
    },
    "currentTile": { "row": 0, "column": 0 },
    "destinationTile": { "x": 0, "y": 0 }
};

var cursor = {

    "getRow": function (y) {
        var row = Math.floor(y / tileSize);
        row = Math.floor((y - row) / tileSize);
        return row;
    },
    "getColumn": function (x) {
        var col = Math.floor(x / tileSize);
        col = Math.floor((x - col) / tileSize);
        return col;
    },
    "getCursorPositionInCanvasX": function (pageX) {
        var mouseX = pageX - window.mapCanvas.offsetLeft - canvasPadding;
        return mouseX;
    },
    "getCursorPositionInCanvasY": function (pageY) {
        var mouseY = pageY - window.mapCanvas.offsetTop - canvasPadding;
        return mouseY;
    },
    "clickedTile": { "row": 0, "column": 0,"cornerPointX":0,"cornerPointY":0},
    "getTileCornerPoint": function (row, col) {
        var xx = row * tileSize + row;
        var yy = col * tileSize + col;
        var tileCornerPoint =
            {
                "x": xx,
                "y": yy
            };
        return tileCornerPoint;
    }

};

////////////////////////////////////////////////////////////////////////////////
//FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function initialize() {

    tileSheet.addEventListener('load', eventPlayerLoaded, false);
    drawMapTiles(window.ctx, numberOfTiles, numberOfTiles, tileSize);

    function eventPlayerLoaded() {
        startUp();
    }

    function startUp() {
        player.setCornerPoint(0, 0);
        drawPlayer();
    }
}

function playing() {
    calculateCursorPosition();
}

function drawPlayer() {
    window.ctx.drawImage(tileSheet, 0, 0, 48, 48, player.cornerPoint.x, player.cornerPoint.y, 48, 48);
}

function drawPlayerRunning() {
    


//    // Store the current transformation matrix
//    window.ctx.save();
//    // Use the identity matrix while clearing the canvas
//    window.ctx.setTransform(1, 0, 0, 1, 0, 0);
//    // Clear canvas of the previous animation frames
    window.ctx.clearRect(0, 0, window.mapCanvas.width, window.mapCanvas.height);
//    // Restore the transform
//    window.ctx.restore();
    drawMapTiles(window.ctx, 12, 12, tileSize);
    window.ctx.drawImage(tileSheet, 0, 48 * playerAnimationCounter, 48, 48, player.cornerPoint.x, player.cornerPoint.y, 48, 48);
    playerAnimationCounter++;

    //centerPointInitialPlayerPosition.x += 3;
    if (player.cornerPoint.y <= cursor.clickedTile.cornerPointX) {
        player.cornerPoint.y += 3;
        $("#textDiv4").text("player cornerPoint (x,y): " + player.cornerPoint.x + "," + player.cornerPoint.y);
    } else {
        playerAnimationCounter = 0;
        return;
    }

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

//function getMousePositionInTileMap(e) {
//    mouseX = e.clientX - window.mapCanvas.offsetLeft - canvasPadding;
//    mouseY = e.clientY - window.mapCanvas.offsetTop - canvasPadding;
//}

//function getTileRectanglePoint(row, col) {
//    var x = col * tileSize + col;
//    var y = row * tileSize + row;
//    var tilePoint = { "x": x, "y": y };
//    return tilePoint;
//}

//function getTileRectangleCenter(row, col) {
//    var point = getTileRectanglePoint(row, col);
//    var center = { "x": point.x, "y": point.y };
//    return center;
//}

function movePlayerTo(x, y) {
    cursor.clickedTile.cornerPointX = x;
    cursor.clickedTile.cornerPointY = y;
    setInterval(drawPlayerRunning, 100);
}

function calculateCursorPosition() {
    $("#mapCanvas").mouseover(function () {
        $(this).mousemove(function (e) {
            var x = cursor.getCursorPositionInCanvasX(e.pageX),
                y = cursor.getCursorPositionInCanvasY(e.pageY),
                row = cursor.getRow(y),
                col = cursor.getColumn(x);
            $("#textDiv").text(row + "," + col);
            $("#textDiv2").text(x + "," + y);
        });
    });
}