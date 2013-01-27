/////////////////////////////////////////////////////
//Global variables
/////////////////////////////////////////////////////
var playerTimerInterval;
var animationNumbersTimerInterval;
var isPlayerRunningInProgress = false;
var isAnimationNumbersInProgress = false;

var canvasPadding = 5;
var tileRadius = 2;
var tileSize = 40;
var numberOfTiles = 12;
var minimumNumOfMines = 10;
var maximumNumOfMines = 25;

var tileSheet = new Image();
tileSheet.src = "Images/tilesheet/tileSheetPlayer40Black2.png";

var playerAnimationCounter = 0;
var nextTilePlayerMovesToCounter = 0;

var mineNumberAnimationOpacity = .1;

var arrayResult;


//////////////////////////////////////////////////////////////
//Objects
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
    "nextTile": { "row": 0, "column": 0 },
    "startingPositionTile": { "row": 0, "column": 0 },
    "previousTile": { "row": 0, "column": 0 },
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
        var mouseX = pageX - mainContainer.offsetLeft - mapCanvas.offsetLeft - canvasPadding;
        return mouseX;
    },
    "getCursorPositionInCanvasY": function (pageY) {
        var mouseY = pageY - mainContainer.offsetTop - mapCanvas.offsetTop - canvasPadding;
        return mouseY;
    },
    "clickedTile": { "row": 0, "column": 0, "cornerPointX": 0, "cornerPointY": 0 },
    "currentTileHover": { "cornerPointX": 0, "cornerPointY": 0 },
    //getTileCornerPoint returns reversed variables: y is actually x and x is y, bad naming from my part.
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

    initializeEffectsCanvasPosition();
    initializeMines();
    initializeTileNumbers();
    initializePlayer();
    tileSheet.addEventListener('load', eventPlayerLoaded, false);
    drawMapTiles(ctx, numberOfTiles, numberOfTiles, tileSize, player.startingPositionTile);

    displayAmmunitionPoints();

    function eventPlayerLoaded() {
        drawPlayer();

    }

    function initializePlayer() {
        var randX = Math.floor(Math.random() * numberOfTiles);
        var randY = Math.floor(Math.random() * numberOfTiles);
        var point = cursor.getTileCornerPoint(randX, randY);

        if (map[randY][randX] !== 2) {
            player.startingPositionTile = { "row": randY, "column": randX };
            player.currentTile = clone(player.startingPositionTile);
            player.nextTile = clone(player.currentTile);

            player.setCornerPoint(point.x, point.y);
            player.ammunitionPoints = mapNumbers[randY][randX];

            //set playerCanvas position here //////////////////////////////////////////////////////
            playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");
            map[randY][randX] = 1;
            graph.nodes[randY][randX].type = 1;

            //displayAmmunitionPoints();
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

    function initializeEffectsCanvasPosition() {
        var x = mapContainer.offsetLeft;
        var y = mapContainer.offsetTop - 50;

        $effectsCanvas.css({ "left": x, "top": y })
        $playerCanvasContainer.css({ "left": x, "top": y + 50 })
    }

}

function playing() {

    calculateCursorPosition();
    onMouseClickFunction();
}

function onMouseClickFunction() {

    $effectsCanvas.click(function (e) {
        var x = cursor.getCursorPositionInCanvasX(e.pageX),
            y = cursor.getCursorPositionInCanvasY(e.pageY);

        cursor.clickedTile.row = cursor.getRow(y);
        cursor.clickedTile.column = cursor.getColumn(x);
        var cornerPoint = cursor.getTileCornerPoint(cursor.clickedTile.row, cursor.clickedTile.column);
        cursor.clickedTile.cornerPointX = cornerPoint.x;
        cursor.clickedTile.cornerPointY = cornerPoint.y;

        resetNextTilePlayerMovesToCounter();

        //console.log("previous: " + player.previousTile.column, player.previousTile.row);
        //console.log("current: " + player.currentTile.column, player.currentTile.row);
        //console.log("next: " + player.nextTile.column, player.nextTile.row);

        /////////////////////////////////////////////////////////////////////////////////////
        //code responsible for A* algorithm
        /////////////////////////////////////////////////////////////////////////////////////
        if (cursor.clickedTile.column !== player.currentTile.column || cursor.clickedTile.row !== player.currentTile.row) {
            if (map[cursor.clickedTile.row][cursor.clickedTile.column] === 3 || map[cursor.clickedTile.row][cursor.clickedTile.column] === 4) {
                return;
            }
            arrayResult = aStarAlogirthm();

            //insert nextTile as first element so player will go fully to the next tile thus he will not run over mines and such
            var node = { "x": player.nextTile.row, "y": player.nextTile.column };
            arrayResult.splice(0, 0, node);
        }
        else {
            //if player clicks on the currentTile we pop last tile in array so player just goes back to the currentTile
            arrayResult.pop();
            return;
        }
        ////////////////////////////////////////////////////////////////////////////////////////

        if (typeof arrayResult !== "undefined" && arrayResult.length > 0) {
            //check arrayResult for uncovered tile (in case player clicks on map too fast thus allowing him to walk over uncovered tiles)
            for (var i = 0; i < arrayResult.length; i++) {
                if (map[arrayResult[i].x][arrayResult[i].y] === 0 || map[arrayResult[i].x][arrayResult[i].y] === 2) {
                    graph.nodes[arrayResult[i].x][arrayResult[i].y].type = 0;
                }
            }
            movePlayerTo();
        }

        displayAmmunitionPoints();

        function aStarAlogirthm() {

            //resetPathColor();

            var startX = player.nextTile.row;
            var startY = player.nextTile.column;
            var start = graph.nodes[startX][startY];
            graph.nodes[cursor.clickedTile.row][cursor.clickedTile.column].type = 1;
            var destX = cursor.clickedTile.row;
            var destY = cursor.clickedTile.column;
            var end = graph.nodes[destX][destY];

            // result now searches diagonal neighbors as well
            var result = astar.search(graph.nodes, start, end, true);

            if (typeof result === "undefined" || result.length === 0) {
                //if user clicks too fast make sure not to change the already uncovered tile into a wall type for A* algorithm
                if (map[cursor.clickedTile.row][cursor.clickedTile.column] !== 1)
                    graph.nodes[cursor.clickedTile.row][cursor.clickedTile.column].type = 0;
            }

            //for (var i = 0; i < result.length; i++) {
            //    var row = result[i].x;
            //    var col = result[i].y;
            //    map[row][col] = 5;
            //}

            return result;

            function resetPathColor() {
                for (var i = 0; i < 12; i++) {
                    for (var j = 0; j < 12; j++) {
                        var num = map[i][j];

                        if (num == 5) {
                            map[i][j] = 1;
                        }
                    }
                }

            }
        }

    });
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
                if (isMine) {

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
                    if (num === 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

function drawPlayer() {
    //ctx.drawImage(tileSheet, 0, 0, 40, 40, player.cornerPoint.x + canvasPadding, player.cornerPoint.y + canvasPadding, 40, 40);
    playerCtx.drawImage(tileSheet, 0, 0, 40, 40, canvasPadding, canvasPadding, 40, 40);
}

function resetNextTilePlayerMovesToCounter() {
    nextTilePlayerMovesToCounter = 0;
}

function incrementNextTilePlayerMovesToCounter() {
    nextTilePlayerMovesToCounter++;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillStyle, strokeStyle) {

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
        //ctx.strokeStyle = strokeStyle;
        //ctx.stroke();
    }
    if (fill) {
        //var random = Math.floor((Math.random() * 256));
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }

}

function drawMapTiles(ctx, numHorizontalTiles, numVerticalTiles, size, startPoint) {
    var x, y, num, mineNumbers, graphNodeType;

    for (var i = 0; i < numHorizontalTiles; i++) {

        for (var j = 0; j < numVerticalTiles; j++) {

            num = map[j][i];
            //graphNodeType = graph.nodes[j][i].type;
            mineNumbers = mapNumbers[j][i];

            x = i * size + i + 4;
            y = j * size + j + 4;

            if (num == 0 || num == 2) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(0,0,0,.5)");
            }
            if (num !== 0) {
                drawNumbers(i, j, mineNumbers);
            }
            if (num == 3) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(238,68,68,.8)");
            }
            if (num == 4) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(10,211,122,.8)");
            }
            if (num == 5) {
                roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(255,0,0,.1)");
            }
            //if (graphNodeType == 1) {
            //    roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(0,240,0,.2)");
            //}

        }
    }

    function drawNumbers(row, col, numOfMines) {
        var point = cursor.getTileCornerPoint(row, col);
        var posX = tileSize / 2;
        var posY = posX + 14;
        ctx.fillStyle = "#555";
        ctx.font = '25px "Victor\'s Pixel Font"';
        if (numOfMines != 0)
            ctx.fillText(numOfMines, point.x + posX, point.y + posY);
    }
}

