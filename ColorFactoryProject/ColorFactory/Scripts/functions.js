/////////////////////////////////////////////////////
//Global variables
/////////////////////////////////////////////////////
var timerInterval;
var canvasPadding = 5;
var tileRadius = 5;
var tileSize = 40;
var numberOfTiles = 12;
var minimumNumOfMines = 10;
var maximumNumOfMines = 25;

var rotation = 90;

var tileSheet = new Image();
tileSheet.src = "/Images/tilesheet/tileSheetPlayer40Black.png";

var playerAnimationCounter = 0;

//////////////////////////////////////////////////////////////
//Objects
//////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////

//graph for A* algorithm
// 1 = open
// 0 = obsticle

var graph = new Graph([
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);

//map
// 0 = covered tile
// 1 = uncovered tile
// 2 = covered Mine tile
// 3 = uncovered/destroyed Mine tile
// 4 = uncovered/scored Mine tile
// 5 = currentHoveredTile

var map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

var mapNumbers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

var player = {
    "pixelDistanceWhileMoving": 3,
    "cornerPoint": { "x": 0, "y": 0 },
    "setCornerPoint": function (x, y) {
        player.cornerPoint.x = x;
        player.cornerPoint.y = y;
    },
    "currentTile": { "row": 0, "column": 0 },
    "startingPositionTile": { "row": 0, "column": 0 },
    "destinationTile": { "x": 0, "y": 0 },
    "deltaVelocity": { "dX": 0, "dY": 1 },
    "ammunitionPoints": 0
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
    "clickedTile": { "row": 0, "column": 0, "cornerPointX": 0, "cornerPointY": 0 },
    "currentTileHover": {"cornerPointX": 0, "cornerPointY": 0 },
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

    initializeMines();
    initializeTileNumbers();
    initializePlayer();

    tileSheet.addEventListener('load', eventPlayerLoaded, false);

    drawMapTiles(window.ctx, numberOfTiles, numberOfTiles, tileSize, player.startingPositionTile);

    function eventPlayerLoaded() {
        drawPlayer();
    }

    function initializePlayer() {
        var randX = Math.floor(Math.random() * numberOfTiles);
        var randY = Math.floor(Math.random() * numberOfTiles);
        var point = cursor.getTileCornerPoint(randX, randY);
        var startingTile = { "row": randY, "column": randX };
        player.currentTile = player.startingPositionTile;

        if (map[randY][randX] !== 2) {
            player.startingPositionTile = startingTile;
            player.setCornerPoint(point.x, point.y);
            player.ammunitionPoints = mapNumbers[randY][randX];
            map[randY][randX] = 1;
            displayAmmunitionPoints();
            return;
        }

        initializePlayer();
    }

    function initializeMines() {
        var randNumOfMines = Math.floor(Math.random() * maximumNumOfMines), randX, randY;

        for (var i = 0; i < randNumOfMines; i++) {
            randX = Math.floor(Math.random() * numberOfTiles);
            randY = Math.floor(Math.random() * numberOfTiles);
            if (map[randX][randY] == 2) {
                i--;
            }
            else {
                map[randX][randY] = 2;
            }
        }
    }

    function initializeTileNumbers() {
        var counter, num, rMinusOne, rPlusOne, kMinusOne, kPlusOne;

        for (var r = 0; r < numberOfTiles; r++) {
            for (var k = 0; k < numberOfTiles; k++) {

                counter = 0;
                num = map[r][k];
                rMinusOne = r - 1;
                rPlusOne = r + 1;
                kMinusOne = k - 1;
                kPlusOne = k + 1;

                if (num != 2) {
                    if (rMinusOne >= 0 && kMinusOne >= 0)
                        countMinesAroundTile(map[rMinusOne][kMinusOne]);
                    if (rMinusOne >= 0)
                        countMinesAroundTile(map[rMinusOne][k]);
                    if (rMinusOne >= 0 && kPlusOne < numberOfTiles)
                        countMinesAroundTile(map[rMinusOne][kPlusOne]);
                    if (kMinusOne >= 0)
                        countMinesAroundTile(map[r][kMinusOne]);
                    if (kPlusOne < numberOfTiles)
                        countMinesAroundTile(map[r][kPlusOne]);
                    if (rPlusOne < numberOfTiles && kMinusOne >= 0)
                        countMinesAroundTile(map[rPlusOne][kMinusOne]);
                    if (rPlusOne < numberOfTiles)
                        countMinesAroundTile(map[rPlusOne][k]);
                    if (rPlusOne < numberOfTiles && kPlusOne < numberOfTiles)
                        countMinesAroundTile(map[rPlusOne][kPlusOne]);
                    mapNumbers[r][k] = counter;
                }

            }
        }
        function countMinesAroundTile(num) {
            if (num == 2)
                counter++;
        }
    }

}

function playing() {

    calculateCursorPosition();
    onMouseClickFunction();

    function onMouseClickFunction() {

        $mapCanvas.click(function (e) {
            var x = cursor.getCursorPositionInCanvasX(e.pageX),
                y = cursor.getCursorPositionInCanvasY(e.pageY);

            cursor.clickedTile.row = cursor.getRow(y);
            cursor.clickedTile.column = cursor.getColumn(x);

            if (map[cursor.clickedTile.row][cursor.clickedTile.column] === 0) {
                player.ammunitionPoints += mapNumbers[cursor.clickedTile.row][cursor.clickedTile.column];
                map[cursor.clickedTile.row][cursor.clickedTile.column] = 1;
                graph.nodes[cursor.clickedTile.row][cursor.clickedTile.column].type = 1;
            }
            if ((map[cursor.clickedTile.row][cursor.clickedTile.column] === 2)) {
                player.ammunitionPoints = 0;
                map[cursor.clickedTile.row][cursor.clickedTile.column] = 3;
                graph.nodes[cursor.clickedTile.row][cursor.clickedTile.column].type = 0;
            }

            var cornerPoint = cursor.getTileCornerPoint(cursor.clickedTile.row, cursor.clickedTile.column);

            /////////////////////////////////////////////////////////////////////////////////////

            resetPathColor();

            var startX = player.currentTile.row;
            var startY = player.currentTile.column;
            var start = graph.nodes[startX][startY];

            var destX = cursor.clickedTile.row;
            var destY = cursor.clickedTile.column;
            var end = graph.nodes[destX][destY];

            // result now searches diagonal neighbors as well
            var result = astar.search(graph.nodes, start,end, true);
           
            for (var i = 0; i < result.length; i++) {
                var row = result[i].x;
                var col = result[i].y;
                map[row][col] = 5;
            }

            player.currentTile.row = cursor.clickedTile.row;
            player.currentTile.column = cursor.clickedTile.column;
         
/////////////////////////////////////////////////////////////////////////////////////
            movePlayerTo(cornerPoint.x, cornerPoint.y);

            $("#textDiv3").text("clicked tile (x,y): " + cursor.clickedTile.row + "," + cursor.clickedTile.column);

            checkIfMineIsUncoveredAllAround(cursor.clickedTile.row,cursor.clickedTile.column);
            displayAmmunitionPoints();



        });
    }
}

function checkIfMineIsUncoveredAllAround(row, col) {
    var rMinusOne = row - 1;
    var rPlusOne = row + 1;
    var kMinusOne = col - 1;
    var kPlusOne = col + 1;

    for (var r = rMinusOne; r <= rPlusOne; r++) {
        for (var k = kMinusOne; k <= kPlusOne; k++) {
//check if tile is outside of map boundry(ex. row = -1)
            if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
                var isMine = checkIfTileIsMine(map[r][k]);
                if(isMine)
                {

                    if (checkIfTilesAroundParameterTileAreUncovered(r, k)) {
//The mine is uncovered from all sides here
                        map[r][k] = 4;

                    }
                }
            }
        }
    }  

    function checkIfTileIsMine(num) {
        if (num == 2)
            return true;
        else
            return false;
    }

    function checkIfTilesAroundParameterTileAreUncovered(row, col) {
        var rMinusOne = row - 1;
        var rPlusOne = row + 1;
        var kMinusOne = col - 1;
        var kPlusOne = col + 1;
        var num;

        for (var r = rMinusOne; r <= rPlusOne; r++) {
            for (var k = kMinusOne; k <= kPlusOne; k++) {

                if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
                    num = map[r][k];
                    if(num === 0)
                    {
                        return false;
                    }
                }
            }
        }
        return true;  
    }
}

