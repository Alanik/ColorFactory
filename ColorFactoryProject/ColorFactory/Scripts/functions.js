

////var enemy = {
////	"pixelDistanceWhileMoving": 3,
////	"cornerPoint": { "x": 0, "y": 0 },
////	"setCornerPoint": function (x, y) {
////		enemy.cornerPoint.x = x;
////		enemy.cornerPoint.y = y;
////	},
////	"currentTile": { "row": 0, "column": 0 },
////	"nextTile": { "row": 0, "column": 0 },
////	"previousTile": { "row": 0, "column": 0 }
////}

////var cursor = {
////	"getRow": function (y) {
////		var row = Math.floor(y / tileSize);
////		row = Math.floor((y - row) / tileSize);
////		return row;
////	},
////	"getColumn": function (x) {
////		var col = Math.floor(x / tileSize);
////		col = Math.floor((x - col) / tileSize);
////		return col;
////	},
////	"getCursorPositionInCanvasX": function (pageX) {
////		var mouseX = pageX - mainContainer.offsetLeft - mapCanvas.offsetLeft - canvasPadding;
////		return mouseX;
////	},
////	"getCursorPositionInCanvasY": function (pageY) {
////		var mouseY = pageY - mainContainer.offsetTop - mapCanvas.offsetTop - canvasPadding;
////		return mouseY;
////	},
////	"clickedTile": { "row": 0, "column": 0, "cornerPointX": 0, "cornerPointY": 0 },
////	"currentTileHover": { "cornerPointX": 0, "cornerPointY": 0 },
////	//getTileCornerPoint returns reversed variables: y is actually x and x is y, bad naming from my part.
////	"getTileCornerPoint": function (row, col) {
////		var xx = row * tileSize + row;
////		var yy = col * tileSize + col;
////		var tileCornerPoint =
////			{
////				"x": xx,
////				"y": yy
////			};
////		return tileCornerPoint;
////	}

////};

////var padding = player.pixelDistanceWhileMoving - 1;
////var negativePadding = (player.pixelDistanceWhileMoving - 1) * (-1);

//////////////////////////////////////////////////////////////////////////////////
////FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////



//function onMouseClick() {

//	$effectsCanvas.click(function (e) {

//		var x = CURSOR.getCursorPositionInCanvasX(e.pageX),
//			y = CURSOR.getCursorPositionInCanvasY(e.pageY);

//		var clickedColumn = CURSOR.getColumn(x);
//		var clickedRow = CURSOR.getRow(y);

//		player1.resetNextTilePlayerMovesToCounter();

//		/////////////////////////////////////////////////////////////////////////////////////
//		//code responsible for A* algorithm
//		/////////////////////////////////////////////////////////////////////////////////////
//		var playerCurrentTile = player1.getCurrentTile();

//		if (clickedColumn !== playerCurrentTile.column || clickedRow !== playerCurrentTile.row) {

//			var tile = MAP.tiles[clickedColumn][clickedRow];
//			if (tile === 3 || tile === 4) {
//				return;
//			}

//			//insert nextTile as first element so player will go fully to the next tile thus he will not run over mines and such
//			var nextTile = player1.getNextTile();
//			var node = { "x": nextTile.column, "y": nextTile.row };

//			aStarAlogirthm().splice(0, 0, node);

//			player1.setAStarResult(result);

//		}
//		else {
//			//if player clicks on the currentTile we pop last tile in array so player just goes back to the currentTile
//			playe1.getAStarResult().pop();
//			return;
//		}
//		////////////////////////////////////////////////////////////////////////////////////////
//		var result = player1.getAStarResult();

//		if (typeof result !== "undefined" && result.length > 0) {
//			//check arrayResult for uncovered tile (in case player clicks on map too fast thus allowing him to walk over uncovered tiles)
//			var length = result.length;	
//			for (var i = 0; i < length; i++) {
//				var tile = MAP.tiles[result[i].x][result[i].y];

//				if (tile === 0 || tile === 2) {
//					MAP.graph.nodes[result[i].x][result[i].y].type = 0;
//				}
//			}

//			movePlayerTo(player1);

//		}

//		displayAmmunitionPoints(player1.getAmmunitionPoints());

//		function aStarAlogirthm() {

//			//resetPathColor();
//			var nextTile = player1.getNextTile();
//			var clickedTile = CURSOR.getClickedTile();

//			var start = graph.nodes[nextTile.column][nextTile.row];
//			MAP.graph.nodes[clickedTile.column][clickedTile.row].type = 1;
//			var end = MAP.graph.nodes[clickedTile.column][clickedTile.row];

//			// result now searches diagonal neighbors as well
//			var result = astar.search(MAP.graph.nodes, start, end, true);

//			if (typeof result === "undefined" || result.length === 0) {
//				//if user clicks too fast make sure not to change the already uncovered tile into a wall type for A* algorithm
//				if (MAP.tiles[clickedTile.column][clickedTile.row] !== 1)
//					MAP.graph.nodes[clickedTile.column][clickedTile.row].type = 0;
//			}

//			//for (var i = 0; i < result.length; i++) {
//			//    var row = result[i].x;
//			//    var col = result[i].y;
//			//    map[row][col] = 5;
//			//}

//			return result;

//			function resetPathColor() {
//				var columns = SETTINGS.map.getNumberOfTiles_Column();
//				var rows = SETTINGS.map.getNumberOfTiles_Row();

//				for (var i = 0; i < columns; i++) {
//					for (var j = 0; j < rows; j++) {
//						var num = MAP.tiles[i][j];

//						if (num == 5) {
//							MAP.tiles[i][j] = 1;
//						}
//					}
//				}

//			}
//		}

//	});
//}