function movePlayerTo() {
    var velocityX = 0;
    var velocityY = 0;

    //return, not allowing events to stack up
    if (isPlayerRunningInProgress) {
        return;
    }

    isPlayerRunningInProgress = true;
    playerTimerInterval = setInterval(drawPlayerRunning, 30);

    function drawPlayerRunning() {
        playerCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        //drawMapTiles(ctx, 12, 12, tileSize);
        playerCtx.drawImage(tileSheet, 0, 40 * playerAnimationCounter, 40, 40, canvasPadding, canvasPadding, 40, 40);
        calculatePlayerPosition();

        function calculatePlayerPosition() {

            if (typeof arrayResult !== "undefined" && arrayResult.length > 0) {

                player.nextTile.row = arrayResult[nextTilePlayerMovesToCounter].x;
                player.nextTile.column = arrayResult[nextTilePlayerMovesToCounter].y;

                var tilePoint = cursor.getTileCornerPoint(player.nextTile.row, player.nextTile.column);

                var tileYMinusPlayerY = tilePoint.x - player.cornerPoint.y;
                var tileXMinusPlayerX = tilePoint.y - player.cornerPoint.x;

                var padding = player.pixelDistanceWhileMoving - 1;
                var negativePadding = (player.pixelDistanceWhileMoving - 1) * (-1);

                if (tileYMinusPlayerY > padding)
                    velocityY = 1;
                else if (tileYMinusPlayerY < negativePadding)
                    velocityY = -1;
                else velocityY = 0

                if (tileXMinusPlayerX > padding)
                    velocityX = 1;
                else if (tileXMinusPlayerX < negativePadding)
                    velocityX = -1;
                else velocityX = 0;

                playerAnimationCounter++;

                //player still moving to tile
                if (Math.abs(tileXMinusPlayerX) >= player.pixelDistanceWhileMoving || Math.abs(tileYMinusPlayerY) >= player.pixelDistanceWhileMoving) {
                    //velocity X
                    player.cornerPoint.x += player.pixelDistanceWhileMoving * velocityX;
                    //velocity Y
                    player.cornerPoint.y += player.pixelDistanceWhileMoving * velocityY;

                    // move playeCanvas
                    playerCanvas.setAttribute("style", "left:" + player.cornerPoint.x + "px; top:" + player.cornerPoint.y + "px;");
                }
                else {
                    ///////////////////////////////////////////////////////////////////////////////////////////////////
                    //at this point player is fully in tile
                    ///////////////////////////////////////////////////////////////////////////////////////////////////
                    player.previousTile = clone(player.currentTile);
                    player.currentTile = clone(player.nextTile);

                    var currentTile = map[player.currentTile.row][player.currentTile.column];

                    //if current tile is covered check what's underneath
                    if (currentTile !== 1) {
                        if (currentTile === 0) {
                            player.ammunitionPoints += mapNumbers[player.currentTile.row][player.currentTile.column];
                            displayAmmunitionPoints();
                            map[player.currentTile.row][player.currentTile.column] = 1;
                            graph.nodes[player.currentTile.row][player.currentTile.column].type = 1;

                            animateUncoveredMineNumbers();
                            checkIfMineIsUncoveredAllAround(player.currentTile.row, player.currentTile.column);

                            ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
                            drawMapTiles(ctx, 12, 12, tileSize);
                        }
                        else if (currentTile === 2) {
                            map[player.currentTile.row][player.currentTile.column] = 3;
                            graph.nodes[player.currentTile.row][player.currentTile.column].type = 0;

                            //moves player to the previous tile location
                            player.cornerPoint = cursor.getTileCornerPoint(player.previousTile.column, player.previousTile.row);
                            playerCanvas.setAttribute("style", "left:" + player.cornerPoint.x + "px; top:" + player.cornerPoint.y + "px;");
                            //reset the resultArray so player wont walk over mines if he clicks too fast
                            arrayResult = [];

                            player.currentTile = clone(player.previousTile);
                            player.nextTile = clone(player.currentTile);

                            checkIfMineIsUncoveredAllAround(player.previousTile.row, player.previousTile.column);
                            player.ammunitionPoints = 0;
                            displayAmmunitionPoints();

                            ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
                            drawMapTiles(ctx, 12, 12, tileSize);
                        }
                    }

                    incrementNextTilePlayerMovesToCounter();

                    ////////////////////////////////////////////////////////////////////////////////////////////////
                    //check if the the current tile is the destination tile
                    ////////////////////////////////////////////////////////////////////////////////////////////////
                    if (nextTilePlayerMovesToCounter == arrayResult.length) {
                        resetNextTilePlayerMovesToCounter();
                        ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
                        playerCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

                        drawMapTiles(ctx, 12, 12, tileSize);
                        drawPlayer();
                        isPlayerRunningInProgress = false;
                        clearInterval(playerTimerInterval);
                        return;
                    }
                }

                if (arrayResult.length > 0) {
                    player.nextTile.row = arrayResult[nextTilePlayerMovesToCounter].x;
                    player.nextTile.column = arrayResult[nextTilePlayerMovesToCounter].y;
                }
                if (playerAnimationCounter > player.pixelDistanceWhileMoving) {
                    playerAnimationCounter = 0;
                }

            }
            else {
                isPlayerRunningInProgress = false;
                resetNextTilePlayerMovesToCounter();
                clearInterval(playerTimerInterval);
                playerCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
                //drawMapTiles(ctx, 12, 12, tileSize);
                drawPlayer();
            }
        }
    }

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

function animateUncoveredMineNumbers() {
    var counter = 0;
    var currentTile = cursor.getTileCornerPoint(player.currentTile.row, player.currentTile.column);
    var tilePointX = currentTile.x;
    var tilePointY = currentTile.y;
    var number = mapNumbers[player.currentTile.row][player.currentTile.column];

    //if the the number of mines is different than zero
    if (number != 0) {
        if (isAnimationNumbersInProgress) {
            clearInterval(animationNumbersTimerInterval);
        }
        isAnimationNumbersInProgress = true;
        animationNumbersTimerInterval = setInterval(showUncoveredMineNumbersAnimation, 100);
    }

    function showUncoveredMineNumbersAnimation() {

        var color = "rgb(100,255,84)";
        var offsetY = counter * 2;

        if (counter < 10) {
            counter++;
            effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
            effectsCtx.fillStyle = color;
            effectsCtx.font = '50px "Victor\'s Pixel Font"';
            effectsCtx.fillText(number, tilePointY + 14, tilePointX + 50 - offsetY);
        }
        else {
            isAnimationNumbersInProgress = false;
            clearInterval(animationNumbersTimerInterval);
            effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
            return;
        }

    }
}

function clone(obj) {
    var target = {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            target[i] = obj[i];
        }
    }
    return target;
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