function drawPlayer() {
    window.ctx.drawImage(tileSheet, 0, 0, 40, 40, player.cornerPoint.x + canvasPadding, player.cornerPoint.y + canvasPadding, 40, 40);
}

function drawPlayerRunning() {
    window.ctx.clearRect(0, 0, window.mapCanvas.width, window.mapCanvas.height);
    drawMapTiles(window.ctx, 12, 12, tileSize);

    window.ctx.drawImage(tileSheet, 0, 40 * playerAnimationCounter, 40, 40, player.cornerPoint.x + canvasPadding, player.cornerPoint.y + canvasPadding, 40, 40);
    calculatePlayerPosition();

    function calculatePlayerPosition() {

        var calc1 = cursor.clickedTile.cornerPointX - player.cornerPoint.y;
        var calc2 = player.cornerPoint.y - cursor.clickedTile.cornerPointX;
        var calc3 = player.cornerPoint.x - cursor.clickedTile.cornerPointY;
        var calc4 = cursor.clickedTile.cornerPointY - player.cornerPoint.x;

        playerAnimationCounter++;

        
        if ((calc1) >= player.pixelDistanceWhileMoving) {
            player.cornerPoint.y += player.pixelDistanceWhileMoving;
            //        $("#textDiv4").text("player cornerPoint (x,y): " + player.cornerPoint.x + "," + player.cornerPoint.y);
        } else if ((calc2) >= player.pixelDistanceWhileMoving) {
            player.cornerPoint.y -= player.pixelDistanceWhileMoving;
            //        $("#textDiv4").text("player cornerPoint (x,y): " + player.cornerPoint.x + "," + player.cornerPoint.y);
        } else if ((calc3) >= player.pixelDistanceWhileMoving) {
            player.cornerPoint.x -= player.pixelDistanceWhileMoving;
            //        $("#textDiv4").text("player cornerPoint (x,y): " + player.cornerPoint.x + "," + player.cornerPoint.y);
        } else if ((calc4) >= player.pixelDistanceWhileMoving) {
            player.cornerPoint.x += player.pixelDistanceWhileMoving;
            //        $("#textDiv4").text("player cornerPoint (x,y): " + player.cornerPoint.x + "," + player.cornerPoint.y);
        }
        else {
            playerAnimationCounter = 0;
            window.ctx.clearRect(0, 0, window.mapCanvas.width, window.mapCanvas.height);
            drawMapTiles(window.ctx, 12, 12, tileSize);
            drawPlayer();

            clearInterval(timerInterval);
            return;
        }

        if (playerAnimationCounter > player.pixelDistanceWhileMoving) {
            playerAnimationCounter = 0;
        }
    }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillStyle) {

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
    if (fill) {
 //var random = Math.floor((Math.random() * 256));
    ctx.fillStyle = fillStyle;
    ctx.fill();
    }
   
}