//function checkIfMineIsUncoveredAllAround(row, col) {
//	var rMinusOne = row - 1;
//	var rPlusOne = row + 1;
//	var kMinusOne = col - 1;
//	var kPlusOne = col + 1;

//	for (var r = rMinusOne; r <= rPlusOne; r++) {
//		for (var k = kMinusOne; k <= kPlusOne; k++) {
//			//check if tile is outside of map boundry(ex. row = -1)
//			if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
//				var isMine = checkIfTileIsMine(map[r][k]);
//				if (isMine) {

//					if (checkIfTilesAroundParameterTileAreUncovered(r, k)) {
//						//The mine is uncovered from all sides here
//						map[r][k] = 4;

//					}
//				}
//			}
//		}
//	}



//function drawPlayer() {
//	//ctx.drawImage(tileSheet, 0, 0, 40, 40, player.cornerPoint.x + canvasPadding, player.cornerPoint.y + canvasPadding, 40, 40);
//	playerCtx.drawImage(tileSheet, 0, 0, 40, 40, canvasPadding, canvasPadding, 40, 40);
//}

//function drawEnemy() {
//	enemyCtx.drawImage(tileSheet, 0, 0, 40, 40, canvasPadding, canvasPadding, 40, 40);
//}

//function resetNextTilePlayerMovesToCounter() {
//	nextTilePlayerMovesToCounter = 0;
//}

//function incrementNextTilePlayerMovesToCounter() {
//	nextTilePlayerMovesToCounter++;
//}






//}







//function initializeEnemy(x, y) {
//	var point = cursor.getTileCornerPoint(x, y);

//	enemy.startingPositionTile = { "row": y, "column": x };
//	enemy.currentTile = clone(enemy.startingPositionTile);
//	enemy.nextTile = clone(enemy.currentTile);

//	enemy.setCornerPoint(point.x, point.y);

//	//set playerCanvas position here //////////////////////////////////////////////////////
//	enemyCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

//	drawEnemy();
//}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////while in a game session, listen to server
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//gameConnection.client.clientReceiveEnemyPosition = function (x, y) {

//	initializeEnemy(x, y);
//}

//gameConnection.client.clientReceiveUpdateEnemyPosition = function (x, y) {

//	moveEnemyTo(x, y);

//	function moveEnemyTo(x, y) {

//		enemy.nextTile.row = x;
//		enemy.nextTile.column = y;

//		//return, not allowing events to stack up
//		if (isEnemyRunningInProgress) {
//			return;
//		}

//		var velocityX = 0;
//		var velocityY = 0;



//		isEnemyRunningInProgress = true;

//		enemyTimerInterval = setInterval(drawEnemyRunning, 30);

//		function drawEnemyRunning() {

//			enemyCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//			enemyCtx.drawImage(tileSheet, 0, 40 * enemyAnimationCounter, 40, 40, canvasPadding, canvasPadding, 40, 40);
//			calculateEnemyPosition();

//			function calculateEnemyPosition() {

//				var tilePoint = CURSOR.getTileCornerPoint(enemy.nextTile.row, enemy.nextTile.column);

//				var tileYMinusEnemyY = tilePoint.x - enemy.cornerPoint.y;
//				var tileXMinusEnemyX = tilePoint.y - enemy.cornerPoint.x;

//				if (tileYMinusEnemyY > padding)
//					velocityY = 1;
//				else if (tileYMinusEnemyY < negativePadding)
//					velocityY = -1;
//				else velocityY = 0

//				if (tileXMinusEnemyX > padding)
//					velocityX = 1;
//				else if (tileXMinusEnemyX < negativePadding)
//					velocityX = -1;
//				else velocityX = 0;

//				enemyAnimationCounter++;

//				//player still moving to tile
//				if (Math.abs(tileXMinusEnemyX) >= enemy.pixelDistanceWhileMoving || Math.abs(tileYMinusEnemyY) >= enemy.pixelDistanceWhileMoving) {
//					//velocity X
//					enemy.cornerPoint.x += enemy.pixelDistanceWhileMoving * velocityX;
//					//velocity Y
//					enemy.cornerPoint.y += enemy.pixelDistanceWhileMoving * velocityY;

//					// move playerCanvas
//					enemyCanvas.setAttribute("style", "left:" + enemy.cornerPoint.x + "px; top:" + enemy.cornerPoint.y + "px;");

//				}
//				else {
//					///////////////////////////////////////////////////////////////////////////////////////////////////
//					//at this point player is fully in tile
//					///////////////////////////////////////////////////////////////////////////////////////////////////
//					enemy.previousTile = clone(enemy.currentTile);
//					enemy.currentTile = clone(enemy.nextTile);

//					enemyCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//					drawEnemy();
//					isEnemyRunningInProgress = false;
//					clearInterval(enemyTimerInterval);
//					return;
//				}
//				if (enemyAnimationCounter > enemy.pixelDistanceWhileMoving) {
//					enemyAnimationCounter = 0;
//				}
//			}
//		}
//	}
//}

/////////////////////////////////////////////////////////////////////////////////

//window.clone = function (obj) {
//	var target = {};
//	for (var i in obj) {
//		if (obj.hasOwnProperty(i)) {
//			target[i] = obj[i];
//		}
//	}
//	return target;
//}

////////////////////////////////////////////////////////////////////////////////
//// http://stackoverflow.com/questions/958433/how-can-i-clearinterval-for-all-setinterval
////////////////////////////////////////////////////////////////////////////////

////window.oldSetInterval = window.setInterval;
////window.setInterval = function (func, interval) {
////    var interval = oldSetInterval(func, interval);
////    // store it in a array for stopping? stop it now? the power is yours.
////}