function drawMapTiles(ctx, numHorizontalTiles, numVerticalTiles, size, startPoint) {
    var x, y, num, mineNumbers;
    

    for (var i = 0; i < numHorizontalTiles; i++) {

        for (var j = 0; j < numVerticalTiles; j++) {

             num = map[j][i];
             mineNumbers = mapNumbers[j][i];

            x = i * size + i + 4;
            y = j * size + j + 4;

            if (num == 0 || num == 2) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(255,255,255,.1)");
            }
            if (num !== 0) {
                drawNumbers(i, j, mineNumbers);
            }
            if (num == 3) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(0,200,255,.8)");
            }
            if (num == 4) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(200,200,255,.5)");
            }
            if (num == 5) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(255,0,0,.4)");
            }

        }
    }

    function drawNumbers(row, col, numOfMines) {
        var point = cursor.getTileCornerPoint(row, col);
        var posX = tileSize / 2;
        var posY = posX + 14;
        ctx.fillStyle = "#999999";
        ctx.font = '20px MonaKo';
        if (numOfMines != 0)
            ctx.fillText(numOfMines, point.x + posX, point.y + posY);
    }
}

function movePlayerTo(x, y) {
    cursor.clickedTile.cornerPointX = x;
    cursor.clickedTile.cornerPointY = y;
    timerInterval = setInterval(drawPlayerRunning, 100);
}

function displayAmmunitionPoints() {
    $("#ammunitionPointsContainer").text(player.ammunitionPoints);
}

function calculateCursorPosition() {
    var x, y, row, col, cornerPoint;

    $("#mapCanvas").mouseover(function () {
        $(this).mousemove(function (e) {

            x = cursor.getCursorPositionInCanvasX(e.pageX),
            y = cursor.getCursorPositionInCanvasY(e.pageY),
            row = cursor.getRow(y),
            col = cursor.getColumn(x);
            cornerPoint = cursor.getTileCornerPoint(row, col)
            cursor.currentTileHover = { "cornerPointX": cornerPoint.x, "cornerPointY": cornerPoint.y }

            //checkIfHoveredTileIsNextToUncoveredTile(row, col);

            $("#textDiv").text(map[row][col]);
            $("#textDiv2").text(row + "," + col);
            $("#textDiv4").text(cursor.currentTileHover.cornerPointX + "," + cursor.currentTileHover.cornerPointY);
        });
    });

    function checkIfHoveredTileIsNextToUncoveredTile(row, col) {
        var rMinusOne = row - 1;
        var rPlusOne = row + 1;
        var kMinusOne = col - 1;
        var kPlusOne = col + 1;

        for (var r = rMinusOne; r <= rPlusOne; r++) {
            for (var k = kMinusOne; k <= kPlusOne; k++) {
                //check if tile is outside of map boundry(ex. row = -1)
                if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
                    var isCovered = checkIfTileIsCovered(map[r][k]);
                    if (!isCovered) {
                        //current hovered tile is next to uncovered tile, thus allowing player to click there
                        map[r][k] = 5;

                        roundRect(ctx, cursor.currentTileHover.cornerPointY + 5, cursor.currentTileHover.cornerPointX + 5, tileSize, tileSize, tileRadius, false, true, "rgba(200,0,255,.5)");

                        return;

                    }
                }
            }
        }

        function checkIfTileIsCovered(num) {
            if (num == 2 || num == 0)
                return true;
            else
                return false;
        }

    }
}

function resetPathColor() {
    for (var i = 0; i < 12; i++) {
        for (var j = 0; j < 12; j++) {
            var num = map[i][j];

            if (num == 5){
                map[i][j] = 6;
            }
        }
    }

}

//////////////////////////////////////////////////////////////////////////////
// http://stackoverflow.com/questions/958433/how-can-i-clearinterval-for-all-setinterval
//////////////////////////////////////////////////////////////////////////////

//window.oldSetInterval = window.setInterval;
//window.setInterval = function (func, interval) {
//    var interval = oldSetInterval(func, interval);
//    // store it in a array for stopping? stop it now? the power is yours.
//}

///////////////////////////////////////////////////////////////////////////////
